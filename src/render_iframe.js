EPUBJS.Render.Iframe = function() {
	this.iframe = null;
	this.document = null;
	this.window = null;
	this.docEl = null;
	this.bodyEl = null;

	this.leftPos = 0;
	this.pageWidth = 0;
};

//-- Build up any html needed
EPUBJS.Render.Iframe.prototype.create = function(){
	this.iframe = document.createElement('iframe');
	this.iframe.id = "epubjs-iframe:" + EPUBJS.core.uuid();
	this.iframe.scrolling = "no";
	this.iframe.seamless = "seamless";
	// Back up if seamless isn't supported
	this.iframe.style.border = "none";
	
	this.iframe.addEventListener("load", this.loaded.bind(this), false);
	return this.iframe;
};

/**
* Sets the source of the iframe with the given URL string
* Takes:  URL string
* Returns: promise with document element
*/
EPUBJS.Render.Iframe.prototype.load = function(chapter){
	var render = this,
			deferred = new RSVP.defer();
	
	chapter.url().then(function(url){
		// Reset the scroll position
		render.leftPos = 0;
	
		if(this.window) {
			this.unload();
		}
		
		this.iframe.onload = function(e) {
			render.document = render.iframe.contentDocument;
			render.docEl = render.document.documentElement;
			render.headEl = render.document.head;
			render.bodyEl = render.document.body || render.document.querySelector("body");
			render.window = render.iframe.contentWindow;
			
			render.window.addEventListener("resize", render.resized.bind(render), false);
		
			//-- Clear Margins
			if(render.bodyEl) {
				render.bodyEl.style.margin = "0";
			}
			
			// HTML element must have direction set if RTL or columnns will
			// not be in the correct direction in Firefox
			// Firefox also need the html element to be position right
			if(render.direction == "rtl" && render.docEl.dir != "rtl"){
				render.docEl.dir = "rtl";
				render.docEl.style.position = "absolute";
				render.docEl.style.right = "0";
			}

			deferred.resolve(render.docEl);
		};
		
		this.iframe.onerror = function(e) {
			//console.error("Error Loading Contents", e);
			deferred.reject({
					message : "Error Loading Contents: " + e,
					stack : new Error().stack
				});
		};
		
		this.iframe.contentWindow.location.replace(url);
		
	}.bind(this));
	
	return deferred.promise;
};


EPUBJS.Render.Iframe.prototype.loaded = function(v){
	var url = this.iframe.contentWindow.location.href;
	if(url != "about:blank"){
		this.trigger("render:loaded", url);	
	}
};

// Resize the iframe to the given width and height
EPUBJS.Render.Iframe.prototype.resize = function(width, height){
	var iframeBox;
	
	if(!this.iframe) return;
	
	this.iframe.height = height;

	if(!isNaN(width) && width % 2 !== 0){
		width += 1; //-- Prevent cutting off edges of text in columns
	}

	this.iframe.width = width;
	// Get the fractional height and width of the iframe
	// Default to orginal if bounding rect is 0
	this.width = this.iframe.getBoundingClientRect().width || width;
	this.height = this.iframe.getBoundingClientRect().height || height;
};


EPUBJS.Render.Iframe.prototype.resized = function(e){
	// Get the fractional height and width of the iframe
	this.width = this.iframe.getBoundingClientRect().width;
	this.height = this.iframe.getBoundingClientRect().height;
};

EPUBJS.Render.Iframe.prototype.totalWidth = function(){
	return this.docEl.scrollWidth;
};

EPUBJS.Render.Iframe.prototype.totalHeight = function(){
	return this.docEl.scrollHeight;
};

EPUBJS.Render.Iframe.prototype.setPageDimensions = function(pageWidth, pageHeight){
	this.pageWidth = pageWidth;
	this.pageHeight = pageHeight;
	//-- Add a page to the width of the document to account an for odd number of pages
	// this.docEl.style.width = this.docEl.scrollWidth + pageWidth + "px";
};

