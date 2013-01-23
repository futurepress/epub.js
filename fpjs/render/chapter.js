FP.Chapter = function(book){

	this.book = book;
	this.iframe = this.book.iframe;

	//-- Get the url to the book from the spine
	this.path = this.book.spine[this.book.spinePos].href;

	this.chapterPos = 1;
	this.leftPos = 0;

	this.load();
	
	return this;

}

FP.Chapter.prototype.load = function(){
	var path = this.path;

	if(this.book.online){
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
	
	//-- Not sure if this is the best time to do this, but hide current text
	if(this.bodyEl) this.bodyEl.style.visibility = "hidden";
	
	this.iframe.src = url;
	
	this.iframe.onload = function() {
		//that.bodyEl = that.iframe.contentDocument.documentElement.getElementsByTagName('body')[0];
		//that.bodyEl = that.iframe.contentDocument.querySelector('body, html');
		that.bodyEl = that.book.bodyEl = that.iframe.contentDocument.body;

		//-- TODO: Choose between single and spread
		that.formatSpread();

		that.afterLoaded(that);

		that.book.listen("book:resized", that.formatSpread, that);

	}
}

FP.Chapter.prototype.afterLoaded = function(chapter){
	console.log("afterLoaded")
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
	//this.bodyEl.setAttribute("style", "background: #777");

	//-- Check the width and decied on columns
	//-- Todo: a better place for this?
	this.elWidth = this.iframe.width;

	this.gap = this.gap || Math.ceil(this.elWidth / 8);

	if(this.elWidth < cutoff) {
		divisor = 1;
		this.colWidth = Math.floor(this.elWidth / divisor);
	}else{
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



	this.bodyEl.style[FP.core.columnAxis] = "horizontal";
	this.bodyEl.style[FP.core.columnGap] = this.gap+"px";
	this.bodyEl.style[FP.core.columnWidth] = this.colWidth+"px";
	
	this.calcPages();
	
	if(!this.book.online){
		//-- Temp place to parse Links
		this.replaceLinks(function(){
			this.visible(true);
		}.bind(this));
	}else{
		this.visible(true);
	}
	
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
	if(bool){
		this.bodyEl.style.visibility = "visible";
	}else{
		this.bodyEl.style.visibility = "hidden";
	}
}

FP.Chapter.prototype.calcPages = function(){
	this.totalWidth = this.iframe.contentDocument.documentElement.scrollWidth; //this.bodyEl.scrollWidth;

	this.displayedPages = Math.ceil(this.totalWidth / this.spreadWidth);
	

	//-- I work for Chrome
	//this.iframe.contentDocument.body.scrollLeft = 200;

	//-- I work for Firefox
	//this.iframe.contentDocument.documentElement.scrollLeft = 200;

}


FP.Chapter.prototype.nextPage = function(){
	if(this.chapterPos < this.displayedPages){
		this.chapterPos++;

		this.leftPos += this.spreadWidth;
		//this.bodyEl.scrollLeft = this.leftPos;
		//this.bodyEl.style.marginLeft = -this.leftPos + "px";
		this.setLeft(this.leftPos);
		
		return this.chapterPos;
	}else{
		//this.nextChapter();
		return false;
	}
}

FP.Chapter.prototype.prevPage = function(){
	if(this.chapterPos > 1){
		this.chapterPos--;

		this.leftPos -= this.spreadWidth;
		//this.bodyEl.scrollLeft = this.leftPos;
		//this.bodyEl.style.marginLeft = -this.leftPos + "px";
		this.setLeft(this.leftPos);
		
		return this.chapterPos;
	}else{
		//this.prevChapter();
		return false;
	}
}

FP.Chapter.prototype.chapterEnd = function(){
	this.chapterPos = this.displayedPages;
	this.leftPos = this.spreadWidth * (this.displayedPages - 1);//this.totalWidth - this.colWidth;
	this.setLeft(this.leftPos);
}

FP.Chapter.prototype.setLeft = function(leftPos){
	this.bodyEl.style.marginLeft = -leftPos + "px";
}

FP.Chapter.prototype.replaceLinks = function(callback){
	var doc = this.iframe.contentDocument,
		links = doc.querySelectorAll('[href], [src]'),
		items = Array.prototype.slice.call(links),
		count = items.length;
		
	if(FP.storage.getStorageType() == "filesystem") {
		//-- filesystem api links are relative, so no need to fix
		if(callback) callback();
		return false; 
	}
	
	items.forEach(function(link){
		var path,
			href = link.getAttribute("href"),
			src = link.getAttribute("src"),
			full = href ? this.book.basePath + href : this.book.basePath + src;
		
		FP.storage.get(full, function(url){
			if(href) link.setAttribute("href", url);
			if(src) link.setAttribute("src", url);
			count--;
			if(count <= 0 && callback) callback();
		});
		
	}.bind(this));
			
}


