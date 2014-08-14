EPUBJS.View = function(width, height) {
  this.id = "epubjs-view:" + EPUBJS.core.uuid();
  this.loading = new RSVP.defer();
  this.loaded = this.loading.promise;
  this.iframe = this.create();
  this.height;
  this.width;
};

EPUBJS.View.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  this.document = this.iframe.contentDocument;
  
  this.iframe.addEventListener("load", function(event) {
    var layout;
    
    this.window = this.iframe.contentWindow;
    this.document = this.iframe.contentDocument;
  
    this.iframe.style.display = "block";

    // Reset Body Styles
    this.document.body.style.margin = "0";
    this.document.body.style.display = "inline-block";    

    this.layout();

    this.iframe.style.visibility = "visible";

    setTimeout(function(){
      this.window.addEventListener("resize", this.resized.bind(this), false);
    }.bind(this), 10); // Wait to listen for resize events

    this.document.fonts.onloading = function(){
      console.log("loaded fonts");
      // this.layout();
    }.bind(this);

    // this.observer = this.observe(this.document);

    loading.resolve(this);
    this.loading.resolve(this);
    
  }.bind(this));
  
  
  // this.iframe.srcdoc = contents;
  this.document.open();
  this.document.write(contents);
  this.document.close();

  return loaded;
};

EPUBJS.View.prototype.create = function() {
  this.iframe = document.createElement('iframe');
  this.iframe.id = this.id;
  this.iframe.scrolling = "no";
  this.iframe.seamless = "seamless";
  // Back up if seamless isn't supported
  this.iframe.style.border = "none";

  this.resizing = true;
  this.iframe.width = "100%";
  this.iframe.style.height = "100%";

  this.iframe.style.display = "none";
  this.iframe.style.visibility = "hidden";


  return this.iframe;
};

EPUBJS.View.prototype.resized = function(e) {

  if (!this.resizing) {
    this.layout();
  } else {
    this.resizing = false;
  }

};

EPUBJS.View.prototype.layout = function() {
  var bounds;
  console.log("layout")
  // Check bounds
  bounds = this.document.body.getBoundingClientRect();

  if(!bounds || (bounds.height == 0 && bounds.width == 0)) {
    console.error("View not shown");
  }

  // Apply Changes
  this.resizing = true;
  this.iframe.style.height = bounds.height + "px";
  // this.iframe.style.width = bounds.width + "px";

  // Check again
  bounds = this.document.body.getBoundingClientRect();
  this.resizing = true;
  this.iframe.style.height = bounds.height + "px";
  // this.iframe.style.width = bounds.width + "px";

  this.width = bounds.width;
  this.height = bounds.height;

};

EPUBJS.View.prototype.observe = function(target) {
  var renderer = this;

  // create an observer instance
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      renderer.layout();
    });    
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

EPUBJS.View.prototype.bounds = function() {
  return this.iframe.getBoundingClientRect();
};

EPUBJS.View.prototype.destroy = function() {
  // Stop observing
  // this.observer.disconnect();
  
  this.element.removeChild(this.iframe);
};

