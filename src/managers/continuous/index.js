import {extend, defer, requestAnimationFrame} from "../../utils/core";
import DefaultViewManager from "../default";
import { EVENTS } from "../../utils/constants";
import debounce from "lodash/debounce";

class ContinuousViewManager extends DefaultViewManager {
	constructor(options) {
		super(options);

		this.name = "continuous";

		this.settings = extend(this.settings || {}, {
			infinite: true,
			overflow: undefined,
			axis: undefined,
			flow: "scrolled",
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
			flow: this.settings.flow,
			layout: this.layout,
			width: 0,
			height: 0,
			forceEvenPages: false
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

		if(!this.isPaginated) {
			distY = offset.top;
			offsetY = offset.top+this.settings.offset;
		} else {
			distX = Math.floor(offset.left / this.layout.delta) * this.layout.delta;
			offsetX = distX+this.settings.offset;
		}

		if (distX > 0 || distY > 0) {
			this.scrollBy(distX, distY, true);
		}
	}

	afterResized(view){
		this.emit(EVENTS.MANAGERS.RESIZE, view.section);
	}

	// Remove Previous Listeners if present
	removeShownListeners(view){

		// view.off("shown", this.afterDisplayed);
		// view.off("shown", this.afterDisplayedAbove);
		view.onDisplayed = function(){};

	}

	add(section){
		var view = this.createView(section);

		this.views.append(view);

		view.on(EVENTS.VIEWS.RESIZED, (bounds) => {
			view.expanded = true;
		});

		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});

		// view.on(EVENTS.VIEWS.SHOWN, this.afterDisplayed.bind(this));
		view.onDisplayed = this.afterDisplayed.bind(this);
		view.onResize = this.afterResized.bind(this);

		return view.display(this.request);
	}

	append(section){
		var view = this.createView(section);

		view.on(EVENTS.VIEWS.RESIZED, (bounds) => {
			view.expanded = true;
		});

		/*
		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});
		*/

		this.views.append(view);

		view.onDisplayed = this.afterDisplayed.bind(this);

		return view;
	}

