import EventEmitter from "event-emitter";
import {extend, borders, uuid, isNumber, bounds, defer} from "../../utils/core";
import EpubCFI from "../../epubcfi";
import Contents from "../../contents";

class IframeView {
	constructor(section, options) {
		this.settings = extend({
			ignoreClass : "",
			axis: "vertical",
			width: 0,
			height: 0,
			layout: undefined,
			globalLayoutProperties: {},
		}, options || {});

		this.id = "epubjs-view-" + uuid();
		this.section = section;
		this.index = section.index;

		this.element = this.container(this.settings.axis);

		this.added = false;
		this.displayed = false;
		this.rendered = false;

		// this.width  = this.settings.width;
		// this.height = this.settings.height;

		this.fixedWidth  = 0;
		this.fixedHeight = 0;

		// Blank Cfi for Parsing
		this.epubcfi = new EpubCFI();

		this.layout = this.settings.layout;
		// Dom events to listen for
		// this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];
	}

	container(axis) {
		var element = document.createElement("div");

		element.classList.add("epub-view");

		// this.element.style.minHeight = "100px";
		element.style.height = "0px";
		element.style.width = "0px";
		element.style.overflow = "hidden";

		if(axis && axis == "horizontal"){
			element.style.display = "block";
			element.style.flex = "none";
		} else {
			element.style.display = "block";
		}

		return element;
	}

	create() {

		if(this.iframe) {
			return this.iframe;
		}

		if(!this.element) {
			this.element = this.createContainer();
		}

		this.iframe = document.createElement("iframe");
		this.iframe.id = this.id;
		this.iframe.scrolling = "no"; // Might need to be removed: breaks ios width calculations
		this.iframe.style.overflow = "hidden";
		this.iframe.seamless = "seamless";
		// Back up if seamless isn't supported
		this.iframe.style.border = "none";

		this.iframe.setAttribute("enable-annotation", "true");

		this.resizing = true;

		// this.iframe.style.display = "none";
		this.element.style.visibility = "hidden";
		this.iframe.style.visibility = "hidden";

		this.iframe.style.width = "0";
		this.iframe.style.height = "0";
		this._width = 0;
		this._height = 0;

		this.element.setAttribute("ref", this.index);

		this.element.appendChild(this.iframe);
		this.added = true;

		this.elementBounds = bounds(this.element);

		// if(width || height){
		//   this.resize(width, height);
		// } else if(this.width && this.height){
		//   this.resize(this.width, this.height);
		// } else {
		//   this.iframeBounds = bounds(this.iframe);
		// }

		// Firefox has trouble with baseURI and srcdoc
		// TODO: Disable for now in firefox


		if(("srcdoc" in this.iframe)) {
			this.supportsSrcdoc = true;
		} else {
			this.supportsSrcdoc = false;
		}

		return this.iframe;
	}

	render(request, show) {

		// view.onLayout = this.layout.format.bind(this.layout);
		this.create();

		// Fit to size of the container, apply padding
		this.size();

		if(!this.sectionRender) {
			this.sectionRender = this.section.render(request);
		}

		// Render Chain
		return this.sectionRender
			.then(function(contents){
				return this.load(contents);
			}.bind(this))
			.then(function(){

				// apply the layout function to the contents
				this.settings.layout.format(this.contents);

				// Listen for events that require an expansion of the iframe
				this.addListeners();

				return new Promise((resolve, reject) => {
					// Expand the iframe to the full size of the content
					this.expand();
					resolve();
				});

			}.bind(this))
			.then(function() {
				this.emit("rendered", this.section);
			}.bind(this))
			.catch(function(e){
				this.emit("loaderror", e);
			}.bind(this));

	}

	reset () {
		if (this.iframe) {
			this.iframe.style.width = "0";
			this.iframe.style.height = "0";
			this._width = 0;
			this._height = 0;
			this._textWidth = undefined;
			this._contentWidth = undefined;
			this._textHeight = undefined;
			this._contentHeight = undefined;
		}
		this._needsReframe = true;
	}

	// Determine locks base on settings
	size(_width, _height) {
		var width = _width || this.settings.width;
		var height = _height || this.settings.height;

		if(this.layout.name === "pre-paginated") {
			this.lock("both", width, height);
		} else if(this.settings.axis === "horizontal") {
			this.lock("height", width, height);
		} else {
			this.lock("width", width, height);
		}
	}

	// Lock an axis to element dimensions, taking borders into account
	lock(what, width, height) {
		var elBorders = borders(this.element);
		var iframeBorders;

		if(this.iframe) {
			iframeBorders = borders(this.iframe);
		} else {
			iframeBorders = {width: 0, height: 0};
		}

		if(what == "width" && isNumber(width)){
			this.lockedWidth = width - elBorders.width - iframeBorders.width;
			// this.resize(this.lockedWidth, width); //  width keeps ratio correct
		}

		if(what == "height" && isNumber(height)){
			this.lockedHeight = height - elBorders.height - iframeBorders.height;
			// this.resize(width, this.lockedHeight);
		}

		if(what === "both" &&
			 isNumber(width) &&
			 isNumber(height)){

			this.lockedWidth = width - elBorders.width - iframeBorders.width;
			this.lockedHeight = height - elBorders.height - iframeBorders.height;
			// this.resize(this.lockedWidth, this.lockedHeight);
		}

		if(this.displayed && this.iframe) {

			// this.contents.layout();
			this.expand();
		}



	}

