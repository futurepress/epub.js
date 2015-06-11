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


/*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.0.13
 */

(function() {
    "use strict";

    function $$rsvp$events$$indexOf(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i] === callback) { return i; }
      }

      return -1;
    }

    function $$rsvp$events$$callbacksFor(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    }

    var $$rsvp$events$$default = {

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
      mixin: function(object) {
        object.on = this.on;
        object.off = this.off;
        object.trigger = this.trigger;
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
      on: function(eventName, callback) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks;

        callbacks = allCallbacks[eventName];

        if (!callbacks) {
          callbacks = allCallbacks[eventName] = [];
        }

        if ($$rsvp$events$$indexOf(callbacks, callback) === -1) {
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
      off: function(eventName, callback) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks, index;

        if (!callback) {
          allCallbacks[eventName] = [];
          return;
        }

        callbacks = allCallbacks[eventName];

        index = $$rsvp$events$$indexOf(callbacks, callback);

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
        @param {Any} options optional value to be passed to any event handlers for
        the given `eventName`
      */
      trigger: function(eventName, options) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks, callback;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callback = callbacks[i];

            callback(options);
          }
        }
      }
    };

    var $$rsvp$config$$config = {
      instrument: false
    };

    $$rsvp$events$$default.mixin($$rsvp$config$$config);

    function $$rsvp$config$$configure(name, value) {
      if (name === 'onerror') {
        // handle for legacy users that expect the actual
        // error to be passed to their function added via
        // `RSVP.configure('onerror', someFunctionHere);`
        $$rsvp$config$$config.on('error', value);
        return;
      }

      if (arguments.length === 2) {
        $$rsvp$config$$config[name] = value;
      } else {
        return $$rsvp$config$$config[name];
      }
    }

    function $$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function $$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function $$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var $$utils$$_isArray;

    if (!Array.isArray) {
      $$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      $$utils$$_isArray = Array.isArray;
    }

    var $$utils$$isArray = $$utils$$_isArray;
    var $$utils$$now = Date.now || function() { return new Date().getTime(); };
    function $$utils$$F() { }

    var $$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      $$utils$$F.prototype = o;
      return new $$utils$$F();
    });

    var $$instrument$$queue = [];

    var $$instrument$$default = function instrument(eventName, promise, child) {
      if (1 === $$instrument$$queue.push({
          name: eventName,
          payload: {
            guid: promise._guidKey + promise._id,
            eventName: eventName,
            detail: promise._result,
            childGuid: child && promise._guidKey + child._id,
            label: promise._label,
            timeStamp: $$utils$$now(),
            stack: new Error(promise._label).stack
          }})) {

            setTimeout(function() {
              var entry;
              for (var i = 0; i < $$instrument$$queue.length; i++) {
                entry = $$instrument$$queue[i];
                $$rsvp$config$$config.trigger(entry.name, entry.payload);
              }
              $$instrument$$queue.length = 0;
            }, 50);
          }
      };

    function $$$internal$$noop() {}
    var $$$internal$$PENDING   = void 0;
    var $$$internal$$FULFILLED = 1;
    var $$$internal$$REJECTED  = 2;
    var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        $$$internal$$GET_THEN_ERROR.error = error;
        return $$$internal$$GET_THEN_ERROR;
      }
    }

    function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function $$$internal$$handleForeignThenable(promise, thenable, then) {
      $$rsvp$config$$config.async(function(promise) {
        var sealed = false;
        var error = $$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          $$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          $$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function $$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, thenable._result);
      } else if (promise._state === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, thenable._result);
      } else {
        $$$internal$$subscribe(thenable, undefined, function(value) {
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          $$$internal$$reject(promise, reason);
        });
      }
    }

    function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        $$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = $$$internal$$getThen(maybeThenable);

        if (then === $$$internal$$GET_THEN_ERROR) {
          $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          $$$internal$$fulfill(promise, maybeThenable);
        } else if ($$utils$$isFunction(then)) {
          $$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          $$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function $$$internal$$resolve(promise, value) {
      if (promise === value) {
        $$$internal$$fulfill(promise, value);
      } else if ($$utils$$objectOrFunction(value)) {
        $$$internal$$handleMaybeThenable(promise, value);
      } else {
        $$$internal$$fulfill(promise, value);
      }
    }

    function $$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      $$$internal$$publish(promise);
    }

    function $$$internal$$fulfill(promise, value) {
      if (promise._state !== $$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = $$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
        if ($$rsvp$config$$config.instrument) {
          $$instrument$$default('fulfilled', promise);
        }
      } else {
        $$rsvp$config$$config.async($$$internal$$publish, promise);
      }
    }

    function $$$internal$$reject(promise, reason) {
      if (promise._state !== $$$internal$$PENDING) { return; }
      promise._state = $$$internal$$REJECTED;
      promise._result = reason;

      $$rsvp$config$$config.async($$$internal$$publishRejection, promise);
    }

    function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + $$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        $$rsvp$config$$config.async($$$internal$$publish, parent);
      }
    }

    function $$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if ($$rsvp$config$$config.instrument) {
        $$instrument$$default(settled === $$$internal$$FULFILLED ? 'fulfilled' : 'rejected', promise);
      }

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          $$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function $$$internal$$ErrorObject() {
      this.error = null;
    }

    var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        $$$internal$$TRY_CATCH_ERROR.error = e;
        return $$$internal$$TRY_CATCH_ERROR;
      }
    }

    function $$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = $$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = $$$internal$$tryCatch(callback, detail);

        if (value === $$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          $$$internal$$reject(promise, new TypeError('A promises callback cannot return that same promise.'));
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== $$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        $$$internal$$resolve(promise, value);
      } else if (failed) {
        $$$internal$$reject(promise, error);
      } else if (settled === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, value);
      } else if (settled === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, value);
      }
    }

    function $$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          $$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          $$$internal$$reject(promise, reason);
        });
      } catch(e) {
        $$$internal$$reject(promise, e);
      }
    }

    function $$enumerator$$makeSettledResult(state, position, value) {
      if (state === $$$internal$$FULFILLED) {
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

    function $$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor($$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          $$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            $$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        $$$internal$$reject(this.promise, this._validationError());
      }
    }

    $$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return $$utils$$isArray(input);
    };

    $$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    $$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var $$enumerator$$default = $$enumerator$$Enumerator;

    $$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var promise = this.promise;
      var input   = this._input;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    $$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      if ($$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
          entry._onerror = null;
          this._settledAt(entry._state, i, entry._result);
        } else {
          this._willSettleAt(c.resolve(entry), i);
        }
      } else {
        this._remaining--;
        this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
      }
    };

    $$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === $$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === $$$internal$$REJECTED) {
          $$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        $$$internal$$fulfill(promise, this._result);
      }
    };

    $$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    $$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      $$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt($$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt($$$internal$$REJECTED, i, reason);
      });
    };

    var $$promise$all$$default = function all(entries, label) {
      return new $$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    };

    var $$promise$race$$default = function race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor($$$internal$$noop, label);

      if (!$$utils$$isArray(entries)) {
        $$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        $$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        $$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        $$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    };

    var $$promise$resolve$$default = function resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$resolve(promise, object);
      return promise;
    };

    var $$promise$reject$$default = function reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$reject(promise, reason);
      return promise;
    };

    var $$rsvp$promise$$guidKey = 'rsvp_' + $$utils$$now() + '-';
    var $$rsvp$promise$$counter = 0;

    function $$rsvp$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function $$rsvp$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var $$rsvp$promise$$default = $$rsvp$promise$$Promise;

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
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
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
    function $$rsvp$promise$$Promise(resolver, label) {
      this._id = $$rsvp$promise$$counter++;
      this._label = label;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if ($$rsvp$config$$config.instrument) {
        $$instrument$$default('created', this);
      }

      if ($$$internal$$noop !== resolver) {
        if (!$$utils$$isFunction(resolver)) {
          $$rsvp$promise$$needsResolver();
        }

        if (!(this instanceof $$rsvp$promise$$Promise)) {
          $$rsvp$promise$$needsNew();
        }

        $$$internal$$initializePromise(this, resolver);
      }
    }

    // deprecated
    $$rsvp$promise$$Promise.cast = $$promise$resolve$$default;

    $$rsvp$promise$$Promise.all = $$promise$all$$default;
    $$rsvp$promise$$Promise.race = $$promise$race$$default;
    $$rsvp$promise$$Promise.resolve = $$promise$resolve$$default;
    $$rsvp$promise$$Promise.reject = $$promise$reject$$default;

    $$rsvp$promise$$Promise.prototype = {
      constructor: $$rsvp$promise$$Promise,

      _guidKey: $$rsvp$promise$$guidKey,

      _onerror: function (reason) {
        $$rsvp$config$$config.trigger('error', reason);
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
      @param {Function} onFulfilled
      @param {Function} onRejected
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection, label) {
        var parent = this;
        var state = parent._state;

        if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
          if ($$rsvp$config$$config.instrument) {
            $$instrument$$default('chained', this, this);
          }
          return this;
        }

        parent._onerror = null;

        var child = new this.constructor($$$internal$$noop, label);
        var result = parent._result;

        if ($$rsvp$config$$config.instrument) {
          $$instrument$$default('chained', parent, child);
        }

        if (state) {
          var callback = arguments[state - 1];
          $$rsvp$config$$config.async(function(){
            $$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

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
        return this.then(null, onRejection, label);
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
        var constructor = this.constructor;

        return this.then(function(value) {
          return constructor.resolve(callback()).then(function(){
            return value;
          });
        }, function(reason) {
          return constructor.resolve(callback()).then(function(){
            throw reason;
          });
        }, label);
      }
    };

    function $$rsvp$node$$Result() {
      this.value = undefined;
    }

    var $$rsvp$node$$ERROR = new $$rsvp$node$$Result();
    var $$rsvp$node$$GET_THEN_ERROR = new $$rsvp$node$$Result();

    function $$rsvp$node$$getThen(obj) {
      try {
       return obj.then;
      } catch(error) {
        $$rsvp$node$$ERROR.value= error;
        return $$rsvp$node$$ERROR;
      }
    }

    function $$rsvp$node$$tryApply(f, s, a) {
      try {
        f.apply(s, a);
      } catch(error) {
        $$rsvp$node$$ERROR.value = error;
        return $$rsvp$node$$ERROR;
      }
    }

    function $$rsvp$node$$makeObject(_, argumentNames) {
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

    function $$rsvp$node$$arrayResult(_) {
      var length = _.length;
      var args = new Array(length - 1);

      for (var i = 1; i < length; i++) {
        args[i - 1] = _[i];
      }

      return args;
    }

    function $$rsvp$node$$wrapThenable(then, promise) {
      return {
        then: function(onFulFillment, onRejection) {
          return then.call(promise, onFulFillment, onRejection);
        }
      };
    }

    var $$rsvp$node$$default = function denodeify(nodeFunc, options) {
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
            promiseInput = $$rsvp$node$$needsPromiseInput(arg);
            if (promiseInput === $$rsvp$node$$GET_THEN_ERROR) {
              var p = new $$rsvp$promise$$default($$$internal$$noop);
              $$$internal$$reject(p, $$rsvp$node$$GET_THEN_ERROR.value);
              return p;
            } else if (promiseInput && promiseInput !== true) {
              arg = $$rsvp$node$$wrapThenable(promiseInput, arg);
            }
          }
          args[i] = arg;
        }

        var promise = new $$rsvp$promise$$default($$$internal$$noop);

        args[l] = function(err, val) {
          if (err)
            $$$internal$$reject(promise, err);
          else if (options === undefined)
            $$$internal$$resolve(promise, val);
          else if (options === true)
            $$$internal$$resolve(promise, $$rsvp$node$$arrayResult(arguments));
          else if ($$utils$$isArray(options))
            $$$internal$$resolve(promise, $$rsvp$node$$makeObject(arguments, options));
          else
            $$$internal$$resolve(promise, val);
        };

        if (promiseInput) {
          return $$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self);
        } else {
          return $$rsvp$node$$handleValueInput(promise, args, nodeFunc, self);
        }
      };

      fn.__proto__ = nodeFunc;

      return fn;
    };

    function $$rsvp$node$$handleValueInput(promise, args, nodeFunc, self) {
      var result = $$rsvp$node$$tryApply(nodeFunc, self, args);
      if (result === $$rsvp$node$$ERROR) {
        $$$internal$$reject(promise, result.value);
      }
      return promise;
    }

    function $$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self){
      return $$rsvp$promise$$default.all(args).then(function(args){
        var result = $$rsvp$node$$tryApply(nodeFunc, self, args);
        if (result === $$rsvp$node$$ERROR) {
          $$$internal$$reject(promise, result.value);
        }
        return promise;
      });
    }

    function $$rsvp$node$$needsPromiseInput(arg) {
      if (arg && typeof arg === 'object') {
        if (arg.constructor === $$rsvp$promise$$default) {
          return true;
        } else {
          return $$rsvp$node$$getThen(arg);
        }
      } else {
        return false;
      }
    }

    var $$rsvp$all$$default = function all(array, label) {
      return $$rsvp$promise$$default.all(array, label);
    };

    function $$rsvp$all$settled$$AllSettled(Constructor, entries, label) {
      this._superConstructor(Constructor, entries, false /* don't abort on reject */, label);
    }

    $$rsvp$all$settled$$AllSettled.prototype = $$utils$$o_create($$enumerator$$default.prototype);
    $$rsvp$all$settled$$AllSettled.prototype._superConstructor = $$enumerator$$default;
    $$rsvp$all$settled$$AllSettled.prototype._makeResult = $$enumerator$$makeSettledResult;

    $$rsvp$all$settled$$AllSettled.prototype._validationError = function() {
      return new Error('allSettled must be called with an array');
    };

    var $$rsvp$all$settled$$default = function allSettled(entries, label) {
      return new $$rsvp$all$settled$$AllSettled($$rsvp$promise$$default, entries, label).promise;
    };

    var $$rsvp$race$$default = function race(array, label) {
      return $$rsvp$promise$$default.race(array, label);
    };

    function $$promise$hash$$PromiseHash(Constructor, object, label) {
      this._superConstructor(Constructor, object, true, label);
    }

    var $$promise$hash$$default = $$promise$hash$$PromiseHash;
    $$promise$hash$$PromiseHash.prototype = $$utils$$o_create($$enumerator$$default.prototype);
    $$promise$hash$$PromiseHash.prototype._superConstructor = $$enumerator$$default;

    $$promise$hash$$PromiseHash.prototype._init = function() {
      this._result = {};
    };

    $$promise$hash$$PromiseHash.prototype._validateInput = function(input) {
      return input && typeof input === 'object';
    };

    $$promise$hash$$PromiseHash.prototype._validationError = function() {
      return new Error('Promise.hash must be called with an object');
    };

    $$promise$hash$$PromiseHash.prototype._enumerate = function() {
      var promise = this.promise;
      var input   = this._input;
      var results = [];

      for (var key in input) {
        if (promise._state === $$$internal$$PENDING && input.hasOwnProperty(key)) {
          results.push({
            position: key,
            entry: input[key]
          });
        }
      }

      var length = results.length;
      this._remaining = length;
      var result;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        result = results[i];
        this._eachEntry(result.entry, result.position);
      }
    };

    var $$rsvp$hash$$default = function hash(object, label) {
      return new $$promise$hash$$default($$rsvp$promise$$default, object, label).promise;
    };

    function $$rsvp$hash$settled$$HashSettled(Constructor, object, label) {
      this._superConstructor(Constructor, object, false, label);
    }

    $$rsvp$hash$settled$$HashSettled.prototype = $$utils$$o_create($$promise$hash$$default.prototype);
    $$rsvp$hash$settled$$HashSettled.prototype._superConstructor = $$enumerator$$default;
    $$rsvp$hash$settled$$HashSettled.prototype._makeResult = $$enumerator$$makeSettledResult;

    $$rsvp$hash$settled$$HashSettled.prototype._validationError = function() {
      return new Error('hashSettled must be called with an object');
    };

    var $$rsvp$hash$settled$$default = function hashSettled(object, label) {
      return new $$rsvp$hash$settled$$HashSettled($$rsvp$promise$$default, object, label).promise;
    };

    var $$rsvp$rethrow$$default = function rethrow(reason) {
      setTimeout(function() {
        throw reason;
      });
      throw reason;
    };

    var $$rsvp$defer$$default = function defer(label) {
      var deferred = { };

      deferred.promise = new $$rsvp$promise$$default(function(resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
      }, label);

      return deferred;
    };

    var $$rsvp$map$$default = function map(promises, mapFn, label) {
      return $$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!$$utils$$isFunction(mapFn)) {
          throw new TypeError("You must pass a function as map's second argument.");
        }

        var length = values.length;
        var results = new Array(length);

        for (var i = 0; i < length; i++) {
          results[i] = mapFn(values[i]);
        }

        return $$rsvp$promise$$default.all(results, label);
      });
    };

    var $$rsvp$resolve$$default = function resolve(value, label) {
      return $$rsvp$promise$$default.resolve(value, label);
    };

    var $$rsvp$reject$$default = function reject(reason, label) {
      return $$rsvp$promise$$default.reject(reason, label);
    };

    var $$rsvp$filter$$default = function filter(promises, filterFn, label) {
      return $$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!$$utils$$isFunction(filterFn)) {
          throw new TypeError("You must pass a function as filter's second argument.");
        }

        var length = values.length;
        var filtered = new Array(length);

        for (var i = 0; i < length; i++) {
          filtered[i] = filterFn(values[i]);
        }

        return $$rsvp$promise$$default.all(filtered, label).then(function(filtered) {
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
    };

    var $$rsvp$asap$$len = 0;

    var $$rsvp$asap$$default = function asap(callback, arg) {
      $$rsvp$asap$$queue[$$rsvp$asap$$len] = callback;
      $$rsvp$asap$$queue[$$rsvp$asap$$len + 1] = arg;
      $$rsvp$asap$$len += 2;
      if ($$rsvp$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        $$rsvp$asap$$scheduleFlush();
      }
    };

    var $$rsvp$asap$$browserGlobal = (typeof window !== 'undefined') ? window : {};
    var $$rsvp$asap$$BrowserMutationObserver = $$rsvp$asap$$browserGlobal.MutationObserver || $$rsvp$asap$$browserGlobal.WebKitMutationObserver;

    // test for web worker but not in IE10
    var $$rsvp$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function $$rsvp$asap$$useNextTick() {
      return function() {
        process.nextTick($$rsvp$asap$$flush);
      };
    }

    function $$rsvp$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new $$rsvp$asap$$BrowserMutationObserver($$rsvp$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function $$rsvp$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = $$rsvp$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function $$rsvp$asap$$useSetTimeout() {
      return function() {
        setTimeout($$rsvp$asap$$flush, 1);
      };
    }

    var $$rsvp$asap$$queue = new Array(1000);

    function $$rsvp$asap$$flush() {
      for (var i = 0; i < $$rsvp$asap$$len; i+=2) {
        var callback = $$rsvp$asap$$queue[i];
        var arg = $$rsvp$asap$$queue[i+1];

        callback(arg);

        $$rsvp$asap$$queue[i] = undefined;
        $$rsvp$asap$$queue[i+1] = undefined;
      }

      $$rsvp$asap$$len = 0;
    }

    var $$rsvp$asap$$scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useNextTick();
    } else if ($$rsvp$asap$$BrowserMutationObserver) {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useMutationObserver();
    } else if ($$rsvp$asap$$isWorker) {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useMessageChannel();
    } else {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useSetTimeout();
    }

    // default async is asap;
    $$rsvp$config$$config.async = $$rsvp$asap$$default;

    var $$rsvp$$cast = $$rsvp$resolve$$default;

    function $$rsvp$$async(callback, arg) {
      $$rsvp$config$$config.async(callback, arg);
    }

    function $$rsvp$$on() {
      $$rsvp$config$$config.on.apply($$rsvp$config$$config, arguments);
    }

    function $$rsvp$$off() {
      $$rsvp$config$$config.off.apply($$rsvp$config$$config, arguments);
    }

    // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
    if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
      var $$rsvp$$callbacks = window['__PROMISE_INSTRUMENTATION__'];
      $$rsvp$config$$configure('instrument', true);
      for (var $$rsvp$$eventName in $$rsvp$$callbacks) {
        if ($$rsvp$$callbacks.hasOwnProperty($$rsvp$$eventName)) {
          $$rsvp$$on($$rsvp$$eventName, $$rsvp$$callbacks[$$rsvp$$eventName]);
        }
      }
    }

    var rsvp$umd$$RSVP = {
      'race': $$rsvp$race$$default,
      'Promise': $$rsvp$promise$$default,
      'allSettled': $$rsvp$all$settled$$default,
      'hash': $$rsvp$hash$$default,
      'hashSettled': $$rsvp$hash$settled$$default,
      'denodeify': $$rsvp$node$$default,
      'on': $$rsvp$$on,
      'off': $$rsvp$$off,
      'map': $$rsvp$map$$default,
      'filter': $$rsvp$filter$$default,
      'resolve': $$rsvp$resolve$$default,
      'reject': $$rsvp$reject$$default,
      'all': $$rsvp$all$$default,
      'rethrow': $$rsvp$rethrow$$default,
      'defer': $$rsvp$defer$$default,
      'EventTarget': $$rsvp$events$$default,
      'configure': $$rsvp$config$$configure,
      'async': $$rsvp$$async
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define.amd) {
      define(function() { return rsvp$umd$$RSVP; });
    } else if (typeof module !== 'undefined' && module.exports) {
      module.exports = rsvp$umd$$RSVP;
    } else if (typeof this !== 'undefined') {
      this['RSVP'] = rsvp$umd$$RSVP;
    }
}).call(this);
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
          
          // If this.responseXML wasn't set, try to parse using a DOMParser from text
          if(!this.responseXML){
            r = new DOMParser().parseFromString(this.response, "text/xml");
          } else {
            r = this.responseXML;
          }
          
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

