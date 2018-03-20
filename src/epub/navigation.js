import {
	qs,
	qsa,
	querySelectorByType,
	filterChildren,
	getParentByTagName,
	uuid
} from "../utils/core";

/**
 * Navigation Parser
 * @param {document} xml navigation html / xhtml / ncx
 */
class Navigation {
	constructor(xml, url) {
		this.toc = [];
		this.tocByHref = {};
		this.tocById = {};

		this.landmarks = [];
		this.landmarksByType = {};

		this.length = 0;

		this.url = url || "";

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
			this.landmarks = this.parseLandmarks(xml);
		} else if(ncx){
			this.toc = this.parseNcx(xml);
		}

		this.length = 0;

		this.unpack(this.toc);
	}

	/**
	 * Unpack navigation items
	 * @private
	 * @param  {array} toc
	 */
	unpack(toc) {
		var item;
		var href;

		for (var i = 0; i < toc.length; i++) {
			item = toc[i];
			href = item.href;

			if (item.href) {
				this.tocByHref[href] = i;
			}

			if (item.id) {
				this.tocById[href] = i;
			}

			this.length++;

			if (item.children.length) {
				this.unpack(item.children);
			}
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

	/**
	 * Get a landmark by type
	 * List of types: https://idpf.github.io/epub-vocabs/structure/
	 * @param  {string} type
	 * @return {object} landmarkItems
	 */
	landmark(type) {
		var index;

		if(!type) {
			return this.landmarks;
		}

		index = this.landmarksByType[type];

		return this.landmarks[index];
	}

	/**
	 * Parse toc from a Epub > 3.0 Nav
	 * @private
	 * @param  {document} navHtml
	 * @return {array} navigation list
	 */
	parseNav(navHtml){
		var navElement = querySelectorByType(navHtml, "nav", "toc");
		var navItems = navElement ? qsa(navElement, "li") : [];
		var length = navItems.length;
		var i;
		var toc = {};
		var list = [];
		var item, parent;

		if(!navItems || length === 0) return list;

		for (i = 0; i < length; ++i) {
			item = this.navItem(navItems[i]);
			if (item) {
				toc[item.id] = item;
				if(!item.parentIndex) {
					list.push(item);
				} else {
					parent = toc[item.parent];
					parent.children.push(item);
				}
			}
		}

		return list;
	}

	/**
	 * Create a navItem
	 * @private
	 * @param  {element} item
	 * @return {object} navItem
	 */
	navItem(item){
		let id = item.getAttribute("id") || undefined;
		let content = filterChildren(item, "a", true);

		if (!content) {
			return;
		}

		if(!id) {
			id = 'epubjs-autogen-toc-id-' + uuid();
			item.setAttribute('id', id);
		}

		let href = content.getAttribute("href") || "";
		let title = content.textContent || "";
		let children = [];
		let parentItem = getParentByTagName(item, "li");
		let parent;

		let split = href.split("#");
		if (split[0] === "") {
			href = this.url + href;
		}

		if (parentItem) {
			parent = parentItem.getAttribute("id");
		}

		while (!parent && parentItem) {
			parentItem = getParentByTagName(parentItem, "li");
			if (parentItem) {
				parent = parentItem.getAttribute("id");
			}
		}

		return {
			id,
			href,
			title,
			children,
			parent
		};
	}

	/**
	 * Parse landmarks from a Epub > 3.0 Nav
	 * @private
	 * @param  {document} navHtml
	 * @return {array} landmarks list
	 */
	parseLandmarks(navHtml){
		var navElement = querySelectorByType(navHtml, "nav", "landmarks");
		var navItems = navElement ? qsa(navElement, "li") : [];
		var length = navItems.length;
		var i;
		var list = [];
		var item;

		if(!navItems || length === 0) return list;

		for (i = 0; i < length; ++i) {
			item = this.landmarkItem(navItems[i]);
			if (item) {
				list.push(item);
				this.landmarksByType[item.type] = i;
			}
		}

		return list;
	}

	/**
	 * Create a landmarkItem
	 * @private
	 * @param  {element} item
	 * @return {object} landmarkItem
	 */
	landmarkItem(item){
		let content = filterChildren(item, "a", true);

		if (!content) {
			return;
		}

		let type = content.getAttributeNS("http://www.idpf.org/2007/ops", "type") || undefined;
		let href = content.getAttribute("href") || "";
		let title = content.textContent || "";

		let split = href.split("#");
		if (split[0] === "") {
			href = this.url + href;
		}

		return {
			href,
			title,
			type
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
				parent.children.push(item);
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
				href = content.getAttribute("src"),
				navLabel = qs(item, "navLabel"),
				title = navLabel.textContent ? navLabel.textContent : "",
				children = [],
				parentNode = item.parentNode,
				parent;

		if(parentNode && parentNode.nodeName === "navPoint") {
			parent = parentNode.getAttribute("id");
		}

		if(!id) {
			id = 'epubjs-autogen-toc-id-' + uuid();
			item.setAttribute('id', id);
		}

		return {
			id,
			href,
			title,
			children,
			parent
		};
	}

	/**
	 * Load Spine Items
	 * @param  {object} json the items to be loaded
	 */
	load(json) {
		return json.map((item) => {
			if (item.children) {
				item.children = this.load(item.children);
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

	/**
	 * Get an Array of all Table of Contents Items
	 */
	getTocArray(resolver) {
		return this.toc.map((item) => {
			let url = resolver ? resolver(item.href) : item.href;

			let obj = {
				href: url,
				title: item.title
			};

			if (item.children.length) {
				obj.children = item.children;
			}

			return obj;
		});
	}

	/**
	 * Get an Array of all landmarks
	 */
	getLandmarksArray(resolver) {
		return this.landmarks.map((item) => {
			let url = resolver ? resolver(item.href) : item.href;

			let obj = {
				href: url,
				title: item.title,
				type: item.type
			};

			return obj;
		});
	}
}

export default Navigation;
