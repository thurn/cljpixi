(ns tin.examples.example5
  (:require
   [tin.core :refer [events]]
   [cljs.core.async :refer [put! chan sub]])
  (:require-macros [cljs.core.async.macros :refer [go alt!]]))

(defn button [i x y]
  [:sprite (str "button" i) [:texture [:image "resources/example5/button.png"]]
   {:button-mode? true, :anchor [:point 0.5 0.5], :position [:point x y],
    :mouse-down "button-mouse-down" :mouse-up "button-mouse-up"
    :mouse-over "button-mouse-over" :mouse-out "button-mouse-out"}])

(def messages [(button 1 400 100) (button 2 400 300) (button 3 400 500)])

(defn set-texture [key name]
  [:update key
   {:texture [:texture [:image (str "resources/example5/" name ".png")]]}])

(def mouse-down-channel (chan))
(sub events "button-mouse-down" mouse-down-channel)
(def mouse-up-channel (chan))
(sub events "button-mouse-up" mouse-up-channel)
(def mouse-over-channel (chan))
(sub events "button-mouse-over" mouse-over-channel)
(def mouse-out-channel (chan))
(sub events "button-mouse-out" mouse-out-channel)

(defn dir [obj]
  (js* "console.dir(obj);"))

(defn example5 [render-channel input-channel]
  (dorun (map #(put! render-channel %) messages))
  (go
    (while true
      (alt!
        mouse-down-channel
        ([{key :key}] (>! render-channel (set-texture key "buttonDown")))
        mouse-up-channel
        ([{key :key}] (>! render-channel (set-texture key "buttonOver")))
        mouse-over-channel
        ([{key :key}] (>! render-channel (set-texture key "buttonOver")))
        mouse-out-channel
        ([{key :key}] (>! render-channel (set-texture key "button")))))))
