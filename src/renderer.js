EPUBJS.Renderer = function(book) {
	this.el = book.element;
	this.book = book;
	
	// this.settings = book.settings;
	this.caches = {};
	
	this.crossBrowserColumnCss();
	
	this.epubcfi = new EPUBJS.EpubCFI();
		
	this.initialize();
	
	this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click"];
	this.listeners();

	//-- Renderer events for listening
	/*
		renderer:resized
		renderer:chapterDisplayed
		renderer:chapterUnloaded
	*/
};

//-- Build up any html needed
EPUBJS.Renderer.prototype.initialize = function(){
	this.iframe = document.createElement('iframe');
	//this.iframe.id = "epubjs-iframe";
	this.iframe.scrolling = "no";
	
	if(this.book.settings.width || this.book.settings.height){
		this.resizeIframe(this.book.settings.width || this.el.clientWidth, this.book.settings.height || this.el.clientHeight);
	} else {
		// this.resizeIframe(false, this.el.clientWidth, this.el.clientHeight);
		this.resizeIframe('100%', '100%');

		// this.on("renderer:resized", this.resizeIframe, this);
	}
	

	this.el.appendChild(this.iframe);
};

//-- Listeners for browser events
EPUBJS.Renderer.prototype.listeners = function(){
	
	this.resized = _.throttle(this.onResized.bind(this), 10);
	
	// window.addEventListener("hashchange", book.route.bind(this), false);

	this.book.registerHook("beforeChapterDisplay", this.replaceLinks.bind(this), true);

	if(this.determineStore()) {

		this.book.registerHook("beforeChapterDisplay", [
			EPUBJS.replace.head,
			EPUBJS.replace.resources,
			EPUBJS.replace.svg
		], true);

	}

};

