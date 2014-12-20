(ns tin.examples.example8
  (:require
   [tin.core :refer [put-messages! point-binary-function]])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(def messages
  [[:text "hello"
    "Hello, World"
    {:font "bold 60px Arial" :fill "#cc00ff" :align "center" :stroke "#FFFFFF"
     :stroke-thickness 20 :anchor [:point 0.5 0.5] :position [:point 50 50]}]])

(defn example8 [render-channel input-channel]
  (put-messages! render-channel messages))
