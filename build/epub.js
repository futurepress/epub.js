(function(global) {
var define, requireModule, require, requirejs;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requirejs = require = requireModule = function(name) {
  requirejs._eak_seen = registry;

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
        reified.push(requireModule(resolve(deps[i])));
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
})();

define("rsvp/all", 
  ["./promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];

    __exports__["default"] = function all(array, label) {
      return Promise.all(array, label);
    };
  });
define("rsvp/asap", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = function asap(callback, arg) {
      var length = queue.push([callback, arg]);
      if (length === 1) {
        // If length is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        scheduleFlush();
      }
    };

    var browserGlobal = (typeof window !== 'undefined') ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;

    // node
    function useNextTick() {
      return function() {
        process.nextTick(flush);
      };
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    function useSetTimeout() {
      return function() {
        setTimeout(flush, 1);
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
  });
define("rsvp/config", 
  ["./events","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var EventTarget = __dependency1__["default"];

    var config = {
      instrument: false
    };

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
define("rsvp/defer", 
  ["./promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];

    /**
      `RSVP.defer` returns an object similar to jQuery's `$.Deferred` objects.
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
      @for RSVP
      @param {String} -
      @return {Object}
     */

    __exports__["default"] = function defer(label) {
      var deferred = { };

      deferred.promise = new Promise(function(resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
      }, label);

      return deferred;
    };
  });
define("rsvp/events", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var indexOf = function(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i] === callback) { return i; }
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

    /**
      //@module RSVP
      //@class EventTarget
    */
    __exports__["default"] = {

      /**
        @private
        `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
        Example:

        ```javascript
        var object = {};

        RSVP.EventTarget.mixin(object);

        object.on("finished", function(event) {
          // handle event
        });

        object.trigger("finished", { detail: value });
        ```

        `EventTarget.mixin` also works with prototypes:

        ```javascript
        var Person = function() {};
        RSVP.EventTarget.mixin(Person.prototype);

        var yehuda = new Person();
        var tom = new Person();

        yehuda.on("poke", function(event) {
          console.log("Yehuda says OW");
        });

        tom.on("poke", function(event) {
          console.log("Tom says OW");
        });

        yehuda.trigger("poke");
        tom.trigger("poke");
        ```

        @method mixin
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
        @private

        Registers a callback to be executed when `eventName` is triggered

        ```javascript
        object.on('event', function(eventInfo){
          // handle the event
        });

        object.trigger('event');
        ```

        @method on
        @param {String} eventName name of the event to listen for
        @param {Function} callback function to be called when the event is triggered.
      */
      on: function(eventName, callback) {
        var allCallbacks = callbacksFor(this), callbacks;

        callbacks = allCallbacks[eventName];

        if (!callbacks) {
          callbacks = allCallbacks[eventName] = [];
        }

        if (indexOf(callbacks, callback) === -1) {
          callbacks.push(callback);
        }
      },

      /**
        @private

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
        @param {String} eventName event to stop listening to
        @param {Function} callback optional argument. If given, only the function
        given will be removed from the event's callback queue. If no `callback`
        argument is given, all callbacks will be removed from the event's callback
        queue.
      */
      off: function(eventName, callback) {
        var allCallbacks = callbacksFor(this), callbacks, index;

        if (!callback) {
          allCallbacks[eventName] = [];
          return;
        }

        callbacks = allCallbacks[eventName];

        index = indexOf(callbacks, callback);

        if (index !== -1) { callbacks.splice(index, 1); }
      },

      /**
        @private

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
        @param {String} eventName name of the event to be triggered
        @param {Any} options optional value to be passed to any event handlers for
        the given `eventName`
      */
      trigger: function(eventName, options) {
        var allCallbacks = callbacksFor(this),
            callbacks, callbackTuple, callback, binding;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callback = callbacks[i];

            callback(options);
          }
        }
      }
    };
  });
define("rsvp/filter", 
  ["./all","./map","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var all = __dependency1__["default"];
    var map = __dependency2__["default"];
    var isFunction = __dependency3__.isFunction;
    var isArray = __dependency3__.isArray;

    /**
     `RSVP.filter` is similar to JavaScript's native `filter` method, except that it
      waits for all promises to become fulfilled before running the `filterFn` on
      each item in given to `promises`. `RSVP.filterFn` returns a promise that will
      become fulfilled with the result of running `filterFn` on the values the
      promises become fulfilled with.

      For example:

      ```javascript

      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.resolve(2);
      var promise3 = RSVP.resolve(3);

      var filterFn = function(item){
        return item > 1;
      };

      RSVP.filter(promises, filterFn).then(function(result){
        // result is [ 2, 3 ]
      });
      ```

      If any of the `promises` given to `RSVP.filter` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
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
      @for RSVP
      @param {Array} promises
      @param {Function} filterFn - function to be called on each resolved value to
      filter the final results.
      @param {String} label optional string describing the promise. Useful for
      tooling.
      @return {Promise}
    */
    function filter(promises, filterFn, label) {
      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to filter.');
      }

      if (!isFunction(filterFn)){
        throw new TypeError("You must pass a function to filter's second argument.");
      }

      return all(promises, label).then(function(values){
        return map(promises, filterFn, label).then(function(filterResults){
           var i,
               valuesLen = values.length,
               filtered = [];

           for (i = 0; i < valuesLen; i++){
             if(filterResults[i]) filtered.push(values[i]);
           }
           return filtered;
        });
      });
    }

    __exports__["default"] = filter;
  });
define("rsvp/hash", 
  ["./promise","./utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];
    var isNonThenable = __dependency2__.isNonThenable;
    var keysOf = __dependency2__.keysOf;

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
      that is rejected will be given as as the first argument, or as the reason to
      the rejection handler. For example:

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
      @for RSVP
      @param {Object} promises
      @param {String} label - optional string that describes the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when all properties of `promises`
      have been fulfilled, or rejected if any of them become rejected.
    */
    __exports__["default"] = function hash(object, label) {
      return new Promise(function(resolve, reject){
        var results = {};
        var keys = keysOf(object);
        var remaining = keys.length;
        var entry, property;

        if (remaining === 0) {
          resolve(results);
          return;
        }

       function fulfilledTo(property) {
          return function(value) {
            results[property] = value;
            if (--remaining === 0) {
              resolve(results);
            }
          };
        }

        function onRejection(reason) {
          remaining = 0;
          reject(reason);
        }

        for (var i = 0; i < keys.length; i++) {
          property = keys[i];
          entry = object[property];

          if (isNonThenable(entry)) {
            results[property] = entry;
            if (--remaining === 0) {
              resolve(results);
            }
          } else {
            Promise.cast(entry).then(fulfilledTo(property), onRejection);
          }
        }
      });
    };
  });
define("rsvp/instrument", 
  ["./config","./utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var config = __dependency1__.config;
    var now = __dependency2__.now;

    __exports__["default"] = function instrument(eventName, promise, child) {
      // instrumentation should not disrupt normal usage.
      try {
        config.trigger(eventName, {
          guid: promise._guidKey + promise._id,
          eventName: eventName,
          detail: promise._detail,
          childGuid: child && promise._guidKey + child._id,
          label: promise._label,
          timeStamp: now(),
          stack: new Error(promise._label).stack
        });
      } catch(error) {
        setTimeout(function(){
          throw error;
        }, 0);
      }
    };
  });
