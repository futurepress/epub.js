/*
  XPath.js, an JavaScript implementation of XML Path Language (XPath) Version 1.0
  Copyright (C) 2008 Henrik Lindqvist <henrik.lindqvist@llamalab.com>
  
  This library is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published 
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
(function (w, d, f) {


function XPath (e) {
  this.e = e;
  this.i = 0;
  this.js = [ 'with(XPath){return ', '}' ];
  this.expression(1, 1) || this.error();
  //console.log(this.js.join(''));
  return new Function('n', 'nsr', this.js.join(''));
}
XPath.ie = /MSIE/.test(navigator.userAgent);
XPath.prototype = {
  match : function (rx, x) {
   var m, r;
    if (   !(m = rx.exec(this.e.substr(this.i))) 
        || (typeof x == 'number' && !(r = m[x]))
        || (typeof x == 'object' && !(r = x[m[1]]))) return false;
    this.m = m;
    this.i += m[0].length;
    return r || m;
  },
  error : function (m) {
    m = (m || 'Syntax error')+' at index '+this.i+': '+this.e.substr(this.i);
    var e;
    try { e = new XPathException(51, m) }
    catch (x) { e = new Error(m) }
    throw e;
  },
  step : function (l, r, s, n) {
    var i = 3;
    if (this.match(/^(\/\/?|\.\.?|@)\s*/, 1)) {
      switch (this.m[1]) {
        case '/':
          if (s) this.error();
          if (!n) return this.step(l, r, 1);
          this.js.splice(l, 0, ' axis(axes["','document-root','"],');
          i += this.nodeTypes.node.call(this, l + i);
          s = 1;
          break;
        case '//':
          if (s) this.error();
          this.js.splice(l, 0, ' axis(axes["','descendant-or-self','"],');
          i += this.nodeTypes.node.call(this, l + i);
          s = 1;
          break;
        case '.':
          if (!s && !n) this.error();
          this.js.splice(l, 0, ' axis(axes["','self','"],');
          i += this.nodeTypes.node.call(this, l + i);
          s = 0;
          break;
        case '..':
          if (!s && !n) this.error();
          this.js.splice(l, 0, ' axis(axes["','parent','"],');
          i += this.nodeTypes.node.call(this, l + i);
          s = 0;
          break;
        case '@':
          if (!s && !n) this.error();
          this.js.splice(l, 0, ' axis(axes["','attribute','"],');
          i += this.nodeTest(l + i, 'node') || this.error('Missing nodeTest after @');
          s = 0;
      }
    }
    else if (!s && !n) return s ? this.error() : 0;
    else if (this.match(/^([a-z]+(?:-[a-z]+)*)\s*::\s*/, XPath.axes)) {
      this.js.splice(l, 0, ' axis(axes["',this.m[1],'"],');
      i += this.nodeTest(l + i, (this.m[1]=='attribute')?'node':'element') || this.error('Missing nodeTest after ::');
      s = 0;
    }
    else if (i = this.nodeTest(l, 'element')) {
      this.js.splice(l, 0, ' axis(axes["','child','"],');
      i += 3;
      s = 0;
    }
    else return 0;
    for (var j; j = this.predicate(l + i); i += j);
    if (n) this.js.splice(r + i++, 0, n);
    i += this.step(l, r + i, s);
    this.js.splice(r + i++, 0, ')');
    return i;
  },
  expression : function (l, r, p) {
    var o, i = this.operand(l);
    while (o = this.match(/^(or|and|!?=|[<>]=?|[|*+-]|div|mod)\s*/, this.operators)) {
      if (p && p[0] >= o[0]) { 
        this.i -= this.m[0].length; 
        break;
      }
      this.js.splice(l, 0, o[1]);
      i++;
      this.js.splice(l + i++, 0, o[2]);
      i += this.expression(l + i, r, o) || this.error('Missing operand');
      this.js.splice(l + i++, 0, o[3]);
    }
    return i;
  },
  operand : function (l) {
    if (this.match(/^(-?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)|"[^"]*"|'[^']*')\s*/, 1)) {
      this.js.splice(l, 0, this.m[1]);
      return 1;
    }
    var fn;
    if (fn = this.match(/^([a-z]+(?:-[a-z]+)*)\s*\(\s*/, this.functions)) {
      var i = 1, j;
      this.js.splice(l, 0, fn[1]);
      do {
        if (j) this.js.splice(l + i++, 0, ',');
        i += (j = this.expression(l + i, l + i));
      } while (j && this.match(/^,\s*/));
      this.match(/^\)\s*/) || this.error('Missing (');
      if (fn[0]) {
        if (j) this.js.splice(l + i++, 0, ',');
        this.js.splice(l + i++, 0, fn[0]);
      }
      if (fn[2]) this.js.splice(l + i++, 0, fn[2]);
      else if (j > 1) this.error('Function has arguments');
      i += this.step(l, l + i);
      return i;
    }
    if (this.match(/^\(\s*/)) {
      var i = 1;
      this.js.splice(l, 0, '(');
      i += this.expression(l + i, l + i);
      this.match(/^\)\s*/) || this.error('Missing )');
      this.js.splice(l + i++, ')');
      return i;
    }
    return this.step(l, l, 0, '[n]');
  },
  operators : {
    '|'   : [1,'union(',',',')'],
    'or'  : [1,'bool(',')||bool(',')'],
    'and' : [2,'bool(',')&&bool(',')'],
    '='   : [3,'compare(eq,',',',')'],
    '!='  : [3,'compare(ne,',',',')'],
    '<'   : [4,'compare(lt,',',',')'],
    '>'   : [4,'compare(gt,',',',')'],
    '<='  : [4,'compare(le,',',',')'],
    '>='  : [4,'compare(ge,',',',')'],
    '+'   : [5,'number(',')+number(',')'],
    '-'   : [5,'number(',')-number(',')'],
    '*'   : [6,'number(',')*number(',')'],
    'div' : [6,'number(',')/number(',')'],
    'mod' : [6,'number(',')%number(',')']
  },
  functions : {
    // Node Set
    'last'          : [0,'nl.length'],
    'position'      : [0,'(i+1)'],
    'count'         : ['nl','(','.length||0)'],
    'id'            : ['n','id(',')'],
    'local-name'    : ['nl','localName(',')'],
    'namespace-uri' : ['nl','namespaceURI(',')'],
    'name'          : ['nl','qName(',')'],
    // String
    'string'           : ['n','string(',')'],
    'concat'           : [0,'concat(',')'],
    'starts-with'      : [0,'startsWith(',')'],
    'contains'         : [0,'contains(',')'],
    'substring-before' : [0,'substringBefore(',')'],
    'substring-after'  : [0,'substringAfter(',')'],
    'substring'        : [0,'substring(',')'],
    'string-length'    : ['n','string(',').length'],
    'normalize-space'  : ['n','normalizeSpace(',')'],
    'translate'        : [0,'translate(',')'],
    // Boolean
    'boolean' : [0,'bool(',')'],
    'not'     : [0,'!bool(',')'],
    'true'    : [0,'true '],
    'false'   : [0,'false '],
//    'lang'    : [],
    // Number
    'number'  : ['n','number(',')'],
    'floor'   : [0,'Math.floor(number(','))'],
    'ceiling' : [0,'Math.ceil(number(','))'],
    'round'   : [0,'Math.round(number(','))'],
    'sum'     : [0,'sum(',')']
  },
  predicate : function (l) {
    var i = 0;
    if (this.match(/^\[\s*/)) {
      if (i = this.expression(l, l)) {
        this.js.splice(l, 0, 'function(n,i,nl){with(XPath){var r=');
        i++;
        this.js.splice(l + i++, 0, ';return typeof r=="number"?Math.round(r)==i+1:bool(r)}},');
      }
      this.match(/^\]\s*/) || this.error('Missing ]');
    }
    return i;
  },
  nodeTest : function (l, t) {
    var fn;
    if (fn = this.match(/^([a-z]+(?:-[a-z]+)*)\(([^)]*)\)\s*/, this.nodeTypes))
      return fn.call(this, l, this.m[2]);
    if (this.match(/^\*\s*/))
      return this.nodeTypes[t].call(this, l);
    return this.nodeName(l)
  },
  nodeType : function (l, t) {
    this.js.splice(l, 0, 'function(n){return n.nodeType==',t,'},');
    return 3;
  },
  nodeTypes : {
    'node' : function (l) {
      this.js.splice(l, 0, 'null,');
      return 1;
    },
    'element' : function (l) {
      return this.nodeType(l, 1);
    },
    'attribute' : function (l) {
      return this.nodeType(l, 2);
    },
    'text' : function (l) { 
      return this.nodeType(l, 3);
    },
    'processing-instruction' : function (l, t) {
      if (!t) return this.nodeType(l, 7);
      this.js.splice(l, 0, 'function(n){return n.nodeType==7&&n.target==',t,'},');
      return 3;
    },
    'comment' : function (l) {
      return this.nodeType(l, 8);
    }
  },
  nodeName : function (l) {
    if (!this.match(/^([a-zA-Z_]+(?:-?[a-zA-Z0-9]+)*)(?::([a-zA-Z_]+(?:-?[a-zA-Z0-9]+)*))?\s*/, 1)) 
      return 0;
    if (this.m[2]) {
      this.js.splice(l,0,'function(n){if(!nsr)throw new XPathException(14);return "',
        this.m[2],'"==',XPath.ie?'n.baseName':'n.localName','&&nsr.lookupNamespaceURI("',
        this.m[1],'")==n.namespaceURI},');
      return 7;
    }
    else { 
      this.js.splice(l,0,'function(n){return/^',this.m[1],'$/i.test(n.nodeName)},');
      return 3;
    }
  }
};
XPath.order = function (l, r) {
  var x = l.compareDocumentPosition 
        ? l.compareDocumentPosition(r) 
        : XPath.compareDocumentPosition.call(l, r);
  if (x & 32) {
    l = Array.prototype.indexOf.call(l.attributes, l); 
    r = Array.prototype.indexOf.call(r.attributes, r);
    return (l < r) ? -1 : (l > r) ? 1 : 0;
  }
  if (!x) {
    if (l == r)
      return 0;
    if ((l = l.ownerElement) && (r = r.ownerElement))
      return XPath.order(l, r);
    return XPath.ie ? 1 : 0;
  }
  return 3 - ((x & 6) || 3);
};
// Runtime - Operand
XPath.compare = function (fn, l, r) {
  if (l instanceof Array && r instanceof Array) {
    var ls = l.map(this.string), rs = r.map(this.string);
    for (l = ls.length; --l >= 0;)
      for (r = rs.length; --r >= 0;)
        if (!fn(ls[l], rs[r])) return false;
    return true;
  }
  if (l instanceof Array) {
    for (var i = l.length; --i >= 0;) 
      if (!fn(this[typeof r](l[i]), r)) return false;
    return l.length > 0;
  }
  if (r instanceof Array) {
    for (var i = r.length; --i >= 0;) 
      if (!fn(l, this[typeof l](r[i]))) return false;
    return r.length > 0;
  }
  if (typeof l == 'boolean' || typeof r == 'boolean') 
    return fn(this.bool(l), this.bool(r));
  if (typeof l == 'number' || typeof r == 'number') 
    return fn(this.number(l), this.number(r));
  return fn(this.string(l), this.string(r));
};
XPath.eq = function (l, r) { return l == r }; 
XPath.ne = function (l, r) { return l != r }; 
XPath.lt = function (l, r) { return l <  r }; 
XPath.gt = function (l, r) { return l >  r }; 
XPath.le = function (l, r) { return l <= r }; 
XPath.ge = function (l, r) { return l >= r }; 
// Runtime - Node Set
XPath.id = function (s, n) {
  if (arguments.length == 1) n = s;
  var nl = [];
  for (var id = this.string(s).split(/\s+/), i = id.length; --i >= 0;)
    if (s = (n.ownerDocument || n).getElementById(id[i]))
      nl.push(s);
  return nl.sort(this.order);
};
XPath.localName = new Function ('nl',
  'return (nl.length&&nl[0].'+(XPath.ie?'baseName':'localName')+')||""'
);
XPath.namespaceURI = function (nl) {
  return (nl.length && nl[0].namespaceURI) || '';
};
XPath.qName = function (nl) {
  return (nl.length && nl[0].nodeName) || '';
};
XPath.union = function (a, b) {
  if (!a.length) return b;
  if (!b.length) return a;
  var nl = [], i = a.length - 1, j = b.length - 1;
  for (;;) {
    switch (this.order(a[i], b[j])) {
      case -1: nl.unshift(b[j--]); break;
      case  0: j--; // fallthru
      case  1: nl.unshift(a[i--]); break;
      default: throw new Error('Invalid order');
    }
    if (i < 0) {
      if (++j > 0) nl.unshift.apply(nl, nl.slice.call(b, 0, j));
      break;
    }
    if (j < 0) {
      if (++i > 0) nl.unshift.apply(nl, nl.slice.call(a, 0, i));
      break;
    }
  }
  return nl;
};
// Runtime - String
XPath.string = XPath.object = function (v) {
  if (v instanceof Array && typeof (v = v[0]) == 'undefined') return '';
  if (typeof v == 'string') return v;
  switch (v.nodeType) {
    case 1: case 9: case 11:
      return Array.prototype.map.call(v.childNodes, this.string, this).join('');
//      case 3: case 4: case 8: 
//        return v.data || '';
    default: 
      return v.nodeValue || '';
  }
  return String(v);
};
XPath.concat = function () {
  return Array.prototype.map.call(arguments, this.string, this).join('');
};
XPath.startsWith = function (a, b) {
  return this.string(a).substr(0, (b = this.string(b)).length) == b;
};
XPath.contains = function (a, b) {
  return this.string(a).indexOf(this.string(b)) != -1;
};
XPath.substringBefore = function (a, b) {
  a = this.string(a);
  b = a.indexOf(this.string(b));
  return b != -1 ? a.substr(0, b) : '';
};
XPath.substringAfter = function (a, b) {
  a = this.string(a); b = this.string(b);
  var i = a.indexOf(b);
  return i != -1 ? a.substr(i + b.length) : '';
};
XPath.substring = function (s, i, l) {
  s = this.string(s);
  i = Math.round(this.number(i)) - 1;
  return (arguments.length == 2)
       ? s.substr(i < 0 ? 0 : i)
       : s.substr(i < 0 ? 0 : i, Math.round(this.number(l)) - Math.max(0, -i));
};
XPath.normalizeSpace = function(s) {
  return this.string(s).replace(/^\s+/,'').replace(/\s+$/,'').replace(/\s+/g, ' ');
};
XPath.translate = function(a, b, c) {
  a = this.string(a); b = this.string(b); c = this.string(c);
  var o = [], l = a.length, i = 0, j, x;
  while (--l >= 0)
    if (   (j = b.indexOf(x = a.charAt(i++))) == -1
        || (x = c.charAt(j))) o.push(x);
  return o.join('');      
};
// Runtime - Boolean
XPath.bool = XPath['boolean'] = function (v) {
  if (typeof v == 'boolean') return v;
  if (v instanceof Array || typeof v == 'string') return v.length > 0; 
  return Boolean(v);
};
// Runtime - Number
XPath.number = function (v) {
  if (v instanceof Array && typeof (v = v[0]) == 'undefined') return 0;
  if (typeof v == 'number') return v;
  if (typeof v == 'boolean') return v ? 1 : 0;
  return Number(this.string(v));
};
XPath.sum = function (nl) {
  var r = 0, i = nl.length;
  while (--i >= 0) r += this.number(nl[i]);
  return r;
};
// Runtime - Axis
XPath.walk = function (n, nl) {
  var x, c = n.firstChild;
  while (c) {
    nl.push(c);
    if (x = c.firstChild) c = x;
    else for (x = c; !(c = x.nextSibling) && (x = x.parentNode) && (x != n););
  }
  return nl;
};
XPath.axes = {
  'ancestor' : function (n) {
    var nl = [];
    while (n = n.parentNode) nl.unshift(n);
    return nl;
  },
  'ancestor-or-self' : function (n) {
    var nl = [];
    do { nl.unshift(n) } while (n = n.parentNode);
    return nl;
  },
  'attribute' : new Function ('n',
    'var nl = [], a = n.attributes;if(a){attr:for(var x,i=a.length;--i>=0;){if(!(x=a[i]).specified){' +
    (XPath.ie?'switch(x.nodeName){case"selected":case"value":if(x.nodeValue)break;default:continue attr;}' : 'continue;') +
    '}nl.unshift(x);}}return nl;'
  ),
  'child' : function (n) {
    return n.childNodes || [];
  },
  'descendant' : function (n) {
    return this.walk(n, []);
  },
  'descendant-or-self' : function (n) { 
    return this.walk(n, [n]);
  },
  'following' : function (n) {
    var nl = [], x;
    while (n) {
      if (x = n.nextSibling) {
        nl.push(n = x);
        if (x = n.firstChild) nl.push(n = x);
      }
      else n = n.parentNode;
    }
    return nl;
  },
  'following-sibling' : function (n) {
    var nl = [];
    while (n = n.nextSibling) nl.push(n);
    return nl;
  },
  'parent' : function (n) {
    return n.parentNode ? [n.parentNode] : [];
  },
  'preceding' : function (n) {
    var nl = [], x, p = n.parentNode;
    while (n) {
      if (x = n.previousSibling) {
        for (n = x; x = n.lastChild; n = x);
        nl.unshift(n);
      }
      else if (n = n.parentNode) {
        if (n == p) p = p.parentNode; 
        else nl.unshift(n);
      }
    }
    return nl;
  },
  'preceding-sibling' : function (n) {
    var nl = [];
    while (n = n.previousSibling) nl.unshift(n);
    return nl;
  },
  'self' : function (n) {
    return [n];
  },
  'document-root' : function (n) {
    return [n.ownerDocument || n];
  }
};
XPath.axis = function (fn, nt/*, pr..., nl*/) {
  var r, x, al = arguments.length - 1, nl = arguments[al], ap = Array.prototype;
  for (var i = 0, j, l = nl.length; --l >= 0;) {
    x = fn.call(this, nl[i++]);
    if (nt && x.length) x = ap.filter.call(x, nt, this);
    for (j = 2; j < al && x.length; x = ap.filter.call(x, arguments[j++], this));
    r = r ? this.union(r, x) : x;
  }
  return r || [];
};
XPath.cache = {};

