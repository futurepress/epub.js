(function(globals) {
var define, requireModule;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requireModule = function(name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod = registry[name];
    if (!mod) {
      throw new Error("Module '" + name + "' not found.");
    }

    var deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };
})();

define("rsvp/all",
  ["rsvp/promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__.Promise;
    /* global toString */


    function all(promises) {
      if (Object.prototype.toString.call(promises) !== "[object Array]") {
        throw new TypeError('You must pass an array to all.');
      }

      return new Promise(function(resolve, reject) {
        var results = [], remaining = promises.length,
        promise;

        if (remaining === 0) {
          resolve([]);
        }

        function resolver(index) {
          return function(value) {
            resolveAll(index, value);
          };
        }

        function resolveAll(index, value) {
          results[index] = value;
          if (--remaining === 0) {
            resolve(results);
          }
        }

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && typeof promise.then === 'function') {
            promise.then(resolver(i), reject);
          } else {
            resolveAll(i, promise);
          }
        }
      });
    }


    __exports__.all = all;
  });
define("rsvp/async",
  ["exports"],
  function(__exports__) {
    "use strict";
    var browserGlobal = (typeof window !== 'undefined') ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var local = (typeof global !== 'undefined') ? global : this;

    // node
    function useNextTick() {
      return function() {
        process.nextTick(flush);
      };
    }

    function useMutationObserver() {
      var observer = new BrowserMutationObserver(flush);
      var element = document.createElement('div');
      observer.observe(element, { attributes: true });

      // Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
      window.addEventListener('unload', function(){
        observer.disconnect();
        observer = null;
      }, false);

      return function() {
        element.setAttribute('drainQueue', 'drainQueue');
      };
    }

    function useSetTimeout() {
      return function() {
        local.setTimeout(flush, 1);
      };
    }

    var queue = [];
    function flush() {
      for (var i = 0; i < queue.length; i++) {
        var tuple = queue[i];
        var callback = tuple[0], arg = tuple[1];
        callback(arg);
      }
      queue = [];
    }

    var scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function async(callback, arg) {
      var length = queue.push([callback, arg]);
      if (length === 1) {
        // If length is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        scheduleFlush();
      }
    }


    __exports__.async = async;
  });
define("rsvp/config",
  ["rsvp/async","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var async = __dependency1__.async;

    var config = {};
    config.async = async;


    __exports__.config = config;
  });
define("rsvp/defer",
  ["rsvp/promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__.Promise;

    function defer() {
      var deferred = {
        // pre-allocate shape
        resolve: undefined,
        reject:  undefined,
        promise: undefined
      };

      deferred.promise = new Promise(function(resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
      });

      return deferred;
    }


    __exports__.defer = defer;
  });
define("rsvp/events",
  ["exports"],
  function(__exports__) {
    "use strict";
    var Event = function(type, options) {
      this.type = type;

      for (var option in options) {
        if (!options.hasOwnProperty(option)) { continue; }

        this[option] = options[option];
      }
    };

    var indexOf = function(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i][0] === callback) { return i; }
      }

      return -1;
    };

    var callbacksFor = function(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    };

    var EventTarget = {
      mixin: function(object) {
        object.on = this.on;
        object.off = this.off;
        object.trigger = this.trigger;
        return object;
      },

      on: function(eventNames, callback, binding) {
        var allCallbacks = callbacksFor(this), callbacks, eventName;
        eventNames = eventNames.split(/\s+/);
        binding = binding || this;

        while (eventName = eventNames.shift()) {
          callbacks = allCallbacks[eventName];

          if (!callbacks) {
            callbacks = allCallbacks[eventName] = [];
          }

          if (indexOf(callbacks, callback) === -1) {
            callbacks.push([callback, binding]);
          }
        }
      },

      off: function(eventNames, callback) {
        var allCallbacks = callbacksFor(this), callbacks, eventName, index;
        eventNames = eventNames.split(/\s+/);

        while (eventName = eventNames.shift()) {
          if (!callback) {
            allCallbacks[eventName] = [];
            continue;
          }

          callbacks = allCallbacks[eventName];

          index = indexOf(callbacks, callback);

          if (index !== -1) { callbacks.splice(index, 1); }
        }
      },

      trigger: function(eventName, options) {
        var allCallbacks = callbacksFor(this),
            callbacks, callbackTuple, callback, binding, event;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callbackTuple = callbacks[i];
            callback = callbackTuple[0];
            binding = callbackTuple[1];

            if (typeof options !== 'object') {
              options = { detail: options };
            }

            event = new Event(eventName, options);
            callback.call(binding, event);
          }
        }
      }
    };


    __exports__.EventTarget = EventTarget;
  });
define("rsvp/hash",
  ["rsvp/defer","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var defer = __dependency1__.defer;

    function size(object) {
      var s = 0;

      for (var prop in object) {
        s++;
      }

      return s;
    }

    function hash(promises) {
      var results = {}, deferred = defer(), remaining = size(promises);

      if (remaining === 0) {
        deferred.resolve({});
      }

      var resolver = function(prop) {
        return function(value) {
          resolveAll(prop, value);
        };
      };

      var resolveAll = function(prop, value) {
        results[prop] = value;
        if (--remaining === 0) {
          deferred.resolve(results);
        }
      };

      var rejectAll = function(error) {
        deferred.reject(error);
      };

      for (var prop in promises) {
        if (promises[prop] && typeof promises[prop].then === 'function') {
          promises[prop].then(resolver(prop), rejectAll);
        } else {
          resolveAll(prop, promises[prop]);
        }
      }

      return deferred.promise;
    }


    __exports__.hash = hash;
  });
define("rsvp/node",
  ["rsvp/promise","rsvp/all","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Promise = __dependency1__.Promise;
    var all = __dependency2__.all;

    function makeNodeCallbackFor(resolve, reject) {
      return function (error, value) {
        if (error) {
          reject(error);
        } else if (arguments.length > 2) {
          resolve(Array.prototype.slice.call(arguments, 1));
        } else {
          resolve(value);
        }
      };
    }

    function denodeify(nodeFunc) {
      return function()  {
        var nodeArgs = Array.prototype.slice.call(arguments), resolve, reject;
        var thisArg = this;

        var promise = new Promise(function(nodeResolve, nodeReject) {
          resolve = nodeResolve;
          reject = nodeReject;
        });

        all(nodeArgs).then(function(nodeArgs) {
          nodeArgs.push(makeNodeCallbackFor(resolve, reject));

          try {
            nodeFunc.apply(thisArg, nodeArgs);
          } catch(e) {
            reject(e);
          }
        });

        return promise;
      };
    }


    __exports__.denodeify = denodeify;
  });
define("rsvp/promise",
  ["rsvp/config","rsvp/events","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var config = __dependency1__.config;
    var EventTarget = __dependency2__.EventTarget;

    function objectOrFunction(x) {
      return isFunction(x) || (typeof x === "object" && x !== null);
    }

    function isFunction(x){
      return typeof x === "function";
    }

    var Promise = function(resolver) {
      var promise = this,
      resolved = false;

      if (typeof resolver !== 'function') {
        throw new TypeError('You must pass a resolver function as the sole argument to the promise constructor');
      }

      if (!(promise instanceof Promise)) {
        return new Promise(resolver);
      }

      var resolvePromise = function(value) {
        if (resolved) { return; }
        resolved = true;
        resolve(promise, value);
      };

      var rejectPromise = function(value) {
        if (resolved) { return; }
        resolved = true;
        reject(promise, value);
      };

      this.on('promise:failed', function(event) {
        this.trigger('error', { detail: event.detail });
      }, this);

      this.on('error', onerror);

      try {
        resolver(resolvePromise, rejectPromise);
      } catch(e) {
        rejectPromise(e);
      }
    };

    function onerror(event) {
      if (config.onerror) {
        config.onerror(event.detail);
      }
    }

    var invokeCallback = function(type, promise, callback, event) {
      var hasCallback = isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        try {
          value = callback(event.detail);
          succeeded = true;
        } catch(e) {
          failed = true;
          error = e;
        }
      } else {
        value = event.detail;
        succeeded = true;
      }

      if (handleThenable(promise, value)) {
        return;
      } else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (type === 'resolve') {
        resolve(promise, value);
      } else if (type === 'reject') {
        reject(promise, value);
      }
    };

    Promise.prototype = {
      constructor: Promise,

      isRejected: undefined,
      isFulfilled: undefined,
      rejectedReason: undefined,
      fulfillmentValue: undefined,

      then: function(done, fail) {
        this.off('error', onerror);

        var thenPromise = new this.constructor(function() {});

        if (this.isFulfilled) {
          config.async(function(promise) {
            invokeCallback('resolve', thenPromise, done, { detail: promise.fulfillmentValue });
          }, this);
        }

        if (this.isRejected) {
          config.async(function(promise) {
            invokeCallback('reject', thenPromise, fail, { detail: promise.rejectedReason });
          }, this);
        }

        this.on('promise:resolved', function(event) {
          invokeCallback('resolve', thenPromise, done, event);
        });

        this.on('promise:failed', function(event) {
          invokeCallback('reject', thenPromise, fail, event);
        });

        return thenPromise;
      },

      fail: function(fail) {
        return this.then(null, fail);
      }
    };

    EventTarget.mixin(Promise.prototype);

    function resolve(promise, value) {
      if (promise === value) {
        fulfill(promise, value);
      } else if (!handleThenable(promise, value)) {
        fulfill(promise, value);
      }
    }

    function handleThenable(promise, value) {
      var then = null,
      resolved;

      try {
        if (promise === value) {
          throw new TypeError("A promises callback cannot return that same promise.");
        }

        if (objectOrFunction(value)) {
          then = value.then;

          if (isFunction(then)) {
            then.call(value, function(val) {
              if (resolved) { return true; }
              resolved = true;

              if (value !== val) {
                resolve(promise, val);
              } else {
                fulfill(promise, val);
              }
            }, function(val) {
              if (resolved) { return true; }
              resolved = true;

              reject(promise, val);
            });

            return true;
          }
        }
      } catch (error) {
        reject(promise, error);
        return true;
      }

      return false;
    }

    function fulfill(promise, value) {
      config.async(function() {
        promise.trigger('promise:resolved', { detail: value });
        promise.isFulfilled = true;
        promise.fulfillmentValue = value;
      });
    }

    function reject(promise, value) {
      config.async(function() {
        promise.trigger('promise:failed', { detail: value });
        promise.isRejected = true;
        promise.rejectedReason = value;
      });
    }


    __exports__.Promise = Promise;
  });
