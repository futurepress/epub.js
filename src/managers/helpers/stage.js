import {uuid, isNumber, isElement, windowBounds} from "../../utils/core";
import throttle from 'lodash/throttle'

class Stage {
	constructor(_options) {
		this.settings = _options || {};
		this.id = "epubjs-container-" + uuid();

		this.container = this.create(this.settings);
		this.size = { width: this.settings.width, height: this.settings.height };

		if(this.settings.hidden) {
			this.wrapper = this.wrap(this.container);
		}

	}

	/*
	* Creates an element to render to.
	* Resizes to passed width and height or to the elements size
	*/
	create(options){
		let overflow  = options.overflow || false;
		let axis = options.axis || "vertical";
		let direction = options.direction;
		let scale = options.scale;

		// Create new container element
		let container = document.createElement("div");

		container.id = this.id;
		container.classList.add("epub-container");

		// Style Element
		// container.style.fontSize = "0";
		container.style.wordSpacing = "0";
		container.style.lineHeight = "0";
		container.style.verticalAlign = "top";
		// container.style.position = "relative";

		if(axis === "horizontal") {
			// container.style.whiteSpace = "nowrap";
			container.style.display = "flex";
			container.style.flexDirection = "row";
			container.style.flexWrap = "nowrap";
		}


		if (overflow) {
			container.style.overflow = overflow;
		}

		if (direction) {
			container.dir = direction;
			container.style["direction"] = direction;
		}

		if (direction && this.settings.fullsize) {
			document.body.style["direction"] = direction;
		}

		if (scale) {
			container.style["transform-origin"] = "top left";
			container.style["transform"] = "scale(" + scale + ")";
			container.style.overflow = "visible";
		}

		return container;
	}

	wrap(container) {
		var wrapper = document.createElement("div");

		wrapper.style.visibility = "hidden";
		wrapper.style.overflow = "hidden";
		wrapper.style.width = "0";
		wrapper.style.height = "0";

		wrapper.appendChild(container);
		return wrapper;
	}


	getElement(_element){
		var element;

		if(isElement(_element)) {
			element = _element;
		} else if (typeof _element === "string") {
			element = document.getElementById(_element);
		}

		if(!element){
			throw new Error("Not an Element");
		}

		return element;
	}

	attachTo(what){

		var element = this.getElement(what);
		var base;

		if(!element){
			return;
		}

		if(this.settings.hidden) {
			base = this.wrapper;
		} else {
			base = this.container;
		}

		element.appendChild(base);

		this.element = element;

		return element;

	}

	getContainer() {
		return this.container;
	}

	onResize(func){
		// Only listen to window for resize event if width and height are not fixed.
		// This applies if it is set to a percent or auto.
		if(!isNumber(this.settings.width) ||
			 !isNumber(this.settings.height) ) {
			this.resizeFunc = throttle(func, 50);
			window.addEventListener("resize", this.resizeFunc, false);
		}

	}

	onOrientationChange(func){
		this.orientationChangeFunc = func;
		window.addEventListener("orientationchange", this.orientationChangeFunc, false);
	}

	get size(){
		var bounds;
		var width;
		var height;

		if (this.settings.fullsize) {
			// Bounds not set, get them from window
			bounds = windowBounds();
			width = bounds.width;
			height = bounds.height;
		} else {
			bounds = this.container.getBoundingClientRect();
			width = bounds.width;
			height = bounds.height;
		}

		this.containerStyles = window.getComputedStyle(this.container);

		this.containerPadding = {
			left: parseFloat(this.containerStyles["padding-left"]) || 0,
			right: parseFloat(this.containerStyles["padding-right"]) || 0,
			top: parseFloat(this.containerStyles["padding-top"]) || 0,
			bottom: parseFloat(this.containerStyles["padding-bottom"]) || 0
		};

		return {
			width: width -
							this.containerPadding.left -
							this.containerPadding.right,
			height: height -
							this.containerPadding.top -
							this.containerPadding.bottom
		};

	}

	set size(obj){
		let {width, height} = obj;
		var bounds;

		if (this.settings.fullsize !== true &&
			  typeof width !== "undefined" &&
				typeof height !== "undefined"){

			if(isNumber(width)) {
				this.container.style.width = width + "px";
			} else {
				this.container.style.width = width;
			}

			if(isNumber(height)) {
				this.container.style.height = height + "px";
			} else {
				this.container.style.height = height;
			}

			bounds = this.container.getBoundingClientRect();
			width = bounds.width;
			height = bounds.height;
		}
	}

	bounds(){
		let box;
		if (this.container.style.overflow !== "visible") {
			box = this.container && this.container.getBoundingClientRect();
		}

		if(!box || !box.width || !box.height) {
			return windowBounds();
		} else {
			return box;
		}

	}

	getSheet(){
		var style = document.createElement("style");

		// WebKit hack --> https://davidwalsh.name/add-rules-stylesheets
		style.appendChild(document.createTextNode(""));

		document.head.appendChild(style);

		return style.sheet;
	}

	addStyleRules(selector, rulesArray){
		var scope = "#" + this.id + " ";
		var rules = "";

		if(!this.sheet){
			this.sheet = this.getSheet();
		}

		rulesArray.forEach(function(set) {
			for (var prop in set) {
				if(set.hasOwnProperty(prop)) {
					rules += prop + ":" + set[prop] + ";";
				}
			}
		});

		this.sheet.insertRule(scope + selector + " {" + rules + "}", 0);
	}

	axis(axis) {
		if(axis === "horizontal") {
			this.container.style.display = "flex";
			this.container.style.flexDirection = "row";
			this.container.style.flexWrap = "nowrap";
		} else {
			this.container.style.display = "block";
		}
	}

	// orientation(orientation) {
	// 	if (orientation === "landscape") {
	//
	// 	} else {
	//
	// 	}
	//
	// 	this.orientation = orientation;
	// }

	direction(dir) {
		if (this.container) {
			this.container.dir = dir;
			this.container.style["direction"] = dir;
		}

		if (this.settings.fullsize) {
			document.body.style["direction"] = dir;
		}
	}

	scale(s) {
		if (this.container) {
			this.container.style["transform-origin"] = "top left";
			this.container.style["transform"] = "scale(" + s + ")";
		}
	}

	destroy() {
		var base;

		if (this.element) {

			if(this.settings.hidden) {
				base = this.wrapper;
			} else {
				base = this.container;
			}

			if(this.element.contains(this.container)) {
				this.element.removeChild(this.container);
			}

			window.removeEventListener("resize", this.resizeFunc);
			window.removeEventListener("orientationChange", this.orientationChangeFunc);

		}
	}
}

export default Stage;
