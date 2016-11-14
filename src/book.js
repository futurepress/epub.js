var EventEmitter = require('event-emitter');
var path = require('path');
var core = require('./core');
var Url = require('./core').Url;
var Path = require('./core').Path;
var Spine = require('./spine');
var Locations = require('./locations');
var Container = require('./container');
var Packaging = require('./packaging');
var Navigation = require('./navigation');
var Resources = require('./resources');
var PageList = require('./pagelist');
var Rendition = require('./rendition');
var Archive = require('./archive');
var request = require('./request');
var EpubCFI = require('./epubcfi');

// Const
var CONTAINER_PATH = "META-INF/container.xml";

/**
 * Creates a new Book
 * @class
 * @param {string} url
 * @param {object} options
 * @param {method} options.requestMethod a request function to use instead of the default
 * @param {boolean} [options.requestCredentials=undefined] send the xhr request withCredentials
 * @param {object} [options.requestHeaders=undefined] send the xhr request headers
 * @param {string} [options.encoding=binary] optional to pass 'binary' or base64' for archived Epubs
 * @param {string} [options.replacements=base64] use base64, blobs, or none for replacing assets in archived Epubs
 * @returns {Book}
 * @example new Book("/path/to/book.epub", {})
 */
function Book(url, options){

	this.settings = core.extend(this.settings || {}, {
		requestMethod: undefined,
		requestCredentials: undefined,
		requestHeaders: undefined,
		encoding: undefined,
		replacements: 'base64'
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
		pageList: new core.defer(),
		resources: new core.defer()
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
	this.ready = Promise.all([this.loaded.manifest,
														this.loaded.spine,
														this.loaded.metadata,
														this.loaded.cover,
														this.loaded.navigation,
														this.loaded.resources ]);


	// Queue for methods used before opening
	this.isRendered = false;
	// this._q = core.queue(this);

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
	this.locations = new Locations(this.spine, this.load);

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

	if(url) {
		this.open(url).catch(function (error) {
			var err = new Error("Cannot load book at "+ url );
			console.error(err);
			this.emit("openFailed", err);
			console.log(error);
		}.bind(this));
	}
};

/**
 * Open a epub or url
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
		this.url = new Url("/", "");
		opening = this.openEpub(input);
	} else if (type === "epub") {
		this.archived = true;
		this.url = new Url("/", "");
		opening = this.request(input, 'binary')
			.then(this.openEpub.bind(this));
	} else if(type == "opf") {
		this.url = new Url(input);
		opening = this.openPackaging(input);
	} else {
		this.url = new Url(input);
		opening = this.openContainer(CONTAINER_PATH)
			.then(this.openPackaging.bind(this));
	}

	return opening;
};

/**
 * Open an archived epub
 * @private
 * @param  {binary} data
 * @param  {[string]} encoding
 * @return {Promise}
 */
Book.prototype.openEpub = function(data, encoding){
	return this.unarchive(data, encoding || this.settings.encoding)
		.then(function() {
			return this.openContainer(CONTAINER_PATH);
		}.bind(this))
		.then(function(packagePath) {
			return this.openPackaging(packagePath);
		}.bind(this));
};

/**
 * Open the epub container
 * @private
 * @param  {string} url
 * @return {string} packagePath
 */
Book.prototype.openContainer = function(url){
	return this.load(url)
		.then(function(xml) {
			this.container = new Container(xml);
			return this.resolve(this.container.packagePath);
		}.bind(this));
};

/**
 * Open the Open Packaging Format Xml
 * @private
 * @param  {string} url
 * @return {Promise}
 */
Book.prototype.openPackaging = function(url){
	var packageUrl;
	this.path = new Path(url);

	return this.load(url)
		.then(function(xml) {
			this.packaging = new Packaging(xml);
			return this.unpack(this.packaging);
		}.bind(this));
};

/**
 * Load a resource from the Book
 * @param  {string} path path to the resource to load
 * @return {Promise}     returns a promise with the requested resource
 */
Book.prototype.load = function (path) {
	var resolved;
	if(this.archived) {
		resolved = this.resolve(path);
		return this.archive.request(resolved);
	} else {
		resolved = this.resolve(path);
		return this.request(resolved, null, this.settings.requestCredentials, this.settings.requestHeaders);
	}
};

/**
 * Resolve a path to it's absolute position in the Book
 * @param  {string} path
 * @param  {[boolean]} absolute force resolving the full URL
 * @return {string}          the resolved path string
 */
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

/**
 * Determine the type of they input passed to open
 * @private
 * @param  {string} input
 * @return {string}  binary | directory | epub | opf
 */
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
 * @private
 * @param {document} packageXml XML Document
 */
Book.prototype.unpack = function(opf){
	this.package = opf;

	this.spine.unpack(this.package, this.resolve.bind(this));

	this.resources = new Resources(this.package.manifest, {
		archive: this.archive,
		resolver: this.resolve.bind(this),
		replacements: this.settings.replacements
	});

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
	this.loading.resources.resolve(this.resources);
	this.loading.pageList.resolve(this.pageList);


	this.isOpen = true;

	if(this.archived) {
		this.replacements().then(function() {
			this.opening.resolve(this);
		}.bind(this));
	} else {
		// Resolve book opened promise
		this.opening.resolve(this);
	}

};

/**
 * Load Navigation and PageList from package
 * @private
 * @param {document} opf XML Document
 */
Book.prototype.loadNavigation = function(opf){
	var navPath = opf.navPath || opf.ncxPath;

	if (!navPath) {
		return;
	}

	return this.load(navPath, 'xml')
		.then(function(xml) {
			this.navigation = new Navigation(xml);
			this.pageList = new PageList(xml);
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
 * @param  {element} element element to add the views to
 * @param  {[object]} options
 * @return {Rendition}
 */
Book.prototype.renderTo = function(element, options) {
	// var renderMethod = (options && options.method) ?
	//     options.method :
	//     "single";

	this.rendition = new Rendition(this, options);
	this.rendition.attachTo(element);

	return this.rendition;
};

/**
 * Set if request should use withCredentials
 * @param {boolean} credentials
 */
Book.prototype.setRequestCredentials = function(credentials) {
	this.settings.requestCredentials = credentials;
};

/**
 * Set headers request should use
 * @param {object} headers
 */
Book.prototype.setRequestHeaders = function(headers) {
	this.settings.requestHeaders = headers;
};

/**
 * Unarchive a zipped epub
 * @private
 * @param  {binary} input epub data
 * @param  {[string]} encoding
 * @return {Archive}
 */
Book.prototype.unarchive = function(input, encoding){
	this.archive = new Archive();
	return this.archive.open(input, encoding);
};

/**
 * Get the cover url
 * @return {string} coverUrl
 */
Book.prototype.coverUrl = function(){
	var retrieved = this.loaded.cover.
		then(function(url) {
			if(this.archived) {
				// return this.archive.createUrl(this.cover);
				return this.resources.get(this.cover);
			}else{
				return this.cover;
			}
		}.bind(this));



	return retrieved;
};

/**
 * load replacement urls
 * @private
 * @return {Promise} completed loading urls
 */
Book.prototype.replacements = function(){
	this.spine.hooks.serialize.register(function(output, section) {
		section.output = this.resources.substitute(output, section.url);
	}.bind(this));

	return this.resources.replacements().
		then(function() {
			return this.resources.replaceCss();
		}.bind(this));
};

/**
 * Find a DOM Range for a given CFI Range
 * @param  {EpubCFI} cfiRange a epub cfi range
 * @return {Range}
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
