(ns tin.examples.example5
  (:require
   [tin.new :refer [subscribe-to-events! put-messages!]]
   [cljs.core.async :refer [chan <!]])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(def mouse-events (chan))

(defn button [i x y]
  [:sprite (str "buttons/" i) [:texture :image "resources/example5/button.png"]
   {:button-mode? true, :anchor [:point 0.5 0.5], :position [:point x y]}])

(def messages
  [
   [:create (button 1 400 100) (button 2 400 300) (button 3 400 500)]
   [:publish "buttons" [:mouse-over]]
   [:publish "buttons" [:mouse-out]]
   [:publish "buttons" [:click-start]]
   [:publish "buttons" [:click-end]]])

(defn set-texture [identifier name]
  [:update identifier
   {:texture [:texture :image (str "resources/example5/" name ".png")]}])

(defn example5
  [{render-channel :render-channel :as engine}]
  (put-messages! engine messages)
  (let [channel (chan)]
    (subscribe-to-events! engine channel
                          :events [:mouse-over :mouse-out :click-start
                                   :click-end]
                          :identifiers ["buttons"])
    (go
      (while true
        (let [{identifier :identifier event :event-name} (<! channel)]
          (case event
            :mouse-over
              (>! render-channel (set-texture identifier "buttonOver"))
            :mouse-out
              (>! render-channel (set-texture identifier "button"))
            :click-start
              (>! render-channel (set-texture identifier "buttonDown"))
            :click-end
              (>! render-channel (set-texture identifier "buttonOver"))))))))
