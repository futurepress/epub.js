var RSVP = require('rsvp');
var core = require('../core');
var EpubCFI = require('../epubcfi');
var Contents = require('../contents');

function IframeView(section, options) {
  this.settings = core.extend({
    ignoreClass : ''
  }, options || {});

  this.id = "epubjs-view:" + core.uuid();
  this.section = section;
  this.index = section.index;

  this.element = this.createContainer();

  this.added = false;
  this.displayed = false;
  this.rendered = false;

  //this.width  = 0;
  //this.height = 0;

  // Blank Cfi for Parsing
  this.epubcfi = new EpubCFI();

  // Dom events to listen for
  // this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

};

IframeView.prototype.createContainer = function() {
  var element = document.createElement('div');

  element.classList.add("epub-view");


  // this.element.style.minHeight = "100px";
  element.style.height = "0px";
  element.style.width = "0px";
  element.style.overflow = "hidden";

  if(this.settings.axis && this.settings.axis == "horizontal"){
    element.style.display = "inline-block";
  } else {
    element.style.display = "block";
  }

  return element;
};

IframeView.prototype.create = function() {

  if(this.iframe) {
    return this.iframe;
  }

  if(!this.element) {
    this.element = this.createContainer();
  }

  this.iframe = document.createElement('iframe');
  this.iframe.id = this.id;
  this.iframe.scrolling = "no"; // Might need to be removed: breaks ios width calculations
  this.iframe.style.overflow = "hidden";
  this.iframe.seamless = "seamless";
  // Back up if seamless isn't supported
  this.iframe.style.border = "none";

  this.resizing = true;

  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";

  this.iframe.style.width = "0";
  this.iframe.style.height = "0";
  this._width = 0;
  this._height = 0;

  this.element.appendChild(this.iframe);
  this.added = true;

  this.elementBounds = core.bounds(this.element);

  // if(width || height){
  //   this.resize(width, height);
  // } else if(this.width && this.height){
  //   this.resize(this.width, this.height);
  // } else {
  //   this.iframeBounds = core.bounds(this.iframe);
  // }

  // Firefox has trouble with baseURI and srcdoc
  // Disabled for now
  /*
  if(!!("srcdoc" in this.iframe)) {
    this.supportsSrcdoc = true;
  } else {
    this.supportsSrcdoc = false;
  }
  */
  this.supportsSrcdoc = false;

  return this.iframe;
};


IframeView.prototype.lock = function(what, width, height) {
  var elBorders = core.borders(this.element);
  var iframeBorders;

  if(this.iframe) {
    iframeBorders = core.borders(this.iframe);
  } else {
    iframeBorders = {width: 0, height: 0};
  }

  if(what == "width" && core.isNumber(width)){
    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.resize(this.lockedWidth, width); //  width keeps ratio correct
  }

  if(what == "height" && core.isNumber(height)){
    this.lockedHeight = height - elBorders.height - iframeBorders.height;
    this.resize(width, this.lockedHeight);
  }

  if(what === "both" &&
     core.isNumber(width) &&
     core.isNumber(height)){

    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.lockedHeight = height - elBorders.height - iframeBorders.height;

    this.resize(this.lockedWidth, this.lockedHeight);
  }

  if(this.displayed && this.iframe) {

      // this.contents.layout();
      this.expand();

  }



};

IframeView.prototype.expand = function(force) {
  var width = this.lockedWidth;
  var height = this.lockedHeight;

  var textWidth, textHeight;
  // console.log("expanding a")
  if(!this.iframe || this._expanding) return;

  this._expanding = true;

  // Expand Horizontally
  if(height && !width) {
    // Get the width of the text
    textWidth = this.contents.textWidth();
    // Check if the textWidth has changed
    if(textWidth != this._textWidth){
      // Get the contentWidth by resizing the iframe
      // Check with a min reset of the textWidth
      width = this.contentWidth(textWidth);
      // Save the textWdith
      this._textWidth = textWidth;
      // Save the contentWidth
      this._contentWidth = width;
    } else {
      // Otherwise assume content height hasn't changed
      width = this._contentWidth;
    }
  }

  // Expand Vertically
  if(width && !height) {
    textHeight = this.contents.textHeight();
    if(textHeight != this._textHeight){
      height = this.contentHeight(textHeight);
      this._textHeight = textHeight;
      this._contentHeight = height;
    } else {
      height = this._contentHeight;
    }

  }

  // Only Resize if dimensions have changed or
  // if Frame is still hidden, so needs reframing
  if(this._needsReframe || width != this._width || height != this._height){
    this.resize(width, height);
  }

  this._expanding = false;
};

