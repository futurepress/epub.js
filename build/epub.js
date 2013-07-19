(function(e){"use strict";function v(e,n){t.async(function(){e.trigger("promise:resolved",{detail:n}),e.isResolved=!0,e.resolvedValue=n})}function m(e,n){t.async(function(){e.trigger("promise:failed",{detail:n}),e.isRejected=!0,e.rejectedValue=n})}function g(e){var t,n=[],r=new h,i=e.length;i===0&&r.resolve([]);var s=function(e){return function(t){o(e,t)}},o=function(e,t){n[e]=t,--i===0&&r.resolve(n)},u=function(e){r.reject(e)};for(t=0;t<i;t++)e[t].then(s(t),u);return r}function y(e,n){t[e]=n}var t={},n=typeof window!="undefined"?window:{},r=n.MutationObserver||n.WebKitMutationObserver,i;if(typeof process!="undefined"&&{}.toString.call(process)==="[object process]")t.async=function(e,t){process.nextTick(function(){e.call(t)})};else if(r){var s=[],o=new r(function(){var e=s.slice();s=[],e.forEach(function(e){var t=e[0],n=e[1];t.call(n)})}),u=document.createElement("div");o.observe(u,{attributes:!0}),window.addEventListener("unload",function(){o.disconnect(),o=null}),t.async=function(e,t){s.push([e,t]),u.setAttribute("drainQueue","drainQueue")}}else t.async=function(e,t){setTimeout(function(){e.call(t)},1)};var a=function(e,t){this.type=e;for(var n in t){if(!t.hasOwnProperty(n))continue;this[n]=t[n]}},f=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n][0]===t)return n;return-1},l=function(e){var t=e._promiseCallbacks;return t||(t=e._promiseCallbacks={}),t},c={mixin:function(e){return e.on=this.on,e.off=this.off,e.trigger=this.trigger,e},on:function(e,t,n){var r=l(this),i,s;e=e.split(/\s+/),n=n||this;while(s=e.shift())i=r[s],i||(i=r[s]=[]),f(i,t)===-1&&i.push([t,n])},off:function(e,t){var n=l(this),r,i,s;e=e.split(/\s+/);while(i=e.shift()){if(!t){n[i]=[];continue}r=n[i],s=f(r,t),s!==-1&&r.splice(s,1)}},trigger:function(e,t){var n=l(this),r,i,s,o,u;if(r=n[e])for(var f=0,c=r.length;f<c;f++)i=r[f],s=i[0],o=i[1],typeof t!="object"&&(t={detail:t}),u=new a(e,t),s.call(o,u)}},h=function(){this.on("promise:resolved",function(e){this.trigger("success",{detail:e.detail})},this),this.on("promise:failed",function(e){this.trigger("error",{detail:e.detail})},this)},p=function(){},d=function(e,t,n,r){var i=typeof n=="function",s,o,u,a;if(i)try{s=n(r.detail),u=!0}catch(f){a=!0,o=f}else s=r.detail,u=!0;s&&typeof s.then=="function"?s.then(function(e){t.resolve(e)},function(e){t.reject(e)}):i&&u?t.resolve(s):a?t.reject(o):t[e](s)};h.prototype={then:function(e,n){var r=new h;return this.isResolved&&t.async(function(){d("resolve",r,e,{detail:this.resolvedValue})},this),this.isRejected&&t.async(function(){d("reject",r,n,{detail:this.rejectedValue})},this),this.on("promise:resolved",function(t){d("resolve",r,e,t)}),this.on("promise:failed",function(e){d("reject",r,n,e)}),r},resolve:function(e){v(this,e),this.resolve=p,this.reject=p},reject:function(e){m(this,e),this.resolve=p,this.reject=p}},c.mixin(h.prototype),e.Promise=h,e.Event=a,e.EventTarget=c,e.all=g,e.configure=y})(window.RSVP={});

var EPUBJS = EPUBJS || {}; 
EPUBJS.VERSION = "0.1.5";

EPUBJS.plugins = EPUBJS.plugins || {};

