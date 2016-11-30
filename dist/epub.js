(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory((function webpackLoadOptionalExternalModule() { try { return require("JSZip"); } catch(e) {} }()), require("xmldom"));
	else if(typeof define === 'function' && define.amd)
		define(["JSZip", "xmldom"], factory);
	else if(typeof exports === 'object')
		exports["ePub"] = factory((function webpackLoadOptionalExternalModule() { try { return require("JSZip"); } catch(e) {} }()), require("xmldom"));
	else
		root["ePub"] = factory(root["JSZip"], root["xmldom"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_48__, __WEBPACK_EXTERNAL_MODULE_14__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 50);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

var base64 = __webpack_require__(21);
var path = __webpack_require__(2);

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

function isFloat(n) {
	return isNumber(n) && (Math.floor(n) !== n);
}

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

function parse(markup, mime, forceXMLDom) {
	var doc;

	if (typeof DOMParser === "undefined" || forceXMLDom) {
		DOMParser = __webpack_require__(14).DOMParser;
	}


	doc = new DOMParser().parseFromString(markup, mime);

	return doc;
}

function qs(el, sel) {
	var elements;
	if (!el) {
		throw new Error('No Element Provided');
	}

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

/**
 * Sprint through all text nodes in a document
 * @param  {element} root element to start with
 * @param  {function} func function to run on each element
 */
function sprint(root, func) {
	var doc = root.ownerDocument || root;
	if (typeof(doc.createTreeWalker) !== "undefined") {
		treeWalker(root, func, NodeFilter.SHOW_TEXT);
	} else {
		walk(root, function(node) {
			if (node && node.nodeType === 3) { // Node.TEXT_NODE
				func(node);
			}
		}, true);
	}
}

function treeWalker(root, func, filter) {
	var treeWalker = document.createTreeWalker(root, filter, null, false);
	while ((node = treeWalker.nextNode())) {
		func(node);
	}
}

// function walk(root, func, onlyText) {
// 	var node = root;
//
// 	if (node && !onlyText || node.nodeType === 3) { // Node.TEXT_NODE
// 		func(node);
// 	}
// 	console.log(root);
//
// 	node = node.firstChild;
// 	while(node) {
// 		walk(node, func, onlyText);
// 		node = node.nextSibling;
// 	}
// }

/**
 * @param callback return false for continue,true for break
 * @return boolean true: break visit;
 */
function walk(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(walk(node,callback)){return true}
		}while(node=node.nextSibling)
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

function children(el) {
	var children = [];
	var childNodes = el.parentNode.childNodes;
	for (var i = 0; i < childNodes.length; i++) {
		node = childNodes[i];
		if (node.nodeType === 1) {
			children.push(node);
		}
	};
	return children;
}

module.exports = {
	'isElement': isElement,
	'uuid': uuid,
	'values': values,
	'resolveUrl': resolveUrl,
	'indexOfSorted': indexOfSorted,
	'documentHeight': documentHeight,
	'isNumber': isNumber,
	'isFloat': isFloat,
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
	'querySelectorByType': querySelectorByType,
	'sprint' : sprint,
	'children' : children
};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);

/**
	EPUB CFI spec: http://www.idpf.org/epub/linking/cfi/epub-cfi.html

	Implements:
	- Character Offset: epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/2/1:3)
	- Simple Ranges : epubcfi(/6/4[chap01ref]!/4[body01]/10[para05],/2/1:1,/3:4)

	Does Not Implement:
	- Temporal Offset (~)
	- Spatial Offset (@)
	- Temporal-Spatial Offset (~ + @)
	- Text Location Assertion ([)
*/

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var DOCUMENT_NODE = 9;

function EpubCFI(cfiFrom, base, ignoreClass){
	var type;

	this.str = '';

	this.base = {};
	this.spinePos = 0; // For compatibility

	this.range = false; // true || false;

	this.path = {};
	this.start = null;
	this.end = null;

	// Allow instantiation without the 'new' keyword
	if (!(this instanceof EpubCFI)) {
		return new EpubCFI(cfiFrom, base, ignoreClass);
	}

	if(typeof base === 'string') {
		this.base = this.parseComponent(base);
	} else if(typeof base === 'object' && base.steps) {
		this.base = base;
	}

	type = this.checkType(cfiFrom);


	if(type === 'string') {
		this.str = cfiFrom;
		return core.extend(this, this.parse(cfiFrom));
	} else if (type === 'range') {
		return core.extend(this, this.fromRange(cfiFrom, this.base, ignoreClass));
	} else if (type === 'node') {
		return core.extend(this, this.fromNode(cfiFrom, this.base, ignoreClass));
	} else if (type === 'EpubCFI' && cfiFrom.path) {
		return cfiFrom;
	} else if (!cfiFrom) {
		return this;
	} else {
		throw new TypeError('not a valid argument for EpubCFI');
	}

};

EpubCFI.prototype.checkType = function(cfi) {

	if (this.isCfiString(cfi)) {
		return 'string';
	// Is a range object
	} else if (typeof cfi === 'object' && (core.type(cfi) === "Range" || typeof(cfi.startContainer) != "undefined")){
		return 'range';
	} else if (typeof cfi === 'object' && typeof(cfi.nodeType) != "undefined" ){ // || typeof cfi === 'function'
		return 'node';
	} else if (typeof cfi === 'object' && cfi instanceof EpubCFI){
		return 'EpubCFI';
	} else {
		return false;
	}
};

EpubCFI.prototype.parse = function(cfiStr) {
	var cfi = {
			spinePos: -1,
			range: false,
			base: {},
			path: {},
			start: null,
			end: null
		};
	var baseComponent, pathComponent, range;

	if(typeof cfiStr !== "string") {
		return {spinePos: -1};
	}

	if(cfiStr.indexOf("epubcfi(") === 0 && cfiStr[cfiStr.length-1] === ")") {
		// Remove intial epubcfi( and ending )
		cfiStr = cfiStr.slice(8, cfiStr.length-1);
	}

	baseComponent = this.getChapterComponent(cfiStr);

	// Make sure this is a valid cfi or return
	if(!baseComponent) {
		return {spinePos: -1};
	}

	cfi.base = this.parseComponent(baseComponent);

	pathComponent = this.getPathComponent(cfiStr);
	cfi.path = this.parseComponent(pathComponent);

	range = this.getRange(cfiStr);

	if(range) {
		cfi.range = true;
		cfi.start = this.parseComponent(range[0]);
		cfi.end = this.parseComponent(range[1]);
	}

	// Get spine node position
	// cfi.spineSegment = cfi.base.steps[1];

	// Chapter segment is always the second step
	cfi.spinePos = cfi.base.steps[1].index;

	return cfi;
};

EpubCFI.prototype.parseComponent = function(componentStr){
	var component = {
		steps: [],
		terminal: {
			offset: null,
			assertion: null
		}
	};
	var parts = componentStr.split(':');
	var steps = parts[0].split('/');
	var terminal;

	if(parts.length > 1) {
		terminal = parts[1];
		component.terminal = this.parseTerminal(terminal);
	}

	if (steps[0] === '') {
		steps.shift(); // Ignore the first slash
	}

	component.steps = steps.map(function(step){
		return this.parseStep(step);
	}.bind(this));

	return component;
};

EpubCFI.prototype.parseStep = function(stepStr){
	var type, num, index, has_brackets, id;

	has_brackets = stepStr.match(/\[(.*)\]/);
	if(has_brackets && has_brackets[1]){
		id = has_brackets[1];
	}

	//-- Check if step is a text node or element
	num = parseInt(stepStr);

	if(isNaN(num)) {
		return;
	}

	if(num % 2 === 0) { // Even = is an element
		type = "element";
		index = num / 2 - 1;
	} else {
		type = "text";
		index = (num - 1 ) / 2;
	}

	return {
		"type" : type,
		'index' : index,
		'id' : id || null
	};
};

EpubCFI.prototype.parseTerminal = function(termialStr){
	var characterOffset, textLocationAssertion;
	var assertion = termialStr.match(/\[(.*)\]/);

	if(assertion && assertion[1]){
		characterOffset = parseInt(termialStr.split('[')[0]) || null;
		textLocationAssertion = assertion[1];
	} else {
		characterOffset = parseInt(termialStr) || null;
	}

	return {
		'offset': characterOffset,
		'assertion': textLocationAssertion
	};

};

EpubCFI.prototype.getChapterComponent = function(cfiStr) {

	var indirection = cfiStr.split("!");

	return indirection[0];
};

EpubCFI.prototype.getPathComponent = function(cfiStr) {

	var indirection = cfiStr.split("!");

	if(indirection[1]) {
		ranges = indirection[1].split(',');
		return ranges[0];
	}

};

EpubCFI.prototype.getRange = function(cfiStr) {

	var ranges = cfiStr.split(",");

	if(ranges.length === 3){
		return [
			ranges[1],
			ranges[2]
		];
	}

	return false;
};

EpubCFI.prototype.getCharecterOffsetComponent = function(cfiStr) {
	var splitStr = cfiStr.split(":");
	return splitStr[1] || '';
};

EpubCFI.prototype.joinSteps = function(steps) {
	if(!steps) {
		return "";
	}

	return steps.map(function(part){
		var segment = '';

		if(part.type === 'element') {
			segment += (part.index + 1) * 2;
		}

		if(part.type === 'text') {
			segment += 1 + (2 * part.index); // TODO: double check that this is odd
		}

		if(part.id) {
			segment += "[" + part.id + "]";
		}

		return segment;

	}).join('/');

};

EpubCFI.prototype.segmentString = function(segment) {
	var segmentString = '/';

	segmentString += this.joinSteps(segment.steps);

	if(segment.terminal && segment.terminal.offset != null){
		segmentString += ':' + segment.terminal.offset;
	}

	if(segment.terminal && segment.terminal.assertion != null){
		segmentString += '[' + segment.terminal.assertion + ']';
	}

	return segmentString;
};

EpubCFI.prototype.toString = function() {
	var cfiString = 'epubcfi(';

	cfiString += this.segmentString(this.base);

	cfiString += '!';
	cfiString += this.segmentString(this.path);

	// Add Range, if present
	if(this.start) {
		cfiString += ',';
		cfiString += this.segmentString(this.start);
	}

	if(this.end) {
		cfiString += ',';
		cfiString += this.segmentString(this.end);
	}

	cfiString += ")";

	return cfiString;
};

EpubCFI.prototype.compare = function(cfiOne, cfiTwo) {
	var stepsA, stepsB;
	var terminalA, terminalB;

	if(typeof cfiOne === 'string') {
		cfiOne = new EpubCFI(cfiOne);
	}
	if(typeof cfiTwo === 'string') {
		cfiTwo = new EpubCFI(cfiTwo);
	}
	// Compare Spine Positions
	if(cfiOne.spinePos > cfiTwo.spinePos) {
		return 1;
	}
	if(cfiOne.spinePos < cfiTwo.spinePos) {
		return -1;
	}

	if (cfiOne.range) {
		stepsA = cfiOne.path.steps.concat(cfiOne.start.steps);
		terminalA = cfiOne.start.terminal;
	} else {
		stepsA = cfiOne.path.steps;
		terminalA = cfiOne.path.terminal;
	}

	if (cfiTwo.range) {
		stepsB = cfiTwo.path.steps.concat(cfiTwo.start.steps);
		terminalB = cfiTwo.start.terminal;
	} else {
		stepsB = cfiTwo.path.steps;
		terminalB = cfiTwo.path.terminal;
	}

	// Compare Each Step in the First item
	for (var i = 0; i < stepsA.length; i++) {
		if(!stepsA[i]) {
			return -1;
		}
		if(!stepsB[i]) {
			return 1;
		}
		if(stepsA[i].index > stepsB[i].index) {
			return 1;
		}
		if(stepsA[i].index < stepsB[i].index) {
			return -1;
		}
		// Otherwise continue checking
	}

	// All steps in First equal to Second and First is Less Specific
	if(stepsA.length < stepsB.length) {
		return 1;
	}

	// Compare the charecter offset of the text node
	if(terminalA.offset > terminalB.offset) {
		return 1;
	}
	if(terminalA.offset < terminalB.offset) {
		return -1;
	}

	// CFI's are equal
	return 0;
};

EpubCFI.prototype.step = function(node) {
	var nodeType = (node.nodeType === TEXT_NODE) ? 'text' : 'element';

	return {
		'id' : node.id,
		'tagName' : node.tagName,
		'type' : nodeType,
		'index' : this.position(node)
	};
};

EpubCFI.prototype.filteredStep = function(node, ignoreClass) {
	var filteredNode = this.filter(node, ignoreClass);
	var nodeType;

	// Node filtered, so ignore
	if (!filteredNode) {
		return;
	}

	// Otherwise add the filter node in
	nodeType = (filteredNode.nodeType === TEXT_NODE) ? 'text' : 'element';

	return {
		'id' : filteredNode.id,
		'tagName' : filteredNode.tagName,
		'type' : nodeType,
		'index' : this.filteredPosition(filteredNode, ignoreClass)
	};
};

EpubCFI.prototype.pathTo = function(node, offset, ignoreClass) {
	var segment = {
		steps: [],
		terminal: {
			offset: null,
			assertion: null
		}
	};
	var currentNode = node;
	var step;

	while(currentNode && currentNode.parentNode &&
				currentNode.parentNode.nodeType != DOCUMENT_NODE) {

		if (ignoreClass) {
			step = this.filteredStep(currentNode, ignoreClass);
		} else {
			step = this.step(currentNode);
		}

		if (step) {
			segment.steps.unshift(step);
		}

		currentNode = currentNode.parentNode;

	}

	if (offset != null && offset >= 0) {

		segment.terminal.offset = offset;

		// Make sure we are getting to a textNode if there is an offset
		if(segment.steps[segment.steps.length-1].type != "text") {
			segment.steps.push({
				'type' : "text",
				'index' : 0
			});
		}

	}


	return segment;
}

EpubCFI.prototype.equalStep = function(stepA, stepB) {
	if (!stepA || !stepB) {
		return false;
	}

	if(stepA.index === stepB.index &&
		 stepA.id === stepB.id &&
		 stepA.type === stepB.type) {
		return true;
	}

	return false;
};

EpubCFI.prototype.fromRange = function(range, base, ignoreClass) {
	var cfi = {
			range: false,
			base: {},
			path: {},
			start: null,
			end: null
		};

	var start = range.startContainer;
	var end = range.endContainer;

	var startOffset = range.startOffset;
	var endOffset = range.endOffset;

	var needsIgnoring = false;

	if (ignoreClass) {
		// Tell pathTo if / what to ignore
		needsIgnoring = (start.ownerDocument.querySelector('.' + ignoreClass) != null);
	}


	if (typeof base === 'string') {
		cfi.base = this.parseComponent(base);
		cfi.spinePos = cfi.base.steps[1].index;
	} else if (typeof base === 'object') {
		cfi.base = base;
	}

	if (range.collapsed) {
		if (needsIgnoring) {
			startOffset = this.patchOffset(start, startOffset, ignoreClass);
		}
		cfi.path = this.pathTo(start, startOffset, ignoreClass);
	} else {
		cfi.range = true;

		if (needsIgnoring) {
			startOffset = this.patchOffset(start, startOffset, ignoreClass);
		}

		cfi.start = this.pathTo(start, startOffset, ignoreClass);
		if (needsIgnoring) {
			endOffset = this.patchOffset(end, endOffset, ignoreClass);
		}

		cfi.end = this.pathTo(end, endOffset, ignoreClass);

		// Create a new empty path
		cfi.path = {
			steps: [],
			terminal: null
		};

		// Push steps that are shared between start and end to the common path
		var len = cfi.start.steps.length;
		var i;

		for (i = 0; i < len; i++) {
			if (this.equalStep(cfi.start.steps[i], cfi.end.steps[i])) {
				if(i === len-1) {
					// Last step is equal, check terminals
					if(cfi.start.terminal === cfi.end.terminal) {
						// CFI's are equal
						cfi.path.steps.push(cfi.start.steps[i]);
						// Not a range
						cfi.range = false;
					}
				} else {
					cfi.path.steps.push(cfi.start.steps[i]);
				}

			} else {
				break;
			}
		};

		cfi.start.steps = cfi.start.steps.slice(cfi.path.steps.length);
		cfi.end.steps = cfi.end.steps.slice(cfi.path.steps.length);

		// TODO: Add Sanity check to make sure that the end if greater than the start
	}

	return cfi;
}

EpubCFI.prototype.fromNode = function(anchor, base, ignoreClass) {
	var cfi = {
			range: false,
			base: {},
			path: {},
			start: null,
			end: null
		};

	var needsIgnoring = false;

	if (ignoreClass) {
		// Tell pathTo if / what to ignore
		needsIgnoring = (anchor.ownerDocument.querySelector('.' + ignoreClass) != null);
	}

	if (typeof base === 'string') {
		cfi.base = this.parseComponent(base);
		cfi.spinePos = cfi.base.steps[1].index;
	} else if (typeof base === 'object') {
		cfi.base = base;
	}

	cfi.path = this.pathTo(anchor, null, ignoreClass);

	return cfi;
};

EpubCFI.prototype.filter = function(anchor, ignoreClass) {
	var needsIgnoring;
	var sibling; // to join with
	var parent, prevSibling, nextSibling;
	var isText = false;

	if (anchor.nodeType === TEXT_NODE) {
		isText = true;
		parent = anchor.parentNode;
		needsIgnoring = anchor.parentNode.classList.contains(ignoreClass);
	} else {
		isText = false;
		needsIgnoring = anchor.classList.contains(ignoreClass);
	}

	if (needsIgnoring && isText) {
		previousSibling = parent.previousSibling;
		nextSibling = parent.nextSibling;

		// If the sibling is a text node, join the nodes
		if (previousSibling && previousSibling.nodeType === TEXT_NODE) {
			sibling = previousSibling;
		} else if (nextSibling && nextSibling.nodeType === TEXT_NODE) {
			sibling = nextSibling;
		}

		if (sibling) {
			return sibling;
		} else {
			// Parent will be ignored on next step
			return anchor;
		}

	} else if (needsIgnoring && !isText) {
		// Otherwise just skip the element node
		return false;
	} else {
		// No need to filter
		return anchor;
	}

};

EpubCFI.prototype.patchOffset = function(anchor, offset, ignoreClass) {
	var needsIgnoring;
	var sibling;

	if (anchor.nodeType != TEXT_NODE) {
		console.error("Anchor must be a text node");
		return;
	}

	var curr = anchor;
	var totalOffset = offset;

	// If the parent is a ignored node, get offset from it's start
	if (anchor.parentNode.classList.contains(ignoreClass)) {
		curr = anchor.parentNode;
	}

	while (curr.previousSibling) {
		if(curr.previousSibling.nodeType === ELEMENT_NODE) {
			// Originally a text node, so join
			if(curr.previousSibling.classList.contains(ignoreClass)){
				totalOffset += curr.previousSibling.textContent.length;
			} else {
				break; // Normal node, dont join
			}
		} else {
			// If the previous sibling is a text node, join the nodes
			totalOffset += curr.previousSibling.textContent.length;
		}

		curr = curr.previousSibling;
	}

	return totalOffset;

};

EpubCFI.prototype.normalizedMap = function(children, nodeType, ignoreClass) {
	var output = {};
	var prevIndex = -1;
	var i, len = children.length;
	var currNodeType;
	var prevNodeType;

	for (i = 0; i < len; i++) {

		currNodeType = children[i].nodeType;

		// Check if needs ignoring
		if (currNodeType === ELEMENT_NODE &&
				children[i].classList.contains(ignoreClass)) {
			currNodeType = TEXT_NODE;
		}

		if (i > 0 &&
				currNodeType === TEXT_NODE &&
				prevNodeType === TEXT_NODE) {
			// join text nodes
			output[i] = prevIndex;
		} else if (nodeType === currNodeType){
			prevIndex = prevIndex + 1;
			output[i] = prevIndex;
		}

		prevNodeType = currNodeType;

	}

	return output;
};

EpubCFI.prototype.position = function(anchor) {
	var children, index, map;
	var childNodes, node;
	if (anchor.nodeType === ELEMENT_NODE) {
		children = anchor.parentNode.children;
		if (!children) {
			children = core.children(anchor.parentNode);
		}
		index = Array.prototype.indexOf.call(children, anchor);
	} else {
		children = this.textNodes(anchor.parentNode);
		index = children.indexOf(anchor);
	}

	return index;
};

EpubCFI.prototype.filteredPosition = function(anchor, ignoreClass) {
	var children, index, map;

	if (anchor.nodeType === ELEMENT_NODE) {
		children = anchor.parentNode.children;
		map = this.normalizedMap(children, ELEMENT_NODE, ignoreClass);
	} else {
		children = anchor.parentNode.childNodes;
		// Inside an ignored node
		if(anchor.parentNode.classList.contains(ignoreClass)) {
			anchor = anchor.parentNode;
			children = anchor.parentNode.childNodes;
		}
		map = this.normalizedMap(children, TEXT_NODE, ignoreClass);
	}


	index = Array.prototype.indexOf.call(children, anchor);

	return map[index];
};

EpubCFI.prototype.stepsToXpath = function(steps) {
	var xpath = [".", "*"];

	steps.forEach(function(step){
		var position = step.index + 1;

		if(step.id){
			xpath.push("*[position()=" + position + " and @id='" + step.id + "']");
		} else if(step.type === "text") {
			xpath.push("text()[" + position + "]");
		} else {
			xpath.push("*[" + position + "]");
		}
	});

	return xpath.join("/");
};


/*

To get the last step if needed:

// Get the terminal step
lastStep = steps[steps.length-1];
// Get the query string
query = this.stepsToQuery(steps);
// Find the containing element
startContainerParent = doc.querySelector(query);
// Find the text node within that element
if(startContainerParent && lastStep.type == "text") {
	container = startContainerParent.childNodes[lastStep.index];
}
*/
EpubCFI.prototype.stepsToQuerySelector = function(steps) {
	var query = ["html"];

	steps.forEach(function(step){
		var position = step.index + 1;

		if(step.id){
			query.push("#" + step.id);
		} else if(step.type === "text") {
			// unsupported in querySelector
			// query.push("text()[" + position + "]");
		} else {
			query.push("*:nth-child(" + position + ")");
		}
	});

	return query.join(">");

};

EpubCFI.prototype.textNodes = function(container, ignoreClass) {
	return Array.prototype.slice.call(container.childNodes).
		filter(function (node) {
			if (node.nodeType === TEXT_NODE) {
				return true;
			} else if (ignoreClass && node.classList.contains(ignoreClass)) {
				return true;
			}
			return false;
		});
};

EpubCFI.prototype.walkToNode = function(steps, _doc, ignoreClass) {
	var doc = _doc || document;
	var container = doc.documentElement;
	var step;
	var len = steps.length;
	var i;

	for (i = 0; i < len; i++) {
		step = steps[i];

		if(step.type === "element") {
			container = container.children[step.index];
		} else if(step.type === "text"){
			container = this.textNodes(container, ignoreClass)[step.index];
		}

	};

	return container;
};

EpubCFI.prototype.findNode = function(steps, _doc, ignoreClass) {
	var doc = _doc || document;
	var container;
	var xpath;

	if(!ignoreClass && typeof doc.evaluate != 'undefined') {
		xpath = this.stepsToXpath(steps);
		container = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	} else if(ignoreClass) {
		container = this.walkToNode(steps, doc, ignoreClass);
	} else {
		container = this.walkToNode(steps, doc);
	}

	return container;
};

EpubCFI.prototype.fixMiss = function(steps, offset, _doc, ignoreClass) {
	var container = this.findNode(steps.slice(0,-1), _doc, ignoreClass);
	var children = container.childNodes;
	var map = this.normalizedMap(children, TEXT_NODE, ignoreClass);
	var i;
	var child;
	var len;
	var childIndex;
	var lastStepIndex = steps[steps.length-1].index;

	for (var childIndex in map) {
		if (!map.hasOwnProperty(childIndex)) return;

		if(map[childIndex] === lastStepIndex) {
			child = children[childIndex];
			len = child.textContent.length;
			if(offset > len) {
				offset = offset - len;
			} else {
				if (child.nodeType === ELEMENT_NODE) {
					container = child.childNodes[0];
				} else {
					container = child;
				}
				break;
			}
		}
	}

	return {
		container: container,
		offset: offset
	};

};

EpubCFI.prototype.toRange = function(_doc, ignoreClass) {
	var doc = _doc || document;
	var range = doc.createRange();
	var start, end, startContainer, endContainer;
	var cfi = this;
	var startSteps, endSteps;
	var needsIgnoring = ignoreClass ? (doc.querySelector('.' + ignoreClass) != null) : false;
	var missed;

	if (cfi.range) {
		start = cfi.start;
		startSteps = cfi.path.steps.concat(start.steps);
		startContainer = this.findNode(startSteps, doc, needsIgnoring ? ignoreClass : null);
		end = cfi.end;
		endSteps = cfi.path.steps.concat(end.steps);
		endContainer = this.findNode(endSteps, doc, needsIgnoring ? ignoreClass : null);
	} else {
		start = cfi.path;
		startSteps = cfi.path.steps;
		startContainer = this.findNode(cfi.path.steps, doc, needsIgnoring ? ignoreClass : null);
	}

	if(startContainer) {
		try {

			if(start.terminal.offset != null) {
				range.setStart(startContainer, start.terminal.offset);
			} else {
				range.setStart(startContainer, 0);
			}

		} catch (e) {
			missed = this.fixMiss(startSteps, start.terminal.offset, doc, needsIgnoring ? ignoreClass : null);
			range.setStart(missed.container, missed.offset);
		}
	} else {
		// No start found
		return null;
	}

	if (endContainer) {
		try {

			if(end.terminal.offset != null) {
				range.setEnd(endContainer, end.terminal.offset);
			} else {
				range.setEnd(endContainer, 0);
			}

		} catch (e) {
			missed = this.fixMiss(endSteps, cfi.end.terminal.offset, doc, needsIgnoring ? ignoreClass : null);
			range.setEnd(missed.container, missed.offset);
		}
	}


	// doc.defaultView.getSelection().addRange(range);
	return range;
};

// is a cfi string, should be wrapped with "epubcfi()"
EpubCFI.prototype.isCfiString = function(str) {
	if(typeof str === 'string' &&
			str.indexOf("epubcfi(") === 0 &&
			str[str.length-1] === ")") {
		return true;
	}

	return false;
};

EpubCFI.prototype.generateChapterComponent = function(_spineNodeIndex, _pos, id) {
	var pos = parseInt(_pos),
		spineNodeIndex = _spineNodeIndex + 1,
		cfi = '/'+spineNodeIndex+'/';

	cfi += (pos + 1) * 2;

	if(id) {
		cfi += "[" + id + "]";
	}

	return cfi;
};

module.exports = EpubCFI;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + path);
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47/*/*/)
      break;
    else
      code = 47/*/*/;
    if (code === 47/*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 ||
            res.charCodeAt(res.length - 1) !== 46/*.*/ ||
            res.charCodeAt(res.length - 2) !== 46/*.*/) {
          if (res.length > 2) {
            var start = res.length - 1;
            var j = start;
            for (; j >= 0; --j) {
              if (res.charCodeAt(j) === 47/*/*/)
                break;
            }
            if (j !== start) {
              if (j === -1)
                res = '';
              else
                res = res.slice(0, j);
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46/*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base ||
    ((pathObject.name || '') + (pathObject.ext || ''));
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47/*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },


  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0)
      return '.';

    var isAbsolute = path.charCodeAt(0) === 47/*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47/*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute)
      path = '.';
    if (path.length > 0 && trailingSeparator)
      path += '/';

    if (isAbsolute)
      return '/' + path;
    return path;
  },


  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47/*/*/;
  },


  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },


  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to)
      return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to)
      return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47/*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = (fromEnd - fromStart);

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47/*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = (toEnd - toStart);

    // Compare paths to find the longest common path from root
    var length = (fromLen < toLen ? fromLen : toLen);
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47/*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47/*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47/*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47/*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47/*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },


  _makeLong: function _makeLong(path) {
    return path;
  },


  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0)
      return '.';
    var code = path.charCodeAt(0);
    var hasRoot = (code === 47/*/*/);
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47/*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1)
      return hasRoot ? '/' : '.';
    if (hasRoot && end === 1)
      return '//';
    return path.slice(0, end);
  },


  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string')
      throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path)
        return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47/*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end)
        end = firstNonSlashEnd;
      else if (end === -1)
        end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47/*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1)
        return '';
      return path.slice(start, end);
    }
  },


  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47/*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46/*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
         startDot === end - 1 &&
         startDot === startPart + 1)) {
      return '';
    }
    return path.slice(startDot, end);
  },


  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError(
        'Parameter "pathObject" must be an object, not ' + typeof(pathObject)
      );
    }
    return _format('/', pathObject);
  },


  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0)
      return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = (code === 47/*/*/);
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47/*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46/*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
         startDot === end - 1 &&
         startDot === startPart + 1)) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute)
          ret.base = ret.name = path.slice(1, end);
        else
          ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0)
      ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute)
      ret.dir = '/';

    return ret;
  },


  sep: '/',
  delimiter: ':',
  posix: null
};


module.exports = posix;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var d        = __webpack_require__(22)
  , callable = __webpack_require__(31)

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;


/***/ },
/* 4 */
/***/ function(module, exports) {

var g;

// This works in non-strict mode
g = (function() { return this; })();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ },
/* 5 */
/***/ function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ },
/* 6 */
/***/ function(module, exports) {

/**
 * Hooks allow for injecting functions that must all complete in order before finishing
 * They will execute in parallel but all must finish before continuing
 * Functions may return a promise if they are asycn.
 * @param {any} context scope of this
 * @example this.content = new EPUBJS.Hook(this);
 */
function Hook(context){
	this.context = context || this;
	this.hooks = [];
};

/**
 * Adds a function to be run before a hook completes
 * @example this.content.register(function(){...});
 */
Hook.prototype.register = function(){
	for(var i = 0; i < arguments.length; ++i) {
		if (typeof arguments[i]  === "function") {
			this.hooks.push(arguments[i]);
		} else {
			// unpack array
			for(var j = 0; j < arguments[i].length; ++j) {
				this.hooks.push(arguments[i][j]);
			}
		}
	}
};

/**
 * Triggers a hook to run all functions
 * @example this.content.trigger(args).then(function(){...});
 */
Hook.prototype.trigger = function(){
	var args = arguments;
	var context = this.context;
	var promises = [];

	this.hooks.forEach(function(task, i) {
		var executing = task.apply(context, args);

		if(executing && typeof executing["then"] === "function") {
			// Task is a function that returns a promise
			promises.push(executing);
		}
		// Otherwise Task resolves immediately, continue
	});


	return Promise.all(promises);
};

// Adds a function to be run before a hook completes
Hook.prototype.list = function(){
	return this.hooks;
};

Hook.prototype.clear = function(){
	return this.hooks = [];
};

module.exports = Hook;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

var EpubCFI = __webpack_require__(1);

function Mapping(layout){
	this.layout = layout;
};

Mapping.prototype.section = function(view) {
	var ranges = this.findRanges(view);
	var map = this.rangeListToCfiList(view.section.cfiBase, ranges);

	return map;
};

Mapping.prototype.page = function(contents, cfiBase, start, end) {
	var root = contents && contents.document ? contents.document.body : false;

	if (!root) {
		return;
	}

	return this.rangePairToCfiPair(cfiBase, {
		start: this.findStart(root, start, end),
		end: this.findEnd(root, start, end)
	});
};

Mapping.prototype.walk = function(root, func) {
	//var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT, null, false);
	var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode: function (node) {
					if ( node.data.trim().length > 0 ) {
						return NodeFilter.FILTER_ACCEPT;
					} else {
						return NodeFilter.FILTER_REJECT;
					}
			}
	}, false);
	var node;
	var result;
	while ((node = treeWalker.nextNode())) {
		result = func(node);
		if(result) break;
	}

	return result;
};

