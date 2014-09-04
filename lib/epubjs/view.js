EPUBJS.View = function(section) {
  this.id = "epubjs-view:" + EPUBJS.core.uuid();
  this.rendering = new RSVP.defer();
  this.rendered = this.rendering.promise;
  this.iframe = this.create();
  this.section = section;
};

EPUBJS.View.prototype.create = function() {
  this.iframe = document.createElement('iframe');
  this.iframe.id = this.id;
  this.iframe.scrolling = "no";
  this.iframe.seamless = "seamless";
  // Back up if seamless isn't supported
  this.iframe.style.border = "none";

  this.resizing = true;
  this.iframe.style.width = "100%";
  this.iframe.style.height = "100%";

  this.iframe.style.display = "none";
  this.iframe.style.visibility = "hidden";
  return this.iframe;
};

EPUBJS.View.prototype.resized = function(e) {

  if (!this.resizing) {
    this.expand();
  } else {
    this.resizing = false;
  }

};

EPUBJS.View.prototype.render = function(_request) {
    return this.section.render(_request)
      .then(function(contents){
        return this.load(contents);
      }.bind(this))
      .then(this.display.bind(this))
      .then(function(){
        this.rendering.resolve(this);
      }.bind(this));
};

EPUBJS.View.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  this.document = this.iframe.contentDocument;
  
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

EPUBJS.View.prototype.display = function(contents) {
  var displaying = new RSVP.defer();
  var displayed = displaying.promise;
  
  // this.iframe.style.display = "block";
  this.iframe.style.display = "inline-block";


  // Reset Body Styles
  this.document.body.style.margin = "0";
  this.document.body.style.display = "inline-block";  
  this.document.documentElement.style.width = "auto";
  
  setTimeout(function(){
    this.window.addEventListener("resize", this.resized.bind(this), false);
  }.bind(this), 10); // Wait to listen for resize events



  if(!this.document.fonts || this.document.fonts.status !== "loading") {
    this.expand();
    displaying.resolve(this);
  } else {
    this.document.fonts.onloading = function(){
      this.expand();
      displaying.resolve(this);
    }.bind(this);
  }

  // this.observer = this.observe(this.document.body);

  return displayed

};

EPUBJS.View.prototype.expand = function() {
  var bounds;
  var width, height;

  // Check bounds
  bounds = this.document.body.getBoundingClientRect();
  if(!bounds || (bounds.height === 0 && bounds.width === 0)) {
    console.error("View not shown");
  }

  // Apply Changes
  this.resizing = true;

  height = bounds.height; //this.document.documentElement.scrollHeight;
  this.iframe.style.height = height + "px";

  width = this.document.documentElement.scrollWidth;
  this.iframe.style.width = width + "px";


    
  // this.width  = width;
  // this.height = height;

  return bounds;
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

EPUBJS.View.prototype.appendTo = function(element) {
  this.element = element;
  this.element.appendChild(this.iframe);
};

EPUBJS.View.prototype.prependTo = function(element) {
  this.element = element;
  element.insertBefore(this.iframe, element.firstChild);
};

EPUBJS.View.prototype.show = function() {
  // this.iframe.style.display = "block";
  this.iframe.style.display = "inline-block";
  this.iframe.style.visibility = "visible"; 
};

EPUBJS.View.prototype.hide = function() {
  this.iframe.style.display = "none";
  this.iframe.style.visibility = "hidden"; 
};

EPUBJS.View.prototype.bounds = function() {
  return this.iframe.getBoundingClientRect();
};

EPUBJS.View.prototype.destroy = function() {
  // Stop observing
  // this.observer.disconnect();

  this.element.removeChild(this.iframe);
};

