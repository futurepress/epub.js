var RSVP = require('rsvp');
var core = require('../core');
var Views = require('../views');
var EpubCFI = require('../epubcfi');

function SingleViewManager(options) {

	this.View = options.view;
	this.renderer = options.renderer;
	this.q = options.queue;

	this.settings = core.extend(this.settings || {}, {
		infinite: true,
		hidden: false,
		width: false,
		height: null,
		globalLayoutProperties : { layout: 'reflowable', spread: 'auto', orientation: 'auto'},
		layout: null,
		axis: "vertical",
		ignoreClass: ''
	});

	core.extend(this.settings, options.settings);

	this.viewSettings = {
		ignoreClass: this.settings.ignoreClass
	};

}

SingleViewManager.prototype.start = function(stage){

	// Save the stage
	this.stage = stage;

	// Get this stage container div
	this.container = this.stage.getContainer();

	// Views array methods
	this.views = new Views(this.container);

	// Calculate Stage Size
	this.bounds = this.stage.bounds();

	// Function to handle a resize event.
	// Will only attach if width and height are both fixed.
	this.stage.onResize(this.onResized.bind(this));

	// Add Event Listeners
	this.addEventListeners();

	// Add Layout method
	// this.applyLayoutMethod();
};

SingleViewManager.prototype.addEventListeners = function(){

};

SingleViewManager.prototype.onResized = function(e) {
	this.resize();
};

SingleViewManager.prototype.resize = function(width, height){

	this.bounds = this.stage.bounds(width, height);

	this.views.each(this.resizeView.bind(this));

	this.trigger("resized", {
		width: this.stage.width,
		height: this.stage.height
	});

};

SingleViewManager.prototype.layout = function(layoutFunc){

	this.views.each(function(view){
		layoutFunc(view);
	});

};

SingleViewManager.prototype.createView = function(section) {
	return new this.View(section, this.viewSettings);
};

SingleViewManager.prototype.display = function(section, target){

	var displaying = new RSVP.defer();
	var displayed = displaying.promise;

	var isCfi = EpubCFI().isCfiString(target);

	// Check to make sure the section we want isn't already shown
	var visible = this.views.find(section);

	// View is already shown, just move to correct location
	if(visible && target) {
		offset = visible.locationOf(target);
		this.moveTo(offset);
		return displaying.resolve();
	}

	// Hide all current views
	this.views.hide();

	// Create a new view
	view = this.createView(section);

	return this.fill(view)
		.then(function(){

			// Move to correct place within the section, if needed
			if(target) {
				offset = view.locationOf(target);
				return this.moveTo(offset);
			}

		}.bind(this))
		// .then(function(){
		// 	return this.hooks.display.trigger(view);
		// }.bind(this))
		.then(function(){
			this.views.show();
		}.bind(this));

};

SingleViewManager.prototype.afterDisplayed = function(view){
	this.trigger("added", view.section);
};

SingleViewManager.prototype.moveTo = function(offset){
	this.scrollTo(offset.left, offset.top);
};

SingleViewManager.prototype.fill = function(view){

	this.views.clear();

	this.views.append(view);

	// view.on("shown", this.afterDisplayed.bind(this));
	view.onDisplayed = this.afterDisplayed.bind(this);

	return this.renderer(view, this.views.hidden);
};

SingleViewManager.prototype.resizeView = function(view) {

	if(this.settings.globalLayoutProperties.layout === "pre-paginated") {
		view.lock("both", this.bounds.width, this.bounds.height);
	} else {
		view.lock("width", this.bounds.width, this.bounds.height);
	}

};

SingleViewManager.prototype.next = function(){
	var next;
	var view;

	if(!this.views.length) return;

	next = this.views.last().section.next();

	if(next) {
		view = this.createView(next);
		return this.fill(view)
		.then(function(){
			this.views.show();
		}.bind(this));
	}
};

SingleViewManager.prototype.prev = function(){
	var prev;
	var view;

	if(!this.views.length) return;

	prev = this.views.first().section.prev();
	if(prev) {
		view = this.createView(prev);
		return this.fill(view)
		.then(function(){
			this.views.show();
		}.bind(this));
	}
};

SingleViewManager.prototype.current = function(){
	var visible = this.visible();
	if(visible.length){
		// Current is the last visible view
		return visible[visible.length-1];
	}
  return null;
};

SingleViewManager.prototype.currentLocation = function(){
  var view;
  var start, end;

  if(this.views.length) {
  	view = this.views.first();
    // start = container.left - view.position().left;
    // end = start + this.layout.spread;
		console.log("visibile currentLocation", view);
    // return this.map.page(view);
  }

};

SingleViewManager.prototype.isVisible = function(view, offsetPrev, offsetNext, _container){
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

SingleViewManager.prototype.visible = function(){
	var container = this.stage.bounds();
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

SingleViewManager.prototype.scrollBy = function(x, y, silent){
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

SingleViewManager.prototype.scrollTo = function(x, y, silent){
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

 //-- Enable binding events to Manager
 RSVP.EventTarget.mixin(SingleViewManager.prototype);

 module.exports = SingleViewManager;
