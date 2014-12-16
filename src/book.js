EPUBJS.Book = function(options){

	var book = this;

	this.settings = _.defaults(options || {}, {
		bookPath : null,
		bookKey : null,
		packageUrl : null,
		storage: false, //-- true (auto) or false (none) | override: 'ram', 'websqldatabase', 'indexeddb', 'filesystem'
		fromStorage : false,
		saved : false,
		online : true,
		contained : false,
		width : null,
		height: null,
		layoutOveride : null, // Default: { spread: 'reflowable', layout: 'auto', orientation: 'auto'}
		orientation : null,
		minSpreadWidth: 800, //-- overridden by spread: none (never) / both (always)
		gap: "auto", //-- "auto" or int
		version: 1,
		restore: false,
		reload : false,
		goto : false,
		styles : {},
		headTags : {},
		withCredentials: false,
		render_method: "Iframe"
	});

	this.settings.EPUBJSVERSION = EPUBJS.VERSION;

	this.spinePos = 0;
	this.stored = false;

	//-- All Book events for listening
	/*
		book:ready
		book:stored
		book:online
		book:offline
		book:pageChanged
		book:loadFailed
		book:loadChapterFailed
	*/

	//-- Adds Hook methods to the Book prototype
	//   Hooks will all return before triggering the callback.
	// EPUBJS.Hooks.mixin(this);
	//-- Get pre-registered hooks for events
	// this.getHooks("beforeChapterDisplay");

	this.online = this.settings.online || navigator.onLine;
	this.networkListeners();

	this.store = false; //-- False if not using storage;

	//-- Determine storage method
	//-- Override options: none | ram | websqldatabase | indexeddb | filesystem

	if(this.settings.storage !== false){
		this.storage = new fileStorage.storage(this.settings.storage);
	}

	this.ready = {
		manifest: new RSVP.defer(),
		spine: new RSVP.defer(),
		metadata: new RSVP.defer(),
		cover: new RSVP.defer(),
		toc: new RSVP.defer(),
		pageList: new RSVP.defer()
	};

	this.readyPromises = [
		this.ready.manifest.promise,
		this.ready.spine.promise,
		this.ready.metadata.promise,
		this.ready.cover.promise,
		this.ready.toc.promise
	];

	this.pageList = [];
	this.pagination = new EPUBJS.Pagination();
	this.pageListReady = this.ready.pageList.promise;

	this.ready.all = RSVP.all(this.readyPromises);

	this.ready.all.then(this._ready.bind(this));

	// Queue for methods used before rendering
	this.isRendered = false;
	this._q = EPUBJS.core.queue(this);
	// Queue for rendering
	this._rendering = false;
	this._displayQ = EPUBJS.core.queue(this);
	// Queue for going to another location
	this._moving = false;
	this._gotoQ = EPUBJS.core.queue(this);

	/**
	* Creates a new renderer.
	* The renderer will handle displaying the content using the method provided in the settings
	*/
	this.renderer = new EPUBJS.Renderer(this.settings.render_method);
	//-- Set the width at which to switch from spreads to single pages
	this.renderer.setMinSpreadWidth(this.settings.minSpreadWidth);
	this.renderer.setGap(this.settings.gap);
	//-- Pass through the renderer events
	this.listenToRenderer(this.renderer);

	this.defer_opened = new RSVP.defer();
	this.opened = this.defer_opened.promise;
	// BookUrl is optional, but if present start loading process
	if(typeof this.settings.bookPath === 'string') {
		this.open(this.settings.bookPath, this.settings.reload);
	}

	window.addEventListener("beforeunload", this.unload.bind(this), false);

	//-- Listen for these promises:
	//-- book.opened.then()
	//-- book.rendered.then()
};

//-- Check bookUrl and start parsing book Assets or load them from storage
EPUBJS.Book.prototype.open = function(bookPath, forceReload){
	var book = this,
			epubpackage,
			opened = new RSVP.defer();

	this.settings.bookPath = bookPath;

	//-- Get a absolute URL from the book path
	this.bookUrl = this.urlFrom(bookPath);

	if(this.settings.contained || this.isContained(bookPath)){

		this.settings.contained = this.contained = true;

		this.bookUrl = '';

		epubpackage = this.unarchive(bookPath).
			then(function(){
				return book.loadPackage();
			});

	}	else {
		epubpackage = this.loadPackage();
	}

	if(this.settings.restore && !forceReload && localStorage){
		//-- Will load previous package json, or re-unpack if error
		epubpackage.then(function(packageXml) {
			var identifier = book.packageIdentifier(packageXml);
			var restored = book.restore(identifier);

			if(!restored) {
				book.unpack(packageXml);
			}
			opened.resolve();
			book.defer_opened.resolve();
		});

	}else{

		//-- Get package information from epub opf
		epubpackage.then(function(packageXml) {
			book.unpack(packageXml);
			opened.resolve();
			book.defer_opened.resolve();
		});
	}

	//-- If there is network connection, store the books contents
	if(this.online && this.settings.storage && !this.settings.contained){
		if(!this.settings.stored) opened.then(book.storeOffline());
	}

	this._registerReplacements(this.renderer);

	return opened.promise;

};

