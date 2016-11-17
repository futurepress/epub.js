var base64 = require('base64-js');
var path = require('path');

var requestAnimationFrame = (typeof window != 'undefined') ? (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame) : false;

/**
 * creates a uri object
 * @param	{string} urlString	a url string (relative or absolute)
 * @param	{[string]} baseString optional base for the url,
 * default to window.location.href
 * @return {object} url
 */
function Url(urlString, baseString) {
	var absolute = (urlString.indexOf('://') > -1);
	var pathname = urlString;

	this.Url = undefined;
	this.href = urlString;
	this.protocol = "";
	this.origin = "";
	this.fragment = "";
	this.search = "";
	this.base = baseString;

	if (!absolute && (typeof(baseString) !== "string")) {
		this.base = window && window.location.href;
	}

	// URL Polyfill doesn't throw an error if base is empty
	if (absolute || this.base) {
		try {
			this.Url = new URL(urlString, this.base);
			this.href = this.Url.href;

			this.protocol = this.Url.protocol;
			this.origin = this.Url.origin;
			this.fragment = this.Url.fragment;
			this.search = this.Url.search;

			pathname = this.Url.pathname;
		} catch (e) {
			// Skip URL parsing
			this.Url = undefined;
		}
	}

	this.Path = new Path(pathname);
	this.directory = this.Path.directory;
	this.filename = this.Path.filename;
	this.extension = this.Path.extension;

}

Url.prototype.path = function () {
	return this.Path;
};

Url.prototype.resolve = function (what) {
	var isAbsolute = (what.indexOf('://') > -1);
	var fullpath;

	if (isAbsolute) {
		return what;
	}

	fullpath = path.resolve(this.directory, what);
	return this.origin + fullpath;
};

Url.prototype.relative = function (what) {
	return path.relative(what, this.directory);
};

Url.prototype.toString = function () {
	return this.href;
};

function Path(pathString) {
	var protocol;
	var parsed;

	protocol = pathString.indexOf('://');
	if (protocol > -1) {
		pathString = new URL(pathString).pathname;
	}

	parsed = this.parse(pathString);

	this.path = pathString;

	if (this.isDirectory(pathString)) {
		this.directory = pathString;
	} else {
		this.directory = parsed.dir + "/";
	}

	this.filename = parsed.base;
	this.extension = parsed.ext.slice(1);

}

Path.prototype.parse = function (what) {
	return path.parse(what);
};

Path.prototype.isAbsolute = function (what) {
	return path.isAbsolute(what || this.path);
};

Path.prototype.isDirectory = function (what) {
	return (what.charAt(what.length-1) === '/');
};

Path.prototype.resolve = function (what) {
	return path.resolve(this.directory, what);
};

Path.prototype.relative = function (what) {
	return path.relative(this.directory, what);
};

Path.prototype.splitPath = function(filename) {
	return this.splitPathRe.exec(filename).slice(1);
};

Path.prototype.toString = function () {
	return this.path;
};

function assertPath(path) {
	if (typeof path !== 'string') {
		throw new TypeError('Path must be a string. Received ', path);
	}
};

function isElement(obj) {
		return !!(obj && obj.nodeType == 1);
};

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function uuid() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;
};

// From Lodash
function values(object) {
	var index = -1,
			props = Object.keys(object),
			length = props.length,
			result = Array(length);

	while (++index < length) {
		result[index] = object[props[index]];
	}
	return result;
};

function resolveUrl(base, path) {
	var url = [],
		segments = [],
		baseUri = uri(base),
		pathUri = uri(path),
		baseDirectory = baseUri.directory,
		pathDirectory = pathUri.directory,
		directories = [],
		// folders = base.split("/"),
		paths;

	// if(uri.host) {
	//	 return path;
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

function documentHeight() {
	return Math.max(
			document.documentElement.clientHeight,
			document.body.scrollHeight,
			document.documentElement.scrollHeight,
			document.body.offsetHeight,
			document.documentElement.offsetHeight
	);
};

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
};

