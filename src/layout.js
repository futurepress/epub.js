EPUBJS.Layout = EPUBJS.Layout || {};

EPUBJS.Layout.Reflowable = function(documentElement, _width, _height){
	// Get the prefixed CSS commands
	var columnAxis = EPUBJS.core.prefixed('columnAxis');
	var columnGap = EPUBJS.core.prefixed('columnGap');
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	
	//-- Check the width and decied on columns
	var width = (_width % 2 === 0) ? _width : Math.floor(_width) - 1;
	var section = Math.ceil(width / 8);
	var gap = (section % 2 === 0) ? section : section - 1;

	//-- Single Page
	var spreadWidth = (width + gap);
	var totalWidth, displayedPages;

	documentElement.style.width = "auto"; //-- reset width for calculations

	documentElement.style.overflow = "hidden";

	//-- Adjust height
	documentElement.style.height = _height + "px";

	//-- Add columns
	documentElement.style[columnAxis] = "horizontal";
	documentElement.style[columnGap] = gap+"px";
	documentElement.style[columnWidth] = width+"px";

	documentElement.style.width = width + "px";
	

	totalWidth = documentElement.scrollWidth;
	displayedPages = Math.round(totalWidth / spreadWidth);

	return {
		pageWidth : spreadWidth,
		pageHeight : _height,
		displayedPages : displayedPages,
		pageCount : displayedPages
	};
};

EPUBJS.Layout.ReflowableSpreads = function(documentElement, _width, _height){
	var columnAxis = EPUBJS.core.prefixed('columnAxis');
	var columnGap = EPUBJS.core.prefixed('columnGap');
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	
	var divisor = 2,
			cutoff = 800;

	//-- Check the width and create even width columns
	var width = (_width % 2 === 0) ? _width : Math.floor(_width) - 1;
	var section = Math.ceil(width / 8);
	var gap = (section % 2 === 0) ? section : section - 1;

	//-- Double Page
	var colWidth = Math.floor((width - gap) / divisor);
	var spreadWidth = (colWidth + gap) * divisor;

	var totalWidth, displayedPages;
	
	documentElement.style.width = "auto"; //-- reset width for calculations
	
	documentElement.style.overflow = "hidden";

	documentElement.style.width = width + "px";

	//-- Adjust height
	documentElement.style.height = _height + "px";

	//-- Add columns
	documentElement.style[columnAxis] = "horizontal";
	documentElement.style[columnGap] = gap+"px";
	documentElement.style[columnWidth] = colWidth+"px";
	
	totalWidth = documentElement.scrollWidth;
	displayedPages = Math.ceil(totalWidth / spreadWidth);
	
	//-- Add a page to the width of the document to account an for odd number of pages
	documentElement.style.width = totalWidth + spreadWidth + "px";

	return {
		pageWidth : spreadWidth,
		pageHeight : _height,
		displayedPages : displayedPages,
		pageCount : displayedPages * 2
	};
};

EPUBJS.Layout.Fixed = function(documentElement, _width, _height){
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	var viewport = documentElement.querySelector("[name=viewport");
	var content;
	var contents;
	var width, height;

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
	
	//-- Adjust width and height
	documentElement.style.width =  width + "px" || "auto";
	documentElement.style.height =  height + "px" || "auto";

	//-- Remove columns
	documentElement.style[columnWidth] = "auto";

	//-- Scroll
	documentElement.style.overflow = "auto";

	
	return {
		pageWidth : width,
		pageHeight : height,
		displayedPages : 1,
		pageCount : 1
	};
	
};