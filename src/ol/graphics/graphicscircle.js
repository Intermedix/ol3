goog.provide('ol.graphics.Circle');

goog.require('ol.graphics.Object');


/**
 * @constructor
 * @extends {ol.graphics.Object}
 * @param {number} cx Center x coordinate.
 * @param {number} cy Center y coordinate.
 * @param {number} radius Radius.
 */
ol.graphics.Circle = function(cx, cy, radius) {
  ol.graphics.Object.call(this);
  
  /**
   * @type {Array.<number>}
   */
  this.center = [cx, cy];

  /**
   * @type {number}
   */
  this.radius = radius;
};
ol.inherits(ol.graphics.Circle, ol.graphics.Object);