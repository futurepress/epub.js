EPUBJS.Renderer = function(renderMethod) {
	// Dom events to listen for
	this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click"];
	
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
	this.resized = _.throttle(this.onResized.bind(this), 10);

	this.layoutSettings = {};

	//-- Adds Hook methods to the Book prototype
	//   Hooks will all return before triggering the callback.
	EPUBJS.Hooks.mixin(this);
	//-- Get pre-registered hooks for events
	this.getHooks("beforeChapterDisplay");
};

//-- Renderer events for listening
EPUBJS.Renderer.prototype.Events = [
	"renderer:keydown",
	"renderer:keyup",
	"renderer:keypressed",
	"renderer:mouseup",
	"renderer:mousedown",
	"renderer:click",
	"renderer:selected",
	"renderer:chapterUnloaded",
	"renderer:chapterDisplayed",
	"renderer:locationChanged",
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

};

/**
* Display a chapter
* Takes: chapter object, global layout settings
* Returns: Promise with passed Renderer after pages has loaded
*/
EPUBJS.Renderer.prototype.displayChapter = function(chapter, globalLayout){
	var store = false;
	// Get the url string from the chapter (may be from storage)
	return chapter.url().
		then(function(url) {
			
			// Unload the previous chapter listener
			if(this.currentChapter) {
				this.currentChapter.unload(); // Remove stored blobs
				this.render.window.removeEventListener("resize", this.resized);
				this.removeEventListeners();
				this.removeSelectionListeners();
				this.trigger("renderer:chapterUnloaded");
			}
		
			this.currentChapter = chapter;
			this.chapterPos = 1;
		
			this.currentChapterCfiBase = chapter.cfiBase;
		
			this.layoutSettings = this.reconcileLayoutSettings(globalLayout, chapter.properties);
			return this.load(url);
			
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
		
		this.contents = contents;
		this.doc = this.render.document;

		// Format the contents using the current layout method
		formated = this.layout.format(contents, this.render.width, this.render.height);
		this.render.setPageDimensions(formated.pageWidth, formated.pageHeight);

		if(!this.initWidth && !this.initHeight){
			this.render.window.addEventListener("resize", this.resized, false);
		}

		
		this.addEventListeners();
		this.addSelectionListeners();

		//-- Trigger registered hooks before displaying
		this.beforeDisplay(function(){
			var pages = this.layout.calculatePages();
			var msg = this.currentChapter;
			
			this.updatePages(pages);

			msg.cfi = this.currentLocationCfi = this.getPageCfi();

			this.trigger("renderer:chapterDisplayed", msg);
			this.trigger("renderer:locationChanged", this.currentLocationCfi);

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
	this.displayedPages = layout.displayedPages;
	this.currentChapter.pages = layout.pageCount;
};

// Apply the layout again and jump back to the previous cfi position
EPUBJS.Renderer.prototype.reformat = function(){
	var renderer = this;
	var formated, pages;
	if(!this.contents) return;
	
	formated = this.layout.format(this.contents, this.render.width, this.render.height);
	this.render.setPageDimensions(formated.pageWidth, formated.pageHeight);

	pages = renderer.layout.calculatePages();
	renderer.updatePages(pages);

	// Give the css styles time to update
	clearTimeout(this.timeoutTillCfi);
	this.timeoutTillCfi = setTimeout(function(){
		//-- Go to current page after formating
		if(renderer.currentLocationCfi){
			renderer.gotoCfi(renderer.currentLocationCfi);
		}
		this.timeoutTillCfi = null;
	}, 10);

};

// Hide and show the render's container .
EPUBJS.Renderer.prototype.visible = function(bool){
	if(typeof(bool) === "undefined") {
		return this.container.style.visibility;
	}

	if(bool === true){
		this.container.style.visibility = "visible";
	}else if(bool === false){
		this.container.style.visibility = "hidden";
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
	if(pg >= 1 && pg <= this.displayedPages){
		this.chapterPos = pg;

		this.render.page(pg);

		this.currentLocationCfi = this.getPageCfi();
		this.trigger("renderer:locationChanged", this.currentLocationCfi);
		return true;
	}
	//-- Return false if page is greater than the total
	return false;
};

// Short cut to find next page's cfi starting at the last visible element
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
	this.page(this.displayedPages);
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

// Walk the node tree from a start element to next visible element
EPUBJS.Renderer.prototype.walk = function(node) {
	var r, children, leng,
		startNode = node,
		prevNode,
		stack = [startNode];

	var STOP = 10000, ITER=0;

	while(!r && stack.length) {

		node = stack.shift();
		if( this.render.isElementVisible(node) && this.firstElementisTextNode(node)) {
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

// Get the cfi of the current page
EPUBJS.Renderer.prototype.getPageCfi = function(prevEl){
	var range = this.doc.createRange();
	var position;
	// TODO : this might need to take margin / padding into account?
	var x = 0;
	var y = 0;

	if(typeof document.caretPositionFromPoint !== "undefined"){
		position = this.doc.caretPositionFromPoint(x, y);		
		range.setStart(position.offsetNode, position.offset);
	} else if(typeof document.caretRangeFromPoint !== "undefined"){
		range = this.doc.caretRangeFromPoint(x, y);
	} else {
		this.visibileEl = this.findFirstVisible(prevEl);
		range.setStart(this.visibileEl, 1);
	}
	
	// var test = this.doc.defaultView.getSelection();
	// var r = this.doc.createRange();
	// test.removeAllRanges();
	// r.setStart(range.startContainer, range.startOffset);
	// r.setEnd(range.startContainer, range.startOffset + 1);
	// test.addRange(r);
	
	return this.currentChapter.cfiFromRange(range);
};

// Goto a cfi position in the current chapter
EPUBJS.Renderer.prototype.gotoCfi = function(cfi){
	var pg;
	var marker;
	var range;

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
		var range = this.epubcfi.generateRangeFromCfi(cfi, this.doc);
		if(range) {
			pg = this.render.getPageNumberByRect(range.getBoundingClientRect());
			this.page(pg); 
		}
	}
};

//  Walk nodes until a visible element is found
EPUBJS.Renderer.prototype.findFirstVisible = function(startEl){
	var el = startEl || this.render.getBaseElement();
	var	found;
	found = this.walk(el);

	if(found) {
		return found;
	}else{
		return startEl;
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

//-- Listeners for events in the frame

EPUBJS.Renderer.prototype.onResized = function(e){
	var spreads;
	
	this.width = this.container.clientWidth;
	this.height = this.container.clientHeight;

	spreads = this.determineSpreads(this.minSpreadWidth);
	// Only re-layout if the spreads have switched
	if(spreads != this.spreads){
		this.spreads = spreads;
		this.layoutMethod = this.determineLayout(this.layoutSettings);
		this.layout = new EPUBJS.Layout[this.layoutMethod]();
	}

	if(this.contents){
		this.reformat();
	}

	this.trigger("renderer:resized", {
		width: this.width,
		height: this.height
	});

};

EPUBJS.Renderer.prototype.addEventListeners = function(){

	this.listenedEvents.forEach(function(eventName){
		this.render.document.addEventListener(eventName, this.triggerEvent.bind(this), false);
	}, this);

};

EPUBJS.Renderer.prototype.removeEventListeners = function(){

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
	this.render.window.addEventListener("mouseup", this.onMouseUp.bind(this), false);
};

EPUBJS.Renderer.prototype.removeSelectionListeners = function(){
	this.doc.removeEventListener("selectionchange", this.onSelectionChange, false);
	this.render.window.removeEventListener("mouseup", this.onMouseUp, false);
};

EPUBJS.Renderer.prototype.onSelectionChange = function(e){
	this.highlighted = true;
};

//  only pass selection on mouse up
EPUBJS.Renderer.prototype.onMouseUp = function(e){
	var selection;
	if(this.highlighted) {
		selection = this.render.window.getSelection();
		this.trigger("renderer:selected", selection);
		this.highlighted = false;
	}
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
		this.spreads = false;
	} else {
		this.isForcedSingle = false;
		this.spreads = this.determineSpreads(width);
	}
};

//-- Content Replacements

EPUBJS.Renderer.prototype.replace = function(query, func, finished, progress){
	var items = this.contents.querySelectorAll(query),
		resources = Array.prototype.slice.call(items),
		count = resources.length,
		after = function(result, full){
			count--;
			if(progress) progress(result, full, count);
			if(count <= 0 && finished) finished(true);
		};

	if(count === 0) {
		finished(false);
		return;
	}
	resources.forEach(function(item){

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

				if(query == "link[href]") {
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