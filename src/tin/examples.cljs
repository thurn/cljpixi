(ns tin.examples
  (:require
   [tin.core :refer [initialize events]]
   [tin.examples.example4 :refer [example4]]
   [tin.examples.example5 :refer [example5]]))

(defn ^:export main []
  (let [{view :view render-channel :render input-channel :input}
        (initialize :width 800 :height 600 :background-color 0x0)]
    (.appendChild (.-body js/document) view)
    (example5 render-channel input-channel)))
