// EPUBJS.Hooks.register("beforeChapterDisplay").hypothesis = function(callback, chapter){
// 
// 
//     EPUBJS.core.addScript("https://hypothes.is/app/embed.js", null, chapter.doc.head);
// 
//     if(callback) callback();
// 
// }
// 
// 
EPUBJS.Hooks.register("beforeChapterDisplay").hypothesis = function(callback, renderer){

		if(!renderer) return;

		EPUBJS.core.addScript("https://hypothes.is/app/embed.js?role=guest&light=true", null, renderer.doc.head);

		EPUBJS.core.addCss("/demo/css/annotations.css", null, renderer.doc.head);

		if(callback) callback();		
};