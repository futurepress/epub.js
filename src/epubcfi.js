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
    return "epubcfi(" + chapter + "!/4/)";
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

EPUBJS.EpubCFI.prototype.getCharecterOffsetComponent = // backwards-compat
EPUBJS.EpubCFI.prototype.getCharacterOffsetComponent = function(cfiStr) {
  var splitStr = cfiStr.split(":");
  return splitStr[1] || '';
};


EPUBJS.EpubCFI.prototype.parse = function(cfiStr) {
  var cfi = {},
    chapSegment,
    chapterComponent,
    pathComponent,
    characterOffsetComponent,
    assertion,
    chapId,
    path,
    end,
    endInt,
    text,
    parseStep = function(part){
      var type, index, has_brackets, id;

      type = "element";
      index = parseInt(part) / 2 - 1;
      has_brackets = part.match(/\[(.*)\]/);
      if(has_brackets && has_brackets[1]){
        id = has_brackets[1];
      }

      return {
        "type" : type,
        'index' : index,
        'id' : id || false
      };
    };

  if(typeof cfiStr !== "string") {
    return {spinePos: -1};
  }

  cfi.str = cfiStr;

  if(cfiStr.indexOf("epubcfi(") === 0 && cfiStr[cfiStr.length-1] === ")") {
    // Remove intial epubcfi( and ending )
    cfiStr = cfiStr.slice(8, cfiStr.length-1);
  }

  chapterComponent = this.getChapterComponent(cfiStr);
  pathComponent = this.getPathComponent(cfiStr) || '';
  characterOffsetComponent = this.getCharacterOffsetComponent(cfiStr);
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
  end = path.pop();

  cfi.steps = [];

  path.forEach(function(part){
    var step;

    if(part) {
      step = parseStep(part);
      cfi.steps.push(step);
    }
  });

  //-- Check if END is a text node or element
  endInt = parseInt(end);
  if(!isNaN(endInt)) {

    if(endInt % 2 === 0) { // Even = is an element
      cfi.steps.push(parseStep(end));
    } else {
      cfi.steps.push({
        "type" : "text",
        'index' : (endInt - 1 ) / 2
      });
    }

  }

  assertion = characterOffsetComponent.match(/\[(.*)\]/);
  if(assertion && assertion[1]){
    cfi.characterOffset = parseInt(characterOffsetComponent.split('[')[0]);
    // We arent handling these assertions yet
    cfi.textLocationAssertion = assertion[1];
  } else {
    cfi.characterOffset = parseInt(characterOffsetComponent);
  }

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
      split = text.splitText(cfi.characterOffset);
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

  // Cleanup textnodes if they were split
  if(marker.classList.contains("EPUBJS-CFI-SPLIT")){
    nextSib = marker.nextSibling;
    prevSib = marker.previousSibling;
    if(nextSib &&
        prevSib &&
        nextSib.nodeType === 3 &&
        prevSib.nodeType === 3){

      prevSib.textContent += nextSib.textContent;
      marker.parentNode.removeChild(nextSib);
    }
    marker.parentNode.removeChild(marker);
  } else if(marker.classList.contains("EPUBJS-CFI-MARKER")) {
    // Remove only elements added as markers
    marker.parentNode.removeChild(marker);
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
    if(!element || typeof element === "undefined") {
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


  // Compare Each Step in the First item
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

  // All steps in First present in Second
  if(cfiOne.steps.length < cfiTwo.steps.length) {
    return -1;
  }

  // Compare the character offset of the text node
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

EPUBJS.EpubCFI.prototype.generateCfiFromTextNode = function(anchor, offset, base) {
  var parent = anchor.parentNode;
  var steps = this.pathTo(parent);
  var path = this.generatePathComponent(steps);
  var index = 1 + (2 * Array.prototype.indexOf.call(parent.childNodes, anchor));
  return "epubcfi(" + base + "!" + path + "/"+index+":"+(offset || 0)+")";
};

EPUBJS.EpubCFI.prototype.generateCfiFromRangeAnchor = function(range, base) {
  var anchor = range.anchorNode;
  var offset = range.anchorOffset;
  return this.generateCfiFromTextNode(anchor, offset, base);
};

EPUBJS.EpubCFI.prototype.generateCfiFromRange = function(range, base) {
  var start, startElement, startSteps, startPath, startOffset, startIndex;
  var end, endElement, endSteps, endPath, endOffset, endIndex;

  start = range.startContainer;

  if(start.nodeType === 3) { // text node
    startElement = start.parentNode;
    //startIndex = 1 + (2 * Array.prototype.indexOf.call(startElement.childNodes, start));
    startIndex = 1 + (2 * EPUBJS.core.indexOfTextNode(start));
    startSteps = this.pathTo(startElement);
  } else if(range.collapsed) {
    return this.generateCfiFromElement(start, base); // single element
  } else {
    startSteps = this.pathTo(start);
  }

  startPath = this.generatePathComponent(startSteps);
  startOffset = range.startOffset;

  if(!range.collapsed) {
    end = range.endContainer;

    if(end.nodeType === 3) { // text node
      endElement = end.parentNode;
      // endIndex = 1 + (2 * Array.prototype.indexOf.call(endElement.childNodes, end));
      endIndex = 1 + (2 * EPUBJS.core.indexOfTextNode(end));

      endSteps = this.pathTo(endElement);
    } else {
      endSteps = this.pathTo(end);
    }

    endPath = this.generatePathComponent(endSteps);
    endOffset = range.endOffset;

    // Remove steps present in startPath
    endPath = endPath.replace(startPath, '');

    if (endPath.length) {
      endPath = endPath + "/";
    }

    return "epubcfi(" + base + "!" + startPath + "/" + startIndex + ":" + startOffset + "," + endPath + endIndex + ":" + endOffset + ")";

  } else {
    return "epubcfi(" + base + "!" + startPath + "/"+ startIndex +":"+ startOffset +")";
  }
};

EPUBJS.EpubCFI.prototype.generateXpathFromSteps = function(steps) {
  var xpath = [".", "*"];

  steps.forEach(function(step){
    var position = step.index + 1;

    if(step.id){
      xpath.push("*[position()=" + position + " and @id='" + step.id + "']");
    } else if(step.type === "text") {
      xpath.push("text()[" + position + "]");
    } else {
      xpath.push("*[" + position + "]");
    }
  });

  return xpath.join("/");
};

EPUBJS.EpubCFI.prototype.generateQueryFromSteps = function(steps) {
  var query = ["html"];

  steps.forEach(function(step){
    var position = step.index + 1;

    if(step.id){
      query.push("#" + step.id);
    } else if(step.type === "text") {
      // unsupported in querySelector
      // query.push("text()[" + position + "]");
    } else {
      query.push("*:nth-child(" + position + ")");
    }
  });

  return query.join(">");
};


EPUBJS.EpubCFI.prototype.generateRangeFromCfi = function(cfi, _doc) {
  var doc = _doc || document;
  var range = doc.createRange();
  var lastStep;
  var xpath;
  var startContainer;
  var textLength;
  var query;
  var startContainerParent;

  if(typeof cfi === 'string') {
    cfi = this.parse(cfi);
  }

  // check spinePos
  if(cfi.spinePos === -1) {
    // Not a valid CFI
    return false;
  }

  // Get the terminal step
  lastStep = cfi.steps[cfi.steps.length-1];

  if(typeof document.evaluate != 'undefined') {
    xpath = this.generateXpathFromSteps(cfi.steps);
    startContainer = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  } else {
      // Get the query string
      query = this.generateQueryFromSteps(cfi.steps);
      // Find the containing element
      startContainerParent = doc.querySelector(query);
      // Find the text node within that element
      if(startContainerParent && lastStep.type == "text") {
        startContainer = startContainerParent.childNodes[lastStep.index];
      }
  }

  if(!startContainer) {
    return null;
  }

  if(startContainer && cfi.characterOffset >= 0) {
    textLength = startContainer.length;

    if(cfi.characterOffset < textLength) {
      range.setStart(startContainer, cfi.characterOffset);
      range.setEnd(startContainer, textLength );
    } else {
      console.debug("offset greater than length:", cfi.characterOffset, textLength);
      range.setStart(startContainer, textLength - 1 );
      range.setEnd(startContainer, textLength );
    }
  } else if(startContainer) {
    range.selectNode(startContainer);
  }
  // doc.defaultView.getSelection().addRange(range);
  return range;
};

EPUBJS.EpubCFI.prototype.isCfiString = function(target) {
  if(typeof target === "string" &&
    target.indexOf("epubcfi(") === 0) {
      return true;
  }

  return false;
};
