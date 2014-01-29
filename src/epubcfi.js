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

		if(part.id && part.id.slice(0, 6) === "EPUBJS") {
			//-- ignore internal @EPUBJS ids for
			return;
		} else if(part.id) {
			segment += "[" + part.id + "]";
		}

		parts.push(segment);
	});

	return parts.join('/');
};

EPUBJS.EpubCFI.prototype.generateCfiFromElement = function(element, chapter) {
	var steps = this.pathTo(element);
	var path = this.generatePathComponent(steps);

	return "epubcfi(" + chapter + "!" + path + ")";
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

	if(cfiStr.indexOf("epubcfi(") === 0) {
		// Remove intial epubcfi( and ending )
		cfiStr = cfiStr.slice(8, cfiStr.length-1);
	}
	

	
	chapterComponent = this.getChapterComponent(cfiStr);
	pathComponent = this.getPathComponent(cfiStr);
	charecterOffsetComponent = this.getCharecterOffsetComponent(cfiStr);
	// Make sure this is a valid cfi or return
	if(!chapterComponent.length || !pathComponent.length) {
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


EPUBJS.EpubCFI.prototype.getElement = function(cfi, _doc) {
	var doc = _doc || document,
			element = doc.getElementsByTagName('html')[0],
			children = Array.prototype.slice.call(element.children),
			num, index, part, sections,
			text, textBegin, textEnd;

	if(typeof cfi === 'string') {
		cfi = this.parse(cfi);
	}
	
	sections = cfi.steps;
	
	while(sections && sections.length > 0) {
		part = sections.shift();
		
		// Wrap text elements in a span and return that new element
		if(part.type === "text") {
			text = element.childNodes[part.index];
			element = doc.createElement('span');
			element.id = "EPUBJS-CFI-MARKER:"+ EPUBJS.core.uuid();

			if(cfi.characterOffset) {
				textBegin = doc.createTextNode(text.textContent.slice(0, cfi.characterOffset));
				textEnd = doc.createTextNode(text.textContent.slice(cfi.characterOffset));
				text.parentNode.insertBefore(textEnd, text);
				text.parentNode.insertBefore(element, textEnd);
				text.parentNode.insertBefore(textBegin, element);
				text.parentNode.removeChild(text);
			} else {
				text.parentNode.insertBefore(element, text);
			}
		// sort cut to find element by id
		} else if(part.id){
			element = doc.getElementById(part.id);
		// find element in parent
		}else{
			if(!children) console.error("No Kids", element);
			element = children[part.index];
		}
	
	
		if(!element) console.error("No Element For", part, cfi);
		children = Array.prototype.slice.call(element.children);
	}

	return element;
};

EPUBJS.EpubCFI.prototype.compare = function(cfiOne, cfiTwo) {
	if(typeof cfiOne === 'string') {
		cfiOne = this.parse(cfiOne);
	}
	if(typeof cfiTwo === 'string') {
		cfiTwo = this.parse(cfiTwo);
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