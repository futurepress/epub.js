(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ePub = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 From Zip.js, by Gildas Lormeau
edited down
 */

var table = {
	"application" : {
		"ecmascript" : [ "es", "ecma" ],
		"javascript" : "js",
		"ogg" : "ogx",
		"pdf" : "pdf",
		"postscript" : [ "ps", "ai", "eps", "epsi", "epsf", "eps2", "eps3" ],
		"rdf+xml" : "rdf",
		"smil" : [ "smi", "smil" ],
		"xhtml+xml" : [ "xhtml", "xht" ],
		"xml" : [ "xml", "xsl", "xsd", "opf", "ncx" ],
		"zip" : "zip",
		"x-httpd-eruby" : "rhtml",
		"x-latex" : "latex",
		"x-maker" : [ "frm", "maker", "frame", "fm", "fb", "book", "fbdoc" ],
		"x-object" : "o",
		"x-shockwave-flash" : [ "swf", "swfl" ],
		"x-silverlight" : "scr",
		"epub+zip" : "epub",
		"font-tdpfr" : "pfr",
		"inkml+xml" : [ "ink", "inkml" ],
		"json" : "json",
		"jsonml+json" : "jsonml",
		"mathml+xml" : "mathml",
		"metalink+xml" : "metalink",
		"mp4" : "mp4s",
		// "oebps-package+xml" : "opf",
		"omdoc+xml" : "omdoc",
		"oxps" : "oxps",
		"vnd.amazon.ebook" : "azw",
		"widget" : "wgt",
		// "x-dtbncx+xml" : "ncx",
		"x-dtbook+xml" : "dtb",
		"x-dtbresource+xml" : "res",
		"x-font-bdf" : "bdf",
		"x-font-ghostscript" : "gsf",
		"x-font-linux-psf" : "psf",
		"x-font-otf" : "otf",
		"x-font-pcf" : "pcf",
		"x-font-snf" : "snf",
		"x-font-ttf" : [ "ttf", "ttc" ],
		"x-font-type1" : [ "pfa", "pfb", "pfm", "afm" ],
		"x-font-woff" : "woff",
		"x-mobipocket-ebook" : [ "prc", "mobi" ],
		"x-mspublisher" : "pub",
		"x-nzb" : "nzb",
		"x-tgif" : "obj",
		"xaml+xml" : "xaml",
		"xml-dtd" : "dtd",
		"xproc+xml" : "xpl",
		"xslt+xml" : "xslt",
		"internet-property-stream" : "acx",
		"x-compress" : "z",
		"x-compressed" : "tgz",
		"x-gzip" : "gz",
	},
	"audio" : {
		"flac" : "flac",
		"midi" : [ "mid", "midi", "kar", "rmi" ],
		"mpeg" : [ "mpga", "mpega", "mp2", "mp3", "m4a", "mp2a", "m2a", "m3a" ],
		"mpegurl" : "m3u",
		"ogg" : [ "oga", "ogg", "spx" ],
		"x-aiff" : [ "aif", "aiff", "aifc" ],
		"x-ms-wma" : "wma",
		"x-wav" : "wav",
		"adpcm" : "adp",
		"mp4" : "mp4a",
		"webm" : "weba",
		"x-aac" : "aac",
		"x-caf" : "caf",
		"x-matroska" : "mka",
		"x-pn-realaudio-plugin" : "rmp",
		"xm" : "xm",
		"mid" : [ "mid", "rmi" ]
	},
	"image" : {
		"gif" : "gif",
		"ief" : "ief",
		"jpeg" : [ "jpeg", "jpg", "jpe" ],
		"pcx" : "pcx",
		"png" : "png",
		"svg+xml" : [ "svg", "svgz" ],
		"tiff" : [ "tiff", "tif" ],
		"x-icon" : "ico",
		"bmp" : "bmp",
		"webp" : "webp",
		"x-pict" : [ "pic", "pct" ],
		"x-tga" : "tga",
		"cis-cod" : "cod"
	},
	"text" : {
		"cache-manifest" : [ "manifest", "appcache" ],
		"css" : "css",
		"csv" : "csv",
		"html" : [ "html", "htm", "shtml", "stm" ],
		"mathml" : "mml",
		"plain" : [ "txt", "text", "brf", "conf", "def", "list", "log", "in", "bas" ],
		"richtext" : "rtx",
		"tab-separated-values" : "tsv",
		"x-bibtex" : "bib"
	},
	"video" : {
		"mpeg" : [ "mpeg", "mpg", "mpe", "m1v", "m2v", "mp2", "mpa", "mpv2" ],
		"mp4" : [ "mp4", "mp4v", "mpg4" ],
		"quicktime" : [ "qt", "mov" ],
		"ogg" : "ogv",
		"vnd.mpegurl" : [ "mxu", "m4u" ],
		"x-flv" : "flv",
		"x-la-asf" : [ "lsf", "lsx" ],
		"x-mng" : "mng",
		"x-ms-asf" : [ "asf", "asx", "asr" ],
		"x-ms-wm" : "wm",
		"x-ms-wmv" : "wmv",
		"x-ms-wmx" : "wmx",
		"x-ms-wvx" : "wvx",
		"x-msvideo" : "avi",
		"x-sgi-movie" : "movie",
		"x-matroska" : [ "mpv", "mkv", "mk3d", "mks" ],
		"3gpp2" : "3g2",
		"h261" : "h261",
		"h263" : "h263",
		"h264" : "h264",
		"jpeg" : "jpgv",
		"jpm" : [ "jpm", "jpgm" ],
		"mj2" : [ "mj2", "mjp2" ],
		"vnd.ms-playready.media.pyv" : "pyv",
		"vnd.uvvu.mp4" : [ "uvu", "uvvu" ],
		"vnd.vivo" : "viv",
		"webm" : "webm",
		"x-f4v" : "f4v",
		"x-m4v" : "m4v",
		"x-ms-vob" : "vob",
		"x-smv" : "smv"
	}
};

var mimeTypes = (function() {
	var type, subtype, val, index, mimeTypes = {};
	for (type in table) {
		if (table.hasOwnProperty(type)) {
			for (subtype in table[type]) {
				if (table[type].hasOwnProperty(subtype)) {
					val = table[type][subtype];
					if (typeof val == "string") {
						mimeTypes[val] = type + "/" + subtype;
					} else {
						for (index = 0; index < val.length; index++) {
							mimeTypes[val[index]] = type + "/" + subtype;
						}
					}
				}
			}
		}
	}
	return mimeTypes;
})();

var defaultValue = "text/plain";//"application/octet-stream";

function lookup(filename) {
	return filename && mimeTypes[filename.split(".").pop().toLowerCase()] || defaultValue;
};

module.exports = {
	'lookup': lookup
}

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
(function (process,global){
/*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.2.1
 */

(function() {
    "use strict";
    function lib$rsvp$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$rsvp$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$rsvp$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$rsvp$utils$$_isArray;
    if (!Array.isArray) {
      lib$rsvp$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$rsvp$utils$$_isArray = Array.isArray;
    }

    var lib$rsvp$utils$$isArray = lib$rsvp$utils$$_isArray;

    var lib$rsvp$utils$$now = Date.now || function() { return new Date().getTime(); };

    function lib$rsvp$utils$$F() { }

    var lib$rsvp$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      lib$rsvp$utils$$F.prototype = o;
      return new lib$rsvp$utils$$F();
    });
    function lib$rsvp$events$$indexOf(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i] === callback) { return i; }
      }

      return -1;
    }

    function lib$rsvp$events$$callbacksFor(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    }

    var lib$rsvp$events$$default = {

      /**
        `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
        Example:

        ```javascript
        var object = {};

        RSVP.EventTarget.mixin(object);

        object.on('finished', function(event) {
          // handle event
        });

        object.trigger('finished', { detail: value });
        ```

        `EventTarget.mixin` also works with prototypes:

        ```javascript
        var Person = function() {};
        RSVP.EventTarget.mixin(Person.prototype);

        var yehuda = new Person();
        var tom = new Person();

        yehuda.on('poke', function(event) {
          console.log('Yehuda says OW');
        });

        tom.on('poke', function(event) {
          console.log('Tom says OW');
        });

        yehuda.trigger('poke');
        tom.trigger('poke');
        ```

        @method mixin
        @for RSVP.EventTarget
        @private
        @param {Object} object object to extend with EventTarget methods
      */
      'mixin': function(object) {
        object['on']      = this['on'];
        object['off']     = this['off'];
        object['trigger'] = this['trigger'];
        object._promiseCallbacks = undefined;
        return object;
      },

      /**
        Registers a callback to be executed when `eventName` is triggered

        ```javascript
        object.on('event', function(eventInfo){
          // handle the event
        });

        object.trigger('event');
        ```

        @method on
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to listen for
        @param {Function} callback function to be called when the event is triggered.
      */
      'on': function(eventName, callback) {
        if (typeof callback !== 'function') {
          throw new TypeError('Callback must be a function');
        }

        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks;

        callbacks = allCallbacks[eventName];

        if (!callbacks) {
          callbacks = allCallbacks[eventName] = [];
        }

        if (lib$rsvp$events$$indexOf(callbacks, callback) === -1) {
          callbacks.push(callback);
        }
      },

      /**
        You can use `off` to stop firing a particular callback for an event:

        ```javascript
        function doStuff() { // do stuff! }
        object.on('stuff', doStuff);

        object.trigger('stuff'); // doStuff will be called

        // Unregister ONLY the doStuff callback
        object.off('stuff', doStuff);
        object.trigger('stuff'); // doStuff will NOT be called
        ```

        If you don't pass a `callback` argument to `off`, ALL callbacks for the
        event will not be executed when the event fires. For example:

        ```javascript
        var callback1 = function(){};
        var callback2 = function(){};

        object.on('stuff', callback1);
        object.on('stuff', callback2);

        object.trigger('stuff'); // callback1 and callback2 will be executed.

        object.off('stuff');
        object.trigger('stuff'); // callback1 and callback2 will not be executed!
        ```

        @method off
        @for RSVP.EventTarget
        @private
        @param {String} eventName event to stop listening to
        @param {Function} callback optional argument. If given, only the function
        given will be removed from the event's callback queue. If no `callback`
        argument is given, all callbacks will be removed from the event's callback
        queue.
      */
      'off': function(eventName, callback) {
        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks, index;

        if (!callback) {
          allCallbacks[eventName] = [];
          return;
        }

        callbacks = allCallbacks[eventName];

        index = lib$rsvp$events$$indexOf(callbacks, callback);

        if (index !== -1) { callbacks.splice(index, 1); }
      },

      /**
        Use `trigger` to fire custom events. For example:

        ```javascript
        object.on('foo', function(){
          console.log('foo event happened!');
        });
        object.trigger('foo');
        // 'foo event happened!' logged to the console
        ```

        You can also pass a value as a second argument to `trigger` that will be
        passed as an argument to all event listeners for the event:

        ```javascript
        object.on('foo', function(value){
          console.log(value.name);
        });

        object.trigger('foo', { name: 'bar' });
        // 'bar' logged to the console
        ```

        @method trigger
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to be triggered
        @param {*} options optional value to be passed to any event handlers for
        the given `eventName`
      */
      'trigger': function(eventName, options, label) {
        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks, callback;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callback = callbacks[i];

            callback(options, label);
          }
        }
      }
    };

    var lib$rsvp$config$$config = {
      instrument: false
    };

    lib$rsvp$events$$default['mixin'](lib$rsvp$config$$config);

    function lib$rsvp$config$$configure(name, value) {
      if (name === 'onerror') {
        // handle for legacy users that expect the actual
        // error to be passed to their function added via
        // `RSVP.configure('onerror', someFunctionHere);`
        lib$rsvp$config$$config['on']('error', value);
        return;
      }

      if (arguments.length === 2) {
        lib$rsvp$config$$config[name] = value;
      } else {
        return lib$rsvp$config$$config[name];
      }
    }

    var lib$rsvp$instrument$$queue = [];

    function lib$rsvp$instrument$$scheduleFlush() {
      setTimeout(function() {
        var entry;
        for (var i = 0; i < lib$rsvp$instrument$$queue.length; i++) {
          entry = lib$rsvp$instrument$$queue[i];

          var payload = entry.payload;

          payload.guid = payload.key + payload.id;
          payload.childGuid = payload.key + payload.childId;
          if (payload.error) {
            payload.stack = payload.error.stack;
          }

          lib$rsvp$config$$config['trigger'](entry.name, entry.payload);
        }
        lib$rsvp$instrument$$queue.length = 0;
      }, 50);
    }

    function lib$rsvp$instrument$$instrument(eventName, promise, child) {
      if (1 === lib$rsvp$instrument$$queue.push({
        name: eventName,
        payload: {
          key: promise._guidKey,
          id:  promise._id,
          eventName: eventName,
          detail: promise._result,
          childId: child && child._id,
          label: promise._label,
          timeStamp: lib$rsvp$utils$$now(),
          error: lib$rsvp$config$$config["instrument-with-stack"] ? new Error(promise._label) : null
        }})) {
          lib$rsvp$instrument$$scheduleFlush();
        }
      }
    var lib$rsvp$instrument$$default = lib$rsvp$instrument$$instrument;
    function lib$rsvp$then$$then(onFulfillment, onRejection, label) {
      var parent = this;
      var state = parent._state;

      if (state === lib$rsvp$$internal$$FULFILLED && !onFulfillment || state === lib$rsvp$$internal$$REJECTED && !onRejection) {
        lib$rsvp$config$$config.instrument && lib$rsvp$instrument$$default('chained', parent, parent);
        return parent;
      }

      parent._onError = null;

      var child = new parent.constructor(lib$rsvp$$internal$$noop, label);
      var result = parent._result;

      lib$rsvp$config$$config.instrument && lib$rsvp$instrument$$default('chained', parent, child);

      if (state) {
        var callback = arguments[state - 1];
        lib$rsvp$config$$config.async(function(){
          lib$rsvp$$internal$$invokeCallback(state, child, callback, result);
        });
      } else {
        lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }
    var lib$rsvp$then$$default = lib$rsvp$then$$then;
    function lib$rsvp$promise$resolve$$resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$rsvp$$internal$$noop, label);
      lib$rsvp$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$rsvp$promise$resolve$$default = lib$rsvp$promise$resolve$$resolve;
    function lib$rsvp$enumerator$$makeSettledResult(state, position, value) {
      if (state === lib$rsvp$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
         return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function lib$rsvp$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor(lib$rsvp$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          lib$rsvp$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            lib$rsvp$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        lib$rsvp$$internal$$reject(this.promise, this._validationError());
      }
    }

    var lib$rsvp$enumerator$$default = lib$rsvp$enumerator$$Enumerator;

    lib$rsvp$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$rsvp$utils$$isArray(input);
    };

    lib$rsvp$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$rsvp$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    lib$rsvp$enumerator$$Enumerator.prototype._enumerate = function() {
      var length     = this.length;
      var promise    = this.promise;
      var input      = this._input;

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._settleMaybeThenable = function(entry, i) {
      var c = this._instanceConstructor;
      var resolve = c.resolve;

      if (resolve === lib$rsvp$promise$resolve$$default) {
        var then = lib$rsvp$$internal$$getThen(entry);

        if (then === lib$rsvp$then$$default &&
            entry._state !== lib$rsvp$$internal$$PENDING) {
          entry._onError = null;
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof then !== 'function') {
          this._remaining--;
          this._result[i] = this._makeResult(lib$rsvp$$internal$$FULFILLED, i, entry);
        } else if (c === lib$rsvp$promise$$default) {
          var promise = new c(lib$rsvp$$internal$$noop);
          lib$rsvp$$internal$$handleMaybeThenable(promise, entry, then);
          this._willSettleAt(promise, i);
        } else {
          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
        }
      } else {
        this._willSettleAt(resolve(entry), i);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      if (lib$rsvp$utils$$isMaybeThenable(entry)) {
        this._settleMaybeThenable(entry, i);
      } else {
        this._remaining--;
        this._result[i] = this._makeResult(lib$rsvp$$internal$$FULFILLED, i, entry);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === lib$rsvp$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === lib$rsvp$$internal$$REJECTED) {
          lib$rsvp$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        lib$rsvp$$internal$$fulfill(promise, this._result);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    lib$rsvp$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$rsvp$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$rsvp$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$rsvp$$internal$$REJECTED, i, reason);
      });
    };
    function lib$rsvp$promise$all$$all(entries, label) {
      return new lib$rsvp$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    }
    var lib$rsvp$promise$all$$default = lib$rsvp$promise$all$$all;
    function lib$rsvp$promise$race$$race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$rsvp$$internal$$noop, label);

      if (!lib$rsvp$utils$$isArray(entries)) {
        lib$rsvp$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$rsvp$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$rsvp$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        lib$rsvp$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$rsvp$promise$race$$default = lib$rsvp$promise$race$$race;
    function lib$rsvp$promise$reject$$reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$rsvp$$internal$$noop, label);
      lib$rsvp$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$rsvp$promise$reject$$default = lib$rsvp$promise$reject$$reject;

    var lib$rsvp$promise$$guidKey = 'rsvp_' + lib$rsvp$utils$$now() + '-';
    var lib$rsvp$promise$$counter = 0;

    function lib$rsvp$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$rsvp$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    function lib$rsvp$promise$$Promise(resolver, label) {
      this._id = lib$rsvp$promise$$counter++;
      this._label = label;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      lib$rsvp$config$$config.instrument && lib$rsvp$instrument$$default('created', this);

      if (lib$rsvp$$internal$$noop !== resolver) {
        typeof resolver !== 'function' && lib$rsvp$promise$$needsResolver();
        this instanceof lib$rsvp$promise$$Promise ? lib$rsvp$$internal$$initializePromise(this, resolver) : lib$rsvp$promise$$needsNew();
      }
    }

    var lib$rsvp$promise$$default = lib$rsvp$promise$$Promise;

    // deprecated
    lib$rsvp$promise$$Promise.cast = lib$rsvp$promise$resolve$$default;
    lib$rsvp$promise$$Promise.all = lib$rsvp$promise$all$$default;
    lib$rsvp$promise$$Promise.race = lib$rsvp$promise$race$$default;
    lib$rsvp$promise$$Promise.resolve = lib$rsvp$promise$resolve$$default;
    lib$rsvp$promise$$Promise.reject = lib$rsvp$promise$reject$$default;

    lib$rsvp$promise$$Promise.prototype = {
      constructor: lib$rsvp$promise$$Promise,

      _guidKey: lib$rsvp$promise$$guidKey,

      _onError: function (reason) {
        var promise = this;
        lib$rsvp$config$$config.after(function() {
          if (promise._onError) {
            lib$rsvp$config$$config['trigger']('error', reason, promise._label);
          }
        });
      },

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfillment
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      then: lib$rsvp$then$$default,

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection, label) {
        return this.then(undefined, onRejection, label);
      },

    /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves

      Synchronous example:

      ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }

      try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuther();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```

      Asynchronous example:

      ```js
      findAuthor().catch(function(reason){
        return findOtherAuther();
      }).finally(function(){
        // author was either found, or not
      });
      ```

      @method finally
      @param {Function} callback
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'finally': function(callback, label) {
        var promise = this;
        var constructor = promise.constructor;

        return promise.then(function(value) {
          return constructor.resolve(callback()).then(function() {
            return value;
          });
        }, function(reason) {
          return constructor.resolve(callback()).then(function() {
            return constructor.reject(reason);
          });
        }, label);
      }
    };
    function  lib$rsvp$$internal$$withOwnPromise() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$rsvp$$internal$$noop() {}

    var lib$rsvp$$internal$$PENDING   = void 0;
    var lib$rsvp$$internal$$FULFILLED = 1;
    var lib$rsvp$$internal$$REJECTED  = 2;

    var lib$rsvp$$internal$$GET_THEN_ERROR = new lib$rsvp$$internal$$ErrorObject();

    function lib$rsvp$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$rsvp$$internal$$GET_THEN_ERROR.error = error;
        return lib$rsvp$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$rsvp$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$rsvp$$internal$$handleForeignThenable(promise, thenable, then) {
      lib$rsvp$config$$config.async(function(promise) {
        var sealed = false;
        var error = lib$rsvp$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$rsvp$$internal$$resolve(promise, value, undefined);
          } else {
            lib$rsvp$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$rsvp$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$rsvp$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$rsvp$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$rsvp$$internal$$FULFILLED) {
        lib$rsvp$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$rsvp$$internal$$REJECTED) {
        thenable._onError = null;
        lib$rsvp$$internal$$reject(promise, thenable._result);
      } else {
        lib$rsvp$$internal$$subscribe(thenable, undefined, function(value) {
          if (thenable !== value) {
            lib$rsvp$$internal$$resolve(promise, value, undefined);
          } else {
            lib$rsvp$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          lib$rsvp$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$rsvp$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
      if (maybeThenable.constructor === promise.constructor &&
          then === lib$rsvp$then$$default &&
          constructor.resolve === lib$rsvp$promise$resolve$$default) {
        lib$rsvp$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        if (then === lib$rsvp$$internal$$GET_THEN_ERROR) {
          lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$rsvp$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$rsvp$utils$$isFunction(then)) {
          lib$rsvp$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$rsvp$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$rsvp$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$rsvp$$internal$$fulfill(promise, value);
      } else if (lib$rsvp$utils$$objectOrFunction(value)) {
        lib$rsvp$$internal$$handleMaybeThenable(promise, value, lib$rsvp$$internal$$getThen(value));
      } else {
        lib$rsvp$$internal$$fulfill(promise, value);
      }
    }

    function lib$rsvp$$internal$$publishRejection(promise) {
      if (promise._onError) {
        promise._onError(promise._result);
      }

      lib$rsvp$$internal$$publish(promise);
    }

    function lib$rsvp$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$rsvp$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$rsvp$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
        if (lib$rsvp$config$$config.instrument) {
          lib$rsvp$instrument$$default('fulfilled', promise);
        }
      } else {
        lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, promise);
      }
    }

    function lib$rsvp$$internal$$reject(promise, reason) {
      if (promise._state !== lib$rsvp$$internal$$PENDING) { return; }
      promise._state = lib$rsvp$$internal$$REJECTED;
      promise._result = reason;
      lib$rsvp$config$$config.async(lib$rsvp$$internal$$publishRejection, promise);
    }

    function lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onError = null;

      subscribers[length] = child;
      subscribers[length + lib$rsvp$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$rsvp$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, parent);
      }
    }

    function lib$rsvp$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (lib$rsvp$config$$config.instrument) {
        lib$rsvp$instrument$$default(settled === lib$rsvp$$internal$$FULFILLED ? 'fulfilled' : 'rejected', promise);
      }

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$rsvp$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$rsvp$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$rsvp$$internal$$TRY_CATCH_ERROR = new lib$rsvp$$internal$$ErrorObject();

    function lib$rsvp$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$rsvp$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$rsvp$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$rsvp$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$rsvp$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$rsvp$$internal$$tryCatch(callback, detail);

        if (value === lib$rsvp$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$withOwnPromise());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$rsvp$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$rsvp$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$rsvp$$internal$$reject(promise, error);
      } else if (settled === lib$rsvp$$internal$$FULFILLED) {
        lib$rsvp$$internal$$fulfill(promise, value);
      } else if (settled === lib$rsvp$$internal$$REJECTED) {
        lib$rsvp$$internal$$reject(promise, value);
      }
    }

    function lib$rsvp$$internal$$initializePromise(promise, resolver) {
      var resolved = false;
      try {
        resolver(function resolvePromise(value){
          if (resolved) { return; }
          resolved = true;
          lib$rsvp$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          if (resolved) { return; }
          resolved = true;
          lib$rsvp$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$rsvp$$internal$$reject(promise, e);
      }
    }

    function lib$rsvp$all$settled$$AllSettled(Constructor, entries, label) {
      this._superConstructor(Constructor, entries, false /* don't abort on reject */, label);
    }

    lib$rsvp$all$settled$$AllSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);
    lib$rsvp$all$settled$$AllSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$all$settled$$AllSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;
    lib$rsvp$all$settled$$AllSettled.prototype._validationError = function() {
      return new Error('allSettled must be called with an array');
    };

    function lib$rsvp$all$settled$$allSettled(entries, label) {
      return new lib$rsvp$all$settled$$AllSettled(lib$rsvp$promise$$default, entries, label).promise;
    }
    var lib$rsvp$all$settled$$default = lib$rsvp$all$settled$$allSettled;
    function lib$rsvp$all$$all(array, label) {
      return lib$rsvp$promise$$default.all(array, label);
    }
    var lib$rsvp$all$$default = lib$rsvp$all$$all;
    var lib$rsvp$asap$$len = 0;
    var lib$rsvp$asap$$toString = {}.toString;
    var lib$rsvp$asap$$vertxNext;
    function lib$rsvp$asap$$asap(callback, arg) {
      lib$rsvp$asap$$queue[lib$rsvp$asap$$len] = callback;
      lib$rsvp$asap$$queue[lib$rsvp$asap$$len + 1] = arg;
      lib$rsvp$asap$$len += 2;
      if (lib$rsvp$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        lib$rsvp$asap$$scheduleFlush();
      }
    }

    var lib$rsvp$asap$$default = lib$rsvp$asap$$asap;

    var lib$rsvp$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$rsvp$asap$$browserGlobal = lib$rsvp$asap$$browserWindow || {};
    var lib$rsvp$asap$$BrowserMutationObserver = lib$rsvp$asap$$browserGlobal.MutationObserver || lib$rsvp$asap$$browserGlobal.WebKitMutationObserver;
    var lib$rsvp$asap$$isNode = typeof self === 'undefined' &&
      typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$rsvp$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$rsvp$asap$$useNextTick() {
      var nextTick = process.nextTick;
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // setImmediate should be used instead instead
      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
        nextTick = setImmediate;
      }
      return function() {
        nextTick(lib$rsvp$asap$$flush);
      };
    }

    // vertx
    function lib$rsvp$asap$$useVertxTimer() {
      return function() {
        lib$rsvp$asap$$vertxNext(lib$rsvp$asap$$flush);
      };
    }

    function lib$rsvp$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$rsvp$asap$$BrowserMutationObserver(lib$rsvp$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$rsvp$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$rsvp$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$rsvp$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$rsvp$asap$$flush, 1);
      };
    }

    var lib$rsvp$asap$$queue = new Array(1000);
    function lib$rsvp$asap$$flush() {
      for (var i = 0; i < lib$rsvp$asap$$len; i+=2) {
        var callback = lib$rsvp$asap$$queue[i];
        var arg = lib$rsvp$asap$$queue[i+1];

        callback(arg);

        lib$rsvp$asap$$queue[i] = undefined;
        lib$rsvp$asap$$queue[i+1] = undefined;
      }

      lib$rsvp$asap$$len = 0;
    }

    function lib$rsvp$asap$$attemptVertex() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$rsvp$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$rsvp$asap$$useVertxTimer();
      } catch(e) {
        return lib$rsvp$asap$$useSetTimeout();
      }
    }

    var lib$rsvp$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$rsvp$asap$$isNode) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useNextTick();
    } else if (lib$rsvp$asap$$BrowserMutationObserver) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMutationObserver();
    } else if (lib$rsvp$asap$$isWorker) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMessageChannel();
    } else if (lib$rsvp$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$attemptVertex();
    } else {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useSetTimeout();
    }
    function lib$rsvp$defer$$defer(label) {
      var deferred = {};

      deferred['promise'] = new lib$rsvp$promise$$default(function(resolve, reject) {
        deferred['resolve'] = resolve;
        deferred['reject'] = reject;
      }, label);

      return deferred;
    }
    var lib$rsvp$defer$$default = lib$rsvp$defer$$defer;
    function lib$rsvp$filter$$filter(promises, filterFn, label) {
      return lib$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!lib$rsvp$utils$$isFunction(filterFn)) {
          throw new TypeError("You must pass a function as filter's second argument.");
        }

        var length = values.length;
        var filtered = new Array(length);

        for (var i = 0; i < length; i++) {
          filtered[i] = filterFn(values[i]);
        }

        return lib$rsvp$promise$$default.all(filtered, label).then(function(filtered) {
          var results = new Array(length);
          var newLength = 0;

          for (var i = 0; i < length; i++) {
            if (filtered[i]) {
              results[newLength] = values[i];
              newLength++;
            }
          }

          results.length = newLength;

          return results;
        });
      });
    }
    var lib$rsvp$filter$$default = lib$rsvp$filter$$filter;

    function lib$rsvp$promise$hash$$PromiseHash(Constructor, object, label) {
      this._superConstructor(Constructor, object, true, label);
    }

    var lib$rsvp$promise$hash$$default = lib$rsvp$promise$hash$$PromiseHash;

    lib$rsvp$promise$hash$$PromiseHash.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);
    lib$rsvp$promise$hash$$PromiseHash.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$promise$hash$$PromiseHash.prototype._init = function() {
      this._result = {};
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._validateInput = function(input) {
      return input && typeof input === 'object';
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._validationError = function() {
      return new Error('Promise.hash must be called with an object');
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._enumerate = function() {
      var enumerator = this;
      var promise    = enumerator.promise;
      var input      = enumerator._input;
      var results    = [];

      for (var key in input) {
        if (promise._state === lib$rsvp$$internal$$PENDING && Object.prototype.hasOwnProperty.call(input, key)) {
          results.push({
            position: key,
            entry: input[key]
          });
        }
      }

      var length = results.length;
      enumerator._remaining = length;
      var result;

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        result = results[i];
        enumerator._eachEntry(result.entry, result.position);
      }
    };

    function lib$rsvp$hash$settled$$HashSettled(Constructor, object, label) {
      this._superConstructor(Constructor, object, false, label);
    }

    lib$rsvp$hash$settled$$HashSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$promise$hash$$default.prototype);
    lib$rsvp$hash$settled$$HashSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$hash$settled$$HashSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;

    lib$rsvp$hash$settled$$HashSettled.prototype._validationError = function() {
      return new Error('hashSettled must be called with an object');
    };

    function lib$rsvp$hash$settled$$hashSettled(object, label) {
      return new lib$rsvp$hash$settled$$HashSettled(lib$rsvp$promise$$default, object, label).promise;
    }
    var lib$rsvp$hash$settled$$default = lib$rsvp$hash$settled$$hashSettled;
    function lib$rsvp$hash$$hash(object, label) {
      return new lib$rsvp$promise$hash$$default(lib$rsvp$promise$$default, object, label).promise;
    }
    var lib$rsvp$hash$$default = lib$rsvp$hash$$hash;
    function lib$rsvp$map$$map(promises, mapFn, label) {
      return lib$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!lib$rsvp$utils$$isFunction(mapFn)) {
          throw new TypeError("You must pass a function as map's second argument.");
        }

        var length = values.length;
        var results = new Array(length);

        for (var i = 0; i < length; i++) {
          results[i] = mapFn(values[i]);
        }

        return lib$rsvp$promise$$default.all(results, label);
      });
    }
    var lib$rsvp$map$$default = lib$rsvp$map$$map;

    function lib$rsvp$node$$Result() {
      this.value = undefined;
    }

    var lib$rsvp$node$$ERROR = new lib$rsvp$node$$Result();
    var lib$rsvp$node$$GET_THEN_ERROR = new lib$rsvp$node$$Result();

    function lib$rsvp$node$$getThen(obj) {
      try {
       return obj.then;
      } catch(error) {
        lib$rsvp$node$$ERROR.value= error;
        return lib$rsvp$node$$ERROR;
      }
    }


    function lib$rsvp$node$$tryApply(f, s, a) {
      try {
        f.apply(s, a);
      } catch(error) {
        lib$rsvp$node$$ERROR.value = error;
        return lib$rsvp$node$$ERROR;
      }
    }

    function lib$rsvp$node$$makeObject(_, argumentNames) {
      var obj = {};
      var name;
      var i;
      var length = _.length;
      var args = new Array(length);

      for (var x = 0; x < length; x++) {
        args[x] = _[x];
      }

      for (i = 0; i < argumentNames.length; i++) {
        name = argumentNames[i];
        obj[name] = args[i + 1];
      }

      return obj;
    }

    function lib$rsvp$node$$arrayResult(_) {
      var length = _.length;
      var args = new Array(length - 1);

      for (var i = 1; i < length; i++) {
        args[i - 1] = _[i];
      }

      return args;
    }

    function lib$rsvp$node$$wrapThenable(then, promise) {
      return {
        then: function(onFulFillment, onRejection) {
          return then.call(promise, onFulFillment, onRejection);
        }
      };
    }

    function lib$rsvp$node$$denodeify(nodeFunc, options) {
      var fn = function() {
        var self = this;
        var l = arguments.length;
        var args = new Array(l + 1);
        var arg;
        var promiseInput = false;

        for (var i = 0; i < l; ++i) {
          arg = arguments[i];

          if (!promiseInput) {
            // TODO: clean this up
            promiseInput = lib$rsvp$node$$needsPromiseInput(arg);
            if (promiseInput === lib$rsvp$node$$GET_THEN_ERROR) {
              var p = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);
              lib$rsvp$$internal$$reject(p, lib$rsvp$node$$GET_THEN_ERROR.value);
              return p;
            } else if (promiseInput && promiseInput !== true) {
              arg = lib$rsvp$node$$wrapThenable(promiseInput, arg);
            }
          }
          args[i] = arg;
        }

        var promise = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);

        args[l] = function(err, val) {
          if (err)
            lib$rsvp$$internal$$reject(promise, err);
          else if (options === undefined)
            lib$rsvp$$internal$$resolve(promise, val);
          else if (options === true)
            lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$arrayResult(arguments));
          else if (lib$rsvp$utils$$isArray(options))
            lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$makeObject(arguments, options));
          else
            lib$rsvp$$internal$$resolve(promise, val);
        };

        if (promiseInput) {
          return lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self);
        } else {
          return lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self);
        }
      };

      fn.__proto__ = nodeFunc;

      return fn;
    }

    var lib$rsvp$node$$default = lib$rsvp$node$$denodeify;

    function lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self) {
      var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);
      if (result === lib$rsvp$node$$ERROR) {
        lib$rsvp$$internal$$reject(promise, result.value);
      }
      return promise;
    }

    function lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self){
      return lib$rsvp$promise$$default.all(args).then(function(args){
        var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);
        if (result === lib$rsvp$node$$ERROR) {
          lib$rsvp$$internal$$reject(promise, result.value);
        }
        return promise;
      });
    }

    function lib$rsvp$node$$needsPromiseInput(arg) {
      if (arg && typeof arg === 'object') {
        if (arg.constructor === lib$rsvp$promise$$default) {
          return true;
        } else {
          return lib$rsvp$node$$getThen(arg);
        }
      } else {
        return false;
      }
    }
    var lib$rsvp$platform$$platform;

    /* global self */
    if (typeof self === 'object') {
      lib$rsvp$platform$$platform = self;

    /* global global */
    } else if (typeof global === 'object') {
      lib$rsvp$platform$$platform = global;
    } else {
      throw new Error('no global: `self` or `global` found');
    }

    var lib$rsvp$platform$$default = lib$rsvp$platform$$platform;
    function lib$rsvp$race$$race(array, label) {
      return lib$rsvp$promise$$default.race(array, label);
    }
    var lib$rsvp$race$$default = lib$rsvp$race$$race;
    function lib$rsvp$reject$$reject(reason, label) {
      return lib$rsvp$promise$$default.reject(reason, label);
    }
    var lib$rsvp$reject$$default = lib$rsvp$reject$$reject;
    function lib$rsvp$resolve$$resolve(value, label) {
      return lib$rsvp$promise$$default.resolve(value, label);
    }
    var lib$rsvp$resolve$$default = lib$rsvp$resolve$$resolve;
    function lib$rsvp$rethrow$$rethrow(reason) {
      setTimeout(function() {
        throw reason;
      });
      throw reason;
    }
    var lib$rsvp$rethrow$$default = lib$rsvp$rethrow$$rethrow;

    // defaults
    lib$rsvp$config$$config.async = lib$rsvp$asap$$default;
    lib$rsvp$config$$config.after = function(cb) {
      setTimeout(cb, 0);
    };
    var lib$rsvp$$cast = lib$rsvp$resolve$$default;
    function lib$rsvp$$async(callback, arg) {
      lib$rsvp$config$$config.async(callback, arg);
    }

    function lib$rsvp$$on() {
      lib$rsvp$config$$config['on'].apply(lib$rsvp$config$$config, arguments);
    }

    function lib$rsvp$$off() {
      lib$rsvp$config$$config['off'].apply(lib$rsvp$config$$config, arguments);
    }

    // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
    if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
      var lib$rsvp$$callbacks = window['__PROMISE_INSTRUMENTATION__'];
      lib$rsvp$config$$configure('instrument', true);
      for (var lib$rsvp$$eventName in lib$rsvp$$callbacks) {
        if (lib$rsvp$$callbacks.hasOwnProperty(lib$rsvp$$eventName)) {
          lib$rsvp$$on(lib$rsvp$$eventName, lib$rsvp$$callbacks[lib$rsvp$$eventName]);
        }
      }
    }

    var lib$rsvp$umd$$RSVP = {
      'race': lib$rsvp$race$$default,
      'Promise': lib$rsvp$promise$$default,
      'allSettled': lib$rsvp$all$settled$$default,
      'hash': lib$rsvp$hash$$default,
      'hashSettled': lib$rsvp$hash$settled$$default,
      'denodeify': lib$rsvp$node$$default,
      'on': lib$rsvp$$on,
      'off': lib$rsvp$$off,
      'map': lib$rsvp$map$$default,
      'filter': lib$rsvp$filter$$default,
      'resolve': lib$rsvp$resolve$$default,
      'reject': lib$rsvp$reject$$default,
      'all': lib$rsvp$all$$default,
      'rethrow': lib$rsvp$rethrow$$default,
      'defer': lib$rsvp$defer$$default,
      'EventTarget': lib$rsvp$events$$default,
      'configure': lib$rsvp$config$$configure,
      'async': lib$rsvp$$async
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$rsvp$umd$$RSVP; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$rsvp$umd$$RSVP;
    } else if (typeof lib$rsvp$platform$$default !== 'undefined') {
      lib$rsvp$platform$$default['RSVP'] = lib$rsvp$umd$$RSVP;
    }
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":3}],5:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * Second Level Domain (SLD) Support
 *
 * Version: 1.17.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 */

(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports === 'object') {
    // Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals (root is window)
    root.SecondLevelDomains = factory(root);
  }
}(this, function (root) {
  'use strict';

  // save current SecondLevelDomains variable, if any
  var _SecondLevelDomains = root && root.SecondLevelDomains;

  var SLD = {
    // list of known Second Level Domains
    // converted list of SLDs from https://github.com/gavingmiller/second-level-domains
    // ----
    // publicsuffix.org is more current and actually used by a couple of browsers internally.
    // downside is it also contains domains like "dyndns.org" - which is fine for the security
    // issues browser have to deal with (SOP for cookies, etc) - but is way overboard for URI.js
    // ----
    list: {
      'ac':' com gov mil net org ',
      'ae':' ac co gov mil name net org pro sch ',
      'af':' com edu gov net org ',
      'al':' com edu gov mil net org ',
      'ao':' co ed gv it og pb ',
      'ar':' com edu gob gov int mil net org tur ',
      'at':' ac co gv or ',
      'au':' asn com csiro edu gov id net org ',
      'ba':' co com edu gov mil net org rs unbi unmo unsa untz unze ',
      'bb':' biz co com edu gov info net org store tv ',
      'bh':' biz cc com edu gov info net org ',
      'bn':' com edu gov net org ',
      'bo':' com edu gob gov int mil net org tv ',
      'br':' adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ',
      'bs':' com edu gov net org ',
      'bz':' du et om ov rg ',
      'ca':' ab bc mb nb nf nl ns nt nu on pe qc sk yk ',
      'ck':' biz co edu gen gov info net org ',
      'cn':' ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ',
      'co':' com edu gov mil net nom org ',
      'cr':' ac c co ed fi go or sa ',
      'cy':' ac biz com ekloges gov ltd name net org parliament press pro tm ',
      'do':' art com edu gob gov mil net org sld web ',
      'dz':' art asso com edu gov net org pol ',
      'ec':' com edu fin gov info med mil net org pro ',
      'eg':' com edu eun gov mil name net org sci ',
      'er':' com edu gov ind mil net org rochest w ',
      'es':' com edu gob nom org ',
      'et':' biz com edu gov info name net org ',
      'fj':' ac biz com info mil name net org pro ',
      'fk':' ac co gov net nom org ',
      'fr':' asso com f gouv nom prd presse tm ',
      'gg':' co net org ',
      'gh':' com edu gov mil org ',
      'gn':' ac com gov net org ',
      'gr':' com edu gov mil net org ',
      'gt':' com edu gob ind mil net org ',
      'gu':' com edu gov net org ',
      'hk':' com edu gov idv net org ',
      'hu':' 2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ',
      'id':' ac co go mil net or sch web ',
      'il':' ac co gov idf k12 muni net org ',
      'in':' ac co edu ernet firm gen gov i ind mil net nic org res ',
      'iq':' com edu gov i mil net org ',
      'ir':' ac co dnssec gov i id net org sch ',
      'it':' edu gov ',
      'je':' co net org ',
      'jo':' com edu gov mil name net org sch ',
      'jp':' ac ad co ed go gr lg ne or ',
      'ke':' ac co go info me mobi ne or sc ',
      'kh':' com edu gov mil net org per ',
      'ki':' biz com de edu gov info mob net org tel ',
      'km':' asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ',
      'kn':' edu gov net org ',
      'kr':' ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ',
      'kw':' com edu gov net org ',
      'ky':' com edu gov net org ',
      'kz':' com edu gov mil net org ',
      'lb':' com edu gov net org ',
      'lk':' assn com edu gov grp hotel int ltd net ngo org sch soc web ',
      'lr':' com edu gov net org ',
      'lv':' asn com conf edu gov id mil net org ',
      'ly':' com edu gov id med net org plc sch ',
      'ma':' ac co gov m net org press ',
      'mc':' asso tm ',
      'me':' ac co edu gov its net org priv ',
      'mg':' com edu gov mil nom org prd tm ',
      'mk':' com edu gov inf name net org pro ',
      'ml':' com edu gov net org presse ',
      'mn':' edu gov org ',
      'mo':' com edu gov net org ',
      'mt':' com edu gov net org ',
      'mv':' aero biz com coop edu gov info int mil museum name net org pro ',
      'mw':' ac co com coop edu gov int museum net org ',
      'mx':' com edu gob net org ',
      'my':' com edu gov mil name net org sch ',
      'nf':' arts com firm info net other per rec store web ',
      'ng':' biz com edu gov mil mobi name net org sch ',
      'ni':' ac co com edu gob mil net nom org ',
      'np':' com edu gov mil net org ',
      'nr':' biz com edu gov info net org ',
      'om':' ac biz co com edu gov med mil museum net org pro sch ',
      'pe':' com edu gob mil net nom org sld ',
      'ph':' com edu gov i mil net ngo org ',
      'pk':' biz com edu fam gob gok gon gop gos gov net org web ',
      'pl':' art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ',
      'pr':' ac biz com edu est gov info isla name net org pro prof ',
      'ps':' com edu gov net org plo sec ',
      'pw':' belau co ed go ne or ',
      'ro':' arts com firm info nom nt org rec store tm www ',
      'rs':' ac co edu gov in org ',
      'sb':' com edu gov net org ',
      'sc':' com edu gov net org ',
      'sh':' co com edu gov net nom org ',
      'sl':' com edu gov net org ',
      'st':' co com consulado edu embaixada gov mil net org principe saotome store ',
      'sv':' com edu gob org red ',
      'sz':' ac co org ',
      'tr':' av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ',
      'tt':' aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ',
      'tw':' club com ebiz edu game gov idv mil net org ',
      'mu':' ac co com gov net or org ',
      'mz':' ac co edu gov org ',
      'na':' co com ',
      'nz':' ac co cri geek gen govt health iwi maori mil net org parliament school ',
      'pa':' abo ac com edu gob ing med net nom org sld ',
      'pt':' com edu gov int net nome org publ ',
      'py':' com edu gov mil net org ',
      'qa':' com edu gov mil net org ',
      're':' asso com nom ',
      'ru':' ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ',
      'rw':' ac co com edu gouv gov int mil net ',
      'sa':' com edu gov med net org pub sch ',
      'sd':' com edu gov info med net org tv ',
      'se':' a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ',
      'sg':' com edu gov idn net org per ',
      'sn':' art com edu gouv org perso univ ',
      'sy':' com edu gov mil net news org ',
      'th':' ac co go in mi net or ',
      'tj':' ac biz co com edu go gov info int mil name net nic org test web ',
      'tn':' agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ',
      'tz':' ac co go ne or ',
      'ua':' biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ',
      'ug':' ac co go ne or org sc ',
      'uk':' ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ',
      'us':' dni fed isa kids nsn ',
      'uy':' com edu gub mil net org ',
      've':' co com edu gob info mil net org web ',
      'vi':' co com k12 net org ',
      'vn':' ac biz com edu gov health info int name net org pro ',
      'ye':' co com gov ltd me net org plc ',
      'yu':' ac co edu gov org ',
      'za':' ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ',
      'zm':' ac co com edu gov net org sch '
    },
    // gorhill 2013-10-25: Using indexOf() instead Regexp(). Significant boost
    // in both performance and memory footprint. No initialization required.
    // http://jsperf.com/uri-js-sld-regex-vs-binary-search/4
    // Following methods use lastIndexOf() rather than array.split() in order
    // to avoid any memory allocations.
    has: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') >= 0;
    },
    is: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset >= 0) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(0, tldOffset) + ' ') >= 0;
    },
    get: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return null;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
        return null;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return null;
      }
      if (sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') < 0) {
        return null;
      }
      return domain.slice(sldOffset+1);
    },
    noConflict: function(){
      if (root.SecondLevelDomains === this) {
        root.SecondLevelDomains = _SecondLevelDomains;
      }
      return this;
    }
  };

  return SLD;
}));

},{}],6:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 *
 * Version: 1.17.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 */
(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports === 'object') {
    // Node
    module.exports = factory(require('./punycode'), require('./IPv6'), require('./SecondLevelDomains'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['./punycode', './IPv6', './SecondLevelDomains'], factory);
  } else {
    // Browser globals (root is window)
    root.URI = factory(root.punycode, root.IPv6, root.SecondLevelDomains, root);
  }
}(this, function (punycode, IPv6, SLD, root) {
  'use strict';
  /*global location, escape, unescape */
  // FIXME: v2.0.0 renamce non-camelCase properties to uppercase
  /*jshint camelcase: false */

  // save current URI variable, if any
  var _URI = root && root.URI;

  function URI(url, base) {
    var _urlSupplied = arguments.length >= 1;
    var _baseSupplied = arguments.length >= 2;

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof URI)) {
      if (_urlSupplied) {
        if (_baseSupplied) {
          return new URI(url, base);
        }

        return new URI(url);
      }

      return new URI();
    }

    if (url === undefined) {
      if (_urlSupplied) {
        throw new TypeError('undefined is not a valid argument for URI');
      }

      if (typeof location !== 'undefined') {
        url = location.href + '';
      } else {
        url = '';
      }
    }

    this.href(url);

    // resolve to base according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor
    if (base !== undefined) {
      return this.absoluteTo(base);
    }

    return this;
  }

  URI.version = '1.17.1';

  var p = URI.prototype;
  var hasOwn = Object.prototype.hasOwnProperty;

  function escapeRegEx(string) {
    // https://github.com/medialize/URI.js/commit/85ac21783c11f8ccab06106dba9735a31a86924d#commitcomment-821963
    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }

  function getType(value) {
    // IE8 doesn't return [Object Undefined] but [Object Object] for undefined value
    if (value === undefined) {
      return 'Undefined';
    }

    return String(Object.prototype.toString.call(value)).slice(8, -1);
  }

  function isArray(obj) {
    return getType(obj) === 'Array';
  }

  function filterArrayValues(data, value) {
    var lookup = {};
    var i, length;

    if (getType(value) === 'RegExp') {
      lookup = null;
    } else if (isArray(value)) {
      for (i = 0, length = value.length; i < length; i++) {
        lookup[value[i]] = true;
      }
    } else {
      lookup[value] = true;
    }

    for (i = 0, length = data.length; i < length; i++) {
      /*jshint laxbreak: true */
      var _match = lookup && lookup[data[i]] !== undefined
        || !lookup && value.test(data[i]);
      /*jshint laxbreak: false */
      if (_match) {
        data.splice(i, 1);
        length--;
        i--;
      }
    }

    return data;
  }

  function arrayContains(list, value) {
    var i, length;

    // value may be string, number, array, regexp
    if (isArray(value)) {
      // Note: this can be optimized to O(n) (instead of current O(m * n))
      for (i = 0, length = value.length; i < length; i++) {
        if (!arrayContains(list, value[i])) {
          return false;
        }
      }

      return true;
    }

    var _type = getType(value);
    for (i = 0, length = list.length; i < length; i++) {
      if (_type === 'RegExp') {
        if (typeof list[i] === 'string' && list[i].match(value)) {
          return true;
        }
      } else if (list[i] === value) {
        return true;
      }
    }

    return false;
  }

  function arraysEqual(one, two) {
    if (!isArray(one) || !isArray(two)) {
      return false;
    }

    // arrays can't be equal if they have different amount of content
    if (one.length !== two.length) {
      return false;
    }

    one.sort();
    two.sort();

    for (var i = 0, l = one.length; i < l; i++) {
      if (one[i] !== two[i]) {
        return false;
      }
    }

    return true;
  }

  function trimSlashes(text) {
    var trim_expression = /^\/+|\/+$/g;
    return text.replace(trim_expression, '');
  }

  URI._parts = function() {
    return {
      protocol: null,
      username: null,
      password: null,
      hostname: null,
      urn: null,
      port: null,
      path: null,
      query: null,
      fragment: null,
      // state
      duplicateQueryParameters: URI.duplicateQueryParameters,
      escapeQuerySpace: URI.escapeQuerySpace
    };
  };
  // state: allow duplicate query parameters (a=1&a=1)
  URI.duplicateQueryParameters = false;
  // state: replaces + with %20 (space in query strings)
  URI.escapeQuerySpace = true;
  // static properties
  URI.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;
  URI.idn_expression = /[^a-z0-9\.-]/i;
  URI.punycode_expression = /(xn--)/i;
  // well, 333.444.555.666 matches, but it sure ain't no IPv4 - do we care?
  URI.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  // credits to Rich Brown
  // source: http://forums.intermapper.com/viewtopic.php?p=1096#1096
  // specification: http://www.ietf.org/rfc/rfc4291.txt
  URI.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  // expression used is "gruber revised" (@gruber v2) determined to be the
  // best solution in a regex-golf we did a couple of ages ago at
  // * http://mathiasbynens.be/demo/url-regex
  // * http://rodneyrehm.de/t/url-regex.html
  URI.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
  URI.findUri = {
    // valid "scheme://" or "www."
    start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
    // everything up to the next whitespace
    end: /[\s\r\n]|$/,
    // trim trailing punctuation captured by end RegExp
    trim: /[`!()\[\]{};:'".,<>?«»“”„‘’]+$/
  };
  // http://www.iana.org/assignments/uri-schemes.html
  // http://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports
  URI.defaultPorts = {
    http: '80',
    https: '443',
    ftp: '21',
    gopher: '70',
    ws: '80',
    wss: '443'
  };
  // allowed hostname characters according to RFC 3986
  // ALPHA DIGIT "-" "." "_" "~" "!" "$" "&" "'" "(" ")" "*" "+" "," ";" "=" %encoded
  // I've never seen a (non-IDN) hostname other than: ALPHA DIGIT . -
  URI.invalid_hostname_characters = /[^a-zA-Z0-9\.-]/;
  // map DOM Elements to their URI attribute
  URI.domAttributes = {
    'a': 'href',
    'blockquote': 'cite',
    'link': 'href',
    'base': 'href',
    'script': 'src',
    'form': 'action',
    'img': 'src',
    'area': 'href',
    'iframe': 'src',
    'embed': 'src',
    'source': 'src',
    'track': 'src',
    'input': 'src', // but only if type="image"
    'audio': 'src',
    'video': 'src'
  };
  URI.getDomAttribute = function(node) {
    if (!node || !node.nodeName) {
      return undefined;
    }

    var nodeName = node.nodeName.toLowerCase();
    // <input> should only expose src for type="image"
    if (nodeName === 'input' && node.type !== 'image') {
      return undefined;
    }

    return URI.domAttributes[nodeName];
  };

  function escapeForDumbFirefox36(value) {
    // https://github.com/medialize/URI.js/issues/91
    return escape(value);
  }

  // encoding / decoding according to RFC3986
  function strictEncodeURIComponent(string) {
    // see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
    return encodeURIComponent(string)
      .replace(/[!'()*]/g, escapeForDumbFirefox36)
      .replace(/\*/g, '%2A');
  }
  URI.encode = strictEncodeURIComponent;
  URI.decode = decodeURIComponent;
  URI.iso8859 = function() {
    URI.encode = escape;
    URI.decode = unescape;
  };
  URI.unicode = function() {
    URI.encode = strictEncodeURIComponent;
    URI.decode = decodeURIComponent;
  };
  URI.characters = {
    pathname: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig,
        map: {
          // -._~!'()*
          '%24': '$',
          '%26': '&',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%3A': ':',
          '%40': '@'
        }
      },
      decode: {
        expression: /[\/\?#]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23'
        }
      }
    },
    reserved: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,
        map: {
          // gen-delims
          '%3A': ':',
          '%2F': '/',
          '%3F': '?',
          '%23': '#',
          '%5B': '[',
          '%5D': ']',
          '%40': '@',
          // sub-delims
          '%21': '!',
          '%24': '$',
          '%26': '&',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '='
        }
      }
    },
    urnpath: {
      // The characters under `encode` are the characters called out by RFC 2141 as being acceptable
      // for usage in a URN. RFC2141 also calls out "-", ".", and "_" as acceptable characters, but
      // these aren't encoded by encodeURIComponent, so we don't have to call them out here. Also
      // note that the colon character is not featured in the encoding map; this is because URI.js
      // gives the colons in URNs semantic meaning as the delimiters of path segements, and so it
      // should not appear unencoded in a segment itself.
      // See also the note above about RFC3986 and capitalalized hex digits.
      encode: {
        expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,
        map: {
          '%21': '!',
          '%24': '$',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%40': '@'
        }
      },
      // These characters are the characters called out by RFC2141 as "reserved" characters that
      // should never appear in a URN, plus the colon character (see note above).
      decode: {
        expression: /[\/\?#:]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23',
          ':': '%3A'
        }
      }
    }
  };
  URI.encodeQuery = function(string, escapeQuerySpace) {
    var escaped = URI.encode(string + '');
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    return escapeQuerySpace ? escaped.replace(/%20/g, '+') : escaped;
  };
  URI.decodeQuery = function(string, escapeQuerySpace) {
    string += '';
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    try {
      return URI.decode(escapeQuerySpace ? string.replace(/\+/g, '%20') : string);
    } catch(e) {
      // we're not going to mess with weird encodings,
      // give up and return the undecoded original string
      // see https://github.com/medialize/URI.js/issues/87
      // see https://github.com/medialize/URI.js/issues/92
      return string;
    }
  };
  // generate encode/decode path functions
  var _parts = {'encode':'encode', 'decode':'decode'};
  var _part;
  var generateAccessor = function(_group, _part) {
    return function(string) {
      try {
        return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function(c) {
          return URI.characters[_group][_part].map[c];
        });
      } catch (e) {
        // we're not going to mess with weird encodings,
        // give up and return the undecoded original string
        // see https://github.com/medialize/URI.js/issues/87
        // see https://github.com/medialize/URI.js/issues/92
        return string;
      }
    };
  };

  for (_part in _parts) {
    URI[_part + 'PathSegment'] = generateAccessor('pathname', _parts[_part]);
    URI[_part + 'UrnPathSegment'] = generateAccessor('urnpath', _parts[_part]);
  }

  var generateSegmentedPathFunction = function(_sep, _codingFuncName, _innerCodingFuncName) {
    return function(string) {
      // Why pass in names of functions, rather than the function objects themselves? The
      // definitions of some functions (but in particular, URI.decode) will occasionally change due
      // to URI.js having ISO8859 and Unicode modes. Passing in the name and getting it will ensure
      // that the functions we use here are "fresh".
      var actualCodingFunc;
      if (!_innerCodingFuncName) {
        actualCodingFunc = URI[_codingFuncName];
      } else {
        actualCodingFunc = function(string) {
          return URI[_codingFuncName](URI[_innerCodingFuncName](string));
        };
      }

      var segments = (string + '').split(_sep);

      for (var i = 0, length = segments.length; i < length; i++) {
        segments[i] = actualCodingFunc(segments[i]);
      }

      return segments.join(_sep);
    };
  };

  // This takes place outside the above loop because we don't want, e.g., encodeUrnPath functions.
  URI.decodePath = generateSegmentedPathFunction('/', 'decodePathSegment');
  URI.decodeUrnPath = generateSegmentedPathFunction(':', 'decodeUrnPathSegment');
  URI.recodePath = generateSegmentedPathFunction('/', 'encodePathSegment', 'decode');
  URI.recodeUrnPath = generateSegmentedPathFunction(':', 'encodeUrnPathSegment', 'decode');

  URI.encodeReserved = generateAccessor('reserved', 'encode');

  URI.parse = function(string, parts) {
    var pos;
    if (!parts) {
      parts = {};
    }
    // [protocol"://"[username[":"password]"@"]hostname[":"port]"/"?][path]["?"querystring]["#"fragment]

    // extract fragment
    pos = string.indexOf('#');
    if (pos > -1) {
      // escaping?
      parts.fragment = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract query
    pos = string.indexOf('?');
    if (pos > -1) {
      // escaping?
      parts.query = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract protocol
    if (string.substring(0, 2) === '//') {
      // relative-scheme
      parts.protocol = null;
      string = string.substring(2);
      // extract "user:pass@host:port"
      string = URI.parseAuthority(string, parts);
    } else {
      pos = string.indexOf(':');
      if (pos > -1) {
        parts.protocol = string.substring(0, pos) || null;
        if (parts.protocol && !parts.protocol.match(URI.protocol_expression)) {
          // : may be within the path
          parts.protocol = undefined;
        } else if (string.substring(pos + 1, pos + 3) === '//') {
          string = string.substring(pos + 3);

          // extract "user:pass@host:port"
          string = URI.parseAuthority(string, parts);
        } else {
          string = string.substring(pos + 1);
          parts.urn = true;
        }
      }
    }

    // what's left must be the path
    parts.path = string;

    // and we're done
    return parts;
  };
  URI.parseHost = function(string, parts) {
    // Copy chrome, IE, opera backslash-handling behavior.
    // Back slashes before the query string get converted to forward slashes
    // See: https://github.com/joyent/node/blob/386fd24f49b0e9d1a8a076592a404168faeecc34/lib/url.js#L115-L124
    // See: https://code.google.com/p/chromium/issues/detail?id=25916
    // https://github.com/medialize/URI.js/pull/233
    string = string.replace(/\\/g, '/');

    // extract host:port
    var pos = string.indexOf('/');
    var bracketPos;
    var t;

    if (pos === -1) {
      pos = string.length;
    }

    if (string.charAt(0) === '[') {
      // IPv6 host - http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6
      // I claim most client software breaks on IPv6 anyways. To simplify things, URI only accepts
      // IPv6+port in the format [2001:db8::1]:80 (for the time being)
      bracketPos = string.indexOf(']');
      parts.hostname = string.substring(1, bracketPos) || null;
      parts.port = string.substring(bracketPos + 2, pos) || null;
      if (parts.port === '/') {
        parts.port = null;
      }
    } else {
      var firstColon = string.indexOf(':');
      var firstSlash = string.indexOf('/');
      var nextColon = string.indexOf(':', firstColon + 1);
      if (nextColon !== -1 && (firstSlash === -1 || nextColon < firstSlash)) {
        // IPv6 host contains multiple colons - but no port
        // this notation is actually not allowed by RFC 3986, but we're a liberal parser
        parts.hostname = string.substring(0, pos) || null;
        parts.port = null;
      } else {
        t = string.substring(0, pos).split(':');
        parts.hostname = t[0] || null;
        parts.port = t[1] || null;
      }
    }

    if (parts.hostname && string.substring(pos).charAt(0) !== '/') {
      pos++;
      string = '/' + string;
    }

    return string.substring(pos) || '/';
  };
  URI.parseAuthority = function(string, parts) {
    string = URI.parseUserinfo(string, parts);
    return URI.parseHost(string, parts);
  };
  URI.parseUserinfo = function(string, parts) {
    // extract username:password
    var firstSlash = string.indexOf('/');
    var pos = string.lastIndexOf('@', firstSlash > -1 ? firstSlash : string.length - 1);
    var t;

    // authority@ must come before /path
    if (pos > -1 && (firstSlash === -1 || pos < firstSlash)) {
      t = string.substring(0, pos).split(':');
      parts.username = t[0] ? URI.decode(t[0]) : null;
      t.shift();
      parts.password = t[0] ? URI.decode(t.join(':')) : null;
      string = string.substring(pos + 1);
    } else {
      parts.username = null;
      parts.password = null;
    }

    return string;
  };
  URI.parseQuery = function(string, escapeQuerySpace) {
    if (!string) {
      return {};
    }

    // throw out the funky business - "?"[name"="value"&"]+
    string = string.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '');

    if (!string) {
      return {};
    }

    var items = {};
    var splits = string.split('&');
    var length = splits.length;
    var v, name, value;

    for (var i = 0; i < length; i++) {
      v = splits[i].split('=');
      name = URI.decodeQuery(v.shift(), escapeQuerySpace);
      // no "=" is null according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#collect-url-parameters
      value = v.length ? URI.decodeQuery(v.join('='), escapeQuerySpace) : null;

      if (hasOwn.call(items, name)) {
        if (typeof items[name] === 'string' || items[name] === null) {
          items[name] = [items[name]];
        }

        items[name].push(value);
      } else {
        items[name] = value;
      }
    }

    return items;
  };

  URI.build = function(parts) {
    var t = '';

    if (parts.protocol) {
      t += parts.protocol + ':';
    }

    if (!parts.urn && (t || parts.hostname)) {
      t += '//';
    }

    t += (URI.buildAuthority(parts) || '');

    if (typeof parts.path === 'string') {
      if (parts.path.charAt(0) !== '/' && typeof parts.hostname === 'string') {
        t += '/';
      }

      t += parts.path;
    }

    if (typeof parts.query === 'string' && parts.query) {
      t += '?' + parts.query;
    }

    if (typeof parts.fragment === 'string' && parts.fragment) {
      t += '#' + parts.fragment;
    }
    return t;
  };
  URI.buildHost = function(parts) {
    var t = '';

    if (!parts.hostname) {
      return '';
    } else if (URI.ip6_expression.test(parts.hostname)) {
      t += '[' + parts.hostname + ']';
    } else {
      t += parts.hostname;
    }

    if (parts.port) {
      t += ':' + parts.port;
    }

    return t;
  };
  URI.buildAuthority = function(parts) {
    return URI.buildUserinfo(parts) + URI.buildHost(parts);
  };
  URI.buildUserinfo = function(parts) {
    var t = '';

    if (parts.username) {
      t += URI.encode(parts.username);

      if (parts.password) {
        t += ':' + URI.encode(parts.password);
      }

      t += '@';
    }

    return t;
  };
  URI.buildQuery = function(data, duplicateQueryParameters, escapeQuerySpace) {
    // according to http://tools.ietf.org/html/rfc3986 or http://labs.apache.org/webarch/uri/rfc/rfc3986.html
    // being »-._~!$&'()*+,;=:@/?« %HEX and alnum are allowed
    // the RFC explicitly states ?/foo being a valid use case, no mention of parameter syntax!
    // URI.js treats the query string as being application/x-www-form-urlencoded
    // see http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type

    var t = '';
    var unique, key, i, length;
    for (key in data) {
      if (hasOwn.call(data, key) && key) {
        if (isArray(data[key])) {
          unique = {};
          for (i = 0, length = data[key].length; i < length; i++) {
            if (data[key][i] !== undefined && unique[data[key][i] + ''] === undefined) {
              t += '&' + URI.buildQueryParameter(key, data[key][i], escapeQuerySpace);
              if (duplicateQueryParameters !== true) {
                unique[data[key][i] + ''] = true;
              }
            }
          }
        } else if (data[key] !== undefined) {
          t += '&' + URI.buildQueryParameter(key, data[key], escapeQuerySpace);
        }
      }
    }

    return t.substring(1);
  };
  URI.buildQueryParameter = function(name, value, escapeQuerySpace) {
    // http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type -- application/x-www-form-urlencoded
    // don't append "=" for null values, according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#url-parameter-serialization
    return URI.encodeQuery(name, escapeQuerySpace) + (value !== null ? '=' + URI.encodeQuery(value, escapeQuerySpace) : '');
  };

  URI.addQuery = function(data, name, value) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          URI.addQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (data[name] === undefined) {
        data[name] = value;
        return;
      } else if (typeof data[name] === 'string') {
        data[name] = [data[name]];
      }

      if (!isArray(value)) {
        value = [value];
      }

      data[name] = (data[name] || []).concat(value);
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }
  };
  URI.removeQuery = function(data, name, value) {
    var i, length, key;

    if (isArray(name)) {
      for (i = 0, length = name.length; i < length; i++) {
        data[name[i]] = undefined;
      }
    } else if (getType(name) === 'RegExp') {
      for (key in data) {
        if (name.test(key)) {
          data[key] = undefined;
        }
      }
    } else if (typeof name === 'object') {
      for (key in name) {
        if (hasOwn.call(name, key)) {
          URI.removeQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (value !== undefined) {
        if (getType(value) === 'RegExp') {
          if (!isArray(data[name]) && value.test(data[name])) {
            data[name] = undefined;
          } else {
            data[name] = filterArrayValues(data[name], value);
          }
        } else if (data[name] === String(value) && (!isArray(value) || value.length === 1)) {
          data[name] = undefined;
        } else if (isArray(data[name])) {
          data[name] = filterArrayValues(data[name], value);
        }
      } else {
        data[name] = undefined;
      }
    } else {
      throw new TypeError('URI.removeQuery() accepts an object, string, RegExp as the first parameter');
    }
  };
  URI.hasQuery = function(data, name, value, withinArray) {
    switch (getType(name)) {
      case 'String':
        // Nothing to do here
        break;

      case 'RegExp':
        for (var key in data) {
          if (hasOwn.call(data, key)) {
            if (name.test(key) && (value === undefined || URI.hasQuery(data, key, value))) {
              return true;
            }
          }
        }

        return false;

      case 'Object':
        for (var _key in name) {
          if (hasOwn.call(name, _key)) {
            if (!URI.hasQuery(data, _key, name[_key])) {
              return false;
            }
          }
        }

        return true;

      default:
        throw new TypeError('URI.hasQuery() accepts a string, regular expression or object as the name parameter');
    }

    switch (getType(value)) {
      case 'Undefined':
        // true if exists (but may be empty)
        return name in data; // data[name] !== undefined;

      case 'Boolean':
        // true if exists and non-empty
        var _booly = Boolean(isArray(data[name]) ? data[name].length : data[name]);
        return value === _booly;

      case 'Function':
        // allow complex comparison
        return !!value(data[name], name, data);

      case 'Array':
        if (!isArray(data[name])) {
          return false;
        }

        var op = withinArray ? arrayContains : arraysEqual;
        return op(data[name], value);

      case 'RegExp':
        if (!isArray(data[name])) {
          return Boolean(data[name] && data[name].match(value));
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      case 'Number':
        value = String(value);
        /* falls through */
      case 'String':
        if (!isArray(data[name])) {
          return data[name] === value;
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      default:
        throw new TypeError('URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter');
    }
  };


  URI.commonPath = function(one, two) {
    var length = Math.min(one.length, two.length);
    var pos;

    // find first non-matching character
    for (pos = 0; pos < length; pos++) {
      if (one.charAt(pos) !== two.charAt(pos)) {
        pos--;
        break;
      }
    }

    if (pos < 1) {
      return one.charAt(0) === two.charAt(0) && one.charAt(0) === '/' ? '/' : '';
    }

    // revert to last /
    if (one.charAt(pos) !== '/' || two.charAt(pos) !== '/') {
      pos = one.substring(0, pos).lastIndexOf('/');
    }

    return one.substring(0, pos + 1);
  };

  URI.withinString = function(string, callback, options) {
    options || (options = {});
    var _start = options.start || URI.findUri.start;
    var _end = options.end || URI.findUri.end;
    var _trim = options.trim || URI.findUri.trim;
    var _attributeOpen = /[a-z0-9-]=["']?$/i;

    _start.lastIndex = 0;
    while (true) {
      var match = _start.exec(string);
      if (!match) {
        break;
      }

      var start = match.index;
      if (options.ignoreHtml) {
        // attribut(e=["']?$)
        var attributeOpen = string.slice(Math.max(start - 3, 0), start);
        if (attributeOpen && _attributeOpen.test(attributeOpen)) {
          continue;
        }
      }

      var end = start + string.slice(start).search(_end);
      var slice = string.slice(start, end).replace(_trim, '');
      if (options.ignore && options.ignore.test(slice)) {
        continue;
      }

      end = start + slice.length;
      var result = callback(slice, start, end, string);
      string = string.slice(0, start) + result + string.slice(end);
      _start.lastIndex = start + result.length;
    }

    _start.lastIndex = 0;
    return string;
  };

  URI.ensureValidHostname = function(v) {
    // Theoretically URIs allow percent-encoding in Hostnames (according to RFC 3986)
    // they are not part of DNS and therefore ignored by URI.js

    if (v.match(URI.invalid_hostname_characters)) {
      // test punycode
      if (!punycode) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-] and Punycode.js is not available');
      }

      if (punycode.toASCII(v).match(URI.invalid_hostname_characters)) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }
    }
  };

  // noConflict
  URI.noConflict = function(removeAll) {
    if (removeAll) {
      var unconflicted = {
        URI: this.noConflict()
      };

      if (root.URITemplate && typeof root.URITemplate.noConflict === 'function') {
        unconflicted.URITemplate = root.URITemplate.noConflict();
      }

      if (root.IPv6 && typeof root.IPv6.noConflict === 'function') {
        unconflicted.IPv6 = root.IPv6.noConflict();
      }

      if (root.SecondLevelDomains && typeof root.SecondLevelDomains.noConflict === 'function') {
        unconflicted.SecondLevelDomains = root.SecondLevelDomains.noConflict();
      }

      return unconflicted;
    } else if (root.URI === this) {
      root.URI = _URI;
    }

    return this;
  };

  p.build = function(deferBuild) {
    if (deferBuild === true) {
      this._deferred_build = true;
    } else if (deferBuild === undefined || this._deferred_build) {
      this._string = URI.build(this._parts);
      this._deferred_build = false;
    }

    return this;
  };

  p.clone = function() {
    return new URI(this);
  };

  p.valueOf = p.toString = function() {
    return this.build(false)._string;
  };


  function generateSimpleAccessor(_part){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        this._parts[_part] = v || null;
        this.build(!build);
        return this;
      }
    };
  }

  function generatePrefixAccessor(_part, _key){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        if (v !== null) {
          v = v + '';
          if (v.charAt(0) === _key) {
            v = v.substring(1);
          }
        }

        this._parts[_part] = v;
        this.build(!build);
        return this;
      }
    };
  }

  p.protocol = generateSimpleAccessor('protocol');
  p.username = generateSimpleAccessor('username');
  p.password = generateSimpleAccessor('password');
  p.hostname = generateSimpleAccessor('hostname');
  p.port = generateSimpleAccessor('port');
  p.query = generatePrefixAccessor('query', '?');
  p.fragment = generatePrefixAccessor('fragment', '#');

  p.search = function(v, build) {
    var t = this.query(v, build);
    return typeof t === 'string' && t.length ? ('?' + t) : t;
  };
  p.hash = function(v, build) {
    var t = this.fragment(v, build);
    return typeof t === 'string' && t.length ? ('#' + t) : t;
  };

  p.pathname = function(v, build) {
    if (v === undefined || v === true) {
      var res = this._parts.path || (this._parts.hostname ? '/' : '');
      return v ? (this._parts.urn ? URI.decodeUrnPath : URI.decodePath)(res) : res;
    } else {
      if (this._parts.urn) {
        this._parts.path = v ? URI.recodeUrnPath(v) : '';
      } else {
        this._parts.path = v ? URI.recodePath(v) : '/';
      }
      this.build(!build);
      return this;
    }
  };
  p.path = p.pathname;
  p.href = function(href, build) {
    var key;

    if (href === undefined) {
      return this.toString();
    }

    this._string = '';
    this._parts = URI._parts();

    var _URI = href instanceof URI;
    var _object = typeof href === 'object' && (href.hostname || href.path || href.pathname);
    if (href.nodeName) {
      var attribute = URI.getDomAttribute(href);
      href = href[attribute] || '';
      _object = false;
    }

    // window.location is reported to be an object, but it's not the sort
    // of object we're looking for:
    // * location.protocol ends with a colon
    // * location.query != object.search
    // * location.hash != object.fragment
    // simply serializing the unknown object should do the trick
    // (for location, not for everything...)
    if (!_URI && _object && href.pathname !== undefined) {
      href = href.toString();
    }

    if (typeof href === 'string' || href instanceof String) {
      this._parts = URI.parse(String(href), this._parts);
    } else if (_URI || _object) {
      var src = _URI ? href._parts : href;
      for (key in src) {
        if (hasOwn.call(this._parts, key)) {
          this._parts[key] = src[key];
        }
      }
    } else {
      throw new TypeError('invalid input');
    }

    this.build(!build);
    return this;
  };

  // identification accessors
  p.is = function(what) {
    var ip = false;
    var ip4 = false;
    var ip6 = false;
    var name = false;
    var sld = false;
    var idn = false;
    var punycode = false;
    var relative = !this._parts.urn;

    if (this._parts.hostname) {
      relative = false;
      ip4 = URI.ip4_expression.test(this._parts.hostname);
      ip6 = URI.ip6_expression.test(this._parts.hostname);
      ip = ip4 || ip6;
      name = !ip;
      sld = name && SLD && SLD.has(this._parts.hostname);
      idn = name && URI.idn_expression.test(this._parts.hostname);
      punycode = name && URI.punycode_expression.test(this._parts.hostname);
    }

    switch (what.toLowerCase()) {
      case 'relative':
        return relative;

      case 'absolute':
        return !relative;

      // hostname identification
      case 'domain':
      case 'name':
        return name;

      case 'sld':
        return sld;

      case 'ip':
        return ip;

      case 'ip4':
      case 'ipv4':
      case 'inet4':
        return ip4;

      case 'ip6':
      case 'ipv6':
      case 'inet6':
        return ip6;

      case 'idn':
        return idn;

      case 'url':
        return !this._parts.urn;

      case 'urn':
        return !!this._parts.urn;

      case 'punycode':
        return punycode;
    }

    return null;
  };

  // component specific input validation
  var _protocol = p.protocol;
  var _port = p.port;
  var _hostname = p.hostname;

  p.protocol = function(v, build) {
    if (v !== undefined) {
      if (v) {
        // accept trailing ://
        v = v.replace(/:(\/\/)?$/, '');

        if (!v.match(URI.protocol_expression)) {
          throw new TypeError('Protocol "' + v + '" contains characters other than [A-Z0-9.+-] or doesn\'t start with [A-Z]');
        }
      }
    }
    return _protocol.call(this, v, build);
  };
  p.scheme = p.protocol;
  p.port = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      if (v === 0) {
        v = null;
      }

      if (v) {
        v += '';
        if (v.charAt(0) === ':') {
          v = v.substring(1);
        }

        if (v.match(/[^0-9]/)) {
          throw new TypeError('Port "' + v + '" contains characters other than [0-9]');
        }
      }
    }
    return _port.call(this, v, build);
  };
  p.hostname = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      var x = {};
      var res = URI.parseHost(v, x);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      v = x.hostname;
    }
    return _hostname.call(this, v, build);
  };

  // compound accessors
  p.origin = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      var protocol = this.protocol();
      var authority = this.authority();
      if (!authority) {
        return '';
      }

      return (protocol ? protocol + '://' : '') + this.authority();
    } else {
      var origin = URI(v);
      this
        .protocol(origin.protocol())
        .authority(origin.authority())
        .build(!build);
      return this;
    }
  };
  p.host = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildHost(this._parts) : '';
    } else {
      var res = URI.parseHost(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.authority = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildAuthority(this._parts) : '';
    } else {
      var res = URI.parseAuthority(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.userinfo = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      if (!this._parts.username) {
        return '';
      }

      var t = URI.buildUserinfo(this._parts);
      return t.substring(0, t.length -1);
    } else {
      if (v[v.length-1] !== '@') {
        v += '@';
      }

      URI.parseUserinfo(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.resource = function(v, build) {
    var parts;

    if (v === undefined) {
      return this.path() + this.search() + this.hash();
    }

    parts = URI.parse(v);
    this._parts.path = parts.path;
    this._parts.query = parts.query;
    this._parts.fragment = parts.fragment;
    this.build(!build);
    return this;
  };

  // fraction accessors
  p.subdomain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    // convenience, return "www" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // grab domain and add another segment
      var end = this._parts.hostname.length - this.domain().length - 1;
      return this._parts.hostname.substring(0, end) || '';
    } else {
      var e = this._parts.hostname.length - this.domain().length;
      var sub = this._parts.hostname.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(sub));

      if (v && v.charAt(v.length - 1) !== '.') {
        v += '.';
      }

      if (v) {
        URI.ensureValidHostname(v);
      }

      this._parts.hostname = this._parts.hostname.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.domain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // convenience, return "example.org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // if hostname consists of 1 or 2 segments, it must be the domain
      var t = this._parts.hostname.match(/\./g);
      if (t && t.length < 2) {
        return this._parts.hostname;
      }

      // grab tld and add another segment
      var end = this._parts.hostname.length - this.tld(build).length - 1;
      end = this._parts.hostname.lastIndexOf('.', end -1) + 1;
      return this._parts.hostname.substring(end) || '';
    } else {
      if (!v) {
        throw new TypeError('cannot set domain empty');
      }

      URI.ensureValidHostname(v);

      if (!this._parts.hostname || this.is('IP')) {
        this._parts.hostname = v;
      } else {
        var replace = new RegExp(escapeRegEx(this.domain()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.tld = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // return "org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      var pos = this._parts.hostname.lastIndexOf('.');
      var tld = this._parts.hostname.substring(pos + 1);

      if (build !== true && SLD && SLD.list[tld.toLowerCase()]) {
        return SLD.get(this._parts.hostname) || tld;
      }

      return tld;
    } else {
      var replace;

      if (!v) {
        throw new TypeError('cannot set TLD empty');
      } else if (v.match(/[^a-zA-Z0-9-]/)) {
        if (SLD && SLD.is(v)) {
          replace = new RegExp(escapeRegEx(this.tld()) + '$');
          this._parts.hostname = this._parts.hostname.replace(replace, v);
        } else {
          throw new TypeError('TLD "' + v + '" contains characters other than [A-Z0-9]');
        }
      } else if (!this._parts.hostname || this.is('IP')) {
        throw new ReferenceError('cannot set TLD on non-domain host');
      } else {
        replace = new RegExp(escapeRegEx(this.tld()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.directory = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path && !this._parts.hostname) {
        return '';
      }

      if (this._parts.path === '/') {
        return '/';
      }

      var end = this._parts.path.length - this.filename().length - 1;
      var res = this._parts.path.substring(0, end) || (this._parts.hostname ? '/' : '');

      return v ? URI.decodePath(res) : res;

    } else {
      var e = this._parts.path.length - this.filename().length;
      var directory = this._parts.path.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(directory));

      // fully qualifier directories begin with a slash
      if (!this.is('relative')) {
        if (!v) {
          v = '/';
        }

        if (v.charAt(0) !== '/') {
          v = '/' + v;
        }
      }

      // directories always end with a slash
      if (v && v.charAt(v.length - 1) !== '/') {
        v += '/';
      }

      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.filename = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var pos = this._parts.path.lastIndexOf('/');
      var res = this._parts.path.substring(pos+1);

      return v ? URI.decodePathSegment(res) : res;
    } else {
      var mutatedDirectory = false;

      if (v.charAt(0) === '/') {
        v = v.substring(1);
      }

      if (v.match(/\.?\//)) {
        mutatedDirectory = true;
      }

      var replace = new RegExp(escapeRegEx(this.filename()) + '$');
      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);

      if (mutatedDirectory) {
        this.normalizePath(build);
      } else {
        this.build(!build);
      }

      return this;
    }
  };
  p.suffix = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var filename = this.filename();
      var pos = filename.lastIndexOf('.');
      var s, res;

      if (pos === -1) {
        return '';
      }

      // suffix may only contain alnum characters (yup, I made this up.)
      s = filename.substring(pos+1);
      res = (/^[a-z0-9%]+$/i).test(s) ? s : '';
      return v ? URI.decodePathSegment(res) : res;
    } else {
      if (v.charAt(0) === '.') {
        v = v.substring(1);
      }

      var suffix = this.suffix();
      var replace;

      if (!suffix) {
        if (!v) {
          return this;
        }

        this._parts.path += '.' + URI.recodePath(v);
      } else if (!v) {
        replace = new RegExp(escapeRegEx('.' + suffix) + '$');
      } else {
        replace = new RegExp(escapeRegEx(suffix) + '$');
      }

      if (replace) {
        v = URI.recodePath(v);
        this._parts.path = this._parts.path.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.segment = function(segment, v, build) {
    var separator = this._parts.urn ? ':' : '/';
    var path = this.path();
    var absolute = path.substring(0, 1) === '/';
    var segments = path.split(separator);

    if (segment !== undefined && typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (segment !== undefined && typeof segment !== 'number') {
      throw new Error('Bad segment "' + segment + '", must be 0-based integer');
    }

    if (absolute) {
      segments.shift();
    }

    if (segment < 0) {
      // allow negative indexes to address from the end
      segment = Math.max(segments.length + segment, 0);
    }

    if (v === undefined) {
      /*jshint laxbreak: true */
      return segment === undefined
        ? segments
        : segments[segment];
      /*jshint laxbreak: false */
    } else if (segment === null || segments[segment] === undefined) {
      if (isArray(v)) {
        segments = [];
        // collapse empty elements within array
        for (var i=0, l=v.length; i < l; i++) {
          if (!v[i].length && (!segments.length || !segments[segments.length -1].length)) {
            continue;
          }

          if (segments.length && !segments[segments.length -1].length) {
            segments.pop();
          }

          segments.push(trimSlashes(v[i]));
        }
      } else if (v || typeof v === 'string') {
        v = trimSlashes(v);
        if (segments[segments.length -1] === '') {
          // empty trailing elements have to be overwritten
          // to prevent results such as /foo//bar
          segments[segments.length -1] = v;
        } else {
          segments.push(v);
        }
      }
    } else {
      if (v) {
        segments[segment] = trimSlashes(v);
      } else {
        segments.splice(segment, 1);
      }
    }

    if (absolute) {
      segments.unshift('');
    }

    return this.path(segments.join(separator), build);
  };
  p.segmentCoded = function(segment, v, build) {
    var segments, i, l;

    if (typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (v === undefined) {
      segments = this.segment(segment, v, build);
      if (!isArray(segments)) {
        segments = segments !== undefined ? URI.decode(segments) : undefined;
      } else {
        for (i = 0, l = segments.length; i < l; i++) {
          segments[i] = URI.decode(segments[i]);
        }
      }

      return segments;
    }

    if (!isArray(v)) {
      v = (typeof v === 'string' || v instanceof String) ? URI.encode(v) : v;
    } else {
      for (i = 0, l = v.length; i < l; i++) {
        v[i] = URI.encode(v[i]);
      }
    }

    return this.segment(segment, v, build);
  };

  // mutating query string
  var q = p.query;
  p.query = function(v, build) {
    if (v === true) {
      return URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    } else if (typeof v === 'function') {
      var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
      var result = v.call(this, data);
      this._parts.query = URI.buildQuery(result || data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else if (v !== undefined && typeof v !== 'string') {
      this._parts.query = URI.buildQuery(v, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else {
      return q.call(this, v, build);
    }
  };
  p.setQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);

    if (typeof name === 'string' || name instanceof String) {
      data[name] = value !== undefined ? value : null;
    } else if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          data[key] = name[key];
        }
      }
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }

    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.addQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.addQuery(data, name, value === undefined ? null : value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.removeQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.removeQuery(data, name, value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.hasQuery = function(name, value, withinArray) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    return URI.hasQuery(data, name, value, withinArray);
  };
  p.setSearch = p.setQuery;
  p.addSearch = p.addQuery;
  p.removeSearch = p.removeQuery;
  p.hasSearch = p.hasQuery;

  // sanitizing URLs
  p.normalize = function() {
    if (this._parts.urn) {
      return this
        .normalizeProtocol(false)
        .normalizePath(false)
        .normalizeQuery(false)
        .normalizeFragment(false)
        .build();
    }

    return this
      .normalizeProtocol(false)
      .normalizeHostname(false)
      .normalizePort(false)
      .normalizePath(false)
      .normalizeQuery(false)
      .normalizeFragment(false)
      .build();
  };
  p.normalizeProtocol = function(build) {
    if (typeof this._parts.protocol === 'string') {
      this._parts.protocol = this._parts.protocol.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizeHostname = function(build) {
    if (this._parts.hostname) {
      if (this.is('IDN') && punycode) {
        this._parts.hostname = punycode.toASCII(this._parts.hostname);
      } else if (this.is('IPv6') && IPv6) {
        this._parts.hostname = IPv6.best(this._parts.hostname);
      }

      this._parts.hostname = this._parts.hostname.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizePort = function(build) {
    // remove port of it's the protocol's default
    if (typeof this._parts.protocol === 'string' && this._parts.port === URI.defaultPorts[this._parts.protocol]) {
      this._parts.port = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizePath = function(build) {
    var _path = this._parts.path;
    if (!_path) {
      return this;
    }

    if (this._parts.urn) {
      this._parts.path = URI.recodeUrnPath(this._parts.path);
      this.build(!build);
      return this;
    }

    if (this._parts.path === '/') {
      return this;
    }

    _path = URI.recodePath(_path);

    var _was_relative;
    var _leadingParents = '';
    var _parent, _pos;

    // handle relative paths
    if (_path.charAt(0) !== '/') {
      _was_relative = true;
      _path = '/' + _path;
    }

    // handle relative files (as opposed to directories)
    if (_path.slice(-3) === '/..' || _path.slice(-2) === '/.') {
      _path += '/';
    }

    // resolve simples
    _path = _path
      .replace(/(\/(\.\/)+)|(\/\.$)/g, '/')
      .replace(/\/{2,}/g, '/');

    // remember leading parents
    if (_was_relative) {
      _leadingParents = _path.substring(1).match(/^(\.\.\/)+/) || '';
      if (_leadingParents) {
        _leadingParents = _leadingParents[0];
      }
    }

    // resolve parents
    while (true) {
      _parent = _path.search(/\/\.\.(\/|$)/);
      if (_parent === -1) {
        // no more ../ to resolve
        break;
      } else if (_parent === 0) {
        // top level cannot be relative, skip it
        _path = _path.substring(3);
        continue;
      }

      _pos = _path.substring(0, _parent).lastIndexOf('/');
      if (_pos === -1) {
        _pos = _parent;
      }
      _path = _path.substring(0, _pos) + _path.substring(_parent + 3);
    }

    // revert to relative
    if (_was_relative && this.is('relative')) {
      _path = _leadingParents + _path.substring(1);
    }

    this._parts.path = _path;
    this.build(!build);
    return this;
  };
  p.normalizePathname = p.normalizePath;
  p.normalizeQuery = function(build) {
    if (typeof this._parts.query === 'string') {
      if (!this._parts.query.length) {
        this._parts.query = null;
      } else {
        this.query(URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace));
      }

      this.build(!build);
    }

    return this;
  };
  p.normalizeFragment = function(build) {
    if (!this._parts.fragment) {
      this._parts.fragment = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizeSearch = p.normalizeQuery;
  p.normalizeHash = p.normalizeFragment;

  p.iso8859 = function() {
    // expect unicode input, iso8859 output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = escape;
    URI.decode = decodeURIComponent;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.unicode = function() {
    // expect iso8859 input, unicode output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = strictEncodeURIComponent;
    URI.decode = unescape;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.readable = function() {
    var uri = this.clone();
    // removing username, password, because they shouldn't be displayed according to RFC 3986
    uri.username('').password('').normalize();
    var t = '';
    if (uri._parts.protocol) {
      t += uri._parts.protocol + '://';
    }

    if (uri._parts.hostname) {
      if (uri.is('punycode') && punycode) {
        t += punycode.toUnicode(uri._parts.hostname);
        if (uri._parts.port) {
          t += ':' + uri._parts.port;
        }
      } else {
        t += uri.host();
      }
    }

    if (uri._parts.hostname && uri._parts.path && uri._parts.path.charAt(0) !== '/') {
      t += '/';
    }

    t += uri.path(true);
    if (uri._parts.query) {
      var q = '';
      for (var i = 0, qp = uri._parts.query.split('&'), l = qp.length; i < l; i++) {
        var kv = (qp[i] || '').split('=');
        q += '&' + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace)
          .replace(/&/g, '%26');

        if (kv[1] !== undefined) {
          q += '=' + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace)
            .replace(/&/g, '%26');
        }
      }
      t += '?' + q.substring(1);
    }

    t += URI.decodeQuery(uri.hash(), true);
    return t;
  };

  // resolving relative and absolute URLs
  p.absoluteTo = function(base) {
    var resolved = this.clone();
    var properties = ['protocol', 'username', 'password', 'hostname', 'port'];
    var basedir, i, p;

    if (this._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    if (!(base instanceof URI)) {
      base = new URI(base);
    }

    if (!resolved._parts.protocol) {
      resolved._parts.protocol = base._parts.protocol;
    }

    if (this._parts.hostname) {
      return resolved;
    }

    for (i = 0; (p = properties[i]); i++) {
      resolved._parts[p] = base._parts[p];
    }

    if (!resolved._parts.path) {
      resolved._parts.path = base._parts.path;
      if (!resolved._parts.query) {
        resolved._parts.query = base._parts.query;
      }
    } else if (resolved._parts.path.substring(-2) === '..') {
      resolved._parts.path += '/';
    }

    if (resolved.path().charAt(0) !== '/') {
      basedir = base.directory();
      basedir = basedir ? basedir : base.path().indexOf('/') === 0 ? '/' : '';
      resolved._parts.path = (basedir ? (basedir + '/') : '') + resolved._parts.path;
      resolved.normalizePath();
    }

    resolved.build();
    return resolved;
  };
  p.relativeTo = function(base) {
    var relative = this.clone().normalize();
    var relativeParts, baseParts, common, relativePath, basePath;

    if (relative._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    base = new URI(base).normalize();
    relativeParts = relative._parts;
    baseParts = base._parts;
    relativePath = relative.path();
    basePath = base.path();

    if (relativePath.charAt(0) !== '/') {
      throw new Error('URI is already relative');
    }

    if (basePath.charAt(0) !== '/') {
      throw new Error('Cannot calculate a URI relative to another relative URI');
    }

    if (relativeParts.protocol === baseParts.protocol) {
      relativeParts.protocol = null;
    }

    if (relativeParts.username !== baseParts.username || relativeParts.password !== baseParts.password) {
      return relative.build();
    }

    if (relativeParts.protocol !== null || relativeParts.username !== null || relativeParts.password !== null) {
      return relative.build();
    }

    if (relativeParts.hostname === baseParts.hostname && relativeParts.port === baseParts.port) {
      relativeParts.hostname = null;
      relativeParts.port = null;
    } else {
      return relative.build();
    }

    if (relativePath === basePath) {
      relativeParts.path = '';
      return relative.build();
    }

    // determine common sub path
    common = URI.commonPath(relativePath, basePath);

    // If the paths have nothing in common, return a relative URL with the absolute path.
    if (!common) {
      return relative.build();
    }

    var parents = baseParts.path
      .substring(common.length)
      .replace(/[^\/]*$/, '')
      .replace(/.*?\//g, '../');

    relativeParts.path = (parents + relativeParts.path.substring(common.length)) || './';

    return relative.build();
  };

  // comparing URIs
  p.equals = function(uri) {
    var one = this.clone();
    var two = new URI(uri);
    var one_map = {};
    var two_map = {};
    var checked = {};
    var one_query, two_query, key;

    one.normalize();
    two.normalize();

    // exact match
    if (one.toString() === two.toString()) {
      return true;
    }

    // extract query string
    one_query = one.query();
    two_query = two.query();
    one.query('');
    two.query('');

    // definitely not equal if not even non-query parts match
    if (one.toString() !== two.toString()) {
      return false;
    }

    // query parameters have the same length, even if they're permuted
    if (one_query.length !== two_query.length) {
      return false;
    }

    one_map = URI.parseQuery(one_query, this._parts.escapeQuerySpace);
    two_map = URI.parseQuery(two_query, this._parts.escapeQuerySpace);

    for (key in one_map) {
      if (hasOwn.call(one_map, key)) {
        if (!isArray(one_map[key])) {
          if (one_map[key] !== two_map[key]) {
            return false;
          }
        } else if (!arraysEqual(one_map[key], two_map[key])) {
          return false;
        }

        checked[key] = true;
      }
    }

    for (key in two_map) {
      if (hasOwn.call(two_map, key)) {
        if (!checked[key]) {
          // two contains a parameter not present in one
          return false;
        }
      }
    }

    return true;
  };

  // state
  p.duplicateQueryParameters = function(v) {
    this._parts.duplicateQueryParameters = !!v;
    return this;
  };

  p.escapeQuerySpace = function(v) {
    this._parts.escapeQuerySpace = !!v;
    return this;
  };

  return URI;
}));

},{"./IPv6":2,"./SecondLevelDomains":5,"./punycode":2}],7:[function(require,module,exports){
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){	
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"}
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid document source");
	}
	return domBuilder.document;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.document = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.document.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.document;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			if( attr.getOffset){
				position(attr.getOffset(1),attr)
			}
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
	    var tagName = current.tagName;
	    this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.document.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(this.currentElement && chars){
			if (this.cdata) {
				var charNode = this.document.createCDATASection(chars);
				this.currentElement.appendChild(charNode);
			} else {
				var charNode = this.document.createTextNode(chars);
				this.currentElement.appendChild(charNode);
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.document.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.document.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.document.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.document.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

if(typeof require == 'function'){
	var XMLReader = require('./sax').XMLReader;
	var DOMImplementation = exports.DOMImplementation = require('./dom').DOMImplementation;
	exports.XMLSerializer = require('./dom').XMLSerializer ;
	exports.DOMParser = DOMParser;
}

},{"./dom":8,"./sax":9}],8:[function(require,module,exports){
/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype)
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error())
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		var i = this.length;
		while(i--){
			var attr = this[i];
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == 2?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == 2?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == 1){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == 1){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		//if(!(newChild instanceof CharacterData)){
			throw new Error(ExceptionMessage[3])
		//}
		return Node.prototype.appendChild.apply(this,arguments)
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,attributeSorter){
	return node.toString(attributeSorter);
}
Node.prototype.toString =function(attributeSorter){
	var buf = [];
	serializeToString(this,buf,attributeSorter);
	return buf.join('');
}
function serializeToString(node,buf,attributeSorter,isHTML){
	switch(node.nodeType){
	case ELEMENT_NODE:
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		if(attributeSorter){
			buf.sort.apply(attrs, attributeSorter);
		}
		for(var i=0;i<len;i++){
			serializeToString(attrs.item(i),buf,attributeSorter,isHTML);
		}
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input|button)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				if(child){
					buf.push(child.data);
				}
			}else{
				while(child){
					serializeToString(child,buf,attributeSorter,isHTML);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,attributeSorter,isHTML);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case 1:
				case 11:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = value;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case 1:
			case 11:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
}

},{}],9:[function(require,module,exports){
//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\u00B7\u0300-\u036F\\u203F-\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_V
//S_ATTR_S,	S_E,	S_S,	S_C
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_S=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_V = 4;//attr value(no quot value only)
var S_E = 5;//attr value end and no space(quot end)
var S_S = 6;//(attr value end || tag end ) && (space offer)
var S_C = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
  function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.+(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.document;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				var localNSMap = config.localNSMap;
		        if(config.tagName != tagName){
		            errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
		        }
				domBuilder.endElement(config.uri,config.localName,tagName);
				if(localNSMap){
					for(var prefix in localNSMap){
						domBuilder.endPrefixMapping(prefix) ;
					}
				}
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
			
				locator&&position(tagStart);
				
				var el = new ElementAttributes();
				
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,entityReplacer,errorHandler);
				var len = el.length;
				
				if(locator){
					if(len){
						//attribute position fixed
						for(var i = 0;i<len;i++){
							var a = el[i];
							position(a.offset);
							a.offset = copyLocator(locator,{});
						}
					}
					position(end);
				}
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				appendElement(el,domBuilder,parseStack);
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e);
			end = -1;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_S){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ){//equal
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_E;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_V){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_E
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_E:
			case S_S:
			case S_C:
				s = S_C;
				el.closed = true;
			case S_V:
			case S_ATTR:
			case S_ATTR_S:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_E:
			case S_S:
			case S_C:
				break;//normal
			case S_V://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_S:
				if(s === S_ATTR_S){
					value = attrName;
				}
				if(s == S_V){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_S;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_S;
					break;
				case S_V:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_E:
					s = S_S;
					break;
				//case S_S:
				//case S_EQ:
				//case S_ATTR_S:
				//	void();break;
				//case S_C:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_V
//S_ATTR_S,	S_E,	S_S,	S_C
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_V:void();break;
				case S_ATTR_S:
					errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead!!')
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_E:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_S:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_V;
					start = p;
					break;
				case S_C:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}
		p++;
	}
}
/**
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function appendElement(el,domBuilder,parseStack){
	var tagName = el.tagName;
	var localNSMap = null;
	var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix]
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		parseStack.push(el);
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos = closeMap[tagName] = source.lastIndexOf('</'+tagName+'>')
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getOffset:function(i){return this[i].offset},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){};
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	}
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

if(typeof require == 'function'){
	exports.XMLReader = XMLReader;
}


},{}],10:[function(require,module,exports){
var RSVP = require('rsvp');
var URI = require('urijs');
var core = require('./core');
var Spine = require('./spine');
var Locations = require('./locations');
var Parser = require('./parser');
var Navigation = require('./navigation');
var Rendition = require('./rendition');
var Unarchive = require('./unarchive');
var request = require('./request');
var EpubCFI = require('./epubcfi');

function Book(_url, options){

  this.settings = core.extend(this.settings || {}, {
		requestMethod: this.requestMethod
	});

  core.extend(this.settings, options);


  // Promises
  this.opening = new RSVP.defer();
  this.opened = this.opening.promise;
  this.isOpen = false;

  this.url = undefined;

  this.loading = {
    manifest: new RSVP.defer(),
    spine: new RSVP.defer(),
    metadata: new RSVP.defer(),
    cover: new RSVP.defer(),
    navigation: new RSVP.defer(),
    pageList: new RSVP.defer()
  };

  this.loaded = {
    manifest: this.loading.manifest.promise,
    spine: this.loading.spine.promise,
    metadata: this.loading.metadata.promise,
    cover: this.loading.cover.promise,
    navigation: this.loading.navigation.promise,
    pageList: this.loading.pageList.promise
  };

  this.ready = RSVP.hash(this.loaded);

  // Queue for methods used before opening
  this.isRendered = false;
  // this._q = core.queue(this);

  this.request = this.settings.requestMethod.bind(this);

  this.spine = new Spine(this.request);
  this.locations = new Locations(this.spine, this.request);

  if(_url) {
    this.open(_url);
  }
};

Book.prototype.open = function(_url){
  var uri;
  var parse = new Parser();
  var epubPackage;
  var epubContainer;
  var book = this;
  var containerPath = "META-INF/container.xml";
  var location;
  var absoluteUri;

  if(!_url) {
    this.opening.resolve(this);
    return this.opened;
  }

  // Reuse parsed url or create a new uri object
  // if(typeof(_url) === "object") {
  //   uri = _url;
  // } else {
  //   uri = core.uri(_url);
  // }
  uri = URI(_url);

  if (window) {
    absoluteUri = uri.absoluteTo(window.location.href);
    this.url = absoluteUri.toString();
  } else {
    this.url = _url;
  }

  // Find path to the Container
  if(uri.suffix() === "opf") {
    // Direct link to package, no container
    this.packageUrl = _url;
    this.containerUrl = '';

    if(uri.origin()) {
      this.baseUrl = uri.origin() + "/" + uri.directory() + "/";
    } else if(absoluteUri){
      this.baseUrl = absoluteUri.origin();
      this.baseUrl += absoluteUri.directory() + "/";
    } else {
      this.baseUrl = uri.directory() + "/";
    }

    epubPackage = this.request(this.packageUrl);

  } else if(this.isArchivedUrl(uri)) {
    // Book is archived
    this.url = '/';
    this.containerUrl = URI(containerPath).absoluteTo(this.url).toString();

    epubContainer = this.unarchive(_url).
      then(function() {
        return this.request(this.containerUrl);
      }.bind(this));

  }
  // Find the path to the Package from the container
  else if (!uri.suffix()) {

    this.containerUrl = this.url + containerPath;

    epubContainer = this.request(this.containerUrl)
      .catch(function(error) {
        // handle errors in loading container
        book.opening.reject(error);
      });
  }

  if (epubContainer) {
    epubPackage = epubContainer.
      then(function(containerXml){
        return parse.container(containerXml); // Container has path to content
      }).
      then(function(paths){
        var packageUri = URI(paths.packagePath);
        var absPackageUri = packageUri.absoluteTo(book.url);
        var absWindowUri;

        book.packageUrl = absPackageUri.toString();
        book.encoding = paths.encoding;

        // Set Url relative to the content
        if(absPackageUri.origin()) {
          book.baseUrl = absPackageUri.origin() + absPackageUri.directory() + "/";
        } else {
          book.baseUrl = "/" + packageUri.directory() + "/";
        }

        return book.request(book.packageUrl);
      }).catch(function(error) {
        // handle errors in either of the two requests
        console.error("Could not load book at: " + (this.packageUrl || this.containerPath));
        book.trigger("book:loadFailed", (this.packageUrl || this.containerPath));
        book.opening.reject(error);
      });
  }

  epubPackage.then(function(packageXml) {
    // Get package information from epub opf
    book.unpack(packageXml);

    // Resolve promises
    book.loading.manifest.resolve(book.package.manifest);
    book.loading.metadata.resolve(book.package.metadata);
    book.loading.spine.resolve(book.spine);
    book.loading.cover.resolve(book.cover);

    book.isOpen = true;

    // Clear queue of any waiting book request

    // Resolve book opened promise
    book.opening.resolve(book);

  }).catch(function(error) {
    // handle errors in parsing the book
    console.error(error.message, error.stack);
    book.opening.reject(error);
  });

  return this.opened;
};

Book.prototype.unpack = function(packageXml){
  var book = this,
      parse = new Parser();

  book.package = parse.packageContents(packageXml); // Extract info from contents
  if(!book.package) {
    return;
  }

  book.package.baseUrl = book.baseUrl; // Provides a url base for resolving paths

  this.spine.load(book.package);

  book.navigation = new Navigation(book.package, this.request);
  book.navigation.load().then(function(toc){
    book.toc = toc;
    book.loading.navigation.resolve(book.toc);
  });

  // //-- Set Global Layout setting based on metadata
  // MOVE TO RENDER
  // book.globalLayoutProperties = book.parseLayoutProperties(book.package.metadata);

  book.cover = URI(book.package.coverPath).absoluteTo(book.baseUrl).toString();
};

// Alias for book.spine.get
Book.prototype.section = function(target) {
  return this.spine.get(target);
};

// Sugar to render a book
Book.prototype.renderTo = function(element, options) {
  // var renderMethod = (options && options.method) ?
  //     options.method :
  //     "single";

  this.rendition = new Rendition(this, options);
  this.rendition.attachTo(element);

  return this.rendition;
};

Book.prototype.requestMethod = function(_url) {
  // Switch request methods
  if(this.archive) {
    return this.archive.request(_url);
  } else {
    return request(_url, null, this.requestCredentials, this.requestHeaders);
  }

};

Book.prototype.setRequestCredentials = function(_credentials) {
  this.requestCredentials = _credentials;
};

Book.prototype.setRequestHeaders = function(_headers) {
  this.requestHeaders = _headers;
};

Book.prototype.unarchive = function(bookUrl){
	this.archive = new Unarchive();
	return this.archive.open(bookUrl);
};

//-- Checks if url has a .epub or .zip extension, or is ArrayBuffer (of zip/epub)
Book.prototype.isArchivedUrl = function(bookUrl){
  var uri;
  var extension;

  if (bookUrl instanceof ArrayBuffer) {
		return true;
	}

  // Reuse parsed url or create a new uri object
  // if(typeof(bookUrl) === "object") {
  //   uri = bookUrl;
  // } else {
  //   uri = core.uri(bookUrl);
  // }
  uri = URI(bookUrl);
  extension = uri.suffix();

	if(extension && (extension == "epub" || extension == "zip")){
		return true;
	}

	return false;
};

//-- Returns the cover
Book.prototype.coverUrl = function(){
	var retrieved = this.loaded.cover.
		then(function(url) {
			if(this.archive) {
				return this.archive.createUrl(this.cover);
			}else{
				return this.cover;
			}
		}.bind(this));



	return retrieved;
};

Book.prototype.range = function(cfiRange) {
  var cfi = new EpubCFI(cfiRange);
  var item = this.spine.get(cfi.spinePos);

  return item.load().then(function (contents) {
    var range = cfi.toRange(item.document);
    return range;
  })
};

module.exports = Book;

//-- Enable binding events to book
RSVP.EventTarget.mixin(Book.prototype);

//-- Handle RSVP Errors
RSVP.on('error', function(event) {
  console.error(event);
});

RSVP.configure('instrument', true); //-- true | will logging out all RSVP rejections
// RSVP.on('created', listener);
// RSVP.on('chained', listener);
// RSVP.on('fulfilled', listener);
RSVP.on('rejected', function(event){
  console.error(event.detail.message, event.detail.stack);
});

},{"./core":12,"./epubcfi":13,"./locations":16,"./navigation":21,"./parser":22,"./rendition":24,"./request":26,"./spine":28,"./unarchive":30,"rsvp":4,"urijs":6}],11:[function(require,module,exports){
var RSVP = require('rsvp');
var core = require('./core');
var EpubCFI = require('./epubcfi');

function Contents(doc, content) {
  // Blank Cfi for Parsing
  this.epubcfi = new EpubCFI();

  this.document = doc;
  this.documentElement =  this.document.documentElement;
  this.content = content || this.document.body;
  this.window = this.document.defaultView;
  // Dom events to listen for
  this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

};

Contents.prototype.width = function(w) {

  if (w && core.isNumber(w)) {
    w = w + "px";
  }

  if (w) {
    this.documentElement.style.width = w;
  }

  return this.window.getComputedStyle(this.documentElement)['width'];


};

Contents.prototype.height = function(h) {

  if (h && core.isNumber(h)) {
    h = h + "px";
  }

  if (h) {
    this.documentElement.style.height = h;
  }

  return this.window.getComputedStyle(this.documentElement)['height'];

};

Contents.prototype.textWidth = function() {
  var width;
  var range = this.document.createRange();

  // Select the contents of frame
  range.selectNodeContents(this.content);

  // get the width of the text content
  width = range.getBoundingClientRect().width;
  return width;

};

Contents.prototype.textHeight = function() {
  var height;
  var range = this.document.createRange();


  range.selectNodeContents(this.content);

  height = range.getBoundingClientRect().height;

  return height;
};

Contents.prototype.scrollWidth = function() {
  var width = this.documentElement.scrollWidth;

  return width;
};

Contents.prototype.scrollHeight = function() {
  var height = this.documentElement.scrollHeight;

  return height;
};

Contents.prototype.overflow = function(overflow) {

  if (h) {
    this.documentElement.style.overflow = overflow;
  }

  return this.window.getComputedStyle(this.documentElement)['overflow'];
};

Contents.prototype.css = function(property, value) {

  if (value) {
    this.content.style[property] = value;
  }

  return this.window.getComputedStyle(this.content)[property];
};

Contents.prototype.viewport = function() {
  var width, height;
  var $doc = this.document.documentElement;
  var $viewport = $doc.querySelector("[name=viewport");

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

  return {
    width: width,
    height: height
  };
};


// Contents.prototype.layout = function(layoutFunc) {
//
//   this.iframe.style.display = "inline-block";
//
//   // Reset Body Styles
//   this.content.style.margin = "0";
//   //this.document.body.style.display = "inline-block";
//   //this.document.documentElement.style.width = "auto";
//
//   if(layoutFunc){
//     layoutFunc(this);
//   }
//
//   this.onLayout(this);
//
// };
//
// Contents.prototype.onLayout = function(view) {
//   // stub
// };

Contents.prototype.expand = function() {
  //TODO: this should just report resize
};

Contents.prototype.listeners = function() {

  this.imageLoadListeners();

  this.mediaQueryListeners();

  this.addEventListeners();

  this.addSelectionListeners();
};

Contents.prototype.removeListeners = function() {

  this.removeEventListeners();

  this.removeSelectionListeners();
};

Contents.prototype.resizeListenters = function() {
  // Test size again
  clearTimeout(this.expanding);
  this.expanding = setTimeout(this.expand.bind(this), 350);
};

//https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
Contents.prototype.mediaQueryListeners = function() {
    var sheets = this.document.styleSheets;
    var mediaChangeHandler = function(m){
      if(m.matches && !this._expanding) {
        setTimeout(this.expand.bind(this), 1);
        // this.expand();
      }
    }.bind(this);

    for (var i = 0; i < sheets.length; i += 1) {
        var rules = sheets[i].cssRules;
        if(!rules) return; // Stylesheets changed
        for (var j = 0; j < rules.length; j += 1) {
            //if (rules[j].constructor === CSSMediaRule) {
            if(rules[j].media){
                var mql = this.window.matchMedia(rules[j].media.mediaText);
                mql.addListener(mediaChangeHandler);
                //mql.onchange = mediaChangeHandler;
            }
        }
    }
};

Contents.prototype.observe = function(target) {
  var renderer = this;

  // create an observer instance
  var observer = new MutationObserver(function(mutations) {
    if(renderer._expanding) {
      renderer.expand();
    }
    // mutations.forEach(function(mutation) {
    //   console.log(mutation);
    // });
  });

  // configuration of the observer:
  var config = { attributes: true, childList: true, characterData: true, subtree: true };

  // pass in the target node, as well as the observer options
  observer.observe(target, config);

  return observer;
};

Contents.prototype.imageLoadListeners = function(target) {
  var images = this.contentDocument.querySelectorAll("img");
  var img;
  for (var i = 0; i < images.length; i++) {
    img = images[i];

    if (typeof img.naturalWidth !== "undefined" &&
        img.naturalWidth === 0) {
      img.onload = this.expand.bind(this);
    }
  }
};

Contents.prototype.root = function() {
  if(!this.document) return null;
  return this.document.documentElement;
};

Contents.prototype.locationOf = function(target, ignoreClass) {
  var targetPos = {"left": 0, "top": 0};

  if(!this.document) return;

  if(this.epubcfi.isCfiString(target)) {
    range = new EpubCFI(cfi).toRange(this.document, ignoreClass);
    if(range) {
      targetPos = range.getBoundingClientRect();
    }

  } else if(typeof target === "string" &&
    target.indexOf("#") > -1) {

    id = target.substring(target.indexOf("#")+1);
    el = this.document.getElementById(id);

    if(el) {
      targetPos = el.getBoundingClientRect();
    }
  }

  return targetPos;
};

Contents.prototype.addStylesheet = function(src) {
  return new RSVP.Promise(function(resolve, reject){
    var $stylesheet;
    var ready = false;

    if(!this.document) {
      resolve(false);
      return;
    }

    $stylesheet = this.document.createElement('link');
    $stylesheet.type = 'text/css';
    $stylesheet.rel = "stylesheet";
    $stylesheet.href = src;
    $stylesheet.onload = $stylesheet.onreadystatechange = function() {
      if ( !ready && (!this.readyState || this.readyState == 'complete') ) {
        ready = true;
        // Let apply
        setTimeout(function(){
          resolve(true);
        }, 1);
      }
    };

    this.document.head.appendChild($stylesheet);

  }.bind(this));
};

// https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
Contents.prototype.addStylesheetRules = function(rules) {
  var styleEl;
  var styleSheet;

  if(!this.document) return;

  styleEl = this.document.createElement('style');

  // Append style element to head
  this.document.head.appendChild(styleEl);

  // Grab style sheet
  styleSheet = styleEl.sheet;

  for (var i = 0, rl = rules.length; i < rl; i++) {
    var j = 1, rule = rules[i], selector = rules[i][0], propStr = '';
    // If the second argument of a rule is an array of arrays, correct our variables.
    if (Object.prototype.toString.call(rule[1][0]) === '[object Array]') {
      rule = rule[1];
      j = 0;
    }

    for (var pl = rule.length; j < pl; j++) {
      var prop = rule[j];
      propStr += prop[0] + ':' + prop[1] + (prop[2] ? ' !important' : '') + ';\n';
    }

    // Insert CSS Rule
    styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);
  }
};

Contents.prototype.addScript = function(src) {

  return new RSVP.Promise(function(resolve, reject){
    var $script;
    var ready = false;

    if(!this.document) {
      resolve(false);
      return;
    }

    $script = this.document.createElement('script');
    $script.type = 'text/javascript';
    $script.async = true;
    $script.src = src;
    $script.onload = $script.onreadystatechange = function() {
      if ( !ready && (!this.readyState || this.readyState == 'complete') ) {
        ready = true;
        setTimeout(function(){
          resolve(true);
        }, 1);
      }
    };

    this.document.head.appendChild($script);

  }.bind(this));
};

Contents.prototype.addEventListeners = function(){
  if(!this.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.document.addEventListener(eventName, this.triggerEvent.bind(this), false);
  }, this);

};

Contents.prototype.removeEventListeners = function(){
  if(!this.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.document.removeEventListener(eventName, this.triggerEvent, false);
  }, this);

};

// Pass browser events
Contents.prototype.triggerEvent = function(e){
  this.trigger(e.type, e);
};

Contents.prototype.addSelectionListeners = function(){
  if(!this.document) {
    return;
  }
  this.document.addEventListener("selectionchange", this.onSelectionChange.bind(this), false);
};

Contents.prototype.removeSelectionListeners = function(){
  if(!this.document) {
    return;
  }
  this.document.removeEventListener("selectionchange", this.onSelectionChange, false);
};

Contents.prototype.onSelectionChange = function(e){
  if (this.selectionEndTimeout) {
    clearTimeout(this.selectionEndTimeout);
  }
  this.selectionEndTimeout = setTimeout(function() {
    var selection = this.window.getSelection();
    this.triggerSelectedEvent(selection);
  }.bind(this), 500);
};

Contents.prototype.triggerSelectedEvent = function(selection){
	var range, cfirange;

  if (selection && selection.rangeCount > 0) {
    range = selection.getRangeAt(0);
    if(!range.collapsed) {
      cfirange = this.section.cfiFromRange(range);
      this.trigger("selected", cfirange);
      this.trigger("selectedRange", range);
    }
  }
};

Contents.prototype.range = function(_cfi, ignoreClass){
  var cfi = new EpubCFI(_cfi);
  return cfi.toRange(this.document, ignoreClass);
};

Contents.prototype.map = function(layout){
  var map = new Map(layout);
  return map.section();
};

Contents.prototype.destroy = function() {
  // Stop observing
  if(this.observer) {
    this.observer.disconnect();
  }

  this.removeListeners();

};

RSVP.EventTarget.mixin(Contents.prototype);

module.exports = Contents;

},{"./core":12,"./epubcfi":13,"rsvp":4}],12:[function(require,module,exports){
var RSVP = require('rsvp');

var requestAnimationFrame = (typeof window != 'undefined') ? (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame) : false;
/*
//-- Parse the different parts of a url, returning a object
function uri(url){
  var uri = {
        protocol : '',
        host : '',
        path : '',
        origin : '',
        directory : '',
        base : '',
        filename : '',
        extension : '',
        fragment : '',
        href : url
      },
      doubleSlash = url.indexOf('://'),
      search = url.indexOf('?'),
      fragment = url.indexOf("#"),
      withoutProtocol,
      dot,
      firstSlash;

  if(fragment != -1) {
    uri.fragment = url.slice(fragment + 1);
    url = url.slice(0, fragment);
  }

  if(search != -1) {
    uri.search = url.slice(search + 1);
    url = url.slice(0, search);
    href = url;
  }

  if(doubleSlash != -1) {
    uri.protocol = url.slice(0, doubleSlash);
    withoutProtocol = url.slice(doubleSlash+3);
    firstSlash = withoutProtocol.indexOf('/');

    if(firstSlash === -1) {
      uri.host = uri.path;
      uri.path = "";
    } else {
      uri.host = withoutProtocol.slice(0, firstSlash);
      uri.path = withoutProtocol.slice(firstSlash);
    }


    uri.origin = uri.protocol + "://" + uri.host;

    uri.directory = folder(uri.path);

    uri.base = uri.origin + uri.directory;
    // return origin;
  } else {
    uri.path = url;
    uri.directory = folder(url);
    uri.base = uri.directory;
  }

  //-- Filename
  uri.filename = url.replace(uri.base, '');
  dot = uri.filename.lastIndexOf('.');
  if(dot != -1) {
    uri.extension = uri.filename.slice(dot+1);
  }
  return uri;
};

//-- Parse out the folder, will return everything before the last slash
function folder(url){

  var lastSlash = url.lastIndexOf('/');

  if(lastSlash == -1) var folder = '';

  folder = url.slice(0, lastSlash + 1);

  return folder;

};
*/
function isElement(obj) {
    return !!(obj && obj.nodeType == 1);
};

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function uuid() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid;
};

// From Lodash
function values(object) {
  var index = -1,
      props = Object.keys(object),
      length = props.length,
      result = Array(length);

  while (++index < length) {
    result[index] = object[props[index]];
  }
  return result;
};

function resolveUrl(base, path) {
  var url = [],
    segments = [],
    baseUri = uri(base),
    pathUri = uri(path),
    baseDirectory = baseUri.directory,
    pathDirectory = pathUri.directory,
    directories = [],
    // folders = base.split("/"),
    paths;

  // if(uri.host) {
  //   return path;
  // }

  if(baseDirectory[0] === "/") {
    baseDirectory = baseDirectory.substring(1);
  }

  if(pathDirectory[pathDirectory.length-1] === "/") {
    baseDirectory = baseDirectory.substring(0, baseDirectory.length-1);
  }

  if(pathDirectory[0] === "/") {
    pathDirectory = pathDirectory.substring(1);
  }

  if(pathDirectory[pathDirectory.length-1] === "/") {
    pathDirectory = pathDirectory.substring(0, pathDirectory.length-1);
  }

  if(baseDirectory) {
    directories = baseDirectory.split("/");
  }

  paths = pathDirectory.split("/");

  paths.reverse().forEach(function(part, index){
    if(part === ".."){
      directories.pop();
    } else if(part === directories[directories.length-1]) {
      directories.pop();
      segments.unshift(part);
    } else {
      segments.unshift(part);
    }
  });

  url = [baseUri.origin];

  if(directories.length) {
    url = url.concat(directories);
  }

  if(segments) {
    url = url.concat(segments);
  }

  url = url.concat(pathUri.filename);

  return url.join("/");
};

function documentHeight() {
  return Math.max(
      document.documentElement.clientHeight,
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
  );
};

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

function prefixed(unprefixed) {
  var vendors = ["Webkit", "Moz", "O", "ms" ],
    prefixes = ['-Webkit-', '-moz-', '-o-', '-ms-'],
    upper = unprefixed[0].toUpperCase() + unprefixed.slice(1),
    length = vendors.length;

  if (typeof(document) === 'undefined' || typeof(document.body.style[unprefixed]) != 'undefined') {
    return unprefixed;
  }

  for ( var i=0; i < length; i++ ) {
    if (typeof(document.body.style[vendors[i] + upper]) != 'undefined') {
      return vendors[i] + upper;
    }
  }

  return unprefixed;
};

function defaults(obj) {
  for (var i = 1, length = arguments.length; i < length; i++) {
    var source = arguments[i];
    for (var prop in source) {
      if (obj[prop] === void 0) obj[prop] = source[prop];
    }
  }
  return obj;
};

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
      if(!source) return;
      Object.getOwnPropertyNames(source).forEach(function(propName) {
        Object.defineProperty(target, propName, Object.getOwnPropertyDescriptor(source, propName));
      });
    });
    return target;
};

// Fast quicksort insert for sorted array -- based on:
// http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
function insert(item, array, compareFunction) {
  var location = locationOf(item, array, compareFunction);
  array.splice(location, 0, item);

  return location;
};
// Returns where something would fit in
function locationOf(item, array, compareFunction, _start, _end) {
  var start = _start || 0;
  var end = _end || array.length;
  var pivot = parseInt(start + (end - start) / 2);
  var compared;
  if(!compareFunction){
    compareFunction = function(a, b) {
      if(a > b) return 1;
      if(a < b) return -1;
      if(a = b) return 0;
    };
  }
  if(end-start <= 0) {
    return pivot;
  }

  compared = compareFunction(array[pivot], item);
  if(end-start === 1) {
    return compared > 0 ? pivot : pivot + 1;
  }

  if(compared === 0) {
    return pivot;
  }
  if(compared === -1) {
    return locationOf(item, array, compareFunction, pivot, end);
  } else{
    return locationOf(item, array, compareFunction, start, pivot);
  }
};
// Returns -1 of mpt found
function indexOfSorted(item, array, compareFunction, _start, _end) {
  var start = _start || 0;
  var end = _end || array.length;
  var pivot = parseInt(start + (end - start) / 2);
  var compared;
  if(!compareFunction){
    compareFunction = function(a, b) {
      if(a > b) return 1;
      if(a < b) return -1;
      if(a = b) return 0;
    };
  }
  if(end-start <= 0) {
    return -1; // Not found
  }

  compared = compareFunction(array[pivot], item);
  if(end-start === 1) {
    return compared === 0 ? pivot : -1;
  }
  if(compared === 0) {
    return pivot; // Found
  }
  if(compared === -1) {
    return indexOfSorted(item, array, compareFunction, pivot, end);
  } else{
    return indexOfSorted(item, array, compareFunction, start, pivot);
  }
};

function bounds(el) {

  var style = window.getComputedStyle(el);
  var widthProps = ["width", "paddingRight", "paddingLeft", "marginRight", "marginLeft", "borderRightWidth", "borderLeftWidth"];
  var heightProps = ["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"];

  var width = 0;
  var height = 0;

  widthProps.forEach(function(prop){
    width += parseFloat(style[prop]) || 0;
  });

  heightProps.forEach(function(prop){
    height += parseFloat(style[prop]) || 0;
  });

  return {
    height: height,
    width: width
  };

};

function borders(el) {

  var style = window.getComputedStyle(el);
  var widthProps = ["paddingRight", "paddingLeft", "marginRight", "marginLeft", "borderRightWidth", "borderLeftWidth"];
  var heightProps = ["paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"];

  var width = 0;
  var height = 0;

  widthProps.forEach(function(prop){
    width += parseFloat(style[prop]) || 0;
  });

  heightProps.forEach(function(prop){
    height += parseFloat(style[prop]) || 0;
  });

  return {
    height: height,
    width: width
  };

};

function windowBounds() {

  var width = window.innerWidth;
  var height = window.innerHeight;

  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width: width,
    height: height
  };

};

//https://stackoverflow.com/questions/13482352/xquery-looking-for-text-with-single-quote/13483496#13483496
function cleanStringForXpath(str)  {
    var parts = str.match(/[^'"]+|['"]/g);
    parts = parts.map(function(part){
        if (part === "'")  {
            return '\"\'\"'; // output "'"
        }

        if (part === '"') {
            return "\'\"\'"; // output '"'
        }
        return "\'" + part + "\'";
    });
    return "concat(\'\'," + parts.join(",") + ")";
};

function indexOfTextNode(textNode){
  var parent = textNode.parentNode;
  var children = parent.childNodes;
  var sib;
  var index = -1;
  for (var i = 0; i < children.length; i++) {
    sib = children[i];
    if(sib.nodeType === Node.TEXT_NODE){
      index++;
    }
    if(sib == textNode) break;
  }

  return index;
};

function isXml(ext) {
  return ['xml', 'opf', 'ncx'].indexOf(ext) > -1;
}

function createBlobUrl(content, mime){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var tempUrl;
	var blob = new Blob([content], {type : mime });

  tempUrl = _URL.createObjectURL(blob);

  return tempUrl;
};

function type(obj){
  return Object.prototype.toString.call(obj).slice(8, -1);
}

function parse(markup, mime) {
  var doc;
  // console.log("parse", markup);

  if (typeof DOMParser === "undefined") {
    DOMParser = require('xmldom').DOMParser;
  }


  doc = new DOMParser().parseFromString(markup, mime);

  return doc;
}

function qs(el, sel) {
  var elements;

  if (typeof el.querySelector != "undefined") {
    return el.querySelector(sel);
  } else {
    elements = el.getElementsByTagName(sel);
    if (elements.length) {
      return elements[0];
    }
  }
}

function qsa(el, sel) {
  if (typeof el.querySelector != "undefined") {
    return el.querySelectorAll(sel);
  } else {
    return el.getElementsByTagName(sel);
  }
}

function qsp(el, sel, props) {
  var q, filtered;
  if (typeof el.querySelector != "undefined") {
    sel += '[';
    for (var prop in props) {
      sel += prop + "='" + props[prop] + "'";
    }
    sel += ']';
    return el.querySelector(sel);
  } else {
    q = el.getElementsByTagName(sel);
    filtered = Array.prototype.slice.call(q, 0).filter(function(el) {
      for (var prop in props) {
        if(el.getAttribute(prop) === props[prop]){
          return true;
        }
      }
      return false;
    });

    if (filtered) {
      return filtered[0];
    }
  }
}

module.exports = {
  // 'uri': uri,
  // 'folder': folder,
  'isElement': isElement,
  'uuid': uuid,
  'values': values,
  'resolveUrl': resolveUrl,
  'indexOfSorted': indexOfSorted,
  'documentHeight': documentHeight,
  'isNumber': isNumber,
  'prefixed': prefixed,
  'defaults': defaults,
  'extend': extend,
  'insert': insert,
  'locationOf': locationOf,
  'indexOfSorted': indexOfSorted,
  'requestAnimationFrame': requestAnimationFrame,
  'bounds': bounds,
  'borders': borders,
  'windowBounds': windowBounds,
  'cleanStringForXpath': cleanStringForXpath,
  'indexOfTextNode': indexOfTextNode,
  'isXml': isXml,
  'createBlobUrl': createBlobUrl,
  'type': type,
  'parse' : parse,
  'qs' : qs,
  'qsa' : qsa,
  'qsp' : qsp
};

},{"rsvp":4,"xmldom":7}],13:[function(require,module,exports){
var URI = require('urijs');
var core = require('./core');

/**
  EPUB CFI spec: http://www.idpf.org/epub/linking/cfi/epub-cfi.html

  Implements:
  - Character Offset: epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/2/1:3)
  - Simple Ranges : epubcfi(/6/4[chap01ref]!/4[body01]/10[para05],/2/1:1,/3:4)

  Does Not Implement:
  - Temporal Offset (~)
  - Spatial Offset (@)
  - Temporal-Spatial Offset (~ + @)
  - Text Location Assertion ([)
*/

function EpubCFI(cfiFrom, base, ignoreClass){
  var type;

  this.str = '';

  this.base = {};
  this.spinePos = 0; // For compatibility

  this.range = false; // true || false;

  this.path = {};
  this.start = null;
  this.end = null;

  // Allow instantiation without the 'new' keyword
  if (!(this instanceof EpubCFI)) {
    return new EpubCFI(cfiFrom, base, ignoreClass);
  }

  if(typeof base === 'string') {
    this.base = this.parseComponent(base);
  } else if(typeof base === 'object' && base.steps) {
    this.base = base;
  }

  type = this.checkType(cfiFrom);


  if(type === 'string') {
    this.str = cfiFrom;
    return core.extend(this, this.parse(cfiFrom));
  } else if (type === 'range') {
    return core.extend(this, this.fromRange(cfiFrom, this.base, ignoreClass));
  } else if (type === 'node') {
    return core.extend(this, this.fromNode(cfiFrom, this.base, ignoreClass));
  } else if (type === 'EpubCFI' && cfiFrom.path) {
    return cfiFrom;
  } else if (!cfiFrom) {
    return this;
  } else {
    throw new TypeError('not a valid argument for EpubCFI');
  }

};

EpubCFI.prototype.checkType = function(cfi) {

  if (this.isCfiString(cfi)) {
    return 'string';
  // Is a range object
  } else if (typeof cfi === 'object' && core.type(cfi) === "Range"){
    return 'range';
  } else if (typeof cfi === 'object' && cfi instanceof window.Node ){ // || typeof cfi === 'function'
    return 'node';
  } else if (typeof cfi === 'object' && cfi instanceof EpubCFI){
    return 'EpubCFI';
  } else {
    return false;
  }
};

EpubCFI.prototype.parse = function(cfiStr) {
  var cfi = {
      spinePos: -1,
      range: false,
      base: {},
      path: {},
      start: null,
      end: null
    };
  var baseComponent, pathComponent, range;

  if(typeof cfiStr !== "string") {
    return {spinePos: -1};
  }

  if(cfiStr.indexOf("epubcfi(") === 0 && cfiStr[cfiStr.length-1] === ")") {
    // Remove intial epubcfi( and ending )
    cfiStr = cfiStr.slice(8, cfiStr.length-1);
  }

  baseComponent = this.getChapterComponent(cfiStr);

  // Make sure this is a valid cfi or return
  if(!baseComponent) {
    return {spinePos: -1};
  }

  cfi.base = this.parseComponent(baseComponent);

  pathComponent = this.getPathComponent(cfiStr);
  cfi.path = this.parseComponent(pathComponent);

  range = this.getRange(cfiStr);

  if(range) {
    cfi.range = true;
    cfi.start = this.parseComponent(range[0]);
    cfi.end = this.parseComponent(range[1]);
  }

  // Get spine node position
  // cfi.spineSegment = cfi.base.steps[1];

  // Chapter segment is always the second step
  cfi.spinePos = cfi.base.steps[1].index;

  return cfi;
};

EpubCFI.prototype.parseComponent = function(componentStr){
  var component = {
    steps: [],
    terminal: {
      offset: null,
      assertion: null
    }
  };
  var parts = componentStr.split(':');
  var steps = parts[0].split('/');
  var terminal;

  if(parts.length > 1) {
    terminal = parts[1];
    component.terminal = this.parseTerminal(terminal);
  }

  if (steps[0] === '') {
    steps.shift(); // Ignore the first slash
  }

  component.steps = steps.map(function(step){
    return this.parseStep(step);
  }.bind(this));

  return component;
};

EpubCFI.prototype.parseStep = function(stepStr){
  var type, num, index, has_brackets, id;

  has_brackets = stepStr.match(/\[(.*)\]/);
  if(has_brackets && has_brackets[1]){
    id = has_brackets[1];
  }

  //-- Check if step is a text node or element
  num = parseInt(stepStr);

  if(isNaN(num)) {
    return;
  }

  if(num % 2 === 0) { // Even = is an element
    type = "element";
    index = num / 2 - 1;
  } else {
    type = "text";
    index = (num - 1 ) / 2;
  }

  return {
    "type" : type,
    'index' : index,
    'id' : id || null
  };
};

EpubCFI.prototype.parseTerminal = function(termialStr){
  var characterOffset, textLocationAssertion;
  var assertion = termialStr.match(/\[(.*)\]/);

  if(assertion && assertion[1]){
    characterOffset = parseInt(termialStr.split('[')[0]) || null;
    textLocationAssertion = assertion[1];
  } else {
    characterOffset = parseInt(termialStr) || null;
  }

  return {
    'offset': characterOffset,
    'assertion': textLocationAssertion
  };

};

EpubCFI.prototype.getChapterComponent = function(cfiStr) {

  var indirection = cfiStr.split("!");

  return indirection[0];
};

EpubCFI.prototype.getPathComponent = function(cfiStr) {

  var indirection = cfiStr.split("!");

  if(indirection[1]) {
    ranges = indirection[1].split(',');
    return ranges[0];
  }

};

EpubCFI.prototype.getRange = function(cfiStr) {

  var ranges = cfiStr.split(",");

  if(ranges.length === 3){
    return [
      ranges[1],
      ranges[2]
    ];
  }

  return false;
};

EpubCFI.prototype.getCharecterOffsetComponent = function(cfiStr) {
  var splitStr = cfiStr.split(":");
  return splitStr[1] || '';
};

EpubCFI.prototype.joinSteps = function(steps) {
  return steps.map(function(part){
    var segment = '';

    if(part.type === 'element') {
      segment += (part.index + 1) * 2;
    }

    if(part.type === 'text') {
      segment += 1 + (2 * part.index); // TODO: double check that this is odd
    }

    if(part.id) {
      segment += "[" + part.id + "]";
    }

    return segment;

  }).join('/');

};

EpubCFI.prototype.segmentString = function(segment) {
  var segmentString = '/';

  segmentString += this.joinSteps(segment.steps);

  if(segment.terminal && segment.terminal.offset != null){
    segmentString += ':' + segment.terminal.offset;
  }

  if(segment.terminal && segment.terminal.assertion != null){
    segmentString += '[' + segment.terminal.assertion + ']';
  }

  return segmentString;
};

EpubCFI.prototype.toString = function() {
  var cfiString = 'epubcfi(';

  cfiString += this.segmentString(this.base);

  cfiString += '!';
  cfiString += this.segmentString(this.path);

  // Add Range, if present
  if(this.start) {
    cfiString += ',';
    cfiString += this.segmentString(this.start);
  }

  if(this.end) {
    cfiString += ',';
    cfiString += this.segmentString(this.end);
  }

  cfiString += ")";

  return cfiString;
};

EpubCFI.prototype.compare = function(cfiOne, cfiTwo) {
  if(typeof cfiOne === 'string') {
    cfiOne = new EpubCFI(cfiOne);
  }
  if(typeof cfiTwo === 'string') {
    cfiTwo = new EpubCFI(cfiTwo);
  }
  // Compare Spine Positions
  if(cfiOne.spinePos > cfiTwo.spinePos) {
    return 1;
  }
  if(cfiOne.spinePos < cfiTwo.spinePos) {
    return -1;
  }


  // Compare Each Step in the First item
  for (var i = 0; i < cfiOne.path.steps.length; i++) {
    if(!cfiTwo.path.steps[i]) {
      return 1;
    }
    if(cfiOne.path.steps[i].index > cfiTwo.path.steps[i].index) {
      return 1;
    }
    if(cfiOne.path.steps[i].index < cfiTwo.path.steps[i].index) {
      return -1;
    }
    // Otherwise continue checking
  }

  // All steps in First equal to Second and First is Less Specific
  if(cfiOne.path.steps.length < cfiTwo.path.steps.length) {
    return 1;
  }

  // Compare the charecter offset of the text node
  if(cfiOne.path.terminal.offset > cfiTwo.path.terminal.offset) {
    return 1;
  }
  if(cfiOne.path.terminal.offset < cfiTwo.path.terminal.offset) {
    return -1;
  }

  // TODO: compare ranges

  // CFI's are equal
  return 0;
};

EpubCFI.prototype.step = function(node) {
  var nodeType = (node.nodeType === Node.TEXT_NODE) ? 'text' : 'element';

  return {
    'id' : node.id,
    'tagName' : node.tagName,
    'type' : nodeType,
    'index' : this.position(node)
  };
};

EpubCFI.prototype.filteredStep = function(node, ignoreClass) {
  var filteredNode = this.filter(node, ignoreClass);
  var nodeType;

  // Node filtered, so ignore
  if (!filteredNode) {
    return;
  }

  // Otherwise add the filter node in
  nodeType = (filteredNode.nodeType === Node.TEXT_NODE) ? 'text' : 'element';

  return {
    'id' : filteredNode.id,
    'tagName' : filteredNode.tagName,
    'type' : nodeType,
    'index' : this.filteredPosition(filteredNode, ignoreClass)
  };
};

EpubCFI.prototype.pathTo = function(node, offset, ignoreClass) {
  var segment = {
    steps: [],
    terminal: {
      offset: null,
      assertion: null
    }
  };
  var currentNode = node;
  var step;

  while(currentNode && currentNode.parentNode &&
        currentNode.parentNode.nodeType != Node.DOCUMENT_NODE) {

    if (ignoreClass) {
      step = this.filteredStep(currentNode, ignoreClass);
    } else {
      step = this.step(currentNode);
    }

    if (step) {
      segment.steps.unshift(step);
    }

    currentNode = currentNode.parentNode;

  }

  if (offset != null && offset >= 0) {

    segment.terminal.offset = offset;

    // Make sure we are getting to a textNode if there is an offset
    if(segment.steps[segment.steps.length-1].type != "text") {
      segment.steps.push({
        'type' : "text",
        'index' : 0
      });
    }

  }


  return segment;
}

EpubCFI.prototype.equalStep = function(stepA, stepB) {
  if (!stepA || !stepB) {
    return false;
  }

  if(stepA.index === stepB.index &&
     stepA.id === stepB.id &&
     stepA.type === stepB.type) {
    return true;
  }

  return false;
};
EpubCFI.prototype.fromRange = function(range, base, ignoreClass) {
  var cfi = {
      range: false,
      base: {},
      path: {},
      start: null,
      end: null
    };

  var start = range.startContainer;
  var end = range.endContainer;

  var startOffset = range.startOffset;
  var endOffset = range.endOffset;

  var needsIgnoring = false;

  if (ignoreClass) {
    // Tell pathTo if / what to ignore
    needsIgnoring = (start.ownerDocument.querySelector('.' + ignoreClass) != null);
  }


  if (typeof base === 'string') {
    cfi.base = this.parseComponent(base);
    cfi.spinePos = cfi.base.steps[1].index;
  } else if (typeof base === 'object') {
    cfi.base = base;
  }

  if (range.collapsed) {
    if (needsIgnoring) {
      startOffset = this.patchOffset(start, startOffset, ignoreClass);
    }
    cfi.path = this.pathTo(start, startOffset, ignoreClass);
  } else {
    cfi.range = true;

    if (needsIgnoring) {
      startOffset = this.patchOffset(start, startOffset, ignoreClass);
    }

    cfi.start = this.pathTo(start, startOffset, ignoreClass);

    if (needsIgnoring) {
      endOffset = this.patchOffset(end, endOffset, ignoreClass);
    }

    cfi.end = this.pathTo(end, endOffset, ignoreClass);

    // Create a new empty path
    cfi.path = {
      steps: [],
      terminal: null
    };

    // Push steps that are shared between start and end to the common path
    var len = cfi.start.steps.length;
    var i;

    for (i = 0; i < len; i++) {
      if (this.equalStep(cfi.start.steps[i], cfi.end.steps[i])) {
        if(i == len-1) {
          // Last step is equal, check terminals
          if(cfi.start.terminal === cfi.end.terminal) {
            // CFI's are equal
            cfi.path.steps.push(cfi.start.steps[i]);
            // Not a range
            cfi.range = false;
          }
        } else {
          cfi.path.steps.push(cfi.start.steps[i]);
        }

      } else {
        break;
      }
    };

    cfi.start.steps = cfi.start.steps.slice(cfi.path.steps.length);
    cfi.end.steps = cfi.end.steps.slice(cfi.path.steps.length);

    // TODO: Add Sanity check to make sure that the end if greater than the start
  }

  return cfi;
}

EpubCFI.prototype.fromNode = function(anchor, base, ignoreClass) {
  var cfi = {
      range: false,
      base: {},
      path: {},
      start: null,
      end: null
    };

  var needsIgnoring = false;

  if (ignoreClass) {
    // Tell pathTo if / what to ignore
    needsIgnoring = (anchor.ownerDocument.querySelector('.' + ignoreClass) != null);
  }

  if (typeof base === 'string') {
    cfi.base = this.parseComponent(base);
    cfi.spinePos = cfi.base.steps[1].index;
  } else if (typeof base === 'object') {
    cfi.base = base;
  }

  cfi.path = this.pathTo(anchor, null, ignoreClass);

  return cfi;
};


EpubCFI.prototype.filter = function(anchor, ignoreClass) {
  var needsIgnoring;
  var sibling; // to join with
  var parent, prevSibling, nextSibling;
  var isText = false;

  if (anchor.nodeType === Node.TEXT_NODE) {
    isText = true;
    parent = anchor.parentNode;
    needsIgnoring = anchor.parentNode.classList.contains(ignoreClass);
  } else {
    isText = false;
    needsIgnoring = anchor.classList.contains(ignoreClass);
  }

  if (needsIgnoring && isText) {
    previousSibling = parent.previousSibling;
    nextSibling = parent.nextSibling;

    // If the sibling is a text node, join the nodes
    if (previousSibling && previousSibling.nodeType === Node.TEXT_NODE) {
      sibling = previousSibling;
    } else if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
      sibling = nextSibling;
    }

    if (sibling) {
      return sibling;
    } else {
      // Parent will be ignored on next step
      return anchor;
    }

  } else if (needsIgnoring && !isText) {
    // Otherwise just skip the element node
    return false;
  } else {
    // No need to filter
    return anchor;
  }

};

EpubCFI.prototype.patchOffset = function(anchor, offset, ignoreClass) {
  var needsIgnoring;
  var sibling;

  if (anchor.nodeType != Node.TEXT_NODE) {
    console.error("Anchor must be a text node");
    return;
  }

  var curr = anchor;
  var totalOffset = offset;

  // If the parent is a ignored node, get offset from it's start
  if (anchor.parentNode.classList.contains(ignoreClass)) {
    curr = anchor.parentNode;
  }

  while (curr.previousSibling) {
    if(curr.previousSibling.nodeType === Node.ELEMENT_NODE) {
      // Originally a text node, so join
      if(curr.previousSibling.classList.contains(ignoreClass)){
        totalOffset += curr.previousSibling.textContent.length;
      } else {
        break; // Normal node, dont join
      }
    } else {
      // If the previous sibling is a text node, join the nodes
      totalOffset += curr.previousSibling.textContent.length;
    }

    curr = curr.previousSibling;
  }

  return totalOffset;

};

EpubCFI.prototype.normalizedMap = function(children, nodeType, ignoreClass) {
  var output = {};
  var prevIndex = -1;
  var i, len = children.length;
  var currNodeType;
  var prevNodeType;

  for (i = 0; i < len; i++) {

    currNodeType = children[i].nodeType;

    // Check if needs ignoring
    if (currNodeType === Node.ELEMENT_NODE &&
        children[i].classList.contains(ignoreClass)) {
      currNodeType = Node.TEXT_NODE;
    }

    if (i > 0 &&
        currNodeType === Node.TEXT_NODE &&
        prevNodeType === Node.TEXT_NODE) {
      // join text nodes
      output[i] = prevIndex;
    } else if (nodeType === currNodeType){
      prevIndex = prevIndex + 1;
      output[i] = prevIndex;
    }

    prevNodeType = currNodeType;

  }

  return output;
};

EpubCFI.prototype.position = function(anchor) {
  var children, index, map;

  if (anchor.nodeType === Node.ELEMENT_NODE) {
    children = anchor.parentNode.children;
    index = Array.prototype.indexOf.call(children, anchor);
  } else {
    children = this.textNodes(anchor.parentNode);
    index = children.indexOf(anchor);
  }

  return index;
};

EpubCFI.prototype.filteredPosition = function(anchor, ignoreClass) {
  var children, index, map;

  if (anchor.nodeType === Node.ELEMENT_NODE) {
    children = anchor.parentNode.children;
    map = this.normalizedMap(children, Node.ELEMENT_NODE, ignoreClass);
  } else {
    children = anchor.parentNode.childNodes;
    // Inside an ignored node
    if(anchor.parentNode.classList.contains(ignoreClass)) {
      anchor = anchor.parentNode;
      children = anchor.parentNode.childNodes;
    }
    map = this.normalizedMap(children, Node.TEXT_NODE, ignoreClass);
  }


  index = Array.prototype.indexOf.call(children, anchor);

  return map[index];
};

EpubCFI.prototype.stepsToXpath = function(steps) {
  var xpath = [".", "*"];

  steps.forEach(function(step){
    var position = step.index + 1;

    if(step.id){
      xpath.push("*[position()=" + position + " and @id='" + step.id + "']");
    } else if(step.type === "text") {
      xpath.push("text()[" + position + "]");
    } else {
      xpath.push("*[" + position + "]");
    }
  });

  return xpath.join("/");
};


/*

To get the last step if needed:

// Get the terminal step
lastStep = steps[steps.length-1];
// Get the query string
query = this.stepsToQuery(steps);
// Find the containing element
startContainerParent = doc.querySelector(query);
// Find the text node within that element
if(startContainerParent && lastStep.type == "text") {
  container = startContainerParent.childNodes[lastStep.index];
}
*/
EpubCFI.prototype.stepsToQuerySelector = function(steps) {
  var query = ["html"];

  steps.forEach(function(step){
    var position = step.index + 1;

    if(step.id){
      query.push("#" + step.id);
    } else if(step.type === "text") {
      // unsupported in querySelector
      // query.push("text()[" + position + "]");
    } else {
      query.push("*:nth-child(" + position + ")");
    }
  });

  return query.join(">");

};

EpubCFI.prototype.textNodes = function(container, ignoreClass) {
  return Array.prototype.slice.call(container.childNodes).
    filter(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return true;
      } else if (ignoreClass && node.classList.contains(ignoreClass)) {
        return true;
      }
      return false;
    });
};

EpubCFI.prototype.walkToNode = function(steps, _doc, ignoreClass) {
  var doc = _doc || document;
  var container = doc.documentElement;
  var step;
  var len = steps.length;
  var i;

  for (i = 0; i < len; i++) {
    step = steps[i];

    if(step.type === "element") {
      container = container.children[step.index];
    } else if(step.type === "text"){
      container = this.textNodes(container, ignoreClass)[step.index];
    }

  };

  return container;
};

EpubCFI.prototype.findNode = function(steps, _doc, ignoreClass) {
  var doc = _doc || document;
  var container;
  var xpath;

  if(!ignoreClass && typeof doc.evaluate != 'undefined') {
    xpath = this.stepsToXpath(steps);
    container = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  } else if(ignoreClass) {
    container = this.walkToNode(steps, doc, ignoreClass);
  } else {
    container = this.walkToNode(steps, doc);
  }

  return container;
};

EpubCFI.prototype.fixMiss = function(steps, offset, _doc, ignoreClass) {
  var container = this.findNode(steps.slice(0,-1), _doc, ignoreClass);
  var children = container.childNodes;
  var map = this.normalizedMap(children, Node.TEXT_NODE, ignoreClass);
  var i;
  var child;
  var len;
  var childIndex;
  var lastStepIndex = steps[steps.length-1].index;

  for (var childIndex in map) {
    if (!map.hasOwnProperty(childIndex)) return;

    if(map[childIndex] === lastStepIndex) {
      child = children[childIndex];
      len = child.textContent.length;
      if(offset > len) {
        offset = offset - len;
      } else {
        if (child.nodeType === Node.ELEMENT_NODE) {
          container = child.childNodes[0];
        } else {
          container = child;
        }
        break;
      }
    }
  }

  return {
    container: container,
    offset: offset
  };

};

EpubCFI.prototype.toRange = function(_doc, ignoreClass) {
  var doc = _doc || document;
  var range = doc.createRange();
  var start, end, startContainer, endContainer;
  var cfi = this;
  var startSteps, endSteps;
  var needsIgnoring = ignoreClass ? (doc.querySelector('.' + ignoreClass) != null) : false;
  var missed;

  if (cfi.range) {
    start = cfi.start;
    startSteps = cfi.path.steps.concat(start.steps);
    startContainer = this.findNode(startSteps, doc, needsIgnoring ? ignoreClass : null);
    end = cfi.end;
    endSteps = cfi.path.steps.concat(end.steps);
    endContainer = this.findNode(endSteps, doc, needsIgnoring ? ignoreClass : null);
  } else {
    start = cfi.path;
    startSteps = cfi.path.steps;
    startContainer = this.findNode(cfi.path.steps, doc, needsIgnoring ? ignoreClass : null);
  }

  if(startContainer) {
    try {

      if(start.terminal.offset != null) {
        range.setStart(startContainer, start.terminal.offset);
      } else {
        range.setStart(startContainer, 0);
      }

    } catch (e) {
      missed = this.fixMiss(startSteps, start.terminal.offset, doc, needsIgnoring ? ignoreClass : null);
      range.setStart(missed.container, missed.offset);
    }
  } else {
    // No start found
    return null;
  }

  if (endContainer) {
    try {

      if(end.terminal.offset != null) {
        range.setEnd(endContainer, end.terminal.offset);
      } else {
        range.setEnd(endContainer, 0);
      }

    } catch (e) {
      missed = this.fixMiss(endSteps, cfi.end.terminal.offset, doc, needsIgnoring ? ignoreClass : null);
      range.setEnd(missed.container, missed.offset);
    }
  }


  // doc.defaultView.getSelection().addRange(range);
  return range;
};

// is a cfi string, should be wrapped with "epubcfi()"
EpubCFI.prototype.isCfiString = function(str) {
  if(typeof str === 'string' &&
      str.indexOf("epubcfi(") === 0 &&
      str[str.length-1] === ")") {
    return true;
  }

  return false;
};

EpubCFI.prototype.generateChapterComponent = function(_spineNodeIndex, _pos, id) {
  var pos = parseInt(_pos),
    spineNodeIndex = _spineNodeIndex + 1,
    cfi = '/'+spineNodeIndex+'/';

  cfi += (pos + 1) * 2;

  if(id) {
    cfi += "[" + id + "]";
  }

  return cfi;
};

module.exports = EpubCFI;

},{"./core":12,"urijs":6}],14:[function(require,module,exports){
var RSVP = require('rsvp');

//-- Hooks allow for injecting functions that must all complete in order before finishing
//   They will execute in parallel but all must finish before continuing
//   Functions may return a promise if they are asycn.

// this.content = new EPUBJS.Hook();
// this.content.register(function(){});
// this.content.trigger(args).then(function(){});

function Hook(context){
  this.context = context || this;
  this.hooks = [];
};

// Adds a function to be run before a hook completes
Hook.prototype.register = function(){
  for(var i = 0; i < arguments.length; ++i) {
    if (typeof arguments[i]  === "function") {
      this.hooks.push(arguments[i]);
    } else {
      // unpack array
      for(var j = 0; j < arguments[i].length; ++j) {
        this.hooks.push(arguments[i][j]);
      }
    }
  }
};

// Triggers a hook to run all functions
Hook.prototype.trigger = function(){
  var args = arguments;
  var context = this.context;
  var promises = [];

  this.hooks.forEach(function(task, i) {
    var executing = task.apply(context, args);

    if(executing && typeof executing["then"] === "function") {
      // Task is a function that returns a promise
      promises.push(executing);
    }
    // Otherwise Task resolves immediately, continue
  });


  return RSVP.all(promises);
};

// Adds a function to be run before a hook completes
Hook.prototype.list = function(){
  return this.hooks;
};

Hook.prototype.clear = function(){
  return this.hooks = [];
};

module.exports = Hook;

},{"rsvp":4}],15:[function(require,module,exports){
var core = require('./core');

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



  this.columnAxis = core.prefixed('columnAxis');
  this.columnGap = core.prefixed('columnGap');
  this.columnWidth = core.prefixed('columnWidth');
  this.columnFill = core.prefixed('columnFill');

  this.width = width;
  this.height = _height;
  this.spread = spreadWidth;
  this.delta = delta;

  this.column = colWidth;
  this.gap = gap;
  this.divisor = divisor;

};

Reflowable.prototype.format = function(contents){

  // var $doc = doc.documentElement;
  // var $body = doc.body;//view.document.querySelector("body");

  // $doc.style.overflow = "hidden";
  contents.overflow("hidden");

  // Must be set to the new calculated width or the columns will be off
  // $body.style.width = this.width + "px";
  // $doc.style.width = this.width + "px";
  contents.width(this.width);

  //-- Adjust height
  // $body.style.height = this.height + "px";
  contents.height(this.height);

  contents.css("margin", "0");

  //-- Add columns
  // $body.style[this.columnAxis] = "horizontal";
  contents.css(this.columnAxis, "horizontal");
  // $body.style[this.columnFill] = "auto";
  contents.css(this.columnFill, "auto");
  // $body.style[this.columnGap] = this.gap+"px";
  contents.css(this.columnGap, this.gap+"px");
  // $body.style[this.columnWidth] = this.column +"px";
  contents.css(this.columnWidth, this.column+"px");

  // Add extra padding for the gap between this and the next view
  // view.iframe.style.marginRight = this.gap+"px";
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

  this.name = "pre-paginated";

};

Fixed.prototype.calculate = function(_width, _height){
  this.width = _width;
  this.height = _height;
};

Fixed.prototype.format = function(contents){
  var viewport = contents.viewport();
  // var width, height;
  //
  // var $doc = doc.documentElement;
  // var $viewport = $doc.querySelector("[name=viewport");
  //
  // /**
  // * check for the viewport size
  // * <meta name="viewport" content="width=1024,height=697" />
  // */
  // if($viewport && $viewport.hasAttribute("content")) {
  //   content = $viewport.getAttribute("content");
  //   contents = content.split(',');
  //   if(contents[0]){
  //     width = contents[0].replace("width=", '');
  //   }
  //   if(contents[1]){
  //     height = contents[1].replace("height=", '');
  //   }
  // }

  //-- Adjust width and height
  // $doc.style.width =  width + "px" || "auto";
  // $doc.style.height =  height + "px" || "auto";
  if (viewport.width) {
    contents.width(viewport.width);
  }

  if (viewport.height) {
    contents.height(viewport.height);
  }

  //-- Scroll
  // $doc.style.overflow = "auto";
  contents.overflow("auto");

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

  // var $doc = doc.documentElement;

  // $doc.style.width = "auto";
  // $doc.style.height = "auto";
  // contents.width("auto");
  contents.height("auto");

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

},{"./core":12}],16:[function(require,module,exports){
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

},{"./core":12,"./epubcfi":13,"./queue":23,"rsvp":4}],17:[function(require,module,exports){
var RSVP = require('rsvp');
var core = require('../core');
var SingleViewManager = require('./single');

function ContinuousViewManager(options) {

	SingleViewManager.apply(this, arguments); // call super constructor.

	this.settings = core.extend(this.settings || {}, {
		infinite: true,
		overflow: "auto",
		axis: "vertical",
		offset: 500,
		offsetDelta: 250
	});

	core.extend(this.settings, options.settings);

};

// subclass extends superclass
ContinuousViewManager.prototype = Object.create(SingleViewManager.prototype);
ContinuousViewManager.prototype.constructor = ContinuousViewManager;


ContinuousViewManager.prototype.moveTo = function(offset){
  // var bounds = this.stage.bounds();
  // var dist = Math.floor(offset.top / bounds.height) * bounds.height;
  return this.check(
		offset.left+this.settings.offset,
		offset.top+this.settings.offset)
		.then(function(){

	    if(this.settings.axis === "vertical") {
	      this.scrollBy(0, offset.top);
	    } else {
	      this.scrollBy(offset.left, 0);
	    }

	  }.bind(this));
};
/*
ContinuousViewManager.prototype.afterDisplayed = function(currView){
	var next = currView.section.next();
	var prev = currView.section.prev();
	var index = this.views.indexOf(currView);
	var prevView, nextView;

	if(index + 1 === this.views.length && next) {
		nextView = this.createView(next);
		this.q.enqueue(this.append.bind(this), nextView);
	}

	if(index === 0 && prev) {
		prevView = this.createView(prev, this.viewSettings);
		this.q.enqueue(this.prepend.bind(this), prevView);
	}

	// this.removeShownListeners(currView);
	// currView.onShown = this.afterDisplayed.bind(this);
	this.trigger("added", currView.section);

};
*/
ContinuousViewManager.prototype.afterResized = function(view){
	this.trigger("resize", view.section);
};

// Remove Previous Listeners if present
ContinuousViewManager.prototype.removeShownListeners = function(view){

	// view.off("shown", this.afterDisplayed);
	// view.off("shown", this.afterDisplayedAbove);
	view.onDisplayed = function(){};

};

ContinuousViewManager.prototype.append = function(section){
	var view = this.createView(section);

	return this.q.enqueue(function() {

		this.views.append(view);

		return this.update();

	}.bind(this));
};

ContinuousViewManager.prototype.prepend = function(section){
	var view = this.createView(section);

	view.on("resized", this.counter.bind(this));

	return this.q.enqueue(function() {

		this.views.prepend(view);

		return this.update();

	}.bind(this));

};

ContinuousViewManager.prototype.counter = function(bounds){

	if(this.settings.axis === "vertical") {
		this.scrollBy(0, bounds.heightDelta, true);
	} else {
		this.scrollBy(bounds.widthDelta, 0, true);
	}

};
/*
ContinuousViewManager.prototype.check = function(_offset){
	var checking = new RSVP.defer();
	var container = this.stage.bounds();
  var promises = [];
  var offset = _offset || this.settings.offset;

	this.views.each(function(view){
		var visible = this.isVisible(view, offset, offset, container);

		if(visible) {

			if(!view.displayed && !view.rendering) {
          // console.log("render",view.section.index)
					promises.push(this.render(view));
			}

		} else {

			if(view.displayed) {
        // console.log("destroy", view.section.index)
        this.q.enqueue(view.destroy.bind(view));
        // view.destroy();
        // this.q.enqueue(this.trim);
        clearTimeout(this.trimTimeout);
        this.trimTimeout = setTimeout(function(){
          this.q.enqueue(this.trim.bind(this));
        }.bind(this), 250);
			}

		}

	}.bind(this));


  if(promises.length){

    return RSVP.all(promises)
      .then(function(posts) {
        // Check to see if anything new is on screen after rendering
        this.q.enqueue(this.check.bind(this));

      }.bind(this));

  } else {
    checking.resolve();

    return checking.promise;
  }

};
*/

ContinuousViewManager.prototype.update = function(_offset){
	var container = this.stage.bounds();
	var views = this.views;
	var viewsLength = views.length;
	var visible = [];
	var isVisible;
	var view;

	var updating = new RSVP.defer();
	var promises = [];

	for (var i = 0; i < viewsLength; i++) {
    view = views[i];
    isVisible = this.isVisible(view, 0, 0, container);

    if(isVisible === true) {
			promises.push(view.display());
      visible.push(view);
    } else {
			this.q.enqueue(view.destroy.bind(view));

			clearTimeout(this.trimTimeout);
			this.trimTimeout = setTimeout(function(){
				this.q.enqueue(this.trim.bind(this));
			}.bind(this), 250);
    }

  }

	if(promises.length){
    return RSVP.all(promises);
  } else {
    updating.resolve();
    return updating.promise;
  }

};

ContinuousViewManager.prototype.check = function(_offsetLeft, _offsetTop){
	var next, prev;
	var horizontal = (this.settings.axis === "horizontal");
	var delta = this.settings.offset || 0;

	if (_offsetLeft && horizontal) {
		delta = _offsetLeft;
	}

	if (_offsetTop && !horizontal) {
		delta = _offsetTop;
	}

	var bounds = this.stage.bounds(); // TODO: save this until resize

	var offset = horizontal ? this.container.scrollLeft : this.container.scrollTop;
	var visibleLength = horizontal ? bounds.width : bounds.height;
	var contentLength = horizontal ? this.container.scrollWidth : this.container.scrollHeight;

	var checking = new RSVP.defer();
	var promises = [];

	if (offset + visibleLength + delta >= contentLength) {
    next = this.views.last().section.next();
    if(next) {
      promises.push(this.append(next));
    }
  }

  if (offset - delta < 0 ) {
    prev = this.views.first().section.prev();
    if(prev) {
      promises.push(this.prepend(prev));
    }
  }

  if(promises.length){

    return RSVP.all(promises)
      .then(function(posts) {
        // Check to see if anything new is on screen after rendering
        this.q.enqueue(this.update.bind(this));

      }.bind(this));

  } else {
    checking.resolve();

    return checking.promise;
  }

};

ContinuousViewManager.prototype.trim = function(){
  var task = new RSVP.defer();
  var displayed = this.views.displayed();
  var first = displayed[0];
  var last = displayed[displayed.length-1];
  var firstIndex = this.views.indexOf(first);
  var lastIndex = this.views.indexOf(last);
  var above = this.views.slice(0, firstIndex);
  var below = this.views.slice(lastIndex+1);

  // Erase all but last above
  for (var i = 0; i < above.length-1; i++) {
    this.erase(above[i], above);
  }

  // Erase all except first below
  for (var j = 1; j < below.length; j++) {
    this.erase(below[j]);
  }

  task.resolve();
  return task.promise;
};

ContinuousViewManager.prototype.erase = function(view, above){ //Trim

	var prevTop;
	var prevLeft;

	if(this.settings.height) {
  	prevTop = this.container.scrollTop;
		prevLeft = this.container.scrollLeft;
  } else {
  	prevTop = window.scrollY;
		prevLeft = window.scrollX;
  }

	var bounds = view.bounds();

	this.views.remove(view);

	if(above) {

		if(this.settings.axis === "vertical") {
			this.scrollTo(0, prevTop - bounds.height, true);
		} else {
			this.scrollTo(prevLeft - bounds.width, 0, true);
		}
	}

};

ContinuousViewManager.prototype.addEventListeners = function(stage){
	this.addScrollListeners();
};

ContinuousViewManager.prototype.addScrollListeners = function() {
  var scroller;

  this.tick = core.requestAnimationFrame;

  if(this.settings.height) {
  	this.prevScrollTop = this.container.scrollTop;
  	this.prevScrollLeft = this.container.scrollLeft;
  } else {
  	this.prevScrollTop = window.scrollY;
		this.prevScrollLeft = window.scrollX;
  }

  this.scrollDeltaVert = 0;
  this.scrollDeltaHorz = 0;

  if(this.settings.height) {
  	scroller = this.container;
  } else {
  	scroller = window;
  }

  scroller.addEventListener("scroll", function(e){
    if(!this.ignore) {
      this.scrolled = true;
    } else {
      this.ignore = false;
    }
  }.bind(this));

  window.addEventListener('unload', function(e){
    this.ignore = true;
    this.destroy();
  }.bind(this));

  this.tick.call(window, this.onScroll.bind(this));

  this.scrolled = false;

};

ContinuousViewManager.prototype.onScroll = function(){

  if(this.scrolled) {

    if(this.settings.height) {
	  	scrollTop = this.container.scrollTop;
	  	scrollLeft = this.container.scrollLeft;
	  } else {
	  	scrollTop = window.scrollY;
			scrollLeft = window.scrollX;
	  }

    if(!this.ignore) {

	    if((this.scrollDeltaVert === 0 &&
	    	 this.scrollDeltaHorz === 0) ||
	    	 this.scrollDeltaVert > this.settings.offsetDelta ||
	    	 this.scrollDeltaHorz > this.settings.offsetDelta) {

				this.q.enqueue(this.check.bind(this));

				this.scrollDeltaVert = 0;
	    	this.scrollDeltaHorz = 0;

				this.trigger("scroll", {
		      top: scrollTop,
		      left: scrollLeft
		    });

			}

		} else {
	    this.ignore = false;
		}

    this.scrollDeltaVert += Math.abs(scrollTop-this.prevScrollTop);
    this.scrollDeltaHorz += Math.abs(scrollLeft-this.prevScrollLeft);

		this.prevScrollTop = scrollTop;
		this.prevScrollLeft = scrollLeft;

  	clearTimeout(this.scrollTimeout);
		this.scrollTimeout = setTimeout(function(){
			this.scrollDeltaVert = 0;
	    this.scrollDeltaHorz = 0;
		}.bind(this), 150);


    this.scrolled = false;
  }

  this.tick.call(window, this.onScroll.bind(this));

};


//  ContinuousViewManager.prototype.resizeView = function(view) {
//
// 	if(this.settings.axis === "horizontal") {
// 		view.lock("height", this.stage.width, this.stage.height);
// 	} else {
// 		view.lock("width", this.stage.width, this.stage.height);
// 	}
//
// };

ContinuousViewManager.prototype.currentLocation = function(){
  var visible = this.visible();
  var startPage, endPage;

  var container = this.container.getBoundingClientRect();

  if(visible.length === 1) {
    return this.map.page(visible[0]);
  }

  if(visible.length > 1) {

    startPage = this.map.page(visible[0]);
    endPage = this.map.page(visible[visible.length-1]);

    return {
      start: startPage.start,
      end: endPage.end
    };
  }

};

/*
Continuous.prototype.current = function(what){
  var view, top;
  var container = this.container.getBoundingClientRect();
  var length = this.views.length - 1;

  if(this.settings.axis === "horizontal") {

    for (var i = length; i >= 0; i--) {
      view = this.views[i];
      left = view.position().left;

      if(left < container.right) {

        if(this._current == view) {
          break;
        }

        this._current = view;
        break;
      }
    }

  } else {

    for (var i = length; i >= 0; i--) {
      view = this.views[i];
      top = view.bounds().top;
      if(top < container.bottom) {

        if(this._current == view) {
          break;
        }

        this._current = view;

        break;
      }
    }

  }

  return this._current;
};
*/

module.exports = ContinuousViewManager;

},{"../core":12,"./single":19,"rsvp":4}],18:[function(require,module,exports){
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

},{"../core":12,"../layout":15,"../map":20,"./continuous":17,"rsvp":4}],19:[function(require,module,exports){
var RSVP = require('rsvp');
var core = require('../core');
var Stage = require('../stage');
var Views = require('../views');
var EpubCFI = require('../epubcfi');
var Layout = require('../layout');

function SingleViewManager(options) {

	this.View = options.view;
	this.renderer = options.renderer;
	this.q = options.queue;

	this.settings = core.extend(this.settings || {}, {
		infinite: true,
		hidden: false,
		width: false,
		height: null,
		globalLayoutProperties : { layout: 'reflowable', spread: 'auto', orientation: 'auto'},
		// layout: null,
		axis: "vertical",
		ignoreClass: ''
	});

	core.extend(this.settings, options.settings);


	this.viewSettings = {
		ignoreClass: this.settings.ignoreClass,
		globalLayoutProperties: this.settings.globalLayoutProperties,
		axis: this.settings.axis,
		layout: this.layout,
		width: 0,
		height: 0
	};

}

SingleViewManager.prototype.render = function(element, size){

	// Save the stage
	this.stage = new Stage({
		width: size.width,
		height: size.height,
		hidden: this.settings.hidden
	});

	this.stage.attachTo(element);

	// Get this stage container div
	this.container = this.stage.getContainer();

	// Views array methods
	this.views = new Views(this.container);

	// Calculate Stage Size
	this.bounds = this.stage.bounds();

	// Set the dimensions for views
	this.viewSettings.width = this.bounds.width;
	this.viewSettings.height = this.bounds.height;

	// Function to handle a resize event.
	// Will only attach if width and height are both fixed.
	this.stage.onResize(this.onResized.bind(this));

	// Add Event Listeners
	this.addEventListeners();

	// Add Layout method
	this.applyLayoutMethod();
};

SingleViewManager.prototype.addEventListeners = function(){

};

SingleViewManager.prototype.onResized = function(e) {
	this.resize();
};

SingleViewManager.prototype.resize = function(width, height){

	this.bounds = this.stage.bounds(width, height);

	// Update for new views
	this.viewSettings.width = this.bounds.width;
	this.viewSettings.height = this.bounds.height;

	// Update for existing views
	this.views.each(function(view) {
		view.size(this.bounds.width, this.bounds.height);
	}.bind(this));

	this.trigger("resized", {
		width: this.stage.width,
		height: this.stage.height
	});

};

SingleViewManager.prototype.setLayout = function(layout){

	this.viewSettings.layout = layout;

	this.views.each(function(view){
		view.setLayout(layout);
	});

};

SingleViewManager.prototype.createView = function(section) {
	return new this.View(section, this.viewSettings);
};

SingleViewManager.prototype.display = function(section, target){

	var displaying = new RSVP.defer();
	var displayed = displaying.promise;

	var isCfi = EpubCFI().isCfiString(target);

	// Check to make sure the section we want isn't already shown
	var visible = this.views.find(section);

	// View is already shown, just move to correct location
	if(visible && target) {
		offset = visible.locationOf(target);
		this.moveTo(offset);
		return displaying.resolve();
	}

	// Hide all current views
	this.views.hide();

	this.views.clear();

	// Create a new view
	view = this.createView(section);

	return this.add(view)
		.then(function(){

			// Move to correct place within the section, if needed
			if(target) {
				offset = view.locationOf(target);
				return this.moveTo(offset);
			}

		}.bind(this))
		// .then(function(){
		// 	return this.hooks.display.trigger(view);
		// }.bind(this))
		.then(function(){
			this.views.show();
		}.bind(this));

};

SingleViewManager.prototype.afterDisplayed = function(view){
	this.trigger("added", view);
};

SingleViewManager.prototype.afterResized = function(view){
	this.trigger("resize", view.section);
};

SingleViewManager.prototype.moveTo = function(offset){
	this.scrollTo(offset.left, offset.top);
};

SingleViewManager.prototype.add = function(view){

	this.views.append(view);

	// view.on("shown", this.afterDisplayed.bind(this));
	view.onDisplayed = this.afterDisplayed.bind(this);
	view.onResize = this.afterResized.bind(this);

	return view.display();
	// return this.renderer(view, this.views.hidden);
};

// SingleViewManager.prototype.resizeView = function(view) {
//
// 	if(this.settings.globalLayoutProperties.layout === "pre-paginated") {
// 		view.lock("both", this.bounds.width, this.bounds.height);
// 	} else {
// 		view.lock("width", this.bounds.width, this.bounds.height);
// 	}
//
// };

SingleViewManager.prototype.next = function(){
	var next;
	var view;

	if(!this.views.length) return;

	next = this.views.last().section.next();

	if(next) {
		this.views.clear();

		view = this.createView(next);
		return this.add(view)
		.then(function(){
			this.views.show();
		}.bind(this));
	}
};

SingleViewManager.prototype.prev = function(){
	var prev;
	var view;

	if(!this.views.length) return;

	prev = this.views.first().section.prev();
	if(prev) {
		this.views.clear();

		view = this.createView(prev);
		return this.add(view)
		.then(function(){
			this.views.show();
		}.bind(this));
	}
};

SingleViewManager.prototype.current = function(){
	var visible = this.visible();
	if(visible.length){
		// Current is the last visible view
		return visible[visible.length-1];
	}
  return null;
};

SingleViewManager.prototype.currentLocation = function(){
  var view;
  var start, end;

  if(this.views.length) {
  	view = this.views.first();
    // start = container.left - view.position().left;
    // end = start + this.layout.spread;
		console.log("visibile currentLocation", view);
    // return this.map.page(view);
  }

};

SingleViewManager.prototype.isVisible = function(view, offsetPrev, offsetNext, _container){
	var position = view.position();
	var container = _container || this.container.getBoundingClientRect();

	if(this.settings.axis === "horizontal" &&
		position.right > container.left - offsetPrev &&
		position.left < container.right + offsetNext) {

		return true;

  } else if(this.settings.axis === "vertical" &&
  	position.bottom > container.top - offsetPrev &&
		position.top < container.bottom + offsetNext) {

		return true;
  }

	return false;

};

SingleViewManager.prototype.visible = function(){
	return this.views.displayed();
	/*
	var container = this.stage.bounds();
	var views = this.views;
	var viewsLength = views.length;
  var visible = [];
  var isVisible;
  var view;

  for (var i = 0; i < viewsLength; i++) {
    view = views[i];
    isVisible = this.isVisible(view, 0, 0, container);

    if(isVisible === true) {
      visible.push(view);
    }

  }
  return visible;
	*/
};

SingleViewManager.prototype.scrollBy = function(x, y, silent){
  if(silent) {
    this.ignore = true;
  }

  if(this.settings.height) {

    if(x) this.container.scrollLeft += x;
  	if(y) this.container.scrollTop += y;

  } else {
  	window.scrollBy(x,y);
  }
  // console.log("scrollBy", x, y);
  this.scrolled = true;
};

SingleViewManager.prototype.scrollTo = function(x, y, silent){
  if(silent) {
    this.ignore = true;
  }

  if(this.settings.height) {
  	this.container.scrollLeft = x;
  	this.container.scrollTop = y;
  } else {
  	window.scrollTo(x,y);
  }
  // console.log("scrollTo", x, y);
  this.scrolled = true;
  // if(this.container.scrollLeft != x){
  //   setTimeout(function() {
  //     this.scrollTo(x, y, silent);
  //   }.bind(this), 10);
  //   return;
  // };
 };

 SingleViewManager.prototype.bounds = function() {
   var bounds;

   if(!this.settings.height || !this.container) {
     bounds = core.windowBounds();
   } else {
     bounds = this.container.getBoundingClientRect();
   }

   return bounds;
 };

 SingleViewManager.prototype.applyLayoutMethod = function() {

 	this.layout = new Layout.Scroll();
 	this.calculateLayout();

	this.setLayout(this.layout);

 	// this.map = new Map(this.layout);
 	// this.manager.layout(this.layout.format);
 };

 SingleViewManager.prototype.calculateLayout = function() {
 	var bounds = this.stage.bounds();
 	this.layout.calculate(bounds.width, bounds.height);
 };

 SingleViewManager.prototype.updateLayout = function() {
 	this.calculateLayout();

 	this.setLayout(this.layout);
 };

 //-- Enable binding events to Manager
 RSVP.EventTarget.mixin(SingleViewManager.prototype);

 module.exports = SingleViewManager;

},{"../core":12,"../epubcfi":13,"../layout":15,"../stage":29,"../views":32,"rsvp":4}],20:[function(require,module,exports){
function Map(layout){
  this.layout = layout;
};

Map.prototype.section = function(view) {
  var ranges = this.findRanges(view);
  var map = this.rangeListToCfiList(view, ranges);

  return map;
};

Map.prototype.page = function(view, start, end) {
  var root = view.document.body;
  return this.rangePairToCfiPair(view.section, {
    start: this.findStart(root, start, end),
    end: this.findEnd(root, start, end)
  });
};

Map.prototype.walk = function(root, func) {
  //var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT, null, false);
  var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
          if ( node.data.trim().length > 0 ) {
            return NodeFilter.FILTER_ACCEPT;
          } else {
            return NodeFilter.FILTER_REJECT;
          }
      }
  }, false);
  var node;
  var result;
  while ((node = treeWalker.nextNode())) {
    result = func(node);
    if(result) break;
  }

  return result;
};

Map.prototype.findRanges = function(view){
  var columns = [];
  var count = this.layout.count(view);
  var column = this.layout.column;
  var gap = this.layout.gap;
  var start, end;

  for (var i = 0; i < count.pages; i++) {
    start = (column + gap) * i;
    end = (column * (i+1)) + (gap * i);
    columns.push({
      start: this.findStart(view.document.body, start, end),
      end: this.findEnd(view.document.body, start, end)
    });
  }

  return columns;
};

Map.prototype.findStart = function(root, start, end){
  var stack = [root];
  var $el;
  var found;
  var $prev = root;
  while (stack.length) {

    $el = stack.shift();

    found = this.walk($el, function(node){
      var left, right;
      var elPos;
      var elRange;


      if(node.nodeType == Node.TEXT_NODE){
        elRange = document.createRange();
        elRange.selectNodeContents(node);
        elPos = elRange.getBoundingClientRect();
      } else {
        elPos = node.getBoundingClientRect();
      }

      left = elPos.left;
      right = elPos.right;

      if( left >= start && left <= end ) {
        return node;
      } else if (right > start) {
        return node;
      } else {
        $prev = node;
        stack.push(node);
      }

    });

    if(found) {
      return this.findTextStartRange(found, start, end);
    }

  }

  // Return last element
  return this.findTextStartRange($prev, start, end);
};

Map.prototype.findEnd = function(root, start, end){
  var stack = [root];
  var $el;
  var $prev = root;
  var found;

  while (stack.length) {

    $el = stack.shift();

    found = this.walk($el, function(node){

      var left, right;
      var elPos;
      var elRange;


      if(node.nodeType == Node.TEXT_NODE){
        elRange = document.createRange();
        elRange.selectNodeContents(node);
        elPos = elRange.getBoundingClientRect();
      } else {
        elPos = node.getBoundingClientRect();
      }

      left = elPos.left;
      right = elPos.right;

      if(left > end && $prev) {
        return $prev;
      } else if(right > end) {
        return node;
      } else {
        $prev = node;
        stack.push(node);
      }

    });


    if(found){
      return this.findTextEndRange(found, start, end);
    }

  }

  // end of chapter
  return this.findTextEndRange($prev, start, end);
};


Map.prototype.findTextStartRange = function(node, start, end){
  var ranges = this.splitTextNodeIntoRanges(node);
  var prev;
  var range;
  var pos;

  for (var i = 0; i < ranges.length; i++) {
    range = ranges[i];

    pos = range.getBoundingClientRect();

    if( pos.left >= start ) {
      return range;
    }

    prev = range;

  }

  return ranges[0];
};

Map.prototype.findTextEndRange = function(node, start, end){
  var ranges = this.splitTextNodeIntoRanges(node);
  var prev;
  var range;
  var pos;

  for (var i = 0; i < ranges.length; i++) {
    range = ranges[i];

    pos = range.getBoundingClientRect();

    if(pos.left > end && prev) {
      return prev;
    } else if(pos.right > end) {
      return range;
    }

    prev = range;

  }

  // Ends before limit
  return ranges[ranges.length-1];

};

Map.prototype.splitTextNodeIntoRanges = function(node, _splitter){
  var ranges = [];
  var textContent = node.textContent || "";
  var text = textContent.trim();
  var range;
  var rect;
  var list;
  var doc = node.ownerDocument;
  var splitter = _splitter || " ";

  pos = text.indexOf(splitter);

  if(pos === -1 || node.nodeType != Node.TEXT_NODE) {
    range = doc.createRange();
    range.selectNodeContents(node);
    return [range];
  }

  range = doc.createRange();
  range.setStart(node, 0);
  range.setEnd(node, pos);
  ranges.push(range);
  range = false;

  while ( pos != -1 ) {

    pos = text.indexOf(splitter, pos + 1);
    if(pos > 0) {

      if(range) {
        range.setEnd(node, pos);
        ranges.push(range);
      }

      range = doc.createRange();
      range.setStart(node, pos+1);
    }
  }

  if(range) {
    range.setEnd(node, text.length);
    ranges.push(range);
  }

  return ranges;
};



Map.prototype.rangePairToCfiPair = function(section, rangePair){

  var startRange = rangePair.start;
  var endRange = rangePair.end;

  startRange.collapse(true);
  endRange.collapse(true);

  startCfi = section.cfiFromRange(startRange);
  endCfi = section.cfiFromRange(endRange);

  return {
    start: startCfi,
    end: endCfi
  };

};

Map.prototype.rangeListToCfiList = function(view, columns){
  var map = [];
  var rangePair, cifPair;

  for (var i = 0; i < columns.length; i++) {
    cifPair = this.rangePairToCfiPair(view.section, columns[i]);

    map.push(cifPair);

  }

  return map;
};

module.exports = Map;

},{}],21:[function(require,module,exports){
var core = require('./core');
var Parser = require('./parser');
var RSVP = require('rsvp');
var URI = require('urijs');

function Navigation(_package, _request){
  var navigation = this;
  var parse = new Parser();
  var request = _request || require('./request');

  this.package = _package;
  this.toc = [];
  this.tocByHref = {};
  this.tocById = {};

  if(_package.navPath) {
    this.navUrl = URI(_package.navPath).absoluteTo(_package.baseUrl).toString();
    this.nav = {};

    this.nav.load = function(_request){
      var loading = new RSVP.defer();
      var loaded = loading.promise;

      request(navigation.navUrl, 'xml').then(function(xml){
        navigation.toc = parse.nav(xml);
        navigation.loaded(navigation.toc);
        loading.resolve(navigation.toc);
      });

      return loaded;
    };

  }

  if(_package.ncxPath) {
    this.ncxUrl = URI(_package.ncxPath).absoluteTo(_package.baseUrl).toString();
    this.ncx = {};

    this.ncx.load = function(_request){
      var loading = new RSVP.defer();
      var loaded = loading.promise;

      request(navigation.ncxUrl, 'xml').then(function(xml){
        navigation.toc = parse.ncx(xml);
        navigation.loaded(navigation.toc);
        loading.resolve(navigation.toc);
      });

      return loaded;
    };

  }
};

// Load the navigation
Navigation.prototype.load = function(_request) {
  var request = _request || require('./request');
  var loading, loaded;

  if(this.nav) {
    loading = this.nav.load();
  } else if(this.ncx) {
    loading = this.ncx.load();
  } else {
    loaded = new RSVP.defer();
    loaded.resolve([]);
    loading = loaded.promise;
  }

  return loading;

};

Navigation.prototype.loaded = function(toc) {
  var item;

  for (var i = 0; i < toc.length; i++) {
    item = toc[i];
    this.tocByHref[item.href] = i;
    this.tocById[item.id] = i;
  }

};

// Get an item from the navigation
Navigation.prototype.get = function(target) {
  var index;

  if(!target) {
    return this.toc;
  }

  if(target.indexOf("#") === 0) {
    index = this.tocById[target.substring(1)];
  } else if(target in this.tocByHref){
    index = this.tocByHref[target];
  }

  return this.toc[index];
};

module.exports = Navigation;

},{"./core":12,"./parser":22,"./request":26,"rsvp":4,"urijs":6}],22:[function(require,module,exports){
var URI = require('urijs');
var core = require('./core');
var EpubCFI = require('./epubcfi');


function Parser(){};

Parser.prototype.container = function(containerXml){
    //-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
    var rootfile, fullpath, folder, encoding;

    if(!containerXml) {
      console.error("Container File Not Found");
      return;
    }

    rootfile = core.qs(containerXml, "rootfile");

    if(!rootfile) {
      console.error("No RootFile Found");
      return;
    }

    fullpath = rootfile.getAttribute('full-path');
    folder = URI(fullpath).directory();
    encoding = containerXml.xmlEncoding;

    //-- Now that we have the path we can parse the contents
    return {
      'packagePath' : fullpath,
      'basePath' : folder,
      'encoding' : encoding
    };
};

Parser.prototype.identifier = function(packageXml){
  var metadataNode;

  if(!packageXml) {
    console.error("Package File Not Found");
    return;
  }

  metadataNode = core.qs(packageXml, "metadata");

  if(!metadataNode) {
    console.error("No Metadata Found");
    return;
  }

  return this.getElementText(metadataNode, "identifier");
};

Parser.prototype.packageContents = function(packageXml){
  var parse = this;
  var metadataNode, manifestNode, spineNode;
  var manifest, navPath, ncxPath, coverPath;
  var spineNodeIndex;
  var spine;
  var spineIndexByURL;
  var metadata;

  if(!packageXml) {
    console.error("Package File Not Found");
    return;
  }

  metadataNode = core.qs(packageXml, "metadata");
  if(!metadataNode) {
    console.error("No Metadata Found");
    return;
  }

  manifestNode = core.qs(packageXml, "manifest");
  if(!manifestNode) {
    console.error("No Manifest Found");
    return;
  }

  spineNode = core.qs(packageXml, "spine");
  if(!spineNode) {
    console.error("No Spine Found");
    return;
  }

  manifest = parse.manifest(manifestNode);
  navPath = parse.findNavPath(manifestNode);
  ncxPath = parse.findNcxPath(manifestNode, spineNode);
  coverPath = parse.findCoverPath(packageXml);

  spineNodeIndex = Array.prototype.indexOf.call(spineNode.parentNode.childNodes, spineNode);

  spine = parse.spine(spineNode, manifest);

  metadata = parse.metadata(metadataNode);

	metadata.direction = spineNode.getAttribute("page-progression-direction");

  return {
    'metadata' : metadata,
    'spine'    : spine,
    'manifest' : manifest,
    'navPath'  : navPath,
    'ncxPath'  : ncxPath,
    'coverPath': coverPath,
    'spineNodeIndex' : spineNodeIndex
  };
};

//-- Find TOC NAV
Parser.prototype.findNavPath = function(manifestNode){
	// Find item with property 'nav'
	// Should catch nav irregardless of order
  // var node = manifestNode.querySelector("item[properties$='nav'], item[properties^='nav '], item[properties*=' nav ']");
  var node = core.qsp(manifestNode, "item", {"properties":"nav"});
  return node ? node.getAttribute('href') : false;
};

//-- Find TOC NCX: media-type="application/x-dtbncx+xml" href="toc.ncx"
Parser.prototype.findNcxPath = function(manifestNode, spineNode){
	// var node = manifestNode.querySelector("item[media-type='application/x-dtbncx+xml']");
  var node = core.qsp(manifestNode, "item", {"media-type":"application/x-dtbncx+xml"});
	var tocId;

	// If we can't find the toc by media-type then try to look for id of the item in the spine attributes as
	// according to http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm#Section2.4.1.2,
	// "The item that describes the NCX must be referenced by the spine toc attribute."
	if (!node) {
		tocId = spineNode.getAttribute("toc");
		if(tocId) {
			// node = manifestNode.querySelector("item[id='" + tocId + "']");
      node = manifestNode.getElementById(tocId);
		}
	}

	return node ? node.getAttribute('href') : false;
};

//-- Expanded to match Readium web components
Parser.prototype.metadata = function(xml){
  var metadata = {},
      p = this;

  metadata.title = p.getElementText(xml, 'title');
  metadata.creator = p.getElementText(xml, 'creator');
  metadata.description = p.getElementText(xml, 'description');

  metadata.pubdate = p.getElementText(xml, 'date');

  metadata.publisher = p.getElementText(xml, 'publisher');

  metadata.identifier = p.getElementText(xml, "identifier");
  metadata.language = p.getElementText(xml, "language");
  metadata.rights = p.getElementText(xml, "rights");

  metadata.modified_date = p.getPropertyText(xml, 'dcterms:modified');
  
  metadata.layout = p.getPropertyText(xml, "rendition:layout");
  metadata.orientation = p.getPropertyText(xml, 'rendition:orientation');
  metadata.flow = p.getPropertyText(xml, 'rendition:flow');
  metadata.viewport = p.getPropertyText(xml, 'rendition:viewport');
  // metadata.page_prog_dir = packageXml.querySelector("spine").getAttribute("page-progression-direction");

  return metadata;
};

//-- Find Cover: <item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />
//-- Fallback for Epub 2.0
Parser.prototype.findCoverPath = function(packageXml){
  var pkg = core.qs(packageXml, "package");
	var epubVersion = pkg.getAttribute('version');

	if (epubVersion === '2.0') {
		var metaCover = core.qsp(packageXml, 'meta', {'name':'cover'});
		if (metaCover) {
			var coverId = metaCover.getAttribute('content');
			// var cover = packageXml.querySelector("item[id='" + coverId + "']");
      var cover = packageXml.getElementById(coverId);
			return cover ? cover.getAttribute('href') : false;
		}
		else {
			return false;
		}
	}
	else {
    // var node = packageXml.querySelector("item[properties='cover-image']");
    var node = core.qsp(packageXml, 'item', {'properties':'cover-image'});
		return node ? node.getAttribute('href') : false;
	}
};

Parser.prototype.getElementText = function(xml, tag){
  var found = xml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", tag),
    el;

  if(!found || found.length === 0) return '';

  el = found[0];

  if(el.childNodes.length){
    return el.childNodes[0].nodeValue;
  }

  return '';

};

Parser.prototype.getPropertyText = function(xml, property){
  var el = core.qsp(xml, "meta", {"property":property});

  if(el && el.childNodes.length){
    return el.childNodes[0].nodeValue;
  }

  return '';
};

Parser.prototype.querySelectorText = function(xml, q){
  var el = xml.querySelector(q);

  if(el && el.childNodes.length){
    return el.childNodes[0].nodeValue;
  }

  return '';
};

Parser.prototype.manifest = function(manifestXml){
  var manifest = {};

  //-- Turn items into an array
  // var selected = manifestXml.querySelectorAll("item");
  var selected = core.qsa(manifestXml, "item");
  var items = Array.prototype.slice.call(selected);

  //-- Create an object with the id as key
  items.forEach(function(item){
    var id = item.getAttribute('id'),
        href = item.getAttribute('href') || '',
        type = item.getAttribute('media-type') || '',
        properties = item.getAttribute('properties') || '';

    manifest[id] = {
      'href' : href,
      // 'url' : href,
      'type' : type,
      'properties' : properties.length ? properties.split(' ') : []
    };

  });

  return manifest;

};

Parser.prototype.spine = function(spineXml, manifest){
  var spine = [];

  var selected = spineXml.getElementsByTagName("itemref"),
      items = Array.prototype.slice.call(selected);

  var epubcfi = new EpubCFI();

  //-- Add to array to mantain ordering and cross reference with manifest
  items.forEach(function(item, index){
    var idref = item.getAttribute('idref');
    // var cfiBase = epubcfi.generateChapterComponent(spineNodeIndex, index, Id);
    var props = item.getAttribute('properties') || '';
    var propArray = props.length ? props.split(' ') : [];
    // var manifestProps = manifest[Id].properties;
    // var manifestPropArray = manifestProps.length ? manifestProps.split(' ') : [];

    var itemref = {
      'idref' : idref,
      'linear' : item.getAttribute('linear') || '',
      'properties' : propArray,
      // 'href' : manifest[Id].href,
      // 'url' :  manifest[Id].url,
      'index' : index
      // 'cfiBase' : cfiBase
    };
    spine.push(itemref);
  });

  return spine;
};

Parser.prototype.querySelectorByType = function(html, element, type){
  var query;
  if (typeof html.querySelector != "undefined") {
    query = html.querySelector(element+'[*|type="'+type+'"]');
  }
	// Handle IE not supporting namespaced epub:type in querySelector
	if(!query || query.length === 0) {
		query = core.qsa(html, element);
		for (var i = 0; i < query.length; i++) {
			if(query[i].getAttributeNS("http://www.idpf.org/2007/ops", "type") === type) {
				return query[i];
			}
		}
	} else {
		return query;
	}
};

Parser.prototype.nav = function(navHtml, spineIndexByURL, bookSpine){
	var navElement = this.querySelectorByType(navHtml, "nav", "toc");
  // var navItems = navElement ? navElement.querySelectorAll("ol li") : [];
	var navItems = navElement ? core.qsa(navElement, "li") : [];
	var length = navItems.length;
	var i;
	var toc = {};
	var list = [];
	var item, parent;

	if(!navItems || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.navItem(navItems[i], spineIndexByURL, bookSpine);
		toc[item.id] = item;
		if(!item.parent) {
			list.push(item);
		} else {
			parent = toc[item.parent];
			parent.subitems.push(item);
		}
	}

	return list;
};

Parser.prototype.navItem = function(item, spineIndexByURL, bookSpine){
	var id = item.getAttribute('id') || false,
			// content = item.querySelector("a, span"),
      content = core.qs(item, "a"),
			src = content.getAttribute('href') || '',
			text = content.textContent || "",
			// split = src.split("#"),
			// baseUrl = split[0],
			// spinePos = spineIndexByURL[baseUrl],
			// spineItem = bookSpine[spinePos],
			subitems = [],
			parentNode = item.parentNode,
			parent;
			// cfi = spineItem ? spineItem.cfi : '';

	if(parentNode && parentNode.nodeName === "navPoint") {
		parent = parentNode.getAttribute('id');
	}

  /*
	if(!id) {
		if(spinePos) {
			spineItem = bookSpine[spinePos];
			id = spineItem.id;
			cfi = spineItem.cfi;
		} else {
			id = 'epubjs-autogen-toc-id-' + EPUBJS.core.uuid();
			item.setAttribute('id', id);
		}
	}
  */

	return {
		"id": id,
		"href": src,
		"label": text,
		"subitems" : subitems,
		"parent" : parent
	};
};

Parser.prototype.ncx = function(tocXml, spineIndexByURL, bookSpine){
	// var navPoints = tocXml.querySelectorAll("navMap navPoint");
  var navPoints = core.qsa("navPoint");
	var length = navPoints.length;
	var i;
	var toc = {};
	var list = [];
	var item, parent;

	if(!navPoints || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.ncxItem(navPoints[i], spineIndexByURL, bookSpine);
		toc[item.id] = item;
		if(!item.parent) {
			list.push(item);
		} else {
			parent = toc[item.parent];
			parent.subitems.push(item);
		}
	}

	return list;
};

Parser.prototype.ncxItem = function(item, spineIndexByURL, bookSpine){
	var id = item.getAttribute('id') || false,
			// content = item.querySelector("content"),
			content = core.qs("content"),
			src = content.getAttribute('src'),
      // navLabel = item.querySelector("navLabel"),
      navLabel = core.qs(item, "navLabel"),
			text = navLabel.textContent ? navLabel.textContent : "",
			// split = src.split("#"),
			// baseUrl = split[0],
			// spinePos = spineIndexByURL[baseUrl],
			// spineItem = bookSpine[spinePos],
			subitems = [],
			parentNode = item.parentNode,
			parent;
			// cfi = spineItem ? spineItem.cfi : '';

	if(parentNode && parentNode.nodeName === "navPoint") {
		parent = parentNode.getAttribute('id');
	}

  /*
	if(!id) {
		if(spinePos) {
			spineItem = bookSpine[spinePos];
			id = spineItem.id;
			cfi = spineItem.cfi;
		} else {
			id = 'epubjs-autogen-toc-id-' + EPUBJS.core.uuid();
			item.setAttribute('id', id);
		}
	}
  */

	return {
		"id": id,
		"href": src,
		"label": text,
		"subitems" : subitems,
		"parent" : parent
	};
};

Parser.prototype.pageList = function(navHtml, spineIndexByURL, bookSpine){
	var navElement = this.querySelectorByType(navHtml, "nav", "page-list");
  // var navItems = navElement ? navElement.querySelectorAll("ol li") : [];
	var navItems = navElement ? core.qsa(navElement, "li") : [];
	var length = navItems.length;
	var i;
	var toc = {};
	var list = [];
	var item;

	if(!navItems || length === 0) return list;

	for (i = 0; i < length; ++i) {
		item = this.pageListItem(navItems[i], spineIndexByURL, bookSpine);
		list.push(item);
	}

	return list;
};

Parser.prototype.pageListItem = function(item, spineIndexByURL, bookSpine){
	var id = item.getAttribute('id') || false,
		// content = item.querySelector("a"),
    content = core.qs(item, "a"),
		href = content.getAttribute('href') || '',
		text = content.textContent || "",
		page = parseInt(text),
		isCfi = href.indexOf("epubcfi"),
		split,
		packageUrl,
		cfi;

	if(isCfi != -1) {
		split = href.split("#");
		packageUrl = split[0];
		cfi = split.length > 1 ? split[1] : false;
		return {
			"cfi" : cfi,
			"href" : href,
			"packageUrl" : packageUrl,
			"page" : page
		};
	} else {
		return {
			"href" : href,
			"page" : page
		};
	}
};

module.exports = Parser;

},{"./core":12,"./epubcfi":13,"urijs":6}],23:[function(require,module,exports){
var RSVP = require('rsvp');
var core = require('./core');

function Queue(_context){
  this._q = [];
  this.context = _context;
  this.tick = core.requestAnimationFrame;
  this.running = false;
  this.paused = false;
};

// Add an item to the queue
Queue.prototype.enqueue = function() {
  var deferred, promise;
  var queued;
  var task = [].shift.call(arguments);
  var args = arguments;

  // Handle single args without context
  // if(args && !Array.isArray(args)) {
  //   args = [args];
  // }
  if(!task) {
    return console.error("No Task Provided");
  }

  if(typeof task === "function"){

    deferred = new RSVP.defer();
    promise = deferred.promise;

    queued = {
      "task" : task,
      "args"     : args,
      //"context"  : context,
      "deferred" : deferred,
      "promise" : promise
    };

  } else {
    // Task is a promise
    queued = {
      "promise" : task
    };

  }

  this._q.push(queued);

  // Wait to start queue flush
  if (this.paused == false && !this.running) {
    // setTimeout(this.flush.bind(this), 0);
    // this.tick.call(window, this.run.bind(this));
    this.run();
  }

  return queued.promise;
};

// Run one item
Queue.prototype.dequeue = function(){
  var inwait, task, result;

  if(this._q.length) {
    inwait = this._q.shift();
    task = inwait.task;
    if(task){
      // console.log(task)

      result = task.apply(this.context, inwait.args);

      if(result && typeof result["then"] === "function") {
        // Task is a function that returns a promise
        return result.then(function(){
          inwait.deferred.resolve.apply(this.context, arguments);
        }.bind(this));
      } else {
        // Task resolves immediately
        inwait.deferred.resolve.apply(this.context, result);
        return inwait.promise;
      }



    } else if(inwait.promise) {
      // Task is a promise
      return inwait.promise;
    }

  } else {
    inwait = new RSVP.defer();
    inwait.deferred.resolve();
    return inwait.promise;
  }

};

// Run All Immediately
Queue.prototype.dump = function(){
  while(this._q.length) {
    this.dequeue();
  }
};

// Run all sequentially, at convince

Queue.prototype.run = function(){

  if(!this.running){
    this.running = true;
    this.defered = new RSVP.defer();
  }

  this.tick.call(window, function() {

    if(this._q.length) {

      this.dequeue()
        .then(function(){
          this.run();
        }.bind(this));

    } else {
      this.defered.resolve();
      this.running = undefined;
    }

  }.bind(this));

  // Unpause
  if(this.paused == true) {
    this.paused = false;
  }

  return this.defered.promise;
};

// Flush all, as quickly as possible
Queue.prototype.flush = function(){

  if(this.running){
    return this.running;
  }

  if(this._q.length) {
    this.running = this.dequeue()
      .then(function(){
        this.running = undefined;
        return this.flush();
      }.bind(this));

    return this.running;
  }

};

// Clear all items in wait
Queue.prototype.clear = function(){
  this._q = [];
  this.running = false;
};

Queue.prototype.length = function(){
  return this._q.length;
};

Queue.prototype.pause = function(){
  this.paused = true;
};

// Create a new task from a callback
function Task(task, args, context){

  return function(){
    var toApply = arguments || [];

    return new RSVP.Promise(function(resolve, reject) {
      var callback = function(value){
        resolve(value);
      };
      // Add the callback to the arguments list
      toApply.push(callback);

      // Apply all arguments to the functions
      task.apply(this, toApply);

  }.bind(this));

  };

};

module.exports = Queue;

},{"./core":12,"rsvp":4}],24:[function(require,module,exports){
var RSVP = require('rsvp');
var URI = require('urijs');
var core = require('./core');
var replace = require('./replacements');
var Hook = require('./hook');
var EpubCFI = require('./epubcfi');
var Queue = require('./queue');
var View = require('./view');
var Views = require('./views');
var Layout = require('./layout');
var Map = require('./map');

function Rendition(book, options) {

	this.settings = core.extend(this.settings || {}, {
		infinite: true,
		hidden: false,
		width: null,
		height: null,
		layoutOveride : null, // Default: { spread: 'reflowable', layout: 'auto', orientation: 'auto', flow: 'auto', viewport: ''},
		axis: "vertical",
		ignoreClass: '',
		manager: "single",
		view: "iframe"
	});

	core.extend(this.settings, options);

	this.viewSettings = {
		ignoreClass: this.settings.ignoreClass
	};

	this.book = book;

	this.views = null;

	//-- Adds Hook methods to the Rendition prototype
	this.hooks = {};
	this.hooks.display = new Hook(this);
	this.hooks.serialize = new Hook(this);
	this.hooks.content = new Hook(this);
	this.hooks.layout = new Hook(this);
	this.hooks.render = new Hook(this);
	this.hooks.show = new Hook(this);

	this.hooks.content.register(replace.links.bind(this));
	this.hooks.content.register(this.passViewEvents.bind(this));

	// this.hooks.display.register(this.afterDisplay.bind(this));

  this.epubcfi = new EpubCFI();

	this.q = new Queue(this);

	this.q.enqueue(this.book.opened);

	this.q.enqueue(this.parseLayoutProperties);

	// Block the queue until rendering is started
	this.starting = new RSVP.defer();
	this.started = this.starting.promise;
	this.q.enqueue(this.started);

	// TODO: move this somewhere else
	if(this.book.archive) {
		this.replacements();
	}

	this.ViewManager = this.requireManager(this.settings.manager);
	this.View = this.requireView(this.settings.view);

	this.manager = new this.ViewManager({
		view: this.View,
		queue: this.q,
		settings: this.settings
	});

};

Rendition.prototype.setManager = function(manager) {
	this.manager = manager;
};

Rendition.prototype.requireManager = function(manager) {
	var viewManager;

	// If manager is a string, try to load from register managers,
	// or require included managers directly
	if (typeof manager === "string") {
		// Use global or require
		viewManager =  typeof ePub != "undefined" ? ePub.ViewManagers[manager] : require('./managers/'+manager);
	} else {
		// otherwise, assume we were passed a function
		viewManager = manager
	}

  return viewManager;
};

Rendition.prototype.requireView = function(view) {
	var View;

	// If view is a string, try to load from register managers,
	// or require included managers directly
	if (typeof view == "string") {
		View = typeof ePub != "undefined" ? ePub.Views[view] : require('./views/'+view);
	} else {
		// otherwise, assume we were passed a function
		View = view
	}

  return View;
};

Rendition.prototype.start = function(){

	// Listen for displayed views
	this.manager.on("added", this.afterDisplayed.bind(this))

	// Add Layout method
	// this.applyLayoutMethod();

	this.on('displayed', this.reportLocation.bind(this));

	// Trigger that rendering has started
	this.trigger("started");

	// Start processing queue
	this.starting.resolve();
};

// Call to attach the container to an element in the dom
// Container must be attached before rendering can begin
Rendition.prototype.attachTo = function(element){

	// Start rendering
	this.manager.render(element, {
		"width"  : this.settings.width,
		"height" : this.settings.height
	});

	this.start();

	// Trigger Attached
	this.trigger("attached");

};

Rendition.prototype.display = function(target){

	// if (!this.book.spine.spineItems.length > 0) {
		// Book isn't open yet
		// return this.q.enqueue(this.display, target);
	// }

	return this.q.enqueue(this._display, target);

};

Rendition.prototype._display = function(target){
	var isCfiString = this.epubcfi.isCfiString(target);
	var displaying = new RSVP.defer();
	var displayed = displaying.promise;
	var section;
	var moveTo;

	section = this.book.spine.get(target);

	if(!section){
		displaying.reject(new Error("No Section Found"));
		return displayed;
	}

	// Trim the target fragment
	// removing the chapter
	if(!isCfiString && typeof target === "string" &&
		target.indexOf("#") > -1) {
			moveTo = target.substring(target.indexOf("#")+1);
	}

	if (isCfiString) {
		moveTo = target;
	}

	return this.manager.display(section, moveTo)
		.then(function(){
			this.trigger("displayed", section);
		}.bind(this));

};

/*
Rendition.prototype.render = function(view, show) {

	// view.onLayout = this.layout.format.bind(this.layout);
	view.create();

	// Fit to size of the container, apply padding
	this.manager.resizeView(view);

	// Render Chain
	return view.section.render(this.book.request)
		.then(function(contents){
			return view.load(contents);
		}.bind(this))
		.then(function(doc){
			return this.hooks.content.trigger(view, this);
		}.bind(this))
		.then(function(){
			this.layout.format(view.contents);
			return this.hooks.layout.trigger(view, this);
		}.bind(this))
		.then(function(){
			return view.display();
		}.bind(this))
		.then(function(){
			return this.hooks.render.trigger(view, this);
		}.bind(this))
		.then(function(){
			if(show !== false) {
				this.q.enqueue(function(view){
					view.show();
				}, view);
			}
			// this.map = new Map(view, this.layout);
			this.hooks.show.trigger(view, this);
			this.trigger("rendered", view.section);

		}.bind(this))
		.catch(function(e){
			this.trigger("loaderror", e);
		}.bind(this));

};
*/

Rendition.prototype.afterDisplayed = function(view){
	this.hooks.content.trigger(view, this);
	this.trigger("rendered", view.section);
	this.reportLocation();
};

Rendition.prototype.onResized = function(size){

	this.manager.updateLayout();

	if(this.location) {
		this.display(this.location.start);
	}

	this.trigger("resized", {
		width: size.width,
		height: size.height
	});

};

Rendition.prototype.moveTo = function(offset){
	this.manager.moveTo(offset);
};

Rendition.prototype.next = function(){
	return this.q.enqueue(this.manager.next.bind(this.manager));
};

Rendition.prototype.prev = function(){
	return this.q.enqueue(this.manager.prev.bind(this.manager));
};

//-- http://www.idpf.org/epub/fxl/
Rendition.prototype.parseLayoutProperties = function(_metadata){
	var metadata = _metadata || this.book.package.metadata;
	var layout = (this.layoutOveride && this.layoutOveride.layout) || metadata.layout || "reflowable";
	var spread = (this.layoutOveride && this.layoutOveride.spread) || metadata.spread || "auto";
	var orientation = (this.layoutOveride && this.layoutOveride.orientation) || metadata.orientation || "auto";
	var flow = (this.layoutOveride && this.layoutOveride.flow) || metadata.flow || "auto";
	var viewport = (this.layoutOveride && this.layoutOveride.viewport) || metadata.viewport || "";

	this.settings.globalLayoutProperties = {
		layout : layout,
		spread : spread,
		orientation : orientation,
		flow : flow,
		viewport : viewport
	};

	return this.settings.globalLayoutProperties;
};

/**
* Uses the settings to determine which Layout Method is needed
*/
// Rendition.prototype.determineLayout = function(settings){
//   // Default is layout: reflowable & spread: auto
//   var spreads = this.determineSpreads(this.settings.minSpreadWidth);
//   var layoutMethod = spreads ? "ReflowableSpreads" : "Reflowable";
//   var scroll = false;
//
//   if(settings.layout === "pre-paginated") {
//
//   }
//
//   if(settings.layout === "reflowable" && settings.spread === "none") {
//
//   }
//
//   if(settings.layout === "reflowable" && settings.spread === "both") {
//
//   }
//
//   this.spreads = spreads;
//
//   return layoutMethod;
// };


Rendition.prototype.reportLocation = function(){
  return this.q.enqueue(function(){
    this.location = this.manager.currentLocation();
    this.trigger("locationChanged", this.location);
  }.bind(this));
};


Rendition.prototype.destroy = function(){
  // Clear the queue
	this.q.clear();

	this.views.clear();

	clearTimeout(this.trimTimeout);
	if(this.settings.hidden) {
		this.element.removeChild(this.wrapper);
	} else {
		this.element.removeChild(this.container);
	}

};

Rendition.prototype.passViewEvents = function(view){
  view.contents.listenedEvents.forEach(function(e){
		view.on(e, this.triggerViewEvent.bind(this));
	}.bind(this));

	view.on("selected", this.triggerSelectedEvent.bind(this));
};

Rendition.prototype.triggerViewEvent = function(e){
  this.trigger(e.type, e);
};

Rendition.prototype.triggerSelectedEvent = function(cfirange){
  this.trigger("selected", cfirange);
};

Rendition.prototype.replacements = function(){
	// Wait for loading
	return this.q.enqueue(function () {
		// Get thes books manifest
		var manifest = this.book.package.manifest;
	  var manifestArray = Object.keys(manifest).
	    map(function (key){
	      return manifest[key];
	    });

	  // Exclude HTML
	  var items = manifestArray.
	    filter(function (item){
	      if (item.type != "application/xhtml+xml" &&
	          item.type != "text/html") {
	        return true;
	      }
	    });

	  // Only CSS
	  var css = items.
	    filter(function (item){
	      if (item.type === "text/css") {
	        return true;
	      }
	    });

		// Css Urls
		var cssUrls = css.map(function(item) {
			return item.href;
		});

		// All Assets Urls
	  var urls = items.
	    map(function(item) {
	      return item.href;
	    }.bind(this));

		// Create blob urls for all the assets
	  var processing = urls.
	    map(function(url) {
				var absolute = URI(url).absoluteTo(this.book.baseUrl).toString();
				// Full url from archive base
	      return this.book.archive.createUrl(absolute);
	    }.bind(this));

		// After all the urls are created
	  return RSVP.all(processing).
	    then(function(replacementUrls) {

				// Replace Asset Urls in the text of all css files
				cssUrls.forEach(function(href) {
					this.replaceCss(href, urls, replacementUrls);
		    }.bind(this));

				// Replace Asset Urls in chapters
				// by registering a hook after the sections contents has been serialized
	      this.book.spine.hooks.serialize.register(function(output, section) {
					this.replaceAssets(section, urls, replacementUrls);
	      }.bind(this));

	    }.bind(this)).catch(function(reason){
	      console.error(reason);
	    });
	}.bind(this));
};

Rendition.prototype.replaceCss = function(href, urls, replacementUrls){
		var newUrl;
		var indexInUrls;

		// Find the absolute url of the css file
		var fileUri = URI(href);
		var absolute = fileUri.absoluteTo(this.book.baseUrl).toString();
		// Get the text of the css file from the archive
		var text = this.book.archive.getText(absolute);
		// Get asset links relative to css file
		var relUrls = urls.
			map(function(assetHref) {
				var assetUri = URI(assetHref).absoluteTo(this.book.baseUrl);
				var relative = assetUri.relativeTo(absolute).toString();
				return relative;
			}.bind(this));

		// Replacements in the css text
		text = replace.substitute(text, relUrls, replacementUrls);

		// Get the new url
		newUrl = core.createBlobUrl(text, 'text/css');

		// switch the url in the replacementUrls
		indexInUrls = urls.indexOf(href);
		if (indexInUrls > -1) {
			replacementUrls[indexInUrls] = newUrl;
		}
};

Rendition.prototype.replaceAssets = function(section, urls, replacementUrls){
	var fileUri = URI(section.url);
	// Get Urls relative to current sections
	var relUrls = urls.
		map(function(href) {
			var assetUri = URI(href).absoluteTo(this.book.baseUrl);
			var relative = assetUri.relativeTo(fileUri).toString();
			return relative;
		}.bind(this));


	section.output = replace.substitute(section.output, relUrls, replacementUrls);
};

Rendition.prototype.range = function(_cfi, ignoreClass){
  var cfi = new EpubCFI(_cfi);
  var found = this.visible().filter(function (view) {
		if(cfi.spinePos === view.index) return true;
	});

	// Should only every return 1 item
  if (found.length) {
    return found[0].range(cfi, ignoreClass);
  }
};

Rendition.prototype.adjustImages = function(view) {

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

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(Rendition.prototype);

module.exports = Rendition;

},{"./core":12,"./epubcfi":13,"./hook":14,"./layout":15,"./map":20,"./queue":23,"./replacements":25,"./view":31,"./views":32,"rsvp":4,"urijs":6}],25:[function(require,module,exports){
var URI = require('urijs');
var core = require('./core');

function base(doc, section){
  var base;
  var head;

  if(!doc){
    return;
  }

  // head = doc.querySelector("head");
  // base = head.querySelector("base");
  head = core.qs(doc, "head");
  base = core.qs(head, "base");

  if(!base) {
    base = doc.createElement("base");
    head.insertBefore(base, head.firstChild);
  }

  base.setAttribute("href", section.url);
}

function links(view, renderer) {

  var links = view.document.querySelectorAll("a[href]");
  var replaceLinks = function(link){
    var href = link.getAttribute("href");
    var linkUri = URI(href);
    var absolute = linkUri.absoluteTo(view.section.url);
    var relative = absolute.relativeTo(this.book.baseUrl).toString();

    if(linkUri.protocol()){

      link.setAttribute("target", "_blank");

    }else{
      /*
      if(baseDirectory) {
				// We must ensure that the file:// protocol is preserved for
				// local file links, as in certain contexts (such as under
				// Titanium), file links without the file:// protocol will not
				// work
				if (baseUri.protocol === "file") {
					relative = core.resolveUrl(baseUri.base, href);
				} else {
					relative = core.resolveUrl(baseDirectory, href);
				}
			} else {
				relative = href;
			}
      */

      if(linkUri.fragment()) {
        // do nothing with fragment yet
      } else {
        link.onclick = function(){
          renderer.display(relative);
          return false;
        };
      }

    }
  };

  for (var i = 0; i < links.length; i++) {
    replaceLinks(links[i]);
  }


};

function substitute(content, urls, replacements) {
  urls.forEach(function(url, i){
    if (url && replacements[i]) {
      content = content.replace(new RegExp(url, 'g'), replacements[i]);
    }
  });
  return content;
}
module.exports = {
  'base': base,
  'links': links,
  'substitute': substitute
};

},{"./core":12,"urijs":6}],26:[function(require,module,exports){
var RSVP = require('rsvp');
var URI = require('urijs');
var core = require('./core');

function request(url, type, withCredentials, headers) {
  var supportsURL = (typeof window != "undefined") ? window.URL : false; // TODO: fallback for url if window isn't defined
  var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";
  var uri;

  var deferred = new RSVP.defer();

  var xhr = new XMLHttpRequest();

  //-- Check from PDF.js:
  //   https://github.com/mozilla/pdf.js/blob/master/web/compatibility.js
  var xhrPrototype = XMLHttpRequest.prototype;

  var header;

  if (!('overrideMimeType' in xhrPrototype)) {
    // IE10 might have response, but not overrideMimeType
    Object.defineProperty(xhrPrototype, 'overrideMimeType', {
      value: function xmlHttpRequestOverrideMimeType(mimeType) {}
    });
  }
  if(withCredentials) {
    xhr.withCredentials = true;
  }

  xhr.onreadystatechange = handler;
  xhr.onerror = err;

  xhr.open("GET", url, true);

  for(header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }

  if(type == "json") {
    xhr.setRequestHeader("Accept", "application/json");
  }

  // If type isn't set, determine it from the file extension
	if(!type) {
		uri = URI(url);
		type = uri.suffix();
	}

  if(type == 'blob'){
    xhr.responseType = BLOB_RESPONSE;
  }


  if(core.isXml(type)) {
		// xhr.responseType = "document";
		xhr.overrideMimeType('text/xml'); // for OPF parsing
	}

	if(type == 'xhtml') {
		// xhr.responseType = "document";
	}

	if(type == 'html' || type == 'htm') {
		// xhr.responseType = "document";
 	}

  if(type == "binary") {
    xhr.responseType = "arraybuffer";
  }

  xhr.send();

  function err(e) {
    console.error(e);
    deferred.reject(e);
  }

  function handler() {
    if (this.readyState === XMLHttpRequest.DONE) {

      if (this.status === 200 || this.responseXML ) { //-- Firefox is reporting 0 for blob urls
        var r;

        if (!this.response && !this.responseXML) {
          deferred.reject({
            status: this.status,
            message : "Empty Response",
            stack : new Error().stack
          });
          return deferred.promise;
        }

        if((this.responseType == '' || this.responseType == 'document')
            && this.responseXML){
          r = this.responseXML;
        } else
        if(core.isXml(type)){
          // xhr.overrideMimeType('text/xml'); // for OPF parsing
          // If this.responseXML wasn't set, try to parse using a DOMParser from text
          r = core.parse(this.response, "text/xml");
        }else
        if(type == 'xhtml'){
          r = core.parse(this.response, "application/xhtml+xml");
        }else
        if(type == 'html' || type == 'htm'){
          r = core.parse(this.response, "text/html");
        }else
        if(type == 'json'){
          r = JSON.parse(this.response);
        }else
        if(type == 'blob'){

          if(supportsURL) {
            r = this.response;
          } else {
            //-- Safari doesn't support responseType blob, so create a blob from arraybuffer
            r = new Blob([this.response]);
          }

        }else{
          r = this.response;
        }

        deferred.resolve(r);
      } else {

        deferred.reject({
          status: this.status,
          message : this.response,
          stack : new Error().stack
        });

      }
    }
  }

  return deferred.promise;
};

module.exports = request;

},{"./core":12,"rsvp":4,"urijs":6}],27:[function(require,module,exports){
var RSVP = require('rsvp');
var URI = require('urijs');
var core = require('./core');
var EpubCFI = require('./epubcfi');
var Hook = require('./hook');

function Section(item, hooks){
    this.idref = item.idref;
    this.linear = item.linear;
    this.properties = item.properties;
    this.index = item.index;
    this.href = item.href;
    this.url = item.url;
    this.next = item.next;
    this.prev = item.prev;

    this.cfiBase = item.cfiBase;

    if (hooks) {
      this.hooks = hooks;
    } else {
      this.hooks = {};
      this.hooks.serialize = new Hook(this);
      this.hooks.content = new Hook(this);
    }

};


Section.prototype.load = function(_request){
  var request = _request || this.request || require('./request');
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  if(this.contents) {
    loading.resolve(this.contents);
  } else {
    request(this.url)
      .then(function(xml){
        var base;
        var directory = URI(this.url).directory();

        this.document = xml;
        this.contents = xml.documentElement;

        return this.hooks.content.trigger(this.document, this);
      }.bind(this))
      .then(function(){
        loading.resolve(this.contents);
      }.bind(this))
      .catch(function(error){
        loading.reject(error);
      });
  }

  return loaded;
};

Section.prototype.base = function(_document){
    var task = new RSVP.defer();
    var base = _document.createElement("base"); // TODO: check if exists
    var head;
    console.log(window.location.origin + "/" +this.url);

    base.setAttribute("href", window.location.origin + "/" +this.url);

    if(_document) {
      head = _document.querySelector("head");
    }
    if(head) {
      head.insertBefore(base, head.firstChild);
      task.resolve();
    } else {
      task.reject(new Error("No head to insert into"));
    }


    return task.promise;
};

Section.prototype.beforeSectionLoad = function(){
  // Stub for a hook - replace me for now
};

Section.prototype.render = function(_request){
  var rendering = new RSVP.defer();
  var rendered = rendering.promise;
  this.output; // TODO: better way to return this from hooks?

  this.load(_request).
    then(function(contents){
      var serializer;

      if (typeof XMLSerializer === "undefined") {
        XMLSerializer = require('xmldom').XMLSerializer;
      }
      serializer = new XMLSerializer();
      this.output = serializer.serializeToString(contents);
      return this.output;
    }.bind(this)).
    then(function(){
      return this.hooks.serialize.trigger(this.output, this);
    }.bind(this)).
    then(function(){
      rendering.resolve(this.output);
    }.bind(this))
    .catch(function(error){
      rendering.reject(error);
    });

  return rendered;
};

Section.prototype.find = function(_query){

};

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* Takes: global layout settings object, chapter properties string
* Returns: Object with layout properties
*/
Section.prototype.reconcileLayoutSettings = function(global){
  //-- Get the global defaults
  var settings = {
    layout : global.layout,
    spread : global.spread,
    orientation : global.orientation
  };

  //-- Get the chapter's display type
  this.properties.forEach(function(prop){
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

Section.prototype.cfiFromRange = function(_range) {
  return new EpubCFI(_range, this.cfiBase).toString();
};

Section.prototype.cfiFromElement = function(el) {
  return new EpubCFI(el, this.cfiBase).toString();
};

module.exports = Section;

},{"./core":12,"./epubcfi":13,"./hook":14,"./request":26,"rsvp":4,"urijs":6,"xmldom":7}],28:[function(require,module,exports){
var RSVP = require('rsvp');
var core = require('./core');
var EpubCFI = require('./epubcfi');
var Hook = require('./hook');
var Section = require('./section');
var replacements = require('./replacements');

function Spine(_request){
  this.request = _request;
  this.spineItems = [];
  this.spineByHref = {};
  this.spineById = {};

  this.hooks = {};
  this.hooks.serialize = new Hook();
  this.hooks.content = new Hook();

  // Register replacements
  this.hooks.content.register(replacements.base);

  this.epubcfi = new EpubCFI();

  this.loaded = false;
};

Spine.prototype.load = function(_package) {

  this.items = _package.spine;
  this.manifest = _package.manifest;
  this.spineNodeIndex = _package.spineNodeIndex;
  this.baseUrl = _package.baseUrl || '';
  this.length = this.items.length;

  this.items.forEach(function(item, index){
    var href, url;
    var manifestItem = this.manifest[item.idref];
    var spineItem;

    item.cfiBase = this.epubcfi.generateChapterComponent(this.spineNodeIndex, item.index, item.idref);

    if(manifestItem) {
      item.href = manifestItem.href;
      item.url = this.baseUrl + item.href;

      if(manifestItem.properties.length){
        item.properties.push.apply(item.properties, manifestItem.properties);
      }
    }

    // if(index > 0) {
      item.prev = function(){ return this.get(index-1); }.bind(this);
    // }

    // if(index+1 < this.items.length) {
      item.next = function(){ return this.get(index+1); }.bind(this);
    // }

    spineItem = new Section(item, this.hooks);

    this.append(spineItem);


  }.bind(this));

  this.loaded = true;
};

// book.spine.get();
// book.spine.get(1);
// book.spine.get("chap1.html");
// book.spine.get("#id1234");
Spine.prototype.get = function(target) {
  var index = 0;

  if(this.epubcfi.isCfiString(target)) {
    cfi = new EpubCFI(target);
    index = cfi.spinePos;
  } else if(target && (typeof target === "number" || isNaN(target) === false)){
    index = target;
  } else if(target && target.indexOf("#") === 0) {
    index = this.spineById[target.substring(1)];
  } else if(target) {
    // Remove fragments
    target = target.split("#")[0];
    index = this.spineByHref[target];
  }

  return this.spineItems[index] || null;
};

Spine.prototype.append = function(section) {
  var index = this.spineItems.length;
  section.index = index;

  this.spineItems.push(section);

  this.spineByHref[section.href] = index;
  this.spineById[section.idref] = index;

  return index;
};

Spine.prototype.prepend = function(section) {
  var index = this.spineItems.unshift(section);
  this.spineByHref[section.href] = 0;
  this.spineById[section.idref] = 0;

  // Re-index
  this.spineItems.forEach(function(item, index){
    item.index = index;
  });

  return 0;
};

Spine.prototype.insert = function(section, index) {

};

Spine.prototype.remove = function(section) {
  var index = this.spineItems.indexOf(section);

  if(index > -1) {
    delete this.spineByHref[section.href];
    delete this.spineById[section.idref];

    return this.spineItems.splice(index, 1);
  }
};

Spine.prototype.each = function() {
	return this.spineItems.forEach.apply(this.spineItems, arguments);
};

module.exports = Spine;

},{"./core":12,"./epubcfi":13,"./hook":14,"./replacements":25,"./section":27,"rsvp":4}],29:[function(require,module,exports){
var core = require('./core');

function Stage(_options) {
	this.settings = _options || {};

	this.container = this.create(this.settings);

	if(this.settings.hidden) {
		this.wrapper = this.wrap(this.container);
	}

}

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
Stage.prototype.create = function(options){
	var height  = options.height;// !== false ? options.height : "100%";
	var width   = options.width;// !== false ? options.width : "100%";
	var overflow  = options.overflow || false;

	if(options.height && core.isNumber(options.height)) {
		height = options.height + "px";
	}

	if(options.width && core.isNumber(options.width)) {
		width = options.width + "px";
	}

	// Create new container element
	container = document.createElement("div");

	container.id = "epubjs-container:" + core.uuid();
	container.classList.add("epub-container");

	// Style Element
	// container.style.fontSize = "0";
	container.style.wordSpacing = "0";
	container.style.lineHeight = "0";
	container.style.verticalAlign = "top";

	if(this.settings.axis === "horizontal") {
		container.style.whiteSpace = "nowrap";
	}

	if(width){
		container.style.width = width;
	}

	if(height){
		container.style.height = height;
	}

	if (overflow) {
		container.style.overflow = overflow;
	}

	return container;
};

Stage.wrap = function(container) {
	var wrapper = document.createElement("div");

	wrapper.style.visibility = "hidden";
	wrapper.style.overflow = "hidden";
	wrapper.style.width = "0";
	wrapper.style.height = "0";

	wrapper.appendChild(container);
	return wrapper;
};


Stage.prototype.getElement = function(_element){
	var element;

	if(core.isElement(_element)) {
		element = _element;
	} else if (typeof _element === "string") {
		element = document.getElementById(_element);
	}

	if(!element){
		console.error("Not an Element");
		return;
	}

	return element;
};

Stage.prototype.attachTo = function(what){

	var element = this.getElement(what);
	var base;

	if(!element){
		return;
	}

	if(this.settings.hidden) {
		base = this.wrapper;
	} else {
		base = this.container;
	}

	element.appendChild(base);

	this.element = element;

	return element;

};

Stage.prototype.getContainer = function() {
	return this.container;
};

Stage.prototype.onResize = function(func){
	// Only listen to window for resize event if width and height are not fixed.
	// This applies if it is set to a percent or auto.
	if(!core.isNumber(this.settings.width) ||
		 !core.isNumber(this.settings.height) ) {
		window.addEventListener("resize", func, false);
	}

};

Stage.prototype.bounds = function(_width, _height){
	var bounds;
	var width = _width || this.settings.width;
	var height = _height || this.settings.height;

	// If width or height are set to false, inherit them from containing element
	if(width === null) {
		bounds = this.element.getBoundingClientRect();

		if(bounds.width) {
			width = bounds.width;
			this.container.style.width = bounds.width + "px";
		}
	}

	if(height === null) {
		bounds = bounds || this.element.getBoundingClientRect();

		if(bounds.height) {
			height = bounds.height;
			this.container.style.height = bounds.height + "px";
		}

	}

	if(width && !core.isNumber(width)) {
		bounds = this.container.getBoundingClientRect();
		width = bounds.width;
		//height = bounds.height;
	}

	if(height && !core.isNumber(height)) {
		bounds = bounds || this.container.getBoundingClientRect();
		//width = bounds.width;
		height = bounds.height;
	}


	this.containerStyles = window.getComputedStyle(this.container);
	this.containerPadding = {
		left: parseFloat(this.containerStyles["padding-left"]) || 0,
		right: parseFloat(this.containerStyles["padding-right"]) || 0,
		top: parseFloat(this.containerStyles["padding-top"]) || 0,
		bottom: parseFloat(this.containerStyles["padding-bottom"]) || 0
	};

	return {
		width: width -
						this.containerPadding.left -
						this.containerPadding.right,
		height: height -
						this.containerPadding.top -
						this.containerPadding.bottom
	};

};

module.exports = Stage;

},{"./core":12}],30:[function(require,module,exports){
var RSVP = require('rsvp');
var URI = require('urijs');
var core = require('./core');
var request = require('./request');
var mime = require('../libs/mime/mime');

function Unarchive() {

  this.checkRequirements();
  this.urlCache = {};

}

Unarchive.prototype.checkRequirements = function(callback){
  try {
    if (typeof JSZip !== 'undefined') {
      this.zip = new JSZip();
    } else {
      JSZip = require('jszip');
      this.zip = new JSZip();
    }
  } catch (e) {
    console.error("JSZip lib not loaded");
  }
};

Unarchive.prototype.open = function(zipUrl){
	if (zipUrl instanceof ArrayBuffer) {
    return new RSVP.Promise(function(resolve, reject) {
      this.zip = new JSZip(zipUrl);
      resolve(this.zip);
    });
	} else {
		return request(zipUrl, "binary")
      .then(function(data){
			  this.zip = new JSZip(data);
        return this.zip;
		  }.bind(this));
	}
};

Unarchive.prototype.request = function(url, type){
  var deferred = new RSVP.defer();
  var response;
  var r;

  // If type isn't set, determine it from the file extension
	if(!type) {
		uri = URI(url);
		type = uri.suffix();
	}

  if(type == 'blob'){
    response = this.getBlob(url);
  } else {
    response = this.getText(url);
  }

  if (response) {
    r = this.handleResponse(response, type);
    deferred.resolve(r);
  } else {
    deferred.reject({
      message : "File not found in the epub: " + url,
      stack : new Error().stack
    });
  }
  return deferred.promise;
};

Unarchive.prototype.handleResponse = function(response, type){
  var r;

  if(type == "json") {
    r = JSON.parse(response);
  }
  else
  if(core.isXml(type)) {
    r = new DOMParser().parseFromString(response, "text/xml");
	}
  else
	if(type == 'xhtml') {
    r = new DOMParser().parseFromString(response, "application/xhtml+xml");
	}
  else
	if(type == 'html' || type == 'htm') {
    r = new DOMParser().parseFromString(response, "text/html");
 	} else {
 	  r = response;
 	}

  return r;
};

Unarchive.prototype.getBlob = function(url, _mimeType){
	var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
	var entry = this.zip.file(decodededUrl);
  var mimeType;

	if(entry) {
    mimeType = _mimeType || mime.lookup(entry.name);
    return new Blob([entry.asUint8Array()], {type : mimeType});
	}
};

Unarchive.prototype.getText = function(url, encoding){
	var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
	var entry = this.zip.file(decodededUrl);

	if(entry) {
    return entry.asText();
	}
};

Unarchive.prototype.createUrl = function(url, mime){
	var deferred = new RSVP.defer();
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var tempUrl;
	var blob;

	if(url in this.urlCache) {
		deferred.resolve(this.urlCache[url]);
		return deferred.promise;
	}

	blob = this.getBlob(url);

  if (blob) {
    tempUrl = _URL.createObjectURL(blob);
    deferred.resolve(tempUrl);
    this.urlCache[url] = tempUrl;
  } else {
    deferred.reject({
      message : "File not found in the epub: " + url,
      stack : new Error().stack
    });
  }

	return deferred.promise;
};

Unarchive.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = this.urlCache[url];
	if(fromCache) _URL.revokeObjectURL(fromCache);
};

module.exports = Unarchive;

},{"../libs/mime/mime":1,"./core":12,"./request":26,"jszip":"jszip","rsvp":4,"urijs":6}],31:[function(require,module,exports){
var RSVP = require('rsvp');
var core = require('./core');
var EpubCFI = require('./epubcfi');

function View(section, options) {
  this.settings = core.extend({
    ignoreClass : ''
  }, options || {});

  this.id = "epubjs-view:" + core.uuid();
  this.section = section;
  this.index = section.index;

  this.element = document.createElement('div');
  this.element.classList.add("epub-view");


  // this.element.style.minHeight = "100px";
  this.element.style.height = "0px";
  this.element.style.width = "0px";
  this.element.style.overflow = "hidden";

  this.added = false;
  this.displayed = false;
  this.rendered = false;

  //this.width  = 0;
  //this.height = 0;

  // Blank Cfi for Parsing
  this.epubcfi = new EpubCFI();

  if(this.settings.axis && this.settings.axis == "horizontal"){
    this.element.style.display = "inline-block";
  } else {
    this.element.style.display = "block";
  }

  // Dom events to listen for
  this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

};

View.prototype.create = function() {

  if(this.iframe) {
    return this.iframe;
  }

  this.iframe = document.createElement('iframe');
  this.iframe.id = this.id;
  this.iframe.scrolling = "no"; // Might need to be removed: breaks ios width calculations
  this.iframe.style.overflow = "hidden";
  this.iframe.seamless = "seamless";
  // Back up if seamless isn't supported
  this.iframe.style.border = "none";

  this.resizing = true;

  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";

  this.iframe.style.width = "0";
  this.iframe.style.height = "0";
  this._width = 0;
  this._height = 0;

  this.element.appendChild(this.iframe);
  this.added = true;

  this.elementBounds = core.bounds(this.element);

  // if(width || height){
  //   this.resize(width, height);
  // } else if(this.width && this.height){
  //   this.resize(this.width, this.height);
  // } else {
  //   this.iframeBounds = core.bounds(this.iframe);
  // }

  // Firefox has trouble with baseURI and srcdoc
  // Disabled for now
  /*
  if(!!("srcdoc" in this.iframe)) {
    this.supportsSrcdoc = true;
  } else {
    this.supportsSrcdoc = false;
  }
  */
  this.supportsSrcdoc = false;

  return this.iframe;
};


View.prototype.lock = function(what, width, height) {

  var elBorders = core.borders(this.element);
  var iframeBorders;

  if(this.iframe) {
    iframeBorders = core.borders(this.iframe);
  } else {
    iframeBorders = {width: 0, height: 0};
  }

  if(what == "width" && core.isNumber(width)){
    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.resize(this.lockedWidth, width); //  width keeps ratio correct
  }

  if(what == "height" && core.isNumber(height)){
    this.lockedHeight = height - elBorders.height - iframeBorders.height;
    this.resize(width, this.lockedHeight);
  }

  if(what === "both" &&
     core.isNumber(width) &&
     core.isNumber(height)){

    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.lockedHeight = height - elBorders.height - iframeBorders.height;

    this.resize(this.lockedWidth, this.lockedHeight);
  }

  if(this.displayed && this.iframe) {

      this.layout();
      this.expand();

  }



};

View.prototype.expand = function(force) {
  var width = this.lockedWidth;
  var height = this.lockedHeight;

  var textWidth, textHeight;
  // console.log("expanding a")
  if(!this.iframe || this._expanding) return;

  this._expanding = true;

  // Expand Horizontally
  if(height && !width) {
    // Get the width of the text
    textWidth = this.textWidth();
    // Check if the textWidth has changed
    if(textWidth != this._textWidth){
      // Get the contentWidth by resizing the iframe
      // Check with a min reset of the textWidth
      width = this.contentWidth(textWidth);
      // Save the textWdith
      this._textWidth = textWidth;
      // Save the contentWidth
      this._contentWidth = width;
    } else {
      // Otherwise assume content height hasn't changed
      width = this._contentWidth;
    }
  }

  // Expand Vertically
  if(width && !height) {
    textHeight = this.textHeight();
    if(textHeight != this._textHeight){
      height = this.contentHeight(textHeight);
      this._textHeight = textHeight;
      this._contentHeight = height;
    } else {
      height = this._contentHeight;
    }
  }

  // Only Resize if dimensions have changed or
  // if Frame is still hidden, so needs reframing
  if(this._needsReframe || width != this._width || height != this._height){
    this.resize(width, height);
  }

  this._expanding = false;
};

View.prototype.contentWidth = function(min) {
  var prev;
  var width;

  // Save previous width
  prev = this.iframe.style.width;
  // Set the iframe size to min, width will only ever be greater
  // Will preserve the aspect ratio
  this.iframe.style.width = (min || 0) + "px";
  // Get the scroll overflow width
  width = this.document.body.scrollWidth;
  // Reset iframe size back
  this.iframe.style.width = prev;
  return width;
};

View.prototype.contentHeight = function(min) {
  var prev;
  var height;

  prev = this.iframe.style.height;
  this.iframe.style.height = (min || 0) + "px";
  height = this.document.body.scrollHeight;
  this.iframe.style.height = prev;
  return height;
};

View.prototype.textWidth = function() {
  var width;
  var range = this.document.createRange();

  // Select the contents of frame
  range.selectNodeContents(this.document.body);

  // get the width of the text content
  width = range.getBoundingClientRect().width;
  return width;

};

View.prototype.textHeight = function() {
  var height;
  var range = this.document.createRange();

  range.selectNodeContents(this.document.body);

  height = range.getBoundingClientRect().height;
  return height;
};

View.prototype.resize = function(width, height) {

  if(!this.iframe) return;

  if(core.isNumber(width)){
    this.iframe.style.width = width + "px";
    this._width = width;
  }

  if(core.isNumber(height)){
    this.iframe.style.height = height + "px";
    this._height = height;
  }

  this.iframeBounds = core.bounds(this.iframe);

  this.reframe(this.iframeBounds.width, this.iframeBounds.height);

};

View.prototype.reframe = function(width, height) {
  //var prevBounds;

  if(!this.displayed) {
    this._needsReframe = true;
    return;
  }

  if(core.isNumber(width)){
    this.element.style.width = width + "px";
  }

  if(core.isNumber(height)){
    this.element.style.height = height + "px";
  }

  this.prevBounds = this.elementBounds;

  this.elementBounds = core.bounds(this.element);

  this.trigger("resized", {
    width: this.elementBounds.width,
    height: this.elementBounds.height,
    widthDelta: this.elementBounds.width - this.prevBounds.width,
    heightDelta: this.elementBounds.height - this.prevBounds.height
  });

};

View.prototype.resized = function(e) {
  /*
  if (!this.resizing) {
    if(this.iframe) {
      // this.expand();
    }
  } else {
    this.resizing = false;
  }*/

};

View.prototype.render = function(_request) {

  // if(this.rendering){
  //   return this.displayed;
  // }

  this.rendering = true;
  // this.displayingDefer = new RSVP.defer();
  // this.displayedPromise = this.displaying.promise;

  return this.section.render(_request)
    .then(function(contents){
      return this.load(contents);
    }.bind(this));
};

View.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  if(!this.iframe) {
    loading.reject(new Error("No Iframe Available"));
    return loaded;
  }

  this.iframe.onload = function(event) {

    this.window = this.iframe.contentWindow;
    this.document = this.iframe.contentDocument;
    this.rendering = false;
    loading.resolve(this);

  }.bind(this);

  if(this.supportsSrcdoc){
    this.iframe.srcdoc = contents;
  } else {

    this.document = this.iframe.contentDocument;

    if(!this.document) {
      loading.reject(new Error("No Document Available"));
      return loaded;
    }

    this.document.open();
    this.document.write(contents);
    this.document.close();

  }

  return loaded;
};


View.prototype.layout = function(layoutFunc) {

  this.iframe.style.display = "inline-block";

  // Reset Body Styles
  this.document.body.style.margin = "0";
  //this.document.body.style.display = "inline-block";
  //this.document.documentElement.style.width = "auto";

  if(layoutFunc){
    layoutFunc(this);
  }

  this.onLayout(this);

};

View.prototype.onLayout = function(view) {
  // stub
};

View.prototype.listeners = function() {
  /*
  setTimeout(function(){
    this.window.addEventListener("resize", this.resized.bind(this), false);
  }.bind(this), 10); // Wait to listen for resize events
  */

  // Wait for fonts to load to finish
  // http://dev.w3.org/csswg/css-font-loading/
  // Not implemented fully except in chrome

  if(this.document.fonts && this.document.fonts.status === "loading") {
    // console.log("fonts unloaded");
    this.document.fonts.onloadingdone = function(){
      // console.log("loaded fonts");
      this.expand();
    }.bind(this);
  }

  if(this.section.properties.indexOf("scripted") > -1){
    this.observer = this.observe(this.document.body);
  }

  this.imageLoadListeners();

  this.mediaQueryListeners();

  // this.resizeListenters();

  this.addEventListeners();

  this.addSelectionListeners();
};

View.prototype.removeListeners = function() {

  this.removeEventListeners();

  this.removeSelectionListeners();
};

View.prototype.resizeListenters = function() {
  // Test size again
  clearTimeout(this.expanding);
  this.expanding = setTimeout(this.expand.bind(this), 350);
};

//https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
View.prototype.mediaQueryListeners = function() {
    var sheets = this.document.styleSheets;
    var mediaChangeHandler = function(m){
      if(m.matches && !this._expanding) {
        setTimeout(this.expand.bind(this), 1);
        // this.expand();
      }
    }.bind(this);

    for (var i = 0; i < sheets.length; i += 1) {
        var rules = sheets[i].cssRules;
        if(!rules) return; // Stylesheets changed
        for (var j = 0; j < rules.length; j += 1) {
            //if (rules[j].constructor === CSSMediaRule) {
            if(rules[j].media){
                var mql = this.window.matchMedia(rules[j].media.mediaText);
                mql.addListener(mediaChangeHandler);
                //mql.onchange = mediaChangeHandler;
            }
        }
    }
};

View.prototype.observe = function(target) {
  var renderer = this;

  // create an observer instance
  var observer = new MutationObserver(function(mutations) {
    if(renderer._expanding) {
      renderer.expand();
    }
    // mutations.forEach(function(mutation) {
    //   console.log(mutation);
    // });
  });

  // configuration of the observer:
  var config = { attributes: true, childList: true, characterData: true, subtree: true };

  // pass in the target node, as well as the observer options
  observer.observe(target, config);

  return observer;
};

// View.prototype.appendTo = function(element) {
//   this.element = element;
//   this.element.appendChild(this.iframe);
// };
//
// View.prototype.prependTo = function(element) {
//   this.element = element;
//   element.insertBefore(this.iframe, element.firstChild);
// };

View.prototype.imageLoadListeners = function(target) {
  var images = this.document.body.querySelectorAll("img");
  var img;
  for (var i = 0; i < images.length; i++) {
    img = images[i];

    if (typeof img.naturalWidth !== "undefined" &&
        img.naturalWidth === 0) {
      img.onload = this.expand.bind(this);
    }
  }
};

View.prototype.display = function() {
  var displayed = new RSVP.defer();

  this.displayed = true;

  this.layout();

  this.listeners();

  this.expand();

  this.trigger("displayed", this);
  this.onDisplayed(this);

  displayed.resolve(this);

  return displayed.promise;
};

View.prototype.show = function() {

  this.element.style.visibility = "visible";

  if(this.iframe){
    this.iframe.style.visibility = "visible";
  }

  this.trigger("shown", this);
};

View.prototype.hide = function() {
  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";

  this.stopExpanding = true;
  this.trigger("hidden", this);
};

View.prototype.position = function() {
  return this.element.getBoundingClientRect();
};

View.prototype.onDisplayed = function(view) {
  // Stub, override with a custom functions
};

View.prototype.bounds = function() {
  if(!this.elementBounds) {
    this.elementBounds = core.bounds(this.element);
  }
  return this.elementBounds;
};

View.prototype.destroy = function() {
  // Stop observing
  if(this.observer) {
    this.observer.disconnect();
  }

  if(this.displayed){
    this.removeListeners();

    this.stopExpanding = true;
    this.element.removeChild(this.iframe);
    this.displayed = false;
    this.iframe = null;

    this._textWidth = null;
    this._textHeight = null;
    this._width = null;
    this._height = null;
  }
  // this.element.style.height = "0px";
  // this.element.style.width = "0px";
};

View.prototype.root = function() {
  if(!this.document) return null;
  return this.document.documentElement;
};

View.prototype.locationOf = function(target) {
  var parentPos = this.iframe.getBoundingClientRect();
  var targetPos = {"left": 0, "top": 0};

  if(!this.document) return;

  if(this.epubcfi.isCfiString(target)) {
    range = new EpubCFI(cfi).toRange(this.document, this.settings.ignoreClass);
    if(range) {
      targetPos = range.getBoundingClientRect();
    }

  } else if(typeof target === "string" &&
    target.indexOf("#") > -1) {

    id = target.substring(target.indexOf("#")+1);
    el = this.document.getElementById(id);

    if(el) {
      targetPos = el.getBoundingClientRect();
    }
  }

  return {
    "left": window.scrollX + parentPos.left + targetPos.left,
    "top": window.scrollY + parentPos.top + targetPos.top
  };
};

View.prototype.addCss = function(src) {
  return new RSVP.Promise(function(resolve, reject){
    var $stylesheet;
    var ready = false;

    if(!this.document) {
      resolve(false);
      return;
    }

    $stylesheet = this.document.createElement('link');
    $stylesheet.type = 'text/css';
    $stylesheet.rel = "stylesheet";
    $stylesheet.href = src;
    $stylesheet.onload = $stylesheet.onreadystatechange = function() {
      if ( !ready && (!this.readyState || this.readyState == 'complete') ) {
        ready = true;
        // Let apply
        setTimeout(function(){
          resolve(true);
        }, 1);
      }
    };

    this.document.head.appendChild($stylesheet);

  }.bind(this));
};

// https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
View.prototype.addStylesheetRules = function(rules) {
  var styleEl;
  var styleSheet;

  if(!this.document) return;

  styleEl = this.document.createElement('style');

  // Append style element to head
  this.document.head.appendChild(styleEl);

  // Grab style sheet
  styleSheet = styleEl.sheet;

  for (var i = 0, rl = rules.length; i < rl; i++) {
    var j = 1, rule = rules[i], selector = rules[i][0], propStr = '';
    // If the second argument of a rule is an array of arrays, correct our variables.
    if (Object.prototype.toString.call(rule[1][0]) === '[object Array]') {
      rule = rule[1];
      j = 0;
    }

    for (var pl = rule.length; j < pl; j++) {
      var prop = rule[j];
      propStr += prop[0] + ':' + prop[1] + (prop[2] ? ' !important' : '') + ';\n';
    }

    // Insert CSS Rule
    styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);
  }
};

View.prototype.addScript = function(src) {

  return new RSVP.Promise(function(resolve, reject){
    var $script;
    var ready = false;

    if(!this.document) {
      resolve(false);
      return;
    }

    $script = this.document.createElement('script');
    $script.type = 'text/javascript';
    $script.async = true;
    $script.src = src;
    $script.onload = $script.onreadystatechange = function() {
      if ( !ready && (!this.readyState || this.readyState == 'complete') ) {
        ready = true;
        setTimeout(function(){
          resolve(true);
        }, 1);
      }
    };

    this.document.head.appendChild($script);

  }.bind(this));
};

View.prototype.addEventListeners = function(){
  if(!this.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.document.addEventListener(eventName, this.triggerEvent.bind(this), false);
  }, this);

};

View.prototype.removeEventListeners = function(){
  if(!this.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.document.removeEventListener(eventName, this.triggerEvent, false);
  }, this);

};

// Pass browser events
View.prototype.triggerEvent = function(e){
  this.trigger(e.type, e);
};

View.prototype.addSelectionListeners = function(){
  if(!this.document) {
    return;
  }
  this.document.addEventListener("selectionchange", this.onSelectionChange.bind(this), false);
};

View.prototype.removeSelectionListeners = function(){
  if(!this.document) {
    return;
  }
  this.document.removeEventListener("selectionchange", this.onSelectionChange, false);
};

View.prototype.onSelectionChange = function(e){
  if (this.selectionEndTimeout) {
    clearTimeout(this.selectionEndTimeout);
  }
  this.selectionEndTimeout = setTimeout(function() {
    var selection = this.window.getSelection();
    this.triggerSelectedEvent(selection);
  }.bind(this), 500);
};

View.prototype.triggerSelectedEvent = function(selection){
	var range, cfirange;

  if (selection && selection.rangeCount > 0) {
    range = selection.getRangeAt(0);
    if(!range.collapsed) {
      cfirange = this.section.cfiFromRange(range);
      this.trigger("selected", cfirange);
      this.trigger("selectedRange", range);
    }
  }
};

View.prototype.range = function(_cfi, ignoreClass){
  var cfi = new EpubCFI(_cfi);
  return cfi.toRange(this.document, ignoreClass || this.settings.ignoreClass);
};

RSVP.EventTarget.mixin(View.prototype);

module.exports = View;

},{"./core":12,"./epubcfi":13,"rsvp":4}],32:[function(require,module,exports){
function Views(container) {
  this.container = container;
  this._views = [];
  this.length = 0;
  this.hidden = false;
};

Views.prototype.first = function() {
	return this._views[0];
};

Views.prototype.last = function() {
	return this._views[this._views.length-1];
};

Views.prototype.indexOf = function(view) {
	return this._views.indexOf(view);
};

Views.prototype.slice = function() {
	return this._views.slice.apply(this._views, arguments);
};

Views.prototype.get = function(i) {
	return this._views[i];
};

Views.prototype.append = function(view){
	this._views.push(view);
  if(this.container){
    this.container.appendChild(view.element);
  }
  this.length++;
  return view;
};

Views.prototype.prepend = function(view){
	this._views.unshift(view);
  if(this.container){
    this.container.insertBefore(view.element, this.container.firstChild);
  }
  this.length++;
  return view;
};

Views.prototype.insert = function(view, index) {
	this._views.splice(index, 0, view);

  if(this.container){
  	if(index < this.container.children.length){
  		this.container.insertBefore(view.element, this.container.children[index]);
  	} else {
  		this.container.appendChild(view.element);
  	}
  }

  this.length++;
  return view;
};

Views.prototype.remove = function(view) {
	var index = this._views.indexOf(view);

	if(index > -1) {
		this._views.splice(index, 1);
	}


	this.destroy(view);

  this.length--;
};

Views.prototype.destroy = function(view) {
	view.off("resized");

	if(view.displayed){
		view.destroy();
	}
  if(this.container){
	   this.container.removeChild(view.element);
  }
	view = null;
};

// Iterators

Views.prototype.each = function() {
	return this._views.forEach.apply(this._views, arguments);
};

Views.prototype.clear = function(){
	// Remove all views
  var view;
  var len = this.length;

  if(!this.length) return;

  for (var i = 0; i < len; i++) {
    view = this._views[i];
		this.destroy(view);
  }

  this._views = [];
  this.length = 0;
};

Views.prototype.find = function(section){

  var view;
  var len = this.length;

  for (var i = 0; i < len; i++) {
    view = this._views[i];
		if(view.displayed && view.section.index == section.index) {
			return view;
		}
  }

};

Views.prototype.displayed = function(){
  var displayed = [];
  var view;
  var len = this.length;

  for (var i = 0; i < len; i++) {
    view = this._views[i];
    if(view.displayed){
      displayed.push(view);
    }
  }
  return displayed;
};

Views.prototype.show = function(){
  var view;
  var len = this.length;

  for (var i = 0; i < len; i++) {
    view = this._views[i];
    if(view.displayed){
      view.show();
    }
  }
  this.hidden = false;
};

Views.prototype.hide = function(){
  var view;
  var len = this.length;

  for (var i = 0; i < len; i++) {
    view = this._views[i];
    if(view.displayed){
      view.hide();
    }
  }
  this.hidden = true;
};

module.exports = Views;

},{}],33:[function(require,module,exports){
var RSVP = require('rsvp');
var core = require('../core');
var EpubCFI = require('../epubcfi');
var Contents = require('../contents');

function IframeView(section, options) {
  this.settings = core.extend({
    ignoreClass : '',
    axis: 'vertical',
    width: 0,
    height: 0,
    layout: undefined,
    globalLayoutProperties: {},
  }, options || {});

  this.id = "epubjs-view:" + core.uuid();
  this.section = section;
  this.index = section.index;

  this.element = this.container(this.settings.axis);

  this.added = false;
  this.displayed = false;
  this.rendered = false;

  this.width  = this.settings.width;
  this.height = this.settings.height;

  this.fixedWidth  = 0;
  this.fixedHeight = 0;

  // Blank Cfi for Parsing
  this.epubcfi = new EpubCFI();

  this.layout = this.settings.layout;
  // Dom events to listen for
  // this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

};

IframeView.prototype.container = function(axis) {
  var element = document.createElement('div');

  element.classList.add("epub-view");

  // this.element.style.minHeight = "100px";
  element.style.height = "0px";
  element.style.width = "0px";
  element.style.overflow = "hidden";

  if(axis && axis == "horizontal"){
    element.style.display = "inline-block";
  } else {
    element.style.display = "block";
  }

  return element;
};

IframeView.prototype.create = function() {

  if(this.iframe) {
    return this.iframe;
  }

  if(!this.element) {
    this.element = this.createContainer();
  }

  this.iframe = document.createElement('iframe');
  this.iframe.id = this.id;
  this.iframe.scrolling = "no"; // Might need to be removed: breaks ios width calculations
  this.iframe.style.overflow = "hidden";
  this.iframe.seamless = "seamless";
  // Back up if seamless isn't supported
  this.iframe.style.border = "none";

  this.resizing = true;

  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";

  this.iframe.style.width = "0";
  this.iframe.style.height = "0";
  this._width = 0;
  this._height = 0;

  this.element.appendChild(this.iframe);
  this.added = true;

  this.elementBounds = core.bounds(this.element);

  // if(width || height){
  //   this.resize(width, height);
  // } else if(this.width && this.height){
  //   this.resize(this.width, this.height);
  // } else {
  //   this.iframeBounds = core.bounds(this.iframe);
  // }

  // Firefox has trouble with baseURI and srcdoc
  // TODO: Disable for now in firefox

  if(!!("srcdoc" in this.iframe)) {
    this.supportsSrcdoc = true;
  } else {
    this.supportsSrcdoc = false;
  }

  return this.iframe;
};

IframeView.prototype.render = function(request, show) {

	// view.onLayout = this.layout.format.bind(this.layout);
	this.create();

	// Fit to size of the container, apply padding
  this.size();

	// Render Chain
	return this.section.render(request)
		.then(function(contents){
			return this.load(contents);
		}.bind(this))
		// .then(function(doc){
		// 	return this.hooks.content.trigger(view, this);
		// }.bind(this))
		.then(function(){
			// this.settings.layout.format(view.contents);
			// return this.hooks.layout.trigger(view, this);
		}.bind(this))
		// .then(function(){
		// 	return this.display();
		// }.bind(this))
		// .then(function(){
		// 	return this.hooks.render.trigger(view, this);
		// }.bind(this))
		.then(function(){

      // apply the layout function to the contents
      this.settings.layout.format(this.contents);

      // Expand the iframe to the full size of the content
      this.expand();

      // Listen for events that require an expansion of the iframe
      this.addListeners();

			if(show !== false) {
				//this.q.enqueue(function(view){
					this.show();
				//}, view);
			}
			// this.map = new Map(view, this.layout);
			//this.hooks.show.trigger(view, this);
			this.trigger("rendered", this.section);

		}.bind(this))
		.catch(function(e){
			this.trigger("loaderror", e);
		}.bind(this));

};

// Determine locks base on settings
IframeView.prototype.size = function(_width, _height) {
  var width = _width || this.settings.width;
  var height = _height || this.settings.height;

  if(this.layout.name === "pre-paginated") {
    // TODO: check if these are different than the size set in chapter
    this.lock("both", width, height);
  } else if(this.settings.axis === "horizontal") {
		this.lock("height", width, height);
	} else {
		this.lock("width", width, height);
	}

};

// Lock an axis to element dimensions, taking borders into account
IframeView.prototype.lock = function(what, width, height) {
  var elBorders = core.borders(this.element);
  var iframeBorders;

  if(this.iframe) {
    iframeBorders = core.borders(this.iframe);
  } else {
    iframeBorders = {width: 0, height: 0};
  }

  if(what == "width" && core.isNumber(width)){
    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.resize(this.lockedWidth, width); //  width keeps ratio correct
  }

  if(what == "height" && core.isNumber(height)){
    this.lockedHeight = height - elBorders.height - iframeBorders.height;
    this.resize(width, this.lockedHeight);
  }

  if(what === "both" &&
     core.isNumber(width) &&
     core.isNumber(height)){

    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.lockedHeight = height - elBorders.height - iframeBorders.height;

    this.resize(this.lockedWidth, this.lockedHeight);
  }

  if(this.displayed && this.iframe) {

      // this.contents.layout();
      this.expand();

  }



};

// Resize a single axis based on content dimensions
IframeView.prototype.expand = function(force) {
  var width = this.lockedWidth;
  var height = this.lockedHeight;

  var textWidth, textHeight;

  if(!this.iframe || this._expanding) return;

  this._expanding = true;

  // Expand Horizontally
  // if(height && !width) {
  if(this.settings.axis === "horizontal") {
    // Get the width of the text
    textWidth = this.contents.textWidth();
    // Check if the textWidth has changed
    if(textWidth != this._textWidth){
      // Get the contentWidth by resizing the iframe
      // Check with a min reset of the textWidth
      width = this.contentWidth(textWidth);
      // Save the textWdith
      this._textWidth = textWidth;
      // Save the contentWidth
      this._contentWidth = width;
    } else {
      // Otherwise assume content height hasn't changed
      width = this._contentWidth;
    }
  } // Expand Vertically
  else if(this.settings.axis === "vertical") {
    textHeight = this.contents.textHeight();
    if(textHeight != this._textHeight){
      height = this.contentHeight(textHeight);
      this._textHeight = textHeight;
      this._contentHeight = height;
    } else {
      height = this._contentHeight;
    }

  }

  // Only Resize if dimensions have changed or
  // if Frame is still hidden, so needs reframing
  if(this._needsReframe || width != this._width || height != this._height){
    this.resize(width, height);
  }

  this._expanding = false;
};

IframeView.prototype.contentWidth = function(min) {
  var prev;
  var width;

  // Save previous width
  prev = this.iframe.style.width;
  // Set the iframe size to min, width will only ever be greater
  // Will preserve the aspect ratio
  this.iframe.style.width = (min || 0) + "px";
  // Get the scroll overflow width
  width = this.contents.scrollWidth();
  // Reset iframe size back
  this.iframe.style.width = prev;
  return width;
};

IframeView.prototype.contentHeight = function(min) {
  var prev;
  var height;

  prev = this.iframe.style.height;
  this.iframe.style.height = (min || 0) + "px";
  height = this.contents.scrollHeight();

  this.iframe.style.height = prev;
  return height;
};


IframeView.prototype.resize = function(width, height) {

  if(!this.iframe) return;

  if(core.isNumber(width)){
    this.iframe.style.width = width + "px";
    this._width = width;
  }

  if(core.isNumber(height)){
    this.iframe.style.height = height + "px";
    this._height = height;
  }

  this.iframeBounds = core.bounds(this.iframe);

  this.reframe(this.iframeBounds.width, this.iframeBounds.height);

};

IframeView.prototype.reframe = function(width, height) {
  var size;

  // if(!this.displayed) {
  //   this._needsReframe = true;
  //   return;
  // }

  if(core.isNumber(width)){
    this.element.style.width = width + "px";
  }

  if(core.isNumber(height)){
    this.element.style.height = height + "px";
  }

  this.prevBounds = this.elementBounds;

  this.elementBounds = core.bounds(this.element);

  size = {
    width: this.elementBounds.width,
    height: this.elementBounds.height,
    widthDelta: this.elementBounds.width - this.prevBounds.width,
    heightDelta: this.elementBounds.height - this.prevBounds.height,
  };

  this.onResize(this, size);

  this.trigger("resized", size);

};


IframeView.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  if(!this.iframe) {
    loading.reject(new Error("No Iframe Available"));
    return loaded;
  }

  this.iframe.onload = function(event) {

    this.onLoad(event, loading);

  }.bind(this);

  if(this.supportsSrcdoc){
    this.iframe.srcdoc = contents;
  } else {

    this.document = this.iframe.contentDocument;

    if(!this.document) {
      loading.reject(new Error("No Document Available"));
      return loaded;
    }

    this.document.open();
    this.document.write(contents);
    this.document.close();

  }

  return loaded;
};

IframeView.prototype.onLoad = function(event, promise) {

    this.window = this.iframe.contentWindow;
    this.document = this.iframe.contentDocument;

    this.contents = new Contents(this.document);

    this.rendering = false;

    promise.resolve(this.contents);
};



// IframeView.prototype.layout = function(layoutFunc) {
//
//   this.iframe.style.display = "inline-block";
//
//   // Reset Body Styles
//   // this.document.body.style.margin = "0";
//   //this.document.body.style.display = "inline-block";
//   //this.document.documentElement.style.width = "auto";
//
//   if(layoutFunc){
//     this.layoutFunc = layoutFunc;
//   }
//
//   this.contents.layout(this.layoutFunc);
//
// };
//
// IframeView.prototype.onLayout = function(view) {
//   // stub
// };

IframeView.prototype.setLayout = function(layout) {
  this.layout = layout;
};


IframeView.prototype.resizeListenters = function() {
  // Test size again
  clearTimeout(this.expanding);
  this.expanding = setTimeout(this.expand.bind(this), 350);
};

IframeView.prototype.addListeners = function() {
  //TODO: Add content listeners for expanding
};

IframeView.prototype.removeListeners = function(layoutFunc) {
  //TODO: remove content listeners for expanding
};

IframeView.prototype.display = function(request) {
  var displayed = new RSVP.defer();

  if (!this.displayed) {

    this.render(request).then(function () {

      this.trigger("displayed", this);
      this.onDisplayed(this);

      this.displayed = true;

      displayed.resolve(this);

    }.bind(this));

  } else {
    displayed.resolve(this);
  }


  return displayed.promise;
};

IframeView.prototype.show = function() {

  this.element.style.visibility = "visible";

  if(this.iframe){
    this.iframe.style.visibility = "visible";
  }

  this.trigger("shown", this);
};

IframeView.prototype.hide = function() {
  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";

  this.stopExpanding = true;
  this.trigger("hidden", this);
};

IframeView.prototype.position = function() {
  return this.element.getBoundingClientRect();
};

IframeView.prototype.locationOf = function(target) {
  var parentPos = this.iframe.getBoundingClientRect();
  var targetPos = this.contents.locationOf(target, this.settings.ignoreClass);

  return {
    "left": window.scrollX + parentPos.left + targetPos.left,
    "top": window.scrollY + parentPos.top + targetPos.top
  };
};

IframeView.prototype.onDisplayed = function(view) {
  // Stub, override with a custom functions
};

IframeView.prototype.onResize = function(view, e) {
  // Stub, override with a custom functions
};

IframeView.prototype.bounds = function() {
  if(!this.elementBounds) {
    this.elementBounds = core.bounds(this.element);
  }
  return this.elementBounds;
};

IframeView.prototype.destroy = function() {

  if(this.displayed){
    this.displayed = false;

    this.removeListeners();

    this.stopExpanding = true;
    this.element.removeChild(this.iframe);
    this.displayed = false;
    this.iframe = null;

    this._textWidth = null;
    this._textHeight = null;
    this._width = null;
    this._height = null;
  }
  // this.element.style.height = "0px";
  // this.element.style.width = "0px";
};

RSVP.EventTarget.mixin(IframeView.prototype);

module.exports = IframeView;

},{"../contents":11,"../core":12,"../epubcfi":13,"rsvp":4}],34:[function(require,module,exports){
var RSVP = require('rsvp');
var core = require('../core');
var EpubCFI = require('../epubcfi');
var Contents = require('../contents');
var URI = require('urijs');

function InlineView(section, options) {
  this.settings = core.extend({
    ignoreClass : '',
    axis: 'vertical',
    width: 0,
    height: 0,
    layout: undefined,
    globalLayoutProperties: {},
  }, options || {});

  this.id = "epubjs-view:" + core.uuid();
  this.section = section;
  this.index = section.index;

  this.element = this.container(this.settings.axis);

  this.added = false;
  this.displayed = false;
  this.rendered = false;

  this.width  = this.settings.width;
  this.height = this.settings.height;

  this.fixedWidth  = 0;
  this.fixedHeight = 0;

  // Blank Cfi for Parsing
  this.epubcfi = new EpubCFI();

  this.layout = this.settings.layout;
  // Dom events to listen for
  // this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

};

InlineView.prototype.container = function(axis) {
  var element = document.createElement('div');

  element.classList.add("epub-view");

  // if(this.settings.axis === "horizontal") {
  //   element.style.width = "auto";
  //   element.style.height = "0";
	// } else {
  //   element.style.width = "0";
  //   element.style.height = "auto";
	// }

  element.style.overflow = "hidden";

  if(axis && axis == "horizontal"){
    element.style.display = "inline-block";
  } else {
    element.style.display = "block";
  }

  return element;
};

InlineView.prototype.create = function() {

  if(this.frame) {
    return this.frame;
  }

  if(!this.element) {
    this.element = this.createContainer();
  }

  this.frame = document.createElement('div');
  this.frame.id = this.id;
  this.frame.style.overflow = "hidden";
  this.frame.style.wordSpacing = "initial";
	this.frame.style.lineHeight = "initial";

  this.resizing = true;

  // this.frame.style.display = "none";
  this.element.style.visibility = "hidden";
  this.frame.style.visibility = "hidden";

  if(this.settings.axis === "horizontal") {
    this.frame.style.width = "auto";
    this.frame.style.height = "0";
	} else {
    this.frame.style.width = "0";
    this.frame.style.height = "auto";
	}

  this._width = 0;
  this._height = 0;

  this.element.appendChild(this.frame);
  this.added = true;

  this.elementBounds = core.bounds(this.element);

  return this.frame;
};

InlineView.prototype.render = function(request, show) {

	// view.onLayout = this.layout.format.bind(this.layout);
	this.create();

	// Fit to size of the container, apply padding
  this.size();

	// Render Chain
	return this.section.render(request)
		.then(function(contents){
			return this.load(contents);
		}.bind(this))
		// .then(function(doc){
		// 	return this.hooks.content.trigger(view, this);
		// }.bind(this))
		.then(function(){
			// this.settings.layout.format(view.contents);
			// return this.hooks.layout.trigger(view, this);
		}.bind(this))
		// .then(function(){
		// 	return this.display();
		// }.bind(this))
		// .then(function(){
		// 	return this.hooks.render.trigger(view, this);
		// }.bind(this))
		.then(function(){

      // apply the layout function to the contents
      this.settings.layout.format(this.contents);

      // Expand the iframe to the full size of the content
      // this.expand();

      // Listen for events that require an expansion of the iframe
      this.addListeners();

			if(show !== false) {
				//this.q.enqueue(function(view){
					this.show();
				//}, view);
			}
			// this.map = new Map(view, this.layout);
			//this.hooks.show.trigger(view, this);
			this.trigger("rendered", this.section);

		}.bind(this))
		.catch(function(e){
			this.trigger("loaderror", e);
		}.bind(this));

};

// Determine locks base on settings
InlineView.prototype.size = function(_width, _height) {
  var width = _width || this.settings.width;
  var height = _height || this.settings.height;

  if(this.layout.name === "pre-paginated") {
    // TODO: check if these are different than the size set in chapter
    this.lock("both", width, height);
  } else if(this.settings.axis === "horizontal") {
		this.lock("height", width, height);
	} else {
		this.lock("width", width, height);
	}

};

// Lock an axis to element dimensions, taking borders into account
InlineView.prototype.lock = function(what, width, height) {
  var elBorders = core.borders(this.element);
  var iframeBorders;

  if(this.frame) {
    iframeBorders = core.borders(this.frame);
  } else {
    iframeBorders = {width: 0, height: 0};
  }

  if(what == "width" && core.isNumber(width)){
    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.resize(this.lockedWidth, false); //  width keeps ratio correct
  }

  if(what == "height" && core.isNumber(height)){
    this.lockedHeight = height - elBorders.height - iframeBorders.height;
    this.resize(false, this.lockedHeight);
  }

  if(what === "both" &&
     core.isNumber(width) &&
     core.isNumber(height)){

    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.lockedHeight = height - elBorders.height - iframeBorders.height;

    this.resize(this.lockedWidth, this.lockedHeight);
  }

};

// Resize a single axis based on content dimensions
InlineView.prototype.expand = function(force) {
  var width = this.lockedWidth;
  var height = this.lockedHeight;

  var textWidth, textHeight;

  if(!this.frame || this._expanding) return;

  this._expanding = true;

  // Expand Horizontally
  if(this.settings.axis === "horizontal") {
    width = this.contentWidth(textWidth);
  } // Expand Vertically
  else if(this.settings.axis === "vertical") {
    height = this.contentHeight(textHeight);
  }

  // Only Resize if dimensions have changed or
  // if Frame is still hidden, so needs reframing
  if(this._needsReframe || width != this._width || height != this._height){
    this.resize(width, height);
  }

  this._expanding = false;
};

InlineView.prototype.contentWidth = function(min) {
  return this.frame.scrollWidth;
};

InlineView.prototype.contentHeight = function(min) {
  console.log(this.frame.scrollHeight);
  return this.frame.scrollHeight;
};


InlineView.prototype.resize = function(width, height) {

  if(!this.frame) return;

  if(core.isNumber(width)){
    this.frame.style.width = width + "px";
    this._width = width;
  }

  if(core.isNumber(height)){
    this.frame.style.height = height + "px";
    this._height = height;
  }

  this.prevBounds = this.elementBounds;

  this.elementBounds = core.bounds(this.element);

  size = {
    width: this.elementBounds.width,
    height: this.elementBounds.height,
    widthDelta: this.elementBounds.width - this.prevBounds.width,
    heightDelta: this.elementBounds.height - this.prevBounds.height,
  };

  this.onResize(this, size);

  this.trigger("resized", size);

};


InlineView.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;
  var doc = core.parse(contents, "text/html");
  var body = core.qs(doc, "body");

  var srcs = doc.querySelectorAll("[src]");
  Array.prototype.slice.call(srcs)
    .forEach(function(item) {
      var src = item.getAttribute('src');
      var assetUri = URI(src);
      var origin = assetUri.origin();
      var absoluteUri;

      if (!origin) {
        absoluteUri = assetUri.absoluteTo(this.section.url);
        item.src = absoluteUri;
      }
    }.bind(this));

  this.frame.innerHTML = body.innerHTML;

  this.document = this.frame.ownerDocument;
  this.window = this.document.defaultView;

  this.contents = new Contents(this.document, this.frame);

  // <link rel="canonical" href="https://blog.example.com/dresses/green-dresses-are-awesome" />
  var link = this.document.querySelector("link[rel='canonical']");
  if (link) {
    link.setAttribute("href", this.section.url);
  } else {
    link = this.document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", this.section.url);
    this.document.querySelector("head").appendChild(link);
  }
  this.rendering = false;

  loading.resolve(this.contents);


  return loaded;
};

InlineView.prototype.setLayout = function(layout) {
  this.layout = layout;
};


InlineView.prototype.resizeListenters = function() {
  // Test size again
  // clearTimeout(this.expanding);
  // this.expanding = setTimeout(this.expand.bind(this), 350);
};

InlineView.prototype.addListeners = function() {
  //TODO: Add content listeners for expanding
};

InlineView.prototype.removeListeners = function(layoutFunc) {
  //TODO: remove content listeners for expanding
};

InlineView.prototype.display = function(request) {
  var displayed = new RSVP.defer();

  if (!this.displayed) {

    this.render(request).then(function () {

      this.trigger("displayed", this);
      this.onDisplayed(this);

      this.displayed = true;

      displayed.resolve(this);

    }.bind(this));

  } else {
    displayed.resolve(this);
  }


  return displayed.promise;
};

InlineView.prototype.show = function() {

  this.element.style.visibility = "visible";

  if(this.frame){
    this.frame.style.visibility = "visible";
  }

  this.trigger("shown", this);
};

InlineView.prototype.hide = function() {
  // this.frame.style.display = "none";
  this.element.style.visibility = "hidden";
  this.frame.style.visibility = "hidden";

  this.stopExpanding = true;
  this.trigger("hidden", this);
};

InlineView.prototype.position = function() {
  return this.element.getBoundingClientRect();
};

InlineView.prototype.locationOf = function(target) {
  var parentPos = this.frame.getBoundingClientRect();
  var targetPos = this.contents.locationOf(target, this.settings.ignoreClass);

  return {
    "left": window.scrollX + parentPos.left + targetPos.left,
    "top": window.scrollY + parentPos.top + targetPos.top
  };
};

InlineView.prototype.onDisplayed = function(view) {
  // Stub, override with a custom functions
};

InlineView.prototype.onResize = function(view, e) {
  // Stub, override with a custom functions
};

InlineView.prototype.bounds = function() {
  if(!this.elementBounds) {
    this.elementBounds = core.bounds(this.element);
  }
  return this.elementBounds;
};

InlineView.prototype.destroy = function() {

  if(this.displayed){
    this.displayed = false;

    this.removeListeners();

    this.stopExpanding = true;
    this.element.removeChild(this.frame);
    this.displayed = false;
    this.frame = null;

    this._textWidth = null;
    this._textHeight = null;
    this._width = null;
    this._height = null;
  }
  // this.element.style.height = "0px";
  // this.element.style.width = "0px";
};

RSVP.EventTarget.mixin(InlineView.prototype);

module.exports = InlineView;

},{"../contents":11,"../core":12,"../epubcfi":13,"rsvp":4,"urijs":6}],"epub":[function(require,module,exports){
var Book = require('./book');
var EpubCFI = require('./epubcfi');
var Rendition = require('./rendition');
var Contents = require('./contents');
var RSVP = require('rsvp');

function ePub(_url) {
	return new Book(_url);
};

ePub.VERSION = "0.3.0";

ePub.CFI = EpubCFI;
ePub.Rendition = Rendition;
ePub.Contents = Contents;
ePub.RSVP = RSVP;

ePub.ViewManagers = {};
ePub.Views = {};
ePub.register = {
	manager : function(name, manager){
  	return ePub.ViewManagers[name] = manager;
	},
	view : function(name, view){
		return ePub.Views[name] = view;
	}
};

// Default Views
ePub.register.view("iframe", require('./views/iframe'));
ePub.register.view("inline", require('./views/inline'));

// Default View Managers
ePub.register.manager("single", require('./managers/single'));
ePub.register.manager("continuous", require('./managers/continuous'));
ePub.register.manager("paginate", require('./managers/paginate'));

module.exports = ePub;

},{"./book":10,"./contents":11,"./epubcfi":13,"./managers/continuous":17,"./managers/paginate":18,"./managers/single":19,"./rendition":24,"./views/iframe":33,"./views/inline":34,"rsvp":4}]},{},["epub"])("epub")
});


//# sourceMappingURL=epub.js.map
