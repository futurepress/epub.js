var RSVP = require('rsvp');
var URI = require('urijs');
var core = require('./core');
var replace = require('./replacements');
var Hook = require('./hook');
var EpubCFI = require('./epubcfi');
var Queue = require('./queue');
// var View = require('./view');
var Views = require('./views');
var Layout = require('./layout');
var Mapping = require('./mapping');

function Rendition(book, options) {

	this.settings = core.extend(this.settings || {}, {
		width: null,
		height: null,
		ignoreClass: '',
		manager: "continuous",
		view: "iframe",
		flow: null,
		layout: null,
		spread: null,
		minSpreadWidth: 800, //-- overridden by spread: none (never) / both (always),
		useBase64: true
	});

	core.extend(this.settings, options);

	this.viewSettings = {
		ignoreClass: this.settings.ignoreClass
	};

	this.book = book;

	this.views = null;

	//-- Adds Hook methods to the Rendition prototype
	this.hooks = {};
	this.hooks.display = new Hook(this);
	this.hooks.serialize = new Hook(this);
	this.hooks.content = new Hook(this);
	this.hooks.layout = new Hook(this);
	this.hooks.render = new Hook(this);
	this.hooks.show = new Hook(this);

	this.hooks.content.register(replace.links.bind(this));
	this.hooks.content.register(this.passViewEvents.bind(this));

	// this.hooks.display.register(this.afterDisplay.bind(this));

  this.epubcfi = new EpubCFI();

	this.q = new Queue(this);

	this.q.enqueue(this.book.opened);

	// Block the queue until rendering is started
	// this.starting = new RSVP.defer();
	// this.started = this.starting.promise;
	this.q.enqueue(this.start);

	// TODO: move this somewhere else
	if(this.book.unarchived) {
		this.replacements();
	}

};

Rendition.prototype.setManager = function(manager) {
	this.manager = manager;
};

Rendition.prototype.requireManager = function(manager) {
	var viewManager;

	// If manager is a string, try to load from register managers,
	// or require included managers directly
	if (typeof manager === "string") {
		// Use global or require
		viewManager = typeof ePub != "undefined" ? ePub.ViewManagers[manager] : undefined; //require('./managers/'+manager);
	} else {
		// otherwise, assume we were passed a function
		viewManager = manager
	}

  return viewManager;
};

Rendition.prototype.requireView = function(view) {
	var View;

	if (typeof view == "string") {
		View = typeof ePub != "undefined" ? ePub.Views[view] : undefined; //require('./views/'+view);
	} else {
		// otherwise, assume we were passed a function
		View = view
	}

  return View;
};

Rendition.prototype.start = function(){

	if(!this.manager) {
		this.ViewManager = this.requireManager(this.settings.manager);
		this.View = this.requireView(this.settings.view);

		this.manager = new this.ViewManager({
			view: this.View,
			queue: this.q,
			request: this.book.request,
			settings: this.settings
		});
	}

	// Parse metadata to get layout props
	this.settings.globalLayoutProperties = this.determineLayoutProperties(this.book.package.metadata);

	this.flow(this.settings.globalLayoutProperties.flow);

	this.layout(this.settings.globalLayoutProperties);

	// Listen for displayed views
	this.manager.on("added", this.afterDisplayed.bind(this));

	// Listen for resizing
	this.manager.on("resized", this.onResized.bind(this));


	this.on('displayed', this.reportLocation.bind(this));

	// Trigger that rendering has started
	this.trigger("started");

	// Start processing queue
	// this.starting.resolve();
};

// Call to attach the container to an element in the dom
// Container must be attached before rendering can begin
Rendition.prototype.attachTo = function(element){

	return this.q.enqueue(function () {

		// Start rendering
		this.manager.render(element, {
			"width"  : this.settings.width,
			"height" : this.settings.height
		});

		// Trigger Attached
		this.trigger("attached");

	}.bind(this));

};

Rendition.prototype.display = function(target){

	// if (!this.book.spine.spineItems.length > 0) {
		// Book isn't open yet
		// return this.q.enqueue(this.display, target);
	// }

	return this.q.enqueue(this._display, target);

};

