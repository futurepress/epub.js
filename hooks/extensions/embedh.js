(function () {
// Prevent double embedding
if (typeof(window.annotator) === 'undefined') {
    window.annotator = {};
} else {
    return;
}

// Injects the hypothesis dependencies. These can be either js or css, the
// file extension is used to determine the loading method. This file is
// pre-processed in order to insert the wgxpath, url and inject scripts.
//
// Custom injectors can be provided to load the scripts into a different
// environment. Both script and stylesheet methods are provided with a url
// and a callback fn that expects either an error object or null as the only
// argument.
//
// For example a Chrome extension may look something like:
//
//   window.hypothesisInstall({
//     script: function (src, fn) {
//       chrome.tabs.executeScript(tab.id, {file: src}, fn);
//     },
//     stylesheet: function (href, fn) {
//       chrome.tabs.insertCSS(tab.id, {file: href}, fn);
//     }
//   });

window.hypothesisInstall = function (inject) {
  inject = inject || {};

  var resources = [];
  var injectStylesheet = inject.stylesheet || function injectStylesheet(href, fn) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;

    document.head.appendChild(link);
    fn(null);
  };

  var injectScript = inject.script || function injectScript(src, fn) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function () { fn(null) };
    script.onerror = function () { fn(new Error('Failed to load script: ' + src)) };
    script.src = src;

    document.head.appendChild(script);
  };

  if (!window.document.evaluate) {
    resources.push('https://hypothes.is/assets/scripts/vendor/wgxpath.install.min.js?0cd5ec8a');
  }

  if (typeof window.Annotator === 'undefined') {
    resources.push('https://hypothes.is/assets/styles/hypothesis.min.css?a1f13d87');
    resources.push('https://hypothes.is/assets/scripts/vendor/url.min.js?2a5acbac');
    resources.push('https://hypothes.is/assets/scripts/hypothesis.min.js?3af1f37d');
  }

  window.hypothesisConfig = function() {
    var Annotator = window.Annotator;
    function MyGuest(elem, options) {
      var self = this;

      // options = {
      // 	showHighlights: true,
      // 	Toolbar: {container: '#annotation-controls'}
      // }
      
      Annotator.Guest.call(this, elem, options);

      self.createAnnotation = function(annotation) {
        var getSelectors, info, metadata, ranges, ref, root, selectors, self, setDocumentInfo, setTargets, targets;
        if (annotation == null) {
          annotation = {};
        }
        self = this;
        root = this.element[0];
        ranges = (ref = this.selectedRanges) != null ? ref : [];
        this.selectedRanges = null;
        var toggleEpubjsSideBar = new Event('toggle-sidebar');
        window.dispatchEvent(toggleEpubjsSideBar);
        getSelectors = function(range) {
          var options;
          options = {
            cache: self.anchoringCache,
            ignoreSelector: '[class^="annotator-"]'
          };
          return self.anchoring.describe(root, range, options);
        };
        setDocumentInfo = function(info) {
          annotation.document = info.metadata;
          return annotation.uri = info.uri;
        };
        setTargets = function(arg) {
          var info, selector, selectors, source;
          info = arg[0], selectors = arg[1];
          source = info.uri;
          return annotation.target = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = selectors.length; i < len; i++) {
              selector = selectors[i];
              results.push({
                source: source,
                selector: selector
              });
            }
            return results;
          })();
        };
        info = this.getDocumentInfo();
        selectors = Promise.all(ranges.map(getSelectors));
        metadata = info.then(setDocumentInfo);
        targets = Promise.all([info, selectors]).then(setTargets);
        targets.then(function() {
          return self.publish('beforeAnnotationCreated', [annotation]);
        });
        targets.then(function() {
          return self.anchor(annotation);
        });
        return annotation;
      }

    }

    MyGuest.prototype = Object.create(Annotator.Guest.prototype);

    return {
      constructor: MyGuest,
    }
  };

  (function next(err) {
    if (err) { throw err; }

    if (resources.length) {
      var url = resources.shift();
      var ext = url.split('?')[0].split('.').pop();
      var fn = (ext === 'css' ? injectStylesheet : injectScript);
      fn(url, next);
    }
  })();
}

var baseUrl = document.createElement('link');
baseUrl.rel = 'sidebar';
baseUrl.href = 'https://hypothes.is/app.html';
baseUrl.type = 'application/annotator+html';
document.head.appendChild(baseUrl);

window.hypothesisInstall();
})();