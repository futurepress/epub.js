import Book from "./book/book";
import Rendition from "./rendition/rendition";
import EpubCFI from "./utils/epubcfi";
import Contents from "./rendition/contents";
import * as core from "./utils/core";
import { EPUBJS_VERSION } from "./utils/constants";
import "../libs/url/url-polyfill";

import IframeView from "./managers/views/iframe";
import DefaultViewManager from "./managers/default/index";
import ContinuousViewManager from "./managers/continuous/index";

import Epub from './epub/epub';
import EpubBridge from './epub/bridge';

/**
 * Creates a new Book or Book Bridge & Worker
 * @param {string|ArrayBuffer} url URL, Path or ArrayBuffer
 * @param {object} options to pass to the book
 * @returns {Book} a new Book object
 * @example ePub("/path/to/book.epub", {})
 */
async function ePub(url, options={}) {
	let epub;
	let rendition;

	if (typeof(url) !== "string") {
		return new Epub(...arguments);
	}

	if (options.worker) {
		epub = new EpubBridge(options);
	} else {
		epub = new Epub(options);
	}

	return epub.open(url).then((book) => {
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

			// If the workers fails, switch to replacements
	    rendition.on("workerFailed", function(){
	      rendition.clear();
	      epub.replacements().then((book) => {
	        rendition.unpack(book.manifest);
	        rendition.display(rendition.location);
	      })
	    });

			return rendition;
		}

		book.generateLocations = (chars) => {
			return epub.generateLocations(chars)
				.then((locations) => {
					book.locations = locations;
					return locations;
				});
		}

		book._destroy = book.destroy;
		book.destroy = () => {
			book._destroy();
			epub.destroy();
			rendition.destroy();
		}

		// epub.destroy();
		window.Epub = epub;

		return book;
	});
}

ePub.VERSION = EPUBJS_VERSION;

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
