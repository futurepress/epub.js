Epub.js v0.3
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
<script src="../dist/epub.min.js"></script>
```

If using archived `.epub` files include JSZip:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.1/jszip.min.js"></script>
```

Setup a element to render to:

```html
<div id="area"></div>
```

Create the new ePub, and then render it to that element:

```html
<script>
  var book = ePub("url/to/book/package.opf");
  var rendition = book.renderTo("area", {width: 600, height: 400});
  var displayed = rendition.display();
</script>
```

Render Methods
-------------------------

Single: `book.renderTo("area");`

[View example](https://s3.amazonaws.com/epubjs/examples/single.html)

Continuous: `book.renderTo("area", { method: "continuous", width: "100%", height: "100%" });`

[View example](https://s3.amazonaws.com/epubjs/examples/continuous.html)

Paginate: `book.renderTo("area", { method: "paginate", width: "900", height: "600" });`

[View example](https://s3.amazonaws.com/epubjs/examples/pages.html)


Documentation
-------------------------

Work in progress documentation at [API.js](https://github.com/futurepress/epub.js/blob/v0.3/API.js)

Running Locally
-------------------------

install [node.js](http://nodejs.org/)

install the project dependences with npm
```javascript
npm install
```

then you can run the reader locally with the command

```javascript
./tools/serve
```

install [bower](http://bower.io/)
```javascript
bower install
```
Examples
-------------------------

See examples folder

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

Builds are concatenated and minified using [gulp](http://gulpjs.com/)

To generate a new build run

```javascript
gulp
```

or to continuously build run

```javascript
gulp watch
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

