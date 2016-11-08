var EventEmitter = require('event-emitter');
var path = require('path');
var core = require('./core');
var Url = require('./core').Url;
var Path = require('./core').Path;
var Spine = require('./spine');
var Locations = require('./locations');
var Parser = require('./parser');
var Container = require('./container');
var Packaging = require('./packaging');
var Navigation = require('./navigation');
var Rendition = require('./rendition');
var Unarchive = require('./unarchive');
var request = require('./request');
var EpubCFI = require('./epubcfi');

// Const
var CONTAINER_PATH = "META-INF/container.xml";

/**
 * Creates a new Book
 * @class
 * @param {string} _url
 * @param {object} options
 * @param {method} options.requestMethod a request function to use instead of the default
 * @returns {Book}
 * @example new Book("/path/to/book.epub", {})
 */
function Book(url, options){

	this.settings = core.extend(this.settings || {}, {
		requestMethod: this.requestMethod,
		requestCredentials: undefined,
		encoding: undefined // optional to pass 'binary' or base64' for archived Epubs
	});

	core.extend(this.settings, options);


	// Promises
	this.opening = new core.defer();
	/**
	 * @property {promise} opened returns after the book is loaded
	 */
	this.opened = this.opening.promise;
	this.isOpen = false;

	this.loading = {
		manifest: new core.defer(),
		spine: new core.defer(),
		metadata: new core.defer(),
		cover: new core.defer(),
		navigation: new core.defer(),
		pageList: new core.defer()
	};

	this.loaded = {
		manifest: this.loading.manifest.promise,
		spine: this.loading.spine.promise,
		metadata: this.loading.metadata.promise,
		cover: this.loading.cover.promise,
		navigation: this.loading.navigation.promise,
		pageList: this.loading.pageList.promise
	};

	// this.ready = RSVP.hash(this.loaded);
	/**
	 * @property {promise} ready returns after the book is loaded and parsed
	 */
	this.ready = Promise.all([this.loaded.manifest,
														this.loaded.spine,
														this.loaded.metadata,
														this.loaded.cover,
														this.loaded.navigation,
														this.loaded.pageList ]);


	// Queue for methods used before opening
	this.isRendered = false;
	// this._q = core.queue(this);

	/**
	 * @property {method} request
	 */
	this.request = this.settings.requestMethod || request;

	/**
	 * @property {Spine} spine
	 */
	this.spine = new Spine();

	/**
	 * @property {Locations} locations
	 */
	this.locations = new Locations(this.spine, this.load);

	/**
	 * @property {Navigation} navigation
	 */
	this.navigation = undefined;

	this.url = undefined;
	this.path = undefined;

	this.archived = false;

	if(url) {
		this.open(url).catch(function (error) {
			var err = new Error("Cannot load book at "+ url );
			console.error(err);
			console.error(error);

			this.emit("openFailed", err);
		}.bind(this));
	}
};

/**
 * open a url
 * @param {string} input URL, Path or ArrayBuffer
 * @param {string} [what] to force opening
 * @returns {Promise} of when the book has been loaded
 * @example book.open("/path/to/book.epub")
 */
Book.prototype.open = function(input, what){
	var opening;
	var type = what || this.determineType(input);

	if (type === "binary") {
		this.archived = true;
		opening = this.openEpub(input);
	} else if (type === "epub") {
		this.archived = true;
		opening = this.request(input, 'binary')
			.then(function(epubData) {
				return this.openEpub(epubData);
			}.bind(this));
	} else if(type == "opf") {
		this.url = new Url(input);
		opening = this.openPackaging(input);
	} else {
		this.url = new Url(input);
		opening = this.openContainer(CONTAINER_PATH)
			.then(function(packagePath) {
				return this.openPackaging(packagePath);
			}.bind(this))
	}

	return opening;
};

Book.prototype.openEpub = function(data, encoding){
	return this.unarchive(data, encoding || this.settings.encoding)
		.then(function() {
			return this.openContainer("/" + CONTAINER_PATH);
		}.bind(this))
		.then(function(packagePath) {
			return this.openPackaging("/" + packagePath);
		}.bind(this));
};

