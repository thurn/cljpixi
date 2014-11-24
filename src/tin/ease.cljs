(ns tin.ease)

(defn- Ease [] (.-Ease js/createjs))

(defn back-in [] (.-backIn (Ease)))

(defn back-in-out [] (.-backInOut (Ease)))

(defn back-out [] (.-backOut (Ease)))

(defn bounce-in [] (.-bounceIn (Ease)))

(defn bounce-in-out [] (.-bounceInOut (Ease)))

(defn bounce-out [] (.-bounceOut (Ease)))

(defn circ-in [] (.-circIn (Ease)))

(defn circ-in-out [] (.-circInOut (Ease)))

(defn circ-out [] (.-circOut (Ease)))

(defn cubic-in [] (.-cubicIn (Ease)))

(defn cubic-in-out [] (.-cubicInOut (Ease)))

(defn cubic-out [] (.-cubicOut (Ease)))

(defn elastic-in [] (.-elasticIn (Ease)))

(defn elastic-in-out [] (.-elasticInOut (Ease)))

(defn elastic-out [] (.-elasticOut (Ease)))

(defn linear [] (.-linear (Ease)))

(defn quad-in [] (.-quadIn (Ease)))

(defn quad-in-out [] (.-quadInOut (Ease)))

(defn quad-out [] (.-quadOut (Ease)))

(defn quart-in [] (.-quartIn (Ease)))

(defn quart-in-out [] (.-quartInOut (Ease)))

(defn quart-out [] (.-quartOut (Ease)))

(defn quint-in [] (.-quintIn (Ease)))

(defn quint-in-out [] (.-quintInOut (Ease)))

(defn quint-out [] (.-quintOut (Ease)))

(defn sine-in [] (.-sineIn (Ease)))

(defn sine-in-out [] (.-sineInOut (Ease)))

(defn sine-out [] (.-sineOut (Ease)))

(defn get-back-in [strength] (.getBackIn (Ease) strength))

(defn get-back-in-out [strength] (.getBackInOut (Ease) strength))

(defn get-back-out [strength] (.getBackOut (Ease) strength))

(defn get-elastic-in [strength] (.getElasticIn (Ease) strength))

(defn get-elastic-in-out [strength] (.getElasticInOut (Ease) strength))

(defn get-elastic-out [strength] (.getElasticOut (Ease) strength))

(defn get-pow-in [strength] (.getPowIn (Ease) strength))

(defn get-pow-in-out [strength] (.getPowInOut (Ease) strength))

(defn get-pow-out [strength] (.getPowOut (Ease) strength))
