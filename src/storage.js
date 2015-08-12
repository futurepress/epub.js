EPUBJS.Storage = function(withCredentials){

	this.checkRequirements();
	this.urlCache = {};
	this.withCredentials = withCredentials;
	this.URL = window.URL || window.webkitURL || window.mozURL;
	this.offline = false;
};

//-- Load the zip lib and set the workerScriptsPath
EPUBJS.Storage.prototype.checkRequirements = function(callback){
	if(typeof(localforage) == "undefined") console.error("localForage library not loaded");
};

EPUBJS.Storage.prototype.put = function(assets, store) {
	var deferred = new RSVP.defer();
	var count = assets.length;
	var current = 0;
	var next = function(deferred){
		var done = deferred || new RSVP.defer();
		var url;
		var encodedUrl;

		if(current >= count) {
			done.resolve();
		} else {
			url = assets[current].url;
			encodedUrl = window.encodeURIComponent(url);

			EPUBJS.core.request(url, "binary")
			.then(function (data) {
				return localforage.setItem(encodedUrl, data);
			})
			.then(function(data){
				current++;
        // Load up the next
				setTimeout(function(){
					next(done);
				}, 1);

      });
		}
		return done.promise;
	}.bind(this);

	if(!Array.isArray(assets)) {
		assets = [assets];
	}

	next().then(function(){
		deferred.resolve();
	}.bind(this));

	return deferred.promise;
};

EPUBJS.Storage.prototype.token = function(url, value){
	var encodedUrl = window.encodeURIComponent(url);
	return localforage.setItem(encodedUrl, value)
		.then(function (result) {
			if (result === null) {
				return false;
			} else {
				return true;
			}
		});
};

EPUBJS.Storage.prototype.isStored = function(url){
	var encodedUrl = window.encodeURIComponent(url);
	return localforage.getItem(encodedUrl)
		.then(function (result) {
			if (result === null) {
				return false;
			} else {
				return true;
			}
		});
};

EPUBJS.Storage.prototype.getText = function(url){
	var encodedUrl = window.encodeURIComponent(url);

	return EPUBJS.core.request(url, 'arraybuffer', this.withCredentials)
		.then(function(buffer){

			if(this.offline){
				this.offline = false;
				this.trigger("offline", false);
			}
			localforage.setItem(encodedUrl, buffer);
			return buffer;
		}.bind(this))
		.then(function(data) {
			var deferred = new RSVP.defer();
			var mimeType = EPUBJS.core.getMimeType(url);
			var blob = new Blob([data], {type : mimeType});
			var reader = new FileReader();
			reader.addEventListener("loadend", function() {
				deferred.resolve(reader.result);
			});
			reader.readAsText(blob, mimeType);
			return deferred.promise;
		})
		.catch(function() {

			var deferred = new RSVP.defer();
			var entry = localforage.getItem(encodedUrl);

			if(!this.offline){
				this.offline = true;
				this.trigger("offline", true);
			}

			if(!entry) {
				deferred.reject({
					message : "File not found in the storage: " + url,
					stack : new Error().stack
				});
				return deferred.promise;
			}

			entry.then(function(data) {
				var mimeType = EPUBJS.core.getMimeType(url);
				var blob = new Blob([data], {type : mimeType});
				var reader = new FileReader();
				reader.addEventListener("loadend", function() {
					deferred.resolve(reader.result);
				});
				reader.readAsText(blob, mimeType);
			});

			return deferred.promise;
		}.bind(this));
};

EPUBJS.Storage.prototype.getUrl = function(url){
	var encodedUrl = window.encodeURIComponent(url);

	return EPUBJS.core.request(url, 'arraybuffer', this.withCredentials)
		.then(function(buffer){
			if(this.offline){
				this.offline = false;
				this.trigger("offline", false);
			}
			localforage.setItem(encodedUrl, buffer);
			return url;
		}.bind(this))
		.catch(function() {
			var deferred = new RSVP.defer();
			var entry;
			var _URL = window.URL || window.webkitURL || window.mozURL;
			var tempUrl;

			if(!this.offline){
				this.offline = true;
				this.trigger("offline", true);
			}

			if(encodedUrl in this.urlCache) {
				deferred.resolve(this.urlCache[encodedUrl]);
				return deferred.promise;
			}

			entry = localforage.getItem(encodedUrl);

			if(!entry) {
				deferred.reject({
					message : "File not found in the storage: " + url,
					stack : new Error().stack
				});
				return deferred.promise;
			}

			entry.then(function(data) {
				var blob = new Blob([data], {type : EPUBJS.core.getMimeType(url)});
				tempUrl = _URL.createObjectURL(blob);
				deferred.resolve(tempUrl);
				this.urlCache[encodedUrl] = tempUrl;
			}.bind(this));


			return deferred.promise;
	}.bind(this));
};

EPUBJS.Storage.prototype.getXml = function(url){
	var encodedUrl = window.encodeURIComponent(url);

	return EPUBJS.core.request(url, 'arraybuffer', this.withCredentials)
		.then(function(buffer){
			if(this.offline){
				this.offline = false;
				this.trigger("offline", false);
			}
			localforage.setItem(encodedUrl, buffer);
			return buffer;
		}.bind(this))
		.then(function(data) {
			var deferred = new RSVP.defer();
			var mimeType = EPUBJS.core.getMimeType(url);
			var blob = new Blob([data], {type : mimeType});
			var reader = new FileReader();
			reader.addEventListener("loadend", function() {
				var parser = new DOMParser();
				var doc = parser.parseFromString(reader.result, "text/xml");
				deferred.resolve(doc);
			});
			reader.readAsText(blob, mimeType);
			return deferred.promise;
		})
		.catch(function() {
			var deferred = new RSVP.defer();
			var entry = localforage.getItem(encodedUrl);

			if(!this.offline){
				this.offline = true;
				this.trigger("offline", true);
			}

			if(!entry) {
				deferred.reject({
					message : "File not found in the storage: " + url,
					stack : new Error().stack
				});
				return deferred.promise;
			}

			entry.then(function(data) {
				var mimeType = EPUBJS.core.getMimeType(url);
				var blob = new Blob([data], {type : mimeType});
				var reader = new FileReader();
				reader.addEventListener("loadend", function() {
					var parser = new DOMParser();
					var doc = parser.parseFromString(reader.result, "text/xml");
					deferred.resolve(doc);
				});
				reader.readAsText(blob, mimeType);
			});

			return deferred.promise;
		}.bind(this));
};

EPUBJS.Storage.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = this.urlCache[url];
	if(fromCache) _URL.revokeObjectURL(fromCache);
};

EPUBJS.Storage.prototype.failed = function(error){
	console.error(error);
};

RSVP.EventTarget.mixin(EPUBJS.Storage.prototype);
