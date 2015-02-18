EPUBJS.View = function(section) {
  this.id = "epubjs-view:" + EPUBJS.core.uuid();
  this.displaying = new RSVP.defer();
  this.displayed = this.displaying.promise;
  this.section = section;
  this.index = section.index;

  this.element = document.createElement('div');
  this.element.classList.add("epub-view");
  this.element.style.display = "inline-block";
  // this.element.style.minHeight = "100px";
  this.element.style.height = 0;
  this.element.style.width = 0;
  this.element.style.overflow = "hidden";
  
  
  this.shown = false;
  this.rendered = false;

  this.observe = false;
};

EPUBJS.View.prototype.create = function(width, height) {

  if(this.iframe) {
    return this.iframe;
  }

  this.iframe = document.createElement('iframe');
  this.iframe.id = this.id;
  this.iframe.scrolling = "no";
  this.iframe.seamless = "seamless";
  // Back up if seamless isn't supported
  this.iframe.style.border = "none";

  this.resizing = true;

  if(width || height){
    this.resize(width, height);
  }

  // this.iframe.style.display = "none";
  // this.iframe.style.visibility = "hidden";
  
  this.element.appendChild(this.iframe);
  this.rendered = true;

  return this.iframe;
};

// TODO: minimize resizes
EPUBJS.View.prototype.resize = function(width, height) {

  if(width){
    if(this.iframe) {
      this.iframe.style.width = width + "px";
    }
    if(this.shown) {
      this.element.style.width = height + "px";
    }
  }

  if(height){
    if(this.iframe) {
      this.iframe.style.height = height + "px";
    }
    if(this.shown) {
      this.element.style.height = height + "px";
    }
  }

  if (!this.resizing) {
    this.resizing = true;
    if(this.iframe) {
      this.expand();
    }
  } 

};

EPUBJS.View.prototype.resized = function(e) {

  if (!this.resizing) {
    if(this.iframe) {
      // this.expand();
    }
  } else {
    this.resizing = false;
  }

};

EPUBJS.View.prototype.display = function(_request) {
  this.shown = true;

  return this.section.render(_request)
    .then(function(contents){
      return this.load(contents);
    }.bind(this))
    .then(this.afterLoad.bind(this))
    .then(this.displaying.resolve.call(this));
};

EPUBJS.View.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  this.document = this.iframe.contentDocument;
  
  if(!this.document) {
    loading.reject(new Error("No Document Available"));
    return loaded;
  }

  this.iframe.addEventListener("load", function(event) {
    
    this.window = this.iframe.contentWindow;
    this.document = this.iframe.contentDocument;

    loading.resolve(this);
    
  }.bind(this));
  
  
  // this.iframe.srcdoc = contents;
  this.document.open();
  this.document.write(contents);
  this.document.close();

  return loaded;
};


EPUBJS.View.prototype.afterLoad = function() {

  // this.iframe.style.display = "block";
  this.iframe.style.display = "inline-block";


  // Reset Body Styles
  this.document.body.style.margin = "0";
  this.document.body.style.display = "inline-block";
  this.document.documentElement.style.width = "auto";

  setTimeout(function(){
    this.window.addEventListener("resize", this.resized.bind(this), false);
  }.bind(this), 10); // Wait to listen for resize events


  // Wait for fonts to load to finish
  if(this.document.fonts.status === "loading") {
    this.document.fonts.onloading = function(){
      this.expand();
    }.bind(this);
  }

  if(this.observe) {
    this.observer = this.observe(this.document.body);
  }

};

