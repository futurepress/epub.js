Epub.js
================================

![FuturePress Views](http://fchasen.com/futurepress/fp.png)

Epub.js is a JavaScript library for rendering ePub documents in the browser, across many devices.

Epub.js provides an interface for common ebook functions (such as rendering, persistence and pagination) without the need to develop a dedicated application or plugin. Importantly, it has an incredibly permissive [Free BSD](http://en.wikipedia.org/wiki/BSD_licenses) license. 

[Try it while reading Moby Dick](http://futurepress.github.com/epub.js/reader/)


Why EPUB
-------------------------

![Why EPUB](http://fchasen.com/futurepress/whyepub.png)

The [EPUB standard](http://www.idpf.org/epub/30/spec/epub30-overview.html) is a widely used and easily convertible format.  Many books are currently in this format, and it is convertible to many other formats (such as PDF, Mobi and iBooks).

An unzipped ePUB3 is a collection of HTML5 files, CSS, images and other media – just like any other website.  However, it enforces a schema of book components, which allows us to render a book and its parts based on a controlled vocabulary.  

More specifically, the ePUB schema standardizes the table of contents, provides a manifest that enables the caching of the entire book, and separates the storage of the content from how it’s displayed.

Getting Started
-------------------------

Get the minified code from the build folder:

```html
<script src="../build/epub.min.js"></script>
```

If you plan on using compressed (zipped) epubs (any .epub file) include the minified version of [JSZip.js](http://stuk.github.io/jszip/) + Mime-types which can be found in [build/libs](https://raw.githubusercontent.com/futurepress/epub.js/master/build/libs/zip.min.js)

```html
<!-- Zip JS -->
<script src="/build/libs/zip.min.js"></script>
```

Setup a element to render to:

```html
<div onclick="Book.prevPage();">‹</div>
<div id="area"></div>
<div onclick="Book.nextPage();">›</div>
```

Create the new ePub, and then render it to that element:

```html
<script>
	var Book = ePub("url/to/book/");
	Book.renderTo("area");
</script>
```

See the [Documentation](https://github.com/futurepress/epub.js/blob/master/documentation/README.md) to view events and methods for getting the books contents.

The [Examples](https://github.com/futurepress/epub.js/tree/master/examples) are likely the best place to learn how to use the library.

Internet Explore
-------------------------

Compatibility with IE requires wicked-good-xpath, a Google-authored pure JavaScript implementation of the DOM Level 3 XPath specification. More info at https://code.google.com/p/wicked-good-xpath/

You can download the latest wgxpath [here](https://wicked-good-xpath.googlecode.com/svn/trunk/build/wgxpath.install.js) or from the examples folder.

```html
<script src="/examples/wgxpath.install.js"></script>
```

Then install wgxpath via a hook like the one below:

```javascript
EPUBJS.Hooks.register("beforeChapterDisplay").wgxpath = function(callback, renderer){

  wgxpath.install(renderer.render.window);

  if(callback) callback();
};

wgxpath.install(window);   
```

Recent Updates
-------------------------
+ v2 splits the render method from the layout and renderer. Currently only iframe rendering is supported, but this change will allow for new render methods in the future. See the breaking changes to the renderer [here](https://github.com/futurepress/epub.js/blob/master/documentation/README.md#renderer).

+ Work-in-progress pagination support using EPUB page-lists. See a [usage example](http://futurepress.github.io/epub.js/examples/pagination.html). ```renderer:pageChanged``` has changed to ```renderer:locationChanged``` and a ```book:pageChanged``` event was added to pass pagination events.

+ Moved [Demo Reader](http://futurepress.github.com/epub.js/demo/) to ```/reader/``` and the source to ```/reader_src/```.

+ Updated CFI handling to support text offsets. CFIs return wrapped like: ```"epubcfi(/6/12[xepigraph_001]!4/2/28/2/1:0)"```. Ranges to be added soon.

+ Added support for [EPUB properties](http://www.idpf.org/epub/fxl/#property-orientation). This can be overridden in the settings and default to ```{spread: 'reflowable', layout: 'auto', orientation: 'auto'}```

+ Updated [Documentation](https://github.com/futurepress/epub.js/blob/master/documentation/README.md)

+ Many more [Tests](http://futurepress.github.io/epub.js/tests/)


Running Locally
-------------------------

install [node.js](http://nodejs.org/)

install the project dependences with npm
```javascript
npm install
```

then you can run the reader locally with the command

```javascript
node server.js
```

* [dev.html](http://localhost:8080/reader/dev.html) will pull from the source files and should be used during development.
* [index.html](http://localhost:8080/reader/index.html) will use the minified production libraries in the build/ folder.

Examples
-------------------------

+ [Single](http://futurepress.github.io/epub.js/examples/single.html)
+ [Basic](http://futurepress.github.io/epub.js/examples/basic.html)
+ [Contained Epub](http://futurepress.github.io/epub.js/examples/contained.html)
+ [Promises](http://futurepress.github.io/epub.js/examples/promises.html)
+ [Fixed Width & Height](http://futurepress.github.io/epub.js/examples/fixed.html)
+ [Custom Element](http://futurepress.github.io/epub.js/examples/custom-elements.html)
+ [MathML with MathJAX](http://futurepress.github.io/epub.js/examples/mathml.html)
+ [Annotations with Hypothes.is](http://futurepress.github.io/epub.js/examples/hypothesis.html)
+ [Pagination](http://futurepress.github.io/epub.js/examples/pagination.html)

[View All Examples](http://futurepress.github.io/epub.js/examples/)

Testing
-------------------------

Once you start a server you can run the [QUnit](http://qunitjs.com/) tests at [http://localhost:8080/tests/](http://localhost:8080/tests/)

You can download the test books from https://github.com/futurepress/books by running:
```
git submodule update --init --recursive
```

Then you can pull the latest with:
```
git submodule foreach git pull origin master
```

Building for Distribution
-------------------------

Builds are concatenated and minified using [gruntjs](http://gruntjs.com/getting-started)

To generate a new build run

```javascript
grunt
```

Hooks
-------------------------

Similar to a plugins, Epub.js implements events that can be "hooked" into. Thus you can interact with and manipulate the contents of the book.

Examples of this functionality is loading videos from YouTube links before displaying a chapters contents or implementing annotation.

Hooks require a event to latch onto and a callback for when they are finished.

Example hook:

```javascript
EPUBJS.Hooks.register("beforeChapterDisplay").example = function(callback, renderer){
    
    var elements = render.doc.querySelectorAll('[video]'),
        items = Array.prototype.slice.call(elements);
    
    items.forEach(function(item){
      //-- do something with the video item
    }
    
    if(callback) callback();
		
}
```

Additional Resources
-------------------------

[Epub.js Developer Mailing List](https://groups.google.com/forum/#!forum/epubjs)

IRC Server: freenode.net Channel: #epub.js

Follow us on twitter: @Epubjs

+ http://twitter.com/#!/Epubjs

Other
-------------------------

EPUB is a registered trademark of the [IDPF](http://idpf.org/). 

