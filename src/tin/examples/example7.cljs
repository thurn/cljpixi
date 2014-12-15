(ns tin.examples.example7
  (:require
   [tin.core :refer [put-messages! point-binary-function]])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(def messages
  [[:tiling-sprite "tiling-sprite"
    [:texture [:image "resources/example7/p2.jpeg"]]
    800 600]])

(defn example7 [render-channel input-channel]
  (put-messages! render-channel messages))
