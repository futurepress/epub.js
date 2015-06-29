EPUBJS.Views = function(container) {
  this.container = container;
  this._views = [];
  this.length = 0;
  this.hidden = false;
};

EPUBJS.Views.prototype.first = function() {
	return this._views[0];
};

EPUBJS.Views.prototype.last = function() {
	return this._views[this._views.length-1];
};

EPUBJS.Views.prototype.each = function() {
	return this._views.forEach.apply(this._views, arguments);
};

EPUBJS.Views.prototype.indexOf = function(view) {
	return this._views.indexOf(view);
};

EPUBJS.Views.prototype.slice = function() {
	return this._views.slice.apply(this._views, arguments);
};

EPUBJS.Views.prototype.get = function(i) {
	return this._views[i];
};

EPUBJS.Views.prototype.append = function(view){
	this._views.push(view);
	this.container.appendChild(view.element);
  this.length++;
  return view;
};

EPUBJS.Views.prototype.prepend = function(view){
	this._views.unshift(view);
	this.container.insertBefore(view.element, this.container.firstChild);
  this.length++;
  return view;
};

EPUBJS.Views.prototype.insert = function(view, index) {
	this._views.splice(index, 0, view);

	if(index < this.container.children.length){
		this.container.insertBefore(view.element, this.container.children[index]);
	} else {
		this.container.appendChild(view.element);
	}
  this.length++;
  return view;
};

EPUBJS.Views.prototype.remove = function(view) {
	var index = this._views.indexOf(view);

	if(index > -1) {
		this._views.splice(index, 1);
	}


	this.destroy(view);

  this.length--;
};

EPUBJS.Views.prototype.destroy = function(view) {
	view.off("resized");

	if(view.displayed){
		view.destroy();
	}

	this.container.removeChild(view.element);
	view = null;
};

// Iterators

EPUBJS.Views.prototype.clear = function(){
	// Remove all views
  var view;
  var len = this.length;

  if(!this.length) return;

  for (var i = 0; i < len; i++) {
    view = this._views[i];
		this.destroy(view);
  }

  this._views = [];
  this.length = 0;
};

EPUBJS.Views.prototype.find = function(section){

  var view;
  var len = this.length;

  for (var i = 0; i < len; i++) {
    view = this._views[i];
		if(view.displayed && view.section.index == section.index) {
			return view;
		}
  }

};

EPUBJS.Views.prototype.displayed = function(){
  var displayed = [];
  var view;
  var len = this.length;

  for (var i = 0; i < len; i++) {
    view = this._views[i];
    if(view.displayed){
      displayed.push(view);
    }
  }
  return displayed;
};

EPUBJS.Views.prototype.show = function(){
  var view;
  var len = this.length;

  for (var i = 0; i < len; i++) {
    view = this._views[i];
    if(view.displayed){
      view.show();
    }
  }
  this.hidden = false;
};

EPUBJS.Views.prototype.hide = function(){
  var view;
  var len = this.length;

  for (var i = 0; i < len; i++) {
    view = this._views[i];
    if(view.displayed){
      view.hide();
    }
  }
  this.hidden = true;
};