/**
 * Extends the native <code>Node</code> class with additional functionality.
 * <p>Not available in Internet Exporer which don&rsquo;t have a <code>Node</code> class.</p>
 * <p>See <a href="http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/core.html#ID-1950641247" target="_blank">http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/core.html#ID-1950641247</a></code>.</p>
 * @class Node
 * @author Henrik Lindqvist &lt;<a href="mailto:henrik.lindqvist@llamalab.com">henrik.lindqvist@llamalab.com</a>&gt;
 */
/**
 * Compares a node with this node with regard to their position in the document and according to the document order.
 * <p>When comparing two attribute nodes; <code>32</code> is returned if they have the 
 * same <code>ownerElement</code>, otherwise <code>0</code>. This is probably not standard, 
 * but it&rsquo;s what Firefox return, so we do the same.</p>
 * <pre>
 * DOCUMENT_POSITION_DISCONNECTED            = 1;
 * DOCUMENT_POSITION_PRECEDING               = 2;
 * DOCUMENT_POSITION_FOLLOWING               = 4;
 * DOCUMENT_POSITION_CONTAINS                = 8;
 * DOCUMENT_POSITION_IS_CONTAINED            = 16;
 * DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;
 * </pre>
 * <p>See <a href="http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/core.html#Node3-compareDocumentPosition" target="_blank">http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/core.html#Node3-compareDocumentPosition</a></code>.</p>
 * @function {number} compareDocumentPosition
 * @param {Node} n - node to compare against. 
 * @returns <code>0</code> for nodes are equals or a number with some of the above bits set.
 */
