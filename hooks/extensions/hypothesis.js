EPUBJS.Hooks.register("beforeChapterDisplay").hypothesis = function(callback, renderer, chapter) {
	renderer.render.window.hypothesisConfig = function () {

		this.Annotator.Guest.prototype.onHighlightClick = function(event) {
		    var annotation, annotations, xor;
		    if (!this.visibleHighlights) {
		      return;
		    }
		    annotation = $(event.currentTarget).data('annotation');
		    annotations = event.annotations != null ? event.annotations : event.annotations = [];
		    annotations.push(annotation);
		    // Open the sidebar.
		    window.parent.annotator.show();
		    if (event.target === event.currentTarget) {
		      xor = event.metaKey || event.ctrlKey;
		      return setTimeout((function(_this) {
		        return function() {
		          return _this.selectAnnotations(annotations, xor);
		        };
		      })(this));
		    }
		  }


		this.Annotator.Guest.prototype.createAnnotation = function(annotation) {
		    var getSelectors, info, metadata, ranges, ref, root, selectors, self, setDocumentInfo, setTargets, targets;
		    if (annotation == null) {
		      annotation = {};
		    }
		    self = this;
		    root = this.element[0];
		    ranges = (ref = this.selectedRanges) != null ? ref : [];
		    this.selectedRanges = null;
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
		    // Open the sidebar.
		    window.parent.annotator.show();
		    return annotation;		
		}

		return {
			constructor: this.Annotator.Guest,
        	app: 'https://hypothes.is/app.html'
		};
	};

	var firstRun = typeof(renderer.render.window.annotator) === 'undefined';
    EPUBJS.core.addScript("//hypothes.is/embed.js", function() {
		// If we change chapter, reinstall annotator.
		if (!firstRun) {
			renderer.render.window.hypothesisInstall();
		}

		// Must add after base css
		EPUBJS.core.addCss("../../css/annotations.css", function() {
			callback();
		}, renderer.doc.head);
	}, renderer.doc.head);
};
