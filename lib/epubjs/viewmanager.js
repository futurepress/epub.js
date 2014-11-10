// View Management
EPUBJS.ViewManager = function(container){
	this.views = [];
	this.container = container;
};

EPUBJS.ViewManager.prototype.append = function(view){
	this.views.push(view);
	// view.appendTo(this.container);
	this.container.appendChild(view.element());

};

EPUBJS.ViewManager.prototype.prepend = function(view){
	this.views.unshift(view);
	// view.prependTo(this.container);
	this.container.insertBefore(view.element(), this.container.firstChild);
};

EPUBJS.ViewManager.prototype.insert = function(view, index) {
	this.views.splice(index, 0, view);
	
	if(index < this.cotainer.children.length){
		this.container.insertBefore(view.element(), this.container.children[index]);
	} else {
		this.container.appendChild(view.element());
	}
	
};

EPUBJS.Renderer.prototype.add = function(view) {
	var section = view.section;
	var index = -1;

	if(this.views.length === 0 || view.index > this.last().index) {
		this.append(view);
		index = this.views.length;
	} else if(view.index < this.first().index){
		this.prepend(view);
		index = 0;
	} else {
		// Sort the views base on index
		index = EPUBJS.core.locationOf(view, this.views, function(){
			if (a.index > b.index) {
				return 1;
			}
			if (a.index < b.index) {
				return -1;
			}
			return 0;
		});

		// Place view in correct position
		this.insert(view, index);
	}
};

// Remove the render element and clean up listeners
EPUBJS.ViewManager.prototype.remove = function(view) {
	var index = this.views.indexOf(view);
	view.destroy();
	if(index > -1) {
		this.views.splice(index, 1);
	}
};

EPUBJS.ViewManager.prototype.clear = function(){
	this.views.forEach(function(view){
		view.destroy();
	});

	this.views = [];
};

EPUBJS.ViewManager.prototype.first = function() {
	return this.views[0];
};

EPUBJS.ViewManager.prototype.last = function() {
	return this.views[this.views.length-1];
};

EPUBJS.ViewManager.prototype.map = function(func) {
	return this.views.map(func);
};

