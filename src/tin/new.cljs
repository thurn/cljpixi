(ns tin.core
  (:require
   [tin.ease]
   [tin.tween-plugin]
   [tin.events :refer [impersonate-dom-node!]]
   [clojure.set :refer [union]]
   [clojure.string]
   [cljs.core.async :refer [<! >! chan close! sliding-buffer put!
                            alts! timeout pub]]
   [cljs.core.match] :refer [match]))

(enable-console-print!)
(def ^:private channel-buffer-size 65536)

;;;;; API ;;;;;

(defrecord Engine
  [stage renderer display-objects event-channel render-channel view])

(defn new-engine
  "Constructor function for the Engine record type. Keys:

    - stage: The Pixi.js Stage object which coordinates all on-screen drawing.
    - renderer: The Pixi.js Renderer object, which draws objects to the canvas.
    - display-objects: A tree of objects added to the engine indexed by
      identifier.
    - event-channel: The channel on which all user input events are published.
    - render-channel: The cannel onto which rendering messages should be
      published.
    - view: The canvas DOM node which the renderer will draw to."
  [& {:keys [stage renderer display-objects event-channel render-channel view]}]
  (Engine. stage renderer display-objects event-channel render-channel view))

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

(def ^:private last-timestamp
  "The relative timestamp at which the animate loop last ran."
  (atom nil))

(defn- animate-loop
  "Invokes an animation loop function repeatedly via requestAnimationFrame."
  [engine]
  (defn- animate-loop-fn [timestamp]
    (js/requestAnimFrame animate-loop-fn)
    (.tick (.-Tween js/createjs)
           (- timestamp (or @last-timestamp timestamp)))
    (.render (:renderer engine) (:stage engine))
    (reset! last-timestamp timestamp))
  (js/requestAnimFrame animate-loop-fn))

(declare handle-message)

(defn- render-message-loop
  [{:as engine render-channel :render-channel dispatch-map :dispatch-map}]
  (go ;; TODO: Process messages in batches.
    (loop [message (<! render-channel)]
      (handle-message engine message)
      (recur (<! render-channel)))))

(defn initialize
  "Takes an EngineConfiguration and creates a new Engine instance. You should
  call this function only after all necessary Javascript libraries have finished
  loading. A canvas node to render to can be passed to EngineConfiguration,
  otherwise, a new one will be instantiated, returned, and must be added to
  the DOM. Refer to the documentation for Engine and EngineConfiguration for
  more information."
  [config]
  (tin.tween-plugin/install-tween-plugin)
  (let [Stage (.-Stage js/PIXI)
        stage (Stage. (:background-color config) (:interactive? config))
        renderer (.autoDetectRenderer js/PIXI (:width config) (:height config)
                                      (:view config) (:transparent? config)
                                      (:antialias? config))
        engine (new-engine :stage stage :renderer renderer
                           :display-objects (atom {})
                           :event-channel (chan channel-buffer-size)
                           :render-channel (chan channel-buffer-size)
                           :view (.-view renderer))]
    (animate-loop engine)
    (render-message-loop engine)
    engine))

;;;;; Helper Functions ;;;;;

(defn overwrite
  "Default update function for :update and :tween, overwrites the existing value
  with the new value."
  [& args]
  (last args))

