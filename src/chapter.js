EPUBJS.Chapter = function(spineObject, store){
	this.href = spineObject.href;
	this.absolute = spineObject.url;
	this.id = spineObject.id;
	this.spinePos = spineObject.index;
	this.cfiBase = spineObject.cfiBase;
	this.properties = spineObject.properties;
	this.manifestProperties = spineObject.manifestProperties;
	this.linear = spineObject.linear;
	this.pages = 1;
	this.store = store;
	this.epubcfi = new EPUBJS.EpubCFI();
};


EPUBJS.Chapter.prototype.contents = function(_store){
	var store = _store || this.store;
	// if(this.store && (!this.book.online || this.book.contained))
	if(store){
		return store.get(href);
	}else{
		return EPUBJS.core.request(href, 'xml');
	}

};

EPUBJS.Chapter.prototype.url = function(_store){
	var deferred = new RSVP.defer();
	var store = _store || this.store;
	var loaded;
	var chapter = this;
	var url;
	
	if(store){
		if(!this.tempUrl) {
			store.getUrl(this.absolute).then(function(url){
				chapter.tempUrl = url;
				deferred.resolve(url);
			});
		} else {
			url = this.tempUrl;
			deferred.resolve(url);
		}
	}else{
		url = this.absolute;
		deferred.resolve(url);
	}
	/*
	loaded = EPUBJS.core.request(url, 'xml', false);
	loaded.then(function(contents){
		chapter.contents = contents;
		deferred.resolve(chapter.absolute);
	}, function(error){
		deferred.reject(error);
	});
	*/
	
	return deferred.promise;
};

EPUBJS.Chapter.prototype.setPages = function(num){
	this.pages = num;
};

EPUBJS.Chapter.prototype.getPages = function(num){
	return this.pages;
};

EPUBJS.Chapter.prototype.getID = function(){
	return this.ID;
};

EPUBJS.Chapter.prototype.unload = function(store){
	this.contents = null;
	if(this.tempUrl && store) {
		store.revokeUrl(this.tempUrl);
		this.tempUrl = false;
	}
};

EPUBJS.Chapter.prototype.cfiFromRange = function(_range) {
	var range;
	var startXpath, endXpath;
	var startContainer, endContainer;
	var cleanTextContent, cleanEndTextContent;
	
	// Check for Contents
	if(!this.contents) return;
	startXpath = EPUBJS.core.getElementXPath(_range.startContainer);
	// console.log(startContainer)
	endXpath = EPUBJS.core.getElementXPath(_range.endContainer);
	startContainer = this.contents.evaluate(startXpath, this.contents, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	
	if(!_range.collapsed) {
		endContainer = this.contents.evaluate(endXpath, this.contents, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	}
	
	range = this.contents.createRange();
	// Find Exact Range in original document
	if(startContainer) {
		try {
			range.setStart(startContainer, _range.startOffset);
			if(!_range.collapsed && endContainer) {
				range.setEnd(endContainer, _range.endOffset);
			}
		} catch (e) {
			console.log("missed");
			startContainer = false;
		}
		
	}

	// Fuzzy Match
	if(!startContainer) {
		console.log("not found, try fuzzy match");
		cleanStartTextContent = EPUBJS.core.cleanStringForXpath(_range.startContainer.textContent);
		startXpath = "//text()[contains(.," + cleanStartTextContent + ")]";
		
		startContainer = this.contents.evaluate(startXpath, this.contents, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		if(startContainer){
			// console.log("Found with Fuzzy");
			range.setStart(startContainer, _range.startOffset);

			if(!_range.collapsed) {
				cleanEndTextContent = EPUBJS.core.cleanStringForXpath(_range.endContainer.textContent);
				endXpath = "//text()[contains(.," + cleanEndTextContent + ")]";
				endContainer = this.contents.evaluate(endXpath, this.contents, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
				if(endContainer) {
					range.setEnd(endContainer, _range.endOffset);
				}
			}

		}
	}
	
	// Generate the Cfi 
	return this.epubcfi.generateCfiFromRange(range, this.cfiBase);
};
