EPUBJS.reader = {};
EPUBJS.reader.plugins = {}; //-- Attach extra Controllers as plugins (like search?)

(function(root) {

	var previousReader = root.ePubReader || {};

	var ePubReader = root.ePubReader = function(path, options) {
		return new EPUBJS.Reader(path, options);
	};

	_.extend(ePubReader, {
		noConflict : function() {
			root.ePubReader = previousReader;
			return this;
		}
	});

	//exports to multiple environments
	if (typeof define === 'function' && define.amd)
	//AMD
	define(function(){ return Reader; });
	else if (typeof module != "undefined" && module.exports)
	//Node
	module.exports = ePubReader;

})(window);

EPUBJS.Reader = function(path, _options) {
	var reader = this;
	var book;
	
	this.settings = _.defaults(_options || {}, {
		restore: true,
		bookmarks: null
	});
	
	this.setBookKey(path); //-- This could be username + path or any unique string
	
	if(this.settings.restore && this.isSaved()) {
		this.applySavedSettings();
	}
	
	this.book = book = new EPUBJS.Book({
		bookPath: path,
		restore: this.settings.restore
	});
	
	if(this.settings.previousLocationCfi) {
		book.gotoCfi(this.settings.previousLocationCfi);
	}
	
	this.offline = false;
	this.sidebarOpen = false;
	if(!this.settings.bookmarks) {
		this.settings.bookmarks = [];
	}

	book.renderTo("viewer");
	
	reader.ReaderController = EPUBJS.reader.ReaderController.call(reader, book);
	reader.SettingsController = EPUBJS.reader.SettingsController.call(reader, book);
	reader.ControlsController = EPUBJS.reader.ControlsController.call(reader, book);
	reader.SidebarController = EPUBJS.reader.SidebarController.call(reader, book);
	reader.BookmarksController = EPUBJS.reader.BookmarksController.call(reader, book);
	
	// Call Plugins
	for(var plugin in EPUBJS.reader.plugins) {
		if(EPUBJS.reader.plugins.hasOwnProperty(plugin)) {
			reader[plugin] = EPUBJS.reader.plugins[plugin].call(reader, book);
		}
	}
	
	book.ready.all.then(function() {
		reader.ReaderController.hideLoader();
	});

	book.getMetadata().then(function(meta) {
		reader.MetaController = EPUBJS.reader.MetaController.call(reader, meta);
	});

	book.getToc().then(function(toc) {
		reader.TocController = EPUBJS.reader.TocController.call(reader, toc);
	});
	
	window.addEventListener("beforeunload", this.unload.bind(this), false);
	
	return this;
};

EPUBJS.Reader.prototype.addBookmark = function(cfi) {
	var present = this.isBookmarked(cfi);
	if(present > -1 ) return;

	this.settings.bookmarks.push(cfi);
	
	this.trigger("reader:bookmarked", cfi);
};

EPUBJS.Reader.prototype.removeBookmark = function(cfi) {
	var bookmark = this.isBookmarked(cfi);
	if( bookmark === -1 ) return;
	
	delete this.settings.bookmarks[bookmark];
	
	this.trigger("reader:unbookmarked", bookmark);
};

EPUBJS.Reader.prototype.isBookmarked = function(cfi) {
	var bookmarks = this.settings.bookmarks;
	
	return bookmarks.indexOf(cfi);
};

/*
EPUBJS.Reader.prototype.searchBookmarked = function(cfi) {
	var bookmarks = this.settings.bookmarks,
			len = bookmarks.length;
	
	for(var i = 0; i < len; i++) {
		if (bookmarks[i]['cfi'] === cfi) return i;
	}
	return -1;
};
*/

EPUBJS.Reader.prototype.clearBookmarks = function() {
	this.settings.bookmarks = [];
};

//-- Settings
EPUBJS.Reader.prototype.setBookKey = function(identifier){
	if(!this.settings.bookKey) {
		this.settings.bookKey = "epubjsreader:" + EPUBJS.VERSION + ":" + window.location.host + ":" + identifier;
	}
	return this.settings.bookKey;
};

//-- Checks if the book setting can be retrieved from localStorage
EPUBJS.Reader.prototype.isSaved = function(bookPath) {
	var storedSettings = localStorage.getItem(this.settings.bookKey);

	if( !localStorage ||
		storedSettings === null) {
		return false;
	} else {
		return true;
	}
};

EPUBJS.Reader.prototype.removeSavedSettings = function() {
	localStorage.removeItem(this.settings.bookKey);
};

EPUBJS.Reader.prototype.applySavedSettings = function() {
		var stored = JSON.parse(localStorage.getItem(this.settings.bookKey));
		
		if(stored) {
			this.settings = _.defaults(this.settings, stored);
			return true;
		} else {
			return false;
		}
};

EPUBJS.Reader.prototype.saveSettings = function(){
	if(this.book) {
		this.settings.previousLocationCfi = this.book.getCurrentLocationCfi();
	}

	localStorage.setItem(this.settings.bookKey, JSON.stringify(this.settings));
};

EPUBJS.Reader.prototype.unload = function(){
	if(this.settings.restore) {
		this.saveSettings();
	}
};

//-- Enable binding events to reader
RSVP.EventTarget.mixin(EPUBJS.Reader.prototype);