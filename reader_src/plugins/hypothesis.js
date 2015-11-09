window.hypothesisConfig = function() {
  var Annotator = window.Annotator;
  var $main = $("#main");

  function MySidebar(elem, options) {
    options = {
      server: true,
      origin: true,
      showHighlights: true,
      Toolbar: {container: '#annotation-controls'}
    }

    Annotator.Host.call(this, elem, options);
  }

  MySidebar.prototype = Object.create(Annotator.Host.prototype);

  MySidebar.prototype.show = function() {
    this.frame.css({
      'margin-left': (-1 * this.frame.width()) + "px"
    });
    this.frame.removeClass('annotator-collapsed');
    if (!$main.hasClass('single')) {
      $main.addClass("single");
      this.toolbar.find('[name=sidebar-toggle]').removeClass('h-icon-chevron-left').addClass('h-icon-chevron-right');
      this.setVisibleHighlights(true);
    }
  };

  MySidebar.prototype.hide = function() {
    this.frame.css({
      'margin-left': ''
    });
    this.frame.addClass('annotator-collapsed');
    if ($main.hasClass('single')) {
      $main.removeClass("single");
      this.toolbar.find('[name=sidebar-toggle]').removeClass('h-icon-chevron-right').addClass('h-icon-chevron-left');
      this.setVisibleHighlights(false);
    }
  };

  return {
    constructor: MySidebar,
  }
};


EPUBJS.reader.plugins.HypothesisController = function (Book) {
	var reader = this;
	var $main = $("#main");

	var updateAnnotations = function () {
		var annotator = Book.renderer.render.window.annotator;
		if (annotator && annotator.constructor.$) {
			var annotations = getVisibleAnnotations(annotator.constructor.$);
			annotator.showAnnotations(annotations)
		}
	};

	var getVisibleAnnotations = function ($) {
		var width = Book.renderer.render.iframe.clientWidth;
		return $('.annotator-hl').map(function() {
			var $this = $(this),
					left = this.getBoundingClientRect().left;

			if (left >= 0 && left <= width) {
				return $this.data('annotation');
			}
		}).get();
	};

  // $("#annotations").on("click", function () {
  //   var annotator = Book.renderer.render.window.annotator;
  //   var currentPosition = Book.getCurrentLocationCfi();

  //   if ($main.hasClass("single")) {
  //     $main.removeClass("single");
  //     annotator.setVisibleHighlights(false);
  //   } else {
  //     $main.addClass("single");
  //     annotator.setVisibleHighlights(true);
  //   }

  //   $main.one("transitionend", function(){
  //     Book.gotoCfi(currentPosition);
  //   });
  // });

	Book.on("renderer:locationChanged", updateAnnotations);
	// Book.on("renderer:chapterDisplayed", updateAnnotations);

	return {}
};
