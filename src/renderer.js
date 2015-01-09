EPUBJS.Renderer = function(renderMethod, hidden) {
	// Dom events to listen for
	this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click"];
	this.upEvent = "mouseup";
	this.downEvent = "mousedown";
	if('ontouchstart' in document.documentElement) {
		this.listenedEvents.push("touchstart", "touchend");
		this.upEvent = "touchend";
		this.downEvent = "touchstart";
	}
	/**
	* Setup a render method.
	* Options are: Iframe
	*/
	if(renderMethod && typeof(EPUBJS.Render[renderMethod]) != "undefined"){
		this.render = new EPUBJS.Render[renderMethod]();
	} else {
		console.error("Not a Valid Rendering Method");
	}

	// Listen for load events
	this.render.on("render:loaded", this.loaded.bind(this));

	// Cached for replacement urls from storage
	this.caches = {};

	// Blank Cfi for Parsing
	this.epubcfi = new EPUBJS.EpubCFI();

	this.spreads = true;
	this.isForcedSingle = false;
	this.resized = _.debounce(this.onResized.bind(this), 100);

	this.layoutSettings = {};

	this.hidden = hidden || false;
	//-- Adds Hook methods to the Book prototype
	//   Hooks will all return before triggering the callback.
	EPUBJS.Hooks.mixin(this);
	//-- Get pre-registered hooks for events
	this.getHooks("beforeChapterDisplay");

	//-- Queue up page changes if page map isn't ready
	this._q = EPUBJS.core.queue(this);
	
	this._moving = false;

};

//-- Renderer events for listening
EPUBJS.Renderer.prototype.Events = [
	"renderer:keydown",
	"renderer:keyup",
	"renderer:keypressed",
	"renderer:mouseup",
	"renderer:mousedown",
	"renderer:click",
	"renderer:touchstart",
	"renderer:touchend",
	"renderer:selected",
	"renderer:chapterUnloaded",
	"renderer:chapterDisplayed",
	"renderer:locationChanged",
	"renderer:visibleLocationChanged",
	"renderer:resized",
	"renderer:spreads"
];

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
EPUBJS.Renderer.prototype.initialize = function(element, width, height){
	this.container = element;
	this.element = this.render.create();

	this.initWidth = width;
	this.initHeight = height;

	this.width = width || this.container.clientWidth;
	this.height = height || this.container.clientHeight;

	this.container.appendChild(this.element);

	if(width && height){
		this.render.resize(this.width, this.height);
	} else {
		this.render.resize('100%', '100%');
	}
 
	document.addEventListener("orientationchange", this.onResized);
};

/**
* Display a chapter
* Takes: chapter object, global layout settings
* Returns: Promise with passed Renderer after pages has loaded
*/
EPUBJS.Renderer.prototype.displayChapter = function(chapter, globalLayout){
	var store = false;
	if(this._moving) {
		console.error("Rendering In Progress");
		return;
	}
	this._moving = true;
	// Get the url string from the chapter (may be from storage)
	return chapter.url().
		then(function(url) {
			
			// Unload the previous chapter listener
			if(this.currentChapter) {
				this.currentChapter.unload(); // Remove stored blobs
				
				if(this.render.window){
					this.render.window.removeEventListener("resize", this.resized);
				}
				
				this.removeEventListeners();
				this.removeSelectionListeners();
				this.trigger("renderer:chapterUnloaded");
				this.contents = null;
				this.doc = null;
				this.pageMap = null;
			}
			
			this.currentChapter = chapter;
			
			this.chapterPos = 1;

			this.currentChapterCfiBase = chapter.cfiBase;

			this.layoutSettings = this.reconcileLayoutSettings(globalLayout, chapter.properties);
			return this.load(chapter);

		}.bind(this));

};

/**
* Loads a url (string) and renders it,
* attaching event listeners and triggering hooks.
* Returns: Promise with the rendered contents.
*/

