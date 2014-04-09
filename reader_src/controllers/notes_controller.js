EPUBJS.reader.NotesController = function() {
	var book = this.book;
	var reader = this;
	var $notesView = $("#notesView");
	var $notes = $("#notes");
	var $text = $("#note-text");
	var $anchor = $("#note-anchor");
	var annotations = reader.settings.annotations;
	var renderer = book.renderer;
	var popups = [];
	var epubcfi = new EPUBJS.EpubCFI();

	var show = function() {
		$notesView.show();
	};

	var hide = function() {
		$notesView.hide();
	}
	
	var insertAtPoint = function(e) {
		var range;
		var textNode;
		var offset;
		var doc = book.renderer.doc;
		var cfi;
		var annotation;
		
		// standard
		if (doc.caretPositionFromPoint) {
			range = doc.caretPositionFromPoint(e.clientX, e.clientY);
			textNode = range.offsetNode;
			offset = range.offset;
		// WebKit
		} else if (doc.caretRangeFromPoint) {
			range = doc.caretRangeFromPoint(e.clientX, e.clientY);
			textNode = range.startContainer;
			offset = range.startOffset;
		}

		if (textNode.nodeType !== 3) {
			for (var i=0; i < textNode.childNodes.length; i++) {
				if (textNode.childNodes[i].nodeType == 3) {
					textNode = textNode.childNodes[i];
					break;
				}
			}
			}
		
		// Find the end of the sentance
		offset = textNode.textContent.indexOf(".", offset);
		if(offset === -1){
			offset = textNode.length; // Last item
		} else {
			offset += 1; // After the period
		}
		
		cfi = epubcfi.generateCfiFromTextNode(textNode, offset, book.renderer.currentChapter.cfiBase);

		annotation = {
			annotatedAt: new Date(),
			anchor: cfi,
			body: $text.val()
		}

		// add to list
		reader.addNote(annotation);

		// attach
		addAnnotation(annotation);
		placeMarker(annotation);

		// clear
		$text.val('');
		$anchor.text("Attach");
		$text.prop("disabled", false);
		
		book.off("renderer:click", insertAtPoint);
		
	};
	
	var addAnnotation = function(annotation){
		var note = document.createElement("li");
		var link = document.createElement("a");
		
		note.innerHTML = annotation.body;
		// note.setAttribute("ref", annotation.anchor);
		link.innerHTML = " context &#187;";
		link.href = "#"+annotation.anchor;
		link.onclick = function(){
			book.gotoCfi(annotation.anchor);
			return false;
		};
		
		note.appendChild(link);
		$notes.append(note);

	};
	
	var placeMarker = function(annotation){
		var doc = book.renderer.doc;
		var marker = document.createElement("span");
		var mark = document.createElement("a");
		marker.classList.add("footnotesuperscript", "reader_generated");
		
		marker.style.verticalAlign = "super";
		marker.style.fontSize = ".75em";
		// marker.style.position = "relative";
		marker.style.lineHeight = "1em";

		// mark.style.display = "inline-block";
		mark.style.padding = "2px";
		mark.style.backgroundColor = "#fffa96";
		mark.style.borderRadius = "5px";
		mark.style.cursor = "pointer";
		
		marker.id = "note-"+EPUBJS.core.uuid();
		mark.innerHTML = annotations.indexOf(annotation) + 1 + "[Reader]";
		
		marker.appendChild(mark);
		epubcfi.addMarker(annotation.anchor, doc, marker);
		
		markerEvents(marker, annotation.body);
	}
	
	var markerEvents = function(item, txt){
		var id = item.id;
		
		var showPop = function(){
			var poppos,
					iheight = renderer.height,
					iwidth = renderer.width,
			 		tip,
					pop,
					maxHeight = 225,
					itemRect,
					left,
					top,
					pos;
	

			//-- create a popup with endnote inside of it
			if(!popups[id]) {
				popups[id] = document.createElement("div");
				popups[id].setAttribute("class", "popup");
				
				pop_content = document.createElement("div"); 
				
				popups[id].appendChild(pop_content);
				
				pop_content.innerHTML = txt;
				pop_content.setAttribute("class", "pop_content");
		
				renderer.render.document.body.appendChild(popups[id]);
				
				//-- TODO: will these leak memory? - Fred 
				popups[id].addEventListener("mouseover", onPop, false);
				popups[id].addEventListener("mouseout", offPop, false);
		
				//-- Add hide on page change
				renderer.on("renderer:locationChanged", hidePop, this);
				renderer.on("renderer:locationChanged", offPop, this);
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
		
		var onPop = function(){
			popups[id].classList.add("on");
		}
		
		var offPop = function(){
			popups[id].classList.remove("on");
		}
		
		var hidePop = function(){
			setTimeout(function(){
				popups[id].classList.remove("show");
			}, 100);	
		}
		
		var openSidebar = function(){
			reader.ReaderController.slideOut();
			show();
		};
		
		item.addEventListener("mouseover", showPop, false);
		item.addEventListener("mouseout", hidePop, false);
		item.addEventListener("click", openSidebar, false);
		
	}
	$anchor.on("click", function(e){
		
		$anchor.text("Cancel");
		$text.prop("disabled", "true");
		// listen for selection
		book.on("renderer:click", insertAtPoint);
				
	});
	
	annotations.forEach(function(note) {
		addAnnotation(note);
	});
	
	
	renderer.registerHook("beforeChapterDisplay", function(callback, renderer){
		var chapter = renderer.currentChapter;
		annotations.forEach(function(note) {
			var cfi = epubcfi.parse(note.anchor);
			if(cfi.spinePos === chapter.spinePos) {
				try {
					placeMarker(note);
				} catch(e) {
					console.log("anchoring failed", note.anchor);
				}
			}
		});
		callback();
	}, true);


	return {
		"show" : show,
		"hide" : hide
	};
};