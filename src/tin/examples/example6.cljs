(ns tin.examples.example6
  (:require
   [tin.core :refer [events put-messages! interaction-local-coordinates
                     point-object-binary-function]]
   [cljs.core.async :refer [<! >! chan sub put!]])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(defn bunny [i x y]
  [:sprite (str "bunny" i)
   [:texture [:image "resources/example6/bunny.png"]]
   {:anchor [:point 0.5 0.5] :scale [:point 3.0 3.0] :position [:point x y]}])

;; TODO - make these functions take original position at start of drag
(defn draggable-vertical
  "Only allows an object to be dragged in the Y axis."
  [[:point old-x old-y] [:point new-x new-y]]
  [:point old-x new-y])

(defn draggable-orthogonal
  "Only allows an object to be dragged in an axial direction."
  [[:point old-x old-y] [:point new-x new-y]]
  (prn "old" old-x "," old-y)
  (prn "new" new-x "," new-y)
  (if (> (Math/abs (- old-x new-x)) (Math/abs (- old-y new-y)))
    [:point new-x old-y]
    [:point old-x new-y]))

(def messages
  [(bunny 1 100 300)
   (bunny 2 300 300)
   (bunny 3 500 300)
   [:animation "bunny1" {} [:draggable]]
   [:animation "bunny2" {} [:draggable :function draggable-vertical]]
   [:animation "bunny3" {} [:draggable :function draggable-orthogonal]]])

(defn example6 [render-channel input-channel]
  (put-messages! render-channel messages))
