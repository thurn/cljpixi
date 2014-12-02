(ns tin.examples.example1
  (:require
   [tin.core :refer [put-messages! point-binary-function]]))

(defn example1 [render-channel input-channel]
  (let [messages
        [[:load "resources/example1/bunny.png"]
         [:sprite :spinning-bunny
          [:texture [:frame "resources/example1/bunny.png"]]
          {:anchor [:point 0.5 0.5] :position [:point 400 300]}]
         [:sprite :moving-bunny
          [:texture [:frame "resources/example1/bunny.png"]]
          {:anchor [:point 0.5 0.5] :position [:point 50 50]}]
         [:animation :spinning-bunny {:loop true}
          [:tween :rotation (* 2 Math/PI) {:duration 1000}]]
         [:animation :moving-bunny {:loop true}
          [:tween :position {:x 500 :y 500} :duration 5000
           :function (point-binary-function +)]]]]
    (put-messages! render-channel messages)))
