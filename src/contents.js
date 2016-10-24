var RSVP = require('rsvp');
var core = require('./core');
var EpubCFI = require('./epubcfi');
var Mapping = require('./mapping');


function Contents(doc, content, cfiBase) {
  // Blank Cfi for Parsing
  this.epubcfi = new EpubCFI();

  this.document = doc;
  this.documentElement =  this.document.documentElement;
  this.content = content || this.document.body;
  this.window = this.document.defaultView;
  // Dom events to listen for
  this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

  this._size = {
    width: 0,
    height: 0
  }

  this.cfiBase = cfiBase || "";

  this.listeners();
};

Contents.prototype.width = function(w) {
  // var frame = this.documentElement;
  var frame = this.content;

  if (w && core.isNumber(w)) {
    w = w + "px";
  }

  if (w) {
    frame.style.width = w;
    // this.content.style.width = w;
  }

  return this.window.getComputedStyle(frame)['width'];


};

Contents.prototype.height = function(h) {
  // var frame = this.documentElement;
  var frame = this.content;

  if (h && core.isNumber(h)) {
    h = h + "px";
  }

  if (h) {
    frame.style.height = h;
    // this.content.style.height = h;
  }

  return this.window.getComputedStyle(frame)['height'];

};

Contents.prototype.contentWidth = function(w) {

  var content = this.content || this.document.body;

  if (w && core.isNumber(w)) {
    w = w + "px";
  }

  if (w) {
    content.style.width = w;
  }

  return this.window.getComputedStyle(content)['width'];


};

Contents.prototype.contentHeight = function(h) {

  var content = this.content || this.document.body;

  if (h && core.isNumber(h)) {
    h = h + "px";
  }

  if (h) {
    content.style.height = h;
  }

  return this.window.getComputedStyle(content)['height'];

};

Contents.prototype.textWidth = function() {
  var width;
  var range = this.document.createRange();
  var content = this.content || this.document.body;

  // Select the contents of frame
  range.selectNodeContents(content);

  // get the width of the text content
  width = range.getBoundingClientRect().width;

  return width;

};

Contents.prototype.textHeight = function() {
  var height;
  var range = this.document.createRange();
  var content = this.content || this.document.body;

  range.selectNodeContents(content);

  height = range.getBoundingClientRect().height;

  return height;
};

Contents.prototype.scrollWidth = function() {
  var width = this.documentElement.scrollWidth;

  return width;
};

Contents.prototype.scrollHeight = function() {
  var height = this.documentElement.scrollHeight;

  return height;
};

Contents.prototype.overflow = function(overflow) {

  if (overflow) {
    this.documentElement.style.overflow = overflow;
  }

  return this.window.getComputedStyle(this.documentElement)['overflow'];
};

Contents.prototype.overflowX = function(overflow) {

  if (overflow) {
    this.documentElement.style.overflowX = overflow;
  }

  return this.window.getComputedStyle(this.documentElement)['overflowX'];
};

Contents.prototype.overflowY = function(overflow) {

  if (overflow) {
    this.documentElement.style.overflowY = overflow;
  }

  return this.window.getComputedStyle(this.documentElement)['overflowY'];
};

Contents.prototype.css = function(property, value) {
  var content = this.content || this.document.body;

  if (value) {
    content.style[property] = value;
  }

  return this.window.getComputedStyle(content)[property];
};

Contents.prototype.viewport = function(options) {
  var width, height, scale, scalable;
  var $viewport = this.document.querySelector("meta[name='viewport']");
  var newContent = '';

  /**
  * check for the viewport size
  * <meta name="viewport" content="width=1024,height=697" />
  */
  if($viewport && $viewport.hasAttribute("content")) {
    content = $viewport.getAttribute("content");
    contents = content.split(/\s*,\s*/);
    if(contents[0]){
      width = contents[0].replace("width=", '').trim();
    }
    if(contents[1]){
      height = contents[1].replace("height=", '').trim();
    }
    if(contents[2]){
      scale = contents[2].replace("initial-scale=", '').trim();
    }
    if(contents[3]){
      scalable = contents[3].replace("user-scalable=", '').trim();
    }
  }

  if (options) {

    newContent += "width=" + (options.width || width);
    newContent += ", height=" + (options.height || height);
    if (options.scale || scale) {
      newContent += ", initial-scale=" + (options.scale || scale);
    }
    if (options.scalable || scalable) {
      newContent += ", user-scalable=" + (options.scalable || scalable);
    }

    if (!$viewport) {
      $viewport = this.document.createElement("meta");
      $viewport.setAttribute("name", "viewport");
      this.document.querySelector('head').appendChild($viewport);
    }

    $viewport.setAttribute("content", newContent);
  }


  return {
    width: parseInt(width),
    height: parseInt(height)
  };
};


