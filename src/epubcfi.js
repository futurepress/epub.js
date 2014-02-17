EPUBJS.EpubCFI = function(cfiStr){
	if(cfiStr) return this.parse(cfiStr);
};

EPUBJS.EpubCFI.prototype.generateChapterComponent = function(_spineNodeIndex, _pos, id) {
	var pos = parseInt(_pos),
		spineNodeIndex = _spineNodeIndex + 1,
		cfi = '/'+spineNodeIndex+'/';

	cfi += (pos + 1) * 2;

	if(id) cfi += "[" + id + "]";

	//cfi += "!";

	return cfi;
};

EPUBJS.EpubCFI.prototype.generatePathComponent = function(steps) {
	var parts = [];

	steps.forEach(function(part){
		var segment = '';
		segment += (part.index + 1) * 2;

		if(part.id) {
			segment += "[" + part.id + "]";
		}

		parts.push(segment);
	});

	return parts.join('/');
};

EPUBJS.EpubCFI.prototype.generateCfiFromElement = function(element, chapter) {
	var steps = this.pathTo(element);
	var path = this.generatePathComponent(steps);
	if(!path.length) {
		// Start of Chapter
		return "epubcfi(" + chapter + ")";
	} else {
		// First Text Node
		return "epubcfi(" + chapter + "!" + path + "/1:0)";
	}
};

EPUBJS.EpubCFI.prototype.pathTo = function(node) {
	var stack = [],
			children;

	while(node && node.parentNode !== null && node.parentNode.nodeType != 9) {
		children = node.parentNode.children;

		stack.unshift({
			'id' : node.id,
			// 'classList' : node.classList,
			'tagName' : node.tagName,
			'index' : children ? Array.prototype.indexOf.call(children, node) : 0
		});
		
		node = node.parentNode;
	}
	
	return stack;
};

EPUBJS.EpubCFI.prototype.getChapterComponent = function(cfiStr) {

	var splitStr = cfiStr.split("!");

	return splitStr[0];
};

EPUBJS.EpubCFI.prototype.getPathComponent = function(cfiStr) {

	var splitStr = cfiStr.split("!");
	var pathComponent = splitStr[1] ? splitStr[1].split(":") : '';

	return pathComponent[0];
};

EPUBJS.EpubCFI.prototype.getCharecterOffsetComponent = function(cfiStr) {
	var splitStr = cfiStr.split(":");
	return splitStr[1] || '';
};


EPUBJS.EpubCFI.prototype.parse = function(cfiStr) {
	var cfi = {},
		chapSegment,
		chapterComponent,
		pathComponent,
		charecterOffsetComponent,
		assertion,
		chapId,
		path,
		end,
		text;

	cfi.str = cfiStr;

	if(cfiStr.indexOf("epubcfi(") === 0) {
		// Remove intial epubcfi( and ending )
		cfiStr = cfiStr.slice(8, cfiStr.length-1);
	}

	chapterComponent = this.getChapterComponent(cfiStr);
	pathComponent = this.getPathComponent(cfiStr) || '';
	charecterOffsetComponent = this.getCharecterOffsetComponent(cfiStr);
	// Make sure this is a valid cfi or return
	if(!chapterComponent) {
		return {spinePos: -1};
	}
	
	// Chapter segment is always the second one
	chapSegment = chapterComponent.split("/")[2] || '';
	if(!chapSegment) return {spinePos:-1};

	cfi.spinePos = (parseInt(chapSegment) / 2 - 1 ) || 0;

	chapId = chapSegment.match(/\[(.*)\]/);

	cfi.spineId = chapId ? chapId[1] : false;

	if(pathComponent.indexOf(',') != -1) {
		// Handle ranges -- not supported yet
		console.warn("CFI Ranges are not supported");
	}

	path = pathComponent.split('/');
	end = path[path.length-1];

	cfi.steps = [];

	path.forEach(function(part){
		var type, index, has_brackets, id;
		
		if(!part) return;
		//-- Check if this is a text node or element
		if(parseInt(part) % 2){
			type = "text";
			index = parseInt(part) - 1;
		} else {
			type = "element";
			index = parseInt(part) / 2 - 1;
			has_brackets = part.match(/\[(.*)\]/);
			if(has_brackets && has_brackets[1]){
				id = has_brackets[1];
			}
		}

		cfi.steps.push({
			"type" : type,
			'index' : index,
			'id' : id || false
		});
		
		assertion = charecterOffsetComponent.match(/\[(.*)\]/);
		if(assertion && assertion[1]){
			cfi.characterOffset = parseInt(charecterOffsetComponent.split('[')[0]);
			// We arent handling these assertions yet
			cfi.textLocationAssertion = assertion[1];
		} else {
			cfi.characterOffset = parseInt(charecterOffsetComponent);
		}
		
	});
	
	
	return cfi;
};