(defn- to-camelcase
  "Converts a dash-separated |string| to camelCase and strips ? characters."
  [string]
  (let [parts (clojure.string/split (name string) #"-")]
    (clojure.string/replace
     (str (first parts) (apply str (map clojure.string/capitalize
                                        (rest parts)))) "?" "")))

;;;;; Identifiers ;;;;;

(defn- split-identifier
  "Splits an identifier on slashes."
  [identifier]
  (clojure.string/split identifier #"/"))

(defn- look-up-identifier
  "Looks up (via get-in) the value under |identifier|."
  [display-objects identifier]
  (get-in display-objects (split-identifier identifier)))

(defn- objects-for-identifier
  "Returns all display objets which match |identifier|."
  [display-objects identifier]
  (letfn [(all-values [value]
            (if (map? value) (map all-values (vals value)) (list value)))]
    (flatten (all-values (look-up-identifier display-objects identifier)))))

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

;;;;; Render Message ;;;;;

(declare expression-lift)

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
  [object properties & {:keys [function] : or {function overwrite}}]
  (doseq [[key value] properties]
    (update-property! object key value function))
  object)

(defn- new-container
  "Instantiates and returns a new PIXI.DisplayObjectContainer object."
  [display-objects [:container identifier properties & children]]
  (let [DisplayObjectContainer (.-DisplayObjectContainer js/PIXI)
        container (DisplayObjectContainer.)]
    (doseq [child children]
      (.addChild container (expression->object child display-objects)))
    (set-object-for-identifier! display-objects container identifier)
    (update-properties! container properties)))

(defn- new-sprite
  [display-objects [:sprite identifier texture properties]]
  (let [Sprite (.-Sprite js/PIXI)
        sprite (Sprite. (new-texture texture))]
    (set-object-for-identifier! display-objects sprite identifier)
    (update-properties! sprite properties)))

(defn- new-tiling-sprite
  [display-objects [:tiling-sprite identifier texture width height properties]]
  (let [TilingSprite (.-TilingSprite js/PIXI)
        tiling-sprite (TilingSprite. (new-texture texture) width height)]
    (set-object-for-identifier! display-objects tiling-sprite identifier)
    (update-properties! tiling-sprite properties)))

(defn- new-movie-clip
  [display-objects [:movie-clip identifier textures properties]]
  (let [MovieClip (.-MovieClip js/PIXI)
        movie-clip (MovieClip. (to-array (map new-texture textures)))]
    (set-object-for-identifier! display-objects movie-clip identifier)
    (update-properties! movie-clip properties)))

(defn- new-point
  [[:point x y]]
  (let [Point (.-Point js/PIXI)]
    (Point. x y)))

(defn- new-texture
  [[:texture type argument]]
  (let [Texture (.-Texture js/PIXI)]
    (case type
      :image (.fromImage Texture argument)
      :frame (.fromFrame Texture argument)
      :canvas (.fromCanvas Texture argument))))

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
  [{stage :stage display-objects :display-objects} [:render & object-exprs]]
  (doseq [[type identifier & _ :as object-expr] object-exprs
          :let object (expression->object object-expr display-objects)]
    (.addChild stage object)))

;;;;; Update Message ;;;;;

(defn- handle-update-message
  [engine [:update identifier properties &
           {:keys [function] :or {function overwrite}}]])

;;;;; Load Message ;;;;;

(defn- handle-load-message
  [engine [:load identifier & assets]])

;;;;; Animate Message ;;;;;

(defn- handle-animate-message
  [engine [:animate & animation-exprs]])

;;;;; Subscribe/Unsubscribe Messages ;;;;;

(defn- handle-subscribe-message
  [engine [:subscribe source & {:keys [to query event]}]])

(defn- handle-unsubscribe-message
  [engine [:unsubscribe source & {:keys [from]}]])

;;;;; Clear Message ;;;;;

(defn- handle-clear-message
  [engine [:clear]])

;;;;; Message Dispatch ;;;;;

(defn- handle-message
  "Process a render channel message by dispatching to the appropriate handler
  function. A handler can optionally return a chan object, if one is returned
  message processing will be halted until a read on the channel completes."
  [engine message]
  (case (first message)
    :render (handle-render-message engine message)
    :update (handle-update-message engine message)
    :load (handle-load-message engine message)
    :animate (handle-animate-message engine message)
    :subscribe (handle-subscribe-message engine message)
    :unsubscribe (handle-unsubscribe-message engine message)
    :clear (handle-clear-message engine message)))

(comment
  ; Top-level messages:
  ; create display objects
  [:render & object-exprs]
  ; update existing display objects
  [:update identifier properties {:function f}]
  ; load assets
  [:load identifier & assets]
  ; start an animation
  [:animate & animation-exprs]
  ; listen for input events on a display object
  [:subscribe source :to destination :query query :event event-expr]
  ; stop listening for input events
  [:unsubscribe source :from destination]
  ; remove everything from the stage
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
  [:tween properties {:function f :duration d :ease e}]
  [:play-clip frame?]
  [:stop-clip frame?]
  [:then message] ; Push arbitrary message onto the render queue.

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