EPUBJS.Renderer.prototype.chapter = function(chapter){
	var renderer = this,
		store = false;
		
	if(this.book.settings.contained) store = this.book.zip;
	// if(this.settings.stored) store = this.storage;
	
	if(this.currentChapter) {
		this.currentChapter.unload();

		this.trigger("renderer:chapterUnloaded");
		this.book.trigger("renderer:chapterUnloaded");
	}
	
	this.currentChapter = chapter;
	this.chapterPos = 1;
	this.pageIds = {};
	this.leftPos = 0;
	
	this.currentChapterCfi = this.epubcfi.generateChapter(this.book.spineNodeIndex, chapter.spinePos, chapter.id);
	this.visibileEl = false;
	
	return chapter.url(store).
		then(function(url) {
			return renderer.setIframeSrc(url);
		});
	
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
EPUBJS.Renderer.prototype.addIframeListeners = function(){

	this.listenedEvents.forEach(function(eventName){
		this.doc.addEventListener(eventName, this.triggerEvent.bind(this), false);
	}, this);

};

EPUBJS.Renderer.prototype.removeIframeListeners = function(){

	this.listenedEvents.forEach(function(eventName){
		this.doc.removeEventListener(eventName, this.triggerEvent, false);
	}, this);

};

EPUBJS.Renderer.prototype.triggerEvent = function(e){
	this.book.trigger("renderer:"+e.type, e);
};

EPUBJS.Renderer.prototype.addSelectionListeners = function(){
	this.doc.addEventListener("selectionchange", this.onSelectionChange.bind(this), false);
	this.contentWindow.addEventListener("mouseup", this.onMouseUp.bind(this), false);
};

EPUBJS.Renderer.prototype.removeSelectionListeners = function(){
	this.doc.removeEventListener("selectionchange", this.onSelectionChange, false);
	this.contentWindow.removeEventListener("mouseup", this.onMouseUp, false);
};

EPUBJS.Renderer.prototype.onSelectionChange = function(e){
	this.highlighted = true;
};

EPUBJS.Renderer.prototype.onMouseUp = function(e){
	var selection;
	if(this.highlighted) {
		selection = this.contentWindow.getSelection();
		this.book.trigger("renderer:selected", selection);
		this.highlighted = false;
	}
};

EPUBJS.Renderer.prototype.onResized = function(e){
	
	var msg = {
		width: this.iframe.clientWidth,
		height: this.iframe.clientHeight
	};
	
	if(this.doc){
		this.reformat();
	}

	this.trigger("renderer:resized", msg);
	this.book.trigger("book:resized", msg);
	
	
	
};

EPUBJS.Renderer.prototype.reformat = function(){
	var renderer = this;
	
	//-- reformat	
	if(renderer.book.settings.fixedLayout) {
		renderer.fixedLayout();
	} else {
		renderer.formatSpread();
	}
	
	setTimeout(function(){
		
		//-- re-calc number of pages
		renderer.calcPages();
		
		
		//-- Go to current page after resize
		if(renderer.currentLocationCfi){
			renderer.gotoCfiFragment(renderer.currentLocationCfi);
		}
		
	}, 10);
	
	
};

EPUBJS.Renderer.prototype.resizeIframe = function(width, height){

	this.iframe.height = height;

	if(!isNaN(width) && width % 2 !== 0){
		width += 1; //-- Prevent cutting off edges of text in columns
	}

	this.iframe.width = width;
	
	this.onResized();
	
};


EPUBJS.Renderer.prototype.crossBrowserColumnCss = function(){
	
	EPUBJS.Renderer.columnAxis = EPUBJS.core.prefixed('columnAxis');
	EPUBJS.Renderer.columnGap = EPUBJS.core.prefixed('columnGap');
	EPUBJS.Renderer.columnWidth = EPUBJS.core.prefixed('columnWidth');
	EPUBJS.Renderer.transform = EPUBJS.core.prefixed('transform');

};

EPUBJS.Renderer.prototype.setIframeSrc = function(url){
	var renderer = this,
		deferred = new RSVP.defer();

	this.visible(false);

	this.iframe.src = url;

	this.iframe.onload = function() {
		renderer.doc = renderer.iframe.contentDocument;
		renderer.docEl = renderer.doc.documentElement;
		renderer.headEl = renderer.doc.head;
		renderer.bodyEl = renderer.doc.body;
		renderer.contentWindow = renderer.iframe.contentWindow;
		
		renderer.applyStyles();
		renderer.applyHeadTags();
		
		if(renderer.book.settings.fixedLayout) {
			renderer.fixedLayout();
		} else {
			renderer.formatSpread();
		}
		
		//-- Trigger registered hooks before displaying
		renderer.beforeDisplay(function(){
			var msg = renderer.currentChapter;
			
			renderer.calcPages();
			
			deferred.resolve(renderer);

			msg.cfi = renderer.currentLocationCfi = renderer.getPageCfi();
			
			renderer.trigger("renderer:chapterDisplayed", msg);
			renderer.book.trigger("renderer:chapterDisplayed", msg);
			renderer.book.trigger("renderer:pageChanged", renderer.currentLocationCfi);
			
			renderer.visible(true);

		});
		
		renderer.contentWindow.addEventListener("resize", renderer.onResized.bind(renderer), false);
		renderer.addIframeListeners();
		renderer.addSelectionListeners();
	};

	return deferred.promise;
};


EPUBJS.Renderer.prototype.formatSpread = function(){

	var divisor = 2,
		cutoff = 800;

	//-- Check the width and decied on columns
	//-- Todo: a better place for this?
	this.elWidth = this.iframe.clientWidth;
	if(this.elWidth % 2 !== 0){
		this.elWidth -= 1;
	}
	
	// this.gap = this.gap || Math.ceil(this.elWidth / 8);
	this.gap = Math.ceil(this.elWidth / 8);
	
	if(this.gap % 2 !== 0){
		this.gap += 1;
	}

	if(this.elWidth < cutoff || !this.book.settings.spreads) {
		this.spread = false; //-- Single Page

		divisor = 1;
		this.colWidth = Math.floor(this.elWidth / divisor);
	}else{
		this.spread = true; //-- Double Page

		this.colWidth = Math.floor((this.elWidth - this.gap) / divisor);
	}

	this.spreadWidth = (this.colWidth + this.gap) * divisor;
	// if(this.bodyEl) this.bodyEl.style.margin = 0;
	// this.bodyEl.style.fontSize = localStorage.getItem("fontSize") || "medium";
	
	//-- Clear Margins
	if(this.bodyEl) {
		this.bodyEl.style.margin = "0";
		
		this.docEl.style.overflow = "hidden";

		this.docEl.style.width = this.elWidth + "px";

		//-- Adjust height
		this.docEl.style.height = this.iframe.clientHeight	+ "px";

		//-- Add columns
		this.docEl.style[EPUBJS.Renderer.columnAxis] = "horizontal";
		this.docEl.style[EPUBJS.Renderer.columnGap] = this.gap+"px";
		this.docEl.style[EPUBJS.Renderer.columnWidth] = this.colWidth+"px";
	}

};

EPUBJS.Renderer.prototype.fixedLayout = function(){
	this.paginated = false;

	this.elWidth = this.iframe.width;
	this.docEl.style.width = this.elWidth;
	// this.setLeft(0);

	this.docEl.style.width = this.elWidth;

	//-- Adjust height
	this.docEl.style.height = "auto";

	//-- Remove columns
	// this.docEl.style[EPUBJS.core.columnWidth] = "auto";

	//-- Scroll
	this.docEl.style.overflow = "auto";
	this.iframe.scrolling = "yes";

	// this.displayedPages = 1;
};

EPUBJS.Renderer.prototype.setStyle = function(style, val, prefixed){
	if(prefixed) {
		style = EPUBJS.core.prefixed(style);
	}
	
	if(this.bodyEl) this.bodyEl.style[style] = val;
	
};

EPUBJS.Renderer.prototype.removeStyle = function(style){
	
	if(this.bodyEl) this.bodyEl.style[style] = '';
		
};

EPUBJS.Renderer.prototype.applyStyles = function() {
	var styles = this.book.settings.styles;

	for (var style in styles) {
		this.setStyle(style, styles[style]);
	}
};

EPUBJS.Renderer.prototype.addHeadTag = function(tag, attrs) {
	var s = document.createElement(tag);

	for(attr in attrs) {
		s[attr] = attrs[attr];
	}
	this.headEl.appendChild(s);
}

EPUBJS.Renderer.prototype.applyHeadTags = function() {
	
	var headTags = this.book.settings.headTags;
	
	for ( var headTag in headTags ) {
		this.addHeadTag(headTag, headTags[headTag])
	}
};

EPUBJS.Renderer.prototype.gotoChapterEnd = function(){
	this.chapterEnd();
};

EPUBJS.Renderer.prototype.visible = function(bool){
	if(typeof(bool) === "undefined") {
		return this.iframe.style.visibility;
	}

	if(bool === true){
		this.iframe.style.visibility = "visible";
	}else if(bool === false){
		this.iframe.style.visibility = "hidden";
	}
};

EPUBJS.Renderer.prototype.calcPages = function() {
	
	if(this.docEl) this.totalWidth = this.docEl.scrollWidth;
	
	this.displayedPages = Math.ceil(this.totalWidth / this.spreadWidth);

	this.currentChapter.pages = this.displayedPages;
};


EPUBJS.Renderer.prototype.nextPage = function(){
	if(this.chapterPos < this.displayedPages){
		this.chapterPos++;

		this.leftPos += this.spreadWidth;

		this.setLeft(this.leftPos);

		this.currentLocationCfi = this.getPageCfi();
		
		this.book.trigger("renderer:pageChanged", this.currentLocationCfi);


		return this.chapterPos;
	}else{
		return false;
	}
};

EPUBJS.Renderer.prototype.prevPage = function(){
	if(this.chapterPos > 1){
		this.chapterPos--;

		this.leftPos -= this.spreadWidth;

		this.setLeft(this.leftPos);

		this.currentLocationCfi = this.getPageCfi();

		this.book.trigger("renderer:pageChanged", this.currentLocationCfi);

		return this.chapterPos;
	}else{
		return false;
	}
};

EPUBJS.Renderer.prototype.chapterEnd = function(){
	this.page(this.displayedPages);
};

EPUBJS.Renderer.prototype.setLeft = function(leftPos){
	// this.bodyEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style[EPUBJS.Renderer.transform] = 'translate('+ (-leftPos) + 'px, 0)';
	this.doc.defaultView.scrollTo(leftPos, 0);
};

EPUBJS.Renderer.prototype.determineStore = function(callback){
	if(this.book.fromStorage) {
		
		//-- Filesystem api links are relative, so no need to replace them
		if(this.book.storage.getStorageType() == "filesystem") {
			return false;
		}
		
		return this.book.store;
		
	} else if(this.book.contained) {
		
		return this.book.zip;
		
	} else {
		
		return false;
		
	}
};

EPUBJS.Renderer.prototype.replace = function(query, func, finished, progress){
	var items = this.doc.querySelectorAll(query),
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
			_store = this.determineStore(),
			_cache = this.caches[query],
			_uri = EPUBJS.core.uri(this.book.chapter.absolute),
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

//-- Replaces the relative links within the book to use our internal page changer
EPUBJS.Renderer.prototype.replaceLinks = function(callback){
	
	var renderer = this;

	this.replace("a[href]", function(link, done){

		var href = link.getAttribute("href"),
			relative = href.search("://"),
			fragment = href[0] == "#";

		if(relative != -1){

			link.setAttribute("target", "_blank");

		}else{

			link.onclick = function(){
				renderer.book.goto(href);
				return false;
			};
		}

		done();

	}, callback);

};


EPUBJS.Renderer.prototype.page = function(pg){
	if(pg >= 1 && pg <= this.displayedPages){
		this.chapterPos = pg;
		this.leftPos = this.spreadWidth * (pg-1); //-- pages start at 1
		this.setLeft(this.leftPos);
		
		this.currentLocationCfi = this.getPageCfi();
			
		this.book.trigger("renderer:pageChanged", this.currentLocationCfi);

		// localStorage.setItem("chapterPos", pg);
		return true;
	}
	//-- Return false if page is greater than the total
	return false;
};

//-- Find a section by fragement id
EPUBJS.Renderer.prototype.section = function(fragment){
	var el = this.doc.getElementById(fragment),
		left, pg;

	if(el){
		this.pageByElement(el);
	}

};

//-- Show the page containing an Element
EPUBJS.Renderer.prototype.pageByElement = function(el){
	var left, pg;
	if(!el) return;

	left = this.leftPos + el.getBoundingClientRect().left; //-- Calculate left offset compaired to scrolled position
	pg = Math.floor(left / this.spreadWidth) + 1; //-- pages start at 1
	this.page(pg);

};

EPUBJS.Renderer.prototype.beforeDisplay = function(callback){
	this.book.triggerHooks("beforeChapterDisplay", callback.bind(this), this);
};

EPUBJS.Renderer.prototype.walk = function(node) {
	var r, children, leng,
		startNode = node,
		prevNode,
		stack = [startNode];

	var STOP = 10000, ITER=0;

	while(!r && stack.length) {

		node = stack.shift();
		
		if( this.isElementVisible(node) ) {
			
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


EPUBJS.Renderer.prototype.getPageCfi = function(){
	var prevEl = this.visibileEl;
	this.visibileEl = this.findFirstVisible(prevEl);
	
	if(!this.visibileEl.id) {
		this.visibileEl.id = "EPUBJS-PAGE-" + this.chapterPos;
	}
	
	this.pageIds[this.chapterPos] = this.visibileEl.id;
	
	
	return this.epubcfi.generateFragment(this.visibileEl, this.currentChapterCfi);

};

EPUBJS.Renderer.prototype.gotoCfiFragment = function(cfi){
	var element;

	if(_.isString(cfi)){
		cfi = this.epubcfi.parse(cfi);
	}
	
	element = this.epubcfi.getElement(cfi, this.doc);
	this.pageByElement(element);
};

EPUBJS.Renderer.prototype.findFirstVisible = function(startEl){
	var el = startEl || this.bodyEl,
		found;
	
	found = this.walk(el);

	if(found) {
		return found;
	}else{
		return startEl;
	}
		
};

EPUBJS.Renderer.prototype.isElementVisible = function(el){
	var rect;
	
	if(el && typeof el.getBoundingClientRect === 'function'){
		rect = el.getBoundingClientRect();

		if( rect.width != 0 && 
				rect.height != 0 &&
				rect.left >= 0 &&
				rect.left < this.spreadWidth ) {
			return true;
		}
	}
	
	return false;
};


EPUBJS.Renderer.prototype.height = function(el){
	return this.docEl.offsetHeight;
};

EPUBJS.Renderer.prototype.remove = function() {
	this.contentWindow.removeEventListener("resize", this.resize);
	this.removeIframeListeners();
	this.removeSelectionListeners();
	this.el.removeChild(this.iframe);
};



//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Renderer.prototype);
