var URI = require('urijs');
var core = require('./core');

/**
  EPUB CFI spec: http://www.idpf.org/epub/linking/cfi/epub-cfi.html

  Implements:
  - Character Offset: epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/2/1:3)
  - Simple Ranges : epubcfi(/6/4[chap01ref]!/4[body01]/10[para05],/2/1:1,/3:4)

  Does Not Implement:
  - Temporal Offset (~)
  - Spatial Offset (@)
  - Temporal-Spatial Offset (~ + @)
  - Text Location Assertion ([)
*/

function EpubCFI(cfiFrom, base, options){
  var type;
  this.options = {
    ignoreClass: 'annotator-hl'
  };

  this.str = '';

  this.base = {};
  this.spinePos = 0; // For compatibility

  this.range = false; // true || false;

  this.path = {};
  this.start = null;
  this.end = null;

  // Allow instantiation without the 'new' keyword
  if (!(this instanceof EpubCFI)) {
    return new EpubCFI(cfiFrom, base, options);
  }

  // Find options
  for (var i = 1, length = arguments.length; i < length; i++) {
    if(typeof arguments[i] === 'object' && (arguments[i].ignoreClass)) {
      core.extend(this.options, arguments[i]);
    }
  }


  /* TODO: maybe accept object that includes:
    {
      spineNodeIndex: <int>
      index: <int>
      idref: <string:optional>
    }
  }
  */
  if(typeof base === 'string') {
    this.base = this.parseComponent(base);
  } else if(typeof base === 'object' && base.steps) {
    this.base = base;
  }

  type = this.checkType(cfiFrom);


  if(type === 'string') {
    this.str = cfiFrom;
    return core.extend(this, this.parse(cfiFrom));
  } else if (type === 'range') {
    return core.extend(this, this.fromRange(cfiFrom, this.base));
  } else if (type === 'node') {
    return core.extend(this, this.fromNode(cfiFrom, this.base));
  } else if (type === 'EpubCFI') {
    return cfiFrom;
  } else if (!cfiFrom) {
    return this;
  } else {
    throw new TypeError('not a valid argument for EpubCFI');
  }

};

EpubCFI.prototype.checkType = function(cfi) {
  // is a cfi string, should be wrapped with "epubcfi()"
  if (typeof cfi === 'string' &&
      cfi.indexOf("epubcfi(") === 0 &&
      cfi[cfi.length-1] === ")") {
    return 'string';
  // Is a range object
} else if (typeof cfi === 'object' && cfi instanceof window.Range){
    return 'range';
  } else if (typeof cfi === 'object' && cfi instanceof window.Node ){ // || typeof cfi === 'function'
    return 'node';
  } else if (typeof cfi === 'object' && cfi instanceof EpubCFI){
    return 'EpubCFI';
  } else {
    return false;
  }
};

EpubCFI.prototype.parse = function(cfiStr) {
  var cfi = {
      spinePos: -1,
      range: false,
      base: {},
      path: {},
      start: null,
      end: null
    };
  var baseComponent, pathComponent, range;

  if(typeof cfiStr !== "string") {
    return {spinePos: -1};
  }

  if(cfiStr.indexOf("epubcfi(") === 0 && cfiStr[cfiStr.length-1] === ")") {
    // Remove intial epubcfi( and ending )
    cfiStr = cfiStr.slice(8, cfiStr.length-1);
  }

  baseComponent = this.getChapterComponent(cfiStr);

  // Make sure this is a valid cfi or return
  if(!baseComponent) {
    return {spinePos: -1};
  }

  cfi.base = this.parseComponent(baseComponent);

  pathComponent = this.getPathComponent(cfiStr);
  cfi.path = this.parseComponent(pathComponent);

  range = this.getRange(cfiStr);

  if(range) {
    cfi.range = true;
    cfi.start = this.parseComponent(range[0]);
    cfi.end = this.parseComponent(range[1]);
  }

  // Get spine node position
  // cfi.spineSegment = cfi.base.steps[1];

  // Chapter segment is always the second step
  cfi.spinePos = cfi.base.steps[1].index;

  return cfi;
};

