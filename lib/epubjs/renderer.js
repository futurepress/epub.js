EPUBJS.Renderer = function(book, _options) {
  var options = _options || {};
  this.settings = {
    hidden: options.hidden || false,
    viewsLimit: 6,
    width: options.width || false, 
    height: options.height || false, 
  };

  this.book = book;

  // Blank Cfi for Parsing
  this.epubcfi = new EPUBJS.EpubCFI();

  this.layoutSettings = {};

  //-- Queue up page changes if page map isn't ready
  this._q = EPUBJS.core.queue(this);

  this.position = 1;

  this.initialize({
    "width"  : this.settings.width,
    "height" : this.settings.height
  });

  this.rendering = false;
  this.views = [];
  this.positions = [];

  //-- Adds Hook methods to the Renderer prototype
  this.hooks = {};
  this.hooks.display = new EPUBJS.Hook(this);
  this.hooks.replacements = new EPUBJS.Hook(this);

};

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
EPUBJS.Renderer.prototype.initialize = function(_options){
  var options = _options || {};
  var height  = options.height ? options.height + "px" : "100%";
  var width   = options.width ? options.width + "px" : "100%";
  var hidden  = options.hidden || false;

  this.container = document.createElement("div");
  this.infinite = new EPUBJS.Infinite(this.container, this);

  this.container.style.width = width;
  this.container.style.height = height;
  this.container.style.overflow = "scroll";

  if(options.hidden) {
    this.wrapper = document.createElement("div");
    this.wrapper.style.visibility = "hidden";
    this.wrapper.style.overflow = "hidden";
    this.wrapper.style.width = "0";
    this.wrapper.style.height = "0";

    this.wrapper.appendChild(this.container);
    return this.wrapper;
  }
  
  return this.container;
};

EPUBJS.Renderer.prototype.resize = function(_width, _height){
  var width = _width;
  var height = _height;

  if(!_width) {
    width = window.innerWidth;
  }
  if(!_height) {
    height = window.innerHeight;
  }
  
  this.container.style.width = width + "px";
  this.container.style.height = height + "px";

  this.trigger("resized", {
    width: this.width,
    height: this.height
  });

};

EPUBJS.Renderer.prototype.onResized = function(e) {
  var bounds = this.element.getBoundingClientRect();


  this.resize(bounds.width, bounds.height);
};

EPUBJS.Renderer.prototype.attachTo = function(_element){
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

  this.element.appendChild(this.container);

  if(!this.settings.height && !this.settings.width) {
    bounds = this.element.getBoundingClientRect();
    
    this.resize(bounds.width, bounds.height);
  }

  this.infinite.start();

  this.infinite.on("forwards", function(){
    var next = this.last().section.index + 1;

    if(!this.rendering && next < this.book.spine.length){
      this.forwards();
    }

  }.bind(this));
  
  this.infinite.on("backwards", function(){
    var prev = this.first().section.index - 1;

    if(!this.rendering && prev > 0){
      this.backwards();
    }

  }.bind(this));

  window.addEventListener("resize", this.onResized.bind(this), false);

  this.hooks.replacements.register(this.replacements.bind(this));

};

EPUBJS.Renderer.prototype.clear = function(){
  this.views.forEach(function(view){
    view.destroy();
  });
  
  this.views = [];
};

EPUBJS.Renderer.prototype.display = function(what){
  var displaying = new RSVP.defer();
  var displayed = displaying.promise;
  
  // Clear views
  this.clear();
  
  this.book.opened.then(function(){
    var section = this.book.spine.get(what);
    var rendered;

    if(section){
      rendered = this.render(section);

      rendered
        .then(this.fill.bind(this))
        .then(function(){
          displaying.resolve(this);
        }.bind(this));
    } else {
      displaying.reject(new Error("No Section Found"));
    }
    
  }.bind(this));

  return displayed;
};

EPUBJS.Renderer.prototype.render = function(section){
  var rendered;
  var view;

  if(!section) {
    rendered = new RSVP.defer();
    rendered.reject(new Error("No Section Provided"));
    return rendered.promise;
  }; 

  view = new EPUBJS.View(section);
  
  // Place view in correct position
  this.insert(view, section.index);

  rendered = view.render(this.book.request);

  return rendered
    .then(function(){
      return this.hooks.display.trigger(view);
    }.bind(this))
    .then(function(){
      return this.hooks.replacements.trigger(view, this);
    }.bind(this))
    .then(function(){
      this.rendering = false;
      view.show();
      return view;
    }.bind(this))
    .catch(function(e){
      this.trigger("loaderror", e);
    }.bind(this));

};


