(ns tin.core
  (:require
   [tin.ease]
   [tin.tween-plugin]
   [tin.events :refer [impersonate-dom-node!]]
   [clojure.set :refer [union]]
   [clojure.string]
   [cljs.core.async :refer [<! >! chan close! sliding-buffer put!
                            alts! timeout pub]]
   [cljs.core.match])
  (:require-macros [cljs.core.async.macros :refer [go alt!]]
                   [cljs.core.match.macros :refer [match]]))

(enable-console-print!)

(def ^:private stage
  "The global Stage object which coordinates all on-screen drawing. You must
  call initialize before any other drawing operations to create the Stage."
  (atom nil))

(def ^:private renderer
  "The global Renderer object which draws to the canvas. You must call
  initialize to create the Renderer before doing any rendering."
  (atom nil))

(def ^:private display-objects
  "A map from identifiers to seqs of pixi DisplayObjects which have been added
  to the stage as children."
  (atom {}))

(def ^:private channel-buffer-size 65536)

(def ^:private event-channel
  "Channel to put user input events onto."
  (chan channel-buffer-size))

(def events
  "A publication for user input events. You can specify an input identifier for
  a specific type of user event on a display object, and that identifier will be
  used as the topic of a message which will be published here when that user
  input occurs."
  (pub event-channel :topic))

(defn- new-point [x y]
  (let [Point (.-Point js/PIXI)]
    (Point. x y)))

(defn- new-rectangle [x y width height]
  (let [Rectangle (.-Rectangle js/PIXI)]
    (Rectangle. x y width height)))

(defn- new-circle [x y radius]
  (let [Circle (.-Circle js/PIXI)]
    (Circle. x y radius)))

(defn- new-ellipse [x y width height]
  (let [Ellipse (.-Ellipse js/PIXI)]
    (Ellipse. x y width height)))

(defn- new-polygon [points]
  (let [Polygon (.-Polygon js/PIXI)]
    (Polygon. points)))

(defn- new-movie-clip [textures]
  (let [MovieClip (.-MovieClip js/PIXI)]
    (MovieClip. textures)))

(defn- new-text [text style]
  (let [Text (.-Text js/PIXI)]
    (Text. text style)))

(defn- new-bitmap-text [text style]
  (let [BitmapText (.-BitmapText js/PIXI)]
    (BitmapText. text style)))

(defn- new-tiling-sprite [texture width height]
  (let [TilingSprite (.-TilingSprite js/PIXI)]
    (TilingSprite. texture width height)))

(defn- new-stage [background-color interactive]
  (let [Stage (.-Stage js/PIXI)]
    (Stage. background-color interactive)))

(defn- new-sprite [texture]
  (let [Sprite (.-Sprite js/PIXI)]
    (Sprite. texture)))

(defn- new-asset-loader [assets]
  (let [AssetLoader (.-AssetLoader js/PIXI)]
    (AssetLoader. assets)))

(defn- new-display-object-container []
  (let [DisplayObjectContainer (.-DisplayObjectContainer js/PIXI)]
    (DisplayObjectContainer. )))

(defn- image->texture [image-url]
  (.fromImage (.-Texture js/PIXI) image-url))

(defn- frame->texture [frame-id]
  (.fromFrame (.-Texture js/PIXI) frame-id))

(defn- canvas->texture [canvas]
  (.fromCanvas (.-Texture js/PIXI) canvas))

(defn- point->map
  "Converts a pixi Point object to an {:x :y} map"
  [point]
  {:x (.-x point), :y (.-y point)})

(declare handle-message)
(declare value->expr)
(declare expr->value)