define("rsvp/map", 
  ["./promise","./all","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];
    var all = __dependency2__["default"];
    var isArray = __dependency3__.isArray;
    var isFunction = __dependency3__.isFunction;

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
      that is rejected will be given as an argument to the returned promises's
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
      the blog posts first becuase they contain a url to those comments.

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
      @for RSVP
      @param {Array} promises
      @param {Function} mapFn function to be called on each fulfilled promise.
      @param {String} label optional string for labelling the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled with the result of calling
      `mapFn` on each fulfilled promise or value when they become fulfilled.
       The promise will be rejected if any of the given `promises` become rejected.
    */
    __exports__["default"] = function map(promises, mapFn, label) {

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to map.');
      }

      if (!isFunction(mapFn)){
        throw new TypeError("You must pass a function to map's second argument.");
      }

      return all(promises, label).then(function(results){
        var resultLen = results.length,
            mappedResults = [],
            i;

        for (i = 0; i < resultLen; i++){
          mappedResults.push(mapFn(results[i]));
        }

        return all(mappedResults, label);
      });
    };
  });
define("rsvp/node", 
  ["./promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];

    var slice = Array.prototype.slice;

    function makeNodeCallbackFor(resolve, reject) {
      return function (error, value) {
        if (error) {
          reject(error);
        } else if (arguments.length > 2) {
          resolve(slice.call(arguments, 1));
        } else {
          resolve(value);
        }
      };
    }

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

      Using `denodeify` makes it easier to compose asynchronous operations instead
      of using callbacks. For example, instead of:

      ```javascript
      var fs = require('fs');
      var log = require('some-async-logger');

      fs.readFile('myfile.txt', function(err, data){
        if (err) return handleError(err);
        fs.writeFile('myfile2.txt', data, function(err){
          if (err) throw err;
          log('success', function(err) {
            if (err) throw err;
          });
        });
      });
      ```

      You can chain the operations together using `then` from the returned promise:

      ```javascript
      var fs = require('fs');
      var denodeify = RSVP.denodeify;
      var readFile = denodeify(fs.readFile);
      var writeFile = denodeify(fs.writeFile);
      var log = denodeify(require('some-async-logger'));

      readFile('myfile.txt').then(function(data){
        return writeFile('myfile2.txt', data);
      }).then(function(){
        return log('SUCCESS');
      }).then(function(){
        // success handler
      }, function(reason){
        // rejection handler
      });
      ```

      @method denodeify
      @for RSVP
      @param {Function} nodeFunc a "node-style" function that takes a callback as
      its last argument. The callback expects an error to be passed as its first
      argument (if an error occurred, otherwise null), and the value from the
      operation as its second argument ("function(err, value){ }").
      @param {Any} binding optional argument for binding the "this" value when
      calling the `nodeFunc` function.
      @return {Function} a function that wraps `nodeFunc` to return an
      `RSVP.Promise`
    */
    __exports__["default"] = function denodeify(nodeFunc, binding) {
      return function()  {
        var nodeArgs = slice.call(arguments), resolve, reject;
        var thisArg = this || binding;

        return new Promise(function(resolve, reject) {
          Promise.all(nodeArgs).then(function(nodeArgs) {
            try {
              nodeArgs.push(makeNodeCallbackFor(resolve, reject));
              nodeFunc.apply(thisArg, nodeArgs);
            } catch(e) {
              reject(e);
            }
          });
        });
      };
    };
  });
define("rsvp/promise", 
  ["./config","./events","./instrument","./utils","./promise/cast","./promise/all","./promise/race","./promise/resolve","./promise/reject","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __exports__) {
    "use strict";
    var config = __dependency1__.config;
    var EventTarget = __dependency2__["default"];
    var instrument = __dependency3__["default"];
    var objectOrFunction = __dependency4__.objectOrFunction;
    var isFunction = __dependency4__.isFunction;
    var now = __dependency4__.now;
    var cast = __dependency5__["default"];
    var all = __dependency6__["default"];
    var race = __dependency7__["default"];
    var Resolve = __dependency8__["default"];
    var Reject = __dependency9__["default"];

    var guidKey = 'rsvp_' + now() + '-';
    var counter = 0;

    function noop() {}

    __exports__["default"] = Promise;
    function Promise(resolver, label) {
      if (!isFunction(resolver)) {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
      }

      if (!(this instanceof Promise)) {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
      }

      this._id = counter++;
      this._label = label;
      this._subscribers = [];

      if (config.instrument) {
        instrument('created', this);
      }

      if (noop !== resolver) {
        invokeResolver(resolver, this);
      }
    }

    function invokeResolver(resolver, promise) {
      function resolvePromise(value) {
        resolve(promise, value);
      }

      function rejectPromise(reason) {
        reject(promise, reason);
      }

      try {
        resolver(resolvePromise, rejectPromise);
      } catch(e) {
        rejectPromise(e);
      }
    }

    Promise.cast = cast;
    Promise.all = all;
    Promise.race = race;
    Promise.resolve = Resolve;
    Promise.reject = Reject;

    var PENDING   = void 0;
    var SEALED    = 0;
    var FULFILLED = 1;
    var REJECTED  = 2;

    function subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      subscribers[length] = child;
      subscribers[length + FULFILLED] = onFulfillment;
      subscribers[length + REJECTED]  = onRejection;
    }

    function publish(promise, settled) {
      var child, callback, subscribers = promise._subscribers, detail = promise._detail;

      if (config.instrument) {
        instrument(settled === FULFILLED ? 'fulfilled' : 'rejected', promise);
      }

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        invokeCallback(settled, child, callback, detail);
      }

      promise._subscribers = null;
    }

    Promise.prototype = {
      constructor: Promise,

      _id: undefined,
      _guidKey: guidKey,
      _label: undefined,

      _state: undefined,
      _detail: undefined,
      _subscribers: undefined,

      _onerror: function (reason) {
        config.trigger('error', reason);
      },

      then: function(onFulfillment, onRejection, label) {
        var promise = this;
        this._onerror = null;

        var thenPromise = new this.constructor(noop, label);

        if (this._state) {
          var callbacks = arguments;
          config.async(function invokePromiseCallback() {
            invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
          });
        } else {
          subscribe(this, thenPromise, onFulfillment, onRejection);
        }

        if (config.instrument) {
          instrument('chained', promise, thenPromise);
        }

        return thenPromise;
      },

      'catch': function(onRejection, label) {
        return this.then(null, onRejection, label);
      },

      'finally': function(callback, label) {
        var constructor = this.constructor;

        return this.then(function(value) {
          return constructor.cast(callback()).then(function(){
            return value;
          });
        }, function(reason) {
          return constructor.cast(callback()).then(function(){
            throw reason;
          });
        }, label);
      }
    };

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        try {
          value = callback(detail);
          succeeded = true;
        } catch(e) {
          failed = true;
          error = e;
        }
      } else {
        value = detail;
        succeeded = true;
      }

      if (handleThenable(promise, value)) {
        return;
      } else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (settled === FULFILLED) {
        resolve(promise, value);
      } else if (settled === REJECTED) {
        reject(promise, value);
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
            }, 'derived from: ' + (promise._label || ' unknown promise'));

            return true;
          }
        }
      } catch (error) {
        if (resolved) { return true; }
        reject(promise, error);
        return true;
      }

      return false;
    }

    function resolve(promise, value) {
      if (promise === value) {
        fulfill(promise, value);
      } else if (!handleThenable(promise, value)) {
        fulfill(promise, value);
      }
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = value;

      config.async(publishFulfillment, promise);
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = reason;

      config.async(publishRejection, promise);
    }

    function publishFulfillment(promise) {
      publish(promise, promise._state = FULFILLED);
    }

    function publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._detail);
      }

      publish(promise, promise._state = REJECTED);
    }
  });
