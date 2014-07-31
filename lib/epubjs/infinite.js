EPUBJS.Infinite = function(container, renderer){
  this.container = container;
  this.windowHeight = window.innerHeight;
  this.tick = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  this.scrolled = false;
  this.displaying = false;
  this.offset = 250;
  this.views = [];
  this.renderer = renderer;
};

EPUBJS.Infinite.prototype.start = function(first_argument) {
 
  window.addEventListener("scroll", function(){
    this.scrolled = true;
  }.bind(this));

  this.tick.call(window, this.check.bind(this));

  // Fill Screen
  this.scrolled = false;
  
};

EPUBJS.Infinite.prototype.forwards = function() {
  this.trigger("forwards");

};

EPUBJS.Infinite.prototype.backwards = function() {
  this.trigger("backwards");

};

/*

// Manage Views
EPUBJS.Infinite.prototype.jump = function(view){
  this.views.push(view);
};

EPUBJS.Infinite.prototype.append = function(view){
  this.views.push(view);
  view.appendTo(this.container);
};

EPUBJS.Infinite.prototype.prepend = function(view){
  this.views.unshift(view);
  view.prependTo(this.container);
};

// Simple Insert
EPUBJS.Infinite.prototype.insert = function(view, index){

  var position;
  var distanceFront = index - this.positions[0];
  var distanceRear = index - this.positions[this.positions.length-1];

  if(distanceFront >= 0 || !this.positions.length) {
    position = this.append(view);
    this.positions.push(index);
  } else if(distanceRear <= 0) {
    position = this.prepend(view);
    this.positions.unshift(index);
  }

  

  return position;
};

*/

EPUBJS.Infinite.prototype.check = function(){

  if(this.scrolled && !this.displaying) {

    var scrollTop = document.body.scrollTop;//TODO: make document.body a variable
    var scrollHeight = document.body.scrollHeight;
    // console.log(scrollTop, this.windowHeight - (scrollHeight - scrollTop) )
    if(this.windowHeight - (scrollHeight - scrollTop) > -this.offset) {
      this.forwards();
    }
    else if(scrollTop < this.offset) {
      this.backwards();
    }

    // console.log(document.body.scrollTop)


    this.scrolled = false;
  }

  this.tick.call(window, this.check.bind(this));
}

RSVP.EventTarget.mixin(EPUBJS.Infinite.prototype);