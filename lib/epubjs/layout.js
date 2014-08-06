EPUBJS.Layout = function(){};

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* Takes: global layout settings object, chapter properties string
* Returns: Object with layout properties
*/
EPUBJS.Layout.prototype.reconcileLayoutSettings = function(global, chapter){
  var settings = {};

  //-- Get the global defaults
  for (var attr in global) {
    if (global.hasOwnProperty(attr)){
      settings[attr] = global[attr];
    }
  }
  //-- Get the chapter's display type
  chapter.forEach(function(prop){
    var rendition = prop.replace("rendition:", '');
    var split = rendition.indexOf("-");
    var property, value;

    if(split != -1){
      property = rendition.slice(0, split);
      value = rendition.slice(split+1);

      settings[property] = value;
    }
  });
 return settings;
};

/**
* Uses the settings to determine which Layout Method is needed
* Triggers events based on the method choosen
* Takes: Layout settings object
* Returns: String of appropriate for EPUBJS.Layout function
*/
EPUBJS.Layout.prototype.determineLayout = function(settings){
  // Default is layout: reflowable & spread: auto
  var spreads = this.determineSpreads(this.minSpreadWidth);
  var layoutMethod = spreads ? "ReflowableSpreads" : "Reflowable";
  var scroll = false;

  if(settings.layout === "pre-paginated") {
    layoutMethod = "Fixed";
    scroll = true;
    spreads = false;
  }

  if(settings.layout === "reflowable" && settings.spread === "none") {
    layoutMethod = "Reflowable";
    scroll = false;
    spreads = false;
  }

  if(settings.layout === "reflowable" && settings.spread === "both") {
    layoutMethod = "ReflowableSpreads";
    scroll = false;
    spreads = true;
  }

  this.spreads = spreads;
  this.render.scroll(scroll);
  this.trigger("renderer:spreads", spreads);
  return layoutMethod;
};

//-- STYLES

EPUBJS.Layout.prototype.applyStyles = function(styles) {
  for (var style in styles) {
    for (var view in this.views) {
      view.setStyle(style, styles[style]);
    }
  }
};

EPUBJS.Layout.prototype.setStyle = function(style, val, prefixed){
  for (var view in this.views) {
    view.setStyle(style, val, prefixed);
  }
};

EPUBJS.Layout.prototype.removeStyle = function(style){
  for (var view in this.views) {
    view.removeStyle(style);
  }
};

//-- HEAD TAGS
EPUBJS.Layout.prototype.applyHeadTags = function(headTags) {
  for ( var headTag in headTags ) {
    this.render.addHeadTag(headTag, headTags[headTag]);
  }
};