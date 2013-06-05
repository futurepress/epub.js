/*! FuturePress - v0.1.0 - 2013-06-04 */

var EPUBJS = EPUBJS || {}; 
EPUBJS.VERSION = "0.1.5";

EPUBJS.plugins = EPUBJS.plugins || {};

EPUBJS.filePath = EPUBJS.filePath || "/epubjs/";
EPUBJS.Book = function(elem, bookPath){

	//-- Takes a string or a element
	if (typeof elem == "string") { 
		this.el = EPUBJS.core.getEl(elem);
	} else {
		this.el = elem;
	}

	this.events = new EPUBJS.Events(this, this.el);
	
	//-- All Book events for listening
	this.createEvent("book:tocReady");
	this.createEvent("book:metadataReady");
	this.createEvent("book:spineReady");
	this.createEvent("book:bookReady");
	this.createEvent("book:chapterReady");
	this.createEvent("book:chapterDisplayed");
	this.createEvent("book:chapterDestroy");
	this.createEvent("book:resized");
	this.createEvent("book:stored");
	this.createEvent("book:online");
	this.createEvent("book:offline");
	this.createEvent("book:pageChanged");
	
	//-- All hooks to add functions (with a callback) to 
	this.hooks = {
		"beforeChapterDisplay" : []
	};
	
	//-- Get pre-registered hooks
	this.getHooks();
	
	this.useHash = true;
	
	this.initialize(this.el);
	
	this.online = navigator.onLine;
	this.listeners();
		
	//-- Determine storage method
	//-- Override options: none | ram | websqldatabase | indexeddb | filesystem
	EPUBJS.storageOverride = "none"
	EPUBJS.storage = new fileStorage.storage(EPUBJS.storageOverride);
	
	// BookUrl is optional, but if present start loading process
	if(bookPath) {
		this.display(bookPath);
	}


}


//-- Build up any html needed
EPUBJS.Book.prototype.initialize = function(el){
	this.iframe = document.createElement('iframe');
	this.iframe.id = "epubjsiframe";
	this.resizeIframe(false, this.el.clientWidth, this.el.clientHeight);

	this.listen("book:resized", this.resizeIframe, this);
	
	this.el.appendChild(this.iframe);
	
}

//-- Listeners for browser events
EPUBJS.Book.prototype.listeners = function(){
	var that = this;
	window.addEventListener("resize", that.onResized.bind(this), false);
	
	window.addEventListener("offline", function(e) {
	  that.online = false;
	  that.tell("book:offline");
	}, false);
	
	window.addEventListener("online", function(e) {
	  that.online = true;
	  that.tell("book:online");
	}, false);
	
	
	window.addEventListener("hashchange", that.route.bind(this), false);
	
}

//-- Check bookUrl and start parsing book Assets or load them from storage 

EPUBJS.Book.prototype.start = function(bookPath){
	var location = window.location,
		pathname = location.pathname,
		absolute = bookPath.search("://") != -1,
		fromRoot = pathname[0] == "/",
		cleaned = [],
		folder = "/",
		origin,
		split;
		
	if(bookPath[bookPath.length - 1] != "/") bookPath += "/";

	
	
	//-- Checks if the url is a zip file and unpack
	if(this.isContained(bookPath)){
		this.bookPath = bookPath;
		this.bookUrl = "";
		this.contained = true;
		this.tell("book:offline");
		if(this.online) this.unarchive(bookPath);
		return;
	}
	
	this.bookPath = bookPath;
	
	//-- Get URL orgin, try for native or combine 
	origin = location.origin || location.protocol + "//" + location.host;
	
	//-- 1. Check if url is absolute
	if(absolute){
		this.bookUrl = bookPath;
	}
	
	//-- 2. Check if url starts with /, add base url
	if(!absolute && fromRoot){
		this.bookUrl = origin + "/" + bookPath; 
	}
	
	//-- 3. Or find full path to url and add that
	if(!absolute && !fromRoot){
		
		pathname.split('/').forEach(function(part){
			if(part.indexOf(".") == -1){
				cleaned.push(part);
			}
		});
		
		folder = cleaned.join("/") + "/";
		
		this.bookUrl =  origin + folder + bookPath;
	}
	
	
	if(!this.isSaved()){
		
		if(!this.online) {
			console.error("Not Online"); 
			return;
		}
		
		//-- Gets the root of the book and url of the opf
		this.parseContainer();		

	}else{
		//-- Events for elements loaded from storage
		this.tell("book:tocReady");
		this.tell("book:metadataReady");
		this.tell("book:spineReady");

		//-- Info is saved, start display
		this.startDisplay();
	}

}

