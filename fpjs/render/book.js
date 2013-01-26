FP.Book = function(elem, bookUrl){

	//-- Takes a string or a element
	if (typeof elem == "string") { 
		this.el = FP.core.getEl(elem);
	} else {
		this.el = elem;
	}

	this.events = new FP.Events(this, this.el);
	
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
	if(bookUrl) {
		this.display(bookUrl);
	}


}


//-- Build up any html needed
FP.Book.prototype.initialize = function(el){
	this.iframe = document.createElement('iframe');
	this.resizeIframe(false, this.el.clientWidth, this.el.clientHeight);

	this.listen("book:resized", this.resizeIframe, this);
	
	this.el.appendChild(this.iframe);
	
}

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
	
	//-- TODO: listener for offline
}


FP.Book.prototype.start = function(bookUrl){
	var pathname = window.location.pathname,
		folder = (pathname[pathname.length - 1] == "/") ? pathname : "/";
	
	this.bookUrl = bookUrl;
	
	if(this.bookUrl.search("://") == -1){
		//-- get full path
		this.bookUrl = window.location.origin + folder + this.bookUrl;
	}
	
	//-- TODO: Check what storage types are available
	//-- TODO: Checks if the url is a zip file and unpack
	if(this.isContained(bookUrl)){
		console.error("Zipped!");
	}
	
	if(!this.isSaved()){
		//-- Gets the root of the book and url of the opf
		this.parseContainer(function(){
			//-- Gets all setup of the book from xml file
			//-- TODO: add promise for this instead of callback?
			this.parseContents();
		});

	}else{
		this.tell("book:tocReady");
		this.tell("book:metadataReady");
		this.tell("book:spineReady");

		//-- Info is saved, start display
		this.startDisplay();
	}

}

FP.Book.prototype.isSaved = function(force) {

	if (localStorage.getItem("bookUrl") != this.bookUrl ||
		localStorage.getItem("fpjs-version") != FP.VERSION ||
		force == true) {
		
		localStorage.setItem("fpjs-version", FP.VERSION);
		
		localStorage.setItem("bookUrl", this.bookUrl);
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
		width += 1;
	}

	this.iframe.width = width;
}

FP.Book.prototype.parseContainer = function(callback){
	var that = this,
		url = this.bookUrl + "META-INF/container.xml";
	FP.core.loadXML(url, function(container){
		var fullpath;

		//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
		rootfile = container.querySelector("rootfile");

		//-- Should only be one
		//rootfile = rootfiles[0];

		fullpath = rootfile.getAttribute('full-path').split("/");

		that.basePath = that.bookUrl + fullpath[0] + "/";
		that.contentsPath = fullpath[1];
		
		localStorage.setItem("basePath", that.basePath);
		localStorage.setItem("contentsPath", that.contentsPath);
		
		//-- Now that we have the path we can parse the contents
		//-- TODO: move this
		that.parseContents(that.contentsPath);
	});

}

FP.Book.prototype.parseContents = function(){
	var that = this,
		url = this.basePath + this.contentsPath;

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
		that.assets[id] = that.basePath + href;

		//-- Find NCX: media-type="application/x-dtbncx+xml" href="toc.ncx"
		if(item.getAttribute('media-type') == "application/x-dtbncx+xml"){
			that.parseTOC(href);
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
		url = this.basePath + path;

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
					src = content.getAttribute('src'), //that.assets[id],
					split = src.split("#"),
					//href = that.basePath + split[0],
					//hash = split[1] || false,
					//spinePos = parseInt(that.spineIndexByID[id] || that.spineIndexByURL[href]),
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
							//"spinePos": spinePos,
							//"section" : hash || false,
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
		
		if(this.online){
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

	if(!chapter){
		spinePos = this.spinePos;
	}

	if(typeof(spinePos) != "number") return false;
	
	if(spinePos != this.spinePos){
		this.displayChapter(spinePos, function(chap){
			if(section) chap.section(section);
		});
	}else{
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
		//-- TODO: Choose between single and spread
		//that.formatSpread();

		that.tell("book:chapterReady", chapter.getID());
		
		if(callback){
			callback(chapter);
		}
		//that.preloadNextChapter();
		
		
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

FP.Book.prototype.preloadNextChapter = function() {
	var next = this.spinePos + 1,
		path = this.spine[next].href;

	file = FP.storage.preload(path);
}

FP.Book.prototype.storeOffline = function(callback) {
	var assets = FP.core.toArray(this.assets);

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
	
	if(!stored){
		this.online = true;
		this.tell("book:online");
	}else{
		if(!this.availableOffline){
			this.storeOffline(function(){
				this.online = false;
				this.tell("book:offline");
			}.bind(this));
		}else{
			this.online = false;
			console.log("gone offline")
			this.tell("book:offline");
		}
	}
	
}

FP.Book.prototype.determineStorageMethod = function(override) {
	var method = 'ram';
	//   options: none | ram | websql | indexedDB | filesystem
	if(override){
		method = override;
	}else{
		if (Modernizr.websqldatabase) { method = "websql" }
		if (Modernizr.indexeddb) { method = "indexedDB" }
		if (Modernizr.filesystem) { method = "filesystem" }
	}
	
	FP.storage.storageMethod(method);
}

FP.Book.prototype.triggerHooks = function(type, callback){
	var hooks, count;

	if(typeof(this.hooks[type]) == "undefined") return false;

	hooks = this.hooks[type];
	count = hooks.length;

	function countdown(){
		count--;
		if(count <= 0 && callback) callback();
	};

	hooks.forEach(function(hook){
		hook(countdown);
	});
}

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
		this.hooks[type] = [func]; //or maybe this should error?
	}
}
