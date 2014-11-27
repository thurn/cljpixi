(ns tin.examples
  (:require
   [tin.core :refer [initialize]]
   [tin.examples.example4 :refer [example4]]))

(defn ^:export main []
  (let [{view :view render-channel :render input-channel :input}
        (initialize :width 800 :height 600 :background-color 0x0)]
    (.appendChild (.-body js/document) view)
    (example4 render-channel input-channel)))
