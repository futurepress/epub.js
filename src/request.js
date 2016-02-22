var RSVP = require('rsvp');
var URI = require('urijs');
var core = require('./core');

function request(url, type, withCredentials, headers) {
  var supportsURL = (typeof window != "undefined") ? window.URL : false; // TODO: fallback for url if window isn't defined
  var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";
  var uri;

  var deferred = new RSVP.defer();

  var xhr = new XMLHttpRequest();

  //-- Check from PDF.js:
  //   https://github.com/mozilla/pdf.js/blob/master/web/compatibility.js
  var xhrPrototype = XMLHttpRequest.prototype;

  var header;

  if (!('overrideMimeType' in xhrPrototype)) {
    // IE10 might have response, but not overrideMimeType
    Object.defineProperty(xhrPrototype, 'overrideMimeType', {
      value: function xmlHttpRequestOverrideMimeType(mimeType) {}
    });
  }
  if(withCredentials) {
    xhr.withCredentials = true;
  }

  xhr.onreadystatechange = handler;
  xhr.onerror = err;

  xhr.open("GET", url, true);

  for(header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }

  if(type == "json") {
    xhr.setRequestHeader("Accept", "application/json");
  }

  // If type isn't set, determine it from the file extension
	if(!type) {
		uri = URI(url);
		type = uri.suffix();
	}

  if(type == 'blob'){
    xhr.responseType = BLOB_RESPONSE;
  }


  if(core.isXml(type)) {
		xhr.responseType = "document";
		xhr.overrideMimeType('text/xml'); // for OPF parsing
	}

	if(type == 'xhtml') {
		xhr.responseType = "document";
	}

	if(type == 'html' || type == 'htm') {
		xhr.responseType = "document";
 	}

  if(type == "binary") {
    xhr.responseType = "arraybuffer";
  }

  xhr.send();

  function err(e) {
    console.error(e);
    deferred.reject(e);
  }

  function handler() {
    if (this.readyState === XMLHttpRequest.DONE) {

      if (this.status === 200 || this.responseXML ) { //-- Firefox is reporting 0 for blob urls
        var r;

        if (!this.response && !this.responseXML) {
          deferred.reject({
            status: this.status,
            message : "Empty Response",
            stack : new Error().stack
          });
          return deferred.promise;
        }

        if((this.responseType == '' || this.responseType == 'document')
            && this.responseXML){
          r = this.responseXML;
        } else
        if(core.isXml(type)){
          // xhr.overrideMimeType('text/xml'); // for OPF parsing
          // If this.responseXML wasn't set, try to parse using a DOMParser from text
          r = new DOMParser().parseFromString(this.response, "text/xml");
        }else
        if(type == 'xhtml'){
          console.log(this.response);
          r = new DOMParser().parseFromString(this.response, "application/xhtml+xml");
        }else
        if(type == 'html' || type == 'htm'){
          r = new DOMParser().parseFromString(this.response, "text/html");
        }else
        if(type == 'json'){
          r = JSON.parse(this.response);
        }else
        if(type == 'blob'){

          if(supportsURL) {
            r = this.response;
          } else {
            //-- Safari doesn't support responseType blob, so create a blob from arraybuffer
            r = new Blob([this.response]);
          }

        }else{
          r = this.response;
        }

        deferred.resolve(r);
      } else {

        deferred.reject({
          status: this.status,
          message : this.response,
          stack : new Error().stack
        });

      }
    }
  }

  return deferred.promise;
};

module.exports = request;
