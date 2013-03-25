FP.Hooks.register("beforeChapterDisplay").transculsions = function(callback, chapter){

		var trans = chapter.doc.querySelectorAll('[transclusion]'),
			items = Array.prototype.slice.call(trans);

		items.forEach(function(item){
			var src = item.getAttribute("ref"),
				iframe = document.createElement('iframe'),
				orginal_width = item.getAttribute("width"),
				orginal_height = item.getAttribute("height"),
				parent = item.parentNode,
				width = orginal_width, 
				height = orginal_height, 
				ratio;
		
			
			function size() {
				width = orginal_width;
				height = orginal_height;
				
				if(width > chapter.colWidth){
					ratio = chapter.colWidth / width; 
					
					width = chapter.colWidth;
					height = height * ratio;
				}
				
				iframe.width = width;
				iframe.height = height;
			}
			
			
			size();
			
			//-- resize event

			
			chapter.book.listenUntil("book:resized", "book:chapterDestroy", size);
		
			iframe.src = src;
			
			//<iframe width="560" height="315" src="http://www.youtube.com/embed/DUL6MBVKVLI" frameborder="0" allowfullscreen="true"></iframe>
			parent.replaceChild(iframe, item);			
	
	
		});
		
		
		
	
		if(callback) callback();

	
}
