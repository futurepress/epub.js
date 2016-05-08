var RSVP = require('rsvp');
var core = require('../core');
var SingleViewManager = require('./single');

function ContinuousViewManager(options) {

	SingleViewManager.apply(this, arguments); // call super constructor.

	this.settings = core.extend(this.settings || {}, {
		infinite: true,
		overflow: "auto",
		axis: "vertical",
		offset: 500,
		offsetDelta: 250
	});

	core.extend(this.settings, options.settings);

};

// subclass extends superclass
ContinuousViewManager.prototype = Object.create(SingleViewManager.prototype);
ContinuousViewManager.prototype.constructor = ContinuousViewManager;


ContinuousViewManager.prototype.moveTo = function(offset){
  // var bounds = this.stage.bounds();
  // var dist = Math.floor(offset.top / bounds.height) * bounds.height;
  return this.check(
		offset.left+this.settings.offset,
		offset.top+this.settings.offset)
		.then(function(){

	    if(this.settings.axis === "vertical") {
	      this.scrollBy(0, offset.top);
	    } else {
	      this.scrollBy(offset.left, 0);
	    }

	  }.bind(this));
};
/*
ContinuousViewManager.prototype.afterDisplayed = function(currView){
	var next = currView.section.next();
	var prev = currView.section.prev();
	var index = this.views.indexOf(currView);
	var prevView, nextView;

	if(index + 1 === this.views.length && next) {
		nextView = this.createView(next);
		this.q.enqueue(this.append.bind(this), nextView);
	}

	if(index === 0 && prev) {
		prevView = this.createView(prev, this.viewSettings);
		this.q.enqueue(this.prepend.bind(this), prevView);
	}

	// this.removeShownListeners(currView);
	// currView.onShown = this.afterDisplayed.bind(this);
	this.trigger("added", currView.section);

};
*/
ContinuousViewManager.prototype.afterResized = function(view){
	this.trigger("resize", view.section);
};

// Remove Previous Listeners if present
ContinuousViewManager.prototype.removeShownListeners = function(view){

	// view.off("shown", this.afterDisplayed);
	// view.off("shown", this.afterDisplayedAbove);
	view.onDisplayed = function(){};

};

ContinuousViewManager.prototype.append = function(section){
	var view = this.createView(section);

	return this.q.enqueue(function() {

		this.views.append(view);

		return this.update();

	}.bind(this));
};

ContinuousViewManager.prototype.prepend = function(section){
	var view = this.createView(section);

	view.on("resized", this.counter.bind(this));

	return this.q.enqueue(function() {

		this.views.prepend(view);

		return this.update();

	}.bind(this));

};

ContinuousViewManager.prototype.counter = function(bounds){

	if(this.settings.axis === "vertical") {
		this.scrollBy(0, bounds.heightDelta, true);
	} else {
		this.scrollBy(bounds.widthDelta, 0, true);
	}

};
/*
ContinuousViewManager.prototype.check = function(_offset){
	var checking = new RSVP.defer();
	var container = this.stage.bounds();
  var promises = [];
  var offset = _offset || this.settings.offset;

	this.views.each(function(view){
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
          this.q.enqueue(this.trim.bind(this));
        }.bind(this), 250);
			}

		}

	}.bind(this));


  if(promises.length){

    return RSVP.all(promises)
      .then(function(posts) {
        // Check to see if anything new is on screen after rendering
        this.q.enqueue(this.check.bind(this));

      }.bind(this));

  } else {
    checking.resolve();

    return checking.promise;
  }

};
*/

ContinuousViewManager.prototype.update = function(_offset){
	var container = this.stage.bounds();
	var views = this.views;
	var viewsLength = views.length;
	var visible = [];
	var isVisible;
	var view;

	var updating = new RSVP.defer();
	var promises = [];

	for (var i = 0; i < viewsLength; i++) {
    view = views[i];
    isVisible = this.isVisible(view, 0, 0, container);

    if(isVisible === true) {
			promises.push(view.display());
      visible.push(view);
    } else {
			this.q.enqueue(view.destroy.bind(view));

			clearTimeout(this.trimTimeout);
			this.trimTimeout = setTimeout(function(){
				this.q.enqueue(this.trim.bind(this));
			}.bind(this), 250);
    }

  }

	if(promises.length){
    return RSVP.all(promises);
  } else {
    updating.resolve();
    return updating.promise;
  }

};

