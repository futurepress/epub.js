var RSVP = require('rsvp');
var core = require('./core');
var EpubCFI = require('./epubcfi');

function Contents(doc, content) {
  // Blank Cfi for Parsing
  this.epubcfi = new EpubCFI();

  this.document = doc;
  this.documentElement =  this.document.documentElement;
  this.content = content || this.document.body;
  this.window = this.document.defaultView;
  // Dom events to listen for
  this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

};

Contents.prototype.width = function(w) {

  if (w && core.isNumber(w)) {
    w = w + "px";
  }

  if (w) {
    this.documentElement.style.width = w;
  }

  return this.window.getComputedStyle(this.documentElement)['width'];


};

Contents.prototype.height = function(h) {

  if (h && core.isNumber(h)) {
    h = h + "px";
  }

  if (h) {
    this.documentElement.style.height = h;
  }

  return this.window.getComputedStyle(this.documentElement)['height'];

};

Contents.prototype.textWidth = function() {
  var width;
  var range = this.document.createRange();

  // Select the contents of frame
  range.selectNodeContents(this.content);

  // get the width of the text content
  width = range.getBoundingClientRect().width;
  return width;

};

Contents.prototype.textHeight = function() {
  var height;
  var range = this.document.createRange();


  range.selectNodeContents(this.content);

  height = range.getBoundingClientRect().height;

  return height;
};

Contents.prototype.scrollWidth = function(min) {
  var prev;
  var width = this.document.body.scrollWidth;

  return width;
};

Contents.prototype.scrollHeight = function(min) {
  var prev;
  var height = this.document.body.scrollHeight;

  return height;
};

Contents.prototype.overflow = function(overflow) {

  if (h) {
    this.documentElement.style.overflow = overflow;
  }

  return this.window.getComputedStyle(this.documentElement)['overflow'];
};

Contents.prototype.css = function(property, value) {

  if (value) {
    this.content.style[property] = value;
  }

  return this.window.getComputedStyle(this.content)[property];
};

Contents.prototype.viewport = function() {
  var width, height;
  var $doc = this.document.documentElement;
  var $viewport = $doc.querySelector("[name=viewport");

  /**
  * check for the viewport size
  * <meta name="viewport" content="width=1024,height=697" />
  */
  if($viewport && $viewport.hasAttribute("content")) {
    content = $viewport.getAttribute("content");
    contents = content.split(',');
    if(contents[0]){
      width = contents[0].replace("width=", '');
    }
    if(contents[1]){
      height = contents[1].replace("height=", '');
    }
  }

  return {
    width: width,
    height: height
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

Contents.prototype.listeners = function() {

  this.imageLoadListeners();

  this.mediaQueryListeners();

  this.addEventListeners();

  this.addSelectionListeners();
};

Contents.prototype.removeListeners = function() {

  this.removeEventListeners();

  this.removeSelectionListeners();
};

Contents.prototype.resizeListenters = function() {
  // Test size again
  clearTimeout(this.expanding);
  this.expanding = setTimeout(this.expand.bind(this), 350);
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

Contents.prototype.imageLoadListeners = function(target) {
  var images = this.contentDocument.querySelectorAll("img");
  var img;
  for (var i = 0; i < images.length; i++) {
    img = images[i];

    if (typeof img.naturalWidth !== "undefined" &&
        img.naturalWidth === 0) {
      img.onload = this.expand.bind(this);
    }
  }
};

Contents.prototype.root = function() {
  if(!this.document) return null;
  return this.document.documentElement;
};

Contents.prototype.locationOf = function(target, ignoreClass) {
  var targetPos = {"left": 0, "top": 0};

  if(!this.document) return;

  if(this.epubcfi.isCfiString(target)) {
    range = new EpubCFI(cfi).toRange(this.document, ignoreClass);
    if(range) {
      targetPos = range.getBoundingClientRect();
    }

  } else if(typeof target === "string" &&
    target.indexOf("#") > -1) {

    id = target.substring(target.indexOf("#")+1);
    el = this.document.getElementById(id);

    if(el) {
      targetPos = el.getBoundingClientRect();
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
      cfirange = this.section.cfiFromRange(range);
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
  var map = new Map(layout);
  return map.section();
};

RSVP.EventTarget.mixin(Contents.prototype);

module.exports = Contents;
