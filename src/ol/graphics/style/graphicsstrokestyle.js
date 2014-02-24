goog.provide('ol.graphics.style.Stroke');

goog.require('ol.color');
goog.require('ol.render.canvas');



/**
 * @typedef {Object}
 * @property {string|undefined} color Color.
 * @property {string|undefined} lineCap Line cap.
 * @property {Array.<number>|undefined} lineDash Line dash;
 * @property {string|undefined} lineJoin Line join.
 * @property {number|undefined} miterLimit Miter limit.
 * @property {number|undefined} width Width.
 */
ol.graphics.style.StrokeOptions;


/**
 * @constructor
 * @param {ol.graphics.style.StrokeOptions=} opt_options Options.
 */
ol.graphics.style.Stroke = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};

  /**
   * @private
   * @type {string}
   */
  this.color_ = ol.color.asString(options.color ||
      ol.render.canvas.defaultStrokeStyle);

  /**
   * @private
   * @type {string}
   */
  this.lineCap_ = options.lineCap || ol.render.canvas.defaultLineCap;

  /**
   * @private
   * @type {Array.<number>}
   */
  this.lineDash_ = options.lineDash || ol.render.canvas.defaultLineDash;

  /**
   * @private
   * @type {string}
   */
  this.lineJoin_ = options.lineJoin || ol.render.canvas.defaultLineJoin;

  /**
   * @private
   * @type {number}
   */
  this.miterLimit_ = goog.isDef(options.miterLimit) ? options.miterLimit :
      ol.render.canvas.defaultMiterLimit;

  /**
   * @private
   * @type {number}
   */
  this.width_ = goog.isDef(options.width) ? options.width :
      ol.render.canvas.defaultLineWidth;
};


/**
 * @param  {ol.style.Stroke} olStyle Stroke style.
 * @return {ol.graphics.style.Stroke}
 */
ol.graphics.style.Stroke.fromOLStyle = function(olStyle) {
  if (goog.isNull(olStyle)) {
    return new ol.graphics.style.Stroke();
  }

  return new ol.graphics.style.Stroke({
    color: olStyle.getColor(),
    lineCap: olStyle.getLineCap(),
    lineDash: olStyle.getLineDash(),
    lineJoin: olStyle.getLineJoin(),
    miterLimit: olStyle.getMiterLimit(),
    width: olStyle.getWidth()
  });
};


/**
 * @return {string} Color.
 */
ol.graphics.style.Stroke.prototype.getColor = function() {
  return this.color_;
};


/**
 * @return {string} Line cap.
 */
ol.graphics.style.Stroke.prototype.getLineCap = function() {
  return this.lineCap_;
};


/**
 * @return {Array.<number>} Line dash.
 */
ol.graphics.style.Stroke.prototype.getLineDash = function() {
  return this.lineDash_;
};


/**
 * @return {string} Line join.
 */
ol.graphics.style.Stroke.prototype.getLineJoin = function() {
  return this.lineJoin_;
};


/**
 * @return {number} Miter limit.
 */
ol.graphics.style.Stroke.prototype.getMiterLimit = function() {
  return this.miterLimit_;
};


/**
 * @return {number} Width.
 */
ol.graphics.style.Stroke.prototype.getWidth = function() {
  return this.width_;
};
