var EPUBJS = EPUBJS || {};
EPUBJS.replace = {};

//-- Replaces the relative links within the book to use our internal page changer
EPUBJS.replace.hrefs = function(callback, renderer){
	var book = this;
	var replacments = function(link, done){
		var href = link.getAttribute("href"),
				isRelative = href.search("://"),
				directory,
				relative;

		if(isRelative != -1){

			link.setAttribute("target", "_blank");

		}else{
			
			directory = EPUBJS.core.uri(renderer.render.window.location.href).directory;
			relative = EPUBJS.core.resolveUrl(directory, href);
			
			link.onclick = function(){
				book.goto(relative);
				return false;
			};

		}
		done();

	};
	
	renderer.replace("a[href]", replacments, callback);

};

EPUBJS.replace.head = function(callback, renderer) {

	renderer.replaceWithStored("link[href]", "href", EPUBJS.replace.links, callback);

};


//-- Replaces assets src's to point to stored version if browser is offline
EPUBJS.replace.resources = function(callback, renderer){
	//srcs = this.doc.querySelectorAll('[src]');
	renderer.replaceWithStored("[src]", "src", EPUBJS.replace.srcs, callback);

};

EPUBJS.replace.svg = function(callback, renderer) {
	
	renderer.replaceWithStored("image", "xlink:href", function(_store, full, done){
		_store.getUrl(full).then(done);
	}, callback);

};

EPUBJS.replace.srcs = function(_store, full, done){

	_store.getUrl(full).then(done);
	
};

//-- Replaces links in head, such as stylesheets - link[href]
EPUBJS.replace.links = function(_store, full, done, link){
	//-- Handle replacing urls in CSS
	if(link.getAttribute("rel") === "stylesheet") {
		EPUBJS.replace.stylesheets(_store, full).then(function(url, full){
			// done
			setTimeout(function(){
				done(url, full);
			}, 5); //-- Allow for css to apply before displaying chapter
		});
	}else{
		_store.getUrl(full).then(done);
	}
};

EPUBJS.replace.stylesheets = function(_store, full) {
	var deferred = new RSVP.defer();

	if(!_store) return;

	_store.getText(full).then(function(text){
		var url;

		EPUBJS.replace.cssUrls(_store, full, text).then(function(newText){
			var _URL = window.URL || window.webkitURL || window.mozURL;

			var blob = new Blob([newText], { "type" : "text\/css" }),
					url = _URL.createObjectURL(blob);

			deferred.resolve(url);

		}, function(e) {
			console.error(e);
		});
		
	});

	return deferred.promise;
};

EPUBJS.replace.cssUrls = function(_store, base, text){
	var deferred = new RSVP.defer(),
		promises = [],
		matches = text.match(/url\(\'?\"?([^\'|^\"^\)]*)\'?\"?\)/g);
	
	if(!_store) return;

	if(!matches){
		deferred.resolve(text);
		return deferred.promise;
	}

	matches.forEach(function(str){
		var full = EPUBJS.core.resolveUrl(base, str.replace(/url\(|[|\)|\'|\"]/g, ''));
		var replaced = _store.getUrl(full).then(function(url){
				text = text.replace(str, 'url("'+url+'")');
			});
		
		promises.push(replaced);
	});
	
	RSVP.all(promises).then(function(){
		deferred.resolve(text);
	});
	
	return deferred.promise;
};