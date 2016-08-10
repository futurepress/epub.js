var RSVP = require('rsvp');
var core = require('../core');
var ContinuousViewManager = require('./continuous');
var Mapping = require('../map');
var Layout = require('../layout');

function PaginatedViewManager(options) {

  ContinuousViewManager.apply(this, arguments); // call super constructor.

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

  core.defaults(this.settings, options.settings || {});

  // Gap can be 0, byt defaults doesn't handle that
  if (options.settings.gap != "undefined" && options.settings.gap === 0) {
    this.settings.gap = options.settings.gap;
  }

  this.isForcedSingle = this.settings.forceSingle;

  this.viewSettings.axis = this.settings.axis;

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


// PaginatedViewManager.prototype.addEventListeners = function(){
  // On display
  // this.layoutSettings = this.reconcileLayoutSettings(globalLayout, chapter.properties);
  // this.layoutMethod = this.determineLayout(this.layoutSettings);
  // this.layout = new EPUBJS.Layout[this.layoutMethod]();
  //this.hooks.display.register(this.registerLayoutMethod.bind(this));
  // this.hooks.display.register(this.reportLocation);
  // this.on('displayed', this.reportLocation.bind(this));

  // this.hooks.content.register(this.adjustImages.bind(this));

  // this.currentPage = 0;

  // window.addEventListener('unload', function(e){
  //   this.ignore = true;
  //   this.destroy();
  // }.bind(this));

// };


PaginatedViewManager.prototype.applyLayoutMethod = function() {
  //var task = new RSVP.defer();

  // this.spreads = this.determineSpreads(this.settings.minSpreadWidth);
  console.log(this.settings.globalLayoutProperties);
  this.layout = new Layout.Reflowable();

  this.updateLayout();

  this.setLayout(this.layout);

  this.stage.addStyleRules("iframe", [{"margin-right" : this.layout.gap + "px"}]);

  // Set the look ahead offset for what is visible
  this.settings.offset = this.layout.delta;

  this.mapping = new Mapping(this.layout);

  // this.hooks.layout.register(this.layout.format.bind(this));

  //task.resolve();
  //return task.promise;
  // return layout;
};

PaginatedViewManager.prototype.updateLayout = function() {

  this.spreads = this.determineSpreads(this.settings.minSpreadWidth);

  this.layout.calculate(
    this._stageSize.width,
    this._stageSize.height,
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
    this.scrollLeft = this.container.scrollLeft;

    if(this.container.scrollLeft +
       this.container.offsetWidth +
       this.layout.delta < this.container.scrollWidth) {
      this.scrollBy(this.layout.delta, 0);
    } else {
      // this.scrollTo(this.container.scrollWidth, 0);
      this.scrollTo(this.container.scrollWidth - this.layout.delta, 0);
    }
    // this.reportLocation();
    // this.check();
};

PaginatedViewManager.prototype.prev = function(){

    this.scrollBy(-this.layout.delta, 0);
    // this.reportLocation();
    // this.check();

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

    return this.mapping.page(visible[0], startA, endA);
  }

  if(visible.length > 1) {

    // Left Col
    startA = container.left - visible[0].position().left;
    endA = startA + this.layout.column;

    // Right Col
    startB = container.left + this.layout.spread - visible[visible.length-1].position().left;
    endB = startB + this.layout.column;

    pageLeft = this.mapping.page(visible[0], startA, endA);
    pageRight = this.mapping.page(visible[visible.length-1], startB, endB);

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




module.exports = PaginatedViewManager;
