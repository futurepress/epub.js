EPUBJS.Pagination = function(pageList) {
	this.pageList = pageList;
	this.pages = [];
	this.locations = [];
	
	this.epubcfi = new EPUBJS.EpubCFI();
};

EPUBJS.Pagination.prototype.process = function(pageList){
	pageList.forEach(function(item){
		this.pages.push(item.page);
		this.locations.push(item.cfi);
	}, this);

	this.firstPage = parseInt(this.pages[0]);
	this.lastPage = parseInt(this.pages[this.pages.length-1]);
	this.totalPages = this.lastPage - this.firstPage;
};

EPUBJS.Pagination.prototype.pageFromCfi = function(cfi){
	var pg;
	// check if the cfi is in the location list
	var index = this.locations.indexOf(cfi);
	if(index != -1 && index < (this.pages.length-1) ) {
		pg = this.pages[index];
	} else {
		// Otherwise add it to the list of locations
		// Insert it in the correct position in the locations page
		index = EPUBJS.core.insert(cfi, this.locations, this.epubcfi.compare);
		// Get the page at the location just before the new one
		pg = this.pages[index-1];
		// Add the new page in so that the locations and page array match up
		this.pages.splice(index, 0, pg);
	}

	return pg;
};

EPUBJS.Pagination.prototype.cfiFromPage = function(pg){
	var cfi;
	// check if the cfi is in the page list
	var index = this.pages.indexOf(pg);
	if(index != -1) {
		cfi = this.locations[index];
	}
	// TODO: handle pages not in the list
	return cfi;
};

EPUBJS.Pagination.prototype.pageFromPercentage = function(percent){
	var pg = Math.round(this.totalPages * percent);
	return pg;
};

// Returns a value between 0 - 1 corresponding to the location of a page
EPUBJS.Pagination.prototype.percentageFromPage = function(pg){
	var percentage = (pg - this.firstPage) / this.totalPages;
	return Math.round(percentage * 1000) / 1000;
};

// Returns a value between 0 - 1 corresponding to the location of a cfi
EPUBJS.Pagination.prototype.percentageFromCfi = function(cfi){
	var pg = this.pageFromCfi(cfi);
	var percentage = this.percentageFromPage(pg);
	return percentage;
};

// TODO: move these
EPUBJS.Book.prototype.gotoPage = function(pg){
	var cfi = this.pagination.cfiFromPage(pg);
	this.gotoCfi(cfi);
};

EPUBJS.Book.prototype.gotoPercentage = function(percent){
	var pg = this.pagination.pageFromPercentage(percent);
	this.gotoCfi(pg);
};
