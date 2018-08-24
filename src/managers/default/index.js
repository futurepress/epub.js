import EventEmitter from "event-emitter";
import {extend, defer, windowBounds, isNumber} from "../../utils/core";
import Mapping from "../../mapping";
import Queue from "../../utils/queue";
import Stage from "../helpers/stage";
import Views from "../helpers/views";
import { EVENTS } from "../../utils/constants";

class DefaultViewManager {
	constructor(options) {

		this.name = "default";
		this.optsSettings = options.settings;
		this.View = options.view;
		this.request = options.request;
		this.renditionQueue = options.queue;
		this.q = new Queue(this);

		this.settings = extend(this.settings || {}, {
			infinite: true,
			hidden: false,
			width: undefined,
			height: undefined,
			axis: undefined,
			flow: "scrolled",
			ignoreClass: "",
			fullsize: undefined
		});

		extend(this.settings, options.settings || {});

		this.viewSettings = {
			ignoreClass: this.settings.ignoreClass,
			axis: this.settings.axis,
			flow: this.settings.flow,
			layout: this.layout,
			method: this.settings.method, // srcdoc, blobUrl, write
			width: 0,
			height: 0,
			forceEvenPages: true
		};

		this.rendered = false;

	}

	render(element, size){
		let tag = element.tagName;

		if (typeof this.settings.fullsize === "undefined" &&
				tag && (tag.toLowerCase() == "body" ||
				tag.toLowerCase() == "html")) {
				this.settings.fullsize = true;
		}

		if (this.settings.fullsize) {
			this.settings.overflow = "visible";
			this.overflow = this.settings.overflow;
		}

		this.settings.size = size;

		// Save the stage
		this.stage = new Stage({
			width: size.width,
			height: size.height,
			overflow: this.overflow,
			hidden: this.settings.hidden,
			axis: this.settings.axis,
			fullsize: this.settings.fullsize,
			direction: this.settings.direction
		});

		this.stage.attachTo(element);

		// Get this stage container div
		this.container = this.stage.getContainer();

		// Views array methods
		this.views = new Views(this.container);

		// Calculate Stage Size
		this._bounds = this.bounds();
		this._stageSize = this.stage.size();

		// Set the dimensions for views
		this.viewSettings.width = this._stageSize.width;
		this.viewSettings.height = this._stageSize.height;

		// Function to handle a resize event.
		// Will only attach if width and height are both fixed.
		this.stage.onResize(this.onResized.bind(this));

		this.stage.onOrientationChange(this.onOrientationChange.bind(this));

		// Add Event Listeners
		this.addEventListeners();

		// Add Layout method
		// this.applyLayoutMethod();
		if (this.layout) {
			this.updateLayout();
		}

		this.rendered = true;

	}