EPUBJS.core.extend = function(target) {
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
EPUBJS.core.insert = function(item, array, compareFunction) {
  var location = EPUBJS.core.locationOf(item, array, compareFunction);
  array.splice(location, 0, item);

  return location;
};
// Returns where something would fit in
EPUBJS.core.locationOf = function(item, array, compareFunction, _start, _end) {
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
    return EPUBJS.core.locationOf(item, array, compareFunction, pivot, end);
  } else{
    return EPUBJS.core.locationOf(item, array, compareFunction, start, pivot);
  }
};
// Returns -1 of mpt found
EPUBJS.core.indexOfSorted = function(item, array, compareFunction, _start, _end) {
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
    return EPUBJS.core.indexOfSorted(item, array, compareFunction, pivot, end);
  } else{
    return EPUBJS.core.indexOfSorted(item, array, compareFunction, start, pivot);
  }
};

EPUBJS.core.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

EPUBJS.core.bounds = function(el) {

  var style = window.getComputedStyle(el);
  var widthProps = ["width", "paddingRight", "paddingLeft", "marginRight", "marginLeft", "borderRightWidth", "borderLeftWidth"];
  var heightProps = ["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"];

  var width = 0;
  var height = 0;

  widthProps.forEach(function(prop){
    width += parseFloat(style[prop]) || 0;
  })

  heightProps.forEach(function(prop){
    height += parseFloat(style[prop]) || 0;
  })

  return {
    height: height,
    width: width
  }

};

