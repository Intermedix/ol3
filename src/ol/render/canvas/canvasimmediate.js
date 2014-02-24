// FIXME test, especially polygons with holes and multipolygons
// FIXME need to handle large thick features (where pixel size matters)
// FIXME add offset and end to ol.geom.flat.transform2D?

goog.provide('ol.render.canvas.Immediate');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.object');
goog.require('goog.vec.Mat4');
goog.require('ol.BrowserFeature');
goog.require('ol.color');
goog.require('ol.extent');
goog.require('ol.geom.flat');
goog.require('ol.graphics.Drawing');
goog.require('ol.graphics.Embeddable');
goog.require('ol.graphics.Path');
goog.require('ol.render.IVectorContext');
goog.require('ol.render.canvas');
goog.require('ol.vec.Mat4');



/**
 * @constructor
 * @implements {ol.render.IVectorContext}
 * @param {ol.graphics.Drawing} drawing Drawing.
 * @param {number} pixelRatio Pixel ratio.
 * @param {ol.Extent} extent Extent.
 * @param {goog.vec.Mat4.Number} transform Transform.
 * @param {number} viewRotation View rotation.
 * @struct
 */
ol.render.canvas.Immediate =
    function(drawing, pixelRatio, extent, transform, viewRotation) {

  /**
   * @private
   * @type {Object.<string,
   *        Array.<function(ol.render.canvas.Immediate)>>}
   */
  this.callbacksByZIndex_ = {};

  /**
   * @private
   * @type {ol.graphics.Drawing}
   */
  this.drawing_ = drawing;

  /**
   * @private
   * @type {number}
   */
  this.pixelRatio_ = pixelRatio;

  /**
   * @private
   * @type {ol.Extent}
   */
  this.extent_ = extent;

  /**
   * @private
   * @type {goog.vec.Mat4.Number}
   */
  this.transform_ = transform;

  /**
   * @private
   * @type {number}
   */
  this.viewRotation_ = viewRotation;

  /**
   * @private
   * @type {?ol.render.canvas.FillState}
   */
  this.contextFillState_ = null;

  /**
   * @private
   * @type {?ol.render.canvas.StrokeState}
   */
  this.contextStrokeState_ = null;

  /**
   * @private
   * @type {?ol.render.canvas.TextState}
   */
  this.contextTextState_ = null;

  /**
   * @private
   * @type {?ol.render.canvas.FillState}
   */
  this.fillState_ = null;

  /**
   * @private
   * @type {?ol.render.canvas.StrokeState}
   */
  this.strokeState_ = null;

  /**
   * @private
   * @type {ol.graphics.Embeddable}
   */
  this.image_ = null;

  /**
   * @private
   * @type {number}
   */
  this.imageAnchorX_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.imageAnchorY_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.imageHeight_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.imageOpacity_ = 0;

  /**
   * @private
   * @type {boolean}
   */
  this.imageRotateWithView_ = false;

  /**
   * @private
   * @type {number}
   */
  this.imageRotation_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.imageScale_ = 0;

  /**
   * @private
   * @type {boolean}
   */
  this.imageSnapToPixel_ = false;

  /**
   * @private
   * @type {number}
   */
  this.imageWidth_ = 0;

  /**
   * @private
   * @type {string}
   */
  this.text_ = '';

  /**
   * @private
   * @type {number}
   */
  this.textRotation_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.textScale_ = 0;

  /**
   * @private
   * @type {Array.<number>}
   */
  this.pixelCoordinates_ = [];

  /**
   * @private
   * @type {!goog.vec.Mat4.Number}
   */
  this.tmpLocalTransform_ = goog.vec.Mat4.createNumber();

};


/**
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @private
 */
ol.render.canvas.Immediate.prototype.drawImages_ =
    function(flatCoordinates, offset, end, stride) {
  if (goog.isNull(this.image_)) {
    return;
  }
  goog.asserts.assert(offset === 0);
  goog.asserts.assert(end == flatCoordinates.length);
  var pixelCoordinates = ol.geom.flat.transform2D(
      flatCoordinates, 2, this.transform_, this.pixelCoordinates_);
  var drawing = this.drawing_;
  var localTransform = this.tmpLocalTransform_;
  var alpha = drawing.getAlpha();
  if (this.imageOpacity_ != 1) {
    drawing.setAlpha(alpha * this.imageOpacity_);
  }
  var rotation = this.imageRotation_;
  if (this.imageRotateWithView_) {
    rotation += this.viewRotation_;
  }
  var i, ii;
  for (i = 0, ii = pixelCoordinates.length; i < ii; i += 2) {
    var x = pixelCoordinates[i] - this.imageAnchorX_;
    var y = pixelCoordinates[i + 1] - this.imageAnchorY_;
    if (this.imageSnapToPixel_) {
      x = (x + 0.5) | 0;
      y = (y + 0.5) | 0;
    }
    if (rotation !== 0 || this.imageScale_ != 1) {
      var centerX = x + this.imageAnchorX_;
      var centerY = y + this.imageAnchorY_;
      ol.vec.Mat4.makeTransform2D(localTransform,
          centerX, centerY, this.imageScale_, this.imageScale_,
          rotation, -centerX, -centerY);
      drawing.setTransform(localTransform);
    }
    drawing.embed(this.image_,
      {x: x, y: y, width: this.imageWidth_, height: this.imageHeight_},
      {x: 0, y: 0, width: this.imageWidth_, height: this.imageHeight_});
  }
  if (rotation !== 0 || this.imageScale_ != 1) {
    drawing.resetTransform();
  }
  if (this.imageOpacity_ != 1) {
    drawing.setAlpha(alpha);
  }
};


