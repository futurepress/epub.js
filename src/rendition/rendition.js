import EventEmitter from "event-emitter";
import { extend, defer, isFloat } from "../utils/core";
import Hook from "../utils/hook";
import EpubCFI from "../utils/epubcfi";
import Queue from "../utils/queue";
import Layout from "./layout";
// import Mapping from "./mapping";
import Themes from "./themes";
import Contents from "./contents";
import Annotations from "./annotations";
import { EVENTS, EPUBJS_VERSION } from "../utils/constants";

import Book from "../book/book";
import Spine from "../book/spine";
import Locations from "../epub/locations";
import PageList from "../epub/pagelist";
import Epub from "../epub/epub";
// import Navigation from "../epub/navigation";
import {replaceBase, replaceCanonical, replaceMeta} from "../utils/replacements";
import Url from "../utils/url";

const DEV = false;

/**
 * Displays an Epub as a series of Views for each Section.
 * Requires Manager and View class to handle specifics of rendering
 * the section contetn.
 * @class
 * @param {Book} book
 * @param {object} [options]
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {string} [options.ignoreClass] class for the cfi parser to ignore
 * @param {string | function | object} [options.manager='default']
 * @param {string | function} [options.view='iframe']
 * @param {string} [options.layout] layout to force
 * @param {string} [options.spread] force spread value
 * @param {number} [options.minSpreadWidth] overridden by spread: none (never) / both (always)
 * @param {string} [options.stylesheet] url of stylesheet to be injected
 * @param {string} [options.script] url of script to be injected
 */
class Rendition {
	constructor(manifest, options) {

		this.settings = extend(this.settings || {}, {
			width: null,
			height: null,
			ignoreClass: "",
			manager: "default",
			view: "iframe",
			flow: null,
			layout: null,
			spread: null,
			minSpreadWidth: 800,
			stylesheet: null,
			script: null,
			worker: undefined,
			workerScope: undefined
		});

		extend(this.settings, options);

		if (typeof(this.settings.manager) === "object") {
			this.manager = this.settings.manager;
		}

		/**
		 * Adds Hook methods to the Rendition prototype
		 * @member {object} hooks
		 * @property {Hook} hooks.content
		 * @memberof Rendition
		 */
		this.hooks = {};
		this.hooks.display = new Hook(this);
		this.hooks.content = new Hook(this);
		this.hooks.unloaded = new Hook(this);
		this.hooks.layout = new Hook(this);
		this.hooks.render = new Hook(this);
		this.hooks.show = new Hook(this);

		this.hooks.content.register(this.handleLinks.bind(this));
		this.hooks.content.register(this.passEvents.bind(this));
		this.hooks.content.register(this.adjustImages.bind(this));
		this.hooks.content.register(this.addIdentifier.bind(this));

		/**
		 * @member {Themes} themes
		 * @memberof Rendition
		 */
		this.themes = new Themes(this);

		/**
		 * @member {Annotations} annotations
		 * @memberof Rendition
		 */
		this.annotations = new Annotations(this);

		this.epubcfi = new EpubCFI();

		this.q = new Queue(this);

		/**
		 * A Rendered Location Range
		 * @typedef location
		 * @type {Object}
		 * @property {object} start
		 * @property {string} start.index
		 * @property {string} start.href
		 * @property {object} start.displayed
		 * @property {EpubCFI} start.cfi
		 * @property {number} start.location
		 * @property {number} start.percentage
		 * @property {number} start.displayed.page
		 * @property {number} start.displayed.total
		 * @property {object} end
		 * @property {string} end.index
		 * @property {string} end.href
		 * @property {object} end.displayed
		 * @property {EpubCFI} end.cfi
		 * @property {number} end.location
		 * @property {number} end.percentage
		 * @property {number} end.displayed.page
		 * @property {number} end.displayed.total
		 * @property {boolean} atStart
		 * @property {boolean} atEnd
		 * @memberof Rendition
		 */
		this.location = undefined;

		// Hold queue until book is opened
		// this.q.enqueue(this.book.opened);

		/**
		 * @private
		 */
		this.spineByHref = undefined;
		this.spineBySource = undefined;
		this.spineById = undefined;

		this.starting = new defer();
		/**
		 * @member {promise} started returns after the rendition has started
		 * @memberof Rendition
		 */
		this.started = this.starting.promise;
		// Block the queue until rendering is started
		this.q.enqueue(this.started);

		if (manifest) {
			this.unpack(manifest);
		}

		// If a service workers is used, block queue till it is ready
		if (this.settings.worker && navigator && 'serviceWorker' in navigator) {
			this.q.enqueue(() => {
				return this.worker(this.settings.worker)
					.catch(() => {
						// worker failed, will need replacements
						this.starting = new defer();
						this.started = this.starting.promise;
						// Block the queue again
						return this.q.enqueue(this.started);
					});
			});
		}
	}