EPUBJS.Renderer.prototype.load = function(url){
	var deferred = new RSVP.defer();
	var loaded;

	// Switch to the required layout method for the settings
	this.layoutMethod = this.determineLayout(this.layoutSettings);
	this.layout = new EPUBJS.Layout[this.layoutMethod]();

	this.visible(false);

	render = this.render.load(url);

	render.then(function(contents) {
		var formated;
		this.currentChapter.setDocument(this.render.document);
		this.contents = contents;
		this.doc = this.render.document;

		// Format the contents using the current layout method
		this.formated = this.layout.format(contents, this.render.width, this.render.height, this.gap);
		this.render.setPageDimensions(this.formated.pageWidth, this.formated.pageHeight);

		// window.addEventListener("orientationchange", this.onResized.bind(this), false);
		if(!this.initWidth && !this.initHeight){
			this.render.window.addEventListener("resize", this.resized, false);
		}

		this.addEventListeners();
		this.addSelectionListeners();

		//-- Trigger registered hooks before displaying
		this.beforeDisplay(function(){
			var pages = this.layout.calculatePages();
			var msg = this.currentChapter;
			var queued = this._q.length();
			this._moving = false;

			this.updatePages(pages);

			this.visibleRangeCfi = this.getVisibleRangeCfi();
			this.currentLocationCfi = this.visibleRangeCfi.start;

			if(queued === 0) {
				this.trigger("renderer:locationChanged", this.currentLocationCfi);
				this.trigger("renderer:visibleRangeChanged", this.visibleRangeCfi);
			}

			msg.cfi = this.currentLocationCfi; //TODO: why is this cfi passed to chapterDisplayed
			this.trigger("renderer:chapterDisplayed", msg);
			
			this.visible(true);
			
			deferred.resolve(this); //-- why does this return the renderer?
		}.bind(this));

	}.bind(this));

	return deferred.promise;
};

EPUBJS.Renderer.prototype.loaded = function(url){
	this.trigger("render:loaded", url);
	// var uri = EPUBJS.core.uri(url);
	// var relative = uri.path.replace(book.bookUrl, '');
	// console.log(url, uri, relative);
};

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* Takes: global layout settings object, chapter properties string
* Returns: Object with layout properties
*/
EPUBJS.Renderer.prototype.reconcileLayoutSettings = function(global, chapter){
	var settings = {};

	//-- Get the global defaults
	for (var attr in global) {
		if (global.hasOwnProperty(attr)){
			settings[attr] = global[attr];
		}
	}
	//-- Get the chapter's display type
	chapter.forEach(function(prop){
		var rendition = prop.replace("rendition:", '');
		var split = rendition.indexOf("-");
		var property, value;

		if(split != -1){
			property = rendition.slice(0, split);
			value = rendition.slice(split+1);

			settings[property] = value;
		}
	});
 return settings;
};

/**
* Uses the settings to determine which Layout Method is needed
* Triggers events based on the method choosen
* Takes: Layout settings object
* Returns: String of appropriate for EPUBJS.Layout function
*/
EPUBJS.Renderer.prototype.determineLayout = function(settings){
	// Default is layout: reflowable & spread: auto
	var spreads = this.determineSpreads(this.minSpreadWidth);
	var layoutMethod = spreads ? "ReflowableSpreads" : "Reflowable";
	var scroll = false;

	if(settings.layout === "pre-paginated") {
		layoutMethod = "Fixed";
		scroll = true;
		spreads = false;
	}

	if(settings.layout === "reflowable" && settings.spread === "none") {
		layoutMethod = "Reflowable";
		scroll = false;
		spreads = false;
	}

	if(settings.layout === "reflowable" && settings.spread === "both") {
		layoutMethod = "ReflowableSpreads";
		scroll = false;
		spreads = true;
	}

	this.spreads = spreads;
	this.render.scroll(scroll);
	this.trigger("renderer:spreads", spreads);
	return layoutMethod;
};

// Shortcut to trigger the hook before displaying the chapter
EPUBJS.Renderer.prototype.beforeDisplay = function(callback, renderer){
	this.triggerHooks("beforeChapterDisplay", callback, this);
};

// Update the renderer with the information passed by the layout
EPUBJS.Renderer.prototype.updatePages = function(layout){
	this.pageMap = this.mapPage();
	// this.displayedPages = layout.displayedPages;

	if (this.spreads) {
		this.displayedPages = Math.ceil(this.pageMap.length / 2);
	} else {
		this.displayedPages = this.pageMap.length;
	}

	// this.currentChapter.pages = layout.pageCount;
	this.currentChapter.pages = this.pageMap.length;
	
	this._q.flush();
};

