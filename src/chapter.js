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
	
	if(store){
		if(!this.tempUrl) {
			this.tempUrl = store.getUrl(this.absolute);
		}
		return this.tempUrl;
	}else{
		deferred.resolve(this.absolute); //-- this is less than ideal but keeps it a promise
		return deferred.promise;
	}

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
	
	if(this.tempUrl && store) {
		store.revokeUrl(this.tempUrl);
		this.tempUrl = false;
	}
};