	/**
	 * Load Book object or JSON manifest
	 */
	unpack(manifest) {
		if (!manifest) {
			throw new Error("No manifest provided");
		}

		if (typeof manifest === "string") {
			this.manifest = JSON.parse(manifest);
		} else {
			this.manifest = manifest;
		}

		let spine = this.manifest.spine.map((item, index) =>{
			item.index = index;
			return item;
		});

		this.spineByHref = {};
		this.spineBySource = {};
		this.spineById = {};

		this.manifest.spine.forEach((section, index) => {
			this.spineByHref[decodeURI(section.href)] = index;
			this.spineByHref[encodeURI(section.href)] = index;
			this.spineByHref[section.href] = index;

			if (section.source) {
				this.spineBySource[decodeURI(section.source)] = index;
				this.spineBySource[encodeURI(section.source)] = index;
				this.spineBySource[section.source] = index;
			}

			this.spineById[section.idref] = index;
		});

		this.book = new Book(manifest);

		this.start();
	}
	/**
	 * Set the manager function
	 * @param {function} manager
	 */
	setManager(manager) {
		this.manager = manager;
	}

	/**
	 * Require the manager from passed string, or as a class function
	 * @param  {string|object} manager [description]
	 * @return {method}
	 */
	requireManager(manager) {
		var viewManager;

		// If manager is a string, try to load from global registered managers
		if (typeof manager === "string" && typeof ePub != "undefined") {
			// Use global
			viewManager = ePub.ViewManagers[manager];
		} else {
			// otherwise, assume we were passed a class function
			viewManager = manager;
		}

		return viewManager;
	}

	/**
	 * Require the view from passed string, or as a class function
	 * @param  {string|object} view
	 * @return {view}
	 */
	requireView(view) {
		var View;

		// If view is a string, try to load from global registered views,
		if (typeof view == "string" && typeof ePub != "undefined") {
			// Use global
			View = ePub.Views[view];
		} else {
			// otherwise, assume we were passed a class function
			View = view;
		}

		return View;
	}

	/**
	 * Start the rendering
	 * @return {Promise} rendering has started
	 */
	start(){

		if(!this.manager) {
			this.ViewManager = this.requireManager(this.settings.manager);
			this.View = this.requireView(this.settings.view);

			this.manager = new this.ViewManager({
				view: this.View,
				// queue: this.q,
				spine: this.manifest.spine,
				hooks: this.hooks,
				// request: this.book.load.bind(this.book),
				settings: this.settings
			});
		}

		this.direction(this.manifest.metadata.direction);

		// Parse metadata to get layout props
		this.settings.globalLayoutProperties = this.determineLayoutProperties(this.manifest.metadata);

		this.flow(this.settings.globalLayoutProperties.flow);

		this.layout(this.settings.globalLayoutProperties);

		// Listen for displayed views
		this.manager.on(EVENTS.MANAGERS.ADDED, this.afterDisplayed.bind(this));
		this.manager.on(EVENTS.MANAGERS.REMOVED, this.afterRemoved.bind(this));

		// Listen for resizing
		this.manager.on(EVENTS.MANAGERS.RESIZED, this.onResized.bind(this));

		// Listen for rotation
		this.manager.on(EVENTS.MANAGERS.ORIENTATION_CHANGE, this.onOrientationChange.bind(this));

		// Listen for scroll changes
		this.manager.on(EVENTS.MANAGERS.SCROLLED, this.reportLocation.bind(this));

		/**
		 * Emit that rendering has started
		 * @event started
		 * @memberof Rendition
		 */
		this.emit(EVENTS.RENDITION.STARTED);

		// Start processing queue
		this.starting.resolve();
	}

