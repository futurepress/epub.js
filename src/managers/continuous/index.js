import {extend, defer, requestAnimationFrame} from "../../utils/core";
import DefaultViewManager from "../default";
import debounce from 'lodash/debounce'

class ContinuousViewManager extends DefaultViewManager {
	constructor(options) {
		super(options);

		this.name = "continuous";

		this.settings = extend(this.settings || {}, {
			infinite: true,
			overflow: undefined,
			axis: "vertical",
			offset: 500,
			offsetDelta: 250,
			width: undefined,
			height: undefined
		});

		extend(this.settings, options.settings || {});

		// Gap can be 0, but defaults doesn't handle that
		if (options.settings.gap != "undefined" && options.settings.gap === 0) {
			this.settings.gap = options.settings.gap;
		}

		this.viewSettings = {
			ignoreClass: this.settings.ignoreClass,
			axis: this.settings.axis,
			layout: this.layout,
			width: 0,
			height: 0
		};

		this.scrollTop = 0;
		this.scrollLeft = 0;
	}

	display(section, target){
		return DefaultViewManager.prototype.display.call(this, section, target)
			.then(function () {
				return this.fill();
			}.bind(this));
	}

	fill(_full){
		var full = _full || new defer();

		this.q.enqueue(() => {
			return this.check();
		}).then((result) => {
			if (result) {
				this.fill(full);
			} else {
				full.resolve();
			}
		});

		return full.promise;
	}

	moveTo(offset){
		// var bounds = this.stage.bounds();
		// var dist = Math.floor(offset.top / bounds.height) * bounds.height;
		var distX = 0,
				distY = 0;

		var offsetX = 0,
				offsetY = 0;

		if(this.settings.axis === "vertical") {
			distY = offset.top;
			offsetY = offset.top+this.settings.offset;
		} else {
			distX = Math.floor(offset.left / this.layout.delta) * this.layout.delta;
			offsetX = distX+this.settings.offset;
		}

		this.check(offsetX, offsetY);
		this.scrollBy(distX, distY, true);

		// return this.check(offsetX, offsetY)
		// 	.then(function(){
		// 		this.scrollBy(distX, distY, true);
		// 	}.bind(this));
	}

	/*
	afterDisplayed(currView){
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
		this.emit("added", currView.section);

	}
	*/

	onResized(e) {

		// this.views.clear();

		clearTimeout(this.resizeTimeout);
		this.resizeTimeout = setTimeout(function(){
			this.resize();
		}.bind(this), 150);
	}

	afterResized(view){
		this.emit("resize", view.section);
	}

	// Remove Previous Listeners if present
	removeShownListeners(view){

		// view.off("shown", this.afterDisplayed);
		// view.off("shown", this.afterDisplayedAbove);
		view.onDisplayed = function(){};

	}


	// append(section){
	// 	return this.q.enqueue(function() {
	//
	// 		this._append(section);
	//
	//
	// 	}.bind(this));
	// };
	//
	// prepend(section){
	// 	return this.q.enqueue(function() {
	//
	// 		this._prepend(section);
	//
	// 	}.bind(this));
	//
	// };

	add(section){
		var view = this.createView(section);

		this.views.append(view);

		view.on("resized", (bounds) => {
			view.expanded = true;
		});

		// view.on("shown", this.afterDisplayed.bind(this));
		view.onDisplayed = this.afterDisplayed.bind(this);
		view.onResize = this.afterResized.bind(this);

		return view.display(this.request);
	}

	append(section){
		var view = this.createView(section);

		view.on("resized", (bounds) => {
			view.expanded = true;
		});

		this.views.append(view);

		view.onDisplayed = this.afterDisplayed.bind(this);

		return view;
	}

	prepend(section){
		var view = this.createView(section);

		view.on("resized", (bounds) => {
			this.counter(bounds);
			view.expanded = true;
		});

		this.views.prepend(view);

		view.onDisplayed = this.afterDisplayed.bind(this);

		return view;
	}

	counter(bounds){
		if(this.settings.axis === "vertical") {
			this.scrollBy(0, bounds.heightDelta, true);
		} else {
			this.scrollBy(bounds.widthDelta, 0, true);
		}

	}

	update(_offset){
		var container = this.bounds();
		var views = this.views.all();
		var viewsLength = views.length;
		var visible = [];
		var offset = typeof _offset != "undefined" ? _offset : (this.settings.offset || 0);
		var isVisible;
		var view;

		var updating = new defer();
		var promises = [];
		for (var i = 0; i < viewsLength; i++) {
			view = views[i];

			isVisible = this.isVisible(view, offset, offset, container);

			if(isVisible === true) {
				// console.log("visible " + view.index);

				if (!view.displayed) {
					promises.push(view.display(this.request).then(function (view) {
						view.show();
					}));
				} else {
					view.show();
				}
				visible.push(view);
			} else {
				// this.q.enqueue(view.destroy.bind(view));
				// console.log("hidden " + view.index);

				clearTimeout(this.trimTimeout);
				this.trimTimeout = setTimeout(function(){
					this.q.enqueue(this.trim.bind(this));
				}.bind(this), 250);
			}

		}

		if(promises.length){
			return Promise.all(promises);
		} else {
			updating.resolve();
			return updating.promise;
		}

	}