EPUBJS.Book.prototype.loadPackage = function(_containerPath){
	var book = this,
			parse = new EPUBJS.Parser(),
			containerPath = _containerPath || "META-INF/container.xml",
			containerXml,
			packageXml;

	if(!this.settings.packageUrl) { //-- provide the packageUrl to skip this step
		packageXml = book.loadXml(book.bookUrl + containerPath).
			then(function(containerXml){
				return parse.container(containerXml); // Container has path to content
			}).
			then(function(paths){
				book.settings.contentsPath = book.bookUrl + paths.basePath;
				book.settings.packageUrl = book.bookUrl + paths.packagePath;
				book.settings.encoding = paths.encoding;
				return book.loadXml(book.settings.packageUrl); // Containes manifest, spine and metadata
			});
	} else {
		packageXml = book.loadXml(book.settings.packageUrl);
	}

	packageXml.catch(function(error) {
		// handle errors in either of the two requests
		console.error("Could not load book at: "+ containerPath);
		book.trigger("book:loadFailed", containerPath);
	});
	return packageXml;
};

EPUBJS.Book.prototype.packageIdentifier = function(packageXml){
	var book = this,
			parse = new EPUBJS.Parser();

	return parse.identifier(packageXml);
};

EPUBJS.Book.prototype.unpack = function(packageXml){
	var book = this,
			parse = new EPUBJS.Parser();

	book.contents = parse.packageContents(packageXml, book.settings.contentsPath); // Extract info from contents

	book.manifest = book.contents.manifest;
	book.spine = book.contents.spine;
	book.spineIndexByURL = book.contents.spineIndexByURL;
	book.metadata = book.contents.metadata;
	if(!book.settings.bookKey) {
		book.settings.bookKey = book.generateBookKey(book.metadata.identifier);
	}

	//-- Set Globbal Layout setting based on metadata
	book.globalLayoutProperties = book.parseLayoutProperties(book.metadata);
	
	if(book.contents.coverPath) {
		book.cover = book.contents.cover = book.settings.contentsPath + book.contents.coverPath;
	}
	
	book.spineNodeIndex = book.contents.spineNodeIndex;

	book.ready.manifest.resolve(book.contents.manifest);
	book.ready.spine.resolve(book.contents.spine);
	book.ready.metadata.resolve(book.contents.metadata);
	book.ready.cover.resolve(book.contents.cover);


	//-- Load the TOC, optional; either the EPUB3 XHTML Navigation file or the EPUB2 NCX file
	if(book.contents.navPath) {
		book.settings.navUrl = book.settings.contentsPath + book.contents.navPath;

		book.loadXml(book.settings.navUrl).
			then(function(navHtml){
				return parse.nav(navHtml, book.spineIndexByURL, book.spine); // Grab Table of Contents
			}).then(function(toc){
				book.toc = book.contents.toc = toc;
				book.ready.toc.resolve(book.contents.toc);
			}, function(error) {
				book.ready.toc.resolve(false);
			});

		// Load the optional pageList
		book.loadXml(book.settings.navUrl).
			then(function(navHtml){
				return parse.pageList(navHtml, book.spineIndexByURL, book.spine);
			}).then(function(pageList){
				var epubcfi = new EPUBJS.EpubCFI();
				var wait = 0; // need to generate a cfi

				// No pageList found
				if(pageList.length === 0) {
					return;
				}

				book.pageList = book.contents.pageList = pageList;

				// Replace HREFs with CFI
				book.pageList.forEach(function(pg){
					if(!pg.cfi) {
						wait += 1;
						epubcfi.generateCfiFromHref(pg.href, book).then(function(cfi){
							pg.cfi = cfi;
							pg.packageUrl = book.settings.packageUrl;

							wait -= 1;
							if(wait === 0) {
								book.pagination.process(book.pageList);
								book.ready.pageList.resolve(book.pageList);
							}
						});
					}
				});

				if(!wait) {
					book.pagination.process(book.pageList);
					book.ready.pageList.resolve(book.pageList);
				}

			}, function(error) {
				book.ready.pageList.resolve([]);
			});
	} else if(book.contents.tocPath) {
		book.settings.tocUrl = book.settings.contentsPath + book.contents.tocPath;

		book.loadXml(book.settings.tocUrl).
			then(function(tocXml){
					return parse.toc(tocXml, book.spineIndexByURL, book.spine); // Grab Table of Contents
			}).then(function(toc){
				book.toc = book.contents.toc = toc;
				book.ready.toc.resolve(book.contents.toc);
			}, function(error) {
				book.ready.toc.resolve(false);
			});

	} else {
		book.ready.toc.resolve(false);
	}

};