	/**
	 * Call to attach the container to an element in the dom
	 * Container must be attached before rendering can begin
	 * @param  {element} element to attach to
	 * @return {Promise}
	 */
	attachTo(element){

		return this.q.enqueue(function () {

			// Start rendering
			this.manager.render(element, {
				"width"  : this.settings.width,
				"height" : this.settings.height
			});

			/**
			 * Emit that rendering has attached to an element
			 * @event attached
			 * @memberof Rendition
			 */
			this.emit(EVENTS.RENDITION.ATTACHED);

		}.bind(this));

	}

	/**
	 * Display a point in the book
	 * The request will be added to the rendering Queue,
	 * so it will wait until book is opened, rendering started
	 * and all other rendering tasks have finished to be called.
	 * @param  {string} target Url or EpubCFI
	 * @return {Promise}
	 */
	display(target){
		if (this.displaying) {
			this.displaying.resolve();
		}
		return this.q.enqueue(this._display, target);
	}

	/**
	 * Tells the manager what to display immediately
	 * @private
	 * @param  {string} target Url or EpubCFI
	 * @return {Promise}
	 */
	_display(target){
		// if (!this.book) {
		// 	return;
		// }
		var displaying = new defer();
		var displayed = displaying.promise;
		var section;

		this.displaying = displaying;

		// Check if this is a book percentage
		if (this.locations &&
				this.locations.length() &&
			 (isFloat(target) || (target === "1.0")) ) { // Handle 1.0
			target = this.locations.cfiFromPercentage(parseFloat(target));
		}

		section = this.findInSpine(target);

		if(!section){
			displaying.reject(new Error("No Section Found"));
			return displayed;
		}

		this.manager.display(section, target)
			.then(() => {
				displaying.resolve(section);
				this.displaying = undefined;

				/**
				 * Emit that a section has been displayed
				 * @event displayed
				 * @param {Section} section
				 * @memberof Rendition
				 */
				this.emit(EVENTS.RENDITION.DISPLAYED, section);
				this.reportLocation();
			}, (err) => {
				/**
				 * Emit that has been an error displaying
				 * @event displayError
				 * @param {Section} section
				 * @memberof Rendition
				 */
				this.emit(EVENTS.RENDITION.DISPLAY_ERROR, err);
			});

		return displayed;
	}

	/**
	 * Report what section has been displayed
	 * @private
	 * @param  {*} view
	 */
	afterDisplayed(view){

		view.on(EVENTS.VIEWS.MARK_CLICKED, (cfiRange, data) => this.triggerMarkEvent(cfiRange, data, view));

		this.hooks.render.trigger(view, this)
			.then(() => {
				if (view.contents) {
					this.hooks.content.trigger(view.contents, this).then(() => {
						/**
						 * Emit that a section has been rendered
						 * @event rendered
						 * @param {Section} section
						 * @param {View} view
						 * @memberof Rendition
						 */
						this.emit(EVENTS.RENDITION.RENDERED, view.section, view);
					});
				} else {
					this.emit(EVENTS.RENDITION.RENDERED, view.section, view);
				}
			});

	}

	/**
	 * Report what has been removed
	 * @private
	 * @param  {*} view
	 */
	afterRemoved(view){
		this.hooks.unloaded.trigger(view, this).then(() => {
			/**
			 * Emit that a section has been removed
			 * @event removed
			 * @param {Section} section
			 * @param {View} view
			 * @memberof Rendition
			 */
			this.emit(EVENTS.RENDITION.REMOVED, view.section, view);
		});
	}

	/**
	 * Report resize events and display the last seen location
	 * @private
	 */
	onResized(size){

		/**
		 * Emit that the rendition has been resized
		 * @event resized
		 * @param {number} width
		 * @param {height} height
		 * @memberof Rendition
		 */
		this.emit(EVENTS.RENDITION.RESIZED, {
			width: size.width,
			height: size.height
		});

		if (this.location && this.location.start) {
			this.display(this.location.start.cfi);
		}

	}