EPUBJS.Book.prototype.unarchive = function(bookPath){
	var unzipped;
	
	//-- TODO: make more DRY

	if(!this.isSaved()){
		
		unzipped = new EPUBJS.Unarchiver(bookPath, function(){

			EPUBJS.storage.get("META-INF/container.xml", function(url){
				this.parseContainer(url);
			}.bind(this));
				
		}.bind(this));
	
	}else{
		//-- Events for elements loaded from storage
		this.tell("book:tocReady");
		this.tell("book:metadataReady");
		this.tell("book:spineReady");
	
		//-- Info is saved, start display
		this.startDisplay();
	}

}

EPUBJS.Book.prototype.isSaved = function(force) {
	//-- If url or version has changed invalidate stored data and reset
	if (localStorage.getItem("bookPath") != this.bookPath ||
		localStorage.getItem("fpjs-version") != EPUBJS.VERSION ||
		force == true) {
		
		localStorage.setItem("fpjs-version", EPUBJS.VERSION);
		
		localStorage.setItem("bookPath", this.bookPath);
		localStorage.setItem("stored", 0);
		
		localStorage.setItem("spinePos", 0);
		localStorage.setItem("chapterPos", 0);
		localStorage.setItem("displayedPages", 0);
		
		this.spinePos = 0;
		this.stored = 0;
		
		return false;
	}else{
		//-- get previous saved positions
		this.spinePos = parseInt(localStorage.getItem("spinePos")) || 0;
		this.stored = parseInt(localStorage.getItem("stored")) || 0;
		
		//-- get previous saved paths
		this.basePath = localStorage.getItem("basePath");
		this.contentsPath = localStorage.getItem("contentsPath");
		
		//-- get previous saved content
		this.metadata = JSON.parse(localStorage.getItem("metadata"));
		this.assets = JSON.parse(localStorage.getItem("assets"));
		this.spine = JSON.parse(localStorage.getItem("spine"));
		this.spineIndexByURL = JSON.parse(localStorage.getItem("spineIndexByURL"));
		this.toc = JSON.parse(localStorage.getItem("toc"));
		
		//-- Get previous page
		this.prevChapterPos = parseInt(localStorage.getItem("chapterPos"));
		this.prevDisplayedPages = parseInt(localStorage.getItem("displayedPages"));
		
		//-- Check that retrieved object aren't null 
		if(!this.assets || !this.spine || !this.spineIndexByURL || !this.toc){
			this.stored = 0;
			return false;
		}
		
		return true;
	}

	
}

EPUBJS.Book.prototype.isContained = function(bookUrl){
	var tester=/\.[0-9a-z]+$/i,
		ext = tester.exec(bookUrl);

	if(ext && (ext[0] == ".epub" || ext[0] == ".zip")){
		return true;
	}

	return false;
}


EPUBJS.Book.prototype.onResized = function(){
	this.tell("book:resized", {
		width: this.el.clientWidth,
		height: this.el.clientHeight
	});
}

EPUBJS.Book.prototype.resizeIframe = function(e, cWidth, cHeight){
	var width, height;

	//-- Can be resized by the window resize event, or by passed height
	if(!e){
		width = cWidth;
		height = cHeight;
	}else{
		width = e.msg.width;
		height = e.msg.height;
	}

	this.iframe.height = height;

	if(width % 2 != 0){
		width += 1; //-- Prevent cutting off edges of text in columns
	}

	this.iframe.width = width;
}

EPUBJS.Book.prototype.parseContainer = function(path){
	var that = this,
		url = path || this.bookUrl + "META-INF/container.xml";
		
	EPUBJS.core.loadXML(url, function(container){
		var fullpath;

		//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
		rootfile = container.querySelector("rootfile");

		fullpath = rootfile.getAttribute('full-path').split("/");
		
		if(fullpath[1]){
			that.basePath = that.bookUrl + fullpath[0] + "/";
			that.contentsPath = that.basePath + fullpath[1];
		}else{
			that.basePath = that.bookUrl;
			that.contentsPath = that.bookUrl + fullpath;
		}
		
		if(that.contained){
			that.basePath = fullpath[0] + "/";
		}
		
		localStorage.setItem("basePath", that.basePath);
		localStorage.setItem("contentsPath", that.contentsPath);
		
		//-- Now that we have the path we can parse the contents
		//-- TODO: move this and handle errors
		
		if(that.contained){
			EPUBJS.storage.get(that.contentsPath, function(url){
				that.parseContents(url);
			});
		}else{
			//-- Gets the root of the book and url of the opf
			that.parseContents();
		}
		
	});

}

EPUBJS.Book.prototype.parseContents = function(path){
	var that = this,
		url = path || this.contentsPath;
	
	EPUBJS.core.loadXML(url, function(contents){
		var metadata = contents.querySelector("metadata"),
			manifest = contents.querySelector("manifest"),
			spine = contents.querySelector("spine");
			
		that.parseMetadata(metadata);
		that.parseManifest(manifest);
		that.parseSpine(spine);

		that.startDisplay();
	});
}

