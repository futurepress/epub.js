var core = require('./core');
var RSVP = require('rsvp');

function Reflowable(){
  this.columnAxis = core.prefixed('columnAxis');
  this.columnGap = core.prefixed('columnGap');
  this.columnWidth = core.prefixed('columnWidth');
  this.columnFill = core.prefixed('columnFill');

  this.width = 0;
  this.height = 0;
  this.spread = 0;
  this.delta = 0;

  this.column = 0;
  this.gap = 0;
  this.divisor = 0;

  this.name = "reflowable";
};

Reflowable.prototype.calculate = function(_width, _height, _gap, _devisor){

  var divisor = _devisor || 1;

  //-- Check the width and create even width columns
  var fullWidth = Math.floor(_width);
  var width = _width; //(fullWidth % 2 === 0) ? fullWidth : fullWidth - 1;

  var section = Math.floor(width / 8);
  var gap = (_gap >= 0) ? _gap : ((section % 2 === 0) ? section : section - 1);


  var colWidth;
  var spreadWidth;
  var delta;

  //-- Double Page
  if(divisor > 1) {
    colWidth = Math.floor((width - gap) / divisor);
  } else {
    colWidth = width;
  }

  spreadWidth = colWidth * divisor;

  delta = (colWidth + gap) * divisor;

  this.width = width;
  this.height = _height;
  this.spread = spreadWidth;
  this.delta = delta;

  this.column = colWidth;
  this.gap = gap;
  this.divisor = divisor;

};

Reflowable.prototype.format = function(contents){
  var promises = [];
  // var $doc = doc.documentElement;
  // var $body = doc.body;//view.document.querySelector("body");

  // $doc.style.overflow = "hidden";
  promises.push(contents.overflow("hidden"));

  // Must be set to the new calculated width or the columns will be off
  // $body.style.width = this.width + "px";
  // $doc.style.width = this.width + "px";
  promises.push(contents.width(this.width));

  //-- Adjust height
  // $body.style.height = this.height + "px";
  promises.push(contents.height(this.height));

  promises.push(contents.css("margin", "0"));

  //-- Add columns
  // $body.style[this.columnAxis] = "horizontal";
  promises.push(contents.css(this.columnAxis, "horizontal"));
  // $body.style[this.columnFill] = "auto";
  promises.push(contents.css(this.columnFill, "auto"));
  // $body.style[this.columnGap] = this.gap+"px";
  promises.push(contents.css(this.columnGap, this.gap+"px"));
  // $body.style[this.columnWidth] = this.column +"px";
  promises.push(contents.css(this.columnWidth, this.column+"px"));

  // Add extra padding for the gap between this and the next view
  // view.iframe.style.marginRight = this.gap+"px";
  return RSVP.all(promises);
};

Reflowable.prototype.count = function(totalWidth) {
  // var totalWidth = view.root().scrollWidth;
  var spreads = Math.ceil(totalWidth / this.spread);

  return {
    spreads : spreads,
    pages : spreads * this.divisor
  };
};

function Fixed(_width, _height){
  this.width = 0;
  this.height = 0;
  this.spread = 0;
  this.delta = 0;

  this.column = 0;
  this.gap = 0;
  this.divisor = 0;

  this.name = "pre-paginated";

};

Fixed.prototype.calculate = function(_width, _height, _gap, _devisor){
  var divisor = _devisor || 1;
  var section = Math.floor(_width / 8);
  var gap = (_gap >= 0) ? _gap : ((section % 2 === 0) ? section : section - 1);


  var colWidth;
  var spreadWidth;
  var delta;

  //-- Double Page
  if(divisor > 1) {
    colWidth = Math.floor((_width - gap) / divisor);
  } else {
    colWidth = _width;
  }

  spreadWidth = colWidth * divisor;

  delta = (colWidth + gap) * divisor;

  this.width = colWidth;
  this.height = _height;
  this.spread = spreadWidth;
  this.delta = delta;

  this.column = colWidth;
  this.gap = gap;
  this.divisor = divisor;

};

Fixed.prototype.format = function(contents){
  var promises = [];
  var viewport = contents.viewport();

  var width = viewport.width;
  var height = viewport.height;
  var widthScale = this.column / width;
  var heightScale = this.height / height;
  var scale = widthScale < heightScale ? widthScale : heightScale;

  var offsetX = (this.width - (width * scale)) / 2;
  var offsetY = (this.height - (height * scale)) / 2;

  promises.push(contents.width(this.width));
  promises.push(contents.height(this.height));

  promises.push(contents.css("position", "absolute"));
  promises.push(contents.css("transform", "scale(" + scale + ")"));

  promises.push(contents.overflow("hidden"));

  promises.push(contents.css("transformOrigin", "top left"));

  promises.push(contents.css("backgroundColor", "transparent"));

  promises.push(contents.css("marginTop", offsetY + "px"));
  // promises.push(contents.css("marginLeft", offsetX + "px"));


  // page.style.transformOrigin = "top left";
  // if (!view.offsetRight) {
  //    page.style.transformOrigin = "top right";
  //    page.style.right = 0;
  //    page.style.left = "auto";
  // }

  //-- Scroll
  // $doc.style.overflow = "auto";
  // promises.push(contents.overflow("auto"));

  return RSVP.all(promises);

};

Fixed.prototype.count = function(){
  return {
    spreads : 1,
    pages : 1
  };
};

function Scroll(){
  this.width = 0;
  this.height = 0;
  this.spread = 0;
  this.column = 0;
  this.gap = 0;
  this.name = "scrolled";
};

Scroll.prototype.calculate = function(_width, _height){
  this.spread = _width;
  this.column = _width;
  this.gap = 0;
};

Scroll.prototype.format = function(contents){
  var promises = [];
  // var $doc = doc.documentElement;

  // $doc.style.width = "auto";
  // $doc.style.height = "auto";
  // contents.width("auto");
  promises.push(contents.height("auto"));

  return RSVP.all(promises);

};

Scroll.prototype.count = function(){
  return {
    spreads : 1,
    pages : 1
  };
};

module.exports = {
  'Reflowable': Reflowable,
  'Fixed': Fixed,
  'Scroll': Scroll
};
