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
    return new URI(cfiFrom, base, options);
  }

  // Find options
  for (var i = 1, length = arguments.length; i < length; i++) {
    if(typeof arguments[i] === 'object' && (arguments[i].ignoreClass)) {
      core.extend(this.options, arguments[i]);
    };
  }


  /* Object that includes:
    {
      spineNodeIndex: <int>
      index: <int>
      idref: <string:optional>
    }
  }
  */
  if(typeof base === 'string') {
    this.base = this.parseComponent(base);
  }

  type = this.checkType(cfiFrom);


  if(type === 'string') {
    this.str = cfiFrom;
    return core.extend(this, this.parse(cfiFrom));
  }
  else if(type === 'range') {
    this.fromRange(cfiFrom);
  } else if(type === 'node') {
    this.fromNode(cfiFrom);
  } else if(type === 'EpubCFI') {
    return cfiFrom;
  } else {
    throw new TypeError('not a valid argument for EpubCFI');
  }

  return this;
};

EpubCFI.prototype.checkType = function(cfi) {
  // is a cfi string, should be wrapped with "epubcfi()"
  if (typeof cfi === 'string' &&
      cfi.indexOf("epubcfi(") === 0 &&
      cfi[cfi.length-1] === ")") {
    return 'string';
  // Is a range object
  } else (typeof cfi === 'object' && cfi.startContainer && cfi.startOffset){
    return 'range'
  } else ((typeof cfi === 'object') && cfi.nodeType){ // || typeof cfi === 'function'
    return 'node'
  } else (typeof cfi === 'object' && cfi instanceof EpubCFI){
    return 'EpubCFI'
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
      start: null
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
    cfi.end = this.parseComponent(range[0]);
  }

  // Get spine node position
  // cfi.spineSegment = cfi.base.steps[1];

  // Chapter segment is always the second one
  cfi.spinePos = cfi.base.steps[2];

  return cfi;
};

EpubCFI.prototype.parseComponent = function(componentString){
  var component = {
    steps: [],
    terminal: null
  };

  var parts = componentString.split(':');
  var steps = parts[0].split('/');
  var terminal;

  if(parts.length > 1) {
    terminal = parts[1];
    component.terminal = this.parseTerminal(terminal);
  }

  component.steps = steps.map(function(step){
    return this.parseStep(part);
  }.bind(this));
};

EpubCFI.prototype.parseStep = function(stepString){
  var type, num, index, has_brackets, id;

  has_brackets = part.match(/\[(.*)\]/);
  if(has_brackets && has_brackets[1]){
    id = has_brackets[1];
  }

  //-- Check if step is a text node or element
  num = parseInt(stepString);

  if(isNaN(num)) {
    return;
  }

  if(num % 2 === 0) { // Even = is an element
    type = "element"
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

EpubCFI.prototype.parseTerminal = function(termialString){
  var characterOffset, textLocationAssertion;
  var assertion = charecterOffsetComponent.match(/\[(.*)\]/);

  if(assertion && assertion[1]){
    characterOffset = parseInt(charecterOffsetComponent.split('[')[0]);
    textLocationAssertion = assertion[1];
  } else {
    characterOffset = parseInt(charecterOffsetComponent);
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
  var segmentString = '';

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

  cfiString += this.joinSteps(this.base);

  cfiString += '!';
  cfiString += this.segmentString(this.path);

  // Add Range, if present
  if(this.start) {
    cfiString += ',';
    cfiString + this.segmentString(this.start);
  }

  if(this.end) {
    cfiString += ',';
    cfiString + this.segmentString(this.end);
  }

  cfiString += ")";

  return cfiString;
};