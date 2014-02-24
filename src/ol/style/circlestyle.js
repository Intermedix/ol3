// FIXME decide default value for snapToPixel

goog.provide('ol.style.Circle');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('ol.color');
goog.require('ol.graphics.Drawing');
goog.require('ol.render.canvas');
goog.require('ol.style.Fill');
goog.require('ol.style.Image');
goog.require('ol.style.ImageState');
goog.require('ol.style.Stroke');



/**
 * @constructor
 * @param {olx.style.CircleOptions=} opt_options Options.
 * @extends {ol.style.Image}
 * @todo stability experimental
 */
ol.style.Circle = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};

  /**
   * @private
   * @type {ol.graphics.Drawing}
   */
  this.drawing_ = new ol.graphics.Drawing();

  /**
   * @private
   * @type {ol.style.Fill}
   */
  this.fill_ = goog.isDef(options.fill) ? options.fill : null;

  /**
   * @private
   * @type {number}
   */
  this.radius_ = options.radius;

  /**
   * @private
   * @type {ol.style.Stroke}
   */
  this.stroke_ = goog.isDef(options.stroke) ? options.stroke : null;


  var size = this.render_();

  /**
   * @private
   * @type {Array.<number>}
   */
  this.anchor_ = [size / 2, size / 2];

  /**
   * @private
   * @type {ol.Size}
   */
  this.size_ = [size, size];

  goog.base(this, {
    opacity: 1,
    rotateWithView: false,
    rotation: 0,
    scale: 1,
    snapToPixel: undefined
  });

};
goog.inherits(ol.style.Circle, ol.style.Image);


/**
 * @inheritDoc
 */
ol.style.Circle.prototype.getAnchor = function() {
  return this.anchor_;
};


/**
 * @return {ol.style.Fill} Fill style.
 */
ol.style.Circle.prototype.getFill = function() {
  return this.fill_;
};


/**
 * @inheritDoc
 */
ol.style.Circle.prototype.getImage = function(pixelRatio) {
  return this.drawing_;
};


/**
 * @inheritDoc
 */
ol.style.Circle.prototype.getImageState = function() {
  return ol.style.ImageState.LOADED;
};


/**
 * @return {number} Radius.
 */
ol.style.Circle.prototype.getRadius = function() {
  return this.radius_;
};


/**
 * @inheritDoc
 */
ol.style.Circle.prototype.getSize = function() {
  return this.size_;
};


/**
 * @return {ol.style.Stroke} Stroke style.
 */
ol.style.Circle.prototype.getStroke = function() {
  return this.stroke_;
};


/**
 * @inheritDoc
 */
ol.style.Circle.prototype.listenImageChange = goog.nullFunction;


/**
 * @inheritDoc
 */
ol.style.Circle.prototype.load = goog.nullFunction;


/**
 * @inheritDoc
 */
ol.style.Circle.prototype.unlistenImageChange = goog.nullFunction;


/**
 * @private
 * @return {number} Size.
 */
ol.style.Circle.prototype.render_ = function() {
  var drawing = this.drawing_;
  drawing.setFillStyle(this.fill_);
  drawing.setStrokeStyle(this.stroke_);

  var width = 2 * this.radius_;
  if (this.stroke_) {
    width += 2 * (this.stroke_.getWidth() || 1);
  }

  drawing.drawCircle(width / 2, width / 2, this.radius_);
  if (this.fill_) {
    drawing.applyFill();
  }
  if (this.stroke_) {
    drawing.applyStroke();
  }

  return width;
};
