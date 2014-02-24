goog.provide('ol.graphics.Path');

goog.require('ol.graphics.Object');


/**
 * @constructor
 * @extends {ol.graphics.Object}
 */
ol.graphics.Path = function() {
  ol.graphics.Object.call(this);

  /**
   * @private
   * @type {Array.<Array.<*>>}
   */
  this.instructions_ = [];
};
goog.inherits(ol.graphics.Path, ol.graphics.Object);


/**
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 */
ol.graphics.Path.prototype.moveTo = function(x, y) {
  this.instructions_.push(['moveto', x, y]);
};


/**
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 */
ol.graphics.Path.prototype.lineTo = function(x, y) {
  this.instructions_.push(['lineto', x, y]);
};


/**
 *
 */
ol.graphics.Path.prototype.close = function() {
  this.instructions_.push(['close']);
};


/**
 * @param {ol.graphics.PathRenderer} renderer Path renderer.
 */
ol.graphics.Path.prototype.renderTo = function(renderer) {
  var i, ii, instruction, type;
  for (i = 0, ii = this.instructions_.length; i < ii; ++i) {
    instruction = this.instructions_[i];
    type = /** @type {string} */ (instruction[0]);
    switch (type) {
      case 'moveto':
        renderer.moveTo(/** @type {number} */ (instruction[1]),
            /** @type {number} */ (instruction[2]));
        break;
      case 'lineto':
        renderer.lineTo(/** @type {number} */ (instruction[1]),
            /** @type {number} */ (instruction[2]));
        break;
      case 'close':
        renderer.close();
        break;
    }
  }
};