EPUBJS.View.prototype.expand = function(_defer, _count, _func) {
  var bounds;
  var width, height;
  var expanding = _defer || new RSVP.defer();
  var expanded = expanding.promise;
  // var fontsLoading = false;
  // Stop checking for equal height after 10 tries
  var MAX = 10;
  var count = _count || 1;
  var TIMEOUT = 10 * _count;

  // Flag Changes
  this.resizing = true;

  // Check bounds
  bounds = this.document.body.getBoundingClientRect();
  if(!bounds || (bounds.height === 0 && bounds.width === 0)) {
    console.error("View not shown");
    
    // setTimeout(function(){
    //   this.expand(expanding, count);
    // }.bind(this), TIMEOUT);
    
    return expanded;
  }

  height = bounds.height; //this.document.documentElement.scrollHeight; //window.getComputedStyle?

  width = this.document.documentElement.scrollWidth;
  console.log("expand", count, this.index, height, width)

  if(count <= MAX && (this.width != width || this.height != height)) {
    setTimeout(function(){
      count += 1;
      if(_func){
        _func(this);
      }
      this.expand(expanding, count, _func);
    }.bind(this), TIMEOUT);

  } else {
    expanding.resolve();
  }

  this.width  = width;
  this.height = height;
  
  // this.iframe.style.height = height + "px";
  // this.iframe.style.width = width + "px";
  this.resize(width, height);

  return expanded;
};

EPUBJS.View.prototype.observe = function(target) {
  var renderer = this;

  // create an observer instance
  var observer = new MutationObserver(function(mutations) {
    renderer.expand();
    // mutations.forEach(function(mutation) {
      // console.log(mutation)
    // });    
  });

  // configuration of the observer:
  var config = { attributes: true, childList: true, characterData: true, subtree: true };

  // pass in the target node, as well as the observer options
  observer.observe(target, config);

  return observer;
};

// EPUBJS.View.prototype.appendTo = function(element) {
//   this.element = element;
//   this.element.appendChild(this.iframe);
// };
// 
// EPUBJS.View.prototype.prependTo = function(element) {
//   this.element = element;
//   element.insertBefore(this.iframe, element.firstChild);
// };

EPUBJS.View.prototype.show = function() {
  // this.iframe.style.display = "block";
  
  this.style = window.getComputedStyle(this.element);
  this.paddingTopBottom = parseInt(this.style.paddingTop) +  parseInt(this.style.paddingBottom) || 0;
  this.paddingLeftRight = parseInt(this.style.paddingLeft) +  parseInt(this.style.paddingRight) || 0;
  this.marginTopBottom = parseInt(this.style.marginTop) +  parseInt(this.style.marginBottom) || 0;
  this.marginLeftRight = parseInt(this.style.marginLeft) +  parseInt(this.style.marginRight) || 0;
  this.borderTopBottom = parseInt(this.style.borderTop) + parseInt(this.style.borderBottom) || 0;
  this.borderLeftRight = parseInt(this.style.borderLeft) + parseInt(this.style.borderRight) || 0;
  
  this.element.style.width = this.width + "px";
  this.element.style.height = this.height + "px";

  // this.iframe.style.display = "inline-block";
  // this.iframe.style.visibility = "visible";
  
  this.onShown(this);
  this.trigger("shown", this);

  this.shown = true;

};

EPUBJS.View.prototype.hide = function() {
  // this.iframe.style.display = "none";
  // this.iframe.style.visibility = "hidden";
  this.trigger("hidden");
};

EPUBJS.View.prototype.position = function() {
  return this.element.getBoundingClientRect();
};

EPUBJS.View.prototype.onShown = function(view) {
  // Stub, override with a custom functions
};

EPUBJS.View.prototype.bounds = function() {
  // var bounds = this.element.getBoundingClientRect();
  // var bounds = {
  //   width: this.element.offsetWidth,
  //   height: this.element.offsetHeight
  // };
  return {
    height: this.height + this.paddingTopBottom + this.marginTopBottom + this.borderTopBottom,
    width: this.width + this.paddingLeftRight + this.marginLeftRight + this.borderLeftRight
  }
};

EPUBJS.View.prototype.destroy = function() {
  // Stop observing
  // this.observer.disconnect();

  if(this.iframe){
    this.element.removeChild(this.iframe);
    this.shown = false;
    this.iframe = null;
  }
  // this.element.style.height = 0;
  // this.element.style.width = 0;
};

RSVP.EventTarget.mixin(EPUBJS.View.prototype);