define("rsvp/reject",
  ["rsvp/promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__.Promise;

    function reject(reason) {
      return new Promise(function (resolve, reject) {
        reject(reason);
      });
    }


    __exports__.reject = reject;
  });
define("rsvp/resolve",
  ["rsvp/promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__.Promise;

    function resolve(thenable) {
      return new Promise(function(resolve, reject) {
        resolve(thenable);
      });
    }


    __exports__.resolve = resolve;
  });
define("rsvp/rethrow",
  ["exports"],
  function(__exports__) {
    "use strict";
    var local = (typeof global === "undefined") ? this : global;

    function rethrow(reason) {
      local.setTimeout(function() {
        throw reason;
      });
      throw reason;
    }


    __exports__.rethrow = rethrow;
  });
define("rsvp",
  ["rsvp/events","rsvp/promise","rsvp/node","rsvp/all","rsvp/hash","rsvp/rethrow","rsvp/defer","rsvp/config","rsvp/resolve","rsvp/reject","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __exports__) {
    "use strict";
    var EventTarget = __dependency1__.EventTarget;
    var Promise = __dependency2__.Promise;
    var denodeify = __dependency3__.denodeify;
    var all = __dependency4__.all;
    var hash = __dependency5__.hash;
    var rethrow = __dependency6__.rethrow;
    var defer = __dependency7__.defer;
    var config = __dependency8__.config;
    var resolve = __dependency9__.resolve;
    var reject = __dependency10__.reject;

    function configure(name, value) {
      config[name] = value;
    }


    __exports__.Promise = Promise;
    __exports__.EventTarget = EventTarget;
    __exports__.all = all;
    __exports__.hash = hash;
    __exports__.rethrow = rethrow;
    __exports__.defer = defer;
    __exports__.denodeify = denodeify;
    __exports__.configure = configure;
    __exports__.resolve = resolve;
    __exports__.reject = reject;
  });
window.RSVP = requireModule("rsvp");
})(window);
var EPUBJS = EPUBJS || {}; 
EPUBJS.VERSION = "0.1.5";

EPUBJS.plugins = EPUBJS.plugins || {};

EPUBJS.filePath = EPUBJS.filePath || "/epubjs/";

(function() {

	var root = this;
	var previousEpub = root.ePub || {};
	
	var ePub = root.ePub = function() {
		var bookPath, options;

		//-- var book = ePub("path/to/book.epub", { restore: true })
		if(typeof(arguments[0]) != 'undefined' && 
			typeof arguments[0] === 'string') {

			bookPath = arguments[0];

			if( arguments[1] && typeof arguments[1] === 'object' ) {
				options = arguments[1];
				options.bookPath = bookPath;
			} else {
				options = { 'bookPath' : bookPath }
			}

		}

		/* 
		 *	var book = ePub({ bookPath: "path/to/book.epub", restore: true });
		 *	
		 *	 - OR -
		 *
		 * 	 var book = ePub({ restore: true });
		 * 	 book.open("path/to/book.epub");
		 */

		 if( arguments[0] && typeof arguments[0] === 'object' ) {
		 	options = arguments[0];
		 }
		 
		
		return new EPUBJS.Book(options);
	}

	_.extend(ePub, {
		noConflict : function() {
			root.ePub = previousEpub;
			return this;
		}
	});

	//exports to multiple environments
	if (typeof define === 'function' && define.amd)
	//AMD
	define(function(){ return ePub; });
	else if (typeof module != "undefined" && module.exports)
	//Node
	module.exports = ePub;

})();
EPUBJS.Book = function(options){
	
	var book = this;
	
	this.settings = _.defaults(options || {}, {
		bookPath : null,
		storage: false, //-- true (auto) or false (none) | override: 'ram', 'websqldatabase', 'indexeddb', 'filesystem'
		fromStorage : false,
		saved : false,
		online : true,
		contained : false,
		width : false,
		height: false,
		spreads: true,
		fixedLayout : false,
		responsive: true,
		version: 1,
		restore: false,
		reload : false,
		goto : false,
		styles : {}
	});
	
	this.settings.EPUBJSVERSION = EPUBJS.VERSION;
	
	this.spinePos = 0;
	this.stored = false;

	//-- All Book events for listening
	/*
		book:ready
		book:stored
		book:online
		book:offline
		book:pageChanged
	*/
	
	//-- All hooks to add functions (with a callback) to 
	this.hooks = {
		"beforeChapterDisplay" : []
	};
	
	//-- Get pre-registered hooks
	this.getHooks();
			
	this.online = this.settings.online || navigator.onLine;
	this.networkListeners();
		
	//-- Determine storage method
	//-- Override options: none | ram | websqldatabase | indexeddb | filesystem
	
	if(this.settings.storage != false ){
		this.storage = new fileStorage.storage(this.settings.storage);
	}
	
	
	
	this.ready = {
		manifest: new RSVP.defer(),
		spine: new RSVP.defer(),
		metadata: new RSVP.defer(),
		cover: new RSVP.defer(),
		toc: new RSVP.defer()
	};
	
	this.readyPromises = [
		this.ready.manifest.promise,
		this.ready.spine.promise,
		this.ready.metadata.promise,
		this.ready.cover.promise,
		this.ready.toc.promise
	];
	
	this.ready.all = RSVP.all(this.readyPromises);

	this.ready.all.then(this._ready);
	
	this._q = [];
	this.isRendered = false;
	this._rendering = false;
	this._displayQ = [];
	
	this.defer_opened = new RSVP.defer();
	this.opened = this.defer_opened.promise;
	// BookUrl is optional, but if present start loading process
	if(typeof this.settings.bookPath === 'string') {
		this.open(this.settings.bookPath, this.settings.reload);
	}
	 
	
	window.addEventListener("beforeunload", this.unload.bind(this), false);

	//-- Listen for these promises:
	//-- book.opened.then()
	//-- book.rendered.then()

}

//-- Check bookUrl and start parsing book Assets or load them from storage 
EPUBJS.Book.prototype.open = function(bookPath, forceReload){
	var book = this,
		saved = this.isSaved(bookPath),
		opened;
	
	this.settings.bookPath = bookPath;
	
	//-- Get a absolute URL from the book path
	this.bookUrl = this.urlFrom(bookPath);

	// console.log("saved", saved, !forceReload)
	//-- Remove the previous settings and reload
	if(saved && !forceReload){
		//-- Apply settings, keeping newer ones
		this.applySavedSettings();
	}

	if(this.settings.contained || this.isContained(bookPath)){
		
		
		this.settings.contained = this.contained = true;
		
		this.bookUrl = '';
		
		// return; //-- TODO: this need to be fixed and tested before enabling
		opened = this.unarchive(bookPath).then(function(){
			
			if(saved && book.settings.restore && !forceReload){
				return book.restore();
			}else{
				return book.unpack();
			}
			
		});
		
	}	else {
		
		if(saved && this.settings.restore && !forceReload){
			//-- Will load previous package json, or re-unpack if error
			opened = this.restore();
		
		}else{
			
			//-- Get package information from epub opf
			opened = this.unpack();
			
		}
		
	}

	//-- If there is network connection, store the books contents
	if(this.online && this.settings.storage && !this.settings.contained){
		if(!this.settings.stored) opened.then(book.storeOffline());
	}
	
	opened.then(function(){
		book.defer_opened.resolve();
	});

	return opened;

}

EPUBJS.Book.prototype.unpack = function(containerPath){
	var book = this,
		parse = new EPUBJS.Parser(),
		containerPath = containerPath || "META-INF/container.xml";

	//-- Return chain of promises
	return book.loadXml(book.bookUrl + containerPath).
			 then(function(containerXml){
				return parse.container(containerXml); // Container has path to content
			 }).
			 then(function(paths){
				book.settings.contentsPath = book.bookUrl + paths.basePath;
				book.settings.packageUrl = book.bookUrl + paths.packagePath;
				return book.loadXml(book.settings.packageUrl); // Containes manifest, spine and metadata 
			 }).
			 then(function(packageXml){
				 return parse.package(packageXml, book.settings.contentsPath); // Extract info from contents
			 }).
			 then(function(contents){

				 book.contents = contents;
				 book.manifest = book.contents.manifest;
				 book.spine = book.contents.spine;
				 book.spineIndexByURL = book.contents.spineIndexByURL;
				 book.metadata = book.contents.metadata;

				 book.cover = book.contents.cover = book.settings.contentsPath + contents.coverPath;

				 book.spineNodeIndex = book.contents.spineNodeIndex = contents.spineNodeIndex;
				
				 book.ready.manifest.resolve(book.contents.manifest);
				 book.ready.spine.resolve(book.contents.spine);
				 book.ready.metadata.resolve(book.contents.metadata);
				 book.ready.cover.resolve(book.contents.cover);

				 //-- Adjust setting based on metadata				 

				 //-- Load the TOC, optional
				 if(contents.tocPath) {

				 	 book.settings.tocUrl = book.settings.contentsPath + contents.tocPath;

				 	 book.loadXml(book.settings.tocUrl).
				 		then(function(tocXml){
								return parse.toc(tocXml); // Grab Table of Contents
					}).then(function(toc){
						book.toc = book.contents.toc = toc;
						book.ready.toc.resolve(book.contents.toc);
					 // book.saveSettings();
					});

				 }

			 }).
			 fail(function(error) {
				console.error(error);
			 });


}

