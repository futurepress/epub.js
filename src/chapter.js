EPUBJS.Chapter = function(spineObject){
	this.href = spineObject.href;
	this.id = spineObject.id;
	this.spinePos = spineObject.index;
	this.properties = spineObject.properties;
	this.linear = spineObject.linear;
	this.pages = 1;
}


EPUBJS.Chapter.prototype.contents = function(store){	
	// if(this.store && (!this.book.online || this.book.contained))
	if(store){
		return store.get(href);
	}else{
		return EPUBJS.core.request(href, 'xml');
	}

}

EPUBJS.Chapter.prototype.url = function(store){
	var promise = new RSVP.Promise();
	
	if(store){
		return store.getUrl(href);
	}else{
		promise.resolve(this.href); //-- this is less than ideal but keeps it a promise
		return promise;
	}

}

EPUBJS.Chapter.prototype.setPages = function(num){
	this.pages = num;
}

EPUBJS.Chapter.prototype.getPages = function(num){
	return this.pages;
}

EPUBJS.Chapter.prototype.getID = function(){
	return this.ID;
}