// Apply the layout again and jump back to the previous cfi position
EPUBJS.Renderer.prototype.reformat = function(){
	var renderer = this;
	var formated, pages;
	if(!this.contents) return;

	spreads = this.determineSpreads(this.minSpreadWidth);

	// Only re-layout if the spreads have switched
	if(spreads != this.spreads){
		this.spreads = spreads;
		this.layoutMethod = this.determineLayout(this.layoutSettings);
		this.layout = new EPUBJS.Layout[this.layoutMethod]();
	}
	
	// Reset pages
	this.chapterPos = 1;

	this.render.page(this.chapterPos);
	// Give the css styles time to update
	// clearTimeout(this.timeoutTillCfi);
	// this.timeoutTillCfi = setTimeout(function(){
		
	renderer.formated = renderer.layout.format(renderer.contents, renderer.render.width, renderer.render.height, renderer.gap);
	renderer.render.setPageDimensions(renderer.formated.pageWidth, renderer.formated.pageHeight);
			
	pages = renderer.layout.calculatePages();
	renderer.updatePages(pages);

	//-- Go to current page after formating
	if(renderer.currentLocationCfi){
		renderer.gotoCfi(renderer.currentLocationCfi);
	}
		// renderer.timeoutTillCfi = null;

};

// Hide and show the render's container .
EPUBJS.Renderer.prototype.visible = function(bool){
	if(typeof(bool) === "undefined") {
		return this.element.style.visibility;
	}

	if(bool === true && !this.hidden){
		this.element.style.visibility = "visible";
	}else if(bool === false){
		this.element.style.visibility = "hidden";
	}
};

// Remove the render element and clean up listeners
EPUBJS.Renderer.prototype.remove = function() {
	if(this.render.window) {
		this.render.unload();
		this.render.window.removeEventListener("resize", this.resized);
		this.removeEventListeners();
		this.removeSelectionListeners();
	}

	this.container.removeChild(this.element);
};

//-- STYLES

EPUBJS.Renderer.prototype.applyStyles = function(styles) {
	for (var style in styles) {
		this.render.setStyle(style, styles[style]);
	}
};

EPUBJS.Renderer.prototype.setStyle = function(style, val, prefixed){
	this.render.setStyle(style, val, prefixed);
};

EPUBJS.Renderer.prototype.removeStyle = function(style){
	this.render.removeStyle(style);
};

//-- HEAD TAGS
EPUBJS.Renderer.prototype.applyHeadTags = function(headTags) {
	for ( var headTag in headTags ) {
		this.render.addHeadTag(headTag, headTags[headTag]);
	}
};

//-- NAVIGATION

EPUBJS.Renderer.prototype.page = function(pg){
	if(!this.pageMap) {
		console.warn("pageMap not set, queuing");
		this._q.enqueue("page", arguments);
		return true;
	}

	if(pg >= 1 && pg <= this.displayedPages){
		this.chapterPos = pg;

		this.render.page(pg);
		this.visibleRangeCfi = this.getVisibleRangeCfi();
		this.currentLocationCfi = this.visibleRangeCfi.start;
		this.trigger("renderer:locationChanged", this.currentLocationCfi);
		this.trigger("renderer:visibleRangeChanged", this.visibleRangeCfi);

		return true;
	}
	//-- Return false if page is greater than the total
	return false;
};

// Short cut to find next page's cfi starting at the last visible element
/*
EPUBJS.Renderer.prototype.nextPage = function(){
	var pg = this.chapterPos + 1;
	if(pg <= this.displayedPages){
		this.chapterPos = pg;

		this.render.page(pg);

		this.currentLocationCfi = this.getPageCfi(this.visibileEl);
		this.trigger("renderer:locationChanged", this.currentLocationCfi);

		return true;
	}
	//-- Return false if page is greater than the total
	return false;
};
*/
EPUBJS.Renderer.prototype.nextPage = function(){
	return this.page(this.chapterPos + 1);
};

EPUBJS.Renderer.prototype.prevPage = function(){
	return this.page(this.chapterPos - 1);
};

//-- Show the page containing an Element
EPUBJS.Renderer.prototype.pageByElement = function(el){
	var pg;
	if(!el) return;

	pg = this.render.getPageNumberByElement(el);
	this.page(pg);
};

