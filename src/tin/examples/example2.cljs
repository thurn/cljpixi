(ns tin.examples.example2
  (:require
   [tin.examples.utils :refer [rand-between]]
   [tin.core :refer [put-messages!]]))

(def example2-sprites
  (let [frames ["eggHead.png", "flowerTop.png", "helmlok.png", "skully.png"]
        container [:container :aliens {:position [:point 400 300]}]
        make-sprite (fn []
                      [:sprite :alien
                       [:texture [:frame (rand-nth frames)]]
                       {:anchor [:point 0.5 0.5]
                        :position [:point (rand-between -400 400)
                                   (rand-between -300 300)]}])]
    (into container (repeatedly 100 make-sprite))))

(defn example2 [render-channel input-channel]
  (let [messages
        [[:load "resources/example2/SpriteSheet.json"]
         example2-sprites
         [:animation :alien {:loop true}
          [:tween :rotation (* 2 Math/PI) :duration 1000]]
         [:animation :aliens {:loop true}
          [:tween :scale {:x 0.1 :y 0.1} :duration 3000
           :ease #(Math/sin (* Math/PI %))]]
         [:animation :aliens {:loop true}
          [:tween :rotation (* Math/PI 2) :duration 20000]]]]
    (put-messages! render-channel messages)))