define("rsvp/promise/all", 
  ["../utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var isArray = __dependency1__.isArray;
    var isNonThenable = __dependency1__.isNonThenable;

    /**
      Returns a promise that is fulfilled when all the given promises have been
      fulfilled, or rejected if any of them become rejected. The return promise
      is fulfilled with an array that gives all the values in the order they were
      passed in the `promises` array argument.

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
      @for RSVP.Promise
      @param {Array} promises
      @param {String} label
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
    */
    __exports__["default"] = function all(entries, label) {
      if (!isArray(entries)) {
        throw new TypeError('You must pass an array to all.');
      }

      /*jshint validthis:true */
      var Constructor = this;

      return new Constructor(function(resolve, reject) {
        var remaining = entries.length;
        var results = new Array(remaining);
        var entry, pending = true;

        if (remaining === 0) {
          resolve(results);
          return;
        }

        function fulfillmentAt(index) {
          return function(value) {
            results[index] = value;
            if (--remaining === 0) {
              resolve(results);
            }
          };
        }

        function onRejection(reason) {
          remaining = 0;
          reject(reason);
        }

        for (var index = 0; index < entries.length; index++) {
          entry = entries[index];
          if (isNonThenable(entry)) {
            results[index] = entry;
            if (--remaining === 0) {
              resolve(results);
            }
          } else {
            Constructor.cast(entry).then(fulfillmentAt(index), onRejection);
          }
        }
      }, label);
    };
  });
define("rsvp/promise/cast", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.Promise.cast` returns the same promise if that promise shares a constructor
      with the promise being casted.

      Example:

      ```javascript
      var promise = RSVP.resolve(1);
      var casted = RSVP.Promise.cast(promise);

      console.log(promise === casted); // true
      ```

      In the case of a promise whose constructor does not match, it is assimilated.
      The resulting promise will fulfill or reject based on the outcome of the
      promise being casted.

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

      `RSVP.Promise.cast` is similar to `RSVP.resolve`, but `RSVP.Promise.cast` differs in the
      following ways:
      * `RSVP.Promise.cast` serves as a memory-efficient way of getting a promise, when you
      have something that could either be a promise or a value. RSVP.resolve
      will have the same effect but will create a new promise wrapper if the
      argument is a promise.
      * `RSVP.Promise.cast` is a way of casting incoming thenables or promise subclasses to
      promises of the exact class specified, so that the resulting object's `then` is
      ensured to have the behavior of the constructor you are calling cast on (i.e., RSVP.Promise).

      @method cast
      @for RSVP.Promise
      @param {Object} object to be casted
      @return {Promise} promise that is fulfilled when all properties of `promises`
      have been fulfilled, or rejected if any of them become rejected.
    */

    __exports__["default"] = function cast(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      return new Constructor(function(resolve) {
        resolve(object);
      });
    };
  });
define("rsvp/promise/race", 
  ["../utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */

    var isArray = __dependency1__.isArray;
    var isFunction = __dependency1__.isFunction;
    var isNonThenable = __dependency1__.isNonThenable;

    /**
      `RSVP.Promise.race` allows you to watch a series of promises and act as soon as the
      first promise given to the `promises` argument fulfills or rejects.

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

      `RSVP.race` is deterministic in that only the state of the first completed
      promise matters. For example, even if other promises given to the `promises`
      array argument are resolved, but the first completed promise has become
      rejected before the other promises became fulfilled, the returned promise
      will become rejected:

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
        // Code here never runs because there are rejected promises!
      }, function(reason){
        // reason.message === "promise2" because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```

      @method race
      @for RSVP.Promise
      @param {Array} promises array of promises to observe
      @param {String} label optional string for describing the promise returned.
      Useful for tooling.
      @return {Promise} a promise that becomes fulfilled with the value the first
      completed promises is resolved with if the first completed promise was
      fulfilled, or rejected with the reason that the first completed promise
      was rejected with.
    */
    __exports__["default"] = function race(entries, label) {
      if (!isArray(entries)) {
        throw new TypeError('You must pass an array to race.');
      }

      /*jshint validthis:true */
      var Constructor = this, entry;

      return new Constructor(function(resolve, reject) {
        var pending = true;

        function onFulfillment(value) { if (pending) { pending = false; resolve(value); } }
        function onRejection(reason)  { if (pending) { pending = false; reject(reason); } }

        for (var i = 0; i < entries.length; i++) {
          entry = entries[i];
          if (isNonThenable(entry)) {
            pending = false;
            resolve(entry);
            return;
          } else {
            Constructor.cast(entry).then(onFulfillment, onRejection);
          }
        }
      }, label);
    };
  });
define("rsvp/promise/reject", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.reject` returns a promise that will become rejected with the passed
      `reason`. `RSVP.reject` is essentially shorthand for the following:

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
      var promise = RSVP.reject(new Error('WHOOPS'));

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      @method reject
      @for RSVP.Promise
      @param {Any} reason value that the returned promise will be rejected with.
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become rejected with the given
      `reason`.
    */
    __exports__["default"] = function reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;

      return new Constructor(function (resolve, reject) {
        reject(reason);
      }, label);
    };
  });
define("rsvp/promise/resolve", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.resolve` returns a promise that will become fulfilled with the passed
      `value`. `RSVP.resolve` is essentially shorthand for the following:

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
      var promise = RSVP.resolve(1);

      promise.then(function(value){
        // value === 1
      });
      ```

      @method resolve
      @for RSVP.Promise
      @param {Any} value value that the returned promise will be resolved with
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    __exports__["default"] = function resolve(value, label) {
      /*jshint validthis:true */
      var Constructor = this;

      return new Constructor(function(resolve, reject) {
        resolve(value);
      }, label);
    };
  });
define("rsvp/race", 
  ["./promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];

    __exports__["default"] = function race(array, label) {
      return Promise.race(array, label);
    };
  });
define("rsvp/reject", 
  ["./promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];

    __exports__["default"] = function reject(reason, label) {
      return Promise.reject(reason, label);
    };
  });
define("rsvp/resolve", 
  ["./promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];

    __exports__["default"] = function resolve(value, label) {
      return Promise.resolve(value, label);
    };
  });
define("rsvp/rethrow", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.rethrow` will rethrow an error on the next turn of the JavaScript event
      loop in order to aid debugging.

      Promises A+ specifies that any exceptions that occur with a promise must be
      caught by the promises implementation and bubbled to the last handler. For
      this reason, it is recommended that you always specify a second rejection
      handler function to `then`. However, `RSVP.rethrow` will throw the exception
      outside of the promise, so it bubbles up to your console if in the browser,
      or domain/cause uncaught exception in Node. `rethrow` will throw the error
      again so the error can be handled by the promise.

      ```javascript
      function throws(){
        throw new Error('Whoops!');
      }

      var promise = new RSVP.Promise(function(resolve, reject){
        throws();
      });

      promise.fail(RSVP.rethrow).then(function(){
        // Code here doesn't run because the promise became rejected due to an
        // error!
      }, function (err){
        // handle the error here
      });
      ```

      The 'Whoops' error will be thrown on the next turn of the event loop
      and you can watch for it in your console. You can also handle it using a
      rejection handler given to `.then` or `.fail` on the returned promise.

      @method rethrow
      @for RSVP
      @param {Error} reason reason the promise became rejected.
      @throws Error
    */
    __exports__["default"] = function rethrow(reason) {
      setTimeout(function() {
        throw reason;
      });
      throw reason;
    };
  });
