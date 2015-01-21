(ns tin.examples
  (:require
   [tin.new :refer [initialize new-engine-configuration]]
   [tin.examples.example1 :refer [example1]]
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
      )))

(defn ^:export main []
  (let [engine (initialize (new-engine-configuration :width 800 :height 600
                                                     :background-color 0x0))]
    (.appendChild (.-body js/document) (:view engine))
    (set! (.-onhashchange js/window) (change-example-fn engine))
    ((change-example-fn engine))))
