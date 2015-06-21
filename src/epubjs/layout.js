EPUBJS.Layout = EPUBJS.Layout || {};

EPUBJS.Layout.Reflowable = function(){

};

EPUBJS.Layout.Reflowable.prototype.calculate = function(_width, _height, _gap, _devisor){

  var divisor = _devisor || 1;

  //-- Check the width and create even width columns
  var fullWidth = Math.floor(_width);
  var width = (fullWidth % 2 === 0) ? fullWidth : fullWidth - 1;

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
  


  this.columnAxis = EPUBJS.core.prefixed('columnAxis');
  this.columnGap = EPUBJS.core.prefixed('columnGap');
  this.columnWidth = EPUBJS.core.prefixed('columnWidth');
  this.columnFill = EPUBJS.core.prefixed('columnFill');

  this.width = width;
  this.height = _height;
  this.spread = spreadWidth;
  this.delta = delta;

  this.column = colWidth;
  this.gap = gap;
  this.divisor = divisor;

};

EPUBJS.Layout.Reflowable.prototype.format = function(view){

  var $doc = view.document.documentElement;
  var $body = view.document.body;//view.document.querySelector("body");

  $doc.style.overflow = "hidden";

  // Must be set to the new calculated width or the columns will be off
  // $body.style.width = this.width + "px";
  $doc.style.width = this.width + "px";

  //-- Adjust height
  $body.style.height = this.height + "px";

  //-- Add columns
  $body.style[this.columnAxis] = "horizontal";
  $body.style[this.columnFill] = "auto";
  $body.style[this.columnGap] = this.gap+"px";
  $body.style[this.columnWidth] = this.column+"px";

  // Add extra padding for the gap between this and the next view
  view.iframe.style.marginRight = this.gap+"px";
};

EPUBJS.Layout.Reflowable.prototype.count = function(view) {
  var totalWidth = view.root().scrollWidth;
  var spreads = Math.ceil(totalWidth / this.spread);

  return {
    spreads : spreads,
    pages : spreads * this.divisor
  };
};

EPUBJS.Layout.Fixed = function(_width, _height){

};

EPUBJS.Layout.Fixed.prototype.calculate = function(_width, _height){

};

EPUBJS.Layout.Fixed.prototype.format = function(view){
  var width, height;

  var $doc = view.document.documentElement;
  var $viewport = documentElement.querySelector("[name=viewport");

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

  //-- Adjust width and height
  // $doc.style.width =  width + "px" || "auto";
  // $doc.style.height =  height + "px" || "auto";
  view.resize(width, height);

  //-- Scroll
  $doc.style.overflow = "auto";

};

EPUBJS.Layout.Fixed.prototype.count = function(){
  return {
    spreads : 1,
    pages : 1
  };
};

EPUBJS.Layout.Scroll = function(){

};

EPUBJS.Layout.Scroll.prototype.calculate = function(_width, _height){
  this.spread = _width;
  this.column = _width;
  this.gap = 0;
};

EPUBJS.Layout.Scroll.prototype.format = function(view){

  var $doc = view.document.documentElement;

  $doc.style.width = "auto";
  $doc.style.height = "auto";

};

EPUBJS.Layout.Scroll.prototype.count = function(){
  return {
    spreads : 1,
    pages : 1
  };
};
