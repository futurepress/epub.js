EPUBJS.View = function(section, options) {
  this.settings = options || {};

  this.id = "epubjs-view:" + EPUBJS.core.uuid();
  this.section = section;
  this.index = section.index;

  this.element = document.createElement('div');
  this.element.classList.add("epub-view");


  // this.element.style.minHeight = "100px";
  this.element.style.height = "0px";
  this.element.style.width = "0px";
  this.element.style.overflow = "hidden";

  this.added = false;
  this.displayed = false;
  this.rendered = false;

  //this.width  = 0;
  //this.height = 0;

  // Blank Cfi for Parsing
  this.epubcfi = new EPUBJS.EpubCFI();

  if(this.settings.axis && this.settings.axis == "horizontal"){
    this.element.style.display = "inline-block";
  } else {
    this.element.style.display = "block";
  }

  // Dom events to listen for
  this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

};

EPUBJS.View.prototype.create = function() {

  if(this.iframe) {
    return this.iframe;
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

  this.elementBounds = EPUBJS.core.bounds(this.element);

  // if(width || height){
  //   this.resize(width, height);
  // } else if(this.width && this.height){
  //   this.resize(this.width, this.height);
  // } else {
  //   this.iframeBounds = EPUBJS.core.bounds(this.iframe);
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


EPUBJS.View.prototype.lock = function(what, width, height) {

  var elBorders = EPUBJS.core.borders(this.element);
  var iframeBorders;

  if(this.iframe) {
    iframeBorders = EPUBJS.core.borders(this.iframe);
  } else {
    iframeBorders = {width: 0, height: 0};
  }

  if(what == "width" && EPUBJS.core.isNumber(width)){
    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.resize(this.lockedWidth, width); //  width keeps ratio correct
  }

  if(what == "height" && EPUBJS.core.isNumber(height)){
    this.lockedHeight = height - elBorders.height - iframeBorders.height;
    this.resize(width, this.lockedHeight);
  }

  if(what === "both" &&
     EPUBJS.core.isNumber(width) &&
     EPUBJS.core.isNumber(height)){

    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.lockedHeight = height - elBorders.height - iframeBorders.height;

    this.resize(this.lockedWidth, this.lockedHeight);
  }

  if(this.displayed && this.iframe) {

      this.layout();
      this.expand();

  }



};

EPUBJS.View.prototype.expand = function(force) {
  var width = this.lockedWidth;
  var height = this.lockedHeight;

  var textWidth, textHeight;
  // console.log("expanding a")
  if(!this.iframe || this._expanding) return;

  this._expanding = true;

  // Expand Horizontally
  if(height && !width) {
    // Get the width of the text
    textWidth = this.textWidth();
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
    textHeight = this.textHeight();
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

EPUBJS.View.prototype.contentWidth = function(min) {
  var prev;
  var width;

  // Save previous width
  prev = this.iframe.style.width;
  // Set the iframe size to min, width will only ever be greater
  // Will preserve the aspect ratio
  this.iframe.style.width = (min || 0) + "px";
  // Get the scroll overflow width
  width = this.document.body.scrollWidth;
  // Reset iframe size back
  this.iframe.style.width = prev;
  return width;
};

EPUBJS.View.prototype.contentHeight = function(min) {
  var prev;
  var height;

  prev = this.iframe.style.height;
  this.iframe.style.height = (min || 0) + "px";
  height = this.document.body.scrollHeight;
  this.iframe.style.height = prev;
  return height;
};

EPUBJS.View.prototype.textWidth = function() {
  var width;
  var range = this.document.createRange();

  // Select the contents of frame
  range.selectNodeContents(this.document.body);

  // get the width of the text content
  width = range.getBoundingClientRect().width;
  return width;

};

EPUBJS.View.prototype.textHeight = function() {
  var height;
  var range = this.document.createRange();

  range.selectNodeContents(this.document.body);

  height = range.getBoundingClientRect().height;
  return height;
};

EPUBJS.View.prototype.resize = function(width, height) {

  if(!this.iframe) return;

  if(EPUBJS.core.isNumber(width)){
    this.iframe.style.width = width + "px";
    this._width = width;
  }

  if(EPUBJS.core.isNumber(height)){
    this.iframe.style.height = height + "px";
    this._height = height;
  }

  this.iframeBounds = EPUBJS.core.bounds(this.iframe);

  this.reframe(this.iframeBounds.width, this.iframeBounds.height);

};

EPUBJS.View.prototype.reframe = function(width, height) {
  //var prevBounds;

  if(!this.displayed) {
    this._needsReframe = true;
    return;
  }

  if(EPUBJS.core.isNumber(width)){
    this.element.style.width = width + "px";
  }

  if(EPUBJS.core.isNumber(height)){
    this.element.style.height = height + "px";
  }

  this.prevBounds = this.elementBounds;

  this.elementBounds = EPUBJS.core.bounds(this.element);

  this.trigger("resized", {
    width: this.elementBounds.width,
    height: this.elementBounds.height,
    widthDelta: this.elementBounds.width - this.prevBounds.width,
    heightDelta: this.elementBounds.height - this.prevBounds.height,
  });

};

EPUBJS.View.prototype.resized = function(e) {
  /*
  if (!this.resizing) {
    if(this.iframe) {
      // this.expand();
    }
  } else {
    this.resizing = false;
  }*/

};

EPUBJS.View.prototype.render = function(_request) {

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

EPUBJS.View.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  if(!this.iframe) {
    loading.reject(new Error("No Iframe Available"));
    return loaded;
  }

  this.iframe.onload = function(event) {

    this.window = this.iframe.contentWindow;
    this.document = this.iframe.contentDocument;
    this.rendering = false;
    loading.resolve(this);

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


EPUBJS.View.prototype.layout = function(layoutFunc) {

  this.iframe.style.display = "inline-block";

  // Reset Body Styles
  this.document.body.style.margin = "0";
  //this.document.body.style.display = "inline-block";
  //this.document.documentElement.style.width = "auto";

  if(layoutFunc){
    layoutFunc(this);
  }

  this.onLayout(this);

};

EPUBJS.View.prototype.onLayout = function(view) {
  // stub
};

EPUBJS.View.prototype.listeners = function() {
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

  this.addEventListeners();

  this.addSelectionListeners();
};

EPUBJS.View.prototype.removeListeners = function() {

  this.removeEventListeners();

  this.removeSelectionListeners();
};

EPUBJS.View.prototype.resizeListenters = function() {
  // Test size again
  clearTimeout(this.expanding);
  this.expanding = setTimeout(this.expand.bind(this), 350);
};

//https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
EPUBJS.View.prototype.mediaQueryListeners = function() {
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

EPUBJS.View.prototype.observe = function(target) {
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

// EPUBJS.View.prototype.appendTo = function(element) {
//   this.element = element;
//   this.element.appendChild(this.iframe);
// };
//
// EPUBJS.View.prototype.prependTo = function(element) {
//   this.element = element;
//   element.insertBefore(this.iframe, element.firstChild);
// };

EPUBJS.View.prototype.imageLoadListeners = function(target) {
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

EPUBJS.View.prototype.display = function() {
  var displayed = new RSVP.defer();

  this.displayed = true;

  this.layout();

  this.listeners();

  this.expand();

  this.trigger("displayed", this);
  this.onDisplayed(this);

  displayed.resolve(this);

  return displayed.promise;
};

EPUBJS.View.prototype.show = function() {

  this.element.style.visibility = "visible";

  if(this.iframe){
    this.iframe.style.visibility = "visible";
  }

  this.trigger("shown", this);
};

EPUBJS.View.prototype.hide = function() {
  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";

  this.stopExpanding = true;
  this.trigger("hidden", this);
};

EPUBJS.View.prototype.position = function() {
  return this.element.getBoundingClientRect();
};

EPUBJS.View.prototype.onDisplayed = function(view) {
  // Stub, override with a custom functions
};

EPUBJS.View.prototype.bounds = function() {
  if(!this.elementBounds) {
    this.elementBounds = EPUBJS.core.bounds(this.element);
  }
  return this.elementBounds;
};

EPUBJS.View.prototype.destroy = function() {
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

EPUBJS.View.prototype.root = function() {
  if(!this.document) return null;
  return this.document.documentElement;
};

EPUBJS.View.prototype.locationOf = function(target) {
  var parentPos = this.iframe.getBoundingClientRect();
  var targetPos = {"left": 0, "top": 0};

  if(!this.document) return;

  if(this.epubcfi.isCfiString(target)) {
    cfi = this.epubcfi.parse(target);

    if(typeof document.evaluate === 'undefined') {
      marker = this.epubcfi.addMarker(cfi, this.document);
      if(marker) {
        // Must Clean up Marker before going to page
        this.epubcfi.removeMarker(marker, this.document);

        targetPos = marker.getBoundingClientRect();
      }
    } else {
      range = this.epubcfi.generateRangeFromCfi(cfi, this.document);
      if(range) {
        targetPos = range.getBoundingClientRect();
      }
    }
  } else if(typeof target === "string" &&
    target.indexOf("#") > -1) {

    id = target.substring(target.indexOf("#")+1);
    el = this.document.getElementById(id);

    if(el) {
      targetPos = el.getBoundingClientRect();
    }
  }

  return {
    "left": window.scrollX + parentPos.left + targetPos.left,
    "top": window.scrollY + parentPos.top + targetPos.top
  };
};

EPUBJS.View.prototype.addCss = function(src) {
  return new RSVP.Promise(function(resolve, reject){
    var $stylesheet;
    var ready = false;

    if(!this.document) {
      resolve(false);
      return;
    }

    $stylesheet = this.document.createElement('link');
    $stylesheet.type = 'text/css';
    $stylesheet.rel = "stylesheet";
    $stylesheet.href = src;
    $stylesheet.onload = $stylesheet.onreadystatechange = function() {
      if ( !ready && (!this.readyState || this.readyState == 'complete') ) {
        ready = true;
        // Let apply
        setTimeout(function(){
          resolve(true);
        }, 1);
      }
    };

    this.document.head.appendChild($stylesheet);

  }.bind(this));
};

// https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
EPUBJS.View.prototype.addStylesheetRules = function(rules) {
  var styleEl;
  var styleSheet;

  if(!this.document) return;

  var styleEl = this.document.createElement('style');

  // Append style element to head
  this.document.head.appendChild(styleEl);

  // Grab style sheet
  styleSheet = styleEl.sheet;

  for (var i = 0, rl = rules.length; i < rl; i++) {
    var j = 1, rule = rules[i], selector = rules[i][0], propStr = '';
    // If the second argument of a rule is an array of arrays, correct our variables.
    if (Object.prototype.toString.call(rule[1][0]) === '[object Array]') {
      rule = rule[1];
      j = 0;
    }

    for (var pl = rule.length; j < pl; j++) {
      var prop = rule[j];
      propStr += prop[0] + ':' + prop[1] + (prop[2] ? ' !important' : '') + ';\n';
    }

    // Insert CSS Rule
    styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);
  }
};

EPUBJS.View.prototype.addScript = function(src) {

  return new RSVP.Promise(function(resolve, reject){
    var $script;
    var ready = false;

    if(!this.document) {
      resolve(false);
      return;
    }

    $script = this.document.createElement('script');
    $script.type = 'text/javascript';
    $script.async = true;
    $script.src = src;
    $script.onload = $script.onreadystatechange = function() {
      if ( !ready && (!this.readyState || this.readyState == 'complete') ) {
        ready = true;
        setTimeout(function(){
          resolve(true);
        }, 1);
      }
    };

    this.document.head.appendChild($script);

  }.bind(this));
};

EPUBJS.View.prototype.addEventListeners = function(){
  if(!this.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.document.addEventListener(eventName, this.triggerEvent.bind(this), false);
  }, this);

};

EPUBJS.View.prototype.removeEventListeners = function(){
  if(!this.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.document.removeEventListener(eventName, this.triggerEvent, false);
  }, this);

};

// Pass browser events
EPUBJS.View.prototype.triggerEvent = function(e){
  this.trigger(e.type, e);
};

EPUBJS.View.prototype.addSelectionListeners = function(){
  if(!this.document) {
    return;
  }
  this.document.addEventListener("selectionchange", this.onSelectionChange.bind(this), false);
};

EPUBJS.View.prototype.removeSelectionListeners = function(){
  if(!this.document) {
    return;
  }
  this.document.removeEventListener("selectionchange", this.onSelectionChange, false);
};

EPUBJS.View.prototype.onSelectionChange = function(e){
  if (this.selectionEndTimeout) {
    clearTimeout(this.selectionEndTimeout);
  }
  this.selectionEndTimeout = setTimeout(function() {
    this.selectedRange = this.window.getSelection();
    this.trigger("selected", this.selectedRange);
  }.bind(this), 500);
};

RSVP.EventTarget.mixin(EPUBJS.View.prototype);
