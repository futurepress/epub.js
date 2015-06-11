EPUBJS.Continuous = function(book, options) {
	
	EPUBJS.Rendition.apply(this, arguments); // call super constructor.

	this.settings = EPUBJS.core.extend(this.settings || {}, {
		infinite: true,
		overflow: "auto",
		axis: "vertical",
		offset: 500,
		offsetDelta: 250
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

EPUBJS.Continuous.prototype._display = function(target){
			
	var displaying = new RSVP.defer();
	var displayed = displaying.promise;
 
	var section;
  var view;
  var cfi, spinePos;

  if(this.epubcfi.isCfiString(target)) {
    cfi = this.epubcfi.parse(target);
    spinePos = cfi.spinePos;
    section = this.book.spine.get(spinePos);
  } else {
    section = this.book.spine.get(target);
  }

	this.displaying = true;
  this.hide();

	if(section){
		view = new EPUBJS.View(section, this.viewSettings);
		
		// This will clear all previous views
		this.q.enqueue(this.fill, view).then(function(){

      // Move to correct place within the section, if needed
      this.q.enqueue(function(){

        var offset = view.locationOf(target);

        return this.moveTo(offset);

      });
            
      this.q.enqueue(this.check);

      this.q.enqueue(this.show);

      this.hooks.display.trigger(view);          

    }.bind(this));

    // view.displayed.then(function(){
    //  this.trigger("displayed", section);
    //  this.displaying = false;
    // displaying.resolve(this);
    //}.bind(this));
    displaying.resolve(this);

	} else {
		displaying.reject(new Error("No Section Found"));
	}

	return displayed;
};


EPUBJS.Continuous.prototype.moveTo = function(offset){
  var bounds = this.bounds();
  var dist = Math.floor(offset.top / bounds.height) * bounds.height;

  return this.check(0, dist+this.settings.offset).then(function(){
    
    if(this.settings.axis === "vertical") {
      this.scrollBy(0, dist);
    } else {
      this.scrollBy(dist, 0);
    }

  }.bind(this)); 
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
	// currView.onShown = this.afterDisplayed.bind(this);

	this.trigger("displayed", currView.section);

};


// Remove Previous Listeners if present
EPUBJS.Continuous.prototype.removeShownListeners = function(view){

	// view.off("shown", this.afterDisplayed);
	// view.off("shown", this.afterDisplayedAbove);
	view.onDisplayed = function(){};

};

EPUBJS.Continuous.prototype.append = function(view){
	this.views.push(view);
	this.container.appendChild(view.element);

	// view.on("shown", this.afterDisplayed.bind(this));
	view.onDisplayed = this.afterDisplayed.bind(this);

  //this.q.enqueue(this.check);
  return this.check();
};

EPUBJS.Continuous.prototype.prepend = function(view){
	this.views.unshift(view);
	this.container.insertBefore(view.element, this.container.firstChild);
	
	// view.on("shown", this.afterDisplayedAbove.bind(this));
	view.onDisplayed = this.afterDisplayed.bind(this);

	view.on("resized", this.counter.bind(this));

  // this.q.enqueue(this.check);
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
	view.onDisplayed = this.afterDisplayed.bind(this);

	return this.render(view)
    .then(function(){
      return this.check();
    }.bind(this));
};

EPUBJS.Continuous.prototype.insert = function(view, index) {
	this.views.splice(index, 0, view);

	if(index < this.cotainer.children.length){
		this.container.insertBefore(view.element, this.container.children[index]);
	} else {
		this.container.appendChild(view.element);
	}

	// this.q.enqueue(this.check);
  return this.check();
};

// // Remove the render element and clean up listeners
// EPUBJS.Continuous.prototype.remove = function(view) {
// 	var index = this.views.indexOf(view);
// 	if(index > -1) {
// 		this.views.splice(index, 1);
// 	}

// 	this.container.removeChild(view.element);
	
// 	view.off("resized");

// 	if(view.displayed){
// 		view.destroy();
// 	}
	
// 	view = null;
	
// };

EPUBJS.Continuous.prototype.first = function() {
	return this.views[0];
};

EPUBJS.Continuous.prototype.last = function() {
	return this.views[this.views.length-1];
};

EPUBJS.Continuous.prototype.each = function(func) {
	return this.views.forEach(func);
};

EPUBJS.Continuous.prototype.check = function(_offset){
	var checking = new RSVP.defer();
	var container = this.bounds();
  var promises = [];
  var offset = _offset || this.settings.offset;


	this.views.forEach(function(view){
		var visible = this.isVisible(view, offset, offset, container);

		if(visible) {

			if(!view.displayed && !view.rendering) {
          // console.log("render",view.section.index)
					promises.push(this.render(view));
			}

		} else {
			
			if(view.displayed) {
        // console.log("destroy", view.section.index)
        this.q.enqueue(view.destroy.bind(view));
        // view.destroy();
        // this.q.enqueue(this.trim);
        clearTimeout(this.trimTimeout);
        this.trimTimeout = setTimeout(function(){
          this.q.enqueue(this.trim);
        }.bind(this), 250);
			}

		}

	}.bind(this));

  
  if(promises.length){

    return RSVP.all(promises)
      .then(function(posts) {
        // Check to see if anything new is on screen after rendering
        this.q.enqueue(this.check);

      }.bind(this));

  } else {
    checking.resolve();

    return checking.promise;
  }

};

// EPUBJS.Continuous.prototype.trim = function(){
// 	var task = new RSVP.defer();
// 	var above = true;

// 	this.views.forEach(function(view, i){
// 		// var view = this.views[i];
// 		var prevShown = i > 0 ? this.views[i-1].displayed : false;
// 		var nextShown = (i+1 < this.views.length) ? this.views[i+1].displayed : false;
// 		if(!view.displayed && !prevShown && !nextShown) {
// 			// Remove
// 			this.erase(view, above);
// 		}
// 		if(nextShown) {
// 			above = false;
// 		}
// 	}.bind(this));

// 	task.resolve();
// 	return task.promise;
// };

EPUBJS.Continuous.prototype.trim = function(){
  var task = new RSVP.defer();
  var displayed = this.displayed();
  var first = displayed[0];
  var last = displayed[displayed.length-1];
  var firstIndex = this.views.indexOf(first);
  var lastIndex = this.views.indexOf(last);
  var above = this.views.slice(0, firstIndex);
  var below = this.views.slice(lastIndex+1);

  for (var i = 0; i < above.length-1; i++) {
    this.erase(above[i], above);
  };

  for (var i = 1; i < below.length; i++) {
    this.erase(below[i]);
  };

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
    this.destroy();
  }.bind(this));

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

    if(x) this.container.scrollLeft += x;
  	if(y) this.container.scrollTop += y;

  } else {
  	window.scrollBy(x,y);
  }
  // console.log("scrollBy", x, y);
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
  // console.log("scrollTo", x, y);
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
		view.lock("height", this.stage.width, this.stage.height);
	} else {
		view.lock("width", this.stage.width, this.stage.height);
	}

};

EPUBJS.Continuous.prototype.currentLocation = function(){
  var visible = this.visible();
  var startPage, endPage;

  var container = this.container.getBoundingClientRect()
  
  if(visible.length === 1) {
    return this.map.page(visible[0]);
  }

  if(visible.length > 1) {

    startPage = this.map.page(visible[0]);
    endPage = this.map.page(visible[visible.length-1]);

    return {
      start: startPage.start,
      end: endPage.end
    }
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