import Book from "./book/book";
import Rendition from "./rendition/rendition";
import EpubCFI from "./utils/epubcfi";
import Contents from "./rendition/contents";
import * as core from "./utils/core";
import "../libs/url/url-polyfill";

import IframeView from "./managers/views/iframe";
import DefaultViewManager from "./managers/default";
import ContinuousViewManager from "./managers/continuous";

import Streamer from './streamer/streamer';

/**
 * Creates a new Book or Book Bridge & Worker
 * @param {string|ArrayBuffer} url URL, Path or ArrayBuffer
 * @param {object} options to pass to the book
 * @returns {Book} a new Book object
 * @example ePub("/path/to/book.epub", {})
 */
function ePub(url, options) {
	let streamer;
	let rendition;

	streamer = new Streamer(options);

	return streamer.open(url).then((book) => {
		/**
		 * Sugar to render a book to an element
		 * @param  {element | string} element element or string to add a rendition to
		 * @param  {object} [options]
		 * @return {Rendition}
		 */
		book.renderTo = (element, renditionOptions={}) => {

			if (options && typeof(options.worker) !== "undefined" &&
					typeof(renditionOptions.worker) === "undefined" ) {
				renditionOptions.worker = options.worker;
			}

			rendition = new Rendition(book.manifest, renditionOptions);
			rendition.attachTo(element);

			return rendition;
		}

		book.generateLocations = (chars) => {
			return streamer.generateLocations(chars)
				.then((locations) => {
					book.locations = locations;
					return locations;
				});
		}

		book._destroy = book.destroy;
		book.destroy = () => {
			book._destroy();
			streamer.destroy();
			rendition.destroy();
		}

		// streamer.destroy();
		window.EpubStreamer = streamer;

		return book;
	});
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
