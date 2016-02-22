var RSVP = require('rsvp');
var URI = require('urijs');
var core = require('./core');
var replace = require('./replacements');
var Hook = require('./hook');
var EpubCFI = require('./epubcfi');
var Queue = require('./queue');
var View = require('./view');
var Views = require('./views');
var Layout = require('./layout');
var Map = require('./map');

function Rendition(book, options) {

	this.settings = core.extend(this.settings || {}, {
		infinite: true,
		hidden: false,
		width: false,
		height: null,
		layoutOveride : null, // Default: { spread: 'reflowable', layout: 'auto', orientation: 'auto'},
		axis: "vertical",
		ignoreClass: ''
	});

	core.extend(this.settings, options);

	this.viewSettings = {
		ignoreClass: this.settings.ignoreClass
	};

	this.book = book;

	this.views = null;

	//-- Adds Hook methods to the Rendition prototype
	this.hooks = {};
	this.hooks.display = new Hook(this);
	this.hooks.serialize = new Hook(this);
	this.hooks.content = new Hook(this);
	this.hooks.layout = new Hook(this);
	this.hooks.render = new Hook(this);
	this.hooks.show = new Hook(this);

	this.hooks.content.register(replace.links.bind(this));
	this.hooks.content.register(this.passViewEvents.bind(this));

	// this.hooks.display.register(this.afterDisplay.bind(this));

  this.epubcfi = new EpubCFI();

	this.q = new Queue(this);

	this.q.enqueue(this.book.opened);

	this.q.enqueue(this.parseLayoutProperties);

	if(this.book.archive) {
		this.replacements();
	}
};

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
Rendition.prototype.initialize = function(_options){
	var options = _options || {};
	var height  = options.height;// !== false ? options.height : "100%";
	var width   = options.width;// !== false ? options.width : "100%";
	var hidden  = options.hidden || false;
	var container;
	var wrapper;

	if(options.height && core.isNumber(options.height)) {
		height = options.height + "px";
	}

	if(options.width && core.isNumber(options.width)) {
		width = options.width + "px";
	}

	// Create new container element
	container = document.createElement("div");

	container.id = "epubjs-container:" + core.uuid();
	container.classList.add("epub-container");

	// Style Element
	container.style.fontSize = "0";
	container.style.wordSpacing = "0";
	container.style.lineHeight = "0";
	container.style.verticalAlign = "top";

	if(this.settings.axis === "horizontal") {
		container.style.whiteSpace = "nowrap";
	}

	if(width){
		container.style.width = width;
	}

	if(height){
		container.style.height = height;
	}

	container.style.overflow = this.settings.overflow;

	return container;
};

Rendition.wrap = function(container) {
	var wrapper = document.createElement("div");

	wrapper.style.visibility = "hidden";
	wrapper.style.overflow = "hidden";
	wrapper.style.width = "0";
	wrapper.style.height = "0";

	wrapper.appendChild(container);
	return wrapper;
};

// Call to attach the container to an element in the dom
// Container must be attached before rendering can begin
Rendition.prototype.attachTo = function(_element){
	var bounds;

	this.container = this.initialize({
		"width"  : this.settings.width,
		"height" : this.settings.height
	});

	if(core.isElement(_element)) {
		this.element = _element;
	} else if (typeof _element === "string") {
		this.element = document.getElementById(_element);
	}

	if(!this.element){
		console.error("Not an Element");
		return;
	}

	if(this.settings.hidden) {
		this.wrapper = this.wrap(this.container);
		this.element.appendChild(this.wrapper);
	} else {
		this.element.appendChild(this.container);
	}

	this.views = new Views(this.container);

	// Attach Listeners
	this.attachListeners();

	// Calculate Stage Size
	this.stageSize();

	// Add Layout method
	this.applyLayoutMethod();

	// Trigger Attached
	this.trigger("attached");

	// Start processing queue
	// this.q.run();

};

Rendition.prototype.attachListeners = function(){

	// Listen to window for resize event if width or height is set to 100%
	if(!core.isNumber(this.settings.width) ||
		 !core.isNumber(this.settings.height) ) {
		window.addEventListener("resize", this.onResized.bind(this), false);
	}

};

Rendition.prototype.bounds = function() {
	return this.container.getBoundingClientRect();
};

Rendition.prototype.display = function(target){

	return this.q.enqueue(this._display, target);

};