(defn- to-camelcase
  "Converts a dash-separated string to camelCase and strips ? characters."
  [string]
  (let [parts (clojure.string/split (name string) #"-")]
    (clojure.string/replace
     (str (first parts) (apply str (map clojure.string/capitalize
                                        (rest parts)))) "?" "")))

(defn- split-identifier
  "Splits an identifier on slashes."
  [identifier]
  (clojure.string/split identifier #"/"))

(defn- look-up-identifier
  "Looks up (via get-in) the value under the provided identifier."
  [identifier]
  (get-in @display-objects (split-identifier identifier)))

(defn- objects-for-identifier
  "Returns all display objets which match the provided identifier."
  [identifier]
  (letfn [(all-values [value]
            (if (map? value) (map all-values (vals value)) (list value)))]
    (flatten (all-values (look-up-identifier identifier)))))

(defn- set-object-for-identifier
  "Looks up the value for the provided identifier, and then

   - If there's no value: stores 'object' under this identifier as a new leaf
     node.
   - If the value is a map: adds 'object' as a leaf node under a numeric key
     (the size of the map).
   - Otherwise, if the value is a leaf node: creates a new map containing the
     previous object under this identifier and 'object' under the keys '0' and
     '1' respectively.

  It is an error to try to create a child path under an existing leaf node."
  [object identifier]
  (let [parts (split-identifier identifier)
current-value (look-up-identifier identifier)]
    (cond
     (nil? current-value) (swap! display-objects assoc-in parts object)
     (map? current-value) (swap! display-objects
                                 assoc-in
                                 (conj parts (str (count current-value)))
                                 object)
     :else (swap! display-objects assoc-in parts
                  {"0" current-value, "1" object}))))

(defn- set-property!
  [object key value]
  (aset object (to-camelcase key) value))

(defn- get-property
  [object key]
  (aget object (to-camelcase key)))

(def ^:private custom-properties #{:events})

(def ^:private style-properties #{:font :fill :align :stroke :stroke-thickness
                                  :word-wrap :word-wrap-width :drop-shadow
                                  :drop-shadow-color :drop-shadow-angle
                                  :drop-shadow-distance})

(defn- standard-properties
  "Removes all properties defined in custom-properties and style-properties from
  the provided map."
  [properties]
  (apply dissoc properties (union custom-properties style-properties)))

(defn overwrite
  "Default update function for :update and :tween, overwrites the existing value
  with the new value."
  [& args]
  (last args))

;; TODO: Can we eliminate this an just have value->expr do nothing on args that
;; are already exprs?
(defn- expr-wrap-first
  "Takes a two argument function and returns a function which will call
  value->expr on the *first* argument, but not the second, and will call
  expr->value on the result."
  [context function]
  (fn [x y]
    (expr->value context (function (value->expr x) y))))

(defn- expr-wrap
  "Like expr-wrap-first, but applies value->expr on all arguments."
  [context function]
  (fn [& args]
    (expr->value context (apply function (map value->expr args)))))

(defn- update-property!
  "Sets the property 'property' of object 'obj' to the value 'value', applying
   modification function 'function'."
  [context obj property value function]
  (let [func (expr-wrap-first context function)
        old (get-property obj property)
        new (func old value)]
    (set-property! obj property new)))

(defn- set-properties!
  "Set all of the properties in the provided properties map to be properties
  of the provided pixi.js object."
  [context object properties & {:keys [function] :or {function overwrite}}]
  (doseq [[property value] (standard-properties properties)]
    (update-property! context object property value function))
  (doseq [[property value] (select-keys properties style-properties)]
    (update-property! context (.-style object) property value function)))

(def ^:private last-timestamp
  "The relative timestamp at which the animate loop last ran."
  (atom nil))

(defn- animate-loop
  "Animation loop function, intended to be called repeatedly by
  requestAnimationFrame"
  [timestamp]
  (js/requestAnimFrame animate-loop)
  (.tick (.-Tween js/createjs)
         (- timestamp (or @last-timestamp timestamp))
         false) ; Is globally paused?
  (.render @renderer @stage)
  (reset! last-timestamp timestamp))

(defn- add-to-stage!
  "Adds a new child to the global Stage object, and stores the identifier for
  the object in the global display-objects map. Sets the properties
  from the provided properties map on the object. Returns object."
  [context object identifier properties]
  (letfn [(add-object [objects identifier value]
            (update-in objects [identifier] conj value))]
    (.addChild @stage object)
    (when identifier (swap! display-objects add-object identifier object))
    object))

(defn- perform-query
  "Takes a map from identifiers to lists of properties and returns a map with
   the values of those properties (if there's only one object associated with
   the provided identifier) or otherwise a map of lists of values."
  [context query]
  (letfn [(get-values [objects property]
            (if (= (count objects) 1)
              (get-property (first objects) property)
              (mapv #(get-property % property) objects)))]
    (into {}
          (for [[identifier properties] query]
            (let [objects (@display-objects identifier)]
              [identifier (into {}
                                (for [property properties]
                                  [property (get-values objects
                                                        property)]))])))))

(defn- event-callback
  "Returns a callback function to invoke when an input event occurs."
  [context event-name identifier object query]
  (fn [data]
    (let [args {:topic event-name
                :data (js->clj data)
                :identifier identifier}]
      (put! event-channel
            ;; Only include the transform if this object has a parent.
            (if (.-parent object)
              (assoc args :transform (.-worldTransform (.-parent object)))
              args)))))

(defn- add-standard-callback
  "Adds a standard callback to an object (one not based on a gesture
  recognizer)"
  [context name object callback]
  (case name
    ; TODO support multiple callbacks
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

(defn- get-recognizer-constructor
  "Looks up the constructor function for the recognizer with the provided name,
  returning nil if no matching constructor is found."
  [name]
  (case name
    :pan (.-Pan js/Hammer)
    :pinch (.-Pinch js/Hammer)
    :press (.-Press js/Hammer)
    :rotate (.-Rotate js/Hammer)
    :swipe (.-Swipe js/Hammer)
    :tap (.-Tap js/Hammer)
    nil))

(defn- add-event-handlers!
  "Adds event handlers to the provided display object."
  [context identifier object properties]
  (impersonate-dom-node! object)
  (let [Manager (.-Manager js/Hammer)
        manager (Manager. object)
        events (:events properties)]
    (doseq [recognizer events]
      (let [[event & {:as options}] recognizer
            Constructor (get-recognizer-constructor event)
            event-name (get options :event (name event))
            query (get options :query [])
            callback (event-callback context event-name identifier object
                                     query)]
        (if Constructor
          (do (.add manager (Constructor. (clj->js options)))
              (.on manager event-name callback))
          (add-standard-callback context event object callback))))))

(defn- add-event-handler!
  "Adds an event handler with the provided name to the provided object."
  [context identifier object name event query]
  (impersonate-dom-node! object)
    (let [Manager (.-Manager js/Hammer)
          manager (Manager. object)
          [[event-name & {:as options}]] event
          Constructor (get-recognizer-constructor event)
          callback (event-callback context name identifier object query)]
      (if Constructor
          (do (.add manager (name event-name) (Constructor. (clj->js options)))
              (.on manager  callback))
          (add-standard-callback context event-name object callback))))

(defn local-coordinates
  "Transforms a point from global window coordinates into the coordinate system
  of the provided transform object"
  [context [:point x y] transform]
  (let [InteractionData (.-InteractionData js/PIXI)
        tmp-data (InteractionData.)
        tmp-object (js* "{}")
        interaction-manager (.-interactionManager @stage)
        bounds (.getBoundingClientRect
                (.-interactionDOMElement interaction-manager))
        global-x (* (- x (.-left bounds))
                    (/ (.-width (.-target interaction-manager))
                       (.-width bounds)))
        global-y (* (- y (.-top bounds))
                    (/ (.-height (.-target interaction-manager))
                       (.-height bounds)))]
    (set! (.-global tmp-data) (expr->value context [:point global-x global-y]))
    (set! (.-worldTransform tmp-object) transform)
    (value->expr (.getLocalPosition tmp-data tmp-object))))

(defn interaction-local-coordinates
  "Gets the coordinates of an interaction event in the coordinate system of the
  target of the event as a Point object."
  [interaction-data]
  (let [target (interaction-data :target)
        global (interaction-data :global)
        InteractionData (.-InteractionData js/PIXI)
        tmp-data (InteractionData.)]
    (set! (.-global tmp-data) global)
    (.getLocalPosition tmp-data target)))

(defn- handle-point
  "Instantiates and returns a new pixi.js Point from a message"
  [context [:point x y]]
  (new-point x y))

(defn- handle-texture
  "Instantiates and returns a new pixi.js Texture from a message"
  [context [:texture [type argument] properties]]
  (let [texture
        (case type
          :image (image->texture argument)
          :frame (frame->texture argument)
          :canvas (canvas->texture argument))]
    (set-properties! context texture properties)
    texture))

(defn- handle-sprite
  "Instantiates and returns a new pixi.js Sprite, which is also immediately
  added as a child of the global stage."
  [context [:sprite identifier texture properties]]
  (let [sprite (new-sprite (handle-message context texture))]
    (when (:events properties)
      (add-event-handlers! context identifier sprite properties))
    (set-properties! context sprite properties)
    (add-to-stage! context sprite identifier properties)))

(defn- handle-tiling-sprite
  "Instantiates and returns a new pixi.js TilingSprite, which is also
  immediately added as a child of the global stage."
  [context [:sprite identifier texture width height properties]]
  (let [sprite (new-tiling-sprite (handle-message context texture)
                                  width height)]
    (when (:events properties)
      (add-event-handlers! context identifier sprite properties))
    (set-properties! context sprite properties)
    (add-to-stage! context sprite identifier properties)))

(defn- handle-text
  "Instantiates and returns a new pixi.js Text object, which is also immediately
  added as a child of the global stage."
  [context new-text-fn [_ identifier message properties]]
  (let [text (new-text-fn message)]
    (when (:events properties)
      (add-event-handlers! context identifier text properties))
    (set-properties! context text properties)
    (add-to-stage! context text identifier properties)))

(defn- handle-movie-clip
  "Instantiates a pixi.js MovieClip and adds it to the global stage."
  [context [:movie-clip identifier textures properties]]
  (let [clip (new-movie-clip (clj->js (map #(handle-message context %)
                                           textures)))]
    (when (:events properties)
      (add-event-handlers! context identifier clip properties))
    (set-properties! context clip properties)
    (add-to-stage! context clip identifier properties)))

(defn- handle-update
  "Updates the properties of an existing DisplayObject. Cannot be used to set
  user input functions."
  [context [:update identifier properties & {:keys [function]
                                             :or {function overwrite}}]]
  (doseq [object (@display-objects identifier)]
    (set-properties! context object properties :function function)))

(defn- handle-container
  "Instantiates and returns a new pixi.js DisplayObjectContainer, which will
  also be added as a child of the global stage."
  [context [:container identifier properties & children]]
  (let [container (new-display-object-container)]
    (dorun (map #(.addChild container (handle-message context %)) children))
    (when (:events properties)
      (add-event-handlers! context identifier container properties))
    (set-properties! context container properties)
    (add-to-stage! context container identifier properties)))

(defn- new-tween
  "Returns a new Tween instance with the provided target object."
  [target properties]
  (.get (.-Tween js/createjs) target (clj->js properties)))

(defn point-object-binary-function
  "Takes a binary function and returns a function which lifts it to apply to
  Point objects. The resulting function will take input points (x1, y1) and
  (x2, y2) and will return ((fn x1 x2), (fn y1 y2))."
  [binary-function]
  (fn [point1 point2]
    (new-point (binary-function (.-x point1) (.-x point2))
               (binary-function (.-y point1) (.-y point2)))))

(defn point-binary-function
  "Takes a binary function and returns a function which will apply it to
  two [:point x y] expressions and return a new [:point]."
  [binary-function]
  (fn [[:point old-x old-y] [:point new-x new-y]]
    [:point (binary-function old-x new-x) (binary-function old-y new-y)]))

(defn- build-animation-target-map
  "Looks up the current value of each property on the provided object and
   constructs an animation target map by applying the provided binary function
   or functions to (current_value, map_value) to compute the final map value."
  [context object initial-map function-or-map]
  (letfn [(get-fn [property]
            (if (map? function-or-map)
              (get function-or-map property overwrite)
              function-or-map))]
    (into {}
          (for [[property value] initial-map
                :let [original-value (get-property object property)
                      function (expr-wrap-first context (get-fn property))]]
            [(to-camelcase property) (function original-value value)]))))

(defn- handle-tween-action
  "Handles the :tween action within an animation."
  [context the-tween object [:tween properties &
                             {:keys [duration ease function]
                              :or {duration 1000
                                   ease (tin.ease/linear)
                                   function {}}}]]
  (let [target-map (build-animation-target-map context object properties
                                               function)]
    (.to the-tween (clj->js target-map) duration ease)))

(defn- handle-clip-action
  "Handles the :play-clip and :stop-clip actions within an animation."
  [context tween object [type frame]]
  (let [callback (fn [] (case type
                          :play-clip (if frame (.gotoAndPlay object frame)
                                         (.play object))
                          :stop-clip (if frame (.gotoAndStop object frame)
                                         (.stop object))))]
    (.call tween callback)))

(defn- handle-default-action
  "Handles the default action inside an animation, which queues a new message
   in the animation."
  [context tween object message]
  (.call tween #(handle-message context message)))

(defn- handle-animation
  "Creates a new TweenJS Tween object for each object with the provided
   identifier and queues animation actions on it."
  [context [:animation identifier options & actions]]
  (doseq [object (@display-objects identifier ())]
    (let [tween (new-tween object options)]
      (doseq [action actions]
        (case (first action)
          :tween (handle-tween-action context tween object action)
          :play-clip (handle-clip-action context tween object action)
          :stop-clip (handle-clip-action context tween object action)
          (handle-default-action context tween object action))))))

(defn- handle-stage-update
  "Applies a property update to the global Stage object."
  [context [:stage-update properties & {:keys [function]
                                        :or {function overwrite}}]]
  (when (:events properties)
    (add-event-handlers! context "@stage" @stage properties))
  (set-properties! context @stage properties :function function))

(defn handle-listen
  "Handles the :listen message type."
  [context [:listen & {:keys [target name event query] :or {query {}}}]]
  (doseq [object (@display-objects target)]
    (add-event-handler! context target object name event query)))

(defn handle-unlisten
  "Handles the :unlisten message type."
  [context [:unlisten & {:keys [target name]}]])

(defn- handle-clear
  "Clears all values from the stage."
  [context [:clear]]
  (while (> (.-length (.-children @stage)) 0)
    (.removeChild @stage (aget (.-children @stage) 0)))
  (reset! display-objects {}))

;; TODO: Child objects of e.g. a display container are being added to the global
;; stage as well as to their parent.

;; TODO: Stop this weird handling of both messages and values - draw the
;; correct distinction

(defn- value->expr
  "Turns the provided Pixi.js object into an expression (if possible)."
  [object]
  (cond
   (instance? (.-Point js/PIXI) object) [:point (.-x object) (.-y object)]
   :otherwise object))

(defn- expr->value
  "Returns a Pixi.js object based on the provided value message, or returns the
  input unchanged if it was a primitive (non-sequential) value."
  [context message]
  (if (sequential? message)
    (case (first message)
      :point (handle-point context message)
      :texture (handle-texture context message)
      (to-array (map #(expr->value context %) message)))
    message))

;; dispatch?
(defn- handle-message
  "Parses the provided message and renders the contents to the canvas."
  [context message]
  (if (sequential? message)
    (case (first message)
      :point (handle-point context message)
      :texture (handle-texture context message)
      :sprite (handle-sprite context message)
      :tiling-sprite (handle-tiling-sprite context message)
      :movie-clip (handle-movie-clip context message)
      :update (handle-update context message)
      :container (handle-container context message)
      :animation (handle-animation context message)
      :text (handle-text context new-text message)
      :bitmap-text (handle-text context new-bitmap-text message)
      :stage-update (handle-stage-update context message)
      :listen (handle-listen context message)
      :unlisten (handle-unlisten context message)
      :clear (handle-clear context message))
    message))

(defn- load-assets
  "Loads assets with the provided paths by inspecting their file extensions.
  Returns a channel which will have the message :loaded put! onto it once
  the asset loading is completed."
  [context [:load & assets]]
  (let [result-channel (chan)
        loader (new-asset-loader (to-array assets))]
    (.addEventListener loader "onComplete" #(put! result-channel :loaded))
    (.load loader)
    result-channel))

(defn initialize
  "The function to create the pixi.js Stage and Renderer objects which manage
  all drawing.

  You are responsible for calling this function once pixi.js is done loading.
  Returns a <canvas> DOM node (as :view) which will be rendered to. You are
  responsible for attaching this node to the browser DOM. Returns a pair of
  channels as :render and :input. The render channel is what you should send
  draw messages to. You can listen on the input channel for user input
  messages."
  [& {:keys [width height background-color view transparent? antialias?]
      :or {width 500, height 500, background-color 0xFFFFFF, view nil,
           transparent? false, antialias? false}}]
  (tin.tween-plugin/install-tween-plugin)
  (reset! stage (new-stage background-color true)) ;; interactive
  (reset! renderer (.autoDetectRenderer js/PIXI width height view
                                        transparent? antialias?))
  (js/requestAnimFrame animate-loop)
  (let [render-channel (chan channel-buffer-size)
        input-channel (chan channel-buffer-size)
        view (.-view @renderer)
        context {}]
    ;; TODO: Load messages in batches to allow incremental rendering
    (go (loop [[type & _ :as message] (<! render-channel)]
          (if (= type :load)
            (<! (load-assets context message))  ; Block until assets are loaded.
            (handle-message context message))
          (recur (<! render-channel))))
    {:view view :render render-channel :input input-channel}))

(defn put-messages!
  "Puts the messages from the provided seq onto the provided render channel."
  [render-channel messages]
  (dorun (map #(put! render-channel %) messages)))

;; Todo: support from-frames helper function constructors for sprites & clips

;; Todo: Get rid of [:point] and just do {:x :y}?

;; Todo: Make texture things arguments instead of [:texture]
;; (or get rid of textures entirely)

(comment ;; Message Format
  [:messages & messages]
  [:container identifier options & children]
  [:sprite identifier texture options]
  [:movie-clip identifier [textures] options]
  [:update identifier properties :function function]
  ;; function is the same as the function you pass to :tween
  [:point x y]
  [:texture texture-expression]
  [:animation identifier options & actions] ;; TODO rename this to :action
  [:tiling-sprite identifier texture width height options]
  [:clear] ;; Remove everything in scene.
  [:load & filenames] ;; Blocks rendering until loaded.
  [:text identifier message options]
  [:bitmap-text identifier message options]
  [:interactive-stage] ;; Requests to make the stage an interactive object.
  [:listen :target target :name name :query query :event event-expression]
  [:unlisten :target target :name event-name]

  ;; Texture expressions:
  [:image "path.png"]
  [:canvas canvas-object]
  [:frame frame-id]

  ;; Actions:
  [:tween properties {:function f :duration d :ease e}]
  ;; Function takes 2 args - previous and value, and should return the
  ;; new value to tween to. Default is to discard previous, but you can e.g.
  ;; pass + to make it behave like a += operation.
  ;; Note that the function is not re-evalutated with the :loop option,
  ;; looping tweens are always between two fixed values.
  [:play-clip frame?]
  [:stop-clip frame?]
  [:update identifier properties :function function]

  ;; Event expressions:
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
  )

(comment ;; Action Format
  [:tween property value :function f :duration d :ease e]
  [:play-clip :frame frame]
  [:stop-clip :frame frame]
  [:update identifier properties :function f]
  [:draggable :function f]
  [:not-draggable])
