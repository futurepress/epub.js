EPUBJS.Hooks.register("beforeChapterDisplay").hypothesis = function(callback, chapter){


		EPUBJS.core.addScript("https://hypothes.is/app/embed.js", null, chapter.doc.head);

		if(callback) callback();

}


