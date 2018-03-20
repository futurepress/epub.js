import {substitute} from "../utils/replacements";
import {createBlob, createBase64Url, createBlobUrl, blob2base64, revokeBlobUrl, defer} from "../utils/core";
import Url from "../utils/url";
import mime from "../../libs/mime/mime";
import Path from "../utils/path";
// import path from "path-webpack";

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
	constructor(resources, options) {
		this.settings = {
			replacements: (options && options.replacements) || "blobUrl",
			archive: (options && options.archive),
			load: (options && options.load),
			url: (options && options.url),
			// path: (options && options.path),
			inject: (options && options.inject) || {},
		};

		this.urlCache = {};

		this.resources = Object.assign({}, resources);

		this.resourcesByHref = {};

		this.ids = [];
		this.html = [];
		this.assets = [];
		this.css = [];

		if (typeof(this.settings.url) === "string") {
			this.url = new Url(this.settings.url);
			this.path = new Path(this.settings.url);
		} else if(typeof(this.settings.url) === "object") {
			this.url = this.settings.url;
			this.path = new Path(this.url.toString());
		} else {
			this.path = new Path("/");
		}

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
	 * Save all resources into the cache
	 * @return {array}
	 */
	cache(key, origin) {
		if (typeof(caches) === "undefined") {
			return new Promise(function(resolve, reject) {
				resolve([]);
			});
		}

		this.cacheKey = key;

		let originUrl = this.url;
		if (typeof(origin) === "string") {
			originUrl = new Url(origin);
		}

		this.ids.map((resourceId) => {
			let resource = this.resources[resourceId];
			let href = resource.source || resource.href;
			let isAbsolute = href.indexOf("://") > -1;
			let path = isAbsolute ? href : this.path.resolve(href);
			let url;

			if (!isAbsolute && originUrl) {
				url = originUrl.resolve(href);
			} else {
				let originalUrl = new Url(href, origin);
				let base = encodeURIComponent(originalUrl.origin);
				path = path.replace(originalUrl.origin, "");

				url = new Url(key + base + path, location.href).toString();
			}

			this.resources[resourceId].path = path;
			this.resources[resourceId].cached = url;
			this.urlCache[path] = url;
		});

		return caches.open(key).then((cache) => {
			let urls = this.ids.map((resourceId) => {
				let resource = this.resources[resourceId];
				let url = resource.cached;
				let path = resource.path;

				let mimeType = mime.lookup(path);

				return cache.match(url)
					.then((result) => {
						if (!result) {
							let loaded;
							if (resource.type === "application/xhtml+xml" ||
									resource.type === "text/html") {
								loaded = this.settings.load(path, "text").then((text) => {

									if (this.settings.inject.identifier) {
										text = this.injectIdentifier(text, this.settings.inject.identifier);
									}

									if (this.settings.inject.script) {
										text = this.injectScript(text, this.settings.inject.script);
									}

									if (this.settings.inject.stylesheet) {
										text = this.injectStylesheet(text, this.settings.inject.script);
									}

									return createBlob(text, resource.type);
								});
							} else {
								loaded = this.settings.load(path, "blob");
							}

							return loaded.then((blob) => {
								let response = new Response(blob, {
									"status" : 200,
									"headers": { 'Content-Type': mimeType }
								});
								this.urlCache[path] = url;
								return cache.put(url, response);
							}, (err) => {
								console.warn("Missing Resource", path);
								return path;
							}).then(() => {
								return url;
							});

						} else {
							this.urlCache[path] = url;
							return url;
						}
					});

			});

			return Promise.all(urls);
		});
	}

	/**
	 * Create blob urls for all the assets
	 * @return {Promise}         returns replacement urls
	 */
	replacements(){
		if (this.settings.replacements === "none") {
			return new Promise(function(resolve) {
				resolve([]);
			}.bind(this));
		}

		var replacements = [];

		// Replace all the assets
		let assets = this.assets.
			map( (resourceId) => {
				let url = this.replacementUrl(resourceId);
				replacements.push(url);
				return url;
			});

		// Re-write and replace css files
		let css = Promise.all(assets).then(() => {
			return this.css.
				map( (resourceId) => {
					let url = this.replacementCss(resourceId);
					replacements.push(url);
					return url;
				});
		});

		// Re-write and replace htmls files
		let html = css.then(() => {
			return this.html.
				map( (resourceId) => {
					let url = this.replacementHtml(resourceId);
					replacements.push(url);
					return url;
				});
		});

		return html.then(() => {
			return Promise.all(replacements);
		}).then((urls) => {
			return urls;
		});
	}

	/**
	 * Create a replacement url from a resource
	 * @param  {number} resourceId
	 * @return {promise}
	 */
	replacementUrl(resourceId) {
		let resource = this.resources[resourceId];
		let absolute = this.url.resolve(resource.href);
		let createUrl;

		if (this.settings.replacements === "base64") {
			createUrl = this.base64UrlFrom(absolute);
		} else {
			createUrl = this.blobUrlFrom(absolute);
		}

		return createUrl
			.then((url) => {
				this.resources[resourceId].replacement = url;
				this.urlCache[absolute] = url;
				return url;
			})
			.catch((err) => {
				console.error(err);
				return null;
			});
	}

	/**
	 * Replace URLs in CSS resources
	 * @private
	 * @param  {number} resourceId
	 * @return {Promise}
	 */
	replacementCss(resourceId){
		let newUrl;
		let resource = this.resources[resourceId];
		let href = resource.href;

		if (this.path.isAbsolute(href)) {
			return new Promise(function(resolve){
				resolve(href);
			});
		}

		let resolved = this.path.resolve(href);
		let fullpath = new Path(resolved);
		// Get the text of the css file from the archive
		var textResponse;

		if (this.settings.archive) {
			textResponse = this.settings.archive.getText(resolved);
		} else {
			textResponse = this.settings.load(resolved, "text");
		}

		return textResponse.then( (text) => {
			let replacements = {};

			// Get asset links relative to css file
			this.ids.forEach( (resourceId) => {
				let resource = this.resources[resourceId];
				if (!resource.replacement) {
					return
				}

				let assetHref = resource.href;
				let resolved = this.path.resolve(assetHref);
				let relative = fullpath.relative(resolved);

				replacements[relative] = resource.replacement;
			});

			// Replacements in the css text
			text = this.substitute(text, replacements);

			// Get the new url
			if (this.settings.replacements === "base64") {
				newUrl = createBase64Url(text, "text/css");
			} else {
				newUrl = createBlobUrl(text, "text/css");
			}

			return newUrl;
		}, (err) => {
			// handle response errors
			return new Promise(function(resolve){
				resolve();
			});
		}).then((url) => {
			if (url) {
				this.resources[resourceId].replacement = url;
				this.urlCache[fullpath] = url;
			}
			return url;
		});
	}

	/**
	 * Replace URLs in HTML resources
	 * @private
	 * @param  {number} resourceId
	 * @return {Promise}
	 */
	replacementHtml(resourceId){
		let newUrl;
		let resource = this.resources[resourceId];
		let href = resource.href;
		let mimeType = mime.lookup(href);

		if (this.path.isAbsolute(href)) {
			return new Promise(function(resolve){
				resolve(href);
			});
		}

		let resolved = this.path.resolve(href);
		let fullpath = new Path(resolved);
		// Get the text of the css file from the archive
		var textResponse;

		if (this.settings.archive) {
			textResponse = this.settings.archive.getText(resolved);
		} else {
			textResponse = this.settings.load(resolved, "text");
		}

		return textResponse.then( (text) => {
			let replacements = {};

			// Get asset links relative to html file
			this.ids.forEach( (resourceId) => {
				let resource = this.resources[resourceId];
				if (!resource.replacement) {
					return
				}

				let assetHref = resource.href;
				let resolved = this.path.resolve(assetHref);
				let relative = fullpath.relative(resolved);

				replacements[relative] = resource.replacement;
			});

			// Replacements in the css text
			text = this.substitute(text, replacements);

			// Inject
			if (this.settings.inject.base) {
				text = this.injectBase(text, this.settings.inject.base);
			}

			if (this.settings.inject.identifier) {
				text = this.injectIdentifier(text, this.settings.inject.identifier);
			}

			if (this.settings.inject.script) {
				text = this.injectScript(text, this.settings.inject.script);
			}

			if (this.settings.inject.stylesheet) {
				text = this.injectStylesheet(text, this.settings.inject.script);
			}

			// Get the new url
			if (this.settings.replacements === "base64") {
				newUrl = createBase64Url(text, mimeType);
			} else {
				newUrl = createBlobUrl(text, mimeType);
			}

			return newUrl;
		}, (err) => {
			// handle response errors
			return new Promise(function(resolve){
				resolve();
			});
		}).then((url) => {
			if (url) {
				this.resources[resourceId].replacement = url;
				this.urlCache[fullpath] = url;
			}
			return url;
		});
	}

	/**
	 * Create a blob url from a resource absolute url
	 * @param  {string} url
	 * @return {string}          the resolved path string
	 */
	blobUrlFrom (url) {
		var parsedUrl = new Url(url);
		var mimeType = mime.lookup(parsedUrl.filename);

		if (this.settings.archive) {
			return this.settings.archive.createUrl(url, {"base64": false});
		} else {
			return this.settings.load(url, "blob").then((blob) => {
				return createBlobUrl(blob, mimeType);
			});
		}
	}

	/**
	 * Create a base64 encoded url from a resource absolute url
	 * @param  {string} url
	 * @return {string}          the resolved path string
	 */
	base64UrlFrom (url) {
		var parsedUrl = new Url(url);
		var mimeType = mime.lookup(parsedUrl.filename);

		if (this.settings.archive) {
			return this.settings.archive.createUrl(url, {"base64": true});
		} else {
			return this.settings.load(url, "blob")
				.then((blob) => {
					return blob2base64(blob);
				})
				.then((blob) => {
					return createBase64Url(blob, mimeType);
				});
		}
	}

	/**
	 * Substitute urls in a resource
	 */
	substitute(text, resources) {
		let query = Object.keys(resources).map((i) => {
				return i.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
			}).join("|");

		let reg = new RegExp("(" + query + ")", "g");

		return text.replace(reg, function(match) {
			return resources[match];
		});
	}

	injectStylesheet(text, src) {
		let reg = /<[ ]*\/head[ ]*>/;
		let toInject = `<link href="${src}" rel="stylesheet" />`;

		return text.replace(reg, toInject + "$&");
	}

	injectScript(text, src) {
		let reg = /<[ ]*\/head[ ]*>/;
		let toInject = `<script src="${src}" type="text/javascript"></script>`;

		return text.replace(reg, toInject + "$&");
	}

	injectIdentifier(text, identifier) {
		let reg = /<[ ]*\/head[ ]*>/;
		let toInject = `<meta name="dc.relation.ispartof" content="${identifier}" />`;

		return text.replace(reg, toInject + "$&");
	}

	injectBase(text, url) {
		let reg = /<[ ]*head[ ]*>/;
		let absolute = (url.indexOf("://") > -1);

		// Fix for Safari crashing if the url doesn't have an origin
		if (!absolute && (typeof(window) !== "undefined" && window.location)) {
			let parts = window.location.href.split("/")
			let directory = "";

			parts.pop();
			directory = parts.join("/");

			url = directory + url;
		}

		let toInject = `<base href="${url}" />`;


		return text.replace(reg, "$&" + toInject);
	}

	origin(url) {
		this.url = new Url(url);
	}

	/**
	 * Resolve a path to its absolute url (or replaced url)
	 * @param  {string} path
	 * @return {string}          the resolved path string
	 */
	resolve(path) {
		if (!path) {
			return;
		}
		let isAbsolute = path.indexOf("://") > -1;
		let href = isAbsolute ? path : this.path.resolve(path);
		let resolved = href;

		let search = href.split("?");
		let anchor = href.split("#");
		let base = href;
		if (search.length > 1) {
			base = search[0];
		} else if (anchor.length > 1) {
			base = anchor[0];
		}
		let cached = this.urlCache[base];

		if (cached) {
			resolved = cached;

			// Add query strings back
			if (search.length > 1) {
				resolved += "?" + search[1];
			} else if (anchor.length > 1) {
				resolved += "#" + anchor[1];
			}
		} else if (this.url) {
			resolved = this.url.resolve(path);
		} else {
			resolved = path;
		}

		return resolved;
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

			let href = item.cached || item.replacement || (this.url && this.url.resolve(item.href)) || item.href;

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

	revokeBlobUrls() {
		this.ids.forEach((id) => {
			let r = this.resources[id];
			if (r.replacement) {
				revokeBlobUrl(r.replacement);
			}
		});
	}

	destroy() {
		this.revokeBlobUrls();

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