EPUBJS.Book.prototype.parseMetadata = function(metadata){
	var that = this,
		title = metadata.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/","title")[0]
		creator = metadata.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/","creator")[0];

	this.metadata = {};

	this.metadata["bookTitle"] = title ? title.childNodes[0].nodeValue : "";
	this.metadata["creator"] = creator ? creator.childNodes[0].nodeValue : "";
	
	//-- TODO: add more meta data items, such as ISBN
	
	localStorage.setItem("metadata", JSON.stringify(this.metadata));
	
	this.tell("book:metadataReady");
}

EPUBJS.Book.prototype.parseManifest = function(manifest){
	var that = this;

	this.assets = {};
	//-- Turn items into an array
	items = Array.prototype.slice.call(manifest.querySelectorAll("item"));
	//-- Create an object with the id as key
	items.forEach(function(item){
		var id = item.getAttribute('id'),
			href = item.getAttribute('href');
		that.assets[id] = that.basePath + href; //-- Absolute URL for loading with a web worker

		//-- Find NCX: media-type="application/x-dtbncx+xml" href="toc.ncx"
		if(item.getAttribute('media-type') == "application/x-dtbncx+xml"){
			if(that.contained){
				EPUBJS.storage.get(that.basePath + href, function(url){
					that.parseTOC(url);
				});
			}else{
				that.parseTOC(that.basePath + href);
			}
			
		}
	});
	
	localStorage.setItem("assets", JSON.stringify(this.assets));
}

EPUBJS.Book.prototype.parseSpine = function(spine){
	var that = this;

	this.spine = [];

	this.spineIndexByID = {}; //-- For quick reference by id and url, might be a better way
	this.spineIndexByURL = {};
	
	//-- Turn items into an array
	items = Array.prototype.slice.call(spine.getElementsByTagName("itemref"));

	//-- Add to array to mantain ordering and cross reference with manifest
	items.forEach(function(item, index){
		var id = item.getAttribute('idref'),
			href = that.assets[id];

		that.spine.push({"id": id, "href": href});
		that.spineIndexByID[id] = index;
		that.spineIndexByURL[href] = index;
	});
	
	localStorage.setItem("spine", JSON.stringify(this.spine));
	localStorage.setItem("spineIndexByURL", JSON.stringify(this.spineIndexByURL));
	
	this.tell("book:spineReady");
}

EPUBJS.Book.prototype.parseTOC = function(path){
	var that = this,
		url = path;

	this.toc = [];
	
	EPUBJS.core.loadXML(url, function(contents){
		var navMap = contents.querySelector("navMap"),
			cover = contents.querySelector("meta[name='cover']"),
			coverID;

		//-- Add cover
		if(cover){
			coverID = cover.getAttribute("content");
			that.toc.push({
						"id": coverID, 
						"href": that.assets[coverID], 
						"label": coverID 
						
			});
		}
		
		function getTOC(nodes, parent){
			var list = [];
			
			//-- Turn items into an array
			items = Array.prototype.slice.call(nodes);

			items.forEach(function(item){
				var id = item.getAttribute('id'),
					content = item.querySelector("content"),
					src = content.getAttribute('src'),
					split = src.split("#"),
					navLabel = item.querySelector("navLabel"),
					text = navLabel.textContent ? navLabel.textContent : "",
					subitems = item.querySelectorAll("navPoint") || false,
					subs = false,
					childof = (item.parentNode == parent);				

				if(!childof) return; //-- Only get direct children, should xpath for this eventually?

				if(subitems){
					subs = getTOC(subitems, item)
				}

				list.push({
							"id": id, 
							"href": src, 
							"label": text, 
							"subitems" : subs || false
				});

			});

			return list;
		}
		
		
		that.toc = that.toc.concat( getTOC(navMap.querySelectorAll("navPoint"), navMap) );
		
		
		localStorage.setItem("toc", JSON.stringify(that.toc));

		that.tell("book:tocReady");
		/*
		<navPoint class="chapter" id="xtitlepage" playOrder="1">
		  <navLabel><text>Moby-Dick</text></navLabel>
		  <content src="titlepage.xhtml"/>
		</navPoint>
		*/

	});

}

EPUBJS.Book.prototype.destroy = function(){
	window.removeEventListener("resize", this.onResized, false);
}

EPUBJS.Book.prototype.getTitle = function(){
	return this.metadata.bookTitle;
}

EPUBJS.Book.prototype.getCreator = function(){
	return this.metadata.creator;
}