EPUBJS.Book.prototype.createHiddenRender = function(renderer, _width, _height) {
	var box = this.element.getBoundingClientRect();
	var width = _width || this.settings.width || box.width;
	var height = _height || this.settings.height || box.height;
	var hiddenContainer;
	var hiddenEl;
	renderer.setMinSpreadWidth(this.settings.minSpreadWidth);
	renderer.setGap(this.settings.gap);

  this._registerReplacements(renderer);
	if(this.settings.forceSingle) {
		renderer.forceSingle(true);
	}

	hiddenContainer = document.createElement("div");
	hiddenContainer.style.visibility = "hidden";
	hiddenContainer.style.overflow = "hidden";
	hiddenContainer.style.width = "0";
	hiddenContainer.style.height = "0";
	this.element.appendChild(hiddenContainer);

	hiddenEl = document.createElement("div");
	hiddenEl.style.visibility = "hidden";
	hiddenEl.style.overflow = "hidden";
	hiddenEl.style.width = width + "px";//"0";
	hiddenEl.style.height = height +"px"; //"0";
	hiddenContainer.appendChild(hiddenEl);

	renderer.initialize(hiddenEl);
	return hiddenContainer;
};

// Generates the pageList array by loading every chapter and paging through them
EPUBJS.Book.prototype.generatePageList = function(width, height){
	var pageList = [];
	var pager = new EPUBJS.Renderer(this.settings.render_method, false); //hidden
	var hiddenContainer = this.createHiddenRender(pager, width, height);
	var deferred = new RSVP.defer();
	var spinePos = -1;
	var spineLength = this.spine.length;
	var totalPages = 0;
	var currentPage = 0;
	var nextChapter = function(deferred){
		var chapter;
		var next = spinePos + 1;
		var done = deferred || new RSVP.defer();
		var loaded;
		if(next >= spineLength) {
			done.resolve();
		} else {
			spinePos = next;
			chapter = new EPUBJS.Chapter(this.spine[spinePos], this.store);
			pager.displayChapter(chapter, this.globalLayoutProperties).then(function(chap){
				pager.pageMap.forEach(function(item){
					currentPage += 1;
					pageList.push({
						"cfi" : item.start,
						"page" : currentPage
					});

				});

				if(pager.pageMap.length % 2 > 0 &&
					 pager.spreads) {
					currentPage += 1; // Handle Spreads
					pageList.push({
						"cfi" : pager.pageMap[pager.pageMap.length - 1].end,
						"page" : currentPage
					});
				}

				// Load up the next chapter
				setTimeout(function(){
					nextChapter(done);
				}, 1);
			});
		}
		return done.promise;
	}.bind(this);

	var finished = nextChapter().then(function(){
		pager.remove();
		this.element.removeChild(hiddenContainer);
		deferred.resolve(pageList);
	}.bind(this));

	return deferred.promise;
};

// Render out entire book and generate the pagination
// Width and Height are optional and will default to the current dimensions
EPUBJS.Book.prototype.generatePagination = function(width, height) {
	var book = this;
	var defered = new RSVP.defer();

	this.ready.spine.promise.then(function(){
		book.generatePageList(width, height).then(function(pageList){
			book.pageList = book.contents.pageList = pageList;
			book.pagination.process(pageList);
			book.ready.pageList.resolve(book.pageList);
			defered.resolve(book.pageList);
		});
	});

	return defered.promise;
};