// Jump to the last page of the chapter
EPUBJS.Renderer.prototype.lastPage = function(){
	if(this._moving) {
		return this._q.enqueue("lastPage", arguments);
	}

	this.page(this.displayedPages);
};

// Jump to the first page of the chapter
EPUBJS.Renderer.prototype.firstPage = function(){
	if(this._moving) {
		return this._q.enqueue("firstPage", arguments);
	}

	this.page(1);
};

//-- Find a section by fragement id
EPUBJS.Renderer.prototype.section = function(fragment){
	var el = this.doc.getElementById(fragment),
		left, pg;

	if(el){
		this.pageByElement(el);
	}

};

EPUBJS.Renderer.prototype.firstElementisTextNode = function(node) {
	var children = node.childNodes;
	var leng = children.length;

	if(leng &&
		children[0] && // First Child
		children[0].nodeType === 3 && // This is a textNodes
		children[0].textContent.trim().length) { // With non whitespace or return charecters
		return true;
	}
	return false;
};

EPUBJS.Renderer.prototype.isGoodNode = function(node) {
	var embeddedElements = ["audio", "canvas", "embed", "iframe", "img", "math", "object", "svg", "video"];
	if (embeddedElements.indexOf(node.tagName.toLowerCase()) !== -1) {
		// Embedded elements usually do not have a text node as first element, but are also good nodes
		return true;
	}
	return this.firstElementisTextNode(node);
};

// Walk the node tree from a start element to next visible element
EPUBJS.Renderer.prototype.walk = function(node, x, y) {
	var r, children, leng,
		startNode = node,
		prevNode,
		stack = [startNode];

	var STOP = 10000, ITER=0;

	while(!r && stack.length) {
		node = stack.shift();
		if( this.containsPoint(node, x, y) && this.isGoodNode(node)) {
			r = node;
		}

		if(!r && node && node.childElementCount > 0){
			children = node.children;
			if (children && children.length) {
				leng = children.length ? children.length : 0;
			} else {
				return r;
			}
			for (var i = leng-1; i >= 0; i--) {
				if(children[i] != prevNode) stack.unshift(children[i]);
			}
		}

		if(!r && stack.length === 0 && startNode && startNode.parentNode !== null){
			stack.push(startNode.parentNode);
			prevNode = startNode;
			startNode = startNode.parentNode;
		}


		ITER++;
		if(ITER > STOP) {
			console.error("ENDLESS LOOP");
			break;
		}

	}

	return r;
};

// Checks if an element is on the screen
EPUBJS.Renderer.prototype.containsPoint = function(el, x, y){
	var rect;
	var left;
	if(el && typeof el.getBoundingClientRect === 'function'){
		rect = el.getBoundingClientRect();
		// console.log(el, rect, x, y);

		if( rect.width !== 0 &&
				rect.height !== 0 && // Element not visible
				rect.left >= x &&
				x <= rect.left + rect.width) {
			return true;
		}
	}

	return false;
};

EPUBJS.Renderer.prototype.textSprint = function(root, func) {
	var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode: function (node) {
					if ( ! /^\s*$/.test(node.data) ) {
						return NodeFilter.FILTER_ACCEPT;
					} else {
						return NodeFilter.FILTER_REJECT;
					}
			}
	}, false);
	var node;
	while ((node = treeWalker.nextNode())) {
		func(node);
	}

};

EPUBJS.Renderer.prototype.sprint = function(root, func) {
	var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
	var node;
	while ((node = treeWalker.nextNode())) {
		func(node);
	}

};