Mapping.prototype.findRanges = function(view){
	var columns = [];
	var scrollWidth = view.contents.scrollWidth();
	var count = this.layout.count(scrollWidth);
	var column = this.layout.column;
	var gap = this.layout.gap;
	var start, end;

	for (var i = 0; i < count.pages; i++) {
		start = (column + gap) * i;
		end = (column * (i+1)) + (gap * i);
		columns.push({
			start: this.findStart(view.document.body, start, end),
			end: this.findEnd(view.document.body, start, end)
		});
	}

	return columns;
};

Mapping.prototype.findStart = function(root, start, end){
	var stack = [root];
	var $el;
	var found;
	var $prev = root;
	while (stack.length) {

		$el = stack.shift();

		found = this.walk($el, function(node){
			var left, right;
			var elPos;
			var elRange;


			if(node.nodeType == Node.TEXT_NODE){
				elRange = document.createRange();
				elRange.selectNodeContents(node);
				elPos = elRange.getBoundingClientRect();
			} else {
				elPos = node.getBoundingClientRect();
			}

			left = elPos.left;
			right = elPos.right;

			if( left >= start && left <= end ) {
				return node;
			} else if (right > start) {
				return node;
			} else {
				$prev = node;
				stack.push(node);
			}

		});

		if(found) {
			return this.findTextStartRange(found, start, end);
		}

	}

	// Return last element
	return this.findTextStartRange($prev, start, end);
};

Mapping.prototype.findEnd = function(root, start, end){
	var stack = [root];
	var $el;
	var $prev = root;
	var found;

	while (stack.length) {

		$el = stack.shift();

		found = this.walk($el, function(node){

			var left, right;
			var elPos;
			var elRange;


			if(node.nodeType == Node.TEXT_NODE){
				elRange = document.createRange();
				elRange.selectNodeContents(node);
				elPos = elRange.getBoundingClientRect();
			} else {
				elPos = node.getBoundingClientRect();
			}

			left = elPos.left;
			right = elPos.right;

			if(left > end && $prev) {
				return $prev;
			} else if(right > end) {
				return node;
			} else {
				$prev = node;
				stack.push(node);
			}

		});


		if(found){
			return this.findTextEndRange(found, start, end);
		}

	}

	// end of chapter
	return this.findTextEndRange($prev, start, end);
};


Mapping.prototype.findTextStartRange = function(node, start, end){
	var ranges = this.splitTextNodeIntoRanges(node);
	var prev;
	var range;
	var pos;

	for (var i = 0; i < ranges.length; i++) {
		range = ranges[i];

		pos = range.getBoundingClientRect();

		if( pos.left >= start ) {
			return range;
		}

		prev = range;

	}

	return ranges[0];
};

Mapping.prototype.findTextEndRange = function(node, start, end){
	var ranges = this.splitTextNodeIntoRanges(node);
	var prev;
	var range;
	var pos;

	for (var i = 0; i < ranges.length; i++) {
		range = ranges[i];

		pos = range.getBoundingClientRect();

		if(pos.left > end && prev) {
			return prev;
		} else if(pos.right > end) {
			return range;
		}

		prev = range;

	}

	// Ends before limit
	return ranges[ranges.length-1];

};

Mapping.prototype.splitTextNodeIntoRanges = function(node, _splitter){
	var ranges = [];
	var textContent = node.textContent || "";
	var text = textContent.trim();
	var range;
	var rect;
	var list;
	var doc = node.ownerDocument;
	var splitter = _splitter || " ";

	pos = text.indexOf(splitter);

	if(pos === -1 || node.nodeType != Node.TEXT_NODE) {
		range = doc.createRange();
		range.selectNodeContents(node);
		return [range];
	}

	range = doc.createRange();
	range.setStart(node, 0);
	range.setEnd(node, pos);
	ranges.push(range);
	range = false;

	while ( pos != -1 ) {

		pos = text.indexOf(splitter, pos + 1);
		if(pos > 0) {

			if(range) {
				range.setEnd(node, pos);
				ranges.push(range);
			}

			range = doc.createRange();
			range.setStart(node, pos+1);
		}
	}

	if(range) {
		range.setEnd(node, text.length);
		ranges.push(range);
	}

	return ranges;
};



Mapping.prototype.rangePairToCfiPair = function(cfiBase, rangePair){

	var startRange = rangePair.start;
	var endRange = rangePair.end;

	startRange.collapse(true);
	endRange.collapse(true);

	// startCfi = section.cfiFromRange(startRange);
	// endCfi = section.cfiFromRange(endRange);
	startCfi = new EpubCFI(startRange, cfiBase).toString();
	endCfi = new EpubCFI(endRange, cfiBase).toString();

	return {
		start: startCfi,
		end: endCfi
	};

};

Mapping.prototype.rangeListToCfiList = function(cfiBase, columns){
	var map = [];
	var rangePair, cifPair;

	for (var i = 0; i < columns.length; i++) {
		cifPair = this.rangePairToCfiPair(cfiBase, columns[i]);

		map.push(cifPair);

	}

	return map;
};

module.exports = Mapping;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);

/**
 * Queue for handling tasks one at a time
 * @class
 * @param {scope} context what this will resolve to in the tasks
 */
function Queue(context){
	this._q = [];
	this.context = context;
	this.tick = core.requestAnimationFrame;
	this.running = false;
	this.paused = false;
};

/**
 * Add an item to the queue
 * @return {Promise}
 */
Queue.prototype.enqueue = function() {
	var deferred, promise;
	var queued;
	var task = [].shift.call(arguments);
	var args = arguments;

	// Handle single args without context
	// if(args && !Array.isArray(args)) {
	//   args = [args];
	// }
	if(!task) {
		return console.error("No Task Provided");
	}

	if(typeof task === "function"){

		deferred = new core.defer();
		promise = deferred.promise;

		queued = {
			"task" : task,
			"args"     : args,
			//"context"  : context,
			"deferred" : deferred,
			"promise" : promise
		};

	} else {
		// Task is a promise
		queued = {
			"promise" : task
		};

	}

	this._q.push(queued);

	// Wait to start queue flush
	if (this.paused == false && !this.running) {
		// setTimeout(this.flush.bind(this), 0);
		// this.tick.call(window, this.run.bind(this));
		this.run();
	}

	return queued.promise;
};

/**
 * Run one item
 * @return {Promise}
 */
Queue.prototype.dequeue = function(){
	var inwait, task, result;

	if(this._q.length) {
		inwait = this._q.shift();
		task = inwait.task;
		if(task){
			// console.log(task)

			result = task.apply(this.context, inwait.args);

			if(result && typeof result["then"] === "function") {
				// Task is a function that returns a promise
				return result.then(function(){
					inwait.deferred.resolve.apply(this.context, arguments);
				}, function(reason) {
				  	inwait.deferred.reject.apply(this.context, arguments);
				}.bind(this));
			} else {
				// Task resolves immediately
				inwait.deferred.resolve.apply(this.context, result);
				return inwait.promise;
			}



		} else if(inwait.promise) {
			// Task is a promise
			return inwait.promise;
		}

	} else {
		inwait = new core.defer();
		inwait.deferred.resolve();
		return inwait.promise;
	}

};

// Run All Immediately
Queue.prototype.dump = function(){
	while(this._q.length) {
		this.dequeue();
	}
};

/**
 * Run all tasks sequentially, at convince
 * @return {Promise}
 */
Queue.prototype.run = function(){

	if(!this.running){
		this.running = true;
		this.defered = new core.defer();
	}

	this.tick.call(window, function() {

		if(this._q.length) {

			this.dequeue()
				.then(function(){
					this.run();
				}.bind(this));

		} else {
			this.defered.resolve();
			this.running = undefined;
		}

	}.bind(this));

	// Unpause
	if(this.paused == true) {
		this.paused = false;
	}

	return this.defered.promise;
};

/**
 * Flush all, as quickly as possible
 * @return {Promise}
 */
Queue.prototype.flush = function(){

	if(this.running){
		return this.running;
	}

	if(this._q.length) {
		this.running = this.dequeue()
			.then(function(){
				this.running = undefined;
				return this.flush();
			}.bind(this));

		return this.running;
	}

};

/**
 * Clear all items in wait
 */
Queue.prototype.clear = function(){
	this._q = [];
	this.running = false;
};

/**
 * Get the number of tasks in the queue
 * @return {int} tasks
 */
Queue.prototype.length = function(){
	return this._q.length;
};

/**
 * Pause a running queue
 */
Queue.prototype.pause = function(){
	this.paused = true;
};

/**
 * Create a new task from a callback
 * @class
 * @private
 * @param {function} task
 * @param {array} args
 * @param {scope} context
 * @return {function} task
 */
function Task(task, args, context){

	return function(){
		var toApply = arguments || [];

		return new Promise(function(resolve, reject) {
			var callback = function(value){
				resolve(value);
			};
			// Add the callback to the arguments list
			toApply.push(callback);

			// Apply all arguments to the functions
			task.apply(this, toApply);

	}.bind(this));

	};

};

module.exports = Queue;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

// var URI = require('urijs');
var core = __webpack_require__(0);
var Url = __webpack_require__(0).Url;

function base(doc, section){
	var base;
	var head;

	if(!doc){
		return;
	}

	// head = doc.querySelector("head");
	// base = head.querySelector("base");
	head = core.qs(doc, "head");
	base = core.qs(head, "base");

	if(!base) {
		base = doc.createElement("base");
		head.insertBefore(base, head.firstChild);
	}

	base.setAttribute("href", section.url);
}

function canonical(doc, section){
	var head;
	var link;
	var url = section.url; // window.location.origin +  window.location.pathname + "?loc=" + encodeURIComponent(section.url);

	if(!doc){
		return;
	}

	head = core.qs(doc, "head");
	link = core.qs(head, "link[rel='canonical']");

	if (link) {
		link.setAttribute("href", url);
	} else {
		link = doc.createElement("link");
		link.setAttribute("rel", "canonical");
		link.setAttribute("href", url);
		head.appendChild(link);
	}
}

function links(view, renderer) {

	var links = view.document.querySelectorAll("a[href]");
	var replaceLinks = function(link){
		var href = link.getAttribute("href");

		if(href.indexOf("mailto:") === 0){
			return;
		}

		var linkUrl = Url(href);
		var relative = this.book.resolve(href, false);

		if(linkUrl && linkUrl.protocol){

			link.setAttribute("target", "_blank");

		}else{
			/*
			if(baseDirectory) {
				// We must ensure that the file:// protocol is preserved for
				// local file links, as in certain contexts (such as under
				// Titanium), file links without the file:// protocol will not
				// work
				if (baseUri.protocol === "file") {
					relative = core.resolveUrl(baseUri.base, href);
				} else {
					relative = core.resolveUrl(baseDirectory, href);
				}
			} else {
				relative = href;
			}
			*/

			if(linkUrl.fragment) {
				// do nothing with fragment yet
			} else {
				link.onclick = function(){
					renderer.display(relative);
					return false;
				};
			}

		}
	}.bind(this);

	for (var i = 0; i < links.length; i++) {
		replaceLinks(links[i]);
	}


};

function substitute(content, urls, replacements) {
	urls.forEach(function(url, i){
		if (url && replacements[i]) {
			content = content.replace(new RegExp(url, 'g'), replacements[i]);
		}
	});
	return content;
}
module.exports = {
	'base': base,
	'canonical' : canonical,
	'links': links,
	'substitute': substitute
};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var Path = __webpack_require__(0).Path;

