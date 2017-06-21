import {uuid, isNumber, isElement, windowBounds} from "../../utils/core";

class Stage {
	constructor(_options) {
		this.settings = _options || {};
		this.id = "epubjs-container-" + uuid();

		this.container = this.create(this.settings);

		if(this.settings.hidden) {
			this.wrapper = this.wrap(this.container);
		}

	}

	/*
	* Creates an element to render to.
	* Resizes to passed width and height or to the elements size
	*/
	create(options){
		var height  = options.height;// !== false ? options.height : "100%";
		var width   = options.width;// !== false ? options.width : "100%";
		var overflow  = options.overflow || false;
		var axis = options.axis || "vertical";

		if(options.height && isNumber(options.height)) {
			height = options.height + "px";
		}

		if(options.width && isNumber(options.width)) {
			width = options.width + "px";
		}

		// Create new container element
		let container = document.createElement("div");

		container.id = this.id;
		container.classList.add("epub-container");

		// Style Element
		// container.style.fontSize = "0";
		container.style.wordSpacing = "0";
		container.style.lineHeight = "0";
		container.style.verticalAlign = "top";

		if(axis === "horizontal") {
			container.style.whiteSpace = "nowrap";
		}

		if(width){
			container.style.width = width;
		}

		if(height){
			container.style.height = height;
		}

		if (overflow) {
			container.style.overflow = overflow;
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
			window.addEventListener("resize", func, false);
		}

	}

	size(width, height){
		var bounds;
		// var width = _width || this.settings.width;
		// var height = _height || this.settings.height;

		// If width or height are set to false, inherit them from containing element
		if(width === null) {
			bounds = this.element.getBoundingClientRect();

			if(bounds.width) {
				width = bounds.width;
				this.container.style.width = bounds.width + "px";
			}
		}

		if(height === null) {
			bounds = bounds || this.element.getBoundingClientRect();

			if(bounds.height) {
				height = bounds.height;
				this.container.style.height = bounds.height + "px";
			}

		}

		if(!isNumber(width)) {
			bounds = this.container.getBoundingClientRect();
			width = bounds.width;
			//height = bounds.height;
		}

		if(!isNumber(height)) {
			bounds = bounds || this.container.getBoundingClientRect();
			//width = bounds.width;
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

	bounds(){
		let box = this.container && this.container.getBoundingClientRect();
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
		}
	}
}

export default Stage;