/**
 * Check if this node contains another node.
 * @function {boolean} contains
 * @param {Node} n - node to compare against. 
 * @returns <code>true</code> if <code>this</code> node cotains node <code>n</code>.
 */
function compareDocumentPosition (n) {
  if (this == n) return 0; // Same
  if (this.nodeType == 2 && n.nodeType == 2)
    return (this.ownerElement && this.ownerElement == n.ownerElement) ? 32 : 0; // IMPLEMENT_SPECIFIC
  var l = this.ownerElement || this, r = n.ownerElement || n;
  if (l.sourceIndex >= 0 && r.sourceIndex >= 0 && l.contains && r.contains) {
    return (
        ((l.contains(r)                 && 16) || (r.contains(l)                 && 8))
      | ((l.sourceIndex < r.sourceIndex &&  4) || (r.sourceIndex < l.sourceIndex && 2))
    ) || 1;
  }
  var la = l, ra = r, ld = 0, rd = 0;
  while (la = la.parentNode) ld++;
  while (ra = ra.parentNode) rd++;
  if (ld > rd) {
    while (ld-- != rd) l = l.parentNode;
    if (l == r) return 2|8;  // Preceding|Contains
  }
  else if (rd > ld) {
    while (rd-- != ld) r = r.parentNode; 
    if (r == l) return 4|16; // Following|Contained By
  }
  while ((la = l.parentNode) != (ra = r.parentNode)) 
    if (!(l = la) || !(r = ra)) return 1; // Disconnected
  while (l = l.nextSibling) 
    if (l == r) return 4; // Following
  return 2;  // Preceding
};
if (w.Node) {
  var np = w.Node.prototype;
  if (f || !np.compareDocumentPosition)
    np.compareDocumentPosition = compareDocumentPosition;
  if (f || !np.contains) {
  	np.contains = function (n) {
		  return Boolean(this.compareDocumentPosition(n) & 16);
	  };
  }
}
else 
  XPath.compareDocumentPosition = compareDocumentPosition;