EPUBJS.Renderer.prototype.mapPage = function(){
	var renderer = this;
	var map = [];
	var root = this.render.getBaseElement();
	var page = 1;
	var width = this.layout.colWidth + this.layout.gap;
	var offset = this.formated.pageWidth * (this.chapterPos-1);
	var limit = (width * page) - offset;// (width * page) - offset;
	var elLimit = 0;
	var prevRange;
	var cfi;
	var check = function(node) {
		var elPos;
		var elRange;
		var children = Array.prototype.slice.call(node.childNodes);
		if (node.nodeType == Node.ELEMENT_NODE) {
			// elPos = node.getBoundingClientRect();
			elRange = document.createRange();
			elRange.selectNodeContents(node);
			elPos = elRange.getBoundingClientRect();

			if(!elPos || (elPos.width === 0 && elPos.height === 0)) {
				return;
			}
			
			//-- Element starts new Col
			if(elPos.left > elLimit) {
				children.forEach(function(node){
					if(node.nodeType == Node.TEXT_NODE &&
						node.textContent.trim().length) {
						checkText(node);
					}
				});
			}
	
			//-- Element Spans new Col
			if(elPos.right > elLimit) {
				children.forEach(function(node){
					if(node.nodeType == Node.TEXT_NODE &&
						node.textContent.trim().length) {
						checkText(node);
					}
				});
			}
		}

	};
	var checkText = function(node){
		var ranges = renderer.splitTextNodeIntoWordsRanges(node);
		ranges.forEach(function(range){
			var pos = range.getBoundingClientRect();

			if(!pos || (pos.width === 0 && pos.height === 0)) {
				return;
			}
			if(pos.left + pos.width < limit) {
				if(!map[page-1]){
					range.collapse(true);
					cfi = renderer.currentChapter.cfiFromRange(range);
					// map[page-1].start = cfi;
					map.push({ start: cfi, end: null });
				}
			} else {
				if(prevRange){
					prevRange.collapse(true);
					cfi = renderer.currentChapter.cfiFromRange(prevRange);
					map[map.length-1].end = cfi;
				}

				range.collapse(true);
				cfi = renderer.currentChapter.cfiFromRange(range);
				map.push({
						start: cfi,
						end: null
				});
				
				page += 1;
				limit = (width * page) - offset;
				elLimit = limit;
			}

			prevRange = range;
		});


	};
	var docEl = this.render.getDocumentElement();
	var dir = docEl.dir;
	
	// Set back to ltr before sprinting to get correct order
	if(dir == "rtl") {
		docEl.dir = "ltr";
		docEl.style.position = "static";
	}
	
	this.sprint(root, check);
	
	// Reset back to previous RTL settings
	if(dir == "rtl") {
		docEl.dir = dir;
		docEl.style.left = "auto";
		docEl.style.right = "0";
	}

	// this.textSprint(root, checkText);

	if(prevRange){
		prevRange.collapse(true);

		cfi = renderer.currentChapter.cfiFromRange(prevRange);
		map[map.length-1].end = cfi;
	}

	// Handle empty map
	if(!map.length) {
		range = this.doc.createRange();
		range.selectNodeContents(root);
		range.collapse(true);

		cfi = renderer.currentChapter.cfiFromRange(range);
		
		map.push({ start: cfi, end: cfi });

	}

	// clean up
	prevRange = null;
	ranges = null;
	range = null;
	root = null;

	return map;
};


EPUBJS.Renderer.prototype.indexOfBreakableChar = function (text, startPosition) {
	var whiteCharacters = "\x2D\x20\t\r\n\b\f";
	// '-' \x2D
	// ' ' \x20
	
	if (! startPosition) {
		startPosition = 0;
	}
	
	for (var i = startPosition; i < text.length; i++) {
		if (whiteCharacters.indexOf(text.charAt(i)) != -1) {
			return i;
		}
	}
	
	return -1;
};


EPUBJS.Renderer.prototype.splitTextNodeIntoWordsRanges = function(node){
	var ranges = [];
	var text = node.textContent.trim();
	var range;
	var rect;
	var list;
	// jaroslaw.bielski@7bulls.com
	// Usage of indexOf() function for space character as word delimiter 
	// is not sufficient in case of other breakable characters like \r\n- etc
	pos = this.indexOfBreakableChar(text);

	if(pos === -1) {
		range = this.doc.createRange();
		range.selectNodeContents(node);
		return [range];
	}

	range = this.doc.createRange();
	range.setStart(node, 0);
	range.setEnd(node, pos);
	ranges.push(range);

	// jaroslaw.bielski@7bulls.com
	// there was a word miss in case of one letter words
	range = this.doc.createRange();
	range.setStart(node, pos+1);

	while ( pos != -1 ) {

		pos = this.indexOfBreakableChar(text, pos + 1);
		if(pos > 0) {

			if(range) {
				range.setEnd(node, pos);
				ranges.push(range);
			}

			range = this.doc.createRange();
			range.setStart(node, pos+1);
		}
	}

	if(range) {
		range.setEnd(node, text.length);
		ranges.push(range);
	}

	return ranges;
};

