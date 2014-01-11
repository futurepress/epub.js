EPUBJS.Hooks.register("beforeChapterDisplay").pageTurns = function(callback, renderer){

		var lock = false;
		var arrowKeys = function(e){
			if(lock) return;

			if (e.keyCode == 37) { 
				renderer.book.prevPage();
				lock = true;
				setTimeout(function(){
					lock = false;
				}, 100);
				return false;
			}

			if (e.keyCode == 39) { 
				renderer.book.nextPage();
				lock = true;
				setTimeout(function(){
					lock = false;
				}, 100);
				return false;
			}

		};
		renderer.docEl.addEventListener('keydown', arrowKeys, false);
		if(callback) callback();
}