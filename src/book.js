import EventEmitter from "event-emitter";
// import path from "path";
import {extend, defer} from "./utils/core";
import Url from "./utils/url";
import Path from "./utils/path";
import Spine from "./spine";
import Locations from "./locations";
import Container from "./container";
import Packaging from "./packaging";
import Navigation from "./navigation";
import Resources from "./resources";
import PageList from "./pagelist";
import Rendition from "./rendition";
import Archive from "./archive";
import request from "./utils/request";
import EpubCFI from "./epubcfi";

const CONTAINER_PATH = "META-INF/container.xml";
const EPUBJS_VERSION = "0.3";

/**
 * Creates a new Book
 * @class
 * @param {string} url
 * @param {object} options
 * @param {method} options.requestMethod a request function to use instead of the default
 * @param {boolean} [options.requestCredentials=undefined] send the xhr request withCredentials
 * @param {object} [options.requestHeaders=undefined] send the xhr request headers
 * @param {string} [options.encoding=binary] optional to pass 'binary' or base64' for archived Epubs
 * @param {string} [options.replacements=none] use base64, blobUrl, or none for replacing assets in archived Epubs
 * @returns {Book}
 * @example new Book("/path/to/book.epub", {})
 * @example new Book({ replacements: "blobUrl" })
 */
