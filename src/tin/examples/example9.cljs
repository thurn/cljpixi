(ns tin.examples.example9
  (:require
   [tin.core :refer [put-messages!]]))

(def messages
  [[:load "resources/example9/orc.json"]
   [:movie-clip "walk_right" [[:texture [:frame "walk_right_1"]]
                              [:texture [:frame "walk_right_2"]]
                              [:texture [:frame "walk_right_3"]]]
    {:position [:point 100 100] :loop? true :animation-speed 0.2
     :scale [:point 5 5]}]
   [:movie-clip "walk_down" [[:texture [:frame "walk_down_1"]]
                             [:texture [:frame "walk_down_2"]]
                             [:texture [:frame "walk_down_3"]]]
    {:position [:point 200 100] :loop? true :animation-speed 0.2
     :scale [:point 5 5]}]
   [:movie-clip "walk_left" [[:texture [:frame "walk_left_1"]]
                             [:texture [:frame "walk_left_2"]]
                             [:texture [:frame "walk_left_3"]]]
    {:position [:point 300 100] :loop? true :animation-speed 0.2
     :scale [:point 5 5]}]
   [:movie-clip "walk_up" [[:texture [:frame "walk_up_1"]]
                           [:texture [:frame "walk_up_2"]]
                           [:texture [:frame "walk_up_3"]]]
    {:position [:point 400 100] :loop? true :animation-speed 0.2
     :scale [:point 5 5]}]
   [:animation "walk_right" {} [:play-clip 0]]
   [:animation "walk_down" {} [:play-clip 0]]
   [:animation "walk_left" {} [:play-clip 0]]
   [:animation "walk_up" {} [:play-clip 0]]
   ])

(defn example9 [render-channel input-channel]
  (put-messages! render-channel messages))
