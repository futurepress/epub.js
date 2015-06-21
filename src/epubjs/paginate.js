EPUBJS.Paginate = function(book, options) {

  EPUBJS.Continuous.apply(this, arguments);

  this.settings = EPUBJS.core.extend(this.settings || {}, {
    width: 600,
    height: 400,
    axis: "horizontal",
    forceSingle: false,
    minSpreadWidth: 800, //-- overridden by spread: none (never) / both (always)
    gap: "auto", //-- "auto" or int
    overflow: "hidden",
    infinite: false
  });

  EPUBJS.core.extend(this.settings, options);

  this.isForcedSingle = this.settings.forceSingle;

  this.viewSettings = {
    axis: this.settings.axis
  };
  
  this.start();
};

EPUBJS.Paginate.prototype = Object.create(EPUBJS.Continuous.prototype);
EPUBJS.Paginate.prototype.constructor = EPUBJS.Paginate;


EPUBJS.Paginate.prototype.determineSpreads = function(cutoff){
  if(this.isForcedSingle || !cutoff || this.bounds().width < cutoff) {
    return 1; //-- Single Page
  }else{
    return 2; //-- Double Page
  }
};

EPUBJS.Paginate.prototype.forceSingle = function(bool){
  if(bool === false) {
    this.isForcedSingle = false;
    // this.spreads = false;
  } else {
    this.isForcedSingle = true;
    // this.spreads = this.determineSpreads(this.minSpreadWidth);
  }
  this.applyLayoutMethod();
};

/**
* Uses the settings to determine which Layout Method is needed
* Triggers events based on the method choosen
* Takes: Layout settings object
* Returns: String of appropriate for EPUBJS.Layout function
*/
// EPUBJS.Paginate.prototype.determineLayout = function(settings){
//   // Default is layout: reflowable & spread: auto
//   var spreads = this.determineSpreads(this.settings.minSpreadWidth);
//   console.log("spreads", spreads, this.settings.minSpreadWidth)
//   var layoutMethod = spreads ? "ReflowableSpreads" : "Reflowable";
//   var scroll = false;
// 
//   if(settings.layout === "pre-paginated") {
//     layoutMethod = "Fixed";
//     scroll = true;
//     spreads = false;
//   }
// 
//   if(settings.layout === "reflowable" && settings.spread === "none") {
//     layoutMethod = "Reflowable";
//     scroll = false;
//     spreads = false;
//   }
// 
//   if(settings.layout === "reflowable" && settings.spread === "both") {
//     layoutMethod = "ReflowableSpreads";
//     scroll = false;
//     spreads = true;
//   }
// 
//   this.spreads = spreads;
// 
//   return layoutMethod;
// };

EPUBJS.Paginate.prototype.start = function(){  
  // On display
  // this.layoutSettings = this.reconcileLayoutSettings(globalLayout, chapter.properties);
  // this.layoutMethod = this.determineLayout(this.layoutSettings);
  // this.layout = new EPUBJS.Layout[this.layoutMethod]();
  //this.hooks.display.register(this.registerLayoutMethod.bind(this));
  this.hooks.display.register(this.reportLocation);
  this.hooks.replacements.register(this.adjustImages.bind(this));

  this.currentPage = 0;

  window.addEventListener('unload', function(e){
    this.ignore = true;
    this.destroy();
  }.bind(this));

};

// EPUBJS.Rendition.prototype.createView = function(section) {
//   var view = new EPUBJS.View(section, this.viewSettings);


//   return view;
// };

EPUBJS.Paginate.prototype.applyLayoutMethod = function() {
  //var task = new RSVP.defer();

  // this.spreads = this.determineSpreads(this.settings.minSpreadWidth);

  this.layout = new EPUBJS.Layout.Reflowable();

  this.updateLayout();

  // Set the look ahead offset for what is visible

  this.map = new EPUBJS.Map(this.layout);

  // this.hooks.layout.register(this.layout.format.bind(this));

  //task.resolve();
  //return task.promise;
  // return layout;
};

EPUBJS.Paginate.prototype.updateLayout = function() {
  
  this.spreads = this.determineSpreads(this.settings.minSpreadWidth);

  this.layout.calculate(
    this.stage.width, 
    this.stage.height, 
    this.settings.gap,
    this.spreads
  );

  this.settings.offset = this.layout.delta;  

};

EPUBJS.Paginate.prototype.moveTo = function(offset){
  var dist = Math.floor(offset.left / this.layout.delta) * this.layout.delta;
  return this.check(0, dist+this.settings.offset).then(function(){
    this.scrollBy(dist, 0);
  }.bind(this));
};

EPUBJS.Paginate.prototype.page = function(pg){
  
  // this.currentPage = pg;
  // this.renderer.infinite.scrollTo(this.currentPage * this.formated.pageWidth, 0);
  //-- Return false if page is greater than the total
  // return false;
};

EPUBJS.Paginate.prototype.next = function(){

  return this.q.enqueue(function(){
    this.scrollBy(this.layout.delta, 0);
    this.reportLocation();
    return this.check();
  });

  // return this.page(this.currentPage + 1);
};

EPUBJS.Paginate.prototype.prev = function(){

  return this.q.enqueue(function(){
    this.scrollBy(-this.layout.delta, 0);
    this.reportLocation();
    return this.check();
  });
  // return this.page(this.currentPage - 1);
};

EPUBJS.Paginate.prototype.reportLocation = function(){
  return this.q.enqueue(function(){
    this.location = this.currentLocation();
    this.trigger("locationChanged", this.location);
  }.bind(this));
};

EPUBJS.Paginate.prototype.currentLocation = function(){
  var visible = this.visible();
  var startA, startB, endA, endB;
  var pageLeft, pageRight;
  var container = this.container.getBoundingClientRect()

  if(visible.length === 1) {
    startA = container.left - visible[0].position().left;
    endA = startA + this.layout.spread;

    return this.map.page(visible[0], startA, endA);
  }

  if(visible.length > 1) {

    // Left Col
    startA = container.left - visible[0].position().left;
    endA = startA + this.layout.column;

    // Right Col
    startB = container.left + this.layout.spread - visible[visible.length-1].position().left;
    endB = startB + this.layout.column;

    pageLeft = this.map.page(visible[0], startA, endA);
    pageRight = this.map.page(visible[visible.length-1], startB, endB);

    return {
      start: pageLeft.start,
      end: pageRight.end
    }
  }
  
};

EPUBJS.Paginate.prototype.resize = function(width, height){
  // Clear the queue
  this.q.clear();

  this.stageSize(width, height);

  this.updateLayout();

  this.display(this.location.start);

  this.trigger("resized", {
    width: this.stage.width,
    height: this.stage.height
  });

};

EPUBJS.Paginate.prototype.onResized = function(e) {

  this.clear();

  clearTimeout(this.resizeTimeout);
  this.resizeTimeout = setTimeout(function(){
    this.resize();
  }.bind(this), 150);
};

EPUBJS.Paginate.prototype.adjustImages = function(view) {
  
  view.addStylesheetRules([
      ["img", 
        ["max-width", (this.layout.spread) + "px"],
        ["max-height", (this.layout.height) + "px"]
      ]
  ]);
  return new RSVP.Promise(function(resolve, reject){
    // Wait to apply
    setTimeout(function() {
      resolve();
    }, 1);
  });
};

// EPUBJS.Paginate.prototype.display = function(what){
//   return this.display(what);
// };