EPUBJS.Render.Iframe.prototype.setDirection = function(direction){
	
	this.direction = direction;
	
	// Undo previous changes if needed
	if(this.docEl && this.docEl.dir == "rtl"){
		this.docEl.dir = "rtl";
		this.docEl.style.position = "static";
		this.docEl.style.right = "auto";
	}
	
};

EPUBJS.Render.Iframe.prototype.setLeft = function(leftPos){
	// this.bodyEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style[EPUBJS.Render.Iframe.transform] = 'translate('+ (-leftPos) + 'px, 0)';
	
	if (navigator.userAgent.match(/(iPad|iPhone|iPod|Mobile|Android)/g)) {
		this.docEl.style["-webkit-transform"] = 'translate('+ (-leftPos) + 'px, 0)';
	} else {
		this.document.defaultView.scrollTo(leftPos, 0);
	}
	
};

EPUBJS.Render.Iframe.prototype.setStyle = function(style, val, prefixed){
	if(prefixed) {
		style = EPUBJS.core.prefixed(style);
	}

	if(this.bodyEl) this.bodyEl.style[style] = val;
};

EPUBJS.Render.Iframe.prototype.removeStyle = function(style){

	if(this.bodyEl) this.bodyEl.style[style] = '';

};

EPUBJS.Render.Iframe.prototype.addHeadTag = function(tag, attrs, _doc) {
	var doc = _doc || this.document;
	var tagEl = doc.createElement(tag);
	var headEl = doc.head;
	
	for(var attr in attrs) {
		tagEl.setAttribute(attr, attrs[attr]);
	}

	if(headEl) headEl.insertBefore(tagEl, headEl.firstChild);
};

EPUBJS.Render.Iframe.prototype.page = function(pg){
	this.leftPos = this.pageWidth * (pg-1); //-- pages start at 1
	
	// Reverse for rtl langs
	if(this.direction === "rtl"){
		this.leftPos = this.leftPos * -1;
	}

	this.setLeft(this.leftPos);
};

//-- Show the page containing an Element
EPUBJS.Render.Iframe.prototype.getPageNumberByElement = function(el){
	var left, pg;
	if(!el) return;

	left = this.leftPos + el.getBoundingClientRect().left; //-- Calculate left offset compaired to scrolled position
	
	pg = Math.floor(left / this.pageWidth) + 1; //-- pages start at 1
	
	return pg;
};

//-- Show the page containing an Element
EPUBJS.Render.Iframe.prototype.getPageNumberByRect = function(boundingClientRect){
	var left, pg;

	left = this.leftPos + boundingClientRect.left; //-- Calculate left offset compaired to scrolled position
	pg = Math.floor(left / this.pageWidth) + 1; //-- pages start at 1
	
	return pg;
};

// Return the root element of the content
EPUBJS.Render.Iframe.prototype.getBaseElement = function(){
	return this.bodyEl;
};

// Return the document element
EPUBJS.Render.Iframe.prototype.getDocumentElement = function(){
	return this.docEl;
};

// Checks if an element is on the screen
EPUBJS.Render.Iframe.prototype.isElementVisible = function(el){
	var rect;
	var left;

	if(el && typeof el.getBoundingClientRect === 'function'){
		rect = el.getBoundingClientRect();
		left = rect.left; //+ rect.width;
		if( rect.width !== 0 &&
				rect.height !== 0 && // Element not visible
				left >= 0 &&
				left < this.pageWidth ) {
			return true;
		}
	}

	return false;
};


EPUBJS.Render.Iframe.prototype.scroll = function(bool){
	if(bool) {
		this.iframe.scrolling = "yes";
	} else {
		this.iframe.scrolling = "no";
	}
};

// Cleanup event listeners
EPUBJS.Render.Iframe.prototype.unload = function(){
	this.window.removeEventListener("resize", this.resized);
};

//-- Enable binding events to Render
RSVP.EventTarget.mixin(EPUBJS.Render.Iframe.prototype);