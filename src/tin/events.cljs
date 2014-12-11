(ns tin.events)

(defn- add-event-listener
  [type listener]
  (this-as
   this
   (set! (.-eventListeners this)
         (update-in (.-eventListeners this) [type] (fnil conj #{}) listener))))

(defn- remove-event-listener
  [type listener]
  (this-as
   this
   (set! (.-eventListeners this) (disj (.-eventListeners this) listener))))

(defn- event-function
  [object type]
  (fn [interaction-data]
    (doseq [listener ((.-eventListeners object) type)]
      (listener (.-originalEvent interaction-data)))))

(defn impersonate-dom-node!
  "Gives a Pixi Sprite object just enough properties to pretend to be a DOM node
   so that hammer.js will be able to attach gesture recognizers to it."
  [object]
  (set! (.-interactive object) true)
  (set! (.-eventListeners object) {})
  (set! (.-ownerDocument object) (.-document js/window))
  (set! (.-style object) (js* "{}"))
  (set! (.-addEventListener object) add-event-listener)
  (set! (.-removeEventListener object) add-event-listener)
  (set! (.-mousedown object) (event-function object "mousedown"))
  (set! (.-mouseup object) (event-function object "mouseup"))
  (set! (.-mousemove object) (event-function object "mousemove"))
  (set! (.-touchstart object) (event-function object "touchstart"))
  (set! (.-touchmove object) (event-function object "touchmove"))
  (set! (.-touchend object) (event-function object "touchend")))