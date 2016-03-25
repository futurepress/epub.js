var core = require('./core');

function Stage(element, _options) {
	this.settings = _options || {};

	this.element = this.getElement(element);
	this.container = this.create(this.settings);

	if(this.settings.hidden) {
		this.wrapper = this.wrap(this.container);
		this.attachTo(this.wrapper, this.element);
	} else {
		this.attachTo(this.container, this.element);
	}

}

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
Stage.prototype.create = function(options){
	var height  = options.height;// !== false ? options.height : "100%";
	var width   = options.width;// !== false ? options.width : "100%";
	var overflow  = options.overflow || false;

	if(options.height && core.isNumber(options.height)) {
		height = options.height + "px";
	}

	if(options.width && core.isNumber(options.width)) {
		width = options.width + "px";
	}

	// Create new container element
	container = document.createElement("div");

	container.id = "epubjs-container:" + core.uuid();
	container.classList.add("epub-container");

	// Style Element
	container.style.fontSize = "0";
	container.style.wordSpacing = "0";
	container.style.lineHeight = "0";
	container.style.verticalAlign = "top";

	if(this.settings.axis === "horizontal") {
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
};

Stage.wrap = function(container) {
	var wrapper = document.createElement("div");

	wrapper.style.visibility = "hidden";
	wrapper.style.overflow = "hidden";
	wrapper.style.width = "0";
	wrapper.style.height = "0";

	wrapper.appendChild(container);
	return wrapper;
};


Stage.prototype.getElement = function(_element){
	var element;

	if(core.isElement(_element)) {
		element = _element;
	} else if (typeof _element === "string") {
		element = document.getElementById(_element);
	}

	if(!element){
		console.error("Not an Element");
		return;
	}

	return element;
};

Stage.prototype.attachTo = function(what, element){

	if(!element){
		return;
	}

	element.appendChild(what);

	return element;

};

Stage.prototype.getContainer = function() {
	return this.container;
};

Stage.prototype.onResize = function(func){
	// Only listen to window for resize event if width and height are not fixed.
	// This applies if it is set to a percent or auto.
	if(!core.isNumber(this.settings.width) ||
		 !core.isNumber(this.settings.height) ) {
		window.addEventListener("resize", func, false);
	}

};

Stage.prototype.bounds = function(_width, _height){
	var bounds;
	var width = _width || this.settings.width;
	var height = _height || this.settings.height;

	// If width or height are set to false, inherit them from containing element
	if(width === false) {
		bounds = this.element.getBoundingClientRect();

		if(bounds.width) {
			width = bounds.width;
			this.container.style.width = bounds.width + "px";
		}
	}

	if(height === false) {
		bounds = bounds || this.element.getBoundingClientRect();

		if(bounds.height) {
			height = bounds.height;
			this.container.style.height = bounds.height + "px";
		}

	}

	if(width && !core.isNumber(width)) {
		bounds = this.container.getBoundingClientRect();
		width = bounds.width;
		//height = bounds.height;
	}

	if(height && !core.isNumber(height)) {
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

};

module.exports = Stage;