define("rsvp/utils", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function objectOrFunction(x) {
      return typeof x === "function" || (typeof x === "object" && x !== null);
    }

    __exports__.objectOrFunction = objectOrFunction;function isFunction(x) {
      return typeof x === "function";
    }

    __exports__.isFunction = isFunction;function isNonThenable(x) {
      return !objectOrFunction(x);
    }

    __exports__.isNonThenable = isNonThenable;function isArray(x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    }

    __exports__.isArray = isArray;// Date.now is not available in browsers < IE9
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
    var now = Date.now || function() { return new Date().getTime(); };
    __exports__.now = now;
    var keysOf = Object.keys || function(object) {
      var result = [];

      for (var prop in object) {
        result.push(prop);
      }

      return result;
    };
    __exports__.keysOf = keysOf;
  });
define("rsvp", 
  ["./rsvp/promise","./rsvp/events","./rsvp/node","./rsvp/all","./rsvp/race","./rsvp/hash","./rsvp/rethrow","./rsvp/defer","./rsvp/config","./rsvp/map","./rsvp/resolve","./rsvp/reject","./rsvp/asap","./rsvp/filter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __dependency11__, __dependency12__, __dependency13__, __dependency14__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];
    var EventTarget = __dependency2__["default"];
    var denodeify = __dependency3__["default"];
    var all = __dependency4__["default"];
    var race = __dependency5__["default"];
    var hash = __dependency6__["default"];
    var rethrow = __dependency7__["default"];
    var defer = __dependency8__["default"];
    var config = __dependency9__.config;
    var configure = __dependency9__.configure;
    var map = __dependency10__["default"];
    var resolve = __dependency11__["default"];
    var reject = __dependency12__["default"];
    var asap = __dependency13__["default"];
    var filter = __dependency14__["default"];

    config.async = asap; // default async is asap;

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
    __exports__.race = race;
    __exports__.hash = hash;
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
global.RSVP = requireModule('rsvp');
}(window));
'use strict';

var EPUBJS = EPUBJS || {};
EPUBJS.VERSION = "0.1.5";

EPUBJS.plugins = EPUBJS.plugins || {};

EPUBJS.filePath = EPUBJS.filePath || "/epubjs/";

(function(root) {

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
				options = { 'bookPath' : bookPath };
			}

		}

		/* 
		*   var book = ePub({ bookPath: "path/to/book.epub", restore: true });
		*
		*   - OR -
		*
		*   var book = ePub({ restore: true });
		*   book.open("path/to/book.epub");
		*/

		if( arguments[0] && typeof arguments[0] === 'object' ) {
			options = arguments[0];
		}
		
		
		return new EPUBJS.Book(options);
	};

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

})(window);
EPUBJS.Book = function(options){

	var book = this;
	
	this.settings = _.defaults(options || {}, {
		bookPath : null,
		bookKey : null,
		packageUrl : null,
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
	
	if(this.settings.storage !== false){
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

	this.ready.all.then(this._ready.bind(this));
	
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
};

//-- Check bookUrl and start parsing book Assets or load them from storage 
EPUBJS.Book.prototype.open = function(bookPath, forceReload){
	var book = this,
			epubpackage,
			opened = new RSVP.defer();

	this.settings.bookPath = bookPath;

	//-- Get a absolute URL from the book path
	this.bookUrl = this.urlFrom(bookPath);

	if(this.settings.contained || this.isContained(bookPath)){
		
		this.settings.contained = this.contained = true;
		
		this.bookUrl = '';
		
		// return; //-- TODO: this need to be fixed and tested before enabling
		epubpackage = this.unarchive(bookPath).
			then(function(){
				return this.loadPackage();
			});
			
	}	else {
		epubpackage = this.loadPackage();
	}
	
	if(this.settings.restore && !forceReload){
		//-- Will load previous package json, or re-unpack if error
		epubpackage.then(function(packageXml) {
			var identifier = book.packageIdentifier(packageXml);
			var restored = book.restore(identifier);

			if(!restored) {
				book.unpack(packageXml);
			}
			opened.resolve();
			book.defer_opened.resolve();
		});
		
	}else{
		
		//-- Get package information from epub opf
		epubpackage.then(function(packageXml) {
			book.unpack(packageXml);
			opened.resolve();
			book.defer_opened.resolve();
		});
	}
	
	//-- If there is network connection, store the books contents
	if(this.online && this.settings.storage && !this.settings.contained){
		if(!this.settings.stored) opened.then(book.storeOffline());
	}

	return opened.promise;

};

EPUBJS.Book.prototype.loadPackage = function(_containerPath){
	var book = this,
			parse = new EPUBJS.Parser(),
			containerPath = _containerPath || "META-INF/container.xml",
			containerXml,
			packageXml;
	
	if(!this.settings.packageUrl) { //-- provide the packageUrl to skip this step
		packageXml = book.loadXml(book.bookUrl + containerPath).
			then(function(containerXml){
				return parse.container(containerXml); // Container has path to content
			}).
			then(function(paths){
				book.settings.contentsPath = book.bookUrl + paths.basePath;
				book.settings.packageUrl = book.bookUrl + paths.packagePath;
				return book.loadXml(book.settings.packageUrl); // Containes manifest, spine and metadata 
			});
	} else {
		packageXml = book.loadXml(book.settings.packageUrl);
	}

	return packageXml;
};

EPUBJS.Book.prototype.packageIdentifier = function(packageXml){
	var book = this,
			parse = new EPUBJS.Parser();

	return parse.identifier(packageXml);
};

EPUBJS.Book.prototype.unpack = function(packageXml){
	var book = this,
			parse = new EPUBJS.Parser();
	
	book.contents = parse.packageContents(packageXml, book.settings.contentsPath); // Extract info from contents

	book.manifest = book.contents.manifest;
	book.spine = book.contents.spine;
	book.spineIndexByURL = book.contents.spineIndexByURL;
	book.metadata = book.contents.metadata;
	book.setBookKey(book.metadata.identifier);
	
	book.cover = book.contents.cover = book.settings.contentsPath + book.contents.coverPath;
	
	book.spineNodeIndex = book.contents.spineNodeIndex;
	
	book.ready.manifest.resolve(book.contents.manifest);
	book.ready.spine.resolve(book.contents.spine);
	book.ready.metadata.resolve(book.contents.metadata);
	book.ready.cover.resolve(book.contents.cover);

	//-- TODO: Adjust setting based on metadata

	//-- Load the TOC, optional; either the EPUB3 XHTML Navigation file or the EPUB2 NCX file
	if(book.contents.navPath) {
		book.settings.navUrl = book.settings.contentsPath + book.contents.navPath;

		book.loadXml(book.settings.navUrl).
			then(function(navHtml){
				return parse.nav(navHtml, book.spineIndexByURL, book.spine); // Grab Table of Contents
			}).then(function(toc){
				book.toc = book.contents.toc = toc;
				book.ready.toc.resolve(book.contents.toc);
			}, function(error) {
				book.ready.toc.resolve(false);
			});
	} else if(book.contents.tocPath) {
		book.settings.tocUrl = book.settings.contentsPath + book.contents.tocPath;

		book.loadXml(book.settings.tocUrl).
			then(function(tocXml){
					return parse.toc(tocXml, book.spineIndexByURL, book.spine); // Grab Table of Contents
			}).then(function(toc){
				book.toc = book.contents.toc = toc;
				book.ready.toc.resolve(book.contents.toc);
			}, function(error) {
				book.ready.toc.resolve(false);
			});

	} else {
		book.ready.toc.resolve(false);
	}

};

EPUBJS.Book.prototype.getMetadata = function() {
	return this.ready.metadata.promise;
};

EPUBJS.Book.prototype.getToc = function() {
	return this.ready.toc.promise;
};

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
	
};

//-- Choose between a request from store or a request from network
EPUBJS.Book.prototype.loadXml = function(url){
	if(this.settings.fromStorage) {
		return this.storage.getXml(url);
	} else if(this.settings.contained) {
		return this.zip.getXml(url);
	}else{
		return EPUBJS.core.request(url, 'xml');
	}
};

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

};


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
};

