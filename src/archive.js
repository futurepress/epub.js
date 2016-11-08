var core = require('./core');
var request = require('./request');
var mime = require('../libs/mime/mime');
var Path = require('./core').Path;

function Archive() {

	this.checkRequirements();
	this.urlCache = {};

}

Archive.prototype.checkRequirements = function(callback){
	try {
		if (typeof JSZip === 'undefined') {
			JSZip = require('jszip');
		}
		this.zip = new JSZip();
	} catch (e) {
		console.error("JSZip lib not loaded");
	}
};

Archive.prototype.open = function(input, isBase64){
	return this.zip.loadAsync(input, {"base64": isBase64});
};

Archive.prototype.openUrl = function(zipUrl, isBase64){
	return request(zipUrl, "binary")
		.then(function(data){
			return this.zip.loadAsync(data, {"base64": isBase64});
		}.bind(this));
};

Archive.prototype.request = function(url, type){
	var deferred = new core.defer();
	var response;
	var r;
	var path = new Path(url);

	// If type isn't set, determine it from the file extension
	if(!type) {
		type = path.extension;
	}

	if(type == 'blob'){
		response = this.getBlob(url);
	} else {
		response = this.getText(url);
	}

	if (response) {
		response.then(function (r) {
			result = this.handleResponse(r, type);
			deferred.resolve(result);
		}.bind(this));
	} else {
		deferred.reject({
			message : "File not found in the epub: " + url,
			stack : new Error().stack
		});
	}
	return deferred.promise;
};

Archive.prototype.handleResponse = function(response, type){
	var r;

	if(type == "json") {
		r = JSON.parse(response);
	}
	else
	if(core.isXml(type)) {
		r = core.parse(response, "text/xml");
	}
	else
	if(type == 'xhtml') {
		r = core.parse(response, "application/xhtml+xml");
	}
	else
	if(type == 'html' || type == 'htm') {
		r = core.parse(response, "text/html");
	 } else {
		 r = response;
	 }

	return r;
};

Archive.prototype.getBlob = function(url, _mimeType){
	var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
	var entry = this.zip.file(decodededUrl);
	var mimeType;

	if(entry) {
		mimeType = _mimeType || mime.lookup(entry.name);
		return entry.async("uint8array").then(function(uint8array) {
			return new Blob([uint8array], {type : mimeType});
		});
	}
};

Archive.prototype.getText = function(url, encoding){
	var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
	var entry = this.zip.file(decodededUrl);

	if(entry) {
		return entry.async("string").then(function(text) {
			return text;
		});
	}
};

Archive.prototype.getBase64 = function(url, _mimeType){
	var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
	var entry = this.zip.file(decodededUrl);
	var mimeType;

	if(entry) {
		mimeType = _mimeType || mime.lookup(entry.name);
		return entry.async("base64").then(function(data) {
			return "data:" + mimeType + ";base64," + data;
		});
	}
};

Archive.prototype.createUrl = function(url, options){
	var deferred = new core.defer();
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var tempUrl;
	var blob;
	var response;
	var useBase64 = options && options.base64;

	if(url in this.urlCache) {
		deferred.resolve(this.urlCache[url]);
		return deferred.promise;
	}

	if (useBase64) {
		response = this.getBase64(url);

		if (response) {
			response.then(function(tempUrl) {

				this.urlCache[url] = tempUrl;
				deferred.resolve(tempUrl);

			}.bind(this));

		}

	} else {

		response = this.getBlob(url);

		if (response) {
			response.then(function(blob) {

				tempUrl = _URL.createObjectURL(blob);
				this.urlCache[url] = tempUrl;
				deferred.resolve(tempUrl);

			}.bind(this));

		}
	}


	if (!response) {
		deferred.reject({
			message : "File not found in the epub: " + url,
			stack : new Error().stack
		});
	}

	return deferred.promise;
};

Archive.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = this.urlCache[url];
	if(fromCache) _URL.revokeObjectURL(fromCache);
};

module.exports = Archive;