EPUBJS.filePath = EPUBJS.filePath || "/epubjs/";
EPUBJS.Book = function(bookPath, options){
	
	var book = this;
	
	this.settings = _.defaults(options || {}, {
	  storage: false, //-- true (auto) or false (none) | override: 'ram', 'websqldatabase', 'indexeddb', 'filesystem'
	  fromStorage : false,
	  saved : false,
	  online : true,
	  contained : false,
	  width : false,
	  height: false,
	  spreads: true,
	  fixedLayout : false,
	  responsive: true,
	  version: 1,
	  restore: false,
	  reload : false,
	  styles : {}
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
	*/
	
	//-- All hooks to add functions (with a callback) to 
	this.hooks = {
		"beforeChapterDisplay" : []
	};
	
	//-- Get pre-registered hooks
	this.getHooks();
			
	this.online = this.settings.online || navigator.onLine;
	this.networkListeners();
		
	//-- Determine storage method
	//-- Override options: none | ram | websqldatabase | indexeddb | filesystem
	
	if(this.settings.storage != false ){
		this.storage = new fileStorage.storage(this.settings.storage);
	}
	
	this.ready = {
		manifest: new RSVP.Promise(),
		spine: new RSVP.Promise(),
		metadata: new RSVP.Promise(),
		cover: new RSVP.Promise(),
		toc: new RSVP.Promise()
	};
	
	this.ready.all = RSVP.all(_.values(this.ready));

	this.ready.all.then(function(){
		this.trigger("book:ready");
	}.bind(this));
	
	// BookUrl is optional, but if present start loading process
	if(bookPath) {
		this.opened = this.open(bookPath);
	}
	
	// Likewise if an element is present start rendering process
	// if(bookPath && this.settings.element) {
	// 	this.opened.then(function(){
	// 		this.rendered = this.renderTo(el);
	// 	});
	// }
	
	window.addEventListener("beforeunload", function(e) {
	  
	  if(book.settings.restore) {
	  	  book.saveSettings();
		  book.saveContents();
	  }
	  
	  book.trigger("book:unload");
	}, false);

	//-- Listen for these promises:
	//-- book.opened.then()
	//-- book.rendered.then()

}


//-- Check bookUrl and start parsing book Assets or load them from storage 
EPUBJS.Book.prototype.open = function(bookPath, forceReload){
	var book = this,
		saved = this.isSaved(bookPath),
		opened;
	
	this.settings.bookPath = bookPath;
	
	//-- Get a absolute URL from the book path
	this.bookUrl = this.urlFrom(bookPath);

	// console.log("saved", saved, !forceReload)
	//-- Remove the previous settings and reload
	if(saved && !forceReload){
		//-- Apply settings, keeping newer ones
		this.applySavedSettings();
	}

	if(this.settings.contained || this.isContained(bookPath)){
		
		
		this.settings.contained = this.contained = true;
		
		this.bookUrl = '';
		
		// return; //-- TODO: this need to be fixed and tested before enabling
		opened = this.unarchive(bookPath).then(function(){
			
			if(saved && book.settings.restore && !forceReload){
				return book.restore();
			}else{
				return book.unpack();
			}
			
		});
		
	}  else {
		
		if(saved && this.settings.restore && !forceReload){
			//-- Will load previous package json, or re-unpack if error
			opened = this.restore();
		
		}else{
			
			//-- Get package information from epub opf
			opened = this.unpack();
			
		}
		
	}

	//-- If there is network connection, store the books contents
	if(this.online && this.settings.storage && !this.settings.contained){
		if(!this.settings.stored) opened.then(book.storeOffline());
	}
	
	return opened;

}

EPUBJS.Book.prototype.unpack = function(containerPath){
	var book = this,
		parse = new EPUBJS.Parser(),
		containerPath = containerPath || "META-INF/container.xml";

	//-- Return chain of promises
	return book.loadXml(book.bookUrl + containerPath).
		   then(function(containerXml){
			  return parse.container(containerXml); // Container has path to content
		   }).
		   then(function(paths){
			  book.settings.contentsPath = book.bookUrl + paths.basePath;
			  book.settings.packageUrl = book.bookUrl + paths.packagePath;
			  return book.loadXml(book.settings.packageUrl); // Containes manifest, spine and metadata 
		   }).
		   then(function(packageXml){
			   return parse.package(packageXml, book.settings.contentsPath); // Extract info from contents
		   }).
		   then(function(contents){

			   book.contents = contents;
			   book.manifest = book.contents.manifest;
			   book.spine = book.contents.spine;
			   book.spineIndexByURL = book.contents.spineIndexByURL;
			   book.metadata = book.contents.metadata;

			   book.cover = book.contents.cover = book.settings.contentsPath + contents.coverPath;

			   book.spineNodeIndex = book.contents.spineNodeIndex = contents.spineNodeIndex;
				
			   book.ready.manifest.resolve(book.contents.manifest);
			   book.ready.spine.resolve(book.contents.spine);
			   book.ready.metadata.resolve(book.contents.metadata);
			   book.ready.cover.resolve(book.contents.cover);

			   //-- Adjust setting based on metadata			   

			   //-- Load the TOC
			   book.settings.tocUrl = book.settings.contentsPath + contents.tocPath;
			   return book.loadXml(book.settings.tocUrl);
		   }).
		   then(function(tocXml){
			   return parse.toc(tocXml); // Grab Table of Contents
		   }).then(function(toc){
			   book.toc = book.contents.toc = toc;
			   book.ready.toc.resolve(book.contents.toc);
			   // book.saveSettings();
		   }).then(null, function(error) {
				console.error(error);
		   });


}

EPUBJS.Book.prototype.getMetadata = function() {
	return this.ready.metadata;
}

EPUBJS.Book.prototype.getToc = function() {
	return this.ready.toc;
}

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
	
}

//-- Choose between a request from store or a request from network
EPUBJS.Book.prototype.loadXml = function(url){
	if(this.settings.fromStorage) {
		return this.storage.getXml(url);
	} else if(this.settings.contained) {
		return this.zip.getXml(url);
	}else{
		return EPUBJS.core.request(url, 'xml');
	} 
}

//-- Turns a url into a absolute url
EPUBJS.Book.prototype.urlFrom = function(bookPath){
	var absolute = bookPath.search("://") != -1,
		fromRoot = bookPath[0] == "/",
		location = window.location,
		//-- Get URL orgin, try for native or combine 
		origin = location.origin || location.protocol + "//" + location.host; 

	// if(bookPath[bookPath.length - 1] != "/") bookPath += "/";

	//-- 1. Check if url is absolute
	if(absolute){
		return bookPath;
	}

	//-- 2. Check if url starts with /, add base url
	if(!absolute && fromRoot){
		return origin + bookPath; 
	}

	//-- 3. Or find full path to url and add that
	if(!absolute && !fromRoot){
		
		//-- go back
		if(bookPath.slice(0, 3) == "../"){
			return EPUBJS.core.resolveUrl(location.href, bookPath);
		}

		return origin + EPUBJS.core.folder(location.pathname) + bookPath;
	}

}


EPUBJS.Book.prototype.unarchive = function(bookPath){	
	var book = this,
		unarchived;
		
	//-- Must use storage
	// if(this.settings.storage == false ){
		// this.settings.storage = true;
		// this.storage = new fileStorage.storage();
	// }
			
	this.zip = new EPUBJS.Unarchiver();
		
	return this.zip.openZip(bookPath);
}

//-- Checks if url has a .epub or .zip extension
EPUBJS.Book.prototype.isContained = function(bookUrl){
	var dot = bookUrl.lastIndexOf('.'),
		ext = bookUrl.slice(dot+1);

	if(ext && (ext == "epub" || ext == "zip")){
		return true;
	}

	return false;
}

//-- Checks if the book setting can be retrieved from localStorage
EPUBJS.Book.prototype.isSaved = function(bookPath) {
	var bookKey = bookPath + ":" + this.settings.version,
		storedSettings = localStorage.getItem(bookKey);

	if( !localStorage ||
		storedSettings === null) {
		return false;
	} else {
		return true;
	} 
}

//-- Remove save book settings
EPUBJS.Book.prototype.removeSavedSettings = function() {
	var bookKey = this.settings.bookPath + ":" + this.settings.version;
	
		localStorage.removeItem(bookKey);
		
		this.settings.stored = false; //TODO: is this needed?
}
		
EPUBJS.Book.prototype.applySavedSettings = function() {
		var bookKey = this.settings.bookPath + ":" + this.settings.version;
			stored = JSON.parse(localStorage.getItem(bookKey));

		if(EPUBJS.VERSION != stored.EPUBJSVERSION) return false;
		this.settings = _.defaults(this.settings, stored); 
}

EPUBJS.Book.prototype.saveSettings = function(){
	var bookKey = this.settings.bookPath + ":" + this.settings.version;
	
	if(this.render) {
		this.settings.previousLocationCfi = this.render.currentLocationCfi;
	}
		
	localStorage.setItem(bookKey, JSON.stringify(this.settings));

}

EPUBJS.Book.prototype.saveContents = function(){
	var contentsKey = this.settings.bookPath + ":contents:" + this.settings.version;

	localStorage.setItem(contentsKey, JSON.stringify(this.contents));

}

EPUBJS.Book.prototype.removeSavedContents = function() {
	var bookKey = this.settings.bookPath + ":contents:" + this.settings.version;
	
	localStorage.removeItem(bookKey);
}


// EPUBJS.Book.prototype.chapterTitle = function(){
// 	return this.spine[this.spinePos].id; //-- TODO: clarify that this is returning title
// }

//-- Takes a string or a element
EPUBJS.Book.prototype.renderTo = function(elem){
	var book = this;
	
	if(_.isElement(elem)) {
		this.element = elem;
	} else if (typeof elem == "string") { 
		this.element = EPUBJS.core.getEl(elem);
	} else {
		console.error("Not an Element");
		return;
	}
	
	return this.opened.
			then(function(){
				book.render = new EPUBJS.Renderer(book);
									
				return book.startDisplay();
			})
}

EPUBJS.Book.prototype.startDisplay = function(){
	var display;
	if( this.settings.restore && this.settings.previousLocationCfi) {

		display = this.displayChapter(this.settings.previousLocationCfi);
		
	}else{
		display = this.displayChapter(this.spinePos);
	}
	
	return display;
}

EPUBJS.Book.prototype.restore = function(reject){
	
	var book = this,
		contentsKey = this.settings.bookPath + ":contents:" + this.settings.version,
		promise = new RSVP.Promise(),
		fetch = ['manifest', 'spine', 'metadata', 'cover', 'toc', 'spineNodeIndex', 'spineIndexByURL'],
		reject = reject || false,
		fromStore = localStorage.getItem(contentsKey);
	
	if(this.settings.clearSaved) reject = true;

	if(!reject && fromStore != 'undefined' && fromStore != 'null'){
		this.contents = JSON.parse(fromStore);
		fetch.forEach(function(item){
			book[item] = book.contents[item];
			if(!book[item]) {
				reject = true;
			}
		});
	}
	
	if(reject || !fromStore || !this.contents || !this.settings.contentsPath){
		// this.removeSavedSettings();
		return this.open(this.settings.bookPath, true);
		
	}else{
		this.ready.manifest.resolve(this.manifest);
		this.ready.spine.resolve(this.spine);
		this.ready.metadata.resolve(this.metadata);
		this.ready.cover.resolve(this.cover);
		this.ready.toc.resolve(this.toc);
		promise.resolve();
		return promise;
	}
	

}



EPUBJS.Book.prototype.displayChapter = function(chap, end){
	var book = this,
		render,
		cfi,
		pos;

	if(_.isNumber(chap)){
		pos = chap;
	}else{
		cfi = new EPUBJS.EpubCFI(chap);
		pos = cfi.spinePos;
	}
	
	
	if(pos >= this.spine.length){
		// console.log("Reached End of Book");
		return false;
	}

	if(pos < 0){
		// console.log("Reached Start of Book");
		return false;
	}
	
	//-- Set the book's spine position
	this.spinePos = pos;


	
	//-- Create a new chapter	
	this.chapter = new EPUBJS.Chapter(this.spine[pos]);
	
	render = book.render.chapter(this.chapter);
	
	if(cfi) {
		render.then(function(chapter){
			chapter.currentLocationCfi = chap;
			chapter.gotoCfiFragment(cfi);
		});
	} else if(end) {
		render.then(function(chapter){
			chapter.gotoChapterEnd();
		})
	}

	
	if(!this.settings.fromStorage && 
	   !this.settings.contained) {
		render.then(function(){
			book.preloadNextChapter();
		});
	}

	return render;
}

EPUBJS.Book.prototype.nextPage = function(){
	var next = this.render.nextPage();

	if(!next){
		return this.nextChapter();
	}
}

EPUBJS.Book.prototype.prevPage = function() {
	var prev = this.render.prevPage();
	
	if(!prev){
		return this.prevChapter();
	}
}

EPUBJS.Book.prototype.nextChapter = function() {
	this.spinePos++;

	return this.displayChapter(this.spinePos);
}

EPUBJS.Book.prototype.prevChapter = function() {
	this.spinePos--;

	return this.displayChapter(this.spinePos, true);
}

EPUBJS.Book.prototype.goto = function(url){
	var split = url.split("#"),
		chapter = split[0],
		section = split[1] || false,
		absoluteURL = (chapter.search("://") == -1) ? this.settings.contentsPath + chapter : chapter,
		spinePos = this.spineIndexByURL[absoluteURL],
		book;

	//-- If link fragment only stay on current chapter
	if(!chapter){
		spinePos = this.chapter.spinePos;
	}

	//-- Check that URL is present in the index, or stop
	if(typeof(spinePos) != "number") return false;

	if(spinePos != this.chapter.spinePos || !this.chapter){
		//-- Load new chapter if different than current
		return this.displayChapter(spinePos).then(function(){
			if(section) book.render.section(section);
		});
	}else{
		//-- Only goto section
		if(section) this.render.section(section);
		return new RSVP.Promise().resolve(this.currentChapter);
	}
}



EPUBJS.Book.prototype.preloadNextChapter = function() {
	var temp = document.createElement('iframe');
		next; 
	
		if(this.spinePos >= this.spine.length){
			return false;
		}
		
	next = new EPUBJS.Chapter(this.spine[this.spinePos + 1]);
	
	EPUBJS.core.request(next.href);
}


EPUBJS.Book.prototype.storeOffline = function() {
	var book = this,
		assets = _.values(this.manifest);
	
	//-- Creates a queue of all items to load
	return EPUBJS.storage.batch(assets).
			then(function(){
				book.settings.stored = true;
				book.trigger("book:stored");
			});
}

EPUBJS.Book.prototype.availableOffline = function() {
	return this.settings.stored > 0 ? true : false;
}

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
	this.settings.styles[style] = val;

	if(this.render) this.render.setStyle(style, val, prefixed);
}