	/**
	 * Report orientation events and display the last seen location
	 * @private
	 */
	onOrientationChange(orientation){
		/**
		 * Emit that the rendition has been rotated
		 * @event orientationchange
		 * @param {string} orientation
		 * @memberof Rendition
		 */
		this.emit(EVENTS.RENDITION.ORIENTATION_CHANGE, orientation);
	}

	/**
	 * Move the Rendition to a specific offset
	 * Usually you would be better off calling display()
	 * @param {object} offset
	 */
	moveTo(offset){
		this.manager.moveTo(offset);
	}

	/**
	 * Trigger a resize of the views
	 * @param {number} [width]
	 * @param {number} [height]
	 */
	resize(width, height){
		if (width) {
			this.settings.width = width;
		}
		if (height) {
			this.settings.height = width;
		}
		this.manager.resize(width, height);
	}

	/**
	 * Clear all rendered views
	 */
	clear(){
		this.manager.clear();
	}

	/**
	 * Go to the next "page" in the rendition
	 * @return {Promise}
	 */
	next(){
		return this.q.enqueue(this.manager.next.bind(this.manager))
			.then(this.reportLocation.bind(this));
	}

	/**
	 * Go to the previous "page" in the rendition
	 * @return {Promise}
	 */
	prev(){
		return this.q.enqueue(this.manager.prev.bind(this.manager))
			.then(this.reportLocation.bind(this));
	}

	//-- http://www.idpf.org/epub/301/spec/epub-publications.html#meta-properties-rendering
	/**
	 * Determine the Layout properties from metadata and settings
	 * @private
	 * @param  {object} metadata
	 * @return {object} properties
	 */
	determineLayoutProperties(metadata){
		var properties;
		var layout = this.settings.layout || metadata.layout || "reflowable";
		var spread = this.settings.spread || metadata.spread || "auto";
		var orientation = this.settings.orientation || metadata.orientation || "auto";
		var flow = this.settings.flow || metadata.flow || "auto";
		var viewport = metadata.viewport || "";
		var minSpreadWidth = this.settings.minSpreadWidth || metadata.minSpreadWidth || 800;
		var direction = this.settings.direction || metadata.direction || "ltr";

		properties = {
			layout : layout,
			spread : spread,
			orientation : orientation,
			flow : flow,
			viewport : viewport,
			minSpreadWidth : minSpreadWidth,
			direction: direction
		};

		return properties;
	}

	/**
	 * Adjust the flow of the rendition to paginated or scrolled
	 * (scrolled-continuous vs scrolled-doc are handled by different view managers)
	 * @param  {string} flow
	 */
	flow(flow){
		var _flow = flow;
		if (flow === "scrolled" ||
				flow === "scrolled-doc" ||
				flow === "scrolled-continuous") {
			_flow = "scrolled";
		}

		if (flow === "auto" || flow === "paginated") {
			_flow = "paginated";
		}

		this.settings.flow = flow;

		if (this._layout) {
			this._layout.flow(_flow);
		}

		if (this.manager && this._layout) {
			this.manager.applyLayout(this._layout);
		}

		if (this.manager) {
			this.manager.updateFlow(_flow);
		}

		if (this.manager && this.manager.isRendered() && this.location) {
			this.manager.clear();
			this.display(this.location.start.cfi);
		}
	}

	/**
	 * Adjust the layout of the rendition to reflowable or pre-paginated
	 * @param  {object} settings
	 */
	layout(settings){
		if (settings) {
			this._layout = new Layout(settings);
			this._layout.spread(settings.spread, this.settings.minSpreadWidth);

			// this.mapping = new Mapping(this._layout.props);

			this._layout.on(EVENTS.LAYOUT.UPDATED, (props, changed) => {
				this.emit(EVENTS.RENDITION.LAYOUT, props, changed);
			});
		}

		if (this.manager && this._layout) {
			this.manager.applyLayout(this._layout);
		}

		return this._layout;
	}

