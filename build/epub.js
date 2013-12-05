/*!
//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.
*/
(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

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
'use strict';

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

};

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

};

EPUBJS.Book.prototype.unpack = function(_containerPath){
	var book = this,
		parse = new EPUBJS.Parser(),
		containerPath = _containerPath || "META-INF/container.xml";

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

				//-- Load the TOC, optional; either the EPUB3 XHTML Navigation file or the EPUB2 NCX file
				if(contents.navPath) {
					book.settings.navUrl = book.settings.contentsPath + contents.navPath;
	
					book.loadXml(book.settings.navUrl).
					then(function(navHtml){
						return parse.nav(navHtml); // Grab Table of Contents
					}).then(function(toc){
						book.toc = book.contents.toc = toc;
						book.ready.toc.resolve(book.contents.toc);
					});

				} else if(contents.tocPath) {
					book.settings.tocUrl = book.settings.contentsPath + contents.tocPath;

					book.loadXml(book.settings.tocUrl).
						then(function(tocXml){
								return parse.toc(tocXml); // Grab Table of Contents
					}).then(function(toc){
						book.toc = book.contents.toc = toc;
						book.ready.toc.resolve(book.contents.toc);
					});

				} else {
					book.ready.toc.resolve(false);
				}

			}).
			fail(function(error) {
				console.error(error);
			});
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
};

//-- Remove save book settings
EPUBJS.Book.prototype.removeSavedSettings = function() {
	var bookKey = this.settings.bookPath + ":" + this.settings.version;
	
		localStorage.removeItem(bookKey);
		
		this.settings.stored = false; //TODO: is this needed?
};
		
EPUBJS.Book.prototype.applySavedSettings = function() {
		var bookKey = this.settings.bookPath + ":" + this.settings.version;
			stored = JSON.parse(localStorage.getItem(bookKey));

		if(EPUBJS.VERSION != stored.EPUBJSVERSION) return false;
		this.settings = _.defaults(this.settings, stored);
};

EPUBJS.Book.prototype.saveSettings = function(){
	var bookKey = this.settings.bookPath + ":" + this.settings.version;
	
	if(this.render) {
		this.settings.previousLocationCfi = this.render.currentLocationCfi;
	}
		
	localStorage.setItem(bookKey, JSON.stringify(this.settings));

};

EPUBJS.Book.prototype.saveContents = function(){
	var contentsKey = this.settings.bookPath + ":contents:" + this.settings.version;

	localStorage.setItem(contentsKey, JSON.stringify(this.contents));

};

EPUBJS.Book.prototype.removeSavedContents = function() {
	var bookKey = this.settings.bookPath + ":contents:" + this.settings.version;
	
	localStorage.removeItem(bookKey);
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

EPUBJS.Book.prototype.restore = function(_reject){
	
	var book = this,
		contentsKey = this.settings.bookPath + ":contents:" + this.settings.version,
		deferred = new RSVP.defer(),
		fetch = ['manifest', 'spine', 'metadata', 'cover', 'toc', 'spineNodeIndex', 'spineIndexByURL'],
		reject = _reject || false,
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
	absoluteURL = (chapter.search("://") === -1) ? (this.settings.contentsPath + chapter) : chapter;
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
};

EPUBJS.Book.prototype.preloadNextChapter = function() {
	var temp = document.createElement('iframe'),
		next;

	if(this.spinePos >= this.spine.length){
		return false;
	}
		
	next = new EPUBJS.Chapter(this.spine[this.spinePos + 1]);
	
	EPUBJS.core.request(next.href);
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
			this.saveSettings();
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
		'arguments': args
	});

};

EPUBJS.Book.prototype._ready = function(err) {
	var book = this;

	this.trigger("book:ready");

};

EPUBJS.Book.prototype._rendered = function(err) {
	var book = this;

	this.isRendered = true;
	this.trigger("book:rendered");

	this._q.forEach(function(item){
		book[item.command].apply(book, item.arguments);
	});

};

//-- Get pre-registered hooks
EPUBJS.Book.prototype.getHooks = function(){
	var book = this,
		plugs;
	
	plugTypes = _.values(this.hooks);

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

EPUBJS.Chapter = function(spineObject){
	this.href = spineObject.href;
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
			this.tempUrl = store.getUrl(this.href);
		}
		return this.tempUrl;
	}else{
		deferred.resolve(this.href); //-- this is less than ideal but keeps it a promise
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
};


EPUBJS.EpubCFI.prototype.getElement = function(cfi, _doc) {
	var	doc = _doc || document,
		sections = cfi.sections,
		element = doc.getElementsByTagName('html')[0],
		children = Array.prototype.slice.call(element.children),
		num, index, part,
		has_id, id;
	
	sections.shift(); //-- html
	
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

EPUBJS.Parser.prototype.package = function(packageXml, baseUrl){
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
			'href' : baseUrl + href, //-- Absolute URL for loading with a web worker
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
			'index' : index
		};
		
		spine.push(vert);
	});
	
	return spine;
};

EPUBJS.Parser.prototype.nav = function(navHtml){
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
			var id = item.getAttribute('id') || 'epubjs-autogen-toc-id-' + (idCounter++),
				content = findAnchorOrSpan(item),
				href = content.getAttribute('href') || '',
				text = content.textContent || "",
				subitems = getTOC(item);
			
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

EPUBJS.Parser.prototype.toc = function(tocXml){
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
	var left;
	
	if(el && typeof el.getBoundingClientRect === 'function'){

		left = el.getBoundingClientRect().left;
		
		if( left >= 0 &&
			left < this.spreadWidth ) {
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
		replaced = _store.getUrl(full).then(function(url){
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