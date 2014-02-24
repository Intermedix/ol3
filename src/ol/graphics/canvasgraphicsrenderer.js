goog.provide('ol.graphics.CanvasRenderer');

goog.require('goog.dom');
goog.require('ol.graphics.CanvasPathRenderer');
goog.require('ol.graphics.Clip');
goog.require('ol.graphics.Embeddable');
goog.require('ol.graphics.Embedded');
goog.require('ol.graphics.Object');
goog.require('ol.graphics.Renderer');


/**
 * @constructor
 * @extends {ol.graphics.Renderer}
 * @param {HTMLCanvasElement=} opt_canvas Canvas.
 */
ol.graphics.CanvasRenderer = function(opt_canvas) {
  var canvas = opt_canvas;
  if (!goog.isDef(canvas)) {
    canvas = /** @type {HTMLCanvasElement} */
        (goog.dom.createElement(goog.dom.TagName.CANVAS));
  }

  /**
   * @private
   * @type {HTMLCanvasElement}
   */
  this.canvas_ = canvas;

  /**
   * @private
   * @type {CanvasRenderingContext2D}
   */
  this.context_ = /** @type {CanvasRenderingContext2D} */
      (canvas.getContext('2d'));

  /**
   * @private
   * @type {Array.<goog.vec.Mat4.Number>}
   */
  this.transforms_ = [];

  /**
   * @private
   * @type {goog.vec.Mat4.Number}
   */
  this.currentTransform_ = null;

  /**
   * @private
   * @type {boolean}
   */
  this.dirtyTransform_ = true;

  /**
   * @private
   * @type {Object.<string, HTMLCanvasElement>}
   */
  this.cachedDrawings_ = {};
};
goog.inherits(ol.graphics.CanvasRenderer, ol.graphics.Renderer);


/**
 * @inheritDoc
 */
ol.graphics.CanvasRenderer.prototype.getElement = function() {
  return this.canvas_;
};


/**
 * @param {number} width Width.
 * @param {number} height Height.
 */
ol.graphics.CanvasRenderer.prototype.setSize = function(width, height) {
  this.canvas_.width = width;
  this.canvas_.height = height;
};


/**
 *
 */
ol.graphics.CanvasRenderer.prototype.clear = function() {
  this.context_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
  this.currentTransform_ = null;
  this.transforms_ = [];
  this.dirtyTransform_ = true;
};


/**
 * @inheritDoc
 */
ol.graphics.CanvasRenderer.prototype.renderEmbedded = function(embedded, state) {
  var obj = embedded.object;
  if (goog.isNull(obj)) {
    return;
  }

  var transform = state.transform;
  var alpha = state.alpha;
  var type = embedded.type;

  this.context_.save();
  this.context_.globalAlpha = alpha;

  /** @type {HTMLCanvasElement|HTMLVideoElement|Image} */
  var image;

  if (type != 'drawing' && type != 'unknown') {
    image = /** @type {HTMLCanvasElement|HTMLVideoElement|Image} */ (obj);
    this.drawImage_(image, embedded.clip, embedded.dest, transform);
  } else if (type == 'drawing') {
    var drawing = /** @type {ol.graphics.Drawing} */ (obj);
    var uid = goog.getUid(drawing).toString();
    if (!(uid in this.cachedDrawings_)) {
      var subRenderer = new ol.graphics.CanvasRenderer();
      subRenderer.setSize(embedded.clip.width || embedded.dest.width,
          embedded.clip.height || embedded.dest.height);
      drawing.renderTo(subRenderer);
      this.cachedDrawings_[uid] = /** @type {HTMLCanvasElement} */ (subRenderer.getElement());
    }
    image = this.cachedDrawings_[uid];

    this.drawImage_(image, embedded.clip, embedded.dest, transform);
 }

  this.context_.restore();
};


/**
 * @inheritDoc
 */
ol.graphics.CanvasRenderer.prototype.renderCircle = function(circle, state) {
  var transform = state.transform;
  var alpha = state.alpha;

  this.context_.save();
  this.context_.globalAlpha = alpha;
  this.setFillStroke_(state);

  var center = circle.center;
  var radius = circle.radius;

  // this.pushTransform_(transform);
  // this.setTransform_();
  this.context_.beginPath();
  this.context_.arc(center[0], center[1], radius, 0, 2 * Math.PI, true);
  this.applyFillStroke_(state);

  // this.popTransform_();
  this.context_.restore();
};


/**
 * @inheritDoc
 */
ol.graphics.CanvasRenderer.prototype.renderPath = function(path, state) {
  var transform = state.transform;
  var alpha = state.alpha;

  this.context_.save();
  this.context_.globalAlpha = alpha;
  this.setFillStroke_(state);

  this.context_.beginPath();
  var pathRenderer = new ol.graphics.CanvasPathRenderer(this.canvas_);
  path.renderTo(pathRenderer);

  this.applyFillStroke_(state);

  this.context_.restore();
};