Rendition.prototype._display = function(target){

	var displaying = new RSVP.defer();
	var displayed = displaying.promise;

	var section;
  var view;
  var offset;
	var fragment;
	var cfi = this.epubcfi.isCfiString(target);

	var visible;

	section = this.book.spine.get(target);

	if(!section){
		displaying.reject(new Error("No Section Found"));
		return displayed;
	}

	// Check to make sure the section we want isn't already shown
	visible = this.views.find(section);

	if(visible) {
		offset = visible.locationOf(target);
		this.moveTo(offset);
		displaying.resolve();

	} else {

		// Hide all current views
		this.views.hide();

		// Create a new view
		// view = new View(section, this.viewSettings);
		view = this.createView(section);

		// This will clear all previous views
		displayed = this.fill(view)
			.then(function(){

				// Parse the target fragment
				if(typeof target === "string" &&
					target.indexOf("#") > -1) {
						fragment = target.substring(target.indexOf("#")+1);
				}

				// Move to correct place within the section, if needed
				if(cfi || fragment) {
					offset = view.locationOf(target);
					return this.moveTo(offset);
				}

				if(typeof this.check === 'function') {
					return this.check();
				}
			}.bind(this))
			.then(function(){
				return this.hooks.display.trigger(view);
			}.bind(this))
			.then(function(){
				this.views.show();
			}.bind(this));
	}

	displayed.then(function(){

		this.trigger("displayed", section);

	}.bind(this));


	return displayed;
};

// Takes a cfi, fragment or page?
Rendition.prototype.moveTo = function(offset){
	this.scrollTo(offset.left, offset.top);
};

Rendition.prototype.render = function(view, show) {

	view.create();

	view.onLayout = this.layout.format.bind(this.layout);

	// Fit to size of the container, apply padding
	this.resizeView(view);

	// Render Chain
	return view.render(this.book.request)
		.then(function(){
			return this.hooks.content.trigger(view, this);
		}.bind(this))
		.then(function(){
			return this.hooks.layout.trigger(view, this);
		}.bind(this))
		.then(function(){
			return view.display();
		}.bind(this))
		.then(function(){
			return this.hooks.render.trigger(view, this);
		}.bind(this))
		.then(function(){
			if(show !== false && this.views.hidden === false) {
				this.q.enqueue(function(view){
					view.show();
				}, view);
			}


			// this.map = new Map(view, this.layout);
			this.hooks.show.trigger(view, this);
			this.trigger("rendered", view.section);

		}.bind(this))
		.catch(function(e){
			this.trigger("loaderror", e);
		}.bind(this));

};


Rendition.prototype.afterDisplayed = function(view){
	this.trigger("added", view.section);
	this.reportLocation();
};

Rendition.prototype.fill = function(view){

	this.views.clear();

	this.views.append(view);

	// view.on("shown", this.afterDisplayed.bind(this));
	view.onDisplayed = this.afterDisplayed.bind(this);

	return this.render(view);
};

Rendition.prototype.resizeView = function(view) {

	if(this.globalLayoutProperties.layout === "pre-paginated") {
		view.lock("both", this.stage.width, this.stage.height);
	} else {
		view.lock("width", this.stage.width, this.stage.height);
	}

};

Rendition.prototype.stageSize = function(_width, _height){
	var bounds;
	var width = _width || this.settings.width;
	var height = _height || this.settings.height;

	// If width or height are set to false, inherit them from containing element
	if(width === false) {
		bounds = this.element.getBoundingClientRect();

		if(bounds.width) {
			width = bounds.width;
			this.container.style.width = bounds.width + "px";
		}
	}

	if(height === false) {
		bounds = bounds || this.element.getBoundingClientRect();

		if(bounds.height) {
			height = bounds.height;
			this.container.style.height = bounds.height + "px";
		}

	}

	if(width && !core.isNumber(width)) {
		bounds = this.container.getBoundingClientRect();
		width = bounds.width;
		//height = bounds.height;
	}

	if(height && !core.isNumber(height)) {
		bounds = bounds || this.container.getBoundingClientRect();
		//width = bounds.width;
		height = bounds.height;
	}


	this.containerStyles = window.getComputedStyle(this.container);
	this.containerPadding = {
		left: parseFloat(this.containerStyles["padding-left"]) || 0,
		right: parseFloat(this.containerStyles["padding-right"]) || 0,
		top: parseFloat(this.containerStyles["padding-top"]) || 0,
		bottom: parseFloat(this.containerStyles["padding-bottom"]) || 0
	};

	this.stage = {
		width: width -
						this.containerPadding.left -
						this.containerPadding.right,
		height: height -
						this.containerPadding.top -
						this.containerPadding.bottom
	};

	return this.stage;

};