ContinuousViewManager.prototype.check = function(_offsetLeft, _offsetTop){
	var next, prev;
	var horizontal = (this.settings.axis === "horizontal");
	var delta = this.settings.offset || 0;

	if (_offsetLeft && horizontal) {
		delta = _offsetLeft;
	}

	if (_offsetTop && !horizontal) {
		delta = _offsetTop;
	}

	var bounds = this.stage.bounds(); // TODO: save this until resize

	var offset = horizontal ? this.container.scrollLeft : this.container.scrollTop;
	var visibleLength = horizontal ? bounds.width : bounds.height;
	var contentLength = horizontal ? this.container.scrollWidth : this.container.scrollHeight;

	var checking = new RSVP.defer();
	var promises = [];

	if (offset + visibleLength + delta >= contentLength) {
    next = this.views.last().section.next();
    if(next) {
      promises.push(this.append(next));
    }
  }

  if (offset - delta < 0 ) {
    prev = this.views.first().section.prev();
    if(prev) {
      promises.push(this.prepend(prev));
    }
  }

  if(promises.length){

    return RSVP.all(promises)
      .then(function(posts) {
        // Check to see if anything new is on screen after rendering
        this.q.enqueue(this.update.bind(this));

      }.bind(this));

  } else {
    checking.resolve();

    return checking.promise;
  }

};

ContinuousViewManager.prototype.trim = function(){
  var task = new RSVP.defer();
  var displayed = this.views.displayed();
  var first = displayed[0];
  var last = displayed[displayed.length-1];
  var firstIndex = this.views.indexOf(first);
  var lastIndex = this.views.indexOf(last);
  var above = this.views.slice(0, firstIndex);
  var below = this.views.slice(lastIndex+1);

  // Erase all but last above
  for (var i = 0; i < above.length-1; i++) {
    this.erase(above[i], above);
  }

  // Erase all except first below
  for (var j = 1; j < below.length; j++) {
    this.erase(below[j]);
  }

  task.resolve();
  return task.promise;
};

ContinuousViewManager.prototype.erase = function(view, above){ //Trim

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

	this.views.remove(view);

	if(above) {

		if(this.settings.axis === "vertical") {
			this.scrollTo(0, prevTop - bounds.height, true);
		} else {
			this.scrollTo(prevLeft - bounds.width, 0, true);
		}
	}

};

ContinuousViewManager.prototype.addEventListeners = function(stage){
	this.addScrollListeners();
};

ContinuousViewManager.prototype.addScrollListeners = function() {
  var scroller;

  this.tick = core.requestAnimationFrame;

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

  scroller.addEventListener("scroll", function(e){
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

ContinuousViewManager.prototype.onScroll = function(){

  if(this.scrolled) {

    if(this.settings.height) {
	  	scrollTop = this.container.scrollTop;
	  	scrollLeft = this.container.scrollLeft;
	  } else {
	  	scrollTop = window.scrollY;
			scrollLeft = window.scrollX;
	  }

    if(!this.ignore) {

	    if((this.scrollDeltaVert === 0 &&
	    	 this.scrollDeltaHorz === 0) ||
	    	 this.scrollDeltaVert > this.settings.offsetDelta ||
	    	 this.scrollDeltaHorz > this.settings.offsetDelta) {

				this.q.enqueue(this.check.bind(this));

				this.scrollDeltaVert = 0;
	    	this.scrollDeltaHorz = 0;

				this.trigger("scroll", {
		      top: scrollTop,
		      left: scrollLeft
		    });

			}

		} else {
	    this.ignore = false;
		}

    this.scrollDeltaVert += Math.abs(scrollTop-this.prevScrollTop);
    this.scrollDeltaHorz += Math.abs(scrollLeft-this.prevScrollLeft);

		this.prevScrollTop = scrollTop;
		this.prevScrollLeft = scrollLeft;

  	clearTimeout(this.scrollTimeout);
		this.scrollTimeout = setTimeout(function(){
			this.scrollDeltaVert = 0;
	    this.scrollDeltaHorz = 0;
		}.bind(this), 150);


    this.scrolled = false;
  }

  this.tick.call(window, this.onScroll.bind(this));

};


//  ContinuousViewManager.prototype.resizeView = function(view) {
//
// 	if(this.settings.axis === "horizontal") {
// 		view.lock("height", this.stage.width, this.stage.height);
// 	} else {
// 		view.lock("width", this.stage.width, this.stage.height);
// 	}
//
// };

ContinuousViewManager.prototype.currentLocation = function(){
  var visible = this.visible();
  var startPage, endPage;

  var container = this.container.getBoundingClientRect();

  if(visible.length === 1) {
    return this.map.page(visible[0]);
  }

  if(visible.length > 1) {

    startPage = this.map.page(visible[0]);
    endPage = this.map.page(visible[visible.length-1]);

    return {
      start: startPage.start,
      end: endPage.end
    };
  }

};

/*
Continuous.prototype.current = function(what){
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

module.exports = ContinuousViewManager;
