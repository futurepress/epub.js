var RSVP = require('rsvp');

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

function createBlobUrl(content, mime){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var tempUrl;
	var blob = new Blob([content], {type : mime });

  tempUrl = _URL.createObjectURL(blob);

  return tempUrl;
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

module.exports = {
  // 'uri': uri,
  // 'folder': folder,
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
  'createBlobUrl': createBlobUrl,
  'type': type,
  'parse' : parse,
  'qs' : qs,
  'qsa' : qsa,
  'qsp' : qsp
};
