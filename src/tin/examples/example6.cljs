(ns tin.examples.example6
  (:require
   [tin.new :refer [put-messages! subscribe-to-event!]]
   [cljs.core.async :refer [<! chan]])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(defn bunny [x y]
  [:sprite "bunnies"
   [:texture :image "resources/example6/bunny.png"]
   {:anchor [:point 0.5 0.5] :scale [:point 3.0 3.0] :position [:point x y]}])

(def messages
  [
   [:render
    [:container "container" {:position [:point 100 50]}
     (bunny 0 100)
     (bunny 200 100)
     (bunny 400 100)]]
   [:publish "bunnies" [:pan]]])

(defn example6 [{render-channel :render-channel :as engine}]
  (put-messages! engine messages)
  (let [channel (chan)]
    (subscribe-to-event! engine channel
                         :event-name :pan
                         :identifier "bunnies")
    (go
      (while true
        (let [event (<! channel)]
          (prn (:center (:event-data event))))))))

;; (defn bunny [i x y]
;;   [:sprite (str "bunny" i)
;;    [:texture [:image "resources/example6/bunny.png"]]
;;    {:anchor [:point 0.5 0.5] :scale [:point 3.0 3.0] :position [:point x y]
;;     :events [[:pan]]}])

;; (def pan-channel (chan))
;; (sub events "pan" pan-channel)

;; (def messages
;;   [(bunny 1 100 300)
;;    (bunny 2 300 300)
;;    (bunny 3 500 300)])

;; (defn example6 [render-channel input-channel]
;;   (put-messages! render-channel messages)
;;   (go
;;     (while true
;;       (let [{{{center-x "x" center-y "y"} "center"} :data
;;              transform :transform
;;              identifier :identifier} (<! pan-channel)
;;              coordinates (local-coordinates nil
;;                           [:point center-x center-y] transform)]
;;         (>! render-channel [:update identifier {:position coordinates}])))))