EPUBJS.Book.prototype.getMetadata = function() {
	return this.ready.metadata.promise;
}

EPUBJS.Book.prototype.getToc = function() {
	return this.ready.toc.promise;
}

/* Private Helpers */

//-- Listeners for browser events
EPUBJS.Book.prototype.networkListeners = function(){
	var book = this;

	window.addEventListener("offline", function(e) {
		book.online = false;
		book.trigger("book:offline");
	}, false);

	window.addEventListener("online", function(e) {
		book.online = true;
		book.trigger("book:online");
	}, false);
	
}

//-- Choose between a request from store or a request from network
EPUBJS.Book.prototype.loadXml = function(url){
	if(this.settings.fromStorage) {
		return this.storage.getXml(url);
	} else if(this.settings.contained) {
		return this.zip.getXml(url);
	}else{
		return EPUBJS.core.request(url, 'xml');
	} 
}

//-- Turns a url into a absolute url
EPUBJS.Book.prototype.urlFrom = function(bookPath){
	var absolute = bookPath.search("://") != -1,
		fromRoot = bookPath[0] == "/",
		location = window.location,
		//-- Get URL orgin, try for native or combine 
		origin = location.origin || location.protocol + "//" + location.host,
		baseTag = document.getElementsByTagName('base'),
		base;
			
	// if(bookPath[bookPath.length - 1] != "/") bookPath += "/";
	
	//-- Check is Base tag is set

	if(baseTag.length) {
		base = baseTag[0].href;
	}
	
	//-- 1. Check if url is absolute
	if(absolute){
		return bookPath;
	}

	//-- 2. Check if url starts with /, add base url
	if(!absolute && fromRoot){
		if(base) {
			return base + bookPath;
		} else {
			return origin + bookPath;
		}
	}

	//-- 3. Or find full path to url and add that
	if(!absolute && !fromRoot){
		
		//-- go back
		if(bookPath.slice(0, 3) == "../"){
			return EPUBJS.core.resolveUrl(base || location.pathname, bookPath);
		}
		
		if(base) {
			return base + bookPath;
		} else {
			return origin + EPUBJS.core.folder(location.pathname) + bookPath;
		}
		
	}

}


EPUBJS.Book.prototype.unarchive = function(bookPath){	
	var book = this,
		unarchived;
		
	//-- Must use storage
	// if(this.settings.storage == false ){
		// this.settings.storage = true;
		// this.storage = new fileStorage.storage();
	// }
			
	this.zip = new EPUBJS.Unarchiver();
		
	return this.zip.openZip(bookPath);
}

//-- Checks if url has a .epub or .zip extension
EPUBJS.Book.prototype.isContained = function(bookUrl){
	var dot = bookUrl.lastIndexOf('.'),
		ext = bookUrl.slice(dot+1);

	if(ext && (ext == "epub" || ext == "zip")){
		return true;
	}

	return false;
}

//-- Checks if the book setting can be retrieved from localStorage
EPUBJS.Book.prototype.isSaved = function(bookPath) {
	var bookKey = bookPath + ":" + this.settings.version,
		storedSettings = localStorage.getItem(bookKey);

	if( !localStorage ||
		storedSettings === null) {
		return false;
	} else {
		return true;
	} 
}

//-- Remove save book settings
EPUBJS.Book.prototype.removeSavedSettings = function() {
	var bookKey = this.settings.bookPath + ":" + this.settings.version;
	
		localStorage.removeItem(bookKey);
		
		this.settings.stored = false; //TODO: is this needed?
}
		
EPUBJS.Book.prototype.applySavedSettings = function() {
		var bookKey = this.settings.bookPath + ":" + this.settings.version;
			stored = JSON.parse(localStorage.getItem(bookKey));

		if(EPUBJS.VERSION != stored.EPUBJSVERSION) return false;
		this.settings = _.defaults(this.settings, stored); 
}

EPUBJS.Book.prototype.saveSettings = function(){
	var bookKey = this.settings.bookPath + ":" + this.settings.version;
	
	if(this.render) {
		this.settings.previousLocationCfi = this.render.currentLocationCfi;
	}
		
	localStorage.setItem(bookKey, JSON.stringify(this.settings));

}

EPUBJS.Book.prototype.saveContents = function(){
	var contentsKey = this.settings.bookPath + ":contents:" + this.settings.version;

	localStorage.setItem(contentsKey, JSON.stringify(this.contents));

}

EPUBJS.Book.prototype.removeSavedContents = function() {
	var bookKey = this.settings.bookPath + ":contents:" + this.settings.version;
	
	localStorage.removeItem(bookKey);
}


// EPUBJS.Book.prototype.chapterTitle = function(){
// 	return this.spine[this.spinePos].id; //-- TODO: clarify that this is returning title
// }

//-- Takes a string or a element
EPUBJS.Book.prototype.renderTo = function(elem){
	var book = this,
		rendered;
	
	if(_.isElement(elem)) {
		this.element = elem;
	} else if (typeof elem == "string") { 
		this.element = EPUBJS.core.getEl(elem);
	} else {
		console.error("Not an Element");
		return;
	}
	
	rendered = this.opened.
				then(function(){
					book.render = new EPUBJS.Renderer(book);
					book._rendered();				
					return book.startDisplay();
				}, function(error) { console.error(error) });

	rendered.then(null, function(error) { console.error(error) });

	return rendered;
}

EPUBJS.Book.prototype.startDisplay = function(){
	var display;
	
	if( this.settings.restore && this.settings.goto) {
		
		display = this.goto(this.settings.goto);

	}else if( this.settings.restore && this.settings.previousLocationCfi) {
		
		display = this.displayChapter(this.settings.previousLocationCfi);
		
	}else{
		
		display = this.displayChapter(this.spinePos);
	
	}
	
	return display;
}

EPUBJS.Book.prototype.restore = function(reject){
	
	var book = this,
		contentsKey = this.settings.bookPath + ":contents:" + this.settings.version,
		deferred = new RSVP.defer(),
		fetch = ['manifest', 'spine', 'metadata', 'cover', 'toc', 'spineNodeIndex', 'spineIndexByURL'],
		reject = reject || false,
		fromStore = localStorage.getItem(contentsKey);
	
	if(this.settings.clearSaved) reject = true;

	if(!reject && fromStore != 'undefined' && fromStore != 'null'){
		this.contents = JSON.parse(fromStore);
		fetch.forEach(function(item){
			book[item] = book.contents[item];
			if(!book[item]) {
				reject = true;
			}
		});
	}
	
	if(reject || !fromStore || !this.contents || !this.settings.contentsPath){
		// this.removeSavedSettings();
		return this.open(this.settings.bookPath, true);
		
	}else{
		this.ready.manifest.resolve(this.manifest);
		this.ready.spine.resolve(this.spine);
		this.ready.metadata.resolve(this.metadata);
		this.ready.cover.resolve(this.cover);
		this.ready.toc.resolve(this.toc);
		deferred.resolve();
		return deferred.promise;
	}
	

}



EPUBJS.Book.prototype.displayChapter = function(chap, end){
	var book = this,
		render,
		cfi,
		pos;
	
	if(!this.isRendered) return this._enqueue("displayChapter", arguments);
	
	if(this._rendering) {
		this._displayQ.push(arguments);
		return;
	}

	if(_.isNumber(chap)){
		pos = chap;
	}else{
		cfi = new EPUBJS.EpubCFI(chap);
		pos = cfi.spinePos;
	}
	
	if(pos < 0 || pos >= this.spine.length){
		console.error("Not A Valid Chapter");
		return false;
	}
	
	//-- Set the book's spine position
	this.spinePos = pos;


	
	//-- Create a new chapter	
	this.chapter = new EPUBJS.Chapter(this.spine[pos]);
	
	this._rendering = true;
	
	render = book.render.chapter(this.chapter);
	
	if(cfi) {
		render.then(function(chapter){
			chapter.currentLocationCfi = chap;
			chapter.gotoCfiFragment(cfi);
		});
	} else if(end) {
		render.then(function(chapter){
			chapter.gotoChapterEnd();
		})
	}

	
	if(!this.settings.fromStorage && 
		 !this.settings.contained) {
		render.then(function(){
			book.preloadNextChapter();
		});
	}
	
	//-- Clear render queue
	render.then(function(){
		var inwait;
		
		book._rendering = false;
		if(book._displayQ.length) {
			inwait = book._displayQ.unshift();
			book.displayChapter.apply(book, inwait);
		}
		
	});
	return render;
}

EPUBJS.Book.prototype.nextPage = function(){
	var next;

	if(!this.isRendered) return this._enqueue("nextPage", arguments);
	
	next = this.render.nextPage();

	if(!next){
		return this.nextChapter();
	}
}

EPUBJS.Book.prototype.prevPage = function() {
	var prev;

	if(!this.isRendered) return this._enqueue("prevPage", arguments);

	prev = this.render.prevPage();
	
	if(!prev){
		return this.prevChapter();
	}
}

EPUBJS.Book.prototype.nextChapter = function() {
	this.spinePos++;
	if(this.spinePos > this.spine.length) return;
	
	return this.displayChapter(this.spinePos);
}

EPUBJS.Book.prototype.prevChapter = function() {
	this.spinePos--;
	if(this.spinePos < 0) return;
	
	return this.displayChapter(this.spinePos, true);
}

EPUBJS.Book.prototype.gotoCfi = function(cfi){
	if(!this.isRendered) return this._enqueue("gotoCfi", arguments);
	return this.displayChapter(cfi)
}