/**
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @private
 */
ol.render.canvas.Immediate.prototype.drawText_ =
    function(flatCoordinates, offset, end, stride) {
  if (this.text_ === '') {
    return;
  }
  goog.asserts.assert(offset === 0);
  goog.asserts.assert(end == flatCoordinates.length);
  var pixelCoordinates = ol.geom.flat.transform2D(
      flatCoordinates, stride, this.transform_, this.pixelCoordinates_);
  var drawing = this.drawing_;
  for (; offset < end; offset += stride) {
    var x = pixelCoordinates[offset];
    var y = pixelCoordinates[offset + 1];
    if (this.textRotation_ !== 0 || this.textScale_ != 1) {
      var localTransform = ol.vec.Mat4.makeTransform2D(this.tmpLocalTransform_,
          x, y, this.textScale_, this.textScale_, this.textRotation_, -x, -y);
      drawing.setTransform(localTransform);
    }
    drawing.drawText(this.text_, x, y);
  }
  if (this.textRotation_ !== 0 || this.textScale_ != 1) {
    drawing.resetTransform();
  }
};


/**
 * @param {ol.graphics.Path} path Path.
 * @param {Array.<number>} pixelCoordinates Pixel coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {boolean} close Close.
 * @private
 * @return {number} end End.
 */
ol.render.canvas.Immediate.prototype.moveToLineTo_ =
    function(path, pixelCoordinates, offset, end, close) {
  path.moveTo(pixelCoordinates[offset], pixelCoordinates[offset + 1]);
  var i;
  for (i = offset + 2; i < end; i += 2) {
    path.lineTo(pixelCoordinates[i], pixelCoordinates[i + 1]);
  }
  if (close) {
    path.close();
  }
  return end;
};


/**
 * @param {ol.graphics.Path} path Path.
 * @param {Array.<number>} pixelCoordinates Pixel coordinates.
 * @param {number} offset Offset.
 * @param {Array.<number>} ends Ends.
 * @private
 * @return {number} End.
 */
