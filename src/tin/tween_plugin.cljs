(ns tin.tween-plugin)

(def tween-properties (array "position" "scale" "pivot" "anchor" "tilePosition"
                             "tileScale" "tileScaleOffset"))

(defn- init [tween prop value]
  (prn "init")
  value)

(defn- step []
  (prn "step"))

(defn- tween [tween prop value start-values end-values ratio]
  (let [start (aget start-values prop)
        end (aget end-values prop)
        ;; Avoid allocating lots of extra Point objects:
        result (if (identical? value start) (.clone value) value)]
  (set! (.-x result) (+ (.-x start) (* ratio (- (.-x end) (.-x start)))))
  (set! (.-y result) (+ (.-y start) (* ratio (- (.-y end) (.-y start)))))
  result))

(def TweenPlugin (js-obj
  "priority" 0
  "init" init
  "step" step
  "tween" tween))

(defn install-tween-plugin []
  (prn "install-tween-plugin")
  (.installPlugin (.-Tween js/createjs) TweenPlugin tween-properties))