	addEventListeners(){
		var scroller;

		window.addEventListener("unload", function(e){
			this.destroy();
		}.bind(this));

		if(!this.settings.fullsize) {
			scroller = this.container;
		} else {
			scroller = window;
		}

		scroller.addEventListener("scroll", this.onScroll.bind(this));
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

	destroy(){
		clearTimeout(this.orientationTimeout);
		clearTimeout(this.resizeTimeout);
		clearTimeout(this.afterScrolled);

		this.clear();

		this.removeEventListeners();

		this.stage.destroy();

		this.rendered = false;

		/*

			clearTimeout(this.trimTimeout);
			if(this.settings.hidden) {
				this.element.removeChild(this.wrapper);
			} else {
				this.element.removeChild(this.container);
			}
		*/
	}

	onOrientationChange(e) {
		let {orientation} = window;

		if(this.optsSettings.resizeOnOrientationChange) {
			this.resize();
		}

		// Per ampproject:
		// In IOS 10.3, the measured size of an element is incorrect if the
		// element size depends on window size directly and the measurement
		// happens in window.resize event. Adding a timeout for correct
		// measurement. See https://github.com/ampproject/amphtml/issues/8479
		clearTimeout(this.orientationTimeout);
		this.orientationTimeout = setTimeout(function(){
			this.orientationTimeout = undefined;

			if(this.optsSettings.resizeOnOrientationChange) {
				this.resize();
			}

			this.emit(EVENTS.MANAGERS.ORIENTATION_CHANGE, orientation);
		}.bind(this), 500);

	}

	onResized(e) {
		this.resize();
	}

	resize(width, height){
		let stageSize = this.stage.size(width, height);

		// For Safari, wait for orientation to catch up
		// if the window is a square
		this.winBounds = windowBounds();
		if (this.orientationTimeout &&
				this.winBounds.width === this.winBounds.height) {
			// reset the stage size for next resize
			this._stageSize = undefined;
			return;
		}

		if (this._stageSize &&
				this._stageSize.width === stageSize.width &&
				this._stageSize.height === stageSize.height ) {
			// Size is the same, no need to resize
			return;
		}

		this._stageSize = stageSize;

		this._bounds = this.bounds();

		// Clear current views
		this.clear();

		// Update for new views
		this.viewSettings.width = this._stageSize.width;
		this.viewSettings.height = this._stageSize.height;

		this.updateLayout();

		this.emit(EVENTS.MANAGERS.RESIZED, {
			width: this._stageSize.width,
			height: this._stageSize.height
		});
	}

	createView(section) {
		return new this.View(section, this.viewSettings);
	}

	display(section, target){

		var displaying = new defer();
		var displayed = displaying.promise;

		// Check if moving to target is needed
		if (target === section.href || isNumber(target)) {
			target = undefined;
		}

		// Check to make sure the section we want isn't already shown
		var visible = this.views.find(section);

		// View is already shown, just move to correct location in view
		if(visible && section) {
			let offset = visible.offset();

			if (this.settings.direction === "ltr") {
				this.scrollTo(offset.left, offset.top, true);
			} else {
				let width = visible.width();
				this.scrollTo(offset.left + width, offset.top, true);
			}

			if(target) {
				let offset = visible.locationOf(target);
				this.moveTo(offset);
			}

			displaying.resolve();
			return displayed;
		}

		// Hide all current views
		this.clear();

		this.add(section)
			.then(function(view){

				// Move to correct place within the section, if needed
				if(target) {
					let offset = view.locationOf(target);
					this.moveTo(offset);
				}

			}.bind(this), (err) => {
				displaying.reject(err);
			})
			.then(function(){
				var next;
				if (this.layout.name === "pre-paginated" &&
						this.layout.divisor > 1) {
					next = section.next();
					if (next) {
						return this.add(next);
					}
				}
			}.bind(this))
			.then(function(){

				this.views.show();

				displaying.resolve();

			}.bind(this));
		// .then(function(){
		// 	return this.hooks.display.trigger(view);
		// }.bind(this))
		// .then(function(){
		// 	this.views.show();
		// }.bind(this));
		return displayed;
	}

	afterDisplayed(view){
		this.emit(EVENTS.MANAGERS.ADDED, view);
	}

	afterResized(view){
		this.emit(EVENTS.MANAGERS.RESIZE, view.section);
	}

	moveTo(offset){
		var distX = 0,
			  distY = 0;

		if(!this.isPaginated) {
			distY = offset.top;
		} else {
			distX = Math.floor(offset.left / this.layout.delta) * this.layout.delta;

			if (distX + this.layout.delta > this.container.scrollWidth) {
				distX = this.container.scrollWidth - this.layout.delta;
			}
		}
		this.scrollTo(distX, distY, true);
	}

	add(section){
		var view = this.createView(section);

		this.views.append(view);

		// view.on(EVENTS.VIEWS.SHOWN, this.afterDisplayed.bind(this));
		view.onDisplayed = this.afterDisplayed.bind(this);
		view.onResize = this.afterResized.bind(this);

		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});

