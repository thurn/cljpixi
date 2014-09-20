(ns tin.core)
(enable-console-print!)

(defrecord Point [x y])

(defrecord Rectangle [x y width height])

(defrecord Circle [x y radius])

(defrecord Ellipse [x y width height])

(defrecord Polygon [points])

(defrecord Stage [display-object background-color])

(defrecord DisplayObject [alpha button-mode default-cursor filter-area filters
  hit-area interactive mask  pivot position renderable? rotation scale visible?
  x y])

(defrecord DisplayObjectContainer [height width display-object])

(defrecord Sprite [anchor blend-mode texture tint display-object-container])

(defrecord MovieClip [animation-speed loop textures sprite])

(defrecord BaseTexture [scale-mode source])

(defrecord Texture [base-texture frame height trim width])

(defrecord Text [text style canvas context sprite])

(defrecord TilingSprite [texture width height tile-position tile-scale tile-scale-offset sprite])

(defn set-properties [map object]
  "Takes a pixi.js object and sets values from the map as properties on the
   object when they correspond to known properties."
  (doseq [key value]

(defn ^:export main []
  (def Stage (.-Stage js/PIXI))
  (def Texture (.-Texture js/PIXI))
  (def Sprite (.-Sprite js/PIXI))

  (def stage (Stage. 0x66FF99))
  (def renderer (.autoDetectRenderer js/PIXI 400 300))
  (.appendChild (.-body js/document) (.-view renderer))

  (def texture (.fromImage Texture "bunny.png"))
  (def bunny (Sprite. texture))
  (set! (.-x (.-anchor bunny)) 0.5)
  (set! (.-y (.-anchor bunny)) 0.5)
  (set! (.-x (.-position bunny)) 200)
  (set! (.-y (.-position bunny)) 150)

  (.addChild stage bunny)

  (defn animate []
    (js/requestAnimFrame animate)
    (set! (.-rotation bunny) (+ 0.1 (.-rotation bunny)))
    (.render renderer stage))

  (js/requestAnimFrame animate)

  (prn "Loaded"))
