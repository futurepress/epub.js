EPUBJS.Infinite = function(container, limit){
  this.container = container;
  this.windowHeight = window.innerHeight;
  this.tick = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  this.scrolled = false;
  this.ignore = false;

  this.tolerance = 100;
  this.prevScrollTop = 0;
  this.prevScrollLeft = 0;

  if(container) {
    this.start();
  }

  // TODO: add rate limit if performance suffers

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

  if(this.scrolled && !this.ignore) {
    scrollTop = this.container.scrollTop;
    scrollLeft = this.container.scrollLeft;

    this.trigger("scroll", {
      top: scrollTop,
      left: scrollLeft
    });

    // For snap scrolling
    if(scrollTop - this.prevScrollTop > this.tolerance) {
      this.forwards();
    }

    if(scrollTop - this.prevScrollTop < -this.tolerance) {
      this.backwards();
    }

    if(scrollLeft - this.prevScrollLeft > this.tolerance) {
      this.forwards();
    }

    if(scrollLeft - this.prevScrollLeft < -this.tolerance) {
      this.backwards();
    }

    this.prevScrollTop = scrollTop;
    this.prevScrollLeft = scrollLeft;

    this.scrolled = false;
  } else {
    this.ignore = false;
    this.scrolled = false;
  }

  this.tick.call(window, this.check.bind(this));
  // setTimeout(this.check.bind(this), 100);
};


EPUBJS.Infinite.prototype.scrollBy = function(x, y, silent){
  if(silent) {
    this.ignore = true;
  }
  this.container.scrollLeft += x;
  this.container.scrollTop += y;

  this.scrolled = true;
  this.check();
};

EPUBJS.Infinite.prototype.scrollTo = function(x, y, silent){
  if(silent) {
    this.ignore = true;
  }
  this.container.scrollLeft = x;
  this.container.scrollTop = y;
  
  this.scrolled = true;

  // if(this.container.scrollLeft != x){
  //   setTimeout(function() {
  //     this.scrollTo(x, y, silent);
  //   }.bind(this), 10);
  //   return;
  // };
  
  this.check();
};

RSVP.EventTarget.mixin(EPUBJS.Infinite.prototype);