/**
 * Exception throw when parser or expression fails. 
 * <p>See <code><a href="http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathException" target="_blank">http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathException</a></code>.</p>
 * @class XPathException
 * @author Henrik Lindqvist &lt;<a href="mailto:henrik.lindqvist@llamalab.com">henrik.lindqvist@llamalab.com</a>&gt;
 */
/**
 * Namespace error.
 * @property {static read number} NAMESPACE_ERR
 */
/**
 * Expression syntax error.
 * @property {static read number} INVALID_EXPRESSION_ERR
 */
/**
 * Result type error.
 * @property {static read number} TYPE_ERR
 */
/**
 * XPathException constructor.
 * @constructor XPathException
 * @param {number} c - error code.
 * @param {string} m - error message.
 * @see NAMESPACE_ERR
 * @see INVALID_EXPRESSION_ERR
 * @see TYPE_ERR
 */
/**
 * Exception name.
 * @property {read string} name
 */
/**
 * Exception code.
 * @property {read number} code
 * @see NAMESPACE_ERR
 * @see INVALID_EXPRESSION_ERR
 * @see TYPE_ERR
 */
/**
 * Exception message.
 * @property {read string} message
 */
if (f || !w.XPathException) {
  function XPathException (c, m) {
    this.name = 'XPathException';
    this.code = c;
    this.message = m;
  }
  var e = XPathException, p = new Error;
  p.toString = function () { 
    return this.name+':'+this.message;
  };
  e.prototype = p;
  e.NAMESPACE_ERR          = 14;
  e.INVALID_EXPRESSION_ERR = 51;
  e.TYPE_ERR               = 52;
  w.XPathException = e;
}
/**
 * Namespace resolver.
 * <p>See <code><a href="http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathNSResolver" target="_blank">http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathNSResolver</a></code>.</p>
 * @class XPathNSResolver
 * @see XPathEvaluator.createNSResolver
 * @author Henrik Lindqvist &lt;<a href="mailto:henrik.lindqvist@llamalab.com">henrik.lindqvist@llamalab.com</a>&gt;
 */
