goog.provide('ol.render.Event');
goog.provide('ol.render.EventType');

goog.require('goog.events.Event');
goog.require('ol.render.IVectorContext');


/**
 * @enum {string}
 */
ol.render.EventType = {
  POSTCOMPOSE: 'postcompose',
  PRECOMPOSE: 'precompose'
};



/**
 * @constructor
 * @extends {goog.events.Event}
 * @implements {oli.render.Event}
 * @param {ol.render.EventType} type Type.
 * @param {Object=} opt_target Target.
 * @param {ol.render.IVectorContext=} opt_vectorContext Vector context.
 * @param {ol.FrameState=} opt_frameState Frame state.
 * @param {?ol.graphics.Drawing=} opt_drawing Drawing.
 * @param {?ol.webgl.Context=} opt_glContext WebGL Context.
 */
ol.render.Event = function(
    type, opt_target, opt_vectorContext, opt_frameState, opt_drawing,
    opt_glContext) {

  goog.base(this, type, opt_target);

  /**
   * @type {ol.render.IVectorContext|undefined}
   */
  this.vectorContext = opt_vectorContext;

  /**
   * @type {ol.FrameState|undefined}
   */
  this.frameState = opt_frameState;

  /**
   * @type {ol.graphics.Drawing|null|undefined}
   */
  this.drawing = opt_drawing;

  /**
   * @type {ol.webgl.Context|null|undefined}
   */
  this.glContext = opt_glContext;

};
goog.inherits(ol.render.Event, goog.events.Event);
