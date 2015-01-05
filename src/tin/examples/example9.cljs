(ns tin.examples.example9
  (:require
   [tin.core :refer [put-messages! events]]
   [cljs.core.async :refer [put! chan sub]])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(def walk-right [[:texture [:frame "walk_right_1"]]
                 [:texture [:frame "walk_right_2"]]
                 [:texture [:frame "walk_right_3"]]])

(def walk-left [[:texture [:frame "walk_left_1"]]
                [:texture [:frame "walk_left_2"]]
                [:texture [:frame "walk_left_3"]]])

(def walk-up [[:texture [:frame "walk_up_1"]]
              [:texture [:frame "walk_up_2"]]
              [:texture [:frame "walk_up_3"]]])

(def walk-down [[:texture [:frame "walk_down_1"]]
                [:texture [:frame "walk_down_2"]]
                [:texture [:frame "walk_down_3"]]])

(def messages
  [[:load "resources/example9/orc.json"]
   [:stage-update {:events [[:tap :query {"player" [:position]}]]}]
   [:movie-clip "player" walk-right
    {:position [:point 100 100] :loop? true :animation-speed 0.2
     :scale [:point 5 5]}]
   [:animation "player" {} [:play-clip 0]]])

(def tap-channel (chan))
(sub events "tap" tap-channel)

(defn example9 [render-channel input-channel]
  (put-messages! render-channel messages)
  (go
    (while true
      (let [{identifier :identifier {{x "x"} "center"} :data} (<! tap-channel)]
        (prn x)
        (>! render-channel [:update "player" {:textures walk-left}])))))
