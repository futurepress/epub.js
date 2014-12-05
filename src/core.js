var EPUBJS = EPUBJS || {};
EPUBJS.core = {};

//-- Get a element for an id
EPUBJS.core.getEl = function(elem) {
	return document.getElementById(elem);
};

//-- Get all elements for a class
EPUBJS.core.getEls = function(classes) {
	return document.getElementsByClassName(classes);
};

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

	if(type == "binary") {
		xhr.responseType = "arraybuffer";
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

EPUBJS.core.toArray = function(obj) {
	var arr = [];

	for (var member in obj) {
		var newitm;
		if ( obj.hasOwnProperty(member) ) {
			newitm = obj[member];
			newitm.ident = member;
			arr.push(newitm);
		}
	}

	return arr;
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
			blob = url.indexOf('blob:'),
			doubleSlash = url.indexOf('://'),
			search = url.indexOf('?'),
			fragment = url.indexOf("#"),
			withoutProtocol,
			dot,
			firstSlash;
	
	if(blob === 0) {
		uri.protocol = "blob";
		uri.base = url.indexOf(0, fragment);
		return uri;
	}
	
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

//-- https://github.com/ebidel/filer.js/blob/master/src/filer.js#L128
EPUBJS.core.dataURLToBlob = function(dataURL) {
	var BASE64_MARKER = ';base64,',
		parts, contentType, raw, rawLength, uInt8Array;

	if (dataURL.indexOf(BASE64_MARKER) == -1) {
		parts = dataURL.split(',');
		contentType = parts[0].split(':')[1];
		raw = parts[1];

		return new Blob([raw], {type: contentType});
	}

	parts = dataURL.split(BASE64_MARKER);
	contentType = parts[0].split(':')[1];
	raw = window.atob(parts[1]);
	rawLength = raw.length;

	uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], {type: contentType});
};

//-- Load scripts async: http://stackoverflow.com/questions/7718935/load-scripts-asynchronously 
EPUBJS.core.addScript = function(src, callback, target) {
	var s, r;
	r = false;
	s = document.createElement('script');
	s.type = 'text/javascript';
	s.async = false;
	s.src = src;
	s.onload = s.onreadystatechange = function() {
		if ( !r && (!this.readyState || this.readyState == 'complete') ) {
			r = true;
			if(callback) callback();
		}
	};
	target = target || document.body;
	target.appendChild(s);
};

EPUBJS.core.addScripts = function(srcArr, callback, target) {
	var total = srcArr.length,
		curr = 0,
		cb = function(){
			curr++;
			if(total == curr){
				if(callback) callback();
			}else{
				EPUBJS.core.addScript(srcArr[curr], cb, target);
			}
		};

	EPUBJS.core.addScript(srcArr[curr], cb, target);
};

EPUBJS.core.addCss = function(src, callback, target) {
	var s, r;
	r = false;
	s = document.createElement('link');
	s.type = 'text/css';
	s.rel = "stylesheet";
	s.href = src;
	s.onload = s.onreadystatechange = function() {
		if ( !r && (!this.readyState || this.readyState == 'complete') ) {
			r = true;
			if(callback) callback();
		}
	};
	target = target || document.body;
	target.appendChild(s);
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

EPUBJS.core.resolveUrl = function(base, path) {
	var url,
		segments = [],
		uri = EPUBJS.core.uri(path),
		folders = base.split("/"),
		paths;
	
	if(uri.host) {
		return path;
	}
	
	folders.pop();

	paths = path.split("/");
	paths.forEach(function(p){
		if(p === ".."){
			folders.pop();
		}else{
			segments.push(p);
		}
	});

	url = folders.concat(segments);

	return url.join("/");
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

// Fast quicksort insert for sorted array -- based on:
// http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers 
EPUBJS.core.insert = function(item, array, compareFunction) {
	var location = EPUBJS.core.locationOf(item, array, compareFunction);
	array.splice(location, 0, item);
	
	return location;
};

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

// From: https://code.google.com/p/fbug/source/browse/branches/firebug1.10/content/firebug/lib/xpath.js
/**
 * Gets an XPath for an element which describes its hierarchical location.
 */
EPUBJS.core.getElementXPath = function(element) {
	if (element && element.id) {
		return '//*[@id="' + element.id + '"]';
	} else {
		return EPUBJS.core.getElementTreeXPath(element);
	}
};

EPUBJS.core.getElementTreeXPath = function(element) {
	var paths = [];
	var 	isXhtml = (element.ownerDocument.documentElement.getAttribute('xmlns') === "http://www.w3.org/1999/xhtml");
	var index, nodeName, tagName, pathIndex;
	
	if(element.nodeType === Node.TEXT_NODE){
		// index = Array.prototype.indexOf.call(element.parentNode.childNodes, element) + 1;
		index = EPUBJS.core.indexOfTextNode(element) + 1;

		paths.push("text()["+index+"]");
		element = element.parentNode;
	}

	// Use nodeName (instead of localName) so namespace prefix is included (if any).
	for (; element && element.nodeType == 1; element = element.parentNode)
	{
		index = 0;
		for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
		{
			// Ignore document type declaration.
			if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE) {
				continue;
			}
			if (sibling.nodeName == element.nodeName) {
				++index;
			}
		}
		nodeName = element.nodeName.toLowerCase();
		tagName = (isXhtml ? "xhtml:" + nodeName : nodeName);
		pathIndex = (index ? "[" + (index+1) + "]" : "");
		paths.splice(0, 0, tagName + pathIndex);
	}

	return paths.length ? "./" + paths.join("/") : null;
};

EPUBJS.core.nsResolver = function(prefix) {
	var ns = {
		'xhtml' : 'http://www.w3.org/1999/xhtml',
		'epub': 'http://www.idpf.org/2007/ops'
	};
	return ns[prefix] || null;
};

//https://stackoverflow.com/questions/13482352/xquery-looking-for-text-with-single-quote/13483496#13483496
EPUBJS.core.cleanStringForXpath = function(str)  {
		var parts = str.match(/[^'"]+|['"]/g);
		parts = parts.map(function(part){
				if (part === "'")  {
						return '\"\'\"'; // output "'"
				}

				if (part === '"') {
						return "\'\"\'"; // output '"'
				}
				return "\'" + part + "\'";
		});
		return "concat(\'\'," + parts.join(",") + ")";
};

EPUBJS.core.indexOfTextNode = function(textNode){
	var parent = textNode.parentNode;
	var children = parent.childNodes;
	var sib;
	var index = -1;
	for (var i = 0; i < children.length; i++) {
		sib = children[i];
		if(sib.nodeType === Node.TEXT_NODE){
			index++;
		}
		if(sib == textNode) break;
	}
	
	return index;
};