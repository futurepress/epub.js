EPUBJS.Renderer.prototype.formatSpread = function(){

	var divisor = 2,
		cutoff = 800;

	//-- Check the width and decied on columns
	//-- Todo: a better place for this?
	this.elWidth = this.iframe.clientWidth;
	if(this.elWidth % 2 !== 0){
		this.elWidth -= 1;
	}

	// this.gap = this.gap || Math.ceil(this.elWidth / 8);
	this.gap = Math.ceil(this.elWidth / 8);

	if(this.gap % 2 !== 0){
		this.gap += 1;
	}

	if(this.elWidth < cutoff || !this.book.settings.spreads) {
		this.spread = false; //-- Single Page

		divisor = 1;
		this.colWidth = Math.floor(this.elWidth / divisor);
	}else{
		this.spread = true; //-- Double Page

		this.colWidth = Math.floor((this.elWidth - this.gap) / divisor);
	}

	this.spreadWidth = (this.colWidth + this.gap) * divisor;
	// if(this.bodyEl) this.bodyEl.style.margin = 0;
	// this.bodyEl.style.fontSize = localStorage.getItem("fontSize") || "medium";

	//-- Clear Margins
	if(this.bodyEl) this.bodyEl.style.margin = "0";

	this.docEl.style.overflow = "hidden";

	this.docEl.style.width = this.elWidth + "px";

	//-- Adjust height
	this.docEl.style.height = this.iframe.clientHeight	+ "px";

	//-- Add columns
	this.docEl.style[EPUBJS.Renderer.columnAxis] = "horizontal";
	this.docEl.style[EPUBJS.Renderer.columnGap] = this.gap+"px";
	this.docEl.style[EPUBJS.Renderer.columnWidth] = this.colWidth+"px";

};

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
	this.iframe.scrolling = "yes";

	// this.displayedPages = 1;
};