Rendition.prototype.applyLayoutMethod = function() {

	this.layout = new Layout.Scroll();
	this.updateLayout();

	this.map = new Map(this.layout);
};

Rendition.prototype.updateLayout = function() {

	this.layout.calculate(this.stage.width, this.stage.height);

};

Rendition.prototype.resize = function(width, height){

	this.stageSize(width, height);

	this.updateLayout();

	this.views.each(this.resizeView.bind(this));

	this.trigger("resized", {
		width: this.stage.width,
		height: this.stage.height
	});

};

Rendition.prototype.onResized = function(e) {
	this.resize();
};

Rendition.prototype.createView = function(section) {
	// Transfer the existing hooks
	section.hooks.serialize.register(this.hooks.serialize.list());

	return new View(section, this.viewSettings);
};

Rendition.prototype.next = function(){

	return this.q.enqueue(function(){

		var next;
		var view;

		if(!this.views.length) return;

		next = this.views.last().section.next();

		if(next) {
			view = this.createView(next);
			return this.fill(view);
		}

	});

};

Rendition.prototype.prev = function(){

	return this.q.enqueue(function(){

		var prev;
		var view;

		if(!this.views.length) return;

		prev = this.views.first().section.prev();
		if(prev) {
			view = this.createView(prev);
			return this.fill(view);
		}

	});

};

//-- http://www.idpf.org/epub/fxl/
Rendition.prototype.parseLayoutProperties = function(_metadata){
	var metadata = _metadata || this.book.package.metadata;
	var layout = (this.layoutOveride && this.layoutOveride.layout) || metadata.layout || "reflowable";
	var spread = (this.layoutOveride && this.layoutOveride.spread) || metadata.spread || "auto";
	var orientation = (this.layoutOveride && this.layoutOveride.orientation) || metadata.orientation || "auto";
	this.globalLayoutProperties = {
		layout : layout,
		spread : spread,
		orientation : orientation
	};
	return this.globalLayoutProperties;
};


Rendition.prototype.current = function(){
	var visible = this.visible();
	if(visible.length){
		// Current is the last visible view
		return visible[visible.length-1];
	}
  return null;
};

Rendition.prototype.isVisible = function(view, offsetPrev, offsetNext, _container){
	var position = view.position();
	var container = _container || this.container.getBoundingClientRect();

	if(this.settings.axis === "horizontal" &&
		position.right > container.left - offsetPrev &&
		position.left < container.right + offsetNext) {

		return true;

  } else if(this.settings.axis === "vertical" &&
  	position.bottom > container.top - offsetPrev &&
		position.top < container.bottom + offsetNext) {

		return true;
  }

	return false;

};

Rendition.prototype.visible = function(){
	var container = this.bounds();
	var displayedViews = this.views.displayed();
  var visible = [];
  var isVisible;
  var view;

  for (var i = 0; i < displayedViews.length; i++) {
    view = displayedViews[i];
    isVisible = this.isVisible(view, 0, 0, container);

    if(isVisible === true) {
      visible.push(view);
    }

  }
  return visible;

};

Rendition.prototype.bounds = function(func) {
  var bounds;

  if(!this.settings.height) {
    bounds = core.windowBounds();
  } else {
    bounds = this.container.getBoundingClientRect();
  }

  return bounds;
};

Rendition.prototype.destroy = function(){
  // Clear the queue
	this.q.clear();

	this.views.clear();

	clearTimeout(this.trimTimeout);
	if(this.settings.hidden) {
		this.element.removeChild(this.wrapper);
	} else {
		this.element.removeChild(this.container);
	}

};

Rendition.prototype.reportLocation = function(){
  return this.q.enqueue(function(){
    this.location = this.currentLocation();
    this.trigger("locationChanged", this.location);
  }.bind(this));
};

Rendition.prototype.currentLocation = function(){
  var view;
  var start, end;

  if(this.views.length) {
  	view = this.views.first();
    // start = container.left - view.position().left;
    // end = start + this.layout.spread;

    return this.map.page(view);
  }

};

Rendition.prototype.scrollBy = function(x, y, silent){
  if(silent) {
    this.ignore = true;
  }

  if(this.settings.height) {

    if(x) this.container.scrollLeft += x;
  	if(y) this.container.scrollTop += y;

  } else {
  	window.scrollBy(x,y);
  }
  // console.log("scrollBy", x, y);
  this.scrolled = true;
};

