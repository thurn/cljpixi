(defproject tin "0.0.1-SNAPSHOT"
  :description "A simple clojurescript game engine"
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-2311"
                  :exclusions [org.apache.ant/ant]]
                 [org.clojure/core.match "0.2.1"]
                 [org.clojure/core.async "0.1.338.0-5c5012-alpha"]
                 [com.cemerick/piggieback "0.1.3"]]
  :license {:name "Creative Commons Zero"
            :url "https://creativecommons.org/publicdomain/zero/1.0/legalcode"}
  :source-paths ["src"]
  :plugins [[lein-cljsbuild "1.0.4-SNAPSHOT"]
            [cider/cider-nrepl "0.7.0"]
            [com.cemerick/austin "0.1.5"]]
  :repl-options {:nrepl-middleware [cemerick.piggieback/wrap-cljs-repl]}
  :clean-targets ["out" "compiled"]
  :cljsbuild {
    :builds [{:id "tin"
              :source-paths ["src"]
              :compiler {
                :output-to "out/tin.js"
                :output-dir "out"
                :optimizations :whitespace
                :pretty-print true}}
             {:id "compiled"
              :source-paths ["src"]
              :compiler {
                :output-to "compiled/tin.min.js"
                :output-dir "compiled"
                :optimizations :advanced
                :pretty-print false
                :externs ["externs/tweenjs.min.js" "externs/pixi-2.2.3.min.js"
                          "externs/howler-1.1.25.min.js" "externs/hammer.js"]
                :closure-warnings {:externs-validation :off
                                   :non-standard-jsdoc :off}
                ;:source-map "compiled/tin.sourcemap.js"
             }}]})