Rendition.prototype._display = function(target){
	var isCfiString = this.epubcfi.isCfiString(target);
	var displaying = new RSVP.defer();
	var displayed = displaying.promise;
	var section;
	var moveTo;

	section = this.book.spine.get(target);

	if(!section){
		displaying.reject(new Error("No Section Found"));
		return displayed;
	}

	// Trim the target fragment
	// removing the chapter
	if(!isCfiString && typeof target === "string" &&
		target.indexOf("#") > -1) {
			moveTo = target.substring(target.indexOf("#")+1);
	}

	if (isCfiString) {
		moveTo = target;
	}

	return this.manager.display(section, moveTo)
		.then(function(){
			this.trigger("displayed", section);
		}.bind(this));

};

/*
Rendition.prototype.render = function(view, show) {

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

};
*/

Rendition.prototype.afterDisplayed = function(view){
	this.hooks.content.trigger(view, this);
	this.trigger("rendered", view.section);
	this.reportLocation();
};

Rendition.prototype.onResized = function(size){

	if(this.location) {
		this.display(this.location.start);
	}

	this.trigger("resized", {
		width: size.width,
		height: size.height
	});

};

Rendition.prototype.moveTo = function(offset){
	this.manager.moveTo(offset);
};

Rendition.prototype.next = function(){
	return this.q.enqueue(this.manager.next.bind(this.manager))
		.then(this.reportLocation.bind(this));
};

Rendition.prototype.prev = function(){
	return this.q.enqueue(this.manager.prev.bind(this.manager))
		.then(this.reportLocation.bind(this));
};

//-- http://www.idpf.org/epub/301/spec/epub-publications.html#meta-properties-rendering
Rendition.prototype.determineLayoutProperties = function(metadata){
	var settings;
	var layout = this.settings.layout || metadata.layout || "reflowable";
	var spread = this.settings.spread || metadata.spread || "auto";
	var orientation = this.settings.orientation || metadata.orientation || "auto";
	var flow = this.settings.flow || metadata.flow || "auto";
	var viewport = metadata.viewport || "";

	if (this.settings.width >= 0 && this.settings.height >= 0) {
		viewport = "width="+this.settings.width+", height="+this.settings.height+"";
	}

	settings = {
		layout : layout,
		spread : spread,
		orientation : orientation,
		flow : flow,
		viewport : viewport
	};

	return settings;
};

// Rendition.prototype.applyLayoutProperties = function(){
// 	var settings = this.determineLayoutProperties(this.book.package.metadata);
//
// 	this.flow(settings.flow);
//
// 	this.layout(settings);
// };

// paginated | scrolled
// (scrolled-continuous vs scrolled-doc are handled by different view managers)
Rendition.prototype.flow = function(_flow){
	var flow;
	if (_flow === "scrolled-doc" || _flow === "scrolled-continuous") {
		flow = "scrolled";
	}

	if (_flow === "auto" || _flow === "paginated") {
		flow = "paginated";
	}

	if (this._layout) {
		this._layout.flow(flow);
	}

	if (this.manager) {
		this.manager.updateFlow(flow);
	}
};

// reflowable | pre-paginated
Rendition.prototype.layout = function(settings){
	this._layout = new Layout(settings);
	this._layout.spread(settings.spread, this.settings.minSpreadWidth);

	this.mapping = new Mapping(this._layout);

	if (this.manager) {
		this.manager.applyLayout(this._layout);
	}

	return this._layout;
};

// none | auto (TODO: implement landscape, portrait, both)
Rendition.prototype.spread = function(spread, min){

	this._layout.spread(spread, min);

	if (this.manager.isRendered()) {
		this.manager.updateLayout();
	}
};


Rendition.prototype.reportLocation = function(){
  return this.q.enqueue(function(){
    this.location = this.manager.currentLocation();
    this.trigger("locationChanged", this.location);
  }.bind(this));
};


Rendition.prototype.destroy = function(){
  // Clear the queue
	this.q.clear();

	this.views.clear();

	clearTimeout(this.trimTimeout);
	if(this.settings.hidden) {
		this.element.removeChild(this.wrapper);
	} else {
		this.element.removeChild(this.container);
	}

};

Rendition.prototype.passViewEvents = function(view){
  view.contents.listenedEvents.forEach(function(e){
		view.on(e, this.triggerViewEvent.bind(this));
	}.bind(this));

	view.on("selected", this.triggerSelectedEvent.bind(this));
};

Rendition.prototype.triggerViewEvent = function(e){
  this.trigger(e.type, e);
};

Rendition.prototype.triggerSelectedEvent = function(cfirange){
  this.trigger("selected", cfirange);
};

