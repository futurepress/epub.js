EPUBJS.Renderer.prototype.listeners = function(){
  // Dom events to listen for
  this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click"];
  this.upEvent = "mouseup";
  this.downEvent = "mousedown";
  if('ontouchstart' in document.documentElement) {
    this.listenedEvents.push("touchstart", "touchend");
    this.upEvent = "touchend";
    this.downEvent = "touchstart";
  }

  // Resize events
  // this.resized = _.debounce(this.onResized.bind(this), 100);

};

//-- Listeners for events in the frame

EPUBJS.Renderer.prototype.onResized = function(e) {
  var width = this.container.clientWidth;
  var height = this.container.clientHeight;

  this.resize(width, height, false);
};

EPUBJS.Renderer.prototype.addEventListeners = function(){
  if(!this.render.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.render.document.addEventListener(eventName, this.triggerEvent.bind(this), false);
  }, this);

};

EPUBJS.Renderer.prototype.removeEventListeners = function(){
  if(!this.render.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.render.document.removeEventListener(eventName, this.triggerEvent, false);
  }, this);

};

// Pass browser events
EPUBJS.Renderer.prototype.triggerEvent = function(e){
  this.trigger("renderer:"+e.type, e);
};

EPUBJS.Renderer.prototype.addSelectionListeners = function(){
  this.render.document.addEventListener("selectionchange", this.onSelectionChange.bind(this), false);
};

EPUBJS.Renderer.prototype.removeSelectionListeners = function(){
  if(!this.render.document) {
    return;
  }
  this.doc.removeEventListener("selectionchange", this.onSelectionChange, false);
};

EPUBJS.Renderer.prototype.onSelectionChange = function(e){
  if (this.selectionEndTimeout) {
    clearTimeout(this.selectionEndTimeout);
  }
  this.selectionEndTimeout = setTimeout(function() {
    this.selectedRange = this.render.window.getSelection();
    this.trigger("renderer:selected", this.selectedRange);
  }.bind(this), 500);
};