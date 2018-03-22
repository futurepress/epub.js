import EventEmitter from "event-emitter";
import {extend, defer} from "../utils/core";
import Url from "../utils/url";
import Path from "../utils/path";

import Spine from "./spine";
import Locators from "./locators";
import Navigation from "./navigation";
import request from "../utils/request";
import EpubCFI from "../utils/epubcfi";
import { EVENTS, EPUBJS_VERSION } from "../utils/constants";

/**
 * An Epub Book representation with methods for the loading and manipulation
 * of its contents.
 * @class
 * @param {json | object} [manifest]
 * @returns {Book}
 * @example new Book(manifest)
 */
class Book {
	constructor(manifest) {

		/**
		 * @member {Spine} sections
		 * @memberof Book
		 */
		this.sections = new Spine();


		/**
		 * @member {Navigation} navigation
		 * @memberof Book
		 */
		this.navigation = new Navigation();

		/**
		 * @member {Locators} locators
		 * @memberof Book
		 */
		this.locators = new Locators();

		/**
		 * @member {object} manifest
		 * @memberof Book
		 */
		this.manifest = {
			"@context" : "http://readium.org/webpub/default.jsonld",
			metadata: {
				"@type" : "http://schema.org/Book"
			},
			resources: [],
			toc: [],
			landmarks: [],
			locations: [],
			pages: [],
			spine: [],
			links: []
		};


		if (manifest) {
			this.parse(manifest);
		}
	}

	parse(manifest) {
		if (!manifest) {
			return;
		}

		if (typeof manifest === "string") {
			manifest = JSON.parse(manifest);
		}

		let {
			metadata,
			resources,
			toc,
			landmarks,
			locations,
			pages,
			spine,
			links
		} = manifest;

		this.metadata = metadata;
		this.resources = resources;
		this.spine = spine;
		this.toc = toc;
		this.landmarks = landmarks;
		this.locations = locations;
		this.pages = pages;
		this.links = links;
	}


	/**
	 * Get or set the Url
	 * @param {string} [url]
	 * @return {string} href
	 */
	get url() {
		let selfLink = this.manifest.links.find((link) => {
			return link.rel === "self";
		});
		return selfLink && selfLink.href;
	}

	set url(url) {
		let selfLink = this.manifest.links.find((link) => {
			return link.rel === "self";
		});

		if (selfLink) {
			selfLink.href = url;
		} else {
			selfLink = {
				rel: "self",
				href: url,
				type: "application/webpub+json"
			};
			this.manifest.links.push(selfLink);
		}

		// Set the Path object for resolving links
		this.path = selfLink.href;

		return selfLink && selfLink.href;
	}

	/**
	 * Get or set the Path to resolve content
	 * @param {string} [url]
	 * @return {string} Path
	 */
	get path() {
		return this._path;
	}

	set path(url) {
		let uri = new Url(url);
		this._path = uri.Path;
		return this._path;
	}

	/**
	 * Get or set the Spine
	 * @param {array} [spineItems]
	 * @return {array} spineItems
	 */
	get spine() {
		return this.manifest.spine;
	}

	set spine(items) {
		if (!items) {
			return;
		}
		this.sections.unpack(items);

		this.manifest.spine = items;

		return this.manifest.spine;
	}

	/**
	 * Gets a Section of the Book from the Spine
	 * Alias for `book.spine.get`
	 * @param {string} target
	 * @return {Section}
	 */
	section(target) {
		return this.sections.get(target);
	}

	/**
	 * Get or set the cover url
	 * @param {string} [coverUrl]
	 * @return {string} coverUrl
	 */
	 get cover() {
		 let coverLink = this.manifest.links.find((link) => {
			 return link.rel === "cover";
		 });
		 return coverLink && coverLink.href;
	 }

	 set cover(url) {
		 let coverLink = this.manifest.links.find((link) => {
			 return link.rel === "cover";
		 });

		 if (coverLink) {
			 coverLink.href = url;
		 } else {
			 coverLink = {
				 rel: "cover",
				 href: url
			 };
			 this.manifest.links.push(coverLink);
		 }
		 return coverLink && coverLink.href;
	 }

	/**
	 * Get or set the metadata
	 * @param {object} [metadata]
	 * @return {object} metadata
	 */
	get metadata() {
		return this.manifest.metadata;
	}

