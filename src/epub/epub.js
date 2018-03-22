import EventEmitter from "event-emitter";
import {extend, defer} from "../utils/core";
import Url from "../utils/url";
import Path from "../utils/path";

import Book from "../book/book";
import Locations from "./locations";
import Container from "./container";
import Packaging from "./packaging";
import Navigation from "./navigation";
import Resources from "./resources";
import PageList from "./pagelist";
import Archive from "./archive";
import request from "../utils/request";
import EpubCFI from "../utils/epubcfi";
import { EVENTS, EPUBJS_VERSION } from "../utils/constants";

const CONTAINER_PATH = "META-INF/container.xml";

const INPUT_TYPE = {
	BINARY: "binary",
	BASE64: "base64",
	EPUB: "epub",
	OPF: "opf",
	MANIFEST: "json",
	DIRECTORY: "directory"
};

/**
 * An Epub representation with methods for the parsing of its contents.
 * @class
 * @param {string} [url]
 * @param {object} [options]
 * @param {method} [options.requestMethod] a request function to use instead of the default
 * @param {boolean} [options.requestCredentials=undefined] send the xhr request withCredentials
 * @param {object} [options.requestHeaders=undefined] send the xhr request headers
 * @param {string} [options.encoding=binary] optional to pass 'binary' or base64' for archived Epubs
 * @param {string} [options.replacements] use base64, blobUrl, or none for replacing assets in archived Epubs
 * @param {method} [options.cache] use cache to save book contents for a service workers
 * @returns {Epub}
 * @example new Epub("/path/to/book.epub", {})
 * @example new Epub({ replacements: "blobUrl" })
 */
class Epub {
	constructor(url, options) {
		// Allow passing just options to the Book
		if (typeof(options) === "undefined"
			&& typeof(url) === "object") {
			options = url;
			url = undefined;
		}

		this.settings = extend(this.settings || {}, {
			requestMethod: undefined,
			requestCredentials: undefined,
			requestHeaders: undefined,
			encoding: undefined,
			replacements: undefined,
			cache: undefined,
			stylesheet: null,
			script: null
		});

		extend(this.settings, options);

		this.opening = new defer();
		/**
		 * @member {promise} opened returns after the book is loaded
		 * @memberof Book
		 */
		this.opened = this.opening.promise;
		this.isOpen = false;

		this.book = undefined;

		/**
		 * @member {promise} ready returns after the book is loaded and parsed
		 * @memberof Book
		 * @private
		 */
		this.ready = this.opened.then(() => {
			this.manifest = this.book.toJSON();
			this.emit(EVENTS.BOOK.READY, this.manifest);
			return this.book;
		});

		/**
		 * @member {method} request
		 * @memberof Epub
		 * @private
		 */
		this.request = this.settings.requestMethod || request;

		/**
		 * @member {boolean} archived
		 * @memberof Epub
		 * @private
		 */
		this.archived = false;

		/**
		 * @member {Container} container
		 * @memberof Epub
		 * @private
		 */
		this.container = undefined;

		/**
		 * @member {Packaging} packaging
		 * @memberof Epub
		 * @private
		 */
		this.packaging = undefined;

		/**
		 * @member {Locations} locations
		 * @memberof Epub
		 * @private
		 */
		 this.locations = undefined;

		 /**
		 * @member {PageList} pagelist
		 * @memberof Epub
		 */
		this.pageList = undefined;

		if(url) {
			this.open(url).catch((error) => {
				var err = new Error("Cannot load book at "+ url );
				this.emit(EVENTS.BOOK.OPEN_FAILED, err);
				console.error(error);
			});
		}
	}

