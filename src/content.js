EPUBJS.Renderer.prototype.replace = function(query, func, finished, progress){
	var items = this.doc.querySelectorAll(query),
		resources = Array.prototype.slice.call(items),
		count = resources.length,
		after = function(result, full){
			count--;
			if(progress) progress(result, full, count);
			if(count <= 0 && finished) finished(true);
		};

	if(count === 0) {
		finished(false);
		return;
	}

	resources.forEach(function(item){

		func(item, after);

	}.bind(this));

};

EPUBJS.Renderer.prototype.replaceWithStored = function(query, attr, func, callback) {
	var _oldUrls,
			_newUrls = {},
			_store = this.determineStore(),
			_cache = this.caches[query],
			_uri = EPUBJS.core.uri(this.book.chapter.absolute),
			_chapterBase = _uri.base,
			_attr = attr,
			_wait = 2000,
			progress = function(url, full, count) {
				_newUrls[full] = url;
			},
			finished = function(notempty) {
				if(callback) callback();

				_.each(_oldUrls, function(url){
					_store.revokeUrl(url);
				});

				_cache = _newUrls;
			};

	if(!_store) return;

	if(!_cache) _cache = {};
	_oldUrls = _.clone(_cache);

	this.replace(query, function(link, done){
		var src = link.getAttribute(_attr),
				full = EPUBJS.core.resolveUrl(_chapterBase, src);

		var replaceUrl = function(url) {
				var timeout;

				link.onload = function(){
					clearTimeout(timeout);
					done(url, full);
				};

				link.onerror = function(e){
					clearTimeout(timeout);
					done(url, full);
					console.error(e);
				};

				if(query == "image") {
					//-- SVG needs this to trigger a load event
					link.setAttribute("externalResourcesRequired", "true");
				}

				if(query == "link[href]") {
					//-- Only Stylesheet links seem to have a load events, just continue others
					done(url, full);
				}

				link.setAttribute(_attr, url);

				//-- If elements never fire Load Event, should continue anyways
				timeout = setTimeout(function(){
					done(url, full);
				}, _wait);

			};

		if(full in _oldUrls){
			replaceUrl(_oldUrls[full]);
			_newUrls[full] = _oldUrls[full];
			delete _oldUrls[full];
		}else{
			func(_store, full, replaceUrl, link);
		}

	}, finished, progress);
};

//-- Replaces the relative links within the book to use our internal page changer
EPUBJS.Renderer.prototype.replaceLinks = function(callback){

	var renderer = this;

	this.replace("a[href]", function(link, done){

		var href = link.getAttribute("href"),
			relative = href.search("://"),
			fragment = href[0] == "#";

		if(relative != -1){

			link.setAttribute("target", "_blank");

		}else{

			link.onclick = function(){
				renderer.book.goto(href);
				return false;
			};
		}

		done();

	}, callback);

};

