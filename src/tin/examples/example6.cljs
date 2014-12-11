(ns tin.examples.example6
  (:require
   [tin.core :refer [events put-messages! interaction-local-coordinates
                     point-object-binary-function]]
   [cljs.core.async :refer [<! >! chan sub put!]])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(defn bunny [i x y]
  [:sprite (str "bunny" i)
   [:texture [:image "resources/example6/bunny.png"]]
   {:anchor [:point 0.5 0.5] :scale [:point 3.0 3.0] :position [:point x y]
    :recognizers [[:pan]]}])

(def pan-channel (chan))
(sub events "pan" pan-channel)

(def messages
  [(bunny 1 100 300)
   (bunny 2 300 300)
   (bunny 3 500 300)])

(defn example6 [render-channel input-channel]
  (put-messages! render-channel messages)
  (go
    (while true
      (let [{{x "deltaX" y "deltaY"} :data key :key} (<! pan-channel)]
        (prn key x y)
        (>! render-channel [:update key {:position [:point x y]}])))))
