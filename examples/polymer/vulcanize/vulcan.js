var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var nopt = require('nopt');

var options = nopt(
  {
    'output': path,
    'input': [path, Array],
    'verbose': Boolean
  },
  {
    'o': ['--output'],
    'i': ['--input'],
    'v': ['--verbose']
  }
);

if (!options.input) {
  console.error('No input files given');
  process.exit(1);
}

if (!options.output) {
  console.warn('Default output to output.html');
  options.output = path.resolve('output.html');
}

var outputDir = path.dirname(options.output);

var IMPORTS = 'link[rel="import"][href]';
var ELEMENTS = 'polymer-element';
var URL_ATTR = ['href', 'src', 'action', 'style'];
var URL_ATTR_SEL = '[' + URL_ATTR.join('],[') + ']';
var ABS_URL = /(^data:)|(^http[s]?:)|(^\/)/;
var URL = /url\([^)]*\)/g;
var URL_TEMPLATE = '{{.*}}';

function concatElement(dir, output, e) {
  e = resolveElementPaths(dir, output, e);
  buffer.push(e);
}

function resolveElementPaths(input, output, element) {
  var $ = cheerio.load(element);
  resolvePaths(input, output, $);
  return $.html(ELEMENTS);
}

function resolvePaths(input, output, $) {
  // resolve attributes
  $(URL_ATTR_SEL).each(function() {
    var val;
    URL_ATTR.forEach(function(a) {
      if (val = this.attr(a)) {
        if (val.search(URL_TEMPLATE) < 0) {
          if (a === 'style') {
            this.attr(a, rewriteURL(input, output, val));
          } else {
            this.attr(a, rewriteRelPath(input, output, val));
          }
        }
      }
    }, this);
  });
  // resolve style elements
  $('style').each(function() {
    var val = this.html();
    this.html(rewriteURL(input, output, val));
  });
}

function rewriteRelPath(inputPath, outputPath, rel) {
  if (ABS_URL.test(rel)) {
    return rel;
  }
  var abs = path.resolve(inputPath, rel);
  return path.relative(outputPath, abs);
}

function rewriteURL(inputPath, outputPath, cssText) {
  return cssText.replace(URL, function(match) {
    var path = match.replace(/["']/g, "").slice(4, -1);
    path = rewriteRelPath(inputPath, outputPath, path);
    return 'url(' + path + ')';
  });
}

function readDocument(docname) {
  if (options.verbose) {
    console.log('Reading:', docname);
  }
  var content = fs.readFileSync(docname, 'utf8');
  return cheerio.load(content);
}

function extractImports($, dir) {
  var hrefs = $(IMPORTS).map(function(){ return this.attr('href') });
  return hrefs.map(function(h) { return path.resolve(dir, h) });
}

function extractScripts($, assetPath) {
  var scripts = $.root().children('script');

  scripts.each(function(){ 
    var src = this.attr('src');
    
    if(src) {
      this.attr('src', path.join(assetPath, src));
    }

  });

  return scripts;
}

function extractElements($, assetPath) {
  return $(ELEMENTS).map(function(i, e){ this.attr('assetpath', assetPath); return $.html(e) });
}

function concat(filename) {
  if (!read[filename]) {
    read[filename] = true;
    var $ = readDocument(filename);
    var dir = path.dirname(filename);
    var assetPath = path.relative(outputDir, dir);
    var links = extractImports($, dir);
    resolve(filename, links);

    var scripts = extractScripts($, assetPath);

    scripts.each(function(){
      buffer.push($.html(this));
    });


    var es = extractElements($, assetPath);
    es.forEach(concatElement.bind(this, dir, outputDir));
  } else {
    if (options.verbose) {
      console.log('Dependency deduplicated');
    }
  }
}

function resolve(inName, inDependencies) {
  if (inDependencies.length > 0) {
    if (options.verbose) {
      console.log('Dependencies:', inDependencies);
    }
    inDependencies.forEach(concat);
  }
}

// monkey patch addResolvePath for build
var monkeyPatch = function(proto, element) {
  var assetPath = element.getAttribute('assetpath');
  var url = HTMLImports.getDocumentUrl(element.ownerDocument) || '';
  if (url) {
    var parts = url.split('/');
    parts.pop();
    if (assetPath) {
      parts.push(assetPath);
    }
    parts.push('');
    url = parts.join('/');
  }
  proto.resolvePath = function(path) {
    return url + path;
  }
};

var buffer = [
  '<!-- Monkey Patch addResolvePath to use assetpath -->',
  '<script>Polymer.addResolvePath = ' + monkeyPatch + '</script>'
];
var read = {};

options.input.forEach(concat);

if (buffer.length) {
  fs.writeFileSync(options.output, buffer.join('\n'), 'utf8');
}