		return view.display(this.request);

	}

	append(section){
		var view = this.createView(section);
		this.views.append(view);

		view.onDisplayed = this.afterDisplayed.bind(this);
		view.onResize = this.afterResized.bind(this);

		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});

		return view.display(this.request);
	}

	prepend(section){
		var view = this.createView(section);

		view.on(EVENTS.VIEWS.RESIZED, (bounds) => {
			this.counter(bounds);
		});

		this.views.prepend(view);

		view.onDisplayed = this.afterDisplayed.bind(this);
		view.onResize = this.afterResized.bind(this);

		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});

		return view.display(this.request);
	}

	counter(bounds){
		if(this.settings.axis === "vertical") {
			this.scrollBy(0, bounds.heightDelta, true);
		} else {
			this.scrollBy(bounds.widthDelta, 0, true);
		}

	}

	// resizeView(view) {
	//
	// 	if(this.settings.globalLayoutProperties.layout === "pre-paginated") {
	// 		view.lock("both", this.bounds.width, this.bounds.height);
	// 	} else {
	// 		view.lock("width", this.bounds.width, this.bounds.height);
	// 	}
	//
	// };

	next(){
		var next;
		var left;

		let dir = this.settings.direction;

		if(!this.views.length) return;

		if(this.isPaginated && this.settings.axis === "horizontal" && (!dir || dir === "ltr")) {

			this.scrollLeft = this.container.scrollLeft;

			left = this.container.scrollLeft + this.container.offsetWidth + this.layout.delta;

			if(left <= this.container.scrollWidth) {
				this.scrollBy(this.layout.delta, 0, true);
			} else {
				next = this.views.last().section.next();
			}
		} else if (this.isPaginated && this.settings.axis === "horizontal" && dir === "rtl") {

			this.scrollLeft = this.container.scrollLeft;

			left = this.container.scrollLeft;

			if(left > 0) {
				this.scrollBy(this.layout.delta, 0, true);
			} else {
				next = this.views.last().section.next();
			}

		} else if (this.isPaginated && this.settings.axis === "vertical") {

			this.scrollTop = this.container.scrollTop;

			let top  = this.container.scrollTop + this.container.offsetHeight;

			if(top < this.container.scrollHeight) {
				this.scrollBy(0, this.layout.height, true);
			} else {
				next = this.views.last().section.next();
			}

		} else {
			next = this.views.last().section.next();
		}

		if(next) {
			this.clear();

			return this.append(next)
				.then(function(){
					var right;
					if (this.layout.name === "pre-paginated" && this.layout.divisor > 1) {
						right = next.next();
						if (right) {
							return this.append(right);
						}
					}
				}.bind(this), (err) => {
					displaying.reject(err);
				})
				.then(function(){
					this.views.show();
				}.bind(this));
		}


	}

	prev(){
		var prev;
		var left;
		let dir = this.settings.direction;

		if(!this.views.length) return;

		if(this.isPaginated && this.settings.axis === "horizontal" && (!dir || dir === "ltr")) {

			this.scrollLeft = this.container.scrollLeft;

			left = this.container.scrollLeft;

			if(left > 0) {
				this.scrollBy(-this.layout.delta, 0, true);
			} else {
				prev = this.views.first().section.prev();
			}

		} else if (this.isPaginated && this.settings.axis === "horizontal" && dir === "rtl") {

			this.scrollLeft = this.container.scrollLeft;

			left = this.container.scrollLeft + this.container.offsetWidth + this.layout.delta;

			if(left <= this.container.scrollWidth) {
				this.scrollBy(-this.layout.delta, 0, true);
			} else {
				prev = this.views.first().section.prev();
			}

		} else if (this.isPaginated && this.settings.axis === "vertical") {

			this.scrollTop = this.container.scrollTop;

			let top = this.container.scrollTop;

			if(top > 0) {
				this.scrollBy(0, -(this.layout.height), true);
			} else {
				prev = this.views.first().section.prev();
			}

		} else {

			prev = this.views.first().section.prev();

		}

		if(prev) {
			this.clear();

			return this.prepend(prev)
				.then(function(){
					var left;
					if (this.layout.name === "pre-paginated" && this.layout.divisor > 1) {
						left = prev.prev();
						if (left) {
							return this.prepend(left);
						}
					}
				}.bind(this), (err) => {
					displaying.reject(err);
				})
				.then(function(){
					if(this.isPaginated && this.settings.axis === "horizontal") {
						if (this.settings.direction === "rtl") {
							this.scrollTo(0, 0, true);
						} else {
							this.scrollTo(this.container.scrollWidth - this.layout.delta, 0, true);
						}
					}
					this.views.show();
				}.bind(this));
		}
	}

	current(){
		var visible = this.visible();
		if(visible.length){
			// Current is the last visible view
			return visible[visible.length-1];
		}
		return null;
	}

	clear () {

		// this.q.clear();

		if (this.views) {
			this.views.hide();
			this.scrollTo(0,0, true);
			this.views.clear();
		}
	}

	currentLocation(){

		if (this.settings.axis === "vertical") {
			this.location = this.scrolledLocation();
		} else {
			this.location = this.paginatedLocation();
		}
		return this.location;
	}

	scrolledLocation() {
		let visible = this.visible();
		let container = this.container.getBoundingClientRect();
		let pageHeight = (container.height < window.innerHeight) ? container.height : window.innerHeight;

		let offset = 0;
		let used = 0;

		if(this.settings.fullsize) {
			offset = window.scrollY;
		}

		let sections = visible.map((view) => {
			let {index, href} = view.section;
			let position = view.position();
			let height = view.height();

			let startPos = offset + container.top - position.top + used;
			let endPos = startPos + pageHeight - used;
			if (endPos > height) {
				endPos = height;
				used = (endPos - startPos);
			}

			let totalPages = this.layout.count(height, pageHeight).pages;

			let currPage = Math.ceil(startPos / pageHeight);
			let pages = [];
			let endPage = Math.ceil(endPos / pageHeight);

			pages = [];
			for (var i = currPage; i <= endPage; i++) {
				let pg = i + 1;
				pages.push(pg);
			}

			let mapping = this.mapping.page(view.contents, view.section.cfiBase, startPos, endPos);

			return {
				index,
				href,
				pages,
				totalPages,
				mapping
			};
		});

		return sections;
	}

	paginatedLocation(){
		let visible = this.visible();
		let container = this.container.getBoundingClientRect();

		let left = 0;
		let used = 0;

		if(this.settings.fullsize) {
			left = window.scrollX;
		}

		let sections = visible.map((view) => {
			let {index, href} = view.section;
			let offset = view.offset().left;
			let position = view.position().left;
			let width = view.width();

			// Find mapping
			let start = left + container.left - position + used;
			let end = start + this.layout.width - used;

			let mapping = this.mapping.page(view.contents, view.section.cfiBase, start, end);

			// Find displayed pages
			//console.log("pre", end, offset + width);
			// if (end > offset + width) {
			// 	end = offset + width;
			// 	used = this.layout.pageWidth;
			// }
			// console.log("post", end);

			let totalPages = this.layout.count(width).pages;
			let startPage = Math.floor(start / this.layout.pageWidth);
			let pages = [];
			let endPage = Math.floor(end / this.layout.pageWidth);

			// start page should not be negative
			if (startPage < 0) {
				startPage = 0;
				endPage = endPage + 1;
			}

			// Reverse page counts for rtl
			if (this.settings.direction === "rtl") {
				let tempStartPage = startPage;
				startPage = totalPages - endPage;
				endPage = totalPages - tempStartPage;
			}


			for (var i = startPage + 1; i <= endPage; i++) {
				let pg = i;
				pages.push(pg);
			}

			return {
				index,
				href,
				pages,
				totalPages,
				mapping
			};
		});

		return sections;
	}

	isVisible(view, offsetPrev, offsetNext, _container){
		var position = view.position();
		var container = _container || this.bounds();

		if(this.settings.axis === "horizontal" &&
			position.right > container.left - offsetPrev &&
			position.left < container.right + offsetNext) {

			return true;

		} else if(this.settings.axis === "vertical" &&
			position.bottom > container.top - offsetPrev &&
			position.top < container.bottom + offsetNext) {

			return true;
		}

		return false;

	}

	visible(){
		var container = this.bounds();
		var views = this.views.displayed();
		var viewsLength = views.length;
		var visible = [];
		var isVisible;
		var view;

		for (var i = 0; i < viewsLength; i++) {
			view = views[i];
			isVisible = this.isVisible(view, 0, 0, container);

			if(isVisible === true) {
				visible.push(view);
			}

		}
		return visible;
	}

	scrollBy(x, y, silent){
		let dir = this.settings.direction === "rtl" ? -1 : 1;

		if(silent) {
			this.ignore = true;
		}

		if(!this.settings.fullsize) {
			if(x) this.container.scrollLeft += x * dir;
			if(y) this.container.scrollTop += y;
		} else {
			window.scrollBy(x * dir, y * dir);
		}
		this.scrolled = true;
	}

	scrollTo(x, y, silent){
		if(silent) {
			this.ignore = true;
		}

		if(!this.settings.fullsize) {
			this.container.scrollLeft = x;
			this.container.scrollTop = y;
		} else {
			window.scrollTo(x,y);
		}
		this.scrolled = true;
	}

	onScroll(){
		let scrollTop;
		let scrollLeft;

		if(!this.settings.fullsize) {
			scrollTop = this.container.scrollTop;
			scrollLeft = this.container.scrollLeft;
		} else {
			scrollTop = window.scrollY;
			scrollLeft = window.scrollX;
		}

		this.scrollTop = scrollTop;
		this.scrollLeft = scrollLeft;

		if(!this.ignore) {
			this.emit(EVENTS.MANAGERS.SCROLL, {
				top: scrollTop,
				left: scrollLeft
			});

			clearTimeout(this.afterScrolled);
			this.afterScrolled = setTimeout(function () {
				this.emit(EVENTS.MANAGERS.SCROLLED, {
					top: this.scrollTop,
					left: this.scrollLeft
				});
			}.bind(this), 20);



		} else {
			this.ignore = false;
		}

	}

	bounds() {
		var bounds;

		bounds = this.stage.bounds();

		return bounds;
	}

	applyLayout(layout) {

		this.layout = layout;
		this.updateLayout();
		 // this.manager.layout(this.layout.format);
	}

	updateLayout() {

		if (!this.stage) {
			return;
		}

		this._stageSize = this.stage.size();

		if(!this.isPaginated) {
			this.layout.calculate(this._stageSize.width, this._stageSize.height);
		} else {
			this.layout.calculate(
				this._stageSize.width,
				this._stageSize.height,
				this.settings.gap
			);

			// Set the look ahead offset for what is visible
			this.settings.offset = this.layout.delta;

			// this.stage.addStyleRules("iframe", [{"margin-right" : this.layout.gap + "px"}]);

		}

		// Set the dimensions for views
		this.viewSettings.width = this.layout.width;
		this.viewSettings.height = this.layout.height;

		this.setLayout(this.layout);
	}

	setLayout(layout){

		this.viewSettings.layout = layout;

		this.mapping = new Mapping(layout.props, this.settings.direction, this.settings.axis);

		if(this.views) {

			this.views.forEach(function(view){
				if (view) {
					view.setLayout(layout);
				}
			});

		}

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
			this.mapping = new Mapping(this.layout.props, this.settings.direction, this.settings.axis);
		}

		if (this.layout) {
			if (axis === "vertical") {
				this.layout.spread("none");
			} else {
				this.layout.spread(this.layout.settings.spread);
			}
		}
	}

	updateFlow(flow){
		let isPaginated = (flow === "paginated" || flow === "auto");

		this.isPaginated = isPaginated;

		if (flow === "scrolled-doc" ||
				flow === "scrolled-continuous" ||
				flow === "scrolled") {
			this.updateAxis("vertical");
		}

		this.viewSettings.flow = flow;

		if (!this.settings.overflow) {
			this.overflow = isPaginated ? "hidden" : "auto";
		} else {
			this.overflow = this.settings.overflow;
		}
		// this.views.forEach(function(view){
		// 	view.setAxis(axis);
		// });

		this.updateLayout();

	}

	getContents(){
		var contents = [];
		if (!this.views) {
			return contents;
		}
		this.views.forEach(function(view){
			const viewContents = view && view.contents;
			if (viewContents) {
				contents.push(viewContents);
			}
		});
		return contents;
	}

	direction(dir="ltr") {
		this.settings.direction = dir;

		this.stage && this.stage.direction(dir);

		this.viewSettings.direction = dir;

		this.updateLayout();
	}

	isRendered() {
		return this.rendered;
	}
}

//-- Enable binding events to Manager
EventEmitter(DefaultViewManager.prototype);

export default DefaultViewManager;
