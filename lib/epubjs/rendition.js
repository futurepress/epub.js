EPUBJS.Rendition = function(book, options) {
	this.settings = EPUBJS.core.defaults(options || {}, {
		infinite: true,
		hidden: false,
		width: false,
		height: false,
		overflow: "auto",
		axis: "vertical",
		offset: 500
	});
	
	this.book = book;
	
	this.container = this.initialize({
		"width"  : this.settings.width,
		"height" : this.settings.height
	});
	
	if(this.settings.hidden) {
		this.wrapper = this.wrap(this.container);
	}
	
	this.views = [];
	
	
	//-- Adds Hook methods to the Renderer prototype
	this.hooks = {};
	this.hooks.display = new EPUBJS.Hook(this);
	this.hooks.replacements = new EPUBJS.Hook(this);
	
	this.hooks.replacements.register(EPUBJS.replace.links.bind(this));
	// this.hooks.display.register(this.afterDisplay.bind(this));
	
	if(this.settings.infinite) {
		this.infinite = new EPUBJS.Infinite(this.container);
		this.infinite.on("scroll", this.check.bind(this));
	}
	
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

	container.style.width = width;
	container.style.height = height;
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

	if(EPUBJS.core.isElement(_element)) {
		this.element = _element;
	} else if (typeof _element === "string") {
		this.element = document.getElementById(_element);
	} 

	if(!this.element){
		console.error("Not an Element");
		return;
	}
	
	// If width or height are not set, inherit them from containing element
	if(this.settings.height === false) {
		bounds = this.element.getBoundingClientRect();
		this.container.style.height = bounds.height + "px";
	}
		
	if(this.settings.width === false) {
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
	
			// This will clear all previous views
			this.fill(view);
	
			// Move to correct place within the section, if needed
			// this.moveTo(what)
	
			this.check();
	
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
/*
EPUBJS.Rendition.prototype.load = function(what){
	var displaying = new RSVP.defer();
	var displayed = displaying.promise;

	var section = this.book.spine.get(what);
	var view;
		
	this.displaying = true;

	if(section){
		view = new EPUBJS.View(section);
		
		// This will clear all previous views
		this.fill(view);
		
		// Move to correct place within the section, if needed
		// this.moveTo(what)

		this.check();
		
		view.displayed.then(function(){
			this.trigger("displayed", section);
			this.displaying = false;
			displaying.resolve(this);
		}.bind(this));

	} else {
		displaying.reject(new Error("No Section Found"));
	}

	return displayed;
};
*/
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
			this.rendering = false;
			this.check(); // Check to see if anything new is on screen after rendering
			return view;
		}.bind(this))
		.catch(function(e){
			this.trigger("loaderror", e);
		}.bind(this));
		
};

EPUBJS.Rendition.prototype.afterDisplayed = function(currView){
	var next = currView.section.next();
	var prev = currView.section.prev();
	var index = this.views.indexOf(currView);

	var prevView, nextView;
	
	this.resizeView(currView);

	if(index + 1 === this.views.length && next) {
		nextView = new EPUBJS.View(next);
		this.append(nextView);
	}

	if(index === 0 && prev) {
		prevView = new EPUBJS.View(prev);
		this.prepend(prevView);
	}

	this.removeShownListeners(currView);

};

EPUBJS.Rendition.prototype.afterDisplayedAbove = function(currView){

	var bounds = currView.bounds(); //, style, marginTopBottom, marginLeftRight;
	// var prevTop = this.container.scrollTop;
	// var prevLeft = this.container.scrollLeft;

	if(currView.countered) return;

	// bounds = currView.bounds();

	if(this.settings.axis === "vertical") {
		this.infinite.scrollBy(0, bounds.height, true);
	} else {
		this.infinite.scrollBy(bounds.width, 0, true);
	}
	// if(this.settings.axis === "vertical") {
	// 	currView.countered = bounds.height - (currView.countered || 0);
	// 	this.infinite.scrollTo(0, prevTop + bounds.height, true)
	// } else {
	// 	currView.countered = bounds.width - (currView.countered || 0);
	// 	this.infinite.scrollTo(prevLeft + bounds.width, 0, true);
	// }
	currView.countered = true;

	// this.removeShownListeners(currView);

	this.afterDisplayed(currView);

	if(this.afterDisplayedAboveHook) this.afterDisplayedAboveHook(currView);

};

// Remove Previous Listeners if present
EPUBJS.Rendition.prototype.removeShownListeners = function(view){

	// view.off("shown", this.afterDisplayed);
	// view.off("shown", this.afterDisplayedAbove);
	view.onShown = function(){};

};

