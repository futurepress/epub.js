EPUBJS.Hooks.register("beforeChapterDisplay").hypothesis = function(callback, renderer) {
	renderer.render.window.hypothesisConfig = function () {
		return {
			constructor: this.Annotator.Guest
		};
	};

	EPUBJS.core.addScript("//hypothes.is/embed.js", null, renderer.doc.head);

	if(callback) callback();
};