EPUBJS.Book.prototype.goto = function(url){
	var split, chapter, section, absoluteURL, spinePos;
	var deferred = new RSVP.defer();
	if(!this.isRendered) return this._enqueue("goto", arguments);
	
	split = url.split("#"),
	chapter = split[0],
	section = split[1] || false,
	absoluteURL = (chapter.search("://") == -1) ? this.settings.contentsPath + chapter : chapter,
	spinePos = this.spineIndexByURL[absoluteURL];

	//-- If link fragment only stay on current chapter
	if(!chapter){
		spinePos = this.chapter ? this.chapter.spinePos : 0;
	}

	//-- Check that URL is present in the index, or stop
	if(typeof(spinePos) != "number") return false;
	
	if(!this.chapter || spinePos != this.chapter.spinePos){
		//-- Load new chapter if different than current
		return this.displayChapter(spinePos).then(function(){
			if(section) this.render.section(section);
		}.bind(this));
	}else{
		//-- Only goto section
		if(section) this.render.section(section);
		deferred.resolve(this.currentChapter);
		return deferred.promise;
	}
}



EPUBJS.Book.prototype.preloadNextChapter = function() {
	var temp = document.createElement('iframe');
		next; 
	
		if(this.spinePos >= this.spine.length){
			return false;
		}
		
	next = new EPUBJS.Chapter(this.spine[this.spinePos + 1]);
	
	EPUBJS.core.request(next.href);
}


EPUBJS.Book.prototype.storeOffline = function() {
	var book = this,
		assets = _.values(this.manifest);
	
	//-- Creates a queue of all items to load
	return EPUBJS.storage.batch(assets).
			then(function(){
				book.settings.stored = true;
				book.trigger("book:stored");
			});
}

EPUBJS.Book.prototype.availableOffline = function() {
	return this.settings.stored > 0 ? true : false;
}

/*
EPUBJS.Book.prototype.fromStorage = function(stored) {
	
	if(this.contained) return;
	
	if(!stored){
		this.online = true;
		this.tell("book:online");
	}else{
		if(!this.availableOffline){
			//-- If book hasn't been cached yet, store offline
			this.storeOffline(function(){
				this.online = false;
				this.tell("book:offline");
			}.bind(this));
			
		}else{
			this.online = false;
			this.tell("book:offline");
		}
	}
	
}
*/

EPUBJS.Book.prototype.setStyle = function(style, val, prefixed) {
	this.settings.styles[style] = val;

	if(this.render) this.render.setStyle(style, val, prefixed);
}

EPUBJS.Book.prototype.removeStyle = function(style) {
	if(this.render) this.render.removeStyle(style);

	delete this.settings.styles[style];
}

EPUBJS.Book.prototype.unload = function(){
	
	if(this.settings.restore) {
			this.saveSettings();
		this.saveContents();
	}

	this.trigger("book:unload");
}

EPUBJS.Book.prototype.destroy = function() {

	window.removeEventListener("beforeunload", this.unload);

	if(this.currentChapter) this.currentChapter.unload();

	this.unload();

	if(this.render) this.render.remove();

}	

EPUBJS.Book.prototype._enqueue = function(command, arguments) {
	
	this._q.push({
		'command': command,
		'arguments': arguments
	});

}

EPUBJS.Book.prototype._ready = function(err) {
	var book = this;

	this.trigger("book:ready");
	
}

EPUBJS.Book.prototype._rendered = function(err) {
	var book = this;

	this.isRendered = true;
	this.trigger("book:rendered");

	this._q.forEach(function(item){
		book[item.command].apply(book, item.arguments);
	});

}

//-- Get pre-registered hooks
EPUBJS.Book.prototype.getHooks = function(){
	var book = this,
		plugs;
	
	plugTypes = _.values(this.hooks);

	for (plugType in this.hooks) {
		plugs = _.values(EPUBJS.Hooks[plugType]);

		plugs.forEach(function(hook){
			book.registerHook(plugType, hook);
		});
	}
}

//-- Hooks allow for injecting async functions that must all complete before continuing 
//	 Functions must have a callback as their first argument.
EPUBJS.Book.prototype.registerHook = function(type, toAdd, toFront){
	var book = this;
	
	if(typeof(this.hooks[type]) != "undefined"){
		
		if(typeof(toAdd) === "function"){
			if(toFront) {
				this.hooks[type].unshift(toAdd);
			}else{
				this.hooks[type].push(toAdd);
			}
		}else if(Array.isArray(toAdd)){
			toAdd.forEach(function(hook){
				if(toFront) {
					book.hooks[type].unshift(hook);
				}else{
					book.hooks[type].push(hook);
				}
			});
		}
	}else{
		//-- Allows for undefined hooks, but maybe this should error?
		this.hooks[type] = [func];
	}
}

EPUBJS.Book.prototype.triggerHooks = function(type, callback, passed){
	var hooks, count;

	if(typeof(this.hooks[type]) == "undefined") return false;

	hooks = this.hooks[type];
	
	count = hooks.length;
	function countdown(){
		count--;
		if(count <= 0 && callback) callback();
	}

	hooks.forEach(function(hook){
		hook(countdown, passed);
	});
}

//-- Enable binding events to book
RSVP.EventTarget.mixin(EPUBJS.Book.prototype);

EPUBJS.Chapter = function(spineObject){
	this.href = spineObject.href;
	this.id = spineObject.id;
	this.spinePos = spineObject.index;
	this.properties = spineObject.properties;
	this.linear = spineObject.linear;
	this.pages = 1;
}


EPUBJS.Chapter.prototype.contents = function(store){	
	// if(this.store && (!this.book.online || this.book.contained))
	if(store){
		return store.get(href);
	}else{
		return EPUBJS.core.request(href, 'xml');
	}

}

EPUBJS.Chapter.prototype.url = function(store){
	var deferred = new RSVP.defer();

	if(store){
		if(!this.tempUrl) {
			this.tempUrl = store.getUrl(this.href);
		}
		return this.tempUrl;
	}else{
		deferred.resolve(this.href); //-- this is less than ideal but keeps it a promise
		return deferred.promise;
	}

}

EPUBJS.Chapter.prototype.setPages = function(num){
	this.pages = num;
}

EPUBJS.Chapter.prototype.getPages = function(num){
	return this.pages;
}

EPUBJS.Chapter.prototype.getID = function(){
	return this.ID;
}

EPUBJS.Chapter.prototype.unload = function(store){
	
	if(this.tempUrl && store) {
		store.revokeUrl(this.tempUrl);
		this.tempUrl = false;
	}
}
var EPUBJS = EPUBJS || {}; 
EPUBJS.core = {}

//-- Get a element for an id
EPUBJS.core.getEl = function(elem) {
	return document.getElementById(elem);
}

//-- Get all elements for a class
EPUBJS.core.getEls = function(classes) {
	return document.getElementsByClassName(classes);
}


EPUBJS.core.request = function(url, type) {
	var supportsURL = window.URL;
	var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";

	var deferred = new RSVP.defer();
	
	var xhr = new XMLHttpRequest();
	
	//-- Check from PDF.js: 
	//	   https://github.com/mozilla/pdf.js/blob/master/web/compatibility.js
	var xhrPrototype = XMLHttpRequest.prototype;
	
	if (!('overrideMimeType' in xhrPrototype)) {
		// IE10 might have response, but not overrideMimeType
		Object.defineProperty(xhrPrototype, 'overrideMimeType', {
			value: function xmlHttpRequestOverrideMimeType(mimeType) {}
		});
	}
	
	xhr.open("GET", url);
	xhr.onreadystatechange = handler;
	
	if(type == 'blob'){
		xhr.responseType = BLOB_RESPONSE;
	}
	
	if(type == "json") {
		xhr.setRequestHeader("Accept", "application/json");
	}
	
	if(type == 'xml') {
		xhr.overrideMimeType('text/xml');
	}
	
	xhr.send();
	
	function handler() {
		if (this.readyState === this.DONE) {
		if (this.status === 200 || this.responseXML ) { //-- Firefox is reporting 0 for blob urls
			var r;
			
			if(type == 'xml'){
				r = this.responseXML;
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
		}
		else { deferred.reject(this); }
		}
	};
	

	return deferred.promise;
};

// EPUBJS.core.loadXML = function(url, callback){
// 	var xhr = new XMLHttpRequest();
// 	xhr.open('GET', url, true);
// 	xhr.overrideMimeType('text/xml');
// 
// 	xhr.onload = function(e) {
// 		if (this.status == 200) {
// 			callback(this.responseXML);
// 		}
// 	};
// 
// 	xhr.send();
// }

// EPUBJS.core.loadFile = function(url){
// 	var xhr = new XMLHttpRequest(),
// 		succeeded,
// 		failed;
// 
// 	function _loaded(response){
// 		console.log("response")
// 	}
// 	
// 	function _error(err){
// 		console.log("Error:", err);
// 	}
// 	
// 	function start(){
// 		//xhr.open('GET', url, true);
// 		//xhr.responseType = 'blob';
// 		
// 		xhr.onload = function(e) {
// 			if (this.status == 200) {
// 				succeeded(this.response);
// 			}
// 		};
// 		
// 		xhr.onerror = function(e) {
// 			_error(this.status); //-- TODO: better error message
// 		};
// 		
// 		//xhr.send();
// 		console.log(succeeded)
// 	}
// 	
// 	return {
// 		"start": start,
// 		"loaded" : succeeded,
// 		"error" : failed
// 	}
// }
// 
// EPUBJS.core.loadFile = function(url, callback){
// 	var xhr = new XMLHttpRequest();
// 	
// 	this.succeeded = function(response){
// 		if(callback){
// 			callback(response);
// 		}
// 	}
// 
// 	this.failed = function(err){
// 		console.log("Error:", err);
// 	}
// 
// 	this.start = function(){
// 		var that = this;
// 		
// 		xhr.open('GET', url, true);
// 		xhr.responseType = 'blob';
// 
// 		xhr.onload = function(e) {
// 			if (this.status == 200) {
// 				that.succeeded(this.response);
// 			}
// 		};
// 
// 		xhr.onerror = function(e) {
// 			that.failed(this.status); //-- TODO: better error message
// 		};
// 
// 		xhr.send();
// 	}
// 
// 	return {
// 		"start": this.start,
// 		"succeeded" : this.succeeded,
// 		"failed" : this.failed
// 	}
// }



EPUBJS.core.toArray = function(obj) {
	var arr = [];

	for (member in obj) {
	var newitm;
	if ( obj.hasOwnProperty(member) ) {
		newitm = obj[member];
		newitm.ident = member;
		arr.push(newitm);
	}
	}

	return arr;
};

//-- Parse out the folder
EPUBJS.core.folder = function(url){
	
	var slash = url.lastIndexOf('/'),
			folder = url.slice(0, slash + 1);

	if(slash == -1) folder = '';

	return folder;

};

//-- https://github.com/ebidel/filer.js/blob/master/src/filer.js#L128
EPUBJS.core.dataURLToBlob = function(dataURL) {
	var BASE64_MARKER = ';base64,';
	if (dataURL.indexOf(BASE64_MARKER) == -1) {
		var parts = dataURL.split(',');
		var contentType = parts[0].split(':')[1];
		var raw = parts[1];

		return new Blob([raw], {type: contentType});
	}

	var parts = dataURL.split(BASE64_MARKER);
	var contentType = parts[0].split(':')[1];
	var raw = window.atob(parts[1]);
	var rawLength = raw.length;

	var uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], {type: contentType});
 }
 
