(function() {
var root = this;
var createjs = createjs || {};

createjs.Event = function() {};
createjs.Event.protoype.type = null;
createjs.Event.prototype.target = null;
createjs.Event.prototype.currentTarget = null;
createjs.Event.prototype.eventPhase = 0;
createjs.Event.prototype.bubbles = false;
createjs.Event.prototype.cancelable = false;
createjs.Event.prototype.timeStamp = 0;
createjs.Event.prototype.defaultPrevented = false;
createjs.Event.prototype.propagationStopped = false;
createjs.Event.prototype.immediatePropagationStopped = false;
createjs.Event.prototype.removed = false;
createjs.Event.prototype.initialize = function() {};
createjs.Event.prototype.preventDefault = function() {};
createjs.Event.prototype.stopPropagation = function() {};
createjs.Event.prototype.stopImmediatePropagation = function() {};
createjs.Event.prototype.remove = function() {};
createjs.Event.prototype.clone = function() {};
createjs.Event.prototype.toString = function() {};

createjs.EventDispatcher = function() {};
createjs.EventDispatcher.initialize = function() {};
createjs.EventDispatcher.prototype._listeners = null;
createjs.EventDispatcher.prototype._captureListeners = null;
createjs.EventDispatcher.prototype.initialize = function() {};
createjs.EventDispatcher.prototype.addEventListener = function() {};
createjs.EventDispatcher.prototype.on = function() {};
createjs.EventDispatcher.prototype.removeEventListener = function() {};
createjs.EventDispatcher.prototype.off = null;
createjs.EventDispatcher.prototype.removeAllEventListeners = function() {};
createjs.EventDispatcher.prototype.dispatchEvent = function() {};
createjs.EventDispatcher.prototype.hasEventListener = function() {};
createjs.EventDispatcher.prototype.willTrigger = function() {};
createjs.EventDispatcher.prototype.toString = function() {};
createjs.EventDispatcher.prototype._dispatchEvent = function() {};

createjs.Ease = function() {};
createjs.Ease.linear = function() {};
createjs.Ease.none = function() {};
createjs.Ease.get = function() {};
createjs.Ease.getPowIn = function() {};
createjs.Ease.getPowOut = function() {};
createjs.Ease.getPowInOut = function() {};
createjs.Ease.quadIn = function() {};
createjs.Ease.quadOut = function() {};
createjs.Ease.quadInOut = function() {};
createjs.Ease.cubicIn = function() {};
createjs.Ease.cubicOut = function() {};
createjs.Ease.cubicInOut = function() {};
createjs.Ease.quartIn = function() {};
createjs.Ease.quartOut = function() {};
createjs.Ease.quartInOut = function() {};
createjs.Ease.quintIn = function() {};
createjs.Ease.quintOut = function() {};
createjs.Ease.quintInOut = function() {};
createjs.Ease.sineIn = function() {};
createjs.Ease.sineOut = function() {};
createjs.Ease.sineInOut = function() {};
createjs.Ease.getBackIn = function() {};
createjs.Ease.backIn = function() {};
createjs.Ease.getBackOut = function() {};
createjs.Ease.backOut = function() {};
createjs.Ease.getBackInOut = function() {};
createjs.Ease.backInOut = function() {};
createjs.Ease.circIn = function() {};
createjs.Ease.circOut = function() {};
createjs.Ease.circInOut = function() {};
createjs.Ease.bounceIn = function() {};
createjs.Ease.bounceOut = function() {};
createjs.Ease.bounceInOut = function() {};
createjs.Ease.getElasticIn = function() {};
createjs.Ease.elasticIn = function() {};
createjs.Ease.getElasticOut = function() {};
createjs.Ease.elasticOut = function() {};
createjs.Ease.getElasticInOut = function() {};
createjs.Ease.elasticInOut = function() {};

createjs.MotionGuidePlugin = function() {};
createjs.MotionGuidePlugin.priority = 0;
createjs.MotionGuidePlugin.install = function() {};
createjs.MotionGuidePlugin.init = function() {};
createjs.MotionGuidePlugin.step = function() {};
createjs.MotionGuidePlugin.testRotData = function() {};
createjs.MotionGuidePlugin.tween = function() {};
createjs.MotionGuidePlugin.calc = function() {};

createjs.Timeline = function() {};
createjs.Timeline.prototype.ignoreGlobalPause = false;
createjs.Timeline.prototype.duration = 0;
createjs.Timeline.prototype.loop = false;
createjs.Timeline.prototype.position = null;
createjs.Timeline.prototype._paused = false;
createjs.Timeline.prototype._tweens = null;
createjs.Timeline.prototype._labels = null;
createjs.Timeline.prototype._labelList = null;
createjs.Timeline.prototype._prevPosition = 0;
createjs.Timeline.prototype._prevPos = -1;
createjs.Timeline.prototype._useTicks = false;
createjs.Timeline.prototype.initialize = function() {};
createjs.Timeline.prototype.addTween = function() {};
createjs.Timeline.prototype.removeTween = function() {};
createjs.Timeline.prototype.addLabel = function() {};
createjs.Timeline.prototype.setLabels = function() {};
createjs.Timeline.prototype.getLabels = function() {};
createjs.Timeline.prototype.getCurrentLabel = function() {};
createjs.Timeline.prototype.gotoAndPlay = function() {};
createjs.Timeline.prototype.gotoAndStop = function() {};
createjs.Timeline.prototype.setPosition = function() {};
createjs.Timeline.prototype.setPaused = function() {};
createjs.Timeline.prototype.updateDuration = function() {};
createjs.Timeline.prototype.tick = function() {};
createjs.Timeline.prototype.resolve = function() {};
createjs.Timeline.prototype.toString = function() {};
createjs.Timeline.prototype.clone = function() {};
createjs.Timeline.prototype._goto = function() {};

createjs.Tween = function() {};
createjs.Tween.NONE = 0;
createjs.Tween.LOOP = 1;
createjs.Tween.REVERSE = 2;
createjs.Tween.IGNORE = {};
createjs.Tween._tweens = [];
createjs.Tween._plugins = {};
createjs.Tween.get = function(target) {};
createjs.Tween.tick = function() {};
createjs.Tween.handleEvent = function() {};
createjs.Tween.removeTweens = function() {};
createjs.Tween.removeAllTweens = function() {};
createjs.Tween.hasActiveTweens = function() {};
createjs.Tween.installPlugin = function() {};
createjs.Tween._register = function() {};
createjs.Tween.prototype.ignoreGlobalPause = false;
createjs.Tween.prototype.loop = false;
createjs.Tween.prototype.duration = 0;
createjs.Tween.prototype.pluginData = null;
createjs.Tween.prototype.target = null;
createjs.Tween.prototype.position = null;
createjs.Tween.prototype.passive = false;
createjs.Tween.prototype._paused = false;
createjs.Tween.prototype._curQueueProps = null;
createjs.Tween.prototype._initQueueProps = null;
createjs.Tween.prototype._steps = null;
createjs.Tween.prototype._actions = null;
createjs.Tween.prototype._prevPosition = 0;
createjs.Tween.prototype._stepPosition = 0; // this is needed by MovieClip.
createjs.Tween.prototype._prevPos = -1;
createjs.Tween.prototype._target = null;
createjs.Tween.prototype._useTicks = false;
createjs.Tween.prototype._inited = false;
createjs.Tween.prototype.initialize = function() {};
createjs.Tween.prototype.wait = function() {};
createjs.Tween.prototype.to = function() {};
createjs.Tween.prototype.call = function() {};
createjs.Tween.prototype.set = function() {};
createjs.Tween.prototype.play = function() {};
createjs.Tween.prototype.pause = function() {};
createjs.Tween.prototype.setPosition = function() {};
createjs.Tween.prototype.setPaused = function() {};
createjs.Tween.prototype.toString = function() {};
createjs.Tween.prototype.clone = function() {};
createjs.Tween.prototype._updateTargetProps = function() {};
createjs.Tween.prototype._runActions = function() {};
createjs.Tween.prototype._appendQueueProps = function() {};
createjs.Tween.prototype._cloneProps = function() {};
createjs.Tween.prototype._addStep = function() {};
createjs.Tween.prototype._addAction = function() {};
createjs.Tween.prototype._set = function() {};
createjs.TweenJS = {};
createjs.TweenJS.version = null;
createjs.TweenJs.buildDate = null;

if (typeof exports !== "undefined") {
  if (typeof module !== "undefined" && module.exports) {
    exports = module.exports = createjs;
  }
  exports.createjs = createjs;
} else {
  if (typeof define !== "undefined" && define.amd) {
    define(createjs);
  } else {
    root.createjs = createjs;
  }
}

}).call(this);