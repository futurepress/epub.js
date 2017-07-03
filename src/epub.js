import Book from "./book";
import EpubCFI from "./epubcfi";
import Rendition from "./rendition";
import Contents from "./contents";
import * as core from "./utils/core";
import '../libs/url/url-polyfill'

/**
 * Creates a new Book
 * @param {string|ArrayBuffer} url URL, Path or ArrayBuffer
 * @param {object} options to pass to the book
 * @returns {Book} a new Book object
 * @example ePub("/path/to/book.epub", {})
 */
function ePub(url, options) {
	return new Book(url, options);
}

ePub.VERSION = "0.3";

if (typeof(global) !== "undefined") {
	global.EPUBJS_VERSION = ePub.VERSION;
}

ePub.CFI = EpubCFI;
ePub.Rendition = Rendition;
ePub.Contents = Contents;
ePub.utils = core;

ePub.ViewManagers = {};
ePub.Views = {};
/**
 * register plugins
 */
ePub.register = {
	/**
	 * register a new view manager
	 */
	manager : function(name, manager){
		return ePub.ViewManagers[name] = manager;
	},
	/**
	 * register a new view
	 */
	view : function(name, view){
		return ePub.Views[name] = view;
	}
};

// Default Views
ePub.register.view("iframe", require("./managers/views/iframe"));

// Default View Managers
ePub.register.manager("default", require("./managers/default"));
ePub.register.manager("continuous", require("./managers/continuous"));

export default ePub;
