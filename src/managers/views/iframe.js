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

		this.width  = this.settings.width;
		this.height = this.settings.height;

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
			element.style.display = "inline-block";
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

		this.resizing = true;

		// this.iframe.style.display = "none";
		this.element.style.visibility = "hidden";
		this.iframe.style.visibility = "hidden";

		this.iframe.style.width = "0";
		this.iframe.style.height = "0";
		this._width = 0;
		this._height = 0;

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

		if("srcdoc" in this.iframe && !this.settings.globalOptions.disableSrcdoc) {
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
			// .then(function(doc){
			// 	return this.hooks.content.trigger(view, this);
			// }.bind(this))
			.then(function(){
				// this.settings.layout.format(view.contents);
				// return this.hooks.layout.trigger(view, this);
			}.bind(this))
			// .then(function(){
			// 	return this.display();
			// }.bind(this))
			// .then(function(){
			// 	return this.hooks.render.trigger(view, this);
			// }.bind(this))
			.then(function(){

				// apply the layout function to the contents
				this.settings.layout.format(this.contents);

				// Expand the iframe to the full size of the content
				this.expand();

				// Listen for events that require an expansion of the iframe
				this.addListeners();

				if(show !== false) {
					//this.q.enqueue(function(view){
						// this.show();
					//}, view);
				}
				// this.map = new Map(view, this.layout);
				//this.hooks.show.trigger(view, this);
				this.emit("rendered", this.section);

			}.bind(this))
			.catch(function(e){
				this.emit("loaderror", e);
			}.bind(this));

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
			this.resize(this.lockedWidth, width); //  width keeps ratio correct
		}

		if(what == "height" && isNumber(height)){
			this.lockedHeight = height - elBorders.height - iframeBorders.height;
			this.resize(width, this.lockedHeight);
		}

		if(what === "both" &&
			 isNumber(width) &&
			 isNumber(height)){

			this.lockedWidth = width - elBorders.width - iframeBorders.width;
			this.lockedHeight = height - elBorders.height - iframeBorders.height;
			this.resize(this.lockedWidth, this.lockedHeight);
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
		// if(height && !width) {
		if(this.settings.axis === "horizontal") {
			// Get the width of the text
			textWidth = this.contents.textWidth();
			width = this.contentWidth(textWidth);

			// Check if the textWidth has changed
			if(width != this._width){
				// Get the contentWidth by resizing the iframe
				// Check with a min reset of the textWidth

				// width = this.contentWidth(textWidth);

				columns = Math.ceil(width / (this.settings.layout.columnWidth + this.settings.layout.gap));

				if ( this.settings.layout.divisor > 1 &&
						 this.settings.layout.name === "reflowable" &&
						(columns % 2 > 0)) {
					// add a blank page
					width += this.settings.layout.gap + this.settings.layout.columnWidth;
				}

				// Save the textWdith
				this._textWidth = textWidth;

				// Save the contentWidth
				this._contentWidth = width;
			} else {
				// Otherwise assume content height hasn't changed
				width = this._contentWidth;
			}
		} // Expand Vertically
		else if(this.settings.axis === "vertical") {
			textHeight = this.contents.textHeight();
			if(textHeight != this._textHeight){
				height = this.contentHeight(textHeight);
				this._textHeight = textHeight;
				this._contentHeight = height;
			} else {
				height = this._contentHeight;
			}

		}

		// Only Resize if dimensions have changed or
		// if Frame is still hidden, so needs reframing
		if(this._needsReframe || width != this._width || height != this._height){
			this.resize(width, height);
		}

		this._expanding = false;
	}

	contentWidth(min) {
		var prev;
		var width;

		// Save previous width
		prev = this.iframe.style.width;
		// Set the iframe size to min, width will only ever be greater
		// Will preserve the aspect ratio
		this.iframe.style.width = (min || 0) + "px";
		// Get the scroll overflow width
		width = this.contents.scrollWidth();
		// Reset iframe size back
		this.iframe.style.width = prev;
		return width;
	}

	contentHeight(min) {
		var prev;
		var height;

		prev = this.iframe.style.height;
		this.iframe.style.height = (min || 0) + "px";
		height = this.contents.scrollHeight();

		this.iframe.style.height = prev;
		return height;
	}


	resize(width, height) {

		if(!this.iframe) return;

		if(isNumber(width)){
			this.iframe.style.width = width + "px";
			this._width = width;
		}

		if(isNumber(height)){
			this.iframe.style.height = height + "px";
			this._height = height;
		}

		this.iframeBounds = bounds(this.iframe);

		this.reframe(this.iframeBounds.width, this.iframeBounds.height);

	}

	reframe(width, height) {
		var size;

		// if(!this.displayed) {
		//   this._needsReframe = true;
		//   return;
		// }

		if(isNumber(width)){
			this.element.style.width = width + "px";
		}

		if(isNumber(height)){
			this.element.style.height = height + "px";
		}

		this.prevBounds = this.elementBounds;

		this.elementBounds = bounds(this.element);

		size = {
			width: this.elementBounds.width,
			height: this.elementBounds.height,
			widthDelta: this.elementBounds.width - this.prevBounds.width,
			heightDelta: this.elementBounds.height - this.prevBounds.height,
		};

		this.onResize(this, size);

		if (this.contents) {
			this.settings.layout.format(this.contents);
		}

		this.emit("resized", size);

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

		this.contents = new Contents(this.document, this.document.body, this.section.cfiBase);

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

		this.contents.on("expand", function () {
			if(this.displayed && this.iframe) {
				this.expand();
			}
		});

		promise.resolve(this.contents);
	}



	// layout(layoutFunc) {
	//
	//   this.iframe.style.display = "inline-block";
	//
	//   // Reset Body Styles
	//   // this.document.body.style.margin = "0";
	//   //this.document.body.style.display = "inline-block";
	//   //this.document.documentElement.style.width = "auto";
	//
	//   if(layoutFunc){
	//     this.layoutFunc = layoutFunc;
	//   }
	//
	//   this.contents.layout(this.layoutFunc);
	//
	// };
	//
	// onLayout(view) {
	//   // stub
	// };

	setLayout(layout) {
		this.layout = layout;
	}

	setAxis(axis) {
		this.settings.axis = axis;
	}

	resizeListenters() {
		// Test size again
		clearTimeout(this.expanding);
		this.expanding = setTimeout(this.expand.bind(this), 350);
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

	position() {
		return this.element.getBoundingClientRect();
	}

	locationOf(target) {
		var parentPos = this.iframe.getBoundingClientRect();
		var targetPos = this.contents.locationOf(target, this.settings.ignoreClass);

		return {
			"left": window.scrollX + parentPos.left + targetPos.left,
			"top": window.scrollY + parentPos.top + targetPos.top
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
