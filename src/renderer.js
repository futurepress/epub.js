EPUBJS.Renderer = function(book) {
	var elem = book.settings.element;
	this.book = book;
	
	this.settings = book.settings;
	
	//-- Takes a string or a element
	if(_.isElement(elem)) {
		this.el = elem;
	} else if (typeof elem == "string") { 
		this.el = EPUBJS.core.getEl(elem);
	} else {
		console.error("Not an Element");
		return;
	}
	
	book.registerHook("beforeChapterDisplay", 
		[this.replaceLinks.bind(this), this.replaceResources.bind(this)]);

	
	this.crossBrowserColumnCss();
	
	this.epubcfi = new EPUBJS.EpubCFI();
	
	this.initialize();
	this.listeners();
}

//-- Build up any html needed
EPUBJS.Renderer.prototype.initialize = function(){
	this.iframe = document.createElement('iframe');
	//this.iframe.id = "epubjs-iframe";
	this.resizeIframe(false, this.el.clientWidth, this.el.clientHeight);

	this.on("book:resized", this.resizeIframe, this);

	this.el.appendChild(this.iframe);

}

//-- Listeners for browser events
EPUBJS.Renderer.prototype.listeners = function(){
	this.resized = _.debounce(this.onResized.bind(this), 10);
	
	window.addEventListener("resize", this.resized, false);

	// window.addEventListener("hashchange", book.route.bind(this), false);

}

