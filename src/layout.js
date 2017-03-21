EPUBJS.Layout = EPUBJS.Layout || {};

// EPUB2 documents won't provide us with "rendition:layout", so this is used to
// duck type the documents instead.
EPUBJS.Layout.isFixedLayout = function (documentElement) {
	var viewport = documentElement.querySelector("[name=viewport]");
	if (!viewport || !viewport.hasAttribute("content")) {
		return false;
	}
	var content = viewport.getAttribute("content");
	return (/width=(\d+)/.test(content) && /height=(\d+)/.test(content));
};

EPUBJS.Layout.Reflowable = function(){
	this.documentElement = null;
	this.spreadWidth = null;
};

EPUBJS.Layout.Reflowable.prototype.format = function(documentElement, _width, _height, _gap){
	// Get the prefixed CSS commands
	var columnAxis = EPUBJS.core.prefixed('columnAxis');
	var columnGap = EPUBJS.core.prefixed('columnGap');
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	var columnFill = EPUBJS.core.prefixed('columnFill');

	//-- Check the width and create even width columns
	var width = Math.floor(_width);
	// var width = (fullWidth % 2 === 0) ? fullWidth : fullWidth - 0; // Not needed for single
	var section = Math.floor(width / 8);
	var gap = (_gap >= 0) ? _gap : ((section % 2 === 0) ? section : section - 1);
	this.documentElement = documentElement;
	//-- Single Page
	this.spreadWidth = (width + gap);


	documentElement.style.overflow = "hidden";

	// Must be set to the new calculated width or the columns will be off
	documentElement.style.width = width + "px";

	//-- Adjust height
	documentElement.style.height = _height + "px";

	//-- Add columns
	documentElement.style[columnAxis] = "horizontal";
	documentElement.style[columnFill] = "auto";
	documentElement.style[columnWidth] = width+"px";
	documentElement.style[columnGap] = gap+"px";
	this.colWidth = width;
	this.gap = gap;

	return {
		pageWidth : this.spreadWidth,
		pageHeight : _height
	};
};

EPUBJS.Layout.Reflowable.prototype.calculatePages = function() {
	var totalWidth, displayedPages;
	this.documentElement.style.width = "auto"; //-- reset width for calculations
	totalWidth = this.documentElement.scrollWidth;
	displayedPages = Math.ceil(totalWidth / this.spreadWidth);

	return {
		displayedPages : displayedPages,
		pageCount : displayedPages
	};
};

EPUBJS.Layout.ReflowableSpreads = function(){
	this.documentElement = null;
	this.spreadWidth = null;
};

EPUBJS.Layout.ReflowableSpreads.prototype.format = function(documentElement, _width, _height, _gap){
	var columnAxis = EPUBJS.core.prefixed('columnAxis');
	var columnGap = EPUBJS.core.prefixed('columnGap');
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	var columnFill = EPUBJS.core.prefixed('columnFill');

	var divisor = 2,
			cutoff = 800;

	//-- Check the width and create even width columns
	var fullWidth = Math.floor(_width);
	var width = (fullWidth % 2 === 0) ? fullWidth : fullWidth - 1;

	var section = Math.floor(width / 8);
	var gap = (_gap >= 0) ? _gap : ((section % 2 === 0) ? section : section - 1);

	//-- Double Page
	var colWidth = Math.floor((width - gap) / divisor);

	this.documentElement = documentElement;
	this.spreadWidth = (colWidth + gap) * divisor;


	documentElement.style.overflow = "hidden";

	// Must be set to the new calculated width or the columns will be off
	documentElement.style.width = width + "px";

	//-- Adjust height
	documentElement.style.height = _height + "px";

	//-- Add columns
	documentElement.style[columnAxis] = "horizontal";
	documentElement.style[columnFill] = "auto";
	documentElement.style[columnGap] = gap+"px";
	documentElement.style[columnWidth] = colWidth+"px";

	this.colWidth = colWidth;
	this.gap = gap;
	return {
		pageWidth : this.spreadWidth,
		pageHeight : _height
	};
};

EPUBJS.Layout.ReflowableSpreads.prototype.calculatePages = function() {
	var totalWidth = this.documentElement.scrollWidth;
	var displayedPages = Math.ceil(totalWidth / this.spreadWidth);

	//-- Add a page to the width of the document to account an for odd number of pages
	this.documentElement.style.width = ((displayedPages * this.spreadWidth) - this.gap) + "px";

	return {
		displayedPages : displayedPages,
		pageCount : displayedPages * 2
	};
};

EPUBJS.Layout.Fixed = function(){
	this.documentElement = null;
};

EPUBJS.Layout.Fixed.prototype.format = function(documentElement, _width, _height, _gap){
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	var transform = EPUBJS.core.prefixed('transform');
	var transformOrigin = EPUBJS.core.prefixed('transformOrigin');
	var viewport = documentElement.querySelector("[name=viewport]");
	var content;
	var contents;
	var width, height;
	this.documentElement = documentElement;
	/**
	* check for the viewport size
	* <meta name="viewport" content="width=1024,height=697" />
	*/
	if(viewport && viewport.hasAttribute("content")) {
		content = viewport.getAttribute("content");
		contents = content.split(',');
		if(contents[0]){
			width = contents[0].replace("width=", '');
		}
		if(contents[1]){
			height = contents[1].replace("height=", '');
		}
	}

	//-- Scale fixed documents so their contents don't overflow, and
	// vertically and horizontally center the contents
	var widthScale = _width / width;
	var heightScale = _height / height;
	var scale = widthScale < heightScale ? widthScale : heightScale;
	documentElement.style.position = "absolute";
	documentElement.style.top = "50%";
	documentElement.style.left = "50%";
	documentElement.style[transform] = "scale(" + scale + ") translate(-50%, -50%)";
	documentElement.style[transformOrigin] = "0px 0px 0px";

	//-- Adjust width and height
	documentElement.style.width =  width + "px" || "auto";
	documentElement.style.height =  height + "px" || "auto";

	//-- Remove columns
	documentElement.style[columnWidth] = "auto";

	//-- Scroll
	documentElement.style.overflow = "auto";

	this.colWidth = width;
	this.gap = 0;

	return {
		pageWidth : width,
		pageHeight : height
	};

};

EPUBJS.Layout.Fixed.prototype.calculatePages = function(){
	return {
		displayedPages : 1,
		pageCount : 1
	};
};
