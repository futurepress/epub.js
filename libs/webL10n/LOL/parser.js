/*  Copyright (c) 2012 Mozilla.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to
  * deal in the Software without restriction, including without limitation the
  * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
  * sell copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
  * IN THE SOFTWARE.
  */

'use strict';
function parseL20n(text, astExpressions) {
  var parsedText = '';

  // utilities
  function next(re) {
    var match = re.exec(text);
    if (!match || !match.length)
      return null;
    // the RegExp (re) should always start with /^\s* -- except for comments
    assert(match.index == 0 || match[0] == '*\/');
    var index = match.index + match[0].length;
    parsedText += text.substring(0, index);
    text = text.substr(index);
    return match[0].replace(/^\s*/, '');
  }
  function assert(test) {
    if (test)
      return;
    // context: one or two lines around the error (###)
    var lines = parsedText.split('\n');
    var lineNr = lines.length;
    var context = lines[lineNr - 1];
    if (lineNr > 1)
      context = lines[lineNr - 2] + '\n' + context;
    lines = text.split('\n');
    context += ' ### ' + lines[0];
    if (lines.length > 1)
      context += '\n' + lines[1];
    // throw parsing exception
    throw 'line ' + (lineNr + 1) + ': l10n parsing error\n  ' +
      context.replace(/\n/g, '\n  ');
  }
  function check(re) {
    var rv = next(re);
    assert(rv !== null);
    return rv;
  }

  // tokens
  var reIdentifier = /^\s*[a-zA-Z]\w*/;
  var reNumber = /^\s*[0-9]\w*/;
  var reColonSep = /^\s*:\s*/;
  var reCommaSep = /^\s*,\s*/;
  var reExprBegin = /^\s*[\(\[\{]/;
  var reValueBegin = /^\s*['"\[\{]/;
  var reStringDelim = /^\s*('''|"""|['"])/;

  // JSON-like values: string | array | list
  var StrictCommaSep = true;
  function readValue() {
    function evalString(str) {
      return str.replace(/\\\\/g, '\\')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\\t/g, '\t')
                .replace(/\\b/g, '\b')
                .replace(/\\f/g, '\f')
                .replace(/\\{/g, '{')
                .replace(/\\}/g, '}')
                .replace(/\\"/g, '"')
                .replace(/\\'/g, "'");
    }
    function getString() {
      // escape sequences: \, {{...}}
      var str = '';
      var len = text.length;
      var escapeMode = false;
      var delimFound = false;
      var delim = check(reStringDelim);
      var checkDelim = (delim.length == 1) ?
        function(pos) {
          return (text[pos] == delim);
        } : function(pos) {
          return (pos > 2) && (text.substring(pos - 2, pos + 1) == delim);
        };

      var i = 0;
      while (!delimFound && (i < len)) {
        if (escapeMode)
          escapeMode = false;
        else {
          delimFound = checkDelim(i);
          escapeMode = (text[i] == '\\');
          if ((i > 0) && (text[i] == '{') && (text[i - 1] == '{'))
            i = text.indexOf('}}', i);
        }
        i++;
      }
      if (delimFound) {
        parsedText += text.substring(0, i);
        str = evalString(text.substring(0, i - delim.length));
        text = text.substr(i);
      }
      return str;
    }
    function getSplitString() {
      // escape sequences: \, {{...}}
      var str = '';
      var len = text.length;
      var escapeMode = false;
      var delimFound = false;
      var delim = check(reStringDelim);
      var checkDelim = (delim.length == 1) ?
        function(pos) {
          return (text[pos] == delim);
        } : function(pos) {
          return (pos > 2) && (text.substring(pos - 2, pos + 1) == delim);
        };

      // same as readString() but splits the string when {{extends}} are found
      var i = 0;
      var last = 0;
      var output = [];
      while (!delimFound && (i < len)) {
        if (escapeMode)
          escapeMode = false;
        else {
          delimFound = checkDelim(i);
          escapeMode = (text[i] == '\\');
          if ((i > 0) && (text[i] == '{') && (text[i - 1] == '{')) {
            if (i > 1)
              output.push(evalString(text.substring(last, i - 1)));
            last = i - 1;
            i = text.indexOf('}}', last) + 2;
            output.push(evalString(text.substring(last, i)));
            last = i--;
          }
        }
        i++;
      }
      if (delimFound) {
        parsedText += text.substring(0, i);
        str = evalString(text.substring(last, i - delim.length));
        if (str.length)
          output.push(str);
        text = text.substr(i);
      } // else => trow exception
      return last ? output : str;
    }
    function getArray() {
      var reArrayEnd = /^\s*\]/;
      check(/^\s*\[/);
      if (next(reArrayEnd))
        return [];
      var table = [];
      if (StrictCommaSep) {
        do {
          table.push(readValue());
        } while (next(reCommaSep));
      } else {
        var value = readValue();
        while (value) {
          table.push(value);
          value = readValue();
          next(reCommaSep);
        }
      }
      check(reArrayEnd);
      return table;
    }
    function getList() {
      var reListEnd = /^\s*\}/;
      check(/^\s*\{/);
      if (next(reListEnd))
        return {};
      var list = {};
      if (StrictCommaSep) {
        do {
          var id = next(reIdentifier);
          check(reColonSep);
          list[id] = readValue();
        } while (next(reCommaSep));
      } else {
        var id = next(reIdentifier);
        while (id) {
          check(reColonSep);
          list[id] = readValue();
          next(reCommaSep);
          id = next(reIdentifier);
        }
      }
      check(reListEnd);
      return list;
    }

    // return a string|array|list according to the first token
    var match = reValueBegin.exec(text);
    if (!match || !match.length)
      return null;
    var token = match[0];
    switch (token[token.length - 1]) {
      case '"':
      case "'":
        return getString();
        //return getSplitString();
        break;
      case '[':
        return getArray();
        break;
      case '{':
        return getList();
        break;
    }
    return null;
  }

  // C-style logical expressions
  function readExpression() {
    // member parsing
    function getPrimary() { // (expression) | number | value | ID
      if (next(/^\s*\(/)) {           // (expression)
        var expr = getExpression();
        check(/^\s*\)/);
        return { expression: expr };
      }
      var num = next(reNumber);       // number
      if (num)
        return parseInt(num, 10);
      if (reValueBegin.test(text))    // value
        return readValue();
      var id = next(reIdentifier);    // ID
      if (id)
        return id;
      return null;
    }
    function getAttr(primary) { // primary[.expression] | primary..ID
      var attr;
      if (next(/^\.\./))        // primary..ID
        attr = check(reIdentifier);
      else if (next(/^\[\./)) { // primary[.expression]
        attr = getExpression();
        check(/^\s*\]/);
      }
      return attr ? { primary: primary, attr: attr } : null;
    }
    function getProp(primary) { // primary[expression] | primary.ID
      var prop;
      if (next(/^\./))        // primary.ID
        prop = check(reIdentifier);
      else if (next(/^\[/)) { // primary[expression]
        prop = getExpression();
        check(/^\s*\]/);
      }
      return prop ? { primary: primary, prop: prop } : null;
    }
    function getCall(primary) { // primary(expression, ...)
      var params = [];
      if (next(/^\(/)) {
        do {
          params.push(getExpression());
        } while (next(reCommaSep));
        check(/^\)/);
        return { primary: primary, params: params };
      }
      return null;
    }
    function getMember() {  // primary | attr | prop | call
      var primary = getPrimary();
      if (!primary)
        return null;
      var member = getAttr(primary) || getProp(primary) || getCall(primary);
      while (member) {
        primary = member;
        member = getAttr(primary) || getProp(primary) || getCall(primary);
      }
      return member || primary;
    }

    // condition parsing
    var reUnaryOp = /^\s*[+\-!]/;
    var reBinaryOp = /^\s*(==|!=|\<=?|\>=?|\+|\-|\*|\/|%)/;
    var reLogicalOp = /^\s*(\|\||\&\&)/;
    function getUnary() {
      var operator = next(reUnaryOp);
      var member = getMember();
      return operator ? {
        operator: operator,
        member: member
      } : member;
    }
    function getBinary() {
      var left = getUnary();
      var operator = next(reBinaryOp);
      return operator ? {
        binary: {
          left: left,
          operator: operator,
          right: getBinary()
        }
      } : left;
    }
    function getLogical() {
      var left = getBinary();
      var operator = next(reLogicalOp);
      return operator ? {
        logical: {
          left: left,
          operator: operator,
          right: getLogical()
        }
      } : left;
    }
    function getConditional() {
      var logical = getLogical();
      if (next(/^\s*\?\s*/)) {
        var ifTrue = getConditional();
        check(reColonSep);
        var ifFalse = getConditional();
        return {
          conditional: {
            logical: logical,
            ifTrue: ifTrue,
            ifFalse: ifFalse
          }
        };
      } else
        return logical;
    }
    function getExpression() {
      // an expression is always a conditional expression
      return getConditional();
    }

    // parse expression as AST or as text
    var len = parsedText.length;
    var delim = check(reExprBegin);
    var rv = [];
    do {
      rv.push(getExpression());
    } while (next(reCommaSep));
    if (delim == '{') {    // macro body
      check(/^\s*\}/);
      assert(rv.length == 1);
      rv = rv[0];
    }
    else if (delim == '(') // macro params
      check(/^\s*\)/);
    else if (delim == '[') // entity index
      check(/^\s*\]/);
    else
      assert();
    return astExpressions ? rv : parsedText.substr(len);
  }

  // identifiers: ID + optional [index] or (params)
  function readIdentifier() {
    var id = {};
    id.key = check(reIdentifier);
    // possible index or macro params
    switch (text[0]) {
      case '[': // index
        id.index = readExpression();
        break;
      case '(': // macro params
        id.params = readExpression();
        break;
    }
    return id;
  }

  // "LOL" entity parser (sic) :-/
  function lolParser() {
    var lolData = {};

    // entity delimiter
    function nextEntity() {
      while (next(/^\s*\/\*/))
        check(/\*\//);      // commments are ignored
      return next(/^\s*</); // found entity or macro
    }

    // entity attributes (key:value pairs)
    function readAttributes() {
      var attributes = {};
      var empty = true;
      var id = next(reIdentifier);
      while (id) {
        check(reColonSep);
        attributes[id] = readValue();
        id = next(reIdentifier);
        empty = false;
      }
      return empty ? null : attributes;
    }

    // parsing loop
    while (nextEntity()) {
      var id = readIdentifier();
      var key = id.key;
      if (key in lolData) // duplicate key: forget the former one
        delete(lolData[key]);

      // value and attributes
      if (!id.params) { // entity (= general case)
        var value = readValue();           // (optional) string | array | list
        var attributes = readAttributes(); // (optional) key-value pairs
        if (!attributes && !id.index) {    // plain string (= general case)
          lolData[key] = value;
        } else {
          lolData[key] = {};
          if (id.index)
            lolData[key].index = id.index;
          if (value)
            lolData[key].value = value;
          if (attributes)
            lolData[key].attributes = attributes;
        }
      } else { // macro
        lolData[key] = {};
        lolData[key].params = id.params;
        lolData[key].macro = readExpression();
      }

      // end of entity
      check(/^\s*>/);
    }
    return lolData;
  }

  // JSON-like entity parser
  function intlParser() {
    StrictCommaSep = false;
    reIdentifier = /^\s*(~|\.?[a-zA-Z])\w*/;
    //reCommaSep = /^(\s*,\s*| *[\r\n]+\s*|\s*$)/;

    // entity delimiter
    function nextEntity() {
      while (next(/^\s*\/\*/))
        check(/\*\//);                // commments are ignored
      return reIdentifier.test(text); // found entity or macro
    }

    // parsing loop
    var intlData = {};
    while (nextEntity()) {
      var id = readIdentifier();
      var key = id.key;
      if (key in intlData) // duplicate key: forget the former one
        delete(intlData[key]);
      check(reColonSep);

      // TODO: check flat attributes (ID.attribute)
      intlData[key] = {};
      if (!id.params) { // entity (= general case)
        var value = readValue();
        var attributes = {};
        var hasAttributes = false;
        for (var k in value) {
          if (/^\./.test(k)) { // attribute
            attributes[k.substr(1)] = value[k];
            delete(value[k]);
            hasAttributes = true;
          }
        }
        if (!hasAttributes && !id.index) { // plain string (= general case)
          intlData[key] = value;
        } else {
          if (id.index)
            intlData[key].index = id.index;
          if (hasAttributes) {
            intlData[key].value = value['~'];
            intlData[key].attributes = attributes;
          }
          else
            intlData[key].value = value;
        }
      } else { // macro
        intlData[key].params = id.params;
        intlData[key].macro = readExpression();
      }

      // end of entity
      //check(reCommaSep);
      check(/^(\s*,\s*| *[\r\n]+\s*|\s*$)/); // comma | EOL | EOF
    }
    return intlData;
  }

  // Expression parser
  function exprParser() {
    astExpressions = true;
    var expr = readExpression();
    check(/\s*$/);
    return expr;
  }

  // Figure out which entity parser should be used:
  while (next(/^\s*\/\*/)) // ignore leading comments
    check(/\*\//);
  // chose the parser according to the first significant token
  if (/^\s*</.test(text)) // ugh, LOL. :-/
    return lolParser();
  if (reIdentifier.test(text))
    return intlParser();
  if (reExprBegin.test(text))
    return exprParser();
  throw 'l10n parsing error: unknown format.';
}