EpubCFI.prototype.parseComponent = function(componentStr){
  var component = {
    steps: [],
    terminal: null
  };
  var parts = componentStr.split(':');
  var steps = parts[0].split('/');
  var terminal;

  if(parts.length > 1) {
    terminal = parts[1];
    component.terminal = this.parseTerminal(terminal);
  }

  if (steps[0] === '') {
    steps.shift(); // Ignore the first slash
  }

  component.steps = steps.map(function(step){
    return this.parseStep(step);
  }.bind(this));

  return component;
};

EpubCFI.prototype.parseStep = function(stepStr){
  var type, num, index, has_brackets, id;

  has_brackets = stepStr.match(/\[(.*)\]/);
  if(has_brackets && has_brackets[1]){
    id = has_brackets[1];
  }

  //-- Check if step is a text node or element
  num = parseInt(stepStr);

  if(isNaN(num)) {
    return;
  }

  if(num % 2 === 0) { // Even = is an element
    type = "element";
    index = num / 2 - 1;
  } else {
    type = "text";
    index = (num - 1 ) / 2;
  }

  return {
    "type" : type,
    'index' : index,
    'id' : id || null
  };
};

EpubCFI.prototype.parseTerminal = function(termialStr){
  var characterOffset, textLocationAssertion;
  var assertion = termialStr.match(/\[(.*)\]/);

  if(assertion && assertion[1]){
    characterOffset = parseInt(termialStr.split('[')[0]);
    textLocationAssertion = assertion[1];
  } else {
    characterOffset = parseInt(termialStr);
  }

  return {
    'offset': characterOffset,
    'assertion': textLocationAssertion
  };

};

EpubCFI.prototype.getChapterComponent = function(cfiStr) {

  var indirection = cfiStr.split("!");

  return indirection[0];
};

EpubCFI.prototype.getPathComponent = function(cfiStr) {

  var indirection = cfiStr.split("!");

  if(indirection[1]) {
    ranges = indirection[1].split(',');
    return ranges[0];
  }

};

EpubCFI.prototype.getRange = function(cfiStr) {

  var ranges = cfiStr.split(",");

  if(ranges.length === 3){
    return [
      ranges[1],
      ranges[2]
    ];
  }

  return false;
};

EpubCFI.prototype.getCharecterOffsetComponent = function(cfiStr) {
  var splitStr = cfiStr.split(":");
  return splitStr[1] || '';
};

EpubCFI.prototype.joinSteps = function(steps) {
  return steps.map(function(part){
    var segment = '';

    if(part.type === 'element') {
      segment += (part.index + 1) * 2;
    }

    if(part.type === 'text') {
      segment += 1 + (2 * part.index); // TODO: double check that this is odd
    }

    if(part.id) {
      segment += "[" + part.id + "]";
    }

    return segment;

  }).join('/');

};

EpubCFI.prototype.segmentString = function(segment) {
  var segmentString = '/';

  segmentString += this.joinSteps(segment.steps);

  if(segment.terminal && segment.terminal.offset){
    segmentString += ':' + segment.terminal.offset;
  }

  if(segment.terminal && segment.terminal.assertion){
    segmentString += '[' + segment.terminal.assertion + ']';
  }

  return segmentString;
};

EpubCFI.prototype.toString = function() {
  var cfiString = 'epubcfi(';

  cfiString += this.segmentString(this.base);

  cfiString += '!';
  cfiString += this.segmentString(this.path);

  // Add Range, if present
  if(this.start) {
    cfiString += ',';
    cfiString += this.segmentString(this.start);
  }

  if(this.end) {
    cfiString += ',';
    cfiString += this.segmentString(this.end);
  }

  cfiString += ")";

  return cfiString;
};

