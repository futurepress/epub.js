EPUBJS.EpubCFI = function(cfiStr){
	if(cfiStr) return this.parse(cfiStr);
};

EPUBJS.EpubCFI.prototype.generateChapter = function(_spineNodeIndex, _pos, id) {
	
	var pos = parseInt(_pos),
		spineNodeIndex = _spineNodeIndex + 1,
		cfi = '/'+spineNodeIndex+'/';

	cfi += (pos + 1) * 2;

	if(id) cfi += "[" + id + "]";

	cfi += "!";

	return cfi;
};


EPUBJS.EpubCFI.prototype.generateFragment = function(element, chapter) {
	var path = this.pathTo(element),
			parts = [];

	if(chapter) parts.push(chapter);

	path.forEach(function(part){
		var segment = '';
		segment += (part.index + 1) * 2;

		if(part.id &&
			part.id.slice(0, 6) != "EPUBJS") { //-- ignore internal @EPUBJS ids

			segment += "[" + part.id + "]";
			 
		}
		
		parts.push(segment);
	});

	return parts.join('/');
};

EPUBJS.EpubCFI.prototype.pathTo = function(node) {
	var stack = [],
			children;

	while(node && node.parentNode !== null ) {
		children = node.parentNode.children;

		stack.unshift({
			'id' : node.id,
			// 'classList' : node.classList,
			'tagName' : node.tagName,
			'index' : children ? Array.prototype.indexOf.call(children, node) : 0
		});
		
		if(node.parentNode.nodeName != "html") {
			node = node.parentNode;
		} else {
			node = false;
		}
	}
	
	return stack;
};

EPUBJS.EpubCFI.prototype.getChapter = function(cfiStr) {

	var splitStr = cfiStr.split("!");

	return splitStr[0];
};

EPUBJS.EpubCFI.prototype.getFragment = function(cfiStr) {

	var splitStr = cfiStr.split("!");

	return splitStr[1];
};

EPUBJS.EpubCFI.prototype.getOffset = function(cfiStr) {

	var splitStr = cfiStr.split(":");

	return [splitStr[0], splitStr[1]];
};


EPUBJS.EpubCFI.prototype.parse = function(cfiStr) {
	var cfi = {},
		chapId,
		path,
		end,
		text;

	cfi.chapter = this.getChapter(cfiStr);

	cfi.fragment = this.getFragment(cfiStr);
	cfi.spinePos = (parseInt(cfi.chapter.split("/")[2]) / 2 - 1 ) || 0;

	chapId = cfi.chapter.match(/\[(.*)\]/);

	cfi.spineId = chapId ? chapId[1] : false;

	path = cfi.fragment.split('/');
	end = path[path.length-1];
	cfi.sections = [];

	//-- Check for Character Offset
	if(parseInt(end) % 2){
		text = this.getOffset();
		cfi.text = parseInt(text[0]);
		cfi.character = parseInt(text[1]);
		path.pop(); //-- remove from path to element
	}

	path.forEach(function(part){
		var index, has_id, id;
		
		if(!part) return;
		
		index = parseInt(part) / 2 - 1;
		has_id = part.match(/\[(.*)\]/);
			

		if(has_id && has_id[1]){
			id = has_id[1];
		}
		
		cfi.sections.push({
			'index' : index,
			'id' : id || false
		});
		
	});
	
	return cfi;
};


EPUBJS.EpubCFI.prototype.getElement = function(cfi, _doc) {
	var	doc = _doc || document,
		sections = cfi.sections,
		element = doc.getElementsByTagName('html')[0],
		children = Array.prototype.slice.call(element.children),
		num, index, part,
		has_id, id;

	// sections.shift(); //-- html

	while(sections.length > 0) {
	
		part = sections.shift();

		if(part.id){

			element = doc.getElementById(part.id);

		}else{
	
			element = children[part.index];

			if(!children) console.error("No Kids", element);
	
		}
	
	
		if(!element) console.error("No Element For", part);
		children = Array.prototype.slice.call(element.children);
	}
	
	return element;
};

//-- Todo: function to remove IDs to sort