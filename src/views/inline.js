var RSVP = require('rsvp');
var core = require('../core');
var EpubCFI = require('../epubcfi');
var Contents = require('../contents');
var URI = require('urijs');

function InlineView(section, options) {
  this.settings = core.extend({
    ignoreClass : '',
    axis: 'vertical',
    width: 0,
    height: 0,
    layout: undefined,
    globalLayoutProperties: {},
  }, options || {});

  this.id = "epubjs-view:" + core.uuid();
  this.section = section;
  this.index = section.index;

  this.element = this.container(this.settings.axis);

  this.added = false;
  this.displayed = false;
  this.rendered = false;

  this.width  = this.settings.width;
  this.height = this.settings.height;

  this.fixedWidth  = 0;
  this.fixedHeight = 0;

  // Blank Cfi for Parsing
  this.epubcfi = new EpubCFI();

  this.layout = this.settings.layout;
  // Dom events to listen for
  // this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

};

InlineView.prototype.container = function(axis) {
  var element = document.createElement('div');

  element.classList.add("epub-view");

  // if(this.settings.axis === "horizontal") {
  //   element.style.width = "auto";
  //   element.style.height = "0";
	// } else {
  //   element.style.width = "0";
  //   element.style.height = "auto";
	// }

  element.style.overflow = "hidden";

  if(axis && axis == "horizontal"){
    element.style.display = "inline-block";
  } else {
    element.style.display = "block";
  }

  return element;
};

InlineView.prototype.create = function() {

  if(this.frame) {
    return this.frame;
  }

  if(!this.element) {
    this.element = this.createContainer();
  }

  this.frame = document.createElement('div');
  this.frame.id = this.id;
  this.frame.style.overflow = "hidden";
  this.frame.style.wordSpacing = "initial";
	this.frame.style.lineHeight = "initial";

  this.resizing = true;

  // this.frame.style.display = "none";
  this.element.style.visibility = "hidden";
  this.frame.style.visibility = "hidden";

  if(this.settings.axis === "horizontal") {
    this.frame.style.width = "auto";
    this.frame.style.height = "0";
	} else {
    this.frame.style.width = "0";
    this.frame.style.height = "auto";
	}

  this._width = 0;
  this._height = 0;

  this.element.appendChild(this.frame);
  this.added = true;

  this.elementBounds = core.bounds(this.element);

  return this.frame;
};

InlineView.prototype.render = function(request, show) {

	// view.onLayout = this.layout.format.bind(this.layout);
	this.create();

	// Fit to size of the container, apply padding
  this.size();

	// Render Chain
	return this.section.render(request)
		.then(function(contents){
			return this.load(contents);
		}.bind(this))
		// .then(function(doc){
		// 	return this.hooks.content.trigger(view, this);
		// }.bind(this))
		.then(function(){
			// this.settings.layout.format(view.contents);
			// return this.hooks.layout.trigger(view, this);
		}.bind(this))
		// .then(function(){
		// 	return this.display();
		// }.bind(this))
		// .then(function(){
		// 	return this.hooks.render.trigger(view, this);
		// }.bind(this))
		.then(function(){

      // apply the layout function to the contents
      this.settings.layout.format(this.contents);

      // Expand the iframe to the full size of the content
      // this.expand();

      // Listen for events that require an expansion of the iframe
      this.addListeners();

			if(show !== false) {
				//this.q.enqueue(function(view){
					this.show();
				//}, view);
			}
			// this.map = new Map(view, this.layout);
			//this.hooks.show.trigger(view, this);
			this.trigger("rendered", this.section);

		}.bind(this))
		.catch(function(e){
			this.trigger("loaderror", e);
		}.bind(this));

};

// Determine locks base on settings
InlineView.prototype.size = function(_width, _height) {
  var width = _width || this.settings.width;
  var height = _height || this.settings.height;

  if(this.layout.name === "pre-paginated") {
    // TODO: check if these are different than the size set in chapter
    this.lock("both", width, height);
  } else if(this.settings.axis === "horizontal") {
		this.lock("height", width, height);
	} else {
		this.lock("width", width, height);
	}

};

// Lock an axis to element dimensions, taking borders into account
InlineView.prototype.lock = function(what, width, height) {
  var elBorders = core.borders(this.element);
  var iframeBorders;

  if(this.frame) {
    iframeBorders = core.borders(this.frame);
  } else {
    iframeBorders = {width: 0, height: 0};
  }

  if(what == "width" && core.isNumber(width)){
    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.resize(this.lockedWidth, false); //  width keeps ratio correct
  }

  if(what == "height" && core.isNumber(height)){
    this.lockedHeight = height - elBorders.height - iframeBorders.height;
    this.resize(false, this.lockedHeight);
  }

  if(what === "both" &&
     core.isNumber(width) &&
     core.isNumber(height)){

    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.lockedHeight = height - elBorders.height - iframeBorders.height;

    this.resize(this.lockedWidth, this.lockedHeight);
  }

};

