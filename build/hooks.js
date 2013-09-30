EPUBJS.Hooks.register("beforeChapterDisplay").endnotes = function(callback, chapter){

		var notes = chapter.doc.querySelectorAll('a[href]'),
			items = Array.prototype.slice.call(notes), //[].slice.call()
			attr = "epub:type",
			type = "noteref",
			folder = EPUBJS.core.folder(location.pathname),
			cssPath = folder + EPUBJS.cssPath || folder,
			popups = {};
			
		EPUBJS.core.addCss(cssPath + "popup.css", false, chapter.doc.head);
		
		
		items.forEach(function(item){
			var epubType = item.getAttribute(attr),
				href,
				id,
				el,
				pop,
				pos,
				left,
				top,
				txt;
				
			if(epubType != type) return;

			href = item.getAttribute("href");
			id = href.replace("#", '');
			el = chapter.doc.getElementById(id);
			
						
			item.addEventListener("mouseover", showPop, false);
			item.addEventListener("mouseout", hidePop, false);	
			
			function showPop(){
				var poppos,
					iheight = chapter.iframe.height,
					iwidth = chapter.iframe.width,
				 	tip,
					pop,
					maxHeight = 225;
				
				if(!txt) {
					pop = el.cloneNode(true);
					txt = pop.querySelector("p");
				}

				chapter.replaceLinks.bind(this)
				//-- create a popup with endnote inside of it
				if(!popups[id]) {
					popups[id] = document.createElement("div");
					popups[id].setAttribute("class", "popup");
					
					pop_content = document.createElement("div"); 
					
					popups[id].appendChild(pop_content);
					
					pop_content.appendChild(txt);
					pop_content.setAttribute("class", "pop_content");
					
					chapter.bodyEl.appendChild(popups[id]);
					
					//-- TODO: will these leak memory? - Fred 
					popups[id].addEventListener("mouseover", onPop, false);
					popups[id].addEventListener("mouseout", offPop, false);

					//-- Add hide on page change
					// chapter.book.listenUntil("book:pageChanged", "book:chapterDestroy", hidePop);
					// chapter.book.listenUntil("book:pageChanged", "book:chapterDestroy", offPop);
					chapter.book.on("renderer:pageChanged", hidePop, this);
					chapter.book.on("renderer:pageChanged", offPop, this);
					// chapter.book.on("renderer:chapterDestroy", hidePop, this);
				}
				
				pop = popups[id];
				
				
				//-- get location of item
				itemRect = item.getBoundingClientRect();
				left = itemRect.left;
				top = itemRect.top;
					
				//-- show the popup
				pop.classList.add("show");
				
				//-- locations of popup
				popRect = pop.getBoundingClientRect();
				
				//-- position the popup
				pop.style.left = left - popRect.width / 2 + "px";
				pop.style.top = top + "px";
								
				
				//-- Adjust max height
				if(maxHeight > iheight / 2.5) {
					maxHeight = iheight / 2.5;
					pop_content.style.maxHeight = maxHeight + "px";
				}
								
				//-- switch above / below
				if(popRect.height + top >= iheight - 25) {
					pop.style.top = top - popRect.height  + "px";
					pop.classList.add("above");
				}else{
					pop.classList.remove("above");
				}
				
				//-- switch left
				if(left - popRect.width <= 0) {
					pop.style.left = left + "px";
					pop.classList.add("left");
				}else{
					pop.classList.remove("left");
				}
				
				//-- switch right
				if(left + popRect.width / 2 >= iwidth) {
					//-- TEMP MOVE: 300
					pop.style.left = left - 300 + "px";
					
					popRect = pop.getBoundingClientRect();
					pop.style.left = left - popRect.width + "px";
					//-- switch above / below again
					if(popRect.height + top >= iheight - 25) { 
						pop.style.top = top - popRect.height  + "px";
						pop.classList.add("above");
					}else{
						pop.classList.remove("above");
					}
					
					pop.classList.add("right");
				}else{
					pop.classList.remove("right");
				}
				
				
			}
			
			function onPop(){
				popups[id].classList.add("on");
			}
			
			function offPop(){
				popups[id].classList.remove("on");
			}
			
			function hidePop(){
				setTimeout(function(){
					popups[id].classList.remove("show");
				}, 100);	
			}

		});


		if(callback) callback();

}

EPUBJS.Hooks.register("beforeChapterDisplay").smartimages = function(callback, chapter){
		var images = chapter.doc.querySelectorAll('img'),
			items = Array.prototype.slice.call(images),
			iheight = chapter.bodyEl.clientHeight,//chapter.doc.body.getBoundingClientRect().height,
			oheight;

		items.forEach(function(item){
			
			function size() {
				var itemRect = item.getBoundingClientRect(),
					rectHeight = itemRect.height,
					top = itemRect.top,
					oHeight = item.getAttribute('data-height'),
					height = oHeight || rectHeight,
					newHeight;
				
				iheight = chapter.docEl.clientHeight;
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
						console.log(newHeight)
					}
					
					item.setAttribute('data-height', newHeight);
					
				}else{
					item.style.removeProperty('max-height');
					item.style.removeProperty('margin-top');
				}
			}
			
			item.addEventListener('load', size, false);
			
			chapter.on("renderer:resized", size);
			
			chapter.on("renderer:chapterUnloaded", function(){
				item.removeEventListener('load', size);
				chapter.off("renderer:resized", size);
			});
			
			size();

		});

		if(callback) callback();

}

EPUBJS.Hooks.register("beforeChapterDisplay").transculsions = function(callback, chapter){
		/*
		<aside ref="http://www.youtube.com/embed/DUL6MBVKVLI?html5=1" transclusion="video" width="560" height="315">
			<a href="http://www.youtube.com/embed/DUL6MBVKVLI"> Watch the National Geographic: The Last Roll of Kodachrome</a>
		</aside>
		*/

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