/**
 * Look up a namespace URI by it&rsquo;s prefix use in document.
 * @function {string} lookupNamespaceURI
 * @param {string} p - <code>xmlns:</code> prefix, empty string for <code>targetNamespace</code>. 
 * @returns associated namespace URI, or <code>undefined</code> if none is found.
 */
if (f || !w.XPathNSResolver) {  
  function XPathNSResolver (n) {
    this.ns = {};
    for (var m, a, i = n.attributes.length; --i >= 0;)
      if (m = /xmlns:(.+)/.exec((a = n.attributes[i]).nodeName))
        this.ns[m[1]] = a.nodeValue;
    this.ns[''] = n.getAttribute('targetNamespace');
  }
  XPathNSResolver.prototype = {
    lookupNamespaceURI : function (p) { 
      return this.ns[p || ''];
    }
  };
  w.XPathNSResolver = XPathNSResolver;
}
/**
 * A pre-parsed XPath expression.
 * <p>See <code><a href="http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathExpression" target="_blank">http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathExpression</a></code>.</p>
 * @class XPathExpression
 * @see XPathEvaluator.createExpression
 * @author Henrik Lindqvist &lt;<a href="mailto:henrik.lindqvist@llamalab.com">henrik.lindqvist@llamalab.com</a>&gt;
 */
