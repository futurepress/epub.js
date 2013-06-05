var EPUBJS = EPUBJS || {}; 
EPUBJS.core = {}

//-- Get a element for an id
EPUBJS.core.getEl = function(elem) {
  return document.getElementById(elem);
}

//-- Get all elements for a class
EPUBJS.core.getEls = function(classes) {
  return document.getElementsByClassName(classes);
}


EPUBJS.core.loadXML = function(url, callback){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/xml');

	xhr.onload = function(e) {
		if (this.status == 200) {
			callback(this.responseXML);
		}
	};

	xhr.send();
}

// EPUBJS.core.loadFile = function(url){
// 	var xhr = new XMLHttpRequest(),
// 		succeeded,
// 		failed;
// 
// 	function _loaded(response){
// 		console.log("response")
// 	}
// 	
// 	function _error(err){
// 		console.log("Error:", err);
// 	}
// 	
// 	function start(){
// 		//xhr.open('GET', url, true);
// 		//xhr.responseType = 'blob';
// 		
// 		xhr.onload = function(e) {
// 			if (this.status == 200) {
// 				succeeded(this.response);
// 			}
// 		};
// 		
// 		xhr.onerror = function(e) {
// 			_error(this.status); //-- TODO: better error message
// 		};
// 		
// 		//xhr.send();
// 		console.log(succeeded)
// 	}
// 	
// 	return {
// 		"start": start,
// 		"loaded" : succeeded,
// 		"error" : failed
// 	}
// }

EPUBJS.core.loadFile = function(url, callback){
	var xhr = new XMLHttpRequest();
	
	this.succeeded = function(response){
		if(callback){
			callback(response);
		}
	}

	this.failed = function(err){
		console.log("Error:", err);
	}

	this.start = function(){
		var that = this;
		
		xhr.open('GET', url, true);
		xhr.responseType = 'blob';

		xhr.onload = function(e) {
			if (this.status == 200) {
				that.succeeded(this.response);
			}
		};

		xhr.onerror = function(e) {
			that.failed(this.status); //-- TODO: better error message
		};

		xhr.send();
	}

	return {
		"start": this.start,
		"succeeded" : this.succeeded,
		"failed" : this.failed
	}
}

EPUBJS.core.crossBrowserColumnCss = function(){
	//-- From Readium: reflowable_pagination_view.js

	var cssIfy = function(str) {
		return str.replace(/([A-Z])/g, function(str,m1){ 
			return '-' + m1.toLowerCase(); 
		}).replace(/^ms-/,'-ms-');
	};

	// ask modernizr for the vendor prefixed version
	EPUBJS.core.columnAxis =  Modernizr.prefixed('columnAxis') || 'columnAxis';
	EPUBJS.core.columnGap =  Modernizr.prefixed('columnGap') || 'columnGap';
	EPUBJS.core.columnWidth =  Modernizr.prefixed('columnWidth') || 'columnWidth';

	// we are interested in the css prefixed version
	// EPUBJS.core.columnAxis =  cssIfy(EPUBJS.core.columnAxis);
	// EPUBJS.core.columnGap =  cssIfy(EPUBJS.core.columnGap);
	// EPUBJS.core.columnWidth =  cssIfy(EPUBJS.core.columnWidth);

}

EPUBJS.core.toArray = function(obj) {
  var arr = [];

  for (member in obj) {
	var newitm;
	if ( obj.hasOwnProperty(member) ) {
	  newitm = obj[member];
	  newitm.ident = member;
	  arr.push(newitm);
	}
  }

  return arr;
};

//-- https://github.com/ebidel/filer.js/blob/master/src/filer.js#L128
EPUBJS.core.dataURLToBlob = function(dataURL) {
	var BASE64_MARKER = ';base64,';
	if (dataURL.indexOf(BASE64_MARKER) == -1) {
	  var parts = dataURL.split(',');
	  var contentType = parts[0].split(':')[1];
	  var raw = parts[1];

	  return new Blob([raw], {type: contentType});
	}

	var parts = dataURL.split(BASE64_MARKER);
	var contentType = parts[0].split(':')[1];
	var raw = window.atob(parts[1]);
	var rawLength = raw.length;

	var uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
	  uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], {type: contentType});
 }
 
//-- Load scripts async: http://stackoverflow.com/questions/7718935/load-scripts-asynchronously 
EPUBJS.core.addScript = function(src, callback, target) {
   var s, r;
   r = false;
   s = document.createElement('script');
   s.type = 'text/javascript';
   s.async = false;
   s.src = src;
   s.onload = s.onreadystatechange = function() {
 	//console.log( this.readyState ); //uncomment this line to see which ready states are called.
 	if ( !r && (!this.readyState || this.readyState == 'complete') )
 	{
 	  r = true;
 	  if(callback) callback();
 	}
   },
   target = target || document.body;
   target.appendChild(s);
 }
 
 EPUBJS.core.addScripts = function(srcArr, callback, target) {
	var total = srcArr.length,
		curr = 0,
		cb = function(){
			curr++;
			if(total == curr){
				if(callback) callback();
			}else{
				EPUBJS.core.loadScript(srcArr[curr], cb, target);
			}
		};
		
    // srcArr.forEach(function(src){
    // EPUBJS.core.loadScript(src, cb, target);
    // });
    EPUBJS.core.addScript(srcArr[curr], cb, target);
    
 }
 
 EPUBJS.core.addCss = function(src, callback, target) {
    var s, r;
    r = false;
    s = document.createElement('link');
    s.type = 'text/css';
    s.rel = "stylesheet";
    s.href = src;
    s.onload = s.onreadystatechange = function() {
  	if ( !r && (!this.readyState || this.readyState == 'complete') )
  	{
  	  r = true;
  	  if(callback) callback();
  	}
    },
    target = target || document.body;
    target.appendChild(s);
  }
