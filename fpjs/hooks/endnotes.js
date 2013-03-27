FP.Hooks.register("beforeChapterDisplay").endnotes = function(callback, chapter){

		var notes = chapter.doc.querySelectorAll('a[href]'),
			items = Array.prototype.slice.call(notes),
			attr = "epub:type",
			type = "noteref",
			popups = {};
			
		
		FP.core.addCss("css/popup.css", false, chapter.doc.head);
		
		//console.log("notes", items)
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
					chapter.book.listenUntil("book:pageChanged", "book:chapterDestroy", hidePop);
					chapter.book.listenUntil("book:pageChanged", "book:chapterDestroy", offPop);
					
				}
				
				pop = popups[id];
				
				
				//-- get location of item
				pos = item.getBoundingClientRect();
				left = pos.left;
				top = pos.top;
				
				//-- show the popup
				pop.classList.add("show");

				//-- position the popup
				pop.style.left = left - pop.offsetWidth / 2 + "px";
				pop.style.top = top + "px";
				
				//-- checking to keep within current column
				poppos = pop.getBoundingClientRect();
				
				//-- Adjust max height
				if(maxHeight > iheight / 2.5) {
					maxHeight = iheight / 2.5;
					pop_content.style.maxHeight = maxHeight + "px";
				}
								
				//-- switch above / below
				if(poppos.height + top >= iheight - 25) {
					pop.style.top = top - poppos.height  + "px";
					pop.classList.add("above");
				}else{
					pop.classList.remove("above");
				}
				
				//-- switch left
				if(left - poppos.width <= 0) {
					pop.style.left = left + "px";
					pop.classList.add("left");
				}else{
					pop.classList.remove("left");
				}
				
				//-- switch right
				if(left + poppos.width / 2 >= iwidth) {
					console.log("right")
					//-- TEMP MOVE: 300
					pop.style.left = left - 300 + "px";
					
					poppos = pop.getBoundingClientRect();
					pop.style.left = left - poppos.width + "px";
					//-- switch above / below again
					if(poppos.height + top >= iheight - 25) { 
						pop.style.top = top - poppos.height  + "px";
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
