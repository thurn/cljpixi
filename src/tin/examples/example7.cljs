(ns tin.examples.example7
  (:require
   [tin.new :refer [put-messages! point-binary-function]]))

(def messages
  [[:render
    [:tiling-sprite "tiling-sprite"
     [:texture :image "resources/example7/p2.jpeg"] 800 600]]
   [:animate "tiling-sprite" {:loop true}
    [:tween {:tile-position [:point 5000 5000]}
     {:duration 50000 :function (point-binary-function +)}]]])

(defn example7 [engine]
  (put-messages! engine messages))
