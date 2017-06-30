EPUBJS.Hooks.register("beforeChapterDisplay").endnotes = function(callback, renderer){

		var notes = renderer.contents.querySelectorAll('a[href]'),
			items = Array.prototype.slice.call(notes), //[].slice.call()
			attr = "epub:type",
			type = "noteref",
			folder = EPUBJS.core.folder(location.pathname),
			cssPath = (folder + EPUBJS.cssPath) || folder,
			popups = {};

		EPUBJS.core.addCss(EPUBJS.cssPath + "popup.css", false, renderer.render.document.head);


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
			el = renderer.render.document.getElementById(id);


			item.addEventListener("mouseover", showPop, false);
			item.addEventListener("mouseout", hidePop, false);

			function showPop(){
				var poppos,
					iheight = renderer.height,
					iwidth = renderer.width,
				 	tip,
					pop,
					maxHeight = 225,
					itemRect;

				if(!txt) {
					pop = el.cloneNode(true);
					txt = pop.querySelector("p");
				}

				// chapter.replaceLinks.bind(this) //TODO:Fred - update?
				//-- create a popup with endnote inside of it
				if(!popups[id]) {
					popups[id] = document.createElement("div");
					popups[id].setAttribute("class", "popup");

					pop_content = document.createElement("div");

					popups[id].appendChild(pop_content);

					pop_content.appendChild(txt);
					pop_content.setAttribute("class", "pop_content");

					renderer.render.document.body.appendChild(popups[id]);

					//-- TODO: will these leak memory? - Fred
					popups[id].addEventListener("mouseover", onPop, false);
					popups[id].addEventListener("mouseout", offPop, false);

					//-- Add hide on page change
					// chapter.book.listenUntil("book:pageChanged", "book:chapterDestroy", hidePop);
					// chapter.book.listenUntil("book:pageChanged", "book:chapterDestroy", offPop);
					renderer.on("renderer:pageChanged", hidePop, this);
					renderer.on("renderer:pageChanged", offPop, this);
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

EPUBJS.Hooks.register("beforeChapterDisplay").mathml = function(callback, renderer){

    // check of currentChapter properties contains 'mathml'
    if(renderer.currentChapter.manifestProperties.indexOf("mathml") !== -1 ){
        
        // Assign callback to be inside iframe window
        renderer.render.iframe.contentWindow.mathmlCallback = callback;
        
        // add MathJax config script tag to the renderer body
        var s = document.createElement("script");
        s.type = 'text/x-mathjax-config';
        s.innerHTML = '\
        MathJax.Hub.Register.StartupHook("End",function () { \
          window.mathmlCallback(); \
        });\
        MathJax.Hub.Config({jax: ["input/TeX","input/MathML","output/SVG"],extensions: ["tex2jax.js","mml2jax.js","MathEvents.js"],TeX: {extensions: ["noErrors.js","noUndefined.js","autoload-all.js"]},MathMenu: {showRenderer: false},menuSettings: {zoom: "Click"},messageStyle: "none"}); \
                ';
        renderer.doc.body.appendChild(s);
        // add MathJax.js to renderer head
        EPUBJS.core.addScript("http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML", null, renderer.doc.head);
    
    } else {
        if(callback) callback();
    }
}

EPUBJS.Hooks.register("beforeChapterDisplay").smartimages = function(callback, renderer){
		var images = renderer.contents.querySelectorAll('img'),
			items = Array.prototype.slice.call(images),
			iheight = renderer.height,//chapter.bodyEl.clientHeight,//chapter.doc.body.getBoundingClientRect().height,
			oheight;

		if(renderer.layoutSettings.layout != "reflowable") {
			callback();
			return; //-- Only adjust images for reflowable text
		}

		items.forEach(function(item){

			var size = function() {
				var itemRect = item.getBoundingClientRect(),
					rectHeight = itemRect.height,
					top = itemRect.top,
					oHeight = item.getAttribute('data-height'),
					height = oHeight || rectHeight,
					newHeight,
					fontSize = Number(getComputedStyle(item, "").fontSize.match(/(\d*(\.\d*)?)px/)[1]),
					fontAdjust = fontSize ? fontSize / 2 : 0;

				iheight = renderer.contents.clientHeight;
				if(top < 0) top = 0;

				item.style.maxWidth =  "100%";

				if(height + top >= iheight) {

					if(top < iheight/2) {
						// Remove top and half font-size from height to keep container from overflowing
						newHeight = iheight - top - fontAdjust;
						item.style.maxHeight = newHeight + "px";
						item.style.width= "auto";
					}else{
						if(height > iheight) {
							item.style.maxHeight = iheight + "px";
							item.style.width= "auto";
							itemRect = item.getBoundingClientRect();
							height = itemRect.height;
						}
						item.style.display = "block";
						item.style["WebkitColumnBreakBefore"] = "always";
						item.style["breakBefore"] = "column";

					}

					item.setAttribute('data-height', newHeight);

				}else{
					item.style.removeProperty('max-height');
					item.style.removeProperty('margin-top');
				}
			}

			var unloaded = function(){
				// item.removeEventListener('load', size); // crashes in IE
				renderer.off("renderer:resized", size);
				renderer.off("renderer:chapterUnload", this);
			};

			item.addEventListener('load', size, false);

			renderer.on("renderer:resized", size);

			renderer.on("renderer:chapterUnload", unloaded);

			size();

		});

		if(callback) callback();

}

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

//# sourceMappingURL=hooks.js.map