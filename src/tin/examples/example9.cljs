(ns tin.examples.example9
  (:require
   [tin.new :refer [put-messages! subscribe-to-event!]]
   [cljs.core.async :refer [<! chan]])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(def walk-right [[:texture :frame "walk_right_1"]
                 [:texture :frame "walk_right_2"]
                 [:texture :frame "walk_right_3"]])

(def walk-left [[:texture :frame "walk_left_1"]
                [:texture :frame "walk_left_2"]
                [:texture :frame "walk_left_3"]])

(def walk-up [[:texture [:frame "walk_up_1"]]
              [:texture [:frame "walk_up_2"]]
              [:texture [:frame "walk_up_3"]]])

(def walk-down [[:texture [:frame "walk_down_1"]]
                [:texture [:frame "walk_down_2"]]
                [:texture [:frame "walk_down_3"]]])

(def messages
  [[:load "assets" "resources/example9/orc.json"
    [:then
     [:create
      [:movie-clip "player" walk-right
       {:position [:point 100 100], :loop? true, :anchor [:point 0.5 0.5],
        :animation-speed 0.2, :scale [:point 5 5]}]]
     [:publish "$stage" [:tap]]]]])

(defn example9 [{render-channel :render-channel :as engine}]
  (put-messages! engine messages)
  (let [channel (chan)]
    (subscribe-to-event! engine channel
                         :event-name :tap
                         :identifier "$stage"
                         :query {"player" [:position]})
    (go (while true
          (let [{event-data :event-data query-result :query-result} (<! channel)
                {[:point_ tapped-x _] :center} event-data
                {{[:point_ current-x _] :position} "player"} query-result]
            (>! render-channel
                [:messages
                 [:update "player"
                  {:textures (if (> current-x tapped-x) walk-left walk-right)}]
                 [:perform "player" {}
                  [:play-clip]
                  [:tween {:position [:point tapped-x 100]}
                   {:duration (Math/abs (* 3 (- current-x tapped-x)))}]
                  [:stop-clip]]]))))))
