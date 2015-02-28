(ns tin.examples.example4
  (:require
   [tin.examples.utils :refer [rand-between]]
   [tin.new :refer [put-messages!]]))

(def ball-count 1000)

(defn ball-sprite [i]
  [:sprite
   (str "balls/" i)
   [:texture :image "resources/example4/bubble_32x32.png"]
   {:position [:point 400 300], :anchor [:point 0.5 0.5]}])

(defn ball-animation [i]
  (let [random-angle (* (rand) Math/PI 2)]
    [:animate (str "balls/" i) {:loop true}
     [:tween
      {:position
       [:point
        (+ 400 (* 500 (Math/cos random-angle)))
        (+ 300 (* 500 (Math/sin random-angle)))]}
      {:duration (rand-between 2000 4000)}]]))

(def messages
  (concat
   (list (into [:create] (map ball-sprite (range ball-count))))
   (map ball-animation (range ball-count))))

(defn example4 [engine]
  (put-messages! engine messages))
