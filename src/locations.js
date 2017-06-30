EPUBJS.Locations = function(spine, store, credentials) {
  this.spine = spine;
  this.store = store;
  this.credentials = credentials;

  this.epubcfi = new EPUBJS.EpubCFI();

  this._locations = [];
  this.total = 0;

  this.break = 150;

  this._current = 0;

};

EPUBJS.Locations.prototype.generate = function(chars) {
	var deferred = new RSVP.defer();
	var spinePos = -1;
	var spineLength = this.spine.length;
  var finished;
	var nextChapter = function(deferred){
		var chapter;
		var next = spinePos + 1;
		var done = deferred || new RSVP.defer();
		var loaded;
		if(next >= spineLength) {
			done.resolve();
		} else {
			spinePos = next;
			chapter = new EPUBJS.Chapter(this.spine[spinePos], this.store, this.credentials);

      this.process(chapter).then(function() {
        // Load up the next chapter
				setTimeout(function(){
					nextChapter(done);
				}, 1);

      });
		}
		return done.promise;
	}.bind(this);

  if(typeof chars === 'number') {
    this.break = chars;
  }

	finished = nextChapter().then(function(){
    this.total = this._locations.length-1;

    if (this._currentCfi) {
      this.currentLocation = this._currentCfi;
    }
		deferred.resolve(this._locations);
	}.bind(this));

	return deferred.promise;
};

EPUBJS.Locations.prototype.process = function(chapter) {
  return chapter.load()
    .then(function(_doc) {

      var range;
      var doc = _doc;
      var contents = doc.documentElement.querySelector("body");
      var counter = 0;
      var prev;
      var cfi;

      this.sprint(contents, function(node) {
        var len = node.length;
        var dist;
        var pos = 0;

        // Start range
        if (counter === 0) {
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
            cfi = chapter.cfiFromRange(range);
            this._locations.push(cfi);
            counter = 0;

            // Start new range
            pos += 1;
            range = doc.createRange();
            range.setStart(node, pos);
          }

        }

        prev = node;

      }.bind(this));

      // Close remaining
      if (range) {
        range.setEnd(prev, prev.length);
        cfi = chapter.cfiFromRange(range);
        this._locations.push(cfi);
        counter = 0;
      }

    }.bind(this));

};

EPUBJS.Locations.prototype.sprint = function(root, func) {
  var node;
	var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);

	while ((node = treeWalker.nextNode())) {
		func(node);
	}

};

EPUBJS.Locations.prototype.locationFromCfi = function(cfi){
  // Check if the location has not been set yet
	if(this._locations.length === 0) {
		return -1;
	}

  return EPUBJS.core.locationOf(cfi, this._locations, this.epubcfi.compare);
};

EPUBJS.Locations.prototype.percentageFromCfi = function(cfi) {
  // Find closest cfi
  var loc = this.locationFromCfi(cfi);
  // Get percentage in total
  return this.percentageFromLocation(loc);
};

EPUBJS.Locations.prototype.percentageFromLocation = function(loc) {
  if (!loc || !this.total) {
    return 0;
  }
  return (loc / this.total);
};

EPUBJS.Locations.prototype.cfiFromLocation = function(loc){
	var cfi = -1;
	// check that pg is an int
	if(typeof loc != "number"){
		loc = parseInt(loc);
	}

	if(loc >= 0 && loc < this._locations.length) {
		cfi = this._locations[loc];
	}

	return cfi;
};

EPUBJS.Locations.prototype.cfiFromPercentage = function(value){
  var percentage = (value > 1) ? value / 100 : value; // Normalize value to 0-1
	var loc = Math.ceil(this.total * percentage);

	return this.cfiFromLocation(loc);
};

EPUBJS.Locations.prototype.load = function(locations){
	this._locations = JSON.parse(locations);
  this.total = this._locations.length-1;
  return this._locations;
};

EPUBJS.Locations.prototype.save = function(json){
	return JSON.stringify(this._locations);
};

EPUBJS.Locations.prototype.getCurrent = function(json){
	return this._current;
};

EPUBJS.Locations.prototype.setCurrent = function(curr){
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
    percentage: this.percentageFromLocation(loc)
  });
};

Object.defineProperty(EPUBJS.Locations.prototype, 'currentLocation', {
  get: function () {
    return this._current;
  },
  set: function (curr) {
    this.setCurrent(curr);
  }
});

RSVP.EventTarget.mixin(EPUBJS.Locations.prototype);
