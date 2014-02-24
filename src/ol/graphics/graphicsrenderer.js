goog.provide('ol.graphics.Renderer');


/**
 * @constructor
 */
ol.graphics.Renderer = function() {
};


/**
 * @return {Element}
 */
ol.graphics.Renderer.prototype.getElement = goog.abstractMethod;


/**
 * @param {ol.graphics.Embedded} embedded Embedded.
 * @param {ol.graphics.State} state State.
 */
ol.graphics.Renderer.prototype.renderEmbedded = goog.abstractMethod;


/**
 * @param {ol.graphics.Circle} circle Circle.
 * @param {ol.graphics.State} state State.
 */
ol.graphics.Renderer.prototype.renderCircle = goog.abstractMethod;


/**
 * @param {ol.graphics.Path} path Path.
 * @param {ol.graphics.State} state State.
 */
ol.graphics.Renderer.prototype.renderPath = goog.abstractMethod;