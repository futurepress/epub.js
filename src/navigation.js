var core = require('./core');
var path = require('path');

/**
 * Navigation Parser
 * @param {document} xml navigation html / xhtml / ncx
 */
function Navigation(xml){
	this.toc = [];
	this.tocByHref = {};
	this.tocById = {};

	if (xml) {
		this.parse(xml);
	}
};

/**
 * Parse out the navigation items
 * @param {document} xml navigation html / xhtml / ncx
 */
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

/**
 * Unpack navigation items
 * @private
 * @param  {array} toc
 */
Navigation.prototype.unpack = function(toc) {
	var item;

	for (var i = 0; i < toc.length; i++) {
		item = toc[i];
		this.tocByHref[item.href] = i;
		this.tocById[item.id] = i;
	}

};

/**
 * Get an item from the navigation
 * @param  {string} target
 * @return {object} navItems
 */
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

/**
 * Parse from a Epub > 3.0 Nav
 * @private
 * @param  {document} navHtml
 * @return {array} navigation list
 */
Navigation.prototype.parseNav = function(navHtml){
	var navElement = core.querySelectorByType(navHtml, "nav", "toc");
	var navItems = navElement ? core.qsa(navElement, "li") : [];
	var length = navItems.length;
	var i;
	var toc = {};
	var list = [];
	var item, parent;

	if(!navItems || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.navItem(navItems[i]);
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

/**
 * Create a navItem
 * @private
 * @param  {element} item
 * @return {object} navItem
 */
Navigation.prototype.navItem = function(item){
	var id = item.getAttribute('id') || false,
			content = core.qs(item, "a"),
			src = content.getAttribute('href') || '',
			text = content.textContent || "",
			subitems = [],
			parentNode = item.parentNode,
			parent;

	if(parentNode && parentNode.nodeName === "navPoint") {
		parent = parentNode.getAttribute('id');
	}

	return {
		"id": id,
		"href": src,
		"label": text,
		"subitems" : subitems,
		"parent" : parent
	};
};

/**
 * Parse from a Epub > 3.0 NC
 * @private
 * @param  {document} navHtml
 * @return {array} navigation list
 */
Navigation.prototype.parseNcx = function(tocXml){
	var navPoints = core.qsa(tocXml, "navPoint");
	var length = navPoints.length;
	var i;
	var toc = {};
	var list = [];
	var item, parent;

	if(!navPoints || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.ncxItem(navPoints[i]);
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

/**
 * Create a ncxItem
 * @private
 * @param  {element} item
 * @return {object} ncxItem
 */
Navigation.prototype.ncxItem = function(item){
	var id = item.getAttribute('id') || false,
			content = core.qs(item, "content"),
			src = content.getAttribute('src'),
			navLabel = core.qs(item, "navLabel"),
			text = navLabel.textContent ? navLabel.textContent : "",
			subitems = [],
			parentNode = item.parentNode,
			parent;

	if(parentNode && parentNode.nodeName === "navPoint") {
		parent = parentNode.getAttribute('id');
	}


	return {
		"id": id,
		"href": src,
		"label": text,
		"subitems" : subitems,
		"parent" : parent
	};
};

/**
 * forEach pass through
 * @param  {Function} fn function to run on each item
 * @return {method} forEach loop
 */
Navigation.prototype.forEach = function(fn) {
	return this.toc.forEach(fn);
};

module.exports = Navigation;
