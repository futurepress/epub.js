EPUBJS.Unarchiver = function(url){
	
	this.libPath = EPUBJS.filePath;
	this.zipUrl = url;
	this.loadLib();
	this.urlCache = {};
	
	this.zipFs = new zip.fs.FS();
	
	return this.promise;
	
};

//-- Load the zip lib and set the workerScriptsPath
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
};

EPUBJS.Unarchiver.prototype.openZip = function(zipUrl, callback){
	var deferred = new RSVP.defer();
	var zipFs = this.zipFs;
	zipFs.importHttpContent(zipUrl, false, function() {
		deferred.resolve(zipFs);
	}, this.failed);
	
	return deferred.promise;
};

EPUBJS.Unarchiver.prototype.getXml = function(url, encoding){
	
	return this.getText(url, encoding).
			then(function(text){
				var parser = new DOMParser();
				return parser.parseFromString(text, "application/xml");
			});

};

EPUBJS.Unarchiver.prototype.getUrl = function(url, mime){
	var unarchiver = this;
	var deferred = new RSVP.defer();
	var decodededUrl = window.decodeURIComponent(url);
	var entry = this.zipFs.find(decodededUrl);
	var _URL = window.URL || window.webkitURL || window.mozURL;
	
	if(!entry) {
		deferred.reject({
			message : "File not found in the epub: " + url,
			stack : new Error().stack
		});
		return deferred.promise;
	}
	
	if(url in this.urlCache) {
		deferred.resolve(this.urlCache[url]);
		return deferred.promise;
	}

	entry.getBlob(mime || zip.getMimeType(entry.name), function(blob){
		var tempUrl = _URL.createObjectURL(blob);
		deferred.resolve(tempUrl);
		unarchiver.urlCache[url] = tempUrl;
	});

	return deferred.promise;
};

EPUBJS.Unarchiver.prototype.getText = function(url, encoding){
	var unarchiver = this;
	var deferred = new RSVP.defer();
	var decodededUrl = window.decodeURIComponent(url);
	var entry = this.zipFs.find(decodededUrl);
	var _URL = window.URL || window.webkitURL || window.mozURL;

	if(!entry) {
		console.warn("File not found in the contained epub:", url);
		return deferred.promise;
	}

	entry.getText(function(text){
		deferred.resolve(text);
	}, null, null, encoding || 'UTF-8');

	return deferred.promise;
};

EPUBJS.Unarchiver.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = unarchiver.urlCache[url];
	if(fromCache) _URL.revokeObjectURL(fromCache);
};

EPUBJS.Unarchiver.prototype.failed = function(error){
	console.error(error);
};

EPUBJS.Unarchiver.prototype.afterSaved = function(error){
	this.callback();
};

EPUBJS.Unarchiver.prototype.toStorage = function(entries){
	var timeout = 0,
		delay = 20,
		that = this,
		count = entries.length;

	function callback(){
		count--;
		if(count === 0) that.afterSaved();
	}
		
	entries.forEach(function(entry){
		
		setTimeout(function(entry){
			that.saveEntryFileToStorage(entry, callback);
		}, timeout, entry);
		
		timeout += delay;
	});
	
	console.log("time", timeout);
	
	//entries.forEach(this.saveEntryFileToStorage.bind(this));
};

EPUBJS.Unarchiver.prototype.saveEntryFileToStorage = function(entry, callback){
	var that = this;
	entry.getData(new zip.BlobWriter(), function(blob) {
		EPUBJS.storage.save(entry.filename, blob, callback);
	});
};
