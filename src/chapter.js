EPUBJS.Chapter = function(spineObject){
	this.href = spineObject.href;
	this.id = spineObject.id;
	this.spinePos = spineObject.index;
	this.properties = spineObject.properties;
	this.linear = spineObject.linear;
	this.pages = 1;
};


EPUBJS.Chapter.prototype.contents = function(store){
	// if(this.store && (!this.book.online || this.book.contained))
	if(store){
		return store.get(href);
	}else{
		return EPUBJS.core.request(href, 'xml');
	}

};

EPUBJS.Chapter.prototype.url = function(store){
	var deferred = new RSVP.defer();

	if(store){
		if(!this.tempUrl) {
			this.tempUrl = store.getUrl(this.href);
		}
		return this.tempUrl;
	}else{
		deferred.resolve(this.href); //-- this is less than ideal but keeps it a promise
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