function request(url, type, withCredentials, headers) {
	var supportsURL = (typeof window != "undefined") ? window.URL : false; // TODO: fallback for url if window isn't defined
	var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";
	var uri;

	var deferred = new core.defer();

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
		type = new Path(url).extension;
	}

	if(type == 'blob'){
		xhr.responseType = BLOB_RESPONSE;
	}


	if(core.isXml(type)) {
		// xhr.responseType = "document";
		xhr.overrideMimeType('text/xml'); // for OPF parsing
	}

	if(type == 'xhtml') {
		// xhr.responseType = "document";
	}

	if(type == 'html' || type == 'htm') {
		// xhr.responseType = "document";
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
			var responseXML = false;

			if(this.responseType === '' || this.responseType === "document") {
				responseXML = this.responseXML;
			}

			if (this.status === 200 || responseXML ) { //-- Firefox is reporting 0 for blob urls
				var r;

				if (!this.response && !responseXML) {
					deferred.reject({
						status: this.status,
						message : "Empty Response",
						stack : new Error().stack
					});
					return deferred.promise;
				}

				if (this.status === 403) {
					deferred.reject({
						status: this.status,
						response: this.response,
						message : "Forbidden",
						stack : new Error().stack
					});
					return deferred.promise;
				}

				if(responseXML){
					r = this.responseXML;
				} else
				if(core.isXml(type)){
					// xhr.overrideMimeType('text/xml'); // for OPF parsing
					// If this.responseXML wasn't set, try to parse using a DOMParser from text
					r = core.parse(this.response, "text/xml");
				}else
				if(type == 'xhtml'){
					r = core.parse(this.response, "application/xhtml+xml");
				}else
				if(type == 'html' || type == 'htm'){
					r = core.parse(this.response, "text/html");
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


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(3);
var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);
var Mapping = __webpack_require__(7);


function Contents(doc, content, cfiBase) {
	// Blank Cfi for Parsing
	this.epubcfi = new EpubCFI();

	this.document = doc;
	this.documentElement =  this.document.documentElement;
	this.content = content || this.document.body;
	this.window = this.document.defaultView;
	// Dom events to listen for
	this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

	this._size = {
		width: 0,
		height: 0
	}

	this.cfiBase = cfiBase || "";

	this.listeners();
};

Contents.prototype.width = function(w) {
	// var frame = this.documentElement;
	var frame = this.content;

	if (w && core.isNumber(w)) {
		w = w + "px";
	}

	if (w) {
		frame.style.width = w;
		// this.content.style.width = w;
	}

	return this.window.getComputedStyle(frame)['width'];


};

Contents.prototype.height = function(h) {
	// var frame = this.documentElement;
	var frame = this.content;

	if (h && core.isNumber(h)) {
		h = h + "px";
	}

	if (h) {
		frame.style.height = h;
		// this.content.style.height = h;
	}

	return this.window.getComputedStyle(frame)['height'];

};

Contents.prototype.contentWidth = function(w) {

	var content = this.content || this.document.body;

	if (w && core.isNumber(w)) {
		w = w + "px";
	}

	if (w) {
		content.style.width = w;
	}

	return this.window.getComputedStyle(content)['width'];


};

Contents.prototype.contentHeight = function(h) {

	var content = this.content || this.document.body;

	if (h && core.isNumber(h)) {
		h = h + "px";
	}

	if (h) {
		content.style.height = h;
	}

	return this.window.getComputedStyle(content)['height'];

};

Contents.prototype.textWidth = function() {
	var width;
	var range = this.document.createRange();
	var content = this.content || this.document.body;

	// Select the contents of frame
	range.selectNodeContents(content);

	// get the width of the text content
	width = range.getBoundingClientRect().width;

	return width;

};

Contents.prototype.textHeight = function() {
	var height;
	var range = this.document.createRange();
	var content = this.content || this.document.body;

	range.selectNodeContents(content);

	height = range.getBoundingClientRect().height;

	return height;
};

Contents.prototype.scrollWidth = function() {
	var width = this.documentElement.scrollWidth;

	return width;
};

Contents.prototype.scrollHeight = function() {
	var height = this.documentElement.scrollHeight;

	return height;
};

Contents.prototype.overflow = function(overflow) {

	if (overflow) {
		this.documentElement.style.overflow = overflow;
	}

	return this.window.getComputedStyle(this.documentElement)['overflow'];
};

Contents.prototype.overflowX = function(overflow) {

	if (overflow) {
		this.documentElement.style.overflowX = overflow;
	}

	return this.window.getComputedStyle(this.documentElement)['overflowX'];
};

Contents.prototype.overflowY = function(overflow) {

	if (overflow) {
		this.documentElement.style.overflowY = overflow;
	}

	return this.window.getComputedStyle(this.documentElement)['overflowY'];
};

Contents.prototype.css = function(property, value) {
	var content = this.content || this.document.body;

	if (value) {
		content.style[property] = value;
	}

	return this.window.getComputedStyle(content)[property];
};

Contents.prototype.viewport = function(options) {
	var width, height, scale, scalable;
	var $viewport = this.document.querySelector("meta[name='viewport']");
	var newContent = '';

	/*
	* check for the viewport size
	* <meta name="viewport" content="width=1024,height=697" />
	*/
	if($viewport && $viewport.hasAttribute("content")) {
		content = $viewport.getAttribute("content");
		contents = content.split(/\s*,\s*/);
		if(contents[0]){
			width = contents[0].replace("width=", '').trim();
		}
		if(contents[1]){
			height = contents[1].replace("height=", '').trim();
		}
		if(contents[2]){
			scale = contents[2].replace("initial-scale=", '').trim();
		}
		if(contents[3]){
			scalable = contents[3].replace("user-scalable=", '').trim();
		}
	}

	if (options) {

		newContent += "width=" + (options.width || width);
		newContent += ", height=" + (options.height || height);
		if (options.scale || scale) {
			newContent += ", initial-scale=" + (options.scale || scale);
		}
		if (options.scalable || scalable) {
			newContent += ", user-scalable=" + (options.scalable || scalable);
		}

		if (!$viewport) {
			$viewport = this.document.createElement("meta");
			$viewport.setAttribute("name", "viewport");
			this.document.querySelector('head').appendChild($viewport);
		}

		$viewport.setAttribute("content", newContent);
	}


	return {
		width: parseInt(width),
		height: parseInt(height)
	};
};


// Contents.prototype.layout = function(layoutFunc) {
//
//   this.iframe.style.display = "inline-block";
//
//   // Reset Body Styles
//   this.content.style.margin = "0";
//   //this.document.body.style.display = "inline-block";
//   //this.document.documentElement.style.width = "auto";
//
//   if(layoutFunc){
//     layoutFunc(this);
//   }
//
//   this.onLayout(this);
//
// };
//
// Contents.prototype.onLayout = function(view) {
//   // stub
// };

Contents.prototype.expand = function() {
	this.emit("expand");
};

Contents.prototype.listeners = function() {

	this.imageLoadListeners();

	this.mediaQueryListeners();

	// this.fontLoadListeners();

	this.addEventListeners();

	this.addSelectionListeners();

	this.resizeListeners();

};

Contents.prototype.removeListeners = function() {

	this.removeEventListeners();

	this.removeSelectionListeners();
};

Contents.prototype.resizeListeners = function() {
	var width, height;
	// Test size again
	clearTimeout(this.expanding);

	width = this.scrollWidth();
	height = this.scrollHeight();

	if (width != this._size.width || height != this._size.height) {

		this._size = {
			width: width,
			height: height
		}

		this.emit("resize", this._size);
	}

	this.expanding = setTimeout(this.resizeListeners.bind(this), 350);
};

//https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
Contents.prototype.mediaQueryListeners = function() {
		var sheets = this.document.styleSheets;
		var mediaChangeHandler = function(m){
			if(m.matches && !this._expanding) {
				setTimeout(this.expand.bind(this), 1);
				// this.expand();
			}
		}.bind(this);

		for (var i = 0; i < sheets.length; i += 1) {
				var rules;
				// Firefox errors if we access cssRules cross-domain
				try {
					rules = sheets[i].cssRules;
				} catch (e) {
					return;
				}
				if(!rules) return; // Stylesheets changed
				for (var j = 0; j < rules.length; j += 1) {
						//if (rules[j].constructor === CSSMediaRule) {
						if(rules[j].media){
								var mql = this.window.matchMedia(rules[j].media.mediaText);
								mql.addListener(mediaChangeHandler);
								//mql.onchange = mediaChangeHandler;
						}
				}
		}
};

Contents.prototype.observe = function(target) {
	var renderer = this;

	// create an observer instance
	var observer = new MutationObserver(function(mutations) {
		if(renderer._expanding) {
			renderer.expand();
		}
		// mutations.forEach(function(mutation) {
		//   console.log(mutation);
		// });
	});

	// configuration of the observer:
	var config = { attributes: true, childList: true, characterData: true, subtree: true };

	// pass in the target node, as well as the observer options
	observer.observe(target, config);

	return observer;
};

Contents.prototype.imageLoadListeners = function(target) {
	var images = this.document.querySelectorAll("img");
	var img;
	for (var i = 0; i < images.length; i++) {
		img = images[i];

		if (typeof img.naturalWidth !== "undefined" &&
				img.naturalWidth === 0) {
			img.onload = this.expand.bind(this);
		}
	}
};

Contents.prototype.fontLoadListeners = function(target) {
	if (!this.document || !this.document.fonts) {
		return;
	}

	this.document.fonts.ready.then(function () {
		this.expand();
	}.bind(this));

};

Contents.prototype.root = function() {
	if(!this.document) return null;
	return this.document.documentElement;
};

Contents.prototype.locationOf = function(target, ignoreClass) {
	var position;
	var targetPos = {"left": 0, "top": 0};

	if(!this.document) return;

	if(this.epubcfi.isCfiString(target)) {
		range = new EpubCFI(target).toRange(this.document, ignoreClass);

		if(range) {
			if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
				position = range.startContainer.getBoundingClientRect();
				targetPos.left = position.left;
				targetPos.top = position.top;
			} else {
				// Webkit does not handle collapsed range bounds correctly
				// https://bugs.webkit.org/show_bug.cgi?id=138949
				if (range.collapsed) {
					position = range.getClientRects()[0];
				} else {
					position = range.getBoundingClientRect();
				}
				targetPos.left = position.left;
				targetPos.top = position.top;
			}
		}

	} else if(typeof target === "string" &&
		target.indexOf("#") > -1) {

		id = target.substring(target.indexOf("#")+1);
		el = this.document.getElementById(id);

		if(el) {
			position = el.getBoundingClientRect();
			targetPos.left = position.left;
			targetPos.top = position.top;
		}
	}

	return targetPos;
};

Contents.prototype.addStylesheet = function(src) {
	return new Promise(function(resolve, reject){
		var $stylesheet;
		var ready = false;

		if(!this.document) {
			resolve(false);
			return;
		}

		$stylesheet = this.document.createElement('link');
		$stylesheet.type = 'text/css';
		$stylesheet.rel = "stylesheet";
		$stylesheet.href = src;
		$stylesheet.onload = $stylesheet.onreadystatechange = function() {
			if ( !ready && (!this.readyState || this.readyState == 'complete') ) {
				ready = true;
				// Let apply
				setTimeout(function(){
					resolve(true);
				}, 1);
			}
		};

		this.document.head.appendChild($stylesheet);

	}.bind(this));
};

// https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
Contents.prototype.addStylesheetRules = function(rules) {
	var styleEl;
	var styleSheet;

	if(!this.document) return;

	styleEl = this.document.createElement('style');

	// Append style element to head
	this.document.head.appendChild(styleEl);

	// Grab style sheet
	styleSheet = styleEl.sheet;

	for (var i = 0, rl = rules.length; i < rl; i++) {
		var j = 1, rule = rules[i], selector = rules[i][0], propStr = '';
		// If the second argument of a rule is an array of arrays, correct our variables.
		if (Object.prototype.toString.call(rule[1][0]) === '[object Array]') {
			rule = rule[1];
			j = 0;
		}

		for (var pl = rule.length; j < pl; j++) {
			var prop = rule[j];
			propStr += prop[0] + ':' + prop[1] + (prop[2] ? ' !important' : '') + ';\n';
		}

		// Insert CSS Rule
		styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);
	}
};

Contents.prototype.addScript = function(src) {

	return new Promise(function(resolve, reject){
		var $script;
		var ready = false;

		if(!this.document) {
			resolve(false);
			return;
		}

		$script = this.document.createElement('script');
		$script.type = 'text/javascript';
		$script.async = true;
		$script.src = src;
		$script.onload = $script.onreadystatechange = function() {
			if ( !ready && (!this.readyState || this.readyState == 'complete') ) {
				ready = true;
				setTimeout(function(){
					resolve(true);
				}, 1);
			}
		};

		this.document.head.appendChild($script);

	}.bind(this));
};

Contents.prototype.addEventListeners = function(){
	if(!this.document) {
		return;
	}
	this.listenedEvents.forEach(function(eventName){
		this.document.addEventListener(eventName, this.triggerEvent.bind(this), false);
	}, this);

};

Contents.prototype.removeEventListeners = function(){
	if(!this.document) {
		return;
	}
	this.listenedEvents.forEach(function(eventName){
		this.document.removeEventListener(eventName, this.triggerEvent, false);
	}, this);

};

// Pass browser events
Contents.prototype.triggerEvent = function(e){
	this.emit(e.type, e);
};

Contents.prototype.addSelectionListeners = function(){
	if(!this.document) {
		return;
	}
	this.document.addEventListener("selectionchange", this.onSelectionChange.bind(this), false);
};

Contents.prototype.removeSelectionListeners = function(){
	if(!this.document) {
		return;
	}
	this.document.removeEventListener("selectionchange", this.onSelectionChange, false);
};

Contents.prototype.onSelectionChange = function(e){
	if (this.selectionEndTimeout) {
		clearTimeout(this.selectionEndTimeout);
	}
	this.selectionEndTimeout = setTimeout(function() {
		var selection = this.window.getSelection();
		this.triggerSelectedEvent(selection);
	}.bind(this), 500);
};

Contents.prototype.triggerSelectedEvent = function(selection){
	var range, cfirange;

	if (selection && selection.rangeCount > 0) {
		range = selection.getRangeAt(0);
		if(!range.collapsed) {
			// cfirange = this.section.cfiFromRange(range);
			cfirange = new EpubCFI(range, this.cfiBase).toString();
			this.emit("selected", cfirange);
			this.emit("selectedRange", range);
		}
	}
};

Contents.prototype.range = function(_cfi, ignoreClass){
	var cfi = new EpubCFI(_cfi);
	return cfi.toRange(this.document, ignoreClass);
};

Contents.prototype.map = function(layout){
	var map = new Mapping(layout);
	return map.section();
};

Contents.prototype.size = function(width, height){

	if (width >= 0) {
		this.width(width);
	}

	if (height >= 0) {
		this.height(height);
	}

	this.css("margin", "0");
	this.css("boxSizing", "border-box");

};

Contents.prototype.columns = function(width, height, columnWidth, gap){
	var COLUMN_AXIS = core.prefixed('columnAxis');
	var COLUMN_GAP = core.prefixed('columnGap');
	var COLUMN_WIDTH = core.prefixed('columnWidth');
	var COLUMN_FILL = core.prefixed('columnFill');
	var textWidth;

	this.width(width);
	this.height(height);

	// Deal with Mobile trying to scale to viewport
	this.viewport({ width: width, height: height, scale: 1.0 });

	// this.overflowY("hidden");
	this.css("overflowY", "hidden");
	this.css("margin", "0");
	this.css("boxSizing", "border-box");
	this.css("maxWidth", "inherit");

	this.css(COLUMN_AXIS, "horizontal");
	this.css(COLUMN_FILL, "auto");

	this.css(COLUMN_GAP, gap+"px");
	this.css(COLUMN_WIDTH, columnWidth+"px");
};

Contents.prototype.scale = function(scale, offsetX, offsetY){
	var scale = "scale(" + scale + ")";
	var translate = '';
	// this.css("position", "absolute"));
	this.css("transformOrigin", "top left");

	if (offsetX >= 0 || offsetY >= 0) {
		translate = " translate(" + (offsetX || 0 )+ "px, " + (offsetY || 0 )+ "px )";
	}

	this.css("transform", scale + translate);
};

Contents.prototype.fit = function(width, height){
	var viewport = this.viewport();
	var widthScale = width / viewport.width;
	var heightScale = height / viewport.height;
	var scale = widthScale < heightScale ? widthScale : heightScale;

	var offsetY = (height - (viewport.height * scale)) / 2;

	this.width(width);
	this.height(height);
	this.overflow("hidden");

	// Deal with Mobile trying to scale to viewport
	this.viewport({ scale: 1.0 });

	// Scale to the correct size
	this.scale(scale, 0, offsetY);

	this.css("backgroundColor", "transparent");
};

Contents.prototype.mapPage = function(cfiBase, start, end) {
	var mapping = new Mapping();

	return mapping.page(this, cfiBase, start, end);
};

Contents.prototype.destroy = function() {
	// Stop observing
	if(this.observer) {
		this.observer.disconnect();
	}

	this.removeListeners();

};

EventEmitter(Contents.prototype);

module.exports = Contents;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(3);
var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);
var Mapping = __webpack_require__(7);
var Queue = __webpack_require__(8);
var Stage = __webpack_require__(40);
var Views = __webpack_require__(41);

function DefaultViewManager(options) {

	this.name = "default";
	this.View = options.view;
	this.request = options.request;
	this.renditionQueue = options.queue;
	this.q = new Queue(this);

	this.settings = core.extend(this.settings || {}, {
		infinite: true,
		hidden: false,
		width: undefined,
		height: undefined,
		// globalLayoutProperties : { layout: 'reflowable', spread: 'auto', orientation: 'auto'},
		// layout: null,
		axis: "vertical",
		ignoreClass: ''
	});

	core.extend(this.settings, options.settings || {});

	this.viewSettings = {
		ignoreClass: this.settings.ignoreClass,
		axis: this.settings.axis,
		layout: this.layout,
		width: 0,
		height: 0
	};

}

DefaultViewManager.prototype.render = function(element, size){

	// Save the stage
	this.stage = new Stage({
		width: size.width,
		height: size.height,
		overflow: this.settings.overflow,
		hidden: this.settings.hidden,
		axis: this.settings.axis
	});

	this.stage.attachTo(element);

	// Get this stage container div
	this.container = this.stage.getContainer();

	// Views array methods
	this.views = new Views(this.container);

	// Calculate Stage Size
	this._bounds = this.bounds();
	this._stageSize = this.stage.size();

	// Set the dimensions for views
	this.viewSettings.width = this._stageSize.width;
	this.viewSettings.height = this._stageSize.height;

	// Function to handle a resize event.
	// Will only attach if width and height are both fixed.
	this.stage.onResize(this.onResized.bind(this));

	// Add Event Listeners
	this.addEventListeners();

	// Add Layout method
	// this.applyLayoutMethod();
	if (this.layout) {
		this.updateLayout();
	}
};

DefaultViewManager.prototype.addEventListeners = function(){
	window.addEventListener('unload', function(e){
		this.destroy();
	}.bind(this));
};

DefaultViewManager.prototype.destroy = function(){
	// this.views.each(function(view){
	// 	view.destroy();
	// });

	/*

		clearTimeout(this.trimTimeout);
		if(this.settings.hidden) {
			this.element.removeChild(this.wrapper);
		} else {
			this.element.removeChild(this.container);
		}
	*/
};

DefaultViewManager.prototype.onResized = function(e) {
	clearTimeout(this.resizeTimeout);
	this.resizeTimeout = setTimeout(function(){
		this.resize();
	}.bind(this), 150);
};

DefaultViewManager.prototype.resize = function(width, height){

	// Clear the queue
	this.q.clear();

	this._stageSize = this.stage.size(width, height);
	this._bounds = this.bounds();

	// Update for new views
	this.viewSettings.width = this._stageSize.width;
	this.viewSettings.height = this._stageSize.height;

	// Update for existing views
	this.views.each(function(view) {
		view.size(this._stageSize.width, this._stageSize.height);
	}.bind(this));

	this.updateLayout();

	this.emit("resized", {
		width: this.stage.width,
		height: this.stage.height
	});

};

DefaultViewManager.prototype.createView = function(section) {
	return new this.View(section, this.viewSettings);
};

DefaultViewManager.prototype.display = function(section, target){

	var displaying = new core.defer();
	var displayed = displaying.promise;

	// Check to make sure the section we want isn't already shown
	var visible = this.views.find(section);

	// View is already shown, just move to correct location
	if(visible && target) {
		offset = visible.locationOf(target);
		this.moveTo(offset);
		displaying.resolve();
		return displayed;
	}

	// Hide all current views
	this.views.hide();

	this.views.clear();

	this.add(section)
		.then(function(view){

			// Move to correct place within the section, if needed
			if(target) {
				offset = view.locationOf(target);
				this.moveTo(offset);
			}

		}.bind(this))
		.then(function(){
			var next;
			if (this.layout.name === "pre-paginated" &&
					this.layout.divisor > 1) {
				next = section.next();
				if (next) {
					return this.add(next);
				}
			}
		}.bind(this))
		.then(function(){

			this.views.show();

			displaying.resolve();

		}.bind(this))
		// .then(function(){
		// 	return this.hooks.display.trigger(view);
		// }.bind(this))
		// .then(function(){
		// 	this.views.show();
		// }.bind(this));
		return displayed;
};

DefaultViewManager.prototype.afterDisplayed = function(view){
	this.emit("added", view);
};

DefaultViewManager.prototype.afterResized = function(view){
	this.emit("resize", view.section);
};

// DefaultViewManager.prototype.moveTo = function(offset){
// 	this.scrollTo(offset.left, offset.top);
// };

DefaultViewManager.prototype.moveTo = function(offset){
	var distX = 0,
			distY = 0;

	if(this.settings.axis === "vertical") {
		distY = offset.top;
	} else {
		distX = Math.floor(offset.left / this.layout.delta) * this.layout.delta;

		if (distX + this.layout.delta > this.container.scrollWidth) {
			distX = this.container.scrollWidth - this.layout.delta;
		}
	}

	this.scrollTo(distX, distY);
};

DefaultViewManager.prototype.add = function(section){
	var view = this.createView(section);

	this.views.append(view);

	// view.on("shown", this.afterDisplayed.bind(this));
	view.onDisplayed = this.afterDisplayed.bind(this);
	view.onResize = this.afterResized.bind(this);

	return view.display(this.request);

};

DefaultViewManager.prototype.append = function(section){
	var view = this.createView(section);
	this.views.append(view);
	return view.display(this.request);
};

DefaultViewManager.prototype.prepend = function(section){
	var view = this.createView(section);

	this.views.prepend(view);
	return view.display(this.request);
};
// DefaultViewManager.prototype.resizeView = function(view) {
//
// 	if(this.settings.globalLayoutProperties.layout === "pre-paginated") {
// 		view.lock("both", this.bounds.width, this.bounds.height);
// 	} else {
// 		view.lock("width", this.bounds.width, this.bounds.height);
// 	}
//
// };

DefaultViewManager.prototype.next = function(){
	var next;
	var view;
	var left;

	if(!this.views.length) return;

	if(this.settings.axis === "horizontal") {

		this.scrollLeft = this.container.scrollLeft;

		left = this.container.scrollLeft + this.container.offsetWidth + this.layout.delta;

		if(left < this.container.scrollWidth) {
			this.scrollBy(this.layout.delta, 0);
		} else if (left - this.layout.columnWidth === this.container.scrollWidth) {
			this.scrollTo(this.container.scrollWidth - this.layout.delta, 0);
		} else {
			next = this.views.last().section.next();
		}


	} else {

		next = this.views.last().section.next();

	}

	if(next) {
		this.views.clear();

		return this.append(next)
			.then(function(){
				var right;
				if (this.layout.name && this.layout.divisor > 1) {
					right = next.next();
					if (right) {
						return this.append(right);
					}
				}
			}.bind(this))
			.then(function(){
				this.views.show();
			}.bind(this));
	}


};

DefaultViewManager.prototype.prev = function(){
	var prev;
	var view;
	var left;

	if(!this.views.length) return;

	if(this.settings.axis === "horizontal") {

		this.scrollLeft = this.container.scrollLeft;

		left = this.container.scrollLeft;

		if(left > 0) {
			this.scrollBy(-this.layout.delta, 0);
		} else {
			prev = this.views.first().section.prev();
		}


	} else {

		prev = this.views.first().section.prev();

	}

	if(prev) {
		this.views.clear();

		return this.prepend(prev)
			.then(function(){
				var left;
				if (this.layout.name && this.layout.divisor > 1) {
					left = prev.prev();
					if (left) {
						return this.prepend(left);
					}
				}
			}.bind(this))
			.then(function(){
				if(this.settings.axis === "horizontal") {
					this.scrollTo(this.container.scrollWidth - this.layout.delta, 0);
				}
				this.views.show();
			}.bind(this));
	}
};

DefaultViewManager.prototype.current = function(){
	var visible = this.visible();
	if(visible.length){
		// Current is the last visible view
		return visible[visible.length-1];
	}
	return null;
};

DefaultViewManager.prototype.currentLocation = function(){

	if (this.settings.axis === "vertical") {
		this.location = this.scrolledLocation();
	} else {
		this.location = this.paginatedLocation();
	}
	return this.location;
};

DefaultViewManager.prototype.scrolledLocation = function(){
	var view;

	if(this.views.length) {
		view = this.views.first();
		return this.mapping.page(view, view.section.cfiBase);
	}

};

DefaultViewManager.prototype.paginatedLocation = function(){
	var view;
	var start, end;

	if(this.views.length) {
		view = this.views.first();
		start = this._bounds.left - view.position().left;
		end = start + this.layout.spreadWidth;
		return this.mapping.page(view, view.section.cfiBase, start, end);
	}

};

DefaultViewManager.prototype.isVisible = function(view, offsetPrev, offsetNext, _container){
	var position = view.position();
	var container = _container || this.bounds();

	if(this.settings.axis === "horizontal" &&
		position.right > container.left - offsetPrev &&
		position.left < container.right + offsetNext) {

		return true;

	} else if(this.settings.axis === "vertical" &&
		position.bottom > container.top - offsetPrev &&
		position.top < container.bottom + offsetNext) {

		return true;
	}

	return false;

};

DefaultViewManager.prototype.visible = function(){
	// return this.views.displayed();
	var container = this.bounds();
	var views = this.views.displayed();
	var viewsLength = views.length;
	var visible = [];
	var isVisible;
	var view;

	for (var i = 0; i < viewsLength; i++) {
		view = views[i];
		isVisible = this.isVisible(view, 0, 0, container);

		if(isVisible === true) {
			visible.push(view);
		}

	}
	return visible;
};

DefaultViewManager.prototype.scrollBy = function(x, y, silent){
	if(silent) {
		this.ignore = true;
	}

	if(this.settings.height) {

		if(x) this.container.scrollLeft += x;
		if(y) this.container.scrollTop += y;

	} else {
		window.scrollBy(x,y);
	}
	// console.log("scrollBy", x, y);
	this.scrolled = true;
	this.onScroll();
};

