var core = require('./core');
var Queue = require('./queue');
var EpubCFI = require('./epubcfi');
var RSVP = require('rsvp');

function Locations(spine, request) {
  this.spine = spine;
  this.request = request;

  this.q = new Queue(this);
  this.epubcfi = new EpubCFI();

  this._locations = [];
  this.total = 0;

  this.break = 150;

  this._current = 0;

};

// Load all of sections in the book
Locations.prototype.generate = function(chars) {

  if (chars) {
    this.break = chars;
  }

  this.q.pause();

  this.spine.each(function(section) {

    this.q.enqueue(this.process, section);

  }.bind(this));

  return this.q.run().then(function() {
    this.total = this._locations.length-1;

    if (this._currentCfi) {
      this.currentLocation = this._currentCfi;
    }

    return this._locations;
    // console.log(this.precentage(this.book.rendition.location.start), this.precentage(this.book.rendition.location.end));
  }.bind(this));

};

Locations.prototype.process = function(section) {

  return section.load(this.request)
    .then(function(contents) {

      var range;
      var doc = contents.ownerDocument;
      var counter = 0;

      this.sprint(contents, function(node) {
        var len = node.length;
        var dist;
        var pos = 0;

        // Start range
        if (counter == 0) {
          range = doc.createRange();
          range.setStart(node, 0);
        }

        dist = this.break - counter;

        // Node is smaller than a break
        if(dist > len){
          counter += len;
          pos = len;
        }

        while (pos < len) {
          counter = this.break;
          pos += this.break;

          // Gone over
          if(pos >= len){
            // Continue counter for next node
            counter = len - (pos - this.break);

          // At End
          } else {
            // End the previous range
            range.setEnd(node, pos);
            cfi = section.cfiFromRange(range);
            this._locations.push(cfi);
            counter = 0;

            // Start new range
            pos += 1;
            range = doc.createRange();
            range.setStart(node, pos);
          }
        }



      }.bind(this));

      // Close remaining
      if (range) {
        range.setEnd(prev, prev.length);
        cfi = section.cfiFromRange(range);
        this._locations.push(cfi)
        counter = 0;
      }

    }.bind(this));

};

Locations.prototype.sprint = function(root, func) {
	var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);

	while ((node = treeWalker.nextNode())) {
		func(node);
	}

};

Locations.prototype.locationFromCfi = function(cfi){
  // Check if the location has not been set yet
	if(this._locations.length === 0) {
		return -1;
	}

  return core.locationOf(cfi, this._locations, this.epubcfi.compare);
};

Locations.prototype.precentageFromCfi = function(cfi) {
  // Find closest cfi
  var loc = this.locationFromCfi(cfi);
  // Get percentage in total
  return this.precentageFromLocation(loc);
};

Locations.prototype.percentageFromLocation = function(loc) {
  if (!loc || !this.total) {
    return 0;
  }
  return (loc / this.total);
};

Locations.prototype.cfiFromLocation = function(loc){
	var cfi = -1;
	// check that pg is an int
	if(typeof loc != "number"){
		loc = parseInt(pg);
	}

	if(loc >= 0 && loc < this._locations.length) {
		cfi = this._locations[loc];
	}

	return cfi;
};

Locations.prototype.cfiFromPercentage = function(value){
  var percentage = (value > 1) ? value / 100 : value; // Normalize value to 0-1
	var loc = Math.ceil(this.total * percentage);

	return this.cfiFromLocation(loc);
};

Locations.prototype.load = function(locations){
	this._locations = JSON.parse(locations);
  this.total = this._locations.length-1;
  return this._locations;
};

Locations.prototype.save = function(json){
	return JSON.stringify(this._locations);
};

Locations.prototype.getCurrent = function(json){
	return this._current;
};

Locations.prototype.setCurrent = function(curr){
  var loc;

  if(typeof curr == "string"){
    this._currentCfi = curr;
  } else if (typeof curr == "number") {
    this._current = curr;
  } else {
    return;
  }

  if(this._locations.length === 0) {
    return;
	}

  if(typeof curr == "string"){
    loc = this.locationFromCfi(curr);
    this._current = loc;
  } else {
    loc = curr;
  }

  this.trigger("changed", {
    percentage: this.precentageFromLocation(loc)
  });
};

Object.defineProperty(Locations.prototype, 'currentLocation', {
  get: function () {
    return this._current;
  },
  set: function (curr) {
    this.setCurrent(curr);
  }
});

RSVP.EventTarget.mixin(Locations.prototype);

module.exports = Locations;
