EPUBJS.Chapter = function(spineObject, store, credentials){
	this.href = spineObject.href;
	this.absolute = spineObject.url;
	this.id = spineObject.id;
	this.spinePos = spineObject.index;
	this.cfiBase = spineObject.cfiBase;
	this.properties = spineObject.properties;
	this.manifestProperties = spineObject.manifestProperties;
	this.linear = spineObject.linear;
	this.pages = 1;
	this.store = store;
	this.credentials = credentials;
	this.epubcfi = new EPUBJS.EpubCFI();
	this.deferred = new RSVP.defer();
	this.loaded = this.deferred.promise;

	EPUBJS.Hooks.mixin(this);
	//-- Get pre-registered hooks for events
	this.getHooks("beforeChapterRender");

	// Cached for replacement urls from storage
	this.caches = {};
};


EPUBJS.Chapter.prototype.load = function(_store, _credentials){
	var store = _store || this.store;
	var credentials = _credentials || this.credentials;
	var promise;
	// if(this.store && (!this.book.online || this.book.contained))
	if(store){
		promise = store.getXml(this.absolute);
	}else{
		promise = EPUBJS.core.request(this.absolute, false, credentials);
	}

	promise.then(function(xml){
        try {
            this.setDocument(xml);
            this.deferred.resolve(this);
        } catch (error) {
            this.deferred.reject({
                message : this.absolute + " -> " + error.message,
                stack : new Error().stack
            });
        }
	}.bind(this));

	return promise;
};

EPUBJS.Chapter.prototype.render = function(_store){

	return this.load().then(function(doc){

		var head = doc.querySelector('head');
		var base = doc.createElement("base");

		base.setAttribute("href", this.absolute);
		head.insertBefore(base, head.firstChild);

		this.contents = doc;

		return new RSVP.Promise(function (resolve, reject) {
			this.triggerHooks("beforeChapterRender", function () {
				resolve(doc);
			}.bind(this), this);
		}.bind(this));

	}.bind(this))
	.then(function(doc) {
		var serializer = new XMLSerializer();
		var contents = serializer.serializeToString(doc);
		return contents;
	}.bind(this));
};

EPUBJS.Chapter.prototype.url = function(_store){
	var deferred = new RSVP.defer();
	var store = _store || this.store;
	var loaded;
	var chapter = this;
	var url;

	if(store){
		if(!this.tempUrl) {
			store.getUrl(this.absolute).then(function(url){
				chapter.tempUrl = url;
				deferred.resolve(url);
			});
		} else {
			url = this.tempUrl;
			deferred.resolve(url);
		}
	}else{
		url = this.absolute;
		deferred.resolve(url);
	}

	return deferred.promise;
};

EPUBJS.Chapter.prototype.setPages = function(num){
	this.pages = num;
};

EPUBJS.Chapter.prototype.getPages = function(num){
	return this.pages;
};

EPUBJS.Chapter.prototype.getID = function(){
	return this.ID;
};

EPUBJS.Chapter.prototype.unload = function(store){
	this.document = null;
	if(this.tempUrl && store) {
		store.revokeUrl(this.tempUrl);
		this.tempUrl = false;
	}
};

EPUBJS.Chapter.prototype.setDocument = function(_document){
	// var uri = _document.namespaceURI;
	// var doctype = _document.doctype;
	//
	// // Creates an empty document
	// this.document = _document.implementation.createDocument(
	// 		uri,
	// 		null,
	// 		null
	// );
	// this.contents = this.document.importNode(
	// 		_document.documentElement, //node to import
	// 		true                         //clone its descendants
	// );
	//
	// this.document.appendChild(this.contents);
	this.document = _document;
	this.contents = _document.documentElement;

	// Fix to apply wgxpath to new document in IE
	if(!this.document.evaluate && document.evaluate) {
		this.document.evaluate = document.evaluate;
	}

	// this.deferred.resolve(this.contents);
};

