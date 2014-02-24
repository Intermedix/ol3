goog.provide('ol.graphics.Embedded');

goog.require('ol.graphics.Object');


/**
 * @constructor
 * @extends {ol.graphics.Object}
 * @param {ol.graphics.Embeddable} object Object to embed.
 * @param {ol.graphics.Clip=} opt_dest Destination clip
 * @param {ol.graphics.Clip=} opt_clip Source clip
 */
ol.graphics.Embedded = function(object, opt_dest, opt_clip) {
  ol.graphics.Object.call(this);
  
  /**
   * @type {ol.graphics.Embeddable}
   */
  this.object = object;

  /**
   * @type {ol.graphics.Clip}
   */
  this.dest = opt_dest || { x: 0, y: 0 };

  /**
   * @type {ol.graphics.Clip}
   */
  this.clip = opt_clip || { x: 0, y: 0 };

  var type = 'unknown';

  if (object instanceof ol.graphics.Drawing) {
    type = 'drawing';
  } else if (object instanceof HTMLCanvasElement) {
    type = 'canvas';
  } else if (object instanceof HTMLVideoElement) {
    type = 'video';
  } else if (object instanceof Image) {
    type = 'image';
  }

  /**
   * @type {string}
   */
  this.type = type;
};
ol.inherits(ol.graphics.Embedded, ol.graphics.Object);