DefaultViewManager.prototype.scrollTo = function(x, y, silent){
	if(silent) {
		this.ignore = true;
	}

	if(this.settings.height) {
		this.container.scrollLeft = x;
		this.container.scrollTop = y;
	} else {
		window.scrollTo(x,y);
	}
	// console.log("scrollTo", x, y);
	this.scrolled = true;
	this.onScroll();
	// if(this.container.scrollLeft != x){
	//   setTimeout(function() {
	//     this.scrollTo(x, y, silent);
	//   }.bind(this), 10);
	//   return;
	// };
 };

DefaultViewManager.prototype.onScroll = function(){

};

DefaultViewManager.prototype.bounds = function() {
	var bounds;

	bounds = this.stage.bounds();

	return bounds;
};

DefaultViewManager.prototype.applyLayout = function(layout) {

	this.layout = layout;
	this.updateLayout();

	this.mapping = new Mapping(this.layout);
	 // this.manager.layout(this.layout.format);
};

DefaultViewManager.prototype.updateLayout = function() {
	if (!this.stage) {
		return;
	}

	this._stageSize = this.stage.size();

	if(this.settings.axis === "vertical") {
		this.layout.calculate(this._stageSize.width, this._stageSize.height);
	} else {
		this.layout.calculate(
			this._stageSize.width,
			this._stageSize.height,
			this.settings.gap
		);

		// Set the look ahead offset for what is visible
		this.settings.offset = this.layout.delta;

		this.stage.addStyleRules("iframe", [{"margin-right" : this.layout.gap + "px"}]);

	}

	// Set the dimensions for views
	this.viewSettings.width = this.layout.width;
	this.viewSettings.height = this.layout.height;

	this.setLayout(this.layout);

};

DefaultViewManager.prototype.setLayout = function(layout){

	this.viewSettings.layout = layout;

	if(this.views) {

		this.views.each(function(view){
			view.setLayout(layout);
		});

	}

};

DefaultViewManager.prototype.updateFlow = function(flow){
	var axis = (flow === "paginated") ? "horizontal" : "vertical";

	this.settings.axis = axis;

	this.viewSettings.axis = axis;

	this.settings.overflow = (flow === "paginated") ? "hidden" : "auto";
	// this.views.each(function(view){
	// 	view.setAxis(axis);
	// });

};

 //-- Enable binding events to Manager
 EventEmitter(DefaultViewManager.prototype);

 module.exports = DefaultViewManager;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(3);
var path = __webpack_require__(2);
var core = __webpack_require__(0);
var replace = __webpack_require__(9);
var Hook = __webpack_require__(6);
var EpubCFI = __webpack_require__(1);
var Queue = __webpack_require__(8);
var Layout = __webpack_require__(38);
var Mapping = __webpack_require__(7);
var Path = __webpack_require__(0).Path;

/**
 * [Rendition description]
 * @class
 * @param {Book} book
 * @param {object} options
 * @param {int} options.width
 * @param {int} options.height
 * @param {string} options.ignoreClass
 * @param {string} options.manager
 * @param {string} options.view
 * @param {string} options.layout
 * @param {string} options.spread
 * @param {int} options.minSpreadWidth overridden by spread: none (never) / both (always)
 */
function Rendition(book, options) {

	this.settings = core.extend(this.settings || {}, {
		width: null,
		height: null,
		ignoreClass: '',
		manager: "default",
		view: "iframe",
		flow: null,
		layout: null,
		spread: null,
		minSpreadWidth: 800
	});

	core.extend(this.settings, options);

	if (typeof(this.settings.manager) === "object") {
		this.manager = this.settings.manager;
	}

	this.viewSettings = {
		ignoreClass: this.settings.ignoreClass
	};

	this.book = book;

	this.views = null;

	/**
	 * Adds Hook methods to the Rendition prototype
	 * @property {Hook} hooks
	 */
	this.hooks = {};
	this.hooks.display = new Hook(this);
	this.hooks.serialize = new Hook(this);
	/**
	 * @property {method} hooks.content
	 * @type {Hook}
	 */
	this.hooks.content = new Hook(this);
	this.hooks.layout = new Hook(this);
	this.hooks.render = new Hook(this);
	this.hooks.show = new Hook(this);

	this.hooks.content.register(replace.links.bind(this));
	this.hooks.content.register(this.passViewEvents.bind(this));

	// this.hooks.display.register(this.afterDisplay.bind(this));

	this.epubcfi = new EpubCFI();

	this.q = new Queue(this);

	this.q.enqueue(this.book.opened);

	// Block the queue until rendering is started
	this.starting = new core.defer();
	this.started = this.starting.promise;
	this.q.enqueue(this.start);
};

/**
 * Set the manager function
 * @param {function} manager
 */
Rendition.prototype.setManager = function(manager) {
	this.manager = manager;
};

/**
 * Require the manager from passed string, or as a function
 * @param  {string|function} manager [description]
 * @return {method}
 */
Rendition.prototype.requireManager = function(manager) {
	var viewManager;

	// If manager is a string, try to load from register managers,
	// or require included managers directly
	if (typeof manager === "string") {
		// Use global or require
		viewManager = typeof ePub != "undefined" ? ePub.ViewManagers[manager] : undefined; //require('./managers/'+manager);
	} else {
		// otherwise, assume we were passed a function
		viewManager = manager
	}

	return viewManager;
};

/**
 * Require the view from passed string, or as a function
 * @param  {string|function} view
 * @return {view}
 */
Rendition.prototype.requireView = function(view) {
	var View;

	if (typeof view == "string") {
		View = typeof ePub != "undefined" ? ePub.Views[view] : undefined; //require('./views/'+view);
	} else {
		// otherwise, assume we were passed a function
		View = view
	}

	return View;
};

/**
 * Start the rendering
 * @return {Promise} rendering has started
 */
Rendition.prototype.start = function(){

	if(!this.manager) {
		this.ViewManager = this.requireManager(this.settings.manager);
		this.View = this.requireView(this.settings.view);

		this.manager = new this.ViewManager({
			view: this.View,
			queue: this.q,
			request: this.book.load.bind(this.book),
			settings: this.settings
		});
	}

	// Parse metadata to get layout props
	this.settings.globalLayoutProperties = this.determineLayoutProperties(this.book.package.metadata);

	this.flow(this.settings.globalLayoutProperties.flow);

	this.layout(this.settings.globalLayoutProperties);

	// Listen for displayed views
	this.manager.on("added", this.afterDisplayed.bind(this));

	// Listen for resizing
	this.manager.on("resized", this.onResized.bind(this));

	// Listen for scroll changes
	this.manager.on("scroll", this.reportLocation.bind(this));


	this.on('displayed', this.reportLocation.bind(this));

	// Trigger that rendering has started
	this.emit("started");

	// Start processing queue
	this.starting.resolve();
};

/**
 * Call to attach the container to an element in the dom
 * Container must be attached before rendering can begin
 * @param  {element} element to attach to
 * @return {Promise}
 */
Rendition.prototype.attachTo = function(element){

	return this.q.enqueue(function () {

		// Start rendering
		this.manager.render(element, {
			"width"  : this.settings.width,
			"height" : this.settings.height
		});

		// Trigger Attached
		this.emit("attached");

	}.bind(this));

};

/**
 * Display a point in the book
 * The request will be added to the rendering Queue,
 * so it will wait until book is opened, rendering started
 * and all other rendering tasks have finished to be called.
 * @param  {string} target Url or EpubCFI
 * @return {Promise}
 */
Rendition.prototype.display = function(target){

	return this.q.enqueue(this._display, target);

};

/**
 * Tells the manager what to display immediately
 * @private
 * @param  {string} target Url or EpubCFI
 * @return {Promise}
 */
Rendition.prototype._display = function(target){
	var isCfiString = this.epubcfi.isCfiString(target);
	var displaying = new core.defer();
	var displayed = displaying.promise;
	var section;
	var moveTo;

	// Check if this is a book percentage
	if (this.book.locations.length && core.isFloat(target)) {
		console.log("percentage", target);
		target = book.locations.cfiFromPercentage(target);
		console.log("cfi", target);
	}

	section = this.book.spine.get(target);

	if(!section){
		displaying.reject(new Error("No Section Found"));
		return displayed;
	}

	// Trim the target fragment
	// removing the chapter
	if(!isCfiString && typeof target === "string" &&
		target.indexOf("#") > -1) {
			moveTo = target.substring(target.indexOf("#")+1);
	}

	if (isCfiString) {
		moveTo = target;
	}

	return this.manager.display(section, moveTo)
		.then(function(){
			// this.emit("displayed", section);
		}.bind(this));

};

/*
Rendition.prototype.render = function(view, show) {

	// view.onLayout = this.layout.format.bind(this.layout);
	view.create();

	// Fit to size of the container, apply padding
	this.manager.resizeView(view);

	// Render Chain
	return view.section.render(this.book.request)
		.then(function(contents){
			return view.load(contents);
		}.bind(this))
		.then(function(doc){
			return this.hooks.content.trigger(view, this);
		}.bind(this))
		.then(function(){
			this.layout.format(view.contents);
			return this.hooks.layout.trigger(view, this);
		}.bind(this))
		.then(function(){
			return view.display();
		}.bind(this))
		.then(function(){
			return this.hooks.render.trigger(view, this);
		}.bind(this))
		.then(function(){
			if(show !== false) {
				this.q.enqueue(function(view){
					view.show();
				}, view);
			}
			// this.map = new Map(view, this.layout);
			this.hooks.show.trigger(view, this);
			this.trigger("rendered", view.section);

		}.bind(this))
		.catch(function(e){
			this.trigger("loaderror", e);
		}.bind(this));

};
*/

/**
 * Report what has been displayed
 * @private
 * @param  {*} view
 */
Rendition.prototype.afterDisplayed = function(view){
	this.hooks.content.trigger(view, this);
	this.emit("rendered", view.section);
	this.reportLocation();
};

/**
 * Report resize events and display the last seen location
 * @private
 */
Rendition.prototype.onResized = function(size){

	if(this.location) {
		this.display(this.location.start);
	}

	this.emit("resized", {
		width: size.width,
		height: size.height
	});

};

/**
 * Move the Rendition to a specific offset
 * Usually you would be better off calling display()
 * @param {object} offset
 */
Rendition.prototype.moveTo = function(offset){
	this.manager.moveTo(offset);
};

/**
 * Go to the next "page" in the rendition
 * @return {Promise}
 */
Rendition.prototype.next = function(){
	return this.q.enqueue(this.manager.next.bind(this.manager))
		.then(this.reportLocation.bind(this));
};

/**
 * Go to the previous "page" in the rendition
 * @return {Promise}
 */
Rendition.prototype.prev = function(){
	return this.q.enqueue(this.manager.prev.bind(this.manager))
		.then(this.reportLocation.bind(this));
};

//-- http://www.idpf.org/epub/301/spec/epub-publications.html#meta-properties-rendering
/**
 * Determine the Layout properties from metadata and settings
 * @private
 * @param  {object} metadata
 * @return {object} properties
 */
Rendition.prototype.determineLayoutProperties = function(metadata){
	var properties;
	var layout = this.settings.layout || metadata.layout || "reflowable";
	var spread = this.settings.spread || metadata.spread || "auto";
	var orientation = this.settings.orientation || metadata.orientation || "auto";
	var flow = this.settings.flow || metadata.flow || "auto";
	var viewport = metadata.viewport || "";
	var minSpreadWidth = this.settings.minSpreadWidth || metadata.minSpreadWidth || 800;

	if (this.settings.width >= 0 && this.settings.height >= 0) {
		viewport = "width="+this.settings.width+", height="+this.settings.height+"";
	}

	properties = {
		layout : layout,
		spread : spread,
		orientation : orientation,
		flow : flow,
		viewport : viewport,
		minSpreadWidth : minSpreadWidth
	};

	return properties;
};

// Rendition.prototype.applyLayoutProperties = function(){
// 	var settings = this.determineLayoutProperties(this.book.package.metadata);
//
// 	this.flow(settings.flow);
//
// 	this.layout(settings);
// };

/**
 * Adjust the flow of the rendition to paginated or scrolled
 * (scrolled-continuous vs scrolled-doc are handled by different view managers)
 * @param  {string} flow
 */
Rendition.prototype.flow = function(flow){
	var _flow;
	if (flow === "scrolled-doc" || flow === "scrolled-continuous") {
		_flow = "scrolled";
	}

	if (flow === "auto" || flow === "paginated") {
		_flow = "paginated";
	}

	if (this._layout) {
		this._layout.flow(_flow);
	}

	if (this.manager) {
		this.manager.updateFlow(_flow);
	}
};

/**
 * Adjust the layout of the rendition to reflowable or pre-paginated
 * @param  {object} settings
 */
Rendition.prototype.layout = function(settings){
	if (settings) {
		this._layout = new Layout(settings);
		this._layout.spread(settings.spread, this.settings.minSpreadWidth);

		this.mapping = new Mapping(this._layout);
	}

	if (this.manager && this._layout) {
		this.manager.applyLayout(this._layout);
	}

	return this._layout;
};

/**
 * Adjust if the rendition uses spreads
 * @param  {string} spread none | auto (TODO: implement landscape, portrait, both)
 * @param  {int} min min width to use spreads at
 */
Rendition.prototype.spread = function(spread, min){

	this._layout.spread(spread, min);

	if (this.manager.isRendered()) {
		this.manager.updateLayout();
	}
};

/**
 * Report the current location
 * @private
 */
Rendition.prototype.reportLocation = function(){
	return this.q.enqueue(function(){
		var location = this.manager.currentLocation();
		if (location && location.then && typeof location.then === 'function') {
			location.then(function(result) {
				this.location = result;

				this.percentage = this.book.locations.percentageFromCfi(result);
				if (this.percentage != null) {
					this.location.percentage = this.percentage;
				}

				this.emit("locationChanged", this.location);
			}.bind(this));
		} else if (location) {
			this.location = location;
			this.percentage = this.book.locations.percentageFromCfi(location);
			if (this.percentage != null) {
				this.location.percentage = this.percentage;
			}

			this.emit("locationChanged", this.location);
		}

	}.bind(this));
};

/**
 * Get the Current Location CFI
 * @return {EpubCFI} location (may be a promise)
 */
Rendition.prototype.currentLocation = function(){
	var location = this.manager.currentLocation();
	if (location && location.then && typeof location.then === 'function') {
		location.then(function(result) {
			var percentage = this.book.locations.percentageFromCfi(result);
			if (percentage != null) {
				result.percentage = percentage;
			}
			return result;
		}.bind(this));
	} else if (location) {
		var percentage = this.book.locations.percentageFromCfi(location);
		if (percentage != null) {
			location.percentage = percentage;
		}
		return location;
	}
};

/**
 * Remove and Clean Up the Rendition
 */
Rendition.prototype.destroy = function(){
	// Clear the queue
	this.q.clear();

	this.manager.destroy();
};

/**
 * Pass the events from a view
 * @private
 * @param  {View} view
 */
Rendition.prototype.passViewEvents = function(view){
	view.contents.listenedEvents.forEach(function(e){
		view.on(e, this.triggerViewEvent.bind(this));
	}.bind(this));

	view.on("selected", this.triggerSelectedEvent.bind(this));
};

/**
 * Emit events passed by a view
 * @private
 * @param  {event} e
 */
Rendition.prototype.triggerViewEvent = function(e){
	this.emit(e.type, e);
};

/**
 * Emit a selection event's CFI Range passed from a a view
 * @private
 * @param  {EpubCFI} cfirange
 */
Rendition.prototype.triggerSelectedEvent = function(cfirange){
	this.emit("selected", cfirange);
};

/**
 * Get a Range from a Visible CFI
 * @param  {string} cfi EpubCfi String
 * @param  {string} ignoreClass
 * @return {range}
 */
Rendition.prototype.range = function(cfi, ignoreClass){
	var _cfi = new EpubCFI(cfi);
	var found = this.visible().filter(function (view) {
		if(_cfi.spinePos === view.index) return true;
	});

	// Should only every return 1 item
	if (found.length) {
		return found[0].range(_cfi, ignoreClass);
	}
};

/**
 * Hook to adjust images to fit in columns
 * @param  {View} view
 */
Rendition.prototype.adjustImages = function(view) {

	view.addStylesheetRules([
			["img",
				["max-width", (view.layout.spreadWidth) + "px"],
				["max-height", (view.layout.height) + "px"]
			]
	]);
	return new Promise(function(resolve, reject){
		// Wait to apply
		setTimeout(function() {
			resolve();
		}, 1);
	});
};

//-- Enable binding events to Renderer
EventEmitter(Rendition.prototype);

module.exports = Rendition;


/***/ },
/* 14 */
/***/ function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_14__;

/***/ },
/* 15 */,
/* 16 */,
/* 17 */
/***/ function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(3);
var path = __webpack_require__(2);
var core = __webpack_require__(0);
var Url = __webpack_require__(0).Url;
var Path = __webpack_require__(0).Path;
var Spine = __webpack_require__(47);
var Locations = __webpack_require__(39);
var Container = __webpack_require__(37);
var Packaging = __webpack_require__(43);
var Navigation = __webpack_require__(42);
var Resources = __webpack_require__(45);
var PageList = __webpack_require__(44);
var Rendition = __webpack_require__(13);
var Archive = __webpack_require__(36);
var request = __webpack_require__(10);
var EpubCFI = __webpack_require__(1);

// Const
var CONTAINER_PATH = "META-INF/container.xml";

/**
 * Creates a new Book
 * @class
 * @param {string} url
 * @param {object} options
 * @param {method} options.requestMethod a request function to use instead of the default
 * @param {boolean} [options.requestCredentials=undefined] send the xhr request withCredentials
 * @param {object} [options.requestHeaders=undefined] send the xhr request headers
 * @param {string} [options.encoding=binary] optional to pass 'binary' or base64' for archived Epubs
 * @param {string} [options.replacements=base64] use base64, blobUrl, or none for replacing assets in archived Epubs
 * @returns {Book}
 * @example new Book("/path/to/book.epub", {})
 * @example new Book({ replacements: "blobUrl" })
 */
function Book(url, options){

	// Allow passing just options to the Book
	if (typeof(options) === "undefined"
		&& typeof(url) === "object") {
		options = url;
		url = undefined;
	}

	this.settings = core.extend(this.settings || {}, {
		requestMethod: undefined,
		requestCredentials: undefined,
		requestHeaders: undefined,
		encoding: undefined,
		replacements: 'base64'
	});

	core.extend(this.settings, options);


	// Promises
	this.opening = new core.defer();
	/**
	 * @property {promise} opened returns after the book is loaded
	 */
	this.opened = this.opening.promise;
	this.isOpen = false;

	this.loading = {
		manifest: new core.defer(),
		spine: new core.defer(),
		metadata: new core.defer(),
		cover: new core.defer(),
		navigation: new core.defer(),
		pageList: new core.defer(),
		resources: new core.defer()
	};

	this.loaded = {
		manifest: this.loading.manifest.promise,
		spine: this.loading.spine.promise,
		metadata: this.loading.metadata.promise,
		cover: this.loading.cover.promise,
		navigation: this.loading.navigation.promise,
		pageList: this.loading.pageList.promise,
		resources: this.loading.resources.promise
	};

	// this.ready = RSVP.hash(this.loaded);
	/**
	 * @property {promise} ready returns after the book is loaded and parsed
	 * @private
	 */
	this.ready = Promise.all([this.loaded.manifest,
														this.loaded.spine,
														this.loaded.metadata,
														this.loaded.cover,
														this.loaded.navigation,
														this.loaded.resources ]);


	// Queue for methods used before opening
	this.isRendered = false;
	// this._q = core.queue(this);

	/**
	 * @property {method} request
	 * @private
	 */
	this.request = this.settings.requestMethod || request;

	/**
	 * @property {Spine} spine
	 */
	this.spine = new Spine();

	/**
	 * @property {Locations} locations
	 */
	this.locations = new Locations(this.spine, this.load.bind(this));

	/**
	 * @property {Navigation} navigation
	 */
	this.navigation = undefined;

	/**
	 * @property {PageList} pagelist
	 */
	this.pageList = new PageList();

	/**
	 * @property {Url} url
	 * @private
	 */
	this.url = undefined;

	/**
	 * @property {Path} path
	 * @private
	 */
	this.path = undefined;

	/**
	 * @property {boolean} archived
	 * @private
	 */
	this.archived = false;

	if(url) {
		this.open(url).catch(function (error) {
			var err = new Error("Cannot load book at "+ url );
			console.error(err);
			this.emit("openFailed", err);
			console.log(error);
		}.bind(this));
	}
};

/**
 * Open a epub or url
 * @param {string} input URL, Path or ArrayBuffer
 * @param {string} [what] to force opening
 * @returns {Promise} of when the book has been loaded
 * @example book.open("/path/to/book.epub")
 */
Book.prototype.open = function(input, what){
	var opening;
	var type = what || this.determineType(input);

	if (type === "binary") {
		this.archived = true;
		this.url = new Url("/", "");
		opening = this.openEpub(input);
	} else if (type === "epub") {
		this.archived = true;
		this.url = new Url("/", "");
		opening = this.request(input, 'binary')
			.then(this.openEpub.bind(this));
	} else if(type == "opf") {
		this.url = new Url(input);
		opening = this.openPackaging(this.url.Path.toString());
	} else {
		this.url = new Url(input);
		opening = this.openContainer(CONTAINER_PATH)
			.then(this.openPackaging.bind(this));
	}

	return opening;
};

/**
 * Open an archived epub
 * @private
 * @param  {binary} data
 * @param  {[string]} encoding
 * @return {Promise}
 */
Book.prototype.openEpub = function(data, encoding){
	return this.unarchive(data, encoding || this.settings.encoding)
		.then(function() {
			return this.openContainer(CONTAINER_PATH);
		}.bind(this))
		.then(function(packagePath) {
			return this.openPackaging(packagePath);
		}.bind(this));
};

/**
 * Open the epub container
 * @private
 * @param  {string} url
 * @return {string} packagePath
 */
Book.prototype.openContainer = function(url){
	return this.load(url)
		.then(function(xml) {
			this.container = new Container(xml);
			return this.resolve(this.container.packagePath);
		}.bind(this));
};

/**
 * Open the Open Packaging Format Xml
 * @private
 * @param  {string} url
 * @return {Promise}
 */
Book.prototype.openPackaging = function(url){
	var packageUrl;
	this.path = new Path(url);
	return this.load(url)
		.then(function(xml) {
			this.packaging = new Packaging(xml);
			return this.unpack(this.packaging);
		}.bind(this));
};

/**
 * Load a resource from the Book
 * @param  {string} path path to the resource to load
 * @return {Promise}     returns a promise with the requested resource
 */
Book.prototype.load = function (path) {
	var resolved;

	if(this.archived) {
		resolved = this.resolve(path);
		return this.archive.request(resolved);
	} else {
		resolved = this.resolve(path);
		return this.request(resolved, null, this.settings.requestCredentials, this.settings.requestHeaders);
	}
};

/**
 * Resolve a path to it's absolute position in the Book
 * @param  {string} path
 * @param  {[boolean]} absolute force resolving the full URL
 * @return {string}          the resolved path string
 */
Book.prototype.resolve = function (path, absolute) {
	var resolved = path;
	var isAbsolute = (path.indexOf('://') > -1);

	if (isAbsolute) {
		return path;
	}

	if (this.path) {
		resolved = this.path.resolve(path);
	}

	if(absolute != false && this.url) {
		resolved = this.url.resolve(resolved);
	}

	return resolved;
}

