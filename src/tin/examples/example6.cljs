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
    :mouse-move-inside "move"}])

(def messages
  [(bunny 1 100 300) (bunny 2 300 300) (bunny 3 500 300)])

(def move-channel (chan))
(sub events "move" move-channel)

(defn update-position
  [key interaction-data]
  [:update key {:position (interaction-local-coordinates interaction-data)}
   :function (point-object-binary-function +)])

(defn example6 [render-channel input-channel]
  (put-messages! render-channel messages)
  (go
    (while true
      (let [{key :key {event :original-event :as data} :data} (<! move-channel)]
        (if (> (.-which event) 0) ; Mouse is down
          (put! render-channel (update-position key data)))))))
