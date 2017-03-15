export const requestAnimationFrame = (typeof window != "undefined") ? (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame) : false;

export function isElement(obj) {
	return !!(obj && obj.nodeType == 1);
}

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
export function uuid() {
	var d = new Date().getTime();
	var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=="x" ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;
}

export function documentHeight() {
	return Math.max(
			document.documentElement.clientHeight,
			document.body.scrollHeight,
			document.documentElement.scrollHeight,
			document.body.offsetHeight,
			document.documentElement.offsetHeight
	);
}

export function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

export function isFloat(n) {
	return isNumber(n) && (Math.floor(n) !== n);
}

export function prefixed(unprefixed) {
	//var vendors = ["Webkit", "Moz", "O", "ms" ];
	var vendors = ["-Webkit-", "-moz-", "-o-", "-ms-"];
	var upper = unprefixed[0].toUpperCase() + unprefixed.slice(1);
	var length = vendors.length;

	if (typeof(document) === "undefined" || typeof(document.body.style[unprefixed]) != "undefined") {
		return unprefixed;
	}

	for ( var i=0; i < length; i++ ) {
		if (typeof(document.body.style[vendors[i] + upper]) != "undefined") {
			return vendors[i] + upper;
		}
	}

	return unprefixed;
}

export function defaults(obj) {
	for (var i = 1, length = arguments.length; i < length; i++) {
		var source = arguments[i];
		for (var prop in source) {
			if (obj[prop] === void 0) obj[prop] = source[prop];
		}
	}
	return obj;
}

export function extend(target) {
	var sources = [].slice.call(arguments, 1);
	sources.forEach(function (source) {
		if(!source) return;
		Object.getOwnPropertyNames(source).forEach(function(propName) {
			Object.defineProperty(target, propName, Object.getOwnPropertyDescriptor(source, propName));
		});
	});
	return target;
}

// Fast quicksort insert for sorted array -- based on:
// http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
export function insert(item, array, compareFunction) {
	var location = locationOf(item, array, compareFunction);
	array.splice(location, 0, item);

	return location;
}

// Returns where something would fit in
export function locationOf(item, array, compareFunction, _start, _end) {
	var start = _start || 0;
	var end = _end || array.length;
	var pivot = parseInt(start + (end - start) / 2);
	var compared;
	if(!compareFunction){
		compareFunction = function(a, b) {
			if(a > b) return 1;
			if(a < b) return -1;
			if(a == b) return 0;
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
}

// Returns -1 of mpt found
export function indexOfSorted(item, array, compareFunction, _start, _end) {
	var start = _start || 0;
	var end = _end || array.length;
	var pivot = parseInt(start + (end - start) / 2);
	var compared;
	if(!compareFunction){
		compareFunction = function(a, b) {
			if(a > b) return 1;
			if(a < b) return -1;
			if(a == b) return 0;
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
}

export function bounds(el) {

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

}

export function borders(el) {

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

}

export function windowBounds() {

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

}

//-- https://stackoverflow.com/questions/13482352/xquery-looking-for-text-with-single-quote/13483496#13483496
export function cleanStringForXpath(str)	{
	var parts = str.match(/[^'"]+|['"]/g);
	parts = parts.map(function(part){
		if (part === "'")	{
			return "\"\'\""; // output "'"
		}

		if (part === "\"") {
			return "\'\"\'"; // output '"'
		}
		return `\'${part}\'`;
	});
	return `concat(\'\',${ parts.join(",") })`;
}

export function indexOfTextNode(textNode){
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
}

export function isXml(ext) {
	return ["xml", "opf", "ncx"].indexOf(ext) > -1;
}

export function createBlob(content, mime){
	return new Blob([content], {type : mime });
}

export function createBlobUrl(content, mime){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var tempUrl;
	var blob = this.createBlob(content, mime);

	tempUrl = _URL.createObjectURL(blob);

	return tempUrl;
}

export function createBase64Url(content, mime){
	var data;
	var datauri;

	if (typeof(content) !== "string") {
		// Only handles strings
		return;
	}

	data = btoa(content);

	datauri = "data:" + mime + ";base64," + data;

	return datauri;
}

export function type(obj){
	return Object.prototype.toString.call(obj).slice(8, -1);
}

export function parse(markup, mime, forceXMLDom) {
	var doc;
	var Parser;

	if (typeof DOMParser === "undefined" || forceXMLDom) {
		Parser = require("xmldom").DOMParser;
	} else {
		Parser = DOMParser;
	}


	doc = new Parser().parseFromString(markup, mime);

	return doc;
}

export function qs(el, sel) {
	var elements;
	if (!el) {
		throw new Error("No Element Provided");
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

export function qsa(el, sel) {

	if (typeof el.querySelector != "undefined") {
		return el.querySelectorAll(sel);
	} else {
		return el.getElementsByTagName(sel);
	}
}

export function qsp(el, sel, props) {
	var q, filtered;
	if (typeof el.querySelector != "undefined") {
		sel += "[";
		for (var prop in props) {
			sel += prop + "='" + props[prop] + "'";
		}
		sel += "]";
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
export function sprint(root, func) {
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

export function treeWalker(root, func, filter) {
	var treeWalker = document.createTreeWalker(root, filter, null, false);
	let node;
	while ((node = treeWalker.nextNode())) {
		func(node);
	}
}

// export function walk(root, func, onlyText) {
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
export function walk(node,callback){
	if(callback(node)){
		return true;
	}
	node = node.firstChild;
	if(node){
		do{
			let walked = walk(node,callback);
			if(walked){
				return true;
			}
			node = node.nextSibling;
		} while(node);
	}
}

export function blob2base64(blob) {
	return new Promise(function(resolve, reject) {
		var reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onloadend = function() {
			resolve(reader.result);
		};
	});
}

// From: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred#backwards_forwards_compatible
export function defer() {
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
	this.promise = new Promise((resolve, reject) => {
		this.resolve = resolve;
		this.reject = reject;
	});
	Object.freeze(this);
}

export function querySelectorByType(html, element, type){
	var query;
	if (typeof html.querySelector != "undefined") {
		query = html.querySelector(`${element}[*|type="${type}"]`);
	}
	// Handle IE not supporting namespaced epub:type in querySelector
	if(!query || query.length === 0) {
		query = qsa(html, element);
		for (var i = 0; i < query.length; i++) {
			if(query[i].getAttributeNS("http://www.idpf.org/2007/ops", "type") === type) {
				return query[i];
			}
		}
	} else {
		return query;
	}
}

export function findChildren(el) {
	var result = [];
	var childNodes = el.childNodes;
	for (var i = 0; i < childNodes.length; i++) {
		let node = childNodes[i];
		if (node.nodeType === 1) {
			result.push(node);
		}
	}
	return result;
}
