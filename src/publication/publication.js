import EventEmitter from "../utils/eventemitter.js";
import { resolve, isAbsolute, filename } from "../utils/url.js";
import ResourceList from "./resourcelist.js";
import request from "../utils/request.js";
import EpubCFI from "../utils/epubcfi.js";
import { EPUBJS_VERSION } from "../utils/constants.js";
import Resource from "./resource.js";
import Locator from "./locator.js";
import DisplayOptions from "../epub/displayoptions.js";

/**
 * A representation of a Publication with methods for the loading and manipulation
 * of its contents.
 * @class
 * @param {json | object} [manifest]
 * @returns {Publication}
 * @example new Publication(manifest)
 */
class Publication {
	constructor(data, requestMethod, requestOptions) {
		/**
		 * @member {object} data
		 * @memberof Publication
		 * @private
		 */
		this.data = {
			url: "",
			metadata: new Map(),
			navigation: new ResourceList(),
			landmarks: new ResourceList(),
			locations: new ResourceList(),
			pagelist: new ResourceList(),
			sections: new ResourceList(),
			resources: new ResourceList(),
			links: new ResourceList(),
			uniqueResources: new ResourceList(),
			displayOptions: new DisplayOptions(),
		};

		if (requestMethod) {
			this.request = requestMethod;
		}

		if (requestOptions) {
			this.requestOptions = requestOptions;
		}


		if (data) {
			this.opened = this.open(data);
		} else {
			this.opened = Promise.resolve();
		}
	}

	async open() {
		this.parse(data);
	}

	async unpack(data) {
		if (!data) {
			return;
		}

		if (typeof data === "string") {
			data = JSON.parse(data);
		}

		let {
			url,
			metadata,
			resources,
			toc,
			landmarks,
			locations,
			pagelist,
			sections,
			links
		} = data;

		this.url = url;
		this.metadata = metadata;
		this.resources = resources;
		this.sections = sections;
		this.toc = toc;
		this.landmarks = landmarks;
		this.locations = locations;
		this.pagelist = pagelist;
		this.links = links;
	}

	/**
	 * Load a resource from the Book
	 * @private
	 * @param  {string} path path to the resource to load
	 * @return {Promise} returns a promise with the requested resource
	 */
	load(path, type) {
		const resolved = resolve(this.url, path);

		return this.request ? this.request(resolved, type,  this.requestOptions) : request(resolved, type, this.requestOptions);
	}

	/**
	 * Resolve a path to it's absolute position in the Publication
	 * @private
	 * @param  {string} path
	 * @param  {boolean} [absolute] force resolving the full URL
	 * @return {string} the resolved path string
	 */
	resolve(path, absolute) {
		if (!path) {
			return;
		}
		let resolved = path;

		if (isAbsolute(path)) {
			return path;
		}

		if (this.url) {
			resolved = resolve(this.url, path);
		}
		return resolved;
	}

	/**
	 * Get or set the Url
	 * @param {string} [url]
	 * @return {string} href
	 */
	get url() {
		return this.data.url;
	}

	set url(url) {
		this.data.url = url;
		return this.data.url;
	}


	/**
	 * Get or set the readingOrder
	 * @param {array} [spineItems]
	 * @return {array} spineItems
	 */
	get sections() {
		return this.data.sections;
	}

	set sections(items) {
		if (!items) {
			return;
		}
		let index = 1;
		for (const item of items) {
			item.url = resolve(this.url, item.url);
			// TEMP hack for handling EpubCFI
			const id = encodeURIComponent(filename(item.url).split(".")[0]);
			item.id = id;
			// Index 2 for Sections
			item.cfiBase = item.cfiBase || `2/${index * 2}[${id}]`
			item.canonical = item.canonical || item.cfiBase;

			const resource = new Resource(item);
			this.data.sections.append(resource);
			this.data.uniqueResources.add(resource);
			index += 1;
		}

		return this.data.sections;
	}

	/**
	 * Get or set the metadata
	 * @param {object} [metadata]
	 * @return {object} metadata
	 */
	get metadata() {
		return this.data.metadata;
	}

	set metadata(metadata) {
		if (!metadata) {
			return;
		}

		for (const [key, value] of Object.entries(metadata)) {
			this.data.metadata.set(key, value);
		}

		return this.data.metadata;
	}

	/**
	 * Get or set the resources
	 * @param {object} [resources]
	 * @return {object} resources
	 */
	get resources() {
		return this.data.resources;
	}

