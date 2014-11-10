EPUBJS.Continuous = function(book, _options){
	this.views = [];
	this.container = container;
	this.limit = limit || 4
	
	// EPUBJS.Renderer.call(this, book, _options);
};

// EPUBJS.Continuous.prototype = Object.create(EPUBJS.Renderer.prototype);
// One rule -- every displayed view must have a next and prev

EPUBJS.Continuous.prototype.append = function(view){
	this.views.push(view);
	// view.appendTo(this.container);
	this.container.appendChild(view.element());
	
	view.onDisplayed = function(){
		var index = this.views.indexOf(view);
		var next = view.section.next();
		var view;
		
		if(index + 1 === this.views.length && next) {
			view = new EPUBJS.View(next);
			this.append(view);
		}
	}.bind(this);
	
	this.resizeView(view);
	
	// If over the limit, destory first view
};

EPUBJS.Continuous.prototype.prepend = function(view){
	this.views.unshift(view);
	// view.prependTo(this.container);
	this.container.insertBefore(view.element, this.container.firstChild);
	
	view.onDisplayed = function(){
		var index = this.views.indexOf(view);
		var prev = view.section.prev();
		var view;
		
		if(prev) {
			view = new EPUBJS.View(prev);
			this.append(view);
		}
	
	}.bind(this);
	
	this.resizeView(view);
	
	// If over the limit, destory last view

};

EPUBJS.Continuous.prototype.fill = function(view){
	
	if(this.views.length){
		this.clear();
	}
	
	this.views.push(view);

	this.container.appendChild(view.element);

	view.onDisplayed = function(){
		var next = view.section.next();
		var prev = view.section.prev();
		var index = this.views.indexOf(view);
		
		var prevView, nextView;
		
		if(index + 1 === this.views.length && next) {
			prevView = new EPUBJS.View(next);
			this.append(prevView);
		}
		
		if(index === 0 && prev) {
			nextView = new EPUBJS.View(prev);
			this.append(nextView);
		}
		
		this.resizeView(view);
		
	}.bind(this);

};

EPUBJS.Continuous.prototype.insert = function(view, index) {
	this.views.splice(index, 0, view);

	if(index < this.cotainer.children.length){
		this.container.insertBefore(view.element(), this.container.children[index]);
	} else {
		this.container.appendChild(view.element());
	}

};

// Remove the render element and clean up listeners
EPUBJS.Continuous.prototype.remove = function(view) {
	var index = this.views.indexOf(view);
	view.destroy();
	if(index > -1) {
		this.views.splice(index, 1);
	}
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


/*
EPUBJS.Continuous.prototype.add = function(section) {
	var view;
	
	if(this.sections.length === 0) {
		// Make a new view
		view = new EPUBJS.View(section);
		// Start filling
		this.fill(view);
	else if(section.index === this.last().index + 1) {
		// Add To Bottom / Back
		view = this.first();
		
		// this.append(view);
	} else if(section.index === this.first().index - 1){
		// Add to Top / Front
		view = this.last()
		// this.prepend(view);
	} else {
		this.clear();
		this.fill(view);
	}

};
*/

EPUBJS.Continuous.prototype.check = function(){
	var container = this.container.getBoundingClientRect();
	var isVisible = function(view){
		var bounds = view.bounds();
		if((bounds.bottom >= container.top) &&
			!(bounds.top > container.bottom) &&
			(bounds.right >= container.left) &&
			!(bounds.left > container.right)) {
			// Visible
			console.log("visible", view.index);
			
			// Fit to size of the container, apply padding
			this.resizeView(view);
			
			this.display(view);
		} else {
			console.log("off screen", view.index);
			view.destroy();
		}
		
	}.bind(this);
	this.views.forEach(this.isVisible);
};

EPUBJS.Continuous.prototype.displayView = function(view) {
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
			this.rendering = false;
			view.show();
			this.trigger("rendered", section);
			return view;
		}.bind(this))
		.catch(function(e){
			this.trigger("loaderror", e);
		}.bind(this));
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
	var minHeight = 100;
	var minWidth = 200;
	
	if(this.settings.axis === "vertical") {
		view.resize(width, minHeight);
	} else {
		view.resize(minWidth, height);
	}

};
