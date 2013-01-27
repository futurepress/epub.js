FP.Book = function(elem, bookPath){

	//-- Takes a string or a element
	if (typeof elem == "string") { 
		this.el = FP.core.getEl(elem);
	} else {
		this.el = elem;
	}

	this.events = new FP.Events(this, this.el);
	
	//-- All Book events for listening
	this.createEvent("book:tocReady");
	this.createEvent("book:metadataReady");
	this.createEvent("book:spineReady");
	this.createEvent("book:bookReady");
	this.createEvent("book:chapterReady");
	this.createEvent("book:chapterDisplayed");
	this.createEvent("book:resized");
	this.createEvent("book:stored");
	this.createEvent("book:online");
	this.createEvent("book:offline");
	
	//-- All hooks to add functions (with a callback) to 
	this.hooks = {
		"beforeChapterDisplay" : []
	};
	
	this.initialize(this.el);
	
	this.online = navigator.onLine;
	this.listeners();
	
	//-- Determine storage method
	//-- Override options: none | ram | websql | indexedDB | filesystem
	this.determineStorageMethod();
	
	// BookUrl is optional, but if present start loading process
	if(bookPath) {
		this.display(bookPath);
	}


}


//-- Build up any html needed
FP.Book.prototype.initialize = function(el){
	this.iframe = document.createElement('iframe');
	this.resizeIframe(false, this.el.clientWidth, this.el.clientHeight);

	this.listen("book:resized", this.resizeIframe, this);
	
	this.el.appendChild(this.iframe);
	
}

//-- Listeners for browser events
FP.Book.prototype.listeners = function(){
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
	
}