Rendition.prototype.scrollTo = function(x, y, silent){
  if(silent) {
    this.ignore = true;
  }

  if(this.settings.height) {
  	this.container.scrollLeft = x;
  	this.container.scrollTop = y;
  } else {
  	window.scrollTo(x,y);
  }
  // console.log("scrollTo", x, y);
  this.scrolled = true;
  // if(this.container.scrollLeft != x){
  //   setTimeout(function() {
  //     this.scrollTo(x, y, silent);
  //   }.bind(this), 10);
  //   return;
  // };
 };

Rendition.prototype.passViewEvents = function(view){
  view.listenedEvents.forEach(function(e){
		view.on(e, this.triggerViewEvent.bind(this));
	}.bind(this));

	view.on("selected", this.triggerSelectedEvent.bind(this));
};

Rendition.prototype.triggerViewEvent = function(e){
  this.trigger(e.type, e);
};

Rendition.prototype.triggerSelectedEvent = function(cfirange){
  this.trigger("selected", cfirange);
};

Rendition.prototype.replacements = function(){
	// Wait for loading
	return this.q.enqueue(function () {
		// Get thes books manifest
		var manifest = this.book.package.manifest;
	  var manifestArray = Object.keys(manifest).
	    map(function (key){
	      return manifest[key];
	    });

	  // Exclude HTML
	  var items = manifestArray.
	    filter(function (item){
	      if (item.type != "application/xhtml+xml" &&
	          item.type != "text/html") {
	        return true;
	      }
	    });

	  // Only CSS
	  var css = items.
	    filter(function (item){
	      if (item.type === "text/css") {
	        return true;
	      }
	    });

		// Css Urls
		var cssUrls = css.map(function(item) {
			return item.href;
		});

		// All Assets Urls
	  var urls = items.
	    map(function(item) {
	      return item.href;
	    }.bind(this));

		// Create blob urls for all the assets
	  var processing = urls.
	    map(function(url) {
				var absolute = URI(url).absoluteTo(this.book.baseUrl).toString();
				// Full url from archive base
	      return this.book.archive.createUrl(absolute);
	    }.bind(this));

		// After all the urls are created
	  return RSVP.all(processing).
	    then(function(replacementUrls) {

				// Replace Asset Urls in the text of all css files
				cssUrls.forEach(function(href) {
					this.replaceCss(href, urls, replacementUrls);
		    }.bind(this));

				// Replace Asset Urls in chapters
				// by registering a hook after the sections contents has been serialized
	      this.hooks.serialize.register(function(output, section) {
					this.replaceAssets(section, urls, replacementUrls);
	      }.bind(this));

	    }.bind(this)).catch(function(reason){
	      console.error(reason);
	    });
	}.bind(this));
};

Rendition.prototype.replaceCss = function(href, urls, replacementUrls){
		var newUrl;
		var indexInUrls;

		// Find the absolute url of the css file
		var fileUri = URI(href);
		var absolute = fileUri.absoluteTo(this.book.baseUrl).toString();
		// Get the text of the css file from the archive
		var text = this.book.archive.getText(absolute);
		// Get asset links relative to css file
		var relUrls = urls.
			map(function(assetHref) {
				var assetUri = URI(assetHref).absoluteTo(this.book.baseUrl);
				var relative = assetUri.relativeTo(absolute).toString();
				return relative;
			}.bind(this));

		// Replacements in the css text
		text = replace.substitute(text, relUrls, replacementUrls);

		// Get the new url
		newUrl = core.createBlobUrl(text, 'text/css');

		// switch the url in the replacementUrls
		indexInUrls = urls.indexOf(href);
		if (indexInUrls > -1) {
			replacementUrls[indexInUrls] = newUrl;
		}
};

Rendition.prototype.replaceAssets = function(section, urls, replacementUrls){
	var fileUri = URI(section.url);
	// Get Urls relative to current sections
	var relUrls = urls.
		map(function(href) {
			var assetUri = URI(href).absoluteTo(this.book.baseUrl);
			var relative = assetUri.relativeTo(fileUri).toString();
			return relative;
		}.bind(this));


	section.output = replace.substitute(section.output, relUrls, replacementUrls);
};

Rendition.prototype.range = function(_cfi, ignoreClass){
  var cfi = new EpubCFI(_cfi);
  var found = this.visible().filter(function (view) {
		if(cfi.spinePos === view.index) return true;
	});

	// Should only every return 1 item
  if (found.length) {
    return found[0].range(cfi, ignoreClass);
  }
};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(Rendition.prototype);

module.exports = Rendition;
