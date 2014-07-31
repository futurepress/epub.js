EPUBJS.Renderer = function(book, _options) {
  var options = _options || {};
  var settings = {
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
  // this.resized = _.debounce(this.onResized.bind(this), 100);

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
    "width"  : settings.width,
    "height" : settings.height,
    "hidden" : true
  });

  this.displaying = false;
  this.views = [];
  this.positions = [];

};

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
EPUBJS.Renderer.prototype.initialize = function(_options){
  var options = _options || {};
  var height  = options.height || "100%";
  var width   = options.width || "100%";
  var hidden  = options.hidden || false;


  this.container = document.createElement("div");
  this.infinite = new EPUBJS.Infinite(this.container, this);

  this.container.style.width = height;
  this.container.style.height = width;
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


EPUBJS.Renderer.prototype.attachTo = function(_element){
  var element;

  if(EPUBJS.core.isElement(_element)) {
    element = _element;
  } else if (typeof _element === "string") {
    element = document.getElementById(_element);
  } 

  if(!element){
    console.error("Not an Element");
    return;
  }

  element.appendChild(this.container);

  this.infinite.start();

  this.infinite.on("forwards", this.forwards.bind(this));
  this.infinite.on("backwards", this.backwards.bind(this));

};


EPUBJS.Renderer.prototype.display = function(what){
  var displaying = new RSVP.defer();
  var displayed = displaying.promise;
  var view = new EPUBJS.View();

  this.book.opened.then(function(){
    var section = this.book.spine.get(what);
    var rendered;

    if(!section) {
      displaying.reject();
      return;
    };

    rendered = section.render();

    view.index = section.index;

    rendered.then(function(contents){
      return view.load(contents);
    }).then(function(){
      displaying.resolve(this);
    }.bind(this));

    // Place view in correct position
    this.insert(view, section.index);

  }.bind(this));

  return displayed;
};


EPUBJS.Renderer.prototype.forwards = function(){
  var next;
  var displayed;

  if(this.displaying) return;

  next = this.last().index + 1;

  if(next === this.book.spine.length){
    return;
  }

  displayed = this.display(next);
  this.displaying = true;

  displayed.then(function(){
    this.displaying = false;
  }.bind(this));
  
  return displayed;
};

EPUBJS.Renderer.prototype.backwards = function(view){
  var prev;
  var displayed;

  if(this.displaying) return;

  prev = this.first().index - 1;
  if(prev < 0){
    return;
  }

  displayed = this.display(prev);
  this.displaying = true;

  displayed.then(function(){
    this.displaying = false;
    window.scrollBy(0, this.first().height + 20); 
  }.bind(this));

  return displayed;
};


// Manage Views
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