/**
 * Determine the type of they input passed to open
 * @private
 * @param  {string} input
 * @return {string}  binary | directory | epub | opf
 */
Book.prototype.determineType = function(input) {
	var url;
	var path;
	var extension;

	if (typeof(input) != "string") {
		return "binary";
	}

	url = new Url(input);
	path = url.path();
	extension = path.extension;

	if (!extension) {
		return "directory";
	}

	if(extension === "epub"){
		return "epub";
	}

	if(extension === "opf"){
		return "opf";
	}
};


/**
 * unpack the contents of the Books packageXml
 * @private
 * @param {document} packageXml XML Document
 */
Book.prototype.unpack = function(opf){
	this.package = opf;

	this.spine.unpack(this.package, this.resolve.bind(this));

	this.resources = new Resources(this.package.manifest, {
		archive: this.archive,
		resolver: this.resolve.bind(this),
		replacements: this.settings.replacements
	});

	this.loadNavigation(this.package).then(function(){
		this.toc = this.navigation.toc;
		this.loading.navigation.resolve(this.navigation);
	}.bind(this));

	this.cover = this.resolve(this.package.coverPath);

	// Resolve promises
	this.loading.manifest.resolve(this.package.manifest);
	this.loading.metadata.resolve(this.package.metadata);
	this.loading.spine.resolve(this.spine);
	this.loading.cover.resolve(this.cover);
	this.loading.resources.resolve(this.resources);
	this.loading.pageList.resolve(this.pageList);


	this.isOpen = true;

	if(this.archived) {
		this.replacements().then(function() {
			this.opening.resolve(this);
		}.bind(this));
	} else {
		// Resolve book opened promise
		this.opening.resolve(this);
	}

};

/**
 * Load Navigation and PageList from package
 * @private
 * @param {document} opf XML Document
 */
Book.prototype.loadNavigation = function(opf){
	var navPath = opf.navPath || opf.ncxPath;

	if (!navPath) {
		return;
	}

	return this.load(navPath, 'xml')
		.then(function(xml) {
			this.navigation = new Navigation(xml);
			this.pageList = new PageList(xml);
			return this.navigation;
		}.bind(this));
};

/**
 * Alias for book.spine.get
 * @param {string} target
 */
Book.prototype.section = function(target) {
	return this.spine.get(target);
};

/**
 * Sugar to render a book
 * @param  {element} element element to add the views to
 * @param  {[object]} options
 * @return {Rendition}
 */
Book.prototype.renderTo = function(element, options) {
	// var renderMethod = (options && options.method) ?
	//     options.method :
	//     "single";

	this.rendition = new Rendition(this, options);
	this.rendition.attachTo(element);

	return this.rendition;
};

/**
 * Set if request should use withCredentials
 * @param {boolean} credentials
 */
Book.prototype.setRequestCredentials = function(credentials) {
	this.settings.requestCredentials = credentials;
};

/**
 * Set headers request should use
 * @param {object} headers
 */
Book.prototype.setRequestHeaders = function(headers) {
	this.settings.requestHeaders = headers;
};

/**
 * Unarchive a zipped epub
 * @private
 * @param  {binary} input epub data
 * @param  {[string]} encoding
 * @return {Archive}
 */
Book.prototype.unarchive = function(input, encoding){
	this.archive = new Archive();
	return this.archive.open(input, encoding);
};

/**
 * Get the cover url
 * @return {string} coverUrl
 */
Book.prototype.coverUrl = function(){
	var retrieved = this.loaded.cover.
		then(function(url) {
			if(this.archived) {
				// return this.archive.createUrl(this.cover);
				return this.resources.get(this.cover);
			}else{
				return this.cover;
			}
		}.bind(this));



	return retrieved;
};

/**
 * load replacement urls
 * @private
 * @return {Promise} completed loading urls
 */
Book.prototype.replacements = function(){
	this.spine.hooks.serialize.register(function(output, section) {
		section.output = this.resources.substitute(output, section.url);
	}.bind(this));

	return this.resources.replacements().
		then(function() {
			return this.resources.replaceCss();
		}.bind(this));
};

/**
 * Find a DOM Range for a given CFI Range
 * @param  {EpubCFI} cfiRange a epub cfi range
 * @return {Range}
 */
Book.prototype.range = function(cfiRange) {
	var cfi = new EpubCFI(cfiRange);
	var item = this.spine.get(cfi.spinePos);

	return item.load().then(function (contents) {
		var range = cfi.toRange(item.document);
		return range;
	})
};

/**
 * Generates the Book Key using the identifer in the manifest or other string provided
 * @param  {[string]} identifier to use instead of metadata identifier
 * @return {string} key
 */
Book.prototype.key = function(identifier){
	var ident = identifier || this.package.metadata.identifier || this.url.filename;
	return "epubjs:" + (EPUBJS_VERSION || ePub.VERSION) + ":" + ident;
};

//-- Enable binding events to book
EventEmitter(Book.prototype);

module.exports = Book;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var DefaultViewManager = __webpack_require__(12);

function ContinuousViewManager(options) {

	DefaultViewManager.apply(this, arguments); // call super constructor.

	this.name = "continuous";

	this.settings = core.extend(this.settings || {}, {
		infinite: true,
		overflow: "auto",
		axis: "vertical",
		offset: 500,
		offsetDelta: 250,
		width: undefined,
		height: undefined
	});

	core.extend(this.settings, options.settings || {});

	// Gap can be 0, byt defaults doesn't handle that
	if (options.settings.gap != "undefined" && options.settings.gap === 0) {
		this.settings.gap = options.settings.gap;
	}

	// this.viewSettings.axis = this.settings.axis;
	this.viewSettings = {
		ignoreClass: this.settings.ignoreClass,
		axis: this.settings.axis,
		layout: this.layout,
		width: 0,
		height: 0
	};

	this.scrollTop = 0;
	this.scrollLeft = 0;
};

// subclass extends superclass
ContinuousViewManager.prototype = Object.create(DefaultViewManager.prototype);
ContinuousViewManager.prototype.constructor = ContinuousViewManager;

ContinuousViewManager.prototype.display = function(section, target){
	return DefaultViewManager.prototype.display.call(this, section, target)
		.then(function () {
			return this.fill();
		}.bind(this));
};

ContinuousViewManager.prototype.fill = function(_full){
	var full = _full || new core.defer();

	this.check().then(function(result) {
		if (result) {
			this.fill(full);
		} else {
			full.resolve();
		}
	}.bind(this));

	return full.promise;
}

ContinuousViewManager.prototype.moveTo = function(offset){
	// var bounds = this.stage.bounds();
	// var dist = Math.floor(offset.top / bounds.height) * bounds.height;
	var distX = 0,
			distY = 0;

	var offsetX = 0,
			offsetY = 0;

	if(this.settings.axis === "vertical") {
		distY = offset.top;
		offsetY = offset.top+this.settings.offset;
	} else {
		distX = Math.floor(offset.left / this.layout.delta) * this.layout.delta;
		offsetX = distX+this.settings.offset;
	}

	return this.check(offsetX, offsetY)
		.then(function(){
			this.scrollBy(distX, distY);
		}.bind(this));
};

/*
ContinuousViewManager.prototype.afterDisplayed = function(currView){
	var next = currView.section.next();
	var prev = currView.section.prev();
	var index = this.views.indexOf(currView);
	var prevView, nextView;

	if(index + 1 === this.views.length && next) {
		nextView = this.createView(next);
		this.q.enqueue(this.append.bind(this), nextView);
	}

	if(index === 0 && prev) {
		prevView = this.createView(prev, this.viewSettings);
		this.q.enqueue(this.prepend.bind(this), prevView);
	}

	// this.removeShownListeners(currView);
	// currView.onShown = this.afterDisplayed.bind(this);
	this.emit("added", currView.section);

};
*/

ContinuousViewManager.prototype.resize = function(width, height){

	// Clear the queue
	this.q.clear();

	this._stageSize = this.stage.size(width, height);
	this._bounds = this.bounds();

	// Update for new views
	this.viewSettings.width = this._stageSize.width;
	this.viewSettings.height = this._stageSize.height;

	// Update for existing views
	this.views.each(function(view) {
		view.size(this._stageSize.width, this._stageSize.height);
	}.bind(this));

	this.updateLayout();

	// if(this.location) {
	//   this.rendition.display(this.location.start);
	// }

	this.emit("resized", {
		width: this.stage.width,
		height: this.stage.height
	});

};

ContinuousViewManager.prototype.onResized = function(e) {

	// this.views.clear();

	clearTimeout(this.resizeTimeout);
	this.resizeTimeout = setTimeout(function(){
		this.resize();
	}.bind(this), 150);
};

ContinuousViewManager.prototype.afterResized = function(view){
	this.emit("resize", view.section);
};

// Remove Previous Listeners if present
ContinuousViewManager.prototype.removeShownListeners = function(view){

	// view.off("shown", this.afterDisplayed);
	// view.off("shown", this.afterDisplayedAbove);
	view.onDisplayed = function(){};

};


// ContinuousViewManager.prototype.append = function(section){
// 	return this.q.enqueue(function() {
//
// 		this._append(section);
//
//
// 	}.bind(this));
// };
//
// ContinuousViewManager.prototype.prepend = function(section){
// 	return this.q.enqueue(function() {
//
// 		this._prepend(section);
//
// 	}.bind(this));
//
// };

ContinuousViewManager.prototype.append = function(section){
	var view = this.createView(section);
	this.views.append(view);
	return view;
};

ContinuousViewManager.prototype.prepend = function(section){
	var view = this.createView(section);

	view.on("resized", this.counter.bind(this));

	this.views.prepend(view);
	return view;
};

ContinuousViewManager.prototype.counter = function(bounds){

	if(this.settings.axis === "vertical") {
		this.scrollBy(0, bounds.heightDelta, true);
	} else {
		this.scrollBy(bounds.widthDelta, 0, true);
	}

};

ContinuousViewManager.prototype.update = function(_offset){
	var container = this.bounds();
	var views = this.views.all();
	var viewsLength = views.length;
	var visible = [];
	var offset = typeof _offset != "undefined" ? _offset : (this.settings.offset || 0);
	var isVisible;
	var view;

	var updating = new core.defer();
	var promises = [];

	for (var i = 0; i < viewsLength; i++) {
		view = views[i];

		isVisible = this.isVisible(view, offset, offset, container);

		if(isVisible === true) {
			if (!view.displayed) {
				promises.push(view.display(this.request).then(function (view) {
					view.show();
				}));
			}
			visible.push(view);
		} else {
			this.q.enqueue(view.destroy.bind(view));

			clearTimeout(this.trimTimeout);
			this.trimTimeout = setTimeout(function(){
				this.q.enqueue(this.trim.bind(this));
			}.bind(this), 250);
		}

	}

	if(promises.length){
		return Promise.all(promises);
	} else {
		updating.resolve();
		return updating.promise;
	}

};

ContinuousViewManager.prototype.check = function(_offsetLeft, _offsetTop){
	var last, first, next, prev;

	var checking = new core.defer();
	var newViews = [];

	var horizontal = (this.settings.axis === "horizontal");
	var delta = this.settings.offset || 0;

	if (_offsetLeft && horizontal) {
		delta = _offsetLeft;
	}

	if (_offsetTop && !horizontal) {
		delta = _offsetTop;
	}

	var bounds = this._bounds; // bounds saved this until resize

	var offset = horizontal ? this.scrollLeft : this.scrollTop;
	var visibleLength = horizontal ? bounds.width : bounds.height;
	var contentLength = horizontal ? this.container.scrollWidth : this.container.scrollHeight;

	if (offset + visibleLength + delta >= contentLength) {
		last = this.views.last();
		next = last && last.section.next();
		if(next) {
			newViews.push(this.append(next));
		}
	}

	if (offset - delta < 0 ) {
		first = this.views.first();
		prev = first && first.section.prev();
		if(prev) {
			newViews.push(this.prepend(prev));
		}
	}

	if(newViews.length){
		// Promise.all(promises)
			// .then(function() {
				// Check to see if anything new is on screen after rendering
				return this.q.enqueue(function(){
					return this.update(delta);
				}.bind(this));


			// }.bind(this));

	} else {
		checking.resolve(false);
		return checking.promise;
	}


};

ContinuousViewManager.prototype.trim = function(){
	var task = new core.defer();
	var displayed = this.views.displayed();
	var first = displayed[0];
	var last = displayed[displayed.length-1];
	var firstIndex = this.views.indexOf(first);
	var lastIndex = this.views.indexOf(last);
	var above = this.views.slice(0, firstIndex);
	var below = this.views.slice(lastIndex+1);

	// Erase all but last above
	for (var i = 0; i < above.length-1; i++) {
		this.erase(above[i], above);
	}

	// Erase all except first below
	for (var j = 1; j < below.length; j++) {
		this.erase(below[j]);
	}

	task.resolve();
	return task.promise;
};

ContinuousViewManager.prototype.erase = function(view, above){ //Trim

	var prevTop;
	var prevLeft;

	if(this.settings.height) {
		prevTop = this.container.scrollTop;
		prevLeft = this.container.scrollLeft;
	} else {
		prevTop = window.scrollY;
		prevLeft = window.scrollX;
	}

	var bounds = view.bounds();

	this.views.remove(view);

	if(above) {

		if(this.settings.axis === "vertical") {
			this.scrollTo(0, prevTop - bounds.height, true);
		} else {
			this.scrollTo(prevLeft - bounds.width, 0, true);
		}
	}

};

ContinuousViewManager.prototype.addEventListeners = function(stage){

	window.addEventListener('unload', function(e){
		this.ignore = true;
		// this.scrollTo(0,0);
		this.destroy();
	}.bind(this));

	this.addScrollListeners();
};

ContinuousViewManager.prototype.addScrollListeners = function() {
	var scroller;

	this.tick = core.requestAnimationFrame;

	if(this.settings.height) {
		this.prevScrollTop = this.container.scrollTop;
		this.prevScrollLeft = this.container.scrollLeft;
	} else {
		this.prevScrollTop = window.scrollY;
		this.prevScrollLeft = window.scrollX;
	}

	this.scrollDeltaVert = 0;
	this.scrollDeltaHorz = 0;

	if(this.settings.height) {
		scroller = this.container;
		this.scrollTop = this.container.scrollTop;
		this.scrollLeft = this.container.scrollLeft;
	} else {
		scroller = window;
		this.scrollTop = window.scrollY;
		this.scrollLeft = window.scrollX;
	}

	scroller.addEventListener("scroll", this.onScroll.bind(this));

	// this.tick.call(window, this.onScroll.bind(this));

	this.scrolled = false;

};

ContinuousViewManager.prototype.onScroll = function(){

	// if(!this.ignore) {

		if(this.settings.height) {
			scrollTop = this.container.scrollTop;
			scrollLeft = this.container.scrollLeft;
		} else {
			scrollTop = window.scrollY;
			scrollLeft = window.scrollX;
		}

		this.scrollTop = scrollTop;
		this.scrollLeft = scrollLeft;

		if(!this.ignore) {

			if((this.scrollDeltaVert === 0 &&
				 this.scrollDeltaHorz === 0) ||
				 this.scrollDeltaVert > this.settings.offsetDelta ||
				 this.scrollDeltaHorz > this.settings.offsetDelta) {

				this.q.enqueue(function() {
					this.check();
				}.bind(this));
				// this.check();

				this.scrollDeltaVert = 0;
				this.scrollDeltaHorz = 0;

				this.emit("scroll", {
					top: scrollTop,
					left: scrollLeft
				});

				clearTimeout(this.afterScrolled);
				this.afterScrolled = setTimeout(function () {
					this.emit("scrolled", {
						top: this.scrollTop,
						left: this.scrollLeft
					});
				}.bind(this));

			}

		} else {
			this.ignore = false;
		}

		this.scrollDeltaVert += Math.abs(scrollTop-this.prevScrollTop);
		this.scrollDeltaHorz += Math.abs(scrollLeft-this.prevScrollLeft);

		this.prevScrollTop = scrollTop;
		this.prevScrollLeft = scrollLeft;

		clearTimeout(this.scrollTimeout);
		this.scrollTimeout = setTimeout(function(){
			this.scrollDeltaVert = 0;
			this.scrollDeltaHorz = 0;
		}.bind(this), 150);


		this.scrolled = false;
	// }

	// this.tick.call(window, this.onScroll.bind(this));

};


//  ContinuousViewManager.prototype.resizeView = function(view) {
//
// 	if(this.settings.axis === "horizontal") {
// 		view.lock("height", this.stage.width, this.stage.height);
// 	} else {
// 		view.lock("width", this.stage.width, this.stage.height);
// 	}
//
// };

ContinuousViewManager.prototype.currentLocation = function(){

	if (this.settings.axis === "vertical") {
		this.location = this.scrolledLocation();
	} else {
		this.location = this.paginatedLocation();
	}

	return this.location;
};

ContinuousViewManager.prototype.scrolledLocation = function(){

	var visible = this.visible();
	var startPage, endPage;

	var container = this.container.getBoundingClientRect();

	if(visible.length === 1) {
		return this.mapping.page(visible[0].contents, visible[0].section.cfiBase);
	}

	if(visible.length > 1) {

		startPage = this.mapping.page(visible[0].contents, visible[0].section.cfiBase);
		endPage = this.mapping.page(visible[visible.length-1].contents, visible[visible.length-1].section.cfiBase);

		return {
			start: startPage.start,
			end: endPage.end
		};
	}

};

ContinuousViewManager.prototype.paginatedLocation = function(){
	var visible = this.visible();
	var startA, startB, endA, endB;
	var pageLeft, pageRight;
	var container = this.container.getBoundingClientRect();

	if(visible.length === 1) {
		startA = container.left - visible[0].position().left;
		endA = startA + this.layout.spreadWidth;

		return this.mapping.page(visible[0].contents, visible[0].section.cfiBase, startA, endA);
	}

	if(visible.length > 1) {

		// Left Col
		startA = container.left - visible[0].position().left;
		endA = startA + this.layout.columnWidth;

		// Right Col
		startB = container.left + this.layout.spreadWidth - visible[visible.length-1].position().left;
		endB = startB + this.layout.columnWidth;

		pageLeft = this.mapping.page(visible[0].contents, visible[0].section.cfiBase, startA, endA);
		pageRight = this.mapping.page(visible[visible.length-1].contents, visible[visible.length-1].section.cfiBase, startB, endB);

		return {
			start: pageLeft.start,
			end: pageRight.end
		};
	}
};

/*
Continuous.prototype.current = function(what){
	var view, top;
	var container = this.container.getBoundingClientRect();
	var length = this.views.length - 1;

	if(this.settings.axis === "horizontal") {

		for (var i = length; i >= 0; i--) {
			view = this.views[i];
			left = view.position().left;

			if(left < container.right) {

				if(this._current == view) {
					break;
				}

				this._current = view;
				break;
			}
		}

	} else {

		for (var i = length; i >= 0; i--) {
			view = this.views[i];
			top = view.bounds().top;
			if(top < container.bottom) {

				if(this._current == view) {
					break;
				}

				this._current = view;

				break;
			}
		}

	}

	return this._current;
};
*/

ContinuousViewManager.prototype.updateLayout = function() {

	if (!this.stage) {
		return;
	}

	if(this.settings.axis === "vertical") {
		this.layout.calculate(this._stageSize.width, this._stageSize.height);
	} else {
		this.layout.calculate(
			this._stageSize.width,
			this._stageSize.height,
			this.settings.gap
		);

		// Set the look ahead offset for what is visible
		this.settings.offset = this.layout.delta;

		this.stage.addStyleRules("iframe", [{"margin-right" : this.layout.gap + "px"}]);

	}

	// Set the dimensions for views
	this.viewSettings.width = this.layout.width;
	this.viewSettings.height = this.layout.height;

	this.setLayout(this.layout);

};

ContinuousViewManager.prototype.next = function(){

	if(this.settings.axis === "horizontal") {

		this.scrollLeft = this.container.scrollLeft;

		if(this.container.scrollLeft +
			 this.container.offsetWidth +
			 this.layout.delta < this.container.scrollWidth) {
			this.scrollBy(this.layout.delta, 0);
		} else {
			this.scrollTo(this.container.scrollWidth - this.layout.delta, 0);
		}

	} else {
		this.scrollBy(0, this.layout.height);
	}
};

ContinuousViewManager.prototype.prev = function(){
	if(this.settings.axis === "horizontal") {
		this.scrollBy(-this.layout.delta, 0);
	} else {
		this.scrollBy(0, -this.layout.height);
	}
};

ContinuousViewManager.prototype.updateFlow = function(flow){
	var axis = (flow === "paginated") ? "horizontal" : "vertical";

	this.settings.axis = axis;

	this.viewSettings.axis = axis;

	this.settings.overflow = (flow === "paginated") ? "hidden" : "auto";

	// this.views.each(function(view){
	// 	view.setAxis(axis);
	// });

	if (this.settings.axis === "vertical") {
		this.settings.infinite = true;
	} else {
		this.settings.infinite = false;
	}

};
module.exports = ContinuousViewManager;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(3);
var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);
var Contents = __webpack_require__(11);

function IframeView(section, options) {
	this.settings = core.extend({
		ignoreClass : '',
		axis: 'vertical',
		width: 0,
		height: 0,
		layout: undefined,
		globalLayoutProperties: {},
	}, options || {});

	this.id = "epubjs-view-" + core.uuid();
	this.section = section;
	this.index = section.index;

	this.element = this.container(this.settings.axis);

	this.added = false;
	this.displayed = false;
	this.rendered = false;

	this.width  = this.settings.width;
	this.height = this.settings.height;

	this.fixedWidth  = 0;
	this.fixedHeight = 0;

	// Blank Cfi for Parsing
	this.epubcfi = new EpubCFI();

	this.layout = this.settings.layout;
	// Dom events to listen for
	// this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];
};

IframeView.prototype.container = function(axis) {
	var element = document.createElement('div');

	element.classList.add("epub-view");

	// this.element.style.minHeight = "100px";
	element.style.height = "0px";
	element.style.width = "0px";
	element.style.overflow = "hidden";

	if(axis && axis == "horizontal"){
		element.style.display = "inline-block";
	} else {
		element.style.display = "block";
	}

	return element;
};

IframeView.prototype.create = function() {

	if(this.iframe) {
		return this.iframe;
	}

	if(!this.element) {
		this.element = this.createContainer();
	}

	this.iframe = document.createElement('iframe');
	this.iframe.id = this.id;
	this.iframe.scrolling = "no"; // Might need to be removed: breaks ios width calculations
	this.iframe.style.overflow = "hidden";
	this.iframe.seamless = "seamless";
	// Back up if seamless isn't supported
	this.iframe.style.border = "none";

	this.resizing = true;

	// this.iframe.style.display = "none";
	this.element.style.visibility = "hidden";
	this.iframe.style.visibility = "hidden";

	this.iframe.style.width = "0";
	this.iframe.style.height = "0";
	this._width = 0;
	this._height = 0;

	this.element.appendChild(this.iframe);
	this.added = true;

	this.elementBounds = core.bounds(this.element);

	// if(width || height){
	//   this.resize(width, height);
	// } else if(this.width && this.height){
	//   this.resize(this.width, this.height);
	// } else {
	//   this.iframeBounds = core.bounds(this.iframe);
	// }

	// Firefox has trouble with baseURI and srcdoc
	// TODO: Disable for now in firefox

	if(!!("srcdoc" in this.iframe)) {
		this.supportsSrcdoc = true;
	} else {
		this.supportsSrcdoc = false;
	}

	return this.iframe;
};

