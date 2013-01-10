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
	this.createEvent("book:resized");

	this.initialize(this.el);
	this.listeners();
	
	//-- Determine storage type
	//   options: none | ram
	FP.storage.storageMethod("none");
	
	// BookUrl is optional, but if present start loading process
	if(bookUrl) {
		this.loadEpub(bookUrl);
	}


}

//-- Build up any html needed
FP.Book.prototype.initialize = function(el){
	this.iframe = document.createElement('iframe');
	this.resizeIframe(false, this.el.clientWidth, this.el.clientHeight);

	this.listen("book:resized", this.resizeIframe, this);

	//this.listen("book:bookReady", function(){console.log("rready")});


	this.el.appendChild(this.iframe);


}

FP.Book.prototype.listeners = function(){
	var that = this;
	window.addEventListener("resize", that.onResized.bind(this), false);
}


FP.Book.prototype.loadEpub = function(bookUrl){
	this.bookUrl = bookUrl;

	//-- TODO: Check what storage types are available
	//-- TODO: Checks if the url is a zip file and unpack
	if(this.isContained(bookUrl)){
		console.log("Zipped!");
	}

	//-- Gets the root of the book and url of the opf
	this.parseContainer(function(){
		//-- Gets all setup of the book from xml file
		//-- TODO: add promise for this instead of callback?
		this.parseContents();
	});



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
		rootfiles = container.getElementsByTagName("rootfile");

		//-- Should only be one
		rootfile = rootfiles[0];

		fullpath = rootfile.getAttribute('full-path').split("/");

		that.basePath = that.bookUrl + fullpath[0] + "/";
		that.contentsPath = fullpath[1];
		//-- Now that we have the path we can parse the contents
		//-- TODO: move this
		that.parseContents(that.contentsPath);
	});

}

FP.Book.prototype.parseContents = function(){
	var that = this,
		url = this.basePath + this.contentsPath;

	FP.core.loadXML(url, function(contents){
		var metadata = contents.getElementsByTagName("metadata")[0],
			manifest = contents.getElementsByTagName("manifest")[0],
			spine = contents.getElementsByTagName("spine")[0];
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
}

FP.Book.prototype.parseSpine = function(spine){
	var that = this;

	this.spine = [];

	this.spineIndex = {}; //-- For quick reference by id, might be a better way

	//-- Turn items into an array
	items = Array.prototype.slice.call(spine.getElementsByTagName("itemref"));

	//-- Add to array to mantain ordering and cross reference with manifest
	items.forEach(function(item, index){
		var id = item.getAttribute('idref'),
			href = that.assets[id];

		that.spine.push({"id": id, "href": href});
		that.spineIndex[id] = index;
	});
	this.tell("book:spineReady");
}

FP.Book.prototype.parseTOC = function(path){
	var that = this,
		url = this.basePath + path;

	this.toc = [];

	FP.core.loadXML(url, function(contents){
		var navMap = contents.getElementsByTagName("navMap")[0];




		function getTOC(nodes, parent){
			var list = [];

			//-- Turn items into an array
			items = Array.prototype.slice.call(nodes);

			items.forEach(function(item){
				var id = item.getAttribute('id'),
					href = that.assets[id],
					navLabel = item.getElementsByTagName("navLabel")[0], //-- TODO: replace with query
					text = navLabel.textContent ? navLabel.textContent : "",
					subitems = item.getElementsByTagName("navPoint") || false,
					subs = false,
					childof = (item.parentNode == parent);				


				if(!childof) return; //-- Only get direct children, should xpath for this eventually?

				if(subitems){
					subs = getTOC(subitems, item)
				}

				list.push({
							"id": id, 
							"href": href, 
							"label": text, 
							"spinePos": parseInt(that.spineIndex[id]),
							"subitems" : subs
				});

			});

			return list;
		}

		that.toc = getTOC(navMap.getElementsByTagName("navPoint"), navMap);


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
	return this.spine[this.spinePos].id;
}

FP.Book.prototype.startDisplay = function(){
	//-- get previous saved positions
	var spinePos = parseInt(localStorage.getItem("spinePos")) || 0;

	this.tell("book:bookReady");

	this.displayChapter(spinePos);

}

FP.Book.prototype.displayChapter = function(pos, end){
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

		if(end) chapter.goToChapterEnd();

		that.tell("book:chapterReady");
		
		that.preloadNextChapter();
	}
}

FP.Book.prototype.nextPage = function(){
	var next = this.currentChapter.nextPage();
	if(!next){
		this.nextChapter();
	}
}

FP.Book.prototype.prevPage = function(){
	var prev = this.currentChapter.prevPage();
	if(!prev){
		this.prevChapter();
	}
}

FP.Book.prototype.nextChapter = function(){
	this.spinePos++;

	this.displayChapter(this.spinePos);
}

FP.Book.prototype.prevChapter = function(){
	this.spinePos--;

	this.displayChapter(this.spinePos, true);
}



FP.Book.prototype.getTOC = function(){
	return this.toc;

}

FP.Book.prototype.preloadNextChapter = function(){
	var next = this.spinePos + 1,
		path = this.spine[next].href;

	file = FP.storage.preload(path);
}

FP.Book.prototype.preloadAll = function(){
	
}

FP.Book.prototype.preloadResources = function(){

}
