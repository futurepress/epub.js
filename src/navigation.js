import {qs, qsa, querySelectorByType} from "./utils/core";

/**
 * Navigation Parser
 * @param {document} xml navigation html / xhtml / ncx
 */
class Navigation {
	constructor(xml) {
		this.toc = [];
		this.tocByHref = {};
		this.tocById = {};

		if (xml) {
			this.parse(xml);
		}
	}

	/**
	 * Parse out the navigation items
	 * @param {document} xml navigation html / xhtml / ncx
	 */
	parse(xml) {
		let isXml = xml.nodeType;
		let html;
		let ncx;

		if (isXml) {
			html = qs(xml, "html");
			ncx = qs(xml, "ncx");
		}

		if (!isXml) {
			this.toc = this.load(xml);
		} else if(html) {
			this.toc = this.parseNav(xml);
		} else if(ncx){
			this.toc = this.parseNcx(xml);
		}

		this.unpack(this.toc);
	}

	/**
	 * Unpack navigation items
	 * @private
	 * @param  {array} toc
	 */
	unpack(toc) {
		var item;

		for (var i = 0; i < toc.length; i++) {
			item = toc[i];
			this.tocByHref[item.href] = i;
			this.tocById[item.id] = i;
		}

	}

	/**
	 * Get an item from the navigation
	 * @param  {string} target
	 * @return {object} navItems
	 */
	get(target) {
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
	}

	createTocItem(linkElement, id) {
		var list = [],
				tocLinkElms = linkElement.childNodes,
				tocLinkArray = Array.prototype.slice.call(tocLinkElms);

		var index = id ? id : 0;
		tocLinkArray.forEach((linkElm) => {
			if (linkElm.nodeName.toLowerCase() === 'li') {
				var tocLink = qs(linkElm, 'a'),
						tocLinkData = {
							id: -1,
							href: tocLink.getAttribute('href'),
							label: tocLink.textContent,
							parent: null
						},
						subItemElm = qs(linkElm, 'ol');
				index++;
				tocLinkData.id = index;
				if (id) {
					tocLinkData.parent = id;
				}
				list.push(tocLinkData);
				if (subItemElm) {
					var subitems = this.createTocItem(subItemElm, index);
					if (subitems && subitems.length > 0) {
						index = index + subitems.length;
						list = list.concat(subitems);
					}
				}
			}
		});
		return list;
	}

	/**
	 * Parse from a Epub > 3.0 Nav
	 * @private
	 * @param  {document} navHtml
	 * @return {array} navigation list
	 */
	parseNav(navHtml){
		var navElement = querySelectorByType(navHtml, "nav", "toc");
		var tocItems = qs(navElement, "ol");
		return this.createTocItem(tocItems);
	}

	/**
	 * Create a navItem
	 * @private
	 * @param  {element} item
	 * @return {object} navItem
	 */
	navItem(item){
		var id = item.getAttribute("id") || false,
				content = qs(item, "a"),
				src = content.getAttribute("href") || "",
				text = content.textContent || "",
				subitems = [],
				parentNode = item.parentNode,
				parent;

		if(parentNode && parentNode.nodeName === "navPoint") {
			parent = parentNode.getAttribute("id");
		}

		return {
			"id": id,
			"href": src,
			"label": text,
			"subitems" : subitems,
			"parent" : parent
		};
	}

	/**
	 * Parse from a Epub > 3.0 NC
	 * @private
	 * @param  {document} navHtml
	 * @return {array} navigation list
	 */
	parseNcx(tocXml){
		var navPoints = qsa(tocXml, "navPoint");
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
	}

	/**
	 * Create a ncxItem
	 * @private
	 * @param  {element} item
	 * @return {object} ncxItem
	 */
	ncxItem(item){
		var id = item.getAttribute("id") || false,
				content = qs(item, "content"),
				src = content.getAttribute("src"),
				navLabel = qs(item, "navLabel"),
				text = navLabel.textContent ? navLabel.textContent : "",
				subitems = [],
				parentNode = item.parentNode,
				parent;

		if(parentNode && parentNode.nodeName === "navPoint") {
			parent = parentNode.getAttribute("id");
		}


		return {
			"id": id,
			"href": src,
			"label": text,
			"subitems" : subitems,
			"parent" : parent
		};
	}

	/**
	 * Load Spine Items
	 * @param  {object} json the items to be loaded
	 */
	load(json) {
		return json.map((item) => {
			item.label = item.title;
			if (item.children) {
				item.subitems = this.load(item.children);
			}
			return item;
		});
	}

	/**
	 * forEach pass through
	 * @param  {Function} fn function to run on each item
	 * @return {method} forEach loop
	 */
	forEach(fn) {
		return this.toc.forEach(fn);
	}
}

export default Navigation;