// Resize a single axis based on content dimensions
InlineView.prototype.expand = function(force) {
  var width = this.lockedWidth;
  var height = this.lockedHeight;

  var textWidth, textHeight;

  if(!this.frame || this._expanding) return;

  this._expanding = true;

  // Expand Horizontally
  if(this.settings.axis === "horizontal") {
    width = this.contentWidth(textWidth);
  } // Expand Vertically
  else if(this.settings.axis === "vertical") {
    height = this.contentHeight(textHeight);
  }

  // Only Resize if dimensions have changed or
  // if Frame is still hidden, so needs reframing
  if(this._needsReframe || width != this._width || height != this._height){
    this.resize(width, height);
  }

  this._expanding = false;
};

InlineView.prototype.contentWidth = function(min) {
  return this.frame.scrollWidth;
};

InlineView.prototype.contentHeight = function(min) {
  console.log(this.frame.scrollHeight);
  return this.frame.scrollHeight;
};


InlineView.prototype.resize = function(width, height) {

  if(!this.frame) return;

  if(core.isNumber(width)){
    this.frame.style.width = width + "px";
    this._width = width;
  }

  if(core.isNumber(height)){
    this.frame.style.height = height + "px";
    this._height = height;
  }

  this.prevBounds = this.elementBounds;

  this.elementBounds = core.bounds(this.element);

  size = {
    width: this.elementBounds.width,
    height: this.elementBounds.height,
    widthDelta: this.elementBounds.width - this.prevBounds.width,
    heightDelta: this.elementBounds.height - this.prevBounds.height,
  };

  this.onResize(this, size);

  this.trigger("resized", size);

};


InlineView.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;
  var doc = core.parse(contents, "text/html");
  var body = core.qs(doc, "body");

  var srcs = doc.querySelectorAll("[src]");
  Array.prototype.slice.call(srcs)
    .forEach(function(item) {
      var src = item.getAttribute('src');
      var assetUri = URI(src);
      var origin = assetUri.origin();
      var absoluteUri;

      if (!origin) {
        absoluteUri = assetUri.absoluteTo(this.section.url);
        item.src = absoluteUri;
      }
    }.bind(this));

  this.frame.innerHTML = body.innerHTML;

  this.document = this.frame.ownerDocument;
  this.window = this.document.defaultView;

  this.contents = new Contents(this.document, this.frame);

  this.rendering = false;

  loading.resolve(this.contents);


  return loaded;
};

InlineView.prototype.setLayout = function(layout) {
  this.layout = layout;
};


InlineView.prototype.resizeListenters = function() {
  // Test size again
  // clearTimeout(this.expanding);
  // this.expanding = setTimeout(this.expand.bind(this), 350);
};

InlineView.prototype.addListeners = function() {
  //TODO: Add content listeners for expanding
};

InlineView.prototype.removeListeners = function(layoutFunc) {
  //TODO: remove content listeners for expanding
};

InlineView.prototype.display = function(request) {
  var displayed = new RSVP.defer();

  if (!this.displayed) {

    this.render(request).then(function () {

      this.trigger("displayed", this);
      this.onDisplayed(this);

      this.displayed = true;

      displayed.resolve(this);

    }.bind(this));

  } else {
    displayed.resolve(this);
  }


  return displayed.promise;
};

InlineView.prototype.show = function() {

  this.element.style.visibility = "visible";

  if(this.frame){
    this.frame.style.visibility = "visible";
  }

  this.trigger("shown", this);
};

InlineView.prototype.hide = function() {
  // this.frame.style.display = "none";
  this.element.style.visibility = "hidden";
  this.frame.style.visibility = "hidden";

  this.stopExpanding = true;
  this.trigger("hidden", this);
};

InlineView.prototype.position = function() {
  return this.element.getBoundingClientRect();
};

InlineView.prototype.locationOf = function(target) {
  var parentPos = this.frame.getBoundingClientRect();
  var targetPos = this.contents.locationOf(target, this.settings.ignoreClass);

  return {
    "left": window.scrollX + parentPos.left + targetPos.left,
    "top": window.scrollY + parentPos.top + targetPos.top
  };
};

InlineView.prototype.onDisplayed = function(view) {
  // Stub, override with a custom functions
};

InlineView.prototype.onResize = function(view, e) {
  // Stub, override with a custom functions
};

InlineView.prototype.bounds = function() {
  if(!this.elementBounds) {
    this.elementBounds = core.bounds(this.element);
  }
  return this.elementBounds;
};

InlineView.prototype.destroy = function() {

  if(this.displayed){
    this.displayed = false;

    this.removeListeners();

    this.stopExpanding = true;
    this.element.removeChild(this.frame);
    this.displayed = false;
    this.frame = null;

    this._textWidth = null;
    this._textHeight = null;
    this._width = null;
    this._height = null;
  }
  // this.element.style.height = "0px";
  // this.element.style.width = "0px";
};

RSVP.EventTarget.mixin(InlineView.prototype);

module.exports = InlineView;
