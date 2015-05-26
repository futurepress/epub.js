EPUBJS.Continuous = function(book, options) {
	
	EPUBJS.Rendition.apply(this, arguments); // call super constructor.

	this.settings = EPUBJS.core.extend(this.settings || {}, {
		infinite: true,
		hidden: false,
		width: false,
		height: false,
		overflow: "auto",
		axis: "vertical",
		offset: 500,
		offsetDelta: 100
	});
	
	EPUBJS.core.extend(this.settings, options);
	
	if(this.settings.hidden) {
		this.wrapper = this.wrap(this.container);
	}
		
	
};

// subclass extends superclass
EPUBJS.Continuous.prototype = Object.create(EPUBJS.Rendition.prototype);
EPUBJS.Continuous.prototype.constructor = EPUBJS.Continuous;

EPUBJS.Continuous.prototype.attachListeners = function(){

	// Listen to window for resize event if width or height is set to a percent
	if(!EPUBJS.core.isNumber(this.settings.width) || 
		 !EPUBJS.core.isNumber(this.settings.height) ) {
		window.addEventListener("resize", this.onResized.bind(this), false);
	}


	if(this.settings.infinite) {
		this.start();
	}


};

EPUBJS.Continuous.prototype.display = function(what){
	
	return this.q.enqueue(function(what){
		
		var displaying = new RSVP.defer();
		var displayed = displaying.promise;
	
		var section = this.book.spine.get(what);
		var view;
	
		this.displaying = true;
	
		if(section){
			view = new EPUBJS.View(section, this.viewSettings);
			
			// This will clear all previous views
			this.q.enqueue(this.fill, view);

			//this.q.enqueue(function(){
				// Move to correct place within the section, if needed
				// return this.moveTo(what)
			//});
			
			this.q.enqueue(this.check);
			
      this.hooks.display.trigger(view);
      
			// view.displayed.then(function(){
			// 	this.trigger("displayed", section);
			// 	this.displaying = false;
			// displaying.resolve(this);
			//}.bind(this));
			displaying.resolve(this);
	
		} else {
			displaying.reject(new Error("No Section Found"));
		}
	
		return displayed;
	}, what);

};


// Takes a cfi, fragment or page?
EPUBJS.Continuous.prototype.moveTo = function(what){
	
};

EPUBJS.Continuous.prototype.afterDisplayed = function(currView){
	var next = currView.section.next();
	var prev = currView.section.prev();
	var index = this.views.indexOf(currView);

	var prevView, nextView;

	if(index + 1 === this.views.length && next) {
		nextView = new EPUBJS.View(next, this.viewSettings);
		this.q.enqueue(this.append, nextView);
	}

	if(index === 0 && prev) {
		prevView = new EPUBJS.View(prev, this.viewSettings);
		this.q.enqueue(this.prepend, prevView);
	}

	// this.removeShownListeners(currView);
	currView.onShown = this.afterDisplayed.bind(this);

	this.trigger("displayed", currView.section);

};


// Remove Previous Listeners if present
EPUBJS.Continuous.prototype.removeShownListeners = function(view){

	// view.off("shown", this.afterDisplayed);
	// view.off("shown", this.afterDisplayedAbove);
	view.onShown = function(){};

};

EPUBJS.Continuous.prototype.append = function(view){
	this.views.push(view);
	this.container.appendChild(view.element);


	// view.on("shown", this.afterDisplayed.bind(this));
	view.onShown = this.afterDisplayed.bind(this);

	return this.check();
};

EPUBJS.Continuous.prototype.prepend = function(view){
	this.views.unshift(view);
	this.container.insertBefore(view.element, this.container.firstChild);
	
	// view.on("shown", this.afterDisplayedAbove.bind(this));
	view.onShown = this.afterDisplayed.bind(this);

	//might need to enqueue
	view.on("resized", this.counter.bind(this));

	return this.check();
};

EPUBJS.Continuous.prototype.counter = function(bounds){

	if(this.settings.axis === "vertical") {
		this.scrollBy(0, bounds.heightDelta, true);
	} else {
		this.scrollBy(bounds.widthDelta, 0, true);
	}
};

