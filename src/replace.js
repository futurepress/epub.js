var EPUBJS = EPUBJS || {};
EPUBJS.replace = {};

//-- Replaces the relative links within the book to use our internal page changer
EPUBJS.replace.hrefs = function(callback, renderer){
	var book = this;
	var replacments = function(link, done){
		var href = link.getAttribute("href"),
				isRelative = href.search("://"),
				directory,
				relative,
				location,
				base,
				uri,
				url;

		if(isRelative != -1){

			link.setAttribute("target", "_blank");

		}else{
			// Links may need to be resolved, such as ../chp1.xhtml
			base = renderer.render.docEl.querySelector('base');
			url = base.getAttribute("href");
			uri = EPUBJS.core.uri(url);
			directory = uri.directory;

			if(directory) {
				// We must ensure that the file:// protocol is preserved for
				// local file links, as in certain contexts (such as under
				// Titanium), file links without the file:// protocol will not
				// work
				if (uri.protocol === "file") {
					relative = EPUBJS.core.resolveUrl(uri.base, href);
				} else {
					relative = EPUBJS.core.resolveUrl(directory, href);
				}
			} else {
				relative = href;
			}

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

	renderer.replaceWithStored("svg image", "xlink:href", function(_store, full, done){
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
			done(url, full);
		},  function(reason) {
			// we were unable to replace the style sheets
			done(null);
		});
	}else{
		_store.getUrl(full).then(done, function(reason) {
			// we were unable to get the url, signal to upper layer
			done(null);
		});
	}
};

EPUBJS.replace.stylesheets = function(_store, full) {
	var deferred = new RSVP.defer();

	if(!_store) return;

	_store.getText(full).then(function(text){
		var url;

		 EPUBJS.replace.cssImports(_store, full, text).then(function (importText) {

          text = importText + text;

			EPUBJS.replace.cssUrls(_store, full, text).then(function(newText){
				var _URL = window.URL || window.webkitURL || window.mozURL;

				var blob = new Blob([newText], { "type" : "text\/css" }),
						url = _URL.createObjectURL(blob);

				deferred.resolve(url);

			}, function(reason) {
				deferred.reject(reason);
			});

		},function(reason) {
			deferred.reject(reason);
		});

	}, function(reason) {
		deferred.reject(reason);
	});

	return deferred.promise;
};

EPUBJS.replace.cssImports = function (_store, base, text) {
  var deferred = new RSVP.defer();
  if(!_store) return;

  // check for css @import
  var importRegex = /@import\s+(?:url\()?\'?\"?((?!data:)[^\'|^\"^\)]*)\'?\"?\)?/gi;
  var importMatches, importFiles = [], allImportText =  '';

  while (importMatches = importRegex.exec(text)) {
      importFiles.push(importMatches[1]);
  }

  if (importFiles.length === 0) {
    deferred.resolve(allImportText);
  }

  importFiles.forEach(function (fileUrl) {
      var full = EPUBJS.core.resolveUrl(base, fileUrl);
      full = EPUBJS.core.uri(full).path;
      _store.getText(full).then(function(importText){
        allImportText += importText;
        if (importFiles.indexOf(fileUrl) === importFiles.length - 1) {
          deferred.resolve(allImportText);
        }
      }, function(reason) {
        deferred.reject(reason);
      });
  });

  return deferred.promise;

};


EPUBJS.replace.cssUrls = function(_store, base, text){
	var deferred = new RSVP.defer(),
		promises = [],
		matches = text.match(/url\(\'?\"?((?!data:)[^\'|^\"^\)]*)\'?\"?\)/g);

	if(!_store) return;

	if(!matches){
		deferred.resolve(text);
		return deferred.promise;
	}

	matches.forEach(function(str){
		var full = EPUBJS.core.resolveUrl(base, str.replace(/url\(|[|\)|\'|\"]|\?.*$/g, ''));
		var replaced = _store.getUrl(full).then(function(url){
			text = text.replace(str, 'url("'+url+'")');
		}, function(reason) {
			deferred.reject(reason);
		});

		promises.push(replaced);
	});

	RSVP.all(promises).then(function(){
		deferred.resolve(text);
	});

	return deferred.promise;
};
