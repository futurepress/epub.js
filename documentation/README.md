# EPUB.JS Documentation

You can also find some short guides [here](https://github.com/futurepress/epub.js/wiki/Tips-and-Tricks).

## Methods

#### ePub(bookPath, options)

Creates a new EPUBJS.Book()

bookPath is a optional convience method
that will start loading the book at that given path
```javascript
var Book = ePub("url/to/book/"); // With default options
```

```javascript
var Book = ePub({ restore: true }); 
Book.open("url/to/book/"); // Books can be opened later 
```

Options:

```javascript
{
  bookPath : null,
  version: 1, // Changing will cause stored Book information to be reloaded
  restore: false, // Skips parsing epub contents, loading from localstorage instead
  storage: false, // true (auto) or false (none) | override: 'ram', 'websqldatabase', 'indexeddb', 'filesystem'
  spreads: true, // Displays two columns
  fixedLayout : false, //-- Will turn off pagination
  styles : {}, // Styles to be applied to epub
  width : false,
  height: false, 
}

```

Intially you'll probably just want to turn on restore.

The width and height will be set to the containing element's dimensions.

```javascript
var Book = ePub("url/to/book/", { restore: true });
```

The following examples will refer to this ePub variable as ```Book```.

#### Book.open(bookPath)

Will open and parse a book at the given path.

```javascript
var Book = ePub({ restore: true }); 
Book.open("url/to/book/"); // Books can be opened later 
```

Books can be compressed epub.
See section X for additional information about handling these

```javascript
Book.open("url/to/book.epub");
```


#### Book.renderTo(element)

Appends the iframe that will contain the rendered book to a element.

Returns a promise with the render object after the first chapter has been loaded 

```javascript

var Book = ePub("url/to/book/", { restore: true });

var $el = document.getElementById("div-id");
Book.renderTo($el);
```

renderTo can take a element id as a string.

```javascript
var Book = ePub("url/to/book/");
Book.renderTo("div-id");
```

#### Book.nextPage()
#### Book.prevPage()

Changes the page the book is on.

If on the first or last page of a chapter, the next chapter will be loaded.

```html
<div onclick="Book.prevPage();">‹</div>
<div onclick="Book.nextPage();">›</div>
```

if the book has not been rendered yet, page changes will have no effect.

#### Book.displayChapter(chap, end)

Loads book chapter at a given spine position or epub CFI string.

Returns a promise with the render after the given chapter has been loaded.

```javascript
Book.displayChapter('/6/4[chap01ref]!/4[body01]/10');
```

Setting End to true will advance to the last page of the chapter.

```javascript
Book.displayChapter(3, true);
```

#### Book.goto(url)

Loads book chapter that has the given url.

Returns a promise with the render after the given chapter has been loaded 

```javascript
var skip = Book.goto("chapter_001.xhtml");
skip.then(function(){
	console.log("On Chapter 1");
})
```
This is often used to create a table of contents, with links to specific chapters.

#### Book.setStyle(style, val, prefixed)

Adds style to be attached to the body element rendered book.

One common use is increasing font-size.

```javascript
Book.setStyle("font-size", "1.2em");
```

#### Book.removeStyle(style)

Removes a style from the rendered book

#### Book.destroy()

Remove the appended iframe and cleans up event listeners.

### Promises

#### Book.getMetadata()

```javascript
Book.getMetadata().then(function(meta){
    document.title = meta.bookTitle+" – "+meta.creator;
});
```

Returns an object like this (but do not count on all of the properties being there):

````json
{
  "bookTitle": "The title of the book",
  "creator": "Book Author",
  "description": "The description/synopsis of the book",
  "pubdate": "",
  "publisher": "The Publisher",
  "identifier": "The ISBN",
  "language": "en-US",
  "rights": "Copyright text",
  "modified_date": "",
  "layout": "",
  "orientation": "",
  "spread": "",
  "direction": null
}
````

#### Book.getToc()

```javascript
Book.getToc().then(function(toc){
	console.log(toc);
});
```

#### Book.generatePagination()

NOTE: This method will be deprecated in v0.3

````javascript
book.generatePagination().then(function(toc){
	console.log("Pagination generated");
});
````

````javascript
book.generatePagination(pageWidth, pageHeight).then(function(toc){
	console.log("Pagination generated");
});
````

## Events

book:ready

book:stored

book:online

book:offline

book:pageChanged
``` javascript
{
  anchorPage: 2
  percentage: 0.5
  pageRange: [1, 2, 3]
}
```
Reports the currently shown page of the rendering. 
Book must include a pageList.

```javascript
book.on('book:pageChanged', function(location){
    console.log(location.anchorPage, location.pageRange)
});
```

renderer:resized

renderer:chapterDisplayed

renderer:chapterUnloaded

renderer:locationChanged
```javascript
  "epubcfi(...)"
```
Reports the current location of the rendering.

Can be used to restore a rendition to the current location.
Same as `book.renderer.currentLocationCfi()`

```javascript
book.on('renderer:locationChanged', function(locationCfi){
    console.log(locationCfi)
});
```

renderer:visibleRangeChanged








