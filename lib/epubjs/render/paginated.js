EPUBJS.Render.Paginated = function(book, options){

  // Dom events to listen for
  this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click"];
  this.upEvent = "mouseup";
  this.downEvent = "mousedown";
  if('ontouchstart' in document.documentElement) {
    this.listenedEvents.push("touchstart", "touchend");
    this.upEvent = "touchend";
    this.downEvent = "touchstart";
  }
  
};

//-- Takes a string or a element
EPUBJS.Render.Paginated.prototype.initialize = function(elem){
  var book = this;
  var rendered;

  if(EPUBJS.core.isElement(elem)) {
    this.element = elem;
  } else if (typeof elem == "string") {
    this.element = document.getElementById(elem);
  } else {
    console.error("Pass an Element or Element Id");
    return;
  }

  rendered = this.opened.
        then(function(){
          // book.render = new EPUBJS.Renderer[this.settings.renderer](book);
          book.renderer.initialize(book.element, book.settings.width, book.settings.height);
          book._rendered();
          return book.startDisplay();
        });

  // rendered.then(null, function(error) { console.error(error); });

  return rendered;
};


// epub.renderTo("elementID", _type);
//   rendition = epub.renderer(book, _type);
//   rendition.attachTo("elementID");
//   epub.display();
//   return rendition;

// epub.display();
// epub.display(1);
// epub.display("chapt1.html#something");
// epub.display("epubcfi(/6/30[id-id2640702]!2/4/1:0)");
//   section = book.section(_arg);
//   rendition.display(section);
//     section.render();
//       section.load();
//   return rendition;

// epub.rendition.backwards();
// epub.rendition.forwards();

// epub.rendition.addStyle();
// epub.rendition.addStyles();