EPUBJS.Book.prototype.removeStyle = function(style, val, prefixed) {
	if(this.render) this.render.removeStyle(style);

	delete this.settings.styles[style];
}


//-- Get pre-registered hooks
EPUBJS.Book.prototype.getHooks = function(){
	var book = this,
		plugs;
	
	plugTypes = _.values(this.hooks);

	for (plugType in this.hooks) {
		plugs = _.values(EPUBJS.Hooks[plugType]);

		plugs.forEach(function(hook){
			book.registerHook(plugType, hook);
		});
	}
}

//-- Hooks allow for injecting async functions that must all complete before continuing 
//   Functions must have a callback as their first argument.
EPUBJS.Book.prototype.registerHook = function(type, toAdd, toFront){
	var book = this;
	
	if(typeof(this.hooks[type]) != "undefined"){
		
		if(typeof(toAdd) === "function"){
			if(toFront) {
				this.hooks[type].unshift(toAdd);
			}else{
				this.hooks[type].push(toAdd);
			}
		}else if(Array.isArray(toAdd)){
			toAdd.forEach(function(hook){
				if(toFront) {
					book.hooks[type].unshift(hook);
				}else{
					book.hooks[type].push(hook);
				}
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

//-- Enable binding events to book
RSVP.EventTarget.mixin(EPUBJS.Book.prototype);

EPUBJS.Chapter = function(spineObject){
	this.href = spineObject.href;
	this.id = spineObject.id;
	this.spinePos = spineObject.index;
	this.properties = spineObject.properties;
	this.linear = spineObject.linear;
	this.pages = 1;
}


EPUBJS.Chapter.prototype.contents = function(store){	
	// if(this.store && (!this.book.online || this.book.contained))
	if(store){
		return store.get(href);
	}else{
		return EPUBJS.core.request(href, 'xml');
	}

}

EPUBJS.Chapter.prototype.url = function(store){
	var promise = new RSVP.Promise();

	if(store){
		if(!this.tempUrl) {
			this.tempUrl = store.getUrl(this.href);
		}
		return this.tempUrl;
	}else{
		promise.resolve(this.href); //-- this is less than ideal but keeps it a promise
		return promise;
	}

}

EPUBJS.Chapter.prototype.setPages = function(num){
	this.pages = num;
}

EPUBJS.Chapter.prototype.getPages = function(num){
	return this.pages;
}

EPUBJS.Chapter.prototype.getID = function(){
	return this.ID;
}

EPUBJS.Chapter.prototype.unload = function(store){
	
	if(this.tempUrl && store) {
		store.revokeUrl(this.tempUrl);
		this.tempUrl = false;
	}
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


EPUBJS.core.request = function(url, type) {
	var promise = new RSVP.Promise();
	
	var xhr = new XMLHttpRequest();
	
	xhr.open("GET", url);
	xhr.onreadystatechange = handler;
	
	if(type == 'blob'){
		xhr.responseType = type;
	}
	
	if(type == "json") {
		xhr.setRequestHeader("Accept", "application/json");
	}
	
	if(type == 'xml') {
		xhr.overrideMimeType('text/xml');
	}
	
	xhr.send();
	
	function handler() {
	  if (this.readyState === this.DONE) {
		if (this.status === 200 || this.responseXML ) { //-- Firefox is reporting 0 for blob urls
			var r;
			
			if(type == 'xml'){
				r = this.responseXML;
			}else 
			if(type == 'json'){
				r = JSON.parse(this.response);
			}else{
				r = this.response;
			}
			
			promise.resolve(r);			
		}
		else { promise.reject(this); }
	  }
	};
  

  return promise;
};

// EPUBJS.core.loadXML = function(url, callback){
// 	var xhr = new XMLHttpRequest();
// 	xhr.open('GET', url, true);
// 	xhr.overrideMimeType('text/xml');
// 
// 	xhr.onload = function(e) {
// 		if (this.status == 200) {
// 			callback(this.responseXML);
// 		}
// 	};
// 
// 	xhr.send();
// }

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
// 
// EPUBJS.core.loadFile = function(url, callback){
// 	var xhr = new XMLHttpRequest();
// 	
// 	this.succeeded = function(response){
// 		if(callback){
// 			callback(response);
// 		}
// 	}
// 
// 	this.failed = function(err){
// 		console.log("Error:", err);
// 	}
// 
// 	this.start = function(){
// 		var that = this;
// 		
// 		xhr.open('GET', url, true);
// 		xhr.responseType = 'blob';
// 
// 		xhr.onload = function(e) {
// 			if (this.status == 200) {
// 				that.succeeded(this.response);
// 			}
// 		};
// 
// 		xhr.onerror = function(e) {
// 			that.failed(this.status); //-- TODO: better error message
// 		};
// 
// 		xhr.send();
// 	}
// 
// 	return {
// 		"start": this.start,
// 		"succeeded" : this.succeeded,
// 		"failed" : this.failed
// 	}
// }



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

//-- Parse out the folder
EPUBJS.core.folder = function(url){
	
	var slash = url.lastIndexOf('/'),
		folder = url.slice(0, slash + 1);

	if(slash == -1) folder = '';

	return folder;

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
  
 EPUBJS.core.prefixed = function(unprefixed) {
 	var vendors = ["Webkit", "Moz", "O", "ms" ],
 		prefixes = ['-Webkit-', '-moz-', '-o-', '-ms-'],
 		upper = unprefixed[0].toUpperCase() + unprefixed.slice(1),
 		length = vendors.length,
 		i = 0;

 	if (typeof(document.body.style[unprefixed]) != 'undefined') {
 		return unprefixed;
 	}
 
 	for ( ; i < length; i++ ) {
 		if (typeof(document.body.style[vendors[i] + upper]) != 'undefined') {
 			return vendors[i] + upper;
 		}		
 	}

 	return unprefixed;
 
 
 }
 
 EPUBJS.core.resolveUrl = function(base, path) {
	var url,
		segments = [],
	 	folders = base.split("/"),
	 	paths;
	 	
	 folders.pop();
	 
	 paths = path.split("/");
	 paths.forEach(function(p){
		if(p === ".."){
			folders.pop();
		}else{
			segments.push(p);
		}
	 });
	 
	 url = folders.concat(segments);
	 
	 return url.join("/");
 }

EPUBJS.EpubCFI = function(cfiStr){
	if(cfiStr) return this.parse(cfiStr);
}

EPUBJS.EpubCFI.prototype.generateChapter = function(spineNodeIndex, pos, id) {
	
	var pos = parseInt(pos),
		spineNodeIndex = spineNodeIndex + 1,	
		cfi = '/'+spineNodeIndex+'/';

	cfi += (pos + 1) * 2;

	if(id) cfi += "[" + id + "]";

	cfi += "!";


	return cfi;
}


EPUBJS.EpubCFI.prototype.generateFragment = function(element, chapter) {
	var path = this.pathTo(element),
		parts = [];

	if(chapter) parts.push(chapter);

	path.forEach(function(part){
		parts.push((part.index + 1) * 2);

		if(part.id && 
		   part.id.slice(0, 6) != "EPUBJS") { //-- ignore internal @EPUBJS ids

			parts.push("[" + part.id + "]"); 
		}

	});

	return parts.join('/');
}

EPUBJS.EpubCFI.prototype.pathTo = function(node) {
	var stack = [],
		children;

	while(node && node.parentNode !== null) {
		children = node.parentNode.children;

		stack.unshift({
			'id' : node.id,
			// 'classList' : node.classList,
			'tagName' : node.tagName,
			'index' : children ? Array.prototype.indexOf.call(children, node) : 0
		});


		node = node.parentNode;
	}

	return stack;
}

EPUBJS.EpubCFI.prototype.getChapter = function(cfiStr) {

	var splitStr = cfiStr.split("!");

	return splitStr[0];
}

EPUBJS.EpubCFI.prototype.getFragment = function(cfiStr) {

	var splitStr = cfiStr.split("!");

	return splitStr[1];
}

EPUBJS.EpubCFI.prototype.getOffset = function(cfiStr) {

	var splitStr = cfiStr.split(":");

	return [splitStr[0], splitStr[1]];
}


EPUBJS.EpubCFI.prototype.parse = function(cfiStr) {
	var cfi = {},
		chapId,
		path,
		end,
		text;

	cfi.chapter = this.getChapter(cfiStr);
	
	cfi.fragment = this.getFragment(cfiStr);

	cfi.spinePos = (parseInt(cfi.chapter.split("/")[2]) / 2 - 1 ) || 0;
	
	chapId = cfi.chapter.match(/\[(.*)\]/);
	
	cfi.spineId = chapId[1] || false;

	path = cfi.fragment.split('/');
	end = path[path.length-1];
	cfi.sections = [];
	
	//-- Check for Character Offset
	if(parseInt(end) % 2){
		text = this.getOffset();
		cfi.text = parseInt(text[0]);
		cfi.character = parseInt(text[1]);
		path.pop(); //-- remove from path to element
	}
	
	path.forEach(function(part){
		var index, has_id, id;
		
		if(!part) return;
		
		index = parseInt(part) / 2 - 1;
		has_id = part.match(/\[(.*)\]/);
			

		if(has_id && has_id[1]){
			id = has_id[1];
		}
		
		cfi.sections.push({
			'index' : index,
			'id' : id || false
		});
		
	});
	
	return cfi;
}


EPUBJS.EpubCFI.prototype.getElement = function(cfi, doc) {
	var	doc = doc || document,
		sections = cfi.sections,
		element = doc.getElementsByTagName('html')[0],
		children = Array.prototype.slice.call(element.children),
		num, index, part,
		has_id, id;
	
	sections.shift() //-- html
	
	while(sections.length > 0) {
	
	  part = sections.shift();

	  if(part.id){
		
		element = doc.querySelector("#" + part.id);

	  }else{
	
		element = children[part.index];
	
		if(!children) console.error("No Kids", element);
	
	  }
	
	
	  if(!element) console.error("No Element For", part);
	  children = Array.prototype.slice.call(element.children);
	}
	
	return element;
}


//-- Todo: function to remove IDs to sort

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
EPUBJS.Parser = function(baseUrl){
	this.baseUrl = baseUrl || '';
}

EPUBJS.Parser.prototype.container = function(containerXml){

		//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
		var rootfile = containerXml.querySelector("rootfile"),
			fullpath = rootfile.getAttribute('full-path'),
			folder = EPUBJS.core.folder(fullpath);

		//-- Now that we have the path we can parse the contents
		return {
			'packagePath' : fullpath,
			'basePath' : folder
		};
}

EPUBJS.Parser.prototype.package = function(packageXml, baseUrl){
	var parse = this;

	if(baseUrl) this.baseUrl = baseUrl;
	
	var metadataNode = packageXml.querySelector("metadata"),
		manifestNode = packageXml.querySelector("manifest"),
		spineNode = packageXml.querySelector("spine");

	var manifest = parse.manifest(manifestNode),
		tocPath = parse.findTocPath(manifestNode),
		coverPath = parse.findCoverPath(manifestNode);

	var spineNodeIndex = Array.prototype.indexOf.call(spineNode.parentNode.childNodes, spineNode);
	
	var spine = parse.spine(spineNode, manifest);
	
	var spineIndexByURL = {};
	spine.forEach(function(item){
		spineIndexByURL[item.href] = item.index;
	});

	return {
		'metadata' : parse.metadata(metadataNode),
		'spine'    : spine,
		'manifest' : manifest,
		'tocPath'  : tocPath,
		'coverPath': coverPath,
		'spineNodeIndex' : spineNodeIndex,
		'spineIndexByURL' : spineIndexByURL
	};
}

//-- Find TOC NCX: media-type="application/x-dtbncx+xml" href="toc.ncx"
EPUBJS.Parser.prototype.findTocPath = function(manifestNode){
	var node = manifestNode.querySelector("item[media-type='application/x-dtbncx+xml']");
	return node ? node.getAttribute('href') : false;
}

//-- Find Cover: <item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />
EPUBJS.Parser.prototype.findCoverPath = function(manifestNode){
	var node = manifestNode.querySelector("item[properties='cover-image']");
	return node ? node.getAttribute('href') : false;
}


//-- Expanded to match Readium web components
EPUBJS.Parser.prototype.metadata = function(xml){
	var metadata = {},
		p = this;
	
	
	metadata.bookTitle = p.getElementText(xml, 'title');
	metadata.creator = p.getElementText(xml, 'creator'); 
	metadata.description = p.getElementText(xml, 'description');
	
	metadata.pubdate = p.getElementText(xml, 'date');
	
	metadata.publisher = p.getElementText(xml, 'publisher');
	
	metadata.identifier = p.getElementText(xml, "identifier");
	metadata.language = p.getElementText(xml, "language"); 
	metadata.rights = p.getElementText(xml, "rights"); 
	
	
	metadata.modified_date = p.querySelectorText(xml, "meta[property='dcterms:modified']");
	metadata.layout = p.querySelectorText(xml, "meta[property='rendition:orientation']");
	metadata.orientation = p.querySelectorText(xml, "meta[property='rendition:orientation']");
	metadata.spread = p.querySelectorText(xml, "meta[property='rendition:spread']");
	// metadata.page_prog_dir = packageXml.querySelector("spine").getAttribute("page-progression-direction");
	
	return metadata;
}

EPUBJS.Parser.prototype.getElementText = function(xml, tag){
	var found = xml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", tag),
		el;

	if(!found || found.length == 0) return '';
	
	el = found[0]; 

	if(el.childNodes.length){
		return el.childNodes[0].nodeValue;
	}

	return '';
	
}

EPUBJS.Parser.prototype.querySelectorText = function(xml, q){
	var el = xml.querySelector(q);

	if(el && el.childNodes.length){
		return el.childNodes[0].nodeValue;
	}

	return '';
}


EPUBJS.Parser.prototype.manifest = function(manifestXml){
	var baseUrl = this.baseUrl,
		manifest = {};
	
	//-- Turn items into an array
	var selected = manifestXml.querySelectorAll("item"),
		items = Array.prototype.slice.call(selected);
		
	//-- Create an object with the id as key
	items.forEach(function(item){
		var id = item.getAttribute('id'),
			href = item.getAttribute('href') || '',
			type = item.getAttribute('media-type') || '';
		
		manifest[id] = {
			'href' : baseUrl + href, //-- Absolute URL for loading with a web worker
			'type' : type
		};
	
	});
	
	return manifest;

}

EPUBJS.Parser.prototype.spine = function(spineXml, manifest){
	var spine = [];
	
	var selected = spineXml.getElementsByTagName("itemref"),
		items = Array.prototype.slice.call(selected);
	
	//-- Add to array to mantain ordering and cross reference with manifest
	items.forEach(function(item, index){
		var Id = item.getAttribute('idref');
		
		var vert = {
			'id' : Id,
			'linear' : item.getAttribute('linear') || '',
			'properties' : item.getAttribute('properties') || '',
			'href' : manifest[Id].href,
			'index' : index
		}
		
	
		spine.push(vert);
	});
	
	return spine;
}

EPUBJS.Parser.prototype.toc = function(tocXml){
	
	var navMap = tocXml.querySelector("navMap");

	function getTOC(parent){
		var list = [],
			items = [],
			nodes = parent.childNodes,
			nodesArray = Array.prototype.slice.call(nodes),
			length = nodesArray.length,
			iter = length,
			node;
		

		if(length == 0) return false;

		while(iter--){
			node = nodesArray[iter];
		  	if(node.nodeName === "navPoint") {
		  		items.push(node);
		  	}
		}
		
		items.forEach(function(item){
			var id = item.getAttribute('id'),
				content = item.querySelector("content"),
				src = content.getAttribute('src'),
				split = src.split("#"),
				navLabel = item.querySelector("navLabel"),
				text = navLabel.textContent ? navLabel.textContent : "",
				subitems = getTOC(item);
			list.unshift({
						"id": id, 
						"href": src, 
						"label": text,
						"subitems" : subitems
			});

		});

		return list;
	}
	
	
	return getTOC(navMap);


}


EPUBJS.Renderer = function(book) {
	this.el = book.element;
	this.book = book;
	
	this.settings = book.settings;
	
	book.registerHook("beforeChapterDisplay", 
		[this.replaceLinks.bind(this), 
		 this.replaceResources.bind(this),
		 this.replaceHead.bind(this)], true);

	
	this.crossBrowserColumnCss();
	
	this.epubcfi = new EPUBJS.EpubCFI();
		
	this.initialize();
	this.listeners();

	//-- Renderer events for listening
	/*
		renderer:resized
		renderer:chapterDisplayed
		renderer:chapterUnloaded
	*/
}

//-- Build up any html needed
EPUBJS.Renderer.prototype.initialize = function(){
	this.iframe = document.createElement('iframe');
	//this.iframe.id = "epubjs-iframe";

	if(this.settings.width || this.settings.height){
		this.resizeIframe(false, this.settings.width || this.el.clientWidth, this.settings.height || this.el.clientHeight);
	} else {
		this.resizeIframe(false, this.el.clientWidth, this.el.clientHeight);

		this.on("renderer:resized", this.resizeIframe, this);
	}
	

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
	
	var msg = {
		width: this.el.clientWidth,
		height: this.el.clientHeight
	};

	this.trigger("renderer:resized", msg);
	this.book.trigger("book:resized", msg);
	
	this.reformat();
}

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
	EPUBJS.Renderer.transform   =  EPUBJS.core.prefixed('transform');

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

		renderer.applyStyles();
		
		if(renderer.book.settings.fixedLayout) {
			renderer.fixedLayout();
		} else {
			renderer.formatSpread();
		}
		

		//-- Trigger registered hooks before displaying
		renderer.beforeDisplay(function(){

			renderer.calcPages();
			
			promise.resolve(renderer);

			renderer.currentLocationCfi = renderer.getPageCfi();

			renderer.trigger("renderer:chapterDisplayed", renderer.currentChapter);
			renderer.book.trigger("renderer:chapterDisplayed", renderer.currentChapter);

			renderer.visible(true);

		});
		
		
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

	if(this.elWidth < cutoff || !this.book.settings.spreads) {
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

	// if(this.bodyEl) this.bodyEl.style.margin = 0;
	// this.bodyEl.style.fontSize = localStorage.getItem("fontSize") || "medium";
	
	//-- Clear Margins
	// this.bodyEl.style.margin = "0";
	
	this.docEl.style.overflow = "hidden";

	this.docEl.style.width = this.elWidth;

	//-- Adjust height
	this.docEl.style.height = this.iframe.height  + "px";

	//-- Add columns
	this.docEl.style[EPUBJS.Renderer.columnAxis] = "horizontal";
	this.docEl.style[EPUBJS.Renderer.columnGap] = this.gap+"px";
	this.docEl.style[EPUBJS.Renderer.columnWidth] = this.colWidth+"px";


	
}

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

	// this.displayedPages = 1;
}

EPUBJS.Renderer.prototype.setStyle = function(style, val, prefixed){
	if(prefixed) {
		style = EPUBJS.core.prefixed(style);
	}
	
	if(this.bodyEl) this.bodyEl.style[style] = val;
}

EPUBJS.Renderer.prototype.removeStyle = function(style){
	
	if(this.bodyEl) this.bodyEl.style[style] = '';
		
}

EPUBJS.Renderer.prototype.applyStyles = function() {
	var styles = this.book.settings.styles;

	for (style in styles) {
		this.setStyle(style, styles[style]);
	}
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
		
		this.book.trigger("book:pageChanged", this.currentLocationCfi);


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

		this.book.trigger("book:pageChanged", this.currentLocationCfi);

		return this.chapterPos;
	}else{
		return false;
	}
}

EPUBJS.Renderer.prototype.chapterEnd = function(){
	this.page(this.displayedPages);

	this.currentLocationCfi = this.getPageCfi();
}

EPUBJS.Renderer.prototype.setLeft = function(leftPos){
	// this.bodyEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style[EPUBJS.Renderer.transform] = 'translate('+ (-leftPos) + 'px, 0)';
	this.doc.defaultView.scrollTo(leftPos, 0);
}

EPUBJS.Renderer.prototype.replace = function(query, func, callback){
	var items, resources, count;
	
	items = this.doc.querySelectorAll(query);
	resources = Array.prototype.slice.call(items);
	count = resources.length;
	
	resources.forEach(function(item){
		
		func(item, function(){
			count--;
			if(count <= 0 && callback) callback();
		});
	
	}.bind(this));
	
	if(count === 0) callback();
}

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
}
	
//-- Replaces links in head, such as stylesheets
EPUBJS.Renderer.prototype.replaceHead = function(callback){
	var srcs, resources, count, oldUrls, 
		newUrls = {},
		unarchiver = this,
		store = this.determineStore(),
		replaceUrl = function(link, url){
			link.setAttribute("href", url);
			link.onload = function(){
				count--;
				if(count <= 0) finished();
			}
		},
		finished = function() {
		
			if(callback) callback();
			
			_.each(oldUrls, function(url){
				store.revokeUrl(url);
			});
			
			unarchiver.urlCache = newUrls;
		};
	
	if(!store) {
		if(callback) callback();
		return false; 
	}
	
	srcs = this.doc.head.querySelectorAll('[href]');
	resources = Array.prototype.slice.call(srcs);
	count = resources.length;
	
	if(!this.urlCache) this.urlCache = {};
	oldUrls = _.clone(this.urlCache);

	resources.forEach(function(link){
		var src = link.getAttribute("href"),
			full = this.book.settings.contentsPath + src;
		
		
		if(full in oldUrls){
			replaceUrl(link, oldUrls[full]);
			newUrls[full] = oldUrls[full];
			delete oldUrls[full];
		}else{
			
			//-- Handle replacing urls in CSS
			if(link.getAttribute("rel") === "stylesheet") {
				store.getText(full).then(function(text){
					var url;
				
					unarchiver.replaceUrlsInCss(full, text).then(function(newText){
						var _URL = window.URL || window.webkitURL || window.mozURL;

						var blob = new Blob([newText], { "type" : "text\/css" }),
							url = _URL.createObjectURL(blob);

						replaceUrl(link, url);
						newUrls[full] = url;

					}, function(e) {console.error(e)});
					
				});	
			}else{
				store.getUrl(full).then(function(url){
					replaceUrl(link, url);
					newUrls[full] = url;
				});	
			}

		}
		

	}.bind(this));

	if(count === 0) finished();
	
}

EPUBJS.Renderer.prototype.replaceUrlsInCss = function(base, text){
	var promise = new RSVP.Promise(),
		promises = [],
		store = this.determineStore(),
		matches = text.match(/url\(\'?\"?([^\'|^\"]*)\'?\"?\)/g);
	
	if(!matches){
		promise.resolve(text);
		return promise;
	}

	matches.forEach(function(str){
		var full = EPUBJS.core.resolveUrl(base, str.replace(/url\(|[|\)|\'|\"]/g, ''));
		replaced = store.getUrl(full).then(function(url){
			text = text.replace(str, 'url("'+url+'")');
		}, function(e) {console.error(e)} );
		
		promises.push(replaced);
	});
	
	RSVP.all(promises).then(function(){
		promise.resolve(text);
	});
	
	return promise;	
}
/*
//-- Replaces links in head, such as stylesheets
EPUBJS.Renderer.prototype.replaceCss = function(callback){
	var styleSheets = this.doc.styleSheets,
		store = this.determineStore(),
		rules = [];
	
	_.each(styleSheets, function(sheet){
		_.each(sheet.cssRules, function(rule, index){
			if(rule.type == 5) {
				//url("../fonts/STIXGeneral.otf")
				// if()
				var urlString = rule.cssText.match(/url\(\'?\"?([^\'|^\"]*)\'?\"?\)/),
					full;
				// rule.cssText = ""
				// console.log(rule.style.src, rule.style[3])
				// console.log(urlString)
			
				if(urlString[1]){
					full = "OPS/" + urlString[1].slice(3);
					store.getUrl(full).then(function(url){
						var newRule = rule.cssText.replace(/url\(\'?\"?([^\'|^\"]*)\'?\"?\)/, 'url("'+url+'")');
						sheet.deleteRule(index)
						sheet.insertRule(newRule, false);
					});
				}	
			
			}
		});
	});
	

}
*/


//-- Replaces the relative links within the book to use our internal page changer
EPUBJS.Renderer.prototype.replaceLinks = function(callback){
	var hrefs = this.doc.querySelectorAll('a'),
		links = Array.prototype.slice.call(hrefs),
		that = this;

	links.forEach(function(link){
		var path,
			href = link.getAttribute("href"),
			relative,
			fragment;

		if(!href) return;

		relative = href.search("://"),
		fragment = href[0] == "#";

		if(relative != -1){

			link.setAttribute("target", "_blank");

		}else{

			link.onclick = function(){
				that.book.goto(href);
				return false;
			}
		}				

	});

	if(callback) callback();
}

//-- Replaces assets src's to point to stored version if browser is offline
EPUBJS.Renderer.prototype.replaceResources = function(callback){
	var srcs, resources, count;
	var store = this.determineStore();
	
	if(!store) {
		if(callback) callback();
		return false; 
	}
	
	srcs = this.doc.querySelectorAll('[src]');
	resources = Array.prototype.slice.call(srcs);
	count = resources.length;
	
	resources.forEach(function(link){
		var src = link.getAttribute("src"),
			full = this.book.settings.contentsPath + src;

		store.getUrl(full).then(function(url){
			// link.setAttribute("src", url);
			link.src = url;
			
			link.onload = function(){
				count--;
				if(count <= 0 && callback) callback();
			}
			
		});
		
	}.bind(this));
	
	if(count === 0) callback();
}

EPUBJS.Renderer.prototype.page = function(pg){
	if(pg >= 1 && pg <= this.displayedPages){
		this.chapterPos = pg;
		this.leftPos = this.spreadWidth * (pg-1); //-- pages start at 1
		this.setLeft(this.leftPos);

		// localStorage.setItem("chapterPos", pg);
		return true;
	}

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
		this.visibileEl.id = "EPUBJS-PAGE-" + this.chapterPos;
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
	
	if(el && typeof el.getBoundingClientRect === 'function'){

		left = el.getBoundingClientRect().left;
		
		if( left >= 0 &&
			left < this.spreadWidth ) {
			return true;	
		}
	}
	
	return false;
}


EPUBJS.Renderer.prototype.height = function(el){
	return this.docEl.offsetHeight;
}





//-- Enable binding events to parser
RSVP.EventTarget.mixin(EPUBJS.Renderer.prototype);

EPUBJS.Unarchiver = function(url){
	
	
	this.libPath = EPUBJS.filePath;
	this.zipUrl = url;
	this.loadLib()
	this.urlCache = {};
	
	this.zipFs = new zip.fs.FS();
	
	return this.promise;
	
}

EPUBJS.Unarchiver.prototype.loadLib = function(callback){
	if(typeof(zip) == "undefined") console.error("Zip lib not loaded");
	
	/*
	//-- load script
	EPUBJS.core.loadScript(this.libPath+"zip.js", function(){
		//-- Tell zip where it is located
		zip.workerScriptsPath = this.libPath;
		callback();
	}.bind(this));
	*/
	// console.log(this.libPath)
	zip.workerScriptsPath = this.libPath;
}

EPUBJS.Unarchiver.prototype.openZip = function(zipUrl, callback){ 
	var promise = new RSVP.Promise();
	var zipFs = this.zipFs;
	zipFs.importHttpContent(zipUrl, false, function() {
		promise.resolve(zipFs);
	}, this.failed);
	
	return promise
}

// EPUBJS.Unarchiver.prototype.getXml = function(url){
// 	var unarchiver = this,
// 		request;
// 	return this.getUrl(url, 'application/xml').
// 			then(function(newUrl){
// 				request = EPUBJS.core.request(newUrl, 'xml');
// 				//-- Remove temp url after use
// 				request.then(function(uri){
// 					unarchiver.revokeUrl(uri);
// 				});
// 				return request
// 		  	});
// 		  	
// }
EPUBJS.Unarchiver.prototype.getXml = function(url){
	
	return this.getText(url).
			then(function(text){
				var parser = new DOMParser();
				return parser.parseFromString(text, "application/xml");
		  	});

}

EPUBJS.Unarchiver.prototype.getUrl = function(url, mime){
	var unarchiver = this;
	var promise = new RSVP.Promise();
	var entry = this.zipFs.find(url);	
	var _URL = window.URL || window.webkitURL || window.mozURL; 

	if(!entry) console.error(url);
	
	if(url in this.urlCache) {
		promise.resolve(this.urlCache[url]);
		return promise;
	}
	
	entry.getBlob(mime || zip.getMimeType(entry.name), function(blob){
		var tempUrl = _URL.createObjectURL(blob);
		promise.resolve(tempUrl);
		unarchiver.urlCache[url] = tempUrl;
	});

	return promise;
}

EPUBJS.Unarchiver.prototype.getText = function(url){
	var unarchiver = this;
	var promise = new RSVP.Promise();
	var entry = this.zipFs.find(url);	
	var _URL = window.URL || window.webkitURL || window.mozURL; 

	if(!entry) console.error(url);


	entry.getText(function(text){
		promise.resolve(text);
	}, null, null, 'ISO-8859-1');

	return promise;
}

EPUBJS.Unarchiver.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = unarchiver.urlCache[url];
	console.log("revoke", fromCache);
	if(fromCache) _URL.revokeObjectURL(fromCache);
}

EPUBJS.Unarchiver.prototype.failed = function(error){ 
	console.error(error);
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