FP.Chapter = function(book, pos){

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

FP.Chapter.prototype.load = function(){
	var path = this.path;

	if(this.book.online && !this.book.contained){
		this.setIframeSrc(path);
	}else{
		this.loadFromStorage(path);
	}
	
}

FP.Chapter.prototype.loadFromStorage = function(path){
	var file = FP.storage.get(path, this.setIframeSrc.bind(this));
}

FP.Chapter.prototype.setIframeSrc = function(url){
	var that = this;
	
	//-- Not sure if this is the best time to do this, but hides current text
	this.visible(false);
	
	this.iframe.src = url;
	
	this.iframe.onload = function() {
		that.doc = that.iframe.contentDocument;
		that.bodyEl = that.doc.body;
		
		that.formatSpread();

		that.afterLoaded(that);

		that.book.listen("book:resized", that.formatSpread, that);

	}
}

FP.Chapter.prototype.afterLoaded = function(chapter){
	//-- This is overwritten by the book object
}

FP.Chapter.prototype.error = function(err){
	console.log("error", error)
}

FP.Chapter.prototype.formatSpread = function(){
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

	if(this.elWidth < cutoff) {
		this.spread = false; //-- Single Page

		divisor = 1;
		this.colWidth = Math.floor(this.elWidth / divisor);
	}else{
		this.spread = true; //-- Double Page

		this.colWidth = Math.floor((this.elWidth - this.gap) / divisor);
		//-- Must be even for firefox
		if(this.colWidth % 2 != 0){
			this.colWidth -= 1;
		}
	}

	this.spreadWidth = (this.colWidth + this.gap) * divisor;

	//-- Clear Margins
	this.bodyEl.style.visibility = "hidden";
	this.bodyEl.style.margin = "0";
	this.bodyEl.style.overflow = "hidden";

	this.bodyEl.style.width = this.elWidth;

	//-- Adjust height
	this.bodyEl.style.height = this.book.el.clientHeight + "px";

	//-- Add columns
	this.bodyEl.style[FP.core.columnAxis] = "horizontal";
	this.bodyEl.style[FP.core.columnGap] = this.gap+"px";
	this.bodyEl.style[FP.core.columnWidth] = this.colWidth+"px";
	
	this.calcPages();
	
	//-- Trigger registered hooks before displaying
	this.beforeDisplay(function(){
		this.book.tell("book:chapterDisplayed");
		this.visible(true);
	});
	
	//-- Go to current page after resize
	if(this.OldcolWidth){		
		this.leftPos = (this.chapterPos - 1 ) * this.spreadWidth;
		this.bodyEl.scrollLeft = this.leftPos;
	}
}

FP.Chapter.prototype.goToChapterEnd = function(){
	this.chapterEnd();
}

FP.Chapter.prototype.visible  = function(bool){
	if(!this.bodyEl) return false;
	
	if(bool){
		this.bodyEl.style.visibility = "visible";
	}else{
		this.bodyEl.style.visibility = "hidden";
	}
}

FP.Chapter.prototype.calcPages = function(){
	this.totalWidth = this.iframe.contentDocument.documentElement.scrollWidth; //this.bodyEl.scrollWidth;

	this.displayedPages = Math.ceil(this.totalWidth / this.spreadWidth);
	

	localStorage.setItem("displayedPages", this.displayedPages);
	//console.log("Pages:", this.displayedPages)
}


FP.Chapter.prototype.nextPage = function(){
	if(this.chapterPos < this.displayedPages){
		this.chapterPos++;

		this.leftPos += this.spreadWidth;

		this.setLeft(this.leftPos);
		
		localStorage.setItem("chapterPos", this.chapterPos);
		
		return this.chapterPos;
	}else{
		return false;
	}
}

FP.Chapter.prototype.prevPage = function(){
	if(this.chapterPos > 1){
		this.chapterPos--;

		this.leftPos -= this.spreadWidth;

		this.setLeft(this.leftPos);
		
		localStorage.setItem("chapterPos", this.chapterPos);
		
		return this.chapterPos;
	}else{
		return false;
	}
}

FP.Chapter.prototype.chapterEnd = function(){
	this.page(this.displayedPages);
}

FP.Chapter.prototype.setLeft = function(leftPos){
	this.bodyEl.style.marginLeft = -leftPos + "px";
}

//-- Replaces the relative links within the book to use our internal page changer
FP.Chapter.prototype.replaceLinks = function(callback){
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
FP.Chapter.prototype.replaceResources = function(callback){
	var srcs, resources, count;
	
	//-- No need to replace if there is network connectivity
	//-- also Filesystem api links are relative, so no need to replace them
	if((this.book.online && !this.book.contained) || FP.storage.getStorageType() == "filesystem") {
		if(callback) callback();
		return false; 
	}
	
	srcs = this.doc.querySelectorAll('[src]');
	resources = Array.prototype.slice.call(srcs);
	count = resources.length;
	
	resources.forEach(function(link){
		var src = link.getAttribute("src"),
			full = this.book.basePath + src;
		
		FP.storage.get(full, function(url){
			link.setAttribute("src", url);
			count--;
			if(count <= 0 && callback) callback();
		});
		
	}.bind(this));
			
}

FP.Chapter.prototype.getID = function(){
	return this.ID;
}

FP.Chapter.prototype.page = function(pg){
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
FP.Chapter.prototype.section = function(fragment){
	var el = this.doc.getElementById(fragment),
		left, pg;
	
	
	if(el){
		left = this.leftPos + el.offsetLeft, //-- Calculate left offset compaired to scrolled position
		pg = Math.floor(left / this.spreadWidth) + 1; //-- pages start at 1
			
		this.page(pg);
	}	

}

FP.Chapter.prototype.beforeDisplay = function(callback){
	this.book.triggerHooks("beforeChapterDisplay", callback.bind(this), this);
}