	/**
	 * Adjust if the rendition uses spreads
	 * @param  {string} spread none | auto (TODO: implement landscape, portrait, both)
	 * @param  {int} min min width to use spreads at
	 */
	spread(spread, min){

		this._layout.spread(spread, min);

		if (this.manager.isRendered()) {
			this.manager.updateLayout();
		}
	}

	/**
	 * Adjust the direction of the rendition
	 * @param  {string} dir
	 */
	direction(dir){

		this.settings.direction = dir || "ltr";

		if (this.manager) {
			this.manager.direction(this.settings.direction);
		}

		if (this.manager && this.manager.isRendered() && this.location) {
			this.manager.clear();
			this.display(this.location.start.cfi);
		}
	}

	/**
	 * Report the current location
	 * @fires relocated
	 * @fires locationChanged
	 */
	reportLocation(){
		return this.q.enqueue(function reportedLocation(){
			requestAnimationFrame(function reportedLocationAfterRAF() {
				var location = this.manager.currentLocation();
				if (location && location.then && typeof location.then === "function") {
					location.then(function(result) {
						let located = this.located(result);

						if (!located || !located.start || !located.end) {
							return;
						}

						this.location = located;

						this.emit(EVENTS.RENDITION.LOCATION_CHANGED, {
							index: this.location.start.index,
							href: this.location.start.href,
							start: this.location.start.cfi,
							end: this.location.end.cfi,
							percentage: this.location.start.percentage
						});

						this.emit(EVENTS.RENDITION.RELOCATED, this.location);
					}.bind(this));
				} else if (location) {
					let located = this.located(location);

					if (!located || !located.start || !located.end) {
						return;
					}

					this.location = located;

					/**
					 * @event locationChanged
					 * @deprecated
					 * @type {object}
					 * @property {number} index
					 * @property {string} href
					 * @property {EpubCFI} start
					 * @property {EpubCFI} end
					 * @property {number} percentage
					 * @memberof Rendition
					 */
					this.emit(EVENTS.RENDITION.LOCATION_CHANGED, {
						index: this.location.start.index,
						href: this.location.start.href,
						start: this.location.start.cfi,
						end: this.location.end.cfi,
						percentage: this.location.start.percentage
					});

					/**
					 * @event relocated
					 * @type {displayedLocation}
					 * @memberof Rendition
					 */
					this.emit(EVENTS.RENDITION.RELOCATED, this.location);
				}
			}.bind(this));
		}.bind(this));
	}

	/**
	 * Get the Current Location object
	 * @return {displayedLocation | promise} location (may be a promise)
	 */
	currentLocation(){
		var location = this.manager.currentLocation();
		if (location && location.then && typeof location.then === "function") {
			location.then(function(result) {
				let located = this.located(result);
				return located;
			}.bind(this));
		} else if (location) {
			let located = this.located(location);
			return located;
		}
	}

	/**
	 * Creates a Rendition#locationRange from location
	 * passed by the Manager
	 * @returns {displayedLocation}
	 * @private
	 */
	located(location){
		if (!location.length) {
			return {};
		}
		let start = location[0];
		let end = location[location.length-1];

		let located = {
			start: {
				index: start.index,
				href: start.href,
				cfi: start.mapping.start,
				displayed: {
					page: start.pages[0] || 1,
					total: start.totalPages
				}
			},
			end: {
				index: end.index,
				href: end.href,
				cfi: end.mapping.end,
				displayed: {
					page: end.pages[end.pages.length-1] || 1,
					total: end.totalPages
				}
			}
		};

		if (this.locations) {
			let locationStart = this.locations.locationFromCfi(start.mapping.start);
			let locationEnd = this.locations.locationFromCfi(end.mapping.end);

			if (locationStart != null) {
				located.start.location = locationStart;
				located.start.percentage = this.locations.percentageFromLocation(locationStart);
			}
			if (locationEnd != null) {
				located.end.location = locationEnd;
				located.end.percentage = this.locations.percentageFromLocation(locationEnd);
			}
		}

		if (this.pageList) {
			let pageStart = this.pageList.pageFromCfi(start.mapping.start);
			let pageEnd = this.pageList.pageFromCfi(end.mapping.end);

			if (pageStart != -1) {
				located.start.page = pageStart;
			}
			if (pageEnd != -1) {
				located.end.page = pageEnd;
			}
		}

		if (end.index === this.manifest.spine[this.manifest.spine.length - 1].index &&
				located.end.displayed.page >= located.end.displayed.total) {
			located.atEnd = true;
		}

		if (start.index === this.manifest.spine[0].index &&
				located.start.displayed.page === 1) {
			located.atStart = true;
		}

		return located;
	}