EPUBJS.EpubCFI.prototype.addMarker = function(cfi, _doc, _marker) {
	var doc = _doc || document;
	var marker = _marker || this.createMarker(doc);
	var parent;
	var lastStep;
	var text;
	var split;
	
	if(typeof cfi === 'string') {
		cfi = this.parse(cfi);
	}
	// Get the terminal step
	lastStep = cfi.steps[cfi.steps.length-1];

	// check spinePos
	if(cfi.spinePos === -1) {
		// Not a valid CFI
		return false;
	}
	
	// Find the CFI elements parent
	parent = this.findParent(cfi, doc);
	
	if(!parent) {
		// CFI didn't return an element
		// Maybe it isnt in the current chapter?
		return false;
	}
	
	if(lastStep && lastStep.type === "text") {
		text = parent.childNodes[lastStep.index];
		if(cfi.characterOffset){
			split = text.splitText();
			marker.classList.add("EPUBJS-CFI-SPLIT");
			parent.insertBefore(marker, split);
		} else {
			parent.insertBefore(marker, text);
		}
	} else {
		parent.insertBefore(marker, parent.firstChild);
	}
	
	return marker;
};

EPUBJS.EpubCFI.prototype.createMarker = function(_doc) {
	var doc = _doc || document;
	var element = doc.createElement('span');
	element.id = "EPUBJS-CFI-MARKER:"+ EPUBJS.core.uuid();
	element.classList.add("EPUBJS-CFI-MARKER");
	
	return element;
};

EPUBJS.EpubCFI.prototype.removeMarker = function(marker, _doc) {
	var doc = _doc || document;
	// var id = marker.id;

	// Remove only elements added as markers
	if(marker.classList.contains("EPUBJS-CFI-MARKER")){
		marker.parentElement.removeChild(marker);
	}

	// Cleanup textnodes
	if(marker.classList.contains("EPUBJS-CFI-SPLIT")){
		nextSib = marker.nextSibling;
		prevSib = marker.previousSibling;
		if(nextSib.nodeType === 3 && prevSib.nodeType === 3){
			prevSib.innerText += nextSib.innerText;
			marker.parentElement.removeChild(nextSib);
		}
		marker.parentElement.removeChild(marker);
	}

};

EPUBJS.EpubCFI.prototype.findParent = function(cfi, _doc) {
	var doc = _doc || document,
			element = doc.getElementsByTagName('html')[0],
			children = Array.prototype.slice.call(element.children),
			num, index, part, sections,
			text, textBegin, textEnd;

	if(typeof cfi === 'string') {
		cfi = this.parse(cfi);
	}
	
	sections = cfi.steps.slice(0); // Clone steps array
	if(!sections.length) {
		return doc.getElementsByTagName('body')[0];
	}

	while(sections && sections.length > 0) {
		part = sections.shift();
		// Find textNodes Parent
		if(part.type === "text") {
			text = element.childNodes[part.index];
			element = text.parentNode || element;
		// Find element by id if present
		} else if(part.id){
			element = doc.getElementById(part.id);
		// Find element in parent
		}else{
			element = children[part.index];
		}
		// Element can't be found
		if(typeof element === "undefined") {
			console.error("No Element For", part, cfi.str);
			return false;
		}
		// Get current element children and continue through steps
		children = Array.prototype.slice.call(element.children);
	}

	return element;
};

EPUBJS.EpubCFI.prototype.compare = function(cfiOne, cfiTwo) {
	if(typeof cfiOne === 'string') {
		cfiOne = new EPUBJS.EpubCFI(cfiOne);
	}
	if(typeof cfiTwo === 'string') {
		cfiTwo = new EPUBJS.EpubCFI(cfiTwo);
	}
	// Compare Spine Positions
	if(cfiOne.spinePos > cfiTwo.spinePos) {
		return 1;
	}
	if(cfiOne.spinePos < cfiTwo.spinePos) {
		return -1;
	}
	// Compare Each Step
	for (var i = 0; i < cfiOne.steps.length; i++) {
		if(!cfiTwo.steps[i]) {
			return 1;
		}
		if(cfiOne.steps[i].index > cfiTwo.steps[i].index) {
			return 1;
		}
		if(cfiOne.steps[i].index < cfiTwo.steps[i].index) {
			return -1;
		}
		// Otherwise continue checking
	}
	// Compare the charecter offset of the text node
	if(cfiOne.characterOffset > cfiTwo.characterOffset) {
		return 1;
	}
	if(cfiOne.characterOffset < cfiTwo.characterOffset) {
		return -1;
	}

	// CFI's are equal
	return 0;
};

EPUBJS.EpubCFI.prototype.generateCfiFromHref = function(href, book) {
	var uri = EPUBJS.core.uri(href);
	var path = uri.path;
	var fragment = uri.fragment;
	var spinePos = book.spineIndexByURL[path];
	var loaded;
	var deferred = new RSVP.defer();
	var epubcfi = new EPUBJS.EpubCFI();
	var spineItem;
	
	if(typeof spinePos !== "undefined"){
		spineItem = book.spine[spinePos];
		loaded = book.loadXml(spineItem.url);
		loaded.then(function(doc){
			var element = doc.getElementById(fragment);
			var cfi;
			cfi = epubcfi.generateCfiFromElement(element, spineItem.cfiBase);
			deferred.resolve(cfi);
		});
	}
	
	return deferred.promise;
};