//-- Checks if url has a .epub or .zip extension
EPUBJS.Book.prototype.isContained = function(bookUrl){
	var dot = bookUrl.lastIndexOf('.'),
			ext = bookUrl.slice(dot+1);

	if(ext && (ext == "epub" || ext == "zip")){
		return true;
	}

	return false;
};

//-- Checks if the book can be retrieved from localStorage
EPUBJS.Book.prototype.isSaved = function(bookKey) {
	var storedSettings = localStorage.getItem(bookKey);

	if( !localStorage ||
		storedSettings === null) {
		return false;
	} else {
		return true;
	}
};

EPUBJS.Book.prototype.setBookKey = function(identifier){
	if(!this.settings.bookKey) {
		this.settings.bookKey = this.generateBookKey(identifier);
	}
	return this.settings.bookKey;
};

EPUBJS.Book.prototype.generateBookKey = function(identifier){
	return "epubjs:" + EPUBJS.VERSION + ":" + window.location.host + ":" + identifier;
};

EPUBJS.Book.prototype.saveContents = function(){
	localStorage.setItem(this.settings.bookKey, JSON.stringify(this.contents));
};

EPUBJS.Book.prototype.removeSavedContents = function() {
	localStorage.removeItem(this.settings.bookKey);
};



// EPUBJS.Book.prototype.chapterTitle = function(){
// return this.spine[this.spinePos].id; //-- TODO: clarify that this is returning title
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
				}, function(error) { console.error(error); });

	rendered.then(null, function(error) { console.error(error); });

	return rendered;
};

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
};

EPUBJS.Book.prototype.restore = function(identifier){
	
	var book = this,
			fetch = ['manifest', 'spine', 'metadata', 'cover', 'toc', 'spineNodeIndex', 'spineIndexByURL'],
			reject = false,
			bookKey = this.setBookKey(identifier),
			fromStore = localStorage.getItem(bookKey);
	
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
		return false;
	}else{
		this.ready.manifest.resolve(this.manifest);
		this.ready.spine.resolve(this.spine);
		this.ready.metadata.resolve(this.metadata);
		this.ready.cover.resolve(this.cover);
		this.ready.toc.resolve(this.toc);
		return true;
	}

};



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
		console.warn("Not A Valid Location");
		pos = 0;
		end = false;
		cfi = false;
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
		});
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
};

EPUBJS.Book.prototype.nextPage = function(){
	var next;

	if(!this.isRendered) return this._enqueue("nextPage", arguments);
	
	next = this.render.nextPage();

	if(!next){
		return this.nextChapter();
	}
};

EPUBJS.Book.prototype.prevPage = function() {
	var prev;

	if(!this.isRendered) return this._enqueue("prevPage", arguments);

	prev = this.render.prevPage();
	
	if(!prev){
		return this.prevChapter();
	}
};

EPUBJS.Book.prototype.nextChapter = function() {
	this.spinePos++;
	if(this.spinePos > this.spine.length) return;
	
	return this.displayChapter(this.spinePos);
};

EPUBJS.Book.prototype.prevChapter = function() {
	this.spinePos--;
	if(this.spinePos < 0) return;
	
	return this.displayChapter(this.spinePos, true);
};

EPUBJS.Book.prototype.getCurrentLocationCfi = function() {
	if(!this.isRendered) return false;
	return this.render.currentLocationCfi;
};

EPUBJS.Book.prototype.gotoCfi = function(cfi){
	if(!this.isRendered) return this._enqueue("gotoCfi", arguments);
	return this.displayChapter(cfi);
};

EPUBJS.Book.prototype.goto = function(url){
	var split, chapter, section, absoluteURL, spinePos;
	var deferred = new RSVP.defer();
	if(!this.isRendered) return this._enqueue("goto", arguments);
	
	split = url.split("#");
	chapter = split[0];
	section = split[1] || false;
	// absoluteURL = (chapter.search("://") === -1) ? (this.settings.contentsPath + chapter) : chapter;
	spinePos = this.spineIndexByURL[chapter];

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
};

EPUBJS.Book.prototype.preloadNextChapter = function() {
	var next;

	if(this.spinePos >= this.spine.length){
		return false;
	}
		
	next = new EPUBJS.Chapter(this.spine[this.spinePos + 1]);
	EPUBJS.core.request(next.absolute);
};


EPUBJS.Book.prototype.storeOffline = function() {
	var book = this,
		assets = _.values(this.manifest);
	
	//-- Creates a queue of all items to load
	return EPUBJS.storage.batch(assets).
			then(function(){
				book.settings.stored = true;
				book.trigger("book:stored");
			});
};

EPUBJS.Book.prototype.availableOffline = function() {
	return this.settings.stored > 0 ? true : false;
};

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
};

