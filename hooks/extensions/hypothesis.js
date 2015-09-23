EPUBJS.Hooks.register("beforeChapterDisplay").hypothesis = function(callback, renderer) {
	renderer.render.window.hypothesisConfig = function () {
		return {
			constructor: this.Annotator.Guest
		};
	};



	EPUBJS.core.addScript("//hypothes.is/embed.js", function() {
    renderer.render.window.hypothesisInstall();
		// Must add after base css
		EPUBJS.core.addCss("/reader/css/annotations.css", function() {
			callback();
		}, renderer.doc.head);
	}, renderer.doc.head);

};