IframeView.prototype.render = function(request, show) {

	// view.onLayout = this.layout.format.bind(this.layout);
	this.create();

	// Fit to size of the container, apply padding
	this.size();

	if(!this.sectionRender) {
		this.sectionRender = this.section.render(request);
	}

	// Render Chain
	return this.sectionRender
		.then(function(contents){
			return this.load(contents);
		}.bind(this))
		// .then(function(doc){
		// 	return this.hooks.content.trigger(view, this);
		// }.bind(this))
		.then(function(){
			// this.settings.layout.format(view.contents);
			// return this.hooks.layout.trigger(view, this);
		}.bind(this))
		// .then(function(){
		// 	return this.display();
		// }.bind(this))
		// .then(function(){
		// 	return this.hooks.render.trigger(view, this);
		// }.bind(this))
		.then(function(){

			// apply the layout function to the contents
			this.settings.layout.format(this.contents);

			// Expand the iframe to the full size of the content
			this.expand();

			// Listen for events that require an expansion of the iframe
			this.addListeners();

			if(show !== false) {
				//this.q.enqueue(function(view){
					// this.show();
				//}, view);
			}
			// this.map = new Map(view, this.layout);
			//this.hooks.show.trigger(view, this);
			this.emit("rendered", this.section);

		}.bind(this))
		.catch(function(e){
			console.error(e);
			this.emit("loaderror", e);
		}.bind(this));

};

// Determine locks base on settings
IframeView.prototype.size = function(_width, _height) {
	var width = _width || this.settings.width;
	var height = _height || this.settings.height;

	if(this.layout.name === "pre-paginated") {
		this.lock("both", width, height);
	} else if(this.settings.axis === "horizontal") {
		this.lock("height", width, height);
	} else {
		this.lock("width", width, height);
	}

};

// Lock an axis to element dimensions, taking borders into account
IframeView.prototype.lock = function(what, width, height) {
	var elBorders = core.borders(this.element);
	var iframeBorders;

	if(this.iframe) {
		iframeBorders = core.borders(this.iframe);
	} else {
		iframeBorders = {width: 0, height: 0};
	}

	if(what == "width" && core.isNumber(width)){
		this.lockedWidth = width - elBorders.width - iframeBorders.width;
		this.resize(this.lockedWidth, width); //  width keeps ratio correct
	}

	if(what == "height" && core.isNumber(height)){
		this.lockedHeight = height - elBorders.height - iframeBorders.height;
		this.resize(width, this.lockedHeight);
	}

	if(what === "both" &&
		 core.isNumber(width) &&
		 core.isNumber(height)){

		this.lockedWidth = width - elBorders.width - iframeBorders.width;
		this.lockedHeight = height - elBorders.height - iframeBorders.height;

		this.resize(this.lockedWidth, this.lockedHeight);
	}

	if(this.displayed && this.iframe) {

			// this.contents.layout();
			this.expand();

	}



};

// Resize a single axis based on content dimensions
IframeView.prototype.expand = function(force) {
	var width = this.lockedWidth;
	var height = this.lockedHeight;
	var columns;

	var textWidth, textHeight;

	if(!this.iframe || this._expanding) return;

	this._expanding = true;

	// Expand Horizontally
	// if(height && !width) {
	if(this.settings.axis === "horizontal") {
		// Get the width of the text
		textWidth = this.contents.textWidth();
		// Check if the textWidth has changed
		if(textWidth != this._textWidth){
			// Get the contentWidth by resizing the iframe
			// Check with a min reset of the textWidth
			width = this.contentWidth(textWidth);

			columns = Math.ceil(width / (this.settings.layout.columnWidth + this.settings.layout.gap));

			if ( this.settings.layout.divisor > 1 &&
					 this.settings.layout.name === "reflowable" &&
					(columns % 2 > 0)) {
					// add a blank page
					width += this.settings.layout.gap + this.settings.layout.columnWidth;
			}

			// Save the textWdith
			this._textWidth = textWidth;
			// Save the contentWidth
			this._contentWidth = width;
		} else {
			// Otherwise assume content height hasn't changed
			width = this._contentWidth;
		}
	} // Expand Vertically
	else if(this.settings.axis === "vertical") {
		textHeight = this.contents.textHeight();
		if(textHeight != this._textHeight){
			height = this.contentHeight(textHeight);
			this._textHeight = textHeight;
			this._contentHeight = height;
		} else {
			height = this._contentHeight;
		}

	}

	// Only Resize if dimensions have changed or
	// if Frame is still hidden, so needs reframing
	if(this._needsReframe || width != this._width || height != this._height){
		this.resize(width, height);
	}

	this._expanding = false;
};

IframeView.prototype.contentWidth = function(min) {
	var prev;
	var width;

	// Save previous width
	prev = this.iframe.style.width;
	// Set the iframe size to min, width will only ever be greater
	// Will preserve the aspect ratio
	this.iframe.style.width = (min || 0) + "px";
	// Get the scroll overflow width
	width = this.contents.scrollWidth();
	// Reset iframe size back
	this.iframe.style.width = prev;
	return width;
};

IframeView.prototype.contentHeight = function(min) {
	var prev;
	var height;

	prev = this.iframe.style.height;
	this.iframe.style.height = (min || 0) + "px";
	height = this.contents.scrollHeight();

	this.iframe.style.height = prev;
	return height;
};


IframeView.prototype.resize = function(width, height) {

	if(!this.iframe) return;

	if(core.isNumber(width)){
		this.iframe.style.width = width + "px";
		this._width = width;
	}

	if(core.isNumber(height)){
		this.iframe.style.height = height + "px";
		this._height = height;
	}

	this.iframeBounds = core.bounds(this.iframe);

	this.reframe(this.iframeBounds.width, this.iframeBounds.height);

};

IframeView.prototype.reframe = function(width, height) {
	var size;

	// if(!this.displayed) {
	//   this._needsReframe = true;
	//   return;
	// }
	if(core.isNumber(width)){
		this.element.style.width = width + "px";
	}

	if(core.isNumber(height)){
		this.element.style.height = height + "px";
	}

	this.prevBounds = this.elementBounds;

	this.elementBounds = core.bounds(this.element);

	size = {
		width: this.elementBounds.width,
		height: this.elementBounds.height,
		widthDelta: this.elementBounds.width - this.prevBounds.width,
		heightDelta: this.elementBounds.height - this.prevBounds.height,
	};

	this.onResize(this, size);

	this.emit("resized", size);

};


IframeView.prototype.load = function(contents) {
	var loading = new core.defer();
	var loaded = loading.promise;

	if(!this.iframe) {
		loading.reject(new Error("No Iframe Available"));
		return loaded;
	}

	this.iframe.onload = function(event) {

		this.onLoad(event, loading);

	}.bind(this);

	if(this.supportsSrcdoc){
		this.iframe.srcdoc = contents;
	} else {

		this.document = this.iframe.contentDocument;

		if(!this.document) {
			loading.reject(new Error("No Document Available"));
			return loaded;
		}

		this.iframe.contentDocument.open();
		this.iframe.contentDocument.write(contents);
		this.iframe.contentDocument.close();

	}

	return loaded;
};

IframeView.prototype.onLoad = function(event, promise) {

		this.window = this.iframe.contentWindow;
		this.document = this.iframe.contentDocument;

		this.contents = new Contents(this.document, this.document.body, this.section.cfiBase);

		this.rendering = false;

		var link = this.document.querySelector("link[rel='canonical']");
		if (link) {
			link.setAttribute("href", this.section.url);
		} else {
			link = this.document.createElement("link");
			link.setAttribute("rel", "canonical");
			link.setAttribute("href", this.section.url);
			this.document.querySelector("head").appendChild(link);
		}

		this.contents.on("expand", function () {
			if(this.displayed && this.iframe) {
					this.expand();
			}
		});

		promise.resolve(this.contents);
};



// IframeView.prototype.layout = function(layoutFunc) {
//
//   this.iframe.style.display = "inline-block";
//
//   // Reset Body Styles
//   // this.document.body.style.margin = "0";
//   //this.document.body.style.display = "inline-block";
//   //this.document.documentElement.style.width = "auto";
//
//   if(layoutFunc){
//     this.layoutFunc = layoutFunc;
//   }
//
//   this.contents.layout(this.layoutFunc);
//
// };
//
// IframeView.prototype.onLayout = function(view) {
//   // stub
// };

IframeView.prototype.setLayout = function(layout) {
	this.layout = layout;
};

IframeView.prototype.setAxis = function(axis) {
	this.settings.axis = axis;
};

IframeView.prototype.resizeListenters = function() {
	// Test size again
	clearTimeout(this.expanding);
	this.expanding = setTimeout(this.expand.bind(this), 350);
};

IframeView.prototype.addListeners = function() {
	//TODO: Add content listeners for expanding
};

IframeView.prototype.removeListeners = function(layoutFunc) {
	//TODO: remove content listeners for expanding
};

IframeView.prototype.display = function(request) {
	var displayed = new core.defer();

	if (!this.displayed) {

		this.render(request).then(function () {

			this.emit("displayed", this);
			this.onDisplayed(this);

			this.displayed = true;
			displayed.resolve(this);

		}.bind(this));

	} else {
		displayed.resolve(this);
	}


	return displayed.promise;
};

IframeView.prototype.show = function() {

	this.element.style.visibility = "visible";

	if(this.iframe){
		this.iframe.style.visibility = "visible";
	}

	this.emit("shown", this);
};

IframeView.prototype.hide = function() {
	// this.iframe.style.display = "none";
	this.element.style.visibility = "hidden";
	this.iframe.style.visibility = "hidden";

	this.stopExpanding = true;
	this.emit("hidden", this);
};

IframeView.prototype.position = function() {
	return this.element.getBoundingClientRect();
};

IframeView.prototype.locationOf = function(target) {
	var parentPos = this.iframe.getBoundingClientRect();
	var targetPos = this.contents.locationOf(target, this.settings.ignoreClass);

	return {
		"left": window.scrollX + parentPos.left + targetPos.left,
		"top": window.scrollY + parentPos.top + targetPos.top
	};
};

IframeView.prototype.onDisplayed = function(view) {
	// Stub, override with a custom functions
};

IframeView.prototype.onResize = function(view, e) {
	// Stub, override with a custom functions
};

IframeView.prototype.bounds = function() {
	if(!this.elementBounds) {
		this.elementBounds = core.bounds(this.element);
	}
	return this.elementBounds;
};

IframeView.prototype.destroy = function() {

	if(this.displayed){
		this.displayed = false;

		this.removeListeners();

		this.stopExpanding = true;
		this.element.removeChild(this.iframe);
		this.displayed = false;
		this.iframe = null;

		this._textWidth = null;
		this._textHeight = null;
		this._width = null;
		this._height = null;
	}
	// this.element.style.height = "0px";
	// this.element.style.width = "0px";
};

EventEmitter(IframeView.prototype);

module.exports = IframeView;


/***/ },
/* 20 */
/***/ function(module, exports) {

/*
 From Zip.js, by Gildas Lormeau
edited down
 */

var table = {
	"application" : {
		"ecmascript" : [ "es", "ecma" ],
		"javascript" : "js",
		"ogg" : "ogx",
		"pdf" : "pdf",
		"postscript" : [ "ps", "ai", "eps", "epsi", "epsf", "eps2", "eps3" ],
		"rdf+xml" : "rdf",
		"smil" : [ "smi", "smil" ],
		"xhtml+xml" : [ "xhtml", "xht" ],
		"xml" : [ "xml", "xsl", "xsd", "opf", "ncx" ],
		"zip" : "zip",
		"x-httpd-eruby" : "rhtml",
		"x-latex" : "latex",
		"x-maker" : [ "frm", "maker", "frame", "fm", "fb", "book", "fbdoc" ],
		"x-object" : "o",
		"x-shockwave-flash" : [ "swf", "swfl" ],
		"x-silverlight" : "scr",
		"epub+zip" : "epub",
		"font-tdpfr" : "pfr",
		"inkml+xml" : [ "ink", "inkml" ],
		"json" : "json",
		"jsonml+json" : "jsonml",
		"mathml+xml" : "mathml",
		"metalink+xml" : "metalink",
		"mp4" : "mp4s",
		// "oebps-package+xml" : "opf",
		"omdoc+xml" : "omdoc",
		"oxps" : "oxps",
		"vnd.amazon.ebook" : "azw",
		"widget" : "wgt",
		// "x-dtbncx+xml" : "ncx",
		"x-dtbook+xml" : "dtb",
		"x-dtbresource+xml" : "res",
		"x-font-bdf" : "bdf",
		"x-font-ghostscript" : "gsf",
		"x-font-linux-psf" : "psf",
		"x-font-otf" : "otf",
		"x-font-pcf" : "pcf",
		"x-font-snf" : "snf",
		"x-font-ttf" : [ "ttf", "ttc" ],
		"x-font-type1" : [ "pfa", "pfb", "pfm", "afm" ],
		"x-font-woff" : "woff",
		"x-mobipocket-ebook" : [ "prc", "mobi" ],
		"x-mspublisher" : "pub",
		"x-nzb" : "nzb",
		"x-tgif" : "obj",
		"xaml+xml" : "xaml",
		"xml-dtd" : "dtd",
		"xproc+xml" : "xpl",
		"xslt+xml" : "xslt",
		"internet-property-stream" : "acx",
		"x-compress" : "z",
		"x-compressed" : "tgz",
		"x-gzip" : "gz",
	},
	"audio" : {
		"flac" : "flac",
		"midi" : [ "mid", "midi", "kar", "rmi" ],
		"mpeg" : [ "mpga", "mpega", "mp2", "mp3", "m4a", "mp2a", "m2a", "m3a" ],
		"mpegurl" : "m3u",
		"ogg" : [ "oga", "ogg", "spx" ],
		"x-aiff" : [ "aif", "aiff", "aifc" ],
		"x-ms-wma" : "wma",
		"x-wav" : "wav",
		"adpcm" : "adp",
		"mp4" : "mp4a",
		"webm" : "weba",
		"x-aac" : "aac",
		"x-caf" : "caf",
		"x-matroska" : "mka",
		"x-pn-realaudio-plugin" : "rmp",
		"xm" : "xm",
		"mid" : [ "mid", "rmi" ]
	},
	"image" : {
		"gif" : "gif",
		"ief" : "ief",
		"jpeg" : [ "jpeg", "jpg", "jpe" ],
		"pcx" : "pcx",
		"png" : "png",
		"svg+xml" : [ "svg", "svgz" ],
		"tiff" : [ "tiff", "tif" ],
		"x-icon" : "ico",
		"bmp" : "bmp",
		"webp" : "webp",
		"x-pict" : [ "pic", "pct" ],
		"x-tga" : "tga",
		"cis-cod" : "cod"
	},
	"text" : {
		"cache-manifest" : [ "manifest", "appcache" ],
		"css" : "css",
		"csv" : "csv",
		"html" : [ "html", "htm", "shtml", "stm" ],
		"mathml" : "mml",
		"plain" : [ "txt", "text", "brf", "conf", "def", "list", "log", "in", "bas" ],
		"richtext" : "rtx",
		"tab-separated-values" : "tsv",
		"x-bibtex" : "bib"
	},
	"video" : {
		"mpeg" : [ "mpeg", "mpg", "mpe", "m1v", "m2v", "mp2", "mpa", "mpv2" ],
		"mp4" : [ "mp4", "mp4v", "mpg4" ],
		"quicktime" : [ "qt", "mov" ],
		"ogg" : "ogv",
		"vnd.mpegurl" : [ "mxu", "m4u" ],
		"x-flv" : "flv",
		"x-la-asf" : [ "lsf", "lsx" ],
		"x-mng" : "mng",
		"x-ms-asf" : [ "asf", "asx", "asr" ],
		"x-ms-wm" : "wm",
		"x-ms-wmv" : "wmv",
		"x-ms-wmx" : "wmx",
		"x-ms-wvx" : "wvx",
		"x-msvideo" : "avi",
		"x-sgi-movie" : "movie",
		"x-matroska" : [ "mpv", "mkv", "mk3d", "mks" ],
		"3gpp2" : "3g2",
		"h261" : "h261",
		"h263" : "h263",
		"h264" : "h264",
		"jpeg" : "jpgv",
		"jpm" : [ "jpm", "jpgm" ],
		"mj2" : [ "mj2", "mjp2" ],
		"vnd.ms-playready.media.pyv" : "pyv",
		"vnd.uvvu.mp4" : [ "uvu", "uvvu" ],
		"vnd.vivo" : "viv",
		"webm" : "webm",
		"x-f4v" : "f4v",
		"x-m4v" : "m4v",
		"x-ms-vob" : "vob",
		"x-smv" : "smv"
	}
};

var mimeTypes = (function() {
	var type, subtype, val, index, mimeTypes = {};
	for (type in table) {
		if (table.hasOwnProperty(type)) {
			for (subtype in table[type]) {
				if (table[type].hasOwnProperty(subtype)) {
					val = table[type][subtype];
					if (typeof val == "string") {
						mimeTypes[val] = type + "/" + subtype;
					} else {
						for (index = 0; index < val.length; index++) {
							mimeTypes[val[index]] = type + "/" + subtype;
						}
					}
				}
			}
		}
	}
	return mimeTypes;
})();

var defaultValue = "text/plain";//"application/octet-stream";

function lookup(filename) {
	return filename && mimeTypes[filename.split(".").pop().toLowerCase()] || defaultValue;
};

module.exports = {
	'lookup': lookup
}


/***/ },
/* 21 */
/***/ function(module, exports) {

"use strict";
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var assign        = __webpack_require__(23)
  , normalizeOpts = __webpack_require__(30)
  , isCallable    = __webpack_require__(26)
  , contains      = __webpack_require__(33)

  , d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

module.exports = __webpack_require__(24)()
	? Object.assign
	: __webpack_require__(25);


/***/ },
/* 24 */
/***/ function(module, exports) {

"use strict";
'use strict';

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var keys  = __webpack_require__(27)
  , value = __webpack_require__(32)

  , max = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, l = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try { dest[key] = src[key]; } catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};


/***/ },
/* 26 */
/***/ function(module, exports) {

"use strict";
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

module.exports = __webpack_require__(28)()
	? Object.keys
	: __webpack_require__(29);


/***/ },
/* 28 */
/***/ function(module, exports) {

"use strict";
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};


/***/ },
/* 29 */
/***/ function(module, exports) {

"use strict";
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};


/***/ },
/* 30 */
/***/ function(module, exports) {

"use strict";
'use strict';

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

module.exports = function (options/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (options == null) return;
		process(Object(options), result);
	});
	return result;
};


/***/ },
/* 31 */
/***/ function(module, exports) {

"use strict";
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};


/***/ },
/* 32 */
/***/ function(module, exports) {

"use strict";
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

module.exports = __webpack_require__(34)()
	? String.prototype.contains
	: __webpack_require__(35);


/***/ },
/* 34 */
/***/ function(module, exports) {

"use strict";
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};


/***/ },
/* 35 */
/***/ function(module, exports) {

"use strict";
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var request = __webpack_require__(10);
var mime = __webpack_require__(20);
var Path = __webpack_require__(0).Path;

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
			JSZip = __webpack_require__(48);
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


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

var path = __webpack_require__(2);
var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);

/**
 * Handles Parsing and Accessing an Epub Container
 * @class
 * @param {[document]} containerDocument xml document
 */
function Container(containerDocument) {
	if (containerDocument) {
		this.parse(containerDocument);
	}
};

/**
 * Parse the Container XML
 * @param  {document} containerDocument
 */
Container.prototype.parse = function(containerDocument){
		//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
		var rootfile, fullpath, folder, encoding;

		if(!containerDocument) {
			console.error("Container File Not Found");
			return;
		}

		rootfile = core.qs(containerDocument, "rootfile");

		if(!rootfile) {
			console.error("No RootFile Found");
			return;
		}

		this.packagePath = rootfile.getAttribute('full-path');
		this.directory = path.dirname(this.packagePath);
		this.encoding = containerDocument.xmlEncoding;
};

module.exports = Container;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);

/**
 * Figures out the CSS to apply for a layout
 * @class
 * @param {object} settings
 * @param {[string=reflowable]} settings.layout
 * @param {[string]} settings.spread
 * @param {[int=800]} settings.minSpreadWidth
 * @param {[boolean=false]} settings.evenSpreads
 */
function Layout(settings){
	this.name = settings.layout || "reflowable";
	this._spread = (settings.spread === "none") ? false : true;
	this._minSpreadWidth = settings.minSpreadWidth || 800;
	this._evenSpreads = settings.evenSpreads || false;

	if (settings.flow === "scrolled-continuous" ||
			settings.flow === "scrolled-doc") {
		this._flow = "scrolled";
	} else {
		this._flow = "paginated";
	}


	this.width = 0;
	this.height = 0;
	this.spreadWidth = 0;
	this.delta = 0;

	this.columnWidth = 0;
	this.gap = 0;
	this.divisor = 1;
};

/**
 * Switch the flow between paginated and scrolled
 * @param  {string} flow paginated | scrolled
 */
Layout.prototype.flow = function(flow) {
	this._flow = (flow === "paginated") ? "paginated" : "scrolled";
}

/**
 * Switch between using spreads or not, and set the
 * width at which they switch to single.
 * @param  {string} spread true | false
 * @param  {boolean} min integer in pixels
 */
Layout.prototype.spread = function(spread, min) {

	this._spread = (spread === "none") ? false : true;

	if (min >= 0) {
		this._minSpreadWidth = min;
	}
}

/**
 * Calculate the dimensions of the pagination
 * @param  {number} _width  [description]
 * @param  {number} _height [description]
 * @param  {number} _gap    [description]
 */
Layout.prototype.calculate = function(_width, _height, _gap){

	var divisor = 1;
	var gap = _gap || 0;

	//-- Check the width and create even width columns
	var fullWidth = Math.floor(_width);
	var width = _width;

	var section = Math.floor(width / 8);

	var colWidth;
	var spreadWidth;
	var delta;

	if (this._spread && width >= this._minSpreadWidth) {
		divisor = 2;
	} else {
		divisor = 1;
	}

	if (this.name === "reflowable" && this._flow === "paginated" && !(_gap >= 0)) {
		gap = ((section % 2 === 0) ? section : section - 1);
	}

	if (this.name === "pre-paginated" ) {
		gap = 0;
	}

	//-- Double Page
	if(divisor > 1) {
		colWidth = (width - gap) / divisor;
	} else {
		colWidth = width;
	}

	if (this.name === "pre-paginated" && divisor > 1) {
		width = colWidth;
	}

	spreadWidth = colWidth * divisor;

	delta = (colWidth + gap) * divisor;

	this.width = width;
	this.height = _height;
	this.spreadWidth = spreadWidth;
	this.delta = delta;

	this.columnWidth = colWidth;
	this.gap = gap;
	this.divisor = divisor;
};

/**
 * Apply Css to a Document
 * @param  {Contents} contents
 * @return {[Promise]}
 */
Layout.prototype.format = function(contents){
	var formating;

	if (this.name === "pre-paginated") {
		formating = contents.fit(this.columnWidth, this.height);
	} else if (this._flow === "paginated") {
		formating = contents.columns(this.width, this.height, this.columnWidth, this.gap);
	} else { // scrolled
		formating = contents.size(this.width, null);
	}

	return formating; // might be a promise in some View Managers
};

/**
 * Count number of pages
 * @param  {number} totalWidth
 * @return {number} spreads
 * @return {number} pages
 */
Layout.prototype.count = function(totalWidth) {
	// var totalWidth = contents.scrollWidth();
	var spreads = Math.ceil( totalWidth / this.spreadWidth);

	return {
		spreads : spreads,
		pages : spreads * this.divisor
	};
};