EpubCFI.prototype.compare = function(cfiOne, cfiTwo) {
  if(typeof cfiOne === 'string') {
    cfiOne = new EpubCFI(cfiOne);
  }
  if(typeof cfiTwo === 'string') {
    cfiTwo = new EpubCFI(cfiTwo);
  }
  // Compare Spine Positions
  if(cfiOne.spinePos > cfiTwo.spinePos) {
    return 1;
  }
  if(cfiOne.spinePos < cfiTwo.spinePos) {
    return -1;
  }


  // Compare Each Step in the First item
  for (var i = 0; i < cfiOne.path.steps.length; i++) {
    if(!cfiTwo.path.steps[i]) {
      return 1;
    }
    if(cfiOne.path.steps[i].index > cfiTwo.path.steps[i].index) {
      return 1;
    }
    if(cfiOne.path.steps[i].index < cfiTwo.path.steps[i].index) {
      return -1;
    }
    // Otherwise continue checking
  }

  // All steps in First present in Second
  if(cfiOne.path.steps.length < cfiTwo.path.steps.length) {
    return -1;
  }

  // Compare the charecter offset of the text node
  if(cfiOne.path.terminal.offset > cfiTwo.path.terminal.offset) {
    return 1;
  }
  if(cfiOne.path.terminal.offset < cfiTwo.path.terminal.offset) {
    return -1;
  }

  // TODO: compare ranges

  // CFI's are equal
  return 0;
};

EpubCFI.prototype.pathTo = function(node, offset) {
  var segment = {
    steps: [],
    terminal: {
      offset: null,
      assertion: null
    }
  };
  var currentNode = node;
  var filteredNode, nodeType;

  while(currentNode && currentNode.parentNode &&
        currentNode.parentNode.nodeType != Node.DOCUMENT_NODE) {

    filteredNode = this.filter(currentNode, this.options.ignoreClass);
    nodeType = (filteredNode.nodeType === Node.TEXT_NODE) ? 'text' : 'element';

    segment.steps.unshift({
      'id' : this.filterId(filteredNode, this.options.ignoreClass),
      'tagName' : filteredNode.tagName,
      'type' : nodeType,
      'index' : this.position(currentNode, this.options.ignoreClass) //Array.prototype.indexOf.call(children, currentNode)
    });
    // console.log(segment);

    currentNode = filteredNode.parentNode;

  }

  if (offset) {

    segment.terminal.offset = offset;

    // Make sure we are getting to a textNode if there is an offset
    if(segment.steps[segment.steps.length-1].type != "text") {
      segment.steps.push({
        'type' : "text",
        'index' : 0
      });
    }

  }


  return segment;
}

EpubCFI.prototype.equalStep = function(stepA, stepB) {
  if (!stepA || !stepB) {
    return false;
  }

  if(stepA.index === stepB.index &&
     stepA.id === stepB.id &&
     stepA.type === stepB.type) {
    return true;
  }

  return false;
};
EpubCFI.prototype.fromRange = function(range, base) {
  var cfi = {
      range: false,
      base: {},
      path: {},
      start: null,
      end: null
    };

  var start = range.startContainer;
  var end = range.endContainer;

  var startOffset = range.startOffset;
  var endOffset = range.endOffset;

  if (typeof base === 'string') {
    cfi.base = this.parseComponent(base);
    cfi.spinePos = cfi.base.steps[1].index;
  } else if (typeof base === 'object') {
    cfi.base = base;
  }

  if (range.collapsed) {
    startOffset = this.patch(start, startOffset, this.options.ignoreClass);
    cfi.path = this.pathTo(start, startOffset);
  } else {
    cfi.range = true;

    startOffset = this.patch(start, startOffset, this.options.ignoreClass);
    cfi.start = this.pathTo(start, startOffset);

    endOffset = this.patch(end, endOffset, this.options.ignoreClass);
    cfi.end = this.pathTo(end, endOffset);

    // Create a new empty path
    cfi.path = {
      steps: [],
      terminal: null
    };

    // Push steps that are shared between start and end to the common path
    var len = cfi.start.steps.length;
    var i;

    for (i = 0; i < len; i++) {
      if (this.equalStep(cfi.start.steps[i], cfi.end.steps[i])) {
        if(i == len-1) {
          // Last step is equal, check terminals
          if(cfi.start.terminal === cfi.end.terminal) {
            // CFI's are equal
            cfi.path.steps.push(cfi.start.steps[i]);
            // Not a range
            cfi.range = false;
          }
        } else {
          cfi.path.steps.push(cfi.start.steps[i]);
        }

      } else {
        break;
      }
    };

    cfi.start.steps = cfi.start.steps.slice(cfi.path.steps.length);
    cfi.end.steps = cfi.end.steps.slice(cfi.path.steps.length);
  }

  return cfi;
}