EPUBJS.Continuous.prototype.fill = function(view){

	if(this.views.length){
		this.clear();
	}

	this.views.push(view);

	this.container.appendChild(view.element);

	// view.on("shown", this.afterDisplayed.bind(this));
	view.onShown = this.afterDisplayed.bind(this);

	return this.render(view);
};

EPUBJS.Continuous.prototype.insert = function(view, index) {
	this.views.splice(index, 0, view);

	if(index < this.cotainer.children.length){
		this.container.insertBefore(view.element, this.container.children[index]);
	} else {
		this.container.appendChild(view.element);
	}

	return this.check();
};

// Remove the render element and clean up listeners
EPUBJS.Continuous.prototype.remove = function(view) {
	var index = this.views.indexOf(view);
	if(index > -1) {
		this.views.splice(index, 1);
	}

	this.container.removeChild(view.element);
	
	view.off("resized");

	if(view.shown){
		view.destroy();
	}
	
	view = null;
	
};

EPUBJS.Continuous.prototype.clear = function(){
	this.views.forEach(function(view){
		view.destroy();
	});

	this.views = [];
};

EPUBJS.Continuous.prototype.first = function() {
	return this.views[0];
};

EPUBJS.Continuous.prototype.last = function() {
	return this.views[this.views.length-1];
};

EPUBJS.Continuous.prototype.each = function(func) {
	return this.views.forEach(func);
};


EPUBJS.Continuous.prototype.check = function(){
	var checking = new RSVP.defer();
	var container;//this.container.getBoundingClientRect();

	if(!this.settings.height) {
		container = EPUBJS.core.windowBounds();
	} else {
		container = this.container.getBoundingClientRect();
	}

	this.views.forEach(function(view){
		var visible = this.isVisible(view, this.settings.offset, container);
		
		if(visible) {
			
			if(!view.shown && !this.rendering) {
				
				this.q.enqueue(function(){

						return this.render(view)
							.then(function(){
							
								// Check to see if anything new is on screen after rendering
								this.q.enqueue(this.check);

							}.bind(this));
				});
				
			}

		} else {
			
			if(view.shown) {
				view.destroy();
			}

		}

	}.bind(this));
	
	clearTimeout(this.trimTimeout);
	this.trimTimeout = setTimeout(function(){
		this.q.enqueue(this.trim);
	}.bind(this), 250);

	checking.resolve();
	return checking.promise;

};

EPUBJS.Continuous.prototype.trim = function(){
	var task = new RSVP.defer();
	var above = true;

	this.views.forEach(function(view, i){
		// var view = this.views[i];
		var prevShown = i > 0 ? this.views[i-1].shown : false;
		var nextShown = (i+1 < this.views.length) ? this.views[i+1].shown : false;
		if(!view.shown && !prevShown && !nextShown) {
			// Remove
			this.erase(view, above);
		}
		if(nextShown) {
			above = false;
		}
	}.bind(this));

	task.resolve();
	return task.promise;
};

EPUBJS.Continuous.prototype.erase = function(view, above){ //Trim
	
	var prevTop;
	var prevLeft;

	if(this.settings.height) {
  	prevTop = this.container.scrollTop;
		prevLeft = this.container.scrollLeft;
  } else {
  	prevTop = window.scrollY;
		prevLeft = window.scrollX;
  }

	var bounds = view.bounds();

	this.remove(view);
	
	if(above) {

		if(this.settings.axis === "vertical") {
			this.scrollTo(0, prevTop - bounds.height, true);
		} else {
			this.scrollTo(prevLeft - bounds.width, 0, true);
		}
	}
	
};


EPUBJS.Continuous.prototype.checkCurrent = function(position) {
  var view, top;
  var container = this.container.getBoundingClientRect();
  var length = this.views.length - 1;

  if(this.rendering) {
    return;
  }

  if(this.settings.axis === "horizontal") {
    // TODO: Check for current horizontal
  } else {
    
    for (var i = length; i >= 0; i--) {
      view = this.views[i];
      top = view.bounds().top;
      if(top < container.bottom) {
        
        if(this.current == view.section) {
          break;
        }

        this.current = view.section;
        this.trigger("current", this.current);
        break;
      }
    }

  }

};