module.exports = Layout;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var Queue = __webpack_require__(8);
var EpubCFI = __webpack_require__(1);
var EventEmitter = __webpack_require__(3);

/**
 * Find Locations for a Book
 * @param {Spine} spine
 * @param {request} request
 */
function Locations(spine, request) {
	this.spine = spine;
	this.request = request;

	this.q = new Queue(this);
	this.epubcfi = new EpubCFI();

	this._locations = [];
	this.total = 0;

	this.break = 150;

	this._current = 0;

};

/**
 * Load all of sections in the book to generate locations
 * @param  {int} chars how many chars to split on
 * @return {object} locations
 */
Locations.prototype.generate = function(chars) {

	if (chars) {
		this.break = chars;
	}

	this.q.pause();

	this.spine.each(function(section) {

		this.q.enqueue(this.process.bind(this), section);

	}.bind(this));

	return this.q.run().then(function() {
		this.total = this._locations.length-1;

		if (this._currentCfi) {
			this.currentLocation = this._currentCfi;
		}

		return this._locations;
		// console.log(this.percentage(this.book.rendition.location.start), this.percentage(this.book.rendition.location.end));
	}.bind(this));

};

Locations.prototype.createRange = function () {
	return {
		startContainer: undefined,
		startOffset: undefined,
		endContainer: undefined,
		endOffset: undefined
	}
};

Locations.prototype.process = function(section) {

	return section.load(this.request)
		.then(function(contents) {
			var locations = this.parse(contents, section.cfiBase);
			this._locations = this._locations.concat(locations);
		}.bind(this));

};

Locations.prototype.parse = function(contents, cfiBase, chars) {
	var locations = [];
	var range;
	var doc = contents.ownerDocument;
	var body = core.qs(doc, 'body');
	var counter = 0;
	var prev;
	var _break = chars || this.break;
	var parser = function(node) {
		var len = node.length;
		var dist;
		var pos = 0;

		if (node.textContent.trim().length === 0) {
			return false; // continue
		}

		// Start range
		if (counter == 0) {
			range = this.createRange();
			range.startContainer = node;
			range.startOffset = 0;
		}

		dist = _break - counter;

		// Node is smaller than a break,
		// skip over it
		if(dist > len){
			counter += len;
			pos = len;
		}

		while (pos < len) {
			// counter = this.break;
			pos += dist;
			// Gone over
			if(pos >= len){
				// Continue counter for next node
				counter = len - (pos - _break);
			// At End
			} else {
				// End the previous range
				range.endContainer = node;
				range.endOffset = pos;
				// cfi = section.cfiFromRange(range);
				cfi = new EpubCFI(range, cfiBase).toString();
				locations.push(cfi);
				counter = 0;

				// Start new range
				pos += 1;
				range = this.createRange();
				range.startContainer = node;
				range.startOffset = pos;

				dist = _break;
			}
		}
		prev = node;
	};

	core.sprint(body, parser.bind(this));

	// Close remaining
	if (range && range.startContainer && prev) {
		range.endContainer = prev;
		range.endOffset = prev.length;
		// cfi = section.cfiFromRange(range);
		cfi = new EpubCFI(range, cfiBase).toString();
		locations.push(cfi);
		counter = 0;
	}

	return locations;
};

Locations.prototype.locationFromCfi = function(cfi){
	// Check if the location has not been set yet
	if(this._locations.length === 0) {
		return -1;
	}
	return core.locationOf(cfi.start, this._locations, this.epubcfi.compare);
};

Locations.prototype.percentageFromCfi = function(cfi) {
	if(this._locations.length === 0) {
		return null;
	}
	// Find closest cfi
	var loc = this.locationFromCfi(cfi);
	// Get percentage in total
	return this.percentageFromLocation(loc);
};

Locations.prototype.percentageFromLocation = function(loc) {
	if (!loc || !this.total) {
		return 0;
	}
	return (loc / this.total);
};

Locations.prototype.cfiFromLocation = function(loc){
	var cfi = -1;
	// check that pg is an int
	if(typeof loc != "number"){
		loc = parseInt(pg);
	}

	if(loc >= 0 && loc < this._locations.length) {
		cfi = this._locations[loc];
	}

	return cfi;
};

Locations.prototype.cfiFromPercentage = function(value){
	var percentage = (value > 1) ? value / 100 : value; // Normalize value to 0-1
	var loc = Math.ceil(this.total * percentage);

	return this.cfiFromLocation(loc);
};

Locations.prototype.load = function(locations){
	this._locations = JSON.parse(locations);
	this.total = this._locations.length-1;
	return this._locations;
};

Locations.prototype.save = function(json){
	return JSON.stringify(this._locations);
};

Locations.prototype.getCurrent = function(json){
	return this._current;
};

Locations.prototype.setCurrent = function(curr){
	var loc;

	if(typeof curr == "string"){
		this._currentCfi = curr;
	} else if (typeof curr == "number") {
		this._current = curr;
	} else {
		return;
	}

	if(this._locations.length === 0) {
		return;
	}

	if(typeof curr == "string"){
		loc = this.locationFromCfi(curr);
		this._current = loc;
	} else {
		loc = curr;
	}

	this.emit("changed", {
		percentage: this.percentageFromLocation(loc)
	});
};

Object.defineProperty(Locations.prototype, 'currentLocation', {
	get: function () {
		return this._current;
	},
	set: function (curr) {
		this.setCurrent(curr);
	}
});

Locations.prototype.length = function () {
	return this._locations.length;
};

EventEmitter(Locations.prototype);

module.exports = Locations;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);

function Stage(_options) {
	this.settings = _options || {};
	this.id = "epubjs-container-" + core.uuid();

	this.container = this.create(this.settings);

	if(this.settings.hidden) {
		this.wrapper = this.wrap(this.container);
	}

}

/*
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
Stage.prototype.create = function(options){
	var height  = options.height;// !== false ? options.height : "100%";
	var width   = options.width;// !== false ? options.width : "100%";
	var overflow  = options.overflow || false;
	var axis = options.axis || "vertical";

	if(options.height && core.isNumber(options.height)) {
		height = options.height + "px";
	}

	if(options.width && core.isNumber(options.width)) {
		width = options.width + "px";
	}

	// Create new container element
	container = document.createElement("div");

	container.id = this.id;
	container.classList.add("epub-container");

	// Style Element
	// container.style.fontSize = "0";
	container.style.wordSpacing = "0";
	container.style.lineHeight = "0";
	container.style.verticalAlign = "top";

	if(axis === "horizontal") {
		container.style.whiteSpace = "nowrap";
	}

	if(width){
		container.style.width = width;
	}

	if(height){
		container.style.height = height;
	}

	if (overflow) {
		container.style.overflow = overflow;
	}

	return container;
};

Stage.wrap = function(container) {
	var wrapper = document.createElement("div");

	wrapper.style.visibility = "hidden";
	wrapper.style.overflow = "hidden";
	wrapper.style.width = "0";
	wrapper.style.height = "0";

	wrapper.appendChild(container);
	return wrapper;
};


Stage.prototype.getElement = function(_element){
	var element;

	if(core.isElement(_element)) {
		element = _element;
	} else if (typeof _element === "string") {
		element = document.getElementById(_element);
	}

	if(!element){
		console.error("Not an Element");
		return;
	}

	return element;
};

Stage.prototype.attachTo = function(what){

	var element = this.getElement(what);
	var base;

	if(!element){
		return;
	}

	if(this.settings.hidden) {
		base = this.wrapper;
	} else {
		base = this.container;
	}

	element.appendChild(base);

	this.element = element;

	return element;

};

Stage.prototype.getContainer = function() {
	return this.container;
};

Stage.prototype.onResize = function(func){
	// Only listen to window for resize event if width and height are not fixed.
	// This applies if it is set to a percent or auto.
	if(!core.isNumber(this.settings.width) ||
		 !core.isNumber(this.settings.height) ) {
		window.addEventListener("resize", func, false);
	}

};

Stage.prototype.size = function(width, height){
	var bounds;
	// var width = _width || this.settings.width;
	// var height = _height || this.settings.height;

	// If width or height are set to false, inherit them from containing element
	if(width === null) {
		bounds = this.element.getBoundingClientRect();

		if(bounds.width) {
			width = bounds.width;
			this.container.style.width = bounds.width + "px";
		}
	}

	if(height === null) {
		bounds = bounds || this.element.getBoundingClientRect();

		if(bounds.height) {
			height = bounds.height;
			this.container.style.height = bounds.height + "px";
		}

	}

	if(!core.isNumber(width)) {
		bounds = this.container.getBoundingClientRect();
		width = bounds.width;
		//height = bounds.height;
	}

	if(!core.isNumber(height)) {
		bounds = bounds || this.container.getBoundingClientRect();
		//width = bounds.width;
		height = bounds.height;
	}


	this.containerStyles = window.getComputedStyle(this.container);

	this.containerPadding = {
		left: parseFloat(this.containerStyles["padding-left"]) || 0,
		right: parseFloat(this.containerStyles["padding-right"]) || 0,
		top: parseFloat(this.containerStyles["padding-top"]) || 0,
		bottom: parseFloat(this.containerStyles["padding-bottom"]) || 0
	};

	return {
		width: width -
						this.containerPadding.left -
						this.containerPadding.right,
		height: height -
						this.containerPadding.top -
						this.containerPadding.bottom
	};

};

Stage.prototype.bounds = function(){

	if(!this.container) {
		return core.windowBounds();
	} else {
		return this.container.getBoundingClientRect();
	}

}

Stage.prototype.getSheet = function(){
	var style = document.createElement("style");

	// WebKit hack --> https://davidwalsh.name/add-rules-stylesheets
	style.appendChild(document.createTextNode(""));

	document.head.appendChild(style);

	return style.sheet;
}

Stage.prototype.addStyleRules = function(selector, rulesArray){
	var scope = "#" + this.id + " ";
	var rules = "";

	if(!this.sheet){
		this.sheet = this.getSheet();
	}

	rulesArray.forEach(function(set) {
		for (var prop in set) {
			if(set.hasOwnProperty(prop)) {
				rules += prop + ":" + set[prop] + ";";
			}
		}
	})

	this.sheet.insertRule(scope + selector + " {" + rules + "}", 0);
}



module.exports = Stage;


/***/ },
/* 41 */
/***/ function(module, exports) {

function Views(container) {
	this.container = container;
	this._views = [];
	this.length = 0;
	this.hidden = false;
};

Views.prototype.all = function() {
	return this._views;
};

Views.prototype.first = function() {
	return this._views[0];
};

Views.prototype.last = function() {
	return this._views[this._views.length-1];
};

Views.prototype.indexOf = function(view) {
	return this._views.indexOf(view);
};

Views.prototype.slice = function() {
	return this._views.slice.apply(this._views, arguments);
};

Views.prototype.get = function(i) {
	return this._views[i];
};

Views.prototype.append = function(view){
	this._views.push(view);
	if(this.container){
		this.container.appendChild(view.element);
	}
	this.length++;
	return view;
};

Views.prototype.prepend = function(view){
	this._views.unshift(view);
	if(this.container){
		this.container.insertBefore(view.element, this.container.firstChild);
	}
	this.length++;
	return view;
};

Views.prototype.insert = function(view, index) {
	this._views.splice(index, 0, view);

	if(this.container){
		if(index < this.container.children.length){
			this.container.insertBefore(view.element, this.container.children[index]);
		} else {
			this.container.appendChild(view.element);
		}
	}

	this.length++;
	return view;
};

Views.prototype.remove = function(view) {
	var index = this._views.indexOf(view);

	if(index > -1) {
		this._views.splice(index, 1);
	}


	this.destroy(view);

	this.length--;
};

Views.prototype.destroy = function(view) {
	if(view.displayed){
		view.destroy();
	}

	if(this.container){
		 this.container.removeChild(view.element);
	}
	view = null;
};

// Iterators

Views.prototype.each = function() {
	return this._views.forEach.apply(this._views, arguments);
};

Views.prototype.clear = function(){
	// Remove all views
	var view;
	var len = this.length;

	if(!this.length) return;

	for (var i = 0; i < len; i++) {
		view = this._views[i];
		this.destroy(view);
	}

	this._views = [];
	this.length = 0;
};

Views.prototype.find = function(section){

	var view;
	var len = this.length;

	for (var i = 0; i < len; i++) {
		view = this._views[i];
		if(view.displayed && view.section.index == section.index) {
			return view;
		}
	}

};

Views.prototype.displayed = function(){
	var displayed = [];
	var view;
	var len = this.length;

	for (var i = 0; i < len; i++) {
		view = this._views[i];
		if(view.displayed){
			displayed.push(view);
		}
	}
	return displayed;
};

Views.prototype.show = function(){
	var view;
	var len = this.length;

	for (var i = 0; i < len; i++) {
		view = this._views[i];
		if(view.displayed){
			view.show();
		}
	}
	this.hidden = false;
};

Views.prototype.hide = function(){
	var view;
	var len = this.length;

	for (var i = 0; i < len; i++) {
		view = this._views[i];
		if(view.displayed){
			view.hide();
		}
	}
	this.hidden = true;
};

module.exports = Views;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var path = __webpack_require__(2);

/**
 * Navigation Parser
 * @param {document} xml navigation html / xhtml / ncx
 */
function Navigation(xml){
	this.toc = [];
	this.tocByHref = {};
	this.tocById = {};

	if (xml) {
		this.parse(xml);
	}
};

/**
 * Parse out the navigation items
 * @param {document} xml navigation html / xhtml / ncx
 */
Navigation.prototype.parse = function(xml) {
	var html = core.qs(xml, "html");
	var ncx = core.qs(xml, "ncx");

	if(html) {
		this.toc = this.parseNav(xml);
	} else if(ncx){
		this.toc = this.parseNcx(xml);
	}

	this.unpack(this.toc);
};

/**
 * Unpack navigation items
 * @private
 * @param  {array} toc
 */
Navigation.prototype.unpack = function(toc) {
	var item;

	for (var i = 0; i < toc.length; i++) {
		item = toc[i];
		this.tocByHref[item.href] = i;
		this.tocById[item.id] = i;
	}

};

/**
 * Get an item from the navigation
 * @param  {string} target
 * @return {object} navItems
 */
Navigation.prototype.get = function(target) {
	var index;

	if(!target) {
		return this.toc;
	}

	if(target.indexOf("#") === 0) {
		index = this.tocById[target.substring(1)];
	} else if(target in this.tocByHref){
		index = this.tocByHref[target];
	}

	return this.toc[index];
};

/**
 * Parse from a Epub > 3.0 Nav
 * @private
 * @param  {document} navHtml
 * @return {array} navigation list
 */
Navigation.prototype.parseNav = function(navHtml){
	var navElement = core.querySelectorByType(navHtml, "nav", "toc");
	var navItems = navElement ? core.qsa(navElement, "li") : [];
	var length = navItems.length;
	var i;
	var toc = {};
	var list = [];
	var item, parent;

	if(!navItems || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.navItem(navItems[i]);
		toc[item.id] = item;
		if(!item.parent) {
			list.push(item);
		} else {
			parent = toc[item.parent];
			parent.subitems.push(item);
		}
	}

	return list;
};

/**
 * Create a navItem
 * @private
 * @param  {element} item
 * @return {object} navItem
 */
Navigation.prototype.navItem = function(item){
	var id = item.getAttribute('id') || false,
			content = core.qs(item, "a"),
			src = content.getAttribute('href') || '',
			text = content.textContent || "",
			subitems = [],
			parentNode = item.parentNode,
			parent;

	if(parentNode && parentNode.nodeName === "navPoint") {
		parent = parentNode.getAttribute('id');
	}

	return {
		"id": id,
		"href": src,
		"label": text,
		"subitems" : subitems,
		"parent" : parent
	};
};

/**
 * Parse from a Epub > 3.0 NC
 * @private
 * @param  {document} navHtml
 * @return {array} navigation list
 */
Navigation.prototype.parseNcx = function(tocXml){
	var navPoints = core.qsa(tocXml, "navPoint");
	var length = navPoints.length;
	var i;
	var toc = {};
	var list = [];
	var item, parent;

	if(!navPoints || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.ncxItem(navPoints[i]);
		toc[item.id] = item;
		if(!item.parent) {
			list.push(item);
		} else {
			parent = toc[item.parent];
			parent.subitems.push(item);
		}
	}

	return list;
};

/**
 * Create a ncxItem
 * @private
 * @param  {element} item
 * @return {object} ncxItem
 */
Navigation.prototype.ncxItem = function(item){
	var id = item.getAttribute('id') || false,
			content = core.qs(item, "content"),
			src = content.getAttribute('src'),
			navLabel = core.qs(item, "navLabel"),
			text = navLabel.textContent ? navLabel.textContent : "",
			subitems = [],
			parentNode = item.parentNode,
			parent;

	if(parentNode && parentNode.nodeName === "navPoint") {
		parent = parentNode.getAttribute('id');
	}


	return {
		"id": id,
		"href": src,
		"label": text,
		"subitems" : subitems,
		"parent" : parent
	};
};

/**
 * forEach pass through
 * @param  {Function} fn function to run on each item
 * @return {method} forEach loop
 */
Navigation.prototype.forEach = function(fn) {
	return this.toc.forEach(fn);
};

module.exports = Navigation;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

var path = __webpack_require__(2);
var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);

/**
 * Open Packaging Format Parser
 * @class
 * @param {document} packageDocument OPF XML
 */
function Packaging(packageDocument) {
	if (packageDocument) {
		this.parse(packageDocument);
	}
};

/**
 * Parse OPF XML
 * @param  {document} packageDocument OPF XML
 * @return {object} parsed package parts
 */
Packaging.prototype.parse = function(packageDocument){
	var metadataNode, manifestNode, spineNode;

	if(!packageDocument) {
		console.error("Package File Not Found");
		return;
	}

	metadataNode = core.qs(packageDocument, "metadata");
	if(!metadataNode) {
		console.error("No Metadata Found");
		return;
	}

	manifestNode = core.qs(packageDocument, "manifest");
	if(!manifestNode) {
		console.error("No Manifest Found");
		return;
	}

	spineNode = core.qs(packageDocument, "spine");
	if(!spineNode) {
		console.error("No Spine Found");
		return;
	}

	this.manifest = this.parseManifest(manifestNode);
	this.navPath = this.findNavPath(manifestNode);
	this.ncxPath = this.findNcxPath(manifestNode, spineNode);
	this.coverPath = this.findCoverPath(packageDocument);

	this.spineNodeIndex = Array.prototype.indexOf.call(spineNode.parentNode.childNodes, spineNode);

	this.spine = this.parseSpine(spineNode, this.manifest);

	this.metadata = this.parseMetadata(metadataNode);

	this.metadata.direction = spineNode.getAttribute("page-progression-direction");


	return {
		'metadata' : this.metadata,
		'spine'    : this.spine,
		'manifest' : this.manifest,
		'navPath'  : this.navPath,
		'ncxPath'  : this.ncxPath,
		'coverPath': this.coverPath,
		'spineNodeIndex' : this.spineNodeIndex
	};
};

/**
 * Parse Metadata
 * @private
 * @param  {document} xml
 * @return {object} metadata
 */
Packaging.prototype.parseMetadata = function(xml){
	var metadata = {};

	metadata.title = this.getElementText(xml, 'title');
	metadata.creator = this.getElementText(xml, 'creator');
	metadata.description = this.getElementText(xml, 'description');

	metadata.pubdate = this.getElementText(xml, 'date');

	metadata.publisher = this.getElementText(xml, 'publisher');

	metadata.identifier = this.getElementText(xml, "identifier");
	metadata.language = this.getElementText(xml, "language");
	metadata.rights = this.getElementText(xml, "rights");

	metadata.modified_date = this.getPropertyText(xml, 'dcterms:modified');

	metadata.layout = this.getPropertyText(xml, "rendition:layout");
	metadata.orientation = this.getPropertyText(xml, 'rendition:orientation');
	metadata.flow = this.getPropertyText(xml, 'rendition:flow');
	metadata.viewport = this.getPropertyText(xml, 'rendition:viewport');
	// metadata.page_prog_dir = packageXml.querySelector("spine").getAttribute("page-progression-direction");

	return metadata;
};

/**
 * Parse Manifest
 * @private
 * @param  {document} manifestXml
 * @return {object} manifest
 */
Packaging.prototype.parseManifest = function(manifestXml){
	var manifest = {};

	//-- Turn items into an array
	// var selected = manifestXml.querySelectorAll("item");
	var selected = core.qsa(manifestXml, "item");
	var items = Array.prototype.slice.call(selected);

	//-- Create an object with the id as key
	items.forEach(function(item){
		var id = item.getAttribute('id'),
				href = item.getAttribute('href') || '',
				type = item.getAttribute('media-type') || '',
				properties = item.getAttribute('properties') || '';

		manifest[id] = {
			'href' : href,
			// 'url' : href,
			'type' : type,
			'properties' : properties.length ? properties.split(' ') : []
		};

	});

	return manifest;

};

/**
 * Parse Spine
 * @param  {document} spineXml
 * @param  {Packaging.manifest} manifest
 * @return {object} spine
 */
Packaging.prototype.parseSpine = function(spineXml, manifest){
	var spine = [];

	var selected = spineXml.getElementsByTagName("itemref"),
			items = Array.prototype.slice.call(selected);

	var epubcfi = new EpubCFI();

	//-- Add to array to mantain ordering and cross reference with manifest
	items.forEach(function(item, index){
		var idref = item.getAttribute('idref');
		// var cfiBase = epubcfi.generateChapterComponent(spineNodeIndex, index, Id);
		var props = item.getAttribute('properties') || '';
		var propArray = props.length ? props.split(' ') : [];
		// var manifestProps = manifest[Id].properties;
		// var manifestPropArray = manifestProps.length ? manifestProps.split(' ') : [];

		var itemref = {
			'idref' : idref,
			'linear' : item.getAttribute('linear') || '',
			'properties' : propArray,
			// 'href' : manifest[Id].href,
			// 'url' :  manifest[Id].url,
			'index' : index
			// 'cfiBase' : cfiBase
		};
		spine.push(itemref);
	});

	return spine;
};

/**
 * Find TOC NAV
 * @private
 */
Packaging.prototype.findNavPath = function(manifestNode){
	// Find item with property 'nav'
	// Should catch nav irregardless of order
	// var node = manifestNode.querySelector("item[properties$='nav'], item[properties^='nav '], item[properties*=' nav ']");
	var node = core.qsp(manifestNode, "item", {"properties":"nav"});
	return node ? node.getAttribute('href') : false;
};

/**
 * Find TOC NCX
 * media-type="application/x-dtbncx+xml" href="toc.ncx"
 * @private
 */
Packaging.prototype.findNcxPath = function(manifestNode, spineNode){
	// var node = manifestNode.querySelector("item[media-type='application/x-dtbncx+xml']");
	var node = core.qsp(manifestNode, "item", {"media-type":"application/x-dtbncx+xml"});
	var tocId;

	// If we can't find the toc by media-type then try to look for id of the item in the spine attributes as
	// according to http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm#Section2.4.1.2,
	// "The item that describes the NCX must be referenced by the spine toc attribute."
	if (!node) {
		tocId = spineNode.getAttribute("toc");
		if(tocId) {
			// node = manifestNode.querySelector("item[id='" + tocId + "']");
			node = manifestNode.getElementById(tocId);
		}
	}

	return node ? node.getAttribute('href') : false;
};