EPUBJS.Book.prototype.chapterTitle = function(){
	return this.spine[this.spinePos].id; //-- TODO: clarify that this is returning title
}

EPUBJS.Book.prototype.startDisplay = function(chapter){
	var routed,
		prevChapter = this.spinePos,
		loaded = function(chapter){
			//-- If there is a saved page, and the pages haven't changed go to it
			if(	this.prevChapterPos 
					&& prevChapter  == chapter.pos
					&& this.prevDisplayedPages == chapter.displayedPages) {
				chapter.page(this.prevChapterPos);
			}
			
			//-- If there is network connection, store the books contents
			if(this.online && !this.contained){
				this.storeOffline();
			}

		}.bind(this);
	
	this.tell("book:bookReady");
	
	//-- Go to hashed page if present
	if(this.useHash){
		routed = this.route(false, loaded);
	}
	
	if(!this.useHash || !routed){
		this.displayChapter(this.spinePos, loaded);
	}
	
	
	
}

EPUBJS.Book.prototype.show = function(url, callback){
	var split = url.split("#"),
		chapter = split[0],
		section = split[1] || false,
		absoluteURL = (chapter.search("://") == -1) ? this.basePath + chapter : chapter,
		spinePos = this.spineIndexByURL[absoluteURL];
	
	//-- If link fragment only stay on current chapter
	if(!chapter){
		spinePos = this.spinePos;
	}
	
	//-- Check that URL is present in the index, or stop
	if(typeof(spinePos) != "number") return false;
	
	if(spinePos != this.spinePos || !this.currentChapter){
		//-- Load new chapter if different than current
		this.displayChapter(spinePos, function(chap){
			if(section) chap.section(section);
			if(callback) callback(chap);
		});
	}else{
		//-- Only goto section
		if(section) this.currentChapter.section(section);
		if(callback) callback(this.currentChapter);
	}
}

EPUBJS.Book.prototype.displayChapter = function(pos, callback){
	var that = this;

	if(pos >= this.spine.length){
		console.log("Reached End of Book")
		return false;
	}

	if(pos < 0){
		console.log("Reached Start of Book")
		return false;
	}

	localStorage.setItem("spinePos", pos);

	this.spinePos = pos;
	
	//-- Destroy previous
	if(this.currentChapter) {
		this.tell("book:chapterDestroy", this.currentChapter.getID());
	}
	
	//-- Create a new chapter	
	this.currentChapter = new EPUBJS.Chapter(this);


	this.currentChapter.afterLoaded = function(chapter) {

		that.tell("book:chapterReady", chapter.getID());
		
		if(callback){
			callback(chapter);
		}		
		
	}
}

EPUBJS.Book.prototype.nextPage = function(){
	var next = this.currentChapter.nextPage();
	if(!next){
		this.nextChapter();
	}
}

EPUBJS.Book.prototype.prevPage = function() {
	var prev = this.currentChapter.prevPage();
	if(!prev){
		this.prevChapter();
	}
}

EPUBJS.Book.prototype.nextChapter = function() {
	this.spinePos++;

	this.displayChapter(this.spinePos);
}

EPUBJS.Book.prototype.prevChapter = function() {
	this.spinePos--;

	this.displayChapter(this.spinePos, function(chapter){
		chapter.goToChapterEnd();
	});
}



EPUBJS.Book.prototype.getTOC = function() {
	return this.toc;

}

/* TODO: Remove, replace by batch queue
EPUBJS.Book.prototype.preloadNextChapter = function() {
	var next = this.spinePos + 1,
		path = this.spine[next].href;

	file = EPUBJS.storage.preload(path);
}
*/

EPUBJS.Book.prototype.storeOffline = function(callback) {
	var assets = EPUBJS.core.toArray(this.assets);
	
	//-- Creates a queue of all items to load
	EPUBJS.storage.batch(assets, function(){
		this.stored = 1;
		localStorage.setItem("stored", 1);
		this.tell("book:stored");
		if(callback) callback();
	}.bind(this));
}

EPUBJS.Book.prototype.availableOffline = function() {
	return this.stored > 0 ? true : false;
}

EPUBJS.Book.prototype.fromStorage = function(stored) {
	
	if(this.contained) return;
	
	if(!stored){
		this.online = true;
		this.tell("book:online");
	}else{
		if(!this.availableOffline){
			//-- If book hasn't been cached yet, store offline
			this.storeOffline(function(){
				this.online = false;
				this.tell("book:offline");
			}.bind(this));
			
		}else{
			this.online = false;
			this.tell("book:offline");
		}
	}
	
}

EPUBJS.Book.prototype.route = function(hash, callback){
	var location = window.location.hash.replace('#/', '');
	if(this.useHash && location.length && location != this.prevLocation){
		this.show(location, callback);
		this.prevLocation = location;
		return true;
	}
	return false;
}

