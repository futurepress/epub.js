EPUBJS.Rendition = function(book, options) {
	
	this.settings = EPUBJS.core.extend(this.settings || {}, {
		infinite: true,
		hidden: false,
		width: false,
		height: null,
		layoutOveride : null, // Default: { spread: 'reflowable', layout: 'auto', orientation: 'auto'},
		axis: "vertical"
	});

	EPUBJS.core.extend(this.settings, options);
	
	this.viewSettings = {};

	this.book = book;
	
	this.views = [];
	
	//-- Adds Hook methods to the Rendition prototype
	this.hooks = {};
	this.hooks.display = new EPUBJS.Hook(this);
	this.hooks.layout = new EPUBJS.Hook(this);
	this.hooks.replacements = new EPUBJS.Hook(this);
	
	this.hooks.replacements.register(EPUBJS.replace.links.bind(this));
	// this.hooks.display.register(this.afterDisplay.bind(this));

  this.epubcfi = new EPUBJS.EpubCFI();

	this.q = new EPUBJS.Queue(this);

	this.q.enqueue(this.book.opened);

	this.q.enqueue(this.parseLayoutProperties);

};

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
EPUBJS.Rendition.prototype.initialize = function(_options){
	var options = _options || {};
	var height  = options.height;// !== false ? options.height : "100%";
	var width   = options.width;// !== false ? options.width : "100%";
	var hidden  = options.hidden || false;
	var container;
	var wrapper;
	
	if(options.height && EPUBJS.core.isNumber(options.height)) {
		height = options.height + "px";
	}

	if(options.width && EPUBJS.core.isNumber(options.width)) {
		width = options.width + "px";
	}
	
	// Create new container element
	container = document.createElement("div");
	
	container.id = "epubjs-container:" + EPUBJS.core.uuid();
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

EPUBJS.Rendition.wrap = function(container) {
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
EPUBJS.Rendition.prototype.attachTo = function(_element){
	var bounds;
	
	this.container = this.initialize({
		"width"  : this.settings.width,
		"height" : this.settings.height
	});

	if(EPUBJS.core.isElement(_element)) {
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
		
	// Attach Listeners
	this.attachListeners();

	// Calculate Stage Size
	this.stageSize();

	// Add Layout method
	this.layoutMethod();
	
	// Trigger Attached
	this.trigger("attached");

	// Start processing queue
	// this.q.run();
	
};

EPUBJS.Rendition.prototype.attachListeners = function(){

	// Listen to window for resize event if width or height is set to 100%
	if(!EPUBJS.core.isNumber(this.settings.width) || 
		 !EPUBJS.core.isNumber(this.settings.height) ) {
		window.addEventListener("resize", this.onResized.bind(this), false);
	}

};

EPUBJS.Rendition.prototype.bounds = function() {
	return this.container.getBoundingClientRect();
};

EPUBJS.Rendition.prototype.display = function(target){
	
	return this.q.enqueue(this._display, target);

};

EPUBJS.Rendition.prototype._display = function(target){
			
	var displaying = new RSVP.defer();
	var displayed = displaying.promise;

	var section;
  var view;
  var cfi, spinePos;

  if(this.epubcfi.isCfiString(target)) {
    cfi = this.epubcfi.parse(target);
    spinePos = cfi.spinePos;
    section = this.book.spine.get(spinePos);
  } else {
    section = this.book.spine.get(target);
  }

	this.displaying = true;
	
	// Hide current views
	this.hide();

	if(section){
		view = this.createView(section);

		// Show view
		this.q.enqueue(this.append, view);

		// Move to correct place within the section, if needed
		// this.moveTo(what)

		// Show views
		this.show();

		this.hooks.display.trigger(view);

		displaying.resolve(this);

	} else {
		displaying.reject(new Error("No Section Found"));
	}

	return displayed;

};
// Takes a cfi, fragment or page?
EPUBJS.Rendition.prototype.moveTo = function(what){
	
};

EPUBJS.Rendition.prototype.render = function(view, show) {

	view.create();
	
	view.onLayout = this.layout.format.bind(this.layout);

	// Fit to size of the container, apply padding
	this.resizeView(view);

	// Render Chain
	return view.render(this.book.request)
		.then(function(){
			return this.hooks.replacements.trigger(view, this);
		}.bind(this))
		.then(function(){
			return this.hooks.layout.trigger(view);
		}.bind(this))
		.then(function(){
			return view.display()
		}.bind(this))
		.then(function(view){
			
			if(show != false && this.hidden === false) {
				this.q.enqueue(function(view){
					view.show();
				}, view);
			}
			

			// this.map = new EPUBJS.Map(view, this.layout);
			this.trigger("rendered", view.section);

		}.bind(this))
		.catch(function(e){
			this.trigger("loaderror", e);
		}.bind(this));

};


EPUBJS.Rendition.prototype.afterDisplayed = function(view){
	this.trigger("displayed", view.section);
};

EPUBJS.Rendition.prototype.append = function(view){
	// Clear existing views
	this.clear();

	this.views.push(view);
	// view.appendTo(this.container);
	this.container.appendChild(view.element);

	// view.on("displayed", this.afterDisplayed.bind(this));
	view.onDisplayed = this.afterDisplayed.bind(this);
	// this.resizeView(view);

	return this.render(view);
};

EPUBJS.Rendition.prototype.clear = function(){
	// Remove all views
	this.views.forEach(function(view){
		this._remove(view);
	}.bind(this));
	this.views = [];
};

EPUBJS.Rendition.prototype.remove = function(view) {
	var index = this.views.indexOf(view);

	if(index > -1) {
		this.views.splice(index, 1);
	}

	
	this._remove(view);

};

EPUBJS.Rendition.prototype._remove = function(view) {
	view.off("resized");

	if(view.displayed){
		view.destroy();
	}

	this.container.removeChild(view.element);
	view = null;
};

EPUBJS.Rendition.prototype.resizeView = function(view) {
	
	if(this.globalLayoutProperties.layout === "pre-paginated") {
		view.lock("both", this.stage.width, this.stage.height);
	} else {
		view.lock("width", this.stage.width, this.stage.height);
	}

};

EPUBJS.Rendition.prototype.stageSize = function(_width, _height){
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

	if(width && !EPUBJS.core.isNumber(width)) {
		bounds = this.container.getBoundingClientRect();
		width = bounds.width;
		//height = bounds.height;
	}
		
	if(height && !EPUBJS.core.isNumber(height)) {
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

EPUBJS.Rendition.prototype.layoutMethod = function() {
	
	this.layout = new EPUBJS.Layout.Scroll();
	this.layoutUpdate();

	this.map = new EPUBJS.Map(this.layout);
};

EPUBJS.Rendition.prototype.layoutUpdate = function() {
	
	this.layout.calculate(this.stage.width, this.stage.height);

};

EPUBJS.Rendition.prototype.resize = function(width, height){

	this.stageSize(width, height);

	this.layoutUpdate();

	this.views.forEach(this.resizeView.bind(this));

	this.trigger("resized", {
		width: this.stage.width,
		height: this.stage.height
	});

};

EPUBJS.Rendition.prototype.onResized = function(e) {
	this.resize();
};

EPUBJS.Rendition.prototype.createView = function(section) {
	return new EPUBJS.View(section, this.viewSettings);
};

EPUBJS.Rendition.prototype.next = function(){

	return this.q.enqueue(function(){

		var next;
		var view;

		if(!this.views.length) return;

		next = this.views[0].section.next();

		if(next) {
			view = this.createView(next);
			return this.append(view);
		}

	});

};

EPUBJS.Rendition.prototype.prev = function(){

	return this.q.enqueue(function(){

		var prev;
		var view;

		if(!this.views.length) return;

		prev = this.views[0].section.prev();
		if(prev) {
			view = this.createView(prev);
			return this.append(view);
		}

	});

};

//-- http://www.idpf.org/epub/fxl/
EPUBJS.Rendition.prototype.parseLayoutProperties = function(_metadata){
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


EPUBJS.Rendition.prototype.current = function(){
	var visible = this.visible();
	if(visible.length){
		// Current is the last visible view
		return visible[visible.length-1];
	}
  return null;
};

EPUBJS.Rendition.prototype.isVisible = function(view, offsetPrev, offsetNext, _container){
	var position = view.position();
	var container = _container || this.container.getBoundingClientRect();

	if(this.settings.axis === "horizontal" && 
		(position.right > container.left - offsetPrev) &&
		!(position.left >= container.right + offsetNext)) {

		return true;
		
  } else if(this.settings.axis === "vertical" &&
  		(position.bottom > container.top - offsetPrev) &&
			!(position.top >= container.bottom + offsetNext)) {

		return true;
  }

	return false;
	
};

EPUBJS.Rendition.prototype.visible = function(){
	var container = this.bounds();
  var visible = [];
  var isVisible;
  var view;

  for (var i = 0; i < this.views.length; i++) {
    view = this.views[i];
    isVisible = this.isVisible(view, 0, 0, container);

    if(isVisible === true) {
      visible.push(view);
    }

  };

  return visible;
  
};

EPUBJS.Rendition.prototype.bounds = function(func) {
  var bounds;
  
  if(!this.settings.height) {
    bounds = EPUBJS.core.windowBounds();
  } else {
    bounds = this.container.getBoundingClientRect();
  }

  return bounds;
};

EPUBJS.Rendition.prototype.displayed = function(){
  var displayed = [];
  var view;
  for (var i = 0; i < this.views.length; i++) {
    view = this.views[i];
    if(view.displayed){
      displayed.push(view);
    }
  };
  return displayed;
};

EPUBJS.Rendition.prototype.show = function(){
  var view;
  for (var i = 0; i < this.views.length; i++) {
    view = this.views[i];
    if(view.displayed){
      view.show();
    }
  };
  this.hidden = false;
};

EPUBJS.Rendition.prototype.hide = function(){
  var view;
  for (var i = 0; i < this.views.length; i++) {
    view = this.views[i];
    if(view.displayed){
      view.hide();
    }
  };
  this.hidden = true;
};

EPUBJS.Rendition.prototype.destroy = function(){
  // Clear the queue
	this.q.clear();

	this.clear();
	
	clearTimeout(this.trimTimeout);	
	if(this.settings.hidden) {
		this.element.removeChild(this.wrapper);
	} else {
		this.element.removeChild(this.container);
	}

};

EPUBJS.Rendition.prototype.reportLocation = function(){
  return this.q.enqueue(function(){
    this.location = this.currentLocation();
    this.trigger("locationChanged", this.location);
  }.bind(this));
};

EPUBJS.Rendition.prototype.currentLocation = function(){
  var view;
  var start, end;
  
  if(this.views.length) {
  	view = this.views[0];
    // start = container.left - view.position().left;
    // end = start + this.layout.spread;

    return this.map.page(view);
  }
  
};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Rendition.prototype);