	set metadata(metadata) {
		if (!metadata) {
			return;
		}
		this.manifest.metadata = metadata;

		// Set metadata type
		if (!metadata["@type"]) {
			this.manifest.metadata["@type"] = "http://schema.org/Book";
		}

		return this.manifest.metadata;
	}

	/**
	 * Get or set the resources
	 * @param {object} [resources]
	 * @return {object} resources
	 */
	get resources() {
		return this.manifest.resources;
	}

	set resources(resources) {
		if (!resources) {
			return;
		}
		this.manifest.resources = resources.map((item) => {

			// Add Cover Rel
			if (item.properties && item.properties.length) {

				if (item.properties.indexOf("cover-image") > -1) {
					item.rel = "cover";
				}

				// Add Contents Rel
				if (item.properties.indexOf("nav") > -1) {
					item.rel = "contents";
				}

				if (item.rel && item.rel === "cover") {
					this.cover = item.href;
				}

			}
			return item;
		});

		return this.manifest.resources;
	}

	/**
	 * Get or set the toc
	 * @param {array} [toc]
	 * @return {array} toc
	 */
	get toc() {
		return this.manifest.toc;
	}

	set toc(toc) {
		if (!toc) {
			return;
		}
		this.navigation.unpackToc(toc);
		return this.manifest.toc = toc;
	}

	/**
	 * Get or set the landmarks
	 * @param {array} [landmarks]
	 * @return {array} landmarks
	 */
	get landmarks() {
		return this.manifest.landmarks;
	}

	set landmarks(landmarks) {
		if (!landmarks) {
			return;
		}
		this.navigation.unpackLandmarks(landmarks);
		return this.manifest.landmarks = landmarks;
	}

	/**
	 * Get or set the locations
	 * @param {array} [locations]
	 * @return {array} locations
	 */
	get locations() {
		return this.manifest.locations;
	}

	set locations(locations) {
		if (!locations) {
			return;
		}
		this.locators.unpackLocations(locations);
		return this.manifest.locations = locations;
	}

	/**
	 * Get or set the pages
	 * @param {array} [pageList]
	 * @return {array} pageList
	 */
	get pages() {
		return this.manifest.pages;
	}

	set pages(pageList) {
		if (!pageList) {
			return;
		}
		this.locators.unpackPages(pageList);
		return this.manifest.pages = pageList;
	}

	/**
	 * Get or set links
	 * @param {array} [links]
	 * @return {array} links
	 */
	get links() {
		return this.manifest.links;
	}

	set links(links) {
		if (!links) {
			return;
		}

		links.forEach((link) => {
			if (link.rel === "cover") {
				this.cover = link.href;
			}
			if (link.rel === "self") {
				this.path = link.href;
			}
		});

		return this.manifest.links = links;
	}

	/**
	 * Get or set the source of the book.
	 * If returns with an object, the links in the books have been replaced
	 * with service workers urls, or blob urls
	 * @param {array} [links]
	 * @return {array} links
	 */
	get source() {
		let sourceLink = this.manifest.links.find((link) => {
			return link.rel === "source";
		});
		return sourceLink;
	}

	set source(url) {
		let sourceLink = this.manifest.links.find((link) => {
			return link.rel === "source";
		});

		if (sourceLink) {
			sourceLink.href = url;
		} else {
			sourceLink = {
				rel: "source",
				href: url,
				type: "application/epub+zip"
			};
			this.manifest.links.push(sourceLink);
		}
		return sourceLink;
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
	 * Generates the Book Key using the identifer in the manifest or other string provided
	 * @param  {string} [identifier] to use instead of metadata identifier
	 * @return {string} key
	 */
	key(identifier) {
		var ident = identifier || this.metadata.identifier;
		return `epubjs-${EPUBJS_VERSION}-${ident}`;
	}

	/**
	 * Generates a object representation of the book structure
	 * @return {object}
	 */
	toObject() {
		return this.manifest;
	}

	/**
	 * Generates a JSON output of the book structure
	 */
	toJSON(key) {
		return JSON.stringify(this.manifest);
	 }

	/**
	 * Destroy the Book and all associated objects
	 */
	destroy() {
		this.sections && this.sections.destroy();
		this.locators && this.locators.destroy();
		this.navigation && this.navigation.destroy();

		this.sections = undefined;
		this.locators = undefined;
		this.navigation = undefined;

		this.manifest = undefined;
	}

}

//-- Enable binding events to book
EventEmitter(Book.prototype);

export default Book;
