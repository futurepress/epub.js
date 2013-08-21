EPUBJS.Unarchiver = function(url){
	
	
	this.libPath = EPUBJS.filePath;
	this.zipUrl = url;
	this.loadLib()
	this.urlCache = {};
	
	this.zipFs = new zip.fs.FS();
	
	return this.promise;
	
}

EPUBJS.Unarchiver.prototype.loadLib = function(callback){
	if(typeof(zip) == "undefined") console.error("Zip lib not loaded");
	
	/*
	//-- load script
	EPUBJS.core.loadScript(this.libPath+"zip.js", function(){
		//-- Tell zip where it is located
		zip.workerScriptsPath = this.libPath;
		callback();
	}.bind(this));
	*/
	// console.log(this.libPath)
	zip.workerScriptsPath = this.libPath;
}

EPUBJS.Unarchiver.prototype.openZip = function(zipUrl, callback){ 
	var promise = new RSVP.Promise();
	var zipFs = this.zipFs;
	zipFs.importHttpContent(zipUrl, false, function() {
		promise.resolve(zipFs);
	}, this.failed);
	
	return promise
}

// EPUBJS.Unarchiver.prototype.getXml = function(url){
// 	var unarchiver = this,
// 		request;
// 	return this.getUrl(url, 'application/xml').
// 			then(function(newUrl){
// 				request = EPUBJS.core.request(newUrl, 'xml');
// 				//-- Remove temp url after use
// 				request.then(function(uri){
// 					unarchiver.revokeUrl(uri);
// 				});
// 				return request
// 		  	});
// 		  	
// }
EPUBJS.Unarchiver.prototype.getXml = function(url){
	
	return this.getText(url).
			then(function(text){
				var parser = new DOMParser();
				return parser.parseFromString(text, "application/xml");
		  	});

}

EPUBJS.Unarchiver.prototype.getUrl = function(url, mime){
	var unarchiver = this;
	var promise = new RSVP.Promise();
	var entry = this.zipFs.find(url);	
	var _URL = window.URL || window.webkitURL || window.mozURL; 

	if(!entry) console.error(url);
	
	if(url in this.urlCache) {
		promise.resolve(this.urlCache[url]);
		return promise;
	}

	entry.getBlob(mime || zip.getMimeType(entry.name), function(blob){
		var tempUrl = _URL.createObjectURL(blob);
		promise.resolve(tempUrl);
		unarchiver.urlCache[url] = tempUrl;
	});

	return promise;
}

EPUBJS.Unarchiver.prototype.getText = function(url){
	var unarchiver = this;
	var promise = new RSVP.Promise();
	var entry = this.zipFs.find(url);	
	var _URL = window.URL || window.webkitURL || window.mozURL; 

	if(!entry) console.error(url);


	entry.getText(function(text){
		promise.resolve(text);
	}, null, null, 'ISO-8859-1');

	return promise;
}

EPUBJS.Unarchiver.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = unarchiver.urlCache[url];
	console.log("revoke", fromCache);
	if(fromCache) _URL.revokeObjectURL(fromCache);
}

EPUBJS.Unarchiver.prototype.failed = function(error){ 
	console.error(error);
}

EPUBJS.Unarchiver.prototype.afterSaved = function(error){ 
	this.callback();
}

EPUBJS.Unarchiver.prototype.toStorage = function(entries){
	var timeout = 0,
		delay = 20,
		that = this,
		count = entries.length;

	function callback(){
		count--;
		if(count == 0) that.afterSaved();
	}
		
	entries.forEach(function(entry){
		
		setTimeout(function(entry){
			that.saveEntryFileToStorage(entry, callback);
		}, timeout, entry);
		
		timeout += delay;
	});
	
	console.log("time", timeout);
	
	//entries.forEach(this.saveEntryFileToStorage.bind(this));
}

EPUBJS.Unarchiver.prototype.saveEntryFileToStorage = function(entry, callback){
	var that = this;
	entry.getData(new zip.BlobWriter(), function(blob) {
		EPUBJS.storage.save(entry.filename, blob, callback);
	});
}