	/**
	 * Open a epub or url
	 * @param {string | ArrayBuffer} input Url, Path or ArrayBuffer
	 * @param {string} [what="binary", "base64", "epub", "opf", "json", "directory"] force opening as a certain type
	 * @returns {Promise} of when the book has been loaded
	 * @example book.open("/path/to/book.epub")
	 */
	open(input, what) {
		let opening;
		let type = what || this.determineType(input);
		let inputLocation;

		// For browsers
		if (typeof window !== "undefined") {
			inputLocation = window.location.href;
		}

		// For web workers
		if (typeof self !== "undefined") {
			inputLocation = self.location.href;
		}

		if (type === INPUT_TYPE.BINARY) {
			this.archived = true;
			this.url = new Url("/", "");
			this.locationUrl = new Url(inputLocation);
			opening = this.openEpub(input);
		} else if (type === INPUT_TYPE.BASE64) {
			this.archived = true;
			this.url = new Url("/", "");
			this.locationUrl = new Url(inputLocation);
			opening = this.openEpub(input, type);
		} else if (type === INPUT_TYPE.EPUB) {
			this.archived = true;
			this.url = new Url("/", "");
			this.locationUrl = new Url(input, inputLocation);
			opening = this.request(input, "binary")
				.then(this.openEpub.bind(this));
		} else if(type == INPUT_TYPE.OPF) {
			this.url = new Url(input);
			this.locationUrl = new Url(input);
			opening = this.openPackaging(this.url.Path.toString());
		} else if(type == INPUT_TYPE.MANIFEST) {
			this.url = new Url(input);
			this.locationUrl = new Url(input);
			opening = this.openManifest(this.url.Path.toString());
		} else {
			this.url = new Url(input);
			this.locationUrl = new Url(input);
			opening = this.openContainer(CONTAINER_PATH)
				.then(this.openPackaging.bind(this));
		}

		return opening.then((packaging) => {
			return this.unpack(packaging);
		});
	}

	/**
	 * Open an archived epub
	 * @private
	 * @param  {binary} data
	 * @param  {string} [encoding]
	 * @return {Promise}
	 */
	openEpub(data, encoding) {
		return this.unarchive(data, encoding || this.settings.encoding)
			.then(() => {
				return this.openContainer(CONTAINER_PATH);
			})
			.then((packagePath) => {
				return this.openPackaging(packagePath);
			});
	}

	/**
	 * Open the epub container
	 * @private
	 * @param  {string} url
	 * @return {string} packagePath
	 */
	openContainer(url) {
		return this.load(url)
			.then((xml) => {
				this.container = new Container(xml);
				return this.resolve(this.container.packagePath);
			});
	}

	/**
	 * Open the Open Packaging Format Xml
	 * @private
	 * @param  {string} url
	 * @return {Promise}
	 */
	openPackaging(url) {
		this.path = new Path(url);
		return this.load(url)
			.then((xml) => {
				this.packaging = new Packaging(xml);
				return this.packaging;
			});
	}

	/**
	 * Open the manifest JSON
	 * @private
	 * @param  {string} url
	 * @return {Promise}
	 */
	openManifest(url) {
		this.path = new Path(url);
		return this.load(url)
			.then((json) => {
				this.packaging = new Packaging();
				this.packaging.load(json);
				return this.packaging;
			});
	}

	/**
	 * Load a resource from the Book
	 * @private
	 * @param  {string} path path to the resource to load
	 * @return {Promise}     returns a promise with the requested resource
	 */
	load(path, type) {
		var resolved;

		if(this.archived) {
			resolved = this.resolve(path);
			return this.archive.request(resolved, type);
		} else {
			resolved = this.resolve(path);
			return this.request(resolved, type, this.settings.requestCredentials, this.settings.requestHeaders);
		}
	}

	/**
	 * Resolve a path to it's absolute position in the Book
	 * @private
	 * @param  {string} path
	 * @param  {boolean} [absolute] force resolving the full URL
	 * @return {string}          the resolved path string
	 */
	resolve(path, absolute) {
		if (!path) {
			return;
		}
		let resolved = path;
		let isAbsolute = (path.indexOf("://") > -1);

		if (isAbsolute) {
			return path;
		}

		if (this.path) {
			resolved = this.path.resolve(path);
		}

		if(absolute != false && this.url) {
			resolved = this.url.resolve(resolved);
		}

		return resolved;
	}