EPUBJS.Renderer.prototype.rangePosition = function(range){
	var rect;
	var list;

	list = range.getClientRects();

	if(list.length) {
		rect = list[0];
		return rect;
	}

	return null;
};

/*
// Get the cfi of the current page
EPUBJS.Renderer.prototype.getPageCfi = function(prevEl){
	var range = this.doc.createRange();
	var position;
	// TODO : this might need to take margin / padding into account?
	var x = 1;//this.formated.pageWidth/2;
	var y = 1;//;this.formated.pageHeight/2;

	range = this.getRange(x, y);

	// var test = this.doc.defaultView.getSelection();
	// var r = this.doc.createRange();
	// test.removeAllRanges();
	// r.setStart(range.startContainer, range.startOffset);
	// r.setEnd(range.startContainer, range.startOffset + 1);
	// test.addRange(r);

	return this.currentChapter.cfiFromRange(range);
};
*/

// Get the cfi of the current page
EPUBJS.Renderer.prototype.getPageCfi = function(){
	var pg;
	if (this.spreads) {
		pg = this.chapterPos*2;
		startRange = this.pageMap[pg-2];
	} else {
		pg = this.chapterPos;
		startRange = this.pageMap[pg-1];
	}
	return this.pageMap[(this.chapterPos * 2) -1].start;
};

EPUBJS.Renderer.prototype.getRange = function(x, y, forceElement){
	var range = this.doc.createRange();
	var position;
	forceElement = true; // temp override
	if(typeof document.caretPositionFromPoint !== "undefined" && !forceElement){
		position = this.doc.caretPositionFromPoint(x, y);
		range.setStart(position.offsetNode, position.offset);
	} else if(typeof document.caretRangeFromPoint !== "undefined" && !forceElement){
		range = this.doc.caretRangeFromPoint(x, y);
	} else {
		this.visibileEl = this.findElementAfter(x, y);
		range.setStart(this.visibileEl, 1);
	}

	// var test = this.doc.defaultView.getSelection();
	// var r = this.doc.createRange();
	// test.removeAllRanges();
	// r.setStart(range.startContainer, range.startOffset);
	// r.setEnd(range.startContainer, range.startOffset + 1);
	// test.addRange(r);
	return range;
};

/*
EPUBJS.Renderer.prototype.getVisibleRangeCfi = function(prevEl){
	var startX = 0;
	var startY = 0;
	var endX = this.width-1;
	var endY = this.height-1;
	var startRange = this.getRange(startX, startY);
	var endRange = this.getRange(endX, endY); //fix if carret not avail
	var startCfi = this.currentChapter.cfiFromRange(startRange);
	var endCfi;
	if(endRange) {
		endCfi = this.currentChapter.cfiFromRange(endRange);
	}

	return {
		start: startCfi,
		end: endCfi || false
	};
};
*/

EPUBJS.Renderer.prototype.pagesInCurrentChapter = function() {
	var pgs;
	var length;

	if(!this.pageMap) {
		console.warn("page map not loaded");
		return false;
	}

	length = this.pageMap.length;

	if(this.spreads){
		pgs = Math.ceil(length / 2);
	} else {
		pgs = length;
	}

	return pgs;
};

EPUBJS.Renderer.prototype.currentRenderedPage = function(){
	var pg;

	if(!this.pageMap) {
		console.warn("page map not loaded");
		return false;
	}

	if (this.spreads && this.layout.pageCount > 1) {
		pg = this.chapterPos*2;
	} else {
		pg = this.chapterPos;
	}

	return pg;
};

EPUBJS.Renderer.prototype.getRenderedPagesLeft = function(){
	var pg;
	var lastPage;
	var pagesLeft;

	if(!this.pageMap) {
		console.warn("page map not loaded");
		return false;
	}

	lastPage = this.pageMap.length;

	if (this.spreads) {
		pg = this.chapterPos*2;
	} else {
		pg = this.chapterPos;
	}

	pagesLeft = lastPage - pg;
	return pagesLeft;

};

