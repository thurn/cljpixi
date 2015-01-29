(ns tin.examples.example2
  (:require
   [tin.examples.utils :refer [rand-between]]
   [tin.new :refer [put-messages!]]))

(def frames ["eggHead.png", "flowerTop.png", "helmlok.png", "skully.png"])

(defn- make-sprite
  []
  [:sprite "aliens" [:texture :frame (rand-nth frames)]
   {:anchor [:point 0.5 0.5]
    :position [:point (rand-between -400 400) (rand-between -300 300)]}])

(def messages
  [[:load "assets" "resources/example2/SpriteSheet.json"
    [:then
     [:render
      (into [:container "container" {:position [:point 400 300]}]
            (repeatedly 100 make-sprite))]
     [:animate "aliens" {:loop? true}
      [:tween {:rotation (* 2 Math/PI)}]]
     [:animate "container" {:loop? true}
      [:tween {:scale [:point 0.1 0.1]}
       {:duration 3000 :ease #(Math/sin (* Math/PI %))}]]
     [:animate "container" {:loop? true}
      [:tween {:rotation (* Math/PI 2)} {:duration 20000}]]]]])

(defn example2 [engine]
  (put-messages! engine messages))
