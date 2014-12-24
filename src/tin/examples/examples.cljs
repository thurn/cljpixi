(ns tin.examples
  (:require
   [tin.core :refer [initialize events]]
   [tin.examples.example1 :refer [example1]]
   [tin.examples.example2 :refer [example2]]
   [tin.examples.example3 :refer [example3]]
   [tin.examples.example4 :refer [example4]]
   [tin.examples.example5 :refer [example5]]
   [tin.examples.example6 :refer [example6]]
   [tin.examples.example7 :refer [example7]]
   [tin.examples.example8 :refer [example8]]
   [tin.examples.example9 :refer [example9]]
   [cljs.core.async :refer [put!]]))

(defn ^:export main []
  (let [{view :view render-channel :render input-channel :input}
        (initialize :width 800 :height 600 :background-color 0x0)
        change-example (fn []
                         (put! render-channel [:clear])
                         (case (.-hash js/location)
                           "" nil
                           "#example1" (example1 render-channel
                                                 input-channel)
                           "#example2" (example2 render-channel
                                                 input-channel)
                           "#example3" (example3 render-channel
                                                 input-channel)
                           "#example4" (example4 render-channel
                                                 input-channel)
                           "#example5" (example5 render-channel
                                                 input-channel)
                           "#example6" (example6 render-channel
                                                 input-channel)
                           "#example7" (example7 render-channel
                                                 input-channel)
                           "#example8" (example8 render-channel
                                                 input-channel)
                           "#example9" (example9 render-channel
                                                 input-channel)))]
    (.appendChild (.-body js/document) view)
    (set! (.-onhashchange js/window) change-example)
    (change-example)))