class Book {
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
			replacements: undefined
		});

		extend(this.settings, options);


		// Promises
		this.opening = new defer();
		/**
		 * @property {promise} opened returns after the book is loaded
		 */
		this.opened = this.opening.promise;
		this.isOpen = false;

		this.loading = {
			manifest: new defer(),
			spine: new defer(),
			metadata: new defer(),
			cover: new defer(),
			navigation: new defer(),
			pageList: new defer(),
			resources: new defer()
		};

		this.loaded = {
			manifest: this.loading.manifest.promise,
			spine: this.loading.spine.promise,
			metadata: this.loading.metadata.promise,
			cover: this.loading.cover.promise,
			navigation: this.loading.navigation.promise,
			pageList: this.loading.pageList.promise,
			resources: this.loading.resources.promise
		};

		// this.ready = RSVP.hash(this.loaded);
		/**
		 * @property {promise} ready returns after the book is loaded and parsed
		 * @private
		 */
		this.ready = Promise.all([
			this.loaded.manifest,
			this.loaded.spine,
			this.loaded.metadata,
			this.loaded.cover,
			this.loaded.navigation,
			this.loaded.resources
		]);


		// Queue for methods used before opening
		this.isRendered = false;
		// this._q = queue(this);

		/**
		 * @property {method} request
		 * @private
		 */
		this.request = this.settings.requestMethod || request;

		/**
		 * @property {Spine} spine
		 */
		this.spine = new Spine();

		/**
		 * @property {Locations} locations
		 */
		this.locations = new Locations(this.spine, this.load.bind(this));

		/**
		 * @property {Navigation} navigation
		 */
		this.navigation = undefined;

		/**
		 * @property {PageList} pagelist
		 */
		this.pageList = new PageList();

		/**
		 * @property {Url} url
		 * @private
		 */
		this.url = undefined;

		/**
		 * @property {Path} path
		 * @private
		 */
		this.path = undefined;

		/**
		 * @property {boolean} archived
		 * @private
		 */
		this.archived = false;

		/**
		 * @property {Archive} archive
		 * @private
		 */
		this.archive = undefined;

		/**
		 * @property {Resources} resources
		 * @private
		 */
		this.resources = undefined;

		/**
		 * @property {Rendition} rendition
		 * @private
		 */
		this.rendition = undefined;

		this.container = undefined;
		this.packaging = undefined;
		this.toc = undefined;

		if(url) {
			this.open(url).catch((error) => {
				var err = new Error("Cannot load book at "+ url );
				// console.error(err);
				this.emit("openFailed", err);
			});
		}
	}

	/**
	 * Open a epub or url
	 * @param {string} input URL, Path or ArrayBuffer
	 * @param {string} [what] to force opening
	 * @returns {Promise} of when the book has been loaded
	 * @example book.open("/path/to/book.epub")
	 */
	open(input, what) {
		var opening;
		var type = what || this.determineType(input);

		if (type === "binary") {
			this.archived = true;
			this.url = new Url("/", "");
			opening = this.openEpub(input);
		} else if (type === "base64") {
			this.archived = true;
			this.url = new Url("/", "");
			opening = this.openEpub(input, type);
		} else if (type === "epub") {
			this.archived = true;
			this.url = new Url("/", "");
			opening = this.request(input, "binary")
				.then(this.openEpub.bind(this));
		} else if(type == "opf") {
			this.url = new Url(input);
			opening = this.openPackaging(this.url.Path.toString());
		} else if(type == "json") {
			this.url = new Url(input);
			opening = this.openManifest(this.url.Path.toString());
		} else {
			this.url = new Url(input);
			opening = this.openContainer(CONTAINER_PATH)
				.then(this.openPackaging.bind(this));
		}

		return opening;
	}

	/**
	 * Open an archived epub
	 * @private
	 * @param  {binary} data
	 * @param  {[string]} encoding
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
				return this.unpack(this.packaging);
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
				return this.unpack(this.packaging);
			});
	}

	/**
	 * Load a resource from the Book
	 * @param  {string} path path to the resource to load
	 * @return {Promise}     returns a promise with the requested resource
	 */
	load(path) {
		var resolved;

		if(this.archived) {
			resolved = this.resolve(path);
			return this.archive.request(resolved);
		} else {
			resolved = this.resolve(path);
			return this.request(resolved, null, this.settings.requestCredentials, this.settings.requestHeaders);
		}
	}

	/**
	 * Resolve a path to it's absolute position in the Book
	 * @param  {string} path
	 * @param  {[boolean]} absolute force resolving the full URL
	 * @return {string}          the resolved path string
	 */
	resolve(path, absolute) {
		if (!path) {
			return;
		}
		var resolved = path;
		var isAbsolute = (path.indexOf("://") > -1);

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
			return "base64";
		}

		if(typeof(input) != "string") {
			return "binary";
		}

		url = new Url(input);
		path = url.path();
		extension = path.extension;

		if (!extension) {
			return "directory";
		}

		if(extension === "epub"){
			return "epub";
		}

		if(extension === "opf"){
			return "opf";
		}

		if(extension === "json"){
			return "json";
		}
	}


	/**
	 * unpack the contents of the Books packageXml
	 * @private
	 * @param {document} packageXml XML Document
	 */
	unpack(opf) {
		this.package = opf;

		this.spine.unpack(this.package, this.resolve.bind(this));

		this.resources = new Resources(this.package.manifest, {
			archive: this.archive,
			resolver: this.resolve.bind(this),
			request: this.request.bind(this),
			replacements: this.settings.replacements || "base64"
		});

		this.loadNavigation(this.package).then(() => {
			this.toc = this.navigation.toc;
			this.loading.navigation.resolve(this.navigation);
		});

		if (this.package.coverPath) {
			this.cover = this.resolve(this.package.coverPath);
		}
		// Resolve promises
		this.loading.manifest.resolve(this.package.manifest);
		this.loading.metadata.resolve(this.package.metadata);
		this.loading.spine.resolve(this.spine);
		this.loading.cover.resolve(this.cover);
		this.loading.resources.resolve(this.resources);
		this.loading.pageList.resolve(this.pageList);

		this.isOpen = true;

		if(this.archived || this.settings.replacements && this.settings.replacements != "none") {
			this.replacements().then(() => {
				this.opening.resolve(this);
			})
			.catch((err) => {
				console.error(err);
			});
		} else {
			// Resolve book opened promise
			this.opening.resolve(this);
		}

	}

	/**
	 * Load Navigation and PageList from package
	 * @private
	 * @param {document} opf XML Document
	 */
	loadNavigation(opf) {
		let navPath = opf.navPath || opf.ncxPath;
		let toc = opf.toc;

		if (toc) {
			return new Promise((resolve, reject) => {
				this.navigation = new Navigation(toc);

				this.pageList = new PageList(); // TODO: handle page lists

				resolve(this.navigation);
			});
		}

		if (!navPath) {
			return new Promise((resolve, reject) => {
				this.navigation = new Navigation();
				this.pageList = new PageList();

				resolve(this.navigation);
			});
		}

		return this.load(navPath, "xml")
			.then((xml) => {
				this.navigation = new Navigation(xml);
				this.pageList = new PageList(xml);
				return this.navigation;
			});
	}

	/**
	 * Alias for book.spine.get
	 * @param {string} target
	 */
	section(target) {
		return this.spine.get(target);
	}

	/**
	 * Sugar to render a book
	 * @param  {element} element element to add the views to
	 * @param  {[object]} options
	 * @return {Rendition}
	 */
	renderTo(element, options) {
		// var renderMethod = (options && options.method) ?
		//     options.method :
		//     "single";

		this.rendition = new Rendition(this, options);
		this.rendition.attachTo(element);

		return this.rendition;
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
	 * @param  {[string]} encoding
	 * @return {Archive}
	 */
	unarchive(input, encoding) {
		this.archive = new Archive();
		return this.archive.open(input, encoding);
	}

	/**
	 * Get the cover url
	 * @return {string} coverUrl
	 */
	coverUrl() {
		var retrieved = this.loaded.cover.
			then((url) => {
				if(this.archived) {
					// return this.archive.createUrl(this.cover);
					return this.resources.get(this.cover);
				}else{
					return this.cover;
				}
			});



		return retrieved;
	}

	/**
	 * load replacement urls
	 * @private
	 * @return {Promise} completed loading urls
	 */
	replacements() {
		this.spine.hooks.serialize.register((output, section) => {
			section.output = this.resources.substitute(output, section.url);
		});

		return this.resources.replacements().
			then(() => {
				return this.resources.replaceCss();
			});
	}

	/**
	 * Find a DOM Range for a given CFI Range
	 * @param  {EpubCFI} cfiRange a epub cfi range
	 * @return {Range}
	 */
	getRange(cfiRange) {
		var cfi = new EpubCFI(cfiRange);
		var item = this.spine.get(cfi.spinePos);
		var _request = this.load.bind(this);
		if (!item) {
			return new Promise((resolve, reject) => {
				reject("CFI could not be found");
			});
		}
		return item.load(_request).then(function (contents) {
			var range = cfi.toRange(item.document);
			return range;
		});
	}

	/**
	 * Generates the Book Key using the identifer in the manifest or other string provided
	 * @param  {[string]} identifier to use instead of metadata identifier
	 * @return {string} key
	 */
	key(identifier) {
		var ident = identifier || this.package.metadata.identifier || this.url.filename;
		return `epubjs:${EPUBJS_VERSION}:${ident}`;
	}

	destroy() {
		this.opened = undefined;
		this.loading = undefined;
		this.loaded = undefined;
		this.ready = undefined;

		this.isOpen = false;
		this.isRendered = false;

		this.spine && this.spine.destroy();
		this.locations && this.locations.destroy();
		this.pageList && this.pageList.destroy();
		this.archive && this.archive.destroy();
		this.resources && this.resources.destroy();
		this.container && this.container.destroy();
		this.packaging && this.packaging.destroy();
		this.rendition && this.rendition.destroy();

		this.spine = undefined;
		this.locations = undefined;
		this.pageList = undefined;
		this.archive = undefined;
		this.resources = undefined;
		this.container = undefined;
		this.packaging = undefined;
		this.rendition = undefined;

		this.navigation = undefined;
		this.url = undefined;
		this.path = undefined;
		this.archived = false;
		this.toc = undefined;
	}

}

//-- Enable binding events to book
EventEmitter(Book.prototype);

export default Book;
