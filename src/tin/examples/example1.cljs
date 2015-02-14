(ns tin.examples.example1
  (:require
   [tin.new :refer [put-messages! point-binary-function on-event]]
   [cljs.core.async :refer [chan]])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(def messages
  [
   [:load "assets/bunny" "resources/example1/bunny.png"
    [:then
     [:render
      [:sprite "bunnies/spinning"
       [:texture :frame "resources/example1/bunny.png"]
       {:anchor [:point 0.5 0.5] :position [:point 400 300]}]
      [:sprite "bunnies/moving"
       [:texture :frame "resources/example1/bunny.png"]
       {:anchor [:point 0.5 0.5] :position [:point 50 50]}]]
     [:animate "bunnies/spinning" {:loop? true}
      [:tween {:rotation (* 2 Math/PI)}]]
     [:animate "bunnies/moving" {:loop? true}
      [:tween {:rotation (* 2 Math/PI) :scale [:point 2 2]} {:duration 5000}]]
     [:animate "bunnies/moving" {:loop? true}
      [:tween {:position [:point 500 500]}
       {:duration 5000, :function (point-binary-function +)}]]]]])

(defn example1 [engine]
  (put-messages! engine messages)
  (on-event engine :load "assets/bunny" #(prn "load finished"))
  (prn "loading"))
