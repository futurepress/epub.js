if (typeof EPUBJS === 'undefined') {
	(typeof window !== 'undefined' ? window : this).EPUBJS = {};
}

EPUBJS.VERSION = "0.3.0";
EPUBJS.Render = {};

(function(root) {
	"use strict";
	var ePub = function(_url) {
		return new EPUBJS.Book(_url);
	};

	ePub.Render = {
		register: function(name, renderer) {
			ePub.Render[name] = renderer;
		}
	}

	// CommonJS
	if (typeof exports === "object") {
		root.RSVP = require("rsvp");
		module.exports = ePub;
	// RequireJS
	} else if (typeof define === "function" && define.amd) {
		define(ePub);
	// Global
	} else {
		root.ePub = ePub;
	}
	
})(this);


(function(global) {
/**
  @class RSVP
  @module RSVP
  */
var define, require;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  require = function(name) {

    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    if (!registry[name]) {
      throw new Error("Could not find module " + name);
    }

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(require(resolve(deps[i])));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;

    function resolve(child) {
      if (child.charAt(0) !== '.') { return child; }
      var parts = child.split("/");
      var parentBase = name.split("/").slice(0, -1);

      for (var i=0, l=parts.length; i<l; i++) {
        var part = parts[i];

        if (part === '..') { parentBase.pop(); }
        else if (part === '.') { continue; }
        else { parentBase.push(part); }
      }

      return parentBase.join("/");
    }
  };

  require.entries = registry;
})();

