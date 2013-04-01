FP.Hooks.register("beforeChapterDisplay").example = function(callback, chapter){

		FP.core.addCss("css/annotator.css", false, chapter.doc.head);
		
		FP.core.addScript(FP.filePath + "libs/annotator-full.js", function() {
			
			//-- Config script
			var s = document.createElement("script");
			s.type = 'text/javascript';
			
			a = "var content = $('body').annotator().annotator('setupPlugins', {}, {Filter:false});";
			
			s.innerHTML = a;
			chapter.doc.body.appendChild(s);
			
			//-- Continue to other hooks
			if(callback) callback();
			
		}, chapter.doc.head);

}


