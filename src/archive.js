var core = require('./core');
var request = require('./request');
var mime = require('../libs/mime/mime');
var Path = require('./core').Path;

/**
 * Handles Unzipping a requesting files from an Epub Archive
 * @class
 */
function Archive() {
	this.zip = undefined;
	this.checkRequirements();
	this.urlCache = {};
}

/**
 * Checks to see if JSZip exists in global namspace,
 * Requires JSZip if it isn't there
 * @private
 */
Archive.prototype.checkRequirements = function(){
	try {
		if (typeof JSZip === 'undefined') {
			JSZip = require('jszip');
		}
		this.zip = new JSZip();
	} catch (e) {
		console.error("JSZip lib not loaded");
	}
};

/**
 * Open an archive
 * @param  {binary} input
 * @param  {boolean} isBase64 tells JSZip if the input data is base64 encoded
 * @return {Promise} zipfile
 */
Archive.prototype.open = function(input, isBase64){
	return this.zip.loadAsync(input, {"base64": isBase64});
};

/**
 * Load and Open an archive
 * @param  {string} zipUrl
 * @param  {boolean} isBase64 tells JSZip if the input data is base64 encoded
 * @return {Promise} zipfile
 */
Archive.prototype.openUrl = function(zipUrl, isBase64){
	return request(zipUrl, "binary")
		.then(function(data){
			return this.zip.loadAsync(data, {"base64": isBase64});
		}.bind(this));
};

/**
 * Request
 * @param  {string} url  a url to request from the archive
 * @param  {[string]} type specify the type of the returned result
 * @return {Promise}
 */
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

/**
 * Handle the response from request
 * @private
 * @param  {any} response
 * @param  {[string]} type
 * @return {any} the parsed result
 */
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

/**
 * Get a Blob from Archive by Url
 * @param  {string} url
 * @param  {[string]} mimeType
 * @return {Blob}
 */
Archive.prototype.getBlob = function(url, mimeType){
	var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
	var entry = this.zip.file(decodededUrl);

	if(entry) {
		mimeType = mimeType || mime.lookup(entry.name);
		return entry.async("uint8array").then(function(uint8array) {
			return new Blob([uint8array], {type : mimeType});
		});
	}
};

/**
 * Get Text from Archive by Url
 * @param  {string} url
 * @param  {[string]} encoding
 * @return {string}
 */
Archive.prototype.getText = function(url, encoding){
	var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
	var entry = this.zip.file(decodededUrl);

	if(entry) {
		return entry.async("string").then(function(text) {
			return text;
		});
	}
};

/**
 * Get a base64 encoded result from Archive by Url
 * @param  {string} url
 * @param  {[string]} mimeType
 * @return {string} base64 encoded
 */
Archive.prototype.getBase64 = function(url, mimeType){
	var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
	var entry = this.zip.file(decodededUrl);

	if(entry) {
		mimeType = mimeType || mime.lookup(entry.name);
		return entry.async("base64").then(function(data) {
			return "data:" + mimeType + ";base64," + data;
		});
	}
};

/**
 * Create a Url from an unarchived item
 * @param  {string} url
 * @param  {[object]} options.base64 use base64 encoding or blob url
 * @return {Promise} url promise with Url string
 */
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

/**
 * Revoke Temp Url for a achive item
 * @param  {string} url url of the item in the archive
 */
Archive.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = this.urlCache[url];
	if(fromCache) _URL.revokeObjectURL(fromCache);
};

module.exports = Archive;
