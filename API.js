// API

// Epub Rendition
// > Package (book)
//  - Manifest (files)
//  - Metadata (info)
//  - Spine (order)
//  - Navagation (toc)

// Need to split out rendering and book completely
// Something like
var epub = ePub("moby-dick.epub");
var epub = ePub("http://s3path/ip/moby-dick.opf");
// or
var epub = new EPUBJS.Book("http://s3path/ip/moby-dick.opf");

// Returns a Scroll Controller, Attachs to a document (or window?)
var epub = ePub("moby-dick.epub");

var epub = ePub();
var book = epub.open(_url)
  return epub

// Creates a Book Package object, parses manifest
var book = epub.open("moby-dick.epub");
var book = epub.open("META-INF/container.xml");
var book = epub.open("package.opf"); //-- maybe, not in spec?
  // Set the store

  // Unzip if needed

  // Get the container

  // Get the package path
  book = new Book("path/to/book/package.opf", store);
  unpacked = book.unpack();

  return unpacked

book.unpack()
  book.manifest
  book.metadata
  book.spine
  book.navigation.toc
  // book.navigation.landmarks
  // book.navigation.lot
  return book

// Loads a chapter of the Book
var section = book.spine.get(1);
var section = book.spine.get("chap1.html");
var section = book.spine.get("#id1234");

// Alias for spine
var section = book.section("epubcfi(/6/30[id-id2640702])");
var section = book.section(1);

book.loaded.navigation.then()
book.navigation.get()
book.navigation.get("#toc-chap-1")
book.navigation.get("chap1.html")

// Returns the straight html of the chapter
//-- When does the chapter content processing happen?
section.render() 

// Create a new renderer
var rendition = book.renderTo("viewer", {method: "paginate", options: true});
// is the same as
var rendition = new EPUBJS.Paginate(book, {options: true});
rendition.attachTo("viewer");

// Render to a div
rendition.attachTo("elementID");

// Display the provided chapter
rendition.display(chapter);

epub.display();
epub.display(1);
epub.display("chapt1.html#something");
epub.display("epubcfi(/6/30[id-id2640702]!2/4/1:0)");
  section = book.section(_arg);
  rendition.display(section);
    section.render();
      section.load();
  return rendition;

epub.rendition.backwards();
epub.rendition.forwards();

epub.rendition.addStyle();
epub.rendition.addStyles();


epub.find("query");
section.find("query");

epub.on("noAuth", function(){

});

rendition = epub.renderTo("elementID", { method: "paginate", width: "900", height: "600" });

rendition.next();
rendition.prev();
rendition.page();
rendition.map();