	// Resize a single axis based on content dimensions
	expand(force) {
		var width = this.lockedWidth;
		var height = this.lockedHeight;
		var columns;

		var textWidth, textHeight;

		if(!this.iframe || this._expanding) return;

		if(this.layout.name === "pre-paginated") return;

		this._expanding = true;

		// Expand Horizontally
		if(this.settings.axis === "horizontal") {
			// Get the width of the text
			width = this.contents.textWidth();

			if (width % this.layout.pageWidth > 0) {
				width = Math.ceil(width / this.layout.pageWidth) * this.layout.pageWidth;
			}

			/*
			columns = Math.ceil(width / this.settings.layout.delta);
			if ( this.settings.layout.divisor > 1 &&
					 this.settings.layout.name === "reflowable" &&
					(columns % 2 > 0)) {
				// add a blank page
				width += this.settings.layout.gap + this.settings.layout.columnWidth;
			}
			*/
		} // Expand Vertically
		else if(this.settings.axis === "vertical") {
			height = this.contents.textHeight();
		}

		// Only Resize if dimensions have changed or
		// if Frame is still hidden, so needs reframing
		if(this._needsReframe || width != this._width || height != this._height){
			this.reframe(width, height);
		}

		this._expanding = false;
	}

	reframe(width, height) {
		var size;

		if(isNumber(width)){
			this.element.style.width = width + "px";
			this.iframe.style.width = width + "px";
			this._width = width;
		}

		if(isNumber(height)){
			this.element.style.height = height + "px";
			this.iframe.style.height = height + "px";
			this._height = height;
		}

		let widthDelta = this.prevBounds ? width - this.prevBounds.width : width;
		let heightDelta = this.prevBounds ? height - this.prevBounds.height : height;

		size = {
			width: width,
			height: height,
			widthDelta: widthDelta,
			heightDelta: heightDelta,
		};

		this.onResize(this, size);

		this.emit("resized", size);

		this.prevBounds = size;

	}


	load(contents) {
		var loading = new defer();
		var loaded = loading.promise;

		if(!this.iframe) {
			loading.reject(new Error("No Iframe Available"));
			return loaded;
		}

		this.iframe.onload = function(event) {

			this.onLoad(event, loading);

		}.bind(this);

		if(this.supportsSrcdoc){
			this.iframe.srcdoc = contents;
		} else {

			this.document = this.iframe.contentDocument;

			if(!this.document) {
				loading.reject(new Error("No Document Available"));
				return loaded;
			}

			this.iframe.contentDocument.open();
			this.iframe.contentDocument.write(contents);
			this.iframe.contentDocument.close();

		}

		return loaded;
	}

	onLoad(event, promise) {

		this.window = this.iframe.contentWindow;
		this.document = this.iframe.contentDocument;

		this.contents = new Contents(this.document, this.document.body, this.section.cfiBase, this.section.index);

		this.rendering = false;

		var link = this.document.querySelector("link[rel='canonical']");
		if (link) {
			link.setAttribute("href", this.section.url);
		} else {
			link = this.document.createElement("link");
			link.setAttribute("rel", "canonical");
			link.setAttribute("href", this.section.url);
			this.document.querySelector("head").appendChild(link);
		}

		this.contents.on("expand", () => {
			if(this.displayed && this.iframe) {
				this.expand();
				if (this.contents) {
					this.settings.layout.format(this.contents);
				}
			}
		});

		this.contents.on("resize", (e) => {
			if(this.displayed && this.iframe) {
				this.expand();
				if (this.contents) {
					this.settings.layout.format(this.contents);
				}
			}
		});

		promise.resolve(this.contents);
	}

	setLayout(layout) {
		this.layout = layout;
	}

	setAxis(axis) {
		this.settings.axis = axis;
	}

	addListeners() {
		//TODO: Add content listeners for expanding
	}

	removeListeners(layoutFunc) {
		//TODO: remove content listeners for expanding
	}

	display(request) {
		var displayed = new defer();

		if (!this.displayed) {

			this.render(request).then(function () {

				this.emit("displayed", this);
				this.onDisplayed(this);

				this.displayed = true;
				displayed.resolve(this);

			}.bind(this));

		} else {
			displayed.resolve(this);
		}


		return displayed.promise;
	}

	show() {

		this.element.style.visibility = "visible";

		if(this.iframe){
			this.iframe.style.visibility = "visible";
		}

		this.emit("shown", this);
	}

	hide() {
		// this.iframe.style.display = "none";
		this.element.style.visibility = "hidden";
		this.iframe.style.visibility = "hidden";

		this.stopExpanding = true;
		this.emit("hidden", this);
	}

	offset() {
		return {
			top: this.element.offsetTop,
			left: this.element.offsetLeft
		}
	}

	width() {
		return this._width;
	}

	height() {
		return this._height;
	}

	position() {
		return this.element.getBoundingClientRect();
	}

	locationOf(target) {
		var parentPos = this.iframe.getBoundingClientRect();
		var targetPos = this.contents.locationOf(target, this.settings.ignoreClass);

		return {
			"left": targetPos.left,
			"top": targetPos.top
		};
	}

	onDisplayed(view) {
		// Stub, override with a custom functions
	}

	onResize(view, e) {
		// Stub, override with a custom functions
	}

	bounds() {
		if(!this.elementBounds) {
			this.elementBounds = bounds(this.element);
		}
		return this.elementBounds;
	}

	destroy() {

		if(this.displayed){
			this.displayed = false;

			this.removeListeners();

			this.stopExpanding = true;
			this.element.removeChild(this.iframe);
			this.displayed = false;
			this.iframe = null;

			this._textWidth = null;
			this._textHeight = null;
			this._width = null;
			this._height = null;
		}
		// this.element.style.height = "0px";
		// this.element.style.width = "0px";
	}
}

EventEmitter(IframeView.prototype);

export default IframeView;
