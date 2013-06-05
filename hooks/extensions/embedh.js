EPUBJS.Hooks.register("beforeChapterDisplay").example = function(callback, chapter){


			var s = document.createElement("script");
			s.type = 'text/javascript';
			s.src ="https://test.hypothes.is/app/embed.js"
			
			chapter.doc.body.appendChild(s);
			
			//-- Continue to other hooks
			if(callback) callback();}