EPUBJS.Book.prototype.removeStyle = function(style) {
	if(this.render) this.render.removeStyle(style);

	delete this.settings.styles[style];
};

EPUBJS.Book.prototype.unload = function(){
	
	if(this.settings.restore) {
		this.saveContents();
	}

	this.trigger("book:unload");
};

EPUBJS.Book.prototype.destroy = function() {

	window.removeEventListener("beforeunload", this.unload);

	if(this.currentChapter) this.currentChapter.unload();

	this.unload();

	if(this.render) this.render.remove();

};

EPUBJS.Book.prototype._enqueue = function(command, args) {
	
	this._q.push({
		'command': command,
		'args': args
	});

};

EPUBJS.Book.prototype._ready = function() {

	this.trigger("book:ready");

};

EPUBJS.Book.prototype._rendered = function(err) {
	var book = this;

	this.isRendered = true;
	this.trigger("book:rendered");

	this._q.forEach(function(item){
		book[item.command].apply(book, item.args);
	});

};

//-- Get pre-registered hooks
EPUBJS.Book.prototype.getHooks = function(){
	var book = this,
		plugs;
	
	var plugTypes = _.values(this.hooks); //-- unused

	for (var plugType in this.hooks) {
		plugs = _.values(EPUBJS.Hooks[plugType]);

		plugs.forEach(function(hook){
			book.registerHook(plugType, hook);
		});
	}
};

//-- Hooks allow for injecting async functions that must all complete before continuing 
//   Functions must have a callback as their first argument.
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
};

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

EPUBJS.Chapter = function(spineObject){
	this.href = spineObject.href;
	this.absolute = spineObject.url;
	this.id = spineObject.id;
	this.spinePos = spineObject.index;
	this.properties = spineObject.properties;
	this.linear = spineObject.linear;
	this.pages = 1;
};


EPUBJS.Chapter.prototype.contents = function(store){
	// if(this.store && (!this.book.online || this.book.contained))
	if(store){
		return store.get(href);
	}else{
		return EPUBJS.core.request(href, 'xml');
	}

};

EPUBJS.Chapter.prototype.url = function(store){
	var deferred = new RSVP.defer();

	if(store){
		if(!this.tempUrl) {
			this.tempUrl = store.getUrl(this.absolute);
		}
		return this.tempUrl;
	}else{
		deferred.resolve(this.absolute); //-- this is less than ideal but keeps it a promise
		return deferred.promise;
	}

};

EPUBJS.Chapter.prototype.setPages = function(num){
	this.pages = num;
};

EPUBJS.Chapter.prototype.getPages = function(num){
	return this.pages;
};

EPUBJS.Chapter.prototype.getID = function(){
	return this.ID;
};

EPUBJS.Chapter.prototype.unload = function(store){
	
	if(this.tempUrl && store) {
		store.revokeUrl(this.tempUrl);
		this.tempUrl = false;
	}
};

var EPUBJS = EPUBJS || {};
EPUBJS.core = {};

//-- Get a element for an id
EPUBJS.core.getEl = function(elem) {
	return document.getElementById(elem);
};

//-- Get all elements for a class
EPUBJS.core.getEls = function(classes) {
	return document.getElementsByClassName(classes);
};

EPUBJS.core.request = function(url, type) {
	var supportsURL = window.URL;
	var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";

	var deferred = new RSVP.defer();

	var xhr = new XMLHttpRequest();

	//-- Check from PDF.js: 
	//   https://github.com/mozilla/pdf.js/blob/master/web/compatibility.js
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
			} else {
				deferred.reject(this);
			}
		}
	}

	return deferred.promise;
};

EPUBJS.core.toArray = function(obj) {
	var arr = [];

	for (var member in obj) {
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
	var BASE64_MARKER = ';base64,',
		parts, contentType, raw, rawLength, uInt8Array;

	if (dataURL.indexOf(BASE64_MARKER) == -1) {
		parts = dataURL.split(',');
		contentType = parts[0].split(':')[1];
		raw = parts[1];

		return new Blob([raw], {type: contentType});
	}

	parts = dataURL.split(BASE64_MARKER);
	contentType = parts[0].split(':')[1];
	raw = window.atob(parts[1]);
	rawLength = raw.length;

	uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], {type: contentType});
};

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
};

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
};

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
};
EPUBJS.EpubCFI = function(cfiStr){
	if(cfiStr) return this.parse(cfiStr);
};

EPUBJS.EpubCFI.prototype.generateChapter = function(_spineNodeIndex, _pos, id) {
	
	var pos = parseInt(_pos),
		spineNodeIndex = _spineNodeIndex + 1,
		cfi = '/'+spineNodeIndex+'/';

	cfi += (pos + 1) * 2;

	if(id) cfi += "[" + id + "]";

	cfi += "!";

	return cfi;
};


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

EPUBJS.EpubCFI.prototype.getChapter = function(cfiStr) {

	var splitStr = cfiStr.split("!");

	return splitStr[0];
};

EPUBJS.EpubCFI.prototype.getFragment = function(cfiStr) {

	var splitStr = cfiStr.split("!");

	return splitStr[1];
};

EPUBJS.EpubCFI.prototype.getOffset = function(cfiStr) {

	var splitStr = cfiStr.split(":");

	return [splitStr[0], splitStr[1]];
};


EPUBJS.EpubCFI.prototype.parse = function(cfiStr) {
	var cfi = {},
		chapSegment,
		chapId,
		path,
		end,
		text;

	cfi.chapter = this.getChapter(cfiStr);
	
	chapSegment = parseInt(cfi.chapter.split("/")[2]) || false;
	
	cfi.fragment = this.getFragment(cfiStr);

	if(!chapSegment || !cfi.fragment) return {spinePos: -1};
	
	cfi.spinePos = (parseInt(chapSegment) / 2 - 1 ) || 0;

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
};


EPUBJS.EpubCFI.prototype.getElement = function(cfi, _doc) {
	var	doc = _doc || document,
		sections = cfi.sections,
		element = doc.getElementsByTagName('html')[0],
		children = Array.prototype.slice.call(element.children),
		num, index, part,
		has_id, id;

	// sections.shift(); //-- html

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
};

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
};

EPUBJS.Events.prototype.createEvent = function(evt){
	var e = new CustomEvent(evt);
	this.events[evt] = e;
	return e;
};

EPUBJS.Events.prototype.tell = function(evt, msg){
	var e;

	if(!this.events[evt]){
		console.warn("No event:", evt, "defined yet, creating.");
		e = this.createEvent(evt);
	}else{
		e = this.events[evt];
	}

	if(msg) e.msg = msg;
	this.el.dispatchEvent(e);

};

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

};

EPUBJS.Events.prototype.deafen = function(evt, func){
	this.el.removeEventListener(evt, func, false);
};

EPUBJS.Events.prototype.listenUntil = function(OnEvt, OffEvt, func, bindto){
	this.listen(OnEvt, func, bindto);
	
	function unlisten(){
		this.deafen(OnEvt, func);
		this.deafen(OffEvt, unlisten);
	}
	
	this.listen(OffEvt, unlisten, this);
};
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
};

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
};

