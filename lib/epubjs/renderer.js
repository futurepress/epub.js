EPUBJS.Renderer = function(book, _options) {
  var options = _options || {};
  this.settings = {
    infinite: typeof(options.infinite) === "undefined" ? true : options.infinite,
    hidden: typeof(options.hidden) === "undefined" ? false : options.hidden,
    axis: options.axis || "vertical",
    viewsLimit: options.viewsLimit || 5,
    width: typeof(options.width) === "undefined" ? false : options.width,
    height: typeof(options.height) === "undefined" ? false : options.height,
    overflow: typeof(options.overflow) === "undefined" ? "auto" : options.overflow,
    padding: options.padding || "",
    offset: 400
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
  this.filling = false;
  this.displaying = false;

  this.views = [];
  this.positions = [];

  //-- Adds Hook methods to the Renderer prototype
  this.hooks = {};
  this.hooks.display = new EPUBJS.Hook(this);
  this.hooks.replacements = new EPUBJS.Hook(this);

  if(!this.settings.infinite) {
    this.settings.viewsLimit = 1;
  }


};

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
EPUBJS.Renderer.prototype.initialize = function(_options){
  var options = _options || {};
  var height  = options.height !== false ? options.height : "100%";
  var width   = options.width !== false ? options.width : "100%";
  var hidden  = options.hidden || false;

  if(options.height && EPUBJS.core.isNumber(options.height)) {
    height = options.height + "px";
  }

  if(options.width && EPUBJS.core.isNumber(options.width)) {
    width = options.width + "px";
  }

  this.container = document.createElement("div");

  if(this.settings.infinite) {
    this.infinite = new EPUBJS.Infinite(this.container, this.settings.axis);
    this.infinite.on("scroll", this.checkCurrent.bind(this));
  }

  if(this.settings.axis === "horizontal") {
    // this.container.style.display = "flex";
    // this.container.style.flexWrap = "nowrap";
    this.container.style.whiteSpace = "nowrap";
  }

  this.container.style.width = width;
  this.container.style.height = height;
  this.container.style.overflow = this.settings.overflow;

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

  if(this.settings.infinite) {

    this.infinite.start();
  
    this.infinite.on("forwards", function(){
      var next = this.last().section.index + 1;

      if(!this.rendering && 
         !this.filling && 
         !this.displaying &&
         next < this.book.spine.length){
        
        this.forwards();
      
      }

    }.bind(this));
    
    this.infinite.on("backwards", function(){
      var prev = this.first().section.index - 1;

      if(!this.rendering &&
         !this.filling &&
         !this.displaying &&
         prev > 0){
        
        this.backwards();
      
      }

    }.bind(this));

  }
  window.addEventListener("resize", this.onResized.bind(this), false);

  this.hooks.replacements.register(this.replacements.bind(this));
  this.hooks.display.register(this.afterDisplay.bind(this));

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
  

  // Check for fragments
  if(typeof what === 'string') {
    what = what.split("#")[0];
  }

  this.book.opened.then(function(){
    var section = this.book.spine.get(what);
    var rendered;

    this.displaying = true;

    if(section){

      // Clear views
      this.clear();

      rendered = this.render(section);

      if(this.settings.infinite) {
        rendered.then(function(){
          return this.fill.call(this);
        }.bind(this));
      }
      
      rendered.then(function(){
        this.trigger("displayed", section);
        this.displaying = false;
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


  if(!section) {
    rendered = new RSVP.defer();
    rendered.reject(new Error("No Section Provided"));
    return rendered.promise;
  } 

  view = new EPUBJS.View(section);

  if(this.settings.axis === "vertical") {
    view.create(width, 0);
  } else {
    view.create(0, height);
  }
  

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
      return view.expand();
    }.bind(this))
    .then(function(){
      this.rendering = false;
      view.show();
      this.trigger("rendered", view.section);
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
    var firstBounds = first.bounds();
    var lastBounds = this.last().bounds();
    var prevTop = this.container.scrollTop;
    var prevLeft = this.container.scrollLeft;

    if(this.views.length > this.settings.viewsLimit) {
      
      // Temp fix for loop      
      if(this.container.scrollTop - firstBounds.height > 100) {
        // Remove the item
        this.remove(first);
      
        if(this.settings.infinite) {
          // Reset Position
          if(this.settings.axis === "vertical") {
            this.infinite.scrollTo(0, prevTop - firstBounds.height, true);
          } else {
            this.infinite.scrollTo(prevLeft - firstBounds.width, true);
          }
        }
      }

      
      

    }

    this.rendering = false;

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
    var last;

    if(this.settings.infinite) {

      // this.container.scrollTop += this.first().height;
      if(this.settings.axis === "vertical") {    
        this.infinite.scrollBy(0, this.first().bounds().height, true);
      } else {
        this.infinite.scrollBy(this.first().bounds().width, 0, true);
      }

    }

    if(this.views.length > this.settings.viewsLimit) {

      last = this.last();
      this.remove(last);

      if(this.container.scrollTop - this.first().bounds().height > 100) {
        // Remove the item
        this.remove(last);
      }

    }

    this.rendering = false;

  }.bind(this));

  return rendered;
};


// Manage Views

// -- this might want to be in infinite
EPUBJS.Renderer.prototype.fill = function() {
  
  var prev = this.first().section.index - 1;
  var filling = this.forwards();

  this.filling = true;

  if(this.settings.axis === "vertical") {
    filling.then(this.fillVertical.bind(this));
  } else {
    filling.then(this.fillHorizontal.bind(this));
  }

  if(prev > 0){
    filling.then(this.backwards.bind(this));
  }

  
  return filling
    .then(function(){
      this.filling = false;
    }.bind(this));


};

EPUBJS.Renderer.prototype.fillVertical = function() {
  var height = this.container.getBoundingClientRect().height;
  var bottom = this.last().bounds().bottom;
  var defer = new RSVP.defer();

  if (height && bottom && (bottom < height)) { //&& (this.last().section.index + 1 < this.book.spine.length)) {
    return this.forwards().then(this.fillVertical.bind(this));
  } else {
    this.rendering = false;
    defer.resolve();
    return defer.promise;
  }
};

EPUBJS.Renderer.prototype.fillHorizontal = function() {
  var width = this.container.getBoundingClientRect().width;
  var right = this.last().bounds().right;
  var defer = new RSVP.defer();

  if (width && right && (right <= width)) { //&& (this.last().section.index + 1 < this.book.spine.length)) {
    return this.forwards().then(this.fillHorizontal.bind(this));
  } else {
    this.rendering = false;
    defer.resolve();
    return defer.promise;
  }
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
    var uri = new EPUBJS.core.uri(href);


    if(uri.protocol){

      link.setAttribute("target", "_blank");

    }else{
      
      // relative = EPUBJS.core.resolveUrl(directory, href);
      // if(uri.fragment && !base) {
      //   link.onclick = function(){
      //     renderer.fragment(href);
      //     return false;
      //   };
      // } else {
        
      //}
      
      if(href.indexOf("#") === 0) {
        // do nothing with fragment yet
      } else {
        link.onclick = function(){
          renderer.display(href);
          return false;
        };
      }

    }
  };

  for (var i = 0; i < links.length; i++) {
    replaceLinks(links[i]);
  }

  task.resolve();
  return task.promise;
};

EPUBJS.Renderer.prototype.afterDisplay = function(view, renderer) {
  var task = new RSVP.defer();
  // view.document.documentElement.style.padding = this.settings.padding;
  task.resolve();
  return task.promise;
};

EPUBJS.Renderer.prototype.paginate = function(options) {
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

EPUBJS.Renderer.prototype.bounds = function() {
  return this.container.getBoundingClientRect();
};
//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Renderer.prototype);