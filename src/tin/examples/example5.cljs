(ns tin.examples.example5
  (:require
   [tin.core :refer [events]]
   [cljs.core.async :refer [put! chan sub]])
  (:require-macros [cljs.core.async.macros :refer [go alt!]]))

(defn button [i x y]
  [:sprite (str "button" i) [:texture [:image "resources/example5/button.png"]]
   {:button-mode? true, :anchor [:point 0.5 0.5], :position [:point x y],
    :events [[:mouse-over] [:mouse-out] [:click-start] [:click-end]]}])

(def messages [(button 1 400 100) (button 2 400 300) (button 3 400 500)])

(defn set-texture [identifier name]
  [:update identifier
   {:texture [:texture [:image (str "resources/example5/" name ".png")]]}])

(def click-start-channel (chan))
(sub events "click-start" click-start-channel)
(def click-end-channel (chan))
(sub events "click-end" click-end-channel)
(def mouse-over-channel (chan))
(sub events "mouse-over" mouse-over-channel)
(def mouse-out-channel (chan))
(sub events "mouse-out" mouse-out-channel)

(defn example5 [render-channel input-channel]
  (dorun (map #(put! render-channel %) messages))
  (go
    (while true
      (alt!
        click-start-channel
        ([{identifier :identifier}] (>! render-channel
                                        (set-texture identifier "buttonDown")))
        click-end-channel
        ([{identifier :identifier}] (>! render-channel
                                        (set-texture identifier "buttonOver")))
        mouse-over-channel
        ([{identifier :identifier}] (>! render-channel
                                        (set-texture identifier "buttonOver")))
        mouse-out-channel
        ([{identifier :identifier}] (>! render-channel
                                        (set-texture identifier "button")))))))