function prefixed(unprefixed) {
	var vendors = ["Webkit", "Moz", "O", "ms" ],
		prefixes = ['-Webkit-', '-moz-', '-o-', '-ms-'],
		upper = unprefixed[0].toUpperCase() + unprefixed.slice(1),
		length = vendors.length;

	if (typeof(document) === 'undefined' || typeof(document.body.style[unprefixed]) != 'undefined') {
		return unprefixed;
	}

	for ( var i=0; i < length; i++ ) {
		if (typeof(document.body.style[vendors[i] + upper]) != 'undefined') {
			return vendors[i] + upper;
		}
	}

	return unprefixed;
};

function defaults(obj) {
	for (var i = 1, length = arguments.length; i < length; i++) {
		var source = arguments[i];
		for (var prop in source) {
			if (obj[prop] === void 0) obj[prop] = source[prop];
		}
	}
	return obj;
};

function extend(target) {
		var sources = [].slice.call(arguments, 1);
		sources.forEach(function (source) {
			if(!source) return;
			Object.getOwnPropertyNames(source).forEach(function(propName) {
				Object.defineProperty(target, propName, Object.getOwnPropertyDescriptor(source, propName));
			});
		});
		return target;
};

// Fast quicksort insert for sorted array -- based on:
// http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
function insert(item, array, compareFunction) {
	var location = locationOf(item, array, compareFunction);
	array.splice(location, 0, item);

	return location;
};
// Returns where something would fit in
function locationOf(item, array, compareFunction, _start, _end) {
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
		return locationOf(item, array, compareFunction, pivot, end);
	} else{
		return locationOf(item, array, compareFunction, start, pivot);
	}
};
// Returns -1 of mpt found
function indexOfSorted(item, array, compareFunction, _start, _end) {
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
		return indexOfSorted(item, array, compareFunction, pivot, end);
	} else{
		return indexOfSorted(item, array, compareFunction, start, pivot);
	}
};

function bounds(el) {

	var style = window.getComputedStyle(el);
	var widthProps = ["width", "paddingRight", "paddingLeft", "marginRight", "marginLeft", "borderRightWidth", "borderLeftWidth"];
	var heightProps = ["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"];

	var width = 0;
	var height = 0;

	widthProps.forEach(function(prop){
		width += parseFloat(style[prop]) || 0;
	});

	heightProps.forEach(function(prop){
		height += parseFloat(style[prop]) || 0;
	});

	return {
		height: height,
		width: width
	};

};

function borders(el) {

	var style = window.getComputedStyle(el);
	var widthProps = ["paddingRight", "paddingLeft", "marginRight", "marginLeft", "borderRightWidth", "borderLeftWidth"];
	var heightProps = ["paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"];

	var width = 0;
	var height = 0;

	widthProps.forEach(function(prop){
		width += parseFloat(style[prop]) || 0;
	});

	heightProps.forEach(function(prop){
		height += parseFloat(style[prop]) || 0;
	});

	return {
		height: height,
		width: width
	};

};

function windowBounds() {

	var width = window.innerWidth;
	var height = window.innerHeight;

	return {
		top: 0,
		left: 0,
		right: width,
		bottom: height,
		width: width,
		height: height
	};

};

