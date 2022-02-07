/**
 * Handles Package Resources
 * @class
 * @param {object} resources
 * @param {object} [options]
 * @param {string} [options.replacements="base64"]
 * @param {Archive} [options.archive]
 * @param {method} [options.load]
 * @param {string} [options.url]
 * @param {string} [options.inject]
 */
class Resources {
	constructor(resources) {

		this.urlCache = {};

		this.resources = Object.assign({}, resources);

		this.resourcesByHref = {};

		this.ids = [];
		this.html = [];
		this.assets = [];
		this.css = [];

		if (resources) {
			this.split(resources);
		}
	}

	/**
	 * Split resources by type
	 * @private
	 */
	split(resources){
		let keys = Object.keys(resources);

		// HTML
		let html = keys.
			filter(function (key){
				let item = resources[key];
				if (item.type === "application/xhtml+xml" ||
						item.type === "text/html") {
					return true;
				}
			});

		// Exclude HTML & CSS
		let assets = keys.
			filter(function (key){
				let item = resources[key];
				if (item.type !== "application/xhtml+xml" &&
						item.type !== "text/html" &&
						item.type !== "text/css") {
					return true;
				}
			});

		// Only CSS
		let css = keys.
			filter(function (key){
				let item = resources[key];
				if (item.type === "text/css") {
					return true;
				}
			});

		keys.forEach((id) => {
			let resource = resources[id];
			// set ID from keys
			resource.id = id;
			if (!resource.source) {
				resource.source = resource.href;
			}
			this.resourcesByHref[resource.href] = id;
		});

		this.ids = keys;
		this.html = html;
		this.assets = assets;
		this.css = css;

		return {
			html,
			assets,
			css
		}
	}


	/**
	 * Export an Array of all resources
	 * @return {array}
	 */
	toArray() {
		return this.ids.map((key) => {
			let item = this.resources[key];
			let { type, properties, id } = item;
			let source = item.href;
			let href = item.href;

			return {
				href,
				source,
				type,
				properties,
				id
			};
		});
	}

	forEach(func) {
		return this.ids.
			forEach((id) => {
				let r = this.resources[id];
				r.id = key;
				func(r);
			});
	}

	map(func) {
		return this.ids.
			map((id) => {
				let r = this.resources[id];
				r.id = key;
				return func(r);
			});
	}

	filter(func) {
		return this.ids.
			filter((id) => {
				let r = this.resources[id];
				r.id = key;
				return func(r);
			});
	}

	get(what) {
		if (what in this.resources) {
			return this.resources[what];
		} else if (what in this.resourcesByHref) {
			let id = this.resourcesByHref[what];
			return this.resources[id];
		}
	}
	destroy() {
		this.settings = undefined;
		this.manifest = undefined;

		this.html = undefined;
		this.assets = undefined;
		this.css = undefined;

		this.urls = undefined;
		this.cssUrls = undefined;
	}
}

export default Resources;
