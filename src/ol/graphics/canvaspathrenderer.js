goog.provide('ol.graphics.CanvasPathRenderer');

goog.require('ol.graphics.PathRenderer');



/**
 * @constructor
 * @extends {ol.graphics.PathRenderer}
 * @param {HTMLCanvasElement=} opt_canvas Canvas.
 */
ol.graphics.CanvasPathRenderer = function(opt_canvas) {
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
};
goog.inherits(ol.graphics.CanvasPathRenderer, ol.graphics.PathRenderer);


/**
 * @return {HTMLCanvasElement} Canvas.
 */
ol.graphics.CanvasPathRenderer.prototype.getElement = function() {
  return this.canvas_;
};


/**
 * @inheritDoc
 */
ol.graphics.CanvasPathRenderer.prototype.moveTo = function(x, y) {
  this.context_.moveTo(x, y);
};


/**
 * @inheritDoc
 */
ol.graphics.CanvasPathRenderer.prototype.lineTo = function(x, y) {
  this.context_.lineTo(x, y);
};


/**
 * @inheritDoc
 */
ol.graphics.CanvasPathRenderer.prototype.close = function(x, y) {
  this.context_.closePath();
};