/**
 * Evaluate this pre-parsed expression.
 * @function {XPathResult} evaluate
 * @param {Node} n - context node.
 * @param {number} rt - return type, see <code>{@link XPathResult}</code>.
 * @param {XPathResult} r - <code>{@link XPathResult}</code> that maybe reuse, or <code>null</code>.
 * @returns a <code>{@link XPathResult}</code>.
 */
if (f || !w.XPathExpression) {
  function XPathExpression (e, nsr) {
    this.fn = XPath.cache[e] || (XPath.cache[e] = new XPath(e));
    this.nsr = nsr;
  }
  XPathExpression.prototype = {
    evaluate : function (n, rt) {
      return new XPathResult(this.fn(n, this.nsr), rt);
    }
  };
  w.XPathExpression = XPathExpression;
}
/**
 * Container for XPath results.
 * <p>See <code><a href="http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathResult" target="_blank">http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathResult</a></code>.</p>
 * @class XPathResult
 * @see XPathEvaluator.evaluate
 * @see XPathExpression.evaluate
 * @author Henrik Lindqvist &lt;<a href="mailto:henrik.lindqvist@llamalab.com">henrik.lindqvist@llamalab.com</a>&gt;
 */
/**
 * Result will be accessed unconverted as the expression returned it.
 * @property {static read number} ANY_TYPE
 */
/**
 * Result will be accessed as a number.  
 * @property {static read number} NUMBER_TYPE
 * @see numberValue
 */
/**
 * Result will be accessed as a string.  
 * @property {static read number} STRING_TYPE
 * @see stringValue
 */
/**
 * Result will be accessed as boolean.  
 * @property {static read number} BOOLEAN_TYPE
 * @see booleanValue
 */
/**
 * Result will be accessed iteratively, node order insignificant.
 * <p>This is equal to <code>{@link ORDERED_NODE_ITERATOR_TYPE}</code> 
 * since the result is always document-ordered.</p>
 * @property {static read number} UNORDERED_NODE_ITERATOR_TYPE
 * @see iterateNext
 */
