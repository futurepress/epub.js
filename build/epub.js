(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,d=e.filter,g=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,_=Object.keys,j=i.bind,w=function(n){return n instanceof w?n:this instanceof w?(this._wrapped=n,void 0):new w(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=w),exports._=w):n._=w,w.VERSION="1.4.4";var A=w.each=w.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a in n)if(w.has(n,a)&&t.call(e,n[a],a,n)===r)return};w.map=w.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e[e.length]=t.call(r,n,u,i)}),e)};var O="Reduce of empty array with no initial value";w.reduce=w.foldl=w.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=w.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},w.reduceRight=w.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=w.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=w.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},w.find=w.detect=function(n,t,r){var e;return E(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},w.filter=w.select=function(n,t,r){var e=[];return null==n?e:d&&n.filter===d?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&(e[e.length]=n)}),e)},w.reject=function(n,t,r){return w.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},w.every=w.all=function(n,t,e){t||(t=w.identity);var u=!0;return null==n?u:g&&n.every===g?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var E=w.some=w.any=function(n,t,e){t||(t=w.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};w.contains=w.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:E(n,function(n){return n===t})},w.invoke=function(n,t){var r=o.call(arguments,2),e=w.isFunction(t);return w.map(n,function(n){return(e?t:n[t]).apply(n,r)})},w.pluck=function(n,t){return w.map(n,function(n){return n[t]})},w.where=function(n,t,r){return w.isEmpty(t)?r?null:[]:w[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},w.findWhere=function(n,t){return w.where(n,t,!0)},w.max=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.max.apply(Math,n);if(!t&&w.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>=e.computed&&(e={value:n,computed:a})}),e.value},w.min=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.min.apply(Math,n);if(!t&&w.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;e.computed>a&&(e={value:n,computed:a})}),e.value},w.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=w.random(r++),e[r-1]=e[t],e[t]=n}),e};var k=function(n){return w.isFunction(n)?n:function(t){return t[n]}};w.sortBy=function(n,t,r){var e=k(t);return w.pluck(w.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index<t.index?-1:1}),"value")};var F=function(n,t,r,e){var u={},i=k(t||w.identity);return A(n,function(t,a){var o=i.call(r,t,a,n);e(u,o,t)}),u};w.groupBy=function(n,t,r){return F(n,t,r,function(n,t,r){(w.has(n,t)?n[t]:n[t]=[]).push(r)})},w.countBy=function(n,t,r){return F(n,t,r,function(n,t){w.has(n,t)||(n[t]=0),n[t]++})},w.sortedIndex=function(n,t,r,e){r=null==r?w.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;u>r.call(e,n[o])?i=o+1:a=o}return i},w.toArray=function(n){return n?w.isArray(n)?o.call(n):n.length===+n.length?w.map(n,w.identity):w.values(n):[]},w.size=function(n){return null==n?0:n.length===+n.length?n.length:w.keys(n).length},w.first=w.head=w.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},w.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},w.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},w.rest=w.tail=w.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},w.compact=function(n){return w.filter(n,w.identity)};var R=function(n,t,r){return A(n,function(n){w.isArray(n)?t?a.apply(r,n):R(n,t,r):r.push(n)}),r};w.flatten=function(n,t){return R(n,t,[])},w.without=function(n){return w.difference(n,o.call(arguments,1))},w.uniq=w.unique=function(n,t,r,e){w.isFunction(t)&&(e=r,r=t,t=!1);var u=r?w.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:w.contains(a,r))||(a.push(r),i.push(n[e]))}),i},w.union=function(){return w.uniq(c.apply(e,arguments))},w.intersection=function(n){var t=o.call(arguments,1);return w.filter(w.uniq(n),function(n){return w.every(t,function(t){return w.indexOf(t,n)>=0})})},w.difference=function(n){var t=c.apply(e,o.call(arguments,1));return w.filter(n,function(n){return!w.contains(t,n)})},w.zip=function(){for(var n=o.call(arguments),t=w.max(w.pluck(n,"length")),r=Array(t),e=0;t>e;e++)r[e]=w.pluck(n,""+e);return r},w.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},w.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=w.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},w.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},w.range=function(n,t,r){1>=arguments.length&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=Array(e);e>u;)i[u++]=n,n+=r;return i},w.bind=function(n,t){if(n.bind===j&&j)return j.apply(n,o.call(arguments,1));var r=o.call(arguments,2);return function(){return n.apply(t,r.concat(o.call(arguments)))}},w.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},w.bindAll=function(n){var t=o.call(arguments,1);return 0===t.length&&(t=w.functions(n)),A(t,function(t){n[t]=w.bind(n[t],n)}),n},w.memoize=function(n,t){var r={};return t||(t=w.identity),function(){var e=t.apply(this,arguments);return w.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},w.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},w.defer=function(n){return w.delay.apply(w,[n,1].concat(o.call(arguments,1)))},w.throttle=function(n,t){var r,e,u,i,a=0,o=function(){a=new Date,u=null,i=n.apply(r,e)};return function(){var c=new Date,l=t-(c-a);return r=this,e=arguments,0>=l?(clearTimeout(u),u=null,a=c,i=n.apply(r,e)):u||(u=setTimeout(o,l)),i}},w.debounce=function(n,t,r){var e,u;return function(){var i=this,a=arguments,o=function(){e=null,r||(u=n.apply(i,a))},c=r&&!e;return clearTimeout(e),e=setTimeout(o,t),c&&(u=n.apply(i,a)),u}},w.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},w.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},w.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},w.after=function(n,t){return 0>=n?t():function(){return 1>--n?t.apply(this,arguments):void 0}},w.keys=_||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)w.has(n,r)&&(t[t.length]=r);return t},w.values=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push(n[r]);return t},w.pairs=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push([r,n[r]]);return t},w.invert=function(n){var t={};for(var r in n)w.has(n,r)&&(t[n[r]]=r);return t},w.functions=w.methods=function(n){var t=[];for(var r in n)w.isFunction(n[r])&&t.push(r);return t.sort()},w.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},w.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},w.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)w.contains(r,u)||(t[u]=n[u]);return t},w.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)null==n[r]&&(n[r]=t[r])}),n},w.clone=function(n){return w.isObject(n)?w.isArray(n)?n.slice():w.extend({},n):n},w.tap=function(n,t){return t(n),n};var I=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof w&&(n=n._wrapped),t instanceof w&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==t+"";case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;r.push(n),e.push(t);var a=0,o=!0;if("[object Array]"==u){if(a=n.length,o=a==t.length)for(;a--&&(o=I(n[a],t[a],r,e)););}else{var c=n.constructor,f=t.constructor;if(c!==f&&!(w.isFunction(c)&&c instanceof c&&w.isFunction(f)&&f instanceof f))return!1;for(var s in n)if(w.has(n,s)&&(a++,!(o=w.has(t,s)&&I(n[s],t[s],r,e))))break;if(o){for(s in t)if(w.has(t,s)&&!a--)break;o=!a}}return r.pop(),e.pop(),o};w.isEqual=function(n,t){return I(n,t,[],[])},w.isEmpty=function(n){if(null==n)return!0;if(w.isArray(n)||w.isString(n))return 0===n.length;for(var t in n)if(w.has(n,t))return!1;return!0},w.isElement=function(n){return!(!n||1!==n.nodeType)},w.isArray=x||function(n){return"[object Array]"==l.call(n)},w.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){w["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),w.isArguments(arguments)||(w.isArguments=function(n){return!(!n||!w.has(n,"callee"))}),"function"!=typeof/./&&(w.isFunction=function(n){return"function"==typeof n}),w.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},w.isNaN=function(n){return w.isNumber(n)&&n!=+n},w.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},w.isNull=function(n){return null===n},w.isUndefined=function(n){return n===void 0},w.has=function(n,t){return f.call(n,t)},w.noConflict=function(){return n._=t,this},w.identity=function(n){return n},w.times=function(n,t,r){for(var e=Array(n),u=0;n>u;u++)e[u]=t.call(r,u);return e},w.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var M={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};M.unescape=w.invert(M.escape);var S={escape:RegExp("["+w.keys(M.escape).join("")+"]","g"),unescape:RegExp("("+w.keys(M.unescape).join("|")+")","g")};w.each(["escape","unescape"],function(n){w[n]=function(t){return null==t?"":(""+t).replace(S[n],function(t){return M[n][t]})}}),w.result=function(n,t){if(null==n)return null;var r=n[t];return w.isFunction(r)?r.call(n):r},w.mixin=function(n){A(w.functions(n),function(t){var r=w[t]=n[t];w.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),D.call(this,r.apply(w,n))}})};var N=0;w.uniqueId=function(n){var t=++N+"";return n?n+t:t},w.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var T=/(.)^/,q={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},B=/\\|'|\r|\n|\t|\u2028|\u2029/g;w.template=function(n,t,r){var e;r=w.defaults({},r,w.templateSettings);var u=RegExp([(r.escape||T).source,(r.interpolate||T).source,(r.evaluate||T).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(B,function(n){return"\\"+q[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,w);var c=function(n){return e.call(this,n,w)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},w.chain=function(n){return w(n).chain()};var D=function(n){return this._chain?w(n).chain():n};w.mixin(w),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];w.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],D.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];w.prototype[n]=function(){return D.call(this,t.apply(this._wrapped,arguments))}}),w.extend(w.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);
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
define("rsvp/all_settled", 
  ["./promise","./utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];
    var isArray = __dependency2__.isArray;
    var isNonThenable = __dependency2__.isNonThenable;

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

      @method @allSettled
      @for RSVP
      @param {Array} promises;
      @param {String} label - optional string that describes the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled with an array of the settled
      states of the constituent promises.
    */

    __exports__["default"] = function allSettled(entries, label) {
      return new Promise(function(resolve, reject) {
        if (!isArray(entries)) {
          throw new TypeError('You must pass an array to allSettled.');
        }

        var remaining = entries.length;
        var entry;

        if (remaining === 0) {
          resolve([]);
          return;
        }

        var results = new Array(remaining);

        function fulfilledResolver(index) {
          return function(value) {
            resolveAll(index, fulfilled(value));
          };
        }

        function rejectedResolver(index) {
          return function(reason) {
            resolveAll(index, rejected(reason));
          };
        }

        function resolveAll(index, value) {
          results[index] = value;
          if (--remaining === 0) {
            resolve(results);
          }
        }

        for (var index = 0; index < entries.length; index++) {
          entry = entries[index];

          if (isNonThenable(entry)) {
            resolveAll(index, fulfilled(entry));
          } else {
            Promise.cast(entry).then(fulfilledResolver(index), rejectedResolver(index));
          }
        }
      }, label);
    };

    function fulfilled(value) {
      return { state: 'fulfilled', value: value };
    }

    function rejected(reason) {
      return { state: 'rejected', reason: reason };
    }
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
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
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
        @private
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
        @param {String} eventName name of the event to listen for
        @param {Function} callback function to be called when the event is triggered.
        @private
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
        @private

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
        @private
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
      @param {String} label optional string for labeling the promise.
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


    /**

      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promiseâ€™s eventual value or the reason
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
                reject(new Error("getJSON: `" + url + "` failed with status: [" + this.status + "]");
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

      @class Promise
      @param {function}
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @constructor
    */
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
    /**
      @property constructor
    */
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

    /**

      A promise represents the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, "downstream"
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return "default name";
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `"default name"`
      });

      findUser().then(function (user) {
        throw "Found user, but still unhappy";
      }, function (reason) {
        throw "`findUser` rejected and we're unhappy";
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be "Found user, but still unhappy".  
        // If `findUser` rejected, `reason` will be "`findUser` rejected and we're unhappy".
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException("Upstream error");
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
      retrieved asynchronously.  This can be achieved by returning a promise in the
      fulfillment or rejection handler.  The downstream promise will then be pending
      until the returned promise is settled.  This is called *assimilation*.

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

      ```javacsript
      findResult().then(function(result){

      }, function(reason){

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

      ```javacsript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong;
      });
      ```

      @method then
      @param {Function} onFulfillment
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
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

    /**
      `catch` is simply sugar for `then(null, onRejection)` which makes it the same
      as the catch block, of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error("couldn't find that author");
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {

      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong;
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
        // doesn't effect the return value
      }

      findAuthor().finally(function(){
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

      `RSVP.Promise.all` returns a new promise which is fulfilled with an array of
      fulfillment values for the passed promises, or rejects with the reason of the
      first passed promise that rejects. It casts all elements of the passed iterable
      to promises as it runs this algorithm.

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
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
    */
    __exports__["default"] = function all(entries, label) {

      /*jshint validthis:true */
      var Constructor = this;

      return new Constructor(function(resolve, reject) {
        if (!isArray(entries)) {
          throw new TypeError('You must pass an array to all.');
        }

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

      `RSVP.Promise.cast` cast coerces its argument to a promise, or returns the
      argument if it is already a promise which shares a constructor with the caster;

      Example:

      ```javascript
      var promise = RSVP.Promise.resolve(1);
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
      @for RSVP.Promise
      @param {Object} object to be casted
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise
    */

    __exports__["default"] = function cast(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      return new Constructor(function(resolve) {
        resolve(object);
      }, label);
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
      completed promise matters. For example, even if other promises given to the
      `promises` array argument are resolved, but the first completed promise has
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
      @return {Promise} a promise which settles in the same way as the first passed
      promise to settle.
    */
    __exports__["default"] = function race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this, entry;

      return new Constructor(function(resolve, reject) {
        if (!isArray(entries)) {
          throw new TypeError('You must pass an array to race.');
        }

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
      `RSVP.Promise.reject` returns a promise  rejected with the passed `reason`.
      It is essentially shorthand for the following:

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
      @for RSVP.Promise
      @param {Any} reason value that the returned promise will be rejected with.
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise rejected with the given `reason`.
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
      `RSVP.Promise.resolve` returns a promise that will become fulfilled with the passed
      `value`. It is essentially shorthand for the following:

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
  ["./rsvp/promise","./rsvp/events","./rsvp/node","./rsvp/all","./rsvp/all_settled","./rsvp/race","./rsvp/hash","./rsvp/rethrow","./rsvp/defer","./rsvp/config","./rsvp/map","./rsvp/resolve","./rsvp/reject","./rsvp/asap","./rsvp/filter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __dependency11__, __dependency12__, __dependency13__, __dependency14__, __dependency15__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];
    var EventTarget = __dependency2__["default"];
    var denodeify = __dependency3__["default"];
    var all = __dependency4__["default"];
    var allSettled = __dependency5__["default"];
    var race = __dependency6__["default"];
    var hash = __dependency7__["default"];
    var rethrow = __dependency8__["default"];
    var defer = __dependency9__["default"];
    var config = __dependency10__.config;
    var configure = __dependency10__.configure;
    var map = __dependency11__["default"];
    var resolve = __dependency12__["default"];
    var reject = __dependency13__["default"];
    var asap = __dependency14__["default"];
    var filter = __dependency15__["default"];

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
    __exports__.allSettled = allSettled;
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
EPUBJS.VERSION = "0.2.7";

EPUBJS.plugins = EPUBJS.plugins || {};

EPUBJS.filePath = EPUBJS.filePath || "/epubjs/";

EPUBJS.Render = {};

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
		width : null,
		height: null,
		layoutOveride : null, // Default: { spread: 'reflowable', layout: 'auto', orientation: 'auto'}
		orientation : null,
		minSpreadWidth: 800, //-- overridden by spread: none (never) / both (always)
		gap: "auto", //-- "auto" or int
		version: 1,
		restore: false,
		reload : false,
		goto : false,
		styles : {},
		headTags : {},
		withCredentials: false,
		render_method: "Iframe"
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
		book:loadFailed
		book:loadChapterFailed
	*/

	//-- Adds Hook methods to the Book prototype
	//   Hooks will all return before triggering the callback.
	// EPUBJS.Hooks.mixin(this);
	//-- Get pre-registered hooks for events
	// this.getHooks("beforeChapterDisplay");

	this.online = this.settings.online || navigator.onLine;
	this.networkListeners();

	this.ready = {
		manifest: new RSVP.defer(),
		spine: new RSVP.defer(),
		metadata: new RSVP.defer(),
		cover: new RSVP.defer(),
		toc: new RSVP.defer(),
		pageList: new RSVP.defer()
	};

	this.readyPromises = [
		this.ready.manifest.promise,
		this.ready.spine.promise,
		this.ready.metadata.promise,
		this.ready.cover.promise,
		this.ready.toc.promise
	];

	this.pageList = [];
	this.pagination = new EPUBJS.Pagination();
	this.pageListReady = this.ready.pageList.promise;

	this.ready.all = RSVP.all(this.readyPromises);

	this.ready.all.then(this._ready.bind(this));

	// Queue for methods used before rendering
	this.isRendered = false;
	this._q = EPUBJS.core.queue(this);
	// Queue for rendering
	this._rendering = false;
	this._displayQ = EPUBJS.core.queue(this);
	// Queue for going to another location
	this._moving = false;
	this._gotoQ = EPUBJS.core.queue(this);

	/**
	* Creates a new renderer.
	* The renderer will handle displaying the content using the method provided in the settings
	*/
	this.renderer = new EPUBJS.Renderer(this.settings.render_method);
	//-- Set the width at which to switch from spreads to single pages
	this.renderer.setMinSpreadWidth(this.settings.minSpreadWidth);
	this.renderer.setGap(this.settings.gap);
	//-- Pass through the renderer events
	this.listenToRenderer(this.renderer);

	this.defer_opened = new RSVP.defer();
	this.opened = this.defer_opened.promise;

	this.store = false; //-- False if not using storage;

	//-- Determine storage method
	//-- Override options: none | ram | websqldatabase | indexeddb | filesystem
	if(this.settings.storage !== false){
		// this.storage = new fileStorage.storage(this.settings.storage);
		this.fromStorage(true);
	}

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

		epubpackage = this.unarchive(bookPath).
			then(function(){
				return book.loadPackage();
			});

	}	else {
		epubpackage = this.loadPackage();
	}

	if(this.settings.restore && !forceReload && localStorage){
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

	this._registerReplacements(this.renderer);

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
				book.settings.encoding = paths.encoding;
				return book.loadXml(book.settings.packageUrl); // Containes manifest, spine and metadata
			});
	} else {
		packageXml = book.loadXml(book.settings.packageUrl);
	}

	packageXml.catch(function(error) {
		// handle errors in either of the two requests
		console.error("Could not load book at: "+ containerPath);
		book.trigger("book:loadFailed", containerPath);
	});
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
	if(!book.settings.bookKey) {
		book.settings.bookKey = book.generateBookKey(book.metadata.identifier);
	}

	//-- Set Globbal Layout setting based on metadata
	book.globalLayoutProperties = book.parseLayoutProperties(book.metadata);

	if(book.contents.coverPath) {
		book.cover = book.contents.cover = book.settings.contentsPath + book.contents.coverPath;
	}

	book.spineNodeIndex = book.contents.spineNodeIndex;

	book.ready.manifest.resolve(book.contents.manifest);
	book.ready.spine.resolve(book.contents.spine);
	book.ready.metadata.resolve(book.contents.metadata);
	book.ready.cover.resolve(book.contents.cover);

	book.locations = new EPUBJS.Locations(book.spine);

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

		// Load the optional pageList
		book.loadXml(book.settings.navUrl).
			then(function(navHtml){
				return parse.pageList(navHtml, book.spineIndexByURL, book.spine);
			}).then(function(pageList){
				var epubcfi = new EPUBJS.EpubCFI();
				var wait = 0; // need to generate a cfi

				// No pageList found
				if(pageList.length === 0) {
					return;
				}

				book.pageList = book.contents.pageList = pageList;

				// Replace HREFs with CFI
				book.pageList.forEach(function(pg){
					if(!pg.cfi) {
						wait += 1;
						epubcfi.generateCfiFromHref(pg.href, book).then(function(cfi){
							pg.cfi = cfi;
							pg.packageUrl = book.settings.packageUrl;

							wait -= 1;
							if(wait === 0) {
								book.pagination.process(book.pageList);
								book.ready.pageList.resolve(book.pageList);
							}
						});
					}
				});

				if(!wait) {
					book.pagination.process(book.pageList);
					book.ready.pageList.resolve(book.pageList);
				}

			}, function(error) {
				book.ready.pageList.resolve([]);
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

EPUBJS.Book.prototype.createHiddenRender = function(renderer, _width, _height) {
	var box = this.element.getBoundingClientRect();
	var width = _width || this.settings.width || box.width;
	var height = _height || this.settings.height || box.height;
	var hiddenContainer;
	var hiddenEl;
	renderer.setMinSpreadWidth(this.settings.minSpreadWidth);
	renderer.setGap(this.settings.gap);

  this._registerReplacements(renderer);
	if(this.settings.forceSingle) {
		renderer.forceSingle(true);
	}

	hiddenContainer = document.createElement("div");
	hiddenContainer.style.visibility = "hidden";
	hiddenContainer.style.overflow = "hidden";
	hiddenContainer.style.width = "0";
	hiddenContainer.style.height = "0";
	this.element.appendChild(hiddenContainer);

	hiddenEl = document.createElement("div");
	hiddenEl.style.visibility = "hidden";
	hiddenEl.style.overflow = "hidden";
	hiddenEl.style.width = width + "px";//"0";
	hiddenEl.style.height = height +"px"; //"0";
	hiddenContainer.appendChild(hiddenEl);

	renderer.initialize(hiddenEl);
	return hiddenContainer;
};

// Generates the pageList array by loading every chapter and paging through them
EPUBJS.Book.prototype.generatePageList = function(width, height){
	var pageList = [];
	var pager = new EPUBJS.Renderer(this.settings.render_method, false); //hidden
	var hiddenContainer = this.createHiddenRender(pager, width, height);
	var deferred = new RSVP.defer();
	var spinePos = -1;
	var spineLength = this.spine.length;
	var totalPages = 0;
	var currentPage = 0;
	var nextChapter = function(deferred){
		var chapter;
		var next = spinePos + 1;
		var done = deferred || new RSVP.defer();
		var loaded;
		if(next >= spineLength) {
			done.resolve();
		} else {
			spinePos = next;
			chapter = new EPUBJS.Chapter(this.spine[spinePos], this.store);
			pager.displayChapter(chapter, this.globalLayoutProperties).then(function(chap){
				pager.pageMap.forEach(function(item){
					currentPage += 1;
					pageList.push({
						"cfi" : item.start,
						"page" : currentPage
					});

				});

				if(pager.pageMap.length % 2 > 0 &&
					 pager.spreads) {
					currentPage += 1; // Handle Spreads
					pageList.push({
						"cfi" : pager.pageMap[pager.pageMap.length - 1].end,
						"page" : currentPage
					});
				}

				// Load up the next chapter
				setTimeout(function(){
					nextChapter(done);
				}, 1);
			});
		}
		return done.promise;
	}.bind(this);

	var finished = nextChapter().then(function(){
		pager.remove();
		this.element.removeChild(hiddenContainer);
		deferred.resolve(pageList);
	}.bind(this));

	return deferred.promise;
};

// Render out entire book and generate the pagination
// Width and Height are optional and will default to the current dimensions
EPUBJS.Book.prototype.generatePagination = function(width, height) {
	var book = this;
	var defered = new RSVP.defer();

	this.ready.spine.promise.then(function(){
		book.generatePageList(width, height).then(function(pageList){
			book.pageList = book.contents.pageList = pageList;
			book.pagination.process(pageList);
			book.ready.pageList.resolve(book.pageList);
			defered.resolve(book.pageList);
		});
	});

	return defered.promise;
};

// Process the pagination from a JSON array containing the pagelist
EPUBJS.Book.prototype.loadPagination = function(pagelistJSON) {
	var pageList = JSON.parse(pagelistJSON);

	if(pageList && pageList.length) {
		this.pageList = pageList;
		this.pagination.process(this.pageList);
		this.ready.pageList.resolve(this.pageList);
	}
	return this.pageList;
};

EPUBJS.Book.prototype.getPageList = function() {
	return this.ready.pageList.promise;
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
		if (book.settings.storage) {
			book.fromStorage(true);
		}
		book.trigger("book:offline");
	}, false);

	window.addEventListener("online", function(e) {
		book.online = true;
		if (book.settings.storage) {
			book.fromStorage(false);
		}
		book.trigger("book:online");
	}, false);

};

// Listen to all events the renderer triggers and pass them as book events
EPUBJS.Book.prototype.listenToRenderer = function(renderer){
	var book = this;
	renderer.Events.forEach(function(eventName){
		renderer.on(eventName, function(e){
			book.trigger(eventName, e);
		});
	});

	renderer.on("renderer:visibleRangeChanged", function(range) {
		var startPage, endPage, percent;
		var pageRange = [];

		if(this.pageList.length > 0) {
			startPage = this.pagination.pageFromCfi(range.start);
			percent = this.pagination.percentageFromPage(startPage);
			pageRange.push(startPage);

			if(range.end) {
				endPage = this.pagination.pageFromCfi(range.end);
				//if(startPage != endPage) {
					pageRange.push(endPage);
				//}
			}
			this.trigger("book:pageChanged", {
				"anchorPage": startPage,
				"percentage": percent,
				"pageRange" : pageRange
			});

			// TODO: Add event for first and last page.
			// (though last is going to be hard, since it could be several reflowed pages long)
		}
	}.bind(this));

	renderer.on("render:loaded", this.loadChange.bind(this));
};

// Listens for load events from the Renderer and checks against the current chapter
// Prevents the Render from loading a different chapter when back button is pressed
EPUBJS.Book.prototype.loadChange = function(url){
	var uri = EPUBJS.core.uri(url);
	var chapterUri = EPUBJS.core.uri(this.currentChapter.absolute);
	var spinePos, chapter;

	if(uri.path != chapterUri.path){
		console.warn("Miss Match", uri.path, this.currentChapter.absolute);
		// this.goto(uri.filename);

		// Set the current chapter to what is being displayed
		spinePos = this.spineIndexByURL[uri.filename];
		chapter = new EPUBJS.Chapter(this.spine[spinePos], this.store);
		this.currentChapter = chapter;

		// setup the renderer with the displayed chapter
		this.renderer.currentChapter = chapter;
		this.renderer.afterLoad(this.renderer.render.docEl);
		this.renderer.afterDisplay();

	} else if(!this._rendering) {
		this.renderer.reformat();
	}
};

EPUBJS.Book.prototype.unlistenToRenderer = function(renderer){
	renderer.Events.forEach(function(eventName){
		renderer.off(eventName);
	}	);
};

//-- Choose between a request from store or a request from network
EPUBJS.Book.prototype.loadXml = function(url){
	if(this.settings.fromStorage) {
		return this.store.getXml(url, this.settings.encoding);
	} else if(this.settings.contained) {
		return this.zip.getXml(url, this.settings.encoding);
	}else{
		return EPUBJS.core.request(url, 'xml', this.settings.withCredentials);
	}
};

//-- Turns a url into a absolute url
EPUBJS.Book.prototype.urlFrom = function(bookPath){
	var uri = EPUBJS.core.uri(bookPath),
		absolute = uri.protocol,
		fromRoot = uri.path[0] == "/",
		location = window.location,
		//-- Get URL orgin, try for native or combine
		origin = location.origin || location.protocol + "//" + location.host,
		baseTag = document.getElementsByTagName('base'),
		base;


	//-- Check is Base tag is set

	if(baseTag.length) {
		base = baseTag[0].href;
	}

	//-- 1. Check if url is absolute
	if(uri.protocol){
		return uri.origin + uri.path;
	}

	//-- 2. Check if url starts with /, add base url
	if(!absolute && fromRoot){
		return (base || origin) + uri.path;
	}

	//-- 3. Or find full path to url and add that
	if(!absolute && !fromRoot){
		return EPUBJS.core.resolveUrl(base || location.pathname, uri.path);
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
	this.store = this.zip; // Use zip storaged in ram
	return this.zip.open(bookPath);
};

//-- Checks if url has a .epub or .zip extension
EPUBJS.Book.prototype.isContained = function(bookUrl){
	var uri = EPUBJS.core.uri(bookUrl);

	if(uri.extension && (uri.extension == "epub" || uri.extension == "zip")){
		return true;
	}

	return false;
};

//-- Checks if the book can be retrieved from localStorage
EPUBJS.Book.prototype.isSaved = function(bookKey) {
	var storedSettings;

	if(!localStorage) {
		return false;
	}

	storedSettings = localStorage.getItem(bookKey);

	if( !localStorage ||
		storedSettings === null) {
		return false;
	} else {
		return true;
	}
};

// Generates the Book Key using the identifer in the manifest or other string provided
EPUBJS.Book.prototype.generateBookKey = function(identifier){
	return "epubjs:" + EPUBJS.VERSION + ":" + window.location.host + ":" + identifier;
};

EPUBJS.Book.prototype.saveContents = function(){
	if(!localStorage) {
		return false;
	}
	localStorage.setItem(this.settings.bookKey, JSON.stringify(this.contents));
};

EPUBJS.Book.prototype.removeSavedContents = function() {
	if(!localStorage) {
		return false;
	}
	localStorage.removeItem(this.settings.bookKey);
};



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
					// book.render = new EPUBJS.Renderer[this.settings.renderer](book);
					book.renderer.initialize(book.element, book.settings.width, book.settings.height);

					if(book.metadata.direction) {
						book.renderer.setDirection(book.metadata.direction);
					}

					book._rendered();
					return book.startDisplay();
				});

	// rendered.then(null, function(error) { console.error(error); });

	return rendered;
};

EPUBJS.Book.prototype.startDisplay = function(){
	var display;

	if(this.settings.goto) {
		display = this.goto(this.settings.goto);
	}else if(this.settings.previousLocationCfi) {
		display = this.gotoCfi(this.settings.previousLocationCfi);
	}else{
		display = this.displayChapter(this.spinePos);
	}

	return display;
};

EPUBJS.Book.prototype.restore = function(identifier){

	var book = this,
			fetch = ['manifest', 'spine', 'metadata', 'cover', 'toc', 'spineNodeIndex', 'spineIndexByURL', 'globalLayoutProperties'],
			reject = false,
			bookKey = this.generateBookKey(identifier),
			fromStore = localStorage.getItem(bookKey),
			len = fetch.length,
			i;

	if(this.settings.clearSaved) reject = true;

	if(!reject && fromStore != 'undefined' && fromStore !== null){
		book.contents = JSON.parse(fromStore);

		for(i = 0; i < len; i++) {
			var item = fetch[i];

			if(!book.contents[item]) {
				reject = true;
				break;
			}
			book[item] = book.contents[item];
		}
	}

	if(reject || !fromStore || !this.contents || !this.settings.contentsPath){
		return false;
	}else{
		this.settings.bookKey = bookKey;
		this.ready.manifest.resolve(this.manifest);
		this.ready.spine.resolve(this.spine);
		this.ready.metadata.resolve(this.metadata);
		this.ready.cover.resolve(this.cover);
		this.ready.toc.resolve(this.toc);
		return true;
	}

};

EPUBJS.Book.prototype.displayChapter = function(chap, end, deferred){
	var book = this,
		render,
		cfi,
		pos,
		store,
		defer = deferred || new RSVP.defer();

	var chapter;

	if(!this.isRendered) {
		this._q.enqueue("displayChapter", arguments);
		// Reject for now. TODO: pass promise to queue
		defer.reject({
				message : "Rendering",
				stack : new Error().stack
			});
		return defer.promise;
	}


	if(this._rendering || this._rendering) {
		// Pass along the current defer
		this._displayQ.enqueue("displayChapter", [chap, end, defer]);
		return defer.promise;
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

	//-- Create a new chapter
	chapter = new EPUBJS.Chapter(this.spine[pos], this.store);

	this._rendering = true;

	if(this._needsAssetReplacement()) {

		chapter.registerHook("beforeChapterRender", [
			EPUBJS.replace.head,
			EPUBJS.replace.resources,
			EPUBJS.replace.svg
		], true);

	}

	book.currentChapter = chapter;

	render = book.renderer.displayChapter(chapter, this.globalLayoutProperties);
	if(cfi) {
		book.renderer.gotoCfi(cfi);
	} else if(end) {
		book.renderer.lastPage();
	}
	//-- Success, Clear render queue
	render.then(function(rendered){
		// var inwait;
		//-- Set the book's spine position
		book.spinePos = pos;

		defer.resolve(book.renderer);

		if(book.settings.fromStorage === false &&
			book.settings.contained === false) {
			book.preloadNextChapter();
		}

		book._rendering = false;
		book._displayQ.dequeue();
		if(book._displayQ.length() === 0) {
			book._gotoQ.dequeue();
		}

	}, function(error) {
		// handle errors in either of the two requests
		console.error("Could not load Chapter: "+ chapter.absolute, error);
		book.trigger("book:chapterLoadFailed", chapter.absolute);
		book._rendering = false;
		defer.reject(error);
	});

	return defer.promise;
};

EPUBJS.Book.prototype.nextPage = function(){
	var next;

	if(!this.isRendered) return this._q.enqueue("nextPage", arguments);

	next = this.renderer.nextPage();

	if(!next){
		return this.nextChapter();
	}
};

EPUBJS.Book.prototype.prevPage = function() {
	var prev;

	if(!this.isRendered) return this._q.enqueue("prevPage", arguments);

	prev = this.renderer.prevPage();

	if(!prev){
		return this.prevChapter();
	}
};

EPUBJS.Book.prototype.nextChapter = function() {
	var next;
	if (this.spinePos < this.spine.length - 1) {
		next = this.spinePos + 1;
		// Skip non linear chapters
		while (this.spine[next] && this.spine[next].linear && this.spine[next].linear == 'no') {
			next++;
		}
		if (next < this.spine.length) {
			return this.displayChapter(next);
		} else {
			this.trigger("book:atEnd");
		}

	} else {
		this.trigger("book:atEnd");
	}
};

EPUBJS.Book.prototype.prevChapter = function() {
	var prev;
	if (this.spinePos > 0) {
		prev = this.spinePos - 1;
		while (this.spine[prev] && this.spine[prev].linear && this.spine[prev].linear == 'no') {
			prev--;
		}
		if (prev >= 0) {
			return this.displayChapter(prev, true);
		} else {
			this.trigger("book:atStart");
		}

	} else {
		this.trigger("book:atStart");
	}
};

EPUBJS.Book.prototype.getCurrentLocationCfi = function() {
	if(!this.isRendered) return false;
	return this.renderer.currentLocationCfi;
};

EPUBJS.Book.prototype.goto = function(target){

	if(target.indexOf("epubcfi(") === 0) {
		return this.gotoCfi(target);
	} else if(target.indexOf("%") === target.length-1) {
		return this.gotoPercentage(parseInt(target.substring(0, target.length-1))/100);
	} else if(typeof target === "number" || isNaN(target) === false){
		return this.gotoPage(target);
	} else {
		return this.gotoHref(target);
	}

};

EPUBJS.Book.prototype.gotoCfi = function(cfiString, defer){
	var cfi,
			spinePos,
			spineItem,
			rendered,
			deferred = defer || new RSVP.defer();

	if(!this.isRendered) {
		console.warn("Not yet Rendered");
		this.settings.previousLocationCfi = cfiString;
		return false;
	}

	// Currently going to a chapter
	if(this._moving || this._rendering) {
		console.warn("Renderer is moving");
		this._gotoQ.enqueue("gotoCfi", [cfiString, deferred]);
		return false;
	}

	cfi = new EPUBJS.EpubCFI(cfiString);
	spinePos = cfi.spinePos;

	if(spinePos == -1) {
		return false;
	}

	spineItem = this.spine[spinePos];
	promise = deferred.promise;
	this._moving = true;
	//-- If same chapter only stay on current chapter
	if(this.currentChapter && this.spinePos === spinePos){
		this.renderer.gotoCfi(cfi);
		this._moving = false;
		deferred.resolve(this.renderer.currentLocationCfi);
	} else {

		if(!spineItem || spinePos == -1) {
			spinePos = 0;
			spineItem = this.spine[spinePos];
		}

		this.currentChapter = new EPUBJS.Chapter(spineItem, this.store);

		if(this.currentChapter) {
			this.spinePos = spinePos;
			render = this.renderer.displayChapter(this.currentChapter, this.globalLayoutProperties);

			this.renderer.gotoCfi(cfi);
			render.then(function(rendered){
					this._moving = false;
					deferred.resolve(rendered.currentLocationCfi);
			}.bind(this));
		}
	}

	promise.then(function(){
		this._gotoQ.dequeue();
	}.bind(this));

	return promise;
};

EPUBJS.Book.prototype.gotoHref = function(url, defer){
	var split, chapter, section, relativeURL, spinePos;
	var deferred = defer || new RSVP.defer();

	if(!this.isRendered) {
		this.settings.goto = url;
		return false;
	}

	// Currently going to a chapter
	if(this._moving || this._rendering) {
		this._gotoQ.enqueue("gotoHref", [url, deferred]);
		return false;
	}

	split = url.split("#");
	chapter = split[0];
	section = split[1] || false;
	// absoluteURL = (chapter.search("://") === -1) ? (this.settings.contentsPath + chapter) : chapter;
	relativeURL = chapter.replace(this.settings.contentsPath, '');
	spinePos = this.spineIndexByURL[relativeURL];

	//-- If link fragment only stay on current chapter
	if(!chapter){
		spinePos = this.currentChapter ? this.currentChapter.spinePos : 0;
	}

	//-- Check that URL is present in the index, or stop
	if(typeof(spinePos) != "number") return false;

	if(!this.currentChapter || spinePos != this.currentChapter.spinePos){
		//-- Load new chapter if different than current
		return this.displayChapter(spinePos).then(function(){
				if(section){
					this.renderer.section(section);
				}
				deferred.resolve(this.renderer.currentLocationCfi);
			}.bind(this));
	}else{
		//--  Goto section
		if(section) {
			this.renderer.section(section);
		} else {
			// Or jump to the start
			this.renderer.firstPage();
		}
		deferred.resolve(this.renderer.currentLocationCfi);
	}

	deferred.promise.then(function(){
		this._gotoQ.dequeue();
	}.bind(this));

	return deferred.promise;
};

EPUBJS.Book.prototype.gotoPage = function(pg){
	var cfi = this.pagination.cfiFromPage(pg);
	return this.gotoCfi(cfi);
};

EPUBJS.Book.prototype.gotoPercentage = function(percent){
	var pg = this.pagination.pageFromPercentage(percent);
	return this.gotoPage(pg);
};

EPUBJS.Book.prototype.preloadNextChapter = function() {
	var next;
	var chap = this.spinePos + 1;

	if(chap >= this.spine.length){
		return false;
	}

	next = new EPUBJS.Chapter(this.spine[chap]);
	if(next) {
		EPUBJS.core.request(next.absolute);
	}
};

EPUBJS.Book.prototype.storeOffline = function() {
	var book = this,
		assets = _.values(this.manifest);

	//-- Creates a queue of all items to load
	return this.store.put(assets).
			then(function(){
				book.settings.stored = true;
				book.trigger("book:stored");
			});
};

EPUBJS.Book.prototype.availableOffline = function() {
	return this.settings.stored > 0 ? true : false;
};

EPUBJS.Book.prototype.toStorage = function () {
	var key = this.settings.bookKey;
	this.store.isStored(key).then(function(stored) {

		if (stored === true) {
			this.settings.stored = true;
			return true;
		}

		return this.storeOffline()
			.then(function() {
				this.store.token(key, true);
			}.bind(this));

	}.bind(this));

};
EPUBJS.Book.prototype.fromStorage = function(stored) {
	var hooks = [
		EPUBJS.replace.head,
		EPUBJS.replace.resources,
		EPUBJS.replace.svg
	];

	if(this.contained || this.settings.contained) return;

	//-- If there is network connection, store the books contents
	if(this.online){
		this.opened.then(this.toStorage.bind(this));
	}

	if(this.store && this.settings.fromStorage && stored === false){
		this.settings.fromStorage = false;
		this.store.off("offline");
		// this.renderer.removeHook("beforeChapterRender", hooks, true);
		this.store = false;
	}else if(!this.settings.fromStorage){

		this.store = new EPUBJS.Storage(this.settings.credentials);
		this.store.on("offline", function (offline) {
			if (!offline) {
				// Online
				this.offline = false;
				this.settings.fromStorage = false;
				// this.renderer.removeHook("beforeChapterRender", hooks, true);
				this.trigger("book:online");
			} else {
				// Offline
				this.offline = true;
				this.settings.fromStorage = true;
				// this.renderer.registerHook("beforeChapterRender", hooks, true);
				this.trigger("book:offline");
			}
		}.bind(this));

	}

};

EPUBJS.Book.prototype.setStyle = function(style, val, prefixed) {
	var noreflow = ["color", "background", "background-color"];

	if(!this.isRendered) return this._q.enqueue("setStyle", arguments);

	this.settings.styles[style] = val;

	this.renderer.setStyle(style, val, prefixed);

	if(noreflow.indexOf(style) === -1) {
		// clearTimeout(this.reformatTimeout);
		// this.reformatTimeout = setTimeout(function(){
		this.renderer.reformat();
		// }.bind(this), 10);
	}
};

EPUBJS.Book.prototype.removeStyle = function(style) {
	if(!this.isRendered) return this._q.enqueue("removeStyle", arguments);
	this.renderer.removeStyle(style);
	this.renderer.reformat();
	delete this.settings.styles[style];
};

EPUBJS.Book.prototype.addHeadTag = function(tag, attrs) {
	if(!this.isRendered) return this._q.enqueue("addHeadTag", arguments);
    this.settings.headTags[tag] = attrs;
};

EPUBJS.Book.prototype.useSpreads = function(use) {
	console.warn("useSpreads is deprecated, use forceSingle or set a layoutOveride instead");
	if(use === false) {
		this.forceSingle(true);
	} else {
		this.forceSingle(false);
	}
};

EPUBJS.Book.prototype.forceSingle = function(_use) {
	var force = typeof _use === "undefined" ? true : _use;

	this.renderer.forceSingle(force);
	this.settings.forceSingle = force;
	if(this.isRendered) {
		this.renderer.reformat();
	}
};

EPUBJS.Book.prototype.setMinSpreadWidth = function(width) {
	this.settings.minSpreadWidth = width;
	if(this.isRendered) {
		this.renderer.setMinSpreadWidth(this.settings.minSpreadWidth);
		this.renderer.reformat();
	}
};

EPUBJS.Book.prototype.setGap = function(gap) {
	this.settings.gap = gap;
	if(this.isRendered) {
		this.renderer.setGap(this.settings.gap);
		this.renderer.reformat();
	}
};

EPUBJS.Book.prototype.chapter = function(path) {
	var spinePos = this.spineIndexByURL[path];
	var spineItem;
	var chapter;

	if(spinePos){
		spineItem = this.spine[spinePos];
		chapter = new EPUBJS.Chapter(spineItem, this.store);
		chapter.load();
	}
	return chapter;
};

EPUBJS.Book.prototype.unload = function(){

	if(this.settings.restore && localStorage) {
		this.saveContents();
	}

	this.unlistenToRenderer(this.renderer);

	this.trigger("book:unload");
};

EPUBJS.Book.prototype.destroy = function() {

	window.removeEventListener("beforeunload", this.unload);

	if(this.currentChapter) this.currentChapter.unload();

	this.unload();

	if(this.renderer) this.renderer.remove();

};

EPUBJS.Book.prototype._ready = function() {

	this.trigger("book:ready");

};

EPUBJS.Book.prototype._rendered = function(err) {
	var book = this;

	this.isRendered = true;
	this.trigger("book:rendered");

	this._q.flush();
};


EPUBJS.Book.prototype.applyStyles = function(renderer, callback){
	// if(!this.isRendered) return this._q.enqueue("applyStyles", arguments);
	renderer.applyStyles(this.settings.styles);
	callback();
};

EPUBJS.Book.prototype.applyHeadTags = function(renderer, callback){
	// if(!this.isRendered) return this._q.enqueue("applyHeadTags", arguments);
	renderer.applyHeadTags(this.settings.headTags);
	callback();
};

EPUBJS.Book.prototype._registerReplacements = function(renderer){
	renderer.registerHook("beforeChapterDisplay", this.applyStyles.bind(this, renderer), true);
	renderer.registerHook("beforeChapterDisplay", this.applyHeadTags.bind(this, renderer), true);
	renderer.registerHook("beforeChapterDisplay", EPUBJS.replace.hrefs.bind(this), true);
};

EPUBJS.Book.prototype._needsAssetReplacement = function(){
	if(this.settings.fromStorage) {

		//-- Filesystem api links are relative, so no need to replace them
		// if(this.storage.getStorageType() == "filesystem") {
		// 	return false;
		// }

		return true;

	} else if(this.settings.contained) {

		return true;

	} else {

		return false;

	}
};


//-- http://www.idpf.org/epub/fxl/
EPUBJS.Book.prototype.parseLayoutProperties = function(metadata){
	var layout = (this.layoutOveride && this.layoutOveride.layout) || metadata.layout || "reflowable";
	var spread = (this.layoutOveride && this.layoutOveride.spread) || metadata.spread || "auto";
	var orientation = (this.layoutOveride && this.layoutOveride.orientation) || metadata.orientation || "auto";
	return {
		layout : layout,
		spread : spread,
		orientation : orientation
	};
};

//-- Enable binding events to book
RSVP.EventTarget.mixin(EPUBJS.Book.prototype);

//-- Handle RSVP Errors
RSVP.on('error', function(event) {
	//console.error(event, event.detail);
});

RSVP.configure('instrument', false); //-- true | will logging out all RSVP rejections
// RSVP.on('created', listener);
// RSVP.on('chained', listener);
// RSVP.on('fulfilled', listener);
// RSVP.on('rejected', function(event){
// 	console.error(event.detail.message, event.detail.stack);
// });

EPUBJS.Chapter = function(spineObject, store){
	this.href = spineObject.href;
	this.absolute = spineObject.url;
	this.id = spineObject.id;
	this.spinePos = spineObject.index;
	this.cfiBase = spineObject.cfiBase;
	this.properties = spineObject.properties;
	this.manifestProperties = spineObject.manifestProperties;
	this.linear = spineObject.linear;
	this.pages = 1;
	this.store = store;
	this.epubcfi = new EPUBJS.EpubCFI();
	this.deferred = new RSVP.defer();
	this.loaded = this.deferred.promise;

	EPUBJS.Hooks.mixin(this);
	//-- Get pre-registered hooks for events
	this.getHooks("beforeChapterRender");

	// Cached for replacement urls from storage
	this.caches = {};
};


EPUBJS.Chapter.prototype.load = function(_store){
	var store = _store || this.store;
	var promise;
	// if(this.store && (!this.book.online || this.book.contained))
	if(store){
		promise = store.getXml(this.absolute);
	}else{
		promise = EPUBJS.core.request(this.absolute, 'xml');
	}

	promise.then(function(xml){
		this.setDocument(xml);
		this.deferred.resolve(this);
	}.bind(this));

	return promise;
};

EPUBJS.Chapter.prototype.render = function(_store){

	return this.load().then(function(doc){

		var head = doc.querySelector('head');
		var base = doc.createElement("base");

		base.setAttribute("href", this.absolute);
		head.insertBefore(base, head.firstChild);

		this.contents = doc;

		return new RSVP.Promise(function (resolve, reject) {
			this.triggerHooks("beforeChapterRender", function () {
				resolve(doc);
			}.bind(this), this);
		}.bind(this));

	}.bind(this))
	.then(function(doc) {
		var serializer = new XMLSerializer();
		var contents = serializer.serializeToString(doc);
		return contents;
	}.bind(this));
};

EPUBJS.Chapter.prototype.url = function(_store){
	var deferred = new RSVP.defer();
	var store = _store || this.store;
	var loaded;
	var chapter = this;
	var url;

	if(store){
		if(!this.tempUrl) {
			store.getUrl(this.absolute).then(function(url){
				chapter.tempUrl = url;
				deferred.resolve(url);
			});
		} else {
			url = this.tempUrl;
			deferred.resolve(url);
		}
	}else{
		url = this.absolute;
		deferred.resolve(url);
	}
	/*
	loaded = EPUBJS.core.request(url, 'xml', false);
	loaded.then(function(contents){
		chapter.contents = contents;
		deferred.resolve(chapter.absolute);
	}, function(error){
		deferred.reject(error);
	});
	*/

	return deferred.promise;
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
	this.document = null;
	if(this.tempUrl && store) {
		store.revokeUrl(this.tempUrl);
		this.tempUrl = false;
	}
};

EPUBJS.Chapter.prototype.setDocument = function(_document){
	var uri = _document.namespaceURI;
	var doctype = _document.doctype;

	// Creates an empty document
	this.document = _document.implementation.createDocument(
			uri,
			null,
			null
	);
	this.contents = this.document.importNode(
			_document.documentElement, //node to import
			true                         //clone its descendants
	);

	this.document.appendChild(this.contents);

	// Fix to apply wgxpath to new document in IE
	if(!this.document.evaluate && document.evaluate) {
		this.document.evaluate = document.evaluate;
	}

	// this.deferred.resolve(this.contents);
};

EPUBJS.Chapter.prototype.cfiFromRange = function(_range) {
	var range;
	var startXpath, endXpath;
	var startContainer, endContainer;
	var cleanTextContent, cleanEndTextContent;

	// Check for Contents
	if(!this.document) return;

	if(typeof document.evaluate != 'undefined') {

		startXpath = EPUBJS.core.getElementXPath(_range.startContainer);
		// console.log(startContainer)
		endXpath = EPUBJS.core.getElementXPath(_range.endContainer);

		startContainer = this.document.evaluate(startXpath, this.document, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		if(!_range.collapsed) {
			endContainer = this.document.evaluate(endXpath, this.document, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		}

		range = this.document.createRange();
		// Find Exact Range in original document
		if(startContainer) {
			try {
				range.setStart(startContainer, _range.startOffset);
				if(!_range.collapsed && endContainer) {
					range.setEnd(endContainer, _range.endOffset);
				}
			} catch (e) {
				console.log("missed");
				startContainer = false;
			}

		}

		// Fuzzy Match
		if(!startContainer) {
			console.log("not found, try fuzzy match");
			cleanStartTextContent = EPUBJS.core.cleanStringForXpath(_range.startContainer.textContent);
			startXpath = "//text()[contains(.," + cleanStartTextContent + ")]";

			startContainer = this.document.evaluate(startXpath, this.document, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

			if(startContainer){
				// console.log("Found with Fuzzy");
				range.setStart(startContainer, _range.startOffset);

				if(!_range.collapsed) {
					cleanEndTextContent = EPUBJS.core.cleanStringForXpath(_range.endContainer.textContent);
					endXpath = "//text()[contains(.," + cleanEndTextContent + ")]";
					endContainer = this.document.evaluate(endXpath, this.document, EPUBJS.core.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
					if(endContainer) {
						range.setEnd(endContainer, _range.endOffset);
					}
				}

			}
		}
	} else {
		range = _range; // Just evaluate the current documents range
	}

	// Generate the Cfi
	return this.epubcfi.generateCfiFromRange(range, this.cfiBase);
};

EPUBJS.Chapter.prototype.find = function(_query){
	var chapter = this;
	var matches = [];
	var query = _query.toLowerCase();
	//var xpath = this.document.evaluate(".//text()[contains(translate(., '"+query.toUpperCase()+"', '"+query+"'),'"+query+"')]", this.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	var find = function(node){
		// Search String
		var text = node.textContent.toLowerCase();
		var range = chapter.document.createRange();
		var cfi;
		var pos;
		var last = -1;
		var excerpt;
		var limit = 150;

		while (pos != -1) {
			pos = text.indexOf(query, last + 1);

			if(pos != -1) {
				// If Found, Create Range
				range = chapter.document.createRange();
				range.setStart(node, pos);
				range.setEnd(node, pos + query.length);

				//Generate CFI
				cfi = chapter.cfiFromRange(range);

				// Generate Excerpt
				if(node.textContent.length < limit) {
					excerpt = node.textContent;
				} else {
					excerpt = node.textContent.substring(pos-limit/2,pos+limit/2);
					excerpt = "..." + excerpt + "...";
				}

				//Add CFI to list
				matches.push({
					cfi: cfi,
					excerpt: excerpt
				});
			}

			last = pos;
		}

	};

	// Grab text nodes

	/*
	for ( var i=0 ; i < xpath.snapshotLength; i++ ) {
		find(xpath.snapshotItem(i));
	}
	*/

	this.textSprint(this.document, function(node){
		find(node);
	});


	// Return List of CFIs
	return matches;
};


EPUBJS.Chapter.prototype.textSprint = function(root, func) {
	var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode: function (node) {
					if (node.data && ! /^\s*$/.test(node.data) ) {
						return NodeFilter.FILTER_ACCEPT;
					} else {
						return NodeFilter.FILTER_REJECT;
					}
			}
	}, false);
	var node;
	while ((node = treeWalker.nextNode())) {
		func(node);
	}

};

EPUBJS.Chapter.prototype.replace = function(query, func, finished, progress){
	var items = this.contents.querySelectorAll(query),
		resources = Array.prototype.slice.call(items),
		count = resources.length;


	if(count === 0) {
		finished(false);
		return;
	}
	resources.forEach(function(item){
		var called = false;
		var after = function(result, full){
			if(called === false) {
				count--;
				if(progress) progress(result, full, count);
				if(count <= 0 && finished) finished(true);
				called = true;
			}
		};

		func(item, after);

	}.bind(this));

};

EPUBJS.Chapter.prototype.replaceWithStored = function(query, attr, func, callback) {
	var _oldUrls,
			_newUrls = {},
			_store = this.store,
			_cache = this.caches[query],
			_uri = EPUBJS.core.uri(this.absolute),
			_chapterBase = _uri.base,
			_attr = attr,
			_wait = 5,
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
				full = EPUBJS.core.resolveUrl(_chapterBase, src);

		var replaceUrl = function(url) {
				var timeout;
				link.onload = function(){
					clearTimeout(timeout);
					done(url, full);
				};

				link.onerror = function(e){
					clearTimeout(timeout);
					done(url, full);
					console.error(e);
				};

				if(query == "image") {
					//-- SVG needs this to trigger a load event
					link.setAttribute("externalResourcesRequired", "true");
				}

				if(query == "link[href]" && link.getAttribute("rel") !== "stylesheet") {
					//-- Only Stylesheet links seem to have a load events, just continue others
					done(url, full);
				} else {
					timeout = setTimeout(function(){
						done(url, full);
					}, _wait);
				}

				link.setAttribute(_attr, url);



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

EPUBJS.core.request = function(url, type, withCredentials) {
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
	if(withCredentials) {
		xhr.withCredentials = true;
	}
	xhr.open("GET", url, true);
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

	if(type == "binary") {
		xhr.responseType = "arraybuffer";
	}

	xhr.send();

	function handler() {
		if (this.readyState === this.DONE) {
			if (this.status === 200) { // || this.responseXML-- Firefox is reporting 0 for blob urls
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
					message : this.response,
					stack : new Error().stack
				});
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
			blob = url.indexOf('blob:'),
			doubleSlash = url.indexOf('://'),
			search = url.indexOf('?'),
			fragment = url.indexOf("#"),
			withoutProtocol,
			dot,
			firstSlash;

	if(blob === 0) {
		uri.protocol = "blob";
		uri.base = url.indexOf(0, fragment);
		return uri;
	}

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
		uri = EPUBJS.core.uri(path),
		folders = base.split("/"),
		paths;

	if(uri.host) {
		return path;
	}

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

// Fast quicksort insert for sorted array -- based on:
// http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
EPUBJS.core.insert = function(item, array, compareFunction) {
	var location = EPUBJS.core.locationOf(item, array, compareFunction);
	array.splice(location, 0, item);

	return location;
};

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

// From: https://code.google.com/p/fbug/source/browse/branches/firebug1.10/content/firebug/lib/xpath.js
/**
 * Gets an XPath for an element which describes its hierarchical location.
 */
EPUBJS.core.getElementXPath = function(element) {
	if (element && element.id) {
		return '//*[@id="' + element.id + '"]';
	} else {
		return EPUBJS.core.getElementTreeXPath(element);
	}
};

EPUBJS.core.getElementTreeXPath = function(element) {
	var paths = [];
	var 	isXhtml = (element.ownerDocument.documentElement.getAttribute('xmlns') === "http://www.w3.org/1999/xhtml");
	var index, nodeName, tagName, pathIndex;

	if(element.nodeType === Node.TEXT_NODE){
		// index = Array.prototype.indexOf.call(element.parentNode.childNodes, element) + 1;
		index = EPUBJS.core.indexOfTextNode(element) + 1;

		paths.push("text()["+index+"]");
		element = element.parentNode;
	}

	// Use nodeName (instead of localName) so namespace prefix is included (if any).
	for (; element && element.nodeType == 1; element = element.parentNode)
	{
		index = 0;
		for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
		{
			// Ignore document type declaration.
			if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE) {
				continue;
			}
			if (sibling.nodeName == element.nodeName) {
				++index;
			}
		}
		nodeName = element.nodeName.toLowerCase();
		tagName = (isXhtml ? "xhtml:" + nodeName : nodeName);
		pathIndex = (index ? "[" + (index+1) + "]" : "");
		paths.splice(0, 0, tagName + pathIndex);
	}

	return paths.length ? "./" + paths.join("/") : null;
};

EPUBJS.core.nsResolver = function(prefix) {
	var ns = {
		'xhtml' : 'http://www.w3.org/1999/xhtml',
		'epub': 'http://www.idpf.org/2007/ops'
	};
	return ns[prefix] || null;
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

    // Remove steps present in startPath
    endPath = endPath.replace(startPath, '');

    if (endPath.length) {
      endPath = endPath + "/";
    }

    return "epubcfi(" + base + "!" + startPath + "/" + startIndex + ":" + startOffset + "," + endPath + endIndex + ":" + endOffset + ")";

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
};
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
EPUBJS.hooks = {};
EPUBJS.Hooks = (function(){
	function hooks(){}

	//-- Get pre-registered hooks
	hooks.prototype.getHooks = function(){
		var plugs;
		this.hooks = {};
		Array.prototype.slice.call(arguments).forEach(function(arg){
			this.hooks[arg] = [];
		}, this);

		for (var plugType in this.hooks) {
			plugs = _.values(EPUBJS.hooks[plugType]);

			plugs.forEach(function(hook){
				this.registerHook(plugType, hook);
			}, this);
		}
	};

	//-- Hooks allow for injecting async functions that must all complete before continuing
	//   Functions must have a callback as their first argument.
	hooks.prototype.registerHook = function(type, toAdd, toFront){

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
						this.hooks[type].unshift(hook);
					}else{
						this.hooks[type].push(hook);
					}
				}, this);
			}
		}else{
			//-- Allows for undefined hooks
			this.hooks[type] = [toAdd];

			if(typeof(toAdd) === "function"){
				this.hooks[type] = [toAdd];
			}else if(Array.isArray(toAdd)){
				this.hooks[type] = [];
				toAdd.forEach(function(hook){
					this.hooks[type].push(hook);
				}, this);
			}

		}
	};

	hooks.prototype.removeHook = function(type, toRemove){
		var index;

		if(typeof(this.hooks[type]) != "undefined"){

			if(typeof(toRemove) === "function"){
				index = this.hooks[type].indexOf(toRemove);
				if (index > -1) {
					this.hooks[type].splice(index, 1);
				}
			}else if(Array.isArray(toRemove)){
				toRemove.forEach(function(hook){
					index = this.hooks[type].indexOf(hook);
					if (index > -1) {
						this.hooks[type].splice(index, 1);
					}
				}, this);
			}
		}
	};

	hooks.prototype.triggerHooks = function(type, callback, passed){
		var hooks, count;

		if(typeof(this.hooks[type]) == "undefined") return false;

		hooks = this.hooks[type];

		count = hooks.length;
		if(count === 0 && callback) {
			callback();
		}

		function countdown(){
			count--;
			if(count <= 0 && callback) callback();
		}

		hooks.forEach(function(hook){
			hook(countdown, passed);
		});
	};

	return {
		register: function(name) {
			if(EPUBJS.hooks[name] === undefined) { EPUBJS.hooks[name] = {}; }
			if(typeof EPUBJS.hooks[name] !== 'object') { throw "Already registered: "+name; }
			return EPUBJS.hooks[name];
		},
		mixin: function(object) {
			for (var prop in hooks.prototype) {
				object[prop] = hooks.prototype[prop];
			}
		}
	};
})();

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

EPUBJS.Layout.ReflowableSpreads.prototype.format = function(documentElement, _width, _height, _gap){
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

	this.documentElement = documentElement;
	this.spreadWidth = (colWidth + gap) * divisor;


	documentElement.style.overflow = "hidden";

	// Must be set to the new calculated width or the columns will be off
	documentElement.style.width = width + "px";

	//-- Adjust height
	documentElement.style.height = _height + "px";

	//-- Add columns
	documentElement.style[columnAxis] = "horizontal";
	documentElement.style[columnFill] = "auto";
	documentElement.style[columnGap] = gap+"px";
	documentElement.style[columnWidth] = colWidth+"px";

	this.colWidth = colWidth;
	this.gap = gap;
	return {
		pageWidth : this.spreadWidth,
		pageHeight : _height
	};
};

EPUBJS.Layout.ReflowableSpreads.prototype.calculatePages = function() {
	var totalWidth = this.documentElement.scrollWidth;
	var displayedPages = Math.ceil(totalWidth / this.spreadWidth);

	//-- Add a page to the width of the document to account an for odd number of pages
	this.documentElement.style.width = ((displayedPages * this.spreadWidth) - this.gap) + "px";

	return {
		displayedPages : displayedPages,
		pageCount : displayedPages * 2
	};
};

EPUBJS.Layout.Fixed = function(){
	this.documentElement = null;
};

EPUBJS.Layout.Fixed.prototype.format = function(documentElement, _width, _height, _gap){
	var columnWidth = EPUBJS.core.prefixed('columnWidth');
	var viewport = documentElement.querySelector("[name=viewport]");
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

EPUBJS.Locations = function(spine, store) {
  this.spine = spine;
  this.store = store;

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
	var nextChapter = function(deferred){
		var chapter;
		var next = spinePos + 1;
		var done = deferred || new RSVP.defer();
		var loaded;
		if(next >= spineLength) {
			done.resolve();
		} else {
			spinePos = next;
			chapter = new EPUBJS.Chapter(this.spine[spinePos], this.store);

      this.process(chapter).then(function() {
        // Load up the next chapter
				setTimeout(function(){
					nextChapter(done);
				}, 1);

      });
		}
		return done.promise;
	}.bind(this);

	var finished = nextChapter().then(function(){
    this.total = this._locations.length-1;

    if (this._currentCfi) {
      this.currentLocation = this._currentCfi;
    }
		deferred.resolve(this._locations);
	}.bind(this));

	return deferred.promise;
};

EPUBJS.Locations.prototype.process = function(chapter) {
  return chapter.load(this.request)
    .then(function(_doc) {

      var range;
      var doc = _doc;
      var contents = doc.documentElement;
      var counter = 0;
      var prev;

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

EPUBJS.Pagination = function(pageList) {
	this.pages = [];
	this.locations = [];
	this.epubcfi = new EPUBJS.EpubCFI();
	if(pageList && pageList.length) {
		this.process(pageList);
	}
};

EPUBJS.Pagination.prototype.process = function(pageList){
	pageList.forEach(function(item){
		this.pages.push(item.page);
		this.locations.push(item.cfi);
	}, this);
	
	this.pageList = pageList;
	this.firstPage = parseInt(this.pages[0]);
	this.lastPage = parseInt(this.pages[this.pages.length-1]);
	this.totalPages = this.lastPage - this.firstPage;
};

EPUBJS.Pagination.prototype.pageFromCfi = function(cfi){
	var pg = -1;
	
	// Check if the pageList has not been set yet
	if(this.locations.length === 0) {
		return -1;
	}
	
	// TODO: check if CFI is valid?

	// check if the cfi is in the location list
	// var index = this.locations.indexOf(cfi);
	var index = EPUBJS.core.indexOfSorted(cfi, this.locations, this.epubcfi.compare);
	if(index != -1 && index < (this.pages.length-1) ) {
		pg = this.pages[index];
	} else {
		// Otherwise add it to the list of locations
		// Insert it in the correct position in the locations page
		//index = EPUBJS.core.insert(cfi, this.locations, this.epubcfi.compare);
		index = EPUBJS.core.locationOf(cfi, this.locations, this.epubcfi.compare);
		// Get the page at the location just before the new one, or return the first
		pg = index-1 >= 0 ? this.pages[index-1] : this.pages[0];
		if(pg !== undefined) {
			// Add the new page in so that the locations and page array match up
			//this.pages.splice(index, 0, pg);
		} else {
			pg = -1;
		}

	}
	return pg;
};

EPUBJS.Pagination.prototype.cfiFromPage = function(pg){
	var cfi = -1;
	// check that pg is an int
	if(typeof pg != "number"){
		pg = parseInt(pg);
	}

	// check if the cfi is in the page list
	// Pages could be unsorted.
	var index = this.pages.indexOf(pg);
	if(index != -1) {
		cfi = this.locations[index];
	}
	// TODO: handle pages not in the list
	return cfi;
};

EPUBJS.Pagination.prototype.pageFromPercentage = function(percent){
	var pg = Math.round(this.totalPages * percent);
	return pg;
};

// Returns a value between 0 - 1 corresponding to the location of a page
EPUBJS.Pagination.prototype.percentageFromPage = function(pg){
	var percentage = (pg - this.firstPage) / this.totalPages;
	return Math.round(percentage * 1000) / 1000;
};

// Returns a value between 0 - 1 corresponding to the location of a cfi
EPUBJS.Pagination.prototype.percentageFromCfi = function(cfi){
	var pg = this.pageFromCfi(cfi);
	var percentage = this.percentageFromPage(pg);
	return percentage;
};
EPUBJS.Parser = function(baseUrl){
	this.baseUrl = baseUrl || '';
};

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

EPUBJS.Parser.prototype.packageContents = function(packageXml, baseUrl){
	var parse = this;
	var metadataNode, manifestNode, spineNode;
	var manifest, navPath, tocPath, coverPath;
	var spineNodeIndex;
	var spine;
	var spineIndexByURL;
	var metadata;

	if(baseUrl) this.baseUrl = baseUrl;

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
	tocPath = parse.findTocPath(manifestNode, spineNode);
	coverPath = parse.findCoverPath(manifestNode);

	spineNodeIndex = Array.prototype.indexOf.call(spineNode.parentNode.childNodes, spineNode);

	spine = parse.spine(spineNode, manifest);

	spineIndexByURL = {};
	spine.forEach(function(item){
		spineIndexByURL[item.href] = item.index;
	});

	metadata = parse.metadata(metadataNode);

	metadata.direction = spineNode.getAttribute("page-progression-direction");

	return {
		'metadata' : metadata,
		'spine'    : spine,
		'manifest' : manifest,
		'navPath'  : navPath,
		'tocPath'  : tocPath,
		'coverPath': coverPath,
		'spineNodeIndex' : spineNodeIndex,
		'spineIndexByURL' : spineIndexByURL
	};
};

//-- Find TOC NAV
EPUBJS.Parser.prototype.findNavPath = function(manifestNode){
	// Find item with property 'nav'
	// Should catch nav irregardless of order
  var node = manifestNode.querySelector("item[properties$='nav'], item[properties^='nav '], item[properties*=' nav ']");
  return node ? node.getAttribute('href') : false;
};

//-- Find TOC NCX: media-type="application/x-dtbncx+xml" href="toc.ncx"
EPUBJS.Parser.prototype.findTocPath = function(manifestNode, spineNode){
	var node = manifestNode.querySelector("item[media-type='application/x-dtbncx+xml']");
	var tocId;

	// If we can't find the toc by media-type then try to look for id of the item in the spine attributes as
	// according to http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm#Section2.4.1.2,
	// "The item that describes the NCX must be referenced by the spine toc attribute."
	if (!node) {
		tocId = spineNode.getAttribute("toc");
		if(tocId) {
			node = manifestNode.querySelector("item[id='" + tocId + "']");
		}
	}

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
	metadata.layout = p.querySelectorText(xml, "meta[property='rendition:layout']");
	metadata.orientation = p.querySelectorText(xml, "meta[property='rendition:orientation']");
	metadata.spread = p.querySelectorText(xml, "meta[property='rendition:spread']");

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

	var spineNodeIndex = Array.prototype.indexOf.call(spineXml.parentNode.childNodes, spineXml);

	var epubcfi = new EPUBJS.EpubCFI();

	//-- Add to array to mantain ordering and cross reference with manifest
	items.forEach(function(item, index){
		var Id = item.getAttribute('idref');
		var cfiBase = epubcfi.generateChapterComponent(spineNodeIndex, index, Id);
		var props = item.getAttribute('properties') || '';
		var propArray = props.length ? props.split(' ') : [];
		var manifestProps = manifest[Id].properties;
		var manifestPropArray = manifestProps.length ? manifestProps.split(' ') : [];
		var vert = {
			'id' : Id,
			'linear' : item.getAttribute('linear') || '',
			'properties' : propArray,
			'manifestProperties' : manifestPropArray,
			'href' : manifest[Id].href,
			'url' :  manifest[Id].url,
			'index' : index,
			'cfiBase' : cfiBase,
			'cfi' : "epub(" + cfiBase + ")"
		};
		spine.push(vert);
	});

	return spine;
};

EPUBJS.Parser.prototype.nav = function(navHtml, spineIndexByURL, bookSpine){
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
				subitems = getTOC(item),
				spinePos = spineIndexByURL[baseUrl],
				spineItem = bookSpine[spinePos],
				cfi = 	spineItem ? spineItem.cfi : '';

			if(!id) {
				if(spinePos) {
					spineItem = bookSpine[spinePos];
					id = spineItem.id;
					cfi = spineItem.cfi;
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
				"parent" : parent ? parent.getAttribute('id') : null,
				"cfi" : cfi
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
					spinePos = spineIndexByURL[baseUrl],
					spineItem = bookSpine[spinePos],
					subitems = getTOC(item),
					cfi = 	spineItem ? spineItem.cfi : '';

			if(!id) {
				if(spinePos) {
					spineItem = bookSpine[spinePos];
					id = spineItem.id;
					cfi = 	spineItem.cfi;
				} else {
					id = 'epubjs-autogen-toc-id-' + (idCounter++);
				}
			}

			list.unshift({
						"id": id,
						"href": src,
						"label": text,
						"spinePos": spinePos,
						"subitems" : subitems,
						"parent" : parent ? parent.getAttribute('id') : null,
						"cfi" : cfi
			});

		}

		return list;
	}

	return getTOC(navMap);
};

EPUBJS.Parser.prototype.pageList = function(navHtml, spineIndexByURL, bookSpine){
	var navEl = navHtml.querySelector('nav[*|type="page-list"]'),
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

	function getPages(parent){
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
				page = parseInt(text),
				isCfi = href.indexOf("epubcfi"),
				split,
				packageUrl,
				cfi;

			if(isCfi != -1) {
				split = href.split("#");
				packageUrl = split[0];
				cfi = split.length > 1 ? split[1] : false;
				list.push({
					"cfi" : cfi,
					"href" : href,
					"packageUrl" : packageUrl,
					"page" : page
				});
			} else {
				list.push({
					"href" : href,
					"page" : page
				});
			}

		});

		return list;
	}

	return getPages(navEl);
};

EPUBJS.Render.Iframe = function() {
	this.iframe = null;
	this.document = null;
	this.window = null;
	this.docEl = null;
	this.bodyEl = null;

	this.leftPos = 0;
	this.pageWidth = 0;

	this.isMobile = navigator.userAgent.match(/(iPad|iPhone|iPod|Mobile|Android)/g);
};

//-- Build up any html needed
EPUBJS.Render.Iframe.prototype.create = function(){
	this.iframe = document.createElement('iframe');
	this.iframe.id = "epubjs-iframe:" + EPUBJS.core.uuid();
	this.iframe.scrolling = "no";
	this.iframe.seamless = "seamless";
	// Back up if seamless isn't supported
	this.iframe.style.border = "none";

	this.iframe.addEventListener("load", this.loaded.bind(this), false);
	return this.iframe;
};

/**
* Sets the source of the iframe with the given URL string
* Takes:  Document Contents String
* Returns: promise with document element
*/
EPUBJS.Render.Iframe.prototype.load = function(contents, url){
	var render = this,
			deferred = new RSVP.defer();

	if(this.window) {
		this.unload();
	}

	this.iframe.onload = function(e) {
		var title;

		render.document = render.iframe.contentDocument;
		render.docEl = render.document.documentElement;
		render.headEl = render.document.head;
		render.bodyEl = render.document.body || render.document.querySelector("body");
		render.window = render.iframe.contentWindow;

		render.window.addEventListener("resize", render.resized.bind(render), false);

		// Reset the scroll position
		render.leftPos = 0;
		render.setLeft(0);

		//-- Clear Margins
		if(render.bodyEl) {
			render.bodyEl.style.margin = "0";
		}

		// HTML element must have direction set if RTL or columnns will
		// not be in the correct direction in Firefox
		// Firefox also need the html element to be position right
		if(render.direction == "rtl" && render.docEl.dir != "rtl"){
			render.docEl.dir = "rtl";
			render.docEl.style.position = "absolute";
			render.docEl.style.right = "0";
		}

		deferred.resolve(render.docEl);
	};

	this.iframe.onerror = function(e) {
		//console.error("Error Loading Contents", e);
		deferred.reject({
				message : "Error Loading Contents: " + e,
				stack : new Error().stack
			});
	};

	// this.iframe.contentWindow.location.replace(url);
	this.document = this.iframe.contentDocument;

  if(!this.document) {
    deferred.reject(new Error("No Document Available"));
    return deferred;
  }

  this.document.open();
  this.document.write(contents);
  this.document.close();

	return deferred.promise;
};


EPUBJS.Render.Iframe.prototype.loaded = function(v){
	var url = this.iframe.contentWindow.location.href;
	var baseEl, base;

	this.document = this.iframe.contentDocument;
	this.docEl = this.document.documentElement;
	this.headEl = this.document.head;
	this.bodyEl = this.document.body || this.document.querySelector("body");
	this.window = this.iframe.contentWindow;

	if(url != "about:blank"){
		baseEl = this.iframe.contentDocument.querySelector("base");
		base = baseEl.getAttribute('href');
		this.trigger("render:loaded", base);
	}
};

// Resize the iframe to the given width and height
EPUBJS.Render.Iframe.prototype.resize = function(width, height){
	var iframeBox;

	if(!this.iframe) return;

	this.iframe.height = height;

	if(!isNaN(width) && width % 2 !== 0){
		width += 1; //-- Prevent cutting off edges of text in columns
	}

	this.iframe.width = width;
	// Get the fractional height and width of the iframe
	// Default to orginal if bounding rect is 0
	this.width = this.iframe.getBoundingClientRect().width || width;
	this.height = this.iframe.getBoundingClientRect().height || height;
};


EPUBJS.Render.Iframe.prototype.resized = function(e){
	// Get the fractional height and width of the iframe
	this.width = this.iframe.getBoundingClientRect().width;
	this.height = this.iframe.getBoundingClientRect().height;
};

EPUBJS.Render.Iframe.prototype.totalWidth = function(){
	return this.docEl.scrollWidth;
};

EPUBJS.Render.Iframe.prototype.totalHeight = function(){
	return this.docEl.scrollHeight;
};

EPUBJS.Render.Iframe.prototype.setPageDimensions = function(pageWidth, pageHeight){
	this.pageWidth = pageWidth;
	this.pageHeight = pageHeight;
	//-- Add a page to the width of the document to account an for odd number of pages
	// this.docEl.style.width = this.docEl.scrollWidth + pageWidth + "px";
};

EPUBJS.Render.Iframe.prototype.setDirection = function(direction){

	this.direction = direction;

	// Undo previous changes if needed
	if(this.docEl && this.docEl.dir == "rtl"){
		this.docEl.dir = "rtl";
		this.docEl.style.position = "static";
		this.docEl.style.right = "auto";
	}

};

EPUBJS.Render.Iframe.prototype.setLeft = function(leftPos){
	// this.bodyEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style.marginLeft = -leftPos + "px";
	// this.docEl.style[EPUBJS.Render.Iframe.transform] = 'translate('+ (-leftPos) + 'px, 0)';

	if (this.isMobile) {
		this.docEl.style["-webkit-transform"] = 'translate('+ (-leftPos) + 'px, 0)';
	} else {
		this.document.defaultView.scrollTo(leftPos, 0);
	}

};

EPUBJS.Render.Iframe.prototype.setStyle = function(style, val, prefixed){
	if(prefixed) {
		style = EPUBJS.core.prefixed(style);
	}

	if(this.bodyEl) this.bodyEl.style[style] = val;
};

EPUBJS.Render.Iframe.prototype.removeStyle = function(style){

	if(this.bodyEl) this.bodyEl.style[style] = '';

};

EPUBJS.Render.Iframe.prototype.addHeadTag = function(tag, attrs, _doc) {
	var doc = _doc || this.document;
	var tagEl = doc.createElement(tag);
	var headEl = doc.head;

	for(var attr in attrs) {
		tagEl.setAttribute(attr, attrs[attr]);
	}

	if(headEl) headEl.insertBefore(tagEl, headEl.firstChild);
};

EPUBJS.Render.Iframe.prototype.page = function(pg){
	this.leftPos = this.pageWidth * (pg-1); //-- pages start at 1

	// Reverse for rtl langs
	if(this.direction === "rtl"){
		this.leftPos = this.leftPos * -1;
	}

	this.setLeft(this.leftPos);
};

//-- Show the page containing an Element
EPUBJS.Render.Iframe.prototype.getPageNumberByElement = function(el){
	var left, pg;
	if(!el) return;

	left = this.leftPos + el.getBoundingClientRect().left; //-- Calculate left offset compaired to scrolled position

	pg = Math.floor(left / this.pageWidth) + 1; //-- pages start at 1

	return pg;
};

//-- Show the page containing an Element
EPUBJS.Render.Iframe.prototype.getPageNumberByRect = function(boundingClientRect){
	var left, pg;

	left = this.leftPos + boundingClientRect.left; //-- Calculate left offset compaired to scrolled position
	pg = Math.floor(left / this.pageWidth) + 1; //-- pages start at 1

	return pg;
};

// Return the root element of the content
EPUBJS.Render.Iframe.prototype.getBaseElement = function(){
	return this.bodyEl;
};

// Return the document element
EPUBJS.Render.Iframe.prototype.getDocumentElement = function(){
	return this.docEl;
};

// Checks if an element is on the screen
EPUBJS.Render.Iframe.prototype.isElementVisible = function(el){
	var rect;
	var left;

	if(el && typeof el.getBoundingClientRect === 'function'){
		rect = el.getBoundingClientRect();
		left = rect.left; //+ rect.width;
		if( rect.width !== 0 &&
				rect.height !== 0 && // Element not visible
				left >= 0 &&
				left < this.pageWidth ) {
			return true;
		}
	}

	return false;
};


EPUBJS.Render.Iframe.prototype.scroll = function(bool){
	if(bool) {
		this.iframe.scrolling = "yes";
	} else {
		this.iframe.scrolling = "no";
	}
};

// Cleanup event listeners
EPUBJS.Render.Iframe.prototype.unload = function(){
	this.window.removeEventListener("resize", this.resized);
};

//-- Enable binding events to Render
RSVP.EventTarget.mixin(EPUBJS.Render.Iframe.prototype);

EPUBJS.Renderer = function(renderMethod, hidden) {
	// Dom events to listen for
	this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click"];
	this.upEvent = "mouseup";
	this.downEvent = "mousedown";
	if('ontouchstart' in document.documentElement) {
		this.listenedEvents.push("touchstart", "touchend");
		this.upEvent = "touchend";
		this.downEvent = "touchstart";
	}
	/**
	* Setup a render method.
	* Options are: Iframe
	*/
	if(renderMethod && typeof(EPUBJS.Render[renderMethod]) != "undefined"){
		this.render = new EPUBJS.Render[renderMethod]();
	} else {
		console.error("Not a Valid Rendering Method");
	}

	// Listen for load events
	this.render.on("render:loaded", this.loaded.bind(this));

	// Cached for replacement urls from storage
	this.caches = {};

	// Blank Cfi for Parsing
	this.epubcfi = new EPUBJS.EpubCFI();

	this.spreads = true;
	this.isForcedSingle = false;
	this.resized = _.debounce(this.onResized.bind(this), 100);

	this.layoutSettings = {};

	this.hidden = hidden || false;
	//-- Adds Hook methods to the Book prototype
	//   Hooks will all return before triggering the callback.
	EPUBJS.Hooks.mixin(this);
	//-- Get pre-registered hooks for events
	this.getHooks("beforeChapterDisplay");

	//-- Queue up page changes if page map isn't ready
	this._q = EPUBJS.core.queue(this);

	this._moving = false;

};

//-- Renderer events for listening
EPUBJS.Renderer.prototype.Events = [
	"renderer:keydown",
	"renderer:keyup",
	"renderer:keypressed",
	"renderer:mouseup",
	"renderer:mousedown",
	"renderer:click",
	"renderer:touchstart",
	"renderer:touchend",
	"renderer:selected",
	"renderer:chapterUnloaded",
	"renderer:chapterDisplayed",
	"renderer:locationChanged",
	"renderer:visibleLocationChanged",
	"renderer:resized",
	"renderer:spreads"
];

/**
* Creates an element to render to.
* Resizes to passed width and height or to the elements size
*/
EPUBJS.Renderer.prototype.initialize = function(element, width, height){
	this.container = element;
	this.element = this.render.create();

	this.initWidth = width;
	this.initHeight = height;

	this.width = width || this.container.clientWidth;
	this.height = height || this.container.clientHeight;

	this.container.appendChild(this.element);

	if(width && height){
		this.render.resize(this.width, this.height);
	} else {
		this.render.resize('100%', '100%');
	}

	document.addEventListener("orientationchange", this.onResized);
};

/**
* Display a chapter
* Takes: chapter object, global layout settings
* Returns: Promise with passed Renderer after pages has loaded
*/
EPUBJS.Renderer.prototype.displayChapter = function(chapter, globalLayout){
	var store = false;
	if(this._moving) {
		console.error("Rendering In Progress");
		return;
	}
	this._moving = true;
	// Get the url string from the chapter (may be from storage)
	return chapter.render().
		then(function(contents) {

			// Unload the previous chapter listener
			if(this.currentChapter) {
				this.currentChapter.unload(); // Remove stored blobs

				if(this.render.window){
					this.render.window.removeEventListener("resize", this.resized);
				}

				this.removeEventListeners();
				this.removeSelectionListeners();
				this.trigger("renderer:chapterUnloaded");
				this.contents = null;
				this.doc = null;
				this.pageMap = null;
			}

			this.currentChapter = chapter;

			this.chapterPos = 1;

			this.currentChapterCfiBase = chapter.cfiBase;

			this.layoutSettings = this.reconcileLayoutSettings(globalLayout, chapter.properties);

			return this.load(contents, chapter.href);

		}.bind(this));

};

/**
* Loads a url (string) and renders it,
* attaching event listeners and triggering hooks.
* Returns: Promise with the rendered contents.
*/

EPUBJS.Renderer.prototype.load = function(contents, url){
	var deferred = new RSVP.defer();
	var loaded;

	// Switch to the required layout method for the settings
	this.layoutMethod = this.determineLayout(this.layoutSettings);
	this.layout = new EPUBJS.Layout[this.layoutMethod]();

	this.visible(false);

	render = this.render.load(contents, url);

	render.then(function(contents) {

		this.afterLoad(contents);

		//-- Trigger registered hooks before displaying
		this.beforeDisplay(function(){

			this.afterDisplay();

			this.visible(true);


			deferred.resolve(this); //-- why does this return the renderer?

		}.bind(this));

	}.bind(this));

	return deferred.promise;
};

EPUBJS.Renderer.prototype.afterLoad = function(contents) {
	var formated;
	this.currentChapter.setDocument(this.render.document);
	this.contents = contents;
	this.doc = this.render.document;

	// Format the contents using the current layout method
	this.formated = this.layout.format(contents, this.render.width, this.render.height, this.gap);
	this.render.setPageDimensions(this.formated.pageWidth, this.formated.pageHeight);

	// window.addEventListener("orientationchange", this.onResized.bind(this), false);
	if(!this.initWidth && !this.initHeight){
		this.render.window.addEventListener("resize", this.resized, false);
	}

	this.addEventListeners();
	this.addSelectionListeners();

};

EPUBJS.Renderer.prototype.afterDisplay = function(contents) {

	var pages = this.layout.calculatePages();
	var msg = this.currentChapter;
	var queued = this._q.length();
	this._moving = false;

	this.updatePages(pages);

	this.visibleRangeCfi = this.getVisibleRangeCfi();
	this.currentLocationCfi = this.visibleRangeCfi.start;

	if(queued === 0) {
		this.trigger("renderer:locationChanged", this.currentLocationCfi);
		this.trigger("renderer:visibleRangeChanged", this.visibleRangeCfi);
	}

	msg.cfi = this.currentLocationCfi; //TODO: why is this cfi passed to chapterDisplayed
	this.trigger("renderer:chapterDisplayed", msg);

};

EPUBJS.Renderer.prototype.loaded = function(url){
	this.trigger("render:loaded", url);
	// var uri = EPUBJS.core.uri(url);
	// var relative = uri.path.replace(book.bookUrl, '');
	// console.log(url, uri, relative);
};

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* Takes: global layout settings object, chapter properties string
* Returns: Object with layout properties
*/
EPUBJS.Renderer.prototype.reconcileLayoutSettings = function(global, chapter){
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

/**
* Uses the settings to determine which Layout Method is needed
* Triggers events based on the method choosen
* Takes: Layout settings object
* Returns: String of appropriate for EPUBJS.Layout function
*/
EPUBJS.Renderer.prototype.determineLayout = function(settings){
	// Default is layout: reflowable & spread: auto
	var spreads = this.determineSpreads(this.minSpreadWidth);
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
	this.render.scroll(scroll);
	this.trigger("renderer:spreads", spreads);
	return layoutMethod;
};

// Shortcut to trigger the hook before displaying the chapter
EPUBJS.Renderer.prototype.beforeDisplay = function(callback, renderer){
	this.triggerHooks("beforeChapterDisplay", callback, this);
};

// Update the renderer with the information passed by the layout
EPUBJS.Renderer.prototype.updatePages = function(layout){
	this.pageMap = this.mapPage();
	// this.displayedPages = layout.displayedPages;

	if (this.spreads) {
		this.displayedPages = Math.ceil(this.pageMap.length / 2);
	} else {
		this.displayedPages = this.pageMap.length;
	}

	// this.currentChapter.pages = layout.pageCount;
	this.currentChapter.pages = this.pageMap.length;

	this._q.flush();
};

// Apply the layout again and jump back to the previous cfi position
EPUBJS.Renderer.prototype.reformat = function(){
	var renderer = this;
	var formated, pages;
	if(!this.contents) return;

	spreads = this.determineSpreads(this.minSpreadWidth);

	// Only re-layout if the spreads have switched
	if(spreads != this.spreads){
		this.spreads = spreads;
		this.layoutMethod = this.determineLayout(this.layoutSettings);
		this.layout = new EPUBJS.Layout[this.layoutMethod]();
	}

	// Reset pages
	this.chapterPos = 1;

	this.render.page(this.chapterPos);
	// Give the css styles time to update
	// clearTimeout(this.timeoutTillCfi);
	// this.timeoutTillCfi = setTimeout(function(){
	renderer.formated = renderer.layout.format(renderer.render.docEl, renderer.render.width, renderer.render.height, renderer.gap);
	renderer.render.setPageDimensions(renderer.formated.pageWidth, renderer.formated.pageHeight);

	pages = renderer.layout.calculatePages();
	renderer.updatePages(pages);

	//-- Go to current page after formating
	if(renderer.currentLocationCfi){
		renderer.gotoCfi(renderer.currentLocationCfi);
	}
		// renderer.timeoutTillCfi = null;

};

// Hide and show the render's container .
EPUBJS.Renderer.prototype.visible = function(bool){
	if(typeof(bool) === "undefined") {
		return this.element.style.visibility;
	}

	if(bool === true && !this.hidden){
		this.element.style.visibility = "visible";
	}else if(bool === false){
		this.element.style.visibility = "hidden";
	}
};

// Remove the render element and clean up listeners
EPUBJS.Renderer.prototype.remove = function() {
	if(this.render.window) {
		this.render.unload();
		this.render.window.removeEventListener("resize", this.resized);
		this.removeEventListeners();
		this.removeSelectionListeners();
	}

	this.container.removeChild(this.element);
};

//-- STYLES

EPUBJS.Renderer.prototype.applyStyles = function(styles) {
	for (var style in styles) {
		this.render.setStyle(style, styles[style]);
	}
};

EPUBJS.Renderer.prototype.setStyle = function(style, val, prefixed){
	this.render.setStyle(style, val, prefixed);
};

EPUBJS.Renderer.prototype.removeStyle = function(style){
	this.render.removeStyle(style);
};

//-- HEAD TAGS
EPUBJS.Renderer.prototype.applyHeadTags = function(headTags) {
	for ( var headTag in headTags ) {
		this.render.addHeadTag(headTag, headTags[headTag]);
	}
};

//-- NAVIGATION

EPUBJS.Renderer.prototype.page = function(pg){
	if(!this.pageMap) {
		console.warn("pageMap not set, queuing");
		this._q.enqueue("page", arguments);
		return true;
	}

	if(pg >= 1 && pg <= this.displayedPages){
		this.chapterPos = pg;

		this.render.page(pg);
		this.visibleRangeCfi = this.getVisibleRangeCfi();
		this.currentLocationCfi = this.visibleRangeCfi.start;
		this.trigger("renderer:locationChanged", this.currentLocationCfi);
		this.trigger("renderer:visibleRangeChanged", this.visibleRangeCfi);

		return true;
	}
	//-- Return false if page is greater than the total
	return false;
};

// Short cut to find next page's cfi starting at the last visible element
/*
EPUBJS.Renderer.prototype.nextPage = function(){
	var pg = this.chapterPos + 1;
	if(pg <= this.displayedPages){
		this.chapterPos = pg;

		this.render.page(pg);

		this.currentLocationCfi = this.getPageCfi(this.visibileEl);
		this.trigger("renderer:locationChanged", this.currentLocationCfi);

		return true;
	}
	//-- Return false if page is greater than the total
	return false;
};
*/
EPUBJS.Renderer.prototype.nextPage = function(){
	return this.page(this.chapterPos + 1);
};

EPUBJS.Renderer.prototype.prevPage = function(){
	return this.page(this.chapterPos - 1);
};

//-- Show the page containing an Element
EPUBJS.Renderer.prototype.pageByElement = function(el){
	var pg;
	if(!el) return;

	pg = this.render.getPageNumberByElement(el);
	this.page(pg);
};

// Jump to the last page of the chapter
EPUBJS.Renderer.prototype.lastPage = function(){
	if(this._moving) {
		return this._q.enqueue("lastPage", arguments);
	}

	this.page(this.displayedPages);
};

// Jump to the first page of the chapter
EPUBJS.Renderer.prototype.firstPage = function(){
	if(this._moving) {
		return this._q.enqueue("firstPage", arguments);
	}

	this.page(1);
};

//-- Find a section by fragement id
EPUBJS.Renderer.prototype.section = function(fragment){
	var el = this.doc.getElementById(fragment),
		left, pg;

	if(el){
		this.pageByElement(el);
	}

};

EPUBJS.Renderer.prototype.firstElementisTextNode = function(node) {
	var children = node.childNodes;
	var leng = children.length;

	if(leng &&
		children[0] && // First Child
		children[0].nodeType === 3 && // This is a textNodes
		children[0].textContent.trim().length) { // With non whitespace or return charecters
		return true;
	}
	return false;
};

EPUBJS.Renderer.prototype.isGoodNode = function(node) {
	var embeddedElements = ["audio", "canvas", "embed", "iframe", "img", "math", "object", "svg", "video"];
	if (embeddedElements.indexOf(node.tagName.toLowerCase()) !== -1) {
		// Embedded elements usually do not have a text node as first element, but are also good nodes
		return true;
	}
	return this.firstElementisTextNode(node);
};

// Walk the node tree from a start element to next visible element
EPUBJS.Renderer.prototype.walk = function(node, x, y) {
	var r, children, leng,
		startNode = node,
		prevNode,
		stack = [startNode];

	var STOP = 10000, ITER=0;

	while(!r && stack.length) {
		node = stack.shift();
		if( this.containsPoint(node, x, y) && this.isGoodNode(node)) {
			r = node;
		}

		if(!r && node && node.childElementCount > 0){
			children = node.children;
			if (children && children.length) {
				leng = children.length ? children.length : 0;
			} else {
				return r;
			}
			for (var i = leng-1; i >= 0; i--) {
				if(children[i] != prevNode) stack.unshift(children[i]);
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

// Checks if an element is on the screen
EPUBJS.Renderer.prototype.containsPoint = function(el, x, y){
	var rect;
	var left;
	if(el && typeof el.getBoundingClientRect === 'function'){
		rect = el.getBoundingClientRect();
		// console.log(el, rect, x, y);

		if( rect.width !== 0 &&
				rect.height !== 0 && // Element not visible
				rect.left >= x &&
				x <= rect.left + rect.width) {
			return true;
		}
	}

	return false;
};

EPUBJS.Renderer.prototype.textSprint = function(root, func) {
	var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode: function (node) {
					if ( ! /^\s*$/.test(node.data) ) {
						return NodeFilter.FILTER_ACCEPT;
					} else {
						return NodeFilter.FILTER_REJECT;
					}
			}
	}, false);
	var node;
	while ((node = treeWalker.nextNode())) {
		func(node);
	}

};

EPUBJS.Renderer.prototype.sprint = function(root, func) {
	var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
	var node;
	while ((node = treeWalker.nextNode())) {
		func(node);
	}

};

EPUBJS.Renderer.prototype.mapPage = function(){
	var renderer = this;
	var map = [];
	var root = this.render.getBaseElement();
	var page = 1;
	var width = this.layout.colWidth + this.layout.gap;
	var offset = this.formated.pageWidth * (this.chapterPos-1);
	var limit = (width * page) - offset;// (width * page) - offset;
	var elLimit = 0;
	var prevRange;
	var cfi;
	var check = function(node) {
		var elPos;
		var elRange;
		var children = Array.prototype.slice.call(node.childNodes);
		if (node.nodeType == Node.ELEMENT_NODE) {
			// elPos = node.getBoundingClientRect();
			elRange = document.createRange();
			elRange.selectNodeContents(node);
			elPos = elRange.getBoundingClientRect();

			if(!elPos || (elPos.width === 0 && elPos.height === 0)) {
				return;
			}

			//-- Element starts new Col
			if(elPos.left > elLimit) {
				children.forEach(function(node){
					if(node.nodeType == Node.TEXT_NODE &&
						node.textContent.trim().length) {
						checkText(node);
					}
				});
			}

			//-- Element Spans new Col
			if(elPos.right > elLimit) {
				children.forEach(function(node){
					if(node.nodeType == Node.TEXT_NODE &&
						node.textContent.trim().length) {
						checkText(node);
					}
				});
			}
		}

	};
	var checkText = function(node){
		var ranges = renderer.splitTextNodeIntoWordsRanges(node);
		ranges.forEach(function(range){
			var pos = range.getBoundingClientRect();

			if(!pos || (pos.width === 0 && pos.height === 0)) {
				return;
			}
			if(pos.left + pos.width < limit) {
				if(!map[page-1]){
					range.collapse(true);
					cfi = renderer.currentChapter.cfiFromRange(range);
					// map[page-1].start = cfi;
					map.push({ start: cfi, end: null });
				}
			} else {
				if(prevRange){
					prevRange.collapse(true);
					cfi = renderer.currentChapter.cfiFromRange(prevRange);
					map[map.length-1].end = cfi;
				}

				range.collapse(true);
				cfi = renderer.currentChapter.cfiFromRange(range);
				map.push({
						start: cfi,
						end: null
				});

				page += 1;
				limit = (width * page) - offset;
				elLimit = limit;
			}

			prevRange = range;
		});


	};
	var docEl = this.render.getDocumentElement();
	var dir = docEl.dir;

	// Set back to ltr before sprinting to get correct order
	if(dir == "rtl") {
		docEl.dir = "ltr";
		docEl.style.position = "static";
	}

	this.sprint(root, check);

	// Reset back to previous RTL settings
	if(dir == "rtl") {
		docEl.dir = dir;
		docEl.style.left = "auto";
		docEl.style.right = "0";
	}

	// this.textSprint(root, checkText);

	if(prevRange){
		prevRange.collapse(true);

		cfi = renderer.currentChapter.cfiFromRange(prevRange);
		map[map.length-1].end = cfi;
	}

	// Handle empty map
	if(!map.length) {
		range = this.doc.createRange();
		range.selectNodeContents(root);
		range.collapse(true);

		cfi = renderer.currentChapter.cfiFromRange(range);

		map.push({ start: cfi, end: cfi });

	}

	// clean up
	prevRange = null;
	ranges = null;
	range = null;
	root = null;

	return map;
};


EPUBJS.Renderer.prototype.indexOfBreakableChar = function (text, startPosition) {
	var whiteCharacters = "\x2D\x20\t\r\n\b\f";
	// '-' \x2D
	// ' ' \x20

	if (! startPosition) {
		startPosition = 0;
	}

	for (var i = startPosition; i < text.length; i++) {
		if (whiteCharacters.indexOf(text.charAt(i)) != -1) {
			return i;
		}
	}

	return -1;
};


EPUBJS.Renderer.prototype.splitTextNodeIntoWordsRanges = function(node){
	var ranges = [];
	var text = node.textContent.trim();
	var range;
	var rect;
	var list;
	// jaroslaw.bielski@7bulls.com
	// Usage of indexOf() function for space character as word delimiter
	// is not sufficient in case of other breakable characters like \r\n- etc
	pos = this.indexOfBreakableChar(text);

	if(pos === -1) {
		range = this.doc.createRange();
		range.selectNodeContents(node);
		return [range];
	}

	range = this.doc.createRange();
	range.setStart(node, 0);
	range.setEnd(node, pos);
	ranges.push(range);

	// jaroslaw.bielski@7bulls.com
	// there was a word miss in case of one letter words
	range = this.doc.createRange();
	range.setStart(node, pos+1);

	while ( pos != -1 ) {

		pos = this.indexOfBreakableChar(text, pos + 1);
		if(pos > 0) {

			if(range) {
				range.setEnd(node, pos);
				ranges.push(range);
			}

			range = this.doc.createRange();
			range.setStart(node, pos+1);
		}
	}

	if(range) {
		range.setEnd(node, text.length);
		ranges.push(range);
	}

	return ranges;
};

EPUBJS.Renderer.prototype.rangePosition = function(range){
	var rect;
	var list;

	list = range.getClientRects();

	if(list.length) {
		rect = list[0];
		return rect;
	}

	return null;
};

/*
// Get the cfi of the current page
EPUBJS.Renderer.prototype.getPageCfi = function(prevEl){
	var range = this.doc.createRange();
	var position;
	// TODO : this might need to take margin / padding into account?
	var x = 1;//this.formated.pageWidth/2;
	var y = 1;//;this.formated.pageHeight/2;

	range = this.getRange(x, y);

	// var test = this.doc.defaultView.getSelection();
	// var r = this.doc.createRange();
	// test.removeAllRanges();
	// r.setStart(range.startContainer, range.startOffset);
	// r.setEnd(range.startContainer, range.startOffset + 1);
	// test.addRange(r);

	return this.currentChapter.cfiFromRange(range);
};
*/

// Get the cfi of the current page
EPUBJS.Renderer.prototype.getPageCfi = function(){
	var pg;
	if (this.spreads) {
		pg = this.chapterPos*2;
		startRange = this.pageMap[pg-2];
	} else {
		pg = this.chapterPos;
		startRange = this.pageMap[pg-1];
	}
	return this.pageMap[(this.chapterPos * 2) -1].start;
};

EPUBJS.Renderer.prototype.getRange = function(x, y, forceElement){
	var range = this.doc.createRange();
	var position;
	forceElement = true; // temp override
	if(typeof document.caretPositionFromPoint !== "undefined" && !forceElement){
		position = this.doc.caretPositionFromPoint(x, y);
		range.setStart(position.offsetNode, position.offset);
	} else if(typeof document.caretRangeFromPoint !== "undefined" && !forceElement){
		range = this.doc.caretRangeFromPoint(x, y);
	} else {
		this.visibileEl = this.findElementAfter(x, y);
		range.setStart(this.visibileEl, 1);
	}

	// var test = this.doc.defaultView.getSelection();
	// var r = this.doc.createRange();
	// test.removeAllRanges();
	// r.setStart(range.startContainer, range.startOffset);
	// r.setEnd(range.startContainer, range.startOffset + 1);
	// test.addRange(r);
	return range;
};

/*
EPUBJS.Renderer.prototype.getVisibleRangeCfi = function(prevEl){
	var startX = 0;
	var startY = 0;
	var endX = this.width-1;
	var endY = this.height-1;
	var startRange = this.getRange(startX, startY);
	var endRange = this.getRange(endX, endY); //fix if carret not avail
	var startCfi = this.currentChapter.cfiFromRange(startRange);
	var endCfi;
	if(endRange) {
		endCfi = this.currentChapter.cfiFromRange(endRange);
	}

	return {
		start: startCfi,
		end: endCfi || false
	};
};
*/

EPUBJS.Renderer.prototype.pagesInCurrentChapter = function() {
	var pgs;
	var length;

	if(!this.pageMap) {
		console.warn("page map not loaded");
		return false;
	}

	length = this.pageMap.length;

	if(this.spreads){
		pgs = Math.ceil(length / 2);
	} else {
		pgs = length;
	}

	return pgs;
};

EPUBJS.Renderer.prototype.currentRenderedPage = function(){
	var pg;

	if(!this.pageMap) {
		console.warn("page map not loaded");
		return false;
	}

	if (this.spreads && this.layout.pageCount > 1) {
		pg = this.chapterPos*2;
	} else {
		pg = this.chapterPos;
	}

	return pg;
};

EPUBJS.Renderer.prototype.getRenderedPagesLeft = function(){
	var pg;
	var lastPage;
	var pagesLeft;

	if(!this.pageMap) {
		console.warn("page map not loaded");
		return false;
	}

	lastPage = this.pageMap.length;

	if (this.spreads) {
		pg = this.chapterPos*2;
	} else {
		pg = this.chapterPos;
	}

	pagesLeft = lastPage - pg;
	return pagesLeft;

};

EPUBJS.Renderer.prototype.getVisibleRangeCfi = function(){
	var pg;
	var startRange, endRange;

	if(!this.pageMap) {
		console.warn("page map not loaded");
		return false;
	}

	if (this.spreads) {
		pg = this.chapterPos*2;
		startRange = this.pageMap[pg-2];
		endRange = startRange;

		if(this.layout.pageCount > 1) {
			endRange = this.pageMap[pg-1];
		}
	} else {
		pg = this.chapterPos;
		startRange = this.pageMap[pg-1];
		endRange = startRange;
	}

	if(!startRange) {
		console.warn("page range miss:", pg, this.pageMap);
		startRange = this.pageMap[this.pageMap.length-1];
		endRange = startRange;
	}

	return {
		start: startRange.start,
		end: endRange.end
	};
};

// Goto a cfi position in the current chapter
EPUBJS.Renderer.prototype.gotoCfi = function(cfi){
	var pg;
	var marker;
	var range;

	if(this._moving){
		return this._q.enqueue("gotoCfi", arguments);
	}

	if(_.isString(cfi)){
		cfi = this.epubcfi.parse(cfi);
	}

	if(typeof document.evaluate === 'undefined') {
		marker = this.epubcfi.addMarker(cfi, this.doc);
		if(marker) {
			pg = this.render.getPageNumberByElement(marker);
			// Must Clean up Marker before going to page
			this.epubcfi.removeMarker(marker, this.doc);
			this.page(pg);
		}
	} else {
		range = this.epubcfi.generateRangeFromCfi(cfi, this.doc);
		if(range) {
			// jaroslaw.bielski@7bulls.com
			// It seems that sometimes getBoundingClientRect() returns null for first page CFI in chapter.
			// It is always reproductible if few consecutive chapters have only one page.
			// NOTE: This is only workaround and the issue needs an deeper investigation.
			// NOTE: Observed on Android 4.2.1 using WebView widget as HTML renderer (Asus TF300T).
			var rect = range.getBoundingClientRect();
			if (rect) {
				pg = this.render.getPageNumberByRect(rect);

			} else {
				// Goto first page in chapter
				pg = 1;
			}

			this.page(pg);

			// Reset the current location cfi to requested cfi
			this.currentLocationCfi = cfi.str;
		}
	}
};

//  Walk nodes until a visible element is found
EPUBJS.Renderer.prototype.findFirstVisible = function(startEl){
	var el = startEl || this.render.getBaseElement();
	var	found;
	// kgolunski@7bulls.com
	// Looks like an old API usage
	// Set x and y as 0 to fullfill walk method API.
	found = this.walk(el, 0, 0);

	if(found) {
		return found;
	}else{
		return startEl;
	}

};
// TODO: remove me - unsused
EPUBJS.Renderer.prototype.findElementAfter = function(x, y, startEl){
	var el = startEl || this.render.getBaseElement();
	var	found;
	found = this.walk(el, x, y);
	if(found) {
		return found;
	}else{
		return el;
	}

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

EPUBJS.Renderer.prototype.resize = function(width, height, setSize){
	var spreads;

	this.width = width;
	this.height = height;

	if(setSize !== false) {
		this.render.resize(this.width, this.height);
	}



	if(this.contents){
		this.reformat();
	}

	this.trigger("renderer:resized", {
		width: this.width,
		height: this.height
	});
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


//-- Spreads

EPUBJS.Renderer.prototype.setMinSpreadWidth = function(width){
	this.minSpreadWidth = width;
	this.spreads = this.determineSpreads(width);
};

EPUBJS.Renderer.prototype.determineSpreads = function(cutoff){
	if(this.isForcedSingle || !cutoff || this.width < cutoff) {
		return false; //-- Single Page
	}else{
		return true; //-- Double Page
	}
};

EPUBJS.Renderer.prototype.forceSingle = function(bool){
	if(bool) {
		this.isForcedSingle = true;
		// this.spreads = false;
	} else {
		this.isForcedSingle = false;
		// this.spreads = this.determineSpreads(this.minSpreadWidth);
	}
};

EPUBJS.Renderer.prototype.setGap = function(gap){
	this.gap = gap; //-- False == auto gap
};

EPUBJS.Renderer.prototype.setDirection = function(direction){
	this.direction = direction;
	this.render.setDirection(this.direction);
};

//-- Content Replacements

EPUBJS.Renderer.prototype.replace = function(query, func, finished, progress){
	var items = this.contents.querySelectorAll(query),
		resources = Array.prototype.slice.call(items),
		count = resources.length;


	if(count === 0) {
		finished(false);
		return;
	}
	resources.forEach(function(item){
		var called = false;
		var after = function(result, full){
			if(called === false) {
				count--;
				if(progress) progress(result, full, count);
				if(count <= 0 && finished) finished(true);
				called = true;
			}
		};

		func(item, after);

	}.bind(this));

};

/* Moved to chapter

EPUBJS.Renderer.prototype.replaceWithStored = function(query, attr, func, callback) {
	var _oldUrls,
			_newUrls = {},
			_store = this.currentChapter.store,
			_cache = this.caches[query],
			_uri = EPUBJS.core.uri(this.currentChapter.absolute),
			_chapterBase = _uri.base,
			_attr = attr,
			_wait = 5,
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
				full = EPUBJS.core.resolveUrl(_chapterBase, src);

		var replaceUrl = function(url) {
				var timeout;
				link.onload = function(){
					clearTimeout(timeout);
					done(url, full);
				};

				link.onerror = function(e){
					clearTimeout(timeout);
					done(url, full);
					console.error(e);
				};

				if(query == "image") {
					//-- SVG needs this to trigger a load event
					link.setAttribute("externalResourcesRequired", "true");
				}

				if(query == "link[href]" && link.getAttribute("rel") !== "stylesheet") {
					//-- Only Stylesheet links seem to have a load events, just continue others
					done(url, full);
				} else {
					timeout = setTimeout(function(){
						done(url, full);
					}, _wait);
				}

				link.setAttribute(_attr, url);



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
*/

//-- Enable binding events to Renderer
RSVP.EventTarget.mixin(EPUBJS.Renderer.prototype);

var EPUBJS = EPUBJS || {};
EPUBJS.replace = {};

//-- Replaces the relative links within the book to use our internal page changer
EPUBJS.replace.hrefs = function(callback, renderer){
	var book = this;
	var replacments = function(link, done){
		var href = link.getAttribute("href"),
				isRelative = href.search("://"),
				directory,
				relative,
				location;

		if(isRelative != -1){

			link.setAttribute("target", "_blank");

		}else{
		    // Links may need to be resolved, such as ../chp1.xhtml
            var uri = EPUBJS.core.uri(renderer.render.window.location.href);

            directory = uri.directory;

            if(directory) {
                // We must ensure that the file:// protocol is preserved for
                // local file links, as in certain contexts (such as under
                // Titanium), file links without the file:// protocol will not
                // work
                if (uri.protocol === "file") {
                    relative = EPUBJS.core.resolveUrl(uri.base, href);
                } else {
                    relative = EPUBJS.core.resolveUrl(directory, href);
                }
            } else {
                relative = href;
            }

			link.onclick = function(){
				book.goto(relative);
				return false;
			};

		}
		done();

	};

	renderer.replace("a[href]", replacments, callback);

};

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
		EPUBJS.replace.stylesheets(_store, full).then(function(url, full){
			// done
			done(url, full);
		},  function(reason) {
			// we were unable to replace the style sheets
			done(null);
		});
	}else{
		_store.getUrl(full).then(done, function(reason) {
			// we were unable to get the url, signal to upper layer
			done(null);
		});
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

		}, function(reason) {
			deferred.reject(reason);
		});

	}, function(reason) {
		deferred.reject(reason);
	});

	return deferred.promise;
};

EPUBJS.replace.cssUrls = function(_store, base, text){
	var deferred = new RSVP.defer(),
		promises = [],
		matches = text.match(/url\(\'?\"?([^\'|^\"^\)]*)\'?\"?\)/g);

	if(!_store) return;

	if(!matches){
		deferred.resolve(text);
		return deferred.promise;
	}

	matches.forEach(function(str){
		var full = EPUBJS.core.resolveUrl(base, str.replace(/url\(|[|\)|\'|\"]/g, ''));
		var replaced = _store.getUrl(full).then(function(url){
			text = text.replace(str, 'url("'+url+'")');
		}, function(reason) {
			deferred.reject(reason);
		});

		promises.push(replaced);
	});

	RSVP.all(promises).then(function(){
		deferred.resolve(text);
	});

	return deferred.promise;
};


EPUBJS.Storage = function(withCredentials){

	this.checkRequirements();
	this.urlCache = {};
	this.withCredentials = withCredentials;
	this.URL = window.URL || window.webkitURL || window.mozURL;
	this.offline = false;
};

//-- Load the zip lib and set the workerScriptsPath
EPUBJS.Storage.prototype.checkRequirements = function(callback){
	if(typeof(localforage) == "undefined") console.error("localForage library not loaded");
};

EPUBJS.Storage.prototype.put = function(assets, store) {
	var deferred = new RSVP.defer();
	var count = assets.length;
	var current = 0;
	var next = function(deferred){
		var done = deferred || new RSVP.defer();
		var url;
		var encodedUrl;

		if(current >= count) {
			done.resolve();
		} else {
			url = assets[current].url;
			encodedUrl = window.encodeURIComponent(url);

			EPUBJS.core.request(url, "binary")
			.then(function (data) {
				return localforage.setItem(encodedUrl, data);
			})
			.then(function(data){
				current++;
        // Load up the next
				setTimeout(function(){
					next(done);
				}, 1);

      });
		}
		return done.promise;
	}.bind(this);

	if(!Array.isArray(assets)) {
		assets = [assets];
	}

	next().then(function(){
		deferred.resolve();
	}.bind(this));

	return deferred.promise;
};

EPUBJS.Storage.prototype.token = function(url, value){
	var encodedUrl = window.encodeURIComponent(url);
	return localforage.setItem(encodedUrl, value)
		.then(function (result) {
			if (result === null) {
				return false;
			} else {
				return true;
			}
		});
};

EPUBJS.Storage.prototype.isStored = function(url){
	var encodedUrl = window.encodeURIComponent(url);
	return localforage.getItem(encodedUrl)
		.then(function (result) {
			if (result === null) {
				return false;
			} else {
				return true;
			}
		});
};

EPUBJS.Storage.prototype.getText = function(url){
	var encodedUrl = window.encodeURIComponent(url);

	return EPUBJS.core.request(url, 'arraybuffer', this.withCredentials)
		.then(function(buffer){

			if(this.offline){
				this.offline = false;
				this.trigger("offline", false);
			}
			localforage.setItem(encodedUrl, buffer);
			return buffer;
		}.bind(this))
		.then(function(data) {
			var deferred = new RSVP.defer();
			var mimeType = EPUBJS.core.getMimeType(url);
			var blob = new Blob([data], {type : mimeType});
			var reader = new FileReader();
			reader.addEventListener("loadend", function() {
				deferred.resolve(reader.result);
			});
			reader.readAsText(blob, mimeType);
			return deferred.promise;
		})
		.catch(function() {

			var deferred = new RSVP.defer();
			var entry = localforage.getItem(encodedUrl);

			if(!this.offline){
				this.offline = true;
				this.trigger("offline", true);
			}

			if(!entry) {
				deferred.reject({
					message : "File not found in the storage: " + url,
					stack : new Error().stack
				});
				return deferred.promise;
			}

			entry.then(function(data) {
				var mimeType = EPUBJS.core.getMimeType(url);
				var blob = new Blob([data], {type : mimeType});
				var reader = new FileReader();
				reader.addEventListener("loadend", function() {
					deferred.resolve(reader.result);
				});
				reader.readAsText(blob, mimeType);
			});

			return deferred.promise;
		}.bind(this));
};

EPUBJS.Storage.prototype.getUrl = function(url){
	var encodedUrl = window.encodeURIComponent(url);

	return EPUBJS.core.request(url, 'arraybuffer', this.withCredentials)
		.then(function(buffer){
			if(this.offline){
				this.offline = false;
				this.trigger("offline", false);
			}
			localforage.setItem(encodedUrl, buffer);
			return url;
		}.bind(this))
		.catch(function() {
			var deferred = new RSVP.defer();
			var entry;
			var _URL = window.URL || window.webkitURL || window.mozURL;
			var tempUrl;

			if(!this.offline){
				this.offline = true;
				this.trigger("offline", true);
			}

			if(encodedUrl in this.urlCache) {
				deferred.resolve(this.urlCache[encodedUrl]);
				return deferred.promise;
			}

			entry = localforage.getItem(encodedUrl);

			if(!entry) {
				deferred.reject({
					message : "File not found in the storage: " + url,
					stack : new Error().stack
				});
				return deferred.promise;
			}

			entry.then(function(data) {
				var blob = new Blob([data], {type : EPUBJS.core.getMimeType(url)});
				tempUrl = _URL.createObjectURL(blob);
				deferred.resolve(tempUrl);
				this.urlCache[encodedUrl] = tempUrl;
			}.bind(this));


			return deferred.promise;
	}.bind(this));
};

EPUBJS.Storage.prototype.getXml = function(url){
	var encodedUrl = window.encodeURIComponent(url);

	return EPUBJS.core.request(url, 'arraybuffer', this.withCredentials)
		.then(function(buffer){
			if(this.offline){
				this.offline = false;
				this.trigger("offline", false);
			}
			localforage.setItem(encodedUrl, buffer);
			return buffer;
		}.bind(this))
		.then(function(data) {
			var deferred = new RSVP.defer();
			var mimeType = EPUBJS.core.getMimeType(url);
			var blob = new Blob([data], {type : mimeType});
			var reader = new FileReader();
			reader.addEventListener("loadend", function() {
				var parser = new DOMParser();
				var doc = parser.parseFromString(reader.result, "text/xml");
				deferred.resolve(doc);
			});
			reader.readAsText(blob, mimeType);
			return deferred.promise;
		})
		.catch(function() {
			var deferred = new RSVP.defer();
			var entry = localforage.getItem(encodedUrl);

			if(!this.offline){
				this.offline = true;
				this.trigger("offline", true);
			}

			if(!entry) {
				deferred.reject({
					message : "File not found in the storage: " + url,
					stack : new Error().stack
				});
				return deferred.promise;
			}

			entry.then(function(data) {
				var mimeType = EPUBJS.core.getMimeType(url);
				var blob = new Blob([data], {type : mimeType});
				var reader = new FileReader();
				reader.addEventListener("loadend", function() {
					var parser = new DOMParser();
					var doc = parser.parseFromString(reader.result, "text/xml");
					deferred.resolve(doc);
				});
				reader.readAsText(blob, mimeType);
			});

			return deferred.promise;
		}.bind(this));
};

EPUBJS.Storage.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = this.urlCache[url];
	if(fromCache) _URL.revokeObjectURL(fromCache);
};

EPUBJS.Storage.prototype.failed = function(error){
	console.error(error);
};

RSVP.EventTarget.mixin(EPUBJS.Storage.prototype);

EPUBJS.Unarchiver = function(url){

	this.checkRequirements();
	this.urlCache = {};

};

//-- Load the zip lib and set the workerScriptsPath
EPUBJS.Unarchiver.prototype.checkRequirements = function(callback){
	if(typeof(JSZip) == "undefined") console.error("JSZip lib not loaded");
};

EPUBJS.Unarchiver.prototype.open = function(zipUrl, callback){
	var deferred = new RSVP.defer();

	return EPUBJS.core.request(zipUrl, "binary").then(function(data){
		this.zip = new JSZip(data);
	}.bind(this));
};

EPUBJS.Unarchiver.prototype.getXml = function(url, encoding){
	var decodededUrl = window.decodeURIComponent(url);
	return this.getText(decodededUrl, encoding).
			then(function(text){
				var parser = new DOMParser();
				return parser.parseFromString(text, "text/xml");
			});

};

EPUBJS.Unarchiver.prototype.getUrl = function(url, mime){
	var unarchiver = this;
	var deferred = new RSVP.defer();
	var decodededUrl = window.decodeURIComponent(url);
	var entry = this.zip.file(decodededUrl);
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var tempUrl;
	var blob;
	
	if(!entry) {
		deferred.reject({
			message : "File not found in the epub: " + url,
			stack : new Error().stack
		});
		return deferred.promise;
	}

	if(url in this.urlCache) {
		deferred.resolve(this.urlCache[url]);
		return deferred.promise;
	}

	blob = new Blob([entry.asUint8Array()], {type : EPUBJS.core.getMimeType(entry.name)});

	tempUrl = _URL.createObjectURL(blob);
	deferred.resolve(tempUrl);
	unarchiver.urlCache[url] = tempUrl;

	return deferred.promise;
};

EPUBJS.Unarchiver.prototype.getText = function(url, encoding){
	var unarchiver = this;
	var deferred = new RSVP.defer();
	var decodededUrl = window.decodeURIComponent(url);
	var entry = this.zip.file(decodededUrl);
	var text;

	if(!entry) {
		deferred.reject({
			message : "File not found in the epub: " + url,
			stack : new Error().stack
		});
		return deferred.promise;
	}

	text = entry.asText();
	deferred.resolve(text);

	return deferred.promise;
};

EPUBJS.Unarchiver.prototype.revokeUrl = function(url){
	var _URL = window.URL || window.webkitURL || window.mozURL;
	var fromCache = this.urlCache[url];
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

// EPUBJS.Unarchiver.prototype.saveEntryFileToStorage = function(entry, callback){
// 	var that = this;
// 	entry.getData(new zip.BlobWriter(), function(blob) {
// 		EPUBJS.storage.save(entry.filename, blob, callback);
// 	});
// };

/*
 From Zip.js, by Gildas Lormeau
 */

(function() {
	"use strict";
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
			"xml" : [ "xml", "xsl", "xsd" ],
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
			"oebps-package+xml" : "opf",
			"omdoc+xml" : "omdoc",
			"oxps" : "oxps",
			"vnd.amazon.ebook" : "azw",
			"widget" : "wgt",
			"x-dtbncx+xml" : "ncx",
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
			"cis-cod" : "cod",
		},
		"message" : {
			"rfc822" : [ "eml", "mime", "mht", "mhtml", "nws" ]
		},
		"text" : {
			"cache-manifest" : [ "manifest", "appcache" ],
			"calendar" : [ "ics", "icz", "ifb" ],
			"css" : "css",
			"csv" : "csv",
			"h323" : "323",
			"html" : [ "html", "htm", "shtml", "stm" ],
			"iuls" : "uls",
			"mathml" : "mml",
			"plain" : [ "txt", "text", "brf", "conf", "def", "list", "log", "in", "bas" ],
			"richtext" : "rtx",
			"tab-separated-values" : "tsv",
			"x-bibtex" : "bib",
			"x-dsrc" : "d",
			"x-diff" : [ "diff", "patch" ],
			"x-haskell" : "hs",
			"x-java" : "java",
			"x-literate-haskell" : "lhs",
			"x-moc" : "moc",
			"x-pascal" : [ "p", "pas" ],
			"x-pcs-gcd" : "gcd",
			"x-perl" : [ "pl", "pm" ],
			"x-python" : "py",
			"x-scala" : "scala",
			"x-setext" : "etx",
			"x-tcl" : [ "tcl", "tk" ],
			"x-tex" : [ "tex", "ltx", "sty", "cls" ],
			"x-vcard" : "vcf",
			"sgml" : [ "sgml", "sgm" ],
			"x-c" : [ "c", "cc", "cxx", "cpp", "h", "hh", "dic" ],
			"x-fortran" : [ "f", "for", "f77", "f90" ],
			"x-opml" : "opml",
			"x-nfo" : "nfo",
			"x-sfv" : "sfv",
			"x-uuencode" : "uu",
			"webviewhtml" : "htt"
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

	EPUBJS.core.getMimeType = function(filename) {
		var defaultValue = "text/plain";//"application/octet-stream";
		return filename && mimeTypes[filename.split(".").pop().toLowerCase()] || defaultValue;
	};

})();
//# sourceMappingURL=epub.js.map