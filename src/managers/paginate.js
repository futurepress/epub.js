var RSVP = require('rsvp');
var core = require('../core');
var ContinuousViewManager = require('./continuous');
var Map = require('../map');
var Layout = require('../layout');

function PaginatedViewManager(book, options) {

  ContinuousViewManager.apply(arguments);

  this.settings = core.extend(this.settings || {}, {
    width: 600,
    height: 400,
    axis: "horizontal",
    forceSingle: false,
    minSpreadWidth: 800, //-- overridden by spread: none (never) / both (always)
    gap: "auto", //-- "auto" or int
    overflow: "hidden",
    infinite: false
  });

  core.extend(this.settings, options.settings);

  this.isForcedSingle = this.settings.forceSingle;

  this.viewSettings.axis = this.settings.axis;

  // this.start();
};

PaginatedViewManager.prototype = Object.create(ContinuousViewManager.prototype);
PaginatedViewManager.prototype.constructor = PaginatedViewManager;


PaginatedViewManager.prototype.determineSpreads = function(cutoff){
  if(this.isForcedSingle || !cutoff || this.stage.bounds().width < cutoff) {
    return 1; //-- Single Page
  }else{
    return 2; //-- Double Page
  }
};

PaginatedViewManager.prototype.forceSingle = function(bool){
  if(bool === false) {
    this.isForcedSingle = false;
    // this.spreads = false;
  } else {
    this.isForcedSingle = true;
    // this.spreads = this.determineSpreads(this.minSpreadWidth);
  }
  this.applyLayoutMethod();
};


PaginatedViewManager.prototype.addEventListeners = function(){
  // On display
  // this.layoutSettings = this.reconcileLayoutSettings(globalLayout, chapter.properties);
  // this.layoutMethod = this.determineLayout(this.layoutSettings);
  // this.layout = new EPUBJS.Layout[this.layoutMethod]();
  //this.hooks.display.register(this.registerLayoutMethod.bind(this));
  // this.hooks.display.register(this.reportLocation);
  // this.on('displayed', this.reportLocation.bind(this));

  // this.hooks.content.register(this.adjustImages.bind(this));

  this.currentPage = 0;

  window.addEventListener('unload', function(e){
    this.ignore = true;
    this.destroy();
  }.bind(this));

};


PaginatedViewManager.prototype.applyLayoutMethod = function() {
  //var task = new RSVP.defer();

  // this.spreads = this.determineSpreads(this.settings.minSpreadWidth);

  this.layout = new Layout.Reflowable();

  this.updateLayout();

  // Set the look ahead offset for what is visible

  // this.map = new Map(this.layout);

  // this.hooks.layout.register(this.layout.format.bind(this));

  //task.resolve();
  //return task.promise;
  // return layout;
};

PaginatedViewManager.prototype.updateLayout = function() {

  this.spreads = this.determineSpreads(this.settings.minSpreadWidth);

  this.layout.calculate(
    this.stage.width,
    this.stage.height,
    this.settings.gap,
    this.spreads
  );

  this.settings.offset = this.layout.delta;

};

PaginatedViewManager.prototype.moveTo = function(offset){
  var dist = Math.floor(offset.left / this.layout.delta) * this.layout.delta;
  return this.check(0, dist+this.settings.offset).then(function(){
    this.scrollBy(dist, 0);
  }.bind(this));
};

PaginatedViewManager.prototype.page = function(pg){

  // this.currentPage = pg;
  // this.renderer.infinite.scrollTo(this.currentPage * this.formated.pageWidth, 0);
  //-- Return false if page is greater than the total
  // return false;
};

PaginatedViewManager.prototype.next = function(){

    // console.log(this.container.scrollWidth, this.container.scrollLeft + this.container.offsetWidth + this.layout.delta)
    if(this.container.scrollLeft +
       this.container.offsetWidth +
       this.layout.delta < this.container.scrollWidth) {
      this.scrollBy(this.layout.delta, 0);
    } else {
      this.scrollTo(this.container.scrollWidth - this.layout.delta, 0);
    }
    this.reportLocation();
    return this.check();

};

PaginatedViewManager.prototype.prev = function(){

    this.scrollBy(-this.layout.delta, 0);
    this.reportLocation();
    return this.check();

};

// Paginate.prototype.reportLocation = function(){
//   return this.q.enqueue(function(){
//     this.location = this.currentLocation();
//     this.trigger("locationChanged", this.location);
//   }.bind(this));
// };

PaginatedViewManager.prototype.currentLocation = function(){
  var visible = this.visible();
  var startA, startB, endA, endB;
  var pageLeft, pageRight;
  var container = this.container.getBoundingClientRect();

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
    };
  }
};

PaginatedViewManager.prototype.resize = function(width, height){
  // Clear the queue
  this.q.clear();

  this.bounds = this.stage.bounds(width, height);

  // this.updateLayout();

  // if(this.location) {
  //   this.display(this.location.start);
  // }

  this.trigger("resized", {
    width: this.stage.width,
    height: this.stage.height
  });

};

PaginatedViewManager.prototype.onResized = function(e) {

  this.views.clear();

  clearTimeout(this.resizeTimeout);
  this.resizeTimeout = setTimeout(function(){
    this.resize();
  }.bind(this), 150);
};


// Paginate.prototype.display = function(what){
//   return this.display(what);
// };

module.exports = PaginatedViewManager;