	prepend(section){
		var view = this.createView(section);

		view.on(EVENTS.VIEWS.RESIZED, (bounds) => {
			this.counter(bounds);
			view.expanded = true;
		});

		/*
		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});
		*/

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
					let displayed = view.display(this.request)
						.then(function (view) {
							view.show();
						}, (err) => {
							view.hide();
						});
					promises.push(displayed);
				} else {
					view.show();
				}
				visible.push(view);
			} else {
				this.q.enqueue(view.destroy.bind(view));
				// console.log("hidden " + view.index);

				clearTimeout(this.trimTimeout);
				this.trimTimeout = setTimeout(function(){
					this.q.enqueue(this.trim.bind(this));
				}.bind(this), 250);
			}

		}

		if(promises.length){
			return Promise.all(promises)
				.catch((err) => {
					updating.reject(err);
				});
		} else {
			updating.resolve();
			return updating.promise;
		}

	}

	check(_offsetLeft, _offsetTop){
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

		let rtl = this.settings.direction === "rtl";
		let dir = horizontal && rtl ? -1 : 1; //RTL reverses scrollTop

		var offset = horizontal ? this.scrollLeft : this.scrollTop * dir;
		var visibleLength = horizontal ? Math.floor(bounds.width) : bounds.height;
		var contentLength = horizontal ? this.container.scrollWidth : this.container.scrollHeight;

		let prepend = () => {
			let first = this.views.first();
			let prev = first && first.section.prev();

			if(prev) {
				newViews.push(this.prepend(prev));
			}
		};

		let append = () => {
			let last = this.views.last();
			let next = last && last.section.next();

			if(next) {
				newViews.push(this.append(next));
			}

		};

		if (offset + visibleLength + delta >= contentLength) {
			if (horizontal && rtl) {
				prepend();
			} else {
				append();
			}
		}

		if (offset - delta < 0 ) {
			if (horizontal && rtl) {
				append();
			} else {
				prepend();
			}
		}

		let promises = newViews.map((view) => {
			return view.displayed;
		});

		if(newViews.length){
			return Promise.all(promises)
				.then(() => {
					if (this.layout.name === "pre-paginated" && this.layout.props.spread) {
						return this.check();
					}
				})
				.then(() => {
					// Check to see if anything new is on screen after rendering
					return this.update(delta);
				}, (err) => {
					return err;
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

		if(!this.settings.fullsize) {
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
				this.scrollTo(prevLeft - Math.floor(bounds.width), 0, true);
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

		if(!this.settings.fullsize) {
			this.prevScrollTop = this.container.scrollTop;
			this.prevScrollLeft = this.container.scrollLeft;
		} else {
			this.prevScrollTop = window.scrollY;
			this.prevScrollLeft = window.scrollX;
		}

		this.scrollDeltaVert = 0;
		this.scrollDeltaHorz = 0;

		if(!this.settings.fullsize) {
			scroller = this.container;
			this.scrollTop = this.container.scrollTop;
			this.scrollLeft = this.container.scrollLeft;
		} else {
			scroller = window;
			this.scrollTop = window.scrollY;
			this.scrollLeft = window.scrollX;
		}

		scroller.addEventListener("scroll", this.onScroll.bind(this));
		this._scrolled = debounce(this.scrolled.bind(this), 30);
		// this.tick.call(window, this.onScroll.bind(this));

		this.didScroll = false;

	}

	removeEventListeners(){
		var scroller;

		if(!this.settings.fullsize) {
			scroller = this.container;
		} else {
			scroller = window;
		}

		scroller.removeEventListener("scroll", this.onScroll.bind(this));
	}

	onScroll(){
		let scrollTop;
		let scrollLeft;
		let dir = this.settings.direction === "rtl" ? -1 : 1;

		if(!this.settings.fullsize) {
			scrollTop = this.container.scrollTop;
			scrollLeft = this.container.scrollLeft;
		} else {
			scrollTop = window.scrollY * dir;
			scrollLeft = window.scrollX * dir;
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


		this.didScroll = false;

	}

	scrolled() {
		this.q.enqueue(function() {
			this.check();
		}.bind(this));

		this.emit(EVENTS.MANAGERS.SCROLL, {
			top: this.scrollTop,
			left: this.scrollLeft
		});

		clearTimeout(this.afterScrolled);
		this.afterScrolled = setTimeout(function () {
			this.emit(EVENTS.MANAGERS.SCROLLED, {
				top: this.scrollTop,
				left: this.scrollLeft
			});
		}.bind(this));
	}

	next(){

		let dir = this.settings.direction;
		let delta = this.layout.props.name === "pre-paginated" &&
								this.layout.props.spread ? this.layout.props.delta * 2 : this.layout.props.delta;

		if(!this.views.length) return;

		if(this.isPaginated && this.settings.axis === "horizontal") {

			this.scrollBy(delta, 0, true);

		} else {

			this.scrollBy(0, this.layout.height, true);

		}

		this.q.enqueue(function() {
			this.check();
		}.bind(this));
	}

	prev(){

		let dir = this.settings.direction;
		let delta = this.layout.props.name === "pre-paginated" &&
								this.layout.props.spread ? this.layout.props.delta * 2 : this.layout.props.delta;

		if(!this.views.length) return;

		if(this.isPaginated && this.settings.axis === "horizontal") {

			this.scrollBy(-delta, 0, true);

		} else {

			this.scrollBy(0, -this.layout.height, true);

		}

		this.q.enqueue(function() {
			this.check();
		}.bind(this));
	}

	updateAxis(axis, forceUpdate){

		if (!this.isPaginated) {
			axis = "vertical";
		}

		if (!forceUpdate && axis === this.settings.axis) {
			return;
		}

		this.settings.axis = axis;

		this.stage && this.stage.axis(axis);

		this.viewSettings.axis = axis;

		if (this.mapping) {
			this.mapping.axis(axis);
		}

		if (this.layout) {
			if (axis === "vertical") {
				this.layout.spread("none");
			} else {
				this.layout.spread(this.layout.settings.spread);
			}
		}

		if (axis === "vertical") {
			this.settings.infinite = true;
		} else {
			this.settings.infinite = false;
		}
	}

}

export default ContinuousViewManager;
