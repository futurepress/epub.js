Epub.js
================================

![FuturePress Views](http://fchasen.com/futurepress/fp.png)

Epub.js is a JavaScript library for rendering ePub documents in the browser, across many devices.

Epub.js provides an interface for common ebook functions (such as rendering, persistence and pagination) without the need to develop a dedicated application or plugin.

[Try it while reading Moby Dick](http://futurepress.github.com/epub.js/demo/)


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

If you plan on using compressed (zipped) epubs (any .epub file) include the minified version of [zip.js](http://gildas-lormeau.github.io/zip.js/)

Also make sure to set ```EPUBJS.filePath``` to the directory containing ```inflate.js```

```html
<!-- Zip JS -->
<script src="/build/libs/zip.min.js"></script>  

<script>
    EPUBJS.filePath = "../build/libs/";
</script>
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
	var Book = ePub("url/to/book/", { restore: true });
	Book.renderTo("area");
</script>
```

See the [Documentation](https://github.com/fchasen/epub.js/blob/master/documentation/README.md) to view events and methods for getting the books contents.

The [Examples](https://github.com/fchasen/epub.js/tree/master/examples) are likely the best place to learn how to use the library.


Recent Updates
-------------------------
+ ```book.goto()``` and ```book.gotoCfi()``` can be called before ```book.renderTo()``` to start rendering at a previous page location.

+ Moved page position restoring from local storage out of main library and into the demo reader. 

+ Rewritten [Demo Reader](http://futurepress.github.com/epub.js/demo/)

+ Started [Developer Mailing List](https://groups.google.com/forum/#!forum/epubjs)

+ Opened our public IRC, Server: freenode.net Channel: #epub.js

+ Started [Documentation](https://github.com/fchasen/epub.js/blob/master/documentation/README.md)

+ ePub("book.epub", options) returns a new EPUBJS.Book(options),

+ EPUBJS.Book now only takes a options object, set bookPath with ePub("path/to/book/") or new EPUBJS.Book({ bookPath : "path/to/book/"})

+ [Examples](http://fchasen.github.io/epub.js/examples/)

+ [Tests](http://fchasen.github.io/epub.js/tests/)


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

* [dev.html](http://localhost:8080/demo/dev.html) will pull from the source files and should be used during development.
* [index.html](http://localhost:8080/demo/index.html) will use the minified production libraries in the dist/ folder.

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
EPBUJS.Hooks.register("beforeChapterDisplay").example = function(callback, render){
    
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

