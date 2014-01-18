EPUBJS.Hooks.register("beforeChapterDisplay").smartimages = function(callback, renderer){
		var images = renderer.contents.querySelectorAll('img'),
			items = Array.prototype.slice.call(images),
			iheight = renderer.height,//chapter.bodyEl.clientHeight,//chapter.doc.body.getBoundingClientRect().height,
			oheight;

		if(renderer.settings.layout != "reflowable") {
			callback();
			return; //-- Only adjust images for reflowable text
		}

		items.forEach(function(item){
			
			function size() {
				var itemRect = item.getBoundingClientRect(),
					rectHeight = itemRect.height,
					top = itemRect.top,
					oHeight = item.getAttribute('data-height'),
					height = oHeight || rectHeight,
					newHeight;
				
				iheight = renderer.contents.clientHeight;
				if(top < 0) top = 0;
		
				if(height + top >= iheight) {
				
					if(top < iheight/2) {
						newHeight = iheight - top;
						item.style.maxHeight = newHeight + "px";
						item.style.width= "auto";
					}else{
						newHeight = (height < iheight ? height : iheight);
						item.style.maxHeight = newHeight + "px";
						item.style.marginTop = iheight - top + "px";
						item.style.width= "auto";
					}
					
					item.setAttribute('data-height', newHeight);
					
				}else{
					item.style.removeProperty('max-height');
					item.style.removeProperty('margin-top');
				}
			}
			
			item.addEventListener('load', size, false);
			
			renderer.on("renderer:resized", size);
			
			renderer.on("renderer:chapterUnloaded", function(){
				item.removeEventListener('load', size);
				renderer.off("renderer:resized", size);
			});
			
			size();

		});

		if(callback) callback();

}
