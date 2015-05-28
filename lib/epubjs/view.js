EPUBJS.View = function(section, options) {
  this.settings = options || {};

  this.id = "epubjs-view:" + EPUBJS.core.uuid();
  this.displaying = new RSVP.defer();
  this.displayed = this.displaying.promise;
  this.section = section;
  this.index = section.index;

  this.element = document.createElement('div');
  this.element.classList.add("epub-view");
  

  // this.element.style.minHeight = "100px";
  this.element.style.height = "0px";
  this.element.style.width = "0px";
  this.element.style.overflow = "hidden";

  this.shown = false;
  this.rendered = false;
  
  //this.width  = 0;
  //this.height = 0;


  if(this.settings.axis && this.settings.axis == "horizontal"){
    this.element.style.display = "inline-block";
  } else {
    this.element.style.display = "block";
  }
  
};

EPUBJS.View.prototype.create = function() {

  if(this.iframe) {
    return this.iframe;
  }

  this.iframe = document.createElement('iframe');
  this.iframe.id = this.id;
  this.iframe.scrolling = "no";
  this.iframe.seamless = "seamless";
  // Back up if seamless isn't supported
  this.iframe.style.border = "none";

  this.resizing = true;

  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";
  
  this.element.appendChild(this.iframe);
  this.rendered = true;
  
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


EPUBJS.View.prototype.lock = function(width, height) {
  
  var elBorders = EPUBJS.core.borders(this.element);
  var iframeBorders;

  if(this.iframe) {
    iframeBorders = EPUBJS.core.borders(this.iframe);
  } else {
    iframeBorders = {width: 0, height: 0};
  }


  if(EPUBJS.core.isNumber(width)){
    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.resize(this.lockedWidth, width); //  width keeps ratio correct
  }

  if(EPUBJS.core.isNumber(height)){
    this.lockedHeight = height - elBorders.height - iframeBorders.height;
    this.resize(null, this.lockedHeight);  
  }


  if(this.shown && this.iframe) {

      this.layout();
      this.expand();

  }

  

};

EPUBJS.View.prototype.resize = function(width, height) {
  
  if(!this.iframe) return;

  if(EPUBJS.core.isNumber(width)){
    this.iframe.style.width = width + "px";
  }

  if(EPUBJS.core.isNumber(height)){
    this.iframe.style.height = height + "px";
  }

  this.iframeBounds = EPUBJS.core.bounds(this.iframe);

  this.reframe(this.iframeBounds.width, this.iframeBounds.height);

};

EPUBJS.View.prototype.reframe = function(width, height) {
  //var prevBounds;

  if(!this.shown) return;

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

EPUBJS.View.prototype.display = function(_request) {
  return this.section.render(_request)
    .then(function(contents){
      return this.load(contents);
    }.bind(this))
    .then(this.displaying.resolve.call(this));
};

EPUBJS.View.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  this.document = this.iframe.contentDocument;
  
  if(!this.document) {
    loading.reject(new Error("No Document Available"));
    return loaded;
  }

  this.iframe.addEventListener("load", function(event) {
    
    this.window = this.iframe.contentWindow;
    this.document = this.iframe.contentDocument;

    loading.resolve(this);
    
  }.bind(this));
  
  if(this.supportsSrcdoc){
    this.iframe.srcdoc = contents;
  } else {
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
  // Not implemented fully
  /*
  if(this.document.fonts && this.document.fonts.status === "loading") {
    console.log("fonts unloaded");
    this.document.fonts.onloadingdone = function(){
      console.log("loaded fonts");
      this.expand();
    }.bind(this);
  }
  */
  if(this.section.properties.indexOf("scripted") > -1){
    this.observer = this.observe(this.document.body);
  }

  this.imageLoadListeners();

  this.mediaQueryListeners();

};

EPUBJS.View.prototype.expand = function() {
  var width = this.lockedWidth;
  var height = this.lockedHeight;

  // Resize to the locked width;
  //this.resize(width, height);

  // Expand Vertically
  if(width && !height) {
    height = this.document.documentElement.scrollHeight;
    this.resize(null, height);
  }

  // Expand Horizontally
  if(height && !width) {
    width = this.document.body.scrollWidth;
    this.resize(width, null);
  };

  //this.reframe(width, height);

};

//https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
EPUBJS.View.prototype.mediaQueryListeners = function() {
    var sheets = this.document.styleSheets;
    var mediaChangeHandler = function(m){
      if(m.matches) {
        this.expand();
      }
    }.bind(this);

    for (var i = 0; i < sheets.length; i += 1) {
        var rules = sheets[i].cssRules;

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
    renderer.expand();
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

EPUBJS.View.prototype.show = function() {
  var shown = new RSVP.defer();

  this.shown = true;

  this.layout();

  this.listeners();

  this.expand();

  this.element.style.visibility = "visible";
  this.iframe.style.visibility = "visible";

  this.trigger("shown", this);
  this.onShown(this);

  shown.resolve(this);

  return shown.promise;
};

EPUBJS.View.prototype.hide = function() {
  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";

  this.stopExpanding = true;
  this.trigger("hidden");
};

EPUBJS.View.prototype.position = function() {
  return this.element.getBoundingClientRect();
};

EPUBJS.View.prototype.onShown = function(view) {
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

  if(this.iframe){
    this.stopExpanding = true;
    this.element.removeChild(this.iframe);
    this.shown = false;
    this.iframe = null;
  }

  // this.element.style.height = "0px";
  // this.element.style.width = "0px";
};

EPUBJS.View.prototype.root = function() {
  if(!this.document) return null;
  return this.document.documentElement;
};

RSVP.EventTarget.mixin(EPUBJS.View.prototype);