(ns tin.examples.example6
  (:require
   [tin.core :refer [events put-messages! interaction-coordinates
                     interaction-global-coordinates]]
   [cljs.core.async :refer [<! >! chan sub]])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(defn bunny [i x y]
  [:sprite (str "bunny" i)
   [:texture [:image "resources/example6/bunny.png"]]
   {:anchor [:point 0.5 0.5] :scale [:point 3.0 3.0] :position [:point x y]
    :mouse-move "move"}])

(def messages
  [(bunny 1 100 300) (bunny 2 300 300) (bunny 3 500 300)])

(def move-channel (chan))
(sub events "move" move-channel)

(defn example6 [render-channel input-channel]
  (put-messages! render-channel messages)
  (go
    (while true
      (let [{key :key data :data} (<! move-channel)]
        (prn "local to key" key  (interaction-coordinates key data))
        (prn "global" (interaction-global-coordinates data))))))
