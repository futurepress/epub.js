EPUBJS.Infinite = function(container, axis){
  this.container = container;
  this.windowHeight = window.innerHeight;
  this.tick = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  this.scrolled = false;
  this.ignore = false;
  this.displaying = false;
  this.offset = 900;
  this.views = [];
  this.axis = axis;
  // this.renderer = renderer;
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


EPUBJS.Infinite.prototype.check = function(){

  if(this.scrolled && !this.displaying) {

    if(this.axis === "vertical") {
      this.checkTop();
    } else {
      this.checkLeft();
    }
    
    this.scrolled = false;
  } else {
    this.displaying = false;
    this.scrolled = false;
  }

  this.tick.call(window, this.check.bind(this));
}

EPUBJS.Infinite.prototype.checkTop = function(){
    
    var scrollTop = this.container.scrollTop;
    var scrollHeight = this.container.scrollHeight;
    var direction = scrollTop - this.prevScrollTop;
    var height = this.container.getBoundingClientRect().height;

    var up = scrollTop + this.offset > scrollHeight-height;
    var down = scrollTop < this.offset;

    // Add to bottom
    if(up && direction > 0) {
      this.forwards();
    }
    // Add to top
    else if(down && direction < 0) {
      this.backwards();
    }

    // console.log(scrollTop)
    this.prevScrollTop = scrollTop;

    return scrollTop;
};

EPUBJS.Infinite.prototype.checkLeft = function(){
    
    var scrollLeft = this.container.scrollLeft;

    var scrollWidth = this.container.scrollWidth;

    var direction = scrollLeft - this.prevscrollLeft;

    var width = this.container.getBoundingClientRect().width;

    var right = scrollLeft + this.offset > scrollWidth-width;
    var left = scrollLeft < this.offset;

    // Add to bottom
    if(right && direction > 0) {
      this.forwards();
    }
    // Add to top
    else if(left && direction < 0) {
      this.backwards();
    }

    // console.log(scrollTop)
    this.prevscrollLeft = scrollLeft;

    return scrollLeft;
};

EPUBJS.Infinite.prototype.scrollBy = function(x, y, silent){
  if(silent) {
    this.displaying = true;
  }
  this.container.scrollLeft += x;
  this.container.scrollTop += y;
  
  this.scrolled = true;
  this.check();
};

EPUBJS.Infinite.prototype.scroll = function(x, y, silent){
  if(silent) {
    this.displaying = true;
  }
  this.container.scrollLeft = x;
  this.container.scrollTop = y;

  this.scrolled = true;
  this.check();
};

RSVP.EventTarget.mixin(EPUBJS.Infinite.prototype);