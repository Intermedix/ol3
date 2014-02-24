goog.provide('ol.renderer.canvas.Layer');

goog.require('goog.vec.Mat4');
goog.require('ol.graphics.Drawing');
goog.require('ol.graphics.Embeddable');
goog.require('ol.layer.Layer');
goog.require('ol.render.Event');
goog.require('ol.render.EventType');
goog.require('ol.render.canvas.Immediate');
goog.require('ol.renderer.Layer');
goog.require('ol.vec.Mat4');



/**
 * @constructor
 * @extends {ol.renderer.Layer}
 * @param {ol.renderer.Map} mapRenderer Map renderer.
 * @param {ol.layer.Layer} layer Layer.
 */
ol.renderer.canvas.Layer = function(mapRenderer, layer) {

  goog.base(this, mapRenderer, layer);

  /**
   * @private
   * @type {!goog.vec.Mat4.Number}
   */
  this.transform_ = goog.vec.Mat4.createNumber();

};
goog.inherits(ol.renderer.canvas.Layer, ol.renderer.Layer);


/**
 * @param {ol.FrameState} frameState Frame state.
 * @param {ol.layer.LayerState} layerState Layer state.
 * @param {ol.graphics.Drawing} drawing Drawing.
 */
ol.renderer.canvas.Layer.prototype.composeFrame =
    function(frameState, layerState, drawing) {

  this.dispatchPreComposeEvent(drawing, frameState);

  var image = this.getImage();
  if (!goog.isNull(image)) {
    var imageTransform = this.getImageTransform();
    drawing.globalAlpha = layerState.opacity;

    drawing.setTransform(imageTransform);
    drawing.embed(image);
    drawing.resetTransform();
  }

  this.dispatchPostComposeEvent(drawing, frameState);

};


/**
 * @param {ol.render.EventType} type Event type.
 * @param {ol.graphics.Drawing} drawing Drawing.
 * @param {ol.FrameState} frameState Frame state.
 * @param {goog.vec.Mat4.Number=} opt_transform Transform.
 * @private
 */
ol.renderer.canvas.Layer.prototype.dispatchComposeEvent_ =
    function(type, drawing, frameState, opt_transform) {
  var layer = this.getLayer();
  if (layer.hasListener(type)) {
    var transform = goog.isDef(opt_transform) ?
        opt_transform : this.getTransform(frameState);
    var render = new ol.render.canvas.Immediate(
        drawing, frameState.pixelRatio, frameState.extent, transform,
        frameState.view2DState.rotation);
    var composeEvent = new ol.render.Event(type, layer, render, frameState,
        drawing, null);
    layer.dispatchEvent(composeEvent);
    render.flush();
  }
};


/**
 * @param {ol.graphics.Drawing} drawing Drawing.
 * @param {ol.FrameState} frameState Frame state.
 * @param {goog.vec.Mat4.Number=} opt_transform Transform.
 * @protected
 */
ol.renderer.canvas.Layer.prototype.dispatchPostComposeEvent =
    function(drawing, frameState, opt_transform) {
  this.dispatchComposeEvent_(ol.render.EventType.POSTCOMPOSE, drawing,
      frameState, opt_transform);
};


/**
 * @param {ol.graphics.Drawing} drawing Drawing.
 * @param {ol.FrameState} frameState Frame state.
 * @param {goog.vec.Mat4.Number=} opt_transform Transform.
 * @protected
 */
ol.renderer.canvas.Layer.prototype.dispatchPreComposeEvent =
    function(drawing, frameState, opt_transform) {
  this.dispatchComposeEvent_(ol.render.EventType.PRECOMPOSE, drawing,
      frameState, opt_transform);
};


/**
 * @return {ol.graphics.Embeddable} Canvas.
 */
ol.renderer.canvas.Layer.prototype.getImage = goog.abstractMethod;


/**
 * @return {!goog.vec.Mat4.Number} Image transform.
 */
ol.renderer.canvas.Layer.prototype.getImageTransform = goog.abstractMethod;


/**
 * @param {ol.FrameState} frameState Frame state.
 * @protected
 * @return {!goog.vec.Mat4.Number} Transform.
 */
ol.renderer.canvas.Layer.prototype.getTransform = function(frameState) {
  var view2DState = frameState.view2DState;
  var pixelRatio = frameState.pixelRatio;
  return ol.vec.Mat4.makeTransform2D(this.transform_,
      pixelRatio * frameState.size[0] / 2,
      pixelRatio * frameState.size[1] / 2,
      pixelRatio / view2DState.resolution,
      -pixelRatio / view2DState.resolution,
      -view2DState.rotation,
      -view2DState.center[0], -view2DState.center[1]);
};
