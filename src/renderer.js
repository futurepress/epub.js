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
		renderer.bodyEl = renderer.doc.body;
		renderer.contentWindow = renderer.iframe.contentWindow;
		
		renderer.applyStyles();
		
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
	
	this.totalWidth = this.docEl.scrollWidth;
	
	this.displayedPages = Math.ceil(this.totalWidth / this.spreadWidth);

	this.currentChapter.pages = this.displayedPages;
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


EPUBJS.Renderer.prototype.beforeDisplay = function(callback){
	this.book.triggerHooks("beforeChapterDisplay", callback.bind(this), this);
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