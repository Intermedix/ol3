goog.provide('ol.graphics.style.Text');

goog.require('ol.graphics.style.Fill');
goog.require('ol.graphics.style.Stroke');
goog.require('ol.render.canvas');


/**
 * @typedef {Object}
 * @property {string|undefined} font Font.
 * @property {ol.graphics.style.Fill|undefined} fill Fill.
 * @property {ol.graphics.style.Stroke|undefined} stroke Stroke.
 * @property {string|undefined} textAlign Text align.
 * @property {string|undefined} textBaseline Text baseline.
 */
ol.graphics.style.TextOptions;


/**
 * @constructor
 * @param {ol.graphics.style.TextOptions=} opt_options Options.
 */
ol.graphics.style.Text = function(opt_options) {
  var options = goog.isDef(opt_options) ? opt_options : {};

  /**
   * @private
   * @type {string}
   */
  this.font_ = options.font || ol.render.canvas.defaultFont;

  /**
   * @private
   * @type {ol.graphics.style.Fill}
   */
  this.fill_ = options.fill || new ol.graphics.style.Fill();

  /**
   * @private
   * @type {ol.graphics.style.Stroke}
   */
  this.stroke_ = options.stroke || new ol.graphics.style.Stroke();

  /**
   * @private
   * @type {string}
   */
  this.textAlign_ = options.textAlign || ol.render.canvas.defaultTextAlign;

  /**
   * @private
   * @type {string}
   */
  this.textBaseline_ = options.textBaseline ||
      ol.render.canvas.defaultTextBaseline;
};


/**
 * @param  {ol.style.Text} olStyle Text style.
 * @return {ol.graphics.style.Text}
 */
ol.graphics.style.Text.fromOLStyle = function(olStyle) {
  if (goog.isNull(olStyle)) {
    return new ol.graphics.style.Text();
  }
  return new ol.graphics.style.Text({
    font: olStyle.getFont(),
    fill: ol.graphics.style.Fill.fromOLStyle(olStyle.getFill()),
    stroke: ol.graphics.style.Stroke.fromOLStyle(olStyle.getStroke()),
    textAlign: olStyle.getTextAlign(),
    textBaseline: olStyle.getTextBaseline()
  });
};


/**
 * @return {string} Font.
 */
ol.graphics.style.Text.prototype.getFont = function() {
  return this.font_;
};


/**
 * @return {ol.graphics.style.Fill} Fill style.
 */
ol.graphics.style.Text.prototype.getFill = function() {
  return this.fill_;
};


/**
 * @return {ol.graphics.style.Stroke} Stroke style.
 */
ol.graphics.style.Text.prototype.getStroke = function() {
  return this.stroke_;
};


/**
 * @return {string} Text align.
 */
ol.graphics.style.Text.prototype.getTextAlign = function() {
  return this.textAlign_;
};


/**
 * @return {string} Text baseline.
 */
ol.graphics.style.Text.prototype.getTextBaseline = function() {
  return this.textBaseline_;
};