EPUBJS.core.borders = function(el) {

  var style = window.getComputedStyle(el);
  var widthProps = ["paddingRight", "paddingLeft", "marginRight", "marginLeft", "borderRightWidth", "borderLeftWidth"];
  var heightProps = ["paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"];

  var width = 0;
  var height = 0;

  widthProps.forEach(function(prop){
    width += parseFloat(style[prop]) || 0;
  })

  heightProps.forEach(function(prop){
    height += parseFloat(style[prop]) || 0;
  })

  return {
    height: height,
    width: width
  }

};

EPUBJS.core.windowBounds = function() {

  var width = window.innerWidth;
  var height = window.innerHeight;
  
  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width: width,
    height: height
  }

};

//https://stackoverflow.com/questions/13482352/xquery-looking-for-text-with-single-quote/13483496#13483496
EPUBJS.core.cleanStringForXpath = function(str)  {
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

EPUBJS.core.indexOfTextNode = function(textNode){
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
EPUBJS.Queue = function(_context){
  this._q = [];
  this.context = _context;
  this.tick = EPUBJS.core.requestAnimationFrame;
  this.running = false;
};

// Add an item to the queue
EPUBJS.Queue.prototype.enqueue = function() {
  var deferred, promise;
  var queued;
  var task = [].shift.call(arguments);
  var args = arguments
  
  // Handle single args without context
  // if(args && !Array.isArray(args)) {
  //   args = [args];
  // }
  
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
  setTimeout(this.flush.bind(this), 0);

  return queued.promise;
};

// Run one item
EPUBJS.Queue.prototype.dequeue = function(){
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
        // Task is resolves immediately
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
EPUBJS.Queue.prototype.dump = function(){
  while(this._q.length) {
    this.dequeue();
  }
};

// Run all sequentially, at convince

EPUBJS.Queue.prototype.run = function(){
  if(!this.running && this._q.length) {
    this.running = true;
    this.dequeue().then(function(){
      this.running = false;
    }.bind(this));
  }
  
  this.tick.call(window, this.run.bind(this));
};

// Flush all, as quickly as possible
EPUBJS.Queue.prototype.flush = function(){
  if(this.running){
    return this.running;
  }

  if(this._q.length) {
    this.running = this.dequeue().
      then(function(){
        this.running = undefined;
        return this.flush();
      }.bind(this));

    return this.running;
  }

};

// Clear all items in wait
EPUBJS.Queue.prototype.clear = function(){
  this._q = [];
  this.running = false;
};

EPUBJS.Queue.prototype.length = function(){
  return this._q.length;
};

// Create a new task from a callback
EPUBJS.Task = function(task, args, context){

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
      'properties' : properties.length ? properties.split(' ') : []
    };

  });
  
  return manifest;

};