EPUBJS.Continuous.prototype.start = function() {
  var scroller;

  this.tick = EPUBJS.core.requestAnimationFrame;

  if(this.settings.height) {
  	this.prevScrollTop = this.container.scrollTop;
  	this.prevScrollLeft = this.container.scrollLeft;
  } else {
  	this.prevScrollTop = window.scrollY;
		this.prevScrollLeft = window.scrollX;
  }

  this.scrollDeltaVert = 0;
  this.scrollDeltaHorz = 0;

  if(this.settings.height) {
  	scroller = this.container;
  } else {
  	scroller = window;
  }

  window.addEventListener("scroll", function(e){
    if(!this.ignore) {
      this.scrolled = true;
    } else {
      this.ignore = false;
    }
  }.bind(this));
  
  window.addEventListener('unload', function(e){
    this.ignore = true;
  });

  this.tick.call(window, this.onScroll.bind(this));

  this.scrolled = false;

};

EPUBJS.Continuous.prototype.onScroll = function(){

  if(this.scrolled) {

    if(this.settings.height) {
	  	scrollTop = this.container.scrollTop;
	  	scrollLeft = this.container.scrollLeft;
	  } else {
	  	scrollTop = window.scrollY;
			scrollLeft = window.scrollX;
	  }

    if(!this.ignore) {

	    // this.trigger("scroll", {
	    //   top: scrollTop,
	    //   left: scrollLeft
	    // });

	    if((this.scrollDeltaVert === 0 && 
	    	 this.scrollDeltaHorz === 0) ||
	    	 this.scrollDeltaVert > this.settings.offsetDelta ||
	    	 this.scrollDeltaHorz > this.settings.offsetDelta) {

				this.q.enqueue(this.check);
				
				this.scrollDeltaVert = 0;
	    	this.scrollDeltaHorz = 0;

			}

		} else {
	    this.ignore = false;
		}

    this.scrollDeltaVert += Math.abs(scrollTop-this.prevScrollTop);
    this.scrollDeltaHorz += Math.abs(scrollLeft-this.prevScrollLeft);

		if(this.settings.height) {
			this.prevScrollTop = this.container.scrollTop;
			this.prevScrollLeft = this.container.scrollLeft;
		} else {
			this.prevScrollTop = window.scrollY;
			this.prevScrollLeft = window.scrollX;
		}


  	clearTimeout(this.scrollTimeout);
		this.scrollTimeout = setTimeout(function(){
			this.scrollDeltaVert = 0;
	    this.scrollDeltaHorz = 0;
		}.bind(this), 150);


    this.scrolled = false;
  }

  this.tick.call(window, this.onScroll.bind(this));

};

EPUBJS.Continuous.prototype.scrollBy = function(x, y, silent){
  if(silent) {
    this.ignore = true;
  }

  if(this.settings.height) {
  	this.container.scrollLeft += x;
  	this.container.scrollTop += y;
  } else {
  	window.scrollBy(x,y);
  }

  this.scrolled = true;
};

EPUBJS.Continuous.prototype.scrollTo = function(x, y, silent){
  if(silent) {
    this.ignore = true;
  }

  if(this.settings.height) {
  	this.container.scrollLeft = x;
  	this.container.scrollTop = y;
  } else {
  	window.scrollTo(x,y);
  }
  
  this.scrolled = true;

  // if(this.container.scrollLeft != x){
  //   setTimeout(function() {
  //     this.scrollTo(x, y, silent);
  //   }.bind(this), 10);
  //   return;
  // };
 };

 EPUBJS.Continuous.prototype.resizeView = function(view) {

	if(this.settings.axis === "horizontal") {
		view.lock(null, this.stage.height);
	} else {
		view.lock(this.stage.width, null);
	}

};
/*
EPUBJS.Continuous.prototype.current = function(what){
  var view, top;
  var container = this.container.getBoundingClientRect();
  var length = this.views.length - 1;

  if(this.settings.axis === "horizontal") {
    
    for (var i = length; i >= 0; i--) {
      view = this.views[i];
      left = view.position().left;

      if(left < container.right) {
        
        if(this._current == view) {
          break;
        }

        this._current = view;
        break;
      }
    }

  } else {
    
    for (var i = length; i >= 0; i--) {
      view = this.views[i];
      top = view.bounds().top;
      if(top < container.bottom) {
        
        if(this._current == view) {
          break;
        }

        this._current = view;

        break;
      }
    }

  }

  return this._current;
};
*/