//-- Load scripts async: http://stackoverflow.com/questions/7718935/load-scripts-asynchronously 
EPUBJS.core.addScript = function(src, callback, target) {
	 var s, r;
	 r = false;
	 s = document.createElement('script');
	 s.type = 'text/javascript';
	 s.async = false;
	 s.src = src;
	 s.onload = s.onreadystatechange = function() {
		if ( !r && (!this.readyState || this.readyState == 'complete') ) {
			r = true;
			if(callback) callback();
		}
	 };
	 target = target || document.body;
	 target.appendChild(s);
 }
 
 EPUBJS.core.addScripts = function(srcArr, callback, target) {
	var total = srcArr.length,
		curr = 0,
		cb = function(){
			curr++;
			if(total == curr){
				if(callback) callback();
			}else{
				EPUBJS.core.addScript(srcArr[curr], cb, target);
			}
		};
		

		EPUBJS.core.addScript(srcArr[curr], cb, target);
		
 }
 
 EPUBJS.core.addCss = function(src, callback, target) {
		var s, r;
		r = false;
		s = document.createElement('link');
		s.type = 'text/css';
		s.rel = "stylesheet";
		s.href = src;
		s.onload = s.onreadystatechange = function() {
			if ( !r && (!this.readyState || this.readyState == 'complete') ) {
				r = true;
				if(callback) callback();
			}
		};
		target = target || document.body;
		target.appendChild(s);
	}
	
 EPUBJS.core.prefixed = function(unprefixed) {
 	var vendors = ["Webkit", "Moz", "O", "ms" ],
 		prefixes = ['-Webkit-', '-moz-', '-o-', '-ms-'],
 		upper = unprefixed[0].toUpperCase() + unprefixed.slice(1),
 		length = vendors.length,
 		i = 0;

 	if (typeof(document.body.style[unprefixed]) != 'undefined') {
 		return unprefixed;
 	}
 
 	for ( ; i < length; i++ ) {
 		if (typeof(document.body.style[vendors[i] + upper]) != 'undefined') {
 			return vendors[i] + upper;
 		}		
 	}

 	return unprefixed;
 
 
 }
 
 EPUBJS.core.resolveUrl = function(base, path) {
	var url,
			segments = [],
			folders = base.split("/"),
			paths;
			
	folders.pop();
	 
	paths = path.split("/");
	paths.forEach(function(p){
		if(p === ".."){
			folders.pop();
		}else{
			segments.push(p);
		}
	});
	 
	url = folders.concat(segments);
	 
	return url.join("/");
 }

EPUBJS.EpubCFI = function(cfiStr){
	if(cfiStr) return this.parse(cfiStr);
}

EPUBJS.EpubCFI.prototype.generateChapter = function(spineNodeIndex, pos, id) {
	
	var pos = parseInt(pos),
		spineNodeIndex = spineNodeIndex + 1,	
		cfi = '/'+spineNodeIndex+'/';

	cfi += (pos + 1) * 2;

	if(id) cfi += "[" + id + "]";

	cfi += "!";


	return cfi;
}


EPUBJS.EpubCFI.prototype.generateFragment = function(element, chapter) {
	var path = this.pathTo(element),
		parts = [];

	if(chapter) parts.push(chapter);

	path.forEach(function(part){
		var segment = '';
		segment += (part.index + 1) * 2;

		if(part.id && 
			 part.id.slice(0, 6) != "EPUBJS") { //-- ignore internal @EPUBJS ids
			
			segment += "[" + part.id + "]";
			 
		}
		
		parts.push(segment);
	});

	return parts.join('/');
}

EPUBJS.EpubCFI.prototype.pathTo = function(node) {
	var stack = [],
		children;

	while(node && node.parentNode !== null) {
		children = node.parentNode.children;

		stack.unshift({
			'id' : node.id,
			// 'classList' : node.classList,
			'tagName' : node.tagName,
			'index' : children ? Array.prototype.indexOf.call(children, node) : 0
		});


		node = node.parentNode;
	}

	return stack;
}

EPUBJS.EpubCFI.prototype.getChapter = function(cfiStr) {

	var splitStr = cfiStr.split("!");

	return splitStr[0];
}

EPUBJS.EpubCFI.prototype.getFragment = function(cfiStr) {

	var splitStr = cfiStr.split("!");

	return splitStr[1];
}

EPUBJS.EpubCFI.prototype.getOffset = function(cfiStr) {

	var splitStr = cfiStr.split(":");

	return [splitStr[0], splitStr[1]];
}


EPUBJS.EpubCFI.prototype.parse = function(cfiStr) {
	var cfi = {},
		chapId,
		path,
		end,
		text;

	cfi.chapter = this.getChapter(cfiStr);
	
	cfi.fragment = this.getFragment(cfiStr);

	cfi.spinePos = (parseInt(cfi.chapter.split("/")[2]) / 2 - 1 ) || 0;
	
	chapId = cfi.chapter.match(/\[(.*)\]/);

	cfi.spineId = chapId ? chapId[1] : false;

	path = cfi.fragment.split('/');
	end = path[path.length-1];
	cfi.sections = [];
	
	//-- Check for Character Offset
	if(parseInt(end) % 2){
		text = this.getOffset();
		cfi.text = parseInt(text[0]);
		cfi.character = parseInt(text[1]);
		path.pop(); //-- remove from path to element
	}
	
	path.forEach(function(part){
		var index, has_id, id;
		
		if(!part) return;
		
		index = parseInt(part) / 2 - 1;
		has_id = part.match(/\[(.*)\]/);
			

		if(has_id && has_id[1]){
			id = has_id[1];
		}
		
		cfi.sections.push({
			'index' : index,
			'id' : id || false
		});
		
	});
	
	return cfi;
}


EPUBJS.EpubCFI.prototype.getElement = function(cfi, doc) {
	var	doc = doc || document,
		sections = cfi.sections,
		element = doc.getElementsByTagName('html')[0],
		children = Array.prototype.slice.call(element.children),
		num, index, part,
		has_id, id;
	
	sections.shift() //-- html
	
	while(sections.length > 0) {
	
		part = sections.shift();

		if(part.id){

			element = doc.getElementById(part.id);

		}else{
	
			element = children[part.index];
	
			if(!children) console.error("No Kids", element);
	
		}
	
	
		if(!element) console.error("No Element For", part);
		children = Array.prototype.slice.call(element.children);
	}
	
	return element;
}


//-- Todo: function to remove IDs to sort

EPUBJS.Events = function(obj, el){
	
	this.events = {};
	
	if(!el){
		this.el = document.createElement('div');
	}else{
		this.el = el;
	}
	
	obj.createEvent = this.createEvent;
	obj.tell = this.tell;
	obj.listen = this.listen;
	obj.deafen = this.deafen;
	obj.listenUntil = this.listenUntil;
	
	return this;
}

EPUBJS.Events.prototype.createEvent = function(evt){
	var e = new CustomEvent(evt);
	this.events[evt] = e;
	return e;
}

EPUBJS.Events.prototype.tell = function(evt, msg){
	var e;

	if(!this.events[evt]){
		console.warn("No event:", evt, "defined yet, creating.");
		e = this.createEvent(evt)
	}else{
		e = this.events[evt];
	}

	if(msg) e.msg = msg;
	this.el.dispatchEvent(e);

}

EPUBJS.Events.prototype.listen = function(evt, func, bindto){
	if(!this.events[evt]){
		console.warn("No event:", evt, "defined yet, creating.");
		this.createEvent(evt);
		return;
	}

	if(bindto){
		this.el.addEventListener(evt, func.bind(bindto), false);
	}else{
		this.el.addEventListener(evt, func, false);
	}

}

EPUBJS.Events.prototype.deafen = function(evt, func){
	this.el.removeEventListener(evt, func, false);
}

EPUBJS.Events.prototype.listenUntil = function(OnEvt, OffEvt, func, bindto){
	this.listen(OnEvt, func, bindto);
	
	function unlisten(){
		this.deafen(OnEvt, func);
		this.deafen(OffEvt, unlisten);
	}
	
	this.listen(OffEvt, unlisten, this);
}
EPUBJS.Hooks = (function(){

	"use strict";
	return {
	register: function(name) {
		if(this[name] === undefined) { this[name] = {}; }
		if(typeof this[name] !== 'object') { throw "Already registered: "+name; }
		return this[name];
	}
	};
})();
EPUBJS.Parser = function(baseUrl){
	this.baseUrl = baseUrl || '';
}

