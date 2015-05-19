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
	container.style.fontSize = "0";
	container.style.wordSpacing = "0";
	container.style.lineHeight = "0";
	container.style.verticalAlign = "top";

	if(this.settings.axis === "horizontal") {
		container.style.whiteSpace = "nowrap";
	}

	//if(options.width){
		container.style.width = width;
	//}
	
	//if(options.height){
		container.style.height = height;
	//}

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
	
	this.element.appendChild(this.container);
	
	// Attach Listeners
	this.attachListeners();

	// Calculate Stage Size
	// this.containerStyles = window.getComputedStyle(this.container);
	// this.containerPadding = {
	// 	left: parseFloat(this.containerStyles["padding-left"]) || 0,
	// 	right: parseFloat(this.containerStyles["padding-right"]) || 0,
	// 	top: parseFloat(this.containerStyles["padding-top"]) || 0,
	// 	bottom: parseFloat(this.containerStyles["padding-bottom"]) || 0
	// }; 

	// this.stage = {
	// 	width: parseFloat(this.containerStyles.width) - 
	// 					this.containerPadding.left - 
	// 					this.containerPadding.right,
	// 	height: parseFloat(this.containerStyles.height) - 
	// 										this.containerPadding.top - 
	// 										this.containerPadding.bottom
	// };
	this.stageSize();
	
	// Trigger Attached

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
			view = new EPUBJS.View(section);

			// Show view
			this.q.enqueue(this.append, view);

			// Move to correct place within the section, if needed
			// this.moveTo(what)

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
		
	// Fit to size of the container, apply padding
	this.resizeView(view);

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
			return view;
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

	if(this.settings.axis === "horizontal") {
		view.lock(null, this.stage.height);
	} else {
		view.lock(this.stage.width, null);
	}

};

EPUBJS.Rendition.prototype.stageSize = function(_width, _height){
	var bounds;
	var width = _width || this.settings.width;
	var height = _height || this.settings.height;

	// If width or height are set to "100%", inherit them from containing element
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

EPUBJS.Rendition.prototype.resize = function(width, height){

	this.stageSize(width, height);
	
	this.views.forEach(function(view){
		if(this.settings.axis === "vertical") {
			view.lock(this.stage.width, null);
		} else {
			view.lock(null, this.stage.height);
		}
	}.bind(this));

	this.trigger("resized", {
		width: this.stage.width,
		height: this.stage.height
	});

};

EPUBJS.Rendition.prototype.onResized = function(e) {
	this.resize();
};

EPUBJS.Rendition.prototype.next = function(){

	return this.q.enqueue(function(){

		var next;
		var view;

		if(!this.views.length) return;

		next = this.views[0].section.next();

		if(next) {
			view = new EPUBJS.View(next);
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
			view = new EPUBJS.View(prev);
			return this.append(view);
		}

	});

};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Rendition.prototype);
