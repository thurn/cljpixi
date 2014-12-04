(ns tin.examples.example3
  (:require
   [tin.examples.utils :refer [rand-between]]
   [tin.core :refer [put-messages!]]))

(defn example3 [render-channel input-channel]
  (let [make-texture
        (fn [i] [:texture [:frame (str "Explosion_Sequence_A " i ".png")]])
        make-movie-clip
        (fn [i]
          (let [scale (rand-between 0.75 1.5)]
            [:movie-clip (str "explosion" i) (map make-texture (range 1 27))
             {:position [:point (rand-int 800) (rand-int 600)]
              :rotation (rand-int Math/PI) :anchor [:point 0.5 0.5]
              :scale [:point scale scale] :loop? true}]))
        make-animation
        (fn [i]
          [:animation (str "explosion" i) {} [:play-clip (rand-between 1 27)]])
        messages
        [[:load "resources/example3/SpriteSheet.json"]
         (into [:messages] (map make-movie-clip (range 50)))
         (into [:messages] (map make-animation (range 50)))]]
  (put-messages! render-channel messages)))
