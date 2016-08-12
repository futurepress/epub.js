var core = require('./core');
var RSVP = require('rsvp');

function Layout(settings){
  this.name = settings.layout || "reflowable";
  this._flow = (settings.flow === "paginated") ? "paginated" : "scrolled";
  this._spread = (settings.spread === "none") ? false : true;
  this.minSpreadWidth = 800;

  this.width = 0;
  this.height = 0;
  this.spreadWidth = 0;
  this.delta = 0;

  this.columnWidth = 0;
  this.gap = 0;
  this.divisor = 1;
};

// paginated | scrolled
Layout.prototype.flow = function(flow) {
  this._flow = (flow === "paginated") ? "paginated" : "scrolled";
}

// true | false
Layout.prototype.spread = function(spread, min) {

  this._spread = (spread === "none") ? false : true;

  if (min >= 0) {
    this.minSpreadWidth = min;
  }
}

Layout.prototype.calculate = function(_width, _height, _gap){

  var divisor = 1;
  var gap = _gap || 0;

  //-- Check the width and create even width columns
  var fullWidth = Math.floor(_width);
  var width = _width;

  var section = Math.floor(width / 8);

  var colWidth;
  var spreadWidth;
  var delta;

  if (this._spread && width >= this.minSpreadWidth) {
    divisor = 2;
  } else {
    divisor = 1;
  }

  if (this.name === "reflowable" && this._flow === "paginated" && !(_gap >= 0)) {
    gap = ((section % 2 === 0) ? section : section - 1);
  }

  if (this.name === "pre-paginated" ) {
    gap = 0;
  }

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
  this.spreadWidth = spreadWidth;
  this.delta = delta;

  this.columnWidth = colWidth;
  this.gap = gap;
  this.divisor = divisor;
};

Layout.prototype.format = function(contents){
  var formating;

  if (this.name === "pre-paginated") {
    formating = contents.fit(this.columnWidth, this.height);
  } else if (this._flow === "paginated") {
    formating = contents.columns(this.width, this.height, this.columnWidth, this.gap);
  } else { // scrolled
    formating = contents.size(this.width, null);
  }

  return formating; // might be a promise in some View Managers
};

Layout.prototype.count = function(totalWidth) {
  // var totalWidth = contents.scrollWidth();
  var spreads = Math.ceil( totalWidth / this.spreadWidth);

  return {
    spreads : spreads,
    pages : spreads * this.divisor
  };
};

module.exports = Layout;
