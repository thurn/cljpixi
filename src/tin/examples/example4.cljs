(ns tin.examples.example4
  (:require
   [tin.examples.utils :refer [rand-between]]
   [tin.core :refer [point-binary-function]]
   [cljs.core.async :refer [put!]]))

(def ball-count 5000)

(defn ball-sprite [i]
  [:sprite
   (str "ball" i)
   [:texture [:image "resources/example4/bubble_32x32.png"]]
   {:position [:point 400, 300] :anchor [:point 0.5 0.5]}])

(defn ball-animation [i]
  (let [random-angle (* (rand) Math/PI 2)]
    [:animation (str "ball" i) {:loop true}
     [:tween {:position
              [:point
               (+ 400 (* 500 (Math/cos random-angle)))
               (+ 300 (* 500 (Math/sin random-angle)))]}
      :duration (rand-between 2000 4000)]]))

(def messages
  (into
   (mapv ball-sprite (range ball-count))
   (mapv ball-animation (range ball-count))))

(defn example4 [render-channel input-channel]
  (dorun (map #(put! render-channel %) messages)))