/**
 * @private
 * @param {ol.graphics.State} state State.
 */
ol.graphics.CanvasRenderer.prototype.setFillStroke_ = function(state) {
  var context = this.context_;

  var fill = state.fillStyle;
  var stroke = state.strokeStyle;

  if (!goog.isNull(fill) && state.applyFill) {
    context.fillStyle = fill.getColor();
  }

  if (!goog.isNull(stroke) && state.applyStroke) {
    context.strokeStyle = stroke.getColor();
    context.lineCap = stroke.getLineCap();
    context.lineJoin = stroke.getLineJoin();
    context.miterLimit = stroke.getMiterLimit();
    context.lineWidth = stroke.getWidth();

    if (ol.BrowserFeature.HAS_CANVAS_LINE_DASH) {
      context.setLineDash(stroke.getLineDash());
    }
  }
};


/**
 * @private
 * @param {ol.graphics.State} state State.
 */
ol.graphics.CanvasRenderer.prototype.applyFillStroke_ = function(state) {
  if (state.applyFill) {
    this.context_.fill();
  }
  if (state.applyStroke) {
    this.context_.stroke();
  }
};


/**
 * @private
 * @param {HTMLCanvasElement|HTMLVideoElement|Image} image Image.
 * @param {ol.graphics.Clip} clip Source clip.
 * @param {ol.graphics.Clip} dest Destination clip.
 * @param {goog.vec.Mat4.Number} transform Transform.
 */
ol.graphics.CanvasRenderer.prototype.drawImage_ =
    function(image, clip, dest, transform) {
  var sx = clip.x;
  var sy = clip.y;
  var sw = clip.width;
  var sh = clip.height;
  var dx = dest.x;
  var dy = dest.y;
  var dw = dest.width;
  var dh = dest.height;

  if (!goog.isDef(sw)) {
    sw = image.width;
  }
  if (!goog.isDef(sh)) {
    sh = image.height;
  }
  if (!goog.isDef(dw)) {
    dw = sw;
  }
  if (!goog.isDef(dh)) {
    dh = sh;
  }

  if (this.isRotated_(transform)) {
    this.pushTransform_(transform);
    this.setTransform_();
    this.context_.drawImage(image, sx, sy, sw, sh,
        Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh));
    this.popTransform_();
  } else {
    this.context_.drawImage(image, sx, sy, sw, sh,
        Math.round(dx + goog.vec.Mat4.getElement(transform, 0, 3)),
        Math.round(dy + goog.vec.Mat4.getElement(transform, 1, 3)),
        Math.round(dw * goog.vec.Mat4.getElement(transform, 0, 0)),
        Math.round(dh * goog.vec.Mat4.getElement(transform, 1, 1)));
  }
};


/**
 * @private
 * @param {goog.vec.Mat4.Number=} opt_transform Transform.
 */
ol.graphics.CanvasRenderer.prototype.setTransform_ = function(opt_transform) {
  if (goog.isDef(opt_transform)) {
    this.transforms_.push(opt_transform);
    this.currentTransform_ = opt_transform;
    this.dirtyTransform_ = false;
  } else {
    opt_transform = this.getCurrentTransform_();
  }

  this.context_.setTransform(
    goog.vec.Mat4.getElement(opt_transform, 0, 0),
    goog.vec.Mat4.getElement(opt_transform, 1, 0),
    goog.vec.Mat4.getElement(opt_transform, 0, 1),
    goog.vec.Mat4.getElement(opt_transform, 1, 1),
    goog.vec.Mat4.getElement(opt_transform, 0, 3),
    goog.vec.Mat4.getElement(opt_transform, 1, 3));
};


/**
 * @private
 * @param {goog.vec.Mat4.Number} transform Transform.
 */
ol.graphics.CanvasRenderer.prototype.isRotated_ = function(transform) {
  return !!(transform && (goog.vec.Mat4.getElement(transform, 0, 1) !== 0));
};


/**
 * @private
 * @param {goog.vec.Mat4.Number} transform Transform.
 */
ol.graphics.CanvasRenderer.prototype.pushTransform_ = function(transform) {
  this.transforms_.push(transform.slice(0));
  this.dirtyTransform_ = true;
};


/**
 * @private
 */
ol.graphics.CanvasRenderer.prototype.popTransform_ = function() {
  this.transforms_.pop();
  this.dirtyTransform_ = true;
};

/**
 * @private
 * @return {goog.vec.Mat4.Number} Transform.
 */
ol.graphics.CanvasRenderer.prototype.getCurrentTransform_ = function() {
  if (this.dirtyTransform_) {
    var i;
    var t = goog.vec.Mat4.createNumberIdentity();
    for (i = this.transforms_.length - 1; i >= 0; --i) {
      goog.vec.Mat4.multMat(this.transforms_[i], t, t);
    }
    this.currentTransform_ = t;
    this.dirtyTransform_ = false;
  }
  return this.currentTransform_;
};