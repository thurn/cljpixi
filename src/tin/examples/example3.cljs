(ns tin.examples.example3
  (:require
   [tin.examples.utils :refer [rand-between]]
   [tin.new :refer [put-messages!]]))

(defn make-texture
  [i] [:texture :frame (str "Explosion_Sequence_A " i ".png")])

(defn make-movie-clip
  [i]
  (let [scale (rand-between 0.75 1.5)]
    [:movie-clip (str "explosions/" i) (map make-texture (range 1 27))
     {:position [:point (rand-int 800) (rand-int 600)],
      :rotation (rand-int Math/PI), :anchor [:point 0.5 0.5],
      :scale [:point scale scale], :loop? true}]))

(defn make-animation
  [i]
  [:animate (str "explosions/" i) {} [:play-clip (rand-between 1 27)]])

(def messages
  [[:load "assets" "resources/example3/SpriteSheet.json"
    (into [:then]
          (concat
           (list (into [:create] (map make-movie-clip (range 50))))
           (map make-animation (range 50))))]])

(defn example3 [engine]
  (put-messages! engine messages))
