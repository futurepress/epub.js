EPUBJS.Renderer = function(book, _options) {
  var options = _options || {};
  this.settings = {
    hidden: options.hidden || false,
    viewLimit: 3,
    width: options.width || false, 
    height: options.height || false, 
  };

  this.book = book;

  // Listen for load events
  // this.on("render:loaded", this.loaded.bind(this));

  // Blank Cfi for Parsing
  this.epubcfi = new EPUBJS.EpubCFI();

  this.layoutSettings = {};

  //-- Adds Hook methods to the Book prototype
  //   Hooks will all return before triggering the callback.
  EPUBJS.Hooks.mixin(this);

  //-- Get pre-registered hooks for events
  this.getHooks("beforeChapterDisplay");

  //-- Queue up page changes if page map isn't ready
  this._q = EPUBJS.core.queue(this);

  this.position = 1;

  this.initialize({
    "width"  : this.settings.width,
    "height" : this.settings.height,
    "hidden" : true
  });

  this.rendering = false;
  this.views = [];
  this.positions = [];

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

  this.infinite.on("forwards", this.forwards.bind(this));
  this.infinite.on("backwards", this.backwards.bind(this));

  window.addEventListener("resize", this.onResized.bind(this), false);

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
    var rendered = this.render(section);

    rendered.then(function(){
      this.fill();
      displaying.resolve(this);
    }.bind(this));
  
  }.bind(this));

  return displayed;
};

EPUBJS.Renderer.prototype.render = function(section){
  var rendered;
  var view = new EPUBJS.View();

  if(!section) {
    rendered.reject();
    return;
  };

  rendered = section.render();
  view.index = section.index;

  // Place view in correct position
  this.insert(view, section.index);

  return rendered.then(function(contents){
    return view.load(contents);
  });

};


EPUBJS.Renderer.prototype.forwards = function(){
  var next;
  var rendered;
  var section;

  if(this.rendering) return;
  console.log("going forwards")

  next = this.last().index + 1;

  if(next === this.book.spine.length){
    return;
  }

  section = this.book.spine.get(next);
  rendered = this.render(section);
  this.rendering = true;

  rendered.then(function(){
    console.log("last:", this.last().height)

    this.rendering = false;
  }.bind(this));
  
  return rendered;
};

EPUBJS.Renderer.prototype.backwards = function(view){
  var prev;
  var rendered;
  var section;

  if(this.rendering) return;
  console.log("going backwards")

  prev = this.first().index - 1;
  if(prev < 0){
    return; //TODO: should reject
  }

  section = this.book.spine.get(prev);
  rendered = this.render(section);
  this.rendering = true;

  rendered.then(function(){
    this.rendering = false;
    // -- this might want to be in infinite
    this.container.scrollTop += this.first().height;

  }.bind(this));

  return rendered;
};


// Manage Views

// -- this might want to be in infinite
EPUBJS.Renderer.prototype.fill = function() {
  var filling = this.backwards();
  var height = this.container.getBoundingClientRect().height;
  
  if(!filling) return;
  
  filling.then(function(){
    var bottom = this.last().bounds().bottom;
    while (height && bottom && bottom < height) {
      this.forwards();
    };
  }.bind(this));
};

EPUBJS.Renderer.prototype.jump = function(view){
  this.views.push(view);
};

EPUBJS.Renderer.prototype.append = function(view){
  this.views.push(view);
  view.appendTo(this.container);
};

EPUBJS.Renderer.prototype.prepend = function(view){
  this.views.unshift(view);
  view.prependTo(this.container);
};

// Simple Insert
EPUBJS.Renderer.prototype.insert = function(view, index){
  
  if(!this.first()) {
    this.append(view);
  } else if(index - this.first().index >= 0) {
    this.append(view);
  } else if(index - this.last().index <= 0) {
    this.prepend(view);
  }

  // return position;
};

// Remove the render element and clean up listeners
EPUBJS.Renderer.prototype.destroy = function() {
  
};

EPUBJS.Renderer.prototype.first = function() {
  return this.views[0];
};

EPUBJS.Renderer.prototype.last = function() {
  return this.views[this.views.length-1];
};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Renderer.prototype);