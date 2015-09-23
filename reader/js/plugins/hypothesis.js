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

	$("#annotations").on("click", function () {
		var annotator = Book.renderer.render.window.annotator;
		var currentPosition = Book.getCurrentLocationCfi();

		if ($main.hasClass("single")) {
			$main.removeClass("single");
			annotator.setVisibleHighlights(false);
		} else {
			$main.addClass("single");
			annotator.setVisibleHighlights(true);
		}

		$main.one("transitionend", function(){
			Book.gotoCfi(currentPosition);
		});
	});

	Book.on("renderer:locationChanged", updateAnnotations);
	// Book.on("renderer:chapterDisplayed", updateAnnotations);

	return {}
};
