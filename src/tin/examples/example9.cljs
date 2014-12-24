(ns tin.examples.example9
  (:require
   [tin.core :refer [put-messages!]]))

(def messages
  [[:load "resources/example9/orc.json"]
   [:movie-clip "walk" [[:texture [:frame "walk_right_1"]]
                        [:texture [:frame "walk_right_2"]]
                        [:texture [:frame "walk_right_3"]]]
    {:position [:point 100 100] :loop? true :animation-speed 0.2
     :scale [:point 5 5]}]
   [:animation "walk" {} [:play-clip 0]]])

(defn example9 [render-channel input-channel]
  (put-messages! render-channel messages))
