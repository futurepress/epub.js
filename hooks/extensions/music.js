EPUBJS.Hooks.register("beforeChapterDisplay").music = function(callback, chapter){

		var trans = chapter.doc.querySelectorAll('audio'),
			items = Array.prototype.slice.call(trans),
			playing = false;

		items.forEach(function(item){
			var onSpread = 0;


			function getPage() {
				left = item.getBoundingClientRect().left;
				onSpread = Math.floor(left / chapter.spreadWidth) + 1; //-- pages start at 1
				//console.log("left", left, onPage)
				// width = orginal_width;
				// height = orginal_height;
				// 
				// if(width > chapter.colWidth){
				// 	ratio = chapter.colWidth / width; 
				// 
				// 	width = chapter.colWidth;
				// 	height = height * ratio;
				// }
				// 
				// iframe.width = width;
				// iframe.height = height;
			}
			
			function shouldPlay(e) {
				page = 1;
				if(e) page = e.msg;

				if(page != onSpread) return;
				
				if(playing) playing.pause();
				
				item.play();
				
				playing = item;
				
				console.log("start", item.src)
				
			}
			
			
			
			
			//-- resize event


			chapter.book.listenUntil("book:resized", "book:chapterDestroy", getPage);
			
			chapter.book.listenUntil("book:pageChanged", "book:chapterDestroy", shouldPlay);

			item.removeAttribute("controls");			
	
			getPage();
			shouldPlay();
			
		});




		if(callback) callback();


}
