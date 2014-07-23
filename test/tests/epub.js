module('Create');

asyncTest("Create new ePub(/path/to/epub/)", 1, function() {
  
  var book = ePub("../books/moby-dick/");
  book.opened.then(function(){
    equal( book.url, "../books/moby-dick/OPS/", "bookPath is passed to new EPUBJS.Book" );
    start();
  });

});

asyncTest("Create new ePub(/path/to/epub/package.opf)", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    equal( book.url, "../books/moby-dick/OPS/", "bookPath is passed to new EPUBJS.Book" );
    start();
  });

});

asyncTest("Open using ePub(/path/to/epub/package.opf)", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    equal( book.packageUrl, "../books/moby-dick/OPS/package.opf", "packageUrl is set" );
    start();
  });

});

asyncTest("Find Epub Package", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    equal( book.packageUrl, "../books/moby-dick/OPS/package.opf", "packageUrl is set" );
    start();
  });

});

module('Parse');

//TODO: add mocked tests for parser

asyncTest("Manifest", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    equal( Object.keys(book.package.manifest).length, 152, "Manifest is parsed" );
    start();
  });

});

asyncTest("Metadata", 3, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    equal( book.package.metadata.creator, "Herman Melville", "Creator metadata is parsed" );
    equal( book.package.metadata.title, "Moby-Dick", "Title metadata is parsed" );
    equal( book.package.metadata.identifier, "code.google.com.epub-samples.moby-dick-basic", "Identifier metadata is parsed" );
    start();
  });

});

asyncTest("Spine", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    equal( book.package.spine.length, 144, "Spine is parsed" );
    start();
  });

});

asyncTest("Cover", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    equal( book.cover, "../books/moby-dick/OPS/images/9780316000000.jpg", "Cover is set" );
    start();
  });

});

module('Spine');

asyncTest("Length", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
      equal( book.spine.length, 144, "All spine items present" );
      start();
  });

});

asyncTest("Items", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    equal( book.spine.spineItems.length, 144, "All spine items added" );
    start();
  });

});

asyncTest("First Item", 2, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    var section = book.spine.get(1);
    equal( section.href, "cover.xhtml", "First spine item href found" );
    equal( section.cfiBase, "/6/2[cover]", "First spine item cfi found" );

    start();
  });

});

asyncTest("Find Item by Href", 2, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    var section = book.spine.get("chapter_001.xhtml");
    equal( section.href, "epigraph_001.xhtml", "chap 1 spine item href found" );
    equal( section.cfiBase, "/6/12[xepigraph_001]", "chap 1 spine item cfi found" );

    start();
  });

});

asyncTest("Find Item by ID", 2, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    var section = book.spine.get("#xchapter_050");
    equal( section.href, "chapter_049.xhtml", "chap 50 spine item href found" );
    equal( section.cfiBase, "/6/110[xchapter_049]", "chap 50 spine item cfi found" );

    start();
  });

});

asyncTest("Render Spine Item", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    var section = book.spine.get("#xchapter_050");
    section.render().then(function(content){
      equal( content.substring(303, 334), "<h1>Chapter 49. The Hyena.</h1>", "Chapter text rendered as string" );
    });

    start();
  });

});

module('Navigation');

asyncTest("NCX & Nav", 2, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    equal( book.navigation.navUrl, "../books/moby-dick/OPS/toc.xhtml", "Nav URL found" );
    equal( book.navigation.ncxUrl, "../books/moby-dick/OPS/toc.ncx", "NCX URL found" );

    start();
  });

});


asyncTest("Load TOC Auto Pick", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    book.navigation.load().then(function(toc){
      equal( toc.length, 141, "Full Nav toc parsed" );
      start();
    });
  });

});

asyncTest("Load TOC from Nav", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    var nav = book.navigation.nav.load();
    nav.then(function(toc){
      equal( toc.length, 141, "Full Nav toc parsed" );
      start();
    });
  });

});

asyncTest("Load TOC from NCX", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.opened.then(function(){
    var ncx = book.navigation.ncx.load();
    ncx.then(function(toc){
      equal( toc.length, 14, "Full NCX toc parsed" );
      start();
    });
  });

});

asyncTest("Get all TOC", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.loaded.navigation.then(function(){
    equal( book.navigation.get().length, 141, "Full Nav toc parsed" );
    start();
  });

});

asyncTest("Get TOC time by href", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.loaded.navigation.then(function(){
    var item = book.navigation.get("chapter_001.xhtml");
    equal( item.id, "toc-chapter_001", "Found TOC item" );
    start();
  });

});

asyncTest("Get TOC time by ID", 1, function() {

  var book = ePub("../books/moby-dick/OPS/package.opf");
  book.loaded.navigation.then(function(){
    var item = book.navigation.get("#toc-chapter_001");
    equal( item.href, "chapter_001.xhtml", "Found TOC item" );
    start();
  });

});