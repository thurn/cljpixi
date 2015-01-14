(ns tin.core
  (:require
   [tin.ease]
   [tin.tween-plugin]
   [tin.events :refer [impersonate-dom-node!]]
   [clojure.set :refer [union]]
   [clojure.string]
   [cljs.core.async :refer [<! >! chan close! sliding-buffer put!
                            alts! timeout pub]]
   [cljs.core.match]))

(enable-console-print!)

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
    - view: The canvas DOM node which the renderer will draw to."
  [& {:keys [stage renderer display-objects event-channel render-channel view]}]
  (Engine. stage renderer display-objects event-channel render-channel view))

(defrecord EngineConfiguration
  [width height background-color view transparent? antialias?])

(defn new-engine-configuration
  "Constructor function for the EngineConfiguration record type. Keys:

    - width: Target width for the canvas node to draw to. Default: 500px.
    - height: Target height for the canvas. Default: 500px.
    - background-color: Default color for the canvas. Default: 0xFFFFFF.
    - view: Optionally, a canvas node for the renderer to draw to.
    - transparent?: Set to true to make the rendered view transparent.
    - antialias?: Set to true to render with antialiasing (Chrome-only)."
  [& {:keys [width height background-color view transparent? antialias?]}]
  (EngineConfiguration. width height background-color view transparent?
                        antialias))

(defn initialize
  "Takes an EngineConfiguration and creates a new Engine instance. You should
  call this function only after all necessary Javascript libraries have finished
  loading. A canvas node to render to can be passed to EngineConfiguration,
  otherwise, a new one will be instantiated, returned, and must be added to
  the DOM. Refer to the documentation for Engine and EngineConfiguration for
  more information."
  [engine-configuration])
