EPUBJS.Infinite = function(container, renderer){
  this.container = container;
  this.windowHeight = window.innerHeight;
  this.tick = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  this.scrolled = false;
  this.ignore = false;
  this.displaying = false;
  this.offset = 250;
  this.views = [];
  this.renderer = renderer;
  this.prevScrollTop = 0;
};

EPUBJS.Infinite.prototype.start = function() {
  
  var firstScroll = true;

  this.container.addEventListener("scroll", function(e){
    if(!this.ignore) {
      this.scrolled = true;
    } else {
      this.ignore = false;
    }
    // console.log("scroll", this.container.scrollTop)
  }.bind(this));
  
  // Reset to prevent jump
  window.addEventListener('unload', function(e){
    this.ignore = true;
    // window.scroll(0,0);
  });

  this.tick.call(window, this.check.bind(this));

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

    var scrollTop = this.container.scrollTop;
    var scrollLeft = this.container.scrollLeft;

    var scrollHeight = this.container.scrollHeight;
    var scrollWidth = this.container.scrollWidth;

    var direction = scrollTop - this.prevScrollTop;
    var height = this.container.getBoundingClientRect().height;

    var up = scrollTop + this.offset > scrollHeight-height;
    var down = scrollTop < this.offset;
    // console.debug("scroll", scrollTop)
    if(up && direction > 0) {
      this.forwards();
    }
    else if(down && direction < 0) {
      this.backwards();
    }

    // console.log(scrollTop)
    this.prevScrollTop = scrollTop;

    this.scrolled = false;
  } else {
    this.displaying = false;
    this.scrolled = false;
  }

  this.tick.call(window, this.check.bind(this));
}

EPUBJS.Infinite.prototype.scrollBy = function(x, y, silent){
  if(silent) {
    this.displaying = true;
  }
  this.container.scrollLeft += x;
  this.container.scrollTop += y;
};

EPUBJS.Infinite.prototype.scroll = function(x, y, silent){
  if(silent) {
    this.displaying = true;
  }
  this.container.scrollLeft = x;
  this.container.scrollTop = y;
};

RSVP.EventTarget.mixin(EPUBJS.Infinite.prototype);