EPUBJS.Rendition.prototype.append = function(view){
	this.views.push(view);
	// view.appendTo(this.container);
	this.container.appendChild(view.element);


	// view.on("shown", this.afterDisplayed.bind(this));
	view.onShown = this.afterDisplayed.bind(this);
	// this.resizeView(view);
};

EPUBJS.Rendition.prototype.prepend = function(view){
	this.views.unshift(view);
	// view.prependTo(this.container);
	this.container.insertBefore(view.element, this.container.firstChild);
	
	view.onShown = this.afterDisplayedAbove.bind(this);
	// view.on("shown", this.afterDisplayedAbove.bind(this));

	// this.resizeView(view);
	
};

EPUBJS.Rendition.prototype.fill = function(view){

	if(this.views.length){
		this.clear();
	}

	this.views.push(view);

	this.container.appendChild(view.element);

	// view.on("shown", this.afterDisplayed.bind(this));
	view.onShown = this.afterDisplayed.bind(this);

};

EPUBJS.Rendition.prototype.insert = function(view, index) {
	this.views.splice(index, 0, view);

	if(index < this.cotainer.children.length){
		this.container.insertBefore(view.element, this.container.children[index]);
	} else {
		this.container.appendChild(view.element);
	}

};

// Remove the render element and clean up listeners
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

EPUBJS.Rendition.prototype.clear = function(){
	this.views.forEach(function(view){
		view.destroy();
	});

	this.views = [];
};

EPUBJS.Rendition.prototype.first = function() {
	return this.views[0];
};

EPUBJS.Rendition.prototype.last = function() {
	return this.views[this.views.length-1];
};

EPUBJS.Rendition.prototype.each = function(func) {
	return this.views.forEach(func);
};

EPUBJS.Rendition.prototype.isVisible = function(view, _container){
	var position = view.position();
	var container = _container || this.container.getBoundingClientRect();

	if((position.bottom >= container.top - this.settings.offset) &&
		!(position.top > container.bottom) &&
		(position.right >= container.left) &&
		!(position.left > container.right + this.settings.offset)) {
		// Visible

		// Fit to size of the container, apply padding
		// this.resizeView(view);
		if(!view.shown && !this.rendering) {
			console.log("render", view.index);
			this.render(view);
		}
		
	} else {
		
		if(view.shown) {
			// console.log("off screen", view.index);
			view.destroy();
			console.log("destroy:", view.section.index)
		}
	}
};

EPUBJS.Rendition.prototype.check = function(){
	var container = this.container.getBoundingClientRect();
	this.views.forEach(function(view){
		this.isVisible(view, container);
	}.bind(this));
	
	clearTimeout(this.trimTimeout);
	this.trimTimeout = setTimeout(function(){
		this.trim();
	}.bind(this), 250);

};

EPUBJS.Rendition.prototype.trim = function(){
	var above = true;
	for (var i = 0; i < this.views.length; i++) {
		var view = this.views[i];
		var prevShown = i > 0 ? this.views[i-1].shown : false;
		var nextShown = (i+1 < this.views.length) ? this.views[i+1].shown : false;
		if(!view.shown && !prevShown && !nextShown) {
			// Remove
			this.erase(view, above);
		}
		if(nextShown) {
			above = false;
		}
	}
};

EPUBJS.Rendition.prototype.erase = function(view, above){ //Trim

	// remove from dom
	var prevTop = this.container.scrollTop;
	var prevLeft = this.container.scrollLeft;
	var bounds = view.bounds();

	this.remove(view);
	
	if(above) {
		if(this.settings.axis === "vertical") {
			this.infinite.scrollTo(0, prevTop - bounds.height, true);
		} else {
			console.log("remove left:", view.section.index)
			this.infinite.scrollTo(prevLeft - bounds.width, 0, true);
		}
	}
	
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

EPUBJS.Rendition.prototype.paginate = function(options) {
  this.pagination = new EPUBJS.Paginate(this, {
    width: this.settings.width,
    height: this.settings.height
  });
  return this.pagination;
};

EPUBJS.Renderer.prototype.checkCurrent = function(position) {
  var view, top;
  var container = this.container.getBoundingClientRect();
  var length = this.views.length - 1;

  if(this.rendering) {
    return;
  }

  if(this.settings.axis === "horizontal") {
    // TODO: Check for current horizontal
  } else {
    
    for (var i = length; i >= 0; i--) {
      view = this.views[i];
      top = view.bounds().top;
      if(top < container.bottom) {
        
        if(this.current == view.section) {
          break;
        }

        this.current = view.section;
        this.trigger("current", this.current);
        break;
      }
    }

  }

};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Rendition.prototype);
