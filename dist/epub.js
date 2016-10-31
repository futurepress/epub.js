(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory((function webpackLoadOptionalExternalModule() { try { return require("JSZip"); } catch(e) {} }()), require("xmldom"));
	else if(typeof define === 'function' && define.amd)
		define(["JSZip", "xmldom"], factory);
	else if(typeof exports === 'object')
		exports["ePub"] = factory((function webpackLoadOptionalExternalModule() { try { return require("JSZip"); } catch(e) {} }()), require("xmldom"));
	else
		root["ePub"] = factory(root["JSZip"], root["xmldom"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_44__, __WEBPACK_EXTERNAL_MODULE_14__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 46);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

var base64 = __webpack_require__(20);
var path = __webpack_require__(3);

var requestAnimationFrame = (typeof window != 'undefined') ? (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame) : false;
/*
//-- Parse the different parts of a url, returning a object
function uri(url){
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

		uri.directory = folder(uri.path);

		uri.base = uri.origin + uri.directory;
		// return origin;
	} else {
		uri.path = url;
		uri.directory = folder(url);
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
function folder(url){

	var lastSlash = url.lastIndexOf('/');

	if(lastSlash == -1) var folder = '';

	folder = url.slice(0, lastSlash + 1);

	return folder;

};
*/

function extension(_url) {
	var url;
	var pathname;
	var ext;

	try {
		url = new Url(url);
		pathname = url.pathname;
	} catch (e) {
		pathname = _url;
	}

	ext = path.extname(pathname);
	if (ext) {
		return ext.slice(1);
	}

	return '';
}

function directory(_url) {
	var url;
	var pathname;
	var ext;

	try {
		url = new Url(url);
		pathname = url.pathname;
	} catch (e) {
		pathname = _url;
	}

	return path.dirname(pathname);
}

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
function cleanStringForXpath(str)  {
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
		DOMParser = __webpack_require__(14).DOMParser;
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

function defer() {
	// From: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred#backwards_forwards_compatible
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

	/* A newly created Pomise object.
	 * Initially in pending state.
	 */
	this.promise = new Promise(function(resolve, reject) {
		this.resolve = resolve;
		this.reject = reject;
	}.bind(this));
	Object.freeze(this);
}

module.exports = {
	// 'uri': uri,
	// 'folder': folder,
	'extension' : extension,
	'directory' : directory,
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
	'defer': defer
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
	} else if (typeof cfi === 'object' && core.type(cfi) === "Range"){
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


	// Compare Each Step in the First item
	for (var i = 0; i < cfiOne.path.steps.length; i++) {
		if(!cfiTwo.path.steps[i]) {
			return 1;
		}
		if(cfiOne.path.steps[i].index > cfiTwo.path.steps[i].index) {
			return 1;
		}
		if(cfiOne.path.steps[i].index < cfiTwo.path.steps[i].index) {
			return -1;
		}
		// Otherwise continue checking
	}

	// All steps in First equal to Second and First is Less Specific
	if(cfiOne.path.steps.length < cfiTwo.path.steps.length) {
		return 1;
	}

	// Compare the charecter offset of the text node
	if(cfiOne.path.terminal.offset > cfiTwo.path.terminal.offset) {
		return 1;
	}
	if(cfiOne.path.terminal.offset < cfiTwo.path.terminal.offset) {
		return -1;
	}

	// TODO: compare ranges

	// CFI's are equal
	return 0;
};

EpubCFI.prototype.step = function(node) {
	var nodeType = (node.nodeType === Node.TEXT_NODE) ? 'text' : 'element';

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
	nodeType = (filteredNode.nodeType === Node.TEXT_NODE) ? 'text' : 'element';

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
				currentNode.parentNode.nodeType != Node.DOCUMENT_NODE) {

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
				if(i == len-1) {
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

	if (anchor.nodeType === Node.TEXT_NODE) {
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
		if (previousSibling && previousSibling.nodeType === Node.TEXT_NODE) {
			sibling = previousSibling;
		} else if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
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

	if (anchor.nodeType != Node.TEXT_NODE) {
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
		if(curr.previousSibling.nodeType === Node.ELEMENT_NODE) {
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
		if (currNodeType === Node.ELEMENT_NODE &&
				children[i].classList.contains(ignoreClass)) {
			currNodeType = Node.TEXT_NODE;
		}

		if (i > 0 &&
				currNodeType === Node.TEXT_NODE &&
				prevNodeType === Node.TEXT_NODE) {
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

	if (anchor.nodeType === Node.ELEMENT_NODE) {
		children = anchor.parentNode.children;
		index = Array.prototype.indexOf.call(children, anchor);
	} else {
		children = this.textNodes(anchor.parentNode);
		index = children.indexOf(anchor);
	}

	return index;
};

EpubCFI.prototype.filteredPosition = function(anchor, ignoreClass) {
	var children, index, map;

	if (anchor.nodeType === Node.ELEMENT_NODE) {
		children = anchor.parentNode.children;
		map = this.normalizedMap(children, Node.ELEMENT_NODE, ignoreClass);
	} else {
		children = anchor.parentNode.childNodes;
		// Inside an ignored node
		if(anchor.parentNode.classList.contains(ignoreClass)) {
			anchor = anchor.parentNode;
			children = anchor.parentNode.childNodes;
		}
		map = this.normalizedMap(children, Node.TEXT_NODE, ignoreClass);
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
			if (node.nodeType === Node.TEXT_NODE) {
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
	var map = this.normalizedMap(children, Node.TEXT_NODE, ignoreClass);
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
				if (child.nodeType === Node.ELEMENT_NODE) {
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
'use strict';

var d        = __webpack_require__(21)
  , callable = __webpack_require__(30)

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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);

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
		// uri = new URI(url);
		// type = uri.suffix();
		type = core.extension(url);
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

//-- Hooks allow for injecting functions that must all complete in order before finishing
//   They will execute in parallel but all must finish before continuing
//   Functions may return a promise if they are asycn.

// this.content = new EPUBJS.Hook();
// this.content.register(function(){});
// this.content.trigger(args).then(function(){});

function Hook(context){
	this.context = context || this;
	this.hooks = [];
};

// Adds a function to be run before a hook completes
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

// Triggers a hook to run all functions
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

function Queue(_context){
	this._q = [];
	this.context = _context;
	this.tick = core.requestAnimationFrame;
	this.running = false;
	this.paused = false;
};

// Add an item to the queue
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

// Run one item
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

// Run all sequentially, at convince

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

// Flush all, as quickly as possible
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

// Clear all items in wait
Queue.prototype.clear = function(){
	this._q = [];
	this.running = false;
};

Queue.prototype.length = function(){
	return this._q.length;
};

Queue.prototype.pause = function(){
	this.paused = true;
};

// Create a new task from a callback
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

var EventEmitter = __webpack_require__(2);
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

	/**
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
				position = range.getBoundingClientRect();
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(2);
var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);
var Mapping = __webpack_require__(7);
var Queue = __webpack_require__(8);
var Stage = __webpack_require__(38);
var Views = __webpack_require__(39);

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
		.then(function(view){

			// Move to correct place within the section, if needed
			if(target) {
				offset = view.locationOf(target);
				this.moveTo(offset);
			}

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
	var view;
	var start, end;

	if(this.views.length) {
		view = this.views.first();
		start = container.left - view.position().left;
		end = start + this.layout.spread;

		return this.mapping.page(view, view.section.cfiBase);
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(2);
var path = __webpack_require__(3);
var core = __webpack_require__(0);
var replace = __webpack_require__(13);
var Hook = __webpack_require__(6);
var EpubCFI = __webpack_require__(1);
var Queue = __webpack_require__(8);
var Layout = __webpack_require__(36);
var Mapping = __webpack_require__(7);

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
		minSpreadWidth: 800, //-- overridden by spread: none (never) / both (always),
		useBase64: true
	});

	core.extend(this.settings, options);

	this.viewSettings = {
		ignoreClass: this.settings.ignoreClass
	};

	this.book = book;

	this.views = null;

	//-- Adds Hook methods to the Rendition prototype
	this.hooks = {};
	this.hooks.display = new Hook(this);
	this.hooks.serialize = new Hook(this);
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
	// this.starting = new core.defer();
	// this.started = this.starting.promise;
	this.q.enqueue(this.start);

	if(this.book.unarchived) {
		this.q.enqueue(this.replacements.bind(this));
	}

};

Rendition.prototype.setManager = function(manager) {
	this.manager = manager;
};

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

Rendition.prototype.start = function(){

	if(!this.manager) {
		this.ViewManager = this.requireManager(this.settings.manager);
		this.View = this.requireView(this.settings.view);

		this.manager = new this.ViewManager({
			view: this.View,
			queue: this.q,
			request: this.book.request,
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
	// this.starting.resolve();
};

// Call to attach the container to an element in the dom
// Container must be attached before rendering can begin
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

Rendition.prototype.display = function(target){

	// if (!this.book.spine.spineItems.length > 0) {
		// Book isn't open yet
		// return this.q.enqueue(this.display, target);
	// }

	return this.q.enqueue(this._display, target);

};

Rendition.prototype._display = function(target){
	var isCfiString = this.epubcfi.isCfiString(target);
	var displaying = new core.defer();
	var displayed = displaying.promise;
	var section;
	var moveTo;

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
			this.emit("displayed", section);
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

Rendition.prototype.afterDisplayed = function(view){
	this.hooks.content.trigger(view, this);
	this.emit("rendered", view.section);
	this.reportLocation();
};

Rendition.prototype.onResized = function(size){

	if(this.location) {
		this.display(this.location.start);
	}

	this.emit("resized", {
		width: size.width,
		height: size.height
	});

};

Rendition.prototype.moveTo = function(offset){
	this.manager.moveTo(offset);
};

Rendition.prototype.next = function(){
	return this.q.enqueue(this.manager.next.bind(this.manager))
		.then(this.reportLocation.bind(this));
};

Rendition.prototype.prev = function(){
	return this.q.enqueue(this.manager.prev.bind(this.manager))
		.then(this.reportLocation.bind(this));
};

//-- http://www.idpf.org/epub/301/spec/epub-publications.html#meta-properties-rendering
Rendition.prototype.determineLayoutProperties = function(metadata){
	var settings;
	var layout = this.settings.layout || metadata.layout || "reflowable";
	var spread = this.settings.spread || metadata.spread || "auto";
	var orientation = this.settings.orientation || metadata.orientation || "auto";
	var flow = this.settings.flow || metadata.flow || "auto";
	var viewport = metadata.viewport || "";
	var minSpreadWidth = this.settings.minSpreadWidth || metadata.minSpreadWidth || 800;

	if (this.settings.width >= 0 && this.settings.height >= 0) {
		viewport = "width="+this.settings.width+", height="+this.settings.height+"";
	}

	settings = {
		layout : layout,
		spread : spread,
		orientation : orientation,
		flow : flow,
		viewport : viewport,
		minSpreadWidth : minSpreadWidth
	};

	return settings;
};

// Rendition.prototype.applyLayoutProperties = function(){
// 	var settings = this.determineLayoutProperties(this.book.package.metadata);
//
// 	this.flow(settings.flow);
//
// 	this.layout(settings);
// };

// paginated | scrolled
// (scrolled-continuous vs scrolled-doc are handled by different view managers)
Rendition.prototype.flow = function(_flow){
	var flow;
	if (_flow === "scrolled-doc" || _flow === "scrolled-continuous") {
		flow = "scrolled";
	}

	if (_flow === "auto" || _flow === "paginated") {
		flow = "paginated";
	}

	if (this._layout) {
		this._layout.flow(flow);
	}

	if (this.manager) {
		this.manager.updateFlow(flow);
	}
};

// reflowable | pre-paginated
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

// none | auto (TODO: implement landscape, portrait, both)
Rendition.prototype.spread = function(spread, min){

	this._layout.spread(spread, min);

	if (this.manager.isRendered()) {
		this.manager.updateLayout();
	}
};


Rendition.prototype.reportLocation = function(){
	return this.q.enqueue(function(){
		var location = this.manager.currentLocation();
		if (location && location.then && typeof location.then === 'function') {
			location.then(function(result) {
				this.location = result;
				this.emit("locationChanged", this.location);
			}.bind(this));
		} else if (location) {
			this.location = location;
			this.emit("locationChanged", this.location);
		}

	}.bind(this));
};


Rendition.prototype.destroy = function(){
	// Clear the queue
	this.q.clear();

	this.manager.destroy();
};

Rendition.prototype.passViewEvents = function(view){
	view.contents.listenedEvents.forEach(function(e){
		view.on(e, this.triggerViewEvent.bind(this));
	}.bind(this));

	view.on("selected", this.triggerSelectedEvent.bind(this));
};

Rendition.prototype.triggerViewEvent = function(e){
	this.emit(e.type, e);
};

Rendition.prototype.triggerSelectedEvent = function(cfirange){
	this.emit("selected", cfirange);
};

Rendition.prototype.replacements = function(){
	// Wait for loading
	// return this.q.enqueue(function () {
		// Get thes books manifest
		var manifest = this.book.package.manifest;
		var manifestArray = Object.keys(manifest).
			map(function (key){
				return manifest[key];
			});

		// Exclude HTML
		var items = manifestArray.
			filter(function (item){
				if (item.type != "application/xhtml+xml" &&
						item.type != "text/html") {
					return true;
				}
			});

		// Only CSS
		var css = items.
			filter(function (item){
				if (item.type === "text/css") {
					return true;
				}
			});

		// Css Urls
		var cssUrls = css.map(function(item) {
			return item.href;
		});

		// All Assets Urls
		var urls = items.
			map(function(item) {
				return item.href;
			}.bind(this));

		// Create blob urls for all the assets
		var processing = urls.
			map(function(url) {
				// var absolute = new URL(url, this.book.baseUrl).toString();
				var absolute = path.resolve(this.book.basePath, url);
				// Full url from archive base
				return this.book.unarchived.createUrl(absolute, {"base64": this.settings.useBase64});
			}.bind(this));

		var replacementUrls;

		// After all the urls are created
		return Promise.all(processing)
			.then(function(_replacementUrls) {
				var replaced = [];

				replacementUrls = _replacementUrls;

				// Replace Asset Urls in the text of all css files
				cssUrls.forEach(function(href) {
					replaced.push(this.replaceCss(href, urls, replacementUrls));
				}.bind(this));

				return Promise.all(replaced);

			}.bind(this))
			.then(function () {
				// Replace Asset Urls in chapters
				// by registering a hook after the sections contents has been serialized
				this.book.spine.hooks.serialize.register(function(output, section) {

					this.replaceAssets(section, urls, replacementUrls);

				}.bind(this));

			}.bind(this))
			.catch(function(reason){
				console.error(reason);
			});
	// }.bind(this));
};

Rendition.prototype.replaceCss = function(href, urls, replacementUrls){
		var newUrl;
		var indexInUrls;

		// Find the absolute url of the css file
		// var fileUri = URI(href);
		// var absolute = fileUri.absoluteTo(this.book.baseUrl).toString();

		if (path.isAbsolute(href)) {
			return new Promise(function(resolve, reject){
				resolve(urls, replacementUrls);
			});
		}

		var fileUri;
		var absolute;
		if (this.book.baseUrl) {
			fileUri = new URL(href, this.book.baseUrl);
			absolute = fileUri.toString();
		} else {
			absolute = path.resolve(this.book.basePath, href);
		}


		// Get the text of the css file from the archive
		var textResponse = this.book.unarchived.getText(absolute);
		// Get asset links relative to css file
		var relUrls = urls.
			map(function(assetHref) {
				// var assetUri = URI(assetHref).absoluteTo(this.book.baseUrl);
				// var relative = assetUri.relativeTo(absolute).toString();

				var assetUrl;
				var relativeUrl;
				if (this.book.baseUrl) {
					assetUrl = new URL(assetHref, this.book.baseUrl);
					relative = path.relative(path.dirname(fileUri.pathname), assetUrl.pathname);
				} else {
					assetUrl = path.resolve(this.book.basePath, assetHref);
					relative = path.relative(path.dirname(absolute), assetUrl);
				}

				return relative;
			}.bind(this));

		return textResponse.then(function (text) {
			// Replacements in the css text
			text = replace.substitute(text, relUrls, replacementUrls);

			// Get the new url
			if (this.settings.useBase64) {
				newUrl = core.createBase64Url(text, 'text/css');
			} else {
				newUrl = core.createBlobUrl(text, 'text/css');
			}

			// switch the url in the replacementUrls
			indexInUrls = urls.indexOf(href);
			if (indexInUrls > -1) {
				replacementUrls[indexInUrls] = newUrl;
			}

			return new Promise(function(resolve, reject){
				resolve(urls, replacementUrls);
			});

		}.bind(this));

};

Rendition.prototype.replaceAssets = function(section, urls, replacementUrls){
	// var fileUri = URI(section.url);
	var fileUri;
	var absolute;
	if (this.book.baseUrl) {
		fileUri = new URL(section.url, this.book.baseUrl);
		absolute = fileUri.toString();
	} else {
		absolute = path.resolve(this.book.basePath, section.url);
	}

	// Get Urls relative to current sections
	var relUrls = urls.
		map(function(href) {
			// var assetUri = URI(href).absoluteTo(this.book.baseUrl);
			// var relative = assetUri.relativeTo(fileUri).toString();

			var assetUrl;
			var relativeUrl;
			if (this.book.baseUrl) {
				assetUrl = new URL(href, this.book.baseUrl);
				relative = path.relative(path.dirname(fileUri.pathname), assetUrl.pathname);
			} else {
				assetUrl = path.resolve(this.book.basePath, href);
				relative = path.relative(path.dirname(absolute), assetUrl);
			}

			return relative;
		}.bind(this));


	section.output = replace.substitute(section.output, relUrls, replacementUrls);
};

Rendition.prototype.range = function(_cfi, ignoreClass){
	var cfi = new EpubCFI(_cfi);
	var found = this.visible().filter(function (view) {
		if(cfi.spinePos === view.index) return true;
	});

	// Should only every return 1 item
	if (found.length) {
		return found[0].range(cfi, ignoreClass);
	}
};

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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

var path = __webpack_require__(3);
var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);


function Parser(){};

Parser.prototype.container = function(containerXml){
		//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
		var rootfile, fullpath, folder, encoding;

		if(!containerXml) {
			console.error("Container File Not Found");
			return;
		}

		rootfile = core.qs(containerXml, "rootfile");

		if(!rootfile) {
			console.error("No RootFile Found");
			return;
		}

		fullpath = rootfile.getAttribute('full-path');
		folder = path.dirname(fullpath);
		encoding = containerXml.xmlEncoding;

		//-- Now that we have the path we can parse the contents
		return {
			'packagePath' : fullpath,
			'basePath' : folder,
			'encoding' : encoding
		};
};

Parser.prototype.identifier = function(packageXml){
	var metadataNode;

	if(!packageXml) {
		console.error("Package File Not Found");
		return;
	}

	metadataNode = core.qs(packageXml, "metadata");

	if(!metadataNode) {
		console.error("No Metadata Found");
		return;
	}

	return this.getElementText(metadataNode, "identifier");
};

Parser.prototype.packageContents = function(packageXml){
	var parse = this;
	var metadataNode, manifestNode, spineNode;
	var manifest, navPath, ncxPath, coverPath;
	var spineNodeIndex;
	var spine;
	var spineIndexByURL;
	var metadata;

	if(!packageXml) {
		console.error("Package File Not Found");
		return;
	}

	metadataNode = core.qs(packageXml, "metadata");
	if(!metadataNode) {
		console.error("No Metadata Found");
		return;
	}

	manifestNode = core.qs(packageXml, "manifest");
	if(!manifestNode) {
		console.error("No Manifest Found");
		return;
	}

	spineNode = core.qs(packageXml, "spine");
	if(!spineNode) {
		console.error("No Spine Found");
		return;
	}

	manifest = parse.manifest(manifestNode);
	navPath = parse.findNavPath(manifestNode);
	ncxPath = parse.findNcxPath(manifestNode, spineNode);
	coverPath = parse.findCoverPath(packageXml);

	spineNodeIndex = Array.prototype.indexOf.call(spineNode.parentNode.childNodes, spineNode);

	spine = parse.spine(spineNode, manifest);

	metadata = parse.metadata(metadataNode);

	metadata.direction = spineNode.getAttribute("page-progression-direction");

	return {
		'metadata' : metadata,
		'spine'    : spine,
		'manifest' : manifest,
		'navPath'  : navPath,
		'ncxPath'  : ncxPath,
		'coverPath': coverPath,
		'spineNodeIndex' : spineNodeIndex
	};
};

//-- Find TOC NAV
Parser.prototype.findNavPath = function(manifestNode){
	// Find item with property 'nav'
	// Should catch nav irregardless of order
	// var node = manifestNode.querySelector("item[properties$='nav'], item[properties^='nav '], item[properties*=' nav ']");
	var node = core.qsp(manifestNode, "item", {"properties":"nav"});
	return node ? node.getAttribute('href') : false;
};

//-- Find TOC NCX: media-type="application/x-dtbncx+xml" href="toc.ncx"
Parser.prototype.findNcxPath = function(manifestNode, spineNode){
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

//-- Expanded to match Readium web components
Parser.prototype.metadata = function(xml){
	var metadata = {},
			p = this;

	metadata.title = p.getElementText(xml, 'title');
	metadata.creator = p.getElementText(xml, 'creator');
	metadata.description = p.getElementText(xml, 'description');

	metadata.pubdate = p.getElementText(xml, 'date');

	metadata.publisher = p.getElementText(xml, 'publisher');

	metadata.identifier = p.getElementText(xml, "identifier");
	metadata.language = p.getElementText(xml, "language");
	metadata.rights = p.getElementText(xml, "rights");

	metadata.modified_date = p.getPropertyText(xml, 'dcterms:modified');

	metadata.layout = p.getPropertyText(xml, "rendition:layout");
	metadata.orientation = p.getPropertyText(xml, 'rendition:orientation');
	metadata.flow = p.getPropertyText(xml, 'rendition:flow');
	metadata.viewport = p.getPropertyText(xml, 'rendition:viewport');
	// metadata.page_prog_dir = packageXml.querySelector("spine").getAttribute("page-progression-direction");

	return metadata;
};

//-- Find Cover: <item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />
//-- Fallback for Epub 2.0
Parser.prototype.findCoverPath = function(packageXml){
	var pkg = core.qs(packageXml, "package");
	var epubVersion = pkg.getAttribute('version');

	if (epubVersion === '2.0') {
		var metaCover = core.qsp(packageXml, 'meta', {'name':'cover'});
		if (metaCover) {
			var coverId = metaCover.getAttribute('content');
			// var cover = packageXml.querySelector("item[id='" + coverId + "']");
			var cover = packageXml.getElementById(coverId);
			return cover ? cover.getAttribute('href') : false;
		}
		else {
			return false;
		}
	}
	else {
		// var node = packageXml.querySelector("item[properties='cover-image']");
		var node = core.qsp(packageXml, 'item', {'properties':'cover-image'});
		return node ? node.getAttribute('href') : false;
	}
};

Parser.prototype.getElementText = function(xml, tag){
	var found = xml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", tag),
		el;

	if(!found || found.length === 0) return '';

	el = found[0];

	if(el.childNodes.length){
		return el.childNodes[0].nodeValue;
	}

	return '';

};

Parser.prototype.getPropertyText = function(xml, property){
	var el = core.qsp(xml, "meta", {"property":property});

	if(el && el.childNodes.length){
		return el.childNodes[0].nodeValue;
	}

	return '';
};

Parser.prototype.querySelectorText = function(xml, q){
	var el = xml.querySelector(q);

	if(el && el.childNodes.length){
		return el.childNodes[0].nodeValue;
	}

	return '';
};

Parser.prototype.manifest = function(manifestXml){
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

Parser.prototype.spine = function(spineXml, manifest){
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

Parser.prototype.querySelectorByType = function(html, element, type){
	var query;
	if (typeof html.querySelector != "undefined") {
		query = html.querySelector(element+'[*|type="'+type+'"]');
	}
	// Handle IE not supporting namespaced epub:type in querySelector
	if(!query || query.length === 0) {
		query = core.qsa(html, element);
		for (var i = 0; i < query.length; i++) {
			if(query[i].getAttributeNS("http://www.idpf.org/2007/ops", "type") === type) {
				return query[i];
			}
		}
	} else {
		return query;
	}
};

Parser.prototype.nav = function(navHtml, spineIndexByURL, bookSpine){
	var navElement = this.querySelectorByType(navHtml, "nav", "toc");
	// var navItems = navElement ? navElement.querySelectorAll("ol li") : [];
	var navItems = navElement ? core.qsa(navElement, "li") : [];
	var length = navItems.length;
	var i;
	var toc = {};
	var list = [];
	var item, parent;

	if(!navItems || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.navItem(navItems[i], spineIndexByURL, bookSpine);
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

Parser.prototype.navItem = function(item, spineIndexByURL, bookSpine){
	var id = item.getAttribute('id') || false,
			// content = item.querySelector("a, span"),
			content = core.qs(item, "a"),
			src = content.getAttribute('href') || '',
			text = content.textContent || "",
			// split = src.split("#"),
			// baseUrl = split[0],
			// spinePos = spineIndexByURL[baseUrl],
			// spineItem = bookSpine[spinePos],
			subitems = [],
			parentNode = item.parentNode,
			parent;
			// cfi = spineItem ? spineItem.cfi : '';

	if(parentNode && parentNode.nodeName === "navPoint") {
		parent = parentNode.getAttribute('id');
	}

	/*
	if(!id) {
		if(spinePos) {
			spineItem = bookSpine[spinePos];
			id = spineItem.id;
			cfi = spineItem.cfi;
		} else {
			id = 'epubjs-autogen-toc-id-' + EPUBJS.core.uuid();
			item.setAttribute('id', id);
		}
	}
	*/

	return {
		"id": id,
		"href": src,
		"label": text,
		"subitems" : subitems,
		"parent" : parent
	};
};

Parser.prototype.ncx = function(tocXml, spineIndexByURL, bookSpine){
	// var navPoints = tocXml.querySelectorAll("navMap navPoint");
	var navPoints = core.qsa(tocXml, "navPoint");
	var length = navPoints.length;
	var i;
	var toc = {};
	var list = [];
	var item, parent;

	if(!navPoints || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.ncxItem(navPoints[i], spineIndexByURL, bookSpine);
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

Parser.prototype.ncxItem = function(item, spineIndexByURL, bookSpine){
	var id = item.getAttribute('id') || false,
			// content = item.querySelector("content"),
			content = core.qs(item, "content"),
			src = content.getAttribute('src'),
			// navLabel = item.querySelector("navLabel"),
			navLabel = core.qs(item, "navLabel"),
			text = navLabel.textContent ? navLabel.textContent : "",
			// split = src.split("#"),
			// baseUrl = split[0],
			// spinePos = spineIndexByURL[baseUrl],
			// spineItem = bookSpine[spinePos],
			subitems = [],
			parentNode = item.parentNode,
			parent;
			// cfi = spineItem ? spineItem.cfi : '';

	if(parentNode && parentNode.nodeName === "navPoint") {
		parent = parentNode.getAttribute('id');
	}

	/*
	if(!id) {
		if(spinePos) {
			spineItem = bookSpine[spinePos];
			id = spineItem.id;
			cfi = spineItem.cfi;
		} else {
			id = 'epubjs-autogen-toc-id-' + EPUBJS.core.uuid();
			item.setAttribute('id', id);
		}
	}
	*/

	return {
		"id": id,
		"href": src,
		"label": text,
		"subitems" : subitems,
		"parent" : parent
	};
};

Parser.prototype.pageList = function(navHtml, spineIndexByURL, bookSpine){
	var navElement = this.querySelectorByType(navHtml, "nav", "page-list");
	// var navItems = navElement ? navElement.querySelectorAll("ol li") : [];
	var navItems = navElement ? core.qsa(navElement, "li") : [];
	var length = navItems.length;
	var i;
	var toc = {};
	var list = [];
	var item;

	if(!navItems || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.pageListItem(navItems[i], spineIndexByURL, bookSpine);
		list.push(item);
	}

	return list;
};

Parser.prototype.pageListItem = function(item, spineIndexByURL, bookSpine){
	var id = item.getAttribute('id') || false,
		// content = item.querySelector("a"),
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

module.exports = Parser;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

// var URI = require('urijs');
var core = __webpack_require__(0);

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

		// var linkUri = URI(href);
		// var absolute = linkUri.absoluteTo(view.section.url);
		// var relative = absolute.relativeTo(this.book.baseUrl).toString();
		var linkUrl;
		var linkPath;
		var relative;

		if (this.book.baseUrl) {
			linkUrl = new URL(href, this.book.baseUrl);
			relative = path.relative(path.dirname(linkUrl.pathname), this.book.packagePath);
		} else {
			linkPath = path.resolve(this.book.basePath, href);
			relative = path.relative(this.book.packagePath, linkPath);
		}

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

			// if(linkUri.fragment()) {
				// do nothing with fragment yet
			// } else {
				link.onclick = function(){
					renderer.display(relative);
					return false;
				};
			// }

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
/* 14 */
/***/ function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_14__;

/***/ },
/* 15 */,
/* 16 */
/***/ function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(2);
var path = __webpack_require__(3);
var core = __webpack_require__(0);
var Spine = __webpack_require__(42);
var Locations = __webpack_require__(37);
var Parser = __webpack_require__(12);
var Navigation = __webpack_require__(40);
var Rendition = __webpack_require__(11);
var Unarchive = __webpack_require__(43);
var request = __webpack_require__(4);
var EpubCFI = __webpack_require__(1);

function Book(_url, options){

	this.settings = core.extend(this.settings || {}, {
		requestMethod: this.requestMethod
	});

	core.extend(this.settings, options);


	// Promises
	this.opening = new core.defer();
	this.opened = this.opening.promise;
	this.isOpen = false;

	this.url = undefined;

	this.loading = {
		manifest: new core.defer(),
		spine: new core.defer(),
		metadata: new core.defer(),
		cover: new core.defer(),
		navigation: new core.defer(),
		pageList: new core.defer()
	};

	this.loaded = {
		manifest: this.loading.manifest.promise,
		spine: this.loading.spine.promise,
		metadata: this.loading.metadata.promise,
		cover: this.loading.cover.promise,
		navigation: this.loading.navigation.promise,
		pageList: this.loading.pageList.promise
	};

	// this.ready = RSVP.hash(this.loaded);
	this.ready = Promise.all([this.loaded.manifest,
														this.loaded.spine,
														this.loaded.metadata,
														this.loaded.cover,
														this.loaded.navigation,
														this.loaded.pageList ]);


	// Queue for methods used before opening
	this.isRendered = false;
	// this._q = core.queue(this);

	this.request = this.settings.requestMethod.bind(this);

	this.spine = new Spine(this.request);
	this.locations = new Locations(this.spine, this.request);

	if(_url) {
		this.open(_url).catch(function (error) {
			var err = new Error("Cannot load book at "+ _url );
			console.error(err);

			this.emit("loadFailed", error);
		}.bind(this));
	}
};

Book.prototype.open = function(_url, options){
	var url;
	var pathname;
	var parse = new Parser();
	var epubPackage;
	var epubContainer;
	var book = this;
	var containerPath = "META-INF/container.xml";
	var location;
	var isArrayBuffer = false;
	var isBase64 = options && options.base64;

	if(!_url) {
		this.opening.resolve(this);
		return this.opened;
	}

	// Reuse parsed url or create a new uri object
	// if(typeof(_url) === "object") {
	//   uri = _url;
	// } else {
	//   uri = core.uri(_url);
	// }
	if (_url instanceof ArrayBuffer || isBase64) {
		isArrayBuffer = true;
		this.url = '/';
	}

	if (window && window.location && !isArrayBuffer) {
		// absoluteUri = uri.absoluteTo(window.location.href);
		url = new URL(_url, window.location.href);
		pathname = url.pathname;
		// this.url = absoluteUri.toString();
		this.url = url.toString();
	} else if (window && window.location) {
		this.url = window.location.href;
	} else {
		this.url = _url;
	}

	// Find path to the Container
	// if(uri && uri.suffix() === "opf") {
	if(url && core.extension(pathname) === "opf") {
		// Direct link to package, no container
		this.packageUrl = _url;
		this.containerUrl = '';

		if(url.origin) {
			// this.baseUrl = uri.origin() + uri.directory() + "/";
			this.baseUrl = url.origin + "/" + path.dirname(pathname) + "/";
		// } else if(absoluteUri){
		// 	this.baseUrl = absoluteUri.origin();
		// 	this.baseUrl += absoluteUri.directory() + "/";
		} else {
			this.baseUrl = path.dirname(pathname) + "/";
		}

		epubPackage = this.request(this.packageUrl)
			.catch(function(error) {
				book.opening.reject(error);
			});

	} else if(isArrayBuffer || isBase64 || this.isArchivedUrl(_url)) {
		// Book is archived
		this.url = '';
		// this.containerUrl = URI(containerPath).absoluteTo(this.url).toString();
		this.containerUrl = path.resolve("", containerPath);

		epubContainer = this.unarchive(_url, isBase64).
			then(function() {
				return this.request(this.containerUrl);
			}.bind(this))
			.catch(function(error) {
				book.opening.reject(error);
			});
	}
	// Find the path to the Package from the container
	else if (!core.extension(pathname)) {

		this.containerUrl = this.url + containerPath;

		epubContainer = this.request(this.containerUrl)
			.catch(function(error) {
				// handle errors in loading container
				book.opening.reject(error);
			});
	}

	if (epubContainer) {
		epubPackage = epubContainer.
			then(function(containerXml){
				return parse.container(containerXml); // Container has path to content
			}).
			then(function(paths){
				// var packageUri = URI(paths.packagePath);
				// var absPackageUri = packageUri.absoluteTo(book.url);
				var packageUrl;

				if (book.url) {
					packageUrl = new URL(paths.packagePath, book.url);
					book.packageUrl = packageUrl.toString();
				} else {
					book.packageUrl = "/" + paths.packagePath;
				}

				book.packagePath = paths.packagePath;
				book.encoding = paths.encoding;

				// Set Url relative to the content
				if(packageUrl && packageUrl.origin) {
					book.baseUrl = book.url + path.dirname(paths.packagePath) + "/";
				} else {
					if(path.dirname(paths.packagePath)) {
						book.baseUrl = ""
						book.basePath = "/" + path.dirname(paths.packagePath) + "/";
					} else {
						book.basePath = "/"
					}
				}

				return book.request(book.packageUrl);
			}).catch(function(error) {
				// handle errors in either of the two requests
				book.opening.reject(error);
			});
	}

	epubPackage.then(function(packageXml) {

		if (!packageXml) {
			return;
		}

		// Get package information from epub opf
		book.unpack(packageXml);

		// Resolve promises
		book.loading.manifest.resolve(book.package.manifest);
		book.loading.metadata.resolve(book.package.metadata);
		book.loading.spine.resolve(book.spine);
		book.loading.cover.resolve(book.cover);

		book.isOpen = true;

		// Clear queue of any waiting book request

		// Resolve book opened promise
		book.opening.resolve(book);

	}).catch(function(error) {
		// handle errors in parsing the book
		// console.error(error.message, error.stack);
		book.opening.reject(error);
	});

	return this.opened;
};

Book.prototype.unpack = function(packageXml){
	var book = this,
			parse = new Parser();

	book.package = parse.packageContents(packageXml); // Extract info from contents
	if(!book.package) {
		return;
	}

	book.package.baseUrl = book.baseUrl; // Provides a url base for resolving paths
	book.package.basePath = book.basePath; // Provides a url base for resolving paths

	this.spine.load(book.package);

	book.navigation = new Navigation(book.package, this.request);
	book.navigation.load().then(function(toc){
		book.toc = toc;
		book.loading.navigation.resolve(book.toc);
	});

	// //-- Set Global Layout setting based on metadata
	// MOVE TO RENDER
	// book.globalLayoutProperties = book.parseLayoutProperties(book.package.metadata);
	if (book.baseUrl) {
		book.cover = new URL(book.package.coverPath, book.baseUrl).toString();
	} else {
		book.cover = path.resolve(book.baseUrl, book.package.coverPath);
	}
};

// Alias for book.spine.get
Book.prototype.section = function(target) {
	return this.spine.get(target);
};

// Sugar to render a book
Book.prototype.renderTo = function(element, options) {
	// var renderMethod = (options && options.method) ?
	//     options.method :
	//     "single";

	this.rendition = new Rendition(this, options);
	this.rendition.attachTo(element);

	return this.rendition;
};

Book.prototype.requestMethod = function(_url) {
	// Switch request methods
	if(this.unarchived) {
		return this.unarchived.request(_url);
	} else {
		return request(_url, null, this.requestCredentials, this.requestHeaders);
	}

};

Book.prototype.setRequestCredentials = function(_credentials) {
	this.requestCredentials = _credentials;
};

Book.prototype.setRequestHeaders = function(_headers) {
	this.requestHeaders = _headers;
};

Book.prototype.unarchive = function(bookUrl, isBase64){
	this.unarchived = new Unarchive();
	return this.unarchived.open(bookUrl, isBase64);
};

//-- Checks if url has a .epub or .zip extension, or is ArrayBuffer (of zip/epub)
Book.prototype.isArchivedUrl = function(bookUrl){
	var extension;

	if (bookUrl instanceof ArrayBuffer) {
		return true;
	}

	// Reuse parsed url or create a new uri object
	// if(typeof(bookUrl) === "object") {
	//   uri = bookUrl;
	// } else {
	//   uri = core.uri(bookUrl);
	// }
	// uri = URI(bookUrl);
	extension = core.extension(bookUrl);

	if(extension && (extension == "epub" || extension == "zip")){
		return true;
	}

	return false;
};

//-- Returns the cover
Book.prototype.coverUrl = function(){
	var retrieved = this.loaded.cover.
		then(function(url) {
			if(this.unarchived) {
				return this.unarchived.createUrl(this.cover);
			}else{
				return this.cover;
			}
		}.bind(this));



	return retrieved;
};

Book.prototype.range = function(cfiRange) {
	var cfi = new EpubCFI(cfiRange);
	var item = this.spine.get(cfi.spinePos);

	return item.load().then(function (contents) {
		var range = cfi.toRange(item.document);
		return range;
	})
};

module.exports = Book;

//-- Enable binding events to book
EventEmitter(Book.prototype);


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var DefaultViewManager = __webpack_require__(10);

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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(2);
var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);
var Contents = __webpack_require__(9);

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
/* 19 */
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
/* 20 */
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
/* 21 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var assign        = __webpack_require__(22)
  , normalizeOpts = __webpack_require__(29)
  , isCallable    = __webpack_require__(25)
  , contains      = __webpack_require__(32)

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
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

module.exports = __webpack_require__(23)()
	? Object.assign
	: __webpack_require__(24);


/***/ },
/* 23 */
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
/* 24 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var keys  = __webpack_require__(26)
  , value = __webpack_require__(31)

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
/* 25 */
/***/ function(module, exports) {

"use strict";
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

module.exports = __webpack_require__(27)()
	? Object.keys
	: __webpack_require__(28);


/***/ },
/* 27 */
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
/* 28 */
/***/ function(module, exports) {

"use strict";
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};


/***/ },
/* 29 */
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
/* 30 */
/***/ function(module, exports) {

"use strict";
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};


/***/ },
/* 31 */
/***/ function(module, exports) {

"use strict";
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

module.exports = __webpack_require__(33)()
	? String.prototype.contains
	: __webpack_require__(34);


/***/ },
/* 33 */
/***/ function(module, exports) {

"use strict";
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};


/***/ },
/* 34 */
/***/ function(module, exports) {

"use strict";
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};


/***/ },
/* 35 */,
/* 36 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);

function Layout(settings){
	this.name = settings.layout || "reflowable";
	this._spread = (settings.spread === "none") ? false : true;
	this._minSpreadWidth = settings.spread || 800;
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

// paginated | scrolled
Layout.prototype.flow = function(flow) {
	this._flow = (flow === "paginated") ? "paginated" : "scrolled";
}

// true | false
Layout.prototype.spread = function(spread, min) {

	this._spread = (spread === "none") ? false : true;

	if (min >= 0) {
		this._minSpreadWidth = min;
	}
}

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
		colWidth = Math.floor((width - gap) / divisor);
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
/* 37 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var Queue = __webpack_require__(8);
var EpubCFI = __webpack_require__(1);
var EventEmitter = __webpack_require__(2);

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

// Load all of sections in the book
Locations.prototype.generate = function(chars) {

	if (chars) {
		this.break = chars;
	}

	this.q.pause();

	this.spine.each(function(section) {

		this.q.enqueue(this.process, section);

	}.bind(this));

	return this.q.run().then(function() {
		this.total = this._locations.length-1;

		if (this._currentCfi) {
			this.currentLocation = this._currentCfi;
		}

		return this._locations;
		// console.log(this.precentage(this.book.rendition.location.start), this.precentage(this.book.rendition.location.end));
	}.bind(this));

};

Locations.prototype.process = function(section) {

	return section.load(this.request)
		.then(function(contents) {

			var range;
			var doc = contents.ownerDocument;
			var counter = 0;

			this.sprint(contents, function(node) {
				var len = node.length;
				var dist;
				var pos = 0;

				// Start range
				if (counter == 0) {
					range = doc.createRange();
					range.setStart(node, 0);
				}

				dist = this.break - counter;

				// Node is smaller than a break
				if(dist > len){
					counter += len;
					pos = len;
				}

				while (pos < len) {
					counter = this.break;
					pos += this.break;

					// Gone over
					if(pos >= len){
						// Continue counter for next node
						counter = len - (pos - this.break);

					// At End
					} else {
						// End the previous range
						range.setEnd(node, pos);
						cfi = section.cfiFromRange(range);
						this._locations.push(cfi);
						counter = 0;

						// Start new range
						pos += 1;
						range = doc.createRange();
						range.setStart(node, pos);
					}
				}



			}.bind(this));

			// Close remaining
			if (range) {
				range.setEnd(prev, prev.length);
				cfi = section.cfiFromRange(range);
				this._locations.push(cfi)
				counter = 0;
			}

		}.bind(this));

};

Locations.prototype.sprint = function(root, func) {
	var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);

	while ((node = treeWalker.nextNode())) {
		func(node);
	}

};

Locations.prototype.locationFromCfi = function(cfi){
	// Check if the location has not been set yet
	if(this._locations.length === 0) {
		return -1;
	}

	return core.locationOf(cfi, this._locations, this.epubcfi.compare);
};

Locations.prototype.precentageFromCfi = function(cfi) {
	// Find closest cfi
	var loc = this.locationFromCfi(cfi);
	// Get percentage in total
	return this.precentageFromLocation(loc);
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
		percentage: this.precentageFromLocation(loc)
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

EventEmitter(Locations.prototype);

module.exports = Locations;


/***/ },
/* 38 */
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

/**
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
/* 39 */
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
/* 40 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var Parser = __webpack_require__(12);
var path = __webpack_require__(3);

function Navigation(_package, _request){
	var navigation = this;
	var parse = new Parser();
	var request = _request || __webpack_require__(4);

	this.package = _package;
	this.toc = [];
	this.tocByHref = {};
	this.tocById = {};

	if(_package.navPath) {
		if (_package.baseUrl) {
			this.navUrl = new URL(_package.navPath, _package.baseUrl).toString();
		} else {
			this.navUrl = path.resolve(_package.basePath, _package.navPath);
		}
		this.nav = {};

		this.nav.load = function(_request){
			var loading = new core.defer();
			var loaded = loading.promise;

			request(navigation.navUrl, 'xml').then(function(xml){
				navigation.toc = parse.nav(xml);
				navigation.loaded(navigation.toc);
				loading.resolve(navigation.toc);
			});

			return loaded;
		};

	}

	if(_package.ncxPath) {
		if (_package.baseUrl) {
			this.ncxUrl = new URL(_package.ncxPath, _package.baseUrl).toString();
		} else {
			this.ncxUrl = path.resolve(_package.basePath, _package.ncxPath);
		}

		this.ncx = {};

		this.ncx.load = function(_request){
			var loading = new core.defer();
			var loaded = loading.promise;

			request(navigation.ncxUrl, 'xml').then(function(xml){
				navigation.toc = parse.toc(xml);
				navigation.loaded(navigation.toc);
				loading.resolve(navigation.toc);
			});

			return loaded;
		};

	}
};

// Load the navigation
Navigation.prototype.load = function(_request) {
	var request = _request || __webpack_require__(4);
	var loading, loaded;

	if(this.nav) {
		loading = this.nav.load();
	} else if(this.ncx) {
		loading = this.ncx.load();
	} else {
		loaded = new core.defer();
		loaded.resolve([]);
		loading = loaded.promise;
	}

	return loading;

};

Navigation.prototype.loaded = function(toc) {
	var item;

	for (var i = 0; i < toc.length; i++) {
		item = toc[i];
		this.tocByHref[item.href] = i;
		this.tocById[item.id] = i;
	}

};

// Get an item from the navigation
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

module.exports = Navigation;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);
var Hook = __webpack_require__(6);

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


Section.prototype.load = function(_request){
	var request = _request || this.request || __webpack_require__(4);
	var loading = new core.defer();
	var loaded = loading.promise;

	if(this.contents) {
		loading.resolve(this.contents);
	} else {
		request(this.url)
			.then(function(xml){
				var base;
				var directory = core.directory(this.url);

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

Section.prototype.base = function(_document){
		var task = new core.defer();
		var base = _document.createElement("base"); // TODO: check if exists
		var head;
		console.log(window.location.origin + "/" +this.url);

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

Section.prototype.beforeSectionLoad = function(){
	// Stub for a hook - replace me for now
};

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

Section.prototype.find = function(_query){

};

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* Takes: global layout settings object, chapter properties string
* Returns: Object with layout properties
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

Section.prototype.cfiFromRange = function(_range) {
	return new EpubCFI(_range, this.cfiBase).toString();
};

Section.prototype.cfiFromElement = function(el) {
	return new EpubCFI(el, this.cfiBase).toString();
};

module.exports = Section;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var EpubCFI = __webpack_require__(1);
var Hook = __webpack_require__(6);
var Section = __webpack_require__(41);
var replacements = __webpack_require__(13);

function Spine(_request){
	this.request = _request;
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

Spine.prototype.load = function(_package) {

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
			item.url = this.baseUrl + item.href;

			if(manifestItem.properties.length){
				item.properties.push.apply(item.properties, manifestItem.properties);
			}
		}

		// if(index > 0) {
			item.prev = function(){ return this.get(index-1); }.bind(this);
		// }

		// if(index+1 < this.items.length) {
			item.next = function(){ return this.get(index+1); }.bind(this);
		// }

		spineItem = new Section(item, this.hooks);

		this.append(spineItem);


	}.bind(this));

	this.loaded = true;
};

// book.spine.get();
// book.spine.get(1);
// book.spine.get("chap1.html");
// book.spine.get("#id1234");
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

Spine.prototype.append = function(section) {
	var index = this.spineItems.length;
	section.index = index;

	this.spineItems.push(section);

	this.spineByHref[section.href] = index;
	this.spineById[section.idref] = index;

	return index;
};

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

Spine.prototype.insert = function(section, index) {

};

Spine.prototype.remove = function(section) {
	var index = this.spineItems.indexOf(section);

	if(index > -1) {
		delete this.spineByHref[section.href];
		delete this.spineById[section.idref];

		return this.spineItems.splice(index, 1);
	}
};

Spine.prototype.each = function() {
	return this.spineItems.forEach.apply(this.spineItems, arguments);
};

module.exports = Spine;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var request = __webpack_require__(4);
var mime = __webpack_require__(19);

function Unarchive() {

	this.checkRequirements();
	this.urlCache = {};

}

Unarchive.prototype.checkRequirements = function(callback){
	try {
		if (typeof JSZip !== 'undefined') {
			this.zip = new JSZip();
		} else {
			JSZip = __webpack_require__(44);
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
	var deferred = new core.defer();
	var response;
	var r;

	// If type isn't set, determine it from the file extension
	if(!type) {
		type = core.extension(url);
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

Unarchive.prototype.getBase64 = function(url, _mimeType){
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

Unarchive.prototype.createUrl = function(url, options){
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

Unarchive.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = this.urlCache[url];
	if(fromCache) _URL.revokeObjectURL(fromCache);
};

module.exports = Unarchive;


/***/ },
/* 44 */
/***/ function(module, exports) {

if(typeof __WEBPACK_EXTERNAL_MODULE_44__ === 'undefined') {var e = new Error("Cannot find module \"JSZip\""); e.code = 'MODULE_NOT_FOUND'; throw e;}
module.exports = __WEBPACK_EXTERNAL_MODULE_44__;

/***/ },
/* 45 */,
/* 46 */
/***/ function(module, exports, __webpack_require__) {

var Book = __webpack_require__(16);
var EpubCFI = __webpack_require__(1);
var Rendition = __webpack_require__(11);
var Contents = __webpack_require__(9);

function ePub(_url) {
	return new Book(_url);
};

ePub.VERSION = "0.3.0";

ePub.CFI = EpubCFI;
ePub.Rendition = Rendition;
ePub.Contents = Contents;

ePub.ViewManagers = {};
ePub.Views = {};
ePub.register = {
	manager : function(name, manager){
		return ePub.ViewManagers[name] = manager;
	},
	view : function(name, view){
		return ePub.Views[name] = view;
	}
};

// Default Views
ePub.register.view("iframe", __webpack_require__(18));

// Default View Managers
ePub.register.manager("default", __webpack_require__(10));
ePub.register.manager("continuous", __webpack_require__(17));

module.exports = ePub;


/***/ }
/******/ ])
});
;
//# sourceMappingURL=epub.js.map