EPUBJS.Parser.prototype.container = function(containerXml){

		//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
		var rootfile = containerXml.querySelector("rootfile"),
			fullpath = rootfile.getAttribute('full-path'),
			folder = EPUBJS.core.folder(fullpath);

		//-- Now that we have the path we can parse the contents
		return {
			'packagePath' : fullpath,
			'basePath' : folder
		};
}

EPUBJS.Parser.prototype.package = function(packageXml, baseUrl){
	var parse = this;

	if(baseUrl) this.baseUrl = baseUrl;
	
	var metadataNode = packageXml.querySelector("metadata"),
		manifestNode = packageXml.querySelector("manifest"),
		spineNode = packageXml.querySelector("spine");

	var manifest = parse.manifest(manifestNode),
		tocPath = parse.findTocPath(manifestNode),
		coverPath = parse.findCoverPath(manifestNode);

	var spineNodeIndex = Array.prototype.indexOf.call(spineNode.parentNode.childNodes, spineNode);
	
	var spine = parse.spine(spineNode, manifest);
	
	var spineIndexByURL = {};
	spine.forEach(function(item){
		spineIndexByURL[item.href] = item.index;
	});

	return {
		'metadata' : parse.metadata(metadataNode),
		'spine'    : spine,
		'manifest' : manifest,
		'tocPath'  : tocPath,
		'coverPath': coverPath,
		'spineNodeIndex' : spineNodeIndex,
		'spineIndexByURL': spineIndexByURL
	};
}

//-- Find TOC NCX: media-type="application/x-dtbncx+xml" href="toc.ncx"
EPUBJS.Parser.prototype.findTocPath = function(manifestNode){
	var node = manifestNode.querySelector("item[media-type='application/x-dtbncx+xml']");
	return node ? node.getAttribute('href') : false;
}

//-- Find Cover: <item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />
EPUBJS.Parser.prototype.findCoverPath = function(manifestNode){
	var node = manifestNode.querySelector("item[properties='cover-image']");
	return node ? node.getAttribute('href') : false;
}


//-- Expanded to match Readium web components
EPUBJS.Parser.prototype.metadata = function(xml){
	var metadata = {},
		p = this;
	
	
	metadata.bookTitle = p.getElementText(xml, 'title');
	metadata.creator = p.getElementText(xml, 'creator'); 
	metadata.description = p.getElementText(xml, 'description');
	
	metadata.pubdate = p.getElementText(xml, 'date');
	
	metadata.publisher = p.getElementText(xml, 'publisher');
	
	metadata.identifier = p.getElementText(xml, "identifier");
	metadata.language = p.getElementText(xml, "language"); 
	metadata.rights = p.getElementText(xml, "rights"); 
	
	
	metadata.modified_date = p.querySelectorText(xml, "meta[property='dcterms:modified']");
	metadata.layout = p.querySelectorText(xml, "meta[property='rendition:orientation']");
	metadata.orientation = p.querySelectorText(xml, "meta[property='rendition:orientation']");
	metadata.spread = p.querySelectorText(xml, "meta[property='rendition:spread']");
	// metadata.page_prog_dir = packageXml.querySelector("spine").getAttribute("page-progression-direction");
	
	return metadata;
}

EPUBJS.Parser.prototype.getElementText = function(xml, tag){
	var found = xml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", tag),
		el;

	if(!found || found.length == 0) return '';
	
	el = found[0]; 

	if(el.childNodes.length){
		return el.childNodes[0].nodeValue;
	}

	return '';
	
}

EPUBJS.Parser.prototype.querySelectorText = function(xml, q){
	var el = xml.querySelector(q);

	if(el && el.childNodes.length){
		return el.childNodes[0].nodeValue;
	}

	return '';
}


EPUBJS.Parser.prototype.manifest = function(manifestXml){
	var baseUrl = this.baseUrl,
		manifest = {};
	
	//-- Turn items into an array
	var selected = manifestXml.querySelectorAll("item"),
		items = Array.prototype.slice.call(selected);
		
	//-- Create an object with the id as key
	items.forEach(function(item){
		var id = item.getAttribute('id'),
			href = item.getAttribute('href') || '',
			type = item.getAttribute('media-type') || '';
		
		manifest[id] = {
			'href' : baseUrl + href, //-- Absolute URL for loading with a web worker
			'type' : type
		};
	
	});
	
	return manifest;

}

EPUBJS.Parser.prototype.spine = function(spineXml, manifest){
	var spine = [];
	
	var selected = spineXml.getElementsByTagName("itemref"),
		items = Array.prototype.slice.call(selected);
	
	//-- Add to array to mantain ordering and cross reference with manifest
	items.forEach(function(item, index){
		var Id = item.getAttribute('idref');
		
		var vert = {
			'id' : Id,
			'linear' : item.getAttribute('linear') || '',
			'properties' : item.getAttribute('properties') || '',
			'href' : manifest[Id].href,
			'index' : index
		}
		
	
		spine.push(vert);
	});
	
	return spine;
}

EPUBJS.Parser.prototype.toc = function(tocXml){
	
	var navMap = tocXml.querySelector("navMap");

	function getTOC(parent){
		var list = [],
			items = [],
			nodes = parent.childNodes,
			nodesArray = Array.prototype.slice.call(nodes),
			length = nodesArray.length,
			iter = length,
			node;
		

		if(length == 0) return false;

		while(iter--){
			node = nodesArray[iter];
				if(node.nodeName === "navPoint") {
					items.push(node);
				}
		}
		
		items.forEach(function(item){
			var id = item.getAttribute('id'),
				content = item.querySelector("content"),
				src = content.getAttribute('src'),
				split = src.split("#"),
				navLabel = item.querySelector("navLabel"),
				text = navLabel.textContent ? navLabel.textContent : "",
				subitems = getTOC(item);
			list.unshift({
						"id": id, 
						"href": src, 
						"label": text,
						"subitems" : subitems,
						"parent" : parent ? parent.getAttribute('id') : null
			});

		});

		return list;
	}
	
	return getTOC(navMap);


}


EPUBJS.Renderer = function(book) {
	this.el = book.element;
	this.book = book;
	
	// this.settings = book.settings;
	this.caches = {};
	
	this.crossBrowserColumnCss();
	
	this.epubcfi = new EPUBJS.EpubCFI();
		
	this.initialize();
	this.listeners();

	//-- Renderer events for listening
	/*
		renderer:resized
		renderer:chapterDisplayed
		renderer:chapterUnloaded
	*/
}

//-- Build up any html needed
EPUBJS.Renderer.prototype.initialize = function(){
	this.iframe = document.createElement('iframe');
	//this.iframe.id = "epubjs-iframe";
	this.iframe.scrolling = "no";
	
	if(this.book.settings.width || this.book.settings.height){
		this.resizeIframe(this.book.settings.width || this.el.clientWidth, this.book.settings.height || this.el.clientHeight);
	} else {
		// this.resizeIframe(false, this.el.clientWidth, this.el.clientHeight);
		this.resizeIframe('100%', '100%');

		// this.on("renderer:resized", this.resizeIframe, this);
	}
	

	this.el.appendChild(this.iframe);
}

//-- Listeners for browser events
EPUBJS.Renderer.prototype.listeners = function(){
	
	this.resized = _.throttle(this.onResized.bind(this), 10);
	
	// window.addEventListener("hashchange", book.route.bind(this), false);

	this.book.registerHook("beforeChapterDisplay", this.replaceLinks.bind(this), true);

	if(this.determineStore()) {

		this.book.registerHook("beforeChapterDisplay", [
			EPUBJS.replace.head,
			EPUBJS.replace.resources,
			EPUBJS.replace.svg
		], true);

	}

}

EPUBJS.Renderer.prototype.chapter = function(chapter){
	var renderer = this,
		store = false;
		
	if(this.book.settings.contained) store = this.book.zip;
	// if(this.settings.stored) store = this.storage;
	
	if(this.currentChapter) {
		this.currentChapter.unload();

		this.trigger("renderer:chapterUnloaded");
		this.book.trigger("renderer:chapterUnloaded");
	}
	
	this.currentChapter = chapter;
	this.chapterPos = 1;
	this.pageIds = {};
	this.leftPos = 0;
	
	this.currentChapterCfi = this.epubcfi.generateChapter(this.book.spineNodeIndex, chapter.spinePos, chapter.id);
	this.visibileEl = false;

	return chapter.url(store).
		then(function(url) {
			return renderer.setIframeSrc(url);
		});
	
}

/*

EPUBJS.Renderer.prototype.route = function(hash, callback){
	var location = window.location.hash.replace('#/', '');
	if(this.useHash && location.length && location != this.prevLocation){
		this.show(location, callback);
		this.prevLocation = location;
		return true;
	}
	return false;
}

EPUBJS.Renderer.prototype.hideHashChanges = function(){
	this.useHash = false;
}

*/

EPUBJS.Renderer.prototype.onResized = function(e){
	
	var msg = {
		width: this.iframe.clientWidth,
		height: this.iframe.clientHeight
	};
	
	if(this.doc){
		this.reformat();
	}

	this.trigger("renderer:resized", msg);
	this.book.trigger("book:resized", msg);
	
	
	
}

EPUBJS.Renderer.prototype.reformat = function(){
	var renderer = this;
	
	//-- reformat	
	if(renderer.book.settings.fixedLayout) {
		renderer.fixedLayout();
	} else {
		renderer.formatSpread();
	}
	
	setTimeout(function(){
		
		//-- re-calc number of pages
		renderer.calcPages();
		
		
		//-- Go to current page after resize
		if(renderer.currentLocationCfi){
			renderer.gotoCfiFragment(renderer.currentLocationCfi);	
		}
		
	}, 10);
	
	
}

EPUBJS.Renderer.prototype.resizeIframe = function(width, height){

	this.iframe.height = height;

	if(!isNaN(width) && width % 2 != 0){
		width += 1; //-- Prevent cutting off edges of text in columns
	}

	this.iframe.width = width;
	
	this.onResized();
	
}


