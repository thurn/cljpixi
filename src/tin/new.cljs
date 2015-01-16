(ns tin.core
  (:require
   [tin.ease]
   [tin.tween-plugin]
   [tin.events :refer [impersonate-dom-node!]]
   [clojure.set :refer [union]]
   [clojure.string]
   [cljs.core.async :refer [<! >! chan close! sliding-buffer put!
                            alts! timeout pub]]
   [cljs.core.match] :refer [match]))

(enable-console-print!)

(def ^:private channel-buffer-size 65536)

(defrecord Engine
  [stage renderer display-objects event-channel render-channel view])

(defn new-engine
  "Constructor function for the Engine record type. Keys:

    - stage: The Pixi.js Stage object which coordinates all on-screen drawing.
    - renderer: The Pixi.js Renderer object, which draws objects to the canvas.
    - display-objects: A tree of objects added to the engine indexed by
      identifier.
    - event-channel: The channel on which all user input events are published.
    - render-channel: The cannel onto which rendering messages should be
      published.
    - view: The canvas DOM node which the renderer will draw to.
    - dispatch-map: A map used to process incoming render channel messages,
      mapping the initial keyword in the message to a processing function."
  [& {:keys [stage renderer display-objects event-channel render-channel view
             dispatch-map]}]
  (Engine. stage renderer display-objects event-channel render-channel view
           dispatch-map))

(defrecord EngineConfiguration
  [width height background-color view transparent? antialias? interactive?])

(defn new-engine-configuration
  "Constructor function for the EngineConfiguration record type. Keys:

    - width: Target width for the canvas node to draw to. Default: 500px.
    - height: Target height for the canvas. Default: 500px.
    - background-color: Default color for the canvas. Default: 0xFFFFFF.
    - view: Optionally, a canvas node for the renderer to draw to.
    - transparent?: Set to true to make the rendered view transparent.
    - antialias?: Set to true to render with antialiasing (Chrome-only).
    - interactive?: Whether the stage should process user input events.
      Default: true."
  [& {:keys [width height background-color view transparent? antialias?
             interactive?]}]
  (EngineConfiguration. (or width 500) (or height 500)
                        (or background-color 0xFFFFFF) view transparent?
                        antialias? (or interactive? true)))

(def ^:private last-timestamp
  "The relative timestamp at which the animate loop last ran."
  (atom nil))

(defn- animate-loop
  "Invokes an animation loop function repeatedly via requestAnimationFrame."
  [engine]
  (defn- animate-loop-fn [timestamp]
    (js/requestAnimFrame animate-loop-fn)
    (.tick (.-Tween js/createjs)
           (- timestamp (or @last-timestamp timestamp)))
    (.render (:renderer engine) (:stage engine))
    (reset! last-timestamp timestamp))
  (js/requestAnimFrame animate-loop-fn))

(defn render-message-loop
  [{:as engine render-channel :render-channel dispatch-map :dispatch-map}]
  (go
    (loop [message (<! render-channel)]
      (let [result ((dispatch-map (first message)) engine message)]
        (match result
               {:chan chan} (<! chan)
               :else nil)
        (recur (<! render-channel))))))

(defn initialize
  "Takes an EngineConfiguration and creates a new Engine instance. You should
  call this function only after all necessary Javascript libraries have finished
  loading. A canvas node to render to can be passed to EngineConfiguration,
  otherwise, a new one will be instantiated, returned, and must be added to
  the DOM. Refer to the documentation for Engine and EngineConfiguration for
  more information."
  [config]
  (tin.tween-plugin/install-tween-plugin)
  (let [Stage (.-Stage js/PIXI)
        stage (Stage. (:background-color config) (:interactive? config))
        renderer (.autoDetectRenderer js/PIXI (:width config) (:height config)
                                      (:view config) (:transparent? config)
                                      (:antialias? config))
        engine (new-engine :stage stage :renderer renderer :display-objects {}
                           :event-channel (chan channel-buffer-size)
                           :render-channel (chan channel-buffer-size)
                           :view (.-view renderer))]
    (animate-loop engine)
    (render-message-loop engine)
    engine))
