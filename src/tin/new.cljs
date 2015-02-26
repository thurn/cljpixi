(ns tin.new
  (:require
   [tin.ease]
   [tin.tween-plugin]
   [tin.events :refer [impersonate-dom-node!]]
   [clojure.set :refer [union]]
   [clojure.string]
   [cljs.core.async :refer [<! >! chan close! sliding-buffer
                            alts! timeout pub sub]])
  (:require-macros [cljs.core.async.macros :refer [go]]
                   [cljs.core.match.macros :refer [match]]))

(enable-console-print!)
(def ^:private channel-buffer-size 65536)

;;;;; API ;;;;;

(defrecord EngineState
  [stage renderer display-objects event-listeners render-channel])

(defn- new-engine-state
  "Constructor function for the internal EngineState record type. Keys:

    - stage: The Pixi.js Stage object which coordinates all on-screen drawing.
    - renderer: The Pixi.js Renderer object, which draws objects to the canvas.
    - display-objects: A tree of objects added to the engine indexed by
      identifier.
    - event-listeners: An atom containing a map from event names to maps from
      identifiers to lists of channels which have subscribed to events with the
      associated name and identifier.
    - render-channel: The channel onto which rendering messages should be
      published."
  [& {:keys [stage renderer display-objects event-listeners render-channel]}]
  (EngineState. stage renderer display-objects event-listeners render-channel))

(defrecord EngineConfiguration
  [width height background-color view transparent? antialias? interactive?])

(defn new-engine-configuration
  "Constructor function for the EngineConfiguration record type. Keys:

    - width: Target width for the canvas node to draw to. Default: 500px.
    - height: Target height for the canvas. Default: 500px.
    - background-color: Default color for the canvas. Default: 0xFFFFFF.
    - view: Optionally, a canvas node for the renderer to draw to.
    - transparent?: Set to true to make the rendered view transparent.
    - antialias?: Set to true to render with antialiasing (Chrome-only).
    - interactive?: Whether the stage should process user input events.
      Default: true."
  [& {:keys [width height background-color view transparent? antialias?
             interactive?]}]
  (EngineConfiguration. (or width 500) (or height 500)
                        (or background-color 0xFFFFFF) view transparent?
                        antialias? (or interactive? true)))

(defrecord Engine [render-channel event-listeners view])

(defn new-engine
  "Constructor function for the Engine record type. Keys:

    - render-channel: The channel onto which rendering messages should be
      published.
    - event-listeners: An atom containing a map from event names to maps from
      identifiers to lists of channels which have subscribed to events with the
      associated name and identifier.
    - view: The canvas DOM node which the renderer will draw to, must be
      attached to the DOM."
  [& {:keys [render-channel event-listeners view]}]
  (Engine. render-channel event-listeners view))

(def ^:private last-timestamp
  "The relative timestamp at which the animate loop last ran."
  (atom nil))

(defn- animate-loop
  "Invokes an animation loop function repeatedly via requestAnimationFrame."
  [engine-state]
  (defn- animate-loop-fn [timestamp]
    (js/requestAnimFrame animate-loop-fn)
    (.tick (.-Tween js/createjs)
           (- timestamp (or @last-timestamp timestamp)))
    (.render (:renderer engine-state) (:stage engine-state))
    (reset! last-timestamp timestamp))
  (js/requestAnimFrame animate-loop-fn))

(declare handle-message)

(defn- render-message-loop
  [{render-channel :render-channel dispatch-map :dispatch-map :as engine-state}]
  (go ;; TODO: Process messages in batches.
    (loop [message (<! render-channel)]
      (handle-message engine-state message)
      (recur (<! render-channel)))))

(defn initialize
  "Takes an EngineConfiguration and creates a new Engine instance. You should
  call this function only after all necessary Javascript libraries have finished
  loading. A canvas node to render to can be passed to EngineConfiguration,
  otherwise, a new one will be instantiated, returned, and must be added to
  the DOM. Refer to the documentation for new-engine and
  new-engine-configuration for more information."
  [config]
  (tin.tween-plugin/install-tween-plugin)
  (let [Stage (.-Stage js/PIXI)
        stage (Stage. (:background-color config) (:interactive? config))
        renderer (.autoDetectRenderer js/PIXI (:width config) (:height config)
                                      (:view config) (:transparent? config)
                                      (:antialias? config))
        render-channel (chan channel-buffer-size)
        event-listeners (atom {})
        display-objects (atom {"$stage" stage})
        engine-state (new-engine-state :stage stage
                                       :renderer renderer
                                       :display-objects display-objects
                                       :event-listeners event-listeners
                                       :render-channel render-channel)
        engine (new-engine :render-channel render-channel
                           :event-listeners event-listeners
                           :view (.-view renderer))]
    (animate-loop engine-state)
    (render-message-loop engine-state)
    engine))

