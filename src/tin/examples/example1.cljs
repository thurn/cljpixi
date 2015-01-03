(ns tin.examples.example1
  (:require
   [tin.core :refer [put-messages! point-binary-function]]))

(defn example1 [render-channel input-channel]
  (let [messages
        [[:load "resources/example1/bunny.png"]
         [:sprite "spinning-bunny"
          [:texture [:frame "resources/example1/bunny.png"]]
          {:anchor [:point 0.5 0.5] :position [:point 400 300]}]
         [:sprite "moving-bunny"
          [:texture [:frame "resources/example1/bunny.png"]]
          {:anchor [:point 0.5 0.5] :position [:point 50 50]}]
         [:animation "spinning-bunny" {:loop true}
          [:tween {:rotation (* 2 Math/PI)} :duration 1000]]
         [:animation "moving-bunny" {:loop true}
          [:tween {:position [:point 500 500] :rotation (* 2 Math/PI)
                   :scale [:point 2 2]}
           :duration 5000
           :function {:position (point-binary-function +)}]]]]
    (put-messages! render-channel messages)))
