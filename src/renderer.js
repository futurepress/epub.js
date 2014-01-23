EPUBJS.Renderer = function(type) {
	// Dom events to listen for
	this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click"];
	
	/**
	* Setup a render method.
	* Options are: Iframe
	*/
	if(type && typeof(EPUBJS.Render[type]) != "undefined"){
		this.render = new EPUBJS.Render[type]();
	} else {
		console.error("Not a Valid Rendering Method");
	}

	// Cached for replacement urls from storage
	this.caches = {};
	
	// Blank Cfi for Parsing
	this.epubcfi = new EPUBJS.EpubCFI();
	
	this.spreads = true;
	this.resized = _.throttle(this.onResized.bind(this), 10);

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
	"renderer:pageChanged",
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
	var renderer = this,
			store = false;

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

	this.settings = this.reconcileLayoutSettings(globalLayout, chapter.properties);

	// Get the url string from the chapter (may be from storage)
	return chapter.url().
		then(function(url) {
			return renderer.load(url);
		});

};

/**
* Loads a url (string) and renders it,
* attaching event listeners and triggering hooks.
* Returns: Promise with the rendered contents.
*/

EPUBJS.Renderer.prototype.load = function(url){
	var deferred = new RSVP.defer();
	var loaded;

	this.layoutMethod = this.determineLayout(this.settings);

	this.visible(false);

	loaded = this.render.load(url);

	loaded.then(function(contents) {
		this.contents = contents;
		this.doc = this.render.document;

		if(!this.initWidth && !this.initHeight){
			this.render.window.addEventListener("resize", this.resized, false);
		}

		this.addEventListeners();
		this.addSelectionListeners();

		//-- Trigger registered hooks before displaying
		this.beforeDisplay(function(){
			var msg = this.currentChapter;
			
			msg.cfi = this.currentLocationCfi = this.getPageCfi();

			this.trigger("renderer:chapterDisplayed", msg);
			this.trigger("renderer:pageChanged", this.currentLocationCfi);

			this.layout = this.layoutMethod(contents, this.render.width, this.render.height);
			this.updatePages(this.layout);

			this.visible(true);

			deferred.resolve(this); //-- why does this return the renderer?
		}.bind(this));
		
	}.bind(this));

	return deferred.promise;
};

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* Takes: global layout settings object, chapter properties string
* Returns: Object with layout properties
*/
EPUBJS.Renderer.prototype.reconcileLayoutSettings = function(global, chapter){
	var layoutMethod = "ReflowableSpreads"; // Default to Spreads
	var properties = chapter.split(' ');
	var settings = {};
	var spreads = true;

	//-- Get the global defaults
	for (var attr in global) {
		if (global.hasOwnProperty(attr)){
			settings[attr] = global[attr];
		}
	}
	//-- Get the chapter's display type
	properties.forEach(function(prop){
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
* Takes: Layout settings object
* Returns: EPUBJS.Layout function
*/
EPUBJS.Renderer.prototype.determineLayout = function(settings){
	var layoutMethod = "ReflowableSpreads";

	if(settings.layout === "pre-paginated") {
			layoutMethod = "Fixed";
			this.render.scroll(true);
			return EPUBJS.Layout[layoutMethod];
	}

	if(settings.layout === "reflowable" && settings.spread === "none") {
			layoutMethod = "Reflowable";
			this.render.scroll(false);
			this.trigger("renderer:spreads", false);
			return EPUBJS.Layout[layoutMethod];
	}
	
	if(settings.layout === "reflowable" && settings.spread === "both") {
			layoutMethod = "ReflowableSpreads";
			this.render.scroll(false);
			this.trigger("renderer:spreads", true);
			return EPUBJS.Layout[layoutMethod];
	}
	
	// Reflowable Auto adjustments for width
	if(settings.layout === "reflowable" && settings.spread === "auto"){
		spreads = this.determineSpreads(this.minSpreadWidth);
		if(spreads){
			layoutMethod = "ReflowableSpreads";
			this.trigger("renderer:spreads", true);
	} else {
			layoutMethod = "Reflowable";
			this.trigger("renderer:spreads", false);
	}
		this.render.scroll(false);
		return EPUBJS.Layout[layoutMethod];
	} else { // Base case no settings.layout set
		spreads = this.determineSpreads(this.minSpreadWidth);
		if(spreads){
			layoutMethod = "ReflowableSpreads";
			this.trigger("renderer:spreads", true);
		} else {
			layoutMethod = "Reflowable";
			this.trigger("renderer:spreads", false);
		}
		this.render.scroll(false);
		return EPUBJS.Layout[layoutMethod];
	}
	
};

// Shortcut to trigger the hook before displaying the chapter
EPUBJS.Renderer.prototype.beforeDisplay = function(callback, renderer){
	this.triggerHooks("beforeChapterDisplay", callback, this);
};

// Update the renderer with the information passed by the layout
EPUBJS.Renderer.prototype.updatePages = function(layout){
	this.displayedPages = layout.displayedPages;
	this.currentChapter.pages = layout.displayedPages;
	this.render.setPageDimensions(layout.pageWidth, layout.pageHeight);
};

// Apply the layout again and jump back to the previous cfi position
EPUBJS.Renderer.prototype.reformat = function(){
	var renderer = this;
	if(!this.contents) return;
	
	this.layout = this.layoutMethod(this.contents, this.render.width, this.render.height);
	this.updatePages(this.layout);
	
	setTimeout(function(){

		//-- Go to current page after formating
		if(renderer.currentLocationCfi){
			renderer.gotoCfi(renderer.currentLocationCfi);
		}

	}, 10);

};

// Hide and show the render's container element.
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
	if(this.renderer.window) {
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
		this.trigger("renderer:pageChanged", this.currentLocationCfi);

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
		this.trigger("renderer:pageChanged", this.currentLocationCfi);
	
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

// Walk the node tree from an element to the root
EPUBJS.Renderer.prototype.walk = function(node) {
	var r, children, leng,
		startNode = node,
		prevNode,
		stack = [startNode];

	var STOP = 10000, ITER=0;

	while(!r && stack.length) {

		node = stack.shift();
		if( this.render.isElementVisible(node) ) {
			r = node;
		}

		if(!r && node && node.childElementCount > 0){
			children = node.children;
			if (children && children.length) {
				leng = children.length ? children.length : 0;
			} else {
				return r;
			}
			for (var i = 0; i < leng; i++) {
				if(children[i] != prevNode) stack.push(children[i]);
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
	this.visibileEl = this.findFirstVisible(prevEl);

	return this.epubcfi.generateFragment(this.visibileEl, this.currentChapter.cfiBase);
};

// Goto a cfi position in the current chapter
EPUBJS.Renderer.prototype.gotoCfi = function(cfi){
	var element;

	if(_.isString(cfi)){
		cfi = this.epubcfi.parse(cfi);
	}

	element = this.epubcfi.getElement(cfi, this.doc);
	this.pageByElement(element);
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
		this.layoutMethod = this.determineLayout(this.settings);
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
};

EPUBJS.Renderer.prototype.determineSpreads = function(cutoff){
	if(this.width < cutoff || !cutoff) {
		return false; //-- Single Page
	}else{
		return true; //-- Double Page
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
