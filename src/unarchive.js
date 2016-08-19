var RSVP = require('rsvp');
var URI = require('urijs');
var core = require('./core');
var request = require('./request');
var mime = require('../libs/mime/mime');

function Unarchive() {

  this.checkRequirements();
  this.urlCache = {};

}

Unarchive.prototype.checkRequirements = function(callback){
  try {
    if (typeof JSZip !== 'undefined') {
      this.zip = new JSZip();
    } else {
      JSZip = require('jszip');
      this.zip = new JSZip();
    }
  } catch (e) {
    console.error("JSZip lib not loaded");
  }
};

Unarchive.prototype.open = function(zipUrl, isBase64){
	if (zipUrl instanceof ArrayBuffer || isBase64) {
    return this.zip.loadAsync(zipUrl, {"base64": isBase64});
	} else {
		return request(zipUrl, "binary")
      .then(function(data){
        return this.zip.loadAsync(data);
		  }.bind(this));
	}
};

Unarchive.prototype.request = function(url, type){
  var deferred = new RSVP.defer();
  var response;
  var r;

  // If type isn't set, determine it from the file extension
	if(!type) {
		uri = URI(url);
		type = uri.suffix();
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

Unarchive.prototype.handleResponse = function(response, type){
  var r;

  if(type == "json") {
    r = JSON.parse(response);
  }
  else
  if(core.isXml(type)) {
    r = new DOMParser().parseFromString(response, "text/xml");
	}
  else
	if(type == 'xhtml') {
    r = new DOMParser().parseFromString(response, "application/xhtml+xml");
	}
  else
	if(type == 'html' || type == 'htm') {
    r = new DOMParser().parseFromString(response, "text/html");
 	} else {
 	  r = response;
 	}

  return r;
};

Unarchive.prototype.getBlob = function(url, _mimeType){
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

Unarchive.prototype.getText = function(url, encoding){
	var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
	var entry = this.zip.file(decodededUrl);

	if(entry) {
    return entry.async("string").then(function(text) {
      return text;
    });
	}
};

Unarchive.prototype.createUrl = function(url, mime){
	var deferred = new RSVP.defer();
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var tempUrl;
  var blob;
	var response;

	if(url in this.urlCache) {
		deferred.resolve(this.urlCache[url]);
		return deferred.promise;
	}

	response = this.getBlob(url);

  if (response) {
    response.then(function(blob) {
      tempUrl = _URL.createObjectURL(blob);
      deferred.resolve(tempUrl);
      this.urlCache[url] = tempUrl;
    }.bind(this));
  } else {
    deferred.reject({
      message : "File not found in the epub: " + url,
      stack : new Error().stack
    });
  }

	return deferred.promise;
};

Unarchive.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = this.urlCache[url];
	if(fromCache) _URL.revokeObjectURL(fromCache);
};

module.exports = Unarchive;
