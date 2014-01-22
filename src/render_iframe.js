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
	this.iframe.id = "epubjs-iframe";
	this.iframe.scrolling = "no";
	
	return this.iframe;
};

/**
* Sets the source of the iframe with the given URL string
* Takes:  URL string
* Returns: promise with document element
*/
EPUBJS.Render.Iframe.prototype.load = function(url){
	var render = this,
			deferred = new RSVP.defer();

	this.leftPos = 0;
	this.iframe.src = url;
	
	if(this.window) {
		this.unload();
	}
	
	this.iframe.onload = function() {
		render.document = render.iframe.contentDocument;
		
		render.docEl = render.document.documentElement;
		render.headEl = render.document.head;
		render.bodyEl = render.document.body;
		render.window = render.iframe.contentWindow;
		
		render.window.addEventListener("resize", render.resized.bind(render), false);

		//-- Clear Margins
		if(render.bodyEl) render.bodyEl.style.margin = "0";
		
		
		deferred.resolve(render.docEl);
	};
	
	this.iframe.onerror = function(e) {
		//console.error("Error Loading Contents", e);
		deferred.reject({
				message : "Error Loading Contents: " + e,
				stack : new Error().stack
			});
	};
	return deferred.promise;
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
	this.width = this.iframe.getBoundingClientRect().width;
	this.height = this.iframe.getBoundingClientRect().height;
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

EPUBJS.Render.Iframe.prototype.setLeft = function(leftPos){
	// this.bodyEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style[EPUBJS.Render.Iframe.transform] = 'translate('+ (-leftPos) + 'px, 0)';
	this.document.defaultView.scrollTo(leftPos, 0);
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

EPUBJS.Render.Iframe.prototype.addHeadTag = function(tag, attrs) {
	var tag = document.createElement(tag);

	for(attr in attrs) {
		tag[attr] = attrs[attr];
	}

	if(this.headEl) this.headEl.appendChild(tag);
};

EPUBJS.Render.Iframe.prototype.page = function(pg){
	this.leftPos = this.pageWidth * (pg-1); //-- pages start at 1
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

// Return the root element of the content
EPUBJS.Render.Iframe.prototype.getBaseElement = function(){
	return this.bodyEl;
};

// Checks if an element is on the screen
EPUBJS.Render.Iframe.prototype.isElementVisible = function(el){
	var rect;

	if(el && typeof el.getBoundingClientRect === 'function'){
		rect = el.getBoundingClientRect();
		if( rect.width !== 0 &&
				rect.height !== 0 && // Element not visible
				rect.left >= 0 &&
				rect.left < this.pageWidth ) {
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