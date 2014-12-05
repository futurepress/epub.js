EPUBJS.Chapter = function(spineObject, store){
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
	this.epubcfi = new EPUBJS.EpubCFI();
	this.deferred = new RSVP.defer();
	this.loaded = this.deferred.promise;
};


EPUBJS.Chapter.prototype.load = function(_store){
	var store = _store || this.store;
	var promise;
	// if(this.store && (!this.book.online || this.book.contained))
	if(store){
		promise = store.get(this.href);
	}else{
		promise = EPUBJS.core.request(this.absolute, 'xml');
	}
	
	promise.then(function(xml){
		this.setDocument(xml);
		this.deferred.resolve(this);
	}.bind(this));
	
	return promise;
};

EPUBJS.Chapter.prototype.render = function(_store){
	
	return this.load().then(function(doc){
		
		var serializer = new XMLSerializer();
		var contents;
		var head = doc.head;
		var base = doc.createElement("base");
		
		base.setAttribute("href", window.location.origin + this.absolute);
		head.insertBefore(base, head.firstChild);
		contents = serializer.serializeToString(doc);
		
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
	/*
	loaded = EPUBJS.core.request(url, 'xml', false);
	loaded.then(function(contents){
		chapter.contents = contents;
		deferred.resolve(chapter.absolute);
	}, function(error){
		deferred.reject(error);
	});
	*/
	
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
	var uri = _document.namespaceURI;
	var doctype = _document.doctype;

	// Creates an empty document
	this.document = _document.implementation.createDocument(
			uri,
			null,
			null
	);
	this.contents = this.document.importNode(
			_document.documentElement, //node to import
			true                         //clone its descendants
	);

	this.document.appendChild(this.contents);

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
	var cleanTextContent, cleanEndTextContent;
	
	// Check for Contents
	if(!this.document) return;
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