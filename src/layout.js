EPUBJS.Layout = EPUBJS.Layout || {};

EPUBJS.Layout.Reflowable = function(documentElement, _width, _height){
	var columnAxis = EPUBJS.core.prefixed('columnAxis');
	var columnGap = EPUBJS.core.prefixed('columnGap');
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	
	//-- Check the width and decied on columns
	var width = (_width % 2 == 0) ? _width : Math.floor(_width) - 1;
	var section = Math.ceil(width / 8);
	var gap = (section % 2 == 0) ? section : section - 1;

	//-- Single Page
	var spreadWidth = (width + gap);
	var totalWidth, displayedPages;

	documentElement.style.width = "auto"; //-- reset width for calculations



	documentElement.style.overflow = "hidden";

	documentElement.style.width = width + "px";

	//-- Adjust height
	documentElement.style.height = _height + "px";

	//-- Add columns
	documentElement.style[columnAxis] = "horizontal";
	documentElement.style[columnGap] = gap+"px";
	documentElement.style[columnWidth] = width+"px";

	totalWidth = documentElement.scrollWidth;
	displayedPages = Math.ceil(totalWidth / spreadWidth);	
	
	// documentElement.style.width = totalWidth + spreadWidth + "px";

	return {
		pageWidth : spreadWidth,
		pageHeight : _height,
		displayedPages : displayedPages
	};
};

EPUBJS.Layout.ReflowableSpreads = function(documentElement, _width, _height){
	var columnAxis = EPUBJS.core.prefixed('columnAxis');
	var columnGap = EPUBJS.core.prefixed('columnGap');
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	
	var divisor = 2,
			cutoff = 800;

	//-- Check the width and decied on columns
	var width = (_width % 2 == 0) ? _width : Math.floor(_width) - 1;
	var section = Math.ceil(width / 8);
	var gap = (section % 2 == 0) ? section : section - 1;

	//-- Double Page
	var colWidth = Math.floor((width - gap) / divisor);
	var spreadWidth = (colWidth + gap) * divisor;

	var totalWidth, displayedPages;
	
	documentElement.style.width = "auto"; //-- reset width for calculations
	
	documentElement.style.overflow = "hidden";

	documentElement.style.width = width + "px";

	//-- Adjust height
	documentElement.style.height = _height	+ "px";

	//-- Add columns
	documentElement.style[columnAxis] = "horizontal";
	documentElement.style[columnGap] = gap+"px";
	documentElement.style[columnWidth] = colWidth+"px";
	
	totalWidth = documentElement.scrollWidth;
	displayedPages = Math.ceil(totalWidth / spreadWidth);
	
	documentElement.style.width = totalWidth + spreadWidth + "px";

	return {
		pageWidth : spreadWidth,
		pageHeight : _height,
		displayedPages : displayedPages
	};
};

EPUBJS.Layout.Fixed = function(documentElement, _width, _height){
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	
	var totalWidth = documentElement.scrollWidth;
	var totalHeight = documentElement.scrollHeight;
	
	documentElement.style.width = _width;

	//-- Adjust height
	documentElement.style.height = "auto";

	//-- Remove columns
	documentElement.style[columnWidth] = "auto";

	//-- Scroll
	documentElement.style.overflow = "auto";
	// this.iframe.scrolling = "yes";

	// this.displayedPages = 1;
	return {
		pageWidth : totalWidth,
		pageHeight : totalHeight,
		displayedPages : 1
	};
	
};