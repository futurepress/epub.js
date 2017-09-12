import EventEmitter from "event-emitter";
import { extend, defer, isFloat } from "./utils/core";
import Hook from "./utils/hook";
import EpubCFI from "./epubcfi";
import Queue from "./utils/queue";
import Layout from "./layout";
import Mapping from "./mapping";
import Themes from "./themes";
import Contents from "./contents";
import Annotations from "./annotations";

/**
 * [Rendition description]
 * @class
 * @param {Book} book
 * @param {object} options
 * @param {int} options.width
 * @param {int} options.height
 * @param {string} options.ignoreClass
 * @param {string} options.manager
 * @param {string} options.view
 * @param {string} options.layout
 * @param {string} options.spread
 * @param {int} options.minSpreadWidth overridden by spread: none (never) / both (always)
 * @param {string} options.stylesheet url of stylesheet to be injected
 */
class Rendition {
	constructor(book, options) {

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
			script: null
		});

		extend(this.settings, options);

		if (typeof(this.settings.manager) === "object") {
			this.manager = this.settings.manager;
		}

		this.viewSettings = {
			ignoreClass: this.settings.ignoreClass
		};

		this.book = book;

		this.views = null;

		/**
		 * Adds Hook methods to the Rendition prototype
		 * @property {Hook} hooks
		 */
		this.hooks = {};
		this.hooks.display = new Hook(this);
		this.hooks.serialize = new Hook(this);
		/**
		 * @property {method} hooks.content
		 * @type {Hook}
		 */
		this.hooks.content = new Hook(this);
		this.hooks.unloaded = new Hook(this);
		this.hooks.layout = new Hook(this);
		this.hooks.render = new Hook(this);
		this.hooks.show = new Hook(this);

		this.hooks.content.register(this.handleLinks.bind(this));
		this.hooks.content.register(this.passEvents.bind(this));
		this.hooks.content.register(this.adjustImages.bind(this));

		this.book.spine.hooks.content.register(this.injectIdentifier.bind(this));

		if (this.settings.stylesheet) {
			this.book.spine.hooks.content.register(this.injectStylesheet.bind(this));
		}

		if (this.settings.script) {
			this.book.spine.hooks.content.register(this.injectScript.bind(this));
		}

		// this.hooks.display.register(this.afterDisplay.bind(this));
		this.themes = new Themes(this);

		this.annotations = new Annotations(this);

		this.epubcfi = new EpubCFI();

		this.q = new Queue(this);

		this.q.enqueue(this.book.opened);

		// Block the queue until rendering is started
		this.starting = new defer();
		this.started = this.starting.promise;
		this.q.enqueue(this.start);
	}

	/**
	 * Set the manager function
	 * @param {function} manager
	 */
	setManager(manager) {
		this.manager = manager;
	}

	/**
	 * Require the manager from passed string, or as a function
	 * @param  {string|function} manager [description]
	 * @return {method}
	 */
	requireManager(manager) {
		var viewManager;

		// If manager is a string, try to load from register managers,
		// or require included managers directly
		if (typeof manager === "string") {
			// Use global or require
			viewManager = typeof ePub != "undefined" ? ePub.ViewManagers[manager] : undefined; //require("./managers/"+manager);
		} else {
			// otherwise, assume we were passed a function
			viewManager = manager;
		}

		return viewManager;
	}

	/**
	 * Require the view from passed string, or as a function
	 * @param  {string|function} view
	 * @return {view}
	 */
	requireView(view) {
		var View;

		if (typeof view == "string") {
			View = typeof ePub != "undefined" ? ePub.Views[view] : undefined; //require("./views/"+view);
		} else {
			// otherwise, assume we were passed a function
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
				queue: this.q,
				request: this.book.load.bind(this.book),
				settings: this.settings
			});
		}

		// Parse metadata to get layout props
		this.settings.globalLayoutProperties = this.determineLayoutProperties(this.book.package.metadata);

		this.flow(this.settings.globalLayoutProperties.flow);

		this.layout(this.settings.globalLayoutProperties);

		// Listen for displayed views
		this.manager.on("added", this.afterDisplayed.bind(this));
		this.manager.on("removed", this.afterRemoved.bind(this));

		// Listen for resizing
		this.manager.on("resized", this.onResized.bind(this));

		// Listen for rotation
		this.manager.on("orientationChange", this.onOrientationChange.bind(this));

		// Listen for scroll changes
		this.manager.on("scrolled", this.reportLocation.bind(this));

		// Trigger that rendering has started
		this.emit("started");

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

			// Trigger Attached
			this.emit("attached");

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
		if (!this.book) {
			return;
		}
		var isCfiString = this.epubcfi.isCfiString(target);
		var displaying = new defer();
		var displayed = displaying.promise;
		var section;
		var moveTo;

		this.displaying = displaying;

		// Check if this is a book percentage
		if (this.book.locations.length &&
				(isFloat(target) ||
				(typeof target === "string" && target == parseFloat(target))) // Handle 1.0
			) {
			target = this.book.locations.cfiFromPercentage(parseFloat(target));
		}

		section = this.book.spine.get(target);

		if(!section){
			displaying.reject(new Error("No Section Found"));
			return displayed;
		}

		this.manager.display(section, target)
			.then(() => {
				displaying.resolve(section);
				this.displaying = undefined;

				this.emit("displayed", section);
				this.reportLocation();
			});

		return displayed;
	}

	/*
	render(view, show) {

		// view.onLayout = this.layout.format.bind(this.layout);
		view.create();

		// Fit to size of the container, apply padding
		this.manager.resizeView(view);

		// Render Chain
		return view.section.render(this.book.request)
			.then(function(contents){
				return view.load(contents);
			}.bind(this))
			.then(function(doc){
				return this.hooks.content.trigger(view, this);
			}.bind(this))
			.then(function(){
				this.layout.format(view.contents);
				return this.hooks.layout.trigger(view, this);
			}.bind(this))
			.then(function(){
				return view.display();
			}.bind(this))
			.then(function(){
				return this.hooks.render.trigger(view, this);
			}.bind(this))
			.then(function(){
				if(show !== false) {
					this.q.enqueue(function(view){
						view.show();
					}, view);
				}
				// this.map = new Map(view, this.layout);
				this.hooks.show.trigger(view, this);
				this.trigger("rendered", view.section);

			}.bind(this))
			.catch(function(e){
				this.trigger("loaderror", e);
			}.bind(this));

	}
	*/

	/**
	 * Report what has been displayed
	 * @private
	 * @param  {*} view
	 */
	afterDisplayed(view){
		if (view.contents) {
			this.hooks.content.trigger(view.contents, this).then(() => {
				this.emit("rendered", view.section, view);
			});
		} else {
			this.emit("rendered", view.section, view);
		}

		// this.reportLocation();
	}

	/**
	 * Report what has been removed
	 * @private
	 * @param  {*} view
	 */
	afterRemoved(view){
		this.hooks.unloaded.trigger(view, this).then(() => {
			this.emit("removed", view.section, view);
		});
	}

	/**
	 * Report resize events and display the last seen location
	 * @private
	 */
	onResized(size){

		this.emit("resized", {
			width: size.width,
			height: size.height
		});

		if (this.location && this.location.start) {
			// this.manager.clear();
			this.display(this.location.start.cfi);
		}

	}

	/**
	 * Report orientation events and display the last seen location
	 * @private
	 */
	onOrientationChange(orientation){
		if (this.location) {
			this.manager.clear();
			this.display(this.location.start.cfi);
		}

		this.emit("orientationChange", orientation);
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

		if (this.settings.width >= 0 && this.settings.height >= 0) {
			viewport = "width="+this.settings.width+", height="+this.settings.height+"";
		}

		properties = {
			layout : layout,
			spread : spread,
			orientation : orientation,
			flow : flow,
			viewport : viewport,
			minSpreadWidth : minSpreadWidth
		};

		return properties;
	}

	// applyLayoutProperties(){
	// 	var settings = this.determineLayoutProperties(this.book.package.metadata);
	//
	// 	this.flow(settings.flow);
	//
	// 	this.layout(settings);
	// };

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

		if (this.location) {
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

			this.mapping = new Mapping(this._layout.props);
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
	 * Report the current location
	 * @private
	 */
	reportLocation(){
		return this.q.enqueue(function reportedLocation(){
			var location = this.manager.currentLocation();
			if (location && location.then && typeof location.then === "function") {
				location.then(function(result) {
					let located = this.located(result);

					if (!located || !located.start || !located.end) {
						return;
					}

					this.location = located;

					this.emit("locationChanged", {
						index: this.location.start.index,
						href: this.location.start.href,
						start: this.location.start.cfi,
						end: this.location.end.cfi,
						percentage: this.location.start.percentage
					});

					this.emit("relocated", this.location);
				}.bind(this));
			} else if (location) {
				let located = this.located(location);

				if (!located || !located.start || !located.end) {
					return;
				}

				this.location = located;

				this.emit("locationChanged", {
					index: this.location.start.index,
					href: this.location.start.href,
					start: this.location.start.cfi,
					end: this.location.end.cfi,
					percentage: this.location.start.percentage
				});

				this.emit("relocated", this.location);
			}

		}.bind(this));
	}

	/**
	 * Get the Current Location CFI
	 * @return {EpubCFI} location (may be a promise)
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

		let locationStart = this.book.locations.locationFromCfi(start.mapping.start);
		let locationEnd = this.book.locations.locationFromCfi(end.mapping.end);

		if (locationStart != null) {
			located.start.location = locationStart;
			located.start.percentage = this.book.locations.percentageFromLocation(locationStart);
		}
		if (locationEnd != null) {
			located.end.location = locationEnd;
			located.end.percentage = this.book.locations.percentageFromLocation(locationEnd);
		}

		let pageStart = this.book.pageList.pageFromCfi(start.mapping.start);
		let pageEnd = this.book.pageList.pageFromCfi(end.mapping.end);

		if (pageStart != -1) {
			located.start.page = pageStart;
		}
		if (pageEnd != -1) {
			located.end.page = pageEnd;
		}

		if (end.index === this.book.spine.last().index &&
				located.end.displayed.page >= located.end.displayed.total) {
			located.atEnd = true;
		}

		if (start.index === this.book.spine.first().index &&
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
		// this.q.clear();
		// this.q = undefined;

		this.manager && this.manager.destroy();

		this.book = undefined;

		this.views = null;

		// this.hooks.display.clear();
		// this.hooks.serialize.clear();
		// this.hooks.content.clear();
		// this.hooks.layout.clear();
		// this.hooks.render.clear();
		// this.hooks.show.clear();
		// this.hooks = {};

		// this.themes.destroy();
		// this.themes = undefined;

		// this.epubcfi = undefined;

		// this.starting = undefined;
		// this.started = undefined;


	}

	/**
	 * Pass the events from a view
	 * @private
	 * @param  {View} view
	 */
	passEvents(contents){
		var listenedEvents = Contents.listenedEvents;

		listenedEvents.forEach((e) => {
			contents.on(e, (ev) => this.triggerViewEvent(ev, contents));
		});

		contents.on("selected", (e) => this.triggerSelectedEvent(e, contents));
		contents.on("markClicked", (cfiRange, data) => this.triggerMarkEvent(cfiRange, data, contents));
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
		this.emit("selected", cfirange, contents);
	}

	/**
	 * Emit a markClicked event with the cfiRange and data from a mark
	 * @private
	 * @param  {EpubCFI} cfirange
	 */
	triggerMarkEvent(cfiRange, data, contents){
		this.emit("markClicked", cfiRange, data, contents);
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
	 * @param  {View} view
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
			}
		});

		return new Promise(function(resolve, reject){
			// Wait to apply
			setTimeout(function() {
				resolve();
			}, 1);
		});
	}

	getContents () {
		return this.manager ? this.manager.getContents() : [];
	}

	handleLinks(contents) {
		if (contents) {
			contents.on("link", (href) => {
				let relative = this.book.path.relative(href);
				this.display(relative);
			});
		}
	}

	injectStylesheet(doc, section) {
		let style = doc.createElement("link");
		style.setAttribute("type", "text/css");
		style.setAttribute("rel", "stylesheet");
		style.setAttribute("href", this.settings.stylesheet);
		doc.getElementsByTagName("head")[0].appendChild(style);
	}

	injectScript(doc, section) {
		let script = doc.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", this.settings.script);
		script.textContent = " "; // Needed to prevent self closing tag
		doc.getElementsByTagName("head")[0].appendChild(script);
	}

	injectIdentifier(doc, section) {
		let ident = this.book.package.metadata.identifier;
		let meta = doc.createElement("meta");
		meta.setAttribute("name", "dc.relation.ispartof");
		if (ident) {
			meta.setAttribute("content", ident);
		}
		doc.getElementsByTagName("head")[0].appendChild(meta);
	}

}

//-- Enable binding events to Renderer
EventEmitter(Rendition.prototype);

export default Rendition;