EPUBJS.Renderer.prototype.forwards = function(){
  var next;
  var rendered;
  var section;

  next = this.last().section.index + 1;
  if(this.rendering || next === this.book.spine.length){
    rendered = new RSVP.defer();
    rendered.reject(new Error("Reject Forwards"));
    return rendered.promise;
  }
  // console.log("going forwards")

  this.rendering = true;

  section = this.book.spine.get(next);
  rendered = this.render(section);

  rendered.then(function(){
    var first = this.first();
    var bounds = first.bounds();
    var prev = this.container.scrollTop;
    if(this.views.length > this.settings.viewsLimit) {
      
      // Remove the item
      this.remove(first);

      // Reset Position
      this.infinite.scroll(0, prev - bounds.height, true)

    }
  }.bind(this));

  
  return rendered;
};

EPUBJS.Renderer.prototype.backwards = function(view){
  var prev;
  var rendered;
  var section;


  prev = this.first().section.index - 1;

  if(this.rendering || prev < 0){
    rendered = new RSVP.defer();
    rendered.reject(new Error("Reject Backwards"));
    return rendered.promise;
  }
  // console.log("going backwards")

  this.rendering = true;

  section = this.book.spine.get(prev);
  rendered = this.render(section);

  rendered.then(function(){
    // this.container.scrollTop += this.first().height;

    this.infinite.scrollBy(0, this.first().height, true);

    if(this.views.length > this.settings.viewsLimit) {
      last = this.last();
      this.remove(last);
    }
  }.bind(this));

  return rendered;
};


// Manage Views

// -- this might want to be in infinite
EPUBJS.Renderer.prototype.fill = function() {
  var height = this.container.getBoundingClientRect().height;
  var next = function(){
    var bottom = this.last().bounds().bottom;
    var defer = new RSVP.defer();

    if (height && bottom && (bottom < height)) { //&& (this.last().section.index + 1 < this.book.spine.length)) {
      return this.forwards().then(next);
    } else {
      this.rendering = false;
      defer.resolve();
      return defer.promise;
    }
  }.bind(this);
  var prev = this.first().section.index - 1;
  var filling = next();

  if(prev > 0){
    filling.then(this.backwards.bind(this));
  }

  
  return filling
    .then(function(){
      this.rendering = false;
    }.bind(this));


};

EPUBJS.Renderer.prototype.append = function(view){
  var first, prevTop, prevHeight, offset;

  this.views.push(view);
  view.appendTo(this.container);

};

EPUBJS.Renderer.prototype.prepend = function(view){
  var last;

  this.views.unshift(view);
  view.prependTo(this.container);

};

// Simple Insert
EPUBJS.Renderer.prototype.insert = function(view, index){
  
  if(!this.first()) {
    this.append(view);
  } else if(index - this.first().section.index >= 0) {
    this.append(view);
  } else if(index - this.last().section.index <= 0) {
    this.prepend(view);
  }
  // return position;
};

// Remove the render element and clean up listeners
EPUBJS.Renderer.prototype.remove = function(view) {
  var index = this.views.indexOf(view);
  view.destroy();
  if(index > -1) {
    this.views.splice(index, 1);
  }
};

EPUBJS.Renderer.prototype.first = function() {
  return this.views[0];
};

EPUBJS.Renderer.prototype.last = function() {
  return this.views[this.views.length-1];
};

EPUBJS.Renderer.prototype.replacements = function(view, renderer) {
  var task = new RSVP.defer();
  var links = view.document.querySelectorAll("a[href]");
  var replaceLinks = function(link){
    var href = link.getAttribute("href");
    var isRelative = href.search("://");
    // var directory = EPUBJS.core.uri(view.window.location.href).directory;
    // var relative;

    if(isRelative != -1){

      link.setAttribute("target", "_blank");

    }else{
      
      // relative = EPUBJS.core.resolveUrl(directory, href);
      
      link.onclick = function(){
        renderer.display(href);
        return false;
      };

    }
  };

  for (var i = 0; i < links.length; i++) {
    replaceLinks(links[i]);
  };

  task.resolve();
  return task.promise;
};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Renderer.prototype);