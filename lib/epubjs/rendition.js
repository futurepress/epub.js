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

	this.q = new EPUBJS.Queue(this);

	this.q.enqueue(this.book.opened);

	this.book.opened.then(function(){
		this.globalLayoutProperties = this.parseLayoutProperties(this.book.package.metadata);
	}.bind(this));

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
	this.q.run();
	
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

EPUBJS.Rendition.prototype.display = function(what){
	
	return this.q.enqueue(function(what){
		
		var displaying = new RSVP.defer();
		var displayed = displaying.promise;
	
		var section = this.book.spine.get(what);
		var view;
	
		this.displaying = true;
	
		if(section){
			view = this.createView(section);

			// Show view
			this.q.enqueue(this.append, view);

			// Move to correct place within the section, if needed
			// this.moveTo(what)

			this.hooks.display.trigger(view);

			displaying.resolve(this);
	
		} else {
			displaying.reject(new Error("No Section Found"));
		}
	
		return displayed;
	}, what);

};

// Takes a cfi, fragment or page?
EPUBJS.Rendition.prototype.moveTo = function(what){
	
};

EPUBJS.Rendition.prototype.render = function(view) {

	view.create();
	
	view.onLayout = this.layout.format.bind(this.layout);

	// Fit to size of the container, apply padding
	this.resizeView(view);

	// Render Chain
	return view.display(this.book.request)
		.then(function(){
			return this.hooks.replacements.trigger(view, this);
		}.bind(this))
		.then(function(){
			return this.hooks.layout.trigger(view);
		}.bind(this))
		.then(function(){
			return view.show()
		}.bind(this))
		.then(function(view){

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

	// view.on("shown", this.afterDisplayed.bind(this));
	view.onShown = this.afterDisplayed.bind(this);
	// this.resizeView(view);

	return this.render(view);
};

EPUBJS.Rendition.prototype.clear = function(){
	this.views.forEach(function(view){
		this.remove(view);
	}.bind(this));
};

EPUBJS.Rendition.prototype.remove = function(view) {
	var index = this.views.indexOf(view);
	if(index > -1) {
		this.views.splice(index, 1);
	}

	this.container.removeChild(view.element);
	
	if(view.shown){
		view.destroy();
	}
	
	view = null;
	
};


EPUBJS.Rendition.prototype.resizeView = function(view) {
	
	if(this.globalLayoutProperties.layout === "pre-paginated") {
		view.lock(this.stage.width, this.stage.height);
	} else {
		view.lock(this.stage.width, null);
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
EPUBJS.Rendition.prototype.parseLayoutProperties = function(metadata){
	var layout = (this.layoutOveride && this.layoutOveride.layout) || metadata.layout || "reflowable";
	var spread = (this.layoutOveride && this.layoutOveride.spread) || metadata.spread || "auto";
	var orientation = (this.layoutOveride && this.layoutOveride.orientation) || metadata.orientation || "auto";
	return {
		layout : layout,
		spread : spread,
		orientation : orientation
	};
};


EPUBJS.Rendition.prototype.current = function(){
	var visible = this.visible();
	if(visible.length){
		// Current is the last visible view
		return visible[visible.length-1];
	}
  return null;
};

EPUBJS.Rendition.prototype.isVisible = function(view, offset, _container){
	var position = view.position();
	var container = _container || this.container.getBoundingClientRect();

	if(this.settings.axis === "horizontal" && 
		(position.right > container.left - offset) &&
		!(position.left >= container.right + offset)) {

		return true;
		
  } else if(this.settings.axis === "vertical" &&
  		(position.bottom > container.top - offset) &&
			!(position.top >= container.bottom + offset)) {

		return true;
  }

	return false;
	
};

EPUBJS.Rendition.prototype.visible = function(){
  var container = this.container.getBoundingClientRect();
  var visible = [];
  var isVisible;
  var view;

  for (var i = 0; i < this.views.length; i++) {
    view = this.views[i];
    isVisible = this.isVisible(view, 0, container);

    if(isVisible === true) {
      visible.push(view);
    }

  };

  return visible;
  
};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Rendition.prototype);