// Process the pagination from a JSON array containing the pagelist
EPUBJS.Book.prototype.loadPagination = function(pagelistJSON) {
	var pageList = JSON.parse(pagelistJSON);

	if(pageList && pageList.length) {
		this.pageList = pageList;
		this.pagination.process(this.pageList);
		this.ready.pageList.resolve(this.pageList);
	}
	return this.pageList;
};

EPUBJS.Book.prototype.getPageList = function() {
	return this.ready.pageList.promise;
};

EPUBJS.Book.prototype.getMetadata = function() {
	return this.ready.metadata.promise;
};

EPUBJS.Book.prototype.getToc = function() {
	return this.ready.toc.promise;
};

/* Private Helpers */

//-- Listeners for browser events
EPUBJS.Book.prototype.networkListeners = function(){
	var book = this;

	window.addEventListener("offline", function(e) {
		book.online = false;
		book.trigger("book:offline");
	}, false);

	window.addEventListener("online", function(e) {
		book.online = true;
		book.trigger("book:online");
	}, false);

};

// Listen to all events the renderer triggers and pass them as book events
EPUBJS.Book.prototype.listenToRenderer = function(renderer){
	var book = this;
	renderer.Events.forEach(function(eventName){
		renderer.on(eventName, function(e){
			book.trigger(eventName, e);
		});
	});

	renderer.on("renderer:visibleRangeChanged", function(range) {
		var startPage, endPage, percent;
		var pageRange = [];

		if(this.pageList.length > 0) {
			startPage = this.pagination.pageFromCfi(range.start);
			percent = this.pagination.percentageFromPage(startPage);
			pageRange.push(startPage);

			if(range.end) {
				endPage = this.pagination.pageFromCfi(range.end);
				//if(startPage != endPage) {
					pageRange.push(endPage);
				//}
			}
			this.trigger("book:pageChanged", {
				"anchorPage": startPage,
				"percentage": percent,
				"pageRange" : pageRange
			});

			// TODO: Add event for first and last page.
			// (though last is going to be hard, since it could be several reflowed pages long)
		}
	}.bind(this));

	renderer.on("render:loaded", this.loadChange.bind(this));
};

// Listens for load events from the Renderer and checks against the current chapter
// Prevents the Render from loading a different chapter when back button is pressed
EPUBJS.Book.prototype.loadChange = function(url){
	var uri = EPUBJS.core.uri(url);
	var chapter;
	
	if(this.currentChapter) {
		chapter = EPUBJS.core.uri(this.currentChapter.absolute);
	}
	
	if(!this._rendering && this.currentChapter && uri.path != chapter.path){
		console.warn("Miss Match", uri.path, this.currentChapter.absolute);
		this.goto(uri.filename);
	}
};

EPUBJS.Book.prototype.unlistenToRenderer = function(renderer){
	renderer.Events.forEach(function(eventName){
		renderer.off(eventName);
	}	);
};

//-- Choose between a request from store or a request from network
EPUBJS.Book.prototype.loadXml = function(url){
	if(this.settings.fromStorage) {
		return this.storage.getXml(url, this.settings.encoding);
	} else if(this.settings.contained) {
		return this.zip.getXml(url, this.settings.encoding);
	}else{
		return EPUBJS.core.request(url, 'xml', this.settings.withCredentials);
	}
};

//-- Turns a url into a absolute url
EPUBJS.Book.prototype.urlFrom = function(bookPath){
	var uri = EPUBJS.core.uri(bookPath),
		absolute = uri.protocol,
		fromRoot = uri.path[0] == "/",
		location = window.location,
		//-- Get URL orgin, try for native or combine
		origin = location.origin || location.protocol + "//" + location.host,
		baseTag = document.getElementsByTagName('base'),
		base;


	//-- Check is Base tag is set

	if(baseTag.length) {
		base = baseTag[0].href;
	}

	//-- 1. Check if url is absolute
	if(uri.protocol){
		return uri.origin + uri.path;
	}

	//-- 2. Check if url starts with /, add base url
	if(!absolute && fromRoot){
		return (base || origin) + uri.path;
	}

	//-- 3. Or find full path to url and add that
	if(!absolute && !fromRoot){
		return EPUBJS.core.resolveUrl(base || location.pathname, uri.path);
	}

};


EPUBJS.Book.prototype.unarchive = function(bookPath){
	var book = this,
		unarchived;

	//-- Must use storage
	// if(this.settings.storage == false ){
		// this.settings.storage = true;
		// this.storage = new fileStorage.storage();
	// }

	this.zip = new EPUBJS.Unarchiver();
	this.store = this.zip; // Use zip storaged in ram
	return this.zip.openZip(bookPath);
};