(defn put-messages!
  "Convenience function to put the messages from |messages| onto the render
  channel."
  [{render-channel :render-channel} messages]
  (go
    (doseq [message messages] (>! render-channel message))))

;;;;; Helper Functions ;;;;;

(defn point-binary-function
  "Takes a binary function and wraps it in another function which will apply it
  to both components of two [:point x y] expression arguments and return a
  new [:point] with the result."
  [binary-function]
  (fn [[:point_ old-x old-y] [:point_ new-x new-y]]
    [:point (binary-function old-x new-x) (binary-function old-y new-y)]))

(defn overwrite
  "Default update function for :update and :tween, overwrites the existing value
  with the new value."
  [& args]
  (last args))

(defn to-camelcase
  "Converts a dash-separated |string| to camelCase and strips ? characters."
  [string]
  (let [parts (clojure.string/split (name string) #"-")]
    (clojure.string/replace
     (str (first parts) (apply str (map clojure.string/capitalize
                                        (rest parts)))) "?" "")))

(defn to-js-object
  "Converts |map|, a clojure map, to a JS object, invoking to-camelcase on the
  keys"
  [map]
  (clj->js (into {} (for [[key value] map] [(to-camelcase key) value]))))

(defn- get-property
  "Gets the property named |key| from |object|."
  [object key]
  (aget object (to-camelcase key)))

(defn- object->expression
  "Turns |object| into an expression (if possible)."
  [object]
  (cond
   (instance? (.-Point js/PIXI) object) [:point (.-x object) (.-y object)]
   :otherwise object))

;;;;; Identifiers ;;;;;

(defn- split-identifier
  "Splits an identifier on slashes."
  [identifier]
  (clojure.string/split identifier #"/"))

(defn- look-up-identifier
  "Looks up (via get-in) the value under |identifier|."
  [display-objects identifier]
  (get-in @display-objects (split-identifier identifier)))

(defn- objects-and-identifiers
  [object-map prefix]
  (flatten
    (for [[key value] object-map :let [path (str prefix "/" key)]]
      (if (map? value)
        (objects-and-identifiers value path)
        {:object value :identifier path}))))

(defn- objects-and-identifiers-for-identifier
  "Returns a sequence of pairs of {:object object, :identifier identifier} for
  each object matching |identifier|."
  [display-objects identifier]
  (let [value (look-up-identifier display-objects identifier)]
    (if (map? value)
      (objects-and-identifiers value identifier)
      (list {:object value :identifier identifier}))))

(defn- objects-for-identifier
  "Returns a sequence of all display objects which match |identifier|."
  [display-objects identifier]
  (map :object
       (objects-and-identifiers-for-identifier display-objects identifier)))

(defn- set-object-for-identifier!
  "Looks up the value for |identifier|, and then

   - If there's no value: stores |object| under this identifier as a new leaf
     node.
   - If the value is a map: adds |object| as a leaf node under a numeric key
     (the size of the map).
   - Otherwise, if the value is a leaf node: creates a new map containing the
     previous object under this identifier and |object| under the keys '0' and
     '1' respectively.

  It is an error to try to create a child path under an existing leaf node."
  [display-objects object identifier]
  (when display-objects
    (let [parts (split-identifier identifier)
          current-value (look-up-identifier display-objects identifier)]
      (cond
       (nil? current-value) (swap! display-objects assoc-in parts object)
       (map? current-value) (swap! display-objects
                                   assoc-in
                                   (conj parts (str (count current-value)))
                                   object)
       :else (swap! display-objects assoc-in parts
                    {"0" current-value, "1" object})))))

;;;;; Events ;;;;;

(defrecord Event [identifier event-name event-data query-result])

(defn new-event
  "Constructor function for the Event record type. Keys:

    - identifier: The identifier for this event.
    - event-name: The event name for this event.
    - event-data: A map of data associated with this event.
    - query-result: A map of data looked up by a query when the event occured."
  [& {:keys [identifier event-name event-data query-result]}]
  (Event. identifier event-name event-data query-result))

(defrecord EventSubscriber [channel query])

(defn- new-event-subscriber
  "Constructor function for the EventSubscriber record type. Keys:

    - channel: The channel listening for event updates.
    - query: The query for the event (refer to subscribe-to-event!)."
  [& {:keys [channel query]}]
  (EventSubscriber. channel query))

(defn add-listener-fn
  "Returns a function to conj |subscriber| onto the provider listeners."
  [subscriber event-name identifier]
  (fn [listeners]
    (assoc-in listeners [event-name identifier]
              (conj (get-in listeners [event-name identifier])
                    subscriber))))

(defn remove-listener-fn
  "Returns a function to remove |subscriber| from the provided listeners."
  [channel event-name identifier]
  (fn [listeners]
    (assoc-in listeners [event-name identifier]
              (remove #(= channel (:channel %))
                      (get-in listeners [event-name identifier])))))

(defn subscribe-to-event!
  "Subscribes |channel| to events named |event-name| published on |identifier|
  or any child of |identifier|. Remember that subscribing to an event is not a
  channel-based action: the subscription starts immediately.

  |query| should be a map from identifiers to sequences of properties. The
  properties will be looked up on each object matching the identifier, and the
  event object will be published with a map from the identifier of each
  matching object to a map from property names to property values. The special
  identifier '$self' can be used and will resolve to the object publishing the
  event."
  [{event-listeners :event-listeners} channel &
   {:keys [event-name identifier query]}]
  (let [subscriber (new-event-subscriber :channel channel :query query)]
    (swap! event-listeners (add-listener-fn subscriber event-name identifier))))

(defn subscribe-to-events!
  "Subscribes |channel| to each event in |events| on each identifier in
  |identifiers| as by subscribe-to-event!."
  [engine channel & {:keys [events identifiers query]}]
  (doseq [identifier identifiers]
    (doseq [event events]
      (subscribe-to-event! engine channel
                           :event-name event
                           :identifier identifier
                           :query query))))

(defn unsubscribe-from-event!
  "Unsubscribes |channel| from events named |event-name| published on
  |identifier| or any child of |identifier|."
  [{event-listeners :event-listeners} channel & {:keys [event-name identifier]}]
  (swap! event-listeners (remove-listener-fn channel event-name identifier)))

(defn clear-all-event-listeners!
  "Removes all listeners from |event-listeners|."
  [{event-listeners :event-listeners}]
  (reset! event-listeners {}))

(defn on-event
  "Run |function| the first time an event occurs named |event-name| on
  |identifier| or any child of |identifier|, passing the event as an argument to
  |function|. |query| behaves as in subscribe-to-event!."
  [engine & {:keys [event-name identifier function query]}]
  (let [channel (chan)]
    (subscribe-to-event! engine channel
                         :event-name event-name
                         :identifier identifier
                         :query query)
    (go
      (let [event (<! channel)]
        (unsubscribe-from-event! engine channel event-name identifier)
        (function event)))))

(defn- subscribers-matching-identifier
  "Returns all subscribers stored in |listener-map| under any level of the
  identifier path specified by |identifier|."
  [listener-map identifier]
  (loop [result [] identifiers (split-identifier identifier)]
    (if (or (empty? identifiers) (empty? listener-map))
      result
      (recur (concat result (listener-map
                             (clojure.string/join "/" identifiers)))
             (drop-last identifiers)))))

(defn- get-object-properties
  "Looks up each property in |properties| on |display-object| and returns a map
  from property names to property values."
  [display-object properties]
  (into {} (for [property properties]
             [property (object->expression
                        (get-property display-object property))])))

(defn- perform-query
  "Performs |query|, which should be a map from identifiers to sequences of
  properties. The result will be a map from identifiers to maps from property
  names to property values. Refer to subscribe-to-event! for details."
  [{display-objects :display-objects} query]
  (into
   {}
   (for [[identifier properties] query
         {object :object object-id :identifier}
         (objects-and-identifiers-for-identifier display-objects identifier)]
     [object-id (get-object-properties object (query identifier))])))

(defn- replace-$self
  "Replaces occurences of the identifier '$self' in |query| with |identifier|."
  [query identifier]
  (if (get query "$self")
    (assoc (dissoc query "$self") identifier (query "$self"))
    query))

(defn- publish-event!
  [{event-listeners :event-listeners :as engine-state}
   {event-name :event-name identifier :identifier :as event}]
  (go
    (doseq [subscriber (subscribers-matching-identifier
                        (@event-listeners event-name) identifier)]
      (let [query (:query subscriber)
            query-replacing-$self (replace-$self query identifier)
            query-result (perform-query engine-state query-replacing-$self)
            event-with-query-result (assoc event :query-result query-result)]
        (>! (:channel subscriber) event-with-query-result)))))

;;;;; Render Message ;;;;;

(declare expression-lift)
(declare expression->object)

(defn- update-property!
  "Sets the value of a property to (|function| old-value |value|) where
  old-value is the current value of the property."
  [object key value function]
  (let [lifted-fn (expression-lift function)
        old-val (get-property object key)
        new-val (lifted-fn old-val value)]
    ;; Handle a few special case properties that require method calls.
    (case key
      :text (.setText object new-val)
      :style (.setStyle object new-val)
      :texture (.setTexture object new-val)
      (aset object (to-camelcase key) new-val))))

(defn- update-properties!
  "Set all of the properties in |properties| to be properties
  of |object|. |function| will be passed along to update-property!. Returns
  |object|."
  [object properties & {:keys [function] :or {function overwrite}}]
  (doseq [[key value] properties]
    (update-property! object key value function))
  object)

(defn- new-point
  [[:point_ x y]]
  (let [Point (.-Point js/PIXI)]
    (Point. x y)))

(defn- new-texture
  [[:texture_ type argument]]
  (let [Texture (.-Texture js/PIXI)]
    (case type
      :image (.fromImage Texture argument)
      :frame (.fromFrame Texture argument)
      :canvas (.fromCanvas Texture argument))))

(defn- new-container
  "Instantiates and returns a new PIXI.DisplayObjectContainer object."
  [display-objects [:container_ identifier properties & children]]
  (let [DisplayObjectContainer (.-DisplayObjectContainer js/PIXI)
        container (DisplayObjectContainer.)]
    (doseq [child children]
      (.addChild container (expression->object child display-objects)))
    (set-object-for-identifier! display-objects container identifier)
    (update-properties! container properties)))

(defn- new-sprite
  "Instantiates and returns a new PIXI.Sprite object."
  [display-objects [:sprite_ identifier texture properties]]
  (let [Sprite (.-Sprite js/PIXI)
        sprite (Sprite. (new-texture texture))]
    (set-object-for-identifier! display-objects sprite identifier)
    (update-properties! sprite properties)))

(defn- new-tiling-sprite
  "Instantiates and returns a new PIXI.TilingSprite object."
  [display-objects [:tiling-sprite_ identifier texture width height properties]]
  (let [TilingSprite (.-TilingSprite js/PIXI)
        tiling-sprite (TilingSprite. (new-texture texture) width height)]
    (set-object-for-identifier! display-objects tiling-sprite identifier)
    (update-properties! tiling-sprite properties)))

(defn- new-text
  "Instantiates and returns a new PIXI.Text object."
  [display-objects [:text_ identifier text-string properties]]
  (let [Text (.-Text js/PIXI)
        text (Text. text-string)]
    (set-object-for-identifier! display-objects text identifier)
    (update-properties! text properties)))

(defn- new-bitmap-text
  "Instantiates and returns a new PIXI.BitmapText object."
  [display-objects [:bitmap-text_ identifier text properties]]
  (let [BitmapText (.-BitmapText js/PIXI)
        text (BitmapText. text)]
    (set-object-for-identifier! display-objects text identifier)
    (update-properties! text properties)))

(defn- new-movie-clip
  "Instantiates and returns a new PIXI.MovieClip object."
  [display-objects [:movie-clip_ identifier textures properties]]
  (let [MovieClip (.-MovieClip js/PIXI)
        movie-clip (MovieClip. (to-array (map new-texture textures)))]
    (set-object-for-identifier! display-objects movie-clip identifier)
    (update-properties! movie-clip properties)))

(defn- expression->object
  ([expression] (expression->object expression nil))
  ([expression display-objects]
     (case (first expression)
       :container (new-container display-objects expression)
       :sprite (new-sprite display-objects expression)
       :tiling-sprite (new-tiling-sprite display-objects expression)
       :text (new-text display-objects expression)
       :bitmap-text (new-bitmap-text display-objects expression)
       :movie-clip (new-movie-clip display-objects expression)
       :point (new-point expression)
       :texture (new-texture expression))))

(defn- to-object
  "Turns |value| into a Pixi.js object on a best-effort basis. A vector argument
  will either be treated as an expression (if the first element is a keyword) or
  will be recursively converted to objects."
  [value]
  (cond
   (vector? value) (if (keyword? (first value))
                     (expression->object value)
                     (to-array (map to-object value)))
   (map? value) (clj->js value)
   :otherwise value))

(defn- expression-lift
  "Wraps |function| in another function which will convert its arguments to
  expressions, call the function, and then convert the result into a Pixi
  object."
  [function]
  (fn [& args]
    (to-object (apply function (map object->expression args)))))

(defn- handle-render-message
  "Processes the :render message by creating the requested display objects and
  adding them to the Stage and to the display-objects tree."
  [{stage :stage display-objects :display-objects} [:render_ & object-exprs]]
  (doseq [[type identifier & _ :as object-expr] object-exprs
          :let [object (expression->object object-expr display-objects)]]
    (set! (.-bunny js/window) object)
    (.addChild stage object)))

;;;;; Update Message ;;;;;

(defn- handle-update-message
  [{display-objects :display-objects}
   [:update_ identifier properties & {:keys [function]}]]
  (doseq [object (objects-for-identifier display-objects identifier)]
    (update-properties! object properties function)))

;;;;; Load Message ;;;;;

(defn- handle-load-message
  "Loads the resources in |assets| and then publishes an event named :load on
  |event-listeners| under identifier |identifier|. Messages in |messages| will
  put onto the render channel after load."
  [{event-listeners :event-listeners :as engine-state} [:load_ identifier assets
                                                        [:then_ & messages]]]
  (let [AssetLoader (.-AssetLoader js/PIXI)
        asset-list (if-not (sequential? assets) [assets])
        asset-loader (AssetLoader. (to-array asset-list))
        onload (fn []
                 (publish-event! engine-state (new-event :identifier identifier
                                                         :event-name :load))
                 (when messages
                   (put-messages! engine-state messages)))]
    (.addEventListener asset-loader "onComplete" onload)
    (.load asset-loader)))

;;;;; Animate Message ;;;;;

(defn- new-tween-target
  "Creates a new tween target javascript object containing the target values for
  a tween on |object| to the targets in |properties| modified by the binary
  function in |function|."
  [object properties function]
  (to-js-object
   (into {}
         (for [[key value] properties]
           [key
            ((expression-lift function) (get-property object key) value)]))))

(defn- add-tween-expression!
  "Queues a tween operation for |object| onto |tween|, a Tween object, to the
  target values in |properties|. A |function| can be provided, which will be
  called as (function current-value value) where 'current-value' is the current
  value of the property and 'value' is the value supplied in the |properties|
  map."
  [tween object
   [:tween_ properties
    {:keys [function duration ease]
     :or {function overwrite duration 1000 ease (tin.ease/linear)}}]]
  (.to tween (new-tween-target object properties function) duration ease))

(defn- add-clip-expression!
  "Queues an action to play or stop a MovieClip for |object| onto |tween|."
  [tween object [action frame]]
  (.call tween
         (fn []
           (cond
            (and (= action :play-clip) frame) (.gotoAndPlay object frame)
            (= action :play-clip) (.play object)
            (and (= action :stop-clip) frame) (.gotoAndStop object frame)
            (= action :stop-clip) (.stop object)))))

(defn- add-then-expression!
  "Queues an action for |object| on |tween| to put the |messages| in the
  supplied :then expression onto the render channel."
  [engine-state tween object [:then_ & messages]]
  (.call tween
         (fn []
           (put-messages! engine-state messages))))

(defn- handle-animate-message
  "Processes the :animate message by creating a Tween object targeting each
  display object matching |identifier| and then queueing each expression in
  |animation-exprs| on that tween."
  [{display-objects :display-objects :as engine-state}
   [:animate_ identifier properties & animation-exprs]]
  (doseq [object (objects-for-identifier display-objects identifier)]
    (let [Tween (.-Tween js/createjs)
          tween (.get Tween object (to-js-object properties))]
      (doseq [expression animation-exprs]
        (case (first expression)
          :tween
            (add-tween-expression! tween object expression)
          (:play-clip :stop-clip)
            (add-clip-expression! tween object expression)
          :then
            (add-then-expression! engine-state tween object expression))))))

;;;;; Publish Message ;;;;;

(defn- to-local-coordinates
  "Converts a point in screen coordinates into the coordinate system that
  |object| uses."
  [{stage :stage} object [:point_ x y]]
  (let [interaction-manager (.-interactionManager stage)
        canvas-dom-node (.-interactionDOMElement interaction-manager)
        canvas-bounds (.getBoundingClientRect canvas-dom-node)
        top-canvas-offset (.-top canvas-bounds)
        left-canvas-offset (.-left canvas-bounds)
        ; convert from screen coordinates to stage coordinates:
        stage-coordinates [:point
                               (- x left-canvas-offset)
                               (- y top-canvas-offset)]]
    ; If the object has a parent AND that parent is not the Stage, transform
    ; the coordinates from Stage coordiantes into the coordinate system of the
    ; parent.
    (if (and (.-parent object) (not (= stage (.-parent object))))
      (object->expression
       (.toLocal (.-parent object) (new-point stage-coordinates)))
      stage-coordinates)))

(defn- process-hammer-js-event-data
  "Pulls useful event data out of a Hammer.js event callback value into a
   clojure data structure."
  [engine-state event-object]
  (let [data (js->clj event-object)
        center-point [:point ((data "center") "x") ((data "center") "y")]
        center (to-local-coordinates
                engine-state (.-target event-object) center-point)
        target-position
        (object->expression (.-position (.-target event-object)))
        result {
                :center center
                :target-position target-position
                :direction (data "direction")
                :pointer-type (data "pointerType")
                :distance (data "distance")
                :rotation (data "rotation")
                :is-first? (data "isFirst")
                :is-final? (data "isFinal")
                :delta [:point (data "deltaX") (data "deltaY")]
                :delta-time (data "deltaTime")
                :velocity [:point (data "velocityX") (data "velocityY")]}]
    (into {} (filter second result))))

(defn- process-standard-js-event-data
  "Pulls useful event data out of a pixi.js event callback vaule into a
  clojure data structure."
  [engine-state event-object]
  (let [original-event (.-originalEvent event-object)
        center-point [:point
                      (.-clientX original-event)
                      (.-clientY original-event)]]
    {:center
     (to-local-coordinates engine-state (.-target event-object) center-point)}))

(defn- event-callback-fn
  "Returns a callback function to invoke when an input event occurs."
  [engine-state [event-name & _] identifier]
  (fn [data]
    ;; Use the presence of a ".center" property as a quick way to identify
    ;; Hammer.js event callback data.
    (let [processed-event-data (if (.-center data)
                                 (process-hammer-js-event-data
                                  engine-state data)
                                 (process-standard-js-event-data
                                  engine-state data))]
      (publish-event! engine-state
                      (new-event :identifier identifier
                                 :event-name event-name
                                 :event-data processed-event-data)))))

(defn- get-recognizer-constructor
  "Looks up the Hammer.js constructor function matching the provided name,
  returning nil if no match is found."
  [name]
  (case name
    :pan (.-Pan js/Hammer)
    :pinch (.-Pinch js/Hammer)
    :press (.-Press js/Hammer)
    :rotate (.-Rotate js/Hammer)
    :swipe (.-Swipe js/Hammer)
    :tap (.-Tap js/Hammer)
    nil))

(defn- is-recognizer?
  "Returns true if the provided name matches the name of a Hammer.js
  recognizer."
  [name]
  (some? (get-recognizer-constructor name)))

(defn- add-recognizer-event-handler!
  [object [event-name & {:as args}] callback]
  (let [Manager (.-Manager js/Hammer)
        manager (Manager. object)
        Constructor (get-recognizer-constructor event-name)]
    (.add manager (Constructor. (to-js-object args)))
    (.on manager (name event-name) callback)))

(defn- add-standard-event-handler!
  [object [event-name & _] callback]
  (case event-name
    :mouse-over (set! (.-mouseover object) callback)
    :mouse-out (set! (.-mouseout object) callback)
    :click-start (do (set! (.-mousedown object) callback)
                     (set! (.-touchstart object) callback))
    :click-end-outside (do (set! (.-mouseupoutside object) callback)
                           (set! (.-touchendoutside object) callback))
    :click-end (do (set! (.-mouseup object) callback)
                   (set! (.-touchend object) callback)
                   (set! (.-mouseupoutside object) callback)
                   (set! (.-touchendoutside object) callback))))

(defn- handle-publish-message
  [{display-objects :display-objects :as engine-state}
   [:publish_ identifier event]]
  (doseq [{object :object object-identifier :identifier}
          (objects-and-identifiers-for-identifier display-objects identifier)]
    (impersonate-dom-node! object)
    (let [callback (event-callback-fn engine-state event object-identifier)]
      (if (is-recognizer? (first event))
        (add-recognizer-event-handler! object event callback)
        (add-standard-event-handler! object event callback)))))

;;;;; Clear Message ;;;;;

(defn- handle-clear-message
  [{stage :stage :as engine-state} [:clear_]]
  (while (not (zero? (.-length (.-children stage))))
    (.removeChild stage (aget (.-children stage) 0)))
  (reset! (:display-objects engine-state) {"$stage" stage}))

;;;;; Messages Message ;;;;;

(defn- handle-messages-message
  [engine [:messages_ & messages]]
  (put-messages! engine messages))

;;;;; Message Dispatch ;;;;;

(defn- handle-message
  "Process a render channel message by dispatching to the appropriate handler
  function. A handler can optionally return a chan object, if one is returned
  message processing will be halted until a read on the channel completes."
  [engine-state message]
  (case (first message)
    :render (handle-render-message engine-state message)
    :update (handle-update-message engine-state message)
    :load (handle-load-message engine-state message)
    :animate (handle-animate-message engine-state message)
    :publish (handle-publish-message engine-state message)
    :clear (handle-clear-message engine-state message)
    :messages (handle-messages-message engine-state message)))

(comment
  ; Special variables:
  ; "$stage" is always the identifier of the stage.
  ; "$self" is the identifier of the object publishing a message.
  ; User-defined identifiers should not start with $.

  ; Top-level messages:

  ; Create display objects
  [:render & object-exprs]

  ; Update existing display objects.
  [:update identifier properties :function f]

  ; Load assets, automatically publish on the provided identifier on completion.
  [:load identifier [assets] [:then & messages]]

  ; Start an animation affected the objects matching the provided identifier. An
  ; animation is serial -- it is a sequence of actions to perform, one after the
  ; other. To perform animations in parallel, use multiple animate messages.
  [:animate identifier properties & animation-exprs]

  ; Request that the objects matching 'identifier' start publishing events
  ; matching the provided event expression. Events will be available under
  ; EventTopic consisting of the identifier and event name. Multiple calls to
  ; :publish for the same event have no effect.
  [:publish identifier event-expr]

  ; Remove everything from the stage. Note: This does not cancel event
  ; listeners, see clear-all-event-listeners! for that.
  [:clear]

  ; Put all of the provdied messages onto the render channel.
  [:messages & messages]

  ; Object expressions
  [:container identifier properties & children]
  [:sprite identifier texture properties]
  [:tiling-sprite identifier texture width height properties]
  [:movie-clip identifier textures properties]
  [:text identifier text properties]
  [:point x y]
  [:texture :image path]
  [:texture :canvas canvas]
  [:texture :frame frame-id]

  ; Animation expressions
  ; function is a binary function to apply to the current property value and
  ; the value in |property-map| to produce the final target value.
  [:tween property-map {:function m :duration d :ease e}]
  [:play-clip frame?]
  [:stop-clip frame?]
  [:then & messages] ; Push arbitrary messages onto the render queue.

  ; Event expressions
  [:pan :threshold 10]
  [:pinch :pointers 2]
  [:press :time 500]
  [:rotate :threshold 10]
  [:swipe :velocity 0.65]
  [:tap :taps 1]
  [:mouse-over]
  [:mouse-out]
  [:click-start]
  [:click-end]
  [:click-end-outside]
  [:on-load]
)