EPUBJS.Book.prototype.hideHashChanges = function(){
	this.useHash = false;
}

//-- Get pre-registered hooks
EPUBJS.Book.prototype.getHooks = function(){
	var that = this;
	
	plugTypes = EPUBJS.core.toArray(this.hooks);
		
	plugTypes.forEach(function(plug){
		var type = plug.ident;
		plugs = EPUBJS.core.toArray(EPUBJS.Hooks[type]);
		plugs.forEach(function(hook){
			that.registerHook(type, hook);
		});
	});
}

//-- Hooks allow for injecting async functions that must all complete before continuing 
//   Functions must have a callback as their first argument.
EPUBJS.Book.prototype.registerHook = function(type, toAdd){
	var that = this;
	
	if(typeof(this.hooks[type]) != "undefined"){
		
		if(typeof(toAdd) === "function"){
			this.hooks[type].push(toAdd);
		}else if(Array.isArray(toAdd)){
			toAdd.forEach(function(hook){
				that.hooks[type].push(hook);
			});
		}
		
		
	}else{
		//-- Allows for undefined hooks, but maybe this should error?
		this.hooks[type] = [func];
	}
}

EPUBJS.Book.prototype.triggerHooks = function(type, callback, passed){
	var hooks, count;

	if(typeof(this.hooks[type]) == "undefined") return false;

	hooks = this.hooks[type];
	
	count = hooks.length;

	function countdown(){
		count--;
		if(count <= 0 && callback) callback();
	}

	hooks.forEach(function(hook){
		hook(countdown, passed);
	});
}

EPUBJS.Chapter = function(book, pos){

	this.book = book;
	this.iframe = this.book.iframe;
	
	this.pos = pos || this.book.spinePos
	this.chapInfo = this.book.spine[this.pos];
	//-- Get the url to the book from the spine
	this.path = this.chapInfo.href;
	this.ID = this.chapInfo.id;
	
	this.chapterPos = 1;
	this.leftPos = 0;
	localStorage.setItem("chapterPos", this.chapterPos);
	
	
	this.book.registerHook("beforeChapterDisplay", 
				[this.replaceLinks.bind(this), this.replaceResources.bind(this)]);
	
	
	this.load();
	
	return this;

}

EPUBJS.Chapter.prototype.load = function(){
	var path = this.path;

	if(this.book.online && !this.book.contained){
		this.setIframeSrc(path);
	}else{
		this.loadFromStorage(path);
	}
	
}

EPUBJS.Chapter.prototype.loadFromStorage = function(path){
	var file = EPUBJS.storage.get(path, this.setIframeSrc.bind(this));
}

EPUBJS.Chapter.prototype.setIframeSrc = function(url){
	var that = this;
	
	this.visible(false);
	
	this.iframe.src = url;
	
	
	this.iframe.onload = function() {
		that.doc = that.iframe.contentDocument;
		that.bodyEl = that.doc.body;
		
		
		that.formatSpread();
		
		//-- Trigger registered hooks before displaying
		that.beforeDisplay(function(){
			
			that.calcPages();
			
			that.book.tell("book:chapterDisplayed");
			
			that.visible(true);

		});
		
		that.afterLoaded(that);

		that.book.listen("book:resized", that.formatSpread, that);

	}
}

EPUBJS.Chapter.prototype.afterLoaded = function(chapter){
	//-- This is overwritten by the book object
}

EPUBJS.Chapter.prototype.error = function(err){
	console.log("error", error)
}

