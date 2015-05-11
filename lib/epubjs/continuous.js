EPUBJS.Continuous = function(book, options) {
	
	EPUBJS.Rendition.apply(this, arguments); // call super constructor.

	this.settings = EPUBJS.core.extend(this.settings || {}, {
		infinite: true,
		hidden: false,
		width: false,
		height: false,
		overflow: "auto",
		axis: "vertical",
		offset: 500
	});
	
	EPUBJS.core.extend(this.settings, options);
	
	if(this.settings.hidden) {
		this.wrapper = this.wrap(this.container);
	}
		
	
};

// subclass extends superclass
EPUBJS.Continuous.prototype = Object.create(EPUBJS.Rendition.prototype);
EPUBJS.Continuous.prototype.constructor = EPUBJS.Continuous;

EPUBJS.Continuous.prototype.attachListeners = function(){

	// Listen to window for resize event
	window.addEventListener("resize", this.onResized.bind(this), false);

	if(this.settings.infinite) {
		this.infinite = new EPUBJS.Infinite(this.container);
		this.infinite.on("scroll", this.check.bind(this));
	}

};

EPUBJS.Continuous.prototype.display = function(what){
	
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


// Takes a cfi, fragment or page?
EPUBJS.Continuous.prototype.moveTo = function(what){
	
};

EPUBJS.Continuous.prototype.afterDisplayed = function(currView){
	var next = currView.section.next();
	var prev = currView.section.prev();
	var index = this.views.indexOf(currView);

	var prevView, nextView;
	// this.resizeView(currView); 


	if(index + 1 === this.views.length && next) {
		nextView = new EPUBJS.View(next);
		this.append(nextView);
	}

	if(index === 0 && prev) {
		prevView = new EPUBJS.View(prev);
		this.prepend(prevView);
	}

	// this.removeShownListeners(currView);
	currView.onShown = this.afterDisplayed.bind(this);


};

EPUBJS.Continuous.prototype.afterDisplayedAbove = function(currView){

	var bounds = currView.bounds(); //, style, marginTopBottom, marginLeftRight;
	// var prevTop = this.container.scrollTop;
	// var prevLeft = this.container.scrollLeft;

	if(currView.countered) {
		this.afterDisplayed(currView);
		return;
	}
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
EPUBJS.Continuous.prototype.removeShownListeners = function(view){

	// view.off("shown", this.afterDisplayed);
	// view.off("shown", this.afterDisplayedAbove);
	view.onShown = function(){};

};

EPUBJS.Continuous.prototype.append = function(view){
	this.views.push(view);
	// view.appendTo(this.container);
	this.container.appendChild(view.element);


	// view.on("shown", this.afterDisplayed.bind(this));
	view.onShown = this.afterDisplayed.bind(this);
	// this.resizeView(view);
};

EPUBJS.Continuous.prototype.prepend = function(view){
	this.views.unshift(view);
	// view.prependTo(this.container);
	this.container.insertBefore(view.element, this.container.firstChild);
	
	view.onShown = this.afterDisplayedAbove.bind(this);
	// view.on("shown", this.afterDisplayedAbove.bind(this));

	// this.resizeView(view);
	
};

EPUBJS.Continuous.prototype.fill = function(view){

	if(this.views.length){
		this.clear();
	}

	this.views.push(view);

	this.container.appendChild(view.element);

	// view.on("shown", this.afterDisplayed.bind(this));
	view.onShown = this.afterDisplayed.bind(this);

};

EPUBJS.Continuous.prototype.insert = function(view, index) {
	this.views.splice(index, 0, view);

	if(index < this.cotainer.children.length){
		this.container.insertBefore(view.element, this.container.children[index]);
	} else {
		this.container.appendChild(view.element);
	}

};

// Remove the render element and clean up listeners
EPUBJS.Continuous.prototype.remove = function(view) {
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

EPUBJS.Continuous.prototype.clear = function(){
	this.views.forEach(function(view){
		view.destroy();
	});

	this.views = [];
};

EPUBJS.Continuous.prototype.first = function() {
	return this.views[0];
};

EPUBJS.Continuous.prototype.last = function() {
	return this.views[this.views.length-1];
};

EPUBJS.Continuous.prototype.each = function(func) {
	return this.views.forEach(func);
};

EPUBJS.Continuous.prototype.isVisible = function(view, _container){
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
			// console.log("render", view.index);
			this.render(view).then(function(){
				// Check to see if anything new is on screen after rendering
				this.check();
			}.bind(this));

		}
		
	} else {
		
		if(view.shown) {
			view.destroy();
			// console.log("destroy:", view.section.index)
		}
	}
};

EPUBJS.Continuous.prototype.check = function(){
	var container = this.container.getBoundingClientRect();
	this.views.forEach(function(view){
		this.isVisible(view, container);
	}.bind(this));
	
	clearTimeout(this.trimTimeout);
	this.trimTimeout = setTimeout(function(){
		this.trim();
	}.bind(this), 250);

};

EPUBJS.Continuous.prototype.trim = function(){
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

EPUBJS.Continuous.prototype.erase = function(view, above){ //Trim

	// remove from dom
	var prevTop = this.container.scrollTop;
	var prevLeft = this.container.scrollLeft;
	var bounds = view.bounds();

	this.remove(view);
	
	if(above) {
		if(this.settings.axis === "vertical") {
			this.infinite.scrollTo(0, prevTop - bounds.height, true);
		} else {
			this.infinite.scrollTo(prevLeft - bounds.width, 0, true);
		}
	}
	
};


EPUBJS.Continuous.prototype.resizeView = function(view) {
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

// EPUBJS.Continuous.prototype.paginate = function(options) {
//   this.pagination = new EPUBJS.Paginate(this, {
//     width: this.settings.width,
//     height: this.settings.height
//   });
//   return this.pagination;
// };

EPUBJS.Continuous.prototype.checkCurrent = function(position) {
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