//-- Checks if url has a .epub or .zip extension
EPUBJS.Book.prototype.isContained = function(bookUrl){
	var uri = EPUBJS.core.uri(bookUrl);

	if(uri.extension && (uri.extension == "epub" || uri.extension == "zip")){
		return true;
	}

	return false;
};

//-- Checks if the book can be retrieved from localStorage
EPUBJS.Book.prototype.isSaved = function(bookKey) {
	var storedSettings;

	if(!localStorage) {
		return false;
	}

	storedSettings = localStorage.getItem(bookKey);

	if( !localStorage ||
		storedSettings === null) {
		return false;
	} else {
		return true;
	}
};

// Generates the Book Key using the identifer in the manifest or other string provided
EPUBJS.Book.prototype.generateBookKey = function(identifier){
	return "epubjs:" + EPUBJS.VERSION + ":" + window.location.host + ":" + identifier;
};

EPUBJS.Book.prototype.saveContents = function(){
	if(!localStorage) {
		return false;
	}
	localStorage.setItem(this.settings.bookKey, JSON.stringify(this.contents));
};

EPUBJS.Book.prototype.removeSavedContents = function() {
	if(!localStorage) {
		return false;
	}
	localStorage.removeItem(this.settings.bookKey);
};



//-- Takes a string or a element
EPUBJS.Book.prototype.renderTo = function(elem){
	var book = this,
		rendered;

	if(_.isElement(elem)) {
		this.element = elem;
	} else if (typeof elem == "string") {
		this.element = EPUBJS.core.getEl(elem);
	} else {
		console.error("Not an Element");
		return;
	}

	rendered = this.opened.
				then(function(){
					// book.render = new EPUBJS.Renderer[this.settings.renderer](book);
					book.renderer.initialize(book.element, book.settings.width, book.settings.height);

					if(book.metadata.direction) {
						book.renderer.setDirection(book.metadata.direction);
					}

					book._rendered();
					return book.startDisplay();
				});

	// rendered.then(null, function(error) { console.error(error); });

	return rendered;
};

EPUBJS.Book.prototype.startDisplay = function(){
	var display;

	if(this.settings.goto) {
		display = this.goto(this.settings.goto);
	}else if(this.settings.previousLocationCfi) {
		display = this.gotoCfi(this.settings.previousLocationCfi);
	}else{
		display = this.displayChapter(this.spinePos);
	}

	return display;
};

EPUBJS.Book.prototype.restore = function(identifier){

	var book = this,
			fetch = ['manifest', 'spine', 'metadata', 'cover', 'toc', 'spineNodeIndex', 'spineIndexByURL', 'globalLayoutProperties'],
			reject = false,
			bookKey = this.generateBookKey(identifier),
			fromStore = localStorage.getItem(bookKey),
			len = fetch.length,
			i;

	if(this.settings.clearSaved) reject = true;

	if(!reject && fromStore != 'undefined' && fromStore !== null){
		book.contents = JSON.parse(fromStore);

		for(i = 0; i < len; i++) {
			var item = fetch[i];

			if(!book.contents[item]) {
				reject = true;
				break;
			}
			book[item] = book.contents[item];
		}
	}

	if(reject || !fromStore || !this.contents || !this.settings.contentsPath){
		return false;
	}else{
		this.settings.bookKey = bookKey;
		this.ready.manifest.resolve(this.manifest);
		this.ready.spine.resolve(this.spine);
		this.ready.metadata.resolve(this.metadata);
		this.ready.cover.resolve(this.cover);
		this.ready.toc.resolve(this.toc);
		return true;
	}

};