EPUBJS.Chapter.prototype.formatSpread = function(){

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

	if(this.elWidth < cutoff || this.book.single) {
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

	this.bodyEl.style.fontSize = localStorage.getItem("fontSize") || "medium";
	//-- Clear Margins
	//this.bodyEl.style.visibility = "hidden";
	this.bodyEl.style.margin = "0";
	this.bodyEl.style.overflow = "hidden";

	this.bodyEl.style.width = this.elWidth;

	//-- Adjust height
	this.bodyEl.style.height = this.book.el.clientHeight + "px";

	//-- Add columns
	this.bodyEl.style[EPUBJS.core.columnAxis] = "horizontal";
	this.bodyEl.style[EPUBJS.core.columnGap] = this.gap+"px";
	this.bodyEl.style[EPUBJS.core.columnWidth] = this.colWidth+"px";
	
	
	//-- Go to current page after resize
	if(this.OldcolWidth){		
		this.setLeft((this.chapterPos - 1 ) * this.spreadWidth);
	}
}

EPUBJS.Chapter.prototype.fixedLayout = function(){
	this.paginated = false;
	console.log("off")
	this.setLeft(0);
	
	this.bodyEl.style.width = this.elWidth;
	
	//-- Adjust height
	this.bodyEl.style.height = "auto";
	
	//-- Remove columns
	this.bodyEl.style[EPUBJS.core.columnWidth] = "auto";
	
	//-- Scroll
	this.bodyEl.style.overflow = "auto";
	
	this.displayedPages = 1;
}

EPUBJS.Chapter.prototype.goToChapterEnd = function(){
	this.chapterEnd();
}

EPUBJS.Chapter.prototype.visible = function(bool){
	if(typeof(bool) == "undefined") {
		return this.iframe.style.visibility;
	}
	
	if(bool == true){
		this.iframe.style.visibility = "visible";
	}else if(bool == false){
		this.iframe.style.visibility = "hidden";
	}
}

EPUBJS.Chapter.prototype.calcPages = function(){
	this.totalWidth = this.iframe.contentDocument.documentElement.scrollWidth; //this.bodyEl.scrollWidth;

	this.displayedPages = Math.ceil(this.totalWidth / this.spreadWidth);
	

	localStorage.setItem("displayedPages", this.displayedPages);
	//console.log("Pages:", this.displayedPages)
}


EPUBJS.Chapter.prototype.nextPage = function(){
	if(this.chapterPos < this.displayedPages){
		this.chapterPos++;

		this.leftPos += this.spreadWidth;

		this.setLeft(this.leftPos);
		
		localStorage.setItem("chapterPos", this.chapterPos);
		this.book.tell("book:pageChanged", this.chapterPos);
		
		return this.chapterPos;
	}else{
		return false;
	}
}

EPUBJS.Chapter.prototype.prevPage = function(){
	if(this.chapterPos > 1){
		this.chapterPos--;

		this.leftPos -= this.spreadWidth;

		this.setLeft(this.leftPos);
		
		localStorage.setItem("chapterPos", this.chapterPos);
		this.book.tell("book:pageChanged", this.chapterPos);
		
		return this.chapterPos;
	}else{
		return false;
	}
}

EPUBJS.Chapter.prototype.chapterEnd = function(){
	this.page(this.displayedPages);
}

EPUBJS.Chapter.prototype.setLeft = function(leftPos){
	this.bodyEl.style.marginLeft = -leftPos + "px";
	
	/*
	var left = "transform: " + (-leftPos) + "px";
	//-- Need to stardize this
	
	this.bodyEl.style.webkitTransform = left;   //Chrome and Safari
	this.bodyEl.style.MozTransform = left;      //Firefox
	this.bodyEl.style.msTransform = left;       //IE
	this.bodyEl.style.OTransform = left;        //Opera
	this.bodyEl.style.transform = left; 
	*/
}

//-- Replaces the relative links within the book to use our internal page changer
EPUBJS.Chapter.prototype.replaceLinks = function(callback){
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
				if(that.book.useHash){
					window.location.hash = "#/"+href;
				}else{
					that.book.show(href);
				}
			}
		}				
		
		
	});
	
	if(callback) callback();
}