IframeView.prototype.contentWidth = function(min) {
  var prev;
  var width;

  // Save previous width
  prev = this.iframe.style.width;
  // Set the iframe size to min, width will only ever be greater
  // Will preserve the aspect ratio
  this.iframe.style.width = (min || 0) + "px";
  // Get the scroll overflow width
  width = this.contents.scrollWidth();
  // Reset iframe size back
  this.iframe.style.width = prev;
  return width;
};

IframeView.prototype.contentHeight = function(min) {
  var prev;
  var height;

  prev = this.iframe.style.height;
  this.iframe.style.height = (min || 0) + "px";
  height = this.contents.scrollHeight();

  this.iframe.style.height = prev;
  return height;
};


IframeView.prototype.resize = function(width, height) {

  if(!this.iframe) return;

  if(core.isNumber(width)){
    this.iframe.style.width = width + "px";
    this._width = width;
  }

  if(core.isNumber(height)){
    this.iframe.style.height = height + "px";
    this._height = height;
  }

  this.iframeBounds = core.bounds(this.iframe);

  this.reframe(this.iframeBounds.width, this.iframeBounds.height);

};

IframeView.prototype.reframe = function(width, height) {
  //var prevBounds;

  if(!this.displayed) {
    this._needsReframe = true;
    return;
  }

  if(core.isNumber(width)){
    this.element.style.width = width + "px";
  }

  if(core.isNumber(height)){
    this.element.style.height = height + "px";
  }

  this.prevBounds = this.elementBounds;

  this.elementBounds = core.bounds(this.element);

  this.trigger("resized", {
    width: this.elementBounds.width,
    height: this.elementBounds.height,
    widthDelta: this.elementBounds.width - this.prevBounds.width,
    heightDelta: this.elementBounds.height - this.prevBounds.height,
  });

};

// View.prototype.resized = function(e) {
//   /*
//   if (!this.resizing) {
//     if(this.iframe) {
//       // this.expand();
//     }
//   } else {
//     this.resizing = false;
//   }*/
//
// };
/*
View.prototype.render = function(_request) {

  // if(this.rendering){
  //   return this.displayed;
  // }

  this.rendering = true;
  // this.displayingDefer = new RSVP.defer();
  // this.displayedPromise = this.displaying.promise;

  return this.section.render(_request)
    .then(function(contents){
      return this.load(contents);
    }.bind(this));
};
*/

IframeView.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  if(!this.iframe) {
    loading.reject(new Error("No Iframe Available"));
    return loaded;
  }

  this.iframe.onload = function(event) {

    this.onLoad(event, loading);

  }.bind(this);

  if(this.supportsSrcdoc){
    this.iframe.srcdoc = contents;
  } else {

    this.document = this.iframe.contentDocument;

    if(!this.document) {
      loading.reject(new Error("No Document Available"));
      return loaded;
    }

    this.document.open();
    this.document.write(contents);
    this.document.close();

  }

  return loaded;
};

IframeView.prototype.onLoad = function(event, promise) {

    this.window = this.iframe.contentWindow;
    this.document = this.iframe.contentDocument;

    this.contents = new Contents(this.document);

    this.rendering = false;

    promise.resolve(this.contents);
};



// IframeView.prototype.layout = function(layoutFunc) {
//
//   this.iframe.style.display = "inline-block";
//
//   // Reset Body Styles
//   // this.document.body.style.margin = "0";
//   //this.document.body.style.display = "inline-block";
//   //this.document.documentElement.style.width = "auto";
//
//   if(layoutFunc){
//     this.layoutFunc = layoutFunc;
//   }
//
//   this.contents.layout(this.layoutFunc);
//
// };
//
// IframeView.prototype.onLayout = function(view) {
//   // stub
// };

IframeView.prototype.setLayout = function(layoutFunc) {
  this.layoutFunc = layoutFunc;
};

IframeView.prototype.listeners = function() {
  /*
  setTimeout(function(){
    this.window.addEventListener("resize", this.resized.bind(this), false);
  }.bind(this), 10); // Wait to listen for resize events
  */

  // Wait for fonts to load to finish
  // http://dev.w3.org/csswg/css-font-loading/
  // Not implemented fully except in chrome

  if(this.document.fonts && this.document.fonts.status === "loading") {
    // console.log("fonts unloaded");
    this.document.fonts.onloadingdone = function(){
      // console.log("loaded fonts");
      this.expand();
    }.bind(this);
  }

  if(this.section.properties.indexOf("scripted") > -1){
    this.observer = this.observe(this.document.body);
  }

  this.imageLoadListeners();

  this.mediaQueryListeners();

  // this.resizeListenters();

  // this.addEventListeners();

  // this.addSelectionListeners();
};

