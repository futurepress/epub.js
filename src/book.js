var RSVP = require('rsvp');
var core = require('./core');
var Spine = require('./spine');
var Locations = require('./locations');
var Parser = require('./parser');
var Navigation = require('./navigation');
var Rendition = require('./rendition');
var Continuous = require('./continuous');
var Paginate = require('./paginate');
var Unarchive = require('./unarchive');
var request = require('./request');

function Book(_url, options){
  // Promises
  this.opening = new RSVP.defer();
  this.opened = this.opening.promise;
  this.isOpen = false;

  this.url = undefined;

  this.loading = {
    manifest: new RSVP.defer(),
    spine: new RSVP.defer(),
    metadata: new RSVP.defer(),
    cover: new RSVP.defer(),
    navigation: new RSVP.defer(),
    pageList: new RSVP.defer()
  };

  this.loaded = {
    manifest: this.loading.manifest.promise,
    spine: this.loading.spine.promise,
    metadata: this.loading.metadata.promise,
    cover: this.loading.cover.promise,
    navigation: this.loading.navigation.promise,
    pageList: this.loading.pageList.promise
  };

  this.ready = RSVP.hash(this.loaded);

  // Queue for methods used before opening
  this.isRendered = false;
  // this._q = core.queue(this);

  this.request = this.requestMethod.bind(this);

  this.spine = new Spine(this.request);
  this.locations = new Locations(this.spine, this.request);

  if(_url) {
    this.open(_url);
  }
};

Book.prototype.open = function(_url){
  var uri;
  var parse = new Parser();
  var epubPackage;
  var epubContainer;
  var book = this;
  var containerPath = "META-INF/container.xml";
  var location;

  if(!_url) {
    this.opening.resolve(this);
    return this.opened;
  }

  // Reuse parsed url or create a new uri object
  if(typeof(_url) === "object") {
    uri = _url;
  } else {
    uri = core.uri(_url);
  }

  this.url = uri.href;

  // Find path to the Container
  if(uri.extension === "opf") {
    // Direct link to package, no container
    this.packageUrl = uri.href;
    this.containerUrl = '';

    if(uri.origin) {
      this.baseUrl = uri.base;
    } else if(window){
      location = core.uri(window.location.href);
      this.baseUrl = core.resolveUrl(location.base, uri.directory);
    } else {
      this.baseUrl = uri.directory;
    }

    epubPackage = this.request(this.packageUrl);

  } else if(this.isArchived(uri)) {
    // Book is archived
    this.containerUrl = containerPath;
    this.url = '';

    epubContainer = this.unarchive(uri.href).
      then(function() {
        return this.request(this.containerUrl);
      }.bind(this));

  }
  // Find the path to the Package from the container
  else if (!uri.extension) {

    this.containerUrl = this.url + containerPath;

    epubContainer = this.request(this.containerUrl);
  }

  if (epubContainer) {
    epubPackage = epubContainer.
      then(function(containerXml){
        return parse.container(containerXml); // Container has path to content
      }).
      then(function(paths){
        var packageUri = core.uri(paths.packagePath);
        book.packageUrl = book.url + paths.packagePath;
        book.encoding = paths.encoding;

        // Set Url relative to the content
        if(packageUri.origin) {
          book.baseUrl = packageUri.base;
        } else if(window && book.url){
          location = core.uri(window.location.href);
          book.baseUrl = core.resolveUrl(location.base, book.url + packageUri.directory);
        } else {
          book.baseUrl = packageUri.directory;
        }

        return book.request(book.packageUrl);
      }).catch(function(error) {
        // handle errors in either of the two requests
        console.error("Could not load book at: " + (this.packageUrl || this.containerPath));
        book.trigger("book:loadFailed", (this.packageUrl || this.containerPath));
        book.opening.reject(error);
      });
  }


  epubPackage.then(function(packageXml) {
    // Get package information from epub opf
    book.unpack(packageXml);

    // Resolve promises
    book.loading.manifest.resolve(book.package.manifest);
    book.loading.metadata.resolve(book.package.metadata);
    book.loading.spine.resolve(book.spine);
    book.loading.cover.resolve(book.cover);

    book.isOpen = true;

    // Clear queue of any waiting book request

    // Resolve book opened promise
    book.opening.resolve(book);

  }).catch(function(error) {
    // handle errors in parsing the book
    console.error(error.message, error.stack);
    book.opening.reject(error);
  });

  return this.opened;
};

Book.prototype.unpack = function(packageXml){
  var book = this,
      parse = new Parser();

  book.package = parse.packageContents(packageXml); // Extract info from contents
  book.package.baseUrl = book.baseUrl; // Provides a url base for resolving paths

  this.spine.load(book.package);

  book.navigation = new Navigation(book.package, this.request);
  book.navigation.load().then(function(toc){
    book.toc = toc;
    book.loading.navigation.resolve(book.toc);
  });

  // //-- Set Global Layout setting based on metadata
  // MOVE TO RENDER
  // book.globalLayoutProperties = book.parseLayoutProperties(book.package.metadata);

  book.cover = book.baseUrl + book.package.coverPath;
};

// Alias for book.spine.get
Book.prototype.section = function(target) {
  return this.spine.get(target);
};

// Sugar to render a book
Book.prototype.renderTo = function(element, options) {
  var renderMethod = (options && options.method) ?
      options.method :
      "rendition";
  var Renderer = require('./'+renderMethod);

  this.rendition = new Renderer(this, options);
  this.rendition.attachTo(element);
  return this.rendition;
};

Book.prototype.requestMethod = function(_url) {
  // Switch request methods
  if(this.archive) {
    return this.archive.request(_url);
  } else {
    return request(_url, null, this.requestCredentials, this.requestHeaders);
  }

};

Book.prototype.setRequestCredentials = function(_credentials) {
  this.requestCredentials = _credentials;
};

Book.prototype.setRequestHeaders = function(_headers) {
  this.requestHeaders = _headers;
};

Book.prototype.unarchive = function(bookUrl){
	this.archive = new Unarchive();
	return this.archive.open(bookUrl);
};

//-- Checks if url has a .epub or .zip extension, or is ArrayBuffer (of zip/epub)
Book.prototype.isArchived = function(bookUrl){
  var uri;

  if (bookUrl instanceof ArrayBuffer) {
		return true;
	}

  // Reuse parsed url or create a new uri object
  if(typeof(bookUrl) === "object") {
    uri = bookUrl;
  } else {
    uri = core.uri(bookUrl);
  }

	if(uri.extension && (uri.extension == "epub" || uri.extension == "zip")){
		return true;
	}

	return false;
};

//-- Returns the cover
Book.prototype.coverUrl = function(){
	var retrieved = this.loaded.cover
		.then(function(url) {
			if(this.archive) {
				return this.archive.createUrl(this.cover);
			}else{
				return this.cover;
			}
		}.bind(this));



	return retrieved;
};
module.exports = Book;

//-- Enable binding events to book
RSVP.EventTarget.mixin(Book.prototype);

//-- Handle RSVP Errors
RSVP.on('error', function(event) {
  console.error(event);
});

RSVP.configure('instrument', true); //-- true | will logging out all RSVP rejections
// RSVP.on('created', listener);
// RSVP.on('chained', listener);
// RSVP.on('fulfilled', listener);
RSVP.on('rejected', function(event){
  console.error(event.detail.message, event.detail.stack);
});