Book.prototype.openContainer = function(url){
	return this.load(url)
		.then(function(xml) {
			this.container = new Container(xml);
			return this.container.packagePath;
		}.bind(this));
};

Book.prototype.openPackaging = function(url){
	var packageUrl;
	this.path = new Path(url);

	return this.load(url)
		.then(function(xml) {
			this.packaging = new Packaging(xml);
			return this.unpack(this.packaging);
		}.bind(this));
};

Book.prototype.load = function (path) {
	var resolved;
	if(this.unarchived) {
		resolved = this.resolve(path);
		return this.unarchived.request(resolved);
	} else {
		resolved = this.resolve(path);
		return this.request(resolved, null, this.requestCredentials, this.requestHeaders);
	}
};

Book.prototype.resolve = function (path, absolute) {
	var resolved = path;
	var isAbsolute = (path.indexOf('://') > -1);

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

Book.prototype.determineType = function(input) {
	var url;
	var path;
	var extension;

	if (typeof(input) != "string") {
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
};


/**
 * unpack the contents of the Books packageXml
 * @param {document} packageXml XML Document
 */
Book.prototype.unpack = function(opf){
	this.package = opf;

	this.spine.unpack(this.package, this.resolve.bind(this));

	this.loadNavigation(this.package).then(function(toc){
		this.toc = toc;
		this.loading.navigation.resolve(this.toc);
	}.bind(this));

	this.cover = this.resolve(this.package.coverPath);

	// Resolve promises
	this.loading.manifest.resolve(this.package.manifest);
	this.loading.metadata.resolve(this.package.metadata);
	this.loading.spine.resolve(this.spine);
	this.loading.cover.resolve(this.cover);

	this.isOpen = true;

	// Resolve book opened promise
	this.opening.resolve(this);
};

Book.prototype.loadNavigation = function(opf){
	var navPath = opf.navPath || opf.ncxPath;

	if (!navPath) {
		return;
	}

	return this.load(navPath, 'xml')
		.then(function(xml) {
			this.navigation = new Navigation(xml);
		}.bind(this));
};

/**
 * Alias for book.spine.get
 * @param {string} target
 */
Book.prototype.section = function(target) {
	return this.spine.get(target);
};

/**
 * Sugar to render a book
 */
Book.prototype.renderTo = function(element, options) {
	// var renderMethod = (options && options.method) ?
	//     options.method :
	//     "single";

	this.rendition = new Rendition(this, options);
	this.rendition.attachTo(element);

	return this.rendition;
};


Book.prototype.setRequestCredentials = function(_credentials) {
	this.requestCredentials = _credentials;
};

Book.prototype.setRequestHeaders = function(_headers) {
	this.requestHeaders = _headers;
};

/**
 * Unarchive a zipped epub
 */
Book.prototype.unarchive = function(bookUrl, encoding){
	this.unarchived = new Unarchive();
	return this.unarchived.open(bookUrl, encoding);
};

/**
 * Checks if url has a .epub or .zip extension, or is ArrayBuffer (of zip/epub)
 */
Book.prototype.isArchivedUrl = function(bookUrl){
	var extension;

	if (bookUrl instanceof ArrayBuffer) {
		return true;
	}

	// Reuse parsed url or create a new uri object
	// if(typeof(bookUrl) === "object") {
	//   uri = bookUrl;
	// } else {
	//   uri = core.uri(bookUrl);
	// }
	// uri = URI(bookUrl);
	extension = core.extension(bookUrl);

	if(extension && (extension == "epub" || extension == "zip")){
		return true;
	}

	return false;
};

/**
 * Get the cover url
 */
Book.prototype.coverUrl = function(){
	var retrieved = this.loaded.cover.
		then(function(url) {
			if(this.unarchived) {
				return this.unarchived.createUrl(this.cover);
			}else{
				return this.cover;
			}
		}.bind(this));



	return retrieved;
};

/**
 * Find a DOM Range for a given CFI Range
 */
Book.prototype.range = function(cfiRange) {
	var cfi = new EpubCFI(cfiRange);
	var item = this.spine.get(cfi.spinePos);

	return item.load().then(function (contents) {
		var range = cfi.toRange(item.document);
		return range;
	})
};

//-- Enable binding events to book
EventEmitter(Book.prototype);

module.exports = Book;