/**
 * Result will be accessed iteratively which must be document-ordered.  
 * @property {static read number} ORDERED_NODE_ITERATOR_TYPE
 * @see iterateNext
 */
/**
 * Result will be accessed as a snapshot list of nodes, node order insignificant.  
 * <p>This is equal to <code>{@link ORDERED_NODE_SNAPSHOT_TYPE}</code> 
 * since the result is always document-ordered.</p>
 * @property {static read number} UNORDERED_NODE_SNAPSHOT_TYPE
 * @see snapshotLength
 * @see snapshotItem
 */
/**
 * Result will be accessed as a snapshot list of nodes which must be document-ordered.  
 * @property {static read number} ORDERED_NODE_SNAPSHOT_TYPE
 * @see snapshotLength
 * @see snapshotItem
 */
/**
 * Result will be accessed as a single node value, any of the resulting nodes.
 * <p>This is equal to <code>{@link FIRST_ORDERED_NODE_TYPE}</code> 
 * since the result is always document-ordered.</p>
 * @property {static read number} ANY_UNORDERED_NODE_TYPE
 * @see singleNodeValue
 */
/**
 * Result will be accessed as a single node value, the first resulting node in document-ordered.
 * @property {static read number} FIRST_ORDERED_NODE_TYPE
 * @see singleNodeValue
 */
/**
 * Convert result to number.  
 * @property {static read number} NUMBER_TYPE
 */
/**
 * Convert result to number.  
 * @property {static read number} NUMBER_TYPE
 */
/**
 * Convert result to number.  
 * @property {static read number} NUMBER_TYPE
 */
/**
 * Convert result to number.  
 * @property {static read number} NUMBER_TYPE
 */
/**
 * Convert result to number.  
 * @property {static read number} NUMBER_TYPE
 */
/**
 * Resulting number.  
 * @property {read number} numberValue
 * @see NUMBER_TYPE
 */
/**
 * Resulting string.  
 * @property {read string} stringValue
 * @see STRING_TYPE
 */
/**
 * Resulting boolean.  
 * @property {read boolean} booleanValue
 * @see BOOLEAN_TYPE
 */
/**
 * Signifies that the iterator has become invalid.  
 * @property {read boolean} invalidIteratorState
 * @see UNORDERED_NODE_ITERATOR_TYPE
 * @see ORDERED_NODE_ITERATOR_TYPE
 */
/**
 * The number of nodes in the result snapshot. 
 * @property {read number} snapshotLength
 * @see UNORDERED_NODE_SNAPSHOT_TYPE
 * @see ORDERED_NODE_SNAPSHOT_TYPE
 */
/**
 * The value of this single node result, maybe <code>undefined</code>. 
 * @property {read object} singleNodeValue
 * @see ANY_UNORDERED_NODE_TYPE
 * @see FIRST_ORDERED_NODE_TYPE
 */
/**
 * Unconverted result as returned by our internal evaluator.
 * <p>This is a non-standard property which is set to the raw unconverted result from our 
 * expression evaluator. It&rsquo;s of the type <code>number</code>, <code>string</code>,
 * <code>boolean</code> or an <code>{@link Array}</code> with nodes depending on expression.
 * If you prefer to work with arrays instead of <code>{@link XPathResult.snapshotItem}</code>
 * You can check for this property and use it directly.</p>
 * <h3>Example</h3>
 * <pre>
 * function selectNodes (expr) {
 *   // Cross-browser safe way of selecting nodes and return an Array 
 *   var r = document.evaluate('//LI', document, null, 7, null);
 *   if (typeof r.value != 'undefined') return r.value;
 *   var a = [];
 *   for (var i = r.snapshotLength; --i >= 0; a[i] = r.snapshotItem(i));
 *   return a;
 * }
 * </pre>
 * @property {read object} value
 * @see ANY_TYPE
 */
/**
 * Iterates and returns the next node from the resuling nodes.
 * @function {object} iterateNext
 * @returns a <code>Node</code>, or <code>undefined</code> if there are no more nodes.
 */
/**
 * Returns the <code>index</code>th item in the snapshot collection.
 * @function {object} snapshotItem
 * @param {number} i - index of resuling node to return.
 * @returns the <code>Node</code>, at provided index or <code>undefined</code> if invalid.
 */