// Contents.prototype.layout = function(layoutFunc) {
//
//   this.iframe.style.display = "inline-block";
//
//   // Reset Body Styles
//   this.content.style.margin = "0";
//   //this.document.body.style.display = "inline-block";
//   //this.document.documentElement.style.width = "auto";
//
//   if(layoutFunc){
//     layoutFunc(this);
//   }
//
//   this.onLayout(this);
//
// };
//
// Contents.prototype.onLayout = function(view) {
//   // stub
// };

Contents.prototype.expand = function() {
  this.trigger("expand");
};

Contents.prototype.listeners = function() {

  this.imageLoadListeners();

  this.mediaQueryListeners();

  // this.fontLoadListeners();

  this.addEventListeners();

  this.addSelectionListeners();

  this.resizeListeners();

};

Contents.prototype.removeListeners = function() {

  this.removeEventListeners();

  this.removeSelectionListeners();
};

Contents.prototype.resizeListeners = function() {
  var width, height;
  // Test size again
  clearTimeout(this.expanding);

  width = this.scrollWidth();
  height = this.scrollHeight();

  if (width != this._size.width || height != this._size.height) {

    this._size = {
      width: width,
      height: height
    }

    this.trigger("resize", this._size);
  }

  this.expanding = setTimeout(this.resizeListeners.bind(this), 350);
};

