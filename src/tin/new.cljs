(ns tin.new
  (:require
   [tin.ease]
   [tin.tween-plugin]
   [tin.events :refer [impersonate-dom-node!]]
   [clojure.set :refer [union]]
   [clojure.string]
   [cljs.core.async :refer [<! >! chan close! sliding-buffer put!
                            alts! timeout pub sub]])
  (:require-macros [cljs.core.async.macros :refer [go]]
                   [cljs.core.match.macros :refer [match]]))

(enable-console-print!)
(def ^:private channel-buffer-size 65536)

;;;;; API ;;;;;

(defrecord EngineState
  [stage renderer display-objects event-channel render-channel])

(defn- new-engine-state
  "Constructor function for the internal EngineState record type. Keys:

    - stage: The Pixi.js Stage object which coordinates all on-screen drawing.
    - renderer: The Pixi.js Renderer object, which draws objects to the canvas.
    - display-objects: A tree of objects added to the engine indexed by
      identifier.
    - event-listeners: An atom containing a map from event names to maps from
      identifiers to lists of channels which have subscribed to events with the
      associated name and identifier.
    - render-channel: The cannel onto which rendering messages should be
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
        engine-state (new-engine-state :stage stage
                                       :renderer renderer
                                       :display-objects (atom {})
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
  (doseq [message messages] (put! render-channel message)))

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

(defn subscribe-to-event!
  "Subscribes |channel| to events named |event-name| published on |identifier|
  or any child of |identifier|."
  [{event-listeners :event-listeners} channel event-name identifier]
  (letfn [(add-listener [listeners]
            (assoc-in listeners [event-name identifier]
                      (conj (get-in listeners [event-name identifier])
                            channel)))]
    (swap! event-listeners add-listener)))

(defn- channels-matching-identifier
  "Returns all channels stored in |listener-map| under any level of the
   identifier path specified by |identifier|."
  [listener-map identifier]
  (loop [result [] identifiers (split-identifier identifier)]
    (if (empty? identifiers)
      result
      (recur (concat result (listener-map
                             (clojure.string/join "/" identifiers)))
             (drop-last identifiers)))))

(defn publish-event!
  [{event-listeners :event-listeners} event-name identifier event]
  (go
    (doseq [channel (channels-matching-identifier
                     (event-listeners event-name) identifier)]
      (>! channel event))))

;;;;; Render Message ;;;;;

(declare expression-lift)
(declare expression->object)

(defn- get-property
  "Gets the property named |key| from |object|."
  [object key]
  (aget object (to-camelcase key)))

(defn- update-property!
  "Sets the value of a property to (|function| old-value |value|) where
  old-value is the current value of the property. If the result is a clojure map
  object, the update is instead recursively applied to each child of the
  property."
  [object key value function]
  (let [lifted-fn (expression-lift function)
        old-val (get-property object key)
        new-val (lifted-fn old-val value)]
    (if (map? new-val)
      (doseq [[key value] new-val]
        (update-property! (get-property object key) key value))
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
       :movie-clip (new-movie-clip display-objects expression)
       :point (new-point expression)
       :texture (new-texture expression))))

(defn- to-object
  "Turns |value| into a Pixi.js object on a best-effort basis. A vector argument
  will either be treated as an expression (if the first element is a keyword) or
  will be recursively converted to objects."
  [value]
  (if (vector? value)
    (if (keyword? (first value))
      (expression->object value)
      (to-array (map to-object value)))
    value))

(defn- object->expression
  "Turns |object| into an expression (if possible)."
  [object]
  (cond
   (instance? (.-Point js/PIXI) object) [:point (.-x object) (.-y object)]
   :otherwise object))

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
    (.addChild stage object)))

;;;;; Update Message ;;;;;

(defn- handle-update-message
  [engine-state [:update_ identifier properties &
                 {:keys [function] :or {function overwrite}}]])

;;;;; Load Message ;;;;;

(defn- handle-load-message
  "Loads the resources in |assets| and then publishes an event named 'load' on
  |event-channel| under identifier |identifier|. Messages in |messages| will be
  put onto the render channel after load."
  [{event-channel :event-channel :as engine-state} [:load_ identifier assets
                                                    [:then_ & messages]]]
  (let [AssetLoader (.-AssetLoader js/PIXI)
        asset-list (if-not (sequential? assets) [assets])
        asset-loader (AssetLoader. (to-array asset-list))
        onload (fn []
                 (put! event-channel (new-event :identifier identifier
                                                :event-name "load"))
                 (when messages
                   (prn (second messages))
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

(defn- perform-query
  "Performs |query|, which should be a map from identifiers to sequences of
  properties. The result will be a map from identifiers to maps from property
  names to property values."
  [engine-state query]
  {})

(defn- event-callback-fn
  "Returns a callback function to invoke when an input event occurs."
  [{event-channel :event-channel :as engine-state}
   [event-name & _] identifier query]
  (fn [data]
    (let [query-result (perform-query engine-state query)]
      (put! event-channel (new-event :identifier identifier
                                     :event-name event-name
                                     :event-data data
                                     :query-result query-result)))))

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

; TODO: Support lists of callbacks for multiple publish calls.
(defn- handle-publish-message
  [{display-objects :display-objects :as engine-state}
   [:publish_ identifier & {:keys [query event]}]]
  (doseq [{object :object object-identifier :identifier}
          (objects-and-identifiers-for-identifier display-objects identifier)]
    (impersonate-dom-node! object)
    (let [callback (event-callback-fn engine-state event object-identifier
                                      query)]
      (if (is-recognizer? (first event))
        (add-recognizer-event-handler! object event callback)
        (add-standard-event-handler! object event callback)))))

;;;;; Clear Message ;;;;;

(defn- handle-clear-message
  [engine-state [:clear_]])

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
    :clear (handle-clear-message engine-state message)))

(comment
  ; Top-level messages:

  ; Create display objects
  [:render & object-exprs]

  ; Update existing display objects
  [:update identifier properties {:function f}]

  ; Load assets, automatically publish on the provided identifier on completion.
  [:load identifier [assets] [:then & messages]]

  ; Start an animation affected the objects matching the provided identifier. An
  ; animation is serial -- it is a sequence of actions to perform, one after the
  ; other. To perform animations in parallel, use multiple animate messages.
  [:animate identifier properties & animation-exprs]

  ; Request that the objects matching 'identifier' start publishing events
  ; matching the provided event expression. Events will be available under
  ; EventTopic consisting of the identifier and event name. Multiple calls to
  ; :publish for the same topic have no effect except merging the provided query
  ; with any existing queries.

  ; 'query' should be a map from identifiers to sequences of properties. The
  ; properties will be looked up on each object matching the identifier, and the
  ; event object will be published with a map from the identifier of each
  ; matching object to a map from property names to property values.
  [:publish identifier :query query :event event-expr]

  ; Remove everything from the stage
  [:clear]

  ; Object expressions
  [:container identifier properties & children]
  [:sprite identifier texture properties]
  [:tiling-sprite identifier texture width height properties]
  [:movie-clip identifier textures properties]
  [:point x y]
  [:texture :image path]
  [:texture :canvas canvas]
  [:texture :frame frame-id]

  ; Animation expressions
  ; function is a binary function to apply to the current property value and
  ; the value in |properties| to produce the final target value.
  [:tween properties {:function m :duration d :ease e}]
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