IframeView.prototype.removeListeners = function() {

  // this.removeEventListeners();

  // this.removeSelectionListeners();
};

IframeView.prototype.resizeListenters = function() {
  // Test size again
  clearTimeout(this.expanding);
  this.expanding = setTimeout(this.expand.bind(this), 350);
};

//https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
IframeView.prototype.mediaQueryListeners = function() {
    var sheets = this.document.styleSheets;
    var mediaChangeHandler = function(m){
      if(m.matches && !this._expanding) {
        setTimeout(this.expand.bind(this), 1);
        // this.expand();
      }
    }.bind(this);

    for (var i = 0; i < sheets.length; i += 1) {
        var rules = sheets[i].cssRules;
        if(!rules) return; // Stylesheets changed
        for (var j = 0; j < rules.length; j += 1) {
            //if (rules[j].constructor === CSSMediaRule) {
            if(rules[j].media){
                var mql = this.window.matchMedia(rules[j].media.mediaText);
                mql.addListener(mediaChangeHandler);
                //mql.onchange = mediaChangeHandler;
            }
        }
    }
};

IframeView.prototype.observe = function(target) {
  var renderer = this;

  // create an observer instance
  var observer = new MutationObserver(function(mutations) {
    if(renderer._expanding) {
      renderer.expand();
    }
    // mutations.forEach(function(mutation) {
    //   console.log(mutation);
    // });
  });

  // configuration of the observer:
  var config = { attributes: true, childList: true, characterData: true, subtree: true };

  // pass in the target node, as well as the observer options
  observer.observe(target, config);

  return observer;
};

// View.prototype.appendTo = function(element) {
//   this.element = element;
//   this.element.appendChild(this.iframe);
// };
//
// View.prototype.prependTo = function(element) {
//   this.element = element;
//   element.insertBefore(this.iframe, element.firstChild);
// };

IframeView.prototype.imageLoadListeners = function(target) {
  var images = this.document.body.querySelectorAll("img");
  var img;
  for (var i = 0; i < images.length; i++) {
    img = images[i];

    if (typeof img.naturalWidth !== "undefined" &&
        img.naturalWidth === 0) {
      img.onload = this.expand.bind(this);
    }
  }
};

IframeView.prototype.display = function() {
  var displayed = new RSVP.defer();

  this.displayed = true;

  // apply the layout function to the contents
  // this.layout(layoutFunc);

  // Expand the iframe to the full size of the content
  this.expand();

  // Listen for event that require an expansion of the iframe
  this.listeners();

  this.trigger("displayed", this);
  this.onDisplayed(this);

  displayed.resolve(this);

  return displayed.promise;
};

IframeView.prototype.show = function() {

  this.element.style.visibility = "visible";

  if(this.iframe){
    this.iframe.style.visibility = "visible";
  }

  this.trigger("shown", this);
};

IframeView.prototype.hide = function() {
  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";

  this.stopExpanding = true;
  this.trigger("hidden", this);
};

IframeView.prototype.position = function() {
  return this.element.getBoundingClientRect();
};

IframeView.prototype.locationOf = function(target) {
  var parentPos = this.iframe.getBoundingClientRect();
  var targetPos = this.contents.locationOf(target, this.settings.ignoreClass);

  return {
    "left": window.scrollX + parentPos.left + targetPos.left,
    "top": window.scrollY + parentPos.top + targetPos.top
  };
};

IframeView.prototype.onDisplayed = function(view) {
  // Stub, override with a custom functions
};

IframeView.prototype.bounds = function() {
  if(!this.elementBounds) {
    this.elementBounds = core.bounds(this.element);
  }
  return this.elementBounds;
};

IframeView.prototype.destroy = function() {
  // Stop observing
  if(this.observer) {
    this.observer.disconnect();
  }

  if(this.displayed){
    this.removeListeners();

    this.stopExpanding = true;
    this.element.removeChild(this.iframe);
    this.displayed = false;
    this.iframe = null;

    this._textWidth = null;
    this._textHeight = null;
    this._width = null;
    this._height = null;
  }
  // this.element.style.height = "0px";
  // this.element.style.width = "0px";
};

RSVP.EventTarget.mixin(IframeView.prototype);

module.exports = IframeView;