	/**
	 * Determine the type of they input passed to open
	 * @private
	 * @param  {string} input
	 * @return {string}  binary | directory | epub | opf
	 */
	determineType(input) {
		var url;
		var path;
		var extension;

		if (this.settings.encoding === "base64") {
			return INPUT_TYPE.BASE64;
		}

		if(typeof(input) != "string") {
			return INPUT_TYPE.BINARY;
		}

		url = new Url(input);
		path = url.path();
		extension = path.extension;

		if (!extension) {
			return INPUT_TYPE.DIRECTORY;
		}

		if(extension === "epub"){
			return INPUT_TYPE.EPUB;
		}

		if(extension === "opf"){
			return INPUT_TYPE.OPF;
		}

		if(extension === "json"){
			return INPUT_TYPE.MANIFEST;
		}
	}


	/**
	 * unpack the contents of the Packaging
	 * @private
	 * @param {document} packageXml XML Document
	 */
	unpack(packaging) {
		this.package = packaging;

		let url;
		let path = this.path.toString();
		if(this.archived) {
			url = new Url(path, "");
		} else if (this.url) {
			url = this.url.resolve(path);
		} else {
			url = new Url(path);
		}

		this.resources = new Resources(this.package.manifest, {
			archive: this.archive,
			url: url,
			load: this.load.bind(this),
			replacements: this.settings.replacements,
			inject: {
				script: this.settings.script,
				stylesheet: this.settings.stylesheet,
				identifer: this.package.metadata.identifier
			}
		});

		let processed = [];
		let crossdomain = url.origin !== location.origin;

		// If caches doesn't exist, use replacements instead
		if (typeof(caches) === "undefined") {
			this.settings.replacements = true;
			this.settings.cache = false;
		}

		// If we are using a worker and cache isn't set,
		// we should cache the resources if we can
		if (typeof(this.settings.cache) === "undefined" &&
				this.settings.worker) {
			this.settings.cache = true;
		}

		// If the resource is Cross Domain, and we aren't using cache then
		// replacements are needed.
		if ((crossdomain || this.archived ) &&
				!this.settings.worker &&
				!this.settings.cache &&
				typeof(this.settings.replacements) === "undefined") {
			this.settings.replacements = true;
		}

		if (this.settings.cache && typeof(caches) != "undefined") {

			let uriComponent;
			let cached;
			let key;

			if (this.archived) {
				uriComponent = encodeURIComponent(this.locationUrl.toString());
				key = "epubjs-zip/";
				url = new Url(key + uriComponent + path, location.href);
				cached = this.resources.cache(key, url.toString());

				this.cacheUrl = url;
			} else if (crossdomain) {
				uriComponent = encodeURIComponent(this.locationUrl.origin);
				key = "epubjs-proxy/";
				url = new Url(key + uriComponent + path, location.href);
				cached = this.resources.cache(key, url.toString());

				this.cacheUrl = url;
			}

			// Wait for injection (not handled in service worker)
			if (this.settings.script || this.settings.stylesheet ) {
				processed.push(cached);
			}
		}

		if ( this.settings.replacements) {
			let replacements = this.resources.replacements();
			processed.push(replacements);
		}

		return Promise.all(processed).then(() => {
				return this.loadNavigation(this.package).then(() => {
					return this.navigation;
				});
			})
			.then(() => {
				this.isOpen = true;

				// Remove zip after cached
				// if (this.archive) {
				// 	this.archive.destroy();
				// }

				this.book = this.toBook();

				// Resolve book opened promise
				this.opening.resolve(this);

				return this.book;
			})
			.catch((err) => {
				console.error(err);
			});

	}

	cache(key, url, crossdomain) {
		if (!key) {
			key = this.key();
		}

		return this.resources.cache(key, url, crossdomain)
			.then(() => {
				this.book = this.toBook();
				return this.book;
			})
			.catch((err) => {
				console.error(err);
			});
	}

	replacements() {
		return this.resources.replacements()
			.then(() => {
				this.book = this.toBook();
				return this.book;
			})
			.catch((err) => {
				console.error(err);
			});
	}

	/**
	 * Load Navigation and PageList from package
	 * @private
	 * @param {document} opf XML Document
	 */
	loadNavigation(opf) {
		let navPath = opf.navPath || opf.ncxPath;
		let toc = opf.toc;

		if (!navPath) {
			return new Promise((resolve, reject) => {
				this.navigation = new Navigation(null);
				this.pageList = new PageList();

				resolve(this.navigation);
			});
		}

		return this.load(navPath, "xml")
			.then((xml) => {
				this.navigation = new Navigation(xml, this.resolve(navPath));
				this.pageList = new PageList(xml);
				return this.navigation;
			});
	}