Rendition.prototype.replacements = function(){
	// Wait for loading
	return this.q.enqueue(function () {
		// Get thes books manifest
		var manifest = this.book.package.manifest;
	  var manifestArray = Object.keys(manifest).
	    map(function (key){
	      return manifest[key];
	    });

	  // Exclude HTML
	  var items = manifestArray.
	    filter(function (item){
	      if (item.type != "application/xhtml+xml" &&
	          item.type != "text/html") {
	        return true;
	      }
	    });

	  // Only CSS
	  var css = items.
	    filter(function (item){
	      if (item.type === "text/css") {
	        return true;
	      }
	    });

		// Css Urls
		var cssUrls = css.map(function(item) {
			return item.href;
		});

		// All Assets Urls
	  var urls = items.
	    map(function(item) {
	      return item.href;
	    }.bind(this));

		// Create blob urls for all the assets
	  var processing = urls.
	    map(function(url) {
				var absolute = URI(url).absoluteTo(this.book.baseUrl).toString();
				// Full url from archive base
	      return this.book.unarchived.createUrl(absolute, {"base64": this.settings.useBase64});
	    }.bind(this));

		// After all the urls are created
	  return RSVP.all(processing).
	    then(function(replacementUrls) {

				// Replace Asset Urls in the text of all css files
				cssUrls.forEach(function(href) {
					this.replaceCss(href, urls, replacementUrls);
		    }.bind(this));

				// Replace Asset Urls in chapters
				// by registering a hook after the sections contents has been serialized
	      this.book.spine.hooks.serialize.register(function(output, section) {
					this.replaceAssets(section, urls, replacementUrls);
	      }.bind(this));

	    }.bind(this)).catch(function(reason){
	      console.error(reason);
	    });
	}.bind(this));
};

Rendition.prototype.replaceCss = function(href, urls, replacementUrls){
		var newUrl;
		var indexInUrls;

		// Find the absolute url of the css file
		var fileUri = URI(href);
		var absolute = fileUri.absoluteTo(this.book.baseUrl).toString();
		// Get the text of the css file from the archive
		var textResponse = this.book.unarchived.getText(absolute);
		// Get asset links relative to css file
		var relUrls = urls.
			map(function(assetHref) {
				var assetUri = URI(assetHref).absoluteTo(this.book.baseUrl);
				var relative = assetUri.relativeTo(absolute).toString();
				return relative;
			}.bind(this));

		return textResponse.then(function (text) {
			// Replacements in the css text
			text = replace.substitute(text, relUrls, replacementUrls);

			// Get the new url
			if (this.settings.useBase64) {
				core.createBlobUrl(text, 'text/css', function(newUrl) {
					// switch the url in the replacementUrls
					indexInUrls = urls.indexOf(href);
					if (indexInUrls > -1) {
						replacementUrls[indexInUrls] = newUrl;
					}
				});
			} else {
				newUrl = core.createBlobUrl(text, 'text/css');

				// switch the url in the replacementUrls
				indexInUrls = urls.indexOf(href);
				if (indexInUrls > -1) {
					replacementUrls[indexInUrls] = newUrl;
				}
			}

		}.bind(this));

};

Rendition.prototype.replaceAssets = function(section, urls, replacementUrls){
	var fileUri = URI(section.url);
	// Get Urls relative to current sections
	var relUrls = urls.
		map(function(href) {
			var assetUri = URI(href).absoluteTo(this.book.baseUrl);
			var relative = assetUri.relativeTo(fileUri).toString();
			return relative;
		}.bind(this));


	section.output = replace.substitute(section.output, relUrls, replacementUrls);
};

Rendition.prototype.range = function(_cfi, ignoreClass){
  var cfi = new EpubCFI(_cfi);
  var found = this.visible().filter(function (view) {
		if(cfi.spinePos === view.index) return true;
	});

	// Should only every return 1 item
  if (found.length) {
    return found[0].range(cfi, ignoreClass);
  }
};

Rendition.prototype.adjustImages = function(view) {

  view.addStylesheetRules([
      ["img",
        ["max-width", (view.layout.spread) + "px"],
        ["max-height", (view.layout.height) + "px"]
      ]
  ]);
  return new RSVP.Promise(function(resolve, reject){
    // Wait to apply
    setTimeout(function() {
      resolve();
    }, 1);
  });
};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(Rendition.prototype);

module.exports = Rendition;
