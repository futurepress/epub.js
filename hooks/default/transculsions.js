EPUBJS.Hooks.register("beforeChapterDisplay").transculsions = function(callback, renderer){
		/*
		<aside ref="http://www.youtube.com/embed/DUL6MBVKVLI?html5=1" transclusion="video" width="560" height="315">
			<a href="http://www.youtube.com/embed/DUL6MBVKVLI"> Watch the National Geographic: The Last Roll of Kodachrome</a>
		</aside>
		*/

		var trans = renderer.contents.querySelectorAll('[transclusion]'),
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

			
			renderer.listenUntil("renderer:resized", "renderer:chapterUnloaded", size);
		
			iframe.src = src;
			
			//<iframe width="560" height="315" src="http://www.youtube.com/embed/DUL6MBVKVLI" frameborder="0" allowfullscreen="true"></iframe>
			parent.replaceChild(iframe, item);			
	
	
		});
		
		
		
	
		if(callback) callback();

	
}