EPUBJS.Renderer.prototype.crossBrowserColumnCss = function(){
	
	
	EPUBJS.Renderer.columnAxis	=	EPUBJS.core.prefixed('columnAxis');
	EPUBJS.Renderer.columnGap	 =	EPUBJS.core.prefixed('columnGap');
	EPUBJS.Renderer.columnWidth =	EPUBJS.core.prefixed('columnWidth');
	EPUBJS.Renderer.transform	 =	EPUBJS.core.prefixed('transform');

}


EPUBJS.Renderer.prototype.setIframeSrc = function(url){
	var renderer = this,
		deferred = new RSVP.defer();

	this.visible(false);

	this.iframe.src = url;

	this.iframe.onload = function() {
		renderer.doc = renderer.iframe.contentDocument;
		renderer.docEl = renderer.doc.documentElement;
		renderer.bodyEl = renderer.doc.body;

		renderer.applyStyles();
		
		if(renderer.book.settings.fixedLayout) {
			renderer.fixedLayout();
		} else {
			renderer.formatSpread();
		}
		

		//-- Trigger registered hooks before displaying
		renderer.beforeDisplay(function(){
			var msg = renderer.currentChapter;
			
			renderer.calcPages();
			
			deferred.resolve(renderer);

			msg.cfi = renderer.currentLocationCfi = renderer.getPageCfi();
			
			renderer.trigger("renderer:chapterDisplayed", msg);
			renderer.book.trigger("renderer:chapterDisplayed", msg);

			renderer.visible(true);

		});
		
		renderer.iframe.contentWindow.addEventListener("resize", renderer.resized, false);
		
		// that.afterLoaded(that);

		
		
	}
	

	
	return deferred.promise;
}


EPUBJS.Renderer.prototype.formatSpread = function(){

	var divisor = 2,
		cutoff = 800;

	// if(this.colWidth){
	//	 this.OldcolWidth = this.colWidth;
	//	 this.OldspreadWidth = this.spreadWidth;
	// }

	//-- Check the width and decied on columns
	//-- Todo: a better place for this?
	this.elWidth = this.iframe.clientWidth;
	if(this.elWidth % 2 != 0){
		this.elWidth -= 1;
	}
	
	// this.gap = this.gap || Math.ceil(this.elWidth / 8);
	this.gap = Math.ceil(this.elWidth / 8);
	
	if(this.gap % 2 != 0){
		this.gap += 1;
	}
	
	if(this.elWidth < cutoff || !this.book.settings.spreads) {
		this.spread = false; //-- Single Page

		divisor = 1;
		this.colWidth = Math.floor(this.elWidth / divisor);
	}else{
		this.spread = true; //-- Double Page

		this.colWidth = Math.floor((this.elWidth - this.gap) / divisor);
		
		// - Was causing jumps, doesn't seem to be needed anymore
		//-- Must be even for firefox
		// if(this.colWidth % 2 != 0){
		//	 this.colWidth -= 1;
		// }
		
	}

	this.spreadWidth = (this.colWidth + this.gap) * divisor;
	// if(this.bodyEl) this.bodyEl.style.margin = 0;
	// this.bodyEl.style.fontSize = localStorage.getItem("fontSize") || "medium";
	
	//-- Clear Margins
	if(this.bodyEl) this.bodyEl.style.margin = "0";
		
	this.docEl.style.overflow = "hidden";

	this.docEl.style.width = this.elWidth + "px";

	//-- Adjust height
	this.docEl.style.height = this.iframe.clientHeight	+ "px";

	//-- Add columns
	this.docEl.style[EPUBJS.Renderer.columnAxis] = "horizontal";
	this.docEl.style[EPUBJS.Renderer.columnGap] = this.gap+"px";
	this.docEl.style[EPUBJS.Renderer.columnWidth] = this.colWidth+"px";
	
}

EPUBJS.Renderer.prototype.fixedLayout = function(){
	this.paginated = false;

	this.elWidth = this.iframe.width;
	this.docEl.style.width = this.elWidth;
	// this.setLeft(0);

	this.docEl.style.width = this.elWidth;

	//-- Adjust height
	this.docEl.style.height = "auto";

	//-- Remove columns
	// this.docEl.style[EPUBJS.core.columnWidth] = "auto";

	//-- Scroll
	this.docEl.style.overflow = "auto";

	// this.displayedPages = 1;
}

EPUBJS.Renderer.prototype.setStyle = function(style, val, prefixed){
	if(prefixed) {
		style = EPUBJS.core.prefixed(style);
	}
	
	if(this.bodyEl) this.bodyEl.style[style] = val;
}

EPUBJS.Renderer.prototype.removeStyle = function(style){
	
	if(this.bodyEl) this.bodyEl.style[style] = '';
		
}

EPUBJS.Renderer.prototype.applyStyles = function() {
	var styles = this.book.settings.styles;

	for (style in styles) {
		this.setStyle(style, styles[style]);
	}
}

EPUBJS.Renderer.prototype.gotoChapterEnd = function(){
	this.chapterEnd();
}

EPUBJS.Renderer.prototype.visible = function(bool){
	if(typeof(bool) == "undefined") {
		return this.iframe.style.visibility;
	}

	if(bool == true){
		this.iframe.style.visibility = "visible";
	}else if(bool == false){
		this.iframe.style.visibility = "hidden";
	}
}

EPUBJS.Renderer.prototype.calcPages = function() {
	
	this.totalWidth = this.docEl.scrollWidth;
	
	this.displayedPages = Math.ceil(this.totalWidth / this.spreadWidth);

	this.currentChapter.pages = this.displayedPages;
}


EPUBJS.Renderer.prototype.nextPage = function(){
	if(this.chapterPos < this.displayedPages){
		this.chapterPos++;

		this.leftPos += this.spreadWidth;

		this.setLeft(this.leftPos);

		this.currentLocationCfi = this.getPageCfi();
		
		this.book.trigger("renderer:pageChanged", this.currentLocationCfi);


		return this.chapterPos;
	}else{
		return false;
	}
}

EPUBJS.Renderer.prototype.prevPage = function(){
	if(this.chapterPos > 1){
		this.chapterPos--;

		this.leftPos -= this.spreadWidth;

		this.setLeft(this.leftPos);

		this.currentLocationCfi = this.getPageCfi();

		this.book.trigger("renderer:pageChanged", this.currentLocationCfi);

		return this.chapterPos;
	}else{
		return false;
	}
}

EPUBJS.Renderer.prototype.chapterEnd = function(){
	this.page(this.displayedPages);
}

EPUBJS.Renderer.prototype.setLeft = function(leftPos){
	// this.bodyEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style[EPUBJS.Renderer.transform] = 'translate('+ (-leftPos) + 'px, 0)';
	this.doc.defaultView.scrollTo(leftPos, 0);
}

EPUBJS.Renderer.prototype.determineStore = function(callback){
	if(this.book.fromStorage) {
		
		//-- Filesystem api links are relative, so no need to replace them
		if(this.book.storage.getStorageType() == "filesystem") {
			return false;
		}
		
		return this.book.store;
		
	} else if(this.book.contained) {
		
		return this.book.zip;
		
	} else {
		
		return false;
		
	}
}

EPUBJS.Renderer.prototype.replace = function(query, func, finished, progress){
	var items = this.doc.querySelectorAll(query),
		resources = Array.prototype.slice.call(items),
		count = resources.length, 
		after = function(result){
			count--;
			if(progress) progress(result, count);
			if(count <= 0 && finished) finished(true);
		};
		
	if(count === 0) {
		finished(false); 
		return;
	}

	resources.forEach(function(item){
		
		func(item, after);
	
	}.bind(this));
	
}

EPUBJS.Renderer.prototype.replaceWithStored = function(query, attr, func, callback) {
	var _oldUrls,
		_newUrls = {},
		_store = this.determineStore(),
		_cache = this.caches[query],
		_contentsPath = this.book.settings.contentsPath,
		_attr = attr,
		progress = function(url, full, count) {
			_newUrls[full] = url;
		},
		finished = function(notempty) {
		
			if(callback) callback();
			
			_.each(_oldUrls, function(url){
				_store.revokeUrl(url);
			});
			
			_cache = _newUrls;
		};

	if(!_store) return;

	if(!_cache) _cache = {};
	_oldUrls = _.clone(_cache);

	this.replace(query, function(link, done){

		var src = link.getAttribute(_attr),
			full = EPUBJS.core.resolveUrl(_contentsPath, src),
			replaceUrl = function(url) {
				link.setAttribute(_attr, url);
				link.onload = function(){
					done(url, full);
				}
			};
	
	
		if(full in _oldUrls){
			replaceUrl(_oldUrls[full]);
			_newUrls[full] = _oldUrls[full];
			delete _oldUrls[full];
		}else{
			func(_store, full, replaceUrl, link);
		}

	}, finished, progress);
}



//-- Replaces the relative links within the book to use our internal page changer
EPUBJS.Renderer.prototype.replaceLinks = function(callback){
	
	var renderer = this;

	this.replace("a[href]", function(link, done){

		var href = link.getAttribute("href"),
			relative = href.search("://"),
			fragment = href[0] == "#";

		if(relative != -1){

			link.setAttribute("target", "_blank");

		}else{

			link.onclick = function(){
				renderer.book.goto(href);
				return false;
			}
		}

		done();

	}, callback);

}


EPUBJS.Renderer.prototype.page = function(pg){
	if(pg >= 1 && pg <= this.displayedPages){
		this.chapterPos = pg;
		this.leftPos = this.spreadWidth * (pg-1); //-- pages start at 1
		this.setLeft(this.leftPos);
		
		this.currentLocationCfi = this.getPageCfi();
			
		this.book.trigger("renderer:pageChanged", this.currentLocationCfi);
		
		// localStorage.setItem("chapterPos", pg);
		return true;
	}

	//-- Return false if page is greater than the total
	return false;
}

