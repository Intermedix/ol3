goog.provide('ol.graphics.PathRenderer');


/**
 * @constructor
 */
ol.graphics.PathRenderer = function() {
};


/**
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 */
ol.graphics.PathRenderer.prototype.moveTo = goog.abstractMethod;


/**
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 */
ol.graphics.PathRenderer.prototype.lineTo = goog.abstractMethod;



/**
 *
 */
ol.graphics.PathRenderer.prototype.close = goog.abstractMethod;