	/**
	 * Set if request should use withCredentials
	 * @param {boolean} credentials
	 */
	setRequestCredentials(credentials) {
		this.settings.requestCredentials = credentials;
	}

	/**
	 * Set headers request should use
	 * @param {object} headers
	 */
	setRequestHeaders(headers) {
		this.settings.requestHeaders = headers;
	}

	/**
	 * Unarchive a zipped epub
	 * @private
	 * @param  {binary} input epub data
	 * @param  {string} [encoding]
	 * @return {Archive}
	 */
	unarchive(input, encoding) {
		this.archive = new Archive();
		return this.archive.open(input, encoding);
	}

	generateLocations(breakPoint) {
		if (!this.book) {
			return;
		}
		if (!this.locations) {
			this.locations = new Locations();
		}
		return this.locations.generate(this.book.sections, breakPoint)
			.then((locations) => {
				book.locations = locations;
				return locations;
			})
	}

	loadLocations(json) {
		let locations;
		if (!this.book) {
			return;
		}

		if (!this.locations) {
			this.locations = new Locations();
		}

		if (typeof locations === "string") {
			locations = JSON.parse(json);
		} else {
			locations = json;
		}

		this.book.locations = locations;

		return locations;
	}

	/**
	 * Generates the Book Key using the identifer in the manifest or other string provided
	 * @param  {string} [identifier] to use instead of metadata identifier
	 * @return {string} key
	 */
	key(identifier) {
		var ident = identifier || this.package.metadata.identifier || this.url.filename;
		return `epubjs-${EPUBJS_VERSION}-${ident}`;
	}

	toBook() {
		let resolver = this.resources.resolve.bind(this.resources);

		let book = new Book();

		book.url = "";

		if (this.cacheUrl) {
			book.url = this.cacheUrl.resolve("manifest.json");
		} else if (true) {
			book.url = this.locationUrl.resolve("manifest.json")
		} else {
			book.url = new Url("manifest.json").toString();
		}

		if (this.archived) {
			book.source = this.locationUrl.toString();
		}

		book.resources = this.resources.toArray();

		book.spine = this.package.spine.map( (item, index) => {
			let resource = this.resources.get(item.idref) || item;
			let url = this.resources.resolve(resource.href);

			// Remove from resources array
			let i = book.resources.indexOf(resource);
			book.resources.splice(i, 1);

			item.index = index;
			item.cfiBase = new EpubCFI().generateChapterComponent(this.package.spineNodeIndex, item.index, item.idref);

			if(resource) {
				item.source = resource.href;
				item.href = url;
				item.type = resource.type;

				if(resource.properties && resource.properties.length){
					item.properties.push.apply(item.properties, resource.properties);
				}
			}

			return item;
		});

		book.metadata = this.package.metadata;

		if (this.navigation) {
			book.toc = this.navigation.getTocArray(resolver);
			book.landmarks = this.navigation.getLandmarksArray(resolver);
		}

		if (this.pageList) {
			book.pages = this.pageList.toArray();
		}

		if (this.locations) {
			book.locations = this.locations.toArray();
		}

		return book;
	}

	/**
	 * Destroy the Book and all associated objects
	 */
	destroy() {
		this.opened = undefined;
		this.loading = undefined;
		this.loaded = undefined;
		this.ready = undefined;

		this.isOpen = false;
		this.isRendered = false; //TODO: ?

		this.book && this.book.destroy();
		this.locations && this.locations.destroy();
		this.pageList && this.pageList.destroy();
		this.archive && this.archive.destroy();
		this.resources && this.resources.destroy();
		this.container && this.container.destroy();
		this.packaging && this.packaging.destroy();

		this.spine = undefined;
		this.locations = undefined;
		this.pageList = undefined;
		this.archive = undefined;
		this.resources = undefined;
		this.container = undefined;
		this.packaging = undefined;

		this.navigation = undefined;
		this.url = undefined;
		this.path = undefined;
		this.archived = false;

	}
}

EventEmitter(Epub.prototype);

export default Epub;