EPUBJS.Renderer.prototype.getVisibleRangeCfi = function(){
	var pg;
	var startRange, endRange;

	if(!this.pageMap) {
		console.warn("page map not loaded");
		return false;
	}

	if (this.spreads) {
		pg = this.chapterPos*2;
		startRange = this.pageMap[pg-2];
		endRange = startRange;

		if(this.layout.pageCount > 1) {
			endRange = this.pageMap[pg-1];
		}
	} else {
		pg = this.chapterPos;
		startRange = this.pageMap[pg-1];
		endRange = startRange;
	}

	if(!startRange) {
		console.warn("page range miss:", pg, this.pageMap);
		startRange = this.pageMap[this.pageMap.length-1];
		endRange = startRange;
	}

	return {
		start: startRange.start,
		end: endRange.end
	};
};

// Goto a cfi position in the current chapter
EPUBJS.Renderer.prototype.gotoCfi = function(cfi){
	var pg;
	var marker;
	var range;
	
	if(this._moving){
		return this._q.enqueue("gotoCfi", arguments);
	}
	
	if(_.isString(cfi)){
		cfi = this.epubcfi.parse(cfi);
	}

	if(typeof document.evaluate === 'undefined') {
		marker = this.epubcfi.addMarker(cfi, this.doc);
		if(marker) {
			pg = this.render.getPageNumberByElement(marker);
			// Must Clean up Marker before going to page
			this.epubcfi.removeMarker(marker, this.doc);
			this.page(pg);
		}
	} else {
		range = this.epubcfi.generateRangeFromCfi(cfi, this.doc);
		if(range) {
			// jaroslaw.bielski@7bulls.com
			// It seems that sometimes getBoundingClientRect() returns null for first page CFI in chapter.
			// It is always reproductible if few consecutive chapters have only one page.
			// NOTE: This is only workaround and the issue needs an deeper investigation.
			// NOTE: Observed on Android 4.2.1 using WebView widget as HTML renderer (Asus TF300T).
			var rect = range.getBoundingClientRect();
			if (rect) {
				pg = this.render.getPageNumberByRect(rect);
				
			} else {				
				// Goto first page in chapter
				pg = 1;
			}

			this.page(pg);
			
			// Reset the current location cfi to requested cfi
			this.currentLocationCfi = cfi.str;
		}
	}
};

//  Walk nodes until a visible element is found
EPUBJS.Renderer.prototype.findFirstVisible = function(startEl){
	var el = startEl || this.render.getBaseElement();
	var	found;
	// kgolunski@7bulls.com
	// Looks like an old API usage
	// Set x and y as 0 to fullfill walk method API.
	found = this.walk(el, 0, 0);

	if(found) {
		return found;
	}else{
		return startEl;
	}

};
// TODO: remove me - unsused
EPUBJS.Renderer.prototype.findElementAfter = function(x, y, startEl){
	var el = startEl || this.render.getBaseElement();
	var	found;
	found = this.walk(el, x, y);
	if(found) {
		return found;
	}else{
		return el;
	}

};

/*
EPUBJS.Renderer.prototype.route = function(hash, callback){
	var location = window.location.hash.replace('#/', '');
	if(this.useHash && location.length && location != this.prevLocation){
		this.show(location, callback);
		this.prevLocation = location;
		return true;
	}
	return false;
}

EPUBJS.Renderer.prototype.hideHashChanges = function(){
	this.useHash = false;
}

*/

EPUBJS.Renderer.prototype.resize = function(width, height, setSize){
	var spreads;

	this.width = width;
	this.height = height;

	if(setSize !== false) {
		this.render.resize(this.width, this.height);
	}



	if(this.contents){
		this.reformat();
	}

	this.trigger("renderer:resized", {
		width: this.width,
		height: this.height
	});
};

//-- Listeners for events in the frame

EPUBJS.Renderer.prototype.onResized = function(e) {
	var width = this.container.clientWidth;
	var height = this.container.clientHeight;

	this.resize(width, height, false);
};

EPUBJS.Renderer.prototype.addEventListeners = function(){
	if(!this.render.document) {
		return;
	}
	this.listenedEvents.forEach(function(eventName){
		this.render.document.addEventListener(eventName, this.triggerEvent.bind(this), false);
	}, this);

};

EPUBJS.Renderer.prototype.removeEventListeners = function(){
	if(!this.render.document) {
		return;
	}
	this.listenedEvents.forEach(function(eventName){
		this.render.document.removeEventListener(eventName, this.triggerEvent, false);
	}, this);

};

// Pass browser events
EPUBJS.Renderer.prototype.triggerEvent = function(e){
	this.trigger("renderer:"+e.type, e);
};

