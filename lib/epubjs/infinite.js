EPUBJS.Infinite = function(container, renderer){
  this.container = container;
  this.windowHeight = window.innerHeight;
  this.tick = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  this.scrolled = false;
  this.ignore = false;
  this.displaying = false;
  this.offset = 350;
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

    var scrollTop = this.container.scrollTop;
    var scrollLeft = this.container.scrollLeft;

    var scrollHeight = this.container.scrollHeight;
    var scrollWidth = this.container.scrollWidth;

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