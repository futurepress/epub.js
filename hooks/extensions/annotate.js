EPUBJS.Hooks.register("beforeChapterDisplay").annotate = function(callback, chapter){

		
		var chap = chapter.bodyEl,
			server = 'http://127.0.0.1:5000/';
			files = [
						EPUBJS.filePath + "libs/jquery-1.9.0.js",
						EPUBJS.filePath + "libs/jquery-migrate-1.1.1.js",
						EPUBJS.filePath + "libs/annotator-full.js"
					 ];
			
		
		//EPUBJS.core.loadScripts(files, annotate, chapter.doc.head);
		// $(chapter.doc.body).annotator().annotator('setupPlugins', {}, {
			
		// 	Filter:false,
		// 	Store: {
		// 		annotationData: {
		// 		  'uri': chapter.path
		// 		},
		// 		loadFromSearch: {
		// 			'limit': 100,
		// 			'uri': chapter.path
		// 		}
		// 	}
			
		// 	});
		Util.mousePosition = function(e, offsetEl) {
		  var offset;
		  offset = $(offsetEl).position();
		  return {
		    top: e.pageY,
		    left: e.pageX
		  };
		};

		devAnnotator = new Annotator(chapter.doc.body)
			.addPlugin('Auth', {
              tokenUrl: 'http://annotateit.org/api/token',//'http://localhost:5001/api/token'
            })
            .addPlugin('Unsupported')
            .addPlugin('AnnotateItPermissions')
            .addPlugin('Store', {
              prefix: 'http://annotateit.org/api',//'http://localhost:5000',
              loadFromSearch: {
                uri: chapter.currentChapter.href
              },
              annotationData: {
                uri: chapter.currentChapter.href
              }
            });
          
  //         devAnnotator.plugins.Auth.withToken(function (tok) {
  //           console.log(tok);
  //         })

		EPUBJS.core.addCss("../libs/annotator/css/annotator.css", false, chapter.doc.head);

		if(callback) callback();
		
		function annotate(){
			EPUBJS.core.addCss("css/annotator.css", false, chapter.doc.head);
			
			var s = document.createElement("script");
			s.type = 'text/javascript';

			var a = "jQuery.migrateTrace = false;";
			//a += "console.log(document.getElementById('c001p0002').getBoundingClientRect());";
			
			a += "var content = $('body').annotator().annotator('setupPlugins', {}, {Filter:false});";
			
			//-- Use Local Server:
			 
			// a += "var content = $('body').annotator(),";
			// a += "	server = '" + server + "';";
			// a += "	path = '" + chapter.path + "';";
			// 
			// a += " content.annotator('addPlugin', 'Store', {";
			// // The endpoint of the store on your server.
			// a += "  prefix: server,";
			// 
			// // Attach the uri of the current page to all annotations to allow search.
			// a += "  annotationData: {";
			// a += "	'uri': path";
			// a += "  }";
			
			  // This will perform a search action rather than read when the plugin
			  // loads. Will request the last 20 annotations for the current url.
			  // eg. /store/endpoint/search?limit=20&uri=http://this/document/only
			// a += ","
			// a += "  loadFromSearch: {";
			// a += "	'limit': 20,";
			// a += "	'uri': path";
			// a += "  }";
			//a += "});";
			
			s.innerHTML = a;
			
			chapter.doc.body.appendChild(s);
			
			if(callback) callback();
		}

		

}