EPUBJS.Renderer.prototype.addSelectionListeners = function(){
	this.render.document.addEventListener("selectionchange", this.onSelectionChange.bind(this), false);
};

EPUBJS.Renderer.prototype.removeSelectionListeners = function(){
	if(!this.render.document) {
		return;
	}
	this.doc.removeEventListener("selectionchange", this.onSelectionChange, false);
};

EPUBJS.Renderer.prototype.onSelectionChange = function(e){
	if (this.selectionEndTimeout) {
		clearTimeout(this.selectionEndTimeout);
	}
	this.selectionEndTimeout = setTimeout(function() {
		this.selectedRange = this.render.window.getSelection();
		this.trigger("renderer:selected", this.selectedRange);
	}.bind(this), 500);
};


//-- Spreads

EPUBJS.Renderer.prototype.setMinSpreadWidth = function(width){
	this.minSpreadWidth = width;
	this.spreads = this.determineSpreads(width);
};

EPUBJS.Renderer.prototype.determineSpreads = function(cutoff){
	if(this.isForcedSingle || !cutoff || this.width < cutoff) {
		return false; //-- Single Page
	}else{
		return true; //-- Double Page
	}
};

EPUBJS.Renderer.prototype.forceSingle = function(bool){
	if(bool) {
		this.isForcedSingle = true;
		// this.spreads = false;
	} else {
		this.isForcedSingle = false;
		// this.spreads = this.determineSpreads(this.minSpreadWidth);
	}
};

EPUBJS.Renderer.prototype.setGap = function(gap){
	this.gap = gap; //-- False == auto gap
};

EPUBJS.Renderer.prototype.setDirection = function(direction){
	this.direction = direction;
	this.render.setDirection(this.direction);
};

//-- Content Replacements

EPUBJS.Renderer.prototype.replace = function(query, func, finished, progress){
	var items = this.contents.querySelectorAll(query),
		resources = Array.prototype.slice.call(items),
		count = resources.length;


	if(count === 0) {
		finished(false);
		return;
	}
	resources.forEach(function(item){
		var called = false;
		var after = function(result, full){
			if(called === false) {
				count--;
				if(progress) progress(result, full, count);
				if(count <= 0 && finished) finished(true);
				called = true;
			}
		};

		func(item, after);

	}.bind(this));

};

EPUBJS.Renderer.prototype.replaceWithStored = function(query, attr, func, callback) {
	var _oldUrls,
			_newUrls = {},
			_store = this.currentChapter.store,
			_cache = this.caches[query],
			_uri = EPUBJS.core.uri(this.currentChapter.absolute),
			_chapterBase = _uri.base,
			_attr = attr,
			_wait = 2000,
			progress = function(url, full, count) {
				_newUrls[full] = url;
			},
			finished = function(notempty) {
				if(callback) callback();

				_.each(_oldUrls, function(url){
					_store.revokeUrl(url);
				});

				_cache = _newUrls;
			};

	if(!_store) return;

	if(!_cache) _cache = {};
	_oldUrls = _.clone(_cache);

	this.replace(query, function(link, done){
		var src = link.getAttribute(_attr),
				full = EPUBJS.core.resolveUrl(_chapterBase, src);

		var replaceUrl = function(url) {
				var timeout;
				link.onload = function(){
					clearTimeout(timeout);
					done(url, full);
				};

				link.onerror = function(e){
					clearTimeout(timeout);
					done(url, full);
					console.error(e);
				};

				if(query == "image") {
					//-- SVG needs this to trigger a load event
					link.setAttribute("externalResourcesRequired", "true");
				}

				if(query == "link[href]" && link.getAttribute("rel") !== "stylesheet") {
					//-- Only Stylesheet links seem to have a load events, just continue others
					done(url, full);
				}

				link.setAttribute(_attr, url);

				//-- If elements never fire Load Event, should continue anyways
				timeout = setTimeout(function(){
					done(url, full);
				}, _wait);

			};

		if(full in _oldUrls){
			replaceUrl(_oldUrls[full]);
			_newUrls[full] = _oldUrls[full];
			delete _oldUrls[full];
		}else{
			func(_store, full, replaceUrl, link);
		}

	}, finished, progress);
};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Renderer.prototype);