EPUBJS.Book.prototype.displayChapter = function(chap, end, deferred){
	var book = this,
		render,
		cfi,
		pos,
		store,
		defer = deferred || new RSVP.defer();

	var chapter;

	if(!this.isRendered) {
		this._q.enqueue("displayChapter", arguments);
		// Reject for now. TODO: pass promise to queue
		defer.reject({
				message : "Rendering",
				stack : new Error().stack
			});
		return defer.promise;
	}


	if(this._rendering || this._rendering) {
		// Pass along the current defer
		this._displayQ.enqueue("displayChapter", [chap, end, defer]);
		return defer.promise;
	}

	if(_.isNumber(chap)){
		pos = chap;
	}else{
		cfi = new EPUBJS.EpubCFI(chap);
		pos = cfi.spinePos;
	}

	if(pos < 0 || pos >= this.spine.length){
		console.warn("Not A Valid Location");
		pos = 0;
		end = false;
		cfi = false;
	}

	//-- Create a new chapter
	chapter = new EPUBJS.Chapter(this.spine[pos], this.store);

	this._rendering = true;

	render = book.renderer.displayChapter(chapter, this.globalLayoutProperties);
	if(cfi) {
		book.renderer.gotoCfi(cfi);
	} else if(end) {
		book.renderer.lastPage();
	}
	//-- Success, Clear render queue
	render.then(function(rendered){
		// var inwait;
		//-- Set the book's spine position
		book.spinePos = pos;

		defer.resolve(book.renderer);

		if(!book.settings.fromStorage &&
			 !book.settings.contained) {
			book.preloadNextChapter();
		}

		book.currentChapter = chapter;
		book._rendering = false;
		book._displayQ.dequeue();
		if(book._displayQ.length() === 0) {
			book._gotoQ.dequeue();
		}

	}, function(error) {
		// handle errors in either of the two requests
		console.error("Could not load Chapter: "+ chapter.absolute);
		book.trigger("book:chapterLoadFailed", chapter.absolute);
		book._rendering = false;
		defer.reject(error);
	});

	return defer.promise;
};

EPUBJS.Book.prototype.nextPage = function(){
	var next;

	if(!this.isRendered) return this._q.enqueue("nextPage", arguments);

	next = this.renderer.nextPage();

	if(!next){
		return this.nextChapter();
	}
};

EPUBJS.Book.prototype.prevPage = function() {
	var prev;

	if(!this.isRendered) return this._q.enqueue("prevPage", arguments);

	prev = this.renderer.prevPage();

	if(!prev){
		return this.prevChapter();
	}
};

EPUBJS.Book.prototype.nextChapter = function() {
	var next;
	if (this.spinePos < this.spine.length - 1) {
		next = this.spinePos + 1;
		// Skip non linear chapters
		while (this.spine[next] && this.spine[next].linear && this.spine[next].linear == 'no') {
			next++;
		}
		if (next < this.spine.length) {
			return this.displayChapter(next);
		} else {
			this.trigger("book:atEnd");
		}

	} else {
		this.trigger("book:atEnd");
	}
};

EPUBJS.Book.prototype.prevChapter = function() {
	var prev;
	if (this.spinePos > 0) {
		prev = this.spinePos - 1;
		while (this.spine[prev] && this.spine[prev].linear && this.spine[prev].linear == 'no') {
			prev--;
		}
		if (prev >= 0) {
			return this.displayChapter(prev, true);
		} else {
			this.trigger("book:atStart");
		}

	} else {
		this.trigger("book:atStart");
	}
};

EPUBJS.Book.prototype.getCurrentLocationCfi = function() {
	if(!this.isRendered) return false;
	return this.renderer.currentLocationCfi;
};

EPUBJS.Book.prototype.goto = function(target){

	if(target.indexOf("epubcfi(") === 0) {
		return this.gotoCfi(target);
	} else if(target.indexOf("%") === target.length-1) {
		return this.gotoPercentage(parseInt(target.substring(0, target.length-1))/100);
	} else if(typeof target === "number" || isNaN(target) === false){
		return this.gotoPage(target);
	} else {
		return this.gotoHref(target);
	}

};

EPUBJS.Book.prototype.gotoCfi = function(cfiString, defer){
	var cfi,
			spinePos,
			spineItem,
			rendered,
			deferred = defer || new RSVP.defer();

	if(!this.isRendered) {
		console.warn("Not yet Rendered");
		this.settings.previousLocationCfi = cfiString;
		return false;
	}

	// Currently going to a chapter
	if(this._moving || this._rendering) {
		console.warn("Renderer is moving");
		this._gotoQ.enqueue("gotoCfi", [cfiString, deferred]);
		return false;
	}

	cfi = new EPUBJS.EpubCFI(cfiString);
	spinePos = cfi.spinePos;

	if(spinePos == -1) {
		return false;
	}

	spineItem = this.spine[spinePos];
	promise = deferred.promise;
	this._moving = true;
	//-- If same chapter only stay on current chapter
	if(this.currentChapter && this.spinePos === spinePos){
		this.renderer.gotoCfi(cfi);
		this._moving = false;
		deferred.resolve(this.renderer.currentLocationCfi);
	} else {

		if(!spineItem || spinePos == -1) {
			spinePos = 0;
			spineItem = this.spine[spinePos];
		}

		this.currentChapter = new EPUBJS.Chapter(spineItem, this.store);

		if(this.currentChapter) {
			this.spinePos = spinePos;
			render = this.renderer.displayChapter(this.currentChapter, this.globalLayoutProperties);

			this.renderer.gotoCfi(cfi);
			render.then(function(rendered){
					this._moving = false;
					deferred.resolve(rendered.currentLocationCfi);
			}.bind(this));
		}
	}

	promise.then(function(){
		this._gotoQ.dequeue();
	}.bind(this));

	return promise;
};

