EPUBJS.Rendition = function(book, options) {
	
	this.settings = EPUBJS.core.extend(this.settings || {}, {
		infinite: true,
		hidden: false,
		width: false,
		height: false
	});

	EPUBJS.core.extend(this.settings, options);
	
	this.book = book;
	
	if(this.settings.hidden) {
		this.wrapper = this.wrap(this.container);
	}
	
	this.views = [];
	
	//-- Adds Hook methods to the Rendition prototype
	this.hooks = {};
	this.hooks.display = new EPUBJS.Hook(this);
	this.hooks.replacements = new EPUBJS.Hook(this);
	
	this.hooks.replacements.register(EPUBJS.replace.links.bind(this));
	// this.hooks.display.register(this.afterDisplay.bind(this));
	
	this.q = new EPUBJS.Queue(this);

	this.q.enqueue(this.book.opened);

};

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
EPUBJS.Rendition.prototype.initialize = function(_options){
	var options = _options || {};
	var height  = options.height !== false ? options.height : "100%";
	var width   = options.width !== false ? options.width : "100%";
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
	
	// Style Element
	if(this.settings.axis === "horizontal") {
		// this.container.style.display = "flex";
		// this.container.style.flexWrap = "nowrap";
		container.style.whiteSpace = "nowrap";
	}

	if(options.width){
		container.style.width = width;
	}
	
	if(options.height){
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

	// If width or height are set to "100%", inherit them from containing element
	if(this.settings.height === "100%") {
		bounds = this.element.getBoundingClientRect();
		this.container.style.height = bounds.height + "px";
	}
		
	if(this.settings.width === "100%") {
		bounds = bounds || this.element.getBoundingClientRect();
		this.container.style.width = bounds.width + "px";
	}
	
	this.element.appendChild(this.container);
	
	// Attach Listeners
	this.attachListeners();
	
	// Trigger Attached

	// Start processing queue
	this.q.run();

};

EPUBJS.Rendition.prototype.attachListeners = function(){

	// Listen to window for resize event
	window.addEventListener("resize", this.onResized.bind(this), false);


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
			view = new EPUBJS.View(section);

			// Show view
			this.append(view);

			// Move to correct place within the section, if needed
			// this.moveTo(what)

	
			view.displayed.then(function(){
				this.trigger("displayed", section);
				this.displaying = false;
				displaying.resolve(this);
			}.bind(this));
	
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
	// var view = new EPUBJS.View(section);
	// 
	// if(!section) {
	// 	rendered = new RSVP.defer();
	// 	rendered.reject(new Error("No Section Provided"));
	// 	return rendered.promise;
	// }
	this.rendering = true;

	view.create();
	
	// Fit to size of the container, apply padding
	// this.resizeView(view);
	
	// Render Chain
	return view.display(this.book.request)
		.then(function(){
			return this.hooks.display.trigger(view);
		}.bind(this))
		.then(function(){
			return this.hooks.replacements.trigger(view, this);
		}.bind(this))
		.then(function(){
			return view.expand();
		}.bind(this))
		.then(function(){
			view.show();
			this.trigger("rendered", view.section);
			this.rendering = false;
			//this.check(); // Check to see if anything new is on screen after rendering
			return view;
		}.bind(this))
		.catch(function(e){
			this.trigger("loaderror", e);
		}.bind(this));
		
};

EPUBJS.Rendition.prototype.afterDisplayed = function(view){
	
};

EPUBJS.Rendition.prototype.append = function(view){
	// Clear existing views
	this.clear();

	this.views.push(view);
	// view.appendTo(this.container);
	this.container.appendChild(view.element);

	this.render(view);
	// view.on("shown", this.afterDisplayed.bind(this));
	view.onShown = this.afterDisplayed.bind(this);
	// this.resizeView(view);
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
	var bounds = this.container.getBoundingClientRect();
	var styles = window.getComputedStyle(this.container);
	var padding = {
		left: parseFloat(styles["padding-left"]) || 0,
		right: parseFloat(styles["padding-right"]) || 0,
		top: parseFloat(styles["padding-top"]) || 0,
		bottom: parseFloat(styles["padding-bottom"]) || 0
	};
	var width = bounds.width - padding.left - padding.right;
	var height = bounds.height - padding.top - padding.bottom;

	if(this.settings.axis === "vertical") {
		view.resize(width, 0);
	} else {
		view.resize(0, height);
	}

};

EPUBJS.Rendition.prototype.resize = function(_width, _height){
	var width = _width;
	var height = _height;

	var styles = window.getComputedStyle(this.container);
	var padding = {
		left: parseFloat(styles["padding-left"]) || 0,
		right: parseFloat(styles["padding-right"]) || 0,
		top: parseFloat(styles["padding-top"]) || 0,
		bottom: parseFloat(styles["padding-bottom"]) || 0
	}; 

	var stagewidth = width - padding.left - padding.right;
	var stageheight = height - padding.top - padding.bottom;

	if(!_width) {
		width = window.innerWidth;
	}
	if(!_height) {
		height = window.innerHeight;
	}

	// this.container.style.width = width + "px";
	// this.container.style.height = height + "px";

	this.trigger("resized", {
		width: this.width,
		height: this.height
	});


	this.views.forEach(function(view){
		if(this.settings.axis === "vertical") {
			view.resize(stagewidth, 0);
		} else {
			view.resize(0, stageheight);
		}
	}.bind(this));

};

EPUBJS.Rendition.prototype.onResized = function(e) {
	var bounds = this.element.getBoundingClientRect();


	this.resize(bounds.width, bounds.height);
};

EPUBJS.Rendition.prototype.next = function(){
	var next = this.views[0].section.next();
	var view;


	if(next) {
		view = new EPUBJS.View(next);
		this.append(view);
	}

};

EPUBJS.Rendition.prototype.prev = function(){
	var prev = this.views[0].section.prev();
	var view;

	if(prev) {
		view = new EPUBJS.View(prev);
		this.append(view);
	}

};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Rendition.prototype);