define('rsvp/-internal', [
    './utils',
    './instrument',
    './config',
    'exports'
], function (__dependency1__, __dependency2__, __dependency3__, __exports__) {
    'use strict';
    var objectOrFunction = __dependency1__.objectOrFunction;
    var isFunction = __dependency1__.isFunction;
    var now = __dependency1__.now;
    var instrument = __dependency2__['default'];
    var config = __dependency3__.config;
    function noop() {
    }
    var PENDING = void 0;
    var FULFILLED = 1;
    var REJECTED = 2;
    var GET_THEN_ERROR = new ErrorObject();
    function getThen(promise) {
        try {
            return promise.then;
        } catch (error) {
            GET_THEN_ERROR.error = error;
            return GET_THEN_ERROR;
        }
    }
    function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
        try {
            then.call(value, fulfillmentHandler, rejectionHandler);
        } catch (e) {
            return e;
        }
    }
    function handleForeignThenable(promise, thenable, then) {
        config.async(function (promise$2) {
            var sealed = false;
            var error = tryThen(then, thenable, function (value) {
                    if (sealed) {
                        return;
                    }
                    sealed = true;
                    if (thenable !== value) {
                        resolve(promise$2, value);
                    } else {
                        fulfill(promise$2, value);
                    }
                }, function (reason) {
                    if (sealed) {
                        return;
                    }
                    sealed = true;
                    reject(promise$2, reason);
                }, 'Settle: ' + (promise$2._label || ' unknown promise'));
            if (!sealed && error) {
                sealed = true;
                reject(promise$2, error);
            }
        }, promise);
    }
    function handleOwnThenable(promise, thenable) {
        promise._onerror = null;
        if (thenable._state === FULFILLED) {
            fulfill(promise, thenable._result);
        } else if (promise._state === REJECTED) {
            reject(promise, thenable._result);
        } else {
            subscribe(thenable, undefined, function (value) {
                if (thenable !== value) {
                    resolve(promise, value);
                } else {
                    fulfill(promise, value);
                }
            }, function (reason) {
                reject(promise, reason);
            });
        }
    }
    function handleMaybeThenable(promise, maybeThenable) {
        if (maybeThenable instanceof promise.constructor) {
            handleOwnThenable(promise, maybeThenable);
        } else {
            var then = getThen(maybeThenable);
            if (then === GET_THEN_ERROR) {
                reject(promise, GET_THEN_ERROR.error);
            } else if (then === undefined) {
                fulfill(promise, maybeThenable);
            } else if (isFunction(then)) {
                handleForeignThenable(promise, maybeThenable, then);
            } else {
                fulfill(promise, maybeThenable);
            }
        }
    }
    function resolve(promise, value) {
        if (promise === value) {
            fulfill(promise, value);
        } else if (objectOrFunction(value)) {
            handleMaybeThenable(promise, value);
        } else {
            fulfill(promise, value);
        }
    }
    function publishRejection(promise) {
        if (promise._onerror) {
            promise._onerror(promise._result);
        }
        publish(promise);
    }
    function fulfill(promise, value) {
        if (promise._state !== PENDING) {
            return;
        }
        promise._result = value;
        promise._state = FULFILLED;
        if (promise._subscribers.length === 0) {
            if (config.instrument) {
                instrument('fulfilled', promise);
            }
        } else {
            config.async(publish, promise);
        }
    }
    function reject(promise, reason) {
        if (promise._state !== PENDING) {
            return;
        }
        promise._state = REJECTED;
        promise._result = reason;
        config.async(publishRejection, promise);
    }
    function subscribe(parent, child, onFulfillment, onRejection) {
        var subscribers = parent._subscribers;
        var length = subscribers.length;
        parent._onerror = null;
        subscribers[length] = child;
        subscribers[length + FULFILLED] = onFulfillment;
        subscribers[length + REJECTED] = onRejection;
        if (length === 0 && parent._state) {
            config.async(publish, parent);
        }
    }
    function publish(promise) {
        var subscribers = promise._subscribers;
        var settled = promise._state;
        if (config.instrument) {
            instrument(settled === FULFILLED ? 'fulfilled' : 'rejected', promise);
        }
        if (subscribers.length === 0) {
            return;
        }
        var child, callback, detail = promise._result;
        for (var i = 0; i < subscribers.length; i += 3) {
            child = subscribers[i];
            callback = subscribers[i + settled];
            if (child) {
                invokeCallback(settled, child, callback, detail);
            } else {
                callback(detail);
            }
        }
        promise._subscribers.length = 0;
    }
    function ErrorObject() {
        this.error = null;
    }
    var TRY_CATCH_ERROR = new ErrorObject();
    function tryCatch(callback, detail) {
        try {
            return callback(detail);
        } catch (e) {
            TRY_CATCH_ERROR.error = e;
            return TRY_CATCH_ERROR;
        }
    }
    function invokeCallback(settled, promise, callback, detail) {
        var hasCallback = isFunction(callback), value, error, succeeded, failed;
        if (hasCallback) {
            value = tryCatch(callback, detail);
            if (value === TRY_CATCH_ERROR) {
                failed = true;
                error = value.error;
                value = null;
            } else {
                succeeded = true;
            }
            if (promise === value) {
                reject(promise, new TypeError('A promises callback cannot return that same promise.'));
                return;
            }
        } else {
            value = detail;
            succeeded = true;
        }
        if (promise._state !== PENDING) {
        }    // noop
        else if (hasCallback && succeeded) {
            resolve(promise, value);
        } else if (failed) {
            reject(promise, error);
        } else if (settled === FULFILLED) {
            fulfill(promise, value);
        } else if (settled === REJECTED) {
            reject(promise, value);
        }
    }
    function initializePromise(promise, resolver) {
        try {
            resolver(function resolvePromise(value) {
                resolve(promise, value);
            }, function rejectPromise(reason) {
                reject(promise, reason);
            });
        } catch (e) {
            reject(promise, e);
        }
    }
    __exports__.noop = noop;
    __exports__.resolve = resolve;
    __exports__.reject = reject;
    __exports__.fulfill = fulfill;
    __exports__.subscribe = subscribe;
    __exports__.publish = publish;
    __exports__.publishRejection = publishRejection;
    __exports__.initializePromise = initializePromise;
    __exports__.invokeCallback = invokeCallback;
    __exports__.FULFILLED = FULFILLED;
    __exports__.REJECTED = REJECTED;
});
define('rsvp/all-settled', [
    './enumerator',
    './promise',
    './utils',
    'exports'
], function (__dependency1__, __dependency2__, __dependency3__, __exports__) {
    'use strict';
    var Enumerator = __dependency1__['default'];
    var makeSettledResult = __dependency1__.makeSettledResult;
    var Promise = __dependency2__['default'];
    var o_create = __dependency3__.o_create;
    function AllSettled(Constructor, entries, label) {
        this._superConstructor(Constructor, entries, false, label);
    }
    AllSettled.prototype = o_create(Enumerator.prototype);
    AllSettled.prototype._superConstructor = Enumerator;
    AllSettled.prototype._makeResult = makeSettledResult;
    AllSettled.prototype._validationError = function () {
        return new Error('allSettled must be called with an array');
    };
    /**
      `RSVP.allSettled` is similar to `RSVP.all`, but instead of implementing
      a fail-fast method, it waits until all the promises have returned and
      shows you all the results. This is useful if you want to handle multiple
      promises' failure states together as a set.

      Returns a promise that is fulfilled when all the given promises have been
      settled. The return promise is fulfilled with an array of the states of
      the promises passed into the `promises` array argument.

      Each state object will either indicate fulfillment or rejection, and
      provide the corresponding value or reason. The states will take one of
      the following formats:

      ```javascript
      { state: 'fulfilled', value: value }
        or
      { state: 'rejected', reason: reason }
      ```

      Example:

      ```javascript
      var promise1 = RSVP.Promise.resolve(1);
      var promise2 = RSVP.Promise.reject(new Error('2'));
      var promise3 = RSVP.Promise.reject(new Error('3'));
      var promises = [ promise1, promise2, promise3 ];

      RSVP.allSettled(promises).then(function(array){
        // array == [
        //   { state: 'fulfilled', value: 1 },
        //   { state: 'rejected', reason: Error },
        //   { state: 'rejected', reason: Error }
        // ]
        // Note that for the second item, reason.message will be "2", and for the
        // third item, reason.message will be "3".
      }, function(error) {
        // Not run. (This block would only be called if allSettled had failed,
        // for instance if passed an incorrect argument type.)
      });
      ```

      @method allSettled
      @static
      @for RSVP
      @param {Array} promises
      @param {String} label - optional string that describes the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled with an array of the settled
      states of the constituent promises.
    */
    __exports__['default'] = function allSettled(entries, label) {
        return new AllSettled(Promise, entries, label).promise;
    };
});
define('rsvp/all', [
    './promise',
    'exports'
], function (__dependency1__, __exports__) {
    'use strict';
    var Promise = __dependency1__['default'];
    /**
      This is a convenient alias for `RSVP.Promise.all`.

      @method all
      @static
      @for RSVP
      @param {Array} array Array of promises.
      @param {String} label An optional label. This is useful
      for tooling.
    */
    __exports__['default'] = function all(array, label) {
        return Promise.all(array, label);
    };
});
define('rsvp/asap', ['exports'], function (__exports__) {
    'use strict';
    var length = 0;
    __exports__['default'] = function asap(callback, arg) {
        queue[length] = callback;
        queue[length + 1] = arg;
        length += 2;
        if (length === 2) {
            // If length is 1, that means that we need to schedule an async flush.
            // If additional callbacks are queued before the queue is flushed, they
            // will be processed by this flush that we are scheduling.
            scheduleFlush();
        }
    };
    var browserGlobal = typeof window !== 'undefined' ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    // test for web worker but not in IE10
    var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
    // node
    function useNextTick() {
        return function () {
            process.nextTick(flush);
        };
    }
    function useMutationObserver() {
        var iterations = 0;
        var observer = new BrowserMutationObserver(flush);
        var node = document.createTextNode('');
        observer.observe(node, { characterData: true });
        return function () {
            node.data = iterations = ++iterations % 2;
        };
    }
    // web worker
    function useMessageChannel() {
        var channel = new MessageChannel();
        channel.port1.onmessage = flush;
        return function () {
            channel.port2.postMessage(0);
        };
    }
    function useSetTimeout() {
        return function () {
            setTimeout(flush, 1);
        };
    }
    var queue = new Array(1000);
    function flush() {
        for (var i = 0; i < length; i += 2) {
            var callback = queue[i];
            var arg = queue[i + 1];
            callback(arg);
            queue[i] = undefined;
            queue[i + 1] = undefined;
        }
        length = 0;
    }
    var scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
        scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
        scheduleFlush = useMutationObserver();
    } else if (isWorker) {
        scheduleFlush = useMessageChannel();
    } else {
        scheduleFlush = useSetTimeout();
    }
});
define('rsvp/config', [
    './events',
    'exports'
], function (__dependency1__, __exports__) {
    'use strict';
    var EventTarget = __dependency1__['default'];
    var config = { instrument: false };
    EventTarget.mixin(config);
    function configure(name, value) {
        if (name === 'onerror') {
            // handle for legacy users that expect the actual
            // error to be passed to their function added via
            // `RSVP.configure('onerror', someFunctionHere);`
            config.on('error', value);
            return;
        }
        if (arguments.length === 2) {
            config[name] = value;
        } else {
            return config[name];
        }
    }
    __exports__.config = config;
    __exports__.configure = configure;
});
define('rsvp/defer', [
    './promise',
    'exports'
], function (__dependency1__, __exports__) {
    'use strict';
    var Promise = __dependency1__['default'];
    /**
      `RSVP.defer` returns an object similar to jQuery's `$.Deferred`.
      `RSVP.defer` should be used when porting over code reliant on `$.Deferred`'s
      interface. New code should use the `RSVP.Promise` constructor instead.

      The object returned from `RSVP.defer` is a plain object with three properties:

      * promise - an `RSVP.Promise`.
      * reject - a function that causes the `promise` property on this object to
        become rejected
      * resolve - a function that causes the `promise` property on this object to
        become fulfilled.

      Example:

       ```javascript
       var deferred = RSVP.defer();

       deferred.resolve("Success!");

       defered.promise.then(function(value){
         // value here is "Success!"
       });
       ```

      @method defer
      @static
      @for RSVP
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Object}
     */
    __exports__['default'] = function defer(label) {
        var deferred = {};
        deferred.promise = new Promise(function (resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
        }, label);
        return deferred;
    };
});
define('rsvp/enumerator', [
    './utils',
    './-internal',
    'exports'
], function (__dependency1__, __dependency2__, __exports__) {
    'use strict';
    var isArray = __dependency1__.isArray;
    var isMaybeThenable = __dependency1__.isMaybeThenable;
    var noop = __dependency2__.noop;
    var reject = __dependency2__.reject;
    var fulfill = __dependency2__.fulfill;
    var subscribe = __dependency2__.subscribe;
    var FULFILLED = __dependency2__.FULFILLED;
    var REJECTED = __dependency2__.REJECTED;
    var PENDING = __dependency2__.PENDING;
    var ABORT_ON_REJECTION = true;
    __exports__.ABORT_ON_REJECTION = ABORT_ON_REJECTION;
    function makeSettledResult(state, position, value) {
        if (state === FULFILLED) {
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
    __exports__.makeSettledResult = makeSettledResult;
    function Enumerator(Constructor, input, abortOnReject, label) {
        this._instanceConstructor = Constructor;
        this.promise = new Constructor(noop, label);
        this._abortOnReject = abortOnReject;
        if (this._validateInput(input)) {
            this._input = input;
            this.length = input.length;
            this._remaining = input.length;
            this._init();
            if (this.length === 0) {
                fulfill(this.promise, this._result);
            } else {
                this.length = this.length || 0;
                this._enumerate();
                if (this._remaining === 0) {
                    fulfill(this.promise, this._result);
                }
            }
        } else {
            reject(this.promise, this._validationError());
        }
    }
    Enumerator.prototype._validateInput = function (input) {
        return isArray(input);
    };
    Enumerator.prototype._validationError = function () {
        return new Error('Array Methods must be provided an Array');
    };
    Enumerator.prototype._init = function () {
        this._result = new Array(this.length);
    };
    __exports__['default'] = Enumerator;
    Enumerator.prototype._enumerate = function () {
        var length = this.length;
        var promise = this.promise;
        var input = this._input;
        for (var i = 0; promise._state === PENDING && i < length; i++) {
            this._eachEntry(input[i], i);
        }
    };
    Enumerator.prototype._eachEntry = function (entry, i) {
        var c = this._instanceConstructor;
        if (isMaybeThenable(entry)) {
            if (entry.constructor === c && entry._state !== PENDING) {
                entry._onerror = null;
                this._settledAt(entry._state, i, entry._result);
            } else {
                this._willSettleAt(c.resolve(entry), i);
            }
        } else {
            this._remaining--;
            this._result[i] = this._makeResult(FULFILLED, i, entry);
        }
    };
    Enumerator.prototype._settledAt = function (state, i, value) {
        var promise = this.promise;
        if (promise._state === PENDING) {
            this._remaining--;
            if (this._abortOnReject && state === REJECTED) {
                reject(promise, value);
            } else {
                this._result[i] = this._makeResult(state, i, value);
            }
        }
        if (this._remaining === 0) {
            fulfill(promise, this._result);
        }
    };
    Enumerator.prototype._makeResult = function (state, i, value) {
        return value;
    };
    Enumerator.prototype._willSettleAt = function (promise, i) {
        var enumerator = this;
        subscribe(promise, undefined, function (value) {
            enumerator._settledAt(FULFILLED, i, value);
        }, function (reason) {
            enumerator._settledAt(REJECTED, i, reason);
        });
    };
});
define('rsvp/events', ['exports'], function (__exports__) {
    'use strict';
    function indexOf(callbacks, callback) {
        for (var i = 0, l = callbacks.length; i < l; i++) {
            if (callbacks[i] === callback) {
                return i;
            }
        }
        return -1;
    }
    function callbacksFor(object) {
        var callbacks = object._promiseCallbacks;
        if (!callbacks) {
            callbacks = object._promiseCallbacks = {};
        }
        return callbacks;
    }
    /**
      @class RSVP.EventTarget
    */
    __exports__['default'] = {
        mixin: function (object) {
            object.on = this.on;
            object.off = this.off;
            object.trigger = this.trigger;
            object._promiseCallbacks = undefined;
            return object;
        },
        on: function (eventName, callback) {
            var allCallbacks = callbacksFor(this), callbacks;
            callbacks = allCallbacks[eventName];
            if (!callbacks) {
                callbacks = allCallbacks[eventName] = [];
            }
            if (indexOf(callbacks, callback) === -1) {
                callbacks.push(callback);
            }
        },
        off: function (eventName, callback) {
            var allCallbacks = callbacksFor(this), callbacks, index;
            if (!callback) {
                allCallbacks[eventName] = [];
                return;
            }
            callbacks = allCallbacks[eventName];
            index = indexOf(callbacks, callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        },
        trigger: function (eventName, options) {
            var allCallbacks = callbacksFor(this), callbacks, callbackTuple, callback, binding;
            if (callbacks = allCallbacks[eventName]) {
                // Don't cache the callbacks.length since it may grow
                for (var i = 0; i < callbacks.length; i++) {
                    callback = callbacks[i];
                    callback(options);
                }
            }
        }
    };
});
define('rsvp/filter', [
    './promise',
    './utils',
    'exports'
], function (__dependency1__, __dependency2__, __exports__) {
    'use strict';
    var Promise = __dependency1__['default'];
    var isFunction = __dependency2__.isFunction;
    var isMaybeThenable = __dependency2__.isMaybeThenable;
    /**
     `RSVP.filter` is similar to JavaScript's native `filter` method, except that it
      waits for all promises to become fulfilled before running the `filterFn` on
      each item in given to `promises`. `RSVP.filter` returns a promise that will
      become fulfilled with the result of running `filterFn` on the values the
      promises become fulfilled with.

      For example:

      ```javascript

      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.resolve(2);
      var promise3 = RSVP.resolve(3);

      var promises = [promise1, promise2, promise3];

      var filterFn = function(item){
        return item > 1;
      };

      RSVP.filter(promises, filterFn).then(function(result){
        // result is [ 2, 3 ]
      });
      ```

      If any of the `promises` given to `RSVP.filter` are rejected, the first promise
      that is rejected will be given as an argument to the returned promise's
      rejection handler. For example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.reject(new Error("2"));
      var promise3 = RSVP.reject(new Error("3"));
      var promises = [ promise1, promise2, promise3 ];

      var filterFn = function(item){
        return item > 1;
      };

      RSVP.filter(promises, filterFn).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(reason) {
        // reason.message === "2"
      });
      ```

      `RSVP.filter` will also wait for any promises returned from `filterFn`.
      For instance, you may want to fetch a list of users then return a subset
      of those users based on some asynchronous operation:

      ```javascript

      var alice = { name: 'alice' };
      var bob   = { name: 'bob' };
      var users = [ alice, bob ];

      var promises = users.map(function(user){
        return RSVP.resolve(user);
      });

      var filterFn = function(user){
        // Here, Alice has permissions to create a blog post, but Bob does not.
        return getPrivilegesForUser(user).then(function(privs){
          return privs.can_create_blog_post === true;
        });
      };
      RSVP.filter(promises, filterFn).then(function(users){
        // true, because the server told us only Alice can create a blog post.
        users.length === 1;
        // false, because Alice is the only user present in `users`
        users[0] === bob;
      });
      ```

      @method filter
      @static
      @for RSVP
      @param {Array} promises
      @param {Function} filterFn - function to be called on each resolved value to
      filter the final results.
      @param {String} label optional string describing the promise. Useful for
      tooling.
      @return {Promise}
    */
    __exports__['default'] = function filter(promises, filterFn, label) {
        return Promise.all(promises, label).then(function (values) {
            if (!isFunction(filterFn)) {
                throw new TypeError('You must pass a function as filter\'s second argument.');
            }
            var length = values.length;
            var filtered = new Array(length);
            for (var i = 0; i < length; i++) {
                filtered[i] = filterFn(values[i]);
            }
            return Promise.all(filtered, label).then(function (filtered$2) {
                var results = new Array(length);
                var newLength = 0;
                for (var i$2 = 0; i$2 < length; i$2++) {
                    if (filtered$2[i$2]) {
                        results[newLength] = values[i$2];
                        newLength++;
                    }
                }
                results.length = newLength;
                return results;
            });
        });
    };
});
define('rsvp/hash-settled', [
    './promise',
    './enumerator',
    './promise-hash',
    './utils',
    'exports'
], function (__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    'use strict';
    var Promise = __dependency1__['default'];
    var makeSettledResult = __dependency2__.makeSettledResult;
    var PromiseHash = __dependency3__['default'];
    var Enumerator = __dependency2__['default'];
    var o_create = __dependency4__.o_create;
    function HashSettled(Constructor, object, label) {
        this._superConstructor(Constructor, object, false, label);
    }
    HashSettled.prototype = o_create(PromiseHash.prototype);
    HashSettled.prototype._superConstructor = Enumerator;
    HashSettled.prototype._makeResult = makeSettledResult;
    HashSettled.prototype._validationError = function () {
        return new Error('hashSettled must be called with an object');
    };
    /**
      `RSVP.hashSettled` is similar to `RSVP.allSettled`, but takes an object
      instead of an array for its `promises` argument.

      Unlike `RSVP.all` or `RSVP.hash`, which implement a fail-fast method,
      but like `RSVP.allSettled`, `hashSettled` waits until all the
      constituent promises have returned and then shows you all the results
      with their states and values/reasons. This is useful if you want to
      handle multiple promises' failure states together as a set.

      Returns a promise that is fulfilled when all the given promises have been
      settled, or rejected if the passed parameters are invalid.

      The returned promise is fulfilled with a hash that has the same key names as
      the `promises` object argument. If any of the values in the object are not
      promises, they will be copied over to the fulfilled object and marked with state
      'fulfilled'.

      Example:

      ```javascript
      var promises = {
        myPromise: RSVP.Promise.resolve(1),
        yourPromise: RSVP.Promise.resolve(2),
        theirPromise: RSVP.Promise.resolve(3),
        notAPromise: 4
      };

      RSVP.hashSettled(promises).then(function(hash){
        // hash here is an object that looks like:
        // {
        //   myPromise: { state: 'fulfilled', value: 1 },
        //   yourPromise: { state: 'fulfilled', value: 2 },
        //   theirPromise: { state: 'fulfilled', value: 3 },
        //   notAPromise: { state: 'fulfilled', value: 4 }
        // }
      });
      ```

      If any of the `promises` given to `RSVP.hash` are rejected, the state will
      be set to 'rejected' and the reason for rejection provided.

      Example:

      ```javascript
      var promises = {
        myPromise: RSVP.Promise.resolve(1),
        rejectedPromise: RSVP.Promise.reject(new Error('rejection')),
        anotherRejectedPromise: RSVP.Promise.reject(new Error('more rejection')),
      };

      RSVP.hashSettled(promises).then(function(hash){
        // hash here is an object that looks like:
        // {
        //   myPromise:              { state: 'fulfilled', value: 1 },
        //   rejectedPromise:        { state: 'rejected', reason: Error },
        //   anotherRejectedPromise: { state: 'rejected', reason: Error },
        // }
        // Note that for rejectedPromise, reason.message == 'rejection',
        // and for anotherRejectedPromise, reason.message == 'more rejection'.
      });
      ```

      An important note: `RSVP.hashSettled` is intended for plain JavaScript objects that
      are just a set of keys and values. `RSVP.hashSettled` will NOT preserve prototype
      chains.

      Example:

      ```javascript
      function MyConstructor(){
        this.example = RSVP.Promise.resolve('Example');
      }

      MyConstructor.prototype = {
        protoProperty: RSVP.Promise.resolve('Proto Property')
      };

      var myObject = new MyConstructor();

      RSVP.hashSettled(myObject).then(function(hash){
        // protoProperty will not be present, instead you will just have an
        // object that looks like:
        // {
        //   example: { state: 'fulfilled', value: 'Example' }
        // }
        //
        // hash.hasOwnProperty('protoProperty'); // false
        // 'undefined' === typeof hash.protoProperty
      });
      ```

      @method hashSettled
      @for RSVP
      @param {Object} promises
      @param {String} label optional string that describes the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when when all properties of `promises`
      have been settled.
      @static
    */
    __exports__['default'] = function hashSettled(object, label) {
        return new HashSettled(Promise, object, label).promise;
    };
});
define('rsvp/hash', [
    './promise',
    './promise-hash',
    './enumerator',
    'exports'
], function (__dependency1__, __dependency2__, __dependency3__, __exports__) {
    'use strict';
    var Promise = __dependency1__['default'];
    var PromiseHash = __dependency2__['default'];
    var ABORT_ON_REJECTION = __dependency3__.ABORT_ON_REJECTION;
    /**
      `RSVP.hash` is similar to `RSVP.all`, but takes an object instead of an array
      for its `promises` argument.

      Returns a promise that is fulfilled when all the given promises have been
      fulfilled, or rejected if any of them become rejected. The returned promise
      is fulfilled with a hash that has the same key names as the `promises` object
      argument. If any of the values in the object are not promises, they will
      simply be copied over to the fulfilled object.

      Example:

      ```javascript
      var promises = {
        myPromise: RSVP.resolve(1),
        yourPromise: RSVP.resolve(2),
        theirPromise: RSVP.resolve(3),
        notAPromise: 4
      };

      RSVP.hash(promises).then(function(hash){
        // hash here is an object that looks like:
        // {
        //   myPromise: 1,
        //   yourPromise: 2,
        //   theirPromise: 3,
        //   notAPromise: 4
        // }
      });
      ````

      If any of the `promises` given to `RSVP.hash` are rejected, the first promise
      that is rejected will be given as the reason to the rejection handler.

      Example:

      ```javascript
      var promises = {
        myPromise: RSVP.resolve(1),
        rejectedPromise: RSVP.reject(new Error("rejectedPromise")),
        anotherRejectedPromise: RSVP.reject(new Error("anotherRejectedPromise")),
      };

      RSVP.hash(promises).then(function(hash){
        // Code here never runs because there are rejected promises!
      }, function(reason) {
        // reason.message === "rejectedPromise"
      });
      ```

      An important note: `RSVP.hash` is intended for plain JavaScript objects that
      are just a set of keys and values. `RSVP.hash` will NOT preserve prototype
      chains.

      Example:

      ```javascript
      function MyConstructor(){
        this.example = RSVP.resolve("Example");
      }

      MyConstructor.prototype = {
        protoProperty: RSVP.resolve("Proto Property")
      };

      var myObject = new MyConstructor();

      RSVP.hash(myObject).then(function(hash){
        // protoProperty will not be present, instead you will just have an
        // object that looks like:
        // {
        //   example: "Example"
        // }
        //
        // hash.hasOwnProperty('protoProperty'); // false
        // 'undefined' === typeof hash.protoProperty
      });
      ```

      @method hash
      @static
      @for RSVP
      @param {Object} promises
      @param {String} label optional string that describes the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when all properties of `promises`
      have been fulfilled, or rejected if any of them become rejected.
    */
    __exports__['default'] = function hash(object, label) {
        return new PromiseHash(Promise, object, label).promise;
    };
});
define('rsvp/instrument', [
    './config',
    './utils',
    'exports'
], function (__dependency1__, __dependency2__, __exports__) {
    'use strict';
    var config = __dependency1__.config;
    var now = __dependency2__.now;
    var queue = [];
    __exports__['default'] = function instrument(eventName, promise, child) {
        if (1 === queue.push({
                name: eventName,
                payload: {
                    guid: promise._guidKey + promise._id,
                    eventName: eventName,
                    detail: promise._result,
                    childGuid: child && promise._guidKey + child._id,
                    label: promise._label,
                    timeStamp: now(),
                    stack: new Error(promise._label).stack
                }
            })) {
            setTimeout(function () {
                var entry;
                for (var i = 0; i < queue.length; i++) {
                    entry = queue[i];
                    config.trigger(entry.name, entry.payload);
                }
                queue.length = 0;
            }, 50);
        }
    };
});
define('rsvp/map', [
    './promise',
    './utils',
    'exports'
], function (__dependency1__, __dependency2__, __exports__) {
    'use strict';
    var Promise = __dependency1__['default'];
    var isArray = __dependency2__.isArray;
    var isFunction = __dependency2__.isFunction;
    /**
     `RSVP.map` is similar to JavaScript's native `map` method, except that it
      waits for all promises to become fulfilled before running the `mapFn` on
      each item in given to `promises`. `RSVP.map` returns a promise that will
      become fulfilled with the result of running `mapFn` on the values the promises
      become fulfilled with.

      For example:

      ```javascript

      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.resolve(2);
      var promise3 = RSVP.resolve(3);
      var promises = [ promise1, promise2, promise3 ];

      var mapFn = function(item){
        return item + 1;
      };

      RSVP.map(promises, mapFn).then(function(result){
        // result is [ 2, 3, 4 ]
      });
      ```

      If any of the `promises` given to `RSVP.map` are rejected, the first promise
      that is rejected will be given as an argument to the returned promise's
      rejection handler. For example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.reject(new Error("2"));
      var promise3 = RSVP.reject(new Error("3"));
      var promises = [ promise1, promise2, promise3 ];

      var mapFn = function(item){
        return item + 1;
      };

      RSVP.map(promises, mapFn).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(reason) {
        // reason.message === "2"
      });
      ```

      `RSVP.map` will also wait if a promise is returned from `mapFn`. For example,
      say you want to get all comments from a set of blog posts, but you need
      the blog posts first because they contain a url to those comments.

      ```javscript

      var mapFn = function(blogPost){
        // getComments does some ajax and returns an RSVP.Promise that is fulfilled
        // with some comments data
        return getComments(blogPost.comments_url);
      };

      // getBlogPosts does some ajax and returns an RSVP.Promise that is fulfilled
      // with some blog post data
      RSVP.map(getBlogPosts(), mapFn).then(function(comments){
        // comments is the result of asking the server for the comments
        // of all blog posts returned from getBlogPosts()
      });
      ```

      @method map
      @static
      @for RSVP
      @param {Array} promises
      @param {Function} mapFn function to be called on each fulfilled promise.
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled with the result of calling
      `mapFn` on each fulfilled promise or value when they become fulfilled.
       The promise will be rejected if any of the given `promises` become rejected.
      @static
    */
    __exports__['default'] = function map(promises, mapFn, label) {
        return Promise.all(promises, label).then(function (values) {
            if (!isFunction(mapFn)) {
                throw new TypeError('You must pass a function as map\'s second argument.');
            }
            var length = values.length;
            var results = new Array(length);
            for (var i = 0; i < length; i++) {
                results[i] = mapFn(values[i]);
            }
            return Promise.all(results, label);
        });
    };
});
define('rsvp/node', [
    './promise',
    './utils',
    'exports'
], function (__dependency1__, __dependency2__, __exports__) {
    'use strict';
    /* global  arraySlice */
    var Promise = __dependency1__['default'];
    var isArray = __dependency2__.isArray;
    /**
      `RSVP.denodeify` takes a "node-style" function and returns a function that
      will return an `RSVP.Promise`. You can use `denodeify` in Node.js or the
      browser when you'd prefer to use promises over using callbacks. For example,
      `denodeify` transforms the following:

      ```javascript
      var fs = require('fs');

      fs.readFile('myfile.txt', function(err, data){
        if (err) return handleError(err);
        handleData(data);
      });
      ```

      into:

      ```javascript
      var fs = require('fs');
      var readFile = RSVP.denodeify(fs.readFile);

      readFile('myfile.txt').then(handleData, handleError);
      ```

      If the node function has multiple success parameters, then `denodeify`
      just returns the first one:

      ```javascript
      var request = RSVP.denodeify(require('request'));

      request('http://example.com').then(function(res) {
        // ...
      });
      ```

      However, if you need all success parameters, setting `denodeify`'s
      second parameter to `true` causes it to return all success parameters
      as an array:

      ```javascript
      var request = RSVP.denodeify(require('request'), true);

      request('http://example.com').then(function(result) {
        // result[0] -> res
        // result[1] -> body
      });
      ```

      Or if you pass it an array with names it returns the parameters as a hash:

      ```javascript
      var request = RSVP.denodeify(require('request'), ['res', 'body']);

      request('http://example.com').then(function(result) {
        // result.res
        // result.body
      });
      ```

      Sometimes you need to retain the `this`:

      ```javascript
      var app = require('express')();
      var render = RSVP.denodeify(app.render.bind(app));
      ```

      The denodified function inherits from the original function. It works in all
      environments, except IE 10 and below. Consequently all properties of the original
      function are available to you. However, any properties you change on the
      denodeified function won't be changed on the original function. Example:

      ```javascript
      var request = RSVP.denodeify(require('request')),
          cookieJar = request.jar(); // <- Inheritance is used here

      request('http://example.com', {jar: cookieJar}).then(function(res) {
        // cookieJar.cookies holds now the cookies returned by example.com
      });
      ```

      Using `denodeify` makes it easier to compose asynchronous operations instead
      of using callbacks. For example, instead of:

      ```javascript
      var fs = require('fs');

      fs.readFile('myfile.txt', function(err, data){
        if (err) { ... } // Handle error
        fs.writeFile('myfile2.txt', data, function(err){
          if (err) { ... } // Handle error
          console.log('done')
        });
      });
      ```

      you can chain the operations together using `then` from the returned promise:

      ```javascript
      var fs = require('fs');
      var readFile = RSVP.denodeify(fs.readFile);
      var writeFile = RSVP.denodeify(fs.writeFile);

      readFile('myfile.txt').then(function(data){
        return writeFile('myfile2.txt', data);
      }).then(function(){
        console.log('done')
      }).catch(function(error){
        // Handle error
      });
      ```

      @method denodeify
      @static
      @for RSVP
      @param {Function} nodeFunc a "node-style" function that takes a callback as
      its last argument. The callback expects an error to be passed as its first
      argument (if an error occurred, otherwise null), and the value from the
      operation as its second argument ("function(err, value){ }").
      @param {Boolean|Array} argumentNames An optional paramter that if set
      to `true` causes the promise to fulfill with the callback's success arguments
      as an array. This is useful if the node function has multiple success
      paramters. If you set this paramter to an array with names, the promise will
      fulfill with a hash with these names as keys and the success parameters as
      values.
      @return {Function} a function that wraps `nodeFunc` to return an
      `RSVP.Promise`
      @static
    */
    __exports__['default'] = function denodeify(nodeFunc, argumentNames) {
        var asArray = argumentNames === true;
        var asHash = isArray(argumentNames);
        function denodeifiedFunction() {
            var length = arguments.length;
            var nodeArgs = new Array(length);
            for (var i = 0; i < length; i++) {
                nodeArgs[i] = arguments[i];
            }
            var thisArg;
            if (!asArray && !asHash && argumentNames) {
                if (typeof console === 'object') {
                    console.warn('Deprecation: RSVP.denodeify() doesn\'t allow setting the ' + '"this" binding anymore. Use yourFunction.bind(yourThis) instead.');
                }
                thisArg = argumentNames;
            } else {
                thisArg = this;
            }
            return Promise.all(nodeArgs).then(function (nodeArgs$2) {
                return new Promise(resolver);
                // sweet.js has a bug, this resolver can't be defined in the constructor
                // or the arraySlice macro doesn't work
                function resolver(resolve, reject) {
                    function callback() {
                        var length$2 = arguments.length;
                        var args = new Array(length$2);
                        for (var i$2 = 0; i$2 < length$2; i$2++) {
                            args[i$2] = arguments[i$2];
                        }
                        var error = args[0];
                        var value = args[1];
                        if (error) {
                            reject(error);
                        } else if (asArray) {
                            resolve(args.slice(1));
                        } else if (asHash) {
                            var obj = {};
                            var successArguments = args.slice(1);
                            var name;
                            var i$3;
                            for (i$3 = 0; i$3 < argumentNames.length; i$3++) {
                                name = argumentNames[i$3];
                                obj[name] = successArguments[i$3];
                            }
                            resolve(obj);
                        } else {
                            resolve(value);
                        }
                    }
                    nodeArgs$2.push(callback);
                    nodeFunc.apply(thisArg, nodeArgs$2);
                }
            });
        }
        denodeifiedFunction.__proto__ = nodeFunc;
        return denodeifiedFunction;
    };
});
define('rsvp/promise-hash', [
    './enumerator',
    './-internal',
    './utils',
    'exports'
], function (__dependency1__, __dependency2__, __dependency3__, __exports__) {
    'use strict';
    var Enumerator = __dependency1__['default'];
    var PENDING = __dependency2__.PENDING;
    var FULFILLED = __dependency2__.FULFILLED;
    var o_create = __dependency3__.o_create;
    function PromiseHash(Constructor, object, label) {
        this._superConstructor(Constructor, object, true, label);
    }
    __exports__['default'] = PromiseHash;
    PromiseHash.prototype = o_create(Enumerator.prototype);
    PromiseHash.prototype._superConstructor = Enumerator;
    PromiseHash.prototype._init = function () {
        this._result = {};
    };
    PromiseHash.prototype._validateInput = function (input) {
        return input && typeof input === 'object';
    };
    PromiseHash.prototype._validationError = function () {
        return new Error('Promise.hash must be called with an object');
    };
    PromiseHash.prototype._enumerate = function () {
        var promise = this.promise;
        var input = this._input;
        var results = [];
        for (var key in input) {
            if (promise._state === PENDING && input.hasOwnProperty(key)) {
                results.push({
                    position: key,
                    entry: input[key]
                });
            }
        }
        var length = results.length;
        this._remaining = length;
        var result;
        for (var i = 0; promise._state === PENDING && i < length; i++) {
            result = results[i];
            this._eachEntry(result.entry, result.position);
        }
    };
});
define('rsvp/promise', [
    './config',
    './events',
    './instrument',
    './utils',
    './-internal',
    './promise/cast',
    './promise/all',
    './promise/race',
    './promise/resolve',
    './promise/reject',
    'exports'
], function (__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __exports__) {
    'use strict';
    var config = __dependency1__.config;
    var EventTarget = __dependency2__['default'];
    var instrument = __dependency3__['default'];
    var objectOrFunction = __dependency4__.objectOrFunction;
    var isFunction = __dependency4__.isFunction;
    var now = __dependency4__.now;
    var noop = __dependency5__.noop;
    var resolve = __dependency5__.resolve;
    var reject = __dependency5__.reject;
    var fulfill = __dependency5__.fulfill;
    var subscribe = __dependency5__.subscribe;
    var initializePromise = __dependency5__.initializePromise;
    var invokeCallback = __dependency5__.invokeCallback;
    var FULFILLED = __dependency5__.FULFILLED;
    var cast = __dependency6__['default'];
    var all = __dependency7__['default'];
    var race = __dependency8__['default'];
    var Resolve = __dependency9__['default'];
    var Reject = __dependency10__['default'];
    var guidKey = 'rsvp_' + now() + '-';
    var counter = 0;
    function needsResolver() {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }
    function needsNew() {
        throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');
    }
    __exports__['default'] = Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error("getJSON: `" + url + "` failed with status: [" + this.status + "]"));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class RSVP.Promise
      @param {function} resolver
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @constructor
    */
    function Promise(resolver, label) {
        this._id = counter++;
        this._label = label;
        this._subscribers = [];
        if (config.instrument) {
            instrument('created', this);
        }
        if (noop !== resolver) {
            if (!isFunction(resolver)) {
                needsResolver();
            }
            if (!(this instanceof Promise)) {
                needsNew();
            }
            initializePromise(this, resolver);
        }
    }
    Promise.cast = cast;
    Promise.all = all;
    Promise.race = race;
    Promise.resolve = Resolve;
    Promise.reject = Reject;
    Promise.prototype = {
        constructor: Promise,
        _id: undefined,
        _guidKey: guidKey,
        _label: undefined,
        _state: undefined,
        _result: undefined,
        _subscribers: undefined,
        _onerror: function (reason) {
            config.trigger('error', reason);
        },
        then: function (onFulfillment, onRejection, label) {
            var parent = this;
            parent._onerror = null;
            var child = new this.constructor(noop, label);
            var state = parent._state;
            var result = parent._result;
            if (config.instrument) {
                instrument('chained', parent, child);
            }
            if (state === FULFILLED && onFulfillment) {
                config.async(function () {
                    invokeCallback(state, child, onFulfillment, result);
                });
            } else {
                subscribe(parent, child, onFulfillment, onRejection);
            }
            return child;
        },
        'catch': function (onRejection, label) {
            return this.then(null, onRejection, label);
        },
        'finally': function (callback, label) {
            var constructor = this.constructor;
            return this.then(function (value) {
                return constructor.resolve(callback()).then(function () {
                    return value;
                });
            }, function (reason) {
                return constructor.resolve(callback()).then(function () {
                    throw reason;
                });
            }, label);
        }
    };
});
define('rsvp/promise/all', [
    '../enumerator',
    'exports'
], function (__dependency1__, __exports__) {
    'use strict';
    var Enumerator = __dependency1__['default'];
    /**
      `RSVP.Promise.all` accepts an array of promises, and returns a new promise which
      is fulfilled with an array of fulfillment values for the passed promises, or
      rejected with the reason of the first passed promise to be rejected. It casts all
      elements of the passed iterable to promises as it runs this algorithm.

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.resolve(2);
      var promise3 = RSVP.resolve(3);
      var promises = [ promise1, promise2, promise3 ];

      RSVP.Promise.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```

      If any of the `promises` given to `RSVP.all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.reject(new Error("2"));
      var promise3 = RSVP.reject(new Error("3"));
      var promises = [ promise1, promise2, promise3 ];

      RSVP.Promise.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```

      @method all
      @static
      @param {Array} entries array of promises
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
      @static
    */
    __exports__['default'] = function all(entries, label) {
        return new Enumerator(this, entries, true, label).promise;
    };
});
define('rsvp/promise/cast', [
    './resolve',
    'exports'
], function (__dependency1__, __exports__) {
    'use strict';
    var resolve = __dependency1__['default'];
    /**
      @deprecated

      `RSVP.Promise.cast` coerces its argument to a promise, or returns the
      argument if it is already a promise which shares a constructor with the caster.

      Example:

      ```javascript
      var promise = RSVP.Promise.resolve(1);
      var casted = RSVP.Promise.cast(promise);

      console.log(promise === casted); // true
      ```

      In the case of a promise whose constructor does not match, it is assimilated.
      The resulting promise will fulfill or reject based on the outcome of the
      promise being casted.

      Example:

      ```javascript
      var thennable = $.getJSON('/api/foo');
      var casted = RSVP.Promise.cast(thennable);

      console.log(thennable === casted); // false
      console.log(casted instanceof RSVP.Promise) // true

      casted.then(function(data) {
        // data is the value getJSON fulfills with
      });
      ```

      In the case of a non-promise, a promise which will fulfill with that value is
      returned.

      Example:

      ```javascript
      var value = 1; // could be a number, boolean, string, undefined...
      var casted = RSVP.Promise.cast(value);

      console.log(value === casted); // false
      console.log(casted instanceof RSVP.Promise) // true

      casted.then(function(val) {
        val === value // => true
      });
      ```

      `RSVP.Promise.cast` is similar to `RSVP.Promise.resolve`, but `RSVP.Promise.cast` differs in the
      following ways:

      * `RSVP.Promise.cast` serves as a memory-efficient way of getting a promise, when you
      have something that could either be a promise or a value. RSVP.resolve
      will have the same effect but will create a new promise wrapper if the
      argument is a promise.
      * `RSVP.Promise.cast` is a way of casting incoming thenables or promise subclasses to
      promises of the exact class specified, so that the resulting object's `then` is
      ensured to have the behavior of the constructor you are calling cast on (i.e., RSVP.Promise).

      @method cast
      @static
      @param {Object} object to be casted
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise
    */
    __exports__['default'] = resolve;
});
define('rsvp/promise/race', [
    '../utils',
    '../-internal',
    'exports'
], function (__dependency1__, __dependency2__, __exports__) {
    'use strict';
    var isArray = __dependency1__.isArray;
    var isFunction = __dependency1__.isFunction;
    var isMaybeThenable = __dependency1__.isMaybeThenable;
    var noop = __dependency2__.noop;
    var resolve = __dependency2__.resolve;
    var reject = __dependency2__.reject;
    var subscribe = __dependency2__.subscribe;
    var PENDING = __dependency2__.PENDING;
    /**
      `RSVP.Promise.race` returns a new promise which is settled in the same way as the
      first passed promise to settle.

      Example:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 2");
        }, 100);
      });

      RSVP.Promise.race([promise1, promise2]).then(function(result){
        // result === "promise 2" because it was resolved before promise1
        // was resolved.
      });
      ```

      `RSVP.Promise.race` is deterministic in that only the state of the first
      settled promise matters. For example, even if other promises given to the
      `promises` array argument are resolved, but the first settled promise has
      become rejected before the other promises became fulfilled, the returned
      promise will become rejected:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error("promise 2"));
        }, 100);
      });

      RSVP.Promise.race([promise1, promise2]).then(function(result){
        // Code here never runs
      }, function(reason){
        // reason.message === "promise 2" because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```

      An example real-world use case is implementing timeouts:

      ```javascript
      RSVP.Promise.race([ajax('foo.json'), timeout(5000)])
      ```

      @method race
      @static
      @param {Array} promises array of promises to observe
      @param {String} label optional string for describing the promise returned.
      Useful for tooling.
      @return {Promise} a promise which settles in the same way as the first passed
      promise to settle.
    */
    __exports__['default'] = function race(entries, label) {
        /*jshint validthis:true */
        var Constructor = this, entry;
        var promise = new Constructor(noop, label);
        if (!isArray(entries)) {
            reject(promise, new TypeError('You must pass an array to race.'));
            return promise;
        }
        var length = entries.length;
        function onFulfillment(value) {
            resolve(promise, value);
        }
        function onRejection(reason) {
            reject(promise, reason);
        }
        for (var i = 0; promise._state === PENDING && i < length; i++) {
            subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
        }
        return promise;
    };
});
define('rsvp/promise/reject', [
    '../-internal',
    'exports'
], function (__dependency1__, __exports__) {
    'use strict';
    var noop = __dependency1__.noop;
    var _reject = __dependency1__.reject;
    /**
      `RSVP.Promise.reject` returns a promise rejected with the passed `reason`.
      It is shorthand for the following:

      ```javascript
      var promise = new RSVP.Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      var promise = RSVP.Promise.reject(new Error('WHOOPS'));

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      @method reject
      @static
      @param {Any} reason value that the returned promise will be rejected with.
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise rejected with the given `reason`.
    */
    __exports__['default'] = function reject(reason, label) {
        /*jshint validthis:true */
        var Constructor = this;
        var promise = new Constructor(noop, label);
        _reject(promise, reason);
        return promise;
    };
});
define('rsvp/promise/resolve', [
    '../-internal',
    'exports'
], function (__dependency1__, __exports__) {
    'use strict';
    var noop = __dependency1__.noop;
    var _resolve = __dependency1__.resolve;
    /**
      `RSVP.Promise.resolve` returns a promise that will become resolved with the
      passed `value`. It is shorthand for the following:

      ```javascript
      var promise = new RSVP.Promise(function(resolve, reject){
        resolve(1);
      });

      promise.then(function(value){
        // value === 1
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      var promise = RSVP.Promise.resolve(1);

      promise.then(function(value){
        // value === 1
      });
      ```

      @method resolve
      @static
      @param {Any} value value that the returned promise will be resolved with
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    __exports__['default'] = function resolve(object, label) {
        /*jshint validthis:true */
        var Constructor = this;
        if (object && typeof object === 'object' && object.constructor === Constructor) {
            return object;
        }
        var promise = new Constructor(noop, label);
        _resolve(promise, object);
        return promise;
    };
});
define('rsvp/race', [
    './promise',
    'exports'
], function (__dependency1__, __exports__) {
    'use strict';
    var Promise = __dependency1__['default'];
    /**
      This is a convenient alias for `RSVP.Promise.race`.

      @method race
      @static
      @for RSVP
      @param {Array} array Array of promises.
      @param {String} label An optional label. This is useful
      for tooling.
     */
    __exports__['default'] = function race(array, label) {
        return Promise.race(array, label);
    };
});
define('rsvp/reject', [
    './promise',
    'exports'
], function (__dependency1__, __exports__) {
    'use strict';
    var Promise = __dependency1__['default'];
    /**
      This is a convenient alias for `RSVP.Promise.reject`.

      @method reject
      @static
      @for RSVP
      @param {Any} reason value that the returned promise will be rejected with.
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise rejected with the given `reason`.
    */
    __exports__['default'] = function reject(reason, label) {
        return Promise.reject(reason, label);
    };
});
define('rsvp/resolve', [
    './promise',
    'exports'
], function (__dependency1__, __exports__) {
    'use strict';
    var Promise = __dependency1__['default'];
    /**
      This is a convenient alias for `RSVP.Promise.resolve`.

      @method resolve
      @static
      @for RSVP
      @param {Any} value value that the returned promise will be resolved with
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    __exports__['default'] = function resolve(value, label) {
        return Promise.resolve(value, label);
    };
});
define('rsvp/rethrow', ['exports'], function (__exports__) {
    'use strict';
    /**
      `RSVP.rethrow` will rethrow an error on the next turn of the JavaScript event
      loop in order to aid debugging.

      Promises A+ specifies that any exceptions that occur with a promise must be
      caught by the promises implementation and bubbled to the last handler. For
      this reason, it is recommended that you always specify a second rejection
      handler function to `then`. However, `RSVP.rethrow` will throw the exception
      outside of the promise, so it bubbles up to your console if in the browser,
      or domain/cause uncaught exception in Node. `rethrow` will also throw the
      error again so the error can be handled by the promise per the spec.

      ```javascript
      function throws(){
        throw new Error('Whoops!');
      }

      var promise = new RSVP.Promise(function(resolve, reject){
        throws();
      });

      promise.catch(RSVP.rethrow).then(function(){
        // Code here doesn't run because the promise became rejected due to an
        // error!
      }, function (err){
        // handle the error here
      });
      ```

      The 'Whoops' error will be thrown on the next turn of the event loop
      and you can watch for it in your console. You can also handle it using a
      rejection handler given to `.then` or `.catch` on the returned promise.

      @method rethrow
      @static
      @for RSVP
      @param {Error} reason reason the promise became rejected.
      @throws Error
      @static
    */
    __exports__['default'] = function rethrow(reason) {
        setTimeout(function () {
            throw reason;
        });
        throw reason;
    };
});
define('rsvp/utils', ['exports'], function (__exports__) {
    'use strict';
    function objectOrFunction(x) {
        return typeof x === 'function' || typeof x === 'object' && x !== null;
    }
    __exports__.objectOrFunction = objectOrFunction;
    function isFunction(x) {
        return typeof x === 'function';
    }
    __exports__.isFunction = isFunction;
    function isMaybeThenable(x) {
        return typeof x === 'object' && x !== null;
    }
    __exports__.isMaybeThenable = isMaybeThenable;
    var _isArray;
    if (!Array.isArray) {
        _isArray = function (x) {
            return Object.prototype.toString.call(x) === '[object Array]';
        };
    } else {
        _isArray = Array.isArray;
    }
    var isArray = _isArray;
    __exports__.isArray = isArray;
    // Date.now is not available in browsers < IE9
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
    var now = Date.now || function () {
            return new Date().getTime();
        };
    __exports__.now = now;
    var o_create = Object.create || function (object) {
            var o = function () {
            };
            o.prototype = object;
            return o;
        };
    __exports__.o_create = o_create;
});
define('rsvp', [
    './rsvp/promise',
    './rsvp/events',
    './rsvp/node',
    './rsvp/all',
    './rsvp/all-settled',
    './rsvp/race',
    './rsvp/hash',
    './rsvp/hash-settled',
    './rsvp/rethrow',
    './rsvp/defer',
    './rsvp/config',
    './rsvp/map',
    './rsvp/resolve',
    './rsvp/reject',
    './rsvp/filter',
    './rsvp/asap',
    'exports'
], function (__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __dependency11__, __dependency12__, __dependency13__, __dependency14__, __dependency15__, __dependency16__, __exports__) {
    'use strict';
    var Promise = __dependency1__['default'];
    var EventTarget = __dependency2__['default'];
    var denodeify = __dependency3__['default'];
    var all = __dependency4__['default'];
    var allSettled = __dependency5__['default'];
    var race = __dependency6__['default'];
    var hash = __dependency7__['default'];
    var hashSettled = __dependency8__['default'];
    var rethrow = __dependency9__['default'];
    var defer = __dependency10__['default'];
    var config = __dependency11__.config;
    var configure = __dependency11__.configure;
    var map = __dependency12__['default'];
    var resolve = __dependency13__['default'];
    var reject = __dependency14__['default'];
    var filter = __dependency15__['default'];
    var asap = __dependency16__['default'];
    config.async = asap;
    // default async is asap;
    function async(callback, arg) {
        config.async(callback, arg);
    }
    function on() {
        config.on.apply(config, arguments);
    }
    function off() {
        config.off.apply(config, arguments);
    }
    // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
    if (typeof window !== 'undefined' && typeof window.__PROMISE_INSTRUMENTATION__ === 'object') {
        var callbacks = window.__PROMISE_INSTRUMENTATION__;
        configure('instrument', true);
        for (var eventName in callbacks) {
            if (callbacks.hasOwnProperty(eventName)) {
                on(eventName, callbacks[eventName]);
            }
        }
    }
    __exports__.Promise = Promise;
    __exports__.EventTarget = EventTarget;
    __exports__.all = all;
    __exports__.allSettled = allSettled;
    __exports__.race = race;
    __exports__.hash = hash;
    __exports__.hashSettled = hashSettled;
    __exports__.rethrow = rethrow;
    __exports__.defer = defer;
    __exports__.denodeify = denodeify;
    __exports__.configure = configure;
    __exports__.on = on;
    __exports__.off = off;
    __exports__.resolve = resolve;
    __exports__.reject = reject;
    __exports__.async = async;
    __exports__.map = map;
    __exports__.filter = filter;
});
global.RSVP = require('rsvp');
}(self));
/*!
 * URI.js - Mutating URLs
 *
 * Version: 1.13.2
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
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
    // Allow instantiation without the 'new' keyword
    if (!(this instanceof URI)) {
      return new URI(url, base);
    }

    if (url === undefined) {
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

  URI.version = '1.13.2';

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

    if (isArray(value)) {
      for (i = 0, length = value.length; i < length; i++) {
        lookup[value[i]] = true;
      }
    } else {
      lookup[value] = true;
    }

    for (i = 0, length = data.length; i < length; i++) {
      if (lookup[data[i]] !== undefined) {
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
    'input': 'src' // but only if type="image"
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
  URI.recodePath = function(string) {
    var segments = (string + '').split('/');
    for (var i = 0, length = segments.length; i < length; i++) {
      segments[i] = URI.encodePathSegment(URI.decode(segments[i]));
    }

    return segments.join('/');
  };
  URI.decodePath = function(string) {
    var segments = (string + '').split('/');
    for (var i = 0, length = segments.length; i < length; i++) {
      segments[i] = URI.decodePathSegment(segments[i]);
    }

    return segments.join('/');
  };
  // generate encode/decode path functions
  var _parts = {'encode':'encode', 'decode':'decode'};
  var _part;
  var generateAccessor = function(_group, _part) {
    return function(string) {
      return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function(c) {
        return URI.characters[_group][_part].map[c];
      });
    };
  };

  for (_part in _parts) {
    URI[_part + 'PathSegment'] = generateAccessor('pathname', _parts[_part]);
  }

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
        } else if (parts.protocol === 'file') {
          // the file scheme: does not contain an authority
          string = string.substring(pos + 3);
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
    } else if (string.indexOf(':') !== string.lastIndexOf(':')) {
      // IPv6 host contains multiple colons - but no port
      // this notation is actually not allowed by RFC 3986, but we're a liberal parser
      parts.hostname = string.substring(0, pos) || null;
      parts.port = null;
    } else {
      t = string.substring(0, pos).split(':');
      parts.hostname = t[0] || null;
      parts.port = t[1] || null;
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
    /*jshint laxbreak: true */
    var pos = firstSlash > -1
      ? string.lastIndexOf('@', firstSlash)
      : string.indexOf('@');
    /*jshint laxbreak: false */
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

      if (items[name]) {
        if (typeof items[name] === 'string') {
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

      data[name] = data[name].concat(value);
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
    } else if (typeof name === 'object') {
      for (key in name) {
        if (hasOwn.call(name, key)) {
          URI.removeQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (value !== undefined) {
        if (data[name] === value) {
          data[name] = undefined;
        } else if (isArray(data[name])) {
          data[name] = filterArrayValues(data[name], value);
        }
      } else {
        data[name] = undefined;
      }
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the first parameter');
    }
  };
  URI.hasQuery = function(data, name, value, withinArray) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          if (!URI.hasQuery(data, key, name[key])) {
            return false;
          }
        }
      }

      return true;
    } else if (typeof name !== 'string') {
      throw new TypeError('URI.hasQuery() accepts an object, string as the name parameter');
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

  // generate simple accessors
  _parts = {protocol: 'protocol', username: 'username', password: 'password', hostname: 'hostname',  port: 'port'};
  generateAccessor = function(_part){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        this._parts[_part] = v || null;
        this.build(!build);
        return this;
      }
    };
  };

  for (_part in _parts) {
    p[_part] = generateAccessor(_parts[_part]);
  }

  // generate accessors with optionally prefixed input
  _parts = {query: '?', fragment: '#'};
  generateAccessor = function(_part, _key){
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
  };

  for (_part in _parts) {
    p[_part] = generateAccessor(_part, _parts[_part]);
  }

  // generate accessors with prefixed output
  _parts = {search: ['?', 'query'], hash: ['#', 'fragment']};
  generateAccessor = function(_part, _key){
    return function(v, build) {
      var t = this[_part](v, build);
      return typeof t === 'string' && t.length ? (_key + t) : t;
    };
  };

  for (_part in _parts) {
    p[_part] = generateAccessor(_parts[_part][1], _parts[_part][0]);
  }

  p.pathname = function(v, build) {
    if (v === undefined || v === true) {
      var res = this._parts.path || (this._parts.hostname ? '/' : '');
      return v ? URI.decodePath(res) : res;
    } else {
      this._parts.path = v ? URI.recodePath(v) : '/';
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

    if (typeof href === 'string') {
      this._parts = URI.parse(href, this._parts);
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
      URI.parseHost(v, x);
      v = x.hostname;
    }
    return _hostname.call(this, v, build);
  };

  // compound accessors
  p.host = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildHost(this._parts) : '';
    } else {
      URI.parseHost(v, this._parts);
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
      URI.parseAuthority(v, this._parts);
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

          segments.push(v[i]);
        }
      } else if (v || (typeof v === 'string')) {
        if (segments[segments.length -1] === '') {
          // empty trailing elements have to be overwritten
          // to prevent results such as /foo//bar
          segments[segments.length -1] = v;
        } else {
          segments.push(v);
        }
      }
    } else {
      if (v || (typeof v === 'string' && v.length)) {
        segments[segment] = v;
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
      v = typeof v === 'string' ? URI.encode(v) : v;
    } else {
      for (i = 0, l = v.length; i < l; i++) {
        v[i] = URI.decode(v[i]);
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

    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          data[key] = name[key];
        }
      }
    } else if (typeof name === 'string') {
      data[name] = value !== undefined ? value : null;
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
    if (this._parts.urn) {
      return this;
    }

    if (!this._parts.path || this._parts.path === '/') {
      return this;
    }

    var _was_relative;
    var _path = this._parts.path;
    var _leadingParents = '';
    var _parent, _pos;

    // handle relative paths
    if (_path.charAt(0) !== '/') {
      _was_relative = true;
      _path = '/' + _path;
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
      _parent = _path.indexOf('/..');
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

    _path = URI.recodePath(_path);
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
    this.normalize();
    URI.encode = e;
    URI.decode = d;
    return this;
  };

  p.unicode = function() {
    // expect iso8859 input, unicode output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = strictEncodeURIComponent;
    URI.decode = unescape;
    this.normalize();
    URI.encode = e;
    URI.decode = d;
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
    common = URI.commonPath(relative.path(), base.path());

    // If the paths have nothing in common, return a relative URL with the absolute path.
    if (!common) {
      return relative.build();
    }

    var parents = baseParts.path
      .substring(common.length)
      .replace(/[^\/]*$/, '')
      .replace(/.*?\//g, '../');

    relativeParts.path = parents + relativeParts.path.substring(common.length);

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

EPUBJS.Book = function(_url){  
  // Promises
  this.opening = new RSVP.defer();
  this.opened = this.opening.promise;
  this.isOpen = false;

  this.url = undefined;

  this.spine = new EPUBJS.Spine(this.request);

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
  this._q = EPUBJS.core.queue(this);

  this.request = this.requestMethod.bind(this);

  if(_url) {
    this.open(_url);
  }
};

EPUBJS.Book.prototype.open = function(_url){
  var uri;
  var parse = new EPUBJS.Parser();
  var epubPackage;
  var book = this;
  var containerPath = "META-INF/container.xml";
  var location;

  if(!_url) {
    this.opening.resolve(this);
    return this.opened;
  }

  // Reuse parsed url or create a new uri object
  if(typeof(_url) === "object") {
    uri = _url;
  } else {
    uri = EPUBJS.core.uri(_url);
  }

  // Find path to the Container
  if(uri.extension === "opf") {
    // Direct link to package, no container
    this.packageUrl = uri.href;
    this.containerUrl = '';
    
    if(uri.origin) {
      this.url = uri.origin + "/" + uri.directory;
    } else if(window){
      location = EPUBJS.core.uri(window.location.href);
      this.url = EPUBJS.core.resolveUrl(location.base, uri.directory);
    } else {
      this.url = uri.directory;
    }

    epubPackage = this.request(this.packageUrl);

  } else if(uri.extension === "epub" || uri.extension === "zip" ) {
      // Book is archived
      this.archived = true;
      this.url = '';
  }

  // Find the path to the Package from the container 
  else if (!uri.extension) {
    
    this.containerUrl = _url + containerPath;

    epubPackage = this.request(this.containerUrl).
      then(function(containerXml){
        return parse.container(containerXml); // Container has path to content
      }).
      then(function(paths){
        var packageUri = EPUBJS.core.uri(paths.packagePath);
        book.packageUrl = _url + paths.packagePath;
        book.url = _url + packageUri.directory; // Set Url relative to the content
        book.encoding = paths.encoding;

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

    this.isOpen = true;

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

EPUBJS.Book.prototype.unpack = function(packageXml){
  var book = this,
      parse = new EPUBJS.Parser();

  book.package = parse.packageContents(packageXml); // Extract info from contents
  book.package.baseUrl = book.url; // Provides a url base for resolving paths

  this.spine.load(book.package);

  book.navigation = new EPUBJS.Navigation(book.package, this.request);
  book.navigation.load().then(function(toc){
    book.toc = toc;
    book.loading.navigation.resolve(book.toc);
  });
  
  // //-- Set Global Layout setting based on metadata
  // MOVE TO RENDER
  // book.globalLayoutProperties = book.parseLayoutProperties(book.package.metadata);

  book.cover = book.url + book.package.coverPath;
};

// Alias for book.spine.get
EPUBJS.Book.prototype.section = function(target) {
  return this.spine.get(target);
};

// Sugar to render a book
EPUBJS.Book.prototype.renderTo = function(element, options) {
  this.rendition = new EPUBJS.Renderer(this, options);
  this.rendition.attachTo(element);
  return this.rendition;
};

EPUBJS.Book.prototype.requestMethod = function(_url) {
  // Switch request methods
  if(this.archived) {
    // TODO: handle archived 
  } else {
    return EPUBJS.core.request(_url, 'xml', this.requestCredentials, this.requestHeaders);
  }

};

EPUBJS.Book.prototype.setRequestCredentials = function(_credentials) {
  this.requestCredentials = _credentials;
};

EPUBJS.Book.prototype.setRequestHeaders = function(_headers) {
  this.requestHeaders = _headers;
};
//-- Enable binding events to book
RSVP.EventTarget.mixin(EPUBJS.Book.prototype);

//-- Handle RSVP Errors
RSVP.on('error', function(event) {
  //console.error(event, event.detail);
});

RSVP.configure('instrument', true); //-- true | will logging out all RSVP rejections
// RSVP.on('created', listener);
// RSVP.on('chained', listener);
// RSVP.on('fulfilled', listener);
RSVP.on('rejected', function(event){
  console.error(event.detail.message, event.detail.stack);
});
EPUBJS.core = {};

EPUBJS.core.request = function(url, type, withCredentials, headers) {
  var supportsURL = window.URL;
  var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";

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

  xhr.open("GET", url, true);

  for(header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }

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

//-- Parse the different parts of a url, returning a object
EPUBJS.core.uri = function(url){
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
    
    uri.directory = EPUBJS.core.folder(uri.path);
    
    uri.base = uri.origin + uri.directory;
    // return origin;
  } else {
    uri.path = url;
    uri.directory = EPUBJS.core.folder(url);
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
EPUBJS.core.folder = function(url){
  
  var lastSlash = url.lastIndexOf('/');
  
  if(lastSlash == -1) var folder = '';
    
  folder = url.slice(0, lastSlash + 1);
  
  return folder;

};


EPUBJS.core.queue = function(_scope){
  var _q = [];
  var scope = _scope;
  // Add an item to the queue
  var enqueue = function(funcName, args, context) {
    _q.push({
      "funcName" : funcName,
      "args"     : args,
      "context"  : context
    });
    return _q;
  };
  // Run one item
  var dequeue = function(){
    var inwait;
    if(_q.length) {
      inwait = _q.shift();
      // Defer to any current tasks
      // setTimeout(function(){
      scope[inwait.funcName].apply(inwait.context || scope, inwait.args);
      // }, 0);
    }
  };
  
  // Run All
  var flush = function(){
    while(_q.length) {
      dequeue();
    }
  };
  // Clear all items in wait
  var clear = function(){
    _q = [];
  };
  
  var length = function(){
    return _q.length;
  };
  
  return {
    "enqueue" : enqueue,
    "dequeue" : dequeue,
    "flush" : flush,
    "clear" : clear,
    "length" : length
  };
};

EPUBJS.core.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
};

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
EPUBJS.core.uuid = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid;
};

// From Lodash
EPUBJS.core.values = function(object) {
  var index = -1,
      props = Object.keys(object),
      length = props.length,
      result = Array(length);

  while (++index < length) {
    result[index] = object[props[index]];
  }
  return result;
};

EPUBJS.core.resolveUrl = function(base, path) {
  var url = [],
    segments = [],
    baseUri = EPUBJS.core.uri(base),
    pathUri = EPUBJS.core.uri(path),
    baseDirectory = baseUri.directory,
    pathDirectory = pathUri.directory,
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


  directories = baseDirectory.split("/");

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

  url = url.concat(baseUri.origin, directories, segments, pathUri.filename);

  return url.join("/");
};

EPUBJS.core.documentHeight = function() {
  return Math.max(
      document.documentElement.clientHeight,
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
  );
};

EPUBJS.core.isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

EPUBJS.core.prefixed = function(unprefixed) {
  var vendors = ["Webkit", "Moz", "O", "ms" ],
    prefixes = ['-Webkit-', '-moz-', '-o-', '-ms-'],
    upper = unprefixed[0].toUpperCase() + unprefixed.slice(1),
    length = vendors.length;
  
  if (typeof(document.body.style[unprefixed]) != 'undefined') {
    return unprefixed;
  }

  for ( var i=0; i < length; i++ ) {
    if (typeof(document.body.style[vendors[i] + upper]) != 'undefined') {
      return vendors[i] + upper;
    }
  }

  return unprefixed;
};

EPUBJS.core.defaults = function(obj) {
  for (var i = 1, length = arguments.length; i < length; i++) {
    var source = arguments[i];
    for (var prop in source) {
      if (obj[prop] === void 0) obj[prop] = source[prop];
    }
  }
  return obj;
};

EPUBJS.EpubCFI = function(cfiStr){
  if(cfiStr) return this.parse(cfiStr);
};

EPUBJS.EpubCFI.prototype.generateChapterComponent = function(_spineNodeIndex, _pos, id) {
  var pos = parseInt(_pos),
    spineNodeIndex = _spineNodeIndex + 1,
    cfi = '/'+spineNodeIndex+'/';

  cfi += (pos + 1) * 2;

  if(id) cfi += "[" + id + "]";

  //cfi += "!";

  return cfi;
};

EPUBJS.EpubCFI.prototype.generatePathComponent = function(steps) {
  var parts = [];

  steps.forEach(function(part){
    var segment = '';
    segment += (part.index + 1) * 2;

    if(part.id) {
      segment += "[" + part.id + "]";
    }

    parts.push(segment);
  });

  return parts.join('/');
};

EPUBJS.EpubCFI.prototype.generateCfiFromElement = function(element, chapter) {
  var steps = this.pathTo(element);
  var path = this.generatePathComponent(steps);
  if(!path.length) {
    // Start of Chapter
    return "epubcfi(" + chapter + "!/4/)";
  } else {
    // First Text Node
    return "epubcfi(" + chapter + "!" + path + "/1:0)";
  }
};

EPUBJS.EpubCFI.prototype.pathTo = function(node) {
  var stack = [],
      children;

  while(node && node.parentNode !== null && node.parentNode.nodeType != 9) {
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
};

EPUBJS.EpubCFI.prototype.getChapterComponent = function(cfiStr) {

  var splitStr = cfiStr.split("!");

  return splitStr[0];
};

EPUBJS.EpubCFI.prototype.getPathComponent = function(cfiStr) {

  var splitStr = cfiStr.split("!");
  var pathComponent = splitStr[1] ? splitStr[1].split(":") : '';

  return pathComponent[0];
};

EPUBJS.EpubCFI.prototype.getCharecterOffsetComponent = function(cfiStr) {
  var splitStr = cfiStr.split(":");
  return splitStr[1] || '';
};


EPUBJS.EpubCFI.prototype.parse = function(cfiStr) {
  var cfi = {},
    chapSegment,
    chapterComponent,
    pathComponent,
    charecterOffsetComponent,
    assertion,
    chapId,
    path,
    end,
    endInt,
    text,
    parseStep = function(part){
      var type, index, has_brackets, id;
      
      type = "element";
      index = parseInt(part) / 2 - 1;
      has_brackets = part.match(/\[(.*)\]/);
      if(has_brackets && has_brackets[1]){
        id = has_brackets[1];
      }
      
      return {
        "type" : type,
        'index' : index,
        'id' : id || false
      };
    };
  
  if(typeof cfiStr !== "string") {
    return {spinePos: -1};
  }

  cfi.str = cfiStr;

  if(cfiStr.indexOf("epubcfi(") === 0 && cfiStr[cfiStr.length-1] === ")") {
    // Remove intial epubcfi( and ending )
    cfiStr = cfiStr.slice(8, cfiStr.length-1);
  }

  chapterComponent = this.getChapterComponent(cfiStr);
  pathComponent = this.getPathComponent(cfiStr) || '';
  charecterOffsetComponent = this.getCharecterOffsetComponent(cfiStr);
  // Make sure this is a valid cfi or return
  if(!chapterComponent) {
    return {spinePos: -1};
  }
  
  // Chapter segment is always the second one
  chapSegment = chapterComponent.split("/")[2] || '';
  if(!chapSegment) return {spinePos:-1};

  cfi.spinePos = (parseInt(chapSegment) / 2 - 1 ) || 0;

  chapId = chapSegment.match(/\[(.*)\]/);

  cfi.spineId = chapId ? chapId[1] : false;

  if(pathComponent.indexOf(',') != -1) {
    // Handle ranges -- not supported yet
    console.warn("CFI Ranges are not supported");
  }

  path = pathComponent.split('/');
  end = path.pop();

  cfi.steps = [];

  path.forEach(function(part){
    var step;
    
    if(part) {
      step = parseStep(part);
      cfi.steps.push(step);
    }
  });

  //-- Check if END is a text node or element
  endInt = parseInt(end);
  if(!isNaN(endInt)) {
    
    if(endInt % 2 === 0) { // Even = is an element
      cfi.steps.push(parseStep(end));
    } else {
      cfi.steps.push({
        "type" : "text",
        'index' : (endInt - 1 ) / 2
      });
    }

  }

  assertion = charecterOffsetComponent.match(/\[(.*)\]/);
  if(assertion && assertion[1]){
    cfi.characterOffset = parseInt(charecterOffsetComponent.split('[')[0]);
    // We arent handling these assertions yet
    cfi.textLocationAssertion = assertion[1];
  } else {
    cfi.characterOffset = parseInt(charecterOffsetComponent);
  }
  
  return cfi;
};

EPUBJS.EpubCFI.prototype.addMarker = function(cfi, _doc, _marker) {
  var doc = _doc || document;
  var marker = _marker || this.createMarker(doc);
  var parent;
  var lastStep;
  var text;
  var split;
  
  if(typeof cfi === 'string') {
    cfi = this.parse(cfi);
  }
  // Get the terminal step
  lastStep = cfi.steps[cfi.steps.length-1];

  // check spinePos
  if(cfi.spinePos === -1) {
    // Not a valid CFI
    return false;
  }

  // Find the CFI elements parent
  parent = this.findParent(cfi, doc);
  
  if(!parent) {
    // CFI didn't return an element
    // Maybe it isnt in the current chapter?
    return false;
  }
  
  if(lastStep && lastStep.type === "text") {
    text = parent.childNodes[lastStep.index];
    if(cfi.characterOffset){
      split = text.splitText(cfi.characterOffset);
      marker.classList.add("EPUBJS-CFI-SPLIT");
      parent.insertBefore(marker, split);
    } else {
      parent.insertBefore(marker, text);
    }
  } else {
    parent.insertBefore(marker, parent.firstChild);
  }
  
  return marker;
};

EPUBJS.EpubCFI.prototype.createMarker = function(_doc) {
  var doc = _doc || document;
  var element = doc.createElement('span');
  element.id = "EPUBJS-CFI-MARKER:"+ EPUBJS.core.uuid();
  element.classList.add("EPUBJS-CFI-MARKER");
  
  return element;
};

EPUBJS.EpubCFI.prototype.removeMarker = function(marker, _doc) {
  var doc = _doc || document;
  // var id = marker.id;

  // Cleanup textnodes if they were split
  if(marker.classList.contains("EPUBJS-CFI-SPLIT")){
    nextSib = marker.nextSibling;
    prevSib = marker.previousSibling;
    if(nextSib &&
        prevSib &&
        nextSib.nodeType === 3 &&
        prevSib.nodeType === 3){

      prevSib.textContent += nextSib.textContent;
      marker.parentNode.removeChild(nextSib);
    }
    marker.parentNode.removeChild(marker);
  } else if(marker.classList.contains("EPUBJS-CFI-MARKER")) {
    // Remove only elements added as markers
    marker.parentNode.removeChild(marker);
  }

};

EPUBJS.EpubCFI.prototype.findParent = function(cfi, _doc) {
  var doc = _doc || document,
      element = doc.getElementsByTagName('html')[0],
      children = Array.prototype.slice.call(element.children),
      num, index, part, sections,
      text, textBegin, textEnd;

  if(typeof cfi === 'string') {
    cfi = this.parse(cfi);
  }
  
  sections = cfi.steps.slice(0); // Clone steps array
  if(!sections.length) {
    return doc.getElementsByTagName('body')[0];
  }

  while(sections && sections.length > 0) {
    part = sections.shift();
    // Find textNodes Parent
    if(part.type === "text") {
      text = element.childNodes[part.index];
      element = text.parentNode || element;
    // Find element by id if present
    } else if(part.id){
      element = doc.getElementById(part.id);
    // Find element in parent
    }else{
      element = children[part.index];
    }
    // Element can't be found
    if(typeof element === "undefined") {
      console.error("No Element For", part, cfi.str);
      return false;
    }
    // Get current element children and continue through steps
    children = Array.prototype.slice.call(element.children);
  }

  return element;
};

EPUBJS.EpubCFI.prototype.compare = function(cfiOne, cfiTwo) {
  if(typeof cfiOne === 'string') {
    cfiOne = new EPUBJS.EpubCFI(cfiOne);
  }
  if(typeof cfiTwo === 'string') {
    cfiTwo = new EPUBJS.EpubCFI(cfiTwo);
  }
  // Compare Spine Positions
  if(cfiOne.spinePos > cfiTwo.spinePos) {
    return 1;
  }
  if(cfiOne.spinePos < cfiTwo.spinePos) {
    return -1;
  }
  
  
  // Compare Each Step in the First item
  for (var i = 0; i < cfiOne.steps.length; i++) {
    if(!cfiTwo.steps[i]) {
      return 1;
    }
    if(cfiOne.steps[i].index > cfiTwo.steps[i].index) {
      return 1;
    }
    if(cfiOne.steps[i].index < cfiTwo.steps[i].index) {
      return -1;
    }
    // Otherwise continue checking
  }
  
  // All steps in First present in Second
  if(cfiOne.steps.length < cfiTwo.steps.length) {
    return -1;
  }

  // Compare the charecter offset of the text node
  if(cfiOne.characterOffset > cfiTwo.characterOffset) {
    return 1;
  }
  if(cfiOne.characterOffset < cfiTwo.characterOffset) {
    return -1;
  }

  // CFI's are equal
  return 0;
};

EPUBJS.EpubCFI.prototype.generateCfiFromHref = function(href, book) {
  var uri = EPUBJS.core.uri(href);
  var path = uri.path;
  var fragment = uri.fragment;
  var spinePos = book.spineIndexByURL[path];
  var loaded;
  var deferred = new RSVP.defer();
  var epubcfi = new EPUBJS.EpubCFI();
  var spineItem;
  
  if(typeof spinePos !== "undefined"){
    spineItem = book.spine[spinePos];
    loaded = book.loadXml(spineItem.url);
    loaded.then(function(doc){
      var element = doc.getElementById(fragment);
      var cfi;
      cfi = epubcfi.generateCfiFromElement(element, spineItem.cfiBase);
      deferred.resolve(cfi);
    });
  }
  
  return deferred.promise;
};

EPUBJS.EpubCFI.prototype.generateCfiFromTextNode = function(anchor, offset, base) {
  var parent = anchor.parentNode;
  var steps = this.pathTo(parent);
  var path = this.generatePathComponent(steps);
  var index = 1 + (2 * Array.prototype.indexOf.call(parent.childNodes, anchor));
  return "epubcfi(" + base + "!" + path + "/"+index+":"+(offset || 0)+")";
};

EPUBJS.EpubCFI.prototype.generateCfiFromRangeAnchor = function(range, base) {
  var anchor = range.anchorNode;
  var offset = range.anchorOffset;
  return this.generateCfiFromTextNode(anchor, offset, base);
};

EPUBJS.EpubCFI.prototype.generateCfiFromRange = function(range, base) {
  var start, startElement, startSteps, startPath, startOffset, startIndex;
  var end, endElement, endSteps, endPath, endOffset, endIndex;

  start = range.startContainer;
  
  if(start.nodeType === 3) { // text node
    startElement = start.parentNode;
    //startIndex = 1 + (2 * Array.prototype.indexOf.call(startElement.childNodes, start));
    startIndex = 1 + (2 * EPUBJS.core.indexOfTextNode(start));
    startSteps = this.pathTo(startElement);
  } else if(range.collapsed) {
    return this.generateCfiFromElement(start, base); // single element
  } else {
    startSteps = this.pathTo(start);
  }
  
  startPath = this.generatePathComponent(startSteps);
  startOffset = range.startOffset;
  
  if(!range.collapsed) {
    end = range.endContainer;
    
    if(end.nodeType === 3) { // text node
      endElement = end.parentNode;
      // endIndex = 1 + (2 * Array.prototype.indexOf.call(endElement.childNodes, end));     
      endIndex = 1 + (2 * EPUBJS.core.indexOfTextNode(end));
      
      endSteps = this.pathTo(endElement);
    } else {
      endSteps = this.pathTo(end);
    }

    endPath = this.generatePathComponent(endSteps);
    endOffset = range.endOffset;

    return "epubcfi(" + base + "!" + startPath + "/" + startIndex + ":" + startOffset + "," + endPath + "/" + endIndex + ":" + endOffset + ")";
    
  } else {
    return "epubcfi(" + base + "!" + startPath + "/"+ startIndex +":"+ startOffset +")";
  }
};

EPUBJS.EpubCFI.prototype.generateXpathFromSteps = function(steps) {
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


EPUBJS.EpubCFI.prototype.generateRangeFromCfi = function(cfi, _doc) {
  var doc = _doc || document;
  var range = doc.createRange();
  var lastStep;
  var xpath;
  var startContainer;
  var textLength;
  
  if(typeof cfi === 'string') {
    cfi = this.parse(cfi);
  }
  
  // check spinePos
  if(cfi.spinePos === -1) {
    // Not a valid CFI
    return false;
  }
    
  xpath = this.generateXpathFromSteps(cfi.steps);
  
  // Get the terminal step
  lastStep = cfi.steps[cfi.steps.length-1];
  startContainer = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  if(!startContainer) {
    return null;
  }

  if(startContainer && cfi.characterOffset >= 0) {
    textLength = startContainer.length;

    if(cfi.characterOffset < textLength) {
      range.setStart(startContainer, cfi.characterOffset);
      range.setEnd(startContainer, textLength );
    } else {
      console.debug("offset greater than length:", cfi.characterOffset, textLength);
      range.setStart(startContainer, textLength - 1 );
      range.setEnd(startContainer, textLength );  
    }
  } else if(startContainer) {
    range.selectNode(startContainer);
  }
  // doc.defaultView.getSelection().addRange(range);
  return range;
};

EPUBJS.Hook = function(context){
  this.context = context || this;
  this.hooks = [];
};

//-- Hooks allow for injecting async functions that must all complete in order before finishing 
//   Functions must return a promise.

// this.beforeDisplay = new EPUBJS.Hook();
// this.beforeDisplay.register(function(){});
// this.beforeDisplay.trigger(args).then(function(){});

// Adds a function to be run before a hook completes
EPUBJS.Hook.prototype.register = function(func){
  this.hooks.push(func);
};

// Triggers a hook to run all functions
EPUBJS.Hook.prototype.trigger = function(){
  var length = this.hooks.length;
  var current = 0;
  var executing;
  var defer = new RSVP.defer();
  var args = arguments;

  if(length) {

    executing = this.hooks[current].apply(this.context, args);
    executing.then(function(){
      current += 1;
      if(current < length) {
        return this.hooks[current].apply(this.context, args);
      }
    }.bind(this));
    
  } else {
    executing = defer.promise;
    defer.resolve();
  }

  return executing;
};
EPUBJS.Infinite = function(container, axis){
  this.container = container;
  this.windowHeight = window.innerHeight;
  this.tick = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  this.scrolled = false;
  this.ignore = false;
  this.displaying = false;
  this.offset = 900;
  this.views = [];
  this.axis = axis;
  // this.renderer = renderer;
  this.prevScrollTop = 0;
};

EPUBJS.Infinite.prototype.start = function() {
  
  var firstScroll = true;

  this.container.addEventListener("scroll", function(e){
    if(!this.ignore) {
      this.scrolled = true;
    } else {
      this.ignore = false;
    }
  }.bind(this));
  
  // Reset to prevent jump
  window.addEventListener('unload', function(e){
    this.ignore = true;
    // window.scroll(0,0);
  });

  this.tick.call(window, this.check.bind(this));

  this.scrolled = false;

};

EPUBJS.Infinite.prototype.forwards = function() {
  this.trigger("forwards");

};

EPUBJS.Infinite.prototype.backwards = function() {
  this.trigger("backwards");
};


EPUBJS.Infinite.prototype.check = function(){

  if(this.scrolled && !this.displaying) {

    if(this.axis === "vertical") {
      this.checkTop();
    } else {
      this.checkLeft();
    }
    
    this.scrolled = false;
  } else {
    this.displaying = false;
    this.scrolled = false;
  }

  this.tick.call(window, this.check.bind(this));
}

EPUBJS.Infinite.prototype.checkTop = function(){
    
    var scrollTop = this.container.scrollTop;
    var scrollHeight = this.container.scrollHeight;
    var direction = scrollTop - this.prevScrollTop;
    var height = this.container.getBoundingClientRect().height;

    var up = scrollTop + this.offset > scrollHeight-height;
    var down = scrollTop < this.offset;

    // Add to bottom
    if(up && direction > 0) {
      this.forwards();
    }
    // Add to top
    else if(down && direction < 0) {
      this.backwards();
    }

    // console.log(scrollTop)
    this.prevScrollTop = scrollTop;

    return scrollTop;
};

EPUBJS.Infinite.prototype.checkLeft = function(){
    
    var scrollLeft = this.container.scrollLeft;

    var scrollWidth = this.container.scrollWidth;

    var direction = scrollLeft - this.prevscrollLeft;

    var width = this.container.getBoundingClientRect().width;

    var right = scrollLeft + this.offset > scrollWidth-width;
    var left = scrollLeft < this.offset;

    // Add to bottom
    if(right && direction > 0) {
      this.forwards();
    }
    // Add to top
    else if(left && direction < 0) {
      this.backwards();
    }

    // console.log(scrollTop)
    this.prevscrollLeft = scrollLeft;

    return scrollLeft;
};

EPUBJS.Infinite.prototype.scrollBy = function(x, y, silent){
  if(silent) {
    this.displaying = true;
  }
  this.container.scrollLeft += x;
  this.container.scrollTop += y;
  
  this.scrolled = true;
  this.check();
};

EPUBJS.Infinite.prototype.scroll = function(x, y, silent){
  if(silent) {
    this.displaying = true;
  }
  this.container.scrollLeft = x;
  this.container.scrollTop = y;

  this.scrolled = true;
  this.check();
};

RSVP.EventTarget.mixin(EPUBJS.Infinite.prototype);
EPUBJS.Layout = EPUBJS.Layout || {};

EPUBJS.Layout.Reflowable = function(){
  this.documentElement = null;
  this.spreadWidth = null;
};

EPUBJS.Layout.Reflowable.prototype.format = function(documentElement, _width, _height, _gap){
  // Get the prefixed CSS commands
  var columnAxis = EPUBJS.core.prefixed('columnAxis');
  var columnGap = EPUBJS.core.prefixed('columnGap');
  var columnWidth = EPUBJS.core.prefixed('columnWidth');
  var columnFill = EPUBJS.core.prefixed('columnFill');

  //-- Check the width and create even width columns
  var width = Math.floor(_width);
  // var width = (fullWidth % 2 === 0) ? fullWidth : fullWidth - 0; // Not needed for single
  var section = Math.floor(width / 8);
  var gap = (_gap >= 0) ? _gap : ((section % 2 === 0) ? section : section - 1);
  this.documentElement = documentElement;
  //-- Single Page
  this.spreadWidth = (width + gap);


  documentElement.style.overflow = "hidden";

  // Must be set to the new calculated width or the columns will be off
  documentElement.style.width = width + "px";

  //-- Adjust height
  documentElement.style.height = _height + "px";

  //-- Add columns
  documentElement.style[columnAxis] = "horizontal";
  documentElement.style[columnFill] = "auto";
  documentElement.style[columnWidth] = width+"px";
  documentElement.style[columnGap] = gap+"px";
  this.colWidth = width;
  this.gap = gap;

  return {
    pageWidth : this.spreadWidth,
    pageHeight : _height
  };
};

EPUBJS.Layout.Reflowable.prototype.calculatePages = function() {
  var totalWidth, displayedPages;
  this.documentElement.style.width = "auto"; //-- reset width for calculations
  totalWidth = this.documentElement.scrollWidth;
  displayedPages = Math.ceil(totalWidth / this.spreadWidth);

  return {
    displayedPages : displayedPages,
    pageCount : displayedPages
  };
};

EPUBJS.Layout.ReflowableSpreads = function(){
  this.documentElement = null;
  this.spreadWidth = null;
};

EPUBJS.Layout.ReflowableSpreads.prototype.format = function(view, _width, _height, _gap){
  var columnAxis = EPUBJS.core.prefixed('columnAxis');
  var columnGap = EPUBJS.core.prefixed('columnGap');
  var columnWidth = EPUBJS.core.prefixed('columnWidth');
  var columnFill = EPUBJS.core.prefixed('columnFill');

  var divisor = 2,
      cutoff = 800;

  //-- Check the width and create even width columns
  var fullWidth = Math.floor(_width);
  var width = (fullWidth % 2 === 0) ? fullWidth : fullWidth - 1;

  var section = Math.floor(width / 8);
  var gap = (_gap >= 0) ? _gap : ((section % 2 === 0) ? section : section - 1);

  //-- Double Page
  var colWidth = Math.floor((width - gap) / divisor);

  this.spreadWidth = (colWidth + gap) * divisor;


  view.document.documentElement.style.overflow = "hidden";

  // Must be set to the new calculated width or the columns will be off
  view.document.body.style.width = width + "px";

  //-- Adjust height
  view.document.body.style.height = _height + "px";

  //-- Add columns
  view.document.body.style[columnAxis] = "horizontal";
  view.document.body.style[columnFill] = "auto";
  view.document.body.style[columnGap] = gap+"px";
  view.document.body.style[columnWidth] = colWidth+"px";

  this.colWidth = colWidth;
  this.gap = gap;

  view.iframe.style.width = colWidth+"px";
  view.iframe.style.paddingRight = gap+"px";

  return {
    pageWidth : this.spreadWidth,
    pageHeight : _height
  };
};

EPUBJS.Layout.ReflowableSpreads.prototype.calculatePages = function() {
  var totalWidth = this.documentElement.scrollWidth;
  var displayedPages = Math.ceil(totalWidth / this.spreadWidth);

  //-- Add a page to the width of the document to account an for odd number of pages
  this.documentElement.style.width = totalWidth + this.spreadWidth + "px";
  return {
    displayedPages : displayedPages,
    pageCount : displayedPages * 2
  };
};

EPUBJS.Layout.Fixed = function(){
  this.documentElement = null;
};

EPUBJS.Layout.Fixed = function(documentElement, _width, _height, _gap){
  var columnWidth = EPUBJS.core.prefixed('columnWidth');
  var viewport = documentElement.querySelector("[name=viewport");
  var content;
  var contents;
  var width, height;

  this.documentElement = documentElement;
  /**
  * check for the viewport size
  * <meta name="viewport" content="width=1024,height=697" />
  */
  if(viewport && viewport.hasAttribute("content")) {
    content = viewport.getAttribute("content");
    contents = content.split(',');
    if(contents[0]){
      width = contents[0].replace("width=", '');
    }
    if(contents[1]){
      height = contents[1].replace("height=", '');
    }
  }

  //-- Adjust width and height
  documentElement.style.width =  width + "px" || "auto";
  documentElement.style.height =  height + "px" || "auto";

  //-- Remove columns
  documentElement.style[columnWidth] = "auto";

  //-- Scroll
  documentElement.style.overflow = "auto";

  this.colWidth = width;
  this.gap = 0;

  return {
    pageWidth : width,
    pageHeight : height
  };

};

EPUBJS.Layout.Fixed.prototype.calculatePages = function(){
  return {
    displayedPages : 1,
    pageCount : 1
  };
};

/*
EPUBJS.Renderer.prototype.listeners = function(){
  // Dom events to listen for
  this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click"];
  this.upEvent = "mouseup";
  this.downEvent = "mousedown";
  if('ontouchstart' in document.documentElement) {
    this.listenedEvents.push("touchstart", "touchend");
    this.upEvent = "touchend";
    this.downEvent = "touchstart";
  }

  // Resize events
  // this.resized = _.debounce(this.onResized.bind(this), 100);

};

//-- Listeners for events in the frame

EPUBJS.Renderer.prototype.onResized = function(e) {
  var width = this.container.clientWidth;
  var height = this.container.clientHeight;

  this.resize(width, height, false);
};

EPUBJS.Renderer.prototype.addEventListeners = function(){
  if(!this.render.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.render.document.addEventListener(eventName, this.triggerEvent.bind(this), false);
  }, this);

};

EPUBJS.Renderer.prototype.removeEventListeners = function(){
  if(!this.render.document) {
    return;
  }
  this.listenedEvents.forEach(function(eventName){
    this.render.document.removeEventListener(eventName, this.triggerEvent, false);
  }, this);

};

// Pass browser events
EPUBJS.Renderer.prototype.triggerEvent = function(e){
  this.trigger("renderer:"+e.type, e);
};

EPUBJS.Renderer.prototype.addSelectionListeners = function(){
  this.render.document.addEventListener("selectionchange", this.onSelectionChange.bind(this), false);
};

EPUBJS.Renderer.prototype.removeSelectionListeners = function(){
  if(!this.render.document) {
    return;
  }
  this.doc.removeEventListener("selectionchange", this.onSelectionChange, false);
};

EPUBJS.Renderer.prototype.onSelectionChange = function(e){
  if (this.selectionEndTimeout) {
    clearTimeout(this.selectionEndTimeout);
  }
  this.selectionEndTimeout = setTimeout(function() {
    this.selectedRange = this.render.window.getSelection();
    this.trigger("renderer:selected", this.selectedRange);
  }.bind(this), 500);
};
*/
EPUBJS.Navigation = function(_package, _request){
  var navigation = this;
  var parse = new EPUBJS.Parser();
  var request = _request || EPUBJS.core.request;

  this.package = _package;
  this.toc = [];
  this.tocByHref = {};
  this.tocById = {};

  if(_package.navPath) {
    this.navUrl = _package.baseUrl + _package.navPath;
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
    this.ncxUrl = _package.baseUrl + _package.ncxPath;
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
EPUBJS.Navigation.prototype.load = function(_request) {
  var request = _request || EPUBJS.core.request;
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

EPUBJS.Navigation.prototype.loaded = function(toc) {
  var item;

  for (var i = 0; i < toc.length; i++) {
    var item = toc[i];
    this.tocByHref[item.href] = i;
    this.tocById[item.id] = i;
  };

};

// Get an item from the navigation
EPUBJS.Navigation.prototype.get = function(target) {
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
EPUBJS.Paginate = function(renderer, _options) {
  var options = _options || {};
  var defaults = {
    width: 600,
    height: 400,
    forceSingle: false,
    minSpreadWidth: 800, //-- overridden by spread: none (never) / both (always)
    gap: "auto", //-- "auto" or int
    layoutOveride : null // Default: { spread: 'reflowable', layout: 'auto', orientation: 'auto'}
  };

  this.settings = EPUBJS.core.defaults(options, defaults);
  this.renderer = renderer;

  this.isForcedSingle = false;

  this.initialize();
};

EPUBJS.Paginate.prototype.determineSpreads = function(cutoff){
  if(this.isForcedSingle || !cutoff || this.width < cutoff) {
    return false; //-- Single Page
  }else{
    return true; //-- Double Page
  }
};

EPUBJS.Paginate.prototype.forceSingle = function(bool){
  if(bool) {
    this.isForcedSingle = true;
    // this.spreads = false;
  } else {
    this.isForcedSingle = false;
    // this.spreads = this.determineSpreads(this.minSpreadWidth);
  }
};

/**
* Uses the settings to determine which Layout Method is needed
* Triggers events based on the method choosen
* Takes: Layout settings object
* Returns: String of appropriate for EPUBJS.Layout function
*/
EPUBJS.Paginate.prototype.determineLayout = function(settings){
  // Default is layout: reflowable & spread: auto
  var spreads = this.determineSpreads(this.settings.minSpreadWidth);
  var layoutMethod = spreads ? "ReflowableSpreads" : "Reflowable";
  var scroll = false;

  if(settings.layout === "pre-paginated") {
    layoutMethod = "Fixed";
    scroll = true;
    spreads = false;
  }

  if(settings.layout === "reflowable" && settings.spread === "none") {
    layoutMethod = "Reflowable";
    scroll = false;
    spreads = false;
  }

  if(settings.layout === "reflowable" && settings.spread === "both") {
    layoutMethod = "ReflowableSpreads";
    scroll = false;
    spreads = true;
  }

  this.spreads = spreads;
  // this.render.scroll(scroll);

  return layoutMethod;
};

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* Takes: global layout settings object, chapter properties string
* Returns: Object with layout properties
*/
EPUBJS.Paginate.prototype.reconcileLayoutSettings = function(global, chapter){
  var settings = {};

  //-- Get the global defaults
  for (var attr in global) {
    if (global.hasOwnProperty(attr)){
      settings[attr] = global[attr];
    }
  }
  //-- Get the chapter's display type
  chapter.forEach(function(prop){
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

EPUBJS.Paginate.prototype.initialize = function(){
  // On display
  // this.layoutSettings = this.reconcileLayoutSettings(globalLayout, chapter.properties);
  // this.layoutMethod = this.determineLayout(this.layoutSettings);
  // this.layout = new EPUBJS.Layout[this.layoutMethod]();
  this.renderer.hooks.display.register(this.registerLayoutMethod.bind(this));
};

EPUBJS.Paginate.prototype.registerLayoutMethod = function(view) {
  var task = new RSVP.defer();

  this.layoutMethod = this.determineLayout({});
  this.layout = new EPUBJS.Layout[this.layoutMethod]();
  this.formated = this.layout.format(view, this.settings.width, this.settings.height, this.settings.gap);

  task.resolve();
  return task.promise;
};

EPUBJS.Paginate.prototype.page = function(pg){

 
  //-- Return false if page is greater than the total
  return false;
};

EPUBJS.Paginate.prototype.next = function(){
  // return this.page(this.chapterPos + 1);
  console.log("next", this.formated.pageWidth)
  this.renderer.infinite.scrollBy(this.formated.pageWidth, 0);
};

EPUBJS.Paginate.prototype.prev = function(){
  console.log("prev", this.formated.pageWidth)
  this.renderer.infinite.scrollBy(-this.formated.pageWidth, 0);
};

EPUBJS.Paginate.prototype.display = function(what){
  return this.renderer.display(what)
};
EPUBJS.Parser = function(){};

EPUBJS.Parser.prototype.container = function(containerXml){
    //-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
    var rootfile, fullpath, folder, encoding;
    
    if(!containerXml) {
      console.error("Container File Not Found");
      return;
    }
    
    rootfile = containerXml.querySelector("rootfile");
    
    if(!rootfile) {
      console.error("No RootFile Found");
      return;
    }
    
    fullpath = rootfile.getAttribute('full-path');
    folder = EPUBJS.core.uri(fullpath).directory;
    encoding = containerXml.xmlEncoding;

    //-- Now that we have the path we can parse the contents
    return {
      'packagePath' : fullpath,
      'basePath' : folder,
      'encoding' : encoding
    };
};

EPUBJS.Parser.prototype.identifier = function(packageXml){
  var metadataNode;
  
  if(!packageXml) {
    console.error("Package File Not Found");
    return;
  }
  
  metadataNode = packageXml.querySelector("metadata");
  
  if(!metadataNode) {
    console.error("No Metadata Found");
    return;
  }
  
  return this.getElementText(metadataNode, "identifier");
};

EPUBJS.Parser.prototype.packageContents = function(packageXml){
  var parse = this;
  var metadataNode, manifestNode, spineNode;
  var manifest, navPath, ncxPath, coverPath;
  var spineNodeIndex;
  var spine;
  var spineIndexByURL;
    
  if(!packageXml) {
    console.error("Package File Not Found");
    return;
  }
  
  metadataNode = packageXml.querySelector("metadata");
  if(!metadataNode) {
    console.error("No Metadata Found");
    return;
  }
  
  manifestNode = packageXml.querySelector("manifest");
  if(!manifestNode) {
    console.error("No Manifest Found");
    return;
  }
  
  spineNode = packageXml.querySelector("spine");
  if(!spineNode) {
    console.error("No Spine Found");
    return;
  }
  
  manifest = parse.manifest(manifestNode);
  navPath = parse.findNavPath(manifestNode);
  ncxPath = parse.findNcxPath(manifestNode);
  coverPath = parse.findCoverPath(manifestNode);

  spineNodeIndex = Array.prototype.indexOf.call(spineNode.parentNode.childNodes, spineNode);
  
  spine = parse.spine(spineNode, manifest);

  return {
    'metadata' : parse.metadata(metadataNode),
    'spine'    : spine,
    'manifest' : manifest,
    'navPath'  : navPath,
    'ncxPath'  : ncxPath,
    'coverPath': coverPath,
    'spineNodeIndex' : spineNodeIndex
  };
};

//-- Find TOC NAV: media-type="application/xhtml+xml" href="toc.ncx"
EPUBJS.Parser.prototype.findNavPath = function(manifestNode){
  var node = manifestNode.querySelector("item[properties^='nav']");
  return node ? node.getAttribute('href') : false;
};

//-- Find TOC NCX: media-type="application/x-dtbncx+xml" href="toc.ncx"
EPUBJS.Parser.prototype.findNcxPath = function(manifestNode){
  var node = manifestNode.querySelector("item[media-type='application/x-dtbncx+xml']");
  return node ? node.getAttribute('href') : false;
};

//-- Find Cover: <item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />
EPUBJS.Parser.prototype.findCoverPath = function(manifestNode){
  var node = manifestNode.querySelector("item[properties='cover-image']");
  return node ? node.getAttribute('href') : false;
};

//-- Expanded to match Readium web components
EPUBJS.Parser.prototype.metadata = function(xml){
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
  
  metadata.modified_date = p.querySelectorText(xml, "meta[property='dcterms:modified']");
  metadata.layout = p.querySelectorText(xml, "meta[property='rendition:layout']");
  metadata.orientation = p.querySelectorText(xml, "meta[property='rendition:orientation']");
  metadata.spread = p.querySelectorText(xml, "meta[property='rendition:spread']");
  // metadata.page_prog_dir = packageXml.querySelector("spine").getAttribute("page-progression-direction");
  
  return metadata;
};

EPUBJS.Parser.prototype.getElementText = function(xml, tag){
  var found = xml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", tag),
    el;

  if(!found || found.length === 0) return '';
  
  el = found[0];

  if(el.childNodes.length){
    return el.childNodes[0].nodeValue;
  }

  return '';
  
};

EPUBJS.Parser.prototype.querySelectorText = function(xml, q){
  var el = xml.querySelector(q);

  if(el && el.childNodes.length){
    return el.childNodes[0].nodeValue;
  }

  return '';
};

EPUBJS.Parser.prototype.manifest = function(manifestXml){
  var manifest = {};
  
  //-- Turn items into an array
  var selected = manifestXml.querySelectorAll("item"),
    items = Array.prototype.slice.call(selected);
    
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
      'properties' : properties
    };

  });
  
  return manifest;

};

EPUBJS.Parser.prototype.spine = function(spineXml, manifest){
  var spine = [];
  
  var selected = spineXml.getElementsByTagName("itemref"),
      items = Array.prototype.slice.call(selected);

  // var epubcfi = new EPUBJS.EpubCFI();

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
      'index' : index,
    };
    spine.push(itemref);
  });
  
  return spine;
};

EPUBJS.Parser.prototype.nav = function(navHtml){
  var navEl = navHtml.querySelector('nav[*|type="toc"]'), //-- [*|type="toc"] * Doesn't seem to work
      idCounter = 0;
  
  if(!navEl) return [];
  
  // Implements `> ol > li`
  function findListItems(parent){
    var items = [];
  
    Array.prototype.slice.call(parent.childNodes).forEach(function(node){
      if('ol' == node.tagName){
        Array.prototype.slice.call(node.childNodes).forEach(function(item){
          if('li' == item.tagName){
            items.push(item);
          }
        });
      }
    });
    
    return items;
  
  }
  
  // Implements `> a, > span`
  function findAnchorOrSpan(parent){
    var item = null;
    
    Array.prototype.slice.call(parent.childNodes).forEach(function(node){
      if('a' == node.tagName || 'span' == node.tagName){
        item = node;
      }
    });
    
    return item;
  }
  
  function getTOC(parent){
    var list = [],
        nodes = findListItems(parent),
        items = Array.prototype.slice.call(nodes),
        length = items.length,
        node;
  
    if(length === 0) return false;
    
    items.forEach(function(item){
      var id = item.getAttribute('id') || false,
        content = findAnchorOrSpan(item),
        href = content.getAttribute('href') || '',
        text = content.textContent || "",
        split = href.split("#"),
        baseUrl = split[0],
        subitems = getTOC(item);
        // spinePos = spineIndexByURL[baseUrl],
        // spineItem = bookSpine[spinePos],
        // cfi =   spineItem ? spineItem.cfi : '';
        
      // if(!id) {
      //   if(spinePos) {
      //     spineItem = bookSpine[spinePos];
      //     id = spineItem.id;
      //     cfi = spineItem.cfi;
      //   } else {
      //     id = 'epubjs-autogen-toc-id-' + (idCounter++);
      //   }
      // }
      
      // item.setAttribute('id', id); // Ensure all elements have an id
      list.push({
        "id": id,
        "href": href,
        "label": text,
        "subitems" : subitems,
        "parent" : parent ? parent.getAttribute('id') : null
        // "cfi" : cfi
      });
    
    });
  
    return list;
  }
  
  return getTOC(navEl);
};

EPUBJS.Parser.prototype.ncx = function(tocXml){
  var navMap = tocXml.querySelector("navMap");
  if(!navMap) return [];
  
  function getTOC(parent){
    var list = [],
      snapshot = tocXml.evaluate("*[local-name()='navPoint']", parent, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null),
      length = snapshot.snapshotLength;
    
    if(length === 0) return [];

    for ( var i=length-1 ; i >= 0; i-- ) {
      var item = snapshot.snapshotItem(i);

      var id = item.getAttribute('id') || false,
          content = item.querySelector("content"),
          src = content.getAttribute('src'),
          navLabel = item.querySelector("navLabel"),
          text = navLabel.textContent ? navLabel.textContent : "",
          split = src.split("#"),
          baseUrl = split[0],
          // spinePos = spineIndexByURL[baseUrl],
          // spineItem = bookSpine[spinePos],
          subitems = getTOC(item);
          // cfi =   spineItem ? spineItem.cfi : '';

      // if(!id) {
      //   if(spinePos) {
      //     spineItem = bookSpine[spinePos];
      //     id = spineItem.id;
      //     cfi =   spineItem.cfi;
      //   } else {
      //     id = 'epubjs-autogen-toc-id-' + (idCounter++);
      //   }
      // }

      list.unshift({
            "id": id,
            "href": src,
            "label": text,
            // "spinePos": spinePos,
            "subitems" : subitems,
            "parent" : parent ? parent.getAttribute('id') : null,
            // "cfi" : cfi
      });

    }

    return list;
  }

  return getTOC(navMap);
};
EPUBJS.Renderer = function(book, _options) {
  var options = _options || {};
  this.settings = {
    infinite: typeof(options.infinite) === "undefined" ? true : options.infinite,
    hidden: typeof(options.hidden) === "undefined" ? false : options.hidden,
    axis: options.axis || "vertical",
    viewsLimit: options.viewsLimit || 5,
    width: typeof(options.width) === "undefined" ? false : options.width,
    height: typeof(options.height) === "undefined" ? false : options.height,
  };

  this.book = book;

  // Blank Cfi for Parsing
  this.epubcfi = new EPUBJS.EpubCFI();

  this.layoutSettings = {};

  //-- Queue up page changes if page map isn't ready
  this._q = EPUBJS.core.queue(this);

  this.position = 1;

  this.initialize({
    "width"  : this.settings.width,
    "height" : this.settings.height
  });

  this.rendering = false;
  this.views = [];
  this.positions = [];

  //-- Adds Hook methods to the Renderer prototype
  this.hooks = {};
  this.hooks.display = new EPUBJS.Hook(this);
  this.hooks.replacements = new EPUBJS.Hook(this);

  if(!this.settings.infinite) {
    this.settings.viewsLimit = 1;
  }


};

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
EPUBJS.Renderer.prototype.initialize = function(_options){
  var options = _options || {};
  var height  = options.height !== false ? options.height : "100%";
  var width   = options.width !== false ? options.width : "100%";
  var hidden  = options.hidden || false;

  if(options.height && EPUBJS.core.isNumber(options.height)) {
    height = options.height + "px";
  }

  if(options.width && EPUBJS.core.isNumber(options.width)) {
    width = options.width + "px";
  }

  this.container = document.createElement("div");

  if(this.settings.infinite) {
    this.infinite = new EPUBJS.Infinite(this.container, this.settings.axis);
  }

  if(this.settings.axis === "horizontal") {
    // this.container.style.display = "flex";
    // this.container.style.flexWrap = "nowrap";
    this.container.style.whiteSpace = "nowrap";
  }

  this.container.style.width = width;
  this.container.style.height = height;
  this.container.style.overflow = "scroll";

  if(options.hidden) {
    this.wrapper = document.createElement("div");
    this.wrapper.style.visibility = "hidden";
    this.wrapper.style.overflow = "hidden";
    this.wrapper.style.width = "0";
    this.wrapper.style.height = "0";

    this.wrapper.appendChild(this.container);
    return this.wrapper;
  }
  
  return this.container;
};

EPUBJS.Renderer.prototype.resize = function(_width, _height){
  var width = _width;
  var height = _height;

  if(!_width) {
    width = window.innerWidth;
  }
  if(!_height) {
    height = window.innerHeight;
  }
  
  this.container.style.width = width + "px";
  this.container.style.height = height + "px";

  this.trigger("resized", {
    width: this.width,
    height: this.height
  });

};

EPUBJS.Renderer.prototype.onResized = function(e) {
  var bounds = this.element.getBoundingClientRect();


  this.resize(bounds.width, bounds.height);
};

EPUBJS.Renderer.prototype.attachTo = function(_element){
  var bounds;

  if(EPUBJS.core.isElement(_element)) {
    this.element = _element;
  } else if (typeof _element === "string") {
    this.element = document.getElementById(_element);
  } 

  if(!this.element){
    console.error("Not an Element");
    return;
  }

  this.element.appendChild(this.container);

  if(!this.settings.height && !this.settings.width) {
    bounds = this.element.getBoundingClientRect();
    
    this.resize(bounds.width, bounds.height);
  }

  if(this.settings.infinite) {

    this.infinite.start();
  
    this.infinite.on("forwards", function(){
      var next = this.last().section.index + 1;

      if(!this.rendering && next < this.book.spine.length){
        this.forwards();
      }

    }.bind(this));
    
    this.infinite.on("backwards", function(){
      var prev = this.first().section.index - 1;

      if(!this.rendering && prev > 0){
        this.backwards();
      }

    }.bind(this));

  }
  window.addEventListener("resize", this.onResized.bind(this), false);

  this.hooks.replacements.register(this.replacements.bind(this));

};

EPUBJS.Renderer.prototype.clear = function(){
  this.views.forEach(function(view){
    view.destroy();
  });
  
  this.views = [];
};

EPUBJS.Renderer.prototype.display = function(what){
  var displaying = new RSVP.defer();
  var displayed = displaying.promise;
  
  // TODO: check for fragments

  // Clear views
  this.clear();
  
  this.book.opened.then(function(){
    var section = this.book.spine.get(what);
    var rendered;

    if(section){
      rendered = this.render(section);

      if(this.settings.infinite) {
        rendered.then(this.fill.bind(this))
      }
      
      rendered.then(function(){
        displaying.resolve(this);
      }.bind(this));

    } else {
      displaying.reject(new Error("No Section Found"));
    }
    
  }.bind(this));

  return displayed;
};

EPUBJS.Renderer.prototype.render = function(section){
  var rendered;
  var view;

  if(!section) {
    rendered = new RSVP.defer();
    rendered.reject(new Error("No Section Provided"));
    return rendered.promise;
  }; 

  view = new EPUBJS.View(section);
  
  // Place view in correct position
  this.insert(view, section.index);

  rendered = view.render(this.book.request);

  return rendered
    .then(function(){
      return this.hooks.display.trigger(view);
    }.bind(this))
    .then(function(){
      return this.hooks.replacements.trigger(view, this);
    }.bind(this))
    .then(function(){
      return view.expand();
    }.bind(this))
    .then(function(){
      this.rendering = false;
      view.show();
      return view;
    }.bind(this))
    .catch(function(e){
      this.trigger("loaderror", e);
    }.bind(this));

};


EPUBJS.Renderer.prototype.forwards = function(){
  var next;
  var rendered;
  var section;

  next = this.last().section.index + 1;
  if(this.rendering || next === this.book.spine.length){
    rendered = new RSVP.defer();
    rendered.reject(new Error("Reject Forwards"));
    return rendered.promise;
  }
  // console.log("going forwards")

  this.rendering = true;

  section = this.book.spine.get(next);
  rendered = this.render(section);

  rendered.then(function(){
    var first = this.first();
    var bounds = first.bounds();
    var prevTop = this.container.scrollTop;
    var prevLeft = this.container.scrollLeft;

    if(this.views.length > this.settings.viewsLimit) {
      
      // Remove the item
      this.remove(first);

      if(this.settings.infinite) {
        // Reset Position
        if(this.settings.axis === "vertical") {
          this.infinite.scroll(0, prevTop - bounds.height, true)
        } else {
          this.infinite.scroll(prevLeft - bounds.width, true);
        }
      }  
    }

  }.bind(this));

  
  return rendered;
};

EPUBJS.Renderer.prototype.backwards = function(view){
  var prev;
  var rendered;
  var section;


  prev = this.first().section.index - 1;

  if(this.rendering || prev < 0){
    rendered = new RSVP.defer();
    rendered.reject(new Error("Reject Backwards"));
    return rendered.promise;
  }
  // console.log("going backwards")

  this.rendering = true;

  section = this.book.spine.get(prev);
  rendered = this.render(section);

  rendered.then(function(){
    var last;

    if(this.settings.infinite) {

      // this.container.scrollTop += this.first().height;
      if(this.settings.axis === "vertical") {    
        this.infinite.scrollBy(0, this.first().bounds().height, true);
      } else {
        this.infinite.scrollBy(this.first().bounds().width, 0, true);
      }

    }

    if(this.views.length > this.settings.viewsLimit) {



      last = this.last();
      this.remove(last);
    }
  }.bind(this));

  return rendered;
};


// Manage Views

// -- this might want to be in infinite
EPUBJS.Renderer.prototype.fill = function() {
  
  var prev = this.first().section.index - 1;
  var filling = this.forwards();

  if(this.settings.axis === "vertical") {
    filling.then(this.fillVertical.bind(this));
  } else {
    filling.then(this.fillHorizontal.bind(this));
  }

  if(prev > 0){
    filling.then(this.backwards.bind(this));
  }

  
  return filling
    .then(function(){
      this.rendering = false;
    }.bind(this));


};

EPUBJS.Renderer.prototype.fillVertical = function() {
  var height = this.container.getBoundingClientRect().height;
  var bottom = this.last().bounds().bottom;
  var defer = new RSVP.defer();

  if (height && bottom && (bottom < height)) { //&& (this.last().section.index + 1 < this.book.spine.length)) {
    return this.forwards().then(this.fillVertical.bind(this));
  } else {
    this.rendering = false;
    defer.resolve();
    return defer.promise;
  }
};

EPUBJS.Renderer.prototype.fillHorizontal = function() {
  var width = this.container.getBoundingClientRect().width;
  var right = this.last().bounds().right;
  var defer = new RSVP.defer();

  if (width && right && (right <= width)) { //&& (this.last().section.index + 1 < this.book.spine.length)) {
    return this.forwards().then(this.fillHorizontal.bind(this));
  } else {
    this.rendering = false;
    defer.resolve();
    return defer.promise;
  }
};

EPUBJS.Renderer.prototype.append = function(view){
  var first, prevTop, prevHeight, offset;

  this.views.push(view);
  view.appendTo(this.container);

};

EPUBJS.Renderer.prototype.prepend = function(view){
  var last;

  this.views.unshift(view);
  view.prependTo(this.container);

};

// Simple Insert
EPUBJS.Renderer.prototype.insert = function(view, index){
  
  if(!this.first()) {
    this.append(view);
  } else if(index - this.first().section.index >= 0) {
    this.append(view);
  } else if(index - this.last().section.index <= 0) {
    this.prepend(view);
  }
  // return position;
};

// Remove the render element and clean up listeners
EPUBJS.Renderer.prototype.remove = function(view) {
  var index = this.views.indexOf(view);
  view.destroy();
  if(index > -1) {
    this.views.splice(index, 1);
  }
};

EPUBJS.Renderer.prototype.first = function() {
  return this.views[0];
};

EPUBJS.Renderer.prototype.last = function() {
  return this.views[this.views.length-1];
};

EPUBJS.Renderer.prototype.replacements = function(view, renderer) {
  var task = new RSVP.defer();
  var links = view.document.querySelectorAll("a[href]");
  var replaceLinks = function(link){
    var href = link.getAttribute("href");
    var uri = new EPUBJS.core.uri(href);

    if(uri.protocol){

      link.setAttribute("target", "_blank");

    }else{
      
      // relative = EPUBJS.core.resolveUrl(directory, href);
      // if(uri.fragment && !base) {
      //   link.onclick = function(){
      //     renderer.fragment(href);
      //     return false;
      //   };
      // } else {
        link.onclick = function(){
          renderer.display(href);
          return false;
        };
      //}
      

    }
  };

  for (var i = 0; i < links.length; i++) {
    replaceLinks(links[i]);
  };

  task.resolve();
  return task.promise;
};

EPUBJS.Renderer.prototype.paginate = function(options) {
  this.pagination = new EPUBJS.Paginate(this, {
    width: this.settings.width,
    height: this.settings.height
  });
  return this.pagination;
};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Renderer.prototype);
EPUBJS.Section = function(item){
    this.idref = item.idref;
    this.linear = item.linear;
    this.properties = item.properties;
    this.index = item.index;
    this.href = item.href;
    this.url = item.url;
    this.cfiBase = item.cfiBase;

    this.hooks = {};
    this.hooks.replacements = new EPUBJS.Hook(this);

    // Register replacements
    this.hooks.replacements.register(this.replacements);
};


EPUBJS.Section.prototype.load = function(_request){
  var request = _request || this.request || EPUBJS.core.request;
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  if(this.contents) {
    loading.resolve(this.contents);
  } else {
    request(this.url, 'xml')
      .then(function(xml){
        var base;
        var directory = EPUBJS.core.folder(this.url);

        this.document = xml;
        this.contents = xml.documentElement;

        return this.hooks.replacements.trigger(this.document);
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

EPUBJS.Section.prototype.replacements = function(_document){
    var task = new RSVP.defer();
    var base = _document.createElement("base"); // TODO: check if exists
    var head;
    base.setAttribute("href", this.url);

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

EPUBJS.Section.prototype.beforeSectionLoad = function(){
  // Stub for a hook - replace me for now
}

EPUBJS.Section.prototype.render = function(_request){
  var rendering = new RSVP.defer();
  var rendered = rendering.promise;
  
  this.load(_request).then(function(contents){
    var serializer = new XMLSerializer();
    var output = serializer.serializeToString(contents);
    rendering.resolve(output);
  })
  .catch(function(error){
    rendering.reject(error);
  });

  return rendered;
};

EPUBJS.Section.prototype.find = function(_query){

};
EPUBJS.Spine = function(_request){
  this.request = _request;
  this.spineItems = [];
  this.spineByHref = {};
  this.spineById = {};

};

EPUBJS.Spine.prototype.load = function(_package) {

  this.items = _package.spine;
  this.manifest = _package.manifest;
  this.spineNodeIndex = _package.spineNodeIndex;
  this.baseUrl = _package.baseUrl || '';
  this.length = this.items.length;
  this.epubcfi = new EPUBJS.EpubCFI();

  this.items.forEach(function(item, index){
    var href, url;
    var manifestItem = this.manifest[item.idref];
    var spineItem;
    item.cfiBase = this.epubcfi.generateChapterComponent(this.spineNodeIndex, item.index, item.idref);

    if(manifestItem) {
      item.href = manifestItem.href;
      item.url = this.baseUrl + item.href;
    }

    spineItem = new EPUBJS.Section(item);
    this.append(spineItem);


  }.bind(this));

};

// book.spine.get();
// book.spine.get(1);
// book.spine.get("chap1.html");
// book.spine.get("#id1234");
EPUBJS.Spine.prototype.get = function(target) {
  var index = 0;

  if(target && (typeof target === "number" || isNaN(target) === false)){
    index = target;
  } else if(target && target.indexOf("#") === 0) {
    index = this.spineById[target.substring(1)];
  } else if(target) {
    index = this.spineByHref[target];
  }

  return this.spineItems[index];
};

EPUBJS.Spine.prototype.append = function(section) {
  var index = this.spineItems.length;
  section.index = index;

  this.spineItems.push(section);

  this.spineByHref[section.href] = index;
  this.spineById[section.idref] = index;

  return index;
};

EPUBJS.Spine.prototype.prepend = function(section) {
  var index = this.spineItems.unshift(section);
  this.spineByHref[section.href] = 0;
  this.spineById[section.idref] = 0;

  // Re-index
  this.spineItems.forEach(function(item, index){
    item.index = index;
  });

  return 0;
};

EPUBJS.Spine.prototype.insert = function(section, index) {

};

EPUBJS.Spine.prototype.remove = function(section) {
  var index = this.spineItems.indexOf(section);

  if(index > -1) {
    delete this.spineByHref[section.href];
    delete this.spineById[section.idref];

    return this.spineItems.splice(index, 1);
  }
};
EPUBJS.View = function(section) {
  this.id = "epubjs-view:" + EPUBJS.core.uuid();
  this.rendering = new RSVP.defer();
  this.rendered = this.rendering.promise;
  this.iframe = this.create();
  this.section = section;
};

EPUBJS.View.prototype.create = function() {
  this.iframe = document.createElement('iframe');
  this.iframe.id = this.id;
  this.iframe.scrolling = "no";
  this.iframe.seamless = "seamless";
  // Back up if seamless isn't supported
  this.iframe.style.border = "none";

  this.resizing = true;
  // this.iframe.style.width = "100%";
  // this.iframe.style.height = "100%";

  this.iframe.style.display = "none";
  this.iframe.style.visibility = "hidden";
  return this.iframe;
};

EPUBJS.View.prototype.resized = function(e) {

  if (!this.resizing) {
    this.expand();
  } else {
    this.resizing = false;
  }

};

EPUBJS.View.prototype.render = function(_request) {
    return this.section.render(_request)
      .then(function(contents){
        return this.load(contents);
      }.bind(this))
      .then(this.display.bind(this))
      .then(function(){
        this.rendering.resolve(this);
      }.bind(this));
};

EPUBJS.View.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  this.document = this.iframe.contentDocument;
  
  this.iframe.addEventListener("load", function(event) {
    
    this.window = this.iframe.contentWindow;
    this.document = this.iframe.contentDocument;

    loading.resolve(this);
    
  }.bind(this));
  
  
  // this.iframe.srcdoc = contents;
  this.document.open();
  this.document.write(contents);
  this.document.close();

  return loaded;
};

EPUBJS.View.prototype.display = function(contents) {
  var displaying = new RSVP.defer();
  var displayed = displaying.promise;
  
  // this.iframe.style.display = "block";
  this.iframe.style.display = "inline-block";


  // Reset Body Styles
  this.document.body.style.margin = "0";
  this.document.body.style.display = "inline-block";  
  this.document.documentElement.style.width = "auto";
  
  setTimeout(function(){
    this.window.addEventListener("resize", this.resized.bind(this), false);
  }.bind(this), 10); // Wait to listen for resize events



  if(!this.document.fonts || this.document.fonts.status !== "loading") {
    this.expand();
    displaying.resolve(this);
  } else {
    this.document.fonts.onloading = function(){
      this.expand();
      displaying.resolve(this);
    }.bind(this);
  }

  // this.observer = this.observe(this.document.body);

  return displayed

};

EPUBJS.View.prototype.expand = function() {
  var bounds;
  var width, height;

  // Check bounds
  bounds = this.document.body.getBoundingClientRect();
  if(!bounds || (bounds.height === 0 && bounds.width === 0)) {
    console.error("View not shown");
  }

  // Apply Changes
  this.resizing = true;

  height = bounds.height; //this.document.documentElement.scrollHeight;
  this.iframe.style.height = height + "px";

  width = this.document.documentElement.scrollWidth;
  this.iframe.style.width = width + "px";


    
  // this.width  = width;
  // this.height = height;

  return bounds;
};

EPUBJS.View.prototype.observe = function(target) {
  var renderer = this;

  // create an observer instance
  var observer = new MutationObserver(function(mutations) {
    renderer.expand();
    // mutations.forEach(function(mutation) {
      // console.log(mutation)
    // });    
  });

  // configuration of the observer:
  var config = { attributes: true, childList: true, characterData: true, subtree: true };

  // pass in the target node, as well as the observer options
  observer.observe(target, config);

  return observer;
};

EPUBJS.View.prototype.appendTo = function(element) {
  this.element = element;
  this.element.appendChild(this.iframe);
};

EPUBJS.View.prototype.prependTo = function(element) {
  this.element = element;
  element.insertBefore(this.iframe, element.firstChild);
};

EPUBJS.View.prototype.show = function() {
  // this.iframe.style.display = "block";
  this.iframe.style.display = "inline-block";
  this.iframe.style.visibility = "visible"; 
};

EPUBJS.View.prototype.hide = function() {
  this.iframe.style.display = "none";
  this.iframe.style.visibility = "hidden"; 
};

EPUBJS.View.prototype.bounds = function() {
  return this.iframe.getBoundingClientRect();
};

EPUBJS.View.prototype.destroy = function() {
  // Stop observing
  // this.observer.disconnect();

  this.element.removeChild(this.iframe);
};

