(ns tin.examples.utils)

(defn rand-between
  "Returns a random number between low (inclusive) and high (exclusive)."
  [low high]
  (+ low (rand-int (- high low))))
