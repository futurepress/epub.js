EPUBJS.Unarchiver = function(url){

	this.checkRequirements();
	this.urlCache = {};

};

//-- Load the zip lib and set the workerScriptsPath
EPUBJS.Unarchiver.prototype.checkRequirements = function(callback){
	if(typeof(JSZip) == "undefined") console.error("JSZip lib not loaded");
};

EPUBJS.Unarchiver.prototype.open = function(zipUrl, callback){
	if (zipUrl instanceof ArrayBuffer) {
		this.zip = new JSZip(zipUrl);
		var deferred = new RSVP.defer();
		deferred.resolve();
		return deferred.promise;
	} else {
		return EPUBJS.core.request(zipUrl, "binary").then(function(data){
			this.zip = new JSZip(data);
		}.bind(this));
	}
};

EPUBJS.Unarchiver.prototype.getXml = function(url, encoding){
	var decodededUrl = window.decodeURIComponent(url);
	return this.getText(decodededUrl, encoding).
			then(function(text){
				var parser = new DOMParser();
				var mimeType = EPUBJS.core.getMimeType(url);
				return parser.parseFromString(text, mimeType);
			});

};

EPUBJS.Unarchiver.prototype.getUrl = function(url, mime){
	var unarchiver = this;
	var deferred = new RSVP.defer();
	var decodededUrl = window.decodeURIComponent(url);
	var entry = this.zip.file(decodededUrl);
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var tempUrl;
	var blob;

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

	blob = new Blob([entry.asUint8Array()], {type : EPUBJS.core.getMimeType(entry.name)});

	tempUrl = _URL.createObjectURL(blob);
	deferred.resolve(tempUrl);
	unarchiver.urlCache[url] = tempUrl;

	return deferred.promise;
};

EPUBJS.Unarchiver.prototype.getText = function(url, encoding){
	var unarchiver = this;
	var deferred = new RSVP.defer();
	var decodededUrl = window.decodeURIComponent(url);
	var entry = this.zip.file(decodededUrl);
	var text;

	if(!entry) {
		deferred.reject({
			message : "File not found in the epub: " + url,
			stack : new Error().stack
		});
		return deferred.promise;
	}

	text = entry.asText();
	deferred.resolve(text);

	return deferred.promise;
};

EPUBJS.Unarchiver.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = this.urlCache[url];
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

// EPUBJS.Unarchiver.prototype.saveEntryFileToStorage = function(entry, callback){
// 	var that = this;
// 	entry.getData(new zip.BlobWriter(), function(blob) {
// 		EPUBJS.storage.save(entry.filename, blob, callback);
// 	});
// };
