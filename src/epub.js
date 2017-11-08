import Book from "./book";
import Rendition from "./rendition";
import EpubCFI from "./epubcfi";
import Contents from "./contents";
import * as core from "./utils/core";
import '../libs/url/url-polyfill'

import IframeView from "./managers/views/iframe";
import DefaultViewManager from "./managers/default";
import ContinuousViewManager from "./managers/continuous";

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
 * Register Managers and Views
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
ePub.register.view("iframe", IframeView);

// Default View Managers
ePub.register.manager("default", DefaultViewManager);
ePub.register.manager("continuous", ContinuousViewManager);

export default ePub;
