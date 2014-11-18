(ns tin.core
  (:require
   [cljs.core.async :refer [<! >! chan close! sliding-buffer put!
                            alts! timeout]])
  (:require-macros [cljs.core.async.macros :refer [go alt!]]))

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
  "A map from names to pixi DisplayObjects which have been added to the stage
   as children."
  (atom {}))

(def ^:private channel-buffer-size 10)

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

(defn- new-stage [background-color]
  (let [Stage (.-Stage js/PIXI)]
    (Stage. background-color)))

(defn- new-sprite [texture]
  (let [Sprite (.-Sprite js/PIXI)]
    (Sprite. texture)))

(defn- image->texture [image-url]
  (.fromImage (.-Texture js/PIXI) image-url))

(defn- frame->texture [frame-id]
  (.fromFrame (.-Texture js/PIXI) frame-id))

(defn- canvas->texture [canvas]
  (.fromCanvas (.-Texture js/PIXI) canvas))

(declare handle-message)

(defn- set-property!
  "Sets a property on a pixi.js object. Maps keywords to known properties, but
  does not ensure the object is of the correct type."
  [object key value]
  (case key
    :alpha (set! (.-alpha object) value)
    :anchor (set! (.-anchor object) value)
    :animation-speed (set! (.-animationSpeed object) value)
    :blend-mode (set! (.-blendMode object) value)
    :button-mode (set! (.-buttonMode object) value)
    :canvas (set! (.-canvas object) value)
    :context (set! (.-context object) value)
    :default-cursor (set! (.-defaultCursor object) value)
    :filter-area (set! (.-filterArea object) value)
    :filters (set! (.-filters object) value)
    :frame (set! (.-frame object) value)
    :height (set! (.-height object) value)
    :hit-area (set! (.-hitArea object) value)
    :interactive? (set! (.-interactive object) value)
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

(defn- set-properties!
  "Set all of the properties in the provided properties map to be properties
   of the provided pixi.js object."
  [object properties]
  (dorun (map
    (fn [entry] (set-property! object (key entry) (handle-message (val entry))))
    properties)))

(def ^:private last-timestamp
  "The relative timestamp at which the animate loop last ran."
  (atom nil))

(defn- animate-loop
  "Animation loop function, intended to be called repeatedly by
   requestAnimationFrame"
  [timestamp]
  (js/requestAnimFrame animate-loop)
  (.tick (.-Tween js/createjs)
    (- timestamp (or @last-timestamp timestamp)) false)
  (.render @renderer @stage)
  (reset! last-timestamp timestamp))

(defn- add-to-stage!
  "Adds a new child to the global Stage object, and stores the name of the
  object in the global name map. Sets the properties from the provided
  properties map on the object. Returns object."
  [object name properties]
  (set-properties! object properties)
  (.addChild @stage object)
  (swap! display-objects assoc name object)
  object)

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
  [[:sprite name texture properties]]
  (let [sprite (new-sprite (handle-texture texture))]
    (add-to-stage! sprite name properties)))

(defn- handle-message
  "Parses the provided message and renders the contents to the canvas."
  [message]
  (case (first message)
    :point (handle-point message)
    :sprite (handle-sprite message)
    message))

(defn- tween
  "Returns a new Tween instance with the provided target object."
  [target]
  (.get (.-Tween js/createjs) target))

(defn- tween-to
  "Queues a tween to the provided target properties on the provided Tween
   object for 'duration' milliseconds using easing function 'ease'"
  [object props duration]
  (.to object props duration))

(defn initialize
  "The function to create the pixi.js Stage and Renderer objects which manage
  all drawing.

  You are responsible for calling this function once pixi.js is done loading.
  Returns a <canvas> DOM node (as :view) which will be rendered to. You are
  responsible for attaching this node to the browser DOM. Returns a pair of
  channels as :render and :input. The render channel is what you should send
  draw messages to. You can listen on the input channel for user input
  messages."
  [& {:keys [width height background-color]
      :or {width 500, height 500, background-color 0xFFFFFF}}]
    (reset! stage (new-stage background-color))
    (reset! renderer (.autoDetectRenderer js/PIXI width height))
    (js/requestAnimFrame animate-loop)
    {:view (.-view @renderer) :render (chan channel-buffer-size)})

(defn ^:export main []
  (let [{view :view} (initialize :width 400 :height 400
                                 :background-color 0x66FF99)]
    (.appendChild (.-body js/document) view))

  (defn- bunny-message [x y]
    [:sprite (str "bunny" x "," y) [:texture [:image "bunny.png"]]
      {:anchor [:point 0.5 0.5] :position [:point (* 20 x) (* 20 y)]}])

  (def messages (for [x (range 1 20) y (range 1 20)] (bunny-message x y)))

  (dorun (map handle-message messages))

  (defn bunny-rotate [x y]
    (let [t (tween (@display-objects (str "bunny" x "," y)))]
      (set! (.-loop t) true)
      (tween-to t (js-obj "rotation" (* Math/PI 2)) (+ 1000 (rand-int 1000)))))

  (doseq [x (range 1 20) y (range 1 20)] (bunny-rotate x y))

  ;; (def bunny (@display-objects "bunny1"))
  ;; (prn "bunny " bunny)

  ;; (def my-tween (tween bunny))
  ;; (prn "my-tween" my-tween)

  ;; (set! (.-loop my-tween) true)
  ;; (tween-to my-tween (js-obj "rotation" (* Math/PI 2)) 2000)

  ;; (let [t (tween (:bunny2 @display-objects))]
  ;;   (set! (.-loop t) true)
  ;;   (tween-to t (js-obj "rotation" (* Math/PI 2)) 2000))
  ;; (let [t (tween (:bunny3 @display-objects))]
  ;;   (set! (.-loop t) true)
  ;;   (tween-to t (js-obj "rotation" (* Math/PI 2)) 1900))
  ;; (let [t (tween (:bunny4 @display-objects))]
  ;;   (set! (.-loop t) true)
  ;;   (tween-to t (js-obj "rotation" (* Math/PI 2)) 1800))
  ;; (let [t (tween (:bunny5 @display-objects))]
  ;;   (set! (.-loop t) true)
  ;;   (tween-to t (js-obj "rotation" (* Math/PI 2)) 1700))
  ;; (let [t (tween (:bunny6 @display-objects))]
  ;;   (set! (.-loop t) true)
  ;;   (tween-to t (js-obj "rotation" (* Math/PI 2)) 1600))
  ;; (let [t (tween (:bunny7 @display-objects))]
  ;;   (set! (.-loop t) true)
  ;;   (tween-to t (js-obj "rotation" (* Math/PI 2)) 1500))
  ;; (let [t (tween (:bunny8 @display-objects))]
  ;;   (set! (.-loop t) true)
  ;;   (tween-to t (js-obj "rotation" (* Math/PI 2)) 1400))
  ;; (let [t (tween (:bunny9 @display-objects))]
  ;;   (set! (.-loop t) true)
  ;;   (tween-to t (js-obj "rotation" (* Math/PI 2)) 1300))
  ;; (let [t (tween (:bunny10 @display-objects))]
  ;;   (set! (.-loop t) true)
  ;;   (tween-to t (js-obj "rotation" (* Math/PI 2)) 1200))

  )
