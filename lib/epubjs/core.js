EPUBJS.core = {};

EPUBJS.core.request = function(url, type, withCredentials, headers) {
  var supportsURL = window.URL;
  var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";

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

  xhr.open("GET", url, true);

  for(header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }

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
          
          // If this.responseXML wasn't set, try to parse using a DOMParser from text
          if(!this.responseXML){
            r = new DOMParser().parseFromString(this.response, "text/xml");
          } else {
            r = this.responseXML;
          }
          
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


EPUBJS.core.queue = function(_scope){
  var _q = [];
  var scope = _scope;
  // Add an item to the queue
  var enqueue = function(funcName, args, context) {
    _q.push({
      "funcName" : funcName,
      "args"     : args,
      "context"  : context
    });
    return _q;
  };
  // Run one item
  var dequeue = function(){
    var inwait;
    if(_q.length) {
      inwait = _q.shift();
      // Defer to any current tasks
      // setTimeout(function(){
      scope[inwait.funcName].apply(inwait.context || scope, inwait.args);
      // }, 0);
    }
  };
  
  // Run All
  var flush = function(){
    while(_q.length) {
      dequeue();
    }
  };
  // Clear all items in wait
  var clear = function(){
    _q = [];
  };
  
  var length = function(){
    return _q.length;
  };
  
  return {
    "enqueue" : enqueue,
    "dequeue" : dequeue,
    "flush" : flush,
    "clear" : clear,
    "length" : length
  };
};

EPUBJS.core.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
};

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
EPUBJS.core.uuid = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid;
};

// From Lodash
EPUBJS.core.values = function(object) {
  var index = -1,
      props = Object.keys(object),
      length = props.length,
      result = Array(length);

  while (++index < length) {
    result[index] = object[props[index]];
  }
  return result;
};

EPUBJS.core.resolveUrl = function(base, path) {
  var url = [],
    segments = [],
    baseUri = EPUBJS.core.uri(base),
    pathUri = EPUBJS.core.uri(path),
    baseDirectory = baseUri.directory,
    pathDirectory = pathUri.directory,
    directories = [],
    // folders = base.split("/"),
    paths;
  
  // if(uri.host) {
  //   return path;
  // }

  if(baseDirectory[0] === "/") {
    baseDirectory = baseDirectory.substring(1);
  }

  if(pathDirectory[pathDirectory.length-1] === "/") {
    baseDirectory = baseDirectory.substring(0, baseDirectory.length-1);
  }

  if(pathDirectory[0] === "/") {
    pathDirectory = pathDirectory.substring(1);
  }

  if(pathDirectory[pathDirectory.length-1] === "/") {
    pathDirectory = pathDirectory.substring(0, pathDirectory.length-1);
  }

  if(baseDirectory) {
    directories = baseDirectory.split("/");
  }

  paths = pathDirectory.split("/");

  paths.reverse().forEach(function(part, index){
    if(part === ".."){
      directories.pop();
    } else if(part === directories[directories.length-1]) {
      directories.pop();
      segments.unshift(part);
    } else {
      segments.unshift(part);
    }
  });

  url = [baseUri.origin];

  if(directories.length) {
    url = url.concat(directories);
  }

  if(segments) {
    url = url.concat(segments);
  }

  url = url.concat(pathUri.filename);

  return url.join("/");
};

EPUBJS.core.documentHeight = function() {
  return Math.max(
      document.documentElement.clientHeight,
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
  );
};

EPUBJS.core.isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

EPUBJS.core.prefixed = function(unprefixed) {
  var vendors = ["Webkit", "Moz", "O", "ms" ],
    prefixes = ['-Webkit-', '-moz-', '-o-', '-ms-'],
    upper = unprefixed[0].toUpperCase() + unprefixed.slice(1),
    length = vendors.length;
  
  if (typeof(document.body.style[unprefixed]) != 'undefined') {
    return unprefixed;
  }

  for ( var i=0; i < length; i++ ) {
    if (typeof(document.body.style[vendors[i] + upper]) != 'undefined') {
      return vendors[i] + upper;
    }
  }

  return unprefixed;
};

EPUBJS.core.defaults = function(obj) {
  for (var i = 1, length = arguments.length; i < length; i++) {
    var source = arguments[i];
    for (var prop in source) {
      if (obj[prop] === void 0) obj[prop] = source[prop];
    }
  }
  return obj;
};

// Fast quicksort insert for sorted array -- based on:
// http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers 
EPUBJS.core.insert = function(item, array, compareFunction) {
  var location = EPUBJS.core.locationOf(item, array, compareFunction);
  array.splice(location, 0, item);

  return location;
};
// Returns where something would fit in
EPUBJS.core.locationOf = function(item, array, compareFunction, _start, _end) {
  var start = _start || 0;
  var end = _end || array.length;
  var pivot = parseInt(start + (end - start) / 2);
  var compared;
  if(!compareFunction){
    compareFunction = function(a, b) {
      if(a > b) return 1;
      if(a < b) return -1;
      if(a = b) return 0;
    };
  }
  if(end-start <= 0) {
    return pivot;
  }

  compared = compareFunction(array[pivot], item);
  if(end-start === 1) {
    return compared > 0 ? pivot : pivot + 1;
  }

  if(compared === 0) {
    return pivot;
  }
  if(compared === -1) {
    return EPUBJS.core.locationOf(item, array, compareFunction, pivot, end);
  } else{
    return EPUBJS.core.locationOf(item, array, compareFunction, start, pivot);
  }
};
// Returns -1 of mpt found
EPUBJS.core.indexOfSorted = function(item, array, compareFunction, _start, _end) {
  var start = _start || 0;
  var end = _end || array.length;
  var pivot = parseInt(start + (end - start) / 2);
  var compared;
  if(!compareFunction){
    compareFunction = function(a, b) {
      if(a > b) return 1;
      if(a < b) return -1;
      if(a = b) return 0;
    };
  }
  if(end-start <= 0) {
    return -1; // Not found
  }

  compared = compareFunction(array[pivot], item);
  if(end-start === 1) {
    return compared === 0 ? pivot : -1;
  }
  if(compared === 0) {
    return pivot; // Found
  }
  if(compared === -1) {
    return EPUBJS.core.indexOfSorted(item, array, compareFunction, pivot, end);
  } else{
    return EPUBJS.core.indexOfSorted(item, array, compareFunction, start, pivot);
  }
};