EpubCFI.prototype.fromNode = function(anchor, base) {
  var cfi = {
      range: false,
      base: {},
      path: {},
      start: null,
      end: null
    };

  if (typeof base === 'string') {
    cfi.base = this.parseComponent(base);
    cfi.spinePos = cfi.base.steps[1].index;
  } else if (typeof base === 'object') {
    cfi.base = base;
  }

  cfi.path = this.pathTo(anchor);

  return cfi;
};


EpubCFI.prototype.filter = function(anchor, ignoreClass) {
  var needsIgnoring;
  var sibling;

  if (anchor.nodeType === Node.TEXT_NODE) {
    needsIgnoring = anchor.parentNode.classList.contains(ignoreClass);
    sibling = anchor.parentNode.previousSibling;
  } else {
    needsIgnoring = anchor.classList.contains(ignoreClass);
    sibling = anchor.previousSibling;
  }

  if (needsIgnoring) {

    if (sibling && sibling.nodeType === Node.TEXT_NODE) {
      // If the previous sibling is a text node, join the nodes
      return sibling;
    } else if (anchor.nodeType === Node.TEXT_NODE) {
      return anchor.parentNode.childNodes[0];
    } else {
      // Otherwise just ignore the node by getting the path to its parent
      return anchor.parentNode;
    }

  } else {
    return anchor;
  }

};

EpubCFI.prototype.filterId = function(anchor, ignoreClass) {
  var needsIgnoring;

  if (anchor.nodeType === Node.ELEMENT_NODE) {
    needsIgnoring = anchor.classList.contains(ignoreClass);
    if(!needsIgnoring) {
      return anchor.id;
    }
  }
};

EpubCFI.prototype.patch = function(anchor, offset, ignoreClass) {
  var needsIgnoring;
  var sibling;

  if (anchor.nodeType === Node.TEXT_NODE) {
    needsIgnoring = anchor.parentNode.classList.contains(ignoreClass);
    sibling = anchor.parentNode.previousSibling;
  } else {
    needsIgnoring = anchor.classList.contains(ignoreClass);
    sibling = anchor.previousSibling;
  }

  if (needsIgnoring) {

    if (sibling && sibling.nodeType === Node.TEXT_NODE) {
      // If the previous sibling is a text node, join the nodes
      return sibling.textContent.length + offset;
    } else {
      // Otherwise just ignore the node
      return offset;
    }

  } else {
    return offset;
  }

};

EpubCFI.prototype.position = function(anchor, ignoreClass) {
  var needsIgnoring;
  var sibling;
  var indexed = -1;
  var ignored;
  var e = [];

  if (anchor.nodeType === Node.TEXT_NODE) {

    ignored = Array.prototype.slice.call(anchor.parentNode.querySelectorAll("."+ignoreClass));
    e = ignored.map(function(item) {
      return Array.prototype.indexOf.call(anchor.parentNode.childNodes, item)
    });

    if (ignored.length) {
      needsIgnoring = true;
    }

    sibling = anchor.parentNode.previousSibling;
    children = anchor.parentNode.childNodes;
  } else {
    needsIgnoring = anchor.classList.contains(ignoreClass);
    sibling = anchor.previousSibling;
    children = anchor.parentNode.children;
  }


  indexed = Array.prototype.indexOf.call(children, anchor);

  e.forEach(function(item) {
    if(item < indexed) {
      indexed--;
    }
  });

  return indexed;

};

