Epub.js
================================

![FuturePress Views](http://fchasen.com/futurepress/fp.png)

Epub.js is a javascript library for rendering ePUB's in the browser, across many devices.

Epub.js provides common ebook functions (such as persistence and pagination) without the need to develop a dedicated application or plugin.

Unlike an application, our HTML / Javascript reader can be hosted anywhere and can be easily customized using javascript, such as changing the interface or adding annotation functionality.

[Try it while reading Moby Dick](http://fchasen.github.com/epub.js/)

Why EPUB
-------------------------

![Why EPUB](http://fchasen.com/futurepress/whyepub.png)

ePUB is a widely used and easily convertible format.  Many books are currently in this format and it is used as the base for many proprietary formats (such as Mobi and iBooks). We have chosen the ePUB standard because it brings us as close as possible to our “Books on the Web” vision, while enforcing a standard which enables the development of more advanced reader functionality.  

An unzipped ePUB3 is a collection of HTML5 files, CSS, images and other media – just like any other website.  However, it enforces a schema of book components, which allows us to render a book and its parts based on a controlled vocabulary.  

More specifically, the ePUB schema standardizes the table of contents, provides a manifest that enables the caching of the entire book and separates the storage of the content from how it’s displayed.

Running Locally
-------------------------

install [http-server](https://github.com/nodeapps/http-server)

```javascript
npm install http-server -g
```

then you can run the reader locally with the command

```javascript
http-server
```

* [dev.html](http://localhost:8080/dev.html) will pull from the source files and should be used during development.
* [index.html](http://localhost:8080/index.html) will use the minified production libraries in the dist/ folder.
* [annotator.html](http://localhost:8080/annotator.html) is a dev branch for annotation development.

Building for Distribution
-------------------------

install [gruntjs](http://gruntjs.com/getting-started)

```javascript
npm install -g grunt-cli

npm install
```

Then when you are ready to build just run

```javascript
grunt
```

Getting Started
-------------------------

```javascript
FP.filePath = "/path/to/js/"; //-- For web workers
FPR.app.init("/path/to/epub/"); //-- Starts the reader, with path to a book
```

Persistence / Offline Storage
-------------------------

The eBook reader uses persistence to cache the files from an epub for offline viewing, stores information about the book, and remembers what chapter the user was on.  Being able to read a book when internet isn’t available, and remembering your place in the book is crucial to making our reader website work as an application and fulfill users expectations of how a eBook should function.

Currently, there is not a great cross browser solution for dynamic file storage. Chrome supports the Filesystem API, Firefox/IE support indexedDB, and Safari/Safari Mobile support Web SQL.

The reader detects the storage capabilities of the browser and picks the best available option. When internet is available, the entire book is loaded into storage. When possible, Web Workers is used to handle loading and saving the files, so as not to interfere with the reading experience.

The browser tells the reader when there is Internet connectivity, and by listening to those events, it automatically switches to using the stored files. Users can also manually switch to offline mode in the interface.

Hooks
-------------------------

Similar to a plugins, FPJS implements events that can be "hooked" into. Thus you can interact with and manipulate the contents of the book.

Examples of this functionality is loading videos from youtube links before displaying a chapters contents or implementing annotation.

Hooks require a event to latch onto and a callback for when they are finished.

Example hook:

```javascript
FP.Hooks.register("beforeChapterDisplay").example = function(callback, chapter){
    
    var elements = chapter.doc.querySelectorAll('[video]'),
        items = Array.prototype.slice.call(elements);
    
    items.forEach(function(item){
      //-- do something with the video item
    }
    
    if(callback) callback();
		
}
```

