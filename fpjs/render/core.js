var FP = FP || {}; 
FP.core = {}

//-- Get a element for an id
FP.core.getEl = function(elem) {
  return document.getElementById(elem);
}

//-- Get all elements for a class
FP.core.getEls = function(classes) {
  return document.getElementsByClassName(classes);
}

FP.core.loadXML = function(url, callback){
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

// FP.core.loadFile = function(url){
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

FP.core.loadFile = function(url, callback){
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

FP.core.crossBrowserColumnCss = function(){
	//-- From Readium: reflowable_pagination_view.js

	var cssIfy = function(str) {
		return str.replace(/([A-Z])/g, function(str,m1){ 
			return '-' + m1.toLowerCase(); 
		}).replace(/^ms-/,'-ms-');
	};

	// ask modernizr for the vendor prefixed version
	FP.core.columnAxis =  Modernizr.prefixed('columnAxis') || 'columnAxis';
	FP.core.columnGap =  Modernizr.prefixed('columnGap') || 'columnGap';
	FP.core.columnWidth =  Modernizr.prefixed('columnWidth') || 'columnWidth';

	// we are interested in the css prefixed version
	// FP.core.columnAxis =  cssIfy(FP.core.columnAxis);
	// FP.core.columnGap =  cssIfy(FP.core.columnGap);
	// FP.core.columnWidth =  cssIfy(FP.core.columnWidth);

}

FP.core.toArray = function(obj) {
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
FP.core.dataURLToBlob = function(dataURL) {
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
FP.core.loadScript = function(src, callback) {
   var s, r;
   r = false;
   s = document.createElement('script');
   s.type = 'text/javascript';
   s.async = true;
   s.src = src;
   s.onload = s.onreadystatechange = function() {
 	//console.log( this.readyState ); //uncomment this line to see which ready states are called.
 	if ( !r && (!this.readyState || this.readyState == 'complete') )
 	{
 	  r = true;
 	  callback();
 	}
   };
   document.body.appendChild(s);
 }
