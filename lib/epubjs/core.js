EPUBJS.core = {};

EPUBJS.core.request = function(url, type, withCredentials) {
  var supportsURL = window.URL;
  var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";

  var deferred = new RSVP.defer();

  var xhr = new XMLHttpRequest();

  //-- Check from PDF.js: 
  //   https://github.com/mozilla/pdf.js/blob/master/web/compatibility.js
  var xhrPrototype = XMLHttpRequest.prototype;
  
  if (!('overrideMimeType' in xhrPrototype)) {
    // IE10 might have response, but not overrideMimeType
    Object.defineProperty(xhrPrototype, 'overrideMimeType', {
      value: function xmlHttpRequestOverrideMimeType(mimeType) {}
    });
  }
  if(withCredentials) {
    xhr.withCredentials = true;
  }
  xhr.open("GET", url, true);
  xhr.onreadystatechange = handler;
  
  if(type == 'blob'){
    xhr.responseType = BLOB_RESPONSE;
  }
  
  if(type == "json") {
    xhr.setRequestHeader("Accept", "application/json");
  }
  
  if(type == 'xml') {
    xhr.overrideMimeType('text/xml');
  }
  
  xhr.send();
  
  function handler() {
    if (this.readyState === this.DONE) {
      if (this.status === 200 || this.responseXML ) { //-- Firefox is reporting 0 for blob urls
        var r;
        
        if(type == 'xml'){
          r = this.responseXML;
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
          message : this.response,
          stack : new Error().stack
        });
      }
    }
  }

  return deferred.promise;
};

//-- Parse the different parts of a url, returning a object
EPUBJS.core.uri = function(url){
  var uri = {
        protocol : '',
        host : '',
        path : '',
        origin : '',
        directory : '',
        base : '',
        filename : '',
        extension : '',
        fragment : '',
        href : url
      },
      doubleSlash = url.indexOf('://'),
      search = url.indexOf('?'),
      fragment = url.indexOf("#"),
      withoutProtocol,
      dot,
      firstSlash;

  if(fragment != -1) {
    uri.fragment = url.slice(fragment + 1);
    url = url.slice(0, fragment);
  }

  if(search != -1) {
    uri.search = url.slice(search + 1);
    url = url.slice(0, search);
    href = url;
  }
  
  if(doubleSlash != -1) {
    uri.protocol = url.slice(0, doubleSlash);
    withoutProtocol = url.slice(doubleSlash+3);
    firstSlash = withoutProtocol.indexOf('/');
    
    if(firstSlash === -1) {
      uri.host = uri.path;
      uri.path = "";
    } else {
      uri.host = withoutProtocol.slice(0, firstSlash);
      uri.path = withoutProtocol.slice(firstSlash);
    }
    
    
    uri.origin = uri.protocol + "://" + uri.host;
    
    uri.directory = EPUBJS.core.folder(uri.path);
    
    uri.base = uri.origin + uri.directory;
    // return origin;
  } else {
    uri.path = url;
    uri.directory = EPUBJS.core.folder(url);
    uri.base = uri.directory;
  }
  
  //-- Filename
  uri.filename = url.replace(uri.base, '');
  dot = uri.filename.lastIndexOf('.');
  if(dot != -1) {
    uri.extension = uri.filename.slice(dot+1);
  }
  return uri;
};

//-- Parse out the folder, will return everything before the last slash
EPUBJS.core.folder = function(url){
  
  var lastSlash = url.lastIndexOf('/');
  
  if(lastSlash == -1) var folder = '';
    
  folder = url.slice(0, lastSlash + 1);
  
  return folder;

};