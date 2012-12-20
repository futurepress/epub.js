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

FP.core.loadText = function(url, callback){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	//xhr.responseType = 'blob';

	xhr.onload = function(e) {
		if (this.status == 200) {
			// Note: .response instead of .responseText
			//var blob = new Blob([this.response], {type: 'application/xhtml+xml'});
			//callback(blob);

			callback(this.response);

		}
	};

	xhr.send();
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
	FP.core.columnAxis =  cssIfy(FP.core.columnAxis);
	FP.core.columnGap =  cssIfy(FP.core.columnGap);
	FP.core.columnWidth =  cssIfy(FP.core.columnWidth);
}

FP.core.crossBrowserColumnCss();