	/**
	 * Remove and Clean Up the Rendition
	 */
	destroy(){
		// Clear the queue
		this.q.clear();
		this.q = undefined;

		this.manager && this.manager.destroy();

		this.manifest = undefined;

		this.spineByHref = undefined;
		this.spineBySource = undefined;
		this.spineById = undefined;

		this.hooks.display.clear();
		// this.hooks.serialize.clear();
		this.hooks.content.clear();
		this.hooks.layout.clear();
		this.hooks.render.clear();
		this.hooks.show.clear();
		this.hooks = {};

		this.themes.destroy();
		this.themes = undefined;

		this.epubcfi = undefined;

		this.starting = undefined;
		this.started = undefined;

	}

	/**
	 * Pass the events from a view's Contents
	 * @private
	 * @param  {View} view
	 */
	passEvents(contents){
		var listenedEvents = Contents.listenedEvents;

		listenedEvents.forEach((e) => {
			contents.on(e, (ev) => this.triggerViewEvent(ev, contents));
		});

		contents.on(EVENTS.CONTENTS.SELECTED, (e) => this.triggerSelectedEvent(e, contents));
	}

	/**
	 * Emit events passed by a view
	 * @private
	 * @param  {event} e
	 */
	triggerViewEvent(e, contents){
		this.emit(e.type, e, contents);
	}

	/**
	 * Emit a selection event's CFI Range passed from a a view
	 * @private
	 * @param  {EpubCFI} cfirange
	 */
	triggerSelectedEvent(cfirange, contents){
		/**
		 * Emit that a text selection has occured
		 * @event selected
		 * @param {EpubCFI} cfirange
		 * @param {Contents} contents
		 * @memberof Rendition
		 */
		this.emit(EVENTS.RENDITION.SELECTED, cfirange, contents);
	}

	/**
	 * Emit a markClicked event with the cfiRange and data from a mark
	 * @private
	 * @param  {EpubCFI} cfirange
	 */
	triggerMarkEvent(cfiRange, data, contents){
		/**
		 * Emit that a mark was clicked
		 * @event markClicked
		 * @param {EpubCFI} cfirange
		 * @param {object} data
		 * @param {Contents} contents
		 * @memberof Rendition
		 */
		this.emit(EVENTS.RENDITION.MARK_CLICKED, cfiRange, data, contents);
	}

	/**
	 * Get a Range from a Visible CFI
	 * @param  {string} cfi EpubCfi String
	 * @param  {string} ignoreClass
	 * @return {range}
	 */
	getRange(cfi, ignoreClass){
		var _cfi = new EpubCFI(cfi);
		var found = this.manager.visible().filter(function (view) {
			if(_cfi.spinePos === view.index) return true;
		});

		// Should only every return 1 item
		if (found.length) {
			return found[0].contents.range(_cfi, ignoreClass);
		}
	}

	/**
	 * Hook to adjust images to fit in columns
	 * @param  {Contents} contents
	 * @private
	 */
	adjustImages(contents) {

		if (this._layout.name === "pre-paginated") {
			return new Promise(function(resolve){
				resolve();
			});
		}

		contents.addStylesheetRules({
			"img" : {
				"max-width": (this._layout.columnWidth ? this._layout.columnWidth + "px" : "100%") + "!important",
				"max-height": (this._layout.height ? (this._layout.height * 0.6) + "px" : "60%") + "!important",
				"object-fit": "contain",
				"page-break-inside": "avoid"
			},
			"svg" : {
				"max-width": (this._layout.columnWidth ? this._layout.columnWidth + "px" : "100%") + "!important",
				"max-height": (this._layout.height ? (this._layout.height * 0.6) + "px" : "60%") + "!important",
				"page-break-inside": "avoid"
			}
		});

		return new Promise(function(resolve, reject){
			// Wait to apply
			setTimeout(function() {
				resolve();
			}, 1);
		});
	}

