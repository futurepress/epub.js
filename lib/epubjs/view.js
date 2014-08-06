EPUBJS.View = function(options) {
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

  // this.iframe.srcdoc = contents;
  this.document.open();
  this.document.write(contents);
  this.document.close();

  this.iframe.onload = function(e) {
    this.window = this.iframe.contentWindow;
    this.window.addEventListener("resize", this.resized.bind(this), false);
    this.document = this.iframe.contentDocument;

    this.iframe.style.display = "block";

    // Reset Body Styles
    this.document.body.style.margin = "0";
    this.document.body.style.display = "inline-block";    

    this.layout();

    this.iframe.style.visibility = "visible";

    loading.resolve(this);
    this.loading.resolve(this);
  }.bind(this);

  return loaded;
};


EPUBJS.View.prototype.unload = function() {

};

EPUBJS.View.prototype.create = function() {
  this.iframe = document.createElement('iframe');
  this.iframe.id = this.id;
  this.iframe.scrolling = "no";
  this.iframe.seamless = "seamless";
  // Back up if seamless isn't supported
  this.iframe.style.border = "none";
  this.iframe.width = "100%";
  this.iframe.style.height = "0";

  this.iframe.style.display = "none";
  this.iframe.style.visibility = "hidden";

  return this.iframe;
};

EPUBJS.View.prototype.resized = function() {

  if (!this.resizing) {
    this.layout();
  } else {
    this.resizing = false;
  }

};

EPUBJS.View.prototype.layout = function() {
  var bounds = {}, content, width = 0, height = 0;

  // This needs to run twice to get to the correct size
  while(bounds.height != height || bounds.width != width) {
      this.resizing = true;

      // Check bounds
      bounds = this.document.body.getBoundingClientRect();

      // Apply Changes
      this.iframe.style.height = bounds.height + "px";
      this.iframe.style.width = bounds.width + "px";

      // Check again
      content = this.document.body.getBoundingClientRect();

      height = content.height;
      width = content.width;

      this.width = width;
      this.height = height;
  }
  

};

EPUBJS.View.prototype.appendTo = function(element) {
  element.appendChild(this.iframe);
};

EPUBJS.View.prototype.prependTo = function(element) {
  element.insertBefore(this.iframe, element.firstChild);
};

EPUBJS.View.prototype.bounds = function() {
  return this.iframe.getBoundingClientRect();
};

EPUBJS.View.prototype.destroy = function() {

};