ol.render.canvas.Immediate.prototype.drawRings_ =
    function(path, pixelCoordinates, offset, ends) {
  var i, ii;
  for (i = 0, ii = ends.length; i < ii; ++i) {
    offset = this.moveToLineTo_(path, pixelCoordinates, offset, ends[i], true);
  }
  return offset;
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.drawAsync = function(zIndex, callback) {
  var zIndexKey = zIndex.toString();
  var callbacks = this.callbacksByZIndex_[zIndexKey];
  if (goog.isDef(callbacks)) {
    callbacks.push(callback);
  } else {
    this.callbacksByZIndex_[zIndexKey] = [callback];
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.drawCircleGeometry =
    function(circleGeometry, data) {
  if (!ol.extent.intersects(this.extent_, circleGeometry.getExtent())) {
    return;
  }
  var pixelCoordinates = ol.geom.transformSimpleGeometry2D(
      circleGeometry, this.transform_, this.pixelCoordinates_);
  var dx = pixelCoordinates[2] - pixelCoordinates[0];
  var dy = pixelCoordinates[3] - pixelCoordinates[1];
  var radius = Math.sqrt(dx * dx + dy * dy);
  var drawing = this.drawing_;
  drawing.drawCircle(pixelCoordinates[0], pixelCoordinates[1], radius);
  drawing.applyFill();
  drawing.applyStroke();
  if (this.text_ !== '') {
    this.drawText_(circleGeometry.getCenter(), 0, 2, 2);
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.drawFeature = function(feature, style) {
  var geometry = feature.getGeometry();
  if (goog.isNull(geometry) ||
      !ol.extent.intersects(this.extent_, geometry.getExtent())) {
    return;
  }
  var zIndex = style.getZIndex();
  if (!goog.isDef(zIndex)) {
    zIndex = 0;
  }
  this.drawAsync(zIndex, function(render) {
    render.setFillStrokeStyle(style.getFill(), style.getStroke());
    render.setImageStyle(style.getImage());
    render.setTextStyle(style.getText());
    var renderGeometry =
        ol.render.canvas.Immediate.GEOMETRY_RENDERES_[geometry.getType()];
    goog.asserts.assert(goog.isDef(renderGeometry));
    renderGeometry.call(render, geometry, null);
  });
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.drawGeometryCollectionGeometry =
    function(geometryCollectionGeometry, data) {
  var geometries = geometryCollectionGeometry.getGeometriesArray();
  var i, ii;
  for (i = 0, ii = geometries.length; i < ii; ++i) {
    var geometry = geometries[i];
    var geometryRenderer =
        ol.render.canvas.Immediate.GEOMETRY_RENDERES_[geometry.getType()];
    goog.asserts.assert(goog.isDef(geometryRenderer));
    geometryRenderer.call(this, geometry, data);
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.drawPointGeometry =
    function(pointGeometry, data) {
  var flatCoordinates = pointGeometry.getFlatCoordinates();
  var stride = pointGeometry.getStride();
  if (!goog.isNull(this.image_)) {
    this.drawImages_(flatCoordinates, 0, flatCoordinates.length, stride);
  }
  if (this.text_ !== '') {
    this.drawText_(flatCoordinates, 0, flatCoordinates.length, stride);
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.drawMultiPointGeometry =
    function(multiPointGeometry, data) {
  var flatCoordinates = multiPointGeometry.getFlatCoordinates();
  var stride = multiPointGeometry.getStride();
  if (!goog.isNull(this.image_)) {
    this.drawImages_(flatCoordinates, 0, flatCoordinates.length, stride);
  }
  if (this.text_ !== '') {
    this.drawText_(flatCoordinates, 0, flatCoordinates.length, stride);
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.drawLineStringGeometry =
    function(lineStringGeometry, data) {
  if (!ol.extent.intersects(this.extent_, lineStringGeometry.getExtent())) {
    return;
  }
  var pixelCoordinates = ol.geom.transformSimpleGeometry2D(
      lineStringGeometry, this.transform_, this.pixelCoordinates_);
  var drawing = this.drawing_;
  var path = new ol.graphics.Path();
  this.moveToLineTo_(path, pixelCoordinates, 0, pixelCoordinates.length, false);
  drawing.drawPath(path);
  drawing.applyStroke();
  if (this.text_ !== '') {
    var flatMidpoint = lineStringGeometry.getFlatMidpoint();
    this.drawText_(flatMidpoint, 0, 2, 2);
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.drawMultiLineStringGeometry =
    function(multiLineStringGeometry, data) {
  var geometryExtent = multiLineStringGeometry.getExtent();
  if (!ol.extent.intersects(this.extent_, geometryExtent)) {
    return;
  }
  var pixelCoordinates = ol.geom.transformSimpleGeometry2D(
      multiLineStringGeometry, this.transform_, this.pixelCoordinates_);
  var drawing = this.drawing_;
  var path = new ol.graphics.Path();
  var ends = multiLineStringGeometry.getEnds();
  var offset = 0;
  var i, ii;
  for (i = 0, ii = ends.length; i < ii; ++i) {
    offset = this.moveToLineTo_(path, pixelCoordinates, offset, ends[i], false);
  }
  drawing.applyStroke();
  if (this.text_ !== '') {
    var flatMidpoints = multiLineStringGeometry.getFlatMidpoints();
    this.drawText_(flatMidpoints, 0, flatMidpoints.length, 2);
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.drawPolygonGeometry =
    function(polygonGeometry, data) {
  if (!ol.extent.intersects(this.extent_, polygonGeometry.getExtent())) {
    return;
  }
  var pixelCoordinates = ol.geom.transformSimpleGeometry2D(
        polygonGeometry, this.transform_, this.pixelCoordinates_);
    var drawing = this.drawing_;
    var path = new ol.graphics.Path();
    this.drawRings_(path, pixelCoordinates, 0, polygonGeometry.getEnds());
    drawing.drawPath(path);
    drawing.applyFill();
    drawing.applyStroke();
  if (this.text_ !== '') {
    var flatInteriorPoint = polygonGeometry.getFlatInteriorPoint();
    this.drawText_(flatInteriorPoint, 0, 2, 2);
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.drawMultiPolygonGeometry =
    function(multiPolygonGeometry, data) {
  if (!ol.extent.intersects(this.extent_, multiPolygonGeometry.getExtent())) {
    return;
  }
  var pixelCoordinates = ol.geom.transformSimpleGeometry2D(
        multiPolygonGeometry, this.transform_, this.pixelCoordinates_);
  var drawing = this.drawing_;
  var endss = multiPolygonGeometry.getEndss();
  var offset = 0;
  var i, ii;
  for (i = 0, ii = endss.length; i < ii; ++i) {
    var ends = endss[i];
    var path = new ol.graphics.Path();
    offset = this.drawRings_(path, pixelCoordinates, offset, ends);
    drawing.drawPath(path);
    drawing.applyFill();
    drawing.applyStroke();
  }
  if (this.text_ !== '') {
    var flatInteriorPoints = multiPolygonGeometry.getFlatInteriorPoints();
    this.drawText_(flatInteriorPoints, 0, flatInteriorPoints.length, 2);
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.drawText = goog.abstractMethod;


/**
 * FIXME: empty description for jsdoc
 */
ol.render.canvas.Immediate.prototype.flush = function() {
  /** @type {Array.<number>} */
  var zs = goog.array.map(goog.object.getKeys(this.callbacksByZIndex_), Number);
  goog.array.sort(zs);
  var i, ii, callbacks, j, jj;
  for (i = 0, ii = zs.length; i < ii; ++i) {
    callbacks = this.callbacksByZIndex_[zs[i].toString()];
    for (j = 0, jj = callbacks.length; j < jj; ++j) {
      callbacks[j](this);
    }
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.setFillStrokeStyle =
    function(fillStyle, strokeStyle) {
  this.drawing_.setFillStyle(fillStyle);
  this.drawing_.setStrokeStyle(strokeStyle);
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.setImageStyle = function(imageStyle) {
  if (goog.isNull(imageStyle)) {
    this.image_ = null;
  } else {
    var imageAnchor = imageStyle.getAnchor();
    // FIXME pixel ratio
    var imageImage = imageStyle.getImage(1);
    var imageOpacity = imageStyle.getOpacity();
    var imageRotateWithView = imageStyle.getRotateWithView();
    var imageRotation = imageStyle.getRotation();
    var imageScale = imageStyle.getScale();
    var imageSize = imageStyle.getSize();
    var imageSnapToPixel = imageStyle.getSnapToPixel();
    goog.asserts.assert(!goog.isNull(imageAnchor));
    goog.asserts.assert(!goog.isNull(imageImage));
    goog.asserts.assert(!goog.isNull(imageSize));
    this.imageAnchorX_ = imageAnchor[0];
    this.imageAnchorY_ = imageAnchor[1];
    this.imageHeight_ = imageSize[1];
    this.image_ = imageImage;
    this.imageOpacity_ = goog.isDef(imageOpacity) ? imageOpacity : 1;
    this.imageRotateWithView_ = goog.isDef(imageRotateWithView) ?
        imageRotateWithView : false;
    this.imageRotation_ = goog.isDef(imageRotation) ? imageRotation : 0;
    this.imageScale_ = goog.isDef(imageScale) ? imageScale : 1;
    this.imageSnapToPixel_ = goog.isDef(imageSnapToPixel) ?
        imageSnapToPixel : false;
    this.imageWidth_ = imageSize[0];
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Immediate.prototype.setTextStyle = function(textStyle) {
  if (goog.isNull(textStyle)) {
    this.text_ = '';
    this.textRotation_ = 0;
    this.textScale_ = 1;
  } else {
    var textRotation = textStyle.getRotation();
    var textScale = textStyle.getScale();
    var textText = textStyle.getText();
    this.text_ = goog.isDef(textText) ? textText : '';
    this.textRotation_ = goog.isDef(textRotation) ? textRotation : 0;
    this.textScale_ = this.pixelRatio_ * (goog.isDef(textScale) ?
        textScale : 1);
  }
  this.drawing_.setTextStyle(textStyle);
};


/**
 * @const
 * @private
 * @type {Object.<ol.geom.GeometryType,
 *                function(this: ol.render.canvas.Immediate, ol.geom.Geometry,
 *                         Object)>}
 */
ol.render.canvas.Immediate.GEOMETRY_RENDERES_ = {
  'Point': ol.render.canvas.Immediate.prototype.drawPointGeometry,
  'LineString': ol.render.canvas.Immediate.prototype.drawLineStringGeometry,
  'Polygon': ol.render.canvas.Immediate.prototype.drawPolygonGeometry,
  'MultiPoint': ol.render.canvas.Immediate.prototype.drawMultiPointGeometry,
  'MultiLineString':
      ol.render.canvas.Immediate.prototype.drawMultiLineStringGeometry,
  'MultiPolygon': ol.render.canvas.Immediate.prototype.drawMultiPolygonGeometry,
  'GeometryCollection':
      ol.render.canvas.Immediate.prototype.drawGeometryCollectionGeometry,
  'Circle': ol.render.canvas.Immediate.prototype.drawCircleGeometry
};
