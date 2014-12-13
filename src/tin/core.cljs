(ns tin.core
  (:require
   [tin.ease]
   [tin.events :refer [impersonate-dom-node!]]
   [clojure.set :refer [intersection]]
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
  "A map from keys to seqs of pixi DisplayObjects which have been added to
  the stage as children."
  (atom {}))

(def ^:private channel-buffer-size 65536)

(def ^:private event-channel
  "Channel to put user input events onto."
  (chan channel-buffer-size))

(def events
  "A publication for user input events. You can specify an input key for a
  specific type of user event on a display object, and that key will be used as
  the topic of a message which will be published here when that user input
  occurs."
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

(defn- set-property!
  "Sets a property on a pixi.js object. Maps keywords to known properties, but
  does not ensure the object is of the correct type."
  [object key value]
  (case key
    :alpha (set! (.-alpha object) value)
    :anchor (set! (.-anchor object) value)
    :animation-speed (set! (.-animationSpeed object) value)
    :blend-mode (set! (.-blendMode object) value)
    :button-mode? (set! (.-buttonMode object) value)
    :canvas (set! (.-canvas object) value)
    :context (set! (.-context object) value)
    :default-cursor (set! (.-defaultCursor object) value)
    :filter-area (set! (.-filterArea object) value)
    :filters (set! (.-filters object) value)
    :frame (set! (.-frame object) value)
    :height (set! (.-height object) value)
    :hit-area (set! (.-hitArea object) value)
    :interactive? (set! (.-interactive object) value)
    :loop? (set! (.-loop object) value)
    :mask (set! (.-mask object) value)
    :pivot (set! (.-pivot object) value)
    :points (set! (.-points object) value)
    :position (set! (.-position object) value)
    :radius (set! (.-radius object) value)
    :rotation (set! (.-rotation object) value)
    :scale (set! (.-scale object) value)
    :scale-mode (set! (.-scaleMode object) value)
    :source (set! (.-source object) value)
    :style (set! (.-style object) value)
    :text (set! (.-text object) value)
    :texture (set! (.-texture object) value)
    :textures (set! (.-textures object) value)
    :tile-position (set! (.-tilePosition object) value)
    :tile-scale (set! (.-tileScale object) value)
    :tile-scale-offset (set! (.-tileScaleOffset object) value)
    :visible? (set! (.-visible object) value)
    :width (set! (.-width object) value)
    :x (set! (.-x object) value)
    :y (set! (.-x object) value)))

(defn- get-property
  "Gets a property from a pixi.js object. Maps keywords to known properties, but
  does not ensure the object is of the correct type."
  [object key]
  (case key
    :alpha (.-alpha object)
    :anchor (.-anchor object)
    :animation-speed (.-animationSpeed object)
    :blend-mode (.-blendMode object)
    :button-mode? (.-buttonMode object)
    :canvas (.-canvas object)
    :context (.-context object)
    :default-cursor (.-defaultCursor object)
    :filter-area (.-filterArea object)
    :filters (.-filters object)
    :frame (.-frame object)
    :height (.-height object)
    :hit-area (.-hitArea object)
    :interactive? (.-interactive object)
    :mask (.-mask object)
    :loop? (.-loop object)
    :pivot (.-pivot object)
    :points (.-points object)
    :position (.-position object)
    :radius (.-radius object)
    :rotation (.-rotation object)
    :scale (.-scale object)
    :scale-mode (.-scaleMode object)
    :size (.-size object)
    :source (.-source object)
    :style (.-style object)
    :text (.-text object)
    :texture (.-texture object)
    :textures (.-textures object)
    :tile-position (.-tilePosition object)
    :tile-scale (.-tileScale object)
    :tile-scale-offset (.-tileScaleOffset object)
    :visible? (.-visible object)
    :width (.-width object)
    :x (.-x object)
    :y (.-x object)))

(def ^:private custom-properties
  #{:click :mouse-down :mouse-up :mouse-up-outside :mouse-over :mouse-out
    :tap :touch-start :touch-end :touch-end-outside :mouse-move :touch-move
    :events})

(defn overwrite
  "Default update function for :update and :tween, overwrites the existing value
  with the new value."
  [& args]
  (last args))

(defn- expr-wrap-first
  "Takes a two argument function and returns a value which will call value->expr
  on the *first* argument, but not the second, and will call expr->value on the
  result."
  [function]
  (fn [x y]
    (expr->value (function (value->expr x) y))))

(defn- expr-wrap
  "Like expr-wrap-first, but applies value->expr on all arguments."
  [function]
  (fn [& args]
    (expr->value (apply function (map value->expr args)))))

;; TODO: rewrite using doseq
(defn- set-properties!
  "Set all of the properties in the provided properties map to be properties
  of the provided pixi.js object."
  [object properties & {:keys [function] :or {function overwrite}}]
  (dorun
   (map
    (fn [entry]
      (set-property! object (key entry)
                     ((expr-wrap-first function)
                      (get-property object (key entry))
                      (val entry))))
    (filter #(not (contains? custom-properties (key %))) properties))))

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
  "Adds a new child to the global Stage object, and stores the key for
  the object in the global display-objects map. Sets the properties
  from the provided properties map on the object. Returns object."
  [object key properties]
  (letfn [(add-object [objects key value] (update-in objects [key] conj value))]
    (set-properties! object properties)
    (.addChild @stage object)
    (when name (swap! display-objects add-object key object))
    object))

(defn- hover-recognizer
  "Makes a new gesture recognizer constructor for recognizing hover events."
  [])

(defn- add-event-handlers!
  "Adds event handlers to the provided display object."
  [key object properties]
  (impersonate-dom-node! object)
  (let [Manager (.-Manager js/Hammer)
        manager (Manager. object)
        events (:events properties)]
    (doseq [recognizer events]
      (let [[event & {:as options}] recognizer
            Constructor (case (first recognizer)
                          :pan (.-Pan js/Hammer)
                          :pinch (.-Pinch js/Hammer)
                          :press (.-Press js/Hammer)
                          :rotate (.-Rotate js/Hammer)
                          :swipe (.-Swipe js/Hammer)
                          :tap (.-Tap js/Hammer)
                          nil)
            event-name (get options "event" (name event))
            callback (fn [data]
                       (put! event-channel
                             {:topic event-name
                              :data (js->clj data)
                              :key key
                              :transform (.-worldTransform
                                          (.-parent object))}))]
        (if Constructor
          (do (.add manager (Constructor. (clj->js options)))
              (.on manager event-name callback))
          (case (first recognizer)
            :mouse-over (set! (.-mouseover object) callback)
            :mouse-out (set! (.-mouseout object) callback)
            :click-start (do (set! (.-mousedown object) callback)
                             (set! (.-touchstart object) callback))
            :click-end-outside (do (set! (.-mouseupoutside object) callback)
                                   (set! (.-touchendoutside object) callback))
            :click-end (do (set! (.-mouseup object) callback)
                           (set! (.-touchend object) callback)
                           (set! (.-mouseupoutside object) callback)
                           (set! (.-touchendoutside object) callback))))))))

(defn local-coordinates
  "Transforms a point from global window coordinates into the coordinate system
  of the provided transform object"
  [[:point x y] transform]
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
    (set! (.-global tmp-data) (expr->value [:point global-x global-y]))
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
  [[:point x y]]
  (new-point x y))

(defn- handle-texture
  "Instantiates and returns a new pixi.js Texture from a message"
  [[:texture [type argument] properties]]
  (let [texture
        (case type
          :image (image->texture argument)
          :frame (frame->texture argument)
          :canvas (canvas->texture argument))]
    (set-properties! texture properties)
    texture))

(defn- handle-sprite
  "Instantiates and returns a new pixi.js Sprite, which is also immediately
  added as a child of the global stage."
  [[:sprite key texture properties]]
  (let [sprite (new-sprite (handle-message texture))]
    (when (:events properties) (add-event-handlers! key sprite properties))
    (set! (.-mySprite js/window) sprite)
    (add-to-stage! sprite key properties)))

(defn- handle-movie-clip
  "Instantiates a pixi.js MovieClip and adds it to the global stage."
  [[:movie-clip key textures properties]]
  (let [clip (new-movie-clip (clj->js (map handle-message textures)))]
    (when (:events properties) (add-event-handlers! key clip properties))
    (add-to-stage! clip key properties)))

(defn- handle-update
  "Updates the properties of an existing DisplayObject. Cannot be used to set
  user input functions."
  [[:update key properties & {:keys [function] :or {function overwrite}}]]
  (doseq [object (@display-objects key)]
    (set-properties! object properties :function function)))

(defn- handle-container
  "Instantiates and returns a new pixi.js DisplayObjectContainer, which will
  also be added as a child of the global stage."
  [[:container name properties & children]]
  (let [container (new-display-object-container)]
    (dorun (map #(.addChild container (handle-message %)) children))
    (when (:events properties) (add-event-handlers! key container properties))
    (add-to-stage! container name properties)))

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
  old-point, a pixi.js point object and new-point, an {:x :y} formatted map, and
  return an {:x :y} map of the result."
  [binary-function]
  (fn [old-point new-point]
    {:x (binary-function (.-x old-point) (:x new-point))
     :y (binary-function (.-y old-point) (:y new-point))}))

(defn- handle-tween-action
  "Handles the :tween action"
  [object tween-options [:tween property value
                         & {:keys [duration ease function]
                            :or {duration 1000
                                 ease (tin.ease/linear)
                                 function overwrite}}]]
  (let [current-value (js->clj (get-property object property))
        target ((expr-wrap-first function) current-value value)]
    (if (map? value)
      (.to (new-tween current-value tween-options)
           (clj->js target) duration ease)
      (.to (new-tween object tween-options)
           (clj->js {property target}) duration ease))))

(defn- handle-animation-action
  "Applies a TweenJS action to the provided tween."
  [object options action]
  (case (first action)
    :tween
    (handle-tween-action object options action)
    :play-clip
    (let [[:play-clip frame] action]
      (if frame (.gotoAndPlay object frame) (.play object)))
    :stop-clip
    (let [[:stop-clip frame] action]
      (if frame (.gotoAndStop object frame) (.stop object)))))

(defn- handle-animation
  "Creates a new TweenJS Tween object for each object with the provided key and
  starts it with the supplied actions."
  [[:animation key tween-options & actions]]
  (doseq [object (@display-objects key ()) action actions]
    (handle-animation-action object tween-options action)))

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
  [message]
  (if (sequential? message)
    (case (first message)
      :point (handle-point message)
      :texture (handle-texture message))
    message))

;; dispatch?
(defn- handle-message
  "Parses the provided message and renders the contents to the canvas."
  [message]
  (if (sequential? message)
    (case (first message)
      :messages (dorun (map handle-message (rest message)))
      :point (handle-point message)
      :texture (handle-texture message)
      :sprite (handle-sprite message)
      :movie-clip (handle-movie-clip message)
      :update (handle-update message)
      :container (handle-container message)
      :animation (handle-animation message))
    message))

(defn- load-assets
  "Loads assets with the provided paths by inspecting their file extensions.
  Returns a channel which will have the message :loaded put! onto it once
  the asset loading is completed."
  [[:load & assets]]
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
  (reset! stage (new-stage background-color true)) ;; interactive
  (reset! renderer (.autoDetectRenderer js/PIXI width height view
                                        transparent? antialias?))
  (js/requestAnimFrame animate-loop)
  (let [render-channel (chan channel-buffer-size)
        input-channel (chan channel-buffer-size)
        view (.-view @renderer)]
    (go (loop [[type & _ :as message] (<! render-channel)]
          (if (= type :load)
            (<! (load-assets message))  ; Block until assets are loaded.
            (handle-message message))
          (recur (<! render-channel))))
    {:view view :render render-channel :input input-channel}))

(defn put-messages!
  "Puts the messages from the provided seq onto the provided render channel."
  [render-channel messages]
  (dorun (map #(put! render-channel %) messages)))

(defn- rand-between
  "Returns a random number between low (inclusive) and high (exclusive)."
  [low high]
  (+ low (rand-int (- high low))))

;; Todo: Don't require having *each* movie clip have a separate vector of
;; textures, let users have a collection of textures under a key
(defn example3 [render-channel input-channel]
  (let [make-texture
        (fn [i] [:texture [:frame (str "Explosion_Sequence_A " i ".png")]])
        make-movie-clip
        (fn [i]
          (let [scale (rand-between 0.75 1.5)]
            [:movie-clip (str "explosion" i) (map make-texture (range 1 27))
             {:position [:point (rand-int 800) (rand-int 600)]
              :rotation (rand-int Math/PI) :anchor [:point 0.5 0.5]
              :scale [:point scale scale] :loop true}]))
        make-animation
        (fn [i]
          [:animation (str "explosion" i) {} [:play-clip (rand-between 1 27)]])
        messages
        [[:load "resources/example3/SpriteSheet.json"]
         (into [:messages] (map make-movie-clip (range 50)))
         (into [:messages] (map make-animation (range 50)))]]
    (dorun (map #(put! render-channel %) messages))))

;; Todo: support from-frames helper function constructors for sprites & clips

;; Todo: convert from clojure property names to javascript camelcase names
;; correctly.

;; Todo: Is there a way to fold options like :loop into the body of :tween?

;; Todo: Get rid of [:point] and just do {:x :y}?

;; Todo: Make texture things arguments instead of [:texture]
;; (or get rid of textures entirely)

(comment ;; Message Format
  [:messages & messages]
  [:container key options & children]
  [:sprite key texture options]
  [:movie-clip key [textures] options]
  [:update key properties :function function]
  ;; update-fn is the same as the function you pass to :tween
  [:point x y]
  [:texture texture-expression]
  ;; Valid Texture expressions:
  [:image "path.png"]
  [:canvas canvas-object]
  [:frame frame-id]
  ;; TODO rename this to :action
  [:animation key options & actions]
  ;; Valid Actions:
  [:tween property value {:function f :duration d :ease e}]
  ;; Value can be a number or {:x :y} map for PIXI.Point properties
  ;; Function takes 2 args - previous and value, and should return the
  ;; new value to tween to. Default is to discard previous, but you can e.g.
  ;; pass + to make it behave like a += operation.
  ;; Note that the function is not re-evalutated with the :loop option,
  ;; looping tweens are always between two fixed values.
  [:play-clip frame?]
  [:stop-clip frame?]
  [:timeline options & tweens]
  [:load & filenames] ;; Blocks rendering until loaded.
  [:clear] ;; Remove everything in scene.

  ;; Events
  ;; Specify a :events list as an option to any DisplayObject.
  ;; Maps event keys to events. Valid recognizer expressions:
  [:pan :threshold 10]
  [:pinch :pointers 2]
  [:press :time 500]
  [:rotate :threshold 10]
  [:swipe :velocity 0.65]
  [:tap :taps 1]
  [:hover :time 1000]
  )

(comment ;; Action Format
  [:tween property value :function f :duration d :ease e]
  [:play-clip :frame frame]
  [:stop-clip :frame frame]
  [:update key properties :function f]
  [:draggable :function f]
  [:not-draggable])