//-- Check bookUrl and start parsing book Assets or load them from storage 
FP.Book.prototype.start = function(bookPath){
	var pathname = window.location.pathname,
		folder = (pathname[pathname.length - 1] == "/") ? pathname : "/";
	
	this.bookPath = bookPath;

	
	//-- Checks if the url is a zip file and unpack
	if(this.isContained(bookPath)){
		this.bookUrl = "";
		this.contained = true;
		this.tell("book:offline");
		if(this.online) this.unarchive(bookPath);
		return;
	}else{
		this.bookUrl = (bookPath[bookPath.length - 1] == "/") ? bookPath : bookPath + "/";
		
		if(this.bookUrl.search("://") == -1){
			//-- get full path
			this.bookUrl = window.location.origin + folder + this.bookUrl;
		}
	}
	
	if(!this.isSaved(true)){
		
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

FP.Book.prototype.unarchive = function(bookPath){
	var unzipped;
	
	//-- TODO: make more DRY

	if(!this.isSaved()){
		
		unzipped = new FP.Unarchiver(bookPath, function(){

			FP.storage.get("META-INF/container.xml", function(url){
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

FP.Book.prototype.isSaved = function(force) {
	//-- If url or version has changed invalidate stored data and reset
	if (localStorage.getItem("bookPath") != this.bookPath ||
		localStorage.getItem("fpjs-version") != FP.VERSION ||
		force == true) {
		
		localStorage.setItem("fpjs-version", FP.VERSION);
		
		localStorage.setItem("bookPath", this.bookPath);
		localStorage.setItem("spinePos", 0);
		localStorage.setItem("stored", 0);
		
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
		
		//-- Check that retrieved object aren't null 
		if(!this.assets || !this.spine || !this.spineIndexByURL || !this.toc){
			this.stored = 0;
			return false;
		}
		
		return true;
	}

	
}

FP.Book.prototype.isContained = function(bookUrl){
	var tester=/\.[0-9a-z]+$/i,
		ext = tester.exec(bookUrl);

	if(ext && (ext[0] == ".epub" || ext[0] == ".zip")){
		return true;
	}

	return false;
}


FP.Book.prototype.onResized = function(){
	this.tell("book:resized", {
		width: this.el.clientWidth,
		height: this.el.clientHeight
	});
}

FP.Book.prototype.resizeIframe = function(e, cWidth, cHeight){
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

FP.Book.prototype.parseContainer = function(path){
	var that = this,
		url = path || this.bookUrl + "META-INF/container.xml";
		
	FP.core.loadXML(url, function(container){
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
			FP.storage.get(that.contentsPath, function(url){
				that.parseContents(url);
			});
		}else{
			//-- Gets the root of the book and url of the opf
			that.parseContents();
		}
		
	});

}

FP.Book.prototype.parseContents = function(path){
	var that = this,
		url = path || this.contentsPath;
	
	FP.core.loadXML(url, function(contents){
		var metadata = contents.querySelector("metadata"),
			manifest = contents.querySelector("manifest"),
			spine = contents.querySelector("spine");
			
		that.parseMetadata(metadata);
		that.parseManifest(manifest);
		that.parseSpine(spine);

		that.startDisplay();
	});
}

FP.Book.prototype.parseMetadata = function(metadata){
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

FP.Book.prototype.parseManifest = function(manifest){
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
				FP.storage.get(that.basePath + href, function(url){
					that.parseTOC(url);
				});
			}else{
				that.parseTOC(that.basePath + href);
			}
			
		}
	});
	
	localStorage.setItem("assets", JSON.stringify(this.assets));
}

FP.Book.prototype.parseSpine = function(spine){
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

FP.Book.prototype.parseTOC = function(path){
	var that = this,
		url = path;

	this.toc = [];
	
	FP.core.loadXML(url, function(contents){
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

FP.Book.prototype.destroy = function(){
	window.removeEventListener("resize", this.onResized, false);
}

FP.Book.prototype.getTitle = function(){
	return this.metadata.bookTitle;
}

FP.Book.prototype.getCreator = function(){
	return this.metadata.creator;
}

FP.Book.prototype.chapterTitle = function(){
	return this.spine[this.spinePos].id; //-- TODO: clarify that this is returning title
}

FP.Book.prototype.startDisplay = function(){
	
	this.tell("book:bookReady");
	this.displayChapter(this.spinePos, function(chapter){
		
		//-- If there is network connection, store the books contents
		if(this.online && !this.contained){
			this.storeOffline();
		}
		
	}.bind(this));
	

}

FP.Book.prototype.show = function(url){
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
	
	if(spinePos != this.spinePos){
		//-- Load new chapter if different than current
		this.displayChapter(spinePos, function(chap){
			if(section) chap.section(section);
		});
	}else{
		//-- Only goto section
		if(section) this.currentChapter.section(section);
	}
}

FP.Book.prototype.displayChapter = function(pos, callback){
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

	//-- Create a new chapter	
	this.currentChapter = new FP.Chapter(this);


	this.currentChapter.afterLoaded = function(chapter) {

		that.tell("book:chapterReady", chapter.getID());
		
		if(callback){
			callback(chapter);
		}		
		
	}
}

FP.Book.prototype.nextPage = function(){
	var next = this.currentChapter.nextPage();
	if(!next){
		this.nextChapter();
	}
}

FP.Book.prototype.prevPage = function() {
	var prev = this.currentChapter.prevPage();
	if(!prev){
		this.prevChapter();
	}
}

FP.Book.prototype.nextChapter = function() {
	this.spinePos++;

	this.displayChapter(this.spinePos);
}

FP.Book.prototype.prevChapter = function() {
	this.spinePos--;

	this.displayChapter(this.spinePos, function(chapter){
		chapter.goToChapterEnd();
	});
}



FP.Book.prototype.getTOC = function() {
	return this.toc;

}

/* TODO: Remove, replace by batch queue
FP.Book.prototype.preloadNextChapter = function() {
	var next = this.spinePos + 1,
		path = this.spine[next].href;

	file = FP.storage.preload(path);
}
*/

FP.Book.prototype.storeOffline = function(callback) {
	var assets = FP.core.toArray(this.assets);
	
	//-- Creates a queue of all items to load
	FP.storage.batch(assets, function(){
		this.stored = 1;
		localStorage.setItem("stored", 1);
		this.tell("book:stored");
		if(callback) callback();
	}.bind(this));
}

FP.Book.prototype.availableOffline = function() {
	return this.stored > 0 ? true : false;
}

FP.Book.prototype.fromStorage = function(stored) {
	
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

FP.Book.prototype.determineStorageMethod = function(override) {
	var method = 'ram';

	if(override){
		method = override;
	}else{
		if (Modernizr.websqldatabase) { method = "websql" }
		if (Modernizr.indexeddb) { method = "indexedDB" }
		if (Modernizr.filesystem) { method = "filesystem" }
	}
	
	FP.storage.storageMethod(method);
}

//-- Hooks allow for injecting async functions that must all complete before continuing 
//   Functions must have a callback as their first argument.
FP.Book.prototype.registerHook = function(type, toAdd){
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

FP.Book.prototype.triggerHooks = function(type, callback){
	var hooks, count;

	if(typeof(this.hooks[type]) == "undefined") return false;

	hooks = this.hooks[type];
	count = hooks.length;

	function countdown(){
		count--;
		if(count <= 0 && callback) callback();
	}

	hooks.forEach(function(hook){
		hook(countdown);
	});
}
