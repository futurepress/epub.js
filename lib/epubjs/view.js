EPUBJS.View = function(section, horz) {
  this.id = "epubjs-view:" + EPUBJS.core.uuid();
  this.displaying = new RSVP.defer();
  this.displayed = this.displaying.promise;
  this.section = section;
  this.index = section.index;

  this.element = document.createElement('div');
  this.element.classList.add("epub-view");
  this.element.style.display = "inline-block";

  // this.element.style.minHeight = "100px";
  this.element.style.height = "0px";
  this.element.style.width = "0px";
  this.element.style.overflow = "hidden";

  this.shown = false;
  this.rendered = false;
  
  this.width  = 0;
  this.height = 0;
  
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

  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";
  
  this.element.appendChild(this.iframe);
  this.rendered = true;
  

  // if(width || height){
  //   this.resize(width, height);
  // } else if(this.width && this.height){
  //   this.resize(this.width, this.height);
  // } else {
  //   this.iframeBounds = EPUBJS.core.bounds(this.iframe);
  // }
  
  if(!!("srcdoc" in this.iframe)) {
    this.supportsSrcdoc = true;
  } else {
    this.supportsSrcdoc = false;
  }

  return this.iframe;
};


EPUBJS.View.prototype.lock = function(width, height) {
  
  var borders = EPUBJS.core.borders(this.element);

  if(EPUBJS.core.isNumber(width)){
    this.lockedWidth = width - borders.width;
  }

  if(EPUBJS.core.isNumber(height)){
    this.lockedHeight = height - borders.height;
  }

  if(this.shown) {
    this.resize(this.lockedWidth, this.lockedHeight);

    if (this.iframe && !this.resizing) {
      //this.expand();
    }

  }

  

};

EPUBJS.View.prototype.resize = function(width, height) {

  if(!this.shown) return;

  if(EPUBJS.core.isNumber(width)){
    this.element.style.width = width + "px";
  }

  if(EPUBJS.core.isNumber(height)){
    this.element.style.height = height + "px";
  }

  this.elementBounds = EPUBJS.core.bounds(this.element);

};

EPUBJS.View.prototype.reframe = function(width, height) {
  
  if(!this.iframe) return;

  if(EPUBJS.core.isNumber(width)){
    this.iframe.style.width = width + "px";
  }

  if(EPUBJS.core.isNumber(height)){
    this.iframe.style.height = height + "px";
  }

  this.iframeBounds = EPUBJS.core.bounds(this.iframe);
  this.resize(this.iframeBounds.width, this.iframeBounds.height);

};

EPUBJS.View.prototype.resized = function(e) {
  /*
  if (!this.resizing) {
    if(this.iframe) {
      // this.expand();
    }
  } else {
    this.resizing = false;
  }*/

};

EPUBJS.View.prototype.display = function(_request) {
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
  
  if(this.supportsSrcdoc){
    this.iframe.srcdoc = contents;
  } else {
    this.document.open();
    this.document.write(contents);
    this.document.close();
  }


  return loaded;
};


EPUBJS.View.prototype.afterLoad = function() {

  // this.iframe.style.display = "block";
  this.iframe.style.display = "block";


  // Reset Body Styles
  this.document.body.style.margin = "0";
  this.document.body.style.display = "inline-block";
  this.document.documentElement.style.width = "auto";

  setTimeout(function(){
    this.window.addEventListener("resize", this.resized.bind(this), false);
  }.bind(this), 10); // Wait to listen for resize events


  // Wait for fonts to load to finish
  if(this.document.fonts && this.document.fonts.status === "loading") {
    this.document.fonts.onloading = function(){
      this.expand();
    }.bind(this);
  }

  if(this.section.properties.indexOf("scripted") > -1){
    this.observer = this.observe(this.document.body);
  }

  this.imageLoadListeners();
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
  
  height = this.lockedHeight || bounds.height; //this.document.documentElement.scrollHeight; //window.getComputedStyle?

  width = this.lockedWidth || this.document.documentElement.scrollWidth;
  
  
  if(count <= MAX && (this.width != width || this.height != height) && !this.stopExpanding) {

    this.reframe(width, height);
    
    this.expandTimeout = setTimeout(function(){
      count += 1;
      if(_func){
        _func(this);
      }
      this.expand(expanding, count, _func);
    }.bind(this), TIMEOUT);

  } else {
    this.resizing = false;
    if(this.stopExpanding){
      this.stopExpanding = null;
    }
    expanding.resolve();
  }

  this.width  = width;
  this.height = height;
  
  return expanded;
};

EPUBJS.View.prototype.observe = function(target) {
  var renderer = this;

  // create an observer instance
  var observer = new MutationObserver(function(mutations) {
    renderer.expand();
    // mutations.forEach(function(mutation) {
    //   console.log(mutation);
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

EPUBJS.View.prototype.imageLoadListeners = function(target) {
  var images = this.document.body.querySelectorAll("img");
  var img;
  for (var i = 0; i < images.length; i++) {
    img = images[i];

    if (typeof img.naturalWidth !== "undefined" &&
        img.naturalWidth === 0) {
      img.onload = this.expand.bind(this);
    }
  }
};

EPUBJS.View.prototype.show = function() {

  this.shown = true;

  // Reframe, incase the iframe was recreated
  // Also resizes element.
  this.reframe(this.width, this.height)

  // this.iframe.style.display = "inline-block";
  this.element.style.visibility = "visible";
  this.iframe.style.visibility = "visible";

  this.onShown(this);
  this.trigger("shown", this);
};

EPUBJS.View.prototype.hide = function() {
  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";

  this.stopExpanding = true;
  this.trigger("hidden");
};

EPUBJS.View.prototype.position = function() {
  return this.element.getBoundingClientRect();
};

EPUBJS.View.prototype.onShown = function(view) {
  // Stub, override with a custom functions
};

EPUBJS.View.prototype.bounds = function() {  
  if(!this.elementBounds) {
    this.elementBounds = EPUBJS.core.bounds(this.element);
  }
  return this.elementBounds;
};

EPUBJS.View.prototype.destroy = function() {
  // Stop observing
  if(this.observer) {
    this.observer.disconnect();
  }

  if(this.iframe){
    this.stopExpanding = true;
    this.element.removeChild(this.iframe);
    this.shown = false;
    this.iframe = null;
  }

  // this.element.style.height = "0px";
  // this.element.style.width = "0px";
};

RSVP.EventTarget.mixin(EPUBJS.View.prototype);