import Epub from "./epub/epub";
import Book from "./book/book";
import Rendition from "./rendition/rendition";
import EpubCFI from "./utils/epubcfi";
import Contents from "./rendition/contents";
import * as core from "./utils/core";
import "../libs/url/url-polyfill";

import IframeView from "./managers/views/iframe";
import DefaultViewManager from "./managers/default";
import ContinuousViewManager from "./managers/continuous";

import Bridge from './epub/bridge.js';

/**
 * Creates a new Book or Book Bridge & Worker
 * @param {string|ArrayBuffer} url URL, Path or ArrayBuffer
 * @param {object} options to pass to the book
 * @returns {Book} a new Book object
 * @example ePub("/path/to/book.epub", {})
 */
// function ePub(url, options) {
// 	let epub;
//
// 	if (options && options.worker) {
// 		epub = new Bridge(url, options);
// 	} else {
// 		epub = new Epub(url, options);
// 	}
//
// 	/**
// 	 * Sugar to render a book to an element
// 	 * @param  {element | string} element element or string to add a rendition to
// 	 * @param  {object} [options]
// 	 * @return {Rendition}
// 	 */
// 	epub.renderTo = (element, options) => {
//
// 		epub.rendition = new Rendition(null, options);
// 		epub.rendition.attachTo(element);
//
// 		epub.ready.then((book) => {
// 			let manifest = book.toObject();
// 			epub.rendition.unpack(manifest);
// 		});
//
// 		return epub.rendition;
// 	}
//
// 	return epub;
// }

function ePub(url, options) {
	let epub;

	if (options && options.worker) {
		epub = new Bridge(url, options);
	} else {
		epub = new Epub(url, options);
	}

	return epub.ready.then((manifest) => {
		let book = new Book(manifest);

		/**
		 * Sugar to render a book to an element
		 * @param  {element | string} element element or string to add a rendition to
		 * @param  {object} [options]
		 * @return {Rendition}
		 */
		book.renderTo = (element, renditionOptions={}) => {

			if (options && typeof(options.worker) !== "undefined" &&
					renditionOptions && typeof(renditionOptions.worker) !== "undefined" ) {
				renditionOptions.worker = options.worker;
			}

			book.rendition = new Rendition(book.manifest, renditionOptions);
			book.rendition.attachTo(element);

			return book.rendition;
		}

		// epub.destroy();
		book.epub = epub;

		return book;
	});


	// return epub;
}

ePub.VERSION = "0.4";

if (typeof(global) !== "undefined") {
	global.EPUBJS_VERSION = ePub.VERSION;
}

ePub.CFI = EpubCFI;
ePub.Book = Book;
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