/**
 * Find the Cover Path
 * <item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />
 * Fallback for Epub 2.0
 * @param  {document} packageXml
 * @return {string} href
 */
Packaging.prototype.findCoverPath = function(packageXml){
	var pkg = core.qs(packageXml, "package");
	var epubVersion = pkg.getAttribute('version');

	if (epubVersion === '2.0') {
		var metaCover = core.qsp(packageXml, 'meta', {'name':'cover'});
		if (metaCover) {
			var coverId = metaCover.getAttribute('content');
			// var cover = packageXml.querySelector("item[id='" + coverId + "']");
			var cover = packageXml.getElementById(coverId);
			return cover ? cover.getAttribute('href') : '';
		}
		else {
			return false;
		}
	}
	else {
		// var node = packageXml.querySelector("item[properties='cover-image']");
		var node = core.qsp(packageXml, 'item', {'properties':'cover-image'});
		return node ? node.getAttribute('href') : '';
	}
};

/**
 * Get text of a namespaced element
 * @private
 * @param  {document} xml
 * @param  {string} tag
 * @return {string} text
 */
Packaging.prototype.getElementText = function(xml, tag){
	var found = xml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", tag),
		el;

	if(!found || found.length === 0) return '';

	el = found[0];

	if(el.childNodes.length){
		return el.childNodes[0].nodeValue;
	}

	return '';

};

/**
 * Get text by property
 * @private
 * @param  {document} xml
 * @param  {string} property
 * @return {string} text
 */
Packaging.prototype.getPropertyText = function(xml, property){
	var el = core.qsp(xml, "meta", {"property":property});

	if(el && el.childNodes.length){
		return el.childNodes[0].nodeValue;
	}

	return '';
};

module.exports = Packaging;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

var EpubCFI = __webpack_require__(1);
var core = __webpack_require__(0);

/**
 * Page List Parser
 * @param {[document]} xml
 */
function PageList(xml) {
	this.pages = [];
	this.locations = [];
	this.epubcfi = new EpubCFI();

	if (xml) {
		this.pageList = this.parse(xml);
	}

	if(this.pageList && this.pageList.length) {
		this.process(this.pageList);
	}
};

/**
 * Parse PageList Xml
 * @param  {document} xml
 */
PageList.prototype.parse = function(xml) {
	var html = core.qs(xml, "html");
	// var ncx = core.qs(xml, "ncx");

	if(html) {
		this.toc = this.parseNav(xml);
	} else if(ncx){ // Not supported
		// this.toc = this.parseNcx(xml);
		return;
	}

};

/**
 * Parse a Nav PageList
 * @private
 * @param  {document} navHtml
 * @return {PageList.item[]} list
 */
PageList.prototype.parseNav = function(navHtml){
	var navElement = core.querySelectorByType(navHtml, "nav", "page-list");
	var navItems = navElement ? core.qsa(navElement, "li") : [];
	var length = navItems.length;
	var i;
	var toc = {};
	var list = [];
	var item;

	if(!navItems || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.item(navItems[i]);
		list.push(item);
	}

	return list;
};

/**
 * Page List Item
 * @private
 * @param  {object} item
 * @return {object} pageListItem
 */
PageList.prototype.item = function(item){
	var id = item.getAttribute('id') || false,
		content = core.qs(item, "a"),
		href = content.getAttribute('href') || '',
		text = content.textContent || "",
		page = parseInt(text),
		isCfi = href.indexOf("epubcfi"),
		split,
		packageUrl,
		cfi;

	if(isCfi != -1) {
		split = href.split("#");
		packageUrl = split[0];
		cfi = split.length > 1 ? split[1] : false;
		return {
			"cfi" : cfi,
			"href" : href,
			"packageUrl" : packageUrl,
			"page" : page
		};
	} else {
		return {
			"href" : href,
			"page" : page
		};
	}
};

/**
 * Process pageList items
 * @private
 * @param  {array} pageList
 */
PageList.prototype.process = function(pageList){
	pageList.forEach(function(item){
		this.pages.push(item.page);
		if (item.cfi) {
			this.locations.push(item.cfi);
		}
	}, this);
	this.firstPage = parseInt(this.pages[0]);
	this.lastPage = parseInt(this.pages[this.pages.length-1]);
	this.totalPages = this.lastPage - this.firstPage;
};


/**
 * Replace HREFs with CFI
 * TODO: implement getting CFI from Href
 */
PageList.prototype.addCFIs = function() {
	this.pageList.forEach(function(pg){
		if(!pg.cfi) {
			// epubcfi.generateCfiFromHref(pg.href, book).then(function(cfi){
			// 	pg.cfi = cfi;
			// 	pg.packageUrl = book.settings.packageUrl;
			// });
		}
	});
}

/*
EPUBJS.EpubCFI.prototype.generateCfiFromHref = function(href, book) {
  var uri = EPUBJS.core.uri(href);
  var path = uri.path;
  var fragment = uri.fragment;
  var spinePos = book.spineIndexByURL[path];
  var loaded;
  var deferred = new RSVP.defer();
  var epubcfi = new EPUBJS.EpubCFI();
  var spineItem;

  if(typeof spinePos !== "undefined"){
    spineItem = book.spine[spinePos];
    loaded = book.loadXml(spineItem.url);
    loaded.then(function(doc){
      var element = doc.getElementById(fragment);
      var cfi;
      cfi = epubcfi.generateCfiFromElement(element, spineItem.cfiBase);
      deferred.resolve(cfi);
    });
  }

  return deferred.promise;
};
*/

/**
 * Get a PageList result from a EpubCFI
 * @param  {string} cfi EpubCFI String
 * @return {string} page
 */
PageList.prototype.pageFromCfi = function(cfi){
	var pg = -1;

	// Check if the pageList has not been set yet
	if(this.locations.length === 0) {
		return -1;
	}

	// TODO: check if CFI is valid?

	// check if the cfi is in the location list
	// var index = this.locations.indexOf(cfi);
	var index = core.indexOfSorted(cfi, this.locations, this.epubcfi.compare);
	if(index != -1) {
		pg = this.pages[index];
	} else {
		// Otherwise add it to the list of locations
		// Insert it in the correct position in the locations page
		//index = EPUBJS.core.insert(cfi, this.locations, this.epubcfi.compare);
		index = EPUBJS.core.locationOf(cfi, this.locations, this.epubcfi.compare);
		// Get the page at the location just before the new one, or return the first
		pg = index-1 >= 0 ? this.pages[index-1] : this.pages[0];
		if(pg !== undefined) {
			// Add the new page in so that the locations and page array match up
			//this.pages.splice(index, 0, pg);
		} else {
			pg = -1;
		}

	}
	return pg;
};

/**
 * Get an EpubCFI from a Page List Item
 * @param  {string} pg
 * @return {string} cfi
 */
PageList.prototype.cfiFromPage = function(pg){
	var cfi = -1;
	// check that pg is an int
	if(typeof pg != "number"){
		pg = parseInt(pg);
	}

	// check if the cfi is in the page list
	// Pages could be unsorted.
	var index = this.pages.indexOf(pg);
	if(index != -1) {
		cfi = this.locations[index];
	}
	// TODO: handle pages not in the list
	return cfi;
};

/**
 * Get a Page from Book percentage
 * @param  {number} percent
 * @return {string} page
 */
PageList.prototype.pageFromPercentage = function(percent){
	var pg = Math.round(this.totalPages * percent);
	return pg;
};

/**
 * Returns a value between 0 - 1 corresponding to the location of a page
 * @param  {int} pg the page
 * @return {number} percentage
 */
PageList.prototype.percentageFromPage = function(pg){
	var percentage = (pg - this.firstPage) / this.totalPages;
	return Math.round(percentage * 1000) / 1000;
};

/**
 * Returns a value between 0 - 1 corresponding to the location of a cfi
 * @param  {string} cfi EpubCFI String
 * @return {number} percentage
 */
PageList.prototype.percentageFromCfi = function(cfi){
	var pg = this.pageFromCfi(cfi);
	var percentage = this.percentageFromPage(pg);
	return percentage;
};

module.exports = PageList;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

var replace = __webpack_require__(9);
var core = __webpack_require__(0);
var Path = __webpack_require__(0).Path;
var path = __webpack_require__(2);

/**
 * Handle Package Resources
 * @class
 * @param {Manifest} manifest
 * @param {[object]} options
 * @param {[string='base64']} options.replacements
 * @param {[Archive]} options.archive
 * @param {[method]} options.resolver
 */
function Resources(manifest, options) {
	this.settings = {
		replacements: (options && options.replacements) || 'base64',
		archive: (options && options.archive),
		resolver: (options && options.resolver)
	};
	this.manifest = manifest;
	this.resources = Object.keys(manifest).
		map(function (key){
			return manifest[key];
		});

	this.replacementUrls = [];

	this.split();
	this.splitUrls();
}

/**
 * Split resources by type
 * @private
 */
Resources.prototype.split = function(){

	// HTML
	this.html = this.resources.
		filter(function (item){
			if (item.type === "application/xhtml+xml" ||
					item.type === "text/html") {
				return true;
			}
		});

	// Exclude HTML
	this.assets = this.resources.
		filter(function (item){
			if (item.type !== "application/xhtml+xml" &&
					item.type !== "text/html") {
				return true;
			}
		});

	// Only CSS
	this.css = this.resources.
		filter(function (item){
			if (item.type === "text/css") {
				return true;
			}
		});
};

/**
 * Convert split resources into Urls
 * @private
 */
Resources.prototype.splitUrls = function(){

	// All Assets Urls
	this.urls = this.assets.
		map(function(item) {
			return item.href;
		}.bind(this));

	// Css Urls
	this.cssUrls = this.css.map(function(item) {
		return item.href;
	});

};

/**
 * Create blob urls for all the assets
 * @param  {Archive} archive
 * @param  {resolver} resolver Url resolver
 * @return {Promise}         returns replacement urls
 */
Resources.prototype.replacements = function(archive, resolver){
	archive = archive || this.settings.archive;
	resolver = resolver || this.settings.resolver;

	if (this.settings.replacements === "none") {
		return new Promise(function(resolve, reject) {
			resolve(this.urls);
		}.bind(this));
	}

	var replacements = this.urls.
		map(function(url) {
			var absolute = resolver(url);

			return archive.createUrl(absolute, {"base64": (this.settings.replacements === "base64")});
		}.bind(this))

	return Promise.all(replacements)
		.then(function(replacementUrls) {
			this.replacementUrls = replacementUrls;
			return replacementUrls;
		}.bind(this));
};

/**
 * Replace URLs in CSS resources
 * @private
 * @param  {[Archive]} archive
 * @param  {[method]} resolver
 * @return {Promise}
 */
Resources.prototype.replaceCss = function(archive, resolver){
	var replaced = [];
	archive = archive || this.settings.archive;
	resolver = resolver || this.settings.resolver;
	this.cssUrls.forEach(function(href) {
		var replacement = this.createCssFile(href, archive, resolver)
			.then(function (replacementUrl) {
				// switch the url in the replacementUrls
				var indexInUrls = this.urls.indexOf(href);
				if (indexInUrls > -1) {
					this.replacementUrls[indexInUrls] = replacementUrl;
				}
			}.bind(this));

		replaced.push(replacement);
	}.bind(this));
	return Promise.all(replaced);
};

/**
 * Create a new CSS file with the replaced URLs
 * @private
 * @param  {string} href the original css file
 * @param  {[Archive]} archive
 * @param  {[method]} resolver
 * @return {Promise}  returns a BlobUrl to the new CSS file or a data url
 */
Resources.prototype.createCssFile = function(href, archive, resolver){
		var newUrl;
		var indexInUrls;
		archive = archive || this.settings.archive;
		resolver = resolver || this.settings.resolver;

		if (path.isAbsolute(href)) {
			return new Promise(function(resolve, reject){
				resolve(urls, replacementUrls);
			});
		}

		var absolute = resolver(href);

		// Get the text of the css file from the archive
		var textResponse = archive.getText(absolute);
		// Get asset links relative to css file
		var relUrls = this.urls.map(function(assetHref) {
				var resolved = resolver(assetHref);
				var relative = new Path(absolute).relative(resolved);

				return relative;
			}.bind(this));

		return textResponse.then(function (text) {
			// Replacements in the css text
			text = replace.substitute(text, relUrls, this.replacementUrls);

			// Get the new url
			if (this.settings.replacements === "base64") {
				newUrl = core.createBase64Url(text, 'text/css');
			} else {
				newUrl = core.createBlobUrl(text, 'text/css');
			}

			return newUrl;
		}.bind(this));

};

/**
 * Resolve all resources URLs relative to an absolute URL
 * @param  {string} absolute to be resolved to
 * @param  {[resolver]} resolver
 * @return {string[]} array with relative Urls
 */
Resources.prototype.relativeTo = function(absolute, resolver){
	resolver = resolver || this.settings.resolver;

	// Get Urls relative to current sections
	return this.urls.
		map(function(href) {
			var resolved = resolver(href);
			var relative = new Path(absolute).relative(resolved);
			return relative;
		}.bind(this));
};

/**
 * Get a URL for a resource
 * @param  {string} path
 * @return {string} url
 */
Resources.prototype.get = function(path) {
	var indexInUrls = this.urls.indexOf(path);
	if (indexInUrls === -1) {
		return;
	}
	if (this.replacementUrls.length) {
		return new Promise(function(resolve, reject) {
			resolve(this.replacementUrls[indexInUrls]);
		}.bind(this));
	} else {
		return archive.createUrl(absolute,
			{"base64": (this.settings.replacements === "base64")})
	}
}

/**
 * Substitute urls in content, with replacements,
 * relative to a url if provided
 * @param  {string} content
 * @param  {[string]} url   url to resolve to
 * @return {string}         content with urls substituted
 */
Resources.prototype.substitute = function(content, url) {
	var relUrls;
	if (url) {
		relUrls = this.relativeTo(url);
	} else {
		relUrls = this.urls;
	}
	return replace.substitute(content, relUrls, this.replacementUrls);
};


module.exports = Resources;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);
var Hook = __webpack_require__(6);
var Url = __webpack_require__(0).Url;

/**
 * Represents a Section of the Book
 * In most books this is equivelent to a Chapter
 * @param {object} item  The spine item representing the section
 * @param {object} hooks hooks for serialize and content
 */
function Section(item, hooks){
		this.idref = item.idref;
		this.linear = item.linear;
		this.properties = item.properties;
		this.index = item.index;
		this.href = item.href;
		this.url = item.url;
		this.next = item.next;
		this.prev = item.prev;

		this.cfiBase = item.cfiBase;

		if (hooks) {
			this.hooks = hooks;
		} else {
			this.hooks = {};
			this.hooks.serialize = new Hook(this);
			this.hooks.content = new Hook(this);
		}

};

/**
 * Load the section from its url
 * @param  {method} _request a request method to use for loading
 * @return {document} a promise with the xml document
 */
Section.prototype.load = function(_request){
	var request = _request || this.request || __webpack_require__(10);
	var loading = new core.defer();
	var loaded = loading.promise;

	if(this.contents) {
		loading.resolve(this.contents);
	} else {
		request(this.url)
			.then(function(xml){
				var base;
				var directory = new Url(this.url).directory;

				this.document = xml;
				this.contents = xml.documentElement;

				return this.hooks.content.trigger(this.document, this);
			}.bind(this))
			.then(function(){
				loading.resolve(this.contents);
			}.bind(this))
			.catch(function(error){
				loading.reject(error);
			});
	}

	return loaded;
};

/**
 * Adds a base tag for resolving urls in the section
 * @private
 * @param  {document} _document
 */
Section.prototype.base = function(_document){
		var task = new core.defer();
		var base = _document.createElement("base"); // TODO: check if exists
		var head;

		base.setAttribute("href", window.location.origin + "/" +this.url);

		if(_document) {
			head = _document.querySelector("head");
		}
		if(head) {
			head.insertBefore(base, head.firstChild);
			task.resolve();
		} else {
			task.reject(new Error("No head to insert into"));
		}


		return task.promise;
};

/**
 * Render the contents of a section
 * @param  {method} _request a request method to use for loading
 * @return {string} output a serialized XML Document
 */
Section.prototype.render = function(_request){
	var rendering = new core.defer();
	var rendered = rendering.promise;
	this.output; // TODO: better way to return this from hooks?

	this.load(_request).
		then(function(contents){
			var serializer;

			if (typeof XMLSerializer === "undefined") {
				XMLSerializer = __webpack_require__(14).XMLSerializer;
			}
			serializer = new XMLSerializer();
			this.output = serializer.serializeToString(contents);
			return this.output;
		}.bind(this)).
		then(function(){
			return this.hooks.serialize.trigger(this.output, this);
		}.bind(this)).
		then(function(){
			rendering.resolve(this.output);
		}.bind(this))
		.catch(function(error){
			rendering.reject(error);
		});

	return rendered;
};

/**
 * Find a string in a section
 * TODO: need reimplementation from v0.2
 * @param  {string} query [description]
 * @return {[type]} [description]
 */
Section.prototype.find = function(query){

};

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* @param {object} global  The globa layout settings object, chapter properties string
* @return {object} layoutProperties Object with layout properties
*/
Section.prototype.reconcileLayoutSettings = function(global){
	//-- Get the global defaults
	var settings = {
		layout : global.layout,
		spread : global.spread,
		orientation : global.orientation
	};

	//-- Get the chapter's display type
	this.properties.forEach(function(prop){
		var rendition = prop.replace("rendition:", '');
		var split = rendition.indexOf("-");
		var property, value;

		if(split != -1){
			property = rendition.slice(0, split);
			value = rendition.slice(split+1);

			settings[property] = value;
		}
	});
 return settings;
};

/**
 * Get a CFI from a Range in the Section
 * @param  {range} _range
 * @return {string} cfi an EpubCFI string
 */
Section.prototype.cfiFromRange = function(_range) {
	return new EpubCFI(_range, this.cfiBase).toString();
};

/**
 * Get a CFI from an Element in the Section
 * @param  {element} el
 * @return {string} cfi an EpubCFI string
 */
Section.prototype.cfiFromElement = function(el) {
	return new EpubCFI(el, this.cfiBase).toString();
};

module.exports = Section;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);
var Hook = __webpack_require__(6);
var Section = __webpack_require__(46);
var replacements = __webpack_require__(9);

/**
 * A collection of Spine Items
 */
function Spine(){
	this.spineItems = [];
	this.spineByHref = {};
	this.spineById = {};

	this.hooks = {};
	this.hooks.serialize = new Hook();
	this.hooks.content = new Hook();

	// Register replacements
	this.hooks.content.register(replacements.base);
	this.hooks.content.register(replacements.canonical);

	this.epubcfi = new EpubCFI();

	this.loaded = false;
};

/**
 * Unpack items from a opf into spine items
 * @param  {Package} _package
 * @param  {method} resolver URL resolver
 */
Spine.prototype.unpack = function(_package, resolver) {

	this.items = _package.spine;
	this.manifest = _package.manifest;
	this.spineNodeIndex = _package.spineNodeIndex;
	this.baseUrl = _package.baseUrl || _package.basePath || '';
	this.length = this.items.length;

	this.items.forEach(function(item, index){
		var href, url;
		var manifestItem = this.manifest[item.idref];
		var spineItem;

		item.cfiBase = this.epubcfi.generateChapterComponent(this.spineNodeIndex, item.index, item.idref);

		if(manifestItem) {
			item.href = manifestItem.href;
			item.url = resolver(item.href, true);

			if(manifestItem.properties.length){
				item.properties.push.apply(item.properties, manifestItem.properties);
			}
		}

		item.prev = function(){ return this.get(index-1); }.bind(this);
		item.next = function(){ return this.get(index+1); }.bind(this);

		spineItem = new Section(item, this.hooks);

		this.append(spineItem);


	}.bind(this));

	this.loaded = true;
};

/**
 * Get an item from the spine
 * @param  {[string|int]} target
 * @return {Section} section
 * @example spine.get();
 * @example spine.get(1);
 * @example spine.get("chap1.html");
 * @example spine.get("#id1234");
 */
Spine.prototype.get = function(target) {
	var index = 0;

	if(this.epubcfi.isCfiString(target)) {
		cfi = new EpubCFI(target);
		index = cfi.spinePos;
	} else if(target && (typeof target === "number" || isNaN(target) === false)){
		index = target;
	} else if(target && target.indexOf("#") === 0) {
		index = this.spineById[target.substring(1)];
	} else if(target) {
		// Remove fragments
		target = target.split("#")[0];
		index = this.spineByHref[target];
	}

	return this.spineItems[index] || null;
};

/**
 * Append a Section to the Spine
 * @private
 * @param  {Section} section
 */
Spine.prototype.append = function(section) {
	var index = this.spineItems.length;
	section.index = index;

	this.spineItems.push(section);

	this.spineByHref[section.href] = index;
	this.spineById[section.idref] = index;

	return index;
};

/**
 * Prepend a Section to the Spine
 * @private
 * @param  {Section} section
 */
Spine.prototype.prepend = function(section) {
	var index = this.spineItems.unshift(section);
	this.spineByHref[section.href] = 0;
	this.spineById[section.idref] = 0;

	// Re-index
	this.spineItems.forEach(function(item, index){
		item.index = index;
	});

	return 0;
};

// Spine.prototype.insert = function(section, index) {
//
// };

/**
 * Remove a Section from the Spine
 * @private
 * @param  {Section} section
 */
Spine.prototype.remove = function(section) {
	var index = this.spineItems.indexOf(section);

	if(index > -1) {
		delete this.spineByHref[section.href];
		delete this.spineById[section.idref];

		return this.spineItems.splice(index, 1);
	}
};

/**
 * Loop over the Sections in the Spine
 * @return {method} forEach
 */
Spine.prototype.each = function() {
	return this.spineItems.forEach.apply(this.spineItems, arguments);
};

module.exports = Spine;


/***/ },
/* 48 */
/***/ function(module, exports) {

if(typeof __WEBPACK_EXTERNAL_MODULE_48__ === 'undefined') {var e = new Error("Cannot find module \"JSZip\""); e.code = 'MODULE_NOT_FOUND'; throw e;}
module.exports = __WEBPACK_EXTERNAL_MODULE_48__;

/***/ },
/* 49 */,
/* 50 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var Book = __webpack_require__(17);
var EpubCFI = __webpack_require__(1);
var Rendition = __webpack_require__(13);
var Contents = __webpack_require__(11);

/**
 * Creates a new Book
 * @param {string|ArrayBuffer} url URL, Path or ArrayBuffer
 * @param {object} options to pass to the book
 * @returns {Book} a new Book object
 * @example ePub("/path/to/book.epub", {})
 */
function ePub(url, options) {
	return new Book(url, options);
};

ePub.VERSION = "0.3.0";

if (typeof(global) !== "undefined") {
	global.EPUBJS_VERSION = ePub.VERSION;
}

ePub.CFI = EpubCFI;
ePub.Rendition = Rendition;
ePub.Contents = Contents;

ePub.ViewManagers = {};
ePub.Views = {};
/**
 * register plugins
 */
ePub.register = {
	/**
	 * register a new view manager
	 */
	manager : function(name, manager){
		return ePub.ViewManagers[name] = manager;
	},
	/**
	 * register a new view
	 */
	view : function(name, view){
		return ePub.Views[name] = view;
	}
};

// Default Views
ePub.register.view("iframe", __webpack_require__(19));

// Default View Managers
ePub.register.manager("default", __webpack_require__(12));
ePub.register.manager("continuous", __webpack_require__(18));

module.exports = ePub;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ }
/******/ ])
});
;
//# sourceMappingURL=epub.js.map