EPUBJS.Chapter.prototype.cfiFromRange = function(_range) {
	var range;
	var startXpath, endXpath;
	var startContainer, endContainer;
	var cleanTextContent, cleanStartTextContent, cleanEndTextContent;

	// Check for Contents
	if(!this.document) return;

	if(typeof document.evaluate != 'undefined') {

		startXpath = EPUBJS.core.getElementXPath(_range.startContainer);
		// console.log(startContainer)
		endXpath = EPUBJS.core.getElementXPath(_range.endContainer);

		startContainer = this.document.evaluate(startXpath, this.document, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		if(!_range.collapsed) {
			endContainer = this.document.evaluate(endXpath, this.document, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		}

		range = this.document.createRange();
		// Find Exact Range in original document
		if(startContainer) {
			try {
				range.setStart(startContainer, _range.startOffset);
				if(!_range.collapsed && endContainer) {
					range.setEnd(endContainer, _range.endOffset);
				}
			} catch (e) {
				console.log("missed");
				startContainer = false;
			}

		}

		// Fuzzy Match
		if(!startContainer) {
			console.log("not found, try fuzzy match");
			cleanStartTextContent = EPUBJS.core.cleanStringForXpath(_range.startContainer.textContent);
			startXpath = "//text()[contains(.," + cleanStartTextContent + ")]";

			startContainer = this.document.evaluate(startXpath, this.document, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

			if(startContainer){
				// console.log("Found with Fuzzy");
				range.setStart(startContainer, _range.startOffset);

				if(!_range.collapsed) {
					cleanEndTextContent = EPUBJS.core.cleanStringForXpath(_range.endContainer.textContent);
					endXpath = "//text()[contains(.," + cleanEndTextContent + ")]";
					endContainer = this.document.evaluate(endXpath, this.document, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
					if(endContainer) {
						range.setEnd(endContainer, _range.endOffset);
					}
				}

			}
		}
	} else {
		range = _range; // Just evaluate the current documents range
	}

	// Generate the Cfi
	return this.epubcfi.generateCfiFromRange(range, this.cfiBase);
};

EPUBJS.Chapter.prototype.find = function(_query){
	var chapter = this;
	var matches = [];
	var query = _query.toLowerCase();
	//var xpath = this.document.evaluate(".//text()[contains(translate(., '"+query.toUpperCase()+"', '"+query+"'),'"+query+"')]", this.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	var find = function(node){
		// Search String
		var text = node.textContent.toLowerCase();
		var range = chapter.document.createRange();
		var cfi;
		var pos;
		var last = -1;
		var excerpt;
		var limit = 150;

		while (pos != -1) {
			pos = text.indexOf(query, last + 1);

			if(pos != -1) {
				// If Found, Create Range
				range = chapter.document.createRange();
				range.setStart(node, pos);
				range.setEnd(node, pos + query.length);

				//Generate CFI
				cfi = chapter.cfiFromRange(range);

				// Generate Excerpt
				if(node.textContent.length < limit) {
					excerpt = node.textContent;
				} else {
					excerpt = node.textContent.substring(pos-limit/2,pos+limit/2);
					excerpt = "..." + excerpt + "...";
				}

				//Add CFI to list
				matches.push({
					cfi: cfi,
					excerpt: excerpt
				});
			}

			last = pos;
		}

	};

	// Grab text nodes

	/*
	for ( var i=0 ; i < xpath.snapshotLength; i++ ) {
		find(xpath.snapshotItem(i));
	}
	*/

	this.textSprint(this.document, function(node){
		find(node);
	});


	// Return List of CFIs
	return matches;
};


EPUBJS.Chapter.prototype.textSprint = function(root, func) {
	var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode: function (node) {
					if (node.data && ! /^\s*$/.test(node.data) ) {
						return NodeFilter.FILTER_ACCEPT;
					} else {
						return NodeFilter.FILTER_REJECT;
					}
			}
	}, false);
	var node;
	while ((node = treeWalker.nextNode())) {
		func(node);
	}

};

EPUBJS.Chapter.prototype.replace = function(query, func, finished, progress){
	var items = this.contents.querySelectorAll(query),
		resources = Array.prototype.slice.call(items),
		count = resources.length;


	if(count === 0) {
		finished(false);
		return;
	}
	resources.forEach(function(item){
		var called = false;
		var after = function(result, full){
			if(called === false) {
				count--;
				if(progress) progress(result, full, count);
				if(count <= 0 && finished) finished(true);
				called = true;
			}
		};

		func(item, after);

	}.bind(this));

};

EPUBJS.Chapter.prototype.replaceWithStored = function(query, attr, func, callback) {
	var _oldUrls,
			_newUrls = {},
			_store = this.store,
			_cache = this.caches[query],
			_uri = EPUBJS.core.uri(this.absolute),
			_chapterBase = _uri.base,
			_attr = attr,
			_wait = 5,
			progress = function(url, full, count) {
				_newUrls[full] = url;
			},
			finished = function(notempty) {
				if(callback) callback();
				EPUBJS.core.values(_oldUrls).forEach(function(url){
					_store.revokeUrl(url);
				});

				_cache = _newUrls;
			};

	if(!_store) return;

	if(!_cache) _cache = {};
	_oldUrls = EPUBJS.core.clone(_cache);

	this.replace(query, function(link, done){
		var src = link.getAttribute(_attr),
				full = EPUBJS.core.resolveUrl(_chapterBase, src);

		var replaceUrl = function(url) {
				var timeout;
				link.onload = function(){
					clearTimeout(timeout);
					done(url, full);
				};

				/*
				link.onerror = function(e){
					clearTimeout(timeout);
					done(url, full);
					console.error(e);
				};
				*/

				if(query == "svg image") {
					//-- SVG needs this to trigger a load event
					link.setAttribute("externalResourcesRequired", "true");
				}

				if(query == "link[href]" && link.getAttribute("rel") !== "stylesheet") {
					//-- Only Stylesheet links seem to have a load events, just continue others
					done(url, full);
				} else {
					timeout = setTimeout(function(){
						done(url, full);
					}, _wait);
				}

				if (url) {
					link.setAttribute(_attr, url);
				}

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
