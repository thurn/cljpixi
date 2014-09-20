/*

 pixi.js - v1.6.1
 Copyright (c) 2012-2014, Mat Groves
 http://goodboydigital.com/

 Compiled: 2014-07-18

 pixi.js is licensed under the MIT License.
 http://www.opensource.org/licenses/mit-license.php
*/
(function() {
  var root = this;
  var PIXI = PIXI || {};
  PIXI.WEBGL_RENDERER = 0;
  PIXI.CANVAS_RENDERER = 1;
  PIXI.VERSION = "v1.6.1";
  PIXI.blendModes = {NORMAL:0, ADD:1, MULTIPLY:2, SCREEN:3, OVERLAY:4, DARKEN:5, LIGHTEN:6, COLOR_DODGE:7, COLOR_BURN:8, HARD_LIGHT:9, SOFT_LIGHT:10, DIFFERENCE:11, EXCLUSION:12, HUE:13, SATURATION:14, COLOR:15, LUMINOSITY:16};
  PIXI.scaleModes = {DEFAULT:0, LINEAR:0, NEAREST:1};
  PIXI._UID = 0;
  if (typeof Float32Array != "undefined") {
    PIXI.Float32Array = Float32Array;
    PIXI.Uint16Array = Uint16Array;
  } else {
    PIXI.Float32Array = Array;
    PIXI.Uint16Array = Array;
  }
  PIXI.INTERACTION_FREQUENCY = 30;
  PIXI.AUTO_PREVENT_DEFAULT = true;
  PIXI.RAD_TO_DEG = 180 / Math.PI;
  PIXI.DEG_TO_RAD = Math.PI / 180;
  PIXI.dontSayHello = false;
  PIXI.sayHello = function(type) {
    if (PIXI.dontSayHello) {
      return;
    }
    if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
      var args = ["%c %c %c Pixi.js " + PIXI.VERSION + " - " + type + "  %c " + " %c " + " http://www.pixijs.com/  %c %c \u2665%c\u2665%c\u2665 ", "background: #ff66a5", "background: #ff66a5", "color: #ff66a5; background: #030307;", "background: #ff66a5", "background: #ffc3dc", "background: #ff66a5", "color: #ff2424; background: #fff", "color: #ff2424; background: #fff", "color: #ff2424; background: #fff"];
      console.log.apply(console, args);
    } else {
      if (window["console"]) {
        console.log("Pixi.js " + PIXI.VERSION + " - http://www.pixijs.com/");
      }
    }
    PIXI.dontSayHello = true;
  };
  PIXI.Point = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  };
  PIXI.Point.prototype.clone = function() {
    return new PIXI.Point(this.x, this.y);
  };
  PIXI.Point.prototype.set = function(x, y) {
    this.x = x || 0;
    this.y = y || (y !== 0 ? this.x : 0);
  };
  PIXI.Point.prototype.constructor = PIXI.Point;
  PIXI.Rectangle = function(x, y, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
  };
  PIXI.Rectangle.prototype.clone = function() {
    return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
  };
  PIXI.Rectangle.prototype.contains = function(x, y) {
    if (this.width <= 0 || this.height <= 0) {
      return false;
    }
    var x1 = this.x;
    if (x >= x1 && x <= x1 + this.width) {
      var y1 = this.y;
      if (y >= y1 && y <= y1 + this.height) {
        return true;
      }
    }
    return false;
  };
  PIXI.Rectangle.prototype.constructor = PIXI.Rectangle;
  PIXI.EmptyRectangle = new PIXI.Rectangle(0, 0, 0, 0);
  PIXI.Polygon = function(points) {
    if (!(points instanceof Array)) {
      points = Array.prototype.slice.call(arguments);
    }
    if (typeof points[0] === "number") {
      var p = [];
      for (var i = 0, il = points.length;i < il;i += 2) {
        p.push(new PIXI.Point(points[i], points[i + 1]));
      }
      points = p;
    }
    this.points = points;
  };
  PIXI.Polygon.prototype.clone = function() {
    var points = [];
    for (var i = 0;i < this.points.length;i++) {
      points.push(this.points[i].clone());
    }
    return new PIXI.Polygon(points);
  };
  PIXI.Polygon.prototype.contains = function(x, y) {
    var inside = false;
    for (var i = 0, j = this.points.length - 1;i < this.points.length;j = i++) {
      var xi = this.points[i].x, yi = this.points[i].y, xj = this.points[j].x, yj = this.points[j].y, intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  };
  PIXI.Polygon.prototype.constructor = PIXI.Polygon;
  PIXI.Circle = function(x, y, radius) {
    this.x = x || 0;
    this.y = y || 0;
    this.radius = radius || 0;
  };
  PIXI.Circle.prototype.clone = function() {
    return new PIXI.Circle(this.x, this.y, this.radius);
  };
  PIXI.Circle.prototype.contains = function(x, y) {
    if (this.radius <= 0) {
      return false;
    }
    var dx = this.x - x, dy = this.y - y, r2 = this.radius * this.radius;
    dx *= dx;
    dy *= dy;
    return dx + dy <= r2;
  };
  PIXI.Circle.prototype.getBounds = function() {
    return new PIXI.Rectangle(this.x - this.radius, this.y - this.radius, this.width, this.height);
  };
  PIXI.Circle.prototype.constructor = PIXI.Circle;
  PIXI.Ellipse = function(x, y, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
  };
  PIXI.Ellipse.prototype.clone = function() {
    return new PIXI.Ellipse(this.x, this.y, this.width, this.height);
  };
  PIXI.Ellipse.prototype.contains = function(x, y) {
    if (this.width <= 0 || this.height <= 0) {
      return false;
    }
    var normx = (x - this.x) / this.width, normy = (y - this.y) / this.height;
    normx *= normx;
    normy *= normy;
    return normx + normy <= 1;
  };
  PIXI.Ellipse.prototype.getBounds = function() {
    return new PIXI.Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
  };
  PIXI.Ellipse.prototype.constructor = PIXI.Ellipse;
  PIXI.Matrix = function() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
  };
  PIXI.Matrix.prototype.fromArray = function(array) {
    this.a = array[0];
    this.b = array[1];
    this.c = array[3];
    this.d = array[4];
    this.tx = array[2];
    this.ty = array[5];
  };
  PIXI.Matrix.prototype.toArray = function(transpose) {
    if (!this.array) {
      this.array = new Float32Array(9);
    }
    var array = this.array;
    if (transpose) {
      array[0] = this.a;
      array[1] = this.c;
      array[2] = 0;
      array[3] = this.b;
      array[4] = this.d;
      array[5] = 0;
      array[6] = this.tx;
      array[7] = this.ty;
      array[8] = 1;
    } else {
      array[0] = this.a;
      array[1] = this.b;
      array[2] = this.tx;
      array[3] = this.c;
      array[4] = this.d;
      array[5] = this.ty;
      array[6] = 0;
      array[7] = 0;
      array[8] = 1;
    }
    return array;
  };
  PIXI.identityMatrix = new PIXI.Matrix;
  PIXI.determineMatrixArrayType = function() {
    return typeof Float32Array !== "undefined" ? Float32Array : Array;
  };
  PIXI.Matrix2 = PIXI.determineMatrixArrayType();
  PIXI.DisplayObject = function() {
    this.position = new PIXI.Point;
    this.scale = new PIXI.Point(1, 1);
    this.pivot = new PIXI.Point(0, 0);
    this.rotation = 0;
    this.alpha = 1;
    this.visible = true;
    this.hitArea = null;
    this.buttonMode = false;
    this.renderable = false;
    this.parent = null;
    this.stage = null;
    this.worldAlpha = 1;
    this._interactive = false;
    this.defaultCursor = "pointer";
    this.worldTransform = new PIXI.Matrix;
    this.color = [];
    this.dynamic = true;
    this._sr = 0;
    this._cr = 1;
    this.filterArea = null;
    this._bounds = new PIXI.Rectangle(0, 0, 1, 1);
    this._currentBounds = null;
    this._mask = null;
    this._cacheAsBitmap = false;
    this._cacheIsDirty = false;
  };
  PIXI.DisplayObject.prototype.constructor = PIXI.DisplayObject;
  PIXI.DisplayObject.prototype.setInteractive = function(interactive) {
    this.interactive = interactive;
  };
  Object.defineProperty(PIXI.DisplayObject.prototype, "interactive", {get:function() {
    return this._interactive;
  }, set:function(value) {
    this._interactive = value;
    if (this.stage) {
      this.stage.dirty = true;
    }
  }});
  Object.defineProperty(PIXI.DisplayObject.prototype, "worldVisible", {get:function() {
    var item = this;
    do {
      if (!item.visible) {
        return false;
      }
      item = item.parent;
    } while (item);
    return true;
  }});
  Object.defineProperty(PIXI.DisplayObject.prototype, "mask", {get:function() {
    return this._mask;
  }, set:function(value) {
    if (this._mask) {
      this._mask.isMask = false;
    }
    this._mask = value;
    if (this._mask) {
      this._mask.isMask = true;
    }
  }});
  Object.defineProperty(PIXI.DisplayObject.prototype, "filters", {get:function() {
    return this._filters;
  }, set:function(value) {
    if (value) {
      var passes = [];
      for (var i = 0;i < value.length;i++) {
        var filterPasses = value[i].passes;
        for (var j = 0;j < filterPasses.length;j++) {
          passes.push(filterPasses[j]);
        }
      }
      this._filterBlock = {target:this, filterPasses:passes};
    }
    this._filters = value;
  }});
  Object.defineProperty(PIXI.DisplayObject.prototype, "cacheAsBitmap", {get:function() {
    return this._cacheAsBitmap;
  }, set:function(value) {
    if (this._cacheAsBitmap === value) {
      return;
    }
    if (value) {
      this._generateCachedSprite();
    } else {
      this._destroyCachedSprite();
    }
    this._cacheAsBitmap = value;
  }});
  PIXI.DisplayObject.prototype.updateTransform = function() {
    if (this.rotation !== this.rotationCache) {
      this.rotationCache = this.rotation;
      this._sr = Math.sin(this.rotation);
      this._cr = Math.cos(this.rotation);
    }
    var parentTransform = this.parent.worldTransform;
    var worldTransform = this.worldTransform;
    var px = this.pivot.x;
    var py = this.pivot.y;
    var a00 = this._cr * this.scale.x, a01 = -this._sr * this.scale.y, a10 = this._sr * this.scale.x, a11 = this._cr * this.scale.y, a02 = this.position.x - a00 * px - py * a01, a12 = this.position.y - a11 * py - px * a10, b00 = parentTransform.a, b01 = parentTransform.b, b10 = parentTransform.c, b11 = parentTransform.d;
    worldTransform.a = b00 * a00 + b01 * a10;
    worldTransform.b = b00 * a01 + b01 * a11;
    worldTransform.tx = b00 * a02 + b01 * a12 + parentTransform.tx;
    worldTransform.c = b10 * a00 + b11 * a10;
    worldTransform.d = b10 * a01 + b11 * a11;
    worldTransform.ty = b10 * a02 + b11 * a12 + parentTransform.ty;
    this.worldAlpha = this.alpha * this.parent.worldAlpha;
  };
  PIXI.DisplayObject.prototype.getBounds = function(matrix) {
    matrix = matrix;
    return PIXI.EmptyRectangle;
  };
  PIXI.DisplayObject.prototype.getLocalBounds = function() {
    return this.getBounds(PIXI.identityMatrix);
  };
  PIXI.DisplayObject.prototype.setStageReference = function(stage) {
    this.stage = stage;
    if (this._interactive) {
      this.stage.dirty = true;
    }
  };
  PIXI.DisplayObject.prototype.generateTexture = function(renderer) {
    var bounds = this.getLocalBounds();
    var renderTexture = new PIXI.RenderTexture(bounds.width | 0, bounds.height | 0, renderer);
    renderTexture.render(this, new PIXI.Point(-bounds.x, -bounds.y));
    return renderTexture;
  };
  PIXI.DisplayObject.prototype.updateCache = function() {
    this._generateCachedSprite();
  };
  PIXI.DisplayObject.prototype._renderCachedSprite = function(renderSession) {
    this._cachedSprite.worldAlpha = this.worldAlpha;
    if (renderSession.gl) {
      PIXI.Sprite.prototype._renderWebGL.call(this._cachedSprite, renderSession);
    } else {
      PIXI.Sprite.prototype._renderCanvas.call(this._cachedSprite, renderSession);
    }
  };
  PIXI.DisplayObject.prototype._generateCachedSprite = function() {
    this._cacheAsBitmap = false;
    var bounds = this.getLocalBounds();
    if (!this._cachedSprite) {
      var renderTexture = new PIXI.RenderTexture(bounds.width | 0, bounds.height | 0);
      this._cachedSprite = new PIXI.Sprite(renderTexture);
      this._cachedSprite.worldTransform = this.worldTransform;
    } else {
      this._cachedSprite.texture.resize(bounds.width | 0, bounds.height | 0);
    }
    var tempFilters = this._filters;
    this._filters = null;
    this._cachedSprite.filters = tempFilters;
    this._cachedSprite.texture.render(this, new PIXI.Point(-bounds.x, -bounds.y));
    this._cachedSprite.anchor.x = -(bounds.x / bounds.width);
    this._cachedSprite.anchor.y = -(bounds.y / bounds.height);
    this._filters = tempFilters;
    this._cacheAsBitmap = true;
  };
  PIXI.DisplayObject.prototype._destroyCachedSprite = function() {
    if (!this._cachedSprite) {
      return;
    }
    this._cachedSprite.texture.destroy(true);
    this._cachedSprite = null;
  };
  PIXI.DisplayObject.prototype._renderWebGL = function(renderSession) {
    renderSession = renderSession;
  };
  PIXI.DisplayObject.prototype._renderCanvas = function(renderSession) {
    renderSession = renderSession;
  };
  Object.defineProperty(PIXI.DisplayObject.prototype, "x", {get:function() {
    return this.position.x;
  }, set:function(value) {
    this.position.x = value;
  }});
  Object.defineProperty(PIXI.DisplayObject.prototype, "y", {get:function() {
    return this.position.y;
  }, set:function(value) {
    this.position.y = value;
  }});
  PIXI.DisplayObjectContainer = function() {
    PIXI.DisplayObject.call(this);
    this.children = [];
  };
  PIXI.DisplayObjectContainer.prototype = Object.create(PIXI.DisplayObject.prototype);
  PIXI.DisplayObjectContainer.prototype.constructor = PIXI.DisplayObjectContainer;
  Object.defineProperty(PIXI.DisplayObjectContainer.prototype, "width", {get:function() {
    return this.scale.x * this.getLocalBounds().width;
  }, set:function(value) {
    var width = this.getLocalBounds().width;
    if (width !== 0) {
      this.scale.x = value / (width / this.scale.x);
    } else {
      this.scale.x = 1;
    }
    this._width = value;
  }});
  Object.defineProperty(PIXI.DisplayObjectContainer.prototype, "height", {get:function() {
    return this.scale.y * this.getLocalBounds().height;
  }, set:function(value) {
    var height = this.getLocalBounds().height;
    if (height !== 0) {
      this.scale.y = value / (height / this.scale.y);
    } else {
      this.scale.y = 1;
    }
    this._height = value;
  }});
  PIXI.DisplayObjectContainer.prototype.addChild = function(child) {
    return this.addChildAt(child, this.children.length);
  };
  PIXI.DisplayObjectContainer.prototype.addChildAt = function(child, index) {
    if (index >= 0 && index <= this.children.length) {
      if (child.parent) {
        child.parent.removeChild(child);
      }
      child.parent = this;
      this.children.splice(index, 0, child);
      if (this.stage) {
        child.setStageReference(this.stage);
      }
      return child;
    } else {
      throw new Error(child + " The index " + index + " supplied is out of bounds " + this.children.length);
    }
  };
  PIXI.DisplayObjectContainer.prototype.swapChildren = function(child, child2) {
    if (child === child2) {
      return;
    }
    var index1 = this.children.indexOf(child);
    var index2 = this.children.indexOf(child2);
    if (index1 < 0 || index2 < 0) {
      throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");
    }
    this.children[index1] = child2;
    this.children[index2] = child;
  };
  PIXI.DisplayObjectContainer.prototype.getChildAt = function(index) {
    if (index >= 0 && index < this.children.length) {
      return this.children[index];
    } else {
      throw new Error("Supplied index does not exist in the child list, or the supplied DisplayObject must be a child of the caller");
    }
  };
  PIXI.DisplayObjectContainer.prototype.removeChild = function(child) {
    return this.removeChildAt(this.children.indexOf(child));
  };
  PIXI.DisplayObjectContainer.prototype.removeChildAt = function(index) {
    var child = this.getChildAt(index);
    if (this.stage) {
      child.removeStageReference();
    }
    child.parent = undefined;
    this.children.splice(index, 1);
    return child;
  };
  PIXI.DisplayObjectContainer.prototype.removeChildren = function(beginIndex, endIndex) {
    var begin = beginIndex || 0;
    var end = typeof endIndex === "number" ? endIndex : this.children.length;
    var range = end - begin;
    if (range > 0 && range <= end) {
      var removed = this.children.splice(begin, range);
      for (var i = 0;i < removed.length;i++) {
        var child = removed[i];
        if (this.stage) {
          child.removeStageReference();
        }
        child.parent = undefined;
      }
      return removed;
    } else {
      throw new Error("Range Error, numeric values are outside the acceptable range");
    }
  };
  PIXI.DisplayObjectContainer.prototype.updateTransform = function() {
    if (!this.visible) {
      return;
    }
    PIXI.DisplayObject.prototype.updateTransform.call(this);
    if (this._cacheAsBitmap) {
      return;
    }
    for (var i = 0, j = this.children.length;i < j;i++) {
      this.children[i].updateTransform();
    }
  };
  PIXI.DisplayObjectContainer.prototype.getBounds = function(matrix) {
    if (this.children.length === 0) {
      return PIXI.EmptyRectangle;
    }
    if (matrix) {
      var matrixCache = this.worldTransform;
      this.worldTransform = matrix;
      this.updateTransform();
      this.worldTransform = matrixCache;
    }
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var childBounds;
    var childMaxX;
    var childMaxY;
    var childVisible = false;
    for (var i = 0, j = this.children.length;i < j;i++) {
      var child = this.children[i];
      if (!child.visible) {
        continue;
      }
      childVisible = true;
      childBounds = this.children[i].getBounds(matrix);
      minX = minX < childBounds.x ? minX : childBounds.x;
      minY = minY < childBounds.y ? minY : childBounds.y;
      childMaxX = childBounds.width + childBounds.x;
      childMaxY = childBounds.height + childBounds.y;
      maxX = maxX > childMaxX ? maxX : childMaxX;
      maxY = maxY > childMaxY ? maxY : childMaxY;
    }
    if (!childVisible) {
      return PIXI.EmptyRectangle;
    }
    var bounds = this._bounds;
    bounds.x = minX;
    bounds.y = minY;
    bounds.width = maxX - minX;
    bounds.height = maxY - minY;
    return bounds;
  };
  PIXI.DisplayObjectContainer.prototype.getLocalBounds = function() {
    var matrixCache = this.worldTransform;
    this.worldTransform = PIXI.identityMatrix;
    for (var i = 0, j = this.children.length;i < j;i++) {
      this.children[i].updateTransform();
    }
    var bounds = this.getBounds();
    this.worldTransform = matrixCache;
    return bounds;
  };
  PIXI.DisplayObjectContainer.prototype.setStageReference = function(stage) {
    this.stage = stage;
    if (this._interactive) {
      this.stage.dirty = true;
    }
    for (var i = 0, j = this.children.length;i < j;i++) {
      var child = this.children[i];
      child.setStageReference(stage);
    }
  };
  PIXI.DisplayObjectContainer.prototype.removeStageReference = function() {
    for (var i = 0, j = this.children.length;i < j;i++) {
      var child = this.children[i];
      child.removeStageReference();
    }
    if (this._interactive) {
      this.stage.dirty = true;
    }
    this.stage = null;
  };
  PIXI.DisplayObjectContainer.prototype._renderWebGL = function(renderSession) {
    if (!this.visible || this.alpha <= 0) {
      return;
    }
    if (this._cacheAsBitmap) {
      this._renderCachedSprite(renderSession);
      return;
    }
    var i, j;
    if (this._mask || this._filters) {
      if (this._filters) {
        renderSession.spriteBatch.flush();
        renderSession.filterManager.pushFilter(this._filterBlock);
      }
      if (this._mask) {
        renderSession.spriteBatch.stop();
        renderSession.maskManager.pushMask(this.mask, renderSession);
        renderSession.spriteBatch.start();
      }
      for (i = 0, j = this.children.length;i < j;i++) {
        this.children[i]._renderWebGL(renderSession);
      }
      renderSession.spriteBatch.stop();
      if (this._mask) {
        renderSession.maskManager.popMask(this._mask, renderSession);
      }
      if (this._filters) {
        renderSession.filterManager.popFilter();
      }
      renderSession.spriteBatch.start();
    } else {
      for (i = 0, j = this.children.length;i < j;i++) {
        this.children[i]._renderWebGL(renderSession);
      }
    }
  };
  PIXI.DisplayObjectContainer.prototype._renderCanvas = function(renderSession) {
    if (this.visible === false || this.alpha === 0) {
      return;
    }
    if (this._cacheAsBitmap) {
      this._renderCachedSprite(renderSession);
      return;
    }
    if (this._mask) {
      renderSession.maskManager.pushMask(this._mask, renderSession.context);
    }
    for (var i = 0, j = this.children.length;i < j;i++) {
      var child = this.children[i];
      child._renderCanvas(renderSession);
    }
    if (this._mask) {
      renderSession.maskManager.popMask(renderSession.context);
    }
  };
  PIXI.Sprite = function(texture) {
    PIXI.DisplayObjectContainer.call(this);
    this.anchor = new PIXI.Point;
    this.texture = texture;
    this._width = 0;
    this._height = 0;
    this.tint = 16777215;
    this.blendMode = PIXI.blendModes.NORMAL;
    if (texture.baseTexture.hasLoaded) {
      this.onTextureUpdate();
    } else {
      this.onTextureUpdateBind = this.onTextureUpdate.bind(this);
      this.texture.addEventListener("update", this.onTextureUpdateBind);
    }
    this.renderable = true;
  };
  PIXI.Sprite.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  PIXI.Sprite.prototype.constructor = PIXI.Sprite;
  Object.defineProperty(PIXI.Sprite.prototype, "width", {get:function() {
    return this.scale.x * this.texture.frame.width;
  }, set:function(value) {
    this.scale.x = value / this.texture.frame.width;
    this._width = value;
  }});
  Object.defineProperty(PIXI.Sprite.prototype, "height", {get:function() {
    return this.scale.y * this.texture.frame.height;
  }, set:function(value) {
    this.scale.y = value / this.texture.frame.height;
    this._height = value;
  }});
  PIXI.Sprite.prototype.setTexture = function(texture) {
    this.texture = texture;
    this.cachedTint = 16777215;
  };
  PIXI.Sprite.prototype.onTextureUpdate = function() {
    if (this._width) {
      this.scale.x = this._width / this.texture.frame.width;
    }
    if (this._height) {
      this.scale.y = this._height / this.texture.frame.height;
    }
  };
  PIXI.Sprite.prototype.getBounds = function(matrix) {
    var width = this.texture.frame.width;
    var height = this.texture.frame.height;
    var w0 = width * (1 - this.anchor.x);
    var w1 = width * -this.anchor.x;
    var h0 = height * (1 - this.anchor.y);
    var h1 = height * -this.anchor.y;
    var worldTransform = matrix || this.worldTransform;
    var a = worldTransform.a;
    var b = worldTransform.c;
    var c = worldTransform.b;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;
    var x1 = a * w1 + c * h1 + tx;
    var y1 = d * h1 + b * w1 + ty;
    var x2 = a * w0 + c * h1 + tx;
    var y2 = d * h1 + b * w0 + ty;
    var x3 = a * w0 + c * h0 + tx;
    var y3 = d * h0 + b * w0 + ty;
    var x4 = a * w1 + c * h0 + tx;
    var y4 = d * h0 + b * w1 + ty;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var minX = Infinity;
    var minY = Infinity;
    minX = x1 < minX ? x1 : minX;
    minX = x2 < minX ? x2 : minX;
    minX = x3 < minX ? x3 : minX;
    minX = x4 < minX ? x4 : minX;
    minY = y1 < minY ? y1 : minY;
    minY = y2 < minY ? y2 : minY;
    minY = y3 < minY ? y3 : minY;
    minY = y4 < minY ? y4 : minY;
    maxX = x1 > maxX ? x1 : maxX;
    maxX = x2 > maxX ? x2 : maxX;
    maxX = x3 > maxX ? x3 : maxX;
    maxX = x4 > maxX ? x4 : maxX;
    maxY = y1 > maxY ? y1 : maxY;
    maxY = y2 > maxY ? y2 : maxY;
    maxY = y3 > maxY ? y3 : maxY;
    maxY = y4 > maxY ? y4 : maxY;
    var bounds = this._bounds;
    bounds.x = minX;
    bounds.width = maxX - minX;
    bounds.y = minY;
    bounds.height = maxY - minY;
    this._currentBounds = bounds;
    return bounds;
  };
  PIXI.Sprite.prototype._renderWebGL = function(renderSession) {
    if (!this.visible || this.alpha <= 0) {
      return;
    }
    var i, j;
    if (this._mask || this._filters) {
      var spriteBatch = renderSession.spriteBatch;
      if (this._filters) {
        spriteBatch.flush();
        renderSession.filterManager.pushFilter(this._filterBlock);
      }
      if (this._mask) {
        spriteBatch.stop();
        renderSession.maskManager.pushMask(this.mask, renderSession);
        spriteBatch.start();
      }
      spriteBatch.render(this);
      for (i = 0, j = this.children.length;i < j;i++) {
        this.children[i]._renderWebGL(renderSession);
      }
      spriteBatch.stop();
      if (this._mask) {
        renderSession.maskManager.popMask(this._mask, renderSession);
      }
      if (this._filters) {
        renderSession.filterManager.popFilter();
      }
      spriteBatch.start();
    } else {
      renderSession.spriteBatch.render(this);
      for (i = 0, j = this.children.length;i < j;i++) {
        this.children[i]._renderWebGL(renderSession);
      }
    }
  };
  PIXI.Sprite.prototype._renderCanvas = function(renderSession) {
    if (this.visible === false || this.alpha === 0) {
      return;
    }
    if (this.blendMode !== renderSession.currentBlendMode) {
      renderSession.currentBlendMode = this.blendMode;
      renderSession.context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode];
    }
    if (this._mask) {
      renderSession.maskManager.pushMask(this._mask, renderSession.context);
    }
    if (this.texture.valid) {
      renderSession.context.globalAlpha = this.worldAlpha;
      if (renderSession.roundPixels) {
        renderSession.context.setTransform(this.worldTransform.a, this.worldTransform.c, this.worldTransform.b, this.worldTransform.d, this.worldTransform.tx | 0, this.worldTransform.ty | 0);
      } else {
        renderSession.context.setTransform(this.worldTransform.a, this.worldTransform.c, this.worldTransform.b, this.worldTransform.d, this.worldTransform.tx, this.worldTransform.ty);
      }
      if (renderSession.smoothProperty && renderSession.scaleMode !== this.texture.baseTexture.scaleMode) {
        renderSession.scaleMode = this.texture.baseTexture.scaleMode;
        renderSession.context[renderSession.smoothProperty] = renderSession.scaleMode === PIXI.scaleModes.LINEAR;
      }
      var dx = this.texture.trim ? this.texture.trim.x - this.anchor.x * this.texture.trim.width : this.anchor.x * -this.texture.frame.width;
      var dy = this.texture.trim ? this.texture.trim.y - this.anchor.y * this.texture.trim.height : this.anchor.y * -this.texture.frame.height;
      if (this.tint !== 16777215) {
        if (this.cachedTint !== this.tint) {
          this.cachedTint = this.tint;
          this.tintedTexture = PIXI.CanvasTinter.getTintedTexture(this, this.tint);
        }
        renderSession.context.drawImage(this.tintedTexture, 0, 0, this.texture.crop.width, this.texture.crop.height, dx, dy, this.texture.crop.width, this.texture.crop.height);
      } else {
        renderSession.context.drawImage(this.texture.baseTexture.source, this.texture.crop.x, this.texture.crop.y, this.texture.crop.width, this.texture.crop.height, dx, dy, this.texture.crop.width, this.texture.crop.height);
      }
    }
    for (var i = 0, j = this.children.length;i < j;i++) {
      this.children[i]._renderCanvas(renderSession);
    }
    if (this._mask) {
      renderSession.maskManager.popMask(renderSession.context);
    }
  };
  PIXI.Sprite.fromFrame = function(frameId) {
    var texture = PIXI.TextureCache[frameId];
    if (!texture) {
      throw new Error('The frameId "' + frameId + '" does not exist in the texture cache' + this);
    }
    return new PIXI.Sprite(texture);
  };
  PIXI.Sprite.fromImage = function(imageId, crossorigin, scaleMode) {
    var texture = PIXI.Texture.fromImage(imageId, crossorigin, scaleMode);
    return new PIXI.Sprite(texture);
  };
  PIXI.SpriteBatch = function(texture) {
    PIXI.DisplayObjectContainer.call(this);
    this.textureThing = texture;
    this.ready = false;
  };
  PIXI.SpriteBatch.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  PIXI.SpriteBatch.constructor = PIXI.SpriteBatch;
  PIXI.SpriteBatch.prototype.initWebGL = function(gl) {
    this.fastSpriteBatch = new PIXI.WebGLFastSpriteBatch(gl);
    this.ready = true;
  };
  PIXI.SpriteBatch.prototype.updateTransform = function() {
    PIXI.DisplayObject.prototype.updateTransform.call(this);
  };
  PIXI.SpriteBatch.prototype._renderWebGL = function(renderSession) {
    if (!this.visible || this.alpha <= 0 || !this.children.length) {
      return;
    }
    if (!this.ready) {
      this.initWebGL(renderSession.gl);
    }
    renderSession.spriteBatch.stop();
    renderSession.shaderManager.setShader(renderSession.shaderManager.fastShader);
    this.fastSpriteBatch.begin(this, renderSession);
    this.fastSpriteBatch.render(this);
    renderSession.spriteBatch.start();
  };
  PIXI.SpriteBatch.prototype._renderCanvas = function(renderSession) {
    var context = renderSession.context;
    context.globalAlpha = this.worldAlpha;
    PIXI.DisplayObject.prototype.updateTransform.call(this);
    var transform = this.worldTransform;
    var isRotated = true;
    for (var i = 0;i < this.children.length;i++) {
      var child = this.children[i];
      if (!child.visible) {
        continue;
      }
      var texture = child.texture;
      var frame = texture.frame;
      context.globalAlpha = this.worldAlpha * child.alpha;
      if (child.rotation % (Math.PI * 2) === 0) {
        if (isRotated) {
          context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
          isRotated = false;
        }
        context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, child.anchor.x * (-frame.width * child.scale.x) + child.position.x + .5 | 0, child.anchor.y * (-frame.height * child.scale.y) + child.position.y + .5 | 0, frame.width * child.scale.x, frame.height * child.scale.y);
      } else {
        if (!isRotated) {
          isRotated = true;
        }
        PIXI.DisplayObject.prototype.updateTransform.call(child);
        var childTransform = child.worldTransform;
        if (renderSession.roundPixels) {
          context.setTransform(childTransform.a, childTransform.c, childTransform.b, childTransform.d, childTransform.tx | 0, childTransform.ty | 0);
        } else {
          context.setTransform(childTransform.a, childTransform.c, childTransform.b, childTransform.d, childTransform.tx, childTransform.ty);
        }
        context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, child.anchor.x * -frame.width + .5 | 0, child.anchor.y * -frame.height + .5 | 0, frame.width, frame.height);
      }
    }
  };
  PIXI.MovieClip = function(textures) {
    PIXI.Sprite.call(this, textures[0]);
    this.textures = textures;
    this.animationSpeed = 1;
    this.loop = true;
    this.onComplete = null;
    this.currentFrame = 0;
    this.playing = false;
  };
  PIXI.MovieClip.prototype = Object.create(PIXI.Sprite.prototype);
  PIXI.MovieClip.prototype.constructor = PIXI.MovieClip;
  Object.defineProperty(PIXI.MovieClip.prototype, "totalFrames", {get:function() {
    return this.textures.length;
  }});
  PIXI.MovieClip.prototype.stop = function() {
    this.playing = false;
  };
  PIXI.MovieClip.prototype.play = function() {
    this.playing = true;
  };
  PIXI.MovieClip.prototype.gotoAndStop = function(frameNumber) {
    this.playing = false;
    this.currentFrame = frameNumber;
    var round = this.currentFrame + .5 | 0;
    this.setTexture(this.textures[round % this.textures.length]);
  };
  PIXI.MovieClip.prototype.gotoAndPlay = function(frameNumber) {
    this.currentFrame = frameNumber;
    this.playing = true;
  };
  PIXI.MovieClip.prototype.updateTransform = function() {
    PIXI.Sprite.prototype.updateTransform.call(this);
    if (!this.playing) {
      return;
    }
    this.currentFrame += this.animationSpeed;
    var round = this.currentFrame + .5 | 0;
    this.currentFrame = this.currentFrame % this.textures.length;
    if (this.loop || round < this.textures.length) {
      this.setTexture(this.textures[round % this.textures.length]);
    } else {
      if (round >= this.textures.length) {
        this.gotoAndStop(this.textures.length - 1);
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }
  };
  PIXI.MovieClip.fromFrames = function(frames) {
    var textures = [];
    for (var i = 0;i < frames.length;i++) {
      textures.push(new PIXI.Texture.fromFrame(frames[i]));
    }
    return new PIXI.MovieClip(textures);
  };
  PIXI.MovieClip.fromImages = function(images) {
    var textures = [];
    for (var i = 0;i < images.length;i++) {
      textures.push(new PIXI.Texture.fromImage(images[i]));
    }
    return new PIXI.MovieClip(textures);
  };
  PIXI.FilterBlock = function() {
    this.visible = true;
    this.renderable = true;
  };
  PIXI.Text = function(text, style) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    PIXI.Sprite.call(this, PIXI.Texture.fromCanvas(this.canvas));
    this.setText(text);
    this.setStyle(style);
  };
  PIXI.Text.prototype = Object.create(PIXI.Sprite.prototype);
  PIXI.Text.prototype.constructor = PIXI.Text;
  Object.defineProperty(PIXI.Text.prototype, "width", {get:function() {
    if (this.dirty) {
      this.updateText();
      this.dirty = false;
    }
    return this.scale.x * this.texture.frame.width;
  }, set:function(value) {
    this.scale.x = value / this.texture.frame.width;
    this._width = value;
  }});
  Object.defineProperty(PIXI.Text.prototype, "height", {get:function() {
    if (this.dirty) {
      this.updateText();
      this.dirty = false;
    }
    return this.scale.y * this.texture.frame.height;
  }, set:function(value) {
    this.scale.y = value / this.texture.frame.height;
    this._height = value;
  }});
  PIXI.Text.prototype.setStyle = function(style) {
    style = style || {};
    style.font = style.font || "bold 20pt Arial";
    style.fill = style.fill || "black";
    style.align = style.align || "left";
    style.stroke = style.stroke || "black";
    style.strokeThickness = style.strokeThickness || 0;
    style.wordWrap = style.wordWrap || false;
    style.wordWrapWidth = style.wordWrapWidth || 100;
    style.wordWrapWidth = style.wordWrapWidth || 100;
    style.dropShadow = style.dropShadow || false;
    style.dropShadowAngle = style.dropShadowAngle || Math.PI / 6;
    style.dropShadowDistance = style.dropShadowDistance || 4;
    style.dropShadowColor = style.dropShadowColor || "black";
    this.style = style;
    this.dirty = true;
  };
  PIXI.Text.prototype.setText = function(text) {
    this.text = text.toString() || " ";
    this.dirty = true;
  };
  PIXI.Text.prototype.updateText = function() {
    this.context.font = this.style.font;
    var outputText = this.text;
    if (this.style.wordWrap) {
      outputText = this.wordWrap(this.text);
    }
    var lines = outputText.split(/(?:\r\n|\r|\n)/);
    var lineWidths = [];
    var maxLineWidth = 0;
    for (var i = 0;i < lines.length;i++) {
      var lineWidth = this.context.measureText(lines[i]).width;
      lineWidths[i] = lineWidth;
      maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }
    var width = maxLineWidth + this.style.strokeThickness;
    if (this.style.dropShadow) {
      width += this.style.dropShadowDistance;
    }
    this.canvas.width = width + this.context.lineWidth;
    var lineHeight = this.determineFontHeight("font: " + this.style.font + ";") + this.style.strokeThickness;
    var height = lineHeight * lines.length;
    if (this.style.dropShadow) {
      height += this.style.dropShadowDistance;
    }
    this.canvas.height = height;
    if (navigator.isCocoonJS) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.context.font = this.style.font;
    this.context.strokeStyle = this.style.stroke;
    this.context.lineWidth = this.style.strokeThickness;
    this.context.textBaseline = "top";
    var linePositionX;
    var linePositionY;
    if (this.style.dropShadow) {
      this.context.fillStyle = this.style.dropShadowColor;
      var xShadowOffset = Math.sin(this.style.dropShadowAngle) * this.style.dropShadowDistance;
      var yShadowOffset = Math.cos(this.style.dropShadowAngle) * this.style.dropShadowDistance;
      for (i = 0;i < lines.length;i++) {
        linePositionX = this.style.strokeThickness / 2;
        linePositionY = this.style.strokeThickness / 2 + i * lineHeight;
        if (this.style.align === "right") {
          linePositionX += maxLineWidth - lineWidths[i];
        } else {
          if (this.style.align === "center") {
            linePositionX += (maxLineWidth - lineWidths[i]) / 2;
          }
        }
        if (this.style.fill) {
          this.context.fillText(lines[i], linePositionX + xShadowOffset, linePositionY + yShadowOffset);
        }
      }
    }
    this.context.fillStyle = this.style.fill;
    for (i = 0;i < lines.length;i++) {
      linePositionX = this.style.strokeThickness / 2;
      linePositionY = this.style.strokeThickness / 2 + i * lineHeight;
      if (this.style.align === "right") {
        linePositionX += maxLineWidth - lineWidths[i];
      } else {
        if (this.style.align === "center") {
          linePositionX += (maxLineWidth - lineWidths[i]) / 2;
        }
      }
      if (this.style.stroke && this.style.strokeThickness) {
        this.context.strokeText(lines[i], linePositionX, linePositionY);
      }
      if (this.style.fill) {
        this.context.fillText(lines[i], linePositionX, linePositionY);
      }
    }
    this.updateTexture();
  };
  PIXI.Text.prototype.updateTexture = function() {
    this.texture.baseTexture.width = this.canvas.width;
    this.texture.baseTexture.height = this.canvas.height;
    this.texture.crop.width = this.texture.frame.width = this.canvas.width;
    this.texture.crop.height = this.texture.frame.height = this.canvas.height;
    this._width = this.canvas.width;
    this._height = this.canvas.height;
    this.requiresUpdate = true;
  };
  PIXI.Text.prototype._renderWebGL = function(renderSession) {
    if (this.requiresUpdate) {
      this.requiresUpdate = false;
      PIXI.updateWebGLTexture(this.texture.baseTexture, renderSession.gl);
    }
    PIXI.Sprite.prototype._renderWebGL.call(this, renderSession);
  };
  PIXI.Text.prototype.updateTransform = function() {
    if (this.dirty) {
      this.updateText();
      this.dirty = false;
    }
    PIXI.Sprite.prototype.updateTransform.call(this);
  };
  PIXI.Text.prototype.determineFontHeight = function(fontStyle) {
    var result = PIXI.Text.heightCache[fontStyle];
    if (!result) {
      var body = document.getElementsByTagName("body")[0];
      var dummy = document.createElement("div");
      var dummyText = document.createTextNode("M");
      dummy.appendChild(dummyText);
      dummy.setAttribute("style", fontStyle + ";position:absolute;top:0;left:0");
      body.appendChild(dummy);
      result = dummy.offsetHeight;
      PIXI.Text.heightCache[fontStyle] = result;
      body.removeChild(dummy);
    }
    return result;
  };
  PIXI.Text.prototype.wordWrap = function(text) {
    var result = "";
    var lines = text.split("\n");
    for (var i = 0;i < lines.length;i++) {
      var spaceLeft = this.style.wordWrapWidth;
      var words = lines[i].split(" ");
      for (var j = 0;j < words.length;j++) {
        var wordWidth = this.context.measureText(words[j]).width;
        var wordWidthWithSpace = wordWidth + this.context.measureText(" ").width;
        if (j === 0 || wordWidthWithSpace > spaceLeft) {
          if (j > 0) {
            result += "\n";
          }
          result += words[j];
          spaceLeft = this.style.wordWrapWidth - wordWidth;
        } else {
          spaceLeft -= wordWidthWithSpace;
          result += " " + words[j];
        }
      }
      if (i < lines.length - 1) {
        result += "\n";
      }
    }
    return result;
  };
  PIXI.Text.prototype.destroy = function(destroyBaseTexture) {
    this.context = null;
    this.canvas = null;
    this.texture.destroy(destroyBaseTexture === undefined ? true : destroyBaseTexture);
  };
  PIXI.Text.heightCache = {};
  PIXI.BitmapText = function(text, style) {
    PIXI.DisplayObjectContainer.call(this);
    this._pool = [];
    this.setText(text);
    this.setStyle(style);
    this.updateText();
    this.dirty = false;
  };
  PIXI.BitmapText.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  PIXI.BitmapText.prototype.constructor = PIXI.BitmapText;
  PIXI.BitmapText.prototype.setText = function(text) {
    this.text = text || " ";
    this.dirty = true;
  };
  PIXI.BitmapText.prototype.setStyle = function(style) {
    style = style || {};
    style.align = style.align || "left";
    this.style = style;
    var font = style.font.split(" ");
    this.fontName = font[font.length - 1];
    this.fontSize = font.length >= 2 ? parseInt(font[font.length - 2], 10) : PIXI.BitmapText.fonts[this.fontName].size;
    this.dirty = true;
    this.tint = style.tint;
  };
  PIXI.BitmapText.prototype.updateText = function() {
    var data = PIXI.BitmapText.fonts[this.fontName];
    var pos = new PIXI.Point;
    var prevCharCode = null;
    var chars = [];
    var maxLineWidth = 0;
    var lineWidths = [];
    var line = 0;
    var scale = this.fontSize / data.size;
    for (var i = 0;i < this.text.length;i++) {
      var charCode = this.text.charCodeAt(i);
      if (/(?:\r\n|\r|\n)/.test(this.text.charAt(i))) {
        lineWidths.push(pos.x);
        maxLineWidth = Math.max(maxLineWidth, pos.x);
        line++;
        pos.x = 0;
        pos.y += data.lineHeight;
        prevCharCode = null;
        continue;
      }
      var charData = data.chars[charCode];
      if (!charData) {
        continue;
      }
      if (prevCharCode && charData[prevCharCode]) {
        pos.x += charData.kerning[prevCharCode];
      }
      chars.push({texture:charData.texture, line:line, charCode:charCode, position:new PIXI.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)});
      pos.x += charData.xAdvance;
      prevCharCode = charCode;
    }
    lineWidths.push(pos.x);
    maxLineWidth = Math.max(maxLineWidth, pos.x);
    var lineAlignOffsets = [];
    for (i = 0;i <= line;i++) {
      var alignOffset = 0;
      if (this.style.align === "right") {
        alignOffset = maxLineWidth - lineWidths[i];
      } else {
        if (this.style.align === "center") {
          alignOffset = (maxLineWidth - lineWidths[i]) / 2;
        }
      }
      lineAlignOffsets.push(alignOffset);
    }
    var lenChildren = this.children.length;
    var lenChars = chars.length;
    var tint = this.tint || 16777215;
    for (i = 0;i < lenChars;i++) {
      var c = i < lenChildren ? this.children[i] : this._pool.pop();
      if (c) {
        c.setTexture(chars[i].texture);
      } else {
        c = new PIXI.Sprite(chars[i].texture);
      }
      c.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
      c.position.y = chars[i].position.y * scale;
      c.scale.x = c.scale.y = scale;
      c.tint = tint;
      if (!c.parent) {
        this.addChild(c);
      }
    }
    while (this.children.length > lenChars) {
      var child = this.getChildAt(this.children.length - 1);
      this._pool.push(child);
      this.removeChild(child);
    }
    this.textWidth = maxLineWidth * scale;
    this.textHeight = (pos.y + data.lineHeight) * scale;
  };
  PIXI.BitmapText.prototype.updateTransform = function() {
    if (this.dirty) {
      this.updateText();
      this.dirty = false;
    }
    PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
  };
  PIXI.BitmapText.fonts = {};
  PIXI.InteractionData = function() {
    this.global = new PIXI.Point;
    this.target = null;
    this.originalEvent = null;
  };
  PIXI.InteractionData.prototype.getLocalPosition = function(displayObject) {
    var worldTransform = displayObject.worldTransform;
    var global = this.global;
    var a00 = worldTransform.a, a01 = worldTransform.b, a02 = worldTransform.tx, a10 = worldTransform.c, a11 = worldTransform.d, a12 = worldTransform.ty, id = 1 / (a00 * a11 + a01 * -a10);
    return new PIXI.Point(a11 * id * global.x + -a01 * id * global.y + (a12 * a01 - a02 * a11) * id, a00 * id * global.y + -a10 * id * global.x + (-a12 * a00 + a02 * a10) * id);
  };
  PIXI.InteractionData.prototype.constructor = PIXI.InteractionData;
  PIXI.InteractionManager = function(stage) {
    this.stage = stage;
    this.mouse = new PIXI.InteractionData;
    this.touchs = {};
    this.tempPoint = new PIXI.Point;
    this.mouseoverEnabled = true;
    this.pool = [];
    this.interactiveItems = [];
    this.interactionDOMElement = null;
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.last = 0;
    this.currentCursorStyle = "inherit";
    this.mouseOut = false;
  };
  PIXI.InteractionManager.prototype.constructor = PIXI.InteractionManager;
  PIXI.InteractionManager.prototype.collectInteractiveSprite = function(displayObject, iParent) {
    var children = displayObject.children;
    var length = children.length;
    for (var i = length - 1;i >= 0;i--) {
      var child = children[i];
      if (child._interactive) {
        iParent.interactiveChildren = true;
        this.interactiveItems.push(child);
        if (child.children.length > 0) {
          this.collectInteractiveSprite(child, child);
        }
      } else {
        child.__iParent = null;
        if (child.children.length > 0) {
          this.collectInteractiveSprite(child, iParent);
        }
      }
    }
  };
  PIXI.InteractionManager.prototype.setTarget = function(target) {
    this.target = target;
    if (this.interactionDOMElement === null) {
      this.setTargetDomElement(target.view);
    }
  };
  PIXI.InteractionManager.prototype.setTargetDomElement = function(domElement) {
    this.removeEvents();
    if (window.navigator.msPointerEnabled) {
      domElement.style["-ms-content-zooming"] = "none";
      domElement.style["-ms-touch-action"] = "none";
    }
    this.interactionDOMElement = domElement;
    domElement.addEventListener("mousemove", this.onMouseMove, true);
    domElement.addEventListener("mousedown", this.onMouseDown, true);
    domElement.addEventListener("mouseout", this.onMouseOut, true);
    domElement.addEventListener("touchstart", this.onTouchStart, true);
    domElement.addEventListener("touchend", this.onTouchEnd, true);
    domElement.addEventListener("touchmove", this.onTouchMove, true);
    window.addEventListener("mouseup", this.onMouseUp, true);
  };
  PIXI.InteractionManager.prototype.removeEvents = function() {
    if (!this.interactionDOMElement) {
      return;
    }
    this.interactionDOMElement.style["-ms-content-zooming"] = "";
    this.interactionDOMElement.style["-ms-touch-action"] = "";
    this.interactionDOMElement.removeEventListener("mousemove", this.onMouseMove, true);
    this.interactionDOMElement.removeEventListener("mousedown", this.onMouseDown, true);
    this.interactionDOMElement.removeEventListener("mouseout", this.onMouseOut, true);
    this.interactionDOMElement.removeEventListener("touchstart", this.onTouchStart, true);
    this.interactionDOMElement.removeEventListener("touchend", this.onTouchEnd, true);
    this.interactionDOMElement.removeEventListener("touchmove", this.onTouchMove, true);
    this.interactionDOMElement = null;
    window.removeEventListener("mouseup", this.onMouseUp, true);
  };
  PIXI.InteractionManager.prototype.update = function() {
    if (!this.target) {
      return;
    }
    var now = Date.now();
    var diff = now - this.last;
    diff = diff * PIXI.INTERACTION_FREQUENCY / 1E3;
    if (diff < 1) {
      return;
    }
    this.last = now;
    var i = 0;
    if (this.dirty) {
      this.rebuildInteractiveGraph();
    }
    var length = this.interactiveItems.length;
    var cursor = "inherit";
    var over = false;
    for (i = 0;i < length;i++) {
      var item = this.interactiveItems[i];
      item.__hit = this.hitTest(item, this.mouse);
      this.mouse.target = item;
      if (item.__hit && !over) {
        if (item.buttonMode) {
          cursor = item.defaultCursor;
        }
        if (!item.interactiveChildren) {
          over = true;
        }
        if (!item.__isOver) {
          if (item.mouseover) {
            item.mouseover(this.mouse);
          }
          item.__isOver = true;
        }
      } else {
        if (item.__isOver) {
          if (item.mouseout) {
            item.mouseout(this.mouse);
          }
          item.__isOver = false;
        }
      }
    }
    if (this.currentCursorStyle !== cursor) {
      this.currentCursorStyle = cursor;
      this.interactionDOMElement.style.cursor = cursor;
    }
  };
  PIXI.InteractionManager.prototype.rebuildInteractiveGraph = function() {
    this.dirty = false;
    var len = this.interactiveItems.length;
    for (var i = 0;i < len;i++) {
      this.interactiveItems[i].interactiveChildren = false;
    }
    this.interactiveItems = [];
    if (this.stage.interactive) {
      this.interactiveItems.push(this.stage);
    }
    this.collectInteractiveSprite(this.stage, this.stage);
  };
  PIXI.InteractionManager.prototype.onMouseMove = function(event) {
    if (this.dirty) {
      this.rebuildInteractiveGraph();
    }
    this.mouse.originalEvent = event || window.event;
    var rect = this.interactionDOMElement.getBoundingClientRect();
    this.mouse.global.x = (event.clientX - rect.left) * (this.target.width / rect.width);
    this.mouse.global.y = (event.clientY - rect.top) * (this.target.height / rect.height);
    var length = this.interactiveItems.length;
    for (var i = 0;i < length;i++) {
      var item = this.interactiveItems[i];
      if (item.mousemove) {
        item.mousemove(this.mouse);
      }
    }
  };
  PIXI.InteractionManager.prototype.onMouseDown = function(event) {
    if (this.dirty) {
      this.rebuildInteractiveGraph();
    }
    this.mouse.originalEvent = event || window.event;
    if (PIXI.AUTO_PREVENT_DEFAULT) {
      this.mouse.originalEvent.preventDefault();
    }
    var length = this.interactiveItems.length;
    for (var i = 0;i < length;i++) {
      var item = this.interactiveItems[i];
      if (item.mousedown || item.click) {
        item.__mouseIsDown = true;
        item.__hit = this.hitTest(item, this.mouse);
        if (item.__hit) {
          if (item.mousedown) {
            item.mousedown(this.mouse);
          }
          item.__isDown = true;
          if (!item.interactiveChildren) {
            break;
          }
        }
      }
    }
  };
  PIXI.InteractionManager.prototype.onMouseOut = function() {
    if (this.dirty) {
      this.rebuildInteractiveGraph();
    }
    var length = this.interactiveItems.length;
    this.interactionDOMElement.style.cursor = "inherit";
    for (var i = 0;i < length;i++) {
      var item = this.interactiveItems[i];
      if (item.__isOver) {
        this.mouse.target = item;
        if (item.mouseout) {
          item.mouseout(this.mouse);
        }
        item.__isOver = false;
      }
    }
    this.mouseOut = true;
    this.mouse.global.x = -1E4;
    this.mouse.global.y = -1E4;
  };
  PIXI.InteractionManager.prototype.onMouseUp = function(event) {
    if (this.dirty) {
      this.rebuildInteractiveGraph();
    }
    this.mouse.originalEvent = event || window.event;
    var length = this.interactiveItems.length;
    var up = false;
    for (var i = 0;i < length;i++) {
      var item = this.interactiveItems[i];
      item.__hit = this.hitTest(item, this.mouse);
      if (item.__hit && !up) {
        if (item.mouseup) {
          item.mouseup(this.mouse);
        }
        if (item.__isDown) {
          if (item.click) {
            item.click(this.mouse);
          }
        }
        if (!item.interactiveChildren) {
          up = true;
        }
      } else {
        if (item.__isDown) {
          if (item.mouseupoutside) {
            item.mouseupoutside(this.mouse);
          }
        }
      }
      item.__isDown = false;
    }
  };
  PIXI.InteractionManager.prototype.hitTest = function(item, interactionData) {
    var global = interactionData.global;
    if (!item.worldVisible) {
      return false;
    }
    var isSprite = item instanceof PIXI.Sprite, worldTransform = item.worldTransform, a00 = worldTransform.a, a01 = worldTransform.b, a02 = worldTransform.tx, a10 = worldTransform.c, a11 = worldTransform.d, a12 = worldTransform.ty, id = 1 / (a00 * a11 + a01 * -a10), x = a11 * id * global.x + -a01 * id * global.y + (a12 * a01 - a02 * a11) * id, y = a00 * id * global.y + -a10 * id * global.x + (-a12 * a00 + a02 * a10) * id;
    interactionData.target = item;
    if (item.hitArea && item.hitArea.contains) {
      if (item.hitArea.contains(x, y)) {
        interactionData.target = item;
        return true;
      }
      return false;
    } else {
      if (isSprite) {
        var width = item.texture.frame.width, height = item.texture.frame.height, x1 = -width * item.anchor.x, y1;
        if (x > x1 && x < x1 + width) {
          y1 = -height * item.anchor.y;
          if (y > y1 && y < y1 + height) {
            interactionData.target = item;
            return true;
          }
        }
      }
    }
    var length = item.children.length;
    for (var i = 0;i < length;i++) {
      var tempItem = item.children[i];
      var hit = this.hitTest(tempItem, interactionData);
      if (hit) {
        interactionData.target = item;
        return true;
      }
    }
    return false;
  };
  PIXI.InteractionManager.prototype.onTouchMove = function(event) {
    if (this.dirty) {
      this.rebuildInteractiveGraph();
    }
    var rect = this.interactionDOMElement.getBoundingClientRect();
    var changedTouches = event.changedTouches;
    var touchData;
    var i = 0;
    for (i = 0;i < changedTouches.length;i++) {
      var touchEvent = changedTouches[i];
      touchData = this.touchs[touchEvent.identifier];
      touchData.originalEvent = event || window.event;
      touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
      touchData.global.y = (touchEvent.clientY - rect.top) * (this.target.height / rect.height);
      if (navigator.isCocoonJS) {
        touchData.global.x = touchEvent.clientX;
        touchData.global.y = touchEvent.clientY;
      }
      for (var j = 0;j < this.interactiveItems.length;j++) {
        var item = this.interactiveItems[j];
        if (item.touchmove && item.__touchData && item.__touchData[touchEvent.identifier]) {
          item.touchmove(touchData);
        }
      }
    }
  };
  PIXI.InteractionManager.prototype.onTouchStart = function(event) {
    if (this.dirty) {
      this.rebuildInteractiveGraph();
    }
    var rect = this.interactionDOMElement.getBoundingClientRect();
    if (PIXI.AUTO_PREVENT_DEFAULT) {
      event.preventDefault();
    }
    var changedTouches = event.changedTouches;
    for (var i = 0;i < changedTouches.length;i++) {
      var touchEvent = changedTouches[i];
      var touchData = this.pool.pop();
      if (!touchData) {
        touchData = new PIXI.InteractionData;
      }
      touchData.originalEvent = event || window.event;
      this.touchs[touchEvent.identifier] = touchData;
      touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
      touchData.global.y = (touchEvent.clientY - rect.top) * (this.target.height / rect.height);
      if (navigator.isCocoonJS) {
        touchData.global.x = touchEvent.clientX;
        touchData.global.y = touchEvent.clientY;
      }
      var length = this.interactiveItems.length;
      for (var j = 0;j < length;j++) {
        var item = this.interactiveItems[j];
        if (item.touchstart || item.tap) {
          item.__hit = this.hitTest(item, touchData);
          if (item.__hit) {
            if (item.touchstart) {
              item.touchstart(touchData);
            }
            item.__isDown = true;
            item.__touchData = item.__touchData || {};
            item.__touchData[touchEvent.identifier] = touchData;
            if (!item.interactiveChildren) {
              break;
            }
          }
        }
      }
    }
  };
  PIXI.InteractionManager.prototype.onTouchEnd = function(event) {
    if (this.dirty) {
      this.rebuildInteractiveGraph();
    }
    var rect = this.interactionDOMElement.getBoundingClientRect();
    var changedTouches = event.changedTouches;
    for (var i = 0;i < changedTouches.length;i++) {
      var touchEvent = changedTouches[i];
      var touchData = this.touchs[touchEvent.identifier];
      var up = false;
      touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
      touchData.global.y = (touchEvent.clientY - rect.top) * (this.target.height / rect.height);
      if (navigator.isCocoonJS) {
        touchData.global.x = touchEvent.clientX;
        touchData.global.y = touchEvent.clientY;
      }
      var length = this.interactiveItems.length;
      for (var j = 0;j < length;j++) {
        var item = this.interactiveItems[j];
        if (item.__touchData && item.__touchData[touchEvent.identifier]) {
          item.__hit = this.hitTest(item, item.__touchData[touchEvent.identifier]);
          touchData.originalEvent = event || window.event;
          if (item.touchend || item.tap) {
            if (item.__hit && !up) {
              if (item.touchend) {
                item.touchend(touchData);
              }
              if (item.__isDown) {
                if (item.tap) {
                  item.tap(touchData);
                }
              }
              if (!item.interactiveChildren) {
                up = true;
              }
            } else {
              if (item.__isDown) {
                if (item.touchendoutside) {
                  item.touchendoutside(touchData);
                }
              }
            }
            item.__isDown = false;
          }
          item.__touchData[touchEvent.identifier] = null;
        }
      }
      this.pool.push(touchData);
      this.touchs[touchEvent.identifier] = null;
    }
  };
  PIXI.Stage = function(backgroundColor) {
    PIXI.DisplayObjectContainer.call(this);
    this.worldTransform = new PIXI.Matrix;
    this.interactive = true;
    this.interactionManager = new PIXI.InteractionManager(this);
    this.dirty = true;
    this.stage = this;
    this.stage.hitArea = new PIXI.Rectangle(0, 0, 1E5, 1E5);
    this.setBackgroundColor(backgroundColor);
  };
  PIXI.Stage.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  PIXI.Stage.prototype.constructor = PIXI.Stage;
  PIXI.Stage.prototype.setInteractionDelegate = function(domElement) {
    this.interactionManager.setTargetDomElement(domElement);
  };
  PIXI.Stage.prototype.updateTransform = function() {
    this.worldAlpha = 1;
    for (var i = 0, j = this.children.length;i < j;i++) {
      this.children[i].updateTransform();
    }
    if (this.dirty) {
      this.dirty = false;
      this.interactionManager.dirty = true;
    }
    if (this.interactive) {
      this.interactionManager.update();
    }
  };
  PIXI.Stage.prototype.setBackgroundColor = function(backgroundColor) {
    this.backgroundColor = backgroundColor || 0;
    this.backgroundColorSplit = PIXI.hex2rgb(this.backgroundColor);
    var hex = this.backgroundColor.toString(16);
    hex = "000000".substr(0, 6 - hex.length) + hex;
    this.backgroundColorString = "#" + hex;
  };
  PIXI.Stage.prototype.getMousePosition = function() {
    return this.interactionManager.mouse.global;
  };
  var lastTime = 0;
  var vendors = ["ms", "moz", "webkit", "o"];
  for (var x = 0;x < vendors.length && !window.requestAnimationFrame;++x) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = (new Date).getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
  window.requestAnimFrame = window.requestAnimationFrame;
  PIXI.hex2rgb = function(hex) {
    return[(hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (hex & 255) / 255];
  };
  PIXI.rgb2hex = function(rgb) {
    return(rgb[0] * 255 << 16) + (rgb[1] * 255 << 8) + rgb[2] * 255;
  };
  if (typeof Function.prototype.bind !== "function") {
    Function.prototype.bind = function() {
      var slice = Array.prototype.slice;
      return function(thisArg) {
        var target = this, boundArgs = slice.call(arguments, 1);
        if (typeof target !== "function") {
          throw new TypeError;
        }
        function bound() {
          var args = boundArgs.concat(slice.call(arguments));
          target.apply(this instanceof bound ? this : thisArg, args);
        }
        bound.prototype = function F(proto) {
          if (proto) {
            F.prototype = proto;
          }
          if (!(this instanceof F)) {
            return new F;
          }
        }(target.prototype);
        return bound;
      };
    }();
  }
  PIXI.AjaxRequest = function() {
    var activexmodes = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Microsoft.XMLHTTP"];
    if (window.ActiveXObject) {
      for (var i = 0;i < activexmodes.length;i++) {
        try {
          return new window.ActiveXObject(activexmodes[i]);
        } catch (e) {
        }
      }
    } else {
      if (window.XMLHttpRequest) {
        return new window.XMLHttpRequest;
      } else {
        return false;
      }
    }
  };
  PIXI.canUseNewCanvasBlendModes = function() {
    var canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    var context = canvas.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0, 0, 1, 1);
    context.globalCompositeOperation = "multiply";
    context.fillStyle = "#fff";
    context.fillRect(0, 0, 1, 1);
    return context.getImageData(0, 0, 1, 1).data[0] === 0;
  };
  PIXI.getNextPowerOfTwo = function(number) {
    if (number > 0 && (number & number - 1) === 0) {
      return number;
    } else {
      var result = 1;
      while (result < number) {
        result <<= 1;
      }
      return result;
    }
  };
  PIXI.EventTarget = function() {
    var listeners = {};
    this.addEventListener = this.on = function(type, listener) {
      if (listeners[type] === undefined) {
        listeners[type] = [];
      }
      if (listeners[type].indexOf(listener) === -1) {
        listeners[type].unshift(listener);
      }
    };
    this.dispatchEvent = this.emit = function(event) {
      if (!listeners[event.type] || !listeners[event.type].length) {
        return;
      }
      for (var i = listeners[event.type].length - 1;i >= 0;i--) {
        listeners[event.type][i](event);
      }
    };
    this.removeEventListener = this.off = function(type, listener) {
      if (listeners[type] === undefined) {
        return;
      }
      var index = listeners[type].indexOf(listener);
      if (index !== -1) {
        listeners[type].splice(index, 1);
      }
    };
    this.removeAllEventListeners = function(type) {
      var a = listeners[type];
      if (a) {
        a.length = 0;
      }
    };
  };
  PIXI.autoDetectRenderer = function(width, height, view, transparent, antialias) {
    if (!width) {
      width = 800;
    }
    if (!height) {
      height = 600;
    }
    var webgl = function() {
      try {
        var canvas = document.createElement("canvas");
        return!!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
      } catch (e) {
        return false;
      }
    }();
    if (webgl) {
      return new PIXI.WebGLRenderer(width, height, view, transparent, antialias);
    }
    return new PIXI.CanvasRenderer(width, height, view, transparent);
  };
  PIXI.autoDetectRecommendedRenderer = function(width, height, view, transparent, antialias) {
    if (!width) {
      width = 800;
    }
    if (!height) {
      height = 600;
    }
    var webgl = function() {
      try {
        var canvas = document.createElement("canvas");
        return!!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
      } catch (e) {
        return false;
      }
    }();
    var isAndroid = /Android/i.test(navigator.userAgent);
    if (webgl && !isAndroid) {
      return new PIXI.WebGLRenderer(width, height, view, transparent, antialias);
    }
    return new PIXI.CanvasRenderer(width, height, view, transparent);
  };
  PIXI.PolyK = {};
  PIXI.PolyK.Triangulate = function(p) {
    var sign = true;
    var n = p.length >> 1;
    if (n < 3) {
      return[];
    }
    var tgs = [];
    var avl = [];
    for (var i = 0;i < n;i++) {
      avl.push(i);
    }
    i = 0;
    var al = n;
    while (al > 3) {
      var i0 = avl[(i + 0) % al];
      var i1 = avl[(i + 1) % al];
      var i2 = avl[(i + 2) % al];
      var ax = p[2 * i0], ay = p[2 * i0 + 1];
      var bx = p[2 * i1], by = p[2 * i1 + 1];
      var cx = p[2 * i2], cy = p[2 * i2 + 1];
      var earFound = false;
      if (PIXI.PolyK._convex(ax, ay, bx, by, cx, cy, sign)) {
        earFound = true;
        for (var j = 0;j < al;j++) {
          var vi = avl[j];
          if (vi === i0 || vi === i1 || vi === i2) {
            continue;
          }
          if (PIXI.PolyK._PointInTriangle(p[2 * vi], p[2 * vi + 1], ax, ay, bx, by, cx, cy)) {
            earFound = false;
            break;
          }
        }
      }
      if (earFound) {
        tgs.push(i0, i1, i2);
        avl.splice((i + 1) % al, 1);
        al--;
        i = 0;
      } else {
        if (i++ > 3 * al) {
          if (sign) {
            tgs = [];
            avl = [];
            for (i = 0;i < n;i++) {
              avl.push(i);
            }
            i = 0;
            al = n;
            sign = false;
          } else {
            window.console.log("PIXI Warning: shape too complex to fill");
            return[];
          }
        }
      }
    }
    tgs.push(avl[0], avl[1], avl[2]);
    return tgs;
  };
  PIXI.PolyK._PointInTriangle = function(px, py, ax, ay, bx, by, cx, cy) {
    var v0x = cx - ax;
    var v0y = cy - ay;
    var v1x = bx - ax;
    var v1y = by - ay;
    var v2x = px - ax;
    var v2y = py - ay;
    var dot00 = v0x * v0x + v0y * v0y;
    var dot01 = v0x * v1x + v0y * v1y;
    var dot02 = v0x * v2x + v0y * v2y;
    var dot11 = v1x * v1x + v1y * v1y;
    var dot12 = v1x * v2x + v1y * v2y;
    var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    return u >= 0 && v >= 0 && u + v < 1;
  };
  PIXI.PolyK._convex = function(ax, ay, bx, by, cx, cy, sign) {
    return(ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0 === sign;
  };
  PIXI.initDefaultShaders = function() {
  };
  PIXI.CompileVertexShader = function(gl, shaderSrc) {
    return PIXI._CompileShader(gl, shaderSrc, gl.VERTEX_SHADER);
  };
  PIXI.CompileFragmentShader = function(gl, shaderSrc) {
    return PIXI._CompileShader(gl, shaderSrc, gl.FRAGMENT_SHADER);
  };
  PIXI._CompileShader = function(gl, shaderSrc, shaderType) {
    var src = shaderSrc.join("\n");
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      window.console.log(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };
  PIXI.compileProgram = function(gl, vertexSrc, fragmentSrc) {
    var fragmentShader = PIXI.CompileFragmentShader(gl, fragmentSrc);
    var vertexShader = PIXI.CompileVertexShader(gl, vertexSrc);
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      window.console.log("Could not initialise shaders");
    }
    return shaderProgram;
  };
  PIXI.PixiShader = function(gl) {
    this._UID = PIXI._UID++;
    this.gl = gl;
    this.program = null;
    this.fragmentSrc = ["precision lowp float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}"];
    this.textureCount = 0;
    this.attributes = [];
    this.init();
  };
  PIXI.PixiShader.prototype.init = function() {
    var gl = this.gl;
    var program = PIXI.compileProgram(gl, this.vertexSrc || PIXI.PixiShader.defaultVertexSrc, this.fragmentSrc);
    gl.useProgram(program);
    this.uSampler = gl.getUniformLocation(program, "uSampler");
    this.projectionVector = gl.getUniformLocation(program, "projectionVector");
    this.offsetVector = gl.getUniformLocation(program, "offsetVector");
    this.dimensions = gl.getUniformLocation(program, "dimensions");
    this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
    this.colorAttribute = gl.getAttribLocation(program, "aColor");
    if (this.colorAttribute === -1) {
      this.colorAttribute = 2;
    }
    this.attributes = [this.aVertexPosition, this.aTextureCoord, this.colorAttribute];
    for (var key in this.uniforms) {
      this.uniforms[key].uniformLocation = gl.getUniformLocation(program, key);
    }
    this.initUniforms();
    this.program = program;
  };
  PIXI.PixiShader.prototype.initUniforms = function() {
    this.textureCount = 1;
    var gl = this.gl;
    var uniform;
    for (var key in this.uniforms) {
      uniform = this.uniforms[key];
      var type = uniform.type;
      if (type === "sampler2D") {
        uniform._init = false;
        if (uniform.value !== null) {
          this.initSampler2D(uniform);
        }
      } else {
        if (type === "mat2" || type === "mat3" || type === "mat4") {
          uniform.glMatrix = true;
          uniform.glValueLength = 1;
          if (type === "mat2") {
            uniform.glFunc = gl.uniformMatrix2fv;
          } else {
            if (type === "mat3") {
              uniform.glFunc = gl.uniformMatrix3fv;
            } else {
              if (type === "mat4") {
                uniform.glFunc = gl.uniformMatrix4fv;
              }
            }
          }
        } else {
          uniform.glFunc = gl["uniform" + type];
          if (type === "2f" || type === "2i") {
            uniform.glValueLength = 2;
          } else {
            if (type === "3f" || type === "3i") {
              uniform.glValueLength = 3;
            } else {
              if (type === "4f" || type === "4i") {
                uniform.glValueLength = 4;
              } else {
                uniform.glValueLength = 1;
              }
            }
          }
        }
      }
    }
  };
  PIXI.PixiShader.prototype.initSampler2D = function(uniform) {
    if (!uniform.value || !uniform.value.baseTexture || !uniform.value.baseTexture.hasLoaded) {
      return;
    }
    var gl = this.gl;
    gl.activeTexture(gl["TEXTURE" + this.textureCount]);
    gl.bindTexture(gl.TEXTURE_2D, uniform.value.baseTexture._glTextures[gl.id]);
    if (uniform.textureData) {
      var data = uniform.textureData;
      var magFilter = data.magFilter ? data.magFilter : gl.LINEAR;
      var minFilter = data.minFilter ? data.minFilter : gl.LINEAR;
      var wrapS = data.wrapS ? data.wrapS : gl.CLAMP_TO_EDGE;
      var wrapT = data.wrapT ? data.wrapT : gl.CLAMP_TO_EDGE;
      var format = data.luminance ? gl.LUMINANCE : gl.RGBA;
      if (data.repeat) {
        wrapS = gl.REPEAT;
        wrapT = gl.REPEAT;
      }
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!data.flipY);
      if (data.width) {
        var width = data.width ? data.width : 512;
        var height = data.height ? data.height : 2;
        var border = data.border ? data.border : 0;
        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, border, format, gl.UNSIGNED_BYTE, null);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, format, gl.RGBA, gl.UNSIGNED_BYTE, uniform.value.baseTexture.source);
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    }
    gl.uniform1i(uniform.uniformLocation, this.textureCount);
    uniform._init = true;
    this.textureCount++;
  };
  PIXI.PixiShader.prototype.syncUniforms = function() {
    this.textureCount = 1;
    var uniform;
    var gl = this.gl;
    for (var key in this.uniforms) {
      uniform = this.uniforms[key];
      if (uniform.glValueLength === 1) {
        if (uniform.glMatrix === true) {
          uniform.glFunc.call(gl, uniform.uniformLocation, uniform.transpose, uniform.value);
        } else {
          uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value);
        }
      } else {
        if (uniform.glValueLength === 2) {
          uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y);
        } else {
          if (uniform.glValueLength === 3) {
            uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y, uniform.value.z);
          } else {
            if (uniform.glValueLength === 4) {
              uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y, uniform.value.z, uniform.value.w);
            } else {
              if (uniform.type === "sampler2D") {
                if (uniform._init) {
                  gl.activeTexture(gl["TEXTURE" + this.textureCount]);
                  gl.bindTexture(gl.TEXTURE_2D, uniform.value.baseTexture._glTextures[gl.id] || PIXI.createWebGLTexture(uniform.value.baseTexture, gl));
                  gl.uniform1i(uniform.uniformLocation, this.textureCount);
                  this.textureCount++;
                } else {
                  this.initSampler2D(uniform);
                }
              }
            }
          }
        }
      }
    }
  };
  PIXI.PixiShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program);
    this.uniforms = null;
    this.gl = null;
    this.attributes = null;
  };
  PIXI.PixiShader.defaultVertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "attribute vec2 aColor;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "const vec2 center = vec2(-1.0, 1.0);", "void main(void) {", "   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vec3 color = mod(vec3(aColor.y/65536.0, aColor.y/256.0, aColor.y), 256.0) / 256.0;", 
  "   vColor = vec4(color * aColor.x, aColor.x);", "}"];
  PIXI.PixiFastShader = function(gl) {
    this._UID = PIXI._UID++;
    this.gl = gl;
    this.program = null;
    this.fragmentSrc = ["precision lowp float;", "varying vec2 vTextureCoord;", "varying float vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}"];
    this.vertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec2 aPositionCoord;", "attribute vec2 aScale;", "attribute float aRotation;", "attribute vec2 aTextureCoord;", "attribute float aColor;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform mat3 uMatrix;", "varying vec2 vTextureCoord;", "varying float vColor;", "const vec2 center = vec2(-1.0, 1.0);", "void main(void) {", "   vec2 v;", "   vec2 sv = aVertexPosition * aScale;", "   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);", 
    "   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);", "   v = ( uMatrix * vec3(v + aPositionCoord , 1.0) ).xy ;", "   gl_Position = vec4( ( v / projectionVector) + center , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vColor = aColor;", "}"];
    this.textureCount = 0;
    this.init();
  };
  PIXI.PixiFastShader.prototype.init = function() {
    var gl = this.gl;
    var program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
    gl.useProgram(program);
    this.uSampler = gl.getUniformLocation(program, "uSampler");
    this.projectionVector = gl.getUniformLocation(program, "projectionVector");
    this.offsetVector = gl.getUniformLocation(program, "offsetVector");
    this.dimensions = gl.getUniformLocation(program, "dimensions");
    this.uMatrix = gl.getUniformLocation(program, "uMatrix");
    this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    this.aPositionCoord = gl.getAttribLocation(program, "aPositionCoord");
    this.aScale = gl.getAttribLocation(program, "aScale");
    this.aRotation = gl.getAttribLocation(program, "aRotation");
    this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
    this.colorAttribute = gl.getAttribLocation(program, "aColor");
    if (this.colorAttribute === -1) {
      this.colorAttribute = 2;
    }
    this.attributes = [this.aVertexPosition, this.aPositionCoord, this.aScale, this.aRotation, this.aTextureCoord, this.colorAttribute];
    this.program = program;
  };
  PIXI.PixiFastShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program);
    this.uniforms = null;
    this.gl = null;
    this.attributes = null;
  };
  PIXI.StripShader = function(gl) {
    this._UID = PIXI._UID++;
    this.gl = gl;
    this.program = null;
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "uniform float alpha;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));", "}"];
    this.vertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "varying vec2 vTextureCoord;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "}"];
    this.init();
  };
  PIXI.StripShader.prototype.init = function() {
    var gl = this.gl;
    var program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
    gl.useProgram(program);
    this.uSampler = gl.getUniformLocation(program, "uSampler");
    this.projectionVector = gl.getUniformLocation(program, "projectionVector");
    this.offsetVector = gl.getUniformLocation(program, "offsetVector");
    this.colorAttribute = gl.getAttribLocation(program, "aColor");
    this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
    this.attributes = [this.aVertexPosition, this.aTextureCoord];
    this.translationMatrix = gl.getUniformLocation(program, "translationMatrix");
    this.alpha = gl.getUniformLocation(program, "alpha");
    this.program = program;
  };
  PIXI.PrimitiveShader = function(gl) {
    this._UID = PIXI._UID++;
    this.gl = gl;
    this.program = null;
    this.fragmentSrc = ["precision mediump float;", "varying vec4 vColor;", "void main(void) {", "   gl_FragColor = vColor;", "}"];
    this.vertexSrc = ["attribute vec2 aVertexPosition;", "attribute vec4 aColor;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform float alpha;", "uniform vec3 tint;", "varying vec4 vColor;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);", "   vColor = aColor * vec4(tint * alpha, alpha);", 
    "}"];
    this.init();
  };
  PIXI.PrimitiveShader.prototype.init = function() {
    var gl = this.gl;
    var program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
    gl.useProgram(program);
    this.projectionVector = gl.getUniformLocation(program, "projectionVector");
    this.offsetVector = gl.getUniformLocation(program, "offsetVector");
    this.tintColor = gl.getUniformLocation(program, "tint");
    this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    this.colorAttribute = gl.getAttribLocation(program, "aColor");
    this.attributes = [this.aVertexPosition, this.colorAttribute];
    this.translationMatrix = gl.getUniformLocation(program, "translationMatrix");
    this.alpha = gl.getUniformLocation(program, "alpha");
    this.program = program;
  };
  PIXI.PrimitiveShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program);
    this.uniforms = null;
    this.gl = null;
    this.attribute = null;
  };
  PIXI.ComplexPrimitiveShader = function(gl) {
    this._UID = PIXI._UID++;
    this.gl = gl;
    this.program = null;
    this.fragmentSrc = ["precision mediump float;", "varying vec4 vColor;", "void main(void) {", "   gl_FragColor = vColor;", "}"];
    this.vertexSrc = ["attribute vec2 aVertexPosition;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform vec3 tint;", "uniform float alpha;", "uniform vec3 color;", "varying vec4 vColor;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);", "   vColor = vec4(color * alpha * tint, alpha);", 
    "}"];
    this.init();
  };
  PIXI.ComplexPrimitiveShader.prototype.init = function() {
    var gl = this.gl;
    var program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
    gl.useProgram(program);
    this.projectionVector = gl.getUniformLocation(program, "projectionVector");
    this.offsetVector = gl.getUniformLocation(program, "offsetVector");
    this.tintColor = gl.getUniformLocation(program, "tint");
    this.color = gl.getUniformLocation(program, "color");
    this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    this.attributes = [this.aVertexPosition, this.colorAttribute];
    this.translationMatrix = gl.getUniformLocation(program, "translationMatrix");
    this.alpha = gl.getUniformLocation(program, "alpha");
    this.program = program;
  };
  PIXI.ComplexPrimitiveShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program);
    this.uniforms = null;
    this.gl = null;
    this.attribute = null;
  };
  PIXI.WebGLGraphics = function() {
  };
  PIXI.WebGLGraphics.renderGraphics = function(graphics, renderSession) {
    var gl = renderSession.gl;
    var projection = renderSession.projection, offset = renderSession.offset, shader = renderSession.shaderManager.primitiveShader, webGLData;
    if (graphics.dirty) {
      PIXI.WebGLGraphics.updateGraphics(graphics, gl);
    }
    var webGL = graphics._webGL[gl.id];
    for (var i = 0;i < webGL.data.length;i++) {
      if (webGL.data[i].mode === 1) {
        webGLData = webGL.data[i];
        renderSession.stencilManager.pushStencil(graphics, webGLData, renderSession);
        gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, (webGLData.indices.length - 4) * 2);
        renderSession.stencilManager.popStencil(graphics, webGLData, renderSession);
        this.last = webGLData.mode;
      } else {
        webGLData = webGL.data[i];
        renderSession.shaderManager.setShader(shader);
        shader = renderSession.shaderManager.primitiveShader;
        gl.uniformMatrix3fv(shader.translationMatrix, false, graphics.worldTransform.toArray(true));
        gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
        gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
        gl.uniform3fv(shader.tintColor, PIXI.hex2rgb(graphics.tint));
        gl.uniform1f(shader.alpha, graphics.worldAlpha);
        gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
        gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
        gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 4 * 6, 2 * 4);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
        gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
      }
    }
  };
  PIXI.WebGLGraphics.updateGraphics = function(graphics, gl) {
    var webGL = graphics._webGL[gl.id];
    if (!webGL) {
      webGL = graphics._webGL[gl.id] = {lastIndex:0, data:[], gl:gl};
    }
    graphics.dirty = false;
    var i;
    if (graphics.clearDirty) {
      graphics.clearDirty = false;
      for (i = 0;i < webGL.data.length;i++) {
        var graphicsData = webGL.data[i];
        graphicsData.reset();
        PIXI.WebGLGraphics.graphicsDataPool.push(graphicsData);
      }
      webGL.data = [];
      webGL.lastIndex = 0;
    }
    var webGLData;
    for (i = webGL.lastIndex;i < graphics.graphicsData.length;i++) {
      var data = graphics.graphicsData[i];
      if (data.type === PIXI.Graphics.POLY) {
        if (data.fill) {
          if (data.points.length > 6) {
            if (data.points.length > 5 * 2) {
              webGLData = PIXI.WebGLGraphics.switchMode(webGL, 1);
              PIXI.WebGLGraphics.buildComplexPoly(data, webGLData);
            } else {
              webGLData = PIXI.WebGLGraphics.switchMode(webGL, 0);
              PIXI.WebGLGraphics.buildPoly(data, webGLData);
            }
          }
        }
        if (data.lineWidth > 0) {
          webGLData = PIXI.WebGLGraphics.switchMode(webGL, 0);
          PIXI.WebGLGraphics.buildLine(data, webGLData);
        }
      } else {
        webGLData = PIXI.WebGLGraphics.switchMode(webGL, 0);
        if (data.type === PIXI.Graphics.RECT) {
          PIXI.WebGLGraphics.buildRectangle(data, webGLData);
        } else {
          if (data.type === PIXI.Graphics.CIRC || data.type === PIXI.Graphics.ELIP) {
            PIXI.WebGLGraphics.buildCircle(data, webGLData);
          } else {
            if (data.type === PIXI.Graphics.RREC) {
              PIXI.WebGLGraphics.buildRoundedRectangle(data, webGLData);
            }
          }
        }
      }
      webGL.lastIndex++;
    }
    for (i = 0;i < webGL.data.length;i++) {
      webGLData = webGL.data[i];
      if (webGLData.dirty) {
        webGLData.upload();
      }
    }
  };
  PIXI.WebGLGraphics.switchMode = function(webGL, type) {
    var webGLData;
    if (!webGL.data.length) {
      webGLData = PIXI.WebGLGraphics.graphicsDataPool.pop() || new PIXI.WebGLGraphicsData(webGL.gl);
      webGLData.mode = type;
      webGL.data.push(webGLData);
    } else {
      webGLData = webGL.data[webGL.data.length - 1];
      if (webGLData.mode !== type || type === 1) {
        webGLData = PIXI.WebGLGraphics.graphicsDataPool.pop() || new PIXI.WebGLGraphicsData(webGL.gl);
        webGLData.mode = type;
        webGL.data.push(webGLData);
      }
    }
    webGLData.dirty = true;
    return webGLData;
  };
  PIXI.WebGLGraphics.buildRectangle = function(graphicsData, webGLData) {
    var rectData = graphicsData.points;
    var x = rectData[0];
    var y = rectData[1];
    var width = rectData[2];
    var height = rectData[3];
    if (graphicsData.fill) {
      var color = PIXI.hex2rgb(graphicsData.fillColor);
      var alpha = graphicsData.fillAlpha;
      var r = color[0] * alpha;
      var g = color[1] * alpha;
      var b = color[2] * alpha;
      var verts = webGLData.points;
      var indices = webGLData.indices;
      var vertPos = verts.length / 6;
      verts.push(x, y);
      verts.push(r, g, b, alpha);
      verts.push(x + width, y);
      verts.push(r, g, b, alpha);
      verts.push(x, y + height);
      verts.push(r, g, b, alpha);
      verts.push(x + width, y + height);
      verts.push(r, g, b, alpha);
      indices.push(vertPos, vertPos, vertPos + 1, vertPos + 2, vertPos + 3, vertPos + 3);
    }
    if (graphicsData.lineWidth) {
      var tempPoints = graphicsData.points;
      graphicsData.points = [x, y, x + width, y, x + width, y + height, x, y + height, x, y];
      PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);
      graphicsData.points = tempPoints;
    }
  };
  PIXI.WebGLGraphics.buildRoundedRectangle = function(graphicsData, webGLData) {
    var points = graphicsData.points;
    var x = points[0];
    var y = points[1];
    var width = points[2];
    var height = points[3];
    var radius = points[4];
    var recPoints = [];
    recPoints.push(x, y + radius);
    recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x, y + height - radius, x, y + height, x + radius, y + height));
    recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x + width - radius, y + height, x + width, y + height, x + width, y + height - radius));
    recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x + width, y + radius, x + width, y, x + width - radius, y));
    recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x + radius, y, x, y, x, y + radius));
    if (graphicsData.fill) {
      var color = PIXI.hex2rgb(graphicsData.fillColor);
      var alpha = graphicsData.fillAlpha;
      var r = color[0] * alpha;
      var g = color[1] * alpha;
      var b = color[2] * alpha;
      var verts = webGLData.points;
      var indices = webGLData.indices;
      var vecPos = verts.length / 6;
      var triangles = PIXI.PolyK.Triangulate(recPoints);
      var i = 0;
      for (i = 0;i < triangles.length;i += 3) {
        indices.push(triangles[i] + vecPos);
        indices.push(triangles[i] + vecPos);
        indices.push(triangles[i + 1] + vecPos);
        indices.push(triangles[i + 2] + vecPos);
        indices.push(triangles[i + 2] + vecPos);
      }
      for (i = 0;i < recPoints.length;i++) {
        verts.push(recPoints[i], recPoints[++i], r, g, b, alpha);
      }
    }
    if (graphicsData.lineWidth) {
      var tempPoints = graphicsData.points;
      graphicsData.points = recPoints;
      PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);
      graphicsData.points = tempPoints;
    }
  };
  PIXI.WebGLGraphics.quadraticBezierCurve = function(fromX, fromY, cpX, cpY, toX, toY) {
    var xa, ya, xb, yb, x, y, n = 20, points = [];
    function getPt(n1, n2, perc) {
      var diff = n2 - n1;
      return n1 + diff * perc;
    }
    var j = 0;
    for (var i = 0;i <= n;i++) {
      j = i / n;
      xa = getPt(fromX, cpX, j);
      ya = getPt(fromY, cpY, j);
      xb = getPt(cpX, toX, j);
      yb = getPt(cpY, toY, j);
      x = getPt(xa, xb, j);
      y = getPt(ya, yb, j);
      points.push(x, y);
    }
    return points;
  };
  PIXI.WebGLGraphics.buildCircle = function(graphicsData, webGLData) {
    var rectData = graphicsData.points;
    var x = rectData[0];
    var y = rectData[1];
    var width = rectData[2];
    var height = rectData[3];
    var totalSegs = 40;
    var seg = Math.PI * 2 / totalSegs;
    var i = 0;
    if (graphicsData.fill) {
      var color = PIXI.hex2rgb(graphicsData.fillColor);
      var alpha = graphicsData.fillAlpha;
      var r = color[0] * alpha;
      var g = color[1] * alpha;
      var b = color[2] * alpha;
      var verts = webGLData.points;
      var indices = webGLData.indices;
      var vecPos = verts.length / 6;
      indices.push(vecPos);
      for (i = 0;i < totalSegs + 1;i++) {
        verts.push(x, y, r, g, b, alpha);
        verts.push(x + Math.sin(seg * i) * width, y + Math.cos(seg * i) * height, r, g, b, alpha);
        indices.push(vecPos++, vecPos++);
      }
      indices.push(vecPos - 1);
    }
    if (graphicsData.lineWidth) {
      var tempPoints = graphicsData.points;
      graphicsData.points = [];
      for (i = 0;i < totalSegs + 1;i++) {
        graphicsData.points.push(x + Math.sin(seg * i) * width, y + Math.cos(seg * i) * height);
      }
      PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);
      graphicsData.points = tempPoints;
    }
  };
  PIXI.WebGLGraphics.buildLine = function(graphicsData, webGLData) {
    var i = 0;
    var points = graphicsData.points;
    if (points.length === 0) {
      return;
    }
    if (graphicsData.lineWidth % 2) {
      for (i = 0;i < points.length;i++) {
        points[i] += .5;
      }
    }
    var firstPoint = new PIXI.Point(points[0], points[1]);
    var lastPoint = new PIXI.Point(points[points.length - 2], points[points.length - 1]);
    if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y) {
      points = points.slice();
      points.pop();
      points.pop();
      lastPoint = new PIXI.Point(points[points.length - 2], points[points.length - 1]);
      var midPointX = lastPoint.x + (firstPoint.x - lastPoint.x) * .5;
      var midPointY = lastPoint.y + (firstPoint.y - lastPoint.y) * .5;
      points.unshift(midPointX, midPointY);
      points.push(midPointX, midPointY);
    }
    var verts = webGLData.points;
    var indices = webGLData.indices;
    var length = points.length / 2;
    var indexCount = points.length;
    var indexStart = verts.length / 6;
    var width = graphicsData.lineWidth / 2;
    var color = PIXI.hex2rgb(graphicsData.lineColor);
    var alpha = graphicsData.lineAlpha;
    var r = color[0] * alpha;
    var g = color[1] * alpha;
    var b = color[2] * alpha;
    var px, py, p1x, p1y, p2x, p2y, p3x, p3y;
    var perpx, perpy, perp2x, perp2y, perp3x, perp3y;
    var a1, b1, c1, a2, b2, c2;
    var denom, pdist, dist;
    p1x = points[0];
    p1y = points[1];
    p2x = points[2];
    p2y = points[3];
    perpx = -(p1y - p2y);
    perpy = p1x - p2x;
    dist = Math.sqrt(perpx * perpx + perpy * perpy);
    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;
    verts.push(p1x - perpx, p1y - perpy, r, g, b, alpha);
    verts.push(p1x + perpx, p1y + perpy, r, g, b, alpha);
    for (i = 1;i < length - 1;i++) {
      p1x = points[(i - 1) * 2];
      p1y = points[(i - 1) * 2 + 1];
      p2x = points[i * 2];
      p2y = points[i * 2 + 1];
      p3x = points[(i + 1) * 2];
      p3y = points[(i + 1) * 2 + 1];
      perpx = -(p1y - p2y);
      perpy = p1x - p2x;
      dist = Math.sqrt(perpx * perpx + perpy * perpy);
      perpx /= dist;
      perpy /= dist;
      perpx *= width;
      perpy *= width;
      perp2x = -(p2y - p3y);
      perp2y = p2x - p3x;
      dist = Math.sqrt(perp2x * perp2x + perp2y * perp2y);
      perp2x /= dist;
      perp2y /= dist;
      perp2x *= width;
      perp2y *= width;
      a1 = -perpy + p1y - (-perpy + p2y);
      b1 = -perpx + p2x - (-perpx + p1x);
      c1 = (-perpx + p1x) * (-perpy + p2y) - (-perpx + p2x) * (-perpy + p1y);
      a2 = -perp2y + p3y - (-perp2y + p2y);
      b2 = -perp2x + p2x - (-perp2x + p3x);
      c2 = (-perp2x + p3x) * (-perp2y + p2y) - (-perp2x + p2x) * (-perp2y + p3y);
      denom = a1 * b2 - a2 * b1;
      if (Math.abs(denom) < .1) {
        denom += 10.1;
        verts.push(p2x - perpx, p2y - perpy, r, g, b, alpha);
        verts.push(p2x + perpx, p2y + perpy, r, g, b, alpha);
        continue;
      }
      px = (b1 * c2 - b2 * c1) / denom;
      py = (a2 * c1 - a1 * c2) / denom;
      pdist = (px - p2x) * (px - p2x) + (py - p2y) + (py - p2y);
      if (pdist > 140 * 140) {
        perp3x = perpx - perp2x;
        perp3y = perpy - perp2y;
        dist = Math.sqrt(perp3x * perp3x + perp3y * perp3y);
        perp3x /= dist;
        perp3y /= dist;
        perp3x *= width;
        perp3y *= width;
        verts.push(p2x - perp3x, p2y - perp3y);
        verts.push(r, g, b, alpha);
        verts.push(p2x + perp3x, p2y + perp3y);
        verts.push(r, g, b, alpha);
        verts.push(p2x - perp3x, p2y - perp3y);
        verts.push(r, g, b, alpha);
        indexCount++;
      } else {
        verts.push(px, py);
        verts.push(r, g, b, alpha);
        verts.push(p2x - (px - p2x), p2y - (py - p2y));
        verts.push(r, g, b, alpha);
      }
    }
    p1x = points[(length - 2) * 2];
    p1y = points[(length - 2) * 2 + 1];
    p2x = points[(length - 1) * 2];
    p2y = points[(length - 1) * 2 + 1];
    perpx = -(p1y - p2y);
    perpy = p1x - p2x;
    dist = Math.sqrt(perpx * perpx + perpy * perpy);
    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;
    verts.push(p2x - perpx, p2y - perpy);
    verts.push(r, g, b, alpha);
    verts.push(p2x + perpx, p2y + perpy);
    verts.push(r, g, b, alpha);
    indices.push(indexStart);
    for (i = 0;i < indexCount;i++) {
      indices.push(indexStart++);
    }
    indices.push(indexStart - 1);
  };
  PIXI.WebGLGraphics.buildComplexPoly = function(graphicsData, webGLData) {
    var points = graphicsData.points.slice();
    if (points.length < 6) {
      return;
    }
    var indices = webGLData.indices;
    webGLData.points = points;
    webGLData.alpha = graphicsData.fillAlpha;
    webGLData.color = PIXI.hex2rgb(graphicsData.fillColor);
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    var x, y;
    for (var i = 0;i < points.length;i += 2) {
      x = points[i];
      y = points[i + 1];
      minX = x < minX ? x : minX;
      maxX = x > maxX ? x : maxX;
      minY = y < minY ? y : minY;
      maxY = y > maxY ? y : maxY;
    }
    points.push(minX, minY, maxX, minY, maxX, maxY, minX, maxY);
    var length = points.length / 2;
    for (i = 0;i < length;i++) {
      indices.push(i);
    }
  };
  PIXI.WebGLGraphics.buildPoly = function(graphicsData, webGLData) {
    var points = graphicsData.points;
    if (points.length < 6) {
      return;
    }
    var verts = webGLData.points;
    var indices = webGLData.indices;
    var length = points.length / 2;
    var color = PIXI.hex2rgb(graphicsData.fillColor);
    var alpha = graphicsData.fillAlpha;
    var r = color[0] * alpha;
    var g = color[1] * alpha;
    var b = color[2] * alpha;
    var triangles = PIXI.PolyK.Triangulate(points);
    var vertPos = verts.length / 6;
    var i = 0;
    for (i = 0;i < triangles.length;i += 3) {
      indices.push(triangles[i] + vertPos);
      indices.push(triangles[i] + vertPos);
      indices.push(triangles[i + 1] + vertPos);
      indices.push(triangles[i + 2] + vertPos);
      indices.push(triangles[i + 2] + vertPos);
    }
    for (i = 0;i < length;i++) {
      verts.push(points[i * 2], points[i * 2 + 1], r, g, b, alpha);
    }
  };
  PIXI.WebGLGraphics.graphicsDataPool = [];
  PIXI.WebGLGraphicsData = function(gl) {
    this.gl = gl;
    this.color = [0, 0, 0];
    this.points = [];
    this.indices = [];
    this.lastIndex = 0;
    this.buffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.mode = 1;
    this.alpha = 1;
    this.dirty = true;
  };
  PIXI.WebGLGraphicsData.prototype.reset = function() {
    this.points = [];
    this.indices = [];
    this.lastIndex = 0;
  };
  PIXI.WebGLGraphicsData.prototype.upload = function() {
    var gl = this.gl;
    this.glPoints = new Float32Array(this.points);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.glPoints, gl.STATIC_DRAW);
    this.glIndicies = new Uint16Array(this.indices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.glIndicies, gl.STATIC_DRAW);
    this.dirty = false;
  };
  PIXI.glContexts = [];
  PIXI.WebGLRenderer = function(width, height, view, transparent, antialias, preserveDrawingBuffer) {
    if (!PIXI.defaultRenderer) {
      PIXI.sayHello("webGL");
      PIXI.defaultRenderer = this;
    }
    this.type = PIXI.WEBGL_RENDERER;
    this.transparent = !!transparent;
    this.preserveDrawingBuffer = preserveDrawingBuffer;
    this.width = width || 800;
    this.height = height || 600;
    this.view = view || document.createElement("canvas");
    this.view.width = this.width;
    this.view.height = this.height;
    this.contextLost = this.handleContextLost.bind(this);
    this.contextRestoredLost = this.handleContextRestored.bind(this);
    this.view.addEventListener("webglcontextlost", this.contextLost, false);
    this.view.addEventListener("webglcontextrestored", this.contextRestoredLost, false);
    this.options = {alpha:this.transparent, antialias:!!antialias, premultipliedAlpha:!!transparent, stencil:true, preserveDrawingBuffer:preserveDrawingBuffer};
    var gl = null;
    ["experimental-webgl", "webgl"].forEach(function(name) {
      try {
        gl = gl || this.view.getContext(name, this.options);
      } catch (e) {
      }
    }, this);
    if (!gl) {
      throw new Error("This browser does not support webGL. Try using the canvas renderer" + this);
    }
    this.gl = gl;
    this.glContextId = gl.id = PIXI.WebGLRenderer.glContextId++;
    PIXI.glContexts[this.glContextId] = gl;
    if (!PIXI.blendModesWebGL) {
      PIXI.blendModesWebGL = [];
      PIXI.blendModesWebGL[PIXI.blendModes.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.ADD] = [gl.SRC_ALPHA, gl.DST_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.SCREEN] = [gl.SRC_ALPHA, gl.ONE];
      PIXI.blendModesWebGL[PIXI.blendModes.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
      PIXI.blendModesWebGL[PIXI.blendModes.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    }
    this.projection = new PIXI.Point;
    this.projection.x = this.width / 2;
    this.projection.y = -this.height / 2;
    this.offset = new PIXI.Point(0, 0);
    this.resize(this.width, this.height);
    this.contextLost = false;
    this.shaderManager = new PIXI.WebGLShaderManager(gl);
    this.spriteBatch = new PIXI.WebGLSpriteBatch(gl);
    this.maskManager = new PIXI.WebGLMaskManager(gl);
    this.filterManager = new PIXI.WebGLFilterManager(gl, this.transparent);
    this.stencilManager = new PIXI.WebGLStencilManager(gl);
    this.blendModeManager = new PIXI.WebGLBlendModeManager(gl);
    this.renderSession = {};
    this.renderSession.gl = this.gl;
    this.renderSession.drawCount = 0;
    this.renderSession.shaderManager = this.shaderManager;
    this.renderSession.maskManager = this.maskManager;
    this.renderSession.filterManager = this.filterManager;
    this.renderSession.blendModeManager = this.blendModeManager;
    this.renderSession.spriteBatch = this.spriteBatch;
    this.renderSession.stencilManager = this.stencilManager;
    this.renderSession.renderer = this;
    gl.useProgram(this.shaderManager.defaultShader.program);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.colorMask(true, true, true, this.transparent);
  };
  PIXI.WebGLRenderer.prototype.constructor = PIXI.WebGLRenderer;
  PIXI.WebGLRenderer.prototype.render = function(stage) {
    if (this.contextLost) {
      return;
    }
    if (this.__stage !== stage) {
      if (stage.interactive) {
        stage.interactionManager.removeEvents();
      }
      this.__stage = stage;
    }
    PIXI.WebGLRenderer.updateTextures();
    stage.updateTransform();
    if (stage._interactive) {
      if (!stage._interactiveEventsAdded) {
        stage._interactiveEventsAdded = true;
        stage.interactionManager.setTarget(this);
      }
    }
    var gl = this.gl;
    gl.viewport(0, 0, this.width, this.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (this.transparent) {
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(stage.backgroundColorSplit[0], stage.backgroundColorSplit[1], stage.backgroundColorSplit[2], 1);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.renderDisplayObject(stage, this.projection);
    if (stage.interactive) {
      if (!stage._interactiveEventsAdded) {
        stage._interactiveEventsAdded = true;
        stage.interactionManager.setTarget(this);
      }
    } else {
      if (stage._interactiveEventsAdded) {
        stage._interactiveEventsAdded = false;
        stage.interactionManager.setTarget(this);
      }
    }
  };
  PIXI.WebGLRenderer.prototype.renderDisplayObject = function(displayObject, projection, buffer) {
    this.renderSession.blendModeManager.setBlendMode(PIXI.blendModes.NORMAL);
    this.renderSession.drawCount = 0;
    this.renderSession.currentBlendMode = 9999;
    this.renderSession.projection = projection;
    this.renderSession.offset = this.offset;
    this.spriteBatch.begin(this.renderSession);
    this.filterManager.begin(this.renderSession, buffer);
    displayObject._renderWebGL(this.renderSession);
    this.spriteBatch.end();
  };
  PIXI.WebGLRenderer.updateTextures = function() {
    var i = 0;
    for (i = 0;i < PIXI.Texture.frameUpdates.length;i++) {
      PIXI.WebGLRenderer.updateTextureFrame(PIXI.Texture.frameUpdates[i]);
    }
    for (i = 0;i < PIXI.texturesToDestroy.length;i++) {
      PIXI.WebGLRenderer.destroyTexture(PIXI.texturesToDestroy[i]);
    }
    PIXI.texturesToUpdate.length = 0;
    PIXI.texturesToDestroy.length = 0;
    PIXI.Texture.frameUpdates.length = 0;
  };
  PIXI.WebGLRenderer.destroyTexture = function(texture) {
    for (var i = texture._glTextures.length - 1;i >= 0;i--) {
      var glTexture = texture._glTextures[i];
      var gl = PIXI.glContexts[i];
      if (gl && glTexture) {
        gl.deleteTexture(glTexture);
      }
    }
    texture._glTextures.length = 0;
  };
  PIXI.WebGLRenderer.updateTextureFrame = function(texture) {
    texture._updateWebGLuvs();
  };
  PIXI.WebGLRenderer.prototype.resize = function(width, height) {
    this.width = width;
    this.height = height;
    this.view.width = width;
    this.view.height = height;
    this.gl.viewport(0, 0, this.width, this.height);
    this.projection.x = this.width / 2;
    this.projection.y = -this.height / 2;
  };
  PIXI.createWebGLTexture = function(texture, gl) {
    if (texture.hasLoaded) {
      texture._glTextures[gl.id] = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
      if (!texture._powerOf2) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      }
      gl.bindTexture(gl.TEXTURE_2D, null);
      texture._dirty[gl.id] = false;
    }
    return texture._glTextures[gl.id];
  };
  PIXI.updateWebGLTexture = function(texture, gl) {
    if (texture._glTextures[gl.id]) {
      gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
      if (!texture._powerOf2) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      }
      texture._dirty[gl.id] = false;
    }
  };
  PIXI.WebGLRenderer.prototype.handleContextLost = function(event) {
    event.preventDefault();
    this.contextLost = true;
  };
  PIXI.WebGLRenderer.prototype.handleContextRestored = function() {
    try {
      this.gl = this.view.getContext("experimental-webgl", this.options);
    } catch (e) {
      try {
        this.gl = this.view.getContext("webgl", this.options);
      } catch (e2) {
        throw new Error(" This browser does not support webGL. Try using the canvas renderer" + this);
      }
    }
    var gl = this.gl;
    gl.id = PIXI.WebGLRenderer.glContextId++;
    this.shaderManager.setContext(gl);
    this.spriteBatch.setContext(gl);
    this.primitiveBatch.setContext(gl);
    this.maskManager.setContext(gl);
    this.filterManager.setContext(gl);
    this.renderSession.gl = this.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.colorMask(true, true, true, this.transparent);
    this.gl.viewport(0, 0, this.width, this.height);
    for (var key in PIXI.TextureCache) {
      var texture = PIXI.TextureCache[key].baseTexture;
      texture._glTextures = [];
    }
    this.contextLost = false;
  };
  PIXI.WebGLRenderer.prototype.destroy = function() {
    this.view.removeEventListener("webglcontextlost", this.contextLost);
    this.view.removeEventListener("webglcontextrestored", this.contextRestoredLost);
    PIXI.glContexts[this.glContextId] = null;
    this.projection = null;
    this.offset = null;
    this.shaderManager.destroy();
    this.spriteBatch.destroy();
    this.primitiveBatch.destroy();
    this.maskManager.destroy();
    this.filterManager.destroy();
    this.shaderManager = null;
    this.spriteBatch = null;
    this.maskManager = null;
    this.filterManager = null;
    this.gl = null;
    this.renderSession = null;
  };
  PIXI.WebGLRenderer.glContextId = 0;
  PIXI.WebGLBlendModeManager = function(gl) {
    this.gl = gl;
    this.currentBlendMode = 99999;
  };
  PIXI.WebGLBlendModeManager.prototype.setBlendMode = function(blendMode) {
    if (this.currentBlendMode === blendMode) {
      return false;
    }
    this.currentBlendMode = blendMode;
    var blendModeWebGL = PIXI.blendModesWebGL[this.currentBlendMode];
    this.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);
    return true;
  };
  PIXI.WebGLBlendModeManager.prototype.destroy = function() {
    this.gl = null;
  };
  PIXI.WebGLMaskManager = function(gl) {
    this.maskStack = [];
    this.maskPosition = 0;
    this.setContext(gl);
    this.reverse = false;
    this.count = 0;
  };
  PIXI.WebGLMaskManager.prototype.setContext = function(gl) {
    this.gl = gl;
  };
  PIXI.WebGLMaskManager.prototype.pushMask = function(maskData, renderSession) {
    var gl = renderSession.gl;
    if (maskData.dirty) {
      PIXI.WebGLGraphics.updateGraphics(maskData, gl);
    }
    if (!maskData._webGL[gl.id].data.length) {
      return;
    }
    renderSession.stencilManager.pushStencil(maskData, maskData._webGL[gl.id].data[0], renderSession);
  };
  PIXI.WebGLMaskManager.prototype.popMask = function(maskData, renderSession) {
    var gl = this.gl;
    renderSession.stencilManager.popStencil(maskData, maskData._webGL[gl.id].data[0], renderSession);
  };
  PIXI.WebGLMaskManager.prototype.destroy = function() {
    this.maskStack = null;
    this.gl = null;
  };
  PIXI.WebGLStencilManager = function(gl) {
    this.stencilStack = [];
    this.setContext(gl);
    this.reverse = true;
    this.count = 0;
  };
  PIXI.WebGLStencilManager.prototype.setContext = function(gl) {
    this.gl = gl;
  };
  PIXI.WebGLStencilManager.prototype.pushStencil = function(graphics, webGLData, renderSession) {
    var gl = this.gl;
    this.bindGraphics(graphics, webGLData, renderSession);
    if (this.stencilStack.length === 0) {
      gl.enable(gl.STENCIL_TEST);
      gl.clear(gl.STENCIL_BUFFER_BIT);
      this.reverse = true;
      this.count = 0;
    }
    this.stencilStack.push(webGLData);
    var level = this.count;
    gl.colorMask(false, false, false, false);
    gl.stencilFunc(gl.ALWAYS, 0, 255);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
    if (webGLData.mode === 1) {
      gl.drawElements(gl.TRIANGLE_FAN, webGLData.indices.length - 4, gl.UNSIGNED_SHORT, 0);
      if (this.reverse) {
        gl.stencilFunc(gl.EQUAL, 255 - level, 255);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
      } else {
        gl.stencilFunc(gl.EQUAL, level, 255);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
      }
      gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, (webGLData.indices.length - 4) * 2);
      if (this.reverse) {
        gl.stencilFunc(gl.EQUAL, 255 - (level + 1), 255);
      } else {
        gl.stencilFunc(gl.EQUAL, level + 1, 255);
      }
      this.reverse = !this.reverse;
    } else {
      if (!this.reverse) {
        gl.stencilFunc(gl.EQUAL, 255 - level, 255);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
      } else {
        gl.stencilFunc(gl.EQUAL, level, 255);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
      }
      gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
      if (!this.reverse) {
        gl.stencilFunc(gl.EQUAL, 255 - (level + 1), 255);
      } else {
        gl.stencilFunc(gl.EQUAL, level + 1, 255);
      }
    }
    gl.colorMask(true, true, true, true);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    this.count++;
  };
  PIXI.WebGLStencilManager.prototype.bindGraphics = function(graphics, webGLData, renderSession) {
    this._currentGraphics = graphics;
    var gl = this.gl;
    var projection = renderSession.projection, offset = renderSession.offset, shader;
    if (webGLData.mode === 1) {
      shader = renderSession.shaderManager.complexPrimativeShader;
      renderSession.shaderManager.setShader(shader);
      gl.uniformMatrix3fv(shader.translationMatrix, false, graphics.worldTransform.toArray(true));
      gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
      gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
      gl.uniform3fv(shader.tintColor, PIXI.hex2rgb(graphics.tint));
      gl.uniform3fv(shader.color, webGLData.color);
      gl.uniform1f(shader.alpha, graphics.worldAlpha * webGLData.alpha);
      gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
      gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 4 * 2, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
    } else {
      shader = renderSession.shaderManager.primitiveShader;
      renderSession.shaderManager.setShader(shader);
      gl.uniformMatrix3fv(shader.translationMatrix, false, graphics.worldTransform.toArray(true));
      gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
      gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
      gl.uniform3fv(shader.tintColor, PIXI.hex2rgb(graphics.tint));
      gl.uniform1f(shader.alpha, graphics.worldAlpha);
      gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
      gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
      gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 4 * 6, 2 * 4);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
    }
  };
  PIXI.WebGLStencilManager.prototype.popStencil = function(graphics, webGLData, renderSession) {
    var gl = this.gl;
    this.stencilStack.pop();
    this.count--;
    if (this.stencilStack.length === 0) {
      gl.disable(gl.STENCIL_TEST);
    } else {
      var level = this.count;
      this.bindGraphics(graphics, webGLData, renderSession);
      gl.colorMask(false, false, false, false);
      if (webGLData.mode === 1) {
        this.reverse = !this.reverse;
        if (this.reverse) {
          gl.stencilFunc(gl.EQUAL, 255 - (level + 1), 255);
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
        } else {
          gl.stencilFunc(gl.EQUAL, level + 1, 255);
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
        }
        gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, (webGLData.indices.length - 4) * 2);
        gl.stencilFunc(gl.ALWAYS, 0, 255);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
        gl.drawElements(gl.TRIANGLE_FAN, webGLData.indices.length - 4, gl.UNSIGNED_SHORT, 0);
        if (!this.reverse) {
          gl.stencilFunc(gl.EQUAL, 255 - level, 255);
        } else {
          gl.stencilFunc(gl.EQUAL, level, 255);
        }
      } else {
        if (!this.reverse) {
          gl.stencilFunc(gl.EQUAL, 255 - (level + 1), 255);
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
        } else {
          gl.stencilFunc(gl.EQUAL, level + 1, 255);
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
        }
        gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
        if (!this.reverse) {
          gl.stencilFunc(gl.EQUAL, 255 - level, 255);
        } else {
          gl.stencilFunc(gl.EQUAL, level, 255);
        }
      }
      gl.colorMask(true, true, true, true);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    }
  };
  PIXI.WebGLStencilManager.prototype.destroy = function() {
    this.maskStack = null;
    this.gl = null;
  };
  PIXI.WebGLShaderManager = function(gl) {
    this.maxAttibs = 10;
    this.attribState = [];
    this.tempAttribState = [];
    this.shaderMap = [];
    for (var i = 0;i < this.maxAttibs;i++) {
      this.attribState[i] = false;
    }
    this.setContext(gl);
  };
  PIXI.WebGLShaderManager.prototype.setContext = function(gl) {
    this.gl = gl;
    this.primitiveShader = new PIXI.PrimitiveShader(gl);
    this.complexPrimativeShader = new PIXI.ComplexPrimitiveShader(gl);
    this.defaultShader = new PIXI.PixiShader(gl);
    this.fastShader = new PIXI.PixiFastShader(gl);
    this.stripShader = new PIXI.StripShader(gl);
    this.setShader(this.defaultShader);
  };
  PIXI.WebGLShaderManager.prototype.setAttribs = function(attribs) {
    var i;
    for (i = 0;i < this.tempAttribState.length;i++) {
      this.tempAttribState[i] = false;
    }
    for (i = 0;i < attribs.length;i++) {
      var attribId = attribs[i];
      this.tempAttribState[attribId] = true;
    }
    var gl = this.gl;
    for (i = 0;i < this.attribState.length;i++) {
      if (this.attribState[i] !== this.tempAttribState[i]) {
        this.attribState[i] = this.tempAttribState[i];
        if (this.tempAttribState[i]) {
          gl.enableVertexAttribArray(i);
        } else {
          gl.disableVertexAttribArray(i);
        }
      }
    }
  };
  PIXI.WebGLShaderManager.prototype.setShader = function(shader) {
    if (this._currentId === shader._UID) {
      return false;
    }
    this._currentId = shader._UID;
    this.currentShader = shader;
    this.gl.useProgram(shader.program);
    this.setAttribs(shader.attributes);
    return true;
  };
  PIXI.WebGLShaderManager.prototype.destroy = function() {
    this.attribState = null;
    this.tempAttribState = null;
    this.primitiveShader.destroy();
    this.defaultShader.destroy();
    this.fastShader.destroy();
    this.stripShader.destroy();
    this.gl = null;
  };
  PIXI.WebGLSpriteBatch = function(gl) {
    this.vertSize = 6;
    this.size = 2E3;
    var numVerts = this.size * 4 * this.vertSize;
    var numIndices = this.size * 6;
    this.vertices = new Float32Array(numVerts);
    this.indices = new Uint16Array(numIndices);
    this.lastIndexCount = 0;
    for (var i = 0, j = 0;i < numIndices;i += 6, j += 4) {
      this.indices[i + 0] = j + 0;
      this.indices[i + 1] = j + 1;
      this.indices[i + 2] = j + 2;
      this.indices[i + 3] = j + 0;
      this.indices[i + 4] = j + 2;
      this.indices[i + 5] = j + 3;
    }
    this.drawing = false;
    this.currentBatchSize = 0;
    this.currentBaseTexture = null;
    this.setContext(gl);
    this.dirty = true;
    this.textures = [];
    this.blendModes = [];
  };
  PIXI.WebGLSpriteBatch.prototype.setContext = function(gl) {
    this.gl = gl;
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
    this.currentBlendMode = 99999;
  };
  PIXI.WebGLSpriteBatch.prototype.begin = function(renderSession) {
    this.renderSession = renderSession;
    this.shader = this.renderSession.shaderManager.defaultShader;
    this.start();
  };
  PIXI.WebGLSpriteBatch.prototype.end = function() {
    this.flush();
  };
  PIXI.WebGLSpriteBatch.prototype.render = function(sprite) {
    var texture = sprite.texture;
    if (this.currentBatchSize >= this.size) {
      this.flush();
      this.currentBaseTexture = texture.baseTexture;
    }
    var uvs = texture._uvs;
    if (!uvs) {
      return;
    }
    var alpha = sprite.worldAlpha;
    var tint = sprite.tint;
    var verticies = this.vertices;
    var aX = sprite.anchor.x;
    var aY = sprite.anchor.y;
    var w0, w1, h0, h1;
    if (texture.trim) {
      var trim = texture.trim;
      w1 = trim.x - aX * trim.width;
      w0 = w1 + texture.crop.width;
      h1 = trim.y - aY * trim.height;
      h0 = h1 + texture.crop.height;
    } else {
      w0 = texture.frame.width * (1 - aX);
      w1 = texture.frame.width * -aX;
      h0 = texture.frame.height * (1 - aY);
      h1 = texture.frame.height * -aY;
    }
    var index = this.currentBatchSize * 4 * this.vertSize;
    var worldTransform = sprite.worldTransform;
    var a = worldTransform.a;
    var b = worldTransform.c;
    var c = worldTransform.b;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;
    verticies[index++] = a * w1 + c * h1 + tx;
    verticies[index++] = d * h1 + b * w1 + ty;
    verticies[index++] = uvs.x0;
    verticies[index++] = uvs.y0;
    verticies[index++] = alpha;
    verticies[index++] = tint;
    verticies[index++] = a * w0 + c * h1 + tx;
    verticies[index++] = d * h1 + b * w0 + ty;
    verticies[index++] = uvs.x1;
    verticies[index++] = uvs.y1;
    verticies[index++] = alpha;
    verticies[index++] = tint;
    verticies[index++] = a * w0 + c * h0 + tx;
    verticies[index++] = d * h0 + b * w0 + ty;
    verticies[index++] = uvs.x2;
    verticies[index++] = uvs.y2;
    verticies[index++] = alpha;
    verticies[index++] = tint;
    verticies[index++] = a * w1 + c * h0 + tx;
    verticies[index++] = d * h0 + b * w1 + ty;
    verticies[index++] = uvs.x3;
    verticies[index++] = uvs.y3;
    verticies[index++] = alpha;
    verticies[index++] = tint;
    this.textures[this.currentBatchSize] = sprite.texture.baseTexture;
    this.blendModes[this.currentBatchSize] = sprite.blendMode;
    this.currentBatchSize++;
  };
  PIXI.WebGLSpriteBatch.prototype.renderTilingSprite = function(tilingSprite) {
    var texture = tilingSprite.tilingTexture;
    if (this.currentBatchSize >= this.size) {
      this.flush();
      this.currentBaseTexture = texture.baseTexture;
    }
    if (!tilingSprite._uvs) {
      tilingSprite._uvs = new PIXI.TextureUvs;
    }
    var uvs = tilingSprite._uvs;
    tilingSprite.tilePosition.x %= texture.baseTexture.width * tilingSprite.tileScaleOffset.x;
    tilingSprite.tilePosition.y %= texture.baseTexture.height * tilingSprite.tileScaleOffset.y;
    var offsetX = tilingSprite.tilePosition.x / (texture.baseTexture.width * tilingSprite.tileScaleOffset.x);
    var offsetY = tilingSprite.tilePosition.y / (texture.baseTexture.height * tilingSprite.tileScaleOffset.y);
    var scaleX = tilingSprite.width / texture.baseTexture.width / (tilingSprite.tileScale.x * tilingSprite.tileScaleOffset.x);
    var scaleY = tilingSprite.height / texture.baseTexture.height / (tilingSprite.tileScale.y * tilingSprite.tileScaleOffset.y);
    uvs.x0 = 0 - offsetX;
    uvs.y0 = 0 - offsetY;
    uvs.x1 = 1 * scaleX - offsetX;
    uvs.y1 = 0 - offsetY;
    uvs.x2 = 1 * scaleX - offsetX;
    uvs.y2 = 1 * scaleY - offsetY;
    uvs.x3 = 0 - offsetX;
    uvs.y3 = 1 * scaleY - offsetY;
    var alpha = tilingSprite.worldAlpha;
    var tint = tilingSprite.tint;
    var verticies = this.vertices;
    var width = tilingSprite.width;
    var height = tilingSprite.height;
    var aX = tilingSprite.anchor.x;
    var aY = tilingSprite.anchor.y;
    var w0 = width * (1 - aX);
    var w1 = width * -aX;
    var h0 = height * (1 - aY);
    var h1 = height * -aY;
    var index = this.currentBatchSize * 4 * this.vertSize;
    var worldTransform = tilingSprite.worldTransform;
    var a = worldTransform.a;
    var b = worldTransform.c;
    var c = worldTransform.b;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;
    verticies[index++] = a * w1 + c * h1 + tx;
    verticies[index++] = d * h1 + b * w1 + ty;
    verticies[index++] = uvs.x0;
    verticies[index++] = uvs.y0;
    verticies[index++] = alpha;
    verticies[index++] = tint;
    verticies[index++] = a * w0 + c * h1 + tx;
    verticies[index++] = d * h1 + b * w0 + ty;
    verticies[index++] = uvs.x1;
    verticies[index++] = uvs.y1;
    verticies[index++] = alpha;
    verticies[index++] = tint;
    verticies[index++] = a * w0 + c * h0 + tx;
    verticies[index++] = d * h0 + b * w0 + ty;
    verticies[index++] = uvs.x2;
    verticies[index++] = uvs.y2;
    verticies[index++] = alpha;
    verticies[index++] = tint;
    verticies[index++] = a * w1 + c * h0 + tx;
    verticies[index++] = d * h0 + b * w1 + ty;
    verticies[index++] = uvs.x3;
    verticies[index++] = uvs.y3;
    verticies[index++] = alpha;
    verticies[index++] = tint;
    this.textures[this.currentBatchSize] = texture.baseTexture;
    this.blendModes[this.currentBatchSize] = tilingSprite.blendMode;
    this.currentBatchSize++;
  };
  PIXI.WebGLSpriteBatch.prototype.flush = function() {
    if (this.currentBatchSize === 0) {
      return;
    }
    var gl = this.gl;
    this.renderSession.shaderManager.setShader(this.renderSession.shaderManager.defaultShader);
    if (this.dirty) {
      this.dirty = false;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      var projection = this.renderSession.projection;
      gl.uniform2f(this.shader.projectionVector, projection.x, projection.y);
      var stride = this.vertSize * 4;
      gl.vertexAttribPointer(this.shader.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
      gl.vertexAttribPointer(this.shader.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * 4);
      gl.vertexAttribPointer(this.shader.colorAttribute, 2, gl.FLOAT, false, stride, 4 * 4);
    }
    if (this.currentBatchSize > this.size * .5) {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
    } else {
      var view = this.vertices.subarray(0, this.currentBatchSize * 4 * this.vertSize);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
    }
    var nextTexture, nextBlendMode;
    var batchSize = 0;
    var start = 0;
    var currentBaseTexture = null;
    var currentBlendMode = this.renderSession.blendModeManager.currentBlendMode;
    for (var i = 0, j = this.currentBatchSize;i < j;i++) {
      nextTexture = this.textures[i];
      nextBlendMode = this.blendModes[i];
      if (currentBaseTexture !== nextTexture || currentBlendMode !== nextBlendMode) {
        this.renderBatch(currentBaseTexture, batchSize, start);
        start = i;
        batchSize = 0;
        currentBaseTexture = nextTexture;
        currentBlendMode = nextBlendMode;
        this.renderSession.blendModeManager.setBlendMode(currentBlendMode);
      }
      batchSize++;
    }
    this.renderBatch(currentBaseTexture, batchSize, start);
    this.currentBatchSize = 0;
  };
  PIXI.WebGLSpriteBatch.prototype.renderBatch = function(texture, size, startIndex) {
    if (size === 0) {
      return;
    }
    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id] || PIXI.createWebGLTexture(texture, gl));
    if (texture._dirty[gl.id]) {
      PIXI.updateWebGLTexture(this.currentBaseTexture, gl);
    }
    gl.drawElements(gl.TRIANGLES, size * 6, gl.UNSIGNED_SHORT, startIndex * 6 * 2);
    this.renderSession.drawCount++;
  };
  PIXI.WebGLSpriteBatch.prototype.stop = function() {
    this.flush();
  };
  PIXI.WebGLSpriteBatch.prototype.start = function() {
    this.dirty = true;
  };
  PIXI.WebGLSpriteBatch.prototype.destroy = function() {
    this.vertices = null;
    this.indices = null;
    this.gl.deleteBuffer(this.vertexBuffer);
    this.gl.deleteBuffer(this.indexBuffer);
    this.currentBaseTexture = null;
    this.gl = null;
  };
  PIXI.WebGLFastSpriteBatch = function(gl) {
    this.vertSize = 10;
    this.maxSize = 6E3;
    this.size = this.maxSize;
    var numVerts = this.size * 4 * this.vertSize;
    var numIndices = this.maxSize * 6;
    this.vertices = new Float32Array(numVerts);
    this.indices = new Uint16Array(numIndices);
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.lastIndexCount = 0;
    for (var i = 0, j = 0;i < numIndices;i += 6, j += 4) {
      this.indices[i + 0] = j + 0;
      this.indices[i + 1] = j + 1;
      this.indices[i + 2] = j + 2;
      this.indices[i + 3] = j + 0;
      this.indices[i + 4] = j + 2;
      this.indices[i + 5] = j + 3;
    }
    this.drawing = false;
    this.currentBatchSize = 0;
    this.currentBaseTexture = null;
    this.currentBlendMode = 0;
    this.renderSession = null;
    this.shader = null;
    this.matrix = null;
    this.setContext(gl);
  };
  PIXI.WebGLFastSpriteBatch.prototype.setContext = function(gl) {
    this.gl = gl;
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
  };
  PIXI.WebGLFastSpriteBatch.prototype.begin = function(spriteBatch, renderSession) {
    this.renderSession = renderSession;
    this.shader = this.renderSession.shaderManager.fastShader;
    this.matrix = spriteBatch.worldTransform.toArray(true);
    this.start();
  };
  PIXI.WebGLFastSpriteBatch.prototype.end = function() {
    this.flush();
  };
  PIXI.WebGLFastSpriteBatch.prototype.render = function(spriteBatch) {
    var children = spriteBatch.children;
    var sprite = children[0];
    if (!sprite.texture._uvs) {
      return;
    }
    this.currentBaseTexture = sprite.texture.baseTexture;
    if (sprite.blendMode !== this.renderSession.blendModeManager.currentBlendMode) {
      this.flush();
      this.renderSession.blendModeManager.setBlendMode(sprite.blendMode);
    }
    for (var i = 0, j = children.length;i < j;i++) {
      this.renderSprite(children[i]);
    }
    this.flush();
  };
  PIXI.WebGLFastSpriteBatch.prototype.renderSprite = function(sprite) {
    if (!sprite.visible) {
      return;
    }
    if (sprite.texture.baseTexture !== this.currentBaseTexture) {
      this.flush();
      this.currentBaseTexture = sprite.texture.baseTexture;
      if (!sprite.texture._uvs) {
        return;
      }
    }
    var uvs, verticies = this.vertices, width, height, w0, w1, h0, h1, index;
    uvs = sprite.texture._uvs;
    width = sprite.texture.frame.width;
    height = sprite.texture.frame.height;
    if (sprite.texture.trim) {
      var trim = sprite.texture.trim;
      w1 = trim.x - sprite.anchor.x * trim.width;
      w0 = w1 + sprite.texture.crop.width;
      h1 = trim.y - sprite.anchor.y * trim.height;
      h0 = h1 + sprite.texture.crop.height;
    } else {
      w0 = sprite.texture.frame.width * (1 - sprite.anchor.x);
      w1 = sprite.texture.frame.width * -sprite.anchor.x;
      h0 = sprite.texture.frame.height * (1 - sprite.anchor.y);
      h1 = sprite.texture.frame.height * -sprite.anchor.y;
    }
    index = this.currentBatchSize * 4 * this.vertSize;
    verticies[index++] = w1;
    verticies[index++] = h1;
    verticies[index++] = sprite.position.x;
    verticies[index++] = sprite.position.y;
    verticies[index++] = sprite.scale.x;
    verticies[index++] = sprite.scale.y;
    verticies[index++] = sprite.rotation;
    verticies[index++] = uvs.x0;
    verticies[index++] = uvs.y1;
    verticies[index++] = sprite.alpha;
    verticies[index++] = w0;
    verticies[index++] = h1;
    verticies[index++] = sprite.position.x;
    verticies[index++] = sprite.position.y;
    verticies[index++] = sprite.scale.x;
    verticies[index++] = sprite.scale.y;
    verticies[index++] = sprite.rotation;
    verticies[index++] = uvs.x1;
    verticies[index++] = uvs.y1;
    verticies[index++] = sprite.alpha;
    verticies[index++] = w0;
    verticies[index++] = h0;
    verticies[index++] = sprite.position.x;
    verticies[index++] = sprite.position.y;
    verticies[index++] = sprite.scale.x;
    verticies[index++] = sprite.scale.y;
    verticies[index++] = sprite.rotation;
    verticies[index++] = uvs.x2;
    verticies[index++] = uvs.y2;
    verticies[index++] = sprite.alpha;
    verticies[index++] = w1;
    verticies[index++] = h0;
    verticies[index++] = sprite.position.x;
    verticies[index++] = sprite.position.y;
    verticies[index++] = sprite.scale.x;
    verticies[index++] = sprite.scale.y;
    verticies[index++] = sprite.rotation;
    verticies[index++] = uvs.x3;
    verticies[index++] = uvs.y3;
    verticies[index++] = sprite.alpha;
    this.currentBatchSize++;
    if (this.currentBatchSize >= this.size) {
      this.flush();
    }
  };
  PIXI.WebGLFastSpriteBatch.prototype.flush = function() {
    if (this.currentBatchSize === 0) {
      return;
    }
    var gl = this.gl;
    if (!this.currentBaseTexture._glTextures[gl.id]) {
      PIXI.createWebGLTexture(this.currentBaseTexture, gl);
    }
    gl.bindTexture(gl.TEXTURE_2D, this.currentBaseTexture._glTextures[gl.id]);
    if (this.currentBatchSize > this.size * .5) {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
    } else {
      var view = this.vertices.subarray(0, this.currentBatchSize * 4 * this.vertSize);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
    }
    gl.drawElements(gl.TRIANGLES, this.currentBatchSize * 6, gl.UNSIGNED_SHORT, 0);
    this.currentBatchSize = 0;
    this.renderSession.drawCount++;
  };
  PIXI.WebGLFastSpriteBatch.prototype.stop = function() {
    this.flush();
  };
  PIXI.WebGLFastSpriteBatch.prototype.start = function() {
    var gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    var projection = this.renderSession.projection;
    gl.uniform2f(this.shader.projectionVector, projection.x, projection.y);
    gl.uniformMatrix3fv(this.shader.uMatrix, false, this.matrix);
    var stride = this.vertSize * 4;
    gl.vertexAttribPointer(this.shader.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(this.shader.aPositionCoord, 2, gl.FLOAT, false, stride, 2 * 4);
    gl.vertexAttribPointer(this.shader.aScale, 2, gl.FLOAT, false, stride, 4 * 4);
    gl.vertexAttribPointer(this.shader.aRotation, 1, gl.FLOAT, false, stride, 6 * 4);
    gl.vertexAttribPointer(this.shader.aTextureCoord, 2, gl.FLOAT, false, stride, 7 * 4);
    gl.vertexAttribPointer(this.shader.colorAttribute, 1, gl.FLOAT, false, stride, 9 * 4);
  };
  PIXI.WebGLFilterManager = function(gl, transparent) {
    this.transparent = transparent;
    this.filterStack = [];
    this.offsetX = 0;
    this.offsetY = 0;
    this.setContext(gl);
  };
  PIXI.WebGLFilterManager.prototype.setContext = function(gl) {
    this.gl = gl;
    this.texturePool = [];
    this.initShaderBuffers();
  };
  PIXI.WebGLFilterManager.prototype.begin = function(renderSession, buffer) {
    this.renderSession = renderSession;
    this.defaultShader = renderSession.shaderManager.defaultShader;
    var projection = this.renderSession.projection;
    this.width = projection.x * 2;
    this.height = -projection.y * 2;
    this.buffer = buffer;
  };
  PIXI.WebGLFilterManager.prototype.pushFilter = function(filterBlock) {
    var gl = this.gl;
    var projection = this.renderSession.projection;
    var offset = this.renderSession.offset;
    filterBlock._filterArea = filterBlock.target.filterArea || filterBlock.target.getBounds();
    this.filterStack.push(filterBlock);
    var filter = filterBlock.filterPasses[0];
    this.offsetX += filterBlock._filterArea.x;
    this.offsetY += filterBlock._filterArea.y;
    var texture = this.texturePool.pop();
    if (!texture) {
      texture = new PIXI.FilterTexture(this.gl, this.width, this.height);
    } else {
      texture.resize(this.width, this.height);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
    var filterArea = filterBlock._filterArea;
    var padding = filter.padding;
    filterArea.x -= padding;
    filterArea.y -= padding;
    filterArea.width += padding * 2;
    filterArea.height += padding * 2;
    if (filterArea.x < 0) {
      filterArea.x = 0;
    }
    if (filterArea.width > this.width) {
      filterArea.width = this.width;
    }
    if (filterArea.y < 0) {
      filterArea.y = 0;
    }
    if (filterArea.height > this.height) {
      filterArea.height = this.height;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, texture.frameBuffer);
    gl.viewport(0, 0, filterArea.width, filterArea.height);
    projection.x = filterArea.width / 2;
    projection.y = -filterArea.height / 2;
    offset.x = -filterArea.x;
    offset.y = -filterArea.y;
    this.renderSession.shaderManager.setShader(this.defaultShader);
    gl.uniform2f(this.defaultShader.projectionVector, filterArea.width / 2, -filterArea.height / 2);
    gl.uniform2f(this.defaultShader.offsetVector, -filterArea.x, -filterArea.y);
    gl.colorMask(true, true, true, true);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    filterBlock._glFilterTexture = texture;
  };
  PIXI.WebGLFilterManager.prototype.popFilter = function() {
    var gl = this.gl;
    var filterBlock = this.filterStack.pop();
    var filterArea = filterBlock._filterArea;
    var texture = filterBlock._glFilterTexture;
    var projection = this.renderSession.projection;
    var offset = this.renderSession.offset;
    if (filterBlock.filterPasses.length > 1) {
      gl.viewport(0, 0, filterArea.width, filterArea.height);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      this.vertexArray[0] = 0;
      this.vertexArray[1] = filterArea.height;
      this.vertexArray[2] = filterArea.width;
      this.vertexArray[3] = filterArea.height;
      this.vertexArray[4] = 0;
      this.vertexArray[5] = 0;
      this.vertexArray[6] = filterArea.width;
      this.vertexArray[7] = 0;
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      this.uvArray[2] = filterArea.width / this.width;
      this.uvArray[5] = filterArea.height / this.height;
      this.uvArray[6] = filterArea.width / this.width;
      this.uvArray[7] = filterArea.height / this.height;
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.uvArray);
      var inputTexture = texture;
      var outputTexture = this.texturePool.pop();
      if (!outputTexture) {
        outputTexture = new PIXI.FilterTexture(this.gl, this.width, this.height);
      }
      outputTexture.resize(this.width, this.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, outputTexture.frameBuffer);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.BLEND);
      for (var i = 0;i < filterBlock.filterPasses.length - 1;i++) {
        var filterPass = filterBlock.filterPasses[i];
        gl.bindFramebuffer(gl.FRAMEBUFFER, outputTexture.frameBuffer);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inputTexture.texture);
        this.applyFilterPass(filterPass, filterArea, filterArea.width, filterArea.height);
        var temp = inputTexture;
        inputTexture = outputTexture;
        outputTexture = temp;
      }
      gl.enable(gl.BLEND);
      texture = inputTexture;
      this.texturePool.push(outputTexture);
    }
    var filter = filterBlock.filterPasses[filterBlock.filterPasses.length - 1];
    this.offsetX -= filterArea.x;
    this.offsetY -= filterArea.y;
    var sizeX = this.width;
    var sizeY = this.height;
    var offsetX = 0;
    var offsetY = 0;
    var buffer = this.buffer;
    if (this.filterStack.length === 0) {
      gl.colorMask(true, true, true, true);
    } else {
      var currentFilter = this.filterStack[this.filterStack.length - 1];
      filterArea = currentFilter._filterArea;
      sizeX = filterArea.width;
      sizeY = filterArea.height;
      offsetX = filterArea.x;
      offsetY = filterArea.y;
      buffer = currentFilter._glFilterTexture.frameBuffer;
    }
    projection.x = sizeX / 2;
    projection.y = -sizeY / 2;
    offset.x = offsetX;
    offset.y = offsetY;
    filterArea = filterBlock._filterArea;
    var x = filterArea.x - offsetX;
    var y = filterArea.y - offsetY;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    this.vertexArray[0] = x;
    this.vertexArray[1] = y + filterArea.height;
    this.vertexArray[2] = x + filterArea.width;
    this.vertexArray[3] = y + filterArea.height;
    this.vertexArray[4] = x;
    this.vertexArray[5] = y;
    this.vertexArray[6] = x + filterArea.width;
    this.vertexArray[7] = y;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    this.uvArray[2] = filterArea.width / this.width;
    this.uvArray[5] = filterArea.height / this.height;
    this.uvArray[6] = filterArea.width / this.width;
    this.uvArray[7] = filterArea.height / this.height;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.uvArray);
    gl.viewport(0, 0, sizeX, sizeY);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
    this.applyFilterPass(filter, filterArea, sizeX, sizeY);
    this.renderSession.shaderManager.setShader(this.defaultShader);
    gl.uniform2f(this.defaultShader.projectionVector, sizeX / 2, -sizeY / 2);
    gl.uniform2f(this.defaultShader.offsetVector, -offsetX, -offsetY);
    this.texturePool.push(texture);
    filterBlock._glFilterTexture = null;
  };
  PIXI.WebGLFilterManager.prototype.applyFilterPass = function(filter, filterArea, width, height) {
    var gl = this.gl;
    var shader = filter.shaders[gl.id];
    if (!shader) {
      shader = new PIXI.PixiShader(gl);
      shader.fragmentSrc = filter.fragmentSrc;
      shader.uniforms = filter.uniforms;
      shader.init();
      filter.shaders[gl.id] = shader;
    }
    this.renderSession.shaderManager.setShader(shader);
    gl.uniform2f(shader.projectionVector, width / 2, -height / 2);
    gl.uniform2f(shader.offsetVector, 0, 0);
    if (filter.uniforms.dimensions) {
      filter.uniforms.dimensions.value[0] = this.width;
      filter.uniforms.dimensions.value[1] = this.height;
      filter.uniforms.dimensions.value[2] = this.vertexArray[0];
      filter.uniforms.dimensions.value[3] = this.vertexArray[5];
    }
    shader.syncUniforms();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(shader.colorAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    this.renderSession.drawCount++;
  };
  PIXI.WebGLFilterManager.prototype.initShaderBuffers = function() {
    var gl = this.gl;
    this.vertexBuffer = gl.createBuffer();
    this.uvBuffer = gl.createBuffer();
    this.colorBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.vertexArray = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
    this.uvArray = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvArray, gl.STATIC_DRAW);
    this.colorArray = new Float32Array([1, 16777215, 1, 16777215, 1, 16777215, 1, 16777215]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.colorArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 1, 3, 2]), gl.STATIC_DRAW);
  };
  PIXI.WebGLFilterManager.prototype.destroy = function() {
    var gl = this.gl;
    this.filterStack = null;
    this.offsetX = 0;
    this.offsetY = 0;
    for (var i = 0;i < this.texturePool.length;i++) {
      this.texturePool[i].destroy();
    }
    this.texturePool = null;
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.uvBuffer);
    gl.deleteBuffer(this.colorBuffer);
    gl.deleteBuffer(this.indexBuffer);
  };
  PIXI.FilterTexture = function(gl, width, height, scaleMode) {
    this.gl = gl;
    this.frameBuffer = gl.createFramebuffer();
    this.texture = gl.createTexture();
    scaleMode = scaleMode || PIXI.scaleModes.DEFAULT;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    this.renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
    this.resize(width, height);
  };
  PIXI.FilterTexture.prototype.clear = function() {
    var gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };
  PIXI.FilterTexture.prototype.resize = function(width, height) {
    if (this.width === width && this.height === height) {
      return;
    }
    this.width = width;
    this.height = height;
    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
  };
  PIXI.FilterTexture.prototype.destroy = function() {
    var gl = this.gl;
    gl.deleteFramebuffer(this.frameBuffer);
    gl.deleteTexture(this.texture);
    this.frameBuffer = null;
    this.texture = null;
  };
  PIXI.CanvasMaskManager = function() {
  };
  PIXI.CanvasMaskManager.prototype.pushMask = function(maskData, context) {
    context.save();
    var cacheAlpha = maskData.alpha;
    var transform = maskData.worldTransform;
    context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
    PIXI.CanvasGraphics.renderGraphicsMask(maskData, context);
    context.clip();
    maskData.worldAlpha = cacheAlpha;
  };
  PIXI.CanvasMaskManager.prototype.popMask = function(context) {
    context.restore();
  };
  PIXI.CanvasTinter = function() {
  };
  PIXI.CanvasTinter.getTintedTexture = function(sprite, color) {
    var texture = sprite.texture;
    color = PIXI.CanvasTinter.roundColor(color);
    var stringColor = "#" + ("00000" + (color | 0).toString(16)).substr(-6);
    texture.tintCache = texture.tintCache || {};
    if (texture.tintCache[stringColor]) {
      return texture.tintCache[stringColor];
    }
    var canvas = PIXI.CanvasTinter.canvas || document.createElement("canvas");
    PIXI.CanvasTinter.tintMethod(texture, color, canvas);
    if (PIXI.CanvasTinter.convertTintToImage) {
      var tintImage = new Image;
      tintImage.src = canvas.toDataURL();
      texture.tintCache[stringColor] = tintImage;
    } else {
      texture.tintCache[stringColor] = canvas;
      PIXI.CanvasTinter.canvas = null;
    }
    return canvas;
  };
  PIXI.CanvasTinter.tintWithMultiply = function(texture, color, canvas) {
    var context = canvas.getContext("2d");
    var frame = texture.frame;
    canvas.width = frame.width;
    canvas.height = frame.height;
    context.fillStyle = "#" + ("00000" + (color | 0).toString(16)).substr(-6);
    context.fillRect(0, 0, frame.width, frame.height);
    context.globalCompositeOperation = "multiply";
    context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
    context.globalCompositeOperation = "destination-atop";
    context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
  };
  PIXI.CanvasTinter.tintWithOverlay = function(texture, color, canvas) {
    var context = canvas.getContext("2d");
    var frame = texture.frame;
    canvas.width = frame.width;
    canvas.height = frame.height;
    context.globalCompositeOperation = "copy";
    context.fillStyle = "#" + ("00000" + (color | 0).toString(16)).substr(-6);
    context.fillRect(0, 0, frame.width, frame.height);
    context.globalCompositeOperation = "destination-atop";
    context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
  };
  PIXI.CanvasTinter.tintWithPerPixel = function(texture, color, canvas) {
    var context = canvas.getContext("2d");
    var frame = texture.frame;
    canvas.width = frame.width;
    canvas.height = frame.height;
    context.globalCompositeOperation = "copy";
    context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
    var rgbValues = PIXI.hex2rgb(color);
    var r = rgbValues[0], g = rgbValues[1], b = rgbValues[2];
    var pixelData = context.getImageData(0, 0, frame.width, frame.height);
    var pixels = pixelData.data;
    for (var i = 0;i < pixels.length;i += 4) {
      pixels[i + 0] *= r;
      pixels[i + 1] *= g;
      pixels[i + 2] *= b;
    }
    context.putImageData(pixelData, 0, 0);
  };
  PIXI.CanvasTinter.roundColor = function(color) {
    var step = PIXI.CanvasTinter.cacheStepsPerColorChannel;
    var rgbValues = PIXI.hex2rgb(color);
    rgbValues[0] = Math.min(255, rgbValues[0] / step * step);
    rgbValues[1] = Math.min(255, rgbValues[1] / step * step);
    rgbValues[2] = Math.min(255, rgbValues[2] / step * step);
    return PIXI.rgb2hex(rgbValues);
  };
  PIXI.CanvasTinter.cacheStepsPerColorChannel = 8;
  PIXI.CanvasTinter.convertTintToImage = false;
  PIXI.CanvasTinter.canUseMultiply = PIXI.canUseNewCanvasBlendModes();
  PIXI.CanvasTinter.tintMethod = PIXI.CanvasTinter.canUseMultiply ? PIXI.CanvasTinter.tintWithMultiply : PIXI.CanvasTinter.tintWithPerPixel;
  PIXI.CanvasRenderer = function(width, height, view, transparent) {
    if (!PIXI.defaultRenderer) {
      PIXI.sayHello("Canvas");
      PIXI.defaultRenderer = this;
    }
    this.type = PIXI.CANVAS_RENDERER;
    this.clearBeforeRender = true;
    this.transparent = !!transparent;
    if (!PIXI.blendModesCanvas) {
      PIXI.blendModesCanvas = [];
      if (PIXI.canUseNewCanvasBlendModes()) {
        PIXI.blendModesCanvas[PIXI.blendModes.NORMAL] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.ADD] = "lighter";
        PIXI.blendModesCanvas[PIXI.blendModes.MULTIPLY] = "multiply";
        PIXI.blendModesCanvas[PIXI.blendModes.SCREEN] = "screen";
        PIXI.blendModesCanvas[PIXI.blendModes.OVERLAY] = "overlay";
        PIXI.blendModesCanvas[PIXI.blendModes.DARKEN] = "darken";
        PIXI.blendModesCanvas[PIXI.blendModes.LIGHTEN] = "lighten";
        PIXI.blendModesCanvas[PIXI.blendModes.COLOR_DODGE] = "color-dodge";
        PIXI.blendModesCanvas[PIXI.blendModes.COLOR_BURN] = "color-burn";
        PIXI.blendModesCanvas[PIXI.blendModes.HARD_LIGHT] = "hard-light";
        PIXI.blendModesCanvas[PIXI.blendModes.SOFT_LIGHT] = "soft-light";
        PIXI.blendModesCanvas[PIXI.blendModes.DIFFERENCE] = "difference";
        PIXI.blendModesCanvas[PIXI.blendModes.EXCLUSION] = "exclusion";
        PIXI.blendModesCanvas[PIXI.blendModes.HUE] = "hue";
        PIXI.blendModesCanvas[PIXI.blendModes.SATURATION] = "saturation";
        PIXI.blendModesCanvas[PIXI.blendModes.COLOR] = "color";
        PIXI.blendModesCanvas[PIXI.blendModes.LUMINOSITY] = "luminosity";
      } else {
        PIXI.blendModesCanvas[PIXI.blendModes.NORMAL] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.ADD] = "lighter";
        PIXI.blendModesCanvas[PIXI.blendModes.MULTIPLY] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.SCREEN] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.OVERLAY] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.DARKEN] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.LIGHTEN] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.COLOR_DODGE] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.COLOR_BURN] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.HARD_LIGHT] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.SOFT_LIGHT] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.DIFFERENCE] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.EXCLUSION] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.HUE] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.SATURATION] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.COLOR] = "source-over";
        PIXI.blendModesCanvas[PIXI.blendModes.LUMINOSITY] = "source-over";
      }
    }
    this.width = width || 800;
    this.height = height || 600;
    this.view = view || document.createElement("canvas");
    this.context = this.view.getContext("2d", {alpha:this.transparent});
    this.refresh = true;
    this.view.width = this.width;
    this.view.height = this.height;
    this.count = 0;
    this.maskManager = new PIXI.CanvasMaskManager;
    this.renderSession = {context:this.context, maskManager:this.maskManager, scaleMode:null, smoothProperty:null, roundPixels:false};
    if ("imageSmoothingEnabled" in this.context) {
      this.renderSession.smoothProperty = "imageSmoothingEnabled";
    } else {
      if ("webkitImageSmoothingEnabled" in this.context) {
        this.renderSession.smoothProperty = "webkitImageSmoothingEnabled";
      } else {
        if ("mozImageSmoothingEnabled" in this.context) {
          this.renderSession.smoothProperty = "mozImageSmoothingEnabled";
        } else {
          if ("oImageSmoothingEnabled" in this.context) {
            this.renderSession.smoothProperty = "oImageSmoothingEnabled";
          }
        }
      }
    }
  };
  PIXI.CanvasRenderer.prototype.constructor = PIXI.CanvasRenderer;
  PIXI.CanvasRenderer.prototype.render = function(stage) {
    PIXI.texturesToUpdate.length = 0;
    PIXI.texturesToDestroy.length = 0;
    stage.updateTransform();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.globalAlpha = 1;
    if (navigator.isCocoonJS && this.view.screencanvas) {
      this.context.fillStyle = "black";
      this.context.clear();
    }
    if (!this.transparent && this.clearBeforeRender) {
      this.context.fillStyle = stage.backgroundColorString;
      this.context.fillRect(0, 0, this.width, this.height);
    } else {
      if (this.transparent && this.clearBeforeRender) {
        this.context.clearRect(0, 0, this.width, this.height);
      }
    }
    this.renderDisplayObject(stage);
    if (stage.interactive) {
      if (!stage._interactiveEventsAdded) {
        stage._interactiveEventsAdded = true;
        stage.interactionManager.setTarget(this);
      }
    }
    if (PIXI.Texture.frameUpdates.length > 0) {
      PIXI.Texture.frameUpdates.length = 0;
    }
  };
  PIXI.CanvasRenderer.prototype.resize = function(width, height) {
    this.width = width;
    this.height = height;
    this.view.width = width;
    this.view.height = height;
  };
  PIXI.CanvasRenderer.prototype.renderDisplayObject = function(displayObject, context) {
    this.renderSession.context = context || this.context;
    displayObject._renderCanvas(this.renderSession);
  };
  PIXI.CanvasRenderer.prototype.renderStripFlat = function(strip) {
    var context = this.context;
    var verticies = strip.verticies;
    var length = verticies.length / 2;
    this.count++;
    context.beginPath();
    for (var i = 1;i < length - 2;i++) {
      var index = i * 2;
      var x0 = verticies[index], x1 = verticies[index + 2], x2 = verticies[index + 4];
      var y0 = verticies[index + 1], y1 = verticies[index + 3], y2 = verticies[index + 5];
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.lineTo(x2, y2);
    }
    context.fillStyle = "#FF0000";
    context.fill();
    context.closePath();
  };
  PIXI.CanvasRenderer.prototype.renderStrip = function(strip) {
    var context = this.context;
    var verticies = strip.verticies;
    var uvs = strip.uvs;
    var length = verticies.length / 2;
    this.count++;
    for (var i = 1;i < length - 2;i++) {
      var index = i * 2;
      var x0 = verticies[index], x1 = verticies[index + 2], x2 = verticies[index + 4];
      var y0 = verticies[index + 1], y1 = verticies[index + 3], y2 = verticies[index + 5];
      var u0 = uvs[index] * strip.texture.width, u1 = uvs[index + 2] * strip.texture.width, u2 = uvs[index + 4] * strip.texture.width;
      var v0 = uvs[index + 1] * strip.texture.height, v1 = uvs[index + 3] * strip.texture.height, v2 = uvs[index + 5] * strip.texture.height;
      context.save();
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.lineTo(x2, y2);
      context.closePath();
      context.clip();
      var delta = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2;
      var deltaA = x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2;
      var deltaB = u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2;
      var deltaC = u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2 - v0 * u1 * x2 - u0 * x1 * v2;
      var deltaD = y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2;
      var deltaE = u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2;
      var deltaF = u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2 - v0 * u1 * y2 - u0 * y1 * v2;
      context.transform(deltaA / delta, deltaD / delta, deltaB / delta, deltaE / delta, deltaC / delta, deltaF / delta);
      context.drawImage(strip.texture.baseTexture.source, 0, 0);
      context.restore();
    }
  };
  PIXI.CanvasBuffer = function(width, height) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.canvas.width = width;
    this.canvas.height = height;
  };
  PIXI.CanvasBuffer.prototype.clear = function() {
    this.context.clearRect(0, 0, this.width, this.height);
  };
  PIXI.CanvasBuffer.prototype.resize = function(width, height) {
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
  };
  PIXI.CanvasGraphics = function() {
  };
  PIXI.CanvasGraphics.renderGraphics = function(graphics, context) {
    var worldAlpha = graphics.worldAlpha;
    var color = "";
    for (var i = 0;i < graphics.graphicsData.length;i++) {
      var data = graphics.graphicsData[i];
      var points = data.points;
      context.strokeStyle = color = "#" + ("00000" + (data.lineColor | 0).toString(16)).substr(-6);
      context.lineWidth = data.lineWidth;
      if (data.type === PIXI.Graphics.POLY) {
        context.beginPath();
        context.moveTo(points[0], points[1]);
        for (var j = 1;j < points.length / 2;j++) {
          context.lineTo(points[j * 2], points[j * 2 + 1]);
        }
        if (points[0] === points[points.length - 2] && points[1] === points[points.length - 1]) {
          context.closePath();
        }
        if (data.fill) {
          context.globalAlpha = data.fillAlpha * worldAlpha;
          context.fillStyle = color = "#" + ("00000" + (data.fillColor | 0).toString(16)).substr(-6);
          context.fill();
        }
        if (data.lineWidth) {
          context.globalAlpha = data.lineAlpha * worldAlpha;
          context.stroke();
        }
      } else {
        if (data.type === PIXI.Graphics.RECT) {
          if (data.fillColor || data.fillColor === 0) {
            context.globalAlpha = data.fillAlpha * worldAlpha;
            context.fillStyle = color = "#" + ("00000" + (data.fillColor | 0).toString(16)).substr(-6);
            context.fillRect(points[0], points[1], points[2], points[3]);
          }
          if (data.lineWidth) {
            context.globalAlpha = data.lineAlpha * worldAlpha;
            context.strokeRect(points[0], points[1], points[2], points[3]);
          }
        } else {
          if (data.type === PIXI.Graphics.CIRC) {
            context.beginPath();
            context.arc(points[0], points[1], points[2], 0, 2 * Math.PI);
            context.closePath();
            if (data.fill) {
              context.globalAlpha = data.fillAlpha * worldAlpha;
              context.fillStyle = color = "#" + ("00000" + (data.fillColor | 0).toString(16)).substr(-6);
              context.fill();
            }
            if (data.lineWidth) {
              context.globalAlpha = data.lineAlpha * worldAlpha;
              context.stroke();
            }
          } else {
            if (data.type === PIXI.Graphics.ELIP) {
              var ellipseData = data.points;
              var w = ellipseData[2] * 2;
              var h = ellipseData[3] * 2;
              var x = ellipseData[0] - w / 2;
              var y = ellipseData[1] - h / 2;
              context.beginPath();
              var kappa = .5522848, ox = w / 2 * kappa, oy = h / 2 * kappa, xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
              context.moveTo(x, ym);
              context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
              context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
              context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
              context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
              context.closePath();
              if (data.fill) {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = color = "#" + ("00000" + (data.fillColor | 0).toString(16)).substr(-6);
                context.fill();
              }
              if (data.lineWidth) {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.stroke();
              }
            } else {
              if (data.type === PIXI.Graphics.RREC) {
                var rx = points[0];
                var ry = points[1];
                var width = points[2];
                var height = points[3];
                var radius = points[4];
                var maxRadius = Math.min(width, height) / 2 | 0;
                radius = radius > maxRadius ? maxRadius : radius;
                context.beginPath();
                context.moveTo(rx, ry + radius);
                context.lineTo(rx, ry + height - radius);
                context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
                context.lineTo(rx + width - radius, ry + height);
                context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
                context.lineTo(rx + width, ry + radius);
                context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
                context.lineTo(rx + radius, ry);
                context.quadraticCurveTo(rx, ry, rx, ry + radius);
                context.closePath();
                if (data.fillColor || data.fillColor === 0) {
                  context.globalAlpha = data.fillAlpha * worldAlpha;
                  context.fillStyle = color = "#" + ("00000" + (data.fillColor | 0).toString(16)).substr(-6);
                  context.fill();
                }
                if (data.lineWidth) {
                  context.globalAlpha = data.lineAlpha * worldAlpha;
                  context.stroke();
                }
              }
            }
          }
        }
      }
    }
  };
  PIXI.CanvasGraphics.renderGraphicsMask = function(graphics, context) {
    var len = graphics.graphicsData.length;
    if (len === 0) {
      return;
    }
    if (len > 1) {
      len = 1;
      window.console.log("Pixi.js warning: masks in canvas can only mask using the first path in the graphics object");
    }
    for (var i = 0;i < 1;i++) {
      var data = graphics.graphicsData[i];
      var points = data.points;
      if (data.type === PIXI.Graphics.POLY) {
        context.beginPath();
        context.moveTo(points[0], points[1]);
        for (var j = 1;j < points.length / 2;j++) {
          context.lineTo(points[j * 2], points[j * 2 + 1]);
        }
        if (points[0] === points[points.length - 2] && points[1] === points[points.length - 1]) {
          context.closePath();
        }
      } else {
        if (data.type === PIXI.Graphics.RECT) {
          context.beginPath();
          context.rect(points[0], points[1], points[2], points[3]);
          context.closePath();
        } else {
          if (data.type === PIXI.Graphics.CIRC) {
            context.beginPath();
            context.arc(points[0], points[1], points[2], 0, 2 * Math.PI);
            context.closePath();
          } else {
            if (data.type === PIXI.Graphics.ELIP) {
              var ellipseData = data.points;
              var w = ellipseData[2] * 2;
              var h = ellipseData[3] * 2;
              var x = ellipseData[0] - w / 2;
              var y = ellipseData[1] - h / 2;
              context.beginPath();
              var kappa = .5522848, ox = w / 2 * kappa, oy = h / 2 * kappa, xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
              context.moveTo(x, ym);
              context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
              context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
              context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
              context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
              context.closePath();
            } else {
              if (data.type === PIXI.Graphics.RREC) {
                var rx = points[0];
                var ry = points[1];
                var width = points[2];
                var height = points[3];
                var radius = points[4];
                var maxRadius = Math.min(width, height) / 2 | 0;
                radius = radius > maxRadius ? maxRadius : radius;
                context.beginPath();
                context.moveTo(rx, ry + radius);
                context.lineTo(rx, ry + height - radius);
                context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
                context.lineTo(rx + width - radius, ry + height);
                context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
                context.lineTo(rx + width, ry + radius);
                context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
                context.lineTo(rx + radius, ry);
                context.quadraticCurveTo(rx, ry, rx, ry + radius);
                context.closePath();
              }
            }
          }
        }
      }
    }
  };
  PIXI.Graphics = function() {
    PIXI.DisplayObjectContainer.call(this);
    this.renderable = true;
    this.fillAlpha = 1;
    this.lineWidth = 0;
    this.lineColor = "black";
    this.graphicsData = [];
    this.tint = 16777215;
    this.blendMode = PIXI.blendModes.NORMAL;
    this.currentPath = {points:[]};
    this._webGL = [];
    this.isMask = false;
    this.bounds = null;
    this.boundsPadding = 10;
    this.dirty = true;
  };
  PIXI.Graphics.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  PIXI.Graphics.prototype.constructor = PIXI.Graphics;
  Object.defineProperty(PIXI.Graphics.prototype, "cacheAsBitmap", {get:function() {
    return this._cacheAsBitmap;
  }, set:function(value) {
    this._cacheAsBitmap = value;
    if (this._cacheAsBitmap) {
      this._generateCachedSprite();
    } else {
      this.destroyCachedSprite();
      this.dirty = true;
    }
  }});
  PIXI.Graphics.prototype.lineStyle = function(lineWidth, color, alpha) {
    if (!this.currentPath.points.length) {
      this.graphicsData.pop();
    }
    this.lineWidth = lineWidth || 0;
    this.lineColor = color || 0;
    this.lineAlpha = arguments.length < 3 ? 1 : alpha;
    this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, points:[], type:PIXI.Graphics.POLY};
    this.graphicsData.push(this.currentPath);
    return this;
  };
  PIXI.Graphics.prototype.moveTo = function(x, y) {
    if (!this.currentPath.points.length) {
      this.graphicsData.pop();
    }
    this.currentPath = this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, points:[], type:PIXI.Graphics.POLY};
    this.currentPath.points.push(x, y);
    this.graphicsData.push(this.currentPath);
    return this;
  };
  PIXI.Graphics.prototype.lineTo = function(x, y) {
    this.currentPath.points.push(x, y);
    this.dirty = true;
    return this;
  };
  PIXI.Graphics.prototype.quadraticCurveTo = function(cpX, cpY, toX, toY) {
    if (this.currentPath.points.length === 0) {
      this.moveTo(0, 0);
    }
    var xa, ya, n = 20, points = this.currentPath.points;
    if (points.length === 0) {
      this.moveTo(0, 0);
    }
    var fromX = points[points.length - 2];
    var fromY = points[points.length - 1];
    var j = 0;
    for (var i = 1;i <= n;i++) {
      j = i / n;
      xa = fromX + (cpX - fromX) * j;
      ya = fromY + (cpY - fromY) * j;
      points.push(xa + (cpX + (toX - cpX) * j - xa) * j, ya + (cpY + (toY - cpY) * j - ya) * j);
    }
    this.dirty = true;
    return this;
  };
  PIXI.Graphics.prototype.bezierCurveTo = function(cpX, cpY, cpX2, cpY2, toX, toY) {
    if (this.currentPath.points.length === 0) {
      this.moveTo(0, 0);
    }
    var n = 20, dt, dt2, dt3, t2, t3, points = this.currentPath.points;
    var fromX = points[points.length - 2];
    var fromY = points[points.length - 1];
    var j = 0;
    for (var i = 1;i < n;i++) {
      j = i / n;
      dt = 1 - j;
      dt2 = dt * dt;
      dt3 = dt2 * dt;
      t2 = j * j;
      t3 = t2 * j;
      points.push(dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX, dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY);
    }
    this.dirty = true;
    return this;
  };
  PIXI.Graphics.prototype.arcTo = function(x1, y1, x2, y2, radius) {
    if (this.currentPath.points.length === 0) {
      this.moveTo(x1, y1);
    }
    var points = this.currentPath.points;
    var fromX = points[points.length - 2];
    var fromY = points[points.length - 1];
    var a1 = fromY - y1;
    var b1 = fromX - x1;
    var a2 = y2 - y1;
    var b2 = x2 - x1;
    var mm = Math.abs(a1 * b2 - b1 * a2);
    if (mm < 1E-8 || radius === 0) {
      points.push(x1, y1);
    } else {
      var dd = a1 * a1 + b1 * b1;
      var cc = a2 * a2 + b2 * b2;
      var tt = a1 * a2 + b1 * b2;
      var k1 = radius * Math.sqrt(dd) / mm;
      var k2 = radius * Math.sqrt(cc) / mm;
      var j1 = k1 * tt / dd;
      var j2 = k2 * tt / cc;
      var cx = k1 * b2 + k2 * b1;
      var cy = k1 * a2 + k2 * a1;
      var px = b1 * (k2 + j1);
      var py = a1 * (k2 + j1);
      var qx = b2 * (k1 + j2);
      var qy = a2 * (k1 + j2);
      var startAngle = Math.atan2(py - cy, px - cx);
      var endAngle = Math.atan2(qy - cy, qx - cx);
      this.arc(cx + x1, cy + y1, radius, startAngle, endAngle, b1 * a2 > b2 * a1);
    }
    this.dirty = true;
    return this;
  };
  PIXI.Graphics.prototype.arc = function(cx, cy, radius, startAngle, endAngle, anticlockwise) {
    var startX = cx + Math.cos(startAngle) * radius;
    var startY = cy + Math.sin(startAngle) * radius;
    var points = this.currentPath.points;
    if (points.length !== 0 && points[points.length - 2] !== startX || points[points.length - 1] !== startY) {
      this.moveTo(startX, startY);
      points = this.currentPath.points;
    }
    if (startAngle === endAngle) {
      return this;
    }
    if (!anticlockwise && endAngle <= startAngle) {
      endAngle += Math.PI * 2;
    } else {
      if (anticlockwise && startAngle <= endAngle) {
        startAngle += Math.PI * 2;
      }
    }
    var sweep = anticlockwise ? (startAngle - endAngle) * -1 : endAngle - startAngle;
    var segs = Math.abs(sweep) / (Math.PI * 2) * 40;
    if (sweep === 0) {
      return this;
    }
    var theta = sweep / (segs * 2);
    var theta2 = theta * 2;
    var cTheta = Math.cos(theta);
    var sTheta = Math.sin(theta);
    var segMinus = segs - 1;
    var remainder = segMinus % 1 / segMinus;
    for (var i = 0;i <= segMinus;i++) {
      var real = i + remainder * i;
      var angle = theta + startAngle + theta2 * real;
      var c = Math.cos(angle);
      var s = -Math.sin(angle);
      points.push((cTheta * c + sTheta * s) * radius + cx, (cTheta * -s + sTheta * c) * radius + cy);
    }
    this.dirty = true;
    return this;
  };
  PIXI.Graphics.prototype.drawPath = function(path) {
    if (!this.currentPath.points.length) {
      this.graphicsData.pop();
    }
    this.currentPath = this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, points:[], type:PIXI.Graphics.POLY};
    this.graphicsData.push(this.currentPath);
    this.currentPath.points = this.currentPath.points.concat(path);
    this.dirty = true;
    return this;
  };
  PIXI.Graphics.prototype.beginFill = function(color, alpha) {
    this.filling = true;
    this.fillColor = color || 0;
    this.fillAlpha = arguments.length < 2 ? 1 : alpha;
    return this;
  };
  PIXI.Graphics.prototype.endFill = function() {
    this.filling = false;
    this.fillColor = null;
    this.fillAlpha = 1;
    return this;
  };
  PIXI.Graphics.prototype.drawRect = function(x, y, width, height) {
    if (!this.currentPath.points.length) {
      this.graphicsData.pop();
    }
    this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, points:[x, y, width, height], type:PIXI.Graphics.RECT};
    this.graphicsData.push(this.currentPath);
    this.dirty = true;
    return this;
  };
  PIXI.Graphics.prototype.drawRoundedRect = function(x, y, width, height, radius) {
    if (!this.currentPath.points.length) {
      this.graphicsData.pop();
    }
    this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, points:[x, y, width, height, radius], type:PIXI.Graphics.RREC};
    this.graphicsData.push(this.currentPath);
    this.dirty = true;
    return this;
  };
  PIXI.Graphics.prototype.drawCircle = function(x, y, radius) {
    if (!this.currentPath.points.length) {
      this.graphicsData.pop();
    }
    this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, points:[x, y, radius, radius], type:PIXI.Graphics.CIRC};
    this.graphicsData.push(this.currentPath);
    this.dirty = true;
    return this;
  };
  PIXI.Graphics.prototype.drawEllipse = function(x, y, width, height) {
    if (!this.currentPath.points.length) {
      this.graphicsData.pop();
    }
    this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, points:[x, y, width, height], type:PIXI.Graphics.ELIP};
    this.graphicsData.push(this.currentPath);
    this.dirty = true;
    return this;
  };
  PIXI.Graphics.prototype.clear = function() {
    this.lineWidth = 0;
    this.filling = false;
    this.dirty = true;
    this.clearDirty = true;
    this.graphicsData = [];
    this.bounds = null;
    return this;
  };
  PIXI.Graphics.prototype.generateTexture = function() {
    var bounds = this.getBounds();
    var canvasBuffer = new PIXI.CanvasBuffer(bounds.width, bounds.height);
    var texture = PIXI.Texture.fromCanvas(canvasBuffer.canvas);
    canvasBuffer.context.translate(-bounds.x, -bounds.y);
    PIXI.CanvasGraphics.renderGraphics(this, canvasBuffer.context);
    return texture;
  };
  PIXI.Graphics.prototype._renderWebGL = function(renderSession) {
    if (this.visible === false || this.alpha === 0 || this.isMask === true) {
      return;
    }
    if (this._cacheAsBitmap) {
      if (this.dirty) {
        this._generateCachedSprite();
        PIXI.updateWebGLTexture(this._cachedSprite.texture.baseTexture, renderSession.gl);
        this.dirty = false;
      }
      this._cachedSprite.alpha = this.alpha;
      PIXI.Sprite.prototype._renderWebGL.call(this._cachedSprite, renderSession);
      return;
    } else {
      renderSession.spriteBatch.stop();
      renderSession.blendModeManager.setBlendMode(this.blendMode);
      if (this._mask) {
        renderSession.maskManager.pushMask(this._mask, renderSession);
      }
      if (this._filters) {
        renderSession.filterManager.pushFilter(this._filterBlock);
      }
      if (this.blendMode !== renderSession.spriteBatch.currentBlendMode) {
        renderSession.spriteBatch.currentBlendMode = this.blendMode;
        var blendModeWebGL = PIXI.blendModesWebGL[renderSession.spriteBatch.currentBlendMode];
        renderSession.spriteBatch.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);
      }
      PIXI.WebGLGraphics.renderGraphics(this, renderSession);
      if (this.children.length) {
        renderSession.spriteBatch.start();
        for (var i = 0, j = this.children.length;i < j;i++) {
          this.children[i]._renderWebGL(renderSession);
        }
        renderSession.spriteBatch.stop();
      }
      if (this._filters) {
        renderSession.filterManager.popFilter();
      }
      if (this._mask) {
        renderSession.maskManager.popMask(this.mask, renderSession);
      }
      renderSession.drawCount++;
      renderSession.spriteBatch.start();
    }
  };
  PIXI.Graphics.prototype._renderCanvas = function(renderSession) {
    if (this.visible === false || this.alpha === 0 || this.isMask === true) {
      return;
    }
    var context = renderSession.context;
    var transform = this.worldTransform;
    if (this.blendMode !== renderSession.currentBlendMode) {
      renderSession.currentBlendMode = this.blendMode;
      context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode];
    }
    if (this._mask) {
      renderSession.maskManager.pushMask(this._mask, renderSession.context);
    }
    context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
    PIXI.CanvasGraphics.renderGraphics(this, context);
    for (var i = 0, j = this.children.length;i < j;i++) {
      this.children[i]._renderCanvas(renderSession);
    }
    if (this._mask) {
      renderSession.maskManager.popMask(renderSession.context);
    }
  };
  PIXI.Graphics.prototype.getBounds = function(matrix) {
    if (!this.bounds) {
      this.updateBounds();
    }
    var w0 = this.bounds.x;
    var w1 = this.bounds.width + this.bounds.x;
    var h0 = this.bounds.y;
    var h1 = this.bounds.height + this.bounds.y;
    var worldTransform = matrix || this.worldTransform;
    var a = worldTransform.a;
    var b = worldTransform.c;
    var c = worldTransform.b;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;
    var x1 = a * w1 + c * h1 + tx;
    var y1 = d * h1 + b * w1 + ty;
    var x2 = a * w0 + c * h1 + tx;
    var y2 = d * h1 + b * w0 + ty;
    var x3 = a * w0 + c * h0 + tx;
    var y3 = d * h0 + b * w0 + ty;
    var x4 = a * w1 + c * h0 + tx;
    var y4 = d * h0 + b * w1 + ty;
    var maxX = x1;
    var maxY = y1;
    var minX = x1;
    var minY = y1;
    minX = x2 < minX ? x2 : minX;
    minX = x3 < minX ? x3 : minX;
    minX = x4 < minX ? x4 : minX;
    minY = y2 < minY ? y2 : minY;
    minY = y3 < minY ? y3 : minY;
    minY = y4 < minY ? y4 : minY;
    maxX = x2 > maxX ? x2 : maxX;
    maxX = x3 > maxX ? x3 : maxX;
    maxX = x4 > maxX ? x4 : maxX;
    maxY = y2 > maxY ? y2 : maxY;
    maxY = y3 > maxY ? y3 : maxY;
    maxY = y4 > maxY ? y4 : maxY;
    var bounds = this._bounds;
    bounds.x = minX;
    bounds.width = maxX - minX;
    bounds.y = minY;
    bounds.height = maxY - minY;
    return bounds;
  };
  PIXI.Graphics.prototype.updateBounds = function() {
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    var points, x, y, w, h;
    for (var i = 0;i < this.graphicsData.length;i++) {
      var data = this.graphicsData[i];
      var type = data.type;
      var lineWidth = data.lineWidth;
      points = data.points;
      if (type === PIXI.Graphics.RECT) {
        x = points[0] - lineWidth / 2;
        y = points[1] - lineWidth / 2;
        w = points[2] + lineWidth;
        h = points[3] + lineWidth;
        minX = x < minX ? x : minX;
        maxX = x + w > maxX ? x + w : maxX;
        minY = y < minY ? x : minY;
        maxY = y + h > maxY ? y + h : maxY;
      } else {
        if (type === PIXI.Graphics.CIRC || type === PIXI.Graphics.ELIP) {
          x = points[0];
          y = points[1];
          w = points[2] + lineWidth / 2;
          h = points[3] + lineWidth / 2;
          minX = x - w < minX ? x - w : minX;
          maxX = x + w > maxX ? x + w : maxX;
          minY = y - h < minY ? y - h : minY;
          maxY = y + h > maxY ? y + h : maxY;
        } else {
          for (var j = 0;j < points.length;j += 2) {
            x = points[j];
            y = points[j + 1];
            minX = x - lineWidth < minX ? x - lineWidth : minX;
            maxX = x + lineWidth > maxX ? x + lineWidth : maxX;
            minY = y - lineWidth < minY ? y - lineWidth : minY;
            maxY = y + lineWidth > maxY ? y + lineWidth : maxY;
          }
        }
      }
    }
    var padding = this.boundsPadding;
    this.bounds = new PIXI.Rectangle(minX - padding, minY - padding, maxX - minX + padding * 2, maxY - minY + padding * 2);
  };
  PIXI.Graphics.prototype._generateCachedSprite = function() {
    var bounds = this.getLocalBounds();
    if (!this._cachedSprite) {
      var canvasBuffer = new PIXI.CanvasBuffer(bounds.width, bounds.height);
      var texture = PIXI.Texture.fromCanvas(canvasBuffer.canvas);
      this._cachedSprite = new PIXI.Sprite(texture);
      this._cachedSprite.buffer = canvasBuffer;
      this._cachedSprite.worldTransform = this.worldTransform;
    } else {
      this._cachedSprite.buffer.resize(bounds.width, bounds.height);
    }
    this._cachedSprite.anchor.x = -(bounds.x / bounds.width);
    this._cachedSprite.anchor.y = -(bounds.y / bounds.height);
    this._cachedSprite.buffer.context.translate(-bounds.x, -bounds.y);
    PIXI.CanvasGraphics.renderGraphics(this, this._cachedSprite.buffer.context);
    this._cachedSprite.alpha = this.alpha;
  };
  PIXI.Graphics.prototype.destroyCachedSprite = function() {
    this._cachedSprite.texture.destroy(true);
    this._cachedSprite = null;
  };
  PIXI.Graphics.POLY = 0;
  PIXI.Graphics.RECT = 1;
  PIXI.Graphics.CIRC = 2;
  PIXI.Graphics.ELIP = 3;
  PIXI.Graphics.RREC = 4;
  PIXI.Strip = function(texture) {
    PIXI.DisplayObjectContainer.call(this);
    this.texture = texture;
    this.uvs = new PIXI.Float32Array([0, 1, 1, 1, 1, 0, 0, 1]);
    this.verticies = new PIXI.Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);
    this.colors = new PIXI.Float32Array([1, 1, 1, 1]);
    this.indices = new PIXI.Uint16Array([0, 1, 2, 3]);
    this.dirty = true;
  };
  PIXI.Strip.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  PIXI.Strip.prototype.constructor = PIXI.Strip;
  PIXI.Strip.prototype._renderWebGL = function(renderSession) {
    if (!this.visible || this.alpha <= 0) {
      return;
    }
    renderSession.spriteBatch.stop();
    if (!this._vertexBuffer) {
      this._initWebGL(renderSession);
    }
    renderSession.shaderManager.setShader(renderSession.shaderManager.stripShader);
    this._renderStrip(renderSession);
    renderSession.spriteBatch.start();
  };
  PIXI.Strip.prototype._initWebGL = function(renderSession) {
    var gl = renderSession.gl;
    this._vertexBuffer = gl.createBuffer();
    this._indexBuffer = gl.createBuffer();
    this._uvBuffer = gl.createBuffer();
    this._colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.verticies, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
  };
  PIXI.Strip.prototype._renderStrip = function(renderSession) {
    var gl = renderSession.gl;
    var projection = renderSession.projection, offset = renderSession.offset, shader = renderSession.shaderManager.stripShader;
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniformMatrix3fv(shader.translationMatrix, false, this.worldTransform.toArray(true));
    gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
    gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
    gl.uniform1f(shader.alpha, 1);
    if (!this.dirty) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.verticies);
      gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
      gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id] || PIXI.createWebGLTexture(this.texture.baseTexture, gl));
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    } else {
      this.dirty = false;
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.verticies, gl.STATIC_DRAW);
      gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
      gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id] || PIXI.createWebGLTexture(this.texture.baseTexture, gl));
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    }
    gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_SHORT, 0);
  };
  PIXI.Strip.prototype._renderCanvas = function(renderSession) {
    var context = renderSession.context;
    var transform = this.worldTransform;
    if (renderSession.roundPixels) {
      context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx | 0, transform.ty | 0);
    } else {
      context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
    }
    var strip = this;
    var verticies = strip.verticies;
    var uvs = strip.uvs;
    var length = verticies.length / 2;
    this.count++;
    for (var i = 0;i < length - 2;i++) {
      var index = i * 2;
      var x0 = verticies[index], x1 = verticies[index + 2], x2 = verticies[index + 4];
      var y0 = verticies[index + 1], y1 = verticies[index + 3], y2 = verticies[index + 5];
      if (true) {
        var centerX = (x0 + x1 + x2) / 3;
        var centerY = (y0 + y1 + y2) / 3;
        var normX = x0 - centerX;
        var normY = y0 - centerY;
        var dist = Math.sqrt(normX * normX + normY * normY);
        x0 = centerX + normX / dist * (dist + 3);
        y0 = centerY + normY / dist * (dist + 3);
        normX = x1 - centerX;
        normY = y1 - centerY;
        dist = Math.sqrt(normX * normX + normY * normY);
        x1 = centerX + normX / dist * (dist + 3);
        y1 = centerY + normY / dist * (dist + 3);
        normX = x2 - centerX;
        normY = y2 - centerY;
        dist = Math.sqrt(normX * normX + normY * normY);
        x2 = centerX + normX / dist * (dist + 3);
        y2 = centerY + normY / dist * (dist + 3);
      }
      var u0 = uvs[index] * strip.texture.width, u1 = uvs[index + 2] * strip.texture.width, u2 = uvs[index + 4] * strip.texture.width;
      var v0 = uvs[index + 1] * strip.texture.height, v1 = uvs[index + 3] * strip.texture.height, v2 = uvs[index + 5] * strip.texture.height;
      context.save();
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.lineTo(x2, y2);
      context.closePath();
      context.clip();
      var delta = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2;
      var deltaA = x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2;
      var deltaB = u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2;
      var deltaC = u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2 - v0 * u1 * x2 - u0 * x1 * v2;
      var deltaD = y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2;
      var deltaE = u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2;
      var deltaF = u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2 - v0 * u1 * y2 - u0 * y1 * v2;
      context.transform(deltaA / delta, deltaD / delta, deltaB / delta, deltaE / delta, deltaC / delta, deltaF / delta);
      context.drawImage(strip.texture.baseTexture.source, 0, 0);
      context.restore();
    }
  };
  PIXI.Strip.prototype.onTextureUpdate = function() {
    this.updateFrame = true;
  };
  PIXI.Rope = function(texture, points) {
    PIXI.Strip.call(this, texture);
    this.points = points;
    this.verticies = new PIXI.Float32Array(points.length * 4);
    this.uvs = new PIXI.Float32Array(points.length * 4);
    this.colors = new PIXI.Float32Array(points.length * 2);
    this.indices = new PIXI.Uint16Array(points.length * 2);
    this.refresh();
  };
  PIXI.Rope.prototype = Object.create(PIXI.Strip.prototype);
  PIXI.Rope.prototype.constructor = PIXI.Rope;
  PIXI.Rope.prototype.refresh = function() {
    var points = this.points;
    if (points.length < 1) {
      return;
    }
    var uvs = this.uvs;
    var lastPoint = points[0];
    var indices = this.indices;
    var colors = this.colors;
    this.count -= .2;
    uvs[0] = 0;
    uvs[1] = 0;
    uvs[2] = 0;
    uvs[3] = 1;
    colors[0] = 1;
    colors[1] = 1;
    indices[0] = 0;
    indices[1] = 1;
    var total = points.length, point, index, amount;
    for (var i = 1;i < total;i++) {
      point = points[i];
      index = i * 4;
      amount = i / (total - 1);
      if (i % 2) {
        uvs[index] = amount;
        uvs[index + 1] = 0;
        uvs[index + 2] = amount;
        uvs[index + 3] = 1;
      } else {
        uvs[index] = amount;
        uvs[index + 1] = 0;
        uvs[index + 2] = amount;
        uvs[index + 3] = 1;
      }
      index = i * 2;
      colors[index] = 1;
      colors[index + 1] = 1;
      index = i * 2;
      indices[index] = index;
      indices[index + 1] = index + 1;
      lastPoint = point;
    }
  };
  PIXI.Rope.prototype.updateTransform = function() {
    var points = this.points;
    if (points.length < 1) {
      return;
    }
    var lastPoint = points[0];
    var nextPoint;
    var perp = {x:0, y:0};
    this.count -= .2;
    var verticies = this.verticies;
    var total = points.length, point, index, ratio, perpLength, num;
    for (var i = 0;i < total;i++) {
      point = points[i];
      index = i * 4;
      if (i < points.length - 1) {
        nextPoint = points[i + 1];
      } else {
        nextPoint = point;
      }
      perp.y = -(nextPoint.x - lastPoint.x);
      perp.x = nextPoint.y - lastPoint.y;
      ratio = (1 - i / (total - 1)) * 10;
      if (ratio > 1) {
        ratio = 1;
      }
      perpLength = Math.sqrt(perp.x * perp.x + perp.y * perp.y);
      num = this.texture.height / 2;
      perp.x /= perpLength;
      perp.y /= perpLength;
      perp.x *= num;
      perp.y *= num;
      verticies[index] = point.x + perp.x;
      verticies[index + 1] = point.y + perp.y;
      verticies[index + 2] = point.x - perp.x;
      verticies[index + 3] = point.y - perp.y;
      lastPoint = point;
    }
    PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
  };
  PIXI.Rope.prototype.setTexture = function(texture) {
    this.texture = texture;
  };
  PIXI.TilingSprite = function(texture, width, height) {
    PIXI.Sprite.call(this, texture);
    this._width = width || 100;
    this._height = height || 100;
    this.tileScale = new PIXI.Point(1, 1);
    this.tileScaleOffset = new PIXI.Point(1, 1);
    this.tilePosition = new PIXI.Point(0, 0);
    this.renderable = true;
    this.tint = 16777215;
    this.blendMode = PIXI.blendModes.NORMAL;
  };
  PIXI.TilingSprite.prototype = Object.create(PIXI.Sprite.prototype);
  PIXI.TilingSprite.prototype.constructor = PIXI.TilingSprite;
  Object.defineProperty(PIXI.TilingSprite.prototype, "width", {get:function() {
    return this._width;
  }, set:function(value) {
    this._width = value;
  }});
  Object.defineProperty(PIXI.TilingSprite.prototype, "height", {get:function() {
    return this._height;
  }, set:function(value) {
    this._height = value;
  }});
  PIXI.TilingSprite.prototype.setTexture = function(texture) {
    if (this.texture === texture) {
      return;
    }
    this.texture = texture;
    this.refreshTexture = true;
    this.cachedTint = 16777215;
  };
  PIXI.TilingSprite.prototype._renderWebGL = function(renderSession) {
    if (this.visible === false || this.alpha === 0) {
      return;
    }
    var i, j;
    if (this._mask) {
      renderSession.spriteBatch.stop();
      renderSession.maskManager.pushMask(this.mask, renderSession);
      renderSession.spriteBatch.start();
    }
    if (this._filters) {
      renderSession.spriteBatch.flush();
      renderSession.filterManager.pushFilter(this._filterBlock);
    }
    if (!this.tilingTexture || this.refreshTexture) {
      this.generateTilingTexture(true);
      if (this.tilingTexture && this.tilingTexture.needsUpdate) {
        PIXI.updateWebGLTexture(this.tilingTexture.baseTexture, renderSession.gl);
        this.tilingTexture.needsUpdate = false;
      }
    } else {
      renderSession.spriteBatch.renderTilingSprite(this);
    }
    for (i = 0, j = this.children.length;i < j;i++) {
      this.children[i]._renderWebGL(renderSession);
    }
    renderSession.spriteBatch.stop();
    if (this._filters) {
      renderSession.filterManager.popFilter();
    }
    if (this._mask) {
      renderSession.maskManager.popMask(renderSession);
    }
    renderSession.spriteBatch.start();
  };
  PIXI.TilingSprite.prototype._renderCanvas = function(renderSession) {
    if (this.visible === false || this.alpha === 0) {
      return;
    }
    var context = renderSession.context;
    if (this._mask) {
      renderSession.maskManager.pushMask(this._mask, context);
    }
    context.globalAlpha = this.worldAlpha;
    var transform = this.worldTransform;
    var i, j;
    context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
    if (!this.__tilePattern || this.refreshTexture) {
      this.generateTilingTexture(false);
      if (this.tilingTexture) {
        this.__tilePattern = context.createPattern(this.tilingTexture.baseTexture.source, "repeat");
      } else {
        return;
      }
    }
    if (this.blendMode !== renderSession.currentBlendMode) {
      renderSession.currentBlendMode = this.blendMode;
      context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode];
    }
    var tilePosition = this.tilePosition;
    var tileScale = this.tileScale;
    tilePosition.x %= this.tilingTexture.baseTexture.width;
    tilePosition.y %= this.tilingTexture.baseTexture.height;
    context.scale(tileScale.x, tileScale.y);
    context.translate(tilePosition.x, tilePosition.y);
    context.fillStyle = this.__tilePattern;
    context.fillRect(-tilePosition.x + this.anchor.x * -this._width, -tilePosition.y + this.anchor.y * -this._height, this._width / tileScale.x, this._height / tileScale.y);
    context.scale(1 / tileScale.x, 1 / tileScale.y);
    context.translate(-tilePosition.x, -tilePosition.y);
    if (this._mask) {
      renderSession.maskManager.popMask(renderSession.context);
    }
    for (i = 0, j = this.children.length;i < j;i++) {
      this.children[i]._renderCanvas(renderSession);
    }
  };
  PIXI.TilingSprite.prototype.getBounds = function() {
    var width = this._width;
    var height = this._height;
    var w0 = width * (1 - this.anchor.x);
    var w1 = width * -this.anchor.x;
    var h0 = height * (1 - this.anchor.y);
    var h1 = height * -this.anchor.y;
    var worldTransform = this.worldTransform;
    var a = worldTransform.a;
    var b = worldTransform.c;
    var c = worldTransform.b;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;
    var x1 = a * w1 + c * h1 + tx;
    var y1 = d * h1 + b * w1 + ty;
    var x2 = a * w0 + c * h1 + tx;
    var y2 = d * h1 + b * w0 + ty;
    var x3 = a * w0 + c * h0 + tx;
    var y3 = d * h0 + b * w0 + ty;
    var x4 = a * w1 + c * h0 + tx;
    var y4 = d * h0 + b * w1 + ty;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var minX = Infinity;
    var minY = Infinity;
    minX = x1 < minX ? x1 : minX;
    minX = x2 < minX ? x2 : minX;
    minX = x3 < minX ? x3 : minX;
    minX = x4 < minX ? x4 : minX;
    minY = y1 < minY ? y1 : minY;
    minY = y2 < minY ? y2 : minY;
    minY = y3 < minY ? y3 : minY;
    minY = y4 < minY ? y4 : minY;
    maxX = x1 > maxX ? x1 : maxX;
    maxX = x2 > maxX ? x2 : maxX;
    maxX = x3 > maxX ? x3 : maxX;
    maxX = x4 > maxX ? x4 : maxX;
    maxY = y1 > maxY ? y1 : maxY;
    maxY = y2 > maxY ? y2 : maxY;
    maxY = y3 > maxY ? y3 : maxY;
    maxY = y4 > maxY ? y4 : maxY;
    var bounds = this._bounds;
    bounds.x = minX;
    bounds.width = maxX - minX;
    bounds.y = minY;
    bounds.height = maxY - minY;
    this._currentBounds = bounds;
    return bounds;
  };
  PIXI.TilingSprite.prototype.onTextureUpdate = function() {
  };
  PIXI.TilingSprite.prototype.generateTilingTexture = function(forcePowerOfTwo) {
    if (!this.texture.baseTexture.hasLoaded) {
      return;
    }
    var texture = this.texture;
    var frame = texture.frame;
    var targetWidth, targetHeight;
    var isFrame = frame.width !== texture.baseTexture.width || frame.height !== texture.baseTexture.height;
    var newTextureRequired = false;
    if (!forcePowerOfTwo) {
      if (isFrame) {
        targetWidth = frame.width;
        targetHeight = frame.height;
        newTextureRequired = true;
      }
    } else {
      targetWidth = PIXI.getNextPowerOfTwo(frame.width);
      targetHeight = PIXI.getNextPowerOfTwo(frame.height);
      if (frame.width !== targetWidth || frame.height !== targetHeight) {
        newTextureRequired = true;
      }
    }
    if (newTextureRequired) {
      var canvasBuffer;
      if (this.tilingTexture && this.tilingTexture.isTiling) {
        canvasBuffer = this.tilingTexture.canvasBuffer;
        canvasBuffer.resize(targetWidth, targetHeight);
        this.tilingTexture.baseTexture.width = targetWidth;
        this.tilingTexture.baseTexture.height = targetHeight;
        this.tilingTexture.needsUpdate = true;
      } else {
        canvasBuffer = new PIXI.CanvasBuffer(targetWidth, targetHeight);
        this.tilingTexture = PIXI.Texture.fromCanvas(canvasBuffer.canvas);
        this.tilingTexture.canvasBuffer = canvasBuffer;
        this.tilingTexture.isTiling = true;
      }
      canvasBuffer.context.drawImage(texture.baseTexture.source, texture.crop.x, texture.crop.y, texture.crop.width, texture.crop.height, 0, 0, targetWidth, targetHeight);
      this.tileScaleOffset.x = frame.width / targetWidth;
      this.tileScaleOffset.y = frame.height / targetHeight;
    } else {
      if (this.tilingTexture && this.tilingTexture.isTiling) {
        this.tilingTexture.destroy(true);
      }
      this.tileScaleOffset.x = 1;
      this.tileScaleOffset.y = 1;
      this.tilingTexture = texture;
    }
    this.refreshTexture = false;
    this.tilingTexture.baseTexture._powerOf2 = true;
  };
  var spine = {};
  spine.BoneData = function(name, parent) {
    this.name = name;
    this.parent = parent;
  };
  spine.BoneData.prototype = {length:0, x:0, y:0, rotation:0, scaleX:1, scaleY:1};
  spine.SlotData = function(name, boneData) {
    this.name = name;
    this.boneData = boneData;
  };
  spine.SlotData.prototype = {r:1, g:1, b:1, a:1, attachmentName:null};
  spine.Bone = function(boneData, parent) {
    this.data = boneData;
    this.parent = parent;
    this.setToSetupPose();
  };
  spine.Bone.yDown = false;
  spine.Bone.prototype = {x:0, y:0, rotation:0, scaleX:1, scaleY:1, m00:0, m01:0, worldX:0, m10:0, m11:0, worldY:0, worldRotation:0, worldScaleX:1, worldScaleY:1, updateWorldTransform:function(flipX, flipY) {
    var parent = this.parent;
    if (parent != null) {
      this.worldX = this.x * parent.m00 + this.y * parent.m01 + parent.worldX;
      this.worldY = this.x * parent.m10 + this.y * parent.m11 + parent.worldY;
      this.worldScaleX = parent.worldScaleX * this.scaleX;
      this.worldScaleY = parent.worldScaleY * this.scaleY;
      this.worldRotation = parent.worldRotation + this.rotation;
    } else {
      this.worldX = this.x;
      this.worldY = this.y;
      this.worldScaleX = this.scaleX;
      this.worldScaleY = this.scaleY;
      this.worldRotation = this.rotation;
    }
    var radians = this.worldRotation * Math.PI / 180;
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);
    this.m00 = cos * this.worldScaleX;
    this.m10 = sin * this.worldScaleX;
    this.m01 = -sin * this.worldScaleY;
    this.m11 = cos * this.worldScaleY;
    if (flipX) {
      this.m00 = -this.m00;
      this.m01 = -this.m01;
    }
    if (flipY) {
      this.m10 = -this.m10;
      this.m11 = -this.m11;
    }
    if (spine.Bone.yDown) {
      this.m10 = -this.m10;
      this.m11 = -this.m11;
    }
  }, setToSetupPose:function() {
    var data = this.data;
    this.x = data.x;
    this.y = data.y;
    this.rotation = data.rotation;
    this.scaleX = data.scaleX;
    this.scaleY = data.scaleY;
  }};
  spine.Slot = function(slotData, skeleton, bone) {
    this.data = slotData;
    this.skeleton = skeleton;
    this.bone = bone;
    this.setToSetupPose();
  };
  spine.Slot.prototype = {r:1, g:1, b:1, a:1, _attachmentTime:0, attachment:null, setAttachment:function(attachment) {
    this.attachment = attachment;
    this._attachmentTime = this.skeleton.time;
  }, setAttachmentTime:function(time) {
    this._attachmentTime = this.skeleton.time - time;
  }, getAttachmentTime:function() {
    return this.skeleton.time - this._attachmentTime;
  }, setToSetupPose:function() {
    var data = this.data;
    this.r = data.r;
    this.g = data.g;
    this.b = data.b;
    this.a = data.a;
    var slotDatas = this.skeleton.data.slots;
    for (var i = 0, n = slotDatas.length;i < n;i++) {
      if (slotDatas[i] == data) {
        this.setAttachment(!data.attachmentName ? null : this.skeleton.getAttachmentBySlotIndex(i, data.attachmentName));
        break;
      }
    }
  }};
  spine.Skin = function(name) {
    this.name = name;
    this.attachments = {};
  };
  spine.Skin.prototype = {addAttachment:function(slotIndex, name, attachment) {
    this.attachments[slotIndex + ":" + name] = attachment;
  }, getAttachment:function(slotIndex, name) {
    return this.attachments[slotIndex + ":" + name];
  }, _attachAll:function(skeleton, oldSkin) {
    for (var key in oldSkin.attachments) {
      var colon = key.indexOf(":");
      var slotIndex = parseInt(key.substring(0, colon), 10);
      var name = key.substring(colon + 1);
      var slot = skeleton.slots[slotIndex];
      if (slot.attachment && slot.attachment.name == name) {
        var attachment = this.getAttachment(slotIndex, name);
        if (attachment) {
          slot.setAttachment(attachment);
        }
      }
    }
  }};
  spine.Animation = function(name, timelines, duration) {
    this.name = name;
    this.timelines = timelines;
    this.duration = duration;
  };
  spine.Animation.prototype = {apply:function(skeleton, time, loop) {
    if (loop && this.duration) {
      time %= this.duration;
    }
    var timelines = this.timelines;
    for (var i = 0, n = timelines.length;i < n;i++) {
      timelines[i].apply(skeleton, time, 1);
    }
  }, mix:function(skeleton, time, loop, alpha) {
    if (loop && this.duration) {
      time %= this.duration;
    }
    var timelines = this.timelines;
    for (var i = 0, n = timelines.length;i < n;i++) {
      timelines[i].apply(skeleton, time, alpha);
    }
  }};
  spine.binarySearch = function(values, target, step) {
    var low = 0;
    var high = Math.floor(values.length / step) - 2;
    if (!high) {
      return step;
    }
    var current = high >>> 1;
    while (true) {
      if (values[(current + 1) * step] <= target) {
        low = current + 1;
      } else {
        high = current;
      }
      if (low == high) {
        return(low + 1) * step;
      }
      current = low + high >>> 1;
    }
  };
  spine.linearSearch = function(values, target, step) {
    for (var i = 0, last = values.length - step;i <= last;i += step) {
      if (values[i] > target) {
        return i;
      }
    }
    return-1;
  };
  spine.Curves = function(frameCount) {
    this.curves = [];
    this.curves.length = (frameCount - 1) * 6;
  };
  spine.Curves.prototype = {setLinear:function(frameIndex) {
    this.curves[frameIndex * 6] = 0;
  }, setStepped:function(frameIndex) {
    this.curves[frameIndex * 6] = -1;
  }, setCurve:function(frameIndex, cx1, cy1, cx2, cy2) {
    var subdiv_step = 1 / 10;
    var subdiv_step2 = subdiv_step * subdiv_step;
    var subdiv_step3 = subdiv_step2 * subdiv_step;
    var pre1 = 3 * subdiv_step;
    var pre2 = 3 * subdiv_step2;
    var pre4 = 6 * subdiv_step2;
    var pre5 = 6 * subdiv_step3;
    var tmp1x = -cx1 * 2 + cx2;
    var tmp1y = -cy1 * 2 + cy2;
    var tmp2x = (cx1 - cx2) * 3 + 1;
    var tmp2y = (cy1 - cy2) * 3 + 1;
    var i = frameIndex * 6;
    var curves = this.curves;
    curves[i] = cx1 * pre1 + tmp1x * pre2 + tmp2x * subdiv_step3;
    curves[i + 1] = cy1 * pre1 + tmp1y * pre2 + tmp2y * subdiv_step3;
    curves[i + 2] = tmp1x * pre4 + tmp2x * pre5;
    curves[i + 3] = tmp1y * pre4 + tmp2y * pre5;
    curves[i + 4] = tmp2x * pre5;
    curves[i + 5] = tmp2y * pre5;
  }, getCurvePercent:function(frameIndex, percent) {
    percent = percent < 0 ? 0 : percent > 1 ? 1 : percent;
    var curveIndex = frameIndex * 6;
    var curves = this.curves;
    var dfx = curves[curveIndex];
    if (!dfx) {
      return percent;
    }
    if (dfx == -1) {
      return 0;
    }
    var dfy = curves[curveIndex + 1];
    var ddfx = curves[curveIndex + 2];
    var ddfy = curves[curveIndex + 3];
    var dddfx = curves[curveIndex + 4];
    var dddfy = curves[curveIndex + 5];
    var x = dfx, y = dfy;
    var i = 10 - 2;
    while (true) {
      if (x >= percent) {
        var lastX = x - dfx;
        var lastY = y - dfy;
        return lastY + (y - lastY) * (percent - lastX) / (x - lastX);
      }
      if (!i) {
        break;
      }
      i--;
      dfx += ddfx;
      dfy += ddfy;
      ddfx += dddfx;
      ddfy += dddfy;
      x += dfx;
      y += dfy;
    }
    return y + (1 - y) * (percent - x) / (1 - x);
  }};
  spine.RotateTimeline = function(frameCount) {
    this.curves = new spine.Curves(frameCount);
    this.frames = [];
    this.frames.length = frameCount * 2;
  };
  spine.RotateTimeline.prototype = {boneIndex:0, getFrameCount:function() {
    return this.frames.length / 2;
  }, setFrame:function(frameIndex, time, angle) {
    frameIndex *= 2;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + 1] = angle;
  }, apply:function(skeleton, time, alpha) {
    var frames = this.frames, amount;
    if (time < frames[0]) {
      return;
    }
    var bone = skeleton.bones[this.boneIndex];
    if (time >= frames[frames.length - 2]) {
      amount = bone.data.rotation + frames[frames.length - 1] - bone.rotation;
      while (amount > 180) {
        amount -= 360;
      }
      while (amount < -180) {
        amount += 360;
      }
      bone.rotation += amount * alpha;
      return;
    }
    var frameIndex = spine.binarySearch(frames, time, 2);
    var lastFrameValue = frames[frameIndex - 1];
    var frameTime = frames[frameIndex];
    var percent = 1 - (time - frameTime) / (frames[frameIndex - 2] - frameTime);
    percent = this.curves.getCurvePercent(frameIndex / 2 - 1, percent);
    amount = frames[frameIndex + 1] - lastFrameValue;
    while (amount > 180) {
      amount -= 360;
    }
    while (amount < -180) {
      amount += 360;
    }
    amount = bone.data.rotation + (lastFrameValue + amount * percent) - bone.rotation;
    while (amount > 180) {
      amount -= 360;
    }
    while (amount < -180) {
      amount += 360;
    }
    bone.rotation += amount * alpha;
  }};
  spine.TranslateTimeline = function(frameCount) {
    this.curves = new spine.Curves(frameCount);
    this.frames = [];
    this.frames.length = frameCount * 3;
  };
  spine.TranslateTimeline.prototype = {boneIndex:0, getFrameCount:function() {
    return this.frames.length / 3;
  }, setFrame:function(frameIndex, time, x, y) {
    frameIndex *= 3;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + 1] = x;
    this.frames[frameIndex + 2] = y;
  }, apply:function(skeleton, time, alpha) {
    var frames = this.frames;
    if (time < frames[0]) {
      return;
    }
    var bone = skeleton.bones[this.boneIndex];
    if (time >= frames[frames.length - 3]) {
      bone.x += (bone.data.x + frames[frames.length - 2] - bone.x) * alpha;
      bone.y += (bone.data.y + frames[frames.length - 1] - bone.y) * alpha;
      return;
    }
    var frameIndex = spine.binarySearch(frames, time, 3);
    var lastFrameX = frames[frameIndex - 2];
    var lastFrameY = frames[frameIndex - 1];
    var frameTime = frames[frameIndex];
    var percent = 1 - (time - frameTime) / (frames[frameIndex + -3] - frameTime);
    percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);
    bone.x += (bone.data.x + lastFrameX + (frames[frameIndex + 1] - lastFrameX) * percent - bone.x) * alpha;
    bone.y += (bone.data.y + lastFrameY + (frames[frameIndex + 2] - lastFrameY) * percent - bone.y) * alpha;
  }};
  spine.ScaleTimeline = function(frameCount) {
    this.curves = new spine.Curves(frameCount);
    this.frames = [];
    this.frames.length = frameCount * 3;
  };
  spine.ScaleTimeline.prototype = {boneIndex:0, getFrameCount:function() {
    return this.frames.length / 3;
  }, setFrame:function(frameIndex, time, x, y) {
    frameIndex *= 3;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + 1] = x;
    this.frames[frameIndex + 2] = y;
  }, apply:function(skeleton, time, alpha) {
    var frames = this.frames;
    if (time < frames[0]) {
      return;
    }
    var bone = skeleton.bones[this.boneIndex];
    if (time >= frames[frames.length - 3]) {
      bone.scaleX += (bone.data.scaleX - 1 + frames[frames.length - 2] - bone.scaleX) * alpha;
      bone.scaleY += (bone.data.scaleY - 1 + frames[frames.length - 1] - bone.scaleY) * alpha;
      return;
    }
    var frameIndex = spine.binarySearch(frames, time, 3);
    var lastFrameX = frames[frameIndex - 2];
    var lastFrameY = frames[frameIndex - 1];
    var frameTime = frames[frameIndex];
    var percent = 1 - (time - frameTime) / (frames[frameIndex + -3] - frameTime);
    percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);
    bone.scaleX += (bone.data.scaleX - 1 + lastFrameX + (frames[frameIndex + 1] - lastFrameX) * percent - bone.scaleX) * alpha;
    bone.scaleY += (bone.data.scaleY - 1 + lastFrameY + (frames[frameIndex + 2] - lastFrameY) * percent - bone.scaleY) * alpha;
  }};
  spine.ColorTimeline = function(frameCount) {
    this.curves = new spine.Curves(frameCount);
    this.frames = [];
    this.frames.length = frameCount * 5;
  };
  spine.ColorTimeline.prototype = {slotIndex:0, getFrameCount:function() {
    return this.frames.length / 5;
  }, setFrame:function(frameIndex, time, r, g, b, a) {
    frameIndex *= 5;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + 1] = r;
    this.frames[frameIndex + 2] = g;
    this.frames[frameIndex + 3] = b;
    this.frames[frameIndex + 4] = a;
  }, apply:function(skeleton, time, alpha) {
    var frames = this.frames;
    if (time < frames[0]) {
      return;
    }
    var slot = skeleton.slots[this.slotIndex];
    if (time >= frames[frames.length - 5]) {
      var i = frames.length - 1;
      slot.r = frames[i - 3];
      slot.g = frames[i - 2];
      slot.b = frames[i - 1];
      slot.a = frames[i];
      return;
    }
    var frameIndex = spine.binarySearch(frames, time, 5);
    var lastFrameR = frames[frameIndex - 4];
    var lastFrameG = frames[frameIndex - 3];
    var lastFrameB = frames[frameIndex - 2];
    var lastFrameA = frames[frameIndex - 1];
    var frameTime = frames[frameIndex];
    var percent = 1 - (time - frameTime) / (frames[frameIndex - 5] - frameTime);
    percent = this.curves.getCurvePercent(frameIndex / 5 - 1, percent);
    var r = lastFrameR + (frames[frameIndex + 1] - lastFrameR) * percent;
    var g = lastFrameG + (frames[frameIndex + 2] - lastFrameG) * percent;
    var b = lastFrameB + (frames[frameIndex + 3] - lastFrameB) * percent;
    var a = lastFrameA + (frames[frameIndex + 4] - lastFrameA) * percent;
    if (alpha < 1) {
      slot.r += (r - slot.r) * alpha;
      slot.g += (g - slot.g) * alpha;
      slot.b += (b - slot.b) * alpha;
      slot.a += (a - slot.a) * alpha;
    } else {
      slot.r = r;
      slot.g = g;
      slot.b = b;
      slot.a = a;
    }
  }};
  spine.AttachmentTimeline = function(frameCount) {
    this.curves = new spine.Curves(frameCount);
    this.frames = [];
    this.frames.length = frameCount;
    this.attachmentNames = [];
    this.attachmentNames.length = frameCount;
  };
  spine.AttachmentTimeline.prototype = {slotIndex:0, getFrameCount:function() {
    return this.frames.length;
  }, setFrame:function(frameIndex, time, attachmentName) {
    this.frames[frameIndex] = time;
    this.attachmentNames[frameIndex] = attachmentName;
  }, apply:function(skeleton, time, alpha) {
    var frames = this.frames;
    if (time < frames[0]) {
      return;
    }
    var frameIndex;
    if (time >= frames[frames.length - 1]) {
      frameIndex = frames.length - 1;
    } else {
      frameIndex = spine.binarySearch(frames, time, 1) - 1;
    }
    var attachmentName = this.attachmentNames[frameIndex];
    skeleton.slots[this.slotIndex].setAttachment(!attachmentName ? null : skeleton.getAttachmentBySlotIndex(this.slotIndex, attachmentName));
  }};
  spine.SkeletonData = function() {
    this.bones = [];
    this.slots = [];
    this.skins = [];
    this.animations = [];
  };
  spine.SkeletonData.prototype = {defaultSkin:null, findBone:function(boneName) {
    var bones = this.bones;
    for (var i = 0, n = bones.length;i < n;i++) {
      if (bones[i].name == boneName) {
        return bones[i];
      }
    }
    return null;
  }, findBoneIndex:function(boneName) {
    var bones = this.bones;
    for (var i = 0, n = bones.length;i < n;i++) {
      if (bones[i].name == boneName) {
        return i;
      }
    }
    return-1;
  }, findSlot:function(slotName) {
    var slots = this.slots;
    for (var i = 0, n = slots.length;i < n;i++) {
      if (slots[i].name == slotName) {
        return slot[i];
      }
    }
    return null;
  }, findSlotIndex:function(slotName) {
    var slots = this.slots;
    for (var i = 0, n = slots.length;i < n;i++) {
      if (slots[i].name == slotName) {
        return i;
      }
    }
    return-1;
  }, findSkin:function(skinName) {
    var skins = this.skins;
    for (var i = 0, n = skins.length;i < n;i++) {
      if (skins[i].name == skinName) {
        return skins[i];
      }
    }
    return null;
  }, findAnimation:function(animationName) {
    var animations = this.animations;
    for (var i = 0, n = animations.length;i < n;i++) {
      if (animations[i].name == animationName) {
        return animations[i];
      }
    }
    return null;
  }};
  spine.Skeleton = function(skeletonData) {
    this.data = skeletonData;
    this.bones = [];
    for (var i = 0, n = skeletonData.bones.length;i < n;i++) {
      var boneData = skeletonData.bones[i];
      var parent = !boneData.parent ? null : this.bones[skeletonData.bones.indexOf(boneData.parent)];
      this.bones.push(new spine.Bone(boneData, parent));
    }
    this.slots = [];
    this.drawOrder = [];
    for (i = 0, n = skeletonData.slots.length;i < n;i++) {
      var slotData = skeletonData.slots[i];
      var bone = this.bones[skeletonData.bones.indexOf(slotData.boneData)];
      var slot = new spine.Slot(slotData, this, bone);
      this.slots.push(slot);
      this.drawOrder.push(slot);
    }
  };
  spine.Skeleton.prototype = {x:0, y:0, skin:null, r:1, g:1, b:1, a:1, time:0, flipX:false, flipY:false, updateWorldTransform:function() {
    var flipX = this.flipX;
    var flipY = this.flipY;
    var bones = this.bones;
    for (var i = 0, n = bones.length;i < n;i++) {
      bones[i].updateWorldTransform(flipX, flipY);
    }
  }, setToSetupPose:function() {
    this.setBonesToSetupPose();
    this.setSlotsToSetupPose();
  }, setBonesToSetupPose:function() {
    var bones = this.bones;
    for (var i = 0, n = bones.length;i < n;i++) {
      bones[i].setToSetupPose();
    }
  }, setSlotsToSetupPose:function() {
    var slots = this.slots;
    for (var i = 0, n = slots.length;i < n;i++) {
      slots[i].setToSetupPose(i);
    }
  }, getRootBone:function() {
    return this.bones.length ? this.bones[0] : null;
  }, findBone:function(boneName) {
    var bones = this.bones;
    for (var i = 0, n = bones.length;i < n;i++) {
      if (bones[i].data.name == boneName) {
        return bones[i];
      }
    }
    return null;
  }, findBoneIndex:function(boneName) {
    var bones = this.bones;
    for (var i = 0, n = bones.length;i < n;i++) {
      if (bones[i].data.name == boneName) {
        return i;
      }
    }
    return-1;
  }, findSlot:function(slotName) {
    var slots = this.slots;
    for (var i = 0, n = slots.length;i < n;i++) {
      if (slots[i].data.name == slotName) {
        return slots[i];
      }
    }
    return null;
  }, findSlotIndex:function(slotName) {
    var slots = this.slots;
    for (var i = 0, n = slots.length;i < n;i++) {
      if (slots[i].data.name == slotName) {
        return i;
      }
    }
    return-1;
  }, setSkinByName:function(skinName) {
    var skin = this.data.findSkin(skinName);
    if (!skin) {
      throw "Skin not found: " + skinName;
    }
    this.setSkin(skin);
  }, setSkin:function(newSkin) {
    if (this.skin && newSkin) {
      newSkin._attachAll(this, this.skin);
    }
    this.skin = newSkin;
  }, getAttachmentBySlotName:function(slotName, attachmentName) {
    return this.getAttachmentBySlotIndex(this.data.findSlotIndex(slotName), attachmentName);
  }, getAttachmentBySlotIndex:function(slotIndex, attachmentName) {
    if (this.skin) {
      var attachment = this.skin.getAttachment(slotIndex, attachmentName);
      if (attachment) {
        return attachment;
      }
    }
    if (this.data.defaultSkin) {
      return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
    }
    return null;
  }, setAttachment:function(slotName, attachmentName) {
    var slots = this.slots;
    for (var i = 0, n = slots.size;i < n;i++) {
      var slot = slots[i];
      if (slot.data.name == slotName) {
        var attachment = null;
        if (attachmentName) {
          attachment = this.getAttachment(i, attachmentName);
          if (attachment == null) {
            throw "Attachment not found: " + attachmentName + ", for slot: " + slotName;
          }
        }
        slot.setAttachment(attachment);
        return;
      }
    }
    throw "Slot not found: " + slotName;
  }, update:function(delta) {
    time += delta;
  }};
  spine.AttachmentType = {region:0};
  spine.RegionAttachment = function() {
    this.offset = [];
    this.offset.length = 8;
    this.uvs = [];
    this.uvs.length = 8;
  };
  spine.RegionAttachment.prototype = {x:0, y:0, rotation:0, scaleX:1, scaleY:1, width:0, height:0, rendererObject:null, regionOffsetX:0, regionOffsetY:0, regionWidth:0, regionHeight:0, regionOriginalWidth:0, regionOriginalHeight:0, setUVs:function(u, v, u2, v2, rotate) {
    var uvs = this.uvs;
    if (rotate) {
      uvs[2] = u;
      uvs[3] = v2;
      uvs[4] = u;
      uvs[5] = v;
      uvs[6] = u2;
      uvs[7] = v;
      uvs[0] = u2;
      uvs[1] = v2;
    } else {
      uvs[0] = u;
      uvs[1] = v2;
      uvs[2] = u;
      uvs[3] = v;
      uvs[4] = u2;
      uvs[5] = v;
      uvs[6] = u2;
      uvs[7] = v2;
    }
  }, updateOffset:function() {
    var regionScaleX = this.width / this.regionOriginalWidth * this.scaleX;
    var regionScaleY = this.height / this.regionOriginalHeight * this.scaleY;
    var localX = -this.width / 2 * this.scaleX + this.regionOffsetX * regionScaleX;
    var localY = -this.height / 2 * this.scaleY + this.regionOffsetY * regionScaleY;
    var localX2 = localX + this.regionWidth * regionScaleX;
    var localY2 = localY + this.regionHeight * regionScaleY;
    var radians = this.rotation * Math.PI / 180;
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);
    var localXCos = localX * cos + this.x;
    var localXSin = localX * sin;
    var localYCos = localY * cos + this.y;
    var localYSin = localY * sin;
    var localX2Cos = localX2 * cos + this.x;
    var localX2Sin = localX2 * sin;
    var localY2Cos = localY2 * cos + this.y;
    var localY2Sin = localY2 * sin;
    var offset = this.offset;
    offset[0] = localXCos - localYSin;
    offset[1] = localYCos + localXSin;
    offset[2] = localXCos - localY2Sin;
    offset[3] = localY2Cos + localXSin;
    offset[4] = localX2Cos - localY2Sin;
    offset[5] = localY2Cos + localX2Sin;
    offset[6] = localX2Cos - localYSin;
    offset[7] = localYCos + localX2Sin;
  }, computeVertices:function(x, y, bone, vertices) {
    x += bone.worldX;
    y += bone.worldY;
    var m00 = bone.m00;
    var m01 = bone.m01;
    var m10 = bone.m10;
    var m11 = bone.m11;
    var offset = this.offset;
    vertices[0] = offset[0] * m00 + offset[1] * m01 + x;
    vertices[1] = offset[0] * m10 + offset[1] * m11 + y;
    vertices[2] = offset[2] * m00 + offset[3] * m01 + x;
    vertices[3] = offset[2] * m10 + offset[3] * m11 + y;
    vertices[4] = offset[4] * m00 + offset[5] * m01 + x;
    vertices[5] = offset[4] * m10 + offset[5] * m11 + y;
    vertices[6] = offset[6] * m00 + offset[7] * m01 + x;
    vertices[7] = offset[6] * m10 + offset[7] * m11 + y;
  }};
  spine.AnimationStateData = function(skeletonData) {
    this.skeletonData = skeletonData;
    this.animationToMixTime = {};
  };
  spine.AnimationStateData.prototype = {defaultMix:0, setMixByName:function(fromName, toName, duration) {
    var from = this.skeletonData.findAnimation(fromName);
    if (!from) {
      throw "Animation not found: " + fromName;
    }
    var to = this.skeletonData.findAnimation(toName);
    if (!to) {
      throw "Animation not found: " + toName;
    }
    this.setMix(from, to, duration);
  }, setMix:function(from, to, duration) {
    this.animationToMixTime[from.name + ":" + to.name] = duration;
  }, getMix:function(from, to) {
    var time = this.animationToMixTime[from.name + ":" + to.name];
    return time ? time : this.defaultMix;
  }};
  spine.AnimationState = function(stateData) {
    this.data = stateData;
    this.queue = [];
  };
  spine.AnimationState.prototype = {animationSpeed:1, current:null, previous:null, currentTime:0, previousTime:0, currentLoop:false, previousLoop:false, mixTime:0, mixDuration:0, update:function(delta) {
    this.currentTime += delta * this.animationSpeed;
    this.previousTime += delta;
    this.mixTime += delta;
    if (this.queue.length > 0) {
      var entry = this.queue[0];
      if (this.currentTime >= entry.delay) {
        this._setAnimation(entry.animation, entry.loop);
        this.queue.shift();
      }
    }
  }, apply:function(skeleton) {
    if (!this.current) {
      return;
    }
    if (this.previous) {
      this.previous.apply(skeleton, this.previousTime, this.previousLoop);
      var alpha = this.mixTime / this.mixDuration;
      if (alpha >= 1) {
        alpha = 1;
        this.previous = null;
      }
      this.current.mix(skeleton, this.currentTime, this.currentLoop, alpha);
    } else {
      this.current.apply(skeleton, this.currentTime, this.currentLoop);
    }
  }, clearAnimation:function() {
    this.previous = null;
    this.current = null;
    this.queue.length = 0;
  }, _setAnimation:function(animation, loop) {
    this.previous = null;
    if (animation && this.current) {
      this.mixDuration = this.data.getMix(this.current, animation);
      if (this.mixDuration > 0) {
        this.mixTime = 0;
        this.previous = this.current;
        this.previousTime = this.currentTime;
        this.previousLoop = this.currentLoop;
      }
    }
    this.current = animation;
    this.currentLoop = loop;
    this.currentTime = 0;
  }, setAnimationByName:function(animationName, loop) {
    var animation = this.data.skeletonData.findAnimation(animationName);
    if (!animation) {
      throw "Animation not found: " + animationName;
    }
    this.setAnimation(animation, loop);
  }, setAnimation:function(animation, loop) {
    this.queue.length = 0;
    this._setAnimation(animation, loop);
  }, addAnimationByName:function(animationName, loop, delay) {
    var animation = this.data.skeletonData.findAnimation(animationName);
    if (!animation) {
      throw "Animation not found: " + animationName;
    }
    this.addAnimation(animation, loop, delay);
  }, addAnimation:function(animation, loop, delay) {
    var entry = {};
    entry.animation = animation;
    entry.loop = loop;
    if (!delay || delay <= 0) {
      var previousAnimation = this.queue.length ? this.queue[this.queue.length - 1].animation : this.current;
      if (previousAnimation != null) {
        delay = previousAnimation.duration - this.data.getMix(previousAnimation, animation) + (delay || 0);
      } else {
        delay = 0;
      }
    }
    entry.delay = delay;
    this.queue.push(entry);
  }, isComplete:function() {
    return!this.current || this.currentTime >= this.current.duration;
  }};
  spine.SkeletonJson = function(attachmentLoader) {
    this.attachmentLoader = attachmentLoader;
  };
  spine.SkeletonJson.prototype = {scale:1, readSkeletonData:function(root) {
    var skeletonData = new spine.SkeletonData, boneData;
    var bones = root["bones"];
    for (var i = 0, n = bones.length;i < n;i++) {
      var boneMap = bones[i];
      var parent = null;
      if (boneMap["parent"]) {
        parent = skeletonData.findBone(boneMap["parent"]);
        if (!parent) {
          throw "Parent bone not found: " + boneMap["parent"];
        }
      }
      boneData = new spine.BoneData(boneMap["name"], parent);
      boneData.length = (boneMap["length"] || 0) * this.scale;
      boneData.x = (boneMap["x"] || 0) * this.scale;
      boneData.y = (boneMap["y"] || 0) * this.scale;
      boneData.rotation = boneMap["rotation"] || 0;
      boneData.scaleX = boneMap["scaleX"] || 1;
      boneData.scaleY = boneMap["scaleY"] || 1;
      skeletonData.bones.push(boneData);
    }
    var slots = root["slots"];
    for (i = 0, n = slots.length;i < n;i++) {
      var slotMap = slots[i];
      boneData = skeletonData.findBone(slotMap["bone"]);
      if (!boneData) {
        throw "Slot bone not found: " + slotMap["bone"];
      }
      var slotData = new spine.SlotData(slotMap["name"], boneData);
      var color = slotMap["color"];
      if (color) {
        slotData.r = spine.SkeletonJson.toColor(color, 0);
        slotData.g = spine.SkeletonJson.toColor(color, 1);
        slotData.b = spine.SkeletonJson.toColor(color, 2);
        slotData.a = spine.SkeletonJson.toColor(color, 3);
      }
      slotData.attachmentName = slotMap["attachment"];
      skeletonData.slots.push(slotData);
    }
    var skins = root["skins"];
    for (var skinName in skins) {
      if (!skins.hasOwnProperty(skinName)) {
        continue;
      }
      var skinMap = skins[skinName];
      var skin = new spine.Skin(skinName);
      for (var slotName in skinMap) {
        if (!skinMap.hasOwnProperty(slotName)) {
          continue;
        }
        var slotIndex = skeletonData.findSlotIndex(slotName);
        var slotEntry = skinMap[slotName];
        for (var attachmentName in slotEntry) {
          if (!slotEntry.hasOwnProperty(attachmentName)) {
            continue;
          }
          var attachment = this.readAttachment(skin, attachmentName, slotEntry[attachmentName]);
          if (attachment != null) {
            skin.addAttachment(slotIndex, attachmentName, attachment);
          }
        }
      }
      skeletonData.skins.push(skin);
      if (skin.name == "default") {
        skeletonData.defaultSkin = skin;
      }
    }
    var animations = root["animations"];
    for (var animationName in animations) {
      if (!animations.hasOwnProperty(animationName)) {
        continue;
      }
      this.readAnimation(animationName, animations[animationName], skeletonData);
    }
    return skeletonData;
  }, readAttachment:function(skin, name, map) {
    name = map["name"] || name;
    var type = spine.AttachmentType[map["type"] || "region"];
    if (type == spine.AttachmentType.region) {
      var attachment = new spine.RegionAttachment;
      attachment.x = (map["x"] || 0) * this.scale;
      attachment.y = (map["y"] || 0) * this.scale;
      attachment.scaleX = map["scaleX"] || 1;
      attachment.scaleY = map["scaleY"] || 1;
      attachment.rotation = map["rotation"] || 0;
      attachment.width = (map["width"] || 32) * this.scale;
      attachment.height = (map["height"] || 32) * this.scale;
      attachment.updateOffset();
      attachment.rendererObject = {};
      attachment.rendererObject.name = name;
      attachment.rendererObject.scale = {};
      attachment.rendererObject.scale.x = attachment.scaleX;
      attachment.rendererObject.scale.y = attachment.scaleY;
      attachment.rendererObject.rotation = -attachment.rotation * Math.PI / 180;
      return attachment;
    }
    throw "Unknown attachment type: " + type;
  }, readAnimation:function(name, map, skeletonData) {
    var timelines = [];
    var duration = 0;
    var frameIndex, timeline, timelineName, valueMap, values, i, n;
    var bones = map["bones"];
    for (var boneName in bones) {
      if (!bones.hasOwnProperty(boneName)) {
        continue;
      }
      var boneIndex = skeletonData.findBoneIndex(boneName);
      if (boneIndex == -1) {
        throw "Bone not found: " + boneName;
      }
      var boneMap = bones[boneName];
      for (timelineName in boneMap) {
        if (!boneMap.hasOwnProperty(timelineName)) {
          continue;
        }
        values = boneMap[timelineName];
        if (timelineName == "rotate") {
          timeline = new spine.RotateTimeline(values.length);
          timeline.boneIndex = boneIndex;
          frameIndex = 0;
          for (i = 0, n = values.length;i < n;i++) {
            valueMap = values[i];
            timeline.setFrame(frameIndex, valueMap["time"], valueMap["angle"]);
            spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
            frameIndex++;
          }
          timelines.push(timeline);
          duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 2 - 2]);
        } else {
          if (timelineName == "translate" || timelineName == "scale") {
            var timelineScale = 1;
            if (timelineName == "scale") {
              timeline = new spine.ScaleTimeline(values.length);
            } else {
              timeline = new spine.TranslateTimeline(values.length);
              timelineScale = this.scale;
            }
            timeline.boneIndex = boneIndex;
            frameIndex = 0;
            for (i = 0, n = values.length;i < n;i++) {
              valueMap = values[i];
              var x = (valueMap["x"] || 0) * timelineScale;
              var y = (valueMap["y"] || 0) * timelineScale;
              timeline.setFrame(frameIndex, valueMap["time"], x, y);
              spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
              frameIndex++;
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 3 - 3]);
          } else {
            throw "Invalid timeline type for a bone: " + timelineName + " (" + boneName + ")";
          }
        }
      }
    }
    var slots = map["slots"];
    for (var slotName in slots) {
      if (!slots.hasOwnProperty(slotName)) {
        continue;
      }
      var slotMap = slots[slotName];
      var slotIndex = skeletonData.findSlotIndex(slotName);
      for (timelineName in slotMap) {
        if (!slotMap.hasOwnProperty(timelineName)) {
          continue;
        }
        values = slotMap[timelineName];
        if (timelineName == "color") {
          timeline = new spine.ColorTimeline(values.length);
          timeline.slotIndex = slotIndex;
          frameIndex = 0;
          for (i = 0, n = values.length;i < n;i++) {
            valueMap = values[i];
            var color = valueMap["color"];
            var r = spine.SkeletonJson.toColor(color, 0);
            var g = spine.SkeletonJson.toColor(color, 1);
            var b = spine.SkeletonJson.toColor(color, 2);
            var a = spine.SkeletonJson.toColor(color, 3);
            timeline.setFrame(frameIndex, valueMap["time"], r, g, b, a);
            spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
            frameIndex++;
          }
          timelines.push(timeline);
          duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 5 - 5]);
        } else {
          if (timelineName == "attachment") {
            timeline = new spine.AttachmentTimeline(values.length);
            timeline.slotIndex = slotIndex;
            frameIndex = 0;
            for (i = 0, n = values.length;i < n;i++) {
              valueMap = values[i];
              timeline.setFrame(frameIndex++, valueMap["time"], valueMap["name"]);
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
          } else {
            throw "Invalid timeline type for a slot: " + timelineName + " (" + slotName + ")";
          }
        }
      }
    }
    skeletonData.animations.push(new spine.Animation(name, timelines, duration));
  }};
  spine.SkeletonJson.readCurve = function(timeline, frameIndex, valueMap) {
    var curve = valueMap["curve"];
    if (!curve) {
      return;
    }
    if (curve == "stepped") {
      timeline.curves.setStepped(frameIndex);
    } else {
      if (curve instanceof Array) {
        timeline.curves.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
      }
    }
  };
  spine.SkeletonJson.toColor = function(hexString, colorIndex) {
    if (hexString.length != 8) {
      throw "Color hexidecimal length must be 8, recieved: " + hexString;
    }
    return parseInt(hexString.substr(colorIndex * 2, 2), 16) / 255;
  };
  spine.Atlas = function(atlasText, textureLoader) {
    this.textureLoader = textureLoader;
    this.pages = [];
    this.regions = [];
    var reader = new spine.AtlasReader(atlasText);
    var tuple = [];
    tuple.length = 4;
    var page = null;
    while (true) {
      var line = reader.readLine();
      if (line == null) {
        break;
      }
      line = reader.trim(line);
      if (!line.length) {
        page = null;
      } else {
        if (!page) {
          page = new spine.AtlasPage;
          page.name = line;
          page.format = spine.Atlas.Format[reader.readValue()];
          reader.readTuple(tuple);
          page.minFilter = spine.Atlas.TextureFilter[tuple[0]];
          page.magFilter = spine.Atlas.TextureFilter[tuple[1]];
          var direction = reader.readValue();
          page.uWrap = spine.Atlas.TextureWrap.clampToEdge;
          page.vWrap = spine.Atlas.TextureWrap.clampToEdge;
          if (direction == "x") {
            page.uWrap = spine.Atlas.TextureWrap.repeat;
          } else {
            if (direction == "y") {
              page.vWrap = spine.Atlas.TextureWrap.repeat;
            } else {
              if (direction == "xy") {
                page.uWrap = page.vWrap = spine.Atlas.TextureWrap.repeat;
              }
            }
          }
          textureLoader.load(page, line);
          this.pages.push(page);
        } else {
          var region = new spine.AtlasRegion;
          region.name = line;
          region.page = page;
          region.rotate = reader.readValue() == "true";
          reader.readTuple(tuple);
          var x = parseInt(tuple[0], 10);
          var y = parseInt(tuple[1], 10);
          reader.readTuple(tuple);
          var width = parseInt(tuple[0], 10);
          var height = parseInt(tuple[1], 10);
          region.u = x / page.width;
          region.v = y / page.height;
          if (region.rotate) {
            region.u2 = (x + height) / page.width;
            region.v2 = (y + width) / page.height;
          } else {
            region.u2 = (x + width) / page.width;
            region.v2 = (y + height) / page.height;
          }
          region.x = x;
          region.y = y;
          region.width = Math.abs(width);
          region.height = Math.abs(height);
          if (reader.readTuple(tuple) == 4) {
            region.splits = [parseInt(tuple[0], 10), parseInt(tuple[1], 10), parseInt(tuple[2], 10), parseInt(tuple[3], 10)];
            if (reader.readTuple(tuple) == 4) {
              region.pads = [parseInt(tuple[0], 10), parseInt(tuple[1], 10), parseInt(tuple[2], 10), parseInt(tuple[3], 10)];
              reader.readTuple(tuple);
            }
          }
          region.originalWidth = parseInt(tuple[0], 10);
          region.originalHeight = parseInt(tuple[1], 10);
          reader.readTuple(tuple);
          region.offsetX = parseInt(tuple[0], 10);
          region.offsetY = parseInt(tuple[1], 10);
          region.index = parseInt(reader.readValue(), 10);
          this.regions.push(region);
        }
      }
    }
  };
  spine.Atlas.prototype = {findRegion:function(name) {
    var regions = this.regions;
    for (var i = 0, n = regions.length;i < n;i++) {
      if (regions[i].name == name) {
        return regions[i];
      }
    }
    return null;
  }, dispose:function() {
    var pages = this.pages;
    for (var i = 0, n = pages.length;i < n;i++) {
      this.textureLoader.unload(pages[i].rendererObject);
    }
  }, updateUVs:function(page) {
    var regions = this.regions;
    for (var i = 0, n = regions.length;i < n;i++) {
      var region = regions[i];
      if (region.page != page) {
        continue;
      }
      region.u = region.x / page.width;
      region.v = region.y / page.height;
      if (region.rotate) {
        region.u2 = (region.x + region.height) / page.width;
        region.v2 = (region.y + region.width) / page.height;
      } else {
        region.u2 = (region.x + region.width) / page.width;
        region.v2 = (region.y + region.height) / page.height;
      }
    }
  }};
  spine.Atlas.Format = {alpha:0, intensity:1, luminanceAlpha:2, rgb565:3, rgba4444:4, rgb888:5, rgba8888:6};
  spine.Atlas.TextureFilter = {nearest:0, linear:1, mipMap:2, mipMapNearestNearest:3, mipMapLinearNearest:4, mipMapNearestLinear:5, mipMapLinearLinear:6};
  spine.Atlas.TextureWrap = {mirroredRepeat:0, clampToEdge:1, repeat:2};
  spine.AtlasPage = function() {
  };
  spine.AtlasPage.prototype = {name:null, format:null, minFilter:null, magFilter:null, uWrap:null, vWrap:null, rendererObject:null, width:0, height:0};
  spine.AtlasRegion = function() {
  };
  spine.AtlasRegion.prototype = {page:null, name:null, x:0, y:0, width:0, height:0, u:0, v:0, u2:0, v2:0, offsetX:0, offsetY:0, originalWidth:0, originalHeight:0, index:0, rotate:false, splits:null, pads:null};
  spine.AtlasReader = function(text) {
    this.lines = text.split(/\r\n|\r|\n/);
  };
  spine.AtlasReader.prototype = {index:0, trim:function(value) {
    return value.replace(/^\s+|\s+$/g, "");
  }, readLine:function() {
    if (this.index >= this.lines.length) {
      return null;
    }
    return this.lines[this.index++];
  }, readValue:function() {
    var line = this.readLine();
    var colon = line.indexOf(":");
    if (colon == -1) {
      throw "Invalid line: " + line;
    }
    return this.trim(line.substring(colon + 1));
  }, readTuple:function(tuple) {
    var line = this.readLine();
    var colon = line.indexOf(":");
    if (colon == -1) {
      throw "Invalid line: " + line;
    }
    var i = 0, lastMatch = colon + 1;
    for (;i < 3;i++) {
      var comma = line.indexOf(",", lastMatch);
      if (comma == -1) {
        if (!i) {
          throw "Invalid line: " + line;
        }
        break;
      }
      tuple[i] = this.trim(line.substr(lastMatch, comma - lastMatch));
      lastMatch = comma + 1;
    }
    tuple[i] = this.trim(line.substring(lastMatch));
    return i + 1;
  }};
  spine.AtlasAttachmentLoader = function(atlas) {
    this.atlas = atlas;
  };
  spine.AtlasAttachmentLoader.prototype = {newAttachment:function(skin, type, name) {
    switch(type) {
      case spine.AttachmentType.region:
        var region = this.atlas.findRegion(name);
        if (!region) {
          throw "Region not found in atlas: " + name + " (" + type + ")";
        }
        var attachment = new spine.RegionAttachment(name);
        attachment.rendererObject = region;
        attachment.setUVs(region.u, region.v, region.u2, region.v2, region.rotate);
        attachment.regionOffsetX = region.offsetX;
        attachment.regionOffsetY = region.offsetY;
        attachment.regionWidth = region.width;
        attachment.regionHeight = region.height;
        attachment.regionOriginalWidth = region.originalWidth;
        attachment.regionOriginalHeight = region.originalHeight;
        return attachment;
    }
    throw "Unknown attachment type: " + type;
  }};
  spine.Bone.yDown = true;
  PIXI.AnimCache = {};
  PIXI.Spine = function(url) {
    PIXI.DisplayObjectContainer.call(this);
    this.spineData = PIXI.AnimCache[url];
    if (!this.spineData) {
      throw new Error("Spine data must be preloaded using PIXI.SpineLoader or PIXI.AssetLoader: " + url);
    }
    this.skeleton = new spine.Skeleton(this.spineData);
    this.skeleton.updateWorldTransform();
    this.stateData = new spine.AnimationStateData(this.spineData);
    this.state = new spine.AnimationState(this.stateData);
    this.slotContainers = [];
    for (var i = 0, n = this.skeleton.drawOrder.length;i < n;i++) {
      var slot = this.skeleton.drawOrder[i];
      var attachment = slot.attachment;
      var slotContainer = new PIXI.DisplayObjectContainer;
      this.slotContainers.push(slotContainer);
      this.addChild(slotContainer);
      if (!(attachment instanceof spine.RegionAttachment)) {
        continue;
      }
      var spriteName = attachment.rendererObject.name;
      var sprite = this.createSprite(slot, attachment.rendererObject);
      slot.currentSprite = sprite;
      slot.currentSpriteName = spriteName;
      slotContainer.addChild(sprite);
    }
  };
  PIXI.Spine.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  PIXI.Spine.prototype.constructor = PIXI.Spine;
  PIXI.Spine.prototype.updateTransform = function() {
    this.lastTime = this.lastTime || Date.now();
    var timeDelta = (Date.now() - this.lastTime) * .001;
    this.lastTime = Date.now();
    this.state.update(timeDelta);
    this.state.apply(this.skeleton);
    this.skeleton.updateWorldTransform();
    var drawOrder = this.skeleton.drawOrder;
    for (var i = 0, n = drawOrder.length;i < n;i++) {
      var slot = drawOrder[i];
      var attachment = slot.attachment;
      var slotContainer = this.slotContainers[i];
      if (!(attachment instanceof spine.RegionAttachment)) {
        slotContainer.visible = false;
        continue;
      }
      if (attachment.rendererObject) {
        if (!slot.currentSpriteName || slot.currentSpriteName != attachment.name) {
          var spriteName = attachment.rendererObject.name;
          if (slot.currentSprite !== undefined) {
            slot.currentSprite.visible = false;
          }
          slot.sprites = slot.sprites || {};
          if (slot.sprites[spriteName] !== undefined) {
            slot.sprites[spriteName].visible = true;
          } else {
            var sprite = this.createSprite(slot, attachment.rendererObject);
            slotContainer.addChild(sprite);
          }
          slot.currentSprite = slot.sprites[spriteName];
          slot.currentSpriteName = spriteName;
        }
      }
      slotContainer.visible = true;
      var bone = slot.bone;
      slotContainer.position.x = bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01;
      slotContainer.position.y = bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11;
      slotContainer.scale.x = bone.worldScaleX;
      slotContainer.scale.y = bone.worldScaleY;
      slotContainer.rotation = -(slot.bone.worldRotation * Math.PI / 180);
      slotContainer.alpha = slot.a;
      slot.currentSprite.tint = PIXI.rgb2hex([slot.r, slot.g, slot.b]);
    }
    PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
  };
  PIXI.Spine.prototype.createSprite = function(slot, descriptor) {
    var name = PIXI.TextureCache[descriptor.name] ? descriptor.name : descriptor.name + ".png";
    var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(name));
    sprite.scale = descriptor.scale;
    sprite.rotation = descriptor.rotation;
    sprite.anchor.x = sprite.anchor.y = .5;
    slot.sprites = slot.sprites || {};
    slot.sprites[descriptor.name] = sprite;
    return sprite;
  };
  PIXI.BaseTextureCache = {};
  PIXI.texturesToUpdate = [];
  PIXI.texturesToDestroy = [];
  PIXI.BaseTextureCacheIdGenerator = 0;
  PIXI.BaseTexture = function(source, scaleMode) {
    PIXI.EventTarget.call(this);
    this.width = 100;
    this.height = 100;
    this.scaleMode = scaleMode || PIXI.scaleModes.DEFAULT;
    this.hasLoaded = false;
    this.source = source;
    this.id = PIXI.BaseTextureCacheIdGenerator++;
    this.premultipliedAlpha = true;
    this._glTextures = [];
    this._dirty = [];
    if (!source) {
      return;
    }
    if ((this.source.complete || this.source.getContext) && this.source.width && this.source.height) {
      this.hasLoaded = true;
      this.width = this.source.width;
      this.height = this.source.height;
      PIXI.texturesToUpdate.push(this);
    } else {
      var scope = this;
      this.source.onload = function() {
        scope.hasLoaded = true;
        scope.width = scope.source.width;
        scope.height = scope.source.height;
        for (var i = 0;i < scope._glTextures.length;i++) {
          scope._dirty[i] = true;
        }
        scope.dispatchEvent({type:"loaded", content:scope});
      };
      this.source.onerror = function() {
        scope.dispatchEvent({type:"error", content:scope});
      };
    }
    this.imageUrl = null;
    this._powerOf2 = false;
  };
  PIXI.BaseTexture.prototype.constructor = PIXI.BaseTexture;
  PIXI.BaseTexture.prototype.destroy = function() {
    if (this.imageUrl) {
      delete PIXI.BaseTextureCache[this.imageUrl];
      delete PIXI.TextureCache[this.imageUrl];
      this.imageUrl = null;
      this.source.src = null;
    } else {
      if (this.source && this.source._pixiId) {
        delete PIXI.BaseTextureCache[this.source._pixiId];
      }
    }
    this.source = null;
    PIXI.texturesToDestroy.push(this);
  };
  PIXI.BaseTexture.prototype.updateSourceImage = function(newSrc) {
    this.hasLoaded = false;
    this.source.src = null;
    this.source.src = newSrc;
  };
  PIXI.BaseTexture.fromImage = function(imageUrl, crossorigin, scaleMode) {
    var baseTexture = PIXI.BaseTextureCache[imageUrl];
    if (crossorigin === undefined && imageUrl.indexOf("data:") === -1) {
      crossorigin = true;
    }
    if (!baseTexture) {
      var image = new Image;
      if (crossorigin) {
        image.crossOrigin = "";
      }
      image.src = imageUrl;
      baseTexture = new PIXI.BaseTexture(image, scaleMode);
      baseTexture.imageUrl = imageUrl;
      PIXI.BaseTextureCache[imageUrl] = baseTexture;
    }
    return baseTexture;
  };
  PIXI.BaseTexture.fromCanvas = function(canvas, scaleMode) {
    if (!canvas._pixiId) {
      canvas._pixiId = "canvas_" + PIXI.TextureCacheIdGenerator++;
    }
    var baseTexture = PIXI.BaseTextureCache[canvas._pixiId];
    if (!baseTexture) {
      baseTexture = new PIXI.BaseTexture(canvas, scaleMode);
      PIXI.BaseTextureCache[canvas._pixiId] = baseTexture;
    }
    return baseTexture;
  };
  PIXI.TextureCache = {};
  PIXI.FrameCache = {};
  PIXI.TextureCacheIdGenerator = 0;
  PIXI.Texture = function(baseTexture, frame) {
    PIXI.EventTarget.call(this);
    this.noFrame = false;
    if (!frame) {
      this.noFrame = true;
      frame = new PIXI.Rectangle(0, 0, 1, 1);
    }
    if (baseTexture instanceof PIXI.Texture) {
      baseTexture = baseTexture.baseTexture;
    }
    this.baseTexture = baseTexture;
    this.frame = frame;
    this.trim = null;
    this.valid = false;
    this.scope = this;
    this._uvs = null;
    this.width = 0;
    this.height = 0;
    this.crop = new PIXI.Rectangle(0, 0, 1, 1);
    if (baseTexture.hasLoaded) {
      if (this.noFrame) {
        frame = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height);
      }
      this.setFrame(frame);
    } else {
      var scope = this;
      baseTexture.addEventListener("loaded", function() {
        scope.onBaseTextureLoaded();
      });
    }
  };
  PIXI.Texture.prototype.constructor = PIXI.Texture;
  PIXI.Texture.prototype.onBaseTextureLoaded = function() {
    var baseTexture = this.baseTexture;
    baseTexture.removeEventListener("loaded", this.onLoaded);
    if (this.noFrame) {
      this.frame = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height);
    }
    this.setFrame(this.frame);
    this.scope.dispatchEvent({type:"update", content:this});
  };
  PIXI.Texture.prototype.destroy = function(destroyBase) {
    if (destroyBase) {
      this.baseTexture.destroy();
    }
    this.valid = false;
  };
  PIXI.Texture.prototype.setFrame = function(frame) {
    this.noFrame = false;
    this.frame = frame;
    this.width = frame.width;
    this.height = frame.height;
    this.crop.x = frame.x;
    this.crop.y = frame.y;
    this.crop.width = frame.width;
    this.crop.height = frame.height;
    if (!this.trim && (frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height)) {
      throw new Error("Texture Error: frame does not fit inside the base Texture dimensions " + this);
    }
    this.valid = frame && frame.width && frame.height && this.baseTexture.source && this.baseTexture.hasLoaded;
    if (this.trim) {
      this.width = this.trim.width;
      this.height = this.trim.height;
      this.frame.width = this.trim.width;
      this.frame.height = this.trim.height;
    }
    if (this.valid) {
      PIXI.Texture.frameUpdates.push(this);
    }
  };
  PIXI.Texture.prototype._updateWebGLuvs = function() {
    if (!this._uvs) {
      this._uvs = new PIXI.TextureUvs;
    }
    var frame = this.crop;
    var tw = this.baseTexture.width;
    var th = this.baseTexture.height;
    this._uvs.x0 = frame.x / tw;
    this._uvs.y0 = frame.y / th;
    this._uvs.x1 = (frame.x + frame.width) / tw;
    this._uvs.y1 = frame.y / th;
    this._uvs.x2 = (frame.x + frame.width) / tw;
    this._uvs.y2 = (frame.y + frame.height) / th;
    this._uvs.x3 = frame.x / tw;
    this._uvs.y3 = (frame.y + frame.height) / th;
  };
  PIXI.Texture.fromImage = function(imageUrl, crossorigin, scaleMode) {
    var texture = PIXI.TextureCache[imageUrl];
    if (!texture) {
      texture = new PIXI.Texture(PIXI.BaseTexture.fromImage(imageUrl, crossorigin, scaleMode));
      PIXI.TextureCache[imageUrl] = texture;
    }
    return texture;
  };
  PIXI.Texture.fromFrame = function(frameId) {
    var texture = PIXI.TextureCache[frameId];
    if (!texture) {
      throw new Error('The frameId "' + frameId + '" does not exist in the texture cache ');
    }
    return texture;
  };
  PIXI.Texture.fromCanvas = function(canvas, scaleMode) {
    var baseTexture = PIXI.BaseTexture.fromCanvas(canvas, scaleMode);
    return new PIXI.Texture(baseTexture);
  };
  PIXI.Texture.addTextureToCache = function(texture, id) {
    PIXI.TextureCache[id] = texture;
  };
  PIXI.Texture.removeTextureFromCache = function(id) {
    var texture = PIXI.TextureCache[id];
    delete PIXI.TextureCache[id];
    delete PIXI.BaseTextureCache[id];
    return texture;
  };
  PIXI.Texture.frameUpdates = [];
  PIXI.TextureUvs = function() {
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
    this.x3 = 0;
    this.y3 = 0;
  };
  PIXI.RenderTexture = function(width, height, renderer, scaleMode) {
    PIXI.EventTarget.call(this);
    this.width = width || 100;
    this.height = height || 100;
    this.frame = new PIXI.Rectangle(0, 0, this.width, this.height);
    this.crop = new PIXI.Rectangle(0, 0, this.width, this.height);
    this.baseTexture = new PIXI.BaseTexture;
    this.baseTexture.width = this.width;
    this.baseTexture.height = this.height;
    this.baseTexture._glTextures = [];
    this.baseTexture.scaleMode = scaleMode || PIXI.scaleModes.DEFAULT;
    this.baseTexture.hasLoaded = true;
    this.renderer = renderer || PIXI.defaultRenderer;
    if (this.renderer.type === PIXI.WEBGL_RENDERER) {
      var gl = this.renderer.gl;
      this.textureBuffer = new PIXI.FilterTexture(gl, this.width, this.height, this.baseTexture.scaleMode);
      this.baseTexture._glTextures[gl.id] = this.textureBuffer.texture;
      this.render = this.renderWebGL;
      this.projection = new PIXI.Point(this.width / 2, -this.height / 2);
    } else {
      this.render = this.renderCanvas;
      this.textureBuffer = new PIXI.CanvasBuffer(this.width, this.height);
      this.baseTexture.source = this.textureBuffer.canvas;
    }
    this.valid = true;
    PIXI.Texture.frameUpdates.push(this);
  };
  PIXI.RenderTexture.prototype = Object.create(PIXI.Texture.prototype);
  PIXI.RenderTexture.prototype.constructor = PIXI.RenderTexture;
  PIXI.RenderTexture.prototype.resize = function(width, height, updateBase) {
    if (width === this.width && height === this.height) {
      return;
    }
    this.width = this.frame.width = this.crop.width = width;
    this.height = this.frame.height = this.crop.height = height;
    if (updateBase) {
      this.baseTexture.width = this.width;
      this.baseTexture.height = this.height;
    }
    if (this.renderer.type === PIXI.WEBGL_RENDERER) {
      this.projection.x = this.width / 2;
      this.projection.y = -this.height / 2;
    }
    this.textureBuffer.resize(this.width, this.height);
  };
  PIXI.RenderTexture.prototype.clear = function() {
    if (this.renderer.type === PIXI.WEBGL_RENDERER) {
      this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
    }
    this.textureBuffer.clear();
  };
  PIXI.RenderTexture.prototype.renderWebGL = function(displayObject, position, clear) {
    var gl = this.renderer.gl;
    gl.colorMask(true, true, true, true);
    gl.viewport(0, 0, this.width, this.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
    if (clear) {
      this.textureBuffer.clear();
    }
    var children = displayObject.children;
    var originalWorldTransform = displayObject.worldTransform;
    displayObject.worldTransform = PIXI.RenderTexture.tempMatrix;
    displayObject.worldTransform.d = -1;
    displayObject.worldTransform.ty = this.projection.y * -2;
    if (position) {
      displayObject.worldTransform.tx = position.x;
      displayObject.worldTransform.ty -= position.y;
    }
    for (var i = 0, j = children.length;i < j;i++) {
      children[i].updateTransform();
    }
    PIXI.WebGLRenderer.updateTextures();
    this.renderer.spriteBatch.dirty = true;
    this.renderer.renderDisplayObject(displayObject, this.projection, this.textureBuffer.frameBuffer);
    displayObject.worldTransform = originalWorldTransform;
    this.renderer.spriteBatch.dirty = true;
  };
  PIXI.RenderTexture.prototype.renderCanvas = function(displayObject, position, clear) {
    var children = displayObject.children;
    var originalWorldTransform = displayObject.worldTransform;
    displayObject.worldTransform = PIXI.RenderTexture.tempMatrix;
    if (position) {
      displayObject.worldTransform.tx = position.x;
      displayObject.worldTransform.ty = position.y;
    } else {
      displayObject.worldTransform.tx = 0;
      displayObject.worldTransform.ty = 0;
    }
    for (var i = 0, j = children.length;i < j;i++) {
      children[i].updateTransform();
    }
    if (clear) {
      this.textureBuffer.clear();
    }
    var context = this.textureBuffer.context;
    this.renderer.renderDisplayObject(displayObject, context);
    context.setTransform(1, 0, 0, 1, 0, 0);
    displayObject.worldTransform = originalWorldTransform;
  };
  PIXI.RenderTexture.tempMatrix = new PIXI.Matrix;
  PIXI.AssetLoader = function(assetURLs, crossorigin) {
    PIXI.EventTarget.call(this);
    this.assetURLs = assetURLs;
    this.crossorigin = crossorigin;
    this.loadersByType = {"jpg":PIXI.ImageLoader, "jpeg":PIXI.ImageLoader, "png":PIXI.ImageLoader, "gif":PIXI.ImageLoader, "webp":PIXI.ImageLoader, "json":PIXI.JsonLoader, "atlas":PIXI.AtlasLoader, "anim":PIXI.SpineLoader, "xml":PIXI.BitmapFontLoader, "fnt":PIXI.BitmapFontLoader};
  };
  PIXI.AssetLoader.prototype.constructor = PIXI.AssetLoader;
  PIXI.AssetLoader.prototype._getDataType = function(str) {
    var test = "data:";
    var start = str.slice(0, test.length).toLowerCase();
    if (start === test) {
      var data = str.slice(test.length);
      var sepIdx = data.indexOf(",");
      if (sepIdx === -1) {
        return null;
      }
      var info = data.slice(0, sepIdx).split(";")[0];
      if (!info || info.toLowerCase() === "text/plain") {
        return "txt";
      }
      return info.split("/").pop().toLowerCase();
    }
    return null;
  };
  PIXI.AssetLoader.prototype.load = function() {
    var scope = this;
    function onLoad(evt) {
      scope.onAssetLoaded(evt.content);
    }
    this.loadCount = this.assetURLs.length;
    for (var i = 0;i < this.assetURLs.length;i++) {
      var fileName = this.assetURLs[i];
      var fileType = this._getDataType(fileName);
      if (!fileType) {
        fileType = fileName.split("?").shift().split(".").pop().toLowerCase();
      }
      var Constructor = this.loadersByType[fileType];
      if (!Constructor) {
        throw new Error(fileType + " is an unsupported file type");
      }
      var loader = new Constructor(fileName, this.crossorigin);
      loader.addEventListener("loaded", onLoad);
      loader.load();
    }
  };
  PIXI.AssetLoader.prototype.onAssetLoaded = function(loader) {
    this.loadCount--;
    this.dispatchEvent({type:"onProgress", content:this, loader:loader});
    if (this.onProgress) {
      this.onProgress(loader);
    }
    if (!this.loadCount) {
      this.dispatchEvent({type:"onComplete", content:this});
      if (this.onComplete) {
        this.onComplete();
      }
    }
  };
  PIXI.JsonLoader = function(url, crossorigin) {
    PIXI.EventTarget.call(this);
    this.url = url;
    this.crossorigin = crossorigin;
    this.baseUrl = url.replace(/[^\/]*$/, "");
    this.loaded = false;
  };
  PIXI.JsonLoader.prototype.constructor = PIXI.JsonLoader;
  PIXI.JsonLoader.prototype.load = function() {
    var scope = this;
    if (window.XDomainRequest && scope.crossorigin) {
      this.ajaxRequest = new window.XDomainRequest;
      this.ajaxRequest.timeout = 3E3;
      this.ajaxRequest.onerror = function() {
        scope.onError();
      };
      this.ajaxRequest.ontimeout = function() {
        scope.onError();
      };
      this.ajaxRequest.onprogress = function() {
      };
    } else {
      if (window.XMLHttpRequest) {
        this.ajaxRequest = new window.XMLHttpRequest;
      } else {
        this.ajaxRequest = new window.ActiveXObject("Microsoft.XMLHTTP");
      }
    }
    this.ajaxRequest.onload = function() {
      scope.onJSONLoaded();
    };
    this.ajaxRequest.open("GET", this.url, true);
    this.ajaxRequest.send();
  };
  PIXI.JsonLoader.prototype.onJSONLoaded = function() {
    if (!this.ajaxRequest.responseText) {
      this.onError();
      return;
    }
    this.json = JSON.parse(this.ajaxRequest.responseText);
    if (this.json.frames) {
      var scope = this;
      var textureUrl = this.baseUrl + this.json.meta.image;
      var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
      var frameData = this.json.frames;
      this.texture = image.texture.baseTexture;
      image.addEventListener("loaded", function() {
        scope.onLoaded();
      });
      for (var i in frameData) {
        var rect = frameData[i].frame;
        if (rect) {
          PIXI.TextureCache[i] = new PIXI.Texture(this.texture, {x:rect.x, y:rect.y, width:rect.w, height:rect.h});
          PIXI.TextureCache[i].crop = new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h);
          if (frameData[i].trimmed) {
            var actualSize = frameData[i].sourceSize;
            var realSize = frameData[i].spriteSourceSize;
            PIXI.TextureCache[i].trim = new PIXI.Rectangle(realSize.x, realSize.y, actualSize.w, actualSize.h);
          }
        }
      }
      image.load();
    } else {
      if (this.json.bones) {
        var spineJsonParser = new spine.SkeletonJson;
        var skeletonData = spineJsonParser.readSkeletonData(this.json);
        PIXI.AnimCache[this.url] = skeletonData;
        this.onLoaded();
      } else {
        this.onLoaded();
      }
    }
  };
  PIXI.JsonLoader.prototype.onLoaded = function() {
    this.loaded = true;
    this.dispatchEvent({type:"loaded", content:this});
  };
  PIXI.JsonLoader.prototype.onError = function() {
    this.dispatchEvent({type:"error", content:this});
  };
  PIXI.AtlasLoader = function(url, crossorigin) {
    PIXI.EventTarget.call(this);
    this.url = url;
    this.baseUrl = url.replace(/[^\/]*$/, "");
    this.crossorigin = crossorigin;
    this.loaded = false;
  };
  PIXI.AtlasLoader.constructor = PIXI.AtlasLoader;
  PIXI.AtlasLoader.prototype.load = function() {
    this.ajaxRequest = new PIXI.AjaxRequest;
    this.ajaxRequest.onreadystatechange = this.onAtlasLoaded.bind(this);
    this.ajaxRequest.open("GET", this.url, true);
    if (this.ajaxRequest.overrideMimeType) {
      this.ajaxRequest.overrideMimeType("application/json");
    }
    this.ajaxRequest.send(null);
  };
  PIXI.AtlasLoader.prototype.onAtlasLoaded = function() {
    if (this.ajaxRequest.readyState === 4) {
      if (this.ajaxRequest.status === 200 || window.location.href.indexOf("http") === -1) {
        this.atlas = {meta:{image:[]}, frames:[]};
        var result = this.ajaxRequest.responseText.split(/\r?\n/);
        var lineCount = -3;
        var currentImageId = 0;
        var currentFrame = null;
        var nameInNextLine = false;
        var i = 0, j = 0, selfOnLoaded = this.onLoaded.bind(this);
        for (i = 0;i < result.length;i++) {
          result[i] = result[i].replace(/^\s+|\s+$/g, "");
          if (result[i] === "") {
            nameInNextLine = i + 1;
          }
          if (result[i].length > 0) {
            if (nameInNextLine === i) {
              this.atlas.meta.image.push(result[i]);
              currentImageId = this.atlas.meta.image.length - 1;
              this.atlas.frames.push({});
              lineCount = -3;
            } else {
              if (lineCount > 0) {
                if (lineCount % 7 === 1) {
                  if (currentFrame != null) {
                    this.atlas.frames[currentImageId][currentFrame.name] = currentFrame;
                  }
                  currentFrame = {name:result[i], frame:{}};
                } else {
                  var text = result[i].split(" ");
                  if (lineCount % 7 === 3) {
                    currentFrame.frame.x = Number(text[1].replace(",", ""));
                    currentFrame.frame.y = Number(text[2]);
                  } else {
                    if (lineCount % 7 === 4) {
                      currentFrame.frame.w = Number(text[1].replace(",", ""));
                      currentFrame.frame.h = Number(text[2]);
                    } else {
                      if (lineCount % 7 === 5) {
                        var realSize = {x:0, y:0, w:Number(text[1].replace(",", "")), h:Number(text[2])};
                        if (realSize.w > currentFrame.frame.w || realSize.h > currentFrame.frame.h) {
                          currentFrame.trimmed = true;
                          currentFrame.realSize = realSize;
                        } else {
                          currentFrame.trimmed = false;
                        }
                      }
                    }
                  }
                }
              }
            }
            lineCount++;
          }
        }
        if (currentFrame != null) {
          this.atlas.frames[currentImageId][currentFrame.name] = currentFrame;
        }
        if (this.atlas.meta.image.length > 0) {
          this.images = [];
          for (j = 0;j < this.atlas.meta.image.length;j++) {
            var textureUrl = this.baseUrl + this.atlas.meta.image[j];
            var frameData = this.atlas.frames[j];
            this.images.push(new PIXI.ImageLoader(textureUrl, this.crossorigin));
            for (i in frameData) {
              var rect = frameData[i].frame;
              if (rect) {
                PIXI.TextureCache[i] = new PIXI.Texture(this.images[j].texture.baseTexture, {x:rect.x, y:rect.y, width:rect.w, height:rect.h});
                if (frameData[i].trimmed) {
                  PIXI.TextureCache[i].realSize = frameData[i].realSize;
                  PIXI.TextureCache[i].trim.x = 0;
                  PIXI.TextureCache[i].trim.y = 0;
                }
              }
            }
          }
          this.currentImageId = 0;
          for (j = 0;j < this.images.length;j++) {
            this.images[j].addEventListener("loaded", selfOnLoaded);
          }
          this.images[this.currentImageId].load();
        } else {
          this.onLoaded();
        }
      } else {
        this.onError();
      }
    }
  };
  PIXI.AtlasLoader.prototype.onLoaded = function() {
    if (this.images.length - 1 > this.currentImageId) {
      this.currentImageId++;
      this.images[this.currentImageId].load();
    } else {
      this.loaded = true;
      this.dispatchEvent({type:"loaded", content:this});
    }
  };
  PIXI.AtlasLoader.prototype.onError = function() {
    this.dispatchEvent({type:"error", content:this});
  };
  PIXI.SpriteSheetLoader = function(url, crossorigin) {
    PIXI.EventTarget.call(this);
    this.url = url;
    this.crossorigin = crossorigin;
    this.baseUrl = url.replace(/[^\/]*$/, "");
    this.texture = null;
    this.frames = {};
  };
  PIXI.SpriteSheetLoader.prototype.constructor = PIXI.SpriteSheetLoader;
  PIXI.SpriteSheetLoader.prototype.load = function() {
    var scope = this;
    var jsonLoader = new PIXI.JsonLoader(this.url, this.crossorigin);
    jsonLoader.addEventListener("loaded", function(event) {
      scope.json = event.content.json;
      scope.onLoaded();
    });
    jsonLoader.load();
  };
  PIXI.SpriteSheetLoader.prototype.onLoaded = function() {
    this.dispatchEvent({type:"loaded", content:this});
  };
  PIXI.ImageLoader = function(url, crossorigin) {
    PIXI.EventTarget.call(this);
    this.texture = PIXI.Texture.fromImage(url, crossorigin);
    this.frames = [];
  };
  PIXI.ImageLoader.prototype.constructor = PIXI.ImageLoader;
  PIXI.ImageLoader.prototype.load = function() {
    if (!this.texture.baseTexture.hasLoaded) {
      var scope = this;
      this.texture.baseTexture.addEventListener("loaded", function() {
        scope.onLoaded();
      });
    } else {
      this.onLoaded();
    }
  };
  PIXI.ImageLoader.prototype.onLoaded = function() {
    this.dispatchEvent({type:"loaded", content:this});
  };
  PIXI.ImageLoader.prototype.loadFramedSpriteSheet = function(frameWidth, frameHeight, textureName) {
    this.frames = [];
    var cols = Math.floor(this.texture.width / frameWidth);
    var rows = Math.floor(this.texture.height / frameHeight);
    var i = 0;
    for (var y = 0;y < rows;y++) {
      for (var x = 0;x < cols;x++, i++) {
        var texture = new PIXI.Texture(this.texture, {x:x * frameWidth, y:y * frameHeight, width:frameWidth, height:frameHeight});
        this.frames.push(texture);
        if (textureName) {
          PIXI.TextureCache[textureName + "-" + i] = texture;
        }
      }
    }
    if (!this.texture.baseTexture.hasLoaded) {
      var scope = this;
      this.texture.baseTexture.addEventListener("loaded", function() {
        scope.onLoaded();
      });
    } else {
      this.onLoaded();
    }
  };
  PIXI.BitmapFontLoader = function(url, crossorigin) {
    PIXI.EventTarget.call(this);
    this.url = url;
    this.crossorigin = crossorigin;
    this.baseUrl = url.replace(/[^\/]*$/, "");
    this.texture = null;
  };
  PIXI.BitmapFontLoader.prototype.constructor = PIXI.BitmapFontLoader;
  PIXI.BitmapFontLoader.prototype.load = function() {
    this.ajaxRequest = new PIXI.AjaxRequest;
    var scope = this;
    this.ajaxRequest.onreadystatechange = function() {
      scope.onXMLLoaded();
    };
    this.ajaxRequest.open("GET", this.url, true);
    if (this.ajaxRequest.overrideMimeType) {
      this.ajaxRequest.overrideMimeType("application/xml");
    }
    this.ajaxRequest.send(null);
  };
  PIXI.BitmapFontLoader.prototype.onXMLLoaded = function() {
    if (this.ajaxRequest.readyState === 4) {
      if (this.ajaxRequest.status === 200 || window.location.protocol.indexOf("http") === -1) {
        var responseXML = this.ajaxRequest.responseXML;
        if (!responseXML || /MSIE 9/i.test(navigator.userAgent) || navigator.isCocoonJS) {
          if (typeof window.DOMParser === "function") {
            var domparser = new DOMParser;
            responseXML = domparser.parseFromString(this.ajaxRequest.responseText, "text/xml");
          } else {
            var div = document.createElement("div");
            div.innerHTML = this.ajaxRequest.responseText;
            responseXML = div;
          }
        }
        var textureUrl = this.baseUrl + responseXML.getElementsByTagName("page")[0].getAttribute("file");
        var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
        this.texture = image.texture.baseTexture;
        var data = {};
        var info = responseXML.getElementsByTagName("info")[0];
        var common = responseXML.getElementsByTagName("common")[0];
        data.font = info.getAttribute("face");
        data.size = parseInt(info.getAttribute("size"), 10);
        data.lineHeight = parseInt(common.getAttribute("lineHeight"), 10);
        data.chars = {};
        var letters = responseXML.getElementsByTagName("char");
        for (var i = 0;i < letters.length;i++) {
          var charCode = parseInt(letters[i].getAttribute("id"), 10);
          var textureRect = new PIXI.Rectangle(parseInt(letters[i].getAttribute("x"), 10), parseInt(letters[i].getAttribute("y"), 10), parseInt(letters[i].getAttribute("width"), 10), parseInt(letters[i].getAttribute("height"), 10));
          data.chars[charCode] = {xOffset:parseInt(letters[i].getAttribute("xoffset"), 10), yOffset:parseInt(letters[i].getAttribute("yoffset"), 10), xAdvance:parseInt(letters[i].getAttribute("xadvance"), 10), kerning:{}, texture:PIXI.TextureCache[charCode] = new PIXI.Texture(this.texture, textureRect)};
        }
        var kernings = responseXML.getElementsByTagName("kerning");
        for (i = 0;i < kernings.length;i++) {
          var first = parseInt(kernings[i].getAttribute("first"), 10);
          var second = parseInt(kernings[i].getAttribute("second"), 10);
          var amount = parseInt(kernings[i].getAttribute("amount"), 10);
          data.chars[second].kerning[first] = amount;
        }
        PIXI.BitmapText.fonts[data.font] = data;
        var scope = this;
        image.addEventListener("loaded", function() {
          scope.onLoaded();
        });
        image.load();
      }
    }
  };
  PIXI.BitmapFontLoader.prototype.onLoaded = function() {
    this.dispatchEvent({type:"loaded", content:this});
  };
  PIXI.SpineLoader = function(url, crossorigin) {
    PIXI.EventTarget.call(this);
    this.url = url;
    this.crossorigin = crossorigin;
    this.loaded = false;
  };
  PIXI.SpineLoader.prototype.constructor = PIXI.SpineLoader;
  PIXI.SpineLoader.prototype.load = function() {
    var scope = this;
    var jsonLoader = new PIXI.JsonLoader(this.url, this.crossorigin);
    jsonLoader.addEventListener("loaded", function(event) {
      scope.json = event.content.json;
      scope.onLoaded();
    });
    jsonLoader.load();
  };
  PIXI.SpineLoader.prototype.onLoaded = function() {
    this.loaded = true;
    this.dispatchEvent({type:"loaded", content:this});
  };
  PIXI.AbstractFilter = function(fragmentSrc, uniforms) {
    this.passes = [this];
    this.shaders = [];
    this.dirty = true;
    this.padding = 0;
    this.uniforms = uniforms || {};
    this.fragmentSrc = fragmentSrc || [];
  };
  PIXI.AlphaMaskFilter = function(texture) {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    texture.baseTexture._powerOf2 = true;
    this.uniforms = {mask:{type:"sampler2D", value:texture}, mapDimensions:{type:"2f", value:{x:1, y:5112}}, dimensions:{type:"4fv", value:[0, 0, 0, 0]}};
    if (texture.baseTexture.hasLoaded) {
      this.uniforms.mask.value.x = texture.width;
      this.uniforms.mask.value.y = texture.height;
    } else {
      this.boundLoadedFunction = this.onTextureLoaded.bind(this);
      texture.baseTexture.on("loaded", this.boundLoadedFunction);
    }
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D mask;", "uniform sampler2D uSampler;", "uniform vec2 offset;", "uniform vec4 dimensions;", "uniform vec2 mapDimensions;", "void main(void) {", "   vec2 mapCords = vTextureCoord.xy;", "   mapCords += (dimensions.zw + offset)/ dimensions.xy ;", "   mapCords.y *= -1.0;", "   mapCords.y += 1.0;", "   mapCords *= dimensions.xy / mapDimensions;", "   vec4 original =  texture2D(uSampler, vTextureCoord);", 
    "   float maskAlpha =  texture2D(mask, mapCords).r;", "   original *= maskAlpha;", "   gl_FragColor =  original;", "}"];
  };
  PIXI.AlphaMaskFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.AlphaMaskFilter.prototype.constructor = PIXI.AlphaMaskFilter;
  PIXI.AlphaMaskFilter.prototype.onTextureLoaded = function() {
    this.uniforms.mapDimensions.value.x = this.uniforms.mask.value.width;
    this.uniforms.mapDimensions.value.y = this.uniforms.mask.value.height;
    this.uniforms.mask.value.baseTexture.off("loaded", this.boundLoadedFunction);
  };
  Object.defineProperty(PIXI.AlphaMaskFilter.prototype, "map", {get:function() {
    return this.uniforms.mask.value;
  }, set:function(value) {
    this.uniforms.mask.value = value;
  }});
  PIXI.ColorMatrixFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {matrix:{type:"mat4", value:[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float invert;", "uniform mat4 matrix;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix;", "}"];
  };
  PIXI.ColorMatrixFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.ColorMatrixFilter.prototype.constructor = PIXI.ColorMatrixFilter;
  Object.defineProperty(PIXI.ColorMatrixFilter.prototype, "matrix", {get:function() {
    return this.uniforms.matrix.value;
  }, set:function(value) {
    this.uniforms.matrix.value = value;
  }});
  PIXI.GrayFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {gray:{type:"1f", value:1}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "uniform float gray;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);", "}"];
  };
  PIXI.GrayFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.GrayFilter.prototype.constructor = PIXI.GrayFilter;
  Object.defineProperty(PIXI.GrayFilter.prototype, "gray", {get:function() {
    return this.uniforms.gray.value;
  }, set:function(value) {
    this.uniforms.gray.value = value;
  }});
  PIXI.DisplacementFilter = function(texture) {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    texture.baseTexture._powerOf2 = true;
    this.uniforms = {displacementMap:{type:"sampler2D", value:texture}, scale:{type:"2f", value:{x:30, y:30}}, offset:{type:"2f", value:{x:0, y:0}}, mapDimensions:{type:"2f", value:{x:1, y:5112}}, dimensions:{type:"4fv", value:[0, 0, 0, 0]}};
    if (texture.baseTexture.hasLoaded) {
      this.uniforms.mapDimensions.value.x = texture.width;
      this.uniforms.mapDimensions.value.y = texture.height;
    } else {
      this.boundLoadedFunction = this.onTextureLoaded.bind(this);
      texture.baseTexture.on("loaded", this.boundLoadedFunction);
    }
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D displacementMap;", "uniform sampler2D uSampler;", "uniform vec2 scale;", "uniform vec2 offset;", "uniform vec4 dimensions;", "uniform vec2 mapDimensions;", "void main(void) {", "   vec2 mapCords = vTextureCoord.xy;", "   mapCords += (dimensions.zw + offset)/ dimensions.xy ;", "   mapCords.y *= -1.0;", "   mapCords.y += 1.0;", "   vec2 matSample = texture2D(displacementMap, mapCords).xy;", 
    "   matSample -= 0.5;", "   matSample *= scale;", "   matSample /= mapDimensions;", "   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));", "   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb, 1.0);", "   vec2 cord = vTextureCoord;", "}"];
  };
  PIXI.DisplacementFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.DisplacementFilter.prototype.constructor = PIXI.DisplacementFilter;
  PIXI.DisplacementFilter.prototype.onTextureLoaded = function() {
    this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width;
    this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height;
    this.uniforms.displacementMap.value.baseTexture.off("loaded", this.boundLoadedFunction);
  };
  Object.defineProperty(PIXI.DisplacementFilter.prototype, "map", {get:function() {
    return this.uniforms.displacementMap.value;
  }, set:function(value) {
    this.uniforms.displacementMap.value = value;
  }});
  Object.defineProperty(PIXI.DisplacementFilter.prototype, "scale", {get:function() {
    return this.uniforms.scale.value;
  }, set:function(value) {
    this.uniforms.scale.value = value;
  }});
  Object.defineProperty(PIXI.DisplacementFilter.prototype, "offset", {get:function() {
    return this.uniforms.offset.value;
  }, set:function(value) {
    this.uniforms.offset.value = value;
  }});
  PIXI.PixelateFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {invert:{type:"1f", value:0}, dimensions:{type:"4fv", value:new Float32Array([1E4, 100, 10, 10])}, pixelSize:{type:"2f", value:{x:10, y:10}}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec2 testDim;", "uniform vec4 dimensions;", "uniform vec2 pixelSize;", "uniform sampler2D uSampler;", "void main(void) {", "   vec2 coord = vTextureCoord;", "   vec2 size = dimensions.xy/pixelSize;", "   vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;", "   gl_FragColor = texture2D(uSampler, color);", "}"];
  };
  PIXI.PixelateFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.PixelateFilter.prototype.constructor = PIXI.PixelateFilter;
  Object.defineProperty(PIXI.PixelateFilter.prototype, "size", {get:function() {
    return this.uniforms.pixelSize.value;
  }, set:function(value) {
    this.dirty = true;
    this.uniforms.pixelSize.value = value;
  }});
  PIXI.BlurXFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {blur:{type:"1f", value:1 / 512}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "   vec4 sum = vec4(0.0);", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 4.0*blur, vTextureCoord.y)) * 0.05;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 3.0*blur, vTextureCoord.y)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 2.0*blur, vTextureCoord.y)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - blur, vTextureCoord.y)) * 0.15;", 
    "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + blur, vTextureCoord.y)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 2.0*blur, vTextureCoord.y)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 3.0*blur, vTextureCoord.y)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 4.0*blur, vTextureCoord.y)) * 0.05;", "   gl_FragColor = sum;", "}"];
  };
  PIXI.BlurXFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.BlurXFilter.prototype.constructor = PIXI.BlurXFilter;
  Object.defineProperty(PIXI.BlurXFilter.prototype, "blur", {get:function() {
    return this.uniforms.blur.value / (1 / 7E3);
  }, set:function(value) {
    this.dirty = true;
    this.uniforms.blur.value = 1 / 7E3 * value;
  }});
  PIXI.BlurYFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {blur:{type:"1f", value:1 / 512}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "   vec4 sum = vec4(0.0);", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 4.0*blur)) * 0.05;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 3.0*blur)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 2.0*blur)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - blur)) * 0.15;", 
    "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + blur)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 2.0*blur)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 3.0*blur)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 4.0*blur)) * 0.05;", "   gl_FragColor = sum;", "}"];
  };
  PIXI.BlurYFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.BlurYFilter.prototype.constructor = PIXI.BlurYFilter;
  Object.defineProperty(PIXI.BlurYFilter.prototype, "blur", {get:function() {
    return this.uniforms.blur.value / (1 / 7E3);
  }, set:function(value) {
    this.uniforms.blur.value = 1 / 7E3 * value;
  }});
  PIXI.BlurFilter = function() {
    this.blurXFilter = new PIXI.BlurXFilter;
    this.blurYFilter = new PIXI.BlurYFilter;
    this.passes = [this.blurXFilter, this.blurYFilter];
  };
  Object.defineProperty(PIXI.BlurFilter.prototype, "blur", {get:function() {
    return this.blurXFilter.blur;
  }, set:function(value) {
    this.blurXFilter.blur = this.blurYFilter.blur = value;
  }});
  Object.defineProperty(PIXI.BlurFilter.prototype, "blurX", {get:function() {
    return this.blurXFilter.blur;
  }, set:function(value) {
    this.blurXFilter.blur = value;
  }});
  Object.defineProperty(PIXI.BlurFilter.prototype, "blurY", {get:function() {
    return this.blurYFilter.blur;
  }, set:function(value) {
    this.blurYFilter.blur = value;
  }});
  PIXI.InvertFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {invert:{type:"1f", value:1}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float invert;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, 1.0 - invert);", "}"];
  };
  PIXI.InvertFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.InvertFilter.prototype.constructor = PIXI.InvertFilter;
  Object.defineProperty(PIXI.InvertFilter.prototype, "invert", {get:function() {
    return this.uniforms.invert.value;
  }, set:function(value) {
    this.uniforms.invert.value = value;
  }});
  PIXI.SepiaFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {sepia:{type:"1f", value:1}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float sepia;", "uniform sampler2D uSampler;", "const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);", "}"];
  };
  PIXI.SepiaFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.SepiaFilter.prototype.constructor = PIXI.SepiaFilter;
  Object.defineProperty(PIXI.SepiaFilter.prototype, "sepia", {get:function() {
    return this.uniforms.sepia.value;
  }, set:function(value) {
    this.uniforms.sepia.value = value;
  }});
  PIXI.TwistFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {radius:{type:"1f", value:.5}, angle:{type:"1f", value:5}, offset:{type:"2f", value:{x:.5, y:.5}}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "uniform float radius;", "uniform float angle;", "uniform vec2 offset;", "void main(void) {", "   vec2 coord = vTextureCoord - offset;", "   float distance = length(coord);", "   if (distance < radius) {", "       float ratio = (radius - distance) / radius;", "       float angleMod = ratio * ratio * angle;", "       float s = sin(angleMod);", 
    "       float c = cos(angleMod);", "       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);", "   }", "   gl_FragColor = texture2D(uSampler, coord+offset);", "}"];
  };
  PIXI.TwistFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.TwistFilter.prototype.constructor = PIXI.TwistFilter;
  Object.defineProperty(PIXI.TwistFilter.prototype, "offset", {get:function() {
    return this.uniforms.offset.value;
  }, set:function(value) {
    this.dirty = true;
    this.uniforms.offset.value = value;
  }});
  Object.defineProperty(PIXI.TwistFilter.prototype, "radius", {get:function() {
    return this.uniforms.radius.value;
  }, set:function(value) {
    this.dirty = true;
    this.uniforms.radius.value = value;
  }});
  Object.defineProperty(PIXI.TwistFilter.prototype, "angle", {get:function() {
    return this.uniforms.angle.value;
  }, set:function(value) {
    this.dirty = true;
    this.uniforms.angle.value = value;
  }});
  PIXI.ColorStepFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {step:{type:"1f", value:5}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "uniform float step;", "void main(void) {", "   vec4 color = texture2D(uSampler, vTextureCoord);", "   color = floor(color * step) / step;", "   gl_FragColor = color;", "}"];
  };
  PIXI.ColorStepFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.ColorStepFilter.prototype.constructor = PIXI.ColorStepFilter;
  Object.defineProperty(PIXI.ColorStepFilter.prototype, "step", {get:function() {
    return this.uniforms.step.value;
  }, set:function(value) {
    this.uniforms.step.value = value;
  }});
  PIXI.DotScreenFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {scale:{type:"1f", value:1}, angle:{type:"1f", value:5}, dimensions:{type:"4fv", value:[0, 0, 0, 0]}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "uniform float angle;", "uniform float scale;", "float pattern() {", "   float s = sin(angle), c = cos(angle);", "   vec2 tex = vTextureCoord * dimensions.xy;", "   vec2 point = vec2(", "       c * tex.x - s * tex.y,", "       s * tex.x + c * tex.y", "   ) * scale;", "   return (sin(point.x) * sin(point.y)) * 4.0;", "}", "void main() {", 
    "   vec4 color = texture2D(uSampler, vTextureCoord);", "   float average = (color.r + color.g + color.b) / 3.0;", "   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);", "}"];
  };
  PIXI.DotScreenFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.DotScreenFilter.prototype.constructor = PIXI.DotScreenFilter;
  Object.defineProperty(PIXI.DotScreenFilter.prototype, "scale", {get:function() {
    return this.uniforms.scale.value;
  }, set:function(value) {
    this.dirty = true;
    this.uniforms.scale.value = value;
  }});
  Object.defineProperty(PIXI.DotScreenFilter.prototype, "angle", {get:function() {
    return this.uniforms.angle.value;
  }, set:function(value) {
    this.dirty = true;
    this.uniforms.angle.value = value;
  }});
  PIXI.CrossHatchFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {blur:{type:"1f", value:1 / 512}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);", "    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);", "    if (lum < 1.00) {", "        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.75) {", "        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {", 
    "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.50) {", "        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.3) {", "        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "}"];
  };
  PIXI.CrossHatchFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.CrossHatchFilter.prototype.constructor = PIXI.BlurYFilter;
  Object.defineProperty(PIXI.CrossHatchFilter.prototype, "blur", {get:function() {
    return this.uniforms.blur.value / (1 / 7E3);
  }, set:function(value) {
    this.uniforms.blur.value = 1 / 7E3 * value;
  }});
  PIXI.RGBSplitFilter = function() {
    PIXI.AbstractFilter.call(this);
    this.passes = [this];
    this.uniforms = {red:{type:"2f", value:{x:20, y:20}}, green:{type:"2f", value:{x:-20, y:20}}, blue:{type:"2f", value:{x:20, y:-20}}, dimensions:{type:"4fv", value:[0, 0, 0, 0]}};
    this.fragmentSrc = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec2 red;", "uniform vec2 green;", "uniform vec2 blue;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;", "   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;", "   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;", "   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;", 
    "}"];
  };
  PIXI.RGBSplitFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  PIXI.RGBSplitFilter.prototype.constructor = PIXI.RGBSplitFilter;
  Object.defineProperty(PIXI.RGBSplitFilter.prototype, "angle", {get:function() {
    return this.uniforms.blur.value / (1 / 7E3);
  }, set:function(value) {
    this.uniforms.blur.value = 1 / 7E3 * value;
  }});
  if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
      exports = module.exports = PIXI;
    }
    exports.PIXI = PIXI;
  } else {
    if (typeof define !== "undefined" && define.amd) {
      define(PIXI);
    } else {
      root.PIXI = PIXI;
    }
  }
}).call(this);