EPUBJS.Renderer.prototype.chapter = function(chapter){
	var renderer = this,
		store = this.settings.stored ? this.store : false;
	
	if(this.currentChapter) {
		this.trigger("book:chapterDestroyed");
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
	
}





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

EPUBJS.Renderer.prototype.onResized = function(){
	
	this.trigger("book:resized", {
		width: this.el.clientWidth,
		height: this.el.clientHeight
	});
	
	this.reformat();
}

EPUBJS.Renderer.prototype.reformat = function(){
	var renderer = this;
	
	//-- reformat	
	this.formatSpread();
	
	setTimeout(function(){
		
		//-- re-calc number of pages
		renderer.calcPages();
		
		
		//-- Go to current page after resize
		if(renderer.currentLocationCfi){
			renderer.gotoCfiFragment(renderer.currentLocationCfi);	
		}
		
	}, 10);
	
	
}

EPUBJS.Renderer.prototype.destroy = function(){
	window.removeEventListener("resize", this.resized, false);
}



EPUBJS.Renderer.prototype.resizeIframe = function(e, cWidth, cHeight){
	var width, height;

	//-- Can be resized by the window resize event, or by passed height
	if(!e){
		width = cWidth;
		height = cHeight;
	}else{
		width = e.width;
		height = e.height;
	}

	this.iframe.height = height;

	if(width % 2 != 0){
		width += 1; //-- Prevent cutting off edges of text in columns
	}

	this.iframe.width = width;
	

}


EPUBJS.Renderer.prototype.crossBrowserColumnCss = function(){
	
	
	EPUBJS.Renderer.columnAxis  =  EPUBJS.core.prefixed('columnAxis');
	EPUBJS.Renderer.columnGap   =  EPUBJS.core.prefixed('columnGap');
	EPUBJS.Renderer.columnWidth =  EPUBJS.core.prefixed('columnWidth');


}




EPUBJS.Renderer.prototype.setIframeSrc = function(url){
	var renderer = this,
		promise = new RSVP.Promise();

	this.visible(false);

	this.iframe.src = url;


	this.iframe.onload = function() {
		renderer.doc = renderer.iframe.contentDocument;
		renderer.docEl = renderer.doc.documentElement;
		renderer.bodyEl = renderer.doc.body;
		
		renderer.formatSpread();

		//-- Trigger registered hooks before displaying
		renderer.beforeDisplay(function(){

			renderer.calcPages();
			
			renderer.currentLocationCfi = renderer.getPageCfi();

			renderer.trigger("book:chapterDisplayed");

			renderer.visible(true);

		});
		
		promise.resolve(renderer);
		// that.afterLoaded(that);

		
		
	}
	

	
	return promise;
}


EPUBJS.Renderer.prototype.formatSpread = function(){

	var divisor = 2,
		cutoff = 800;

	if(this.colWidth){
		this.OldcolWidth = this.colWidth;
		this.OldspreadWidth = this.spreadWidth;
	}

	//-- Check the width and decied on columns
	//-- Todo: a better place for this?
	this.elWidth = this.iframe.width;

	this.gap = this.gap || Math.ceil(this.elWidth / 8);

	if(this.elWidth < cutoff || this.settings.single) {
		this.spread = false; //-- Single Page

		divisor = 1;
		this.colWidth = Math.floor(this.elWidth / divisor);
	}else{
		this.spread = true; //-- Double Page

		this.colWidth = Math.floor((this.elWidth - this.gap) / divisor);

		/* - Was causing jumps, doesn't seem to be needed anymore
		//-- Must be even for firefox
		if(this.colWidth % 2 != 0){
			this.colWidth -= 1;
		}
		*/
	}

	this.spreadWidth = (this.colWidth + this.gap) * divisor;

	// this.bodyEl.style.fontSize = localStorage.getItem("fontSize") || "medium";
	
	//-- Clear Margins
	// this.bodyEl.style.margin = "0";
	
	this.docEl.style.overflow = "hidden";

	this.docEl.style.width = this.elWidth;

	//-- Adjust height
	this.docEl.style.height = this.el.clientHeight + "px";

	//-- Add columns
	this.docEl.style[EPUBJS.Renderer.columnAxis] = "horizontal";
	this.docEl.style[EPUBJS.Renderer.columnGap] = this.gap+"px";
	this.docEl.style[EPUBJS.Renderer.columnWidth] = this.colWidth+"px";


	
}

EPUBJS.Renderer.prototype.fixedLayout = function(){
	this.paginated = false;

	this.setLeft(0);

	this.docEl.style.width = this.elWidth;

	//-- Adjust height
	this.docEl.style.height = "auto";

	//-- Remove columns
	this.docEl.style[EPUBJS.core.columnWidth] = "auto";

	//-- Scroll
	this.docEl.style.overflow = "auto";

	this.displayedPages = 1;
}

EPUBJS.Renderer.prototype.style = function(style, val, prefixed){
	if(prefixed) {
		style = EPUBJS.core.prefixed(style);
	}
	
	this.bodyEl.style[style] = val;
}

EPUBJS.Renderer.prototype.gotoChapterEnd = function(){
	this.chapterEnd();
}

EPUBJS.Renderer.prototype.visible = function(bool){
	if(typeof(bool) == "undefined") {
		return this.iframe.style.visibility;
	}

	if(bool == true){
		this.iframe.style.visibility = "visible";
	}else if(bool == false){
		this.iframe.style.visibility = "hidden";
	}
}

EPUBJS.Renderer.prototype.calcPages = function() {
	
	this.totalWidth = this.docEl.scrollWidth;
	
	this.displayedPages = Math.ceil(this.totalWidth / this.spreadWidth);
	
	this.currentChapter.pages = this.displayedPages;
}


EPUBJS.Renderer.prototype.nextPage = function(){
	if(this.chapterPos < this.displayedPages){
		this.chapterPos++;

		this.leftPos += this.spreadWidth;

		this.setLeft(this.leftPos);

		this.currentLocationCfi = this.getPageCfi();
		
		this.trigger("book:pageChanged", this.currentLocationCfi);


		return this.chapterPos;
	}else{
		return false;
	}
}

EPUBJS.Renderer.prototype.prevPage = function(){
	if(this.chapterPos > 1){
		this.chapterPos--;

		this.leftPos -= this.spreadWidth;

		this.setLeft(this.leftPos);

		this.currentLocationCfi = this.getPageCfi();

		this.trigger("book:pageChanged", this.currentLocationCfi);

		return this.chapterPos;
	}else{
		return false;
	}
}

EPUBJS.Renderer.prototype.chapterEnd = function(){
	this.page(this.displayedPages);
}

EPUBJS.Renderer.prototype.setLeft = function(leftPos){
	// this.bodyEl.style.marginLeft = -leftPos + "px";
	this.doc.defaultView.scrollTo(leftPos, 0)
}

//-- Replaces the relative links within the book to use our internal page changer
EPUBJS.Renderer.prototype.replaceLinks = function(callback){
	var hrefs = this.doc.querySelectorAll('[href]'),
		links = Array.prototype.slice.call(hrefs),
		that = this;

	links.forEach(function(link){
		var path,
			href = link.getAttribute("href"),
			relative = href.search("://"),
			fragment = href[0] == "#";

		if(relative != -1){

			link.setAttribute("target", "_blank");

		}else{

			link.onclick = function(){
				that.book.goto(href);
			}
		}				


	});

	if(callback) callback();
}

//-- Replaces assets src's to point to stored version if browser is offline
EPUBJS.Renderer.prototype.replaceResources = function(callback){
	var srcs, resources, count;

	//-- No need to replace if there is network connectivity
	//-- also Filesystem api links are relative, so no need to replace them
	if((this.book.online && !this.book.contained) || EPUBJS.storage.getStorageType() == "filesystem") {
		if(callback) callback();
		return false; 
	}

	srcs = this.doc.querySelectorAll('[src]');
	resources = Array.prototype.slice.call(srcs);
	count = resources.length;

	resources.forEach(function(link){
		var src = link.getAttribute("src"),
			full = this.book.basePath + src;

		EPUBJS.storage.get(full, function(url){
			link.setAttribute("src", url);
			count--;
			if(count <= 0 && callback) callback();
		});

	}.bind(this));

}

EPUBJS.Renderer.prototype.page = function(pg){
	if(pg >= 1 && pg <= this.displayedPages){
		this.chapterPos = pg;
		this.leftPos = this.spreadWidth * (pg-1); //-- pages start at 1
		this.setLeft(this.leftPos);

		// localStorage.setItem("chapterPos", pg);
		return true;
	}
	console.log("false", pg, this.displayedPages)
	//-- Return false if page is greater than the total
	return false;
}

//-- Find a section by fragement id
EPUBJS.Renderer.prototype.section = function(fragment){
	var el = this.doc.getElementById(fragment),
		left, pg;

	if(el){
		this.pageByElement(el);
	}	

}

//-- Show the page containing an Element
EPUBJS.Renderer.prototype.pageByElement = function(el){
	var left, pg;
	if(!el) return;

	left = this.leftPos + el.getBoundingClientRect().left, //-- Calculate left offset compaired to scrolled position
	pg = Math.floor(left / this.spreadWidth) + 1; //-- pages start at 1
	this.page(pg);

}

EPUBJS.Renderer.prototype.beforeDisplay = function(callback){
	this.book.triggerHooks("beforeChapterDisplay", callback.bind(this), this);
}

EPUBJS.Renderer.prototype.walk = function(node) {
	var r,
		node, children, leng,
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
			leng = children.length;
			
			
			for (var i = 0; i < leng; i++) {
			   if(children[i] != prevNode) stack.push(children[i]);
			}

		}
		
		
		if(!r && stack.length == 0 && startNode && startNode.parentNode !== null){

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
}


EPUBJS.Renderer.prototype.getPageCfi = function(){
	var prevEl = this.visibileEl;
	this.visibileEl = this.findFirstVisible(prevEl);
	
	if(!this.visibileEl.id) {
		this.visibileEl.id = "@EPUBJS-PAGE-" + this.chapterPos;
	}
	
	this.pageIds[this.chapterPos] = this.visibileEl.id;
	
	
	return this.epubcfi.generateFragment(this.visibileEl, this.currentChapterCfi);

}

EPUBJS.Renderer.prototype.gotoCfiFragment = function(cfi){
	var element; 

	if(_.isString(cfi)){
		cfi = this.epubcfi.parse(cfi);
	}
	
	element = this.epubcfi.getElement(cfi, this.doc);

	this.pageByElement(element);
}

EPUBJS.Renderer.prototype.findFirstVisible = function(startEl){
	var el = startEl || this.bodyEl,
		found;
	
	found = this.walk(el);

	if(found) {
		return found;
	}else{
		return startEl;
	}
		
}

EPUBJS.Renderer.prototype.isElementVisible = function(el){
	var left;
	
	if(el){
		left = el.getBoundingClientRect().left;
		
		if( left >= 0 &&
			left < this.spreadWidth ) {
			return true;	
		}
	}
	
	return false;
}





//-- Enable binding events to parser
RSVP.EventTarget.mixin(EPUBJS.Renderer.prototype);