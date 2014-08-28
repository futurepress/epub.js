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
var rendition = ePub.Render(book, EPUBJS.Paginated, {options: true});
// is the same as
var rendition = new EPUBJS.Paginated(book, {options: true});

var rendition = ePub.Render(book); // Defaults
var rendition = ePub.Render(book, EPUBJS.Render.Paginated, options);
var rendition = ePub.Render.Paginated(book);
var rendition = ePub.Render.Scrolling(book);

rendition.render(book) // if not passed

ePub.renderer.register("Paginated", EPUBJS.Render.Paginated);


// Render to a div
rendition.attachTo("elementID");
// or
body.appendChild(rendition.container);

// Display the provided chapter
rendition.display(chapter);

// Rendering sugar ?
epub.renderTo("elementID", _type);
  rendition = epub.renderer(book, _type);
  rendition.attachTo("elementID");
  epub.display();
  return rendition;

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

rendition = epub.renderTo("elementID", {});

pagination = rendition.paginate({});
pagination = new EPUBJS.Paginate(rendition, {spreads: true, minwidth: 800, layout: {} });
  layout = new EPUBJS.Layout(global);

pagination.next();
pagination.prev();
pagination.page();
pagination.map();