(ns tin.examples.example10
  (:require
   [tin.new :refer [put-messages! subscribe-to-event!]]
   [cljs.core.async :refer [<! chan]])
  (:require-macros [cljs.core.async.macros :refer [go]]))