//-- Replaces assets src's to point to stored version if browser is offline
EPUBJS.Chapter.prototype.replaceResources = function(callback){
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

EPUBJS.Chapter.prototype.getID = function(){
	return this.ID;
}

EPUBJS.Chapter.prototype.page = function(pg){
	if(pg >= 1 && pg <= this.displayedPages){
		this.chapterPos = pg;
		this.leftPos = this.spreadWidth * (pg-1); //-- pages start at 1
		this.setLeft(this.leftPos);
		
		localStorage.setItem("chapterPos", pg);
		return true;
	}
	
	//-- Return false if page is greater than the total
	return false;
}

//-- Find a section by fragement id
EPUBJS.Chapter.prototype.section = function(fragment){
	var el = this.doc.getElementById(fragment),
		left, pg;
	
	if(el){
		left = this.leftPos + el.getBoundingClientRect().left, //-- Calculate left offset compaired to scrolled position
		pg = Math.floor(left / this.spreadWidth) + 1; //-- pages start at 1
		this.page(pg);
	}	

}

EPUBJS.Chapter.prototype.beforeDisplay = function(callback){
	this.book.triggerHooks("beforeChapterDisplay", callback.bind(this), this);
}


var EPUBJS = EPUBJS || {}; 
EPUBJS.core = {}

//-- Get a element for an id
EPUBJS.core.getEl = function(elem) {
  return document.getElementById(elem);
}

//-- Get all elements for a class
EPUBJS.core.getEls = function(classes) {
  return document.getElementsByClassName(classes);
}


EPUBJS.core.loadXML = function(url, callback){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/xml');

	xhr.onload = function(e) {
		if (this.status == 200) {
			callback(this.responseXML);
		}
	};

	xhr.send();
}

// EPUBJS.core.loadFile = function(url){
// 	var xhr = new XMLHttpRequest(),
// 		succeeded,
// 		failed;
// 
// 	function _loaded(response){
// 		console.log("response")
// 	}
// 	
// 	function _error(err){
// 		console.log("Error:", err);
// 	}
// 	
// 	function start(){
// 		//xhr.open('GET', url, true);
// 		//xhr.responseType = 'blob';
// 		
// 		xhr.onload = function(e) {
// 			if (this.status == 200) {
// 				succeeded(this.response);
// 			}
// 		};
// 		
// 		xhr.onerror = function(e) {
// 			_error(this.status); //-- TODO: better error message
// 		};
// 		
// 		//xhr.send();
// 		console.log(succeeded)
// 	}
// 	
// 	return {
// 		"start": start,
// 		"loaded" : succeeded,
// 		"error" : failed
// 	}
// }

EPUBJS.core.loadFile = function(url, callback){
	var xhr = new XMLHttpRequest();
	
	this.succeeded = function(response){
		if(callback){
			callback(response);
		}
	}

	this.failed = function(err){
		console.log("Error:", err);
	}

	this.start = function(){
		var that = this;
		
		xhr.open('GET', url, true);
		xhr.responseType = 'blob';

		xhr.onload = function(e) {
			if (this.status == 200) {
				that.succeeded(this.response);
			}
		};

		xhr.onerror = function(e) {
			that.failed(this.status); //-- TODO: better error message
		};

		xhr.send();
	}

	return {
		"start": this.start,
		"succeeded" : this.succeeded,
		"failed" : this.failed
	}
}

EPUBJS.core.crossBrowserColumnCss = function(){
	//-- From Readium: reflowable_pagination_view.js

	var cssIfy = function(str) {
		return str.replace(/([A-Z])/g, function(str,m1){ 
			return '-' + m1.toLowerCase(); 
		}).replace(/^ms-/,'-ms-');
	};

	// ask modernizr for the vendor prefixed version
	EPUBJS.core.columnAxis =  Modernizr.prefixed('columnAxis') || 'columnAxis';
	EPUBJS.core.columnGap =  Modernizr.prefixed('columnGap') || 'columnGap';
	EPUBJS.core.columnWidth =  Modernizr.prefixed('columnWidth') || 'columnWidth';

	// we are interested in the css prefixed version
	// EPUBJS.core.columnAxis =  cssIfy(EPUBJS.core.columnAxis);
	// EPUBJS.core.columnGap =  cssIfy(EPUBJS.core.columnGap);
	// EPUBJS.core.columnWidth =  cssIfy(EPUBJS.core.columnWidth);

}

EPUBJS.core.toArray = function(obj) {
  var arr = [];

  for (member in obj) {
	var newitm;
	if ( obj.hasOwnProperty(member) ) {
	  newitm = obj[member];
	  newitm.ident = member;
	  arr.push(newitm);
	}
  }

  return arr;
};

//-- https://github.com/ebidel/filer.js/blob/master/src/filer.js#L128
EPUBJS.core.dataURLToBlob = function(dataURL) {
	var BASE64_MARKER = ';base64,';
	if (dataURL.indexOf(BASE64_MARKER) == -1) {
	  var parts = dataURL.split(',');
	  var contentType = parts[0].split(':')[1];
	  var raw = parts[1];

	  return new Blob([raw], {type: contentType});
	}

	var parts = dataURL.split(BASE64_MARKER);
	var contentType = parts[0].split(':')[1];
	var raw = window.atob(parts[1]);
	var rawLength = raw.length;

	var uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
	  uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], {type: contentType});
 }
 
//-- Load scripts async: http://stackoverflow.com/questions/7718935/load-scripts-asynchronously 
EPUBJS.core.addScript = function(src, callback, target) {
   var s, r;
   r = false;
   s = document.createElement('script');
   s.type = 'text/javascript';
   s.async = false;
   s.src = src;
   s.onload = s.onreadystatechange = function() {
 	//console.log( this.readyState ); //uncomment this line to see which ready states are called.
 	if ( !r && (!this.readyState || this.readyState == 'complete') )
 	{
 	  r = true;
 	  if(callback) callback();
 	}
   },
   target = target || document.body;
   target.appendChild(s);
 }
 
 EPUBJS.core.addScripts = function(srcArr, callback, target) {
	var total = srcArr.length,
		curr = 0,
		cb = function(){
			curr++;
			if(total == curr){
				if(callback) callback();
			}else{
				EPUBJS.core.loadScript(srcArr[curr], cb, target);
			}
		};
		
    // srcArr.forEach(function(src){
    // EPUBJS.core.loadScript(src, cb, target);
    // });
    EPUBJS.core.addScript(srcArr[curr], cb, target);
    
 }
 
 EPUBJS.core.addCss = function(src, callback, target) {
    var s, r;
    r = false;
    s = document.createElement('link');
    s.type = 'text/css';
    s.rel = "stylesheet";
    s.href = src;
    s.onload = s.onreadystatechange = function() {
  	if ( !r && (!this.readyState || this.readyState == 'complete') )
  	{
  	  r = true;
  	  if(callback) callback();
  	}
    },
    target = target || document.body;
    target.appendChild(s);
  }

