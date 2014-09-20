(defproject tin "0.0.1-SNAPSHOT"
  :description "A simple clojurescript game engine"
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-2311" :exclusions [org.apache.ant/ant]]
                 [org.clojure/core.async "0.1.338.0-5c5012-alpha"]]
  :license {:name "Creative Commons Zero"
            :url "https://creativecommons.org/publicdomain/zero/1.0/legalcode"}
  :source-paths ["src"]
  :plugins [[lein-cljsbuild "1.0.4-SNAPSHOT"]
            [cider/cider-nrepl "0.7.0"]]
  :cljsbuild {
    :builds [{:id "tin"
              :source-paths ["src"]
              :compiler {
                :output-to "out/tin.js"
                :output-dir "out"
                :optimizations :whitespace
                :pretty-print true
                :externs ["externs/pixi.js"]
                :closure-warnings {:externs-validation :off
                                   :non-standard-jsdoc :off}
                :source-map "out/tin.sourcemap.js"}}
             {:id "compiled"
              :source-paths ["src"]
              :compiler {
                :output-to "compiled/tin.min.js"
                :output-dir "compiled"
                :optimizations :advanced
                :pretty-print false
                :externs ["externs/pixi.js"]
                :closure-warnings {:externs-validation :off
                                   :non-standard-jsdoc :off}
                :source-map "compiled/tin.sourcemap.js"}}]})
