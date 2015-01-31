(ns tin.examples
  (:require
   [tin.new :refer [initialize new-engine-configuration]]
   [tin.examples.example1 :refer [example1]]
   [tin.examples.example2 :refer [example2]]
   [tin.examples.example3 :refer [example3]]
   [tin.examples.example4 :refer [example4]]
   [cljs.core.async :refer [put!]]))

(defn change-example-fn
  "Returns a function which switches the current example based on the current
  URL hash."
  [{render-channel :render-channel :as engine}]
  (fn []
    (put! render-channel [:clear])
    (case (.-hash js/location)
      "" nil
      "#example1" (example1 engine)
      "#example2" (example2 engine)
      "#example3" (example3 engine)
      "#example4" (example4 engine)
      )))

(defn ^:export main []
  (let [engine (initialize (new-engine-configuration :width 800 :height 600
                                                     :background-color 0x0))]
    (.appendChild (.-body js/document) (:view engine))
    (set! (.-onhashchange js/window) (change-example-fn engine))
    ((change-example-fn engine))))