EPUBJS.Book.prototype.gotoHref = function(url, defer){
	var split, chapter, section, relativeURL, spinePos;
	var deferred = defer || new RSVP.defer();

	if(!this.isRendered) {
		this.settings.goto = url;
		return false;
	}

	// Currently going to a chapter
	if(this._moving || this._rendering) {
		this._gotoQ.enqueue("gotoHref", [url, deferred]);
		return false;
	}

	split = url.split("#");
	chapter = split[0];
	section = split[1] || false;
	// absoluteURL = (chapter.search("://") === -1) ? (this.settings.contentsPath + chapter) : chapter;
	relativeURL = chapter.replace(this.settings.contentsPath, '');
	spinePos = this.spineIndexByURL[relativeURL];

	//-- If link fragment only stay on current chapter
	if(!chapter){
		spinePos = this.currentChapter ? this.currentChapter.spinePos : 0;
	}

	//-- Check that URL is present in the index, or stop
	if(typeof(spinePos) != "number") return false;

	if(!this.currentChapter || spinePos != this.currentChapter.spinePos){
		//-- Load new chapter if different than current
		return this.displayChapter(spinePos).then(function(){
				if(section){
					this.renderer.section(section);
				}
				deferred.resolve(this.renderer.currentLocationCfi);
			}.bind(this));
	}else{
		//--  Goto section
		if(section) {
			this.renderer.section(section);
		} else {
			// Or jump to the start
			this.renderer.firstPage();
		}
		deferred.resolve(this.renderer.currentLocationCfi);
	}

	deferred.promise.then(function(){
		this._gotoQ.dequeue();
	}.bind(this));

	return deferred.promise;
};

EPUBJS.Book.prototype.gotoPage = function(pg){
	var cfi = this.pagination.cfiFromPage(pg);
	return this.gotoCfi(cfi);
};

EPUBJS.Book.prototype.gotoPercentage = function(percent){
	var pg = this.pagination.pageFromPercentage(percent);
	return this.gotoPage(pg);
};

EPUBJS.Book.prototype.preloadNextChapter = function() {
	var next;
	var chap = this.spinePos + 1;

	if(chap >= this.spine.length){
		return false;
	}

	next = new EPUBJS.Chapter(this.spine[chap]);
	if(next) {
		EPUBJS.core.request(next.absolute);
	}
};


EPUBJS.Book.prototype.storeOffline = function() {
	var book = this,
		assets = _.values(this.manifest);

	//-- Creates a queue of all items to load
	return EPUBJS.storage.batch(assets).
			then(function(){
				book.settings.stored = true;
				book.trigger("book:stored");
			});
};

EPUBJS.Book.prototype.availableOffline = function() {
	return this.settings.stored > 0 ? true : false;
};

/*
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
*/

EPUBJS.Book.prototype.setStyle = function(style, val, prefixed) {
	var noreflow = ["color", "background", "background-color"];
	
	if(!this.isRendered) return this._q.enqueue("setStyle", arguments);

	this.settings.styles[style] = val;

	this.renderer.setStyle(style, val, prefixed);
	
	if(noreflow.indexOf(style) === -1) {
		// clearTimeout(this.reformatTimeout);
		// this.reformatTimeout = setTimeout(function(){
		this.renderer.reformat();
		// }.bind(this), 10);
	}
};

EPUBJS.Book.prototype.removeStyle = function(style) {
	if(!this.isRendered) return this._q.enqueue("removeStyle", arguments);
	this.renderer.removeStyle(style);
	this.renderer.reformat();
	delete this.settings.styles[style];
};

EPUBJS.Book.prototype.addHeadTag = function(tag, attrs) {
	if(!this.isRendered) return this._q.enqueue("addHeadTag", arguments);
    this.settings.headTags[tag] = attrs;
};

