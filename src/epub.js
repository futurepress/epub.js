import Book from "./book/book";
import Rendition from "./rendition/rendition";
import EpubCFI from "./utils/epubcfi";
import Contents from "./rendition/contents";
import * as core from "./utils/core";
import "../libs/url/url-polyfill";

import IframeView from "./managers/views/iframe";
import DefaultViewManager from "./managers/default";
import ContinuousViewManager from "./managers/continuous";

import Bridge from './book/bridge.js';

class Epub {
	constructor(url, options) {
		// super(url, options);

		this.rendition = undefined;


		if(options.worker) {
			let bridge = new Bridge(options.worker);
			bridge.open(url, options);

			this.ready = bridge.ready.then((obj) => {
				this.manifest = obj;
				return this.manifest;
			});
		} else {
			let book = new Book(url, options);

			this.ready = book.ready.then((obj) => {
				this.manifest = obj;
				return this.manifest;
			});
		}
	}

	/**
	 * Sugar to render a book to an element
	 * @param  {element | string} element element or string to add a rendition to
	 * @param  {object} [options]
	 * @return {Rendition}
	 */
	renderTo(element, options) {

		this.rendition = new Rendition(null, options);
		this.rendition.attachTo(element);

		this.ready.then((object) => {
			this.rendition.load(object);
		});

		return this.rendition;
	}

	destroy() {
		// super.destroy();
		this.book && this.book.destroy();
		this.bridge && this.bridge.destroy();
		this.rendition && this.rendition.destroy();
	}
}

/**
 * Creates a new Book
 * @param {string|ArrayBuffer} url URL, Path or ArrayBuffer
 * @param {object} options to pass to the book
 * @returns {Book} a new Book object
 * @example ePub("/path/to/book.epub", {})
 */
function ePub(url, options) {
	return new Epub(url, options);
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
