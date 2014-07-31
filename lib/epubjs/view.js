EPUBJS.View = function(options) {
  this.id = "epubjs-view:" + EPUBJS.core.uuid();
  this.loading = new RSVP.defer();
  this.loaded = this.loading.promise;
  this.iframe = this.create();
  this.height;
  this.width;
};

// EPUBJS.View.prototype.load = function(section) {
//   var contents = section.render();
//   var loading = new RSVP.defer();
//   var loaded = loading.promise;

//   this.section = section;

//   contents.then(function(contents) {
//     //TODO: Add a more generic set contents
//     this.iframe.srcdoc = contents;
//     this.layout();

//     loading.resolve(this);
//   }.bind(this));

//   return loaded;
// };

EPUBJS.View.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;
  
  this.document = this.iframe.contentDocument;

  // this.iframe.srcdoc = contents;
  this.document.open();
  this.document.write(contents);
  this.document.close();

  this.iframe.onload = function(e) {
    this.iframe.style.display = "block";
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
  this.iframe.height = "100%";
  // this.iframe.addEventListener("load", this.loaded.bind(this), false);
  this.iframe.style.display = "none";
  this.iframe.style.visibility = "hidden";

  return this.iframe;
};

EPUBJS.View.prototype.layout = function() {
  this.height = this.document.documentElement.getBoundingClientRect().height;
  this.width = this.document.documentElement.getBoundingClientRect().width;
  this.iframe.style.height = this.height + "px";
};

EPUBJS.View.prototype.appendTo = function(element) {
  element.appendChild(this.iframe);
};

EPUBJS.View.prototype.prependTo = function(element) {
  element.insertBefore(this.iframe, element.firstChild);
};

EPUBJS.View.prototype.destroy = function() {

};