	check(_offsetLeft, _offsetTop){
		var last, first, next, prev;

		var checking = new defer();
		var newViews = [];

		var horizontal = (this.settings.axis === "horizontal");
		var delta = this.settings.offset || 0;

		if (_offsetLeft && horizontal) {
			delta = _offsetLeft;
		}

		if (_offsetTop && !horizontal) {
			delta = _offsetTop;
		}

		var bounds = this._bounds; // bounds saved this until resize

		var offset = horizontal ? this.scrollLeft : this.scrollTop;
		var visibleLength = horizontal ? bounds.width : bounds.height;
		var contentLength = horizontal ? this.container.scrollWidth : this.container.scrollHeight;

		if (offset + visibleLength + delta >= contentLength) {
			last = this.views.last();
			next = last && last.section.next();

			if(next) {
				newViews.push(this.append(next));
			}
		}

		if (offset - delta < 0 ) {
			first = this.views.first();

			prev = first && first.section.prev();
			if(prev) {
				newViews.push(this.prepend(prev));
			}
		}

		let promises = newViews.map((view) => {
			return view.displayed;
		});

		if(newViews.length){
			return Promise.all(promises)
				.then(() => {
					// Check to see if anything new is on screen after rendering
					return this.update(delta);
				});

		} else {
			this.q.enqueue(function(){
				this.update();
			}.bind(this));
			checking.resolve(false);
			return checking.promise;
		}


	}

	trim(){
		var task = new defer();
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
	}

	erase(view, above){ //Trim

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

		view.destroy.bind(view)
		this.views.remove(view);

		if(above) {

			if(this.settings.axis === "vertical") {
				this.scrollTo(0, prevTop - bounds.height, true);
			} else {
				this.scrollTo(prevLeft - bounds.width, 0, true);
			}
		}

	}

	addEventListeners(stage){

		window.addEventListener("unload", function(e){
			this.ignore = true;
			// this.scrollTo(0,0);
			this.destroy();
		}.bind(this));

		this.addScrollListeners();
	}

	addScrollListeners() {
		var scroller;

		this.tick = requestAnimationFrame;

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
			this.scrollTop = this.container.scrollTop;
			this.scrollLeft = this.container.scrollLeft;
		} else {
			scroller = window;
			this.scrollTop = window.scrollY;
			this.scrollLeft = window.scrollX;
		}

		scroller.addEventListener("scroll", this.onScroll.bind(this));
		this._scrolled = debounce(this.scrolled.bind(this), 300);
		// this.tick.call(window, this.onScroll.bind(this));

		this.scrolled = false;

	}

	removeEventListeners(){
		var scroller;

		if(this.settings.height) {
			scroller = this.container;
		} else {
			scroller = window;
		}

		scroller.removeEventListener("scroll", this.onScroll.bind(this));
	}

	onScroll(){
		let scrollTop;
		let scrollLeft;

		if(this.settings.height) {
			scrollTop = this.container.scrollTop;
			scrollLeft = this.container.scrollLeft;
		} else {
			scrollTop = window.scrollY;
			scrollLeft = window.scrollX;
		}

		this.scrollTop = scrollTop;
		this.scrollLeft = scrollLeft;

		if(!this.ignore) {

			this._scrolled();

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

	scrolled() {
		this.q.enqueue(function() {
			this.check();
		}.bind(this));

		this.emit("scroll", {
			top: this.scrollTop,
			left: this.scrollLeft
		});

		clearTimeout(this.afterScrolled);
		this.afterScrolled = setTimeout(function () {
			this.emit("scrolled", {
				top: this.scrollTop,
				left: this.scrollLeft
			});
		}.bind(this));
	}

	next(){

		if(this.settings.axis === "horizontal") {

			this.scrollLeft = this.container.scrollLeft;

			if(this.container.scrollLeft +
				 this.container.offsetWidth +
				 this.layout.delta < this.container.scrollWidth) {
				this.scrollBy(this.layout.delta, 0, true);
			} else {
				this.scrollTo(this.container.scrollWidth - this.layout.delta, 0, true);
			}

		} else {
			this.scrollBy(0, this.layout.height, true);
		}

		this.q.enqueue(function() {
			this.check();
		}.bind(this));
	}

	prev(){
		if(this.settings.axis === "horizontal") {
			this.scrollBy(-this.layout.delta, 0, true);
		} else {
			this.scrollBy(0, -this.layout.height, true);
		}

		this.q.enqueue(function() {
			this.check();
		}.bind(this));
	}

	updateFlow(flow){
		var axis = (flow === "paginated") ? "horizontal" : "vertical";

		this.settings.axis = axis;

		this.stage && this.stage.axis(axis);

		this.viewSettings.axis = axis;

		if (!this.settings.overflow) {
			this.overflow = (flow === "paginated") ? "hidden" : "auto";
		} else {
			this.overflow = this.settings.overflow;
		}

		// this.views.each(function(view){
		// 	view.setAxis(axis);
		// });

		if (this.settings.axis === "vertical") {
			this.settings.infinite = true;
		} else {
			this.settings.infinite = false;
		}

		this.updateLayout();

	}
}

export default ContinuousViewManager;