if (f || !w.XPathResult) {
  function XPathResult (r, rt) {
    if (rt == 0) {
      switch (typeof r) {
        default:        rt++;
        case 'boolean': rt++;
        case 'string':  rt++;
        case 'number':  rt++;
      }
    }
    this.resultType = rt;
    switch (rt) {
      case 1:
        this.numberValue = XPath.number(r);
        return;
      case 2: 
        this.stringValue = XPath.string(r);
        return;
      case 3: 
        this.booleanValue = XPath.bool(r); 
        return;
      case 4: 
      case 5:
        if (r instanceof Array) {
          this.value = r;
          this.index = 0;
          this.invalidIteratorState = false;
          return;
        }        
        break;
      case 6: 
      case 7:
        if (r instanceof Array) {
          this.value = r;
          this.snapshotLength = r.length;
          return;
        }
        break;
      case 8: 
      case 9: 
        if (r instanceof Array) {
          this.singleNodeValue = r[0];
          return;
        }
    }
    throw new XPathException(52);
  }
  var r = XPathResult;
  r.ANY_TYPE                      = 0;
  r.NUMBER_TYPE                   = 1;
  r.STRING_TYPE                   = 2;
  r.BOOLEAN_TYPE                  = 3;
  r.UNORDERED_NODE_ITERATOR_TYPE  = 4;
  r.ORDERED_NODE_ITERATOR_TYPE    = 5;
  r.UNORDERED_NODE_SNAPSHOT_TYPE  = 6;
  r.ORDERED_NODE_SNAPSHOT_TYPE    = 7;
  r.ANY_UNORDERED_NODE_TYPE       = 8;
  r.FIRST_ORDERED_NODE_TYPE       = 9;
  r.prototype = {
    iterateNext : function () {
      switch (this.resultType) {
        case 4: 
        case 5:
          return this.value[this.index++];
      }
      throw new XPathException(52);
    },
    snapshotItem : function (i) {
      switch (this.resultType) {
        case 6: 
        case 7:
          return this.value[i];
      }
      throw new XPathException(52);
    }
  };
  w.XPathResult = r;
}
/**
 * An interface with the XPath functionality.
 * <p><code>Document.prototype</code> and/or <code>document</code> will be 
 * extended using <code>{@link install}</code> to implements it&rsquo;s functions.</p> 
 * <p>See <code><a href="http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathEvaluator" target="_blank">http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathEvaluator</a></code>.</p>
 * @interface XPathEvaluator
 * @author Henrik Lindqvist &lt;<a href="mailto:henrik.lindqvist@llamalab.com">henrik.lindqvist@llamalab.com</a>&gt;
 */
/**
 * Non-standard function that extends the provided object with <code>{@link XPathEvaluator}</code> functions.
 * @function {static} install
 * @param {object} o - object (i.e document node) to extend.
 * @param {optional boolean} f - force replace the build-in function even if they exists.
 */
/**
 * Creates a pre-parsed expression.
 * @function {XPathExpression} createExpression
 * @param {string} e - expression.
 * @param {XPathNSResolver} nsr - namespace resolver to use when evaluating, or <code>null</code>.
 * @returns a new <code>{@link XPathExpression}</code>.
 */
/**
 * Create a namespace resolver by scanning a node for <code>xmlns:</code> attributes.
 * @function {XPathNSResolver} createNSResolver
 * @param {Node} n - an <code>Node</code> with defined namespace attributes (i.e the documentElement).
 * @returns a new <code>{@link XPathNSResolver}</code>.
 */
/**
 * Evaluate an expression.
 * <p>Same as <code>new XPathExpression(e, nsr).evaluate(n, rt)</code>.</p>
 * @function {XPathResult} evaluate
 * @param {string} e - XPath expression string.
 * @param {Node} n - context node.
 * @param {XPathNSResolver} nsr - namespace resolver to use when evaluating, or <code>null</code>.
 * @param {number} rt - return type, see <code>{@link XPathResult}</code>.
 * @param {XPathResult} r - <code>{@link XPathResult}</code> that maybe reuse, or <code>null</code>. Ignored.
 * @returns a <code>{@link XPathResult}</code>.
 */
if (f || !w.XPathEvaluator) {
  function XPathEvaluator () {}
  var e = XPathEvaluator;
  e.prototype = {
    createExpression : function (e, nsr) {
      return new XPathExpression(e, nsr);
    },
    createNSResolver : function (n) {
      return new XPathNSResolver(n);
    },
    evaluate : function (e, n, nsr, rt) {
      return new XPathExpression(e, nsr).evaluate(n, rt);
    }
  };
  e.install = function (o, f) {
    for (var k in XPathEvaluator.prototype) 
      if (f || !o[k]) o[k] = XPathEvaluator.prototype[k];
  };
  w.XPathEvaluator = e;
  if (w.Document)
    e.install(w.Document.prototype, f);
  else 
    e.install(document, f);
  w.XPath = XPath;
}

})(window, document, (/WebKit/.test(navigator.userAgent) || /Node\.js/.test(navigator.userAgent))); // force replace?