EPUBJS.Parser.prototype.identifier = function(packageXml){
	var metadataNode = packageXml.querySelector("metadata");
	return this.getElementText(metadataNode, "identifier");
};

EPUBJS.Parser.prototype.packageContents = function(packageXml, baseUrl){
	var parse = this;

	if(baseUrl) this.baseUrl = baseUrl;
	
	var metadataNode = packageXml.querySelector("metadata"),
			manifestNode = packageXml.querySelector("manifest"),
			spineNode = packageXml.querySelector("spine");

	var manifest = parse.manifest(manifestNode),
			navPath = parse.findNavPath(manifestNode),
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
		'navPath'  : navPath,
		'tocPath'  : tocPath,
		'coverPath': coverPath,
		'spineNodeIndex' : spineNodeIndex,
		'spineIndexByURL' : spineIndexByURL
	};
};

//-- Find TOC NAV: media-type="application/xhtml+xml" href="toc.ncx"
EPUBJS.Parser.prototype.findNavPath = function(manifestNode){
  var node = manifestNode.querySelector("item[properties^='nav']");
  return node ? node.getAttribute('href') : false;
};

//-- Find TOC NCX: media-type="application/x-dtbncx+xml" href="toc.ncx"
EPUBJS.Parser.prototype.findTocPath = function(manifestNode){
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
	var baseUrl = this.baseUrl,
			manifest = {};
	
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
			'url' : baseUrl + href, //-- Absolute URL for loading with a web worker
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
	
	//-- Add to array to mantain ordering and cross reference with manifest
	items.forEach(function(item, index){
		var Id = item.getAttribute('idref');
		var vert = {
			'id' : Id,
			'linear' : item.getAttribute('linear') || '',
			'properties' : manifest[Id].properties || '',
			'href' : manifest[Id].href,
			'url' :  manifest[Id].url,
			'index' : index
		};
		
		spine.push(vert);
	});
	
	return spine;
};

EPUBJS.Parser.prototype.nav = function(navHtml, spineIndexByURL, bookSpine){
	var navEl = navHtml.querySelector('nav'), //-- [*|type="toc"] * Doesn't seem to work
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
				subitems = getTOC(item),
				spinePos = spineIndexByURL[baseUrl],
				spineItem;
				
			if(!id) {
				if(spinePos) {
					spineItem = bookSpine[spinePos];				
					id = spineItem.id
				} else {
					id = 'epubjs-autogen-toc-id-' + (idCounter++);
				}
			}
			
			item.setAttribute('id', id); // Ensure all elements have an id
			list.push({
				"id": id,
				"href": href,
				"label": text,
				"subitems" : subitems,
				"parent" : parent ? parent.getAttribute('id') : null
			});
		
		});
	
		return list;
	}
	
	return getTOC(navEl);
};

EPUBJS.Parser.prototype.toc = function(tocXml, spineIndexByURL, bookSpine){
	var navMap = tocXml.querySelector("navMap");
	if(!navMap) return [];
	
	function getTOC(parent){
		var list = [],
				items = [],
				nodes = parent.childNodes,
				nodesArray = Array.prototype.slice.call(nodes),
				length = nodesArray.length,
				iter = length,
				node;
		

		if(length === 0) return false;

		while(iter--){
			node = nodesArray[iter];
			if(node.nodeName === "navPoint") {
				items.push(node);
			}
		}
		
		items.forEach(function(item){
			var id = item.getAttribute('id') || false,
					content = item.querySelector("content"),
					src = content.getAttribute('src'),
					navLabel = item.querySelector("navLabel"),
					text = navLabel.textContent ? navLabel.textContent : "",
					split = src.split("#"),
					baseUrl = split[0],
					spinePos = spineIndexByURL[baseUrl],
					spineItem,
					subitems = getTOC(item);

			if(!id) {
				if(spinePos) {
					spineItem = bookSpine[spinePos];				
					id = spineItem.id
				} else {
					id = 'epubjs-autogen-toc-id-' + (idCounter++);
				}
			}
			
			
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
};
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
};

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
};

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

};

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
	
};

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
	
	
	
};

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
	
	
};

EPUBJS.Renderer.prototype.resizeIframe = function(width, height){

	this.iframe.height = height;

	if(!isNaN(width) && width % 2 !== 0){
		width += 1; //-- Prevent cutting off edges of text in columns
	}

	this.iframe.width = width;
	
	this.onResized();
	
};


EPUBJS.Renderer.prototype.crossBrowserColumnCss = function(){
	
	EPUBJS.Renderer.columnAxis = EPUBJS.core.prefixed('columnAxis');
	EPUBJS.Renderer.columnGap = EPUBJS.core.prefixed('columnGap');
	EPUBJS.Renderer.columnWidth = EPUBJS.core.prefixed('columnWidth');
	EPUBJS.Renderer.transform = EPUBJS.core.prefixed('transform');

};


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
	};

	return deferred.promise;
};


EPUBJS.Renderer.prototype.formatSpread = function(){

	var divisor = 2,
		cutoff = 800;

	//-- Check the width and decied on columns
	//-- Todo: a better place for this?
	this.elWidth = this.iframe.clientWidth;
	if(this.elWidth % 2 !== 0){
		this.elWidth -= 1;
	}
	
	// this.gap = this.gap || Math.ceil(this.elWidth / 8);
	this.gap = Math.ceil(this.elWidth / 8);
	
	if(this.gap % 2 !== 0){
		this.gap += 1;
	}
	
	if(this.elWidth < cutoff || !this.book.settings.spreads) {
		this.spread = false; //-- Single Page

		divisor = 1;
		this.colWidth = Math.floor(this.elWidth / divisor);
	}else{
		this.spread = true; //-- Double Page

		this.colWidth = Math.floor((this.elWidth - this.gap) / divisor);
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
	
};

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
};

EPUBJS.Renderer.prototype.setStyle = function(style, val, prefixed){
	if(prefixed) {
		style = EPUBJS.core.prefixed(style);
	}
	
	if(this.bodyEl) this.bodyEl.style[style] = val;
};

EPUBJS.Renderer.prototype.removeStyle = function(style){
	
	if(this.bodyEl) this.bodyEl.style[style] = '';
		
};

EPUBJS.Renderer.prototype.applyStyles = function() {
	var styles = this.book.settings.styles;

	for (var style in styles) {
		this.setStyle(style, styles[style]);
	}
};

EPUBJS.Renderer.prototype.gotoChapterEnd = function(){
	this.chapterEnd();
};

EPUBJS.Renderer.prototype.visible = function(bool){
	if(typeof(bool) === "undefined") {
		return this.iframe.style.visibility;
	}

	if(bool === true){
		this.iframe.style.visibility = "visible";
	}else if(bool === false){
		this.iframe.style.visibility = "hidden";
	}
};

EPUBJS.Renderer.prototype.calcPages = function() {
	
	this.totalWidth = this.docEl.scrollWidth;
	
	this.displayedPages = Math.ceil(this.totalWidth / this.spreadWidth);

	this.currentChapter.pages = this.displayedPages;
};


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
};

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
};