EpubCFI.prototype.stepsToXpath = function(steps) {
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


/*

To get the last step if needed:

// Get the terminal step
lastStep = steps[steps.length-1];
// Get the query string
query = this.stepsToQuery(steps);
// Find the containing element
startContainerParent = doc.querySelector(query);
// Find the text node within that element
if(startContainerParent && lastStep.type == "text") {
  container = startContainerParent.childNodes[lastStep.index];
}
*/
EpubCFI.prototype.stepsToQuerySelector = function(steps) {
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

EpubCFI.prototype.walkToNode = function(steps, _doc) {
  var doc = _doc || document;
  var container = doc.documentElement;
  var step;
  var len = steps.length;
  var i;

  for (i = 0; i < len; i++) {
    step = steps[i];

    if(step.type === "element") {
      container = container.children[step.index];
    } else if(step.type === "text"){
      container = container.childNodes[step.index];
    }

  };

  return container;
};

EpubCFI.prototype.findNode = function(steps, _doc) {
  var doc = _doc || document;
  var container;
  var xpath;
  // Check if we might need to need to fix missed results
  var needsIgnoring = doc.querySelector('.' + this.options.ignoreClass)

  if(!needsIgnoring && typeof document.evaluate != 'undefined') {

    xpath = this.stepsToXpath(steps);
    container = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  } else {

    container = this.walkToNode(steps, doc);

  }


  return container;
};

EpubCFI.prototype.fixMiss = function(steps, offset, _doc) {
  var container = this.findNode(steps.slice(0,-1), _doc);
  var children = container.childNodes;
  var i;
  var child;
  var len;

  for (i = 0; i < children.length; i++) {
    child = children[i];
    len = child.textContent.length;
    if(offset > len) {
      offset = offset - len;
    } else {
      if (child.nodeType === Node.ELEMENT_NODE) {
        container = child.childNodes[0];
      } else {
        container = child;
      }
      break;
    }
  }

  return {
    container: container,
    offset: offset
  };

};

EpubCFI.prototype.toRange = function(_doc, _cfi) {
  var doc = _doc || document;
  var range = doc.createRange();
  var start, end, startContainer, endContainer;
  var cfi = _cfi || this;
  var startSteps, endSteps;
  var missed;

    if (cfi.range) {
      start = cfi.start;
      startSteps = cfi.path.steps.concat(start.steps);
      startContainer = this.findNode(startSteps, _doc);

      end = cfi.end;
      endSteps = cfi.path.steps.concat(end.steps);
      endContainer = this.findNode(endSteps, _doc);
    } else {
      start = cfi.path;
      startSteps = cfi.path.steps;
      startContainer = this.findNode(cfi.path.steps, _doc);
    }



      if(startContainer) {
        try {

          if(start.terminal.offset) {
            range.setStart(startContainer, start.terminal.offset);
          } else {
            range.setStart(startContainer, 0);
          }

        } catch (e) {
          missed = this.fixMiss(startSteps, start.terminal.offset, doc);
          range.setStart(missed.container, missed.offset);
        }
      }



    if (endContainer) {
      try {

        if(end.terminal.offset) {
          range.setEnd(endContainer, end.terminal.offset);
        } else {
          range.setEnd(endContainer, 0);
        }

      } catch (e) {
        missed = this.fixMiss(endSteps, end.terminal.offset, doc);
        range.setEnd(missed.container, missed.offset);
      }
    }


  // doc.defaultView.getSelection().addRange(range);
  return range;
};

module.exports = EpubCFI;