EPUBJS.Book.prototype.useSpreads = function(use) {
	console.warn("useSpreads is deprecated, use forceSingle or set a layoutOveride instead");
	if(use === false) {
		this.forceSingle(true);
	} else {
		this.forceSingle(false);
	}
};

EPUBJS.Book.prototype.forceSingle = function(_use) {
	var force = typeof _use === "undefined" ? true : _use;
	
	this.renderer.forceSingle(force);
	this.settings.forceSingle = force;
	if(this.isRendered) {
		this.renderer.reformat();
	}
};

EPUBJS.Book.prototype.setMinSpreadWidth = function(width) {
	this.settings.minSpreadWidth = width;
	if(this.isRendered) {
		this.renderer.setMinSpreadWidth(this.settings.minSpreadWidth);
		this.renderer.reformat();
	}
};

EPUBJS.Book.prototype.setGap = function(gap) {
	this.settings.gap = gap;
	if(this.isRendered) {
		this.renderer.setGap(this.settings.gap);
		this.renderer.reformat();
	}
};

EPUBJS.Book.prototype.chapter = function(path) {
	var spinePos = this.spineIndexByURL[path];
	var spineItem;
	var chapter;

	if(spinePos){
		spineItem = this.spine[spinePos];
		chapter = new EPUBJS.Chapter(spineItem, this.store);
		chapter.load();
	}
	return chapter;
};

EPUBJS.Book.prototype.unload = function(){

	if(this.settings.restore && localStorage) {
		this.saveContents();
	}

	this.unlistenToRenderer(this.renderer);

	this.trigger("book:unload");
};

EPUBJS.Book.prototype.destroy = function() {

	window.removeEventListener("beforeunload", this.unload);

	if(this.currentChapter) this.currentChapter.unload();

	this.unload();

	if(this.render) this.render.remove();

};

EPUBJS.Book.prototype._ready = function() {

	this.trigger("book:ready");

};

EPUBJS.Book.prototype._rendered = function(err) {
	var book = this;

	this.isRendered = true;
	this.trigger("book:rendered");

	this._q.flush();
};


EPUBJS.Book.prototype.applyStyles = function(renderer, callback){
	// if(!this.isRendered) return this._q.enqueue("applyStyles", arguments);
	renderer.applyStyles(this.settings.styles);
	callback();
};

EPUBJS.Book.prototype.applyHeadTags = function(renderer, callback){
	// if(!this.isRendered) return this._q.enqueue("applyHeadTags", arguments);
	renderer.applyHeadTags(this.settings.headTags);
	callback();
};

EPUBJS.Book.prototype._registerReplacements = function(renderer){
	renderer.registerHook("beforeChapterDisplay", this.applyStyles.bind(this, renderer), true);
	renderer.registerHook("beforeChapterDisplay", this.applyHeadTags.bind(this, renderer), true);
	renderer.registerHook("beforeChapterDisplay", EPUBJS.replace.hrefs.bind(this), true);

	if(this._needsAssetReplacement()) {

		renderer.registerHook("beforeChapterDisplay", [
			EPUBJS.replace.head,
			EPUBJS.replace.resources,
			EPUBJS.replace.svg
		], true);

	}

};

EPUBJS.Book.prototype._needsAssetReplacement = function(){
	if(this.settings.fromStorage) {

		//-- Filesystem api links are relative, so no need to replace them
		if(this.storage.getStorageType() == "filesystem") {
			return false;
		}

		return true;

	} else if(this.settings.contained) {

		return true;

	} else {

		return false;

	}
};


//-- http://www.idpf.org/epub/fxl/
EPUBJS.Book.prototype.parseLayoutProperties = function(metadata){
	var layout = (this.layoutOveride && this.layoutOveride.layout) || metadata.layout || "reflowable";
	var spread = (this.layoutOveride && this.layoutOveride.spread) || metadata.spread || "auto";
	var orientation = (this.layoutOveride && this.layoutOveride.orientation) || metadata.orientation || "auto";
	return {
		layout : layout,
		spread : spread,
		orientation : orientation
	};
};

//-- Enable binding events to book
RSVP.EventTarget.mixin(EPUBJS.Book.prototype);

//-- Handle RSVP Errors
RSVP.on('error', function(event) {
	//console.error(event, event.detail);
});

RSVP.configure('instrument', true); //-- true | will logging out all RSVP rejections
// RSVP.on('created', listener);
// RSVP.on('chained', listener);
// RSVP.on('fulfilled', listener);
RSVP.on('rejected', function(event){
	console.error(event.detail.message, event.detail.stack);
});
