Epub.js
================================

![FuturePress Views](http://fchasen.com/futurepress/fp.png)

Epub.js is a javascript library for rendering ePub's in the browser, across many devices.

Epub.js provides common ebook functions (such as persistence and pagination) without the need to develop a dedicated application or plugin.

Unlike an application, our HTML / Javascript reader can be hosted anywhere and can be easily customized using javascript, such as changing the interface or adding annotation functionality.

[Try it while reading Moby Dick](http://fchasen.github.com/epub.js/demo/)


Why EPUB
-------------------------

![Why EPUB](http://fchasen.com/futurepress/whyepub.png)

ePUB is a widely used and easily convertible format.  Many books are currently in this format and it is used as the base for many proprietary formats (such as Mobi and iBooks). We have chosen the ePUB standard because it brings us as close as possible to our “Books on the Web” vision, while enforcing a standard which enables the development of more advanced reader functionality.  

An unzipped ePUB3 is a collection of HTML5 files, CSS, images and other media – just like any other website.  However, it enforces a schema of book components, which allows us to render a book and its parts based on a controlled vocabulary.  

More specifically, the ePUB schema standardizes the table of contents, provides a manifest that enables the caching of the entire book and separates the storage of the content from how it’s displayed.

Getting Started
-------------------------

Get the minified code from the build folder:

```html
<script src="../build/epub.min.js"></script>
```

If you plan on using compressed (zipped) epubs (any .epub file) include the minfied version of [zip.js](http://gildas-lormeau.github.io/zip.js/)

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

However, the [Examples](https://github.com/fchasen/epub.js/tree/master/examples) are currently the best place to learn how to use the library.


Recent Updates
-------------------------

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

Building for Distribution
-------------------------

Builds are concatenated and minified using [gruntjs](http://gruntjs.com/getting-started)

To generate a new build run

```javascript
grunt
```

Persistence / Offline Storage
-------------------------

The eBook reader uses persistence to cache the files from an epub for offline viewing, stores information about the book, and remembers what chapter the user was on.  Being able to read a book when internet isn’t available, and remembering your place in the book is crucial to making our reader website work as an application and fulfill users expectations of how a eBook should function.

Currently, there is not a great cross browser solution for dynamic file storage. Chrome supports the Filesystem API, Firefox/IE support indexedDB, and Safari/Safari Mobile support Web SQL.

The reader detects the storage capabilities of the browser and picks the best available option. When internet is available, the entire book is loaded into storage. When possible, Web Workers is used to handle loading and saving the files, so as not to interfere with the reading experience.

The browser tells the reader when there is Internet connectivity, and by listening to those events, it automatically switches to using the stored files. Users can also manually switch to offline mode in the interface.

Hooks
-------------------------

Similar to a plugins, Epub.js implements events that can be "hooked" into. Thus you can interact with and manipulate the contents of the book.

Examples of this functionality is loading videos from youtube links before displaying a chapters contents or implementing annotation.

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

Follow us on twitter: @Epubjs

+ http://twitter.com/#!/Epubjs

Other
-------------------------

EPUB is a registered trademark of the [IDPF](http://idpf.org/). 

