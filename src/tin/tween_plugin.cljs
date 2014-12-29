(ns tin.tween-plugin)

(def tween-properties (array "position"))

(defn- init [tween prop value]
  (prn "init")
  value)

(defn- step [tween prop start-value end-value inject-props]
  (prn "step"))

(defn- tween [tween prop value start-values end-values ratio wait end]
  (prn "tween")
  value)

(def TweenPlugin (js-obj
  "priority" 0
  "init" init
  "step" step
  "tween" tween))

(defn install-tween-plugin []
  (prn "install-tween-plugin")
  (.installPlugin (.-Tween js/createjs) TweenPlugin tween-properties))
