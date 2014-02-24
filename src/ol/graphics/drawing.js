goog.provide('ol.graphics.Drawing');
goog.provide('ol.graphics.Embeddable');
goog.provide('ol.graphics.Clip');

goog.require('ol.graphics.Circle');
goog.require('ol.graphics.Embedded');
goog.require('ol.graphics.Path');
goog.require('ol.graphics.Renderer');
goog.require('ol.graphics.style.Fill');
goog.require('ol.graphics.style.Stroke');
goog.require('ol.graphics.style.Text');

/**
 * @typedef {ol.graphics.Drawing|HTMLCanvasElement|HTMLVideoElement|Image}
 */
ol.graphics.Embeddable;


/**
 * @typedef {Object}
 * @property {number} x X coordinate.
 * @property {number} y Y coordinate.
 * @property {number|undefined} width Width.
 * @property {number|undefined} height Height.
 */
ol.graphics.Clip;


/**
 * @typedef {Object}
 * @property {ol.graphics.style.Fill} fillStyle Fill style.
 * @property {ol.graphics.style.Stroke} strokeStyle Stroke style.
 * @property {ol.graphics.style.Text} textStyle Text style.
 * @property {number} alpha Alpha.
 * @property {goog.vec.Mat4.Number} transform Transform.
 * @property {boolean} applyStroke Should apply stroke.
 * @property {boolean} applyFill Should apply fill.
 */
ol.graphics.State;


/**
 * @constructor
 */
ol.graphics.Drawing = function() {

  /**
   * @private
   * @type {ol.graphics.State}
   */
  this.currentState_ = {
    fillStyle: null,
    strokeStyle: null,
    textStyle: null,
    alpha: 1,
    transform: goog.vec.Mat4.createNumberIdentity(),
    applyStroke: false,
    applyFill: false
  };

  /**
   * @private
   * @type {Array.<[ol.graphics.Object, ol.graphics.State]>}
   */
  this.scene_ = [];
};


/**
 * @return {[ol.graphics.Object, ol.graphics.State]|null} Object.
 */
ol.graphics.Drawing.prototype.getLast_ = function() {
  var len = this.scene_.length;
  return len ? this.scene_[len - 1] : null;
};


/**
 * @private
 * @param  {ol.graphics.Object} object Object.
 */
ol.graphics.Drawing.prototype.pushObject_ = function(object) {
  var tuple = [object, this.cloneState_(this.currentState_)];
  this.scene_.push(tuple);
  return tuple;
};



/**
 * @param {ol.graphics.style.Fill|ol.style.Fill} style Style.
 */
ol.graphics.Drawing.prototype.setFillStyle = function(style) {
  if (style instanceof ol.style.Fill) {
    style = ol.graphics.style.Fill.fromOLStyle(style);
  }
  this.currentState_.fillStyle = style;
};

/**
 * @param {ol.graphics.style.Stroke|ol.style.Stroke} style Style.
 */
ol.graphics.Drawing.prototype.setStrokeStyle = function(style) {
  if (style instanceof ol.style.Stroke) {
    style = ol.graphics.style.Stroke.fromOLStyle(style);
  }
  this.currentState_.strokeStyle = style;
};


/**
 * @param {ol.graphics.style.Text|ol.style.Text} style Style.
 */
ol.graphics.Drawing.prototype.setTextStyle = function(style) {
  if (style instanceof ol.style.Text) {
    style = ol.graphics.style.Text.fromOLStyle(style);
  }
  this.currentState_.textStyle = style;
};


/**
 * @param {!goog.vec.Mat4.Number} transform Transform.
 */
ol.graphics.Drawing.prototype.setTransform = function(transform) {
  this.currentState_.transform = transform;
};


/**
 *
 */
ol.graphics.Drawing.prototype.resetTransform = function() {
  this.currentState_.transform = goog.vec.Mat4.createNumberIdentity();
};


/**
 * @param {number} alpha Alpha.
 */
ol.graphics.Drawing.prototype.setAlpha = function(alpha) {
  this.currentState_.alpha = alpha;
};


/**
 * @return {number} Alpha.
 */
ol.graphics.Drawing.prototype.getAlpha = function() {
  return this.currentState_.alpha;
};


/**
 * @private
 * @param {ol.graphics.State} state State.
 * @return {ol.graphics.State} State.
 */
ol.graphics.Drawing.prototype.cloneState_ = function(state) {
  // don't need to clone the styles, because they're immutable
  return {
    fillStyle: state.fillStyle,
    strokeStyle: state.strokeStyle,
    textStyle: state.textStyle,
    alpha: state.alpha,
    transform: state.transform.slice(0),
    applyStroke: state.applyStroke,
    applyFill: state.applyFill
  };
};


/**
 *
 */
ol.graphics.Drawing.prototype.applyStroke = function() {
  var obj = this.getLast_();
  if (!goog.isNull(obj)) {
    obj[1].applyStroke = true;
  }
};


/**
 *
 */
ol.graphics.Drawing.prototype.applyFill = function() {
  var obj = this.getLast_();
  if (!goog.isNull(obj)) {
    obj[1].applyFill = true;
  }
};


/**
 * @param {number} cx Center x.
 * @param {number} cy Center y.
 * @param {number} r  Radius.
 */
ol.graphics.Drawing.prototype.drawCircle = function(cx, cy, r) {
  var circle = new ol.graphics.Circle(cx, cy, r);
  this.pushObject_(circle);
};


/**
 * @param {ol.graphics.Path} path Path.
 */
ol.graphics.Drawing.prototype.drawPath = function(path) {
  this.pushObject_(path);
};


/**
 * Embed a sub-drawing, canvas, image, or video.
 *
 * opt_dest specifies the target bounds of the object in the destination. If
 * omitted, it is assumed to be placed at (0,0) with full width/height. Any
 * translation may be supplied by setting a transform.
 *
 * opt_clip specifies the bounds from source object to render in the
 * destination. If omitted, it is assumed to be the full object.
 * 
 * @param {ol.graphics.Embeddable} object The object to embed.
 * @param {ol.graphics.Clip=} opt_dest Destination.
 * @param {ol.graphics.Clip=} opt_clip Source clipping rectangle.
 */
ol.graphics.Drawing.prototype.embed = function(object, opt_dest, opt_clip) {
  var embedded = new ol.graphics.Embedded(object, opt_dest, opt_clip);
  this.pushObject_(embedded);
};


/**
 * @param {string} text Text.
 * @param {number} x X Coordinate.
 * @param {number} y Y Coordinate.
 */
ol.graphics.Drawing.prototype.drawText = function(text, x, y) {
};


/**
 * @param  {ol.graphics.Renderer} renderer Renderer.
 */
ol.graphics.Drawing.prototype.renderTo = function(renderer) {
  var i, ii, obj, state;

  for (i = 0, ii = this.scene_.length; i < ii; ++i) {
    obj = this.scene_[i][0];
    state = this.scene_[i][1];

    if (obj instanceof ol.graphics.Embedded) {
      renderer.renderEmbedded(obj, state);
    } else if (obj instanceof ol.graphics.Circle) {
      renderer.renderCircle(obj, state);
    } else if (obj instanceof ol.graphics.Path) {
      renderer.renderPath(obj, state);
    }
  }
};