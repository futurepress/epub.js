EPUBJS.Renderer.prototype.page = function(pg){
	if(pg >= 1 && pg <= this.displayedPages){
		this.chapterPos = pg;
		this.leftPos = this.spreadWidth * (pg-1); //-- pages start at 1
		this.setLeft(this.leftPos);

		this.currentLocationCfi = this.getPageCfi();

		this.book.trigger("renderer:pageChanged", this.currentLocationCfi);

		// localStorage.setItem("chapterPos", pg);
		return true;
	}
	//-- Return false if page is greater than the total
	return false;
};

EPUBJS.Renderer.prototype.nextPage = function(){
	if(this.chapterPos < this.displayedPages){
		this.chapterPos++;

		this.leftPos += this.spreadWidth;

		this.setLeft(this.leftPos);

		this.currentLocationCfi = this.getPageCfi();

		this.book.trigger("renderer:pageChanged", this.currentLocationCfi);


		return this.chapterPos;
	}else{
		return false;
	}
};

EPUBJS.Renderer.prototype.prevPage = function(){
	if(this.chapterPos > 1){
		this.chapterPos--;

		this.leftPos -= this.spreadWidth;

		this.setLeft(this.leftPos);

		this.currentLocationCfi = this.getPageCfi();

		this.book.trigger("renderer:pageChanged", this.currentLocationCfi);

		return this.chapterPos;
	}else{
		return false;
	}
};

EPUBJS.Renderer.prototype.gotoChapterEnd = function(){
	this.chapterEnd();
};

EPUBJS.Renderer.prototype.chapterEnd = function(){
	this.page(this.displayedPages);
};

//-- Find a section by fragement id
EPUBJS.Renderer.prototype.section = function(fragment){
	var el = this.doc.getElementById(fragment),
		left, pg;

	if(el){
		this.pageByElement(el);
	}

};

//-- Show the page containing an Element
EPUBJS.Renderer.prototype.pageByElement = function(el){
	var left, pg;
	if(!el) return;

	left = this.leftPos + el.getBoundingClientRect().left; //-- Calculate left offset compaired to scrolled position
	pg = Math.floor(left / this.spreadWidth) + 1; //-- pages start at 1
	this.page(pg);

};



EPUBJS.Renderer.prototype.walk = function(node) {
	var r, children, leng,
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
			if (children && children.length) {
				leng = children.length ? children.length : 0;
			} else {
				return r;
			}

			for (var i = 0; i < leng; i++) {
				if(children[i] != prevNode) stack.push(children[i]);
			}

		}


		if(!r && stack.length === 0 && startNode && startNode.parentNode !== null){

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
};


EPUBJS.Renderer.prototype.getPageCfi = function(){
	var prevEl = this.visibileEl;
	this.visibileEl = this.findFirstVisible(prevEl);

	if(!this.visibileEl.id) {
		this.visibileEl.id = "EPUBJS-PAGE-" + this.chapterPos;
	}

	this.pageIds[this.chapterPos] = this.visibileEl.id;


	return this.epubcfi.generateFragment(this.visibileEl, this.currentChapterCfi);

};

EPUBJS.Renderer.prototype.gotoCfiFragment = function(cfi){
	var element;

	if(_.isString(cfi)){
		cfi = this.epubcfi.parse(cfi);
	}

	element = this.epubcfi.getElement(cfi, this.doc);
	this.pageByElement(element);
};

EPUBJS.Renderer.prototype.findFirstVisible = function(startEl){
	var el = startEl || this.bodyEl,
		found;

	found = this.walk(el);

	if(found) {
		return found;
	}else{
		return startEl;
	}

};

EPUBJS.Renderer.prototype.isElementVisible = function(el){
	var rect;

	if(el && typeof el.getBoundingClientRect === 'function'){
		rect = el.getBoundingClientRect();

		if( rect.width != 0 && 
				rect.height != 0 &&
				rect.left >= 0 &&
				rect.left < this.spreadWidth ) {
			return true;
		}
	}

	return false;
};
