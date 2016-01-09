// Based on - https://gist.github.com/kidoman/5625116
function Highlighter(className) {
  this.className = className || "annotator-hl";
};

Highlighter.prototype.add = function(range, className) {
  var wrappers = [];
  var wrapper;
  if (!range || !range.startContainer) {
    console.error("Not a valid Range");
  }

  if (className) {
    this.className = className;
  }

  this.doc = range.startContainer.ownerDocument;

  // Wrap all child text nodes
  this.getTextNodes(range, this.doc).forEach(function(node) {
    wrappers.push(this.wrapNode(node));
  }.bind(this));


  if (range.startContainer === range.endContainer) {
    wrappers.push(this.wrapRange(range));
  } else {
    // Wrap start and end elements
    wrappers.push(this.wrapPartial(range, range.startContainer, 'start'));
    wrappers.push(this.wrapPartial(range, range.endContainer, 'end'));
  }

  return wrappers;
};

Highlighter.prototype.remove = function(range) {
  // STUB
};

Highlighter.prototype.rejectEmpty = function(node) {
  if (node.data.match(/^\s+$/)) return NodeFilter.FILTER_SKIP;

  return NodeFilter.FILTER_ACCEPT;
}

Highlighter.prototype.getTextNodes = function(range, _doc) {
  var doc = _doc || document;
  var nodeIterator = doc.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, this.rejectEmpty);
  var mark = false;
  var nodes = [];
  var node;

  while(node = nodeIterator.nextNode()) {
    if (node == range.startContainer) {
      mark = true;
      continue
    } else if (node === range.endContainer) {
      break
    }

    if (mark) nodes.push(node);
  }

  return nodes

};

Highlighter.prototype.wrapRange = function(range) {
  var wrapper = this.wrapperNode();
  range.surroundContents(wrapper);
  return wrapper;
};

Highlighter.prototype.wrapNode = function(node) {
  var wrapper = this.wrapperNode();
  var range = this.doc.createRange();
  range.selectNodeContents(node);
  range.surroundContents(wrapper);
  return wrapper;
};

Highlighter.prototype.wrapPartial = function(range, node, position) {
  var startOffset = position === 'start' ? range.startOffset : 0;
  var endOffset = position === 'start' ? node.length : range.endOffset;
  var range = this.doc.createRange();
  var wrapper = this.wrapperNode();

  range.setStart(node, startOffset);
  range.setEnd(node, endOffset);

  range.surroundContents(wrapper);
  return wrapper;
};

Highlighter.prototype.wrapperNode = function(type) {
  if (type === undefined) type = 'span';
  var elem = document.createElement(type)
  elem.classList.add(this.className);
  return elem;
};

module.exports = Highlighter;