	set resources(items) {
		if (!items) {
			return;
		}
		let index = 1;
		for (const item of items) {
			item.url = this.resolve(item.url);
			// TEMP hack for handling EpubCFI
			const id = encodeURIComponent(filename(item.url).split(".")[0]);
			item.id = id;
			// Index 4 for Resources
			item.cfiBase = item.cfiBase || `4/${index * 2}[${id}]`
			item.canonical = item.canonical || item.cfiBase;

			const resource = new Resource(item);
			this.data.resources.add(resource);
			this.data.uniqueResources.add(resource);

			index += 1;
		}

		return this.data.resources;
	}

	/**
	 * Get or set the uniqueResources
	 * @param {object} [resources]
	 * @return {object} resources
	 */
	get uniqueResources() {
		return this.data.uniqueResources;
	}

	set uniqueResources(items) {
		if (!items) {
			return;
		}

		for (const item of items) {
			item.url = this.resolve(item.url);
			item.canonical = item.canonical || item.url;

			const resource = new Resource(item);
			this.data.uniqueResources.add(resource);
		}

		return this.data.uniqueResources;
	}

	/**
	 * Get or set the toc
	 * @param {array} [toc]
	 * @return {array} toc
	 */
	get navigation() {
		return this.data.navigation;
	}

	set navigation(items) {
		if (!items) {
			return;
		}

		for (const item of items) {
			item.url = this.resolve(item.url);
			item.canonical = item.canonical || item.url;

			const loc = new Locator(item);
			this.data.navigation.append(loc);
		}

		return this.data.navigation;
	}

	/**
	 * Get or set the landmarks
	 * @param {array} [landmarks]
	 * @return {array} landmarks
	 */
	get landmarks() {
		return this.data.landmarks;
	}

	set landmarks(items) {
		if (!items) {
			return;
		}

		for (const item of items) {
			item.url = this.resolve(item.url);
			item.canonical = item.canonical || item.url;

			const loc = new Locator(item);
			this.data.landmarks.append(loc);
		}

		return this.data.landmarks;
	}

	/**
	 * Get or set the locations
	 * @param {array} [locations]
	 * @return {array} locations
	 */
	get locations() {
		return this.data.locations;
	}

	set locations(items) {
		if (!items) {
			return;
		}

		for (const item of items) {
			const loc = new Locator({ url: item, cfi: item});
			this.data.locations.append(loc);
		}

		return this.data.locations;
	}

	/**
	 * Get or set the pagelist
	 * @param {array} [pageList]
	 * @return {array} pageList
	 */
	get pagelist() {
		return this.data.pagelist;
	}

	set pagelist(items) {
		if (!items) {
			return;
		}

		for (const item of items) {
			item.url = this.resolve(item.url);
			item.canonical = item.canonical || item.url;

			const loc = new Locator(item);
			this.data.pagelist.append(loc);
		}

		return this.data.pagelist;
	}

	/**
	 * Get or set links
	 * @param {array} [links]
	 * @return {array} links
	 */
	get links() {
		return this.data.links;
	}

	set links(links) {
		return this.data.links = links;
	}

	get displayOptions() {
		return this.data.displayOptions;
	}

	set displayOptions(options) {
		this.data.displayOptions = new DisplayOptions(options);
		return this.data.displayOptions;
	}

	/**
	 * Find a DOM Range for a given CFI Range
	 * @param  {EpubCFI} cfiRange a epub cfi range
	 * @return {Range}
	 */
	getRange(cfiRange) {
		var cfi = new EpubCFI(cfiRange);
		var item = this.sections.get(cfi.spinePos);

		if (!item) {
			return new Promise((resolve, reject) => {
				reject("CFI could not be found");
			});
		}

		return item.load().then(function (contents) {
			var range = cfi.toRange(item.document);
			return range;
		});
	}

	/**
	 * Generates the Publication Key using the identifer in the data or other string provided
	 * @param  {string} [identifier] to use instead of metadata identifier
	 * @return {string} key
	 */
	key(identifier) {
		let ident = identifier || this.metadata.get("id") || this.metadata.get("identifier");
		return `epubjs-${EPUBJS_VERSION}-${ident}`;
	}

	/**
	 * Generates a object representation of the publication structure
	 * @return {object}
	 */
	toObject() {
		return this.data;
	}

	/**
	 * Generates a JSON output of the publication structure
	 */
	toJSON() {
		return this.data;
	 }

	/**
	 * Destroy the Publication and all associated objects
	 */
	destroy() {
		this.data = undefined;
	}

}

//-- Enable binding events to publication
EventEmitter(Publication.prototype);

export default Publication;
