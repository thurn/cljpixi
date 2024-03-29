(ns tin.examples
  (:require
   [tin.new :refer [initialize new-engine-configuration
                    clear-all-event-listeners!]]
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

(defn change-example-fn
  "Returns a function which switches the current example based on the current
  URL hash."
  [{render-channel :render-channel :as engine}]
  (fn []
    (clear-all-event-listeners! engine)
    (put! render-channel [:clear])
    (case (.-hash js/location)
      "" nil
      "#example1" (example1 engine)
      "#example2" (example2 engine)
      "#example3" (example3 engine)
      "#example4" (example4 engine)
      "#example5" (example5 engine)
      "#example6" (example6 engine)
      "#example7" (example7 engine)
      "#example8" (example8 engine)
      "#example9" (example9 engine)
      )))

(defn ^:export main []
  (let [engine (initialize (new-engine-configuration :width 800 :height 600
                                                     :background-color 0x0))]
    (.appendChild (.-body js/document) (:view engine))
    (set! (.-onhashchange js/window) (change-example-fn engine))
    ((change-example-fn engine))))