	/**
	 * Hook to add the book identifier
	 * @param  {Contents} contents
	 * @private
	 */
	addIdentifier(contents) {
		let ident = this.book.metadata.identifier;
		contents.addIdentifier(ident);
	}

	/**
	 * Get the Contents object of each rendered view
	 * @returns {Contents[]}
	 */
	getContents () {
		return this.manager ? this.manager.getContents() : [];
	}

	/**
	 * Get the views member from the manager
	 * @returns {Views}
	 */
	views () {
		let views = this.manager ? this.manager.views : undefined;
		return views || [];
	}

	/**
	 * Hook to handle link clicks in rendered content
	 * @param  {Contents} contents
	 * @private
	 */
	handleLinks(contents) {
		if (contents) {
			contents.on(EVENTS.CONTENTS.LINK_CLICKED, (href) => {
				let relative = this.book.path.relative(href);
				this.display(relative);
			});
		}
	}

	/**
	 * @return {object} spineItem
	 */
	findInSpine(target) {
		var index = 0;

		if(this.epubcfi.isCfiString(target)) {
			let cfi = new EpubCFI(target);
			index = cfi.spinePos;
		} else if(typeof target === "number" || isNaN(target) === false){
			index = target;
		} else if(typeof target === "string" && target.indexOf("#") === 0) {
			index = this.spineById[target.substring(1)];
		} else if(typeof target === "string") {
			// Remove fragments
			target = target.split("#")[0];
			index = this.spineByHref[target] ||
							this.spineByHref[encodeURI(target)] ||
							this.spineBySource[target] ||
							this.spineBySource[encodeURI(target)];
		}

		return this.manifest.spine[index] || null;
	}

	/**
	 * Generates the Book Key using the identifer in the manifest or other string provided
	 * @param  {string} [identifier] to use instead of metadata identifier
	 * @return {string} key
	 */
	key(identifier) {
		var ident = identifier || this.manifest.metadata.identifier;
		return `epubjs-${EPUBJS_VERSION}-${ident}`;
	}

	worker(workerUrl) {
		let deferred = new defer();
		let key = this.key();

		// Resolve early if book is not archived and not cross domain
		let url = new Url(this.book.url);
		let source = this.book.source ? this.book.source.type : '';

		if(source !== "application/epub+zip" &&
			 url.origin === window.location.origin) {
			deferred.resolve();
		}

		if ('serviceWorker' in navigator) {

			let worker = navigator.serviceWorker.controller;
			// Worker is already running
			if (worker) {
				deferred.resolve();
			}

			navigator.serviceWorker.register(workerUrl, { scope: this.settings.workerScope })
				.then((reg) => {

					worker = navigator.serviceWorker.controller;

					if (reg.active && !worker) {
						this.emit(EVENTS.RENDITION.WORKER_INACTIVE);
						deferred.resolve();
					}

					if (worker) {
						deferred.resolve();
					}

				}, (error) => {
					// registration failed
					console.error(error);

					this.emit(EVENTS.RENDITION.WORKER_FAILED);
					deferred.reject('Worker registration failed', error);
				});

			navigator.serviceWorker.addEventListener('message', (event) => {
				DEV && console.log("[sw msg]", event.data);
				if (event.data.msg === "active") {
					deferred.resolve();
				}
			});

			navigator.serviceWorker.addEventListener("controllerchange", (event) => {
				worker = navigator.serviceWorker.controller;
				if (worker) {
					deferred.resolve();
				}
			});


		} else {
			deferred.resolve();
		}

		return deferred.promise;
	}

	cache(worker) {
		if (!worker) {
			worker = navigator.serviceWorker.controller;
		}
		worker.postMessage({ method: "add", key: key, resources: this.manifest.resources });
	}

}

//-- Enable binding events to Renderer
EventEmitter(Rendition.prototype);

export default Rendition;