EPUBJS.Parser.prototype.spine = function(spineXml, manifest){
  var spine = [];
  
  var selected = spineXml.getElementsByTagName("itemref"),
      items = Array.prototype.slice.call(selected);

  var epubcfi = new EPUBJS.EpubCFI();

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

EPUBJS.EpubCFI.prototype.isCfiString = function(target) {
  if(typeof target === "string" &&
    target.indexOf("epubcfi(") === 0) {
      return true;
  }

  return false;
}
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
    item = toc[i];
    this.tocByHref[item.href] = i;
    this.tocById[item.id] = i;
  }

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
EPUBJS.Section = function(item){
    this.idref = item.idref;
    this.linear = item.linear;
    this.properties = item.properties;
    this.index = item.index;
    this.href = item.href;
    this.url = item.url;
    this.next = item.next;
    this.prev = item.prev;
    
    this.epubcfi = new EPUBJS.EpubCFI();
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
};

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

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* Takes: global layout settings object, chapter properties string
* Returns: Object with layout properties
*/
EPUBJS.Section.prototype.reconcileLayoutSettings = function(global){
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

EPUBJS.Section.prototype.cfiFromRange = function(_range) {
  return this.epubcfi.generateCfiFromRange(_range, this.cfiBase);
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


      if(manifestItem.properties.length){
        item.properties.push.apply(item.properties, manifestItem.properties)
      }
    }
    
    // if(index > 0) {
      item.prev = function(){ return this.get(index-1); }.bind(this);
    // }
    
    // if(index+1 < this.items.length) {
      item.next = function(){ return this.get(index+1); }.bind(this);
    // }
    
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

  if(this.epubcfi.isCfiString(target)) {
    cfi = this.epubcfi.parse(target);
    index = cfi.spinePos;
  } if(target && (typeof target === "number" || isNaN(target) === false)){
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
EPUBJS.replace = {};
EPUBJS.replace.links = function(view, renderer) {
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
        
      //}
      
      if(href.indexOf("#") === 0) {
        // do nothing with fragment yet
      } else {
        link.onclick = function(){
          renderer.display(href);
          return false;
        };
      }

    }
  };

  for (var i = 0; i < links.length; i++) {
    replaceLinks(links[i]);
  }

  task.resolve();
  return task.promise;
};
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
      this.url = uri.base;
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
        book.encoding = paths.encoding;
        
        // Set Url relative to the content
        if(packageUri.origin) {
          book.url = packageUri.base;
        } else if(window){
          location = EPUBJS.core.uri(window.location.href);
          book.url = EPUBJS.core.resolveUrl(location.base, _url + packageUri.directory);
        } else {
          book.url = packageUri.directory;
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
  var renderer = (options && options.method) ? 
      options.method.charAt(0).toUpperCase() + options.method.substr(1) :
      "Rendition";

  this.rendition = new EPUBJS[renderer](this, options);
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
EPUBJS.View = function(section, options) {
  this.settings = options || {};

  this.id = "epubjs-view:" + EPUBJS.core.uuid();
  this.section = section;
  this.index = section.index;

  this.element = document.createElement('div');
  this.element.classList.add("epub-view");
  

  // this.element.style.minHeight = "100px";
  this.element.style.height = "0px";
  this.element.style.width = "0px";
  this.element.style.overflow = "hidden";

  this.displayed = false;
  this.rendered = false;
  
  //this.width  = 0;
  //this.height = 0;

  // Blank Cfi for Parsing
  this.epubcfi = new EPUBJS.EpubCFI();

  if(this.settings.axis && this.settings.axis == "horizontal"){
    this.element.style.display = "inline-block";
  } else {
    this.element.style.display = "block";
  }
  
};

EPUBJS.View.prototype.create = function() {

  if(this.iframe) {
    return this.iframe;
  }

  this.iframe = document.createElement('iframe');
  this.iframe.id = this.id;
  // this.iframe.scrolling = "no"; // Removed: breaks ios width calculations
  this.iframe.style.overflow = "hidden";
  this.iframe.seamless = "seamless";
  // Back up if seamless isn't supported
  this.iframe.style.border = "none";
  
  this.resizing = true;

  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";
  
  this.element.appendChild(this.iframe);
  this.rendered = true;
  
  this.elementBounds = EPUBJS.core.bounds(this.element);

  // if(width || height){
  //   this.resize(width, height);
  // } else if(this.width && this.height){
  //   this.resize(this.width, this.height);
  // } else {
  //   this.iframeBounds = EPUBJS.core.bounds(this.iframe);
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


EPUBJS.View.prototype.lock = function(what, width, height) {
  
  var elBorders = EPUBJS.core.borders(this.element);
  var iframeBorders;

  if(this.iframe) {
    iframeBorders = EPUBJS.core.borders(this.iframe);
  } else {
    iframeBorders = {width: 0, height: 0};
  }

  if(what == "width" && EPUBJS.core.isNumber(width)){
    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.resize(this.lockedWidth, width); //  width keeps ratio correct
  }

  if(what == "height" && EPUBJS.core.isNumber(height)){
    this.lockedHeight = height - elBorders.height - iframeBorders.height;
    this.resize(width, this.lockedHeight);
  }

  if(what === "both" && 
     EPUBJS.core.isNumber(width) &&
     EPUBJS.core.isNumber(height)){
    
    this.lockedWidth = width - elBorders.width - iframeBorders.width;
    this.lockedHeight = height - elBorders.height - iframeBorders.height;

    this.resize(this.lockedWidth, this.lockedHeight);
  }

  if(this.displayed && this.iframe) {

      this.layout();
      this.expand();

  }

  

};

EPUBJS.View.prototype.resize = function(width, height) {
  
  if(!this.iframe) return;

  if(EPUBJS.core.isNumber(width)){
    this.iframe.style.width = width + "px";
  }

  if(EPUBJS.core.isNumber(height)){
    this.iframe.style.height = height + "px";
  }

  this.iframeBounds = EPUBJS.core.bounds(this.iframe);

  this.reframe(this.iframeBounds.width, this.iframeBounds.height);

};

EPUBJS.View.prototype.reframe = function(width, height) {
  //var prevBounds;

  if(!this.displayed) return;

  if(EPUBJS.core.isNumber(width)){
    this.element.style.width = width + "px";
  }

  if(EPUBJS.core.isNumber(height)){
    this.element.style.height = height + "px";
  }

  this.prevBounds = this.elementBounds;

  this.elementBounds = EPUBJS.core.bounds(this.element);

  this.trigger("resized", {
    width: this.elementBounds.width,
    height: this.elementBounds.height,
    widthDelta: this.elementBounds.width - this.prevBounds.width,
    heightDelta: this.elementBounds.height - this.prevBounds.height,
  });

};

EPUBJS.View.prototype.resized = function(e) {
  /*
  if (!this.resizing) {
    if(this.iframe) {
      // this.expand();
    }
  } else {
    this.resizing = false;
  }*/

};

EPUBJS.View.prototype.render = function(_request) {

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

EPUBJS.View.prototype.load = function(contents) {
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  this.document = this.iframe.contentDocument;
  
  if(!this.document) {
    loading.reject(new Error("No Document Available"));
    return loaded;
  }

  this.iframe.addEventListener("load", function(event) {
    
    this.window = this.iframe.contentWindow;
    this.document = this.iframe.contentDocument;
    this.rendering = false;
    loading.resolve(this);
    
  }.bind(this));
  
  if(this.supportsSrcdoc){
    this.iframe.srcdoc = contents;
  } else {
    this.document.open();
    this.document.write(contents);
    this.document.close();
  }

  return loaded;
};


EPUBJS.View.prototype.layout = function(layoutFunc) {

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

EPUBJS.View.prototype.onLayout = function(view) {
  // stub
};

EPUBJS.View.prototype.listeners = function() {
  /*
  setTimeout(function(){
    this.window.addEventListener("resize", this.resized.bind(this), false);
  }.bind(this), 10); // Wait to listen for resize events
  */

  // Wait for fonts to load to finish
  // http://dev.w3.org/csswg/css-font-loading/
  // Not implemented fully
  /*
  if(this.document.fonts && this.document.fonts.status === "loading") {
    console.log("fonts unloaded");
    this.document.fonts.onloadingdone = function(){
      console.log("loaded fonts");
      this.expand();
    }.bind(this);
  }
  */
  if(this.section.properties.indexOf("scripted") > -1){
    this.observer = this.observe(this.document.body);
  }

  this.imageLoadListeners();

  this.mediaQueryListeners();

};

EPUBJS.View.prototype.expand = function() {
  var width = this.lockedWidth;
  var height = this.lockedHeight;

  // Resize to the locked width;
  //this.resize(width, height);

  // Expand Vertically
  if(width && !height) {
    height = this.document.documentElement.scrollHeight;
    this.resize(null, height);
  }

  // Expand Horizontally
  if(height && !width) {
    width = this.document.body.scrollWidth;
    this.resize(width, null);
  };

  //this.reframe(width, height);

};

//https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
EPUBJS.View.prototype.mediaQueryListeners = function() {
    var sheets = this.document.styleSheets;
    var mediaChangeHandler = function(m){
      if(m.matches) {
        this.expand();
      }
    }.bind(this);

    for (var i = 0; i < sheets.length; i += 1) {
        var rules = sheets[i].cssRules;

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

EPUBJS.View.prototype.observe = function(target) {
  var renderer = this;

  // create an observer instance
  var observer = new MutationObserver(function(mutations) {
    renderer.expand();
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

// EPUBJS.View.prototype.appendTo = function(element) {
//   this.element = element;
//   this.element.appendChild(this.iframe);
// };
// 
// EPUBJS.View.prototype.prependTo = function(element) {
//   this.element = element;
//   element.insertBefore(this.iframe, element.firstChild);
// };

EPUBJS.View.prototype.imageLoadListeners = function(target) {
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

EPUBJS.View.prototype.display = function() {
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

EPUBJS.View.prototype.show = function() {

  this.element.style.visibility = "visible";

  if(this.iframe){
    this.iframe.style.visibility = "visible";
  }

  this.trigger("shown", this);
};

EPUBJS.View.prototype.hide = function() {
  // this.iframe.style.display = "none";
  this.element.style.visibility = "hidden";
  this.iframe.style.visibility = "hidden";

  this.stopExpanding = true;
  this.trigger("hidden", this);
};

EPUBJS.View.prototype.position = function() {
  return this.element.getBoundingClientRect();
};

EPUBJS.View.prototype.onDisplayed = function(view) {
  // Stub, override with a custom functions
};

EPUBJS.View.prototype.bounds = function() {  
  if(!this.elementBounds) {
    this.elementBounds = EPUBJS.core.bounds(this.element);
  }
  return this.elementBounds;
};

EPUBJS.View.prototype.destroy = function() {
  // Stop observing
  if(this.observer) {
    this.observer.disconnect();
  }

  if(this.displayed){
    this.stopExpanding = true;
    this.element.removeChild(this.iframe);
    this.displayed = false;
    this.iframe = null;
  }
  // this.element.style.height = "0px";
  // this.element.style.width = "0px";
};

EPUBJS.View.prototype.root = function() {
  if(!this.document) return null;
  return this.document.documentElement;
};

EPUBJS.View.prototype.locationOf = function(target) {
  
  if(!this.document) return;

  if(this.epubcfi.isCfiString(target)) {
    cfi = this.epubcfi.parse(target);

    if(typeof document.evaluate === 'undefined') {
      marker = this.epubcfi.addMarker(cfi, this.document);
      if(marker) {
        // Must Clean up Marker before going to page
        this.epubcfi.removeMarker(marker, this.document);

        return marker.getBoundingClientRect();
      }
    } else {
      range = this.epubcfi.generateRangeFromCfi(cfi, this.document);
      if(range) {
        return range.getBoundingClientRect();
      }
    }
  } else if(typeof target === "string" &&
    target.indexOf("#") > -1) {

    id = target.substring(target.indexOf("#"));
    el = this.document.getElementById(id);

    if(el) {
      return el.getBoundingClientRect();
    }
  }

  return {"left": 0, "top": 0};
};


RSVP.EventTarget.mixin(EPUBJS.View.prototype);
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
  $body.style.width = this.width + "px";

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

EPUBJS.Rendition = function(book, options) {
	
	this.settings = EPUBJS.core.extend(this.settings || {}, {
		infinite: true,
		hidden: false,
		width: false,
		height: null,
		layoutOveride : null, // Default: { spread: 'reflowable', layout: 'auto', orientation: 'auto'},
		axis: "vertical"
	});

	EPUBJS.core.extend(this.settings, options);
	
	this.viewSettings = {};

	this.book = book;
	
	this.views = [];
	
	//-- Adds Hook methods to the Rendition prototype
	this.hooks = {};
	this.hooks.display = new EPUBJS.Hook(this);
	this.hooks.layout = new EPUBJS.Hook(this);
	this.hooks.replacements = new EPUBJS.Hook(this);
	
	this.hooks.replacements.register(EPUBJS.replace.links.bind(this));
	// this.hooks.display.register(this.afterDisplay.bind(this));

  this.epubcfi = new EPUBJS.EpubCFI();

	this.q = new EPUBJS.Queue(this);

	this.q.enqueue(this.book.opened);

	this.q.enqueue(this.parseLayoutProperties);

};

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
EPUBJS.Rendition.prototype.initialize = function(_options){
	var options = _options || {};
	var height  = options.height;// !== false ? options.height : "100%";
	var width   = options.width;// !== false ? options.width : "100%";
	var hidden  = options.hidden || false;
	var container;
	var wrapper;
	
	if(options.height && EPUBJS.core.isNumber(options.height)) {
		height = options.height + "px";
	}

	if(options.width && EPUBJS.core.isNumber(options.width)) {
		width = options.width + "px";
	}
	
	// Create new container element
	container = document.createElement("div");
	
	container.id = "epubjs-container:" + EPUBJS.core.uuid();
	container.classList.add("epub-container");

	// Style Element
	container.style.fontSize = "0";
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

	container.style.overflow = this.settings.overflow;

	return container;
};

EPUBJS.Rendition.wrap = function(container) {
	var wrapper = document.createElement("div");
	
	wrapper.style.visibility = "hidden";
	wrapper.style.overflow = "hidden";
	wrapper.style.width = "0";
	wrapper.style.height = "0";
	
	wrapper.appendChild(container);
	return wrapper;
};
		
// Call to attach the container to an element in the dom
// Container must be attached before rendering can begin
EPUBJS.Rendition.prototype.attachTo = function(_element){
	var bounds;
	
	this.container = this.initialize({
		"width"  : this.settings.width,
		"height" : this.settings.height
	});

	if(EPUBJS.core.isElement(_element)) {
		this.element = _element;
	} else if (typeof _element === "string") {
		this.element = document.getElementById(_element);
	} 

	if(!this.element){
		console.error("Not an Element");
		return;
	}

	if(this.settings.hidden) {
		this.wrapper = this.wrap(this.container);
		this.element.appendChild(this.wrapper);
	} else {
		this.element.appendChild(this.container);
	}
		
	// Attach Listeners
	this.attachListeners();

	// Calculate Stage Size
	this.stageSize();

	// Add Layout method
	this.layoutMethod();
	
	// Trigger Attached
	this.trigger("attached");

	// Start processing queue
	// this.q.run();
	
};

EPUBJS.Rendition.prototype.attachListeners = function(){

	// Listen to window for resize event if width or height is set to 100%
	if(!EPUBJS.core.isNumber(this.settings.width) || 
		 !EPUBJS.core.isNumber(this.settings.height) ) {
		window.addEventListener("resize", this.onResized.bind(this), false);
	}

};

EPUBJS.Rendition.prototype.bounds = function() {
	return this.container.getBoundingClientRect();
};

EPUBJS.Rendition.prototype.display = function(target){
	
	return this.q.enqueue(this._display, target);

};

EPUBJS.Rendition.prototype._display = function(target){
			
	var displaying = new RSVP.defer();
	var displayed = displaying.promise;

	var section;
  var view;
  var cfi, spinePos;

  if(this.epubcfi.isCfiString(target)) {
    cfi = this.epubcfi.parse(target);
    spinePos = cfi.spinePos;
    section = this.book.spine.get(spinePos);
  } else {
    section = this.book.spine.get(target);
  }

	this.displaying = true;
	
	// Hide current views
	this.hide();

	if(section){
		view = this.createView(section);

		// Show view
		this.q.enqueue(this.append, view);

		// Move to correct place within the section, if needed
		// this.moveTo(what)

		// Show views
		this.show();

		this.hooks.display.trigger(view);

		displaying.resolve(this);

	} else {
		displaying.reject(new Error("No Section Found"));
	}

	return displayed;

};
// Takes a cfi, fragment or page?
EPUBJS.Rendition.prototype.moveTo = function(what){
	
};

EPUBJS.Rendition.prototype.render = function(view, show) {

	view.create();
	
	view.onLayout = this.layout.format.bind(this.layout);

	// Fit to size of the container, apply padding
	this.resizeView(view);

	// Render Chain
	return view.render(this.book.request)
		.then(function(){
			return this.hooks.replacements.trigger(view, this);
		}.bind(this))
		.then(function(){
			return this.hooks.layout.trigger(view);
		}.bind(this))
		.then(function(){
			return view.display()
		}.bind(this))
		.then(function(view){
			
			if(show != false && this.hidden === false) {
				this.q.enqueue(function(view){
					view.show();
				}, view);
			}
			

			// this.map = new EPUBJS.Map(view, this.layout);
			this.trigger("rendered", view.section);

		}.bind(this))
		.catch(function(e){
			this.trigger("loaderror", e);
		}.bind(this));

};


EPUBJS.Rendition.prototype.afterDisplayed = function(view){
	this.trigger("displayed", view.section);
};

EPUBJS.Rendition.prototype.append = function(view){
	// Clear existing views
	this.clear();

	this.views.push(view);
	// view.appendTo(this.container);
	this.container.appendChild(view.element);

	// view.on("displayed", this.afterDisplayed.bind(this));
	view.onDisplayed = this.afterDisplayed.bind(this);
	// this.resizeView(view);

	return this.render(view);
};

EPUBJS.Rendition.prototype.clear = function(){
	// Remove all views
	this.views.forEach(function(view){
		this._remove(view);
	}.bind(this));
	this.views = [];
};

EPUBJS.Rendition.prototype.remove = function(view) {
	var index = this.views.indexOf(view);

	if(index > -1) {
		this.views.splice(index, 1);
	}

	
	this._remove(view);

};

EPUBJS.Rendition.prototype._remove = function(view) {
	view.off("resized");

	if(view.displayed){
		view.destroy();
	}

	this.container.removeChild(view.element);
	view = null;
};

EPUBJS.Rendition.prototype.resizeView = function(view) {
	
	if(this.globalLayoutProperties.layout === "pre-paginated") {
		view.lock("both", this.stage.width, this.stage.height);
	} else {
		view.lock("width", this.stage.width, this.stage.height);
	}

};

EPUBJS.Rendition.prototype.stageSize = function(_width, _height){
	var bounds;
	var width = _width || this.settings.width;
	var height = _height || this.settings.height;

	// If width or height are set to false, inherit them from containing element
	if(width === false) {
		bounds = this.element.getBoundingClientRect();

		if(bounds.width) {
			width = bounds.width;
			this.container.style.width = bounds.width + "px";
		}
	}

	if(height === false) {
		bounds = bounds || this.element.getBoundingClientRect();

		if(bounds.height) {
			height = bounds.height;
			this.container.style.height = bounds.height + "px";
		}

	}

	if(width && !EPUBJS.core.isNumber(width)) {
		bounds = this.container.getBoundingClientRect();
		width = bounds.width;
		//height = bounds.height;
	}
		
	if(height && !EPUBJS.core.isNumber(height)) {
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

	this.stage = {
		width: width - 
						this.containerPadding.left - 
						this.containerPadding.right,
		height: height - 
						this.containerPadding.top - 
						this.containerPadding.bottom
	};

	return this.stage;

};

EPUBJS.Rendition.prototype.layoutMethod = function() {
	
	this.layout = new EPUBJS.Layout.Scroll();
	this.layoutUpdate();

	this.map = new EPUBJS.Map(this.layout);
};

EPUBJS.Rendition.prototype.layoutUpdate = function() {
	
	this.layout.calculate(this.stage.width, this.stage.height);

};

EPUBJS.Rendition.prototype.resize = function(width, height){

	this.stageSize(width, height);

	this.layoutUpdate();

	this.views.forEach(this.resizeView.bind(this));

	this.trigger("resized", {
		width: this.stage.width,
		height: this.stage.height
	});

};

EPUBJS.Rendition.prototype.onResized = function(e) {
	this.resize();
};

EPUBJS.Rendition.prototype.createView = function(section) {
	return new EPUBJS.View(section, this.viewSettings);
};

EPUBJS.Rendition.prototype.next = function(){

	return this.q.enqueue(function(){

		var next;
		var view;

		if(!this.views.length) return;

		next = this.views[0].section.next();

		if(next) {
			view = this.createView(next);
			return this.append(view);
		}

	});

};

EPUBJS.Rendition.prototype.prev = function(){

	return this.q.enqueue(function(){

		var prev;
		var view;

		if(!this.views.length) return;

		prev = this.views[0].section.prev();
		if(prev) {
			view = this.createView(prev);
			return this.append(view);
		}

	});

};

//-- http://www.idpf.org/epub/fxl/
EPUBJS.Rendition.prototype.parseLayoutProperties = function(_metadata){
	var metadata = _metadata || this.book.package.metadata;
	var layout = (this.layoutOveride && this.layoutOveride.layout) || metadata.layout || "reflowable";
	var spread = (this.layoutOveride && this.layoutOveride.spread) || metadata.spread || "auto";
	var orientation = (this.layoutOveride && this.layoutOveride.orientation) || metadata.orientation || "auto";
	this.globalLayoutProperties = {
		layout : layout,
		spread : spread,
		orientation : orientation
	};
	return this.globalLayoutProperties;
};


EPUBJS.Rendition.prototype.current = function(){
	var visible = this.visible();
	if(visible.length){
		// Current is the last visible view
		return visible[visible.length-1];
	}
  return null;
};

EPUBJS.Rendition.prototype.isVisible = function(view, offsetPrev, offsetNext, _container){
	var position = view.position();
	var container = _container || this.container.getBoundingClientRect();

	if(this.settings.axis === "horizontal" && 
		(position.right >= container.left - offsetPrev) &&
		!(position.left >= container.right + offsetNext)) {

		return true;
		
  } else if(this.settings.axis === "vertical" &&
  		(position.bottom >= container.top - offsetPrev) &&
		!(position.top >= container.bottom + offsetNext)) {

		return true;
  }

	return false;
	
};

EPUBJS.Rendition.prototype.visible = function(){
	var container = this.bounds();
  var visible = [];
  var isVisible;
  var view;

  for (var i = 0; i < this.views.length; i++) {
    view = this.views[i];
    isVisible = this.isVisible(view, 0, 0, container);

    if(isVisible === true) {
      visible.push(view);
    }

  };

  return visible;
  
};

EPUBJS.Rendition.prototype.bounds = function(func) {
  var bounds;
  
  if(!this.settings.height) {
    bounds = EPUBJS.core.windowBounds();
  } else {
    bounds = this.container.getBoundingClientRect();
  }

  return bounds;
};

EPUBJS.Rendition.prototype.displayed = function(){
  var displayed = [];
  var view;
  for (var i = 0; i < this.views.length; i++) {
    view = this.views[i];
    if(view.displayed){
      displayed.push(view);
    }
  };
  return displayed;
};

EPUBJS.Rendition.prototype.show = function(){
  var view;
  for (var i = 0; i < this.views.length; i++) {
    view = this.views[i];
    if(view.displayed){
      view.show();
    }
  };
  this.hidden = false;
};

EPUBJS.Rendition.prototype.hide = function(){
  var view;
  for (var i = 0; i < this.views.length; i++) {
    view = this.views[i];
    if(view.displayed){
      view.hide();
    }
  };
  this.hidden = true;
};

EPUBJS.Rendition.prototype.destroy = function(){
  // Clear the queue
	this.q.clear();

	this.clear();
	
	clearTimeout(this.trimTimeout);	
	if(this.settings.hidden) {
		this.element.removeChild(this.wrapper);
	} else {
		this.element.removeChild(this.container);
	}

};

EPUBJS.Rendition.prototype.reportLocation = function(){
  return this.q.enqueue(function(){
    this.location = this.currentLocation();
    this.trigger("locationChanged", this.location);
  }.bind(this));
};

EPUBJS.Rendition.prototype.currentLocation = function(){
  var view;
  var start, end;
  
  if(this.views.length) {
  	view = this.views[0];
    // start = container.left - view.position().left;
    // end = start + this.layout.spread;

    return this.map.page(view);
  }
  
};

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Rendition.prototype);

EPUBJS.Continuous = function(book, options) {
	
	EPUBJS.Rendition.apply(this, arguments); // call super constructor.

	this.settings = EPUBJS.core.extend(this.settings || {}, {
		infinite: true,
		overflow: "auto",
		axis: "vertical",
		offset: 500,
		offsetDelta: 250
	});
	
	EPUBJS.core.extend(this.settings, options);
	
	if(this.settings.hidden) {
		this.wrapper = this.wrap(this.container);
	}
		
	
};

// subclass extends superclass
EPUBJS.Continuous.prototype = Object.create(EPUBJS.Rendition.prototype);
EPUBJS.Continuous.prototype.constructor = EPUBJS.Continuous;

EPUBJS.Continuous.prototype.attachListeners = function(){

	// Listen to window for resize event if width or height is set to a percent
	if(!EPUBJS.core.isNumber(this.settings.width) || 
		 !EPUBJS.core.isNumber(this.settings.height) ) {
		window.addEventListener("resize", this.onResized.bind(this), false);
	}


	if(this.settings.infinite) {
		this.start();
	}


};

EPUBJS.Continuous.prototype._display = function(target){
			
	var displaying = new RSVP.defer();
	var displayed = displaying.promise;
 
	var section;
  var view;
  var cfi, spinePos;

  if(this.epubcfi.isCfiString(target)) {
    cfi = this.epubcfi.parse(target);
    spinePos = cfi.spinePos;
    section = this.book.spine.get(spinePos);
  } else {
    section = this.book.spine.get(target);
  }

	this.displaying = true;
  this.hide();

	if(section){
		view = new EPUBJS.View(section, this.viewSettings);
		
		// This will clear all previous views
		this.q.enqueue(this.fill, view).then(function(){

      // Move to correct place within the section, if needed
      this.q.enqueue(function(){

        var offset = view.locationOf(target);

        return this.moveTo(offset);

      });
            
      this.q.enqueue(this.check);

      this.q.enqueue(this.show);

      this.hooks.display.trigger(view);          

    }.bind(this));

    // view.displayed.then(function(){
    //  this.trigger("displayed", section);
    //  this.displaying = false;
    // displaying.resolve(this);
    //}.bind(this));
    displaying.resolve(this);

	} else {
		displaying.reject(new Error("No Section Found"));
	}

	return displayed;
};


EPUBJS.Continuous.prototype.moveTo = function(offset){
  var bounds = this.bounds();
  var dist = Math.floor(offset.top / bounds.height) * bounds.height;

  return this.check(0, dist+this.settings.offset).then(function(){
    
    if(this.settings.axis === "vertical") {
      this.scrollBy(0, dist);
    } else {
      this.scrollBy(dist, 0);
    }

  }.bind(this)); 
};

EPUBJS.Continuous.prototype.afterDisplayed = function(currView){
	var next = currView.section.next();
	var prev = currView.section.prev();
	var index = this.views.indexOf(currView);

	var prevView, nextView;

	if(index + 1 === this.views.length && next) {
		nextView = new EPUBJS.View(next, this.viewSettings);
		this.q.enqueue(this.append, nextView);
	}

	if(index === 0 && prev) {
		prevView = new EPUBJS.View(prev, this.viewSettings);
		this.q.enqueue(this.prepend, prevView);
	}

	// this.removeShownListeners(currView);
	// currView.onShown = this.afterDisplayed.bind(this);

	this.trigger("displayed", currView.section);

};


// Remove Previous Listeners if present
EPUBJS.Continuous.prototype.removeShownListeners = function(view){

	// view.off("shown", this.afterDisplayed);
	// view.off("shown", this.afterDisplayedAbove);
	view.onDisplayed = function(){};

};

EPUBJS.Continuous.prototype.append = function(view){
	this.views.push(view);
	this.container.appendChild(view.element);

	// view.on("shown", this.afterDisplayed.bind(this));
	view.onDisplayed = this.afterDisplayed.bind(this);

  //this.q.enqueue(this.check);
  return this.check();
};

EPUBJS.Continuous.prototype.prepend = function(view){
	this.views.unshift(view);
	this.container.insertBefore(view.element, this.container.firstChild);
	
	// view.on("shown", this.afterDisplayedAbove.bind(this));
	view.onDisplayed = this.afterDisplayed.bind(this);

	view.on("resized", this.counter.bind(this));

  // this.q.enqueue(this.check);
  return this.check();
};

EPUBJS.Continuous.prototype.counter = function(bounds){

	if(this.settings.axis === "vertical") {
		this.scrollBy(0, bounds.heightDelta, true);
	} else {
		this.scrollBy(bounds.widthDelta, 0, true);
	}

};

EPUBJS.Continuous.prototype.fill = function(view){

	if(this.views.length){
		this.clear();
	}

	this.views.push(view);

	this.container.appendChild(view.element);

	// view.on("shown", this.afterDisplayed.bind(this));
	view.onDisplayed = this.afterDisplayed.bind(this);

	return this.render(view)
    .then(function(){
      return this.check();
    }.bind(this));
};

EPUBJS.Continuous.prototype.insert = function(view, index) {
	this.views.splice(index, 0, view);

	if(index < this.cotainer.children.length){
		this.container.insertBefore(view.element, this.container.children[index]);
	} else {
		this.container.appendChild(view.element);
	}

	// this.q.enqueue(this.check);
  return this.check();
};

// // Remove the render element and clean up listeners
// EPUBJS.Continuous.prototype.remove = function(view) {
// 	var index = this.views.indexOf(view);
// 	if(index > -1) {
// 		this.views.splice(index, 1);
// 	}

// 	this.container.removeChild(view.element);
	
// 	view.off("resized");

// 	if(view.displayed){
// 		view.destroy();
// 	}
	
// 	view = null;
	
// };

EPUBJS.Continuous.prototype.first = function() {
	return this.views[0];
};

EPUBJS.Continuous.prototype.last = function() {
	return this.views[this.views.length-1];
};

EPUBJS.Continuous.prototype.each = function(func) {
	return this.views.forEach(func);
};

EPUBJS.Continuous.prototype.check = function(_offset){
	var checking = new RSVP.defer();
	var container = this.bounds();
  var promises = [];
  var offset = _offset || this.settings.offset;


	this.views.forEach(function(view){
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
          this.q.enqueue(this.trim);
        }.bind(this), 250);
			}

		}

	}.bind(this));

  
  if(promises.length){

    return RSVP.all(promises)
      .then(function(posts) {
        // Check to see if anything new is on screen after rendering
        this.q.enqueue(this.check);

      }.bind(this));

  } else {
    checking.resolve();

    return checking.promise;
  }

};

// EPUBJS.Continuous.prototype.trim = function(){
// 	var task = new RSVP.defer();
// 	var above = true;

// 	this.views.forEach(function(view, i){
// 		// var view = this.views[i];
// 		var prevShown = i > 0 ? this.views[i-1].displayed : false;
// 		var nextShown = (i+1 < this.views.length) ? this.views[i+1].displayed : false;
// 		if(!view.displayed && !prevShown && !nextShown) {
// 			// Remove
// 			this.erase(view, above);
// 		}
// 		if(nextShown) {
// 			above = false;
// 		}
// 	}.bind(this));

// 	task.resolve();
// 	return task.promise;
// };

EPUBJS.Continuous.prototype.trim = function(){
  var task = new RSVP.defer();
  var displayed = this.displayed();
  var first = displayed[0];
  var last = displayed[displayed.length-1];
  var firstIndex = this.views.indexOf(first);
  var lastIndex = this.views.indexOf(last);
  var above = this.views.slice(0, firstIndex);
  var below = this.views.slice(lastIndex+1);

  for (var i = 0; i < above.length-1; i++) {
    this.erase(above[i], above);
  };

  for (var i = 1; i < below.length; i++) {
    this.erase(below[i]);
  };

  task.resolve();
  return task.promise;
};

EPUBJS.Continuous.prototype.erase = function(view, above){ //Trim
	
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

	this.remove(view);
	
	if(above) {

		if(this.settings.axis === "vertical") {
			this.scrollTo(0, prevTop - bounds.height, true);
		} else {
			this.scrollTo(prevLeft - bounds.width, 0, true);
		}
	}
	
};


EPUBJS.Continuous.prototype.checkCurrent = function(position) {
  var view, top;
  var container = this.container.getBoundingClientRect();
  var length = this.views.length - 1;

  if(this.rendering) {
    return;
  }

  if(this.settings.axis === "horizontal") {
    // TODO: Check for current horizontal
  } else {
    
    for (var i = length; i >= 0; i--) {
      view = this.views[i];
      top = view.bounds().top;
      if(top < container.bottom) {
        
        if(this.current == view.section) {
          break;
        }

        this.current = view.section;
        this.trigger("current", this.current);
        break;
      }
    }

  }

};

EPUBJS.Continuous.prototype.start = function() {
  var scroller;

  this.tick = EPUBJS.core.requestAnimationFrame;

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

  window.addEventListener("scroll", function(e){
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

EPUBJS.Continuous.prototype.onScroll = function(){

  if(this.scrolled) {

    if(this.settings.height) {
	  	scrollTop = this.container.scrollTop;
	  	scrollLeft = this.container.scrollLeft;
	  } else {
	  	scrollTop = window.scrollY;
			scrollLeft = window.scrollX;
	  }

    if(!this.ignore) {

	    // this.trigger("scroll", {
	    //   top: scrollTop,
	    //   left: scrollLeft
	    // });

	    if((this.scrollDeltaVert === 0 && 
	    	 this.scrollDeltaHorz === 0) ||
	    	 this.scrollDeltaVert > this.settings.offsetDelta ||
	    	 this.scrollDeltaHorz > this.settings.offsetDelta) {

				this.q.enqueue(this.check);
				
				this.scrollDeltaVert = 0;
	    	this.scrollDeltaHorz = 0;

			}

		} else {
	    this.ignore = false;
		}

    this.scrollDeltaVert += Math.abs(scrollTop-this.prevScrollTop);
    this.scrollDeltaHorz += Math.abs(scrollLeft-this.prevScrollLeft);

		if(this.settings.height) {
			this.prevScrollTop = this.container.scrollTop;
			this.prevScrollLeft = this.container.scrollLeft;
		} else {
			this.prevScrollTop = window.scrollY;
			this.prevScrollLeft = window.scrollX;
		}


  	clearTimeout(this.scrollTimeout);
		this.scrollTimeout = setTimeout(function(){
			this.scrollDeltaVert = 0;
	    this.scrollDeltaHorz = 0;
		}.bind(this), 150);


    this.scrolled = false;
  }

  this.tick.call(window, this.onScroll.bind(this));

};

EPUBJS.Continuous.prototype.scrollBy = function(x, y, silent){
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

EPUBJS.Continuous.prototype.scrollTo = function(x, y, silent){
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

 EPUBJS.Continuous.prototype.resizeView = function(view) {

	if(this.settings.axis === "horizontal") {
		view.lock("height", this.stage.width, this.stage.height);
	} else {
		view.lock("width", this.stage.width, this.stage.height);
	}

};

EPUBJS.Continuous.prototype.currentLocation = function(){
  var visible = this.visible();
  var startPage, endPage;

  var container = this.container.getBoundingClientRect()
  
  if(visible.length === 1) {
    return this.map.page(visible[0]);
  }

  if(visible.length > 1) {

    startPage = this.map.page(visible[0]);
    endPage = this.map.page(visible[visible.length-1]);

    return {
      start: startPage.start,
      end: endPage.end
    }
  }
  
};

/*
EPUBJS.Continuous.prototype.current = function(what){
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
EPUBJS.Paginate = function(book, options) {

  EPUBJS.Continuous.apply(this, arguments);

  this.settings = EPUBJS.core.extend(this.settings || {}, {
    width: 600,
    height: 400,
    axis: "horizontal",
    forceSingle: false,
    minSpreadWidth: 800, //-- overridden by spread: none (never) / both (always)
    gap: "auto", //-- "auto" or int
    overflow: "hidden",
    infinite: false
  });

  EPUBJS.core.extend(this.settings, options);

  this.isForcedSingle = false;

  this.viewSettings = {
    axis: this.settings.axis
  };
  
  this.start();
};

EPUBJS.Paginate.prototype = Object.create(EPUBJS.Continuous.prototype);
EPUBJS.Paginate.prototype.constructor = EPUBJS.Paginate;


EPUBJS.Paginate.prototype.determineSpreads = function(cutoff){
  if(this.isForcedSingle || !cutoff || this.bounds().width < cutoff) {
    return 1; //-- Single Page
  }else{
    return 2; //-- Double Page
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
  console.log("spreads", spreads, this.settings.minSpreadWidth)
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

  return layoutMethod;
};

EPUBJS.Paginate.prototype.start = function(){  
  // On display
  // this.layoutSettings = this.reconcileLayoutSettings(globalLayout, chapter.properties);
  // this.layoutMethod = this.determineLayout(this.layoutSettings);
  // this.layout = new EPUBJS.Layout[this.layoutMethod]();
  //this.hooks.display.register(this.registerLayoutMethod.bind(this));
  this.hooks.display.register(this.reportLocation);

  this.currentPage = 0;

  window.addEventListener('unload', function(e){
    this.ignore = true;
    this.destroy();
  }.bind(this));

};

// EPUBJS.Rendition.prototype.createView = function(section) {
//   var view = new EPUBJS.View(section, this.viewSettings);


//   return view;
// };

EPUBJS.Paginate.prototype.layoutMethod = function() {
  //var task = new RSVP.defer();

  // this.spreads = this.determineSpreads(this.settings.minSpreadWidth);

  this.layout = new EPUBJS.Layout.Reflowable();

  this.layoutUpdate();

  // Set the look ahead offset for what is visible

  this.map = new EPUBJS.Map(this.layout);

  // this.hooks.layout.register(this.layout.format.bind(this));

  //task.resolve();
  //return task.promise;
  // return layout;
};

EPUBJS.Paginate.prototype.layoutUpdate = function() {
  
  this.spreads = this.determineSpreads(this.settings.minSpreadWidth);

  this.layout.calculate(
    this.stage.width, 
    this.stage.height, 
    this.settings.gap,
    this.spreads
  );

  this.settings.offset = this.layout.delta;  

};

EPUBJS.Paginate.prototype.moveTo = function(offset){
  var dist = Math.floor(offset.left / this.layout.delta) * this.layout.delta;
  return this.check(0, dist+this.settings.offset).then(function(){
    this.scrollBy(dist, 0);
  }.bind(this));
};

EPUBJS.Paginate.prototype.page = function(pg){
  
  // this.currentPage = pg;
  // this.renderer.infinite.scrollTo(this.currentPage * this.formated.pageWidth, 0);
  //-- Return false if page is greater than the total
  // return false;
};

EPUBJS.Paginate.prototype.next = function(){

  return this.q.enqueue(function(){
    this.scrollBy(this.layout.delta, 0);
    this.reportLocation();
    return this.check();
  });

  // return this.page(this.currentPage + 1);
};

EPUBJS.Paginate.prototype.prev = function(){

  return this.q.enqueue(function(){
    this.scrollBy(-this.layout.delta, 0);
    this.reportLocation();
    return this.check();
  });
  // return this.page(this.currentPage - 1);
};

EPUBJS.Paginate.prototype.reportLocation = function(){
  return this.q.enqueue(function(){
    this.location = this.currentLocation();
    this.trigger("locationChanged", this.location);
  }.bind(this));
};

EPUBJS.Paginate.prototype.currentLocation = function(){
  var visible = this.visible();
  var startA, startB, endA, endB;
  var pageLeft, pageRight;
  var container = this.container.getBoundingClientRect()
  
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
    }
  }
  
};

EPUBJS.Paginate.prototype.resize = function(width, height){
  // Clear the queue
  this.q.clear();

  this.stageSize(width, height);

  this.layoutUpdate();

  this.display(this.location.start);

  this.trigger("resized", {
    width: this.stage.width,
    height: this.stage.height
  });

};

EPUBJS.Paginate.prototype.onResized = function(e) {

  this.clear();

  clearTimeout(this.resizeTimeout);
  this.resizeTimeout = setTimeout(function(){
    this.resize();
  }.bind(this), 150);
};

// EPUBJS.Paginate.prototype.display = function(what){
//   return this.display(what);
// };
EPUBJS.Map = function(layout){
  this.layout = layout;
};

EPUBJS.Map.prototype.section = function(view) {
  var ranges = this.findRanges(view);
  var map = this.rangeListToCfiList(view, ranges);

  return map;
};

EPUBJS.Map.prototype.page = function(view, start, end) {
  var root = view.document.body;
  return this.rangePairToCfiPair(view.section, {
    start: this.findStart(root, start, end),
    end: this.findEnd(root, start, end)
  });
};

EPUBJS.Map.prototype.walk = function(root, func) {
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

EPUBJS.Map.prototype.findRanges = function(view){
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
  };
  
  return columns;
};

EPUBJS.Map.prototype.findStart = function(root, start, end){
  var stack = [root];
  var $el;
  var found;
  var $prev = root;
  while (stack.length) {

    $el = stack.shift();

    found = this.walk($el, function(node){
      var left, right;
      var elPos
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

EPUBJS.Map.prototype.findEnd = function(root, start, end){
  var stack = [root];
  var $el;
  var $prev = root;
  var found;

  while (stack.length) {

    $el = stack.shift();

    found = this.walk($el, function(node){
      
      var left, right;
      var elPos
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
        return $prev
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


EPUBJS.Map.prototype.findTextStartRange = function(node, start, end){
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

  };

  return ranges[0];
};

EPUBJS.Map.prototype.findTextEndRange = function(node, start, end){
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

  };

  // Ends before limit
  return ranges[ranges.length-1];

};

EPUBJS.Map.prototype.splitTextNodeIntoRanges = function(node, _splitter){
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



EPUBJS.Map.prototype.rangePairToCfiPair = function(section, rangePair){

  var startRange = rangePair.start;
  var endRange = rangePair.end;

  startRange.collapse(true);
  endRange.collapse(true);

  startCfi = section.cfiFromRange(startRange);
  endCfi = section.cfiFromRange(endRange);

  return {
    start: startCfi,
    end: endCfi
  }

};

EPUBJS.Map.prototype.rangeListToCfiList = function(view, columns){
  var map = [];
  var rangePair, cifPair;

  for (var i = 0; i < columns.length; i++) {
    cifPair = this.rangePairToCfiPair(view.section, columns[i]);

    map.push(cifPair);

  };
  
  return map;
};