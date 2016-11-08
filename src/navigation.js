var core = require('./core');
var path = require('path');

function Navigation(xml){
	this.toc = [];
	this.tocByHref = {};
	this.tocById = {};

	if (xml) {
		this.parse(xml);
	}
};

Navigation.prototype.parse = function(xml) {
	var html = core.qs(xml, "html");
	var ncx = core.qs(xml, "ncx");

	if(html) {
		this.toc = this.parseNav(xml);
	} else if(ncx){
		this.toc = this.parseNcx(xml);
	}

	this.unpack(this.toc);
};

Navigation.prototype.unpack = function(toc) {
	var item;

	for (var i = 0; i < toc.length; i++) {
		item = toc[i];
		this.tocByHref[item.href] = i;
		this.tocById[item.id] = i;
	}

};

// Get an item from the navigation
Navigation.prototype.get = function(target) {
	var index;

	if(!target) {
		return this.toc;
	}

	if(target.indexOf("#") === 0) {
		index = this.tocById[target.substring(1)];
	} else if(target in this.tocByHref){
		index = this.tocByHref[target];
	}

	return this.toc[index];
};

Navigation.prototype.parseNav = function(navHtml, spineIndexByURL, bookSpine){
	var navElement = core.querySelectorByType(navHtml, "nav", "toc");
	// var navItems = navElement ? navElement.querySelectorAll("ol li") : [];
	var navItems = navElement ? core.qsa(navElement, "li") : [];
	var length = navItems.length;
	var i;
	var toc = {};
	var list = [];
	var item, parent;

	if(!navItems || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.navItem(navItems[i], spineIndexByURL, bookSpine);
		toc[item.id] = item;
		if(!item.parent) {
			list.push(item);
		} else {
			parent = toc[item.parent];
			parent.subitems.push(item);
		}
	}

	return list;
};

Navigation.prototype.navItem = function(item, spineIndexByURL, bookSpine){
	var id = item.getAttribute('id') || false,
			// content = item.querySelector("a, span"),
			content = core.qs(item, "a"),
			src = content.getAttribute('href') || '',
			text = content.textContent || "",
			// split = src.split("#"),
			// baseUrl = split[0],
			// spinePos = spineIndexByURL[baseUrl],
			// spineItem = bookSpine[spinePos],
			subitems = [],
			parentNode = item.parentNode,
			parent;
			// cfi = spineItem ? spineItem.cfi : '';

	if(parentNode && parentNode.nodeName === "navPoint") {
		parent = parentNode.getAttribute('id');
	}

	/*
	if(!id) {
		if(spinePos) {
			spineItem = bookSpine[spinePos];
			id = spineItem.id;
			cfi = spineItem.cfi;
		} else {
			id = 'epubjs-autogen-toc-id-' + EPUBJS.core.uuid();
			item.setAttribute('id', id);
		}
	}
	*/

	return {
		"id": id,
		"href": src,
		"label": text,
		"subitems" : subitems,
		"parent" : parent
	};
};

Navigation.prototype.parseNcx = function(tocXml, spineIndexByURL, bookSpine){
	// var navPoints = tocXml.querySelectorAll("navMap navPoint");
	var navPoints = core.qsa(tocXml, "navPoint");
	var length = navPoints.length;
	var i;
	var toc = {};
	var list = [];
	var item, parent;

	if(!navPoints || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.ncxItem(navPoints[i], spineIndexByURL, bookSpine);
		toc[item.id] = item;
		if(!item.parent) {
			list.push(item);
		} else {
			parent = toc[item.parent];
			parent.subitems.push(item);
		}
	}

	return list;
};

Navigation.prototype.ncxItem = function(item, spineIndexByURL, bookSpine){
	var id = item.getAttribute('id') || false,
			// content = item.querySelector("content"),
			content = core.qs(item, "content"),
			src = content.getAttribute('src'),
			// navLabel = item.querySelector("navLabel"),
			navLabel = core.qs(item, "navLabel"),
			text = navLabel.textContent ? navLabel.textContent : "",
			// split = src.split("#"),
			// baseUrl = split[0],
			// spinePos = spineIndexByURL[baseUrl],
			// spineItem = bookSpine[spinePos],
			subitems = [],
			parentNode = item.parentNode,
			parent;
			// cfi = spineItem ? spineItem.cfi : '';

	if(parentNode && parentNode.nodeName === "navPoint") {
		parent = parentNode.getAttribute('id');
	}

	/*
	if(!id) {
		if(spinePos) {
			spineItem = bookSpine[spinePos];
			id = spineItem.id;
			cfi = spineItem.cfi;
		} else {
			id = 'epubjs-autogen-toc-id-' + EPUBJS.core.uuid();
			item.setAttribute('id', id);
		}
	}
	*/

	return {
		"id": id,
		"href": src,
		"label": text,
		"subitems" : subitems,
		"parent" : parent
	};
};

module.exports = Navigation;