EPUBJS.Renderer.prototype.chapterEnd = function(){
	this.page(this.displayedPages);
};

EPUBJS.Renderer.prototype.setLeft = function(leftPos){
	// this.bodyEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style[EPUBJS.Renderer.transform] = 'translate('+ (-leftPos) + 'px, 0)';
	this.doc.defaultView.scrollTo(leftPos, 0);
};

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
};

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
	
};

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
				};
			};
	
	
		if(full in _oldUrls){
			replaceUrl(_oldUrls[full]);
			_newUrls[full] = _oldUrls[full];
			delete _oldUrls[full];
		}else{
			func(_store, full, replaceUrl, link);
		}

	}, finished, progress);
};

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
			};
		}

		done();

	}, callback);

};


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
};

//-- Find a section by fragement id
EPUBJS.Renderer.prototype.section = function(fragment){
	var el = this.doc.getElementById(fragment),
		left, pg;

	if(el){
		this.pageByElement(el);
	}

};

//-- Show the page containing an Element
EPUBJS.Renderer.prototype.pageByElement = function(el){
	var left, pg;
	if(!el) return;

	left = this.leftPos + el.getBoundingClientRect().left; //-- Calculate left offset compaired to scrolled position
	pg = Math.floor(left / this.spreadWidth) + 1; //-- pages start at 1
	this.page(pg);

};

EPUBJS.Renderer.prototype.beforeDisplay = function(callback){
	this.book.triggerHooks("beforeChapterDisplay", callback.bind(this), this);
};

EPUBJS.Renderer.prototype.walk = function(node) {
	var r, children, leng,
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
		
		
		if(!r && stack.length === 0 && startNode && startNode.parentNode !== null){

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
};


EPUBJS.Renderer.prototype.getPageCfi = function(){
	var prevEl = this.visibileEl;
	this.visibileEl = this.findFirstVisible(prevEl);
	
	if(!this.visibileEl.id) {
		this.visibileEl.id = "EPUBJS-PAGE-" + this.chapterPos;
	}
	
	this.pageIds[this.chapterPos] = this.visibileEl.id;
	
	
	return this.epubcfi.generateFragment(this.visibileEl, this.currentChapterCfi);

};

EPUBJS.Renderer.prototype.gotoCfiFragment = function(cfi){
	var element;

	if(_.isString(cfi)){
		cfi = this.epubcfi.parse(cfi);
	}
	
	element = this.epubcfi.getElement(cfi, this.doc);

	this.pageByElement(element);
};

EPUBJS.Renderer.prototype.findFirstVisible = function(startEl){
	var el = startEl || this.bodyEl,
		found;
	
	found = this.walk(el);

	if(found) {
		return found;
	}else{
		return startEl;
	}
		
};

EPUBJS.Renderer.prototype.isElementVisible = function(el){
	var rect;
	
	if(el && typeof el.getBoundingClientRect === 'function'){
		rect = el.getBoundingClientRect();

		if( rect.width != 0 && 
				rect.height != 0 &&
				rect.left >= 0 &&
				rect.left < this.spreadWidth ) {
			return true;
		}
	}
	
	return false;
};


EPUBJS.Renderer.prototype.height = function(el){
	return this.docEl.offsetHeight;
};

EPUBJS.Renderer.prototype.remove = function() {
	this.iframe.contentWindow.removeEventListener("resize", this.resized);
	this.el.removeChild(this.iframe);
};



//-- Enable binding events to parser
RSVP.EventTarget.mixin(EPUBJS.Renderer.prototype);
var EPUBJS = EPUBJS || {};
EPUBJS.replace = {};

EPUBJS.replace.head = function(callback, renderer) {

	renderer.replaceWithStored("link[href]", "href", EPUBJS.replace.links, callback);

};


//-- Replaces assets src's to point to stored version if browser is offline
EPUBJS.replace.resources = function(callback, renderer){
	//srcs = this.doc.querySelectorAll('[src]');
	renderer.replaceWithStored("[src]", "src", EPUBJS.replace.srcs, callback);
	
};

EPUBJS.replace.svg = function(callback, renderer) {

	renderer.replaceWithStored("image", "xlink:href", function(_store, full, done){
		_store.getUrl(full).then(done);
	}, callback);

};

EPUBJS.replace.srcs = function(_store, full, done){

	_store.getUrl(full).then(done);
	
};

//-- Replaces links in head, such as stylesheets - link[href]
EPUBJS.replace.links = function(_store, full, done, link){
	
	//-- Handle replacing urls in CSS
	if(link.getAttribute("rel") === "stylesheet") {
		EPUBJS.replace.stylesheets(_store, full).then(done);
	}else{
		_store.getUrl(full).then(done);
	}

};

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

		}, function(e) {
			console.error(e);
		});
		
	});

	return deferred.promise;
};

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
		var replaced = _store.getUrl(full).then(function(url){
				text = text.replace(str, 'url("'+url+'")');
			}, function(e) {
				console.error(e);
			});
		
		promises.push(replaced);
	});
	
	RSVP.all(promises).then(function(){
		deferred.resolve(text);
	});
	
	return deferred.promise;
};

EPUBJS.Unarchiver = function(url){
	
	this.libPath = EPUBJS.filePath;
	this.zipUrl = url;
	this.loadLib();
	this.urlCache = {};
	
	this.zipFs = new zip.fs.FS();
	
	return this.promise;
	
};

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
};

EPUBJS.Unarchiver.prototype.openZip = function(zipUrl, callback){
	var deferred = new RSVP.defer();
	var zipFs = this.zipFs;
	zipFs.importHttpContent(zipUrl, false, function() {
		deferred.resolve(zipFs);
	}, this.failed);
	
	return deferred.promise;
};

EPUBJS.Unarchiver.prototype.getXml = function(url){
	
	return this.getText(url).
			then(function(text){
				var parser = new DOMParser();
				return parser.parseFromString(text, "application/xml");
			});

};

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
};

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
};

EPUBJS.Unarchiver.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = unarchiver.urlCache[url];
	console.log("revoke", fromCache);
	if(fromCache) _URL.revokeObjectURL(fromCache);
};

EPUBJS.Unarchiver.prototype.failed = function(error){
	console.error(error);
};

EPUBJS.Unarchiver.prototype.afterSaved = function(error){
	this.callback();
};

EPUBJS.Unarchiver.prototype.toStorage = function(entries){
	var timeout = 0,
		delay = 20,
		that = this,
		count = entries.length;

	function callback(){
		count--;
		if(count === 0) that.afterSaved();
	}
		
	entries.forEach(function(entry){
		
		setTimeout(function(entry){
			that.saveEntryFileToStorage(entry, callback);
		}, timeout, entry);
		
		timeout += delay;
	});
	
	console.log("time", timeout);
	
	//entries.forEach(this.saveEntryFileToStorage.bind(this));
};

EPUBJS.Unarchiver.prototype.saveEntryFileToStorage = function(entry, callback){
	var that = this;
	entry.getData(new zip.BlobWriter(), function(blob) {
		EPUBJS.storage.save(entry.filename, blob, callback);
	});
};