EPUBJS.Events = function(obj, el){
	
	this.events = {};
	
	if(!el){
		this.el = document.createElement('div');
	}else{
		this.el = el;
	}
	
	obj.createEvent = this.createEvent;
	obj.tell = this.tell;
	obj.listen = this.listen;
	obj.deafen = this.deafen;
	obj.listenUntil = this.listenUntil;
	
	return this;
}

EPUBJS.Events.prototype.createEvent = function(evt){
	var e = new CustomEvent(evt);
	this.events[evt] = e;
	return e;
}

EPUBJS.Events.prototype.tell = function(evt, msg){
	var e;

	if(!this.events[evt]){
		console.warn("No event:", evt,  "defined yet, creating.");
		e = this.createEvent(evt)
	}else{
		e = this.events[evt];
	}

	if(msg) e.msg = msg;
	this.el.dispatchEvent(e);

}

EPUBJS.Events.prototype.listen = function(evt, func, bindto){
	if(!this.events[evt]){
		console.warn("No event:", evt,  "defined yet, creating.");
		this.createEvent(evt);
		return;
	}

	if(bindto){
		this.el.addEventListener(evt, func.bind(bindto), false);
	}else{
		this.el.addEventListener(evt, func, false);
	}

}

EPUBJS.Events.prototype.deafen = function(evt, func){
	this.el.removeEventListener(evt, func, false);
}

EPUBJS.Events.prototype.listenUntil = function(OnEvt, OffEvt, func, bindto){
	this.listen(OnEvt, func, bindto);
	
	function unlisten(){
		this.deafen(OnEvt, func);
		this.deafen(OffEvt, unlisten);
	}
	
	this.listen(OffEvt, unlisten, this);
}
EPUBJS.Hooks = (function(){

  "use strict";
  return {
	register: function(name) {
	  if(this[name] === undefined) { this[name] = {}; }
	  if(typeof this[name] !== 'object') { throw "Already registered: "+name; }
	  return this[name];
	}
  };
})();

EPUBJS.Unarchiver = function(url, callback){
	this.libPath = EPUBJS.filePath  + "libs/";
	this.zipUrl = url;
	this.callback = callback;
	this.loadLib(function(){
		this.getZip(this.zipUrl);
	}.bind(this));
}

EPUBJS.Unarchiver.prototype.loadLib = function(callback){
	if(typeof(zip) != "undefined") callback();
	//-- load script
	EPUBJS.core.loadScript(this.libPath+"zip.js", function(){
		//-- Tell zip where it is located
		zip.workerScriptsPath = this.libPath;
		callback();
	}.bind(this));
}

EPUBJS.Unarchiver.prototype.getZip = function(zipUrl){ 
	var xhr = new EPUBJS.core.loadFile(zipUrl);
	
	xhr.succeeded = function(file) {
		this.getEntries(file, this.toStorage.bind(this));
	}.bind(this);
	
	xhr.failed = this.failed;
	
	xhr.start();
	
}

EPUBJS.Unarchiver.prototype.getEntries = function(file, callback){
	zip.createReader(new zip.BlobReader(file), function(zipReader) {
		zipReader.getEntries(callback);
	}, this.failed);
}

EPUBJS.Unarchiver.prototype.failed = function(error){ 
	console.log("Error:", error);
}

EPUBJS.Unarchiver.prototype.afterSaved = function(error){ 
	this.callback();
}

EPUBJS.Unarchiver.prototype.toStorage = function(entries){
	var timeout = 0,
		delay = 20,
		that = this,
		count = entries.length;

	function callback(){
		count--;
		if(count == 0) that.afterSaved();
	}
		
	entries.forEach(function(entry){
		
		setTimeout(function(entry){
			that.saveEntryFileToStorage(entry, callback);
		}, timeout, entry);
		
		timeout += delay;
	});
	
	console.log("time", timeout);
	
	//entries.forEach(this.saveEntryFileToStorage.bind(this));
}

EPUBJS.Unarchiver.prototype.saveEntryFileToStorage = function(entry, callback){
	var that = this;
	entry.getData(new zip.BlobWriter(), function(blob) {
		EPUBJS.storage.save(entry.filename, blob, callback);
	});
}