//https://stackoverflow.com/questions/13482352/xquery-looking-for-text-with-single-quote/13483496#13483496
function cleanStringForXpath(str)	{
		var parts = str.match(/[^'"]+|['"]/g);
		parts = parts.map(function(part){
				if (part === "'")	{
						return '\"\'\"'; // output "'"
				}

				if (part === '"') {
						return "\'\"\'"; // output '"'
				}
				return "\'" + part + "\'";
		});
		return "concat(\'\'," + parts.join(",") + ")";
};

function indexOfTextNode(textNode){
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

function isXml(ext) {
	return ['xml', 'opf', 'ncx'].indexOf(ext) > -1;
}

function createBlob(content, mime){
	var blob = new Blob([content], {type : mime });

	return blob;
};

function createBlobUrl(content, mime){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var tempUrl;
	var blob = this.createBlob(content, mime);

	tempUrl = _URL.createObjectURL(blob);

	return tempUrl;
};

function createBase64Url(content, mime){
	var string;
	var data;
	var datauri;

	if (typeof(content) !== "string") {
		// Only handles strings
		return;
	}

	data = btoa(content);

	datauri = "data:" + mime + ";base64," + data;

	return datauri;
};

function type(obj){
	return Object.prototype.toString.call(obj).slice(8, -1);
}

function parse(markup, mime) {
	var doc;
	// console.log("parse", markup);

	if (typeof DOMParser === "undefined") {
		DOMParser = require('xmldom').DOMParser;
	}


	doc = new DOMParser().parseFromString(markup, mime);

	return doc;
}

function qs(el, sel) {
	var elements;

	if (typeof el.querySelector != "undefined") {
		return el.querySelector(sel);
	} else {
		elements = el.getElementsByTagName(sel);
		if (elements.length) {
			return elements[0];
		}
	}
}

function qsa(el, sel) {

	if (typeof el.querySelector != "undefined") {
		return el.querySelectorAll(sel);
	} else {
		return el.getElementsByTagName(sel);
	}
}

function qsp(el, sel, props) {
	var q, filtered;
	if (typeof el.querySelector != "undefined") {
		sel += '[';
		for (var prop in props) {
			sel += prop + "='" + props[prop] + "'";
		}
		sel += ']';
		return el.querySelector(sel);
	} else {
		q = el.getElementsByTagName(sel);
		filtered = Array.prototype.slice.call(q, 0).filter(function(el) {
			for (var prop in props) {
				if(el.getAttribute(prop) === props[prop]){
					return true;
				}
			}
			return false;
		});

		if (filtered) {
			return filtered[0];
		}
	}
}

function blob2base64(blob, cb) {
	var reader = new FileReader();
	reader.readAsDataURL(blob);
	reader.onloadend = function() {
		cb(reader.result);
	}
}

// From: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred#backwards_forwards_compatible
function defer() {
	/* A method to resolve the associated Promise with the value passed.
	 * If the promise is already settled it does nothing.
	 *
	 * @param {anything} value : This value is used to resolve the promise
	 * If the value is a Promise then the associated promise assumes the state
	 * of Promise passed as value.
	 */
	this.resolve = null;

	/* A method to reject the assocaited Promise with the value passed.
	 * If the promise is already settled it does nothing.
	 *
	 * @param {anything} reason: The reason for the rejection of the Promise.
	 * Generally its an Error object. If however a Promise is passed, then the Promise
	 * itself will be the reason for rejection no matter the state of the Promise.
	 */
	this.reject = null;

	this.id = uuid();

	/* A newly created Pomise object.
	 * Initially in pending state.
	 */
	this.promise = new Promise(function(resolve, reject) {
		this.resolve = resolve;
		this.reject = reject;
	}.bind(this));
	Object.freeze(this);
}

 function querySelectorByType(html, element, type){
	var query;
	if (typeof html.querySelector != "undefined") {
		query = html.querySelector(element+'[*|type="'+type+'"]');
	}
	// Handle IE not supporting namespaced epub:type in querySelector
	if(!query || query.length === 0) {
		query = this.qsa(html, element);
		for (var i = 0; i < query.length; i++) {
			if(query[i].getAttributeNS("http://www.idpf.org/2007/ops", "type") === type) {
				return query[i];
			}
		}
	} else {
		return query;
	}
}



module.exports = {
	'isElement': isElement,
	'uuid': uuid,
	'values': values,
	'resolveUrl': resolveUrl,
	'indexOfSorted': indexOfSorted,
	'documentHeight': documentHeight,
	'isNumber': isNumber,
	'prefixed': prefixed,
	'defaults': defaults,
	'extend': extend,
	'insert': insert,
	'locationOf': locationOf,
	'indexOfSorted': indexOfSorted,
	'requestAnimationFrame': requestAnimationFrame,
	'bounds': bounds,
	'borders': borders,
	'windowBounds': windowBounds,
	'cleanStringForXpath': cleanStringForXpath,
	'indexOfTextNode': indexOfTextNode,
	'isXml': isXml,
	'createBlob': createBlob,
	'createBlobUrl': createBlobUrl,
	'type': type,
	'parse' : parse,
	'qs' : qs,
	'qsa' : qsa,
	'qsp' : qsp,
	'blob2base64' : blob2base64,
	'createBase64Url': createBase64Url,
	'defer': defer,
	'Url': Url,
	'Path': Path,
	'querySelectorByType': querySelectorByType
};
