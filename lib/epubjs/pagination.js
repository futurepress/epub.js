EPUBJS.Paginate = function(renderer, _options) {
  var options = _options || {};
  var defaults = {
    width: 600,
    height: 400,
    forceSingle: false,
    minSpreadWidth: 800, //-- overridden by spread: none (never) / both (always)
    gap: "auto", //-- "auto" or int
    layoutOveride : null // Default: { spread: 'reflowable', layout: 'auto', orientation: 'auto'}
  };

  this.settings = EPUBJS.core.defaults(options, defaults);
  this.renderer = renderer;

  this.isForcedSingle = false;

  this.initialize();
};

EPUBJS.Paginate.prototype.determineSpreads = function(cutoff){
  if(this.isForcedSingle || !cutoff || this.width < cutoff) {
    return false; //-- Single Page
  }else{
    return true; //-- Double Page
  }
};

EPUBJS.Paginate.prototype.forceSingle = function(bool){
  if(bool) {
    this.isForcedSingle = true;
    // this.spreads = false;
  } else {
    this.isForcedSingle = false;
    // this.spreads = this.determineSpreads(this.minSpreadWidth);
  }
};

/**
* Uses the settings to determine which Layout Method is needed
* Triggers events based on the method choosen
* Takes: Layout settings object
* Returns: String of appropriate for EPUBJS.Layout function
*/
EPUBJS.Paginate.prototype.determineLayout = function(settings){
  // Default is layout: reflowable & spread: auto
  var spreads = this.determineSpreads(this.settings.minSpreadWidth);
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
  // this.render.scroll(scroll);

  return layoutMethod;
};

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* Takes: global layout settings object, chapter properties string
* Returns: Object with layout properties
*/
EPUBJS.Paginate.prototype.reconcileLayoutSettings = function(global, chapter){
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

EPUBJS.Paginate.prototype.initialize = function(){
  // On display
  // this.layoutSettings = this.reconcileLayoutSettings(globalLayout, chapter.properties);
  // this.layoutMethod = this.determineLayout(this.layoutSettings);
  // this.layout = new EPUBJS.Layout[this.layoutMethod]();
  this.renderer.hooks.display.register(this.registerLayoutMethod.bind(this));
};

EPUBJS.Paginate.prototype.registerLayoutMethod = function(view) {
  var task = new RSVP.defer();

  this.layoutMethod = this.determineLayout({});
  this.layout = new EPUBJS.Layout[this.layoutMethod]();
  this.formated = this.layout.format(view, this.settings.width, this.settings.height, this.settings.gap);

  task.resolve();
  return task.promise;
};

EPUBJS.Paginate.prototype.page = function(pg){

 
  //-- Return false if page is greater than the total
  return false;
};

EPUBJS.Paginate.prototype.next = function(){
  // return this.page(this.chapterPos + 1);
  console.log("next", this.formated.pageWidth)
  this.renderer.infinite.scrollBy(this.formated.pageWidth, 0);
};

EPUBJS.Paginate.prototype.prev = function(){
  console.log("prev", this.formated.pageWidth)
  this.renderer.infinite.scrollBy(-this.formated.pageWidth, 0);
};

EPUBJS.Paginate.prototype.display = function(what){
  return this.renderer.display(what)
};