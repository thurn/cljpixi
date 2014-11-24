(ns tin.core
  (:require
   [cljs.core.async :refer [<! >! chan close! sliding-buffer put!
                            alts! timeout]]
   [cljs.core.match]
   [tin.ease])
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

(defn- get-property
  "Gets a property from a pixi.js object. Maps keywords to known properties, but
  does not ensure the object is of the correct type."
  [object key]
  (case key
    :alpha (.-alpha object)
    :anchor (.-anchor object)
    :animation-speed (.-animationSpeed object)
    :blend-mode (.-blendMode object)
    :button-mode (.-buttonMode object)
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

(defn- set-properties!
  "Set all of the properties in the provided properties map to be properties
   of the provided pixi.js object."
  [object properties]
  (dorun
   (map
    (fn [entry]
      (aset object (name (key entry)) (handle-message (val entry))))
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
  (let [sprite (new-sprite (handle-message texture))]
    (add-to-stage! sprite name properties)))

(defn- handle-container
  "Instantiates and returns a new pixi.js DisplayObjectContainer, which will
   also be added as a child of the global stage."
  [[:container name properties & children]]
  (let [container (new-display-object-container)]
    (dorun (map #(.addChild container (handle-message %)) children))
    (add-to-stage! container name properties)))

(defn- new-tween
  "Returns a new Tween instance with the provided target object."
  [target properties]
  (.get (.-Tween js/createjs) target (clj->js properties)))

(defn point-binary-function
  "Takes a binary function and returns a function which will apply it old-point,
  a pixi.js point object and new-point, an {:x :y} formatted map, and return an
  {:x :y} map of the result."
  [binary-function]
  (fn [old-point new-point]
    {:x (binary-function (.-x old-point) (:x new-point))
     :y (binary-function (.-y old-point) (:y new-point))}))

(defn- handle-tween-to-action
  "Handles the :to tween action"
  [object tween-options [:to property value
                         & {:keys [duration ease function]
                            :or {duration 1000
                                 ease (tin.ease/linear)
                                 function #(identity %2)}}]]
  (let [current-value (js->clj (aget object (name property)))
        target (function current-value value)]
    (if (map? value)
      (.to (new-tween current-value tween-options)
           (clj->js target) duration ease)
      (.to (new-tween object tween-options)
           (clj->js {property target}) duration ease))))

(defn- handle-tween-action
  "Applies a TweenJS action to the provided tween."
  [object tween-options action]
  (case (first action)
    :to (handle-tween-to-action object tween-options action)))

(defn- handle-tween
  "Creates a new TweenJS Tween object for each object with the provided key and
   starts it with the supplied actions."
  [[:tween key tween-options & actions]]
  (doseq [object (@display-objects key ()) action actions]
    (handle-tween-action object tween-options action)))

(defn- handle-message
  "Parses the provided message and renders the contents to the canvas."
  [message]
  (case (first message)
    :point (handle-point message)
    :texture (handle-texture message)
    :sprite (handle-sprite message)
    :container (handle-container message)
    :tween (handle-tween message)
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
  [& {:keys [width height background-color]
      :or {width 500, height 500, background-color 0xFFFFFF}}]
  (reset! stage (new-stage background-color))
  (reset! renderer (.autoDetectRenderer js/PIXI width height))
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

(defn example1 [render-channel input-channel]
  (let [messages
        [[:load "resources/img/bunny.png"]
         [:sprite :spinning-bunny
          [:texture [:frame "resources/img/bunny.png"]]
          {:anchor [:point 0.5 0.5] :position [:point 400 300]}]
         [:sprite :moving-bunny
          [:texture [:frame "resources/img/bunny.png"]]
          {:anchor [:point 0.5 0.5] :position [:point 50 50]}]
         [:tween :spinning-bunny {:loop true}
          [:to :rotation (* 2 Math/PI) {:duration 1000}]]
         [:tween :moving-bunny {:loop true}
          [:to :position {:x 500 :y 500} :duration 5000
               :function (point-binary-function +)]]]]
    (dorun (map #(put! render-channel %) messages))))

(defn example2-sprites
  []
  (let [frames ["eggHead.png", "flowerTop.png", "helmlok.png", "skully.png"]
        container [:container :aliens {:position [:point 400 300]}]
        make-sprite (fn []
                      [:sprite :alien
                       [:texture [:frame (rand-nth frames)]]
                       {:anchor [:point 0.5 0.5]
                        :position [:point (+ -400 (rand-int 800))
                                   (+ -300 (rand-int 600))]}])]
    (into container (repeatedly 100 make-sprite))))

(defn example2 [render-channel input-channel]
  (let [messages
        [[:load "resources/img/SpriteSheet.json"]
         (example2-sprites)
         [:tween :alien {:loop true}
          [:to :rotation (* 2 Math/PI) :duration 1000]]
         [:tween :aliens {:loop true}
          [:to :scale {:x 0.1 :y 0.1} :duration 3000
             :ease #(Math/sin (* Math/PI %))]]
         [:tween :aliens {:loop true}
           [:to :rotation (* Math/PI 2) :duration 20000]]]]
    (dorun (map #(put! render-channel %) messages))))

(defn ^:export main []
  (let [{view :view render-channel :render input-channel :input}
        (initialize :width 800 :height 600 :background-color 0x66FF99)]
    (.appendChild (.-body js/document) view)
    (example2 render-channel input-channel)))

(comment ;; Message Format
  [:container key options & children]
  [:sprite key texture options]
  [:point x y]
  [:texture texture-expression]
    ;; Valid Texture expressions:
    [:image "path.png"]
    [:canvas canvas-object]
    [:frame frame-id]
  [:tween key options & actions]
    ;; Valid Actions:
    [:to property value {:function f :duration d :ease e}]
    ;; Value can be a number or {:x :y} map for PIXI.Point properties
    ;; Function takes 2 args - previous and value, and should return the
    ;; new value to tween to. Default is to discard previous, but you can e.g.
    ;; pass + to make it behave like a += operation.
    ;; Note that the function is not re-evalutated with the :loop option,
    ;; looping tweens are always between two fixed values.
  [:timeline options & tweens]
  [:load & filenames] ;; Blocks rendering until loaded.
  [:clear] ;; Remove everything in scene.
)
