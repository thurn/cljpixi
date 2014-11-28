(ns tin.examples.example4
  (:require
   [tin.core :refer [point-binary-function]]
   [tin.examples.example-utils :refer [rand-between]]
   [cljs.core.async :refer [put!]]))

(def star-count 5000)

(defn ball-sprite [i]
  [:sprite
   (str "ball" i)
   [:texture [:image "resources/example4/bubble_32x32.png"]]
   {:position [:point 400, 300] :anchor [:point 0.5 0.5]}])

(defn ball-animation [i]
  (let [random-angle (* (rand) Math/PI 2)]
    [:animation (str "ball" i) {:loop true}
     [:tween :position
      {:x (+ 400 (* 500 (Math/cos random-angle)))
       :y (+ 300 (* 500 (Math/sin random-angle)))}
      :duration (rand-between 2000 4000)]]))

(def messages
  (into
   (mapv ball-sprite (range star-count))
   (mapv ball-animation (range star-count))))

(defn example4 [render-channel input-channel]
  (dorun (map #(put! render-channel %) messages)))