//-- Find a section by fragement id
EPUBJS.Renderer.prototype.section = function(fragment){
	var el = this.doc.getElementById(fragment),
		left, pg;

	if(el){
		this.pageByElement(el);
	}	

}

//-- Show the page containing an Element
EPUBJS.Renderer.prototype.pageByElement = function(el){
	var left, pg;
	if(!el) return;

	left = this.leftPos + el.getBoundingClientRect().left, //-- Calculate left offset compaired to scrolled position
	pg = Math.floor(left / this.spreadWidth) + 1; //-- pages start at 1
	this.page(pg);

}

EPUBJS.Renderer.prototype.beforeDisplay = function(callback){
	this.book.triggerHooks("beforeChapterDisplay", callback.bind(this), this);
}

EPUBJS.Renderer.prototype.walk = function(node) {
	var r,
		node, children, leng,
		startNode = node,
		prevNode,
		stack = [startNode];

	var STOP = 10000, ITER=0;

	while(!r && stack.length) {

		node = stack.shift();
		
		if( this.isElementVisible(node) ) {
			
			r = node;
			
		}
		
		if(!r && node && node.childElementCount > 0){
			
			children = node.children;
			if (children && children.length) {
				 leng = children.length ? children.length : 0;
			} else {
				return r;
			}
			
			for (var i = 0; i < leng; i++) {
				 if(children[i] != prevNode) stack.push(children[i]);
			}

		}
		
		
		if(!r && stack.length == 0 && startNode && startNode.parentNode !== null){

			stack.push(startNode.parentNode);
			prevNode = startNode;
			startNode = startNode.parentNode;
		}
		
		
		ITER++;
		if(ITER > STOP) {
			console.error("ENDLESS LOOP"); 
			break;
		}
		
	}

	return r;
}


EPUBJS.Renderer.prototype.getPageCfi = function(){
	var prevEl = this.visibileEl;
	this.visibileEl = this.findFirstVisible(prevEl);
	
	if(!this.visibileEl.id) {
		this.visibileEl.id = "EPUBJS-PAGE-" + this.chapterPos;
	}
	
	this.pageIds[this.chapterPos] = this.visibileEl.id;
	
	
	return this.epubcfi.generateFragment(this.visibileEl, this.currentChapterCfi);

}

EPUBJS.Renderer.prototype.gotoCfiFragment = function(cfi){
	var element; 

	if(_.isString(cfi)){
		cfi = this.epubcfi.parse(cfi);
	}
	
	element = this.epubcfi.getElement(cfi, this.doc);

	this.pageByElement(element);
}

EPUBJS.Renderer.prototype.findFirstVisible = function(startEl){
	var el = startEl || this.bodyEl,
		found;
	
	found = this.walk(el);

	if(found) {
		return found;
	}else{
		return startEl;
	}
		
}

EPUBJS.Renderer.prototype.isElementVisible = function(el){
	var left;
	
	if(el && typeof el.getBoundingClientRect === 'function'){

		left = el.getBoundingClientRect().left;
		
		if( left >= 0 &&
			left < this.spreadWidth ) {
			return true;	
		}
	}
	
	return false;
}


EPUBJS.Renderer.prototype.height = function(el){
	return this.docEl.offsetHeight;
}

EPUBJS.Renderer.prototype.remove = function() {
	this.iframe.contentWindow.removeEventListener("resize", this.resized);
	this.el.removeChild(this.iframe);
}



//-- Enable binding events to parser
RSVP.EventTarget.mixin(EPUBJS.Renderer.prototype);
var EPUBJS = EPUBJS || {}; 
EPUBJS.replace = {};

EPUBJS.replace.head = function(callback, renderer) {

	renderer.replaceWithStored("link[href]", "href", EPUBJS.replace.links, callback);

}
	

//-- Replaces assets src's to point to stored version if browser is offline
EPUBJS.replace.resources = function(callback, renderer){
	//srcs = this.doc.querySelectorAll('[src]');
	renderer.replaceWithStored("[src]", "src", EPUBJS.replace.srcs, callback);
	
}

EPUBJS.replace.svg = function(callback, renderer) {

	renderer.replaceWithStored("image", "xlink:href", function(_store, full, done){
		_store.getUrl(full).then(done);
	}, callback);

}

EPUBJS.replace.srcs = function(_store, full, done){

	_store.getUrl(full).then(done);
	
}

//-- Replaces links in head, such as stylesheets - link[href]
EPUBJS.replace.links = function(_store, full, done, link){
	
	//-- Handle replacing urls in CSS
	if(link.getAttribute("rel") === "stylesheet") {
		EPUBJS.replace.stylesheets(_store, full).then(done);
	}else{
		_store.getUrl(full).then(done);	
	}

	
}

EPUBJS.replace.stylesheets = function(_store, full) {
	var deferred = new RSVP.defer();

	if(!_store) return;

	_store.getText(full).then(function(text){
		var url;
	
		EPUBJS.replace.cssUrls(_store, full, text).then(function(newText){
			var _URL = window.URL || window.webkitURL || window.mozURL;

			var blob = new Blob([newText], { "type" : "text\/css" }),
				url = _URL.createObjectURL(blob);

			deferred.resolve(url);

		}, function(e) {console.error(e)});
		
	});

	return deferred.promise;
}

EPUBJS.replace.cssUrls = function(_store, base, text){
	var deferred = new RSVP.defer(),
		promises = [],
		matches = text.match(/url\(\'?\"?([^\'|^\"]*)\'?\"?\)/g);
	
	if(!_store) return;

	if(!matches){
		deferred.resolve(text);
		return deferred.promise;
	}

	matches.forEach(function(str){
		var full = EPUBJS.core.resolveUrl(base, str.replace(/url\(|[|\)|\'|\"]/g, ''));
		replaced = _store.getUrl(full).then(function(url){
			text = text.replace(str, 'url("'+url+'")');
		}, function(e) {console.error(e)} );
		
		promises.push(replaced);
	});
	
	RSVP.all(promises).then(function(){
		deferred.resolve(text);
	});
	
	return deferred.promise;	
}

EPUBJS.Unarchiver = function(url){
	
	this.libPath = EPUBJS.filePath;
	this.zipUrl = url;
	this.loadLib()
	this.urlCache = {};
	
	this.zipFs = new zip.fs.FS();
	
	return this.promise;
	
}

EPUBJS.Unarchiver.prototype.loadLib = function(callback){
	if(typeof(zip) == "undefined") console.error("Zip lib not loaded");
	
	/*
	//-- load script
	EPUBJS.core.loadScript(this.libPath+"zip.js", function(){
		//-- Tell zip where it is located
		zip.workerScriptsPath = this.libPath;
		callback();
	}.bind(this));
	*/
	// console.log(this.libPath)
	zip.workerScriptsPath = this.libPath;
}

EPUBJS.Unarchiver.prototype.openZip = function(zipUrl, callback){ 
	var deferred = new RSVP.defer();
	var zipFs = this.zipFs;
	zipFs.importHttpContent(zipUrl, false, function() {
		deferred.resolve(zipFs);
	}, this.failed);
	
	return deferred.promise;
}

// EPUBJS.Unarchiver.prototype.getXml = function(url){
// 	var unarchiver = this,
// 		request;
// 	return this.getUrl(url, 'application/xml').
// 			then(function(newUrl){
// 				request = EPUBJS.core.request(newUrl, 'xml');
// 				//-- Remove temp url after use
// 				request.then(function(uri){
// 					unarchiver.revokeUrl(uri);
// 				});
// 				return request
// 		  	});
// 		  	
// }
EPUBJS.Unarchiver.prototype.getXml = function(url){
	
	return this.getText(url).
			then(function(text){
				var parser = new DOMParser();
				return parser.parseFromString(text, "application/xml");
		  	});

}

EPUBJS.Unarchiver.prototype.getUrl = function(url, mime){
	var unarchiver = this;
	var deferred = new RSVP.defer();
	var entry = this.zipFs.find(url);	
	var _URL = window.URL || window.webkitURL || window.mozURL; 

	if(!entry) console.error(url);
	
	if(url in this.urlCache) {
		deferred.resolve(this.urlCache[url]);
		return deferred.promise;
	}

	entry.getBlob(mime || zip.getMimeType(entry.name), function(blob){
		var tempUrl = _URL.createObjectURL(blob);
		deferred.resolve(tempUrl);
		unarchiver.urlCache[url] = tempUrl;
	});

	return deferred.promise;
}

EPUBJS.Unarchiver.prototype.getText = function(url){
	var unarchiver = this;
	var deferred = new RSVP.defer();
	var entry = this.zipFs.find(url);	
	var _URL = window.URL || window.webkitURL || window.mozURL; 

	if(!entry) console.error(url);


	entry.getText(function(text){
		deferred.resolve(text);
	}, null, null, 'ISO-8859-1');

	return deferred.promise;
}

EPUBJS.Unarchiver.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = unarchiver.urlCache[url];
	console.log("revoke", fromCache);
	if(fromCache) _URL.revokeObjectURL(fromCache);
}

EPUBJS.Unarchiver.prototype.failed = function(error){ 
	console.error(error);
}

EPUBJS.Unarchiver.prototype.afterSaved = function(error){ 
	this.callback();
}

EPUBJS.Unarchiver.prototype.toStorage = function(entries){
	var timeout = 0,
		delay = 20,
		that = this,
		count = entries.length;

	function callback(){
		count--;
		if(count == 0) that.afterSaved();
	}
		
	entries.forEach(function(entry){
		
		setTimeout(function(entry){
			that.saveEntryFileToStorage(entry, callback);
		}, timeout, entry);
		
		timeout += delay;
	});
	
	console.log("time", timeout);
	
	//entries.forEach(this.saveEntryFileToStorage.bind(this));
}

EPUBJS.Unarchiver.prototype.saveEntryFileToStorage = function(entry, callback){
	var that = this;
	entry.getData(new zip.BlobWriter(), function(blob) {
		EPUBJS.storage.save(entry.filename, blob, callback);
	});
}