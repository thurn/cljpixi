(ns tin.examples
  (:require
   [tin.core :refer [initialize events]]
   [tin.examples.example1 :refer [example1]]
   [tin.examples.example2 :refer [example2]]
   [tin.examples.example3 :refer [example3]]
   [tin.examples.example4 :refer [example4]]
   [tin.examples.example5 :refer [example5]]
   [tin.examples.example6 :refer [example6]]))

(defn ^:export main []
  (let [{view :view render-channel :render input-channel :input}
        (initialize :width 800 :height 600 :background-color 0x0)]
    (.appendChild (.-body js/document) view)
    (example6 render-channel input-channel)))
