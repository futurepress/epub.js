FP.Book = function(elem, bookUrl){
	
	//-- Takes a string or a element
	if (typeof elem == "string") { 
		this.el = FP.core.getEl(elem);
	} else {
		this.el = elem;
	}
		
	this.initialize(this.el);
	this.listeners();
	
	// BookUrl is optional, but if present start loading process
	if(bookUrl) {
		this.loadEpub(bookUrl);
	}
	
	
}

//-- Build up any html needed
FP.Book.prototype.initialize = function(el){
	this.iframe = document.createElement('iframe');
	this.onResized();
	
	this.el.appendChild(this.iframe);
	
}

FP.Book.prototype.listeners = function(){
	var that = this;
	window.addEventListener("resize", function(){
		//-- Need a better way to unbind this
		
		that.onResized();
	}, false);
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
	var width = this.el.clientWidth;
	this.iframe.height = this.el.clientHeight;

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
		that.parseContents(that.contentsPath)
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
	var that = this;

	this.metadata = {};
	
	this.metadata["bookTitle"] = metadata.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/","title")[0]
											.childNodes[0].nodeValue;
	this.metadata["creator"] = metadata.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/","creator")[0]
											.childNodes[0].nodeValue;
}

FP.Book.prototype.parseManifest = function(manifest){
	var that = this;
	
	this.assets = {};
	//-- Turn items into an array
	items = Array.prototype.slice.call(manifest.getElementsByTagName("item"));
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
	
	//-- Turn items into an array
	items = Array.prototype.slice.call(spine.getElementsByTagName("itemref"));
	
	//-- Add to array to mantain ordering and cross reference with manifest
	items.forEach(function(item){
		var id = item.getAttribute('idref'),
			href = that.assets[id];
			
		that.spine.push({"id": id, "href": href});
	});
}

FP.Book.prototype.parseTOC = function(path){
	var that = this,
		url = this.basePath + path;
	
	this.toc = [];
	
	FP.core.loadXML(url, function(contents){
		var navMap = contents.getElementsByTagName("navMap")[0];

		
		//-- Turn items into an array
		items = Array.prototype.slice.call(contents.getElementsByTagName("navPoint"));

		items.forEach(function(item){
			var id = item.getAttribute('id'),
				href = that.assets[id],
				navLabel = item.getElementsByTagName("navLabel")[0].childNodes[0].childNodes[0].nodeValue;

			that.toc.push({"id": id, "href": href, "label": navLabel});
		});
		
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
	//-- TODO: get previous saved positions?
	var spinePos = 6;
	
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
	
	
	this.spinePos = pos;
	this.chapterPos = 1;
	this.leftPos = 0;

	this.iframe.src = this.spine[this.spinePos].href;
	
	this.iframe.onload = function() {
		
		//-- TODO: Choose between single and spread
		that.formatSpread(end);
		
		window.addEventListener("resize", function(){
			that.formatSpread();
			//-- need to adjust position in book
		}, false);
	}
}

FP.Book.prototype.formatSpread = function(end){
	
	this.bodyEl = this.iframe.contentDocument.documentElement.getElementsByTagName('body')[0];
	//this.bodyEl.setAttribute("style", "background: #777");
	
	//-- Check the width and decied on columns
	//-- Todo: a better place for this?
	
	this.elWidth = this.iframe.width;
	
	this.gap = this.gap || this.elWidth / 8;
	
	this.colWidth = Math.ceil((this.elWidth - this.gap) / 2);
	this.spreadWidth = (this.colWidth + this.gap) * 2;
	
	//-- Clear Margins
	this.bodyEl.style.visibility = "hidden";
	this.bodyEl.style.margin = "0";
	this.bodyEl.style.overflow = "hidden";
	
	//-- Adjust height
	this.bodyEl.style.height = this.el.clientHeight + "px";
		
	
	
	this.bodyEl.style[FP.core.columnAxis] = "horizontal";
	this.bodyEl.style[FP.core.columnGap] = this.gap+"px";
	this.bodyEl.style[FP.core.columnWidth] = this.colWidth+"px";
	
	this.calcPages();

	if(end){
		this.chapterEnd();
	}
}

FP.Book.prototype.calcPages = function(){
	this.totalWidth = this.bodyEl.scrollWidth;
	this.displayedPages = Math.ceil(this.totalWidth / this.spreadWidth);
	this.bodyEl.style.visibility = "visible";

	console.log("pages: ", this.displayedPages);
}


FP.Book.prototype.nextPage = function(){
	if(this.chapterPos < this.displayedPages){
		this.chapterPos++;
		
		this.leftPos += this.spreadWidth;
		this.bodyEl.scrollLeft = this.leftPos;
	}else{
		this.nextChapter();
	}
}

FP.Book.prototype.prevPage = function(){
	if(this.chapterPos > 1){
		this.chapterPos--;
		
		this.leftPos -= this.spreadWidth;
		this.bodyEl.scrollLeft = this.leftPos;
	}else{
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

FP.Book.prototype.chapterEnd = function(){
	this.chapterPos = this.displayedPages;
	this.leftPos = this.totalWidth - this.colWidth;
	
	this.bodyEl.scrollLeft = this.leftPos;
}

FP.Book.prototype.getTOC = function(){
	console.log(this.toc)
	return this.toc;

}

