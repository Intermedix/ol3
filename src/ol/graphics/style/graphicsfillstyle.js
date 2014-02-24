goog.provide('ol.graphics.style.Fill');

goog.require('ol.color');
goog.require('ol.style.Fill');



/**
 * @typedef {Object}
 * @property {string|undefined} color Color.
 */
ol.graphics.style.FillOptions;


/**
 * @constructor
 * @param {ol.graphics.style.FillOptions=} opt_options Options.
 */
ol.graphics.style.Fill = function(opt_options) {
  var options = goog.isDef(opt_options) ? opt_options : {};

  /**
   * @private
   * @type {string}
   */
  this.color_ = ol.color.asString(options.color ||
      ol.render.canvas.defaultFillStyle);
};


/**
 * @param  {ol.style.Fill} olStyle Fill style.
 * @return {ol.graphics.style.Fill}
 */
ol.graphics.style.Fill.fromOLStyle = function(olStyle) {
  if (goog.isNull(olStyle)) {
    return new ol.graphics.style.Fill();
  }
  return new ol.graphics.style.Fill({
    color: olStyle.getColor()
  });
};


/**
 * @return {string} Color.
 */
ol.graphics.style.Fill.prototype.getColor = function() {
  return this.color_;
};