//https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
Contents.prototype.mediaQueryListeners = function() {
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

Contents.prototype.observe = function(target) {
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

Contents.prototype.imageLoadListeners = function(target) {
  var images = this.document.querySelectorAll("img");
  var img;
  for (var i = 0; i < images.length; i++) {
    img = images[i];

    if (typeof img.naturalWidth !== "undefined" &&
        img.naturalWidth === 0) {
      img.onload = this.expand.bind(this);
    }
  }
};

Contents.prototype.fontLoadListeners = function(target) {
  if (!this.document || !this.document.fonts) {
    return;
  }

  this.document.fonts.ready.then(function () {
    this.expand();
  }.bind(this));

};

Contents.prototype.root = function() {
  if(!this.document) return null;
  return this.document.documentElement;
};

Contents.prototype.locationOf = function(target, ignoreClass) {
  var position;
  var targetPos = {"left": 0, "top": 0};

  if(!this.document) return;

  if(this.epubcfi.isCfiString(target)) {
    range = new EpubCFI(target).toRange(this.document, ignoreClass);

    if(range) {
      if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
        position = range.startContainer.getBoundingClientRect();
        targetPos.left = position.left;
        targetPos.top = position.top;
      } else {
        position = range.getBoundingClientRect();
        targetPos.left = position.left;
        targetPos.top = position.top;
      }
    }

  } else if(typeof target === "string" &&
    target.indexOf("#") > -1) {

    id = target.substring(target.indexOf("#")+1);
    el = this.document.getElementById(id);

    if(el) {
      position = el.getBoundingClientRect();
      targetPos.left = position.left;
      targetPos.top = position.top;
    }
  }

  return targetPos;
};

Contents.prototype.addStylesheet = function(src) {
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
Contents.prototype.addStylesheetRules = function(rules) {
  var styleEl;
  var styleSheet;

  if(!this.document) return;

  styleEl = this.document.createElement('style');

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

Contents.prototype.addScript = function(src) {

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

Contents.prototype.addEventListeners = function(){
  if(!this.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.document.addEventListener(eventName, this.triggerEvent.bind(this), false);
  }, this);

};

Contents.prototype.removeEventListeners = function(){
  if(!this.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.document.removeEventListener(eventName, this.triggerEvent, false);
  }, this);

};

// Pass browser events
Contents.prototype.triggerEvent = function(e){
  this.trigger(e.type, e);
};

Contents.prototype.addSelectionListeners = function(){
  if(!this.document) {
    return;
  }
  this.document.addEventListener("selectionchange", this.onSelectionChange.bind(this), false);
};

Contents.prototype.removeSelectionListeners = function(){
  if(!this.document) {
    return;
  }
  this.document.removeEventListener("selectionchange", this.onSelectionChange, false);
};

Contents.prototype.onSelectionChange = function(e){
  if (this.selectionEndTimeout) {
    clearTimeout(this.selectionEndTimeout);
  }
  this.selectionEndTimeout = setTimeout(function() {
    var selection = this.window.getSelection();
    this.triggerSelectedEvent(selection);
  }.bind(this), 500);
};

Contents.prototype.triggerSelectedEvent = function(selection){
	var range, cfirange;

  if (selection && selection.rangeCount > 0) {
    range = selection.getRangeAt(0);
    if(!range.collapsed) {
      // cfirange = this.section.cfiFromRange(range);
      cfirange = new EpubCFI(range, this.cfiBase).toString();
      this.trigger("selected", cfirange);
      this.trigger("selectedRange", range);
    }
  }
};

Contents.prototype.range = function(_cfi, ignoreClass){
  var cfi = new EpubCFI(_cfi);
  return cfi.toRange(this.document, ignoreClass);
};

Contents.prototype.map = function(layout){
  var map = new Mapping(layout);
  return map.section();
};

Contents.prototype.size = function(width, height){

  if (width >= 0) {
    this.width(width);
  }

  if (height >= 0) {
    this.height(height);
  }

  this.css("margin", "0");
  this.css("boxSizing", "border-box");

};

Contents.prototype.columns = function(width, height, columnWidth, gap){
  var COLUMN_AXIS = core.prefixed('columnAxis');
  var COLUMN_GAP = core.prefixed('columnGap');
  var COLUMN_WIDTH = core.prefixed('columnWidth');
  var COLUMN_FILL = core.prefixed('columnFill');
  var textWidth;

  this.width(width);
  this.height(height);

  // Deal with Mobile trying to scale to viewport
  this.viewport({ width: width, height: height, scale: 1.0 });

  // this.overflowY("hidden");
  this.css("overflowY", "hidden");
  this.css("margin", "0");
  this.css("boxSizing", "border-box");
  this.css("maxWidth", "inherit");

  this.css(COLUMN_AXIS, "horizontal");
  this.css(COLUMN_FILL, "auto");

  this.css(COLUMN_GAP, gap+"px");
  this.css(COLUMN_WIDTH, columnWidth+"px");
};

Contents.prototype.scale = function(scale, offsetX, offsetY){
  var scale = "scale(" + scale + ")";
  var translate = '';
  // this.css("position", "absolute"));
  this.css("transformOrigin", "top left");

  if (offsetX >= 0 || offsetY >= 0) {
    translate = " translate(" + (offsetX || 0 )+ "px, " + (offsetY || 0 )+ "px )";
  }

  this.css("transform", scale + translate);
};

Contents.prototype.fit = function(width, height){
  var viewport = this.viewport();
  var widthScale = width / viewport.width;
  var heightScale = height / viewport.height;
  var scale = widthScale < heightScale ? widthScale : heightScale;

  var offsetY = (height - (viewport.height * scale)) / 2;

  this.width(width);
  this.height(height);
  this.overflow("hidden");

  // Deal with Mobile trying to scale to viewport
  this.viewport({ scale: 1.0 });

  // Scale to the correct size
  this.scale(scale, 0, offsetY);

  this.css("backgroundColor", "transparent");
};

Contents.prototype.mapPage = function(cfiBase, start, end) {
  var mapping = new Mapping();

  return mapping.page(this, cfiBase, start, end);
};

Contents.prototype.destroy = function() {
  // Stop observing
  if(this.observer) {
    this.observer.disconnect();
  }

  this.removeListeners();

};

RSVP.EventTarget.mixin(Contents.prototype);

module.exports = Contents;
