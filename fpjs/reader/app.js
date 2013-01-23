FP.app = {};

FP.app.init = (function($){

  var Book,
  	  offline = false;

  function init(bookURL){
	var search = window.location.search.match(/book=(.*)/),
		bookURL = bookURL || (search ? search[1] : "moby-dick");

	//-- Setup the browser prefixes 
	FP.core.crossBrowserColumnCss();

	//-- Set up our sidebar
	$("#main").width($(window).width()-40);

	Book = new FP.Book("area");
	//Book = new FP.Book("area", "/the-hound-of-the-baskervilles/");

	Book.listen("book:metadataReady", meta);
	Book.listen("book:tocReady", toc);
	Book.listen("book:online", goOnline);
	Book.listen("book:offline", goOffline);
	
	Book.start(bookURL + "/");
	
	//-- Wait for Dom ready to handle jquery
	$(function() {
		controls();
	});


  }

  function meta(){
	  var title = Book.getTitle();
		  author = Book.getCreator(),
		  $title = $("#book-title"),
		  $author = $("#chapter-title");

	  document.title = title+" – "+author;
	  $title.html(title);
	  $author.html(author);

  }

  function toc(){
  	  var contents = Book.getTOC();
  		  $toc = $("#toc");

  	  $toc.empty();

  	  contents.forEach(function(item){
	  	  $wrapper = $("<li>");

	  	  $item = $("<a href='#"+item.href+"' data-spinepos='"+item.spinePos+"'>"+item.label+"</a>");

	  	  //-- Handle sub items later
	  	  /*
	  	  if(item.subitems.length){
		  	  $subitems = $("<ul>");
		  	  item.subitems.forEach(function(subitem){
			  	  $subitem = $("<li><a href='#"+subitem.href+"' data-spinepos='"+subitem.spinePos+"'>"+subitem.label+"</a></li>");
			  	  $subitems.append($subitem);
			  });
			  $item.append($subitems);
	  	  }
	  	  */

	  	  $item.on("click", function(e){
		  	  $this = $(this);
		  	  Book.displayChapter($this.data("spinepos"));
		  	  e.preventDefault();
	  	  });

	  	  $wrapper.append($item);
	  	  $toc.append($wrapper);
  	  });


  }

  function goOnline(){
  	  var $icon = $("#store");
  	  offline = false;
  	  $icon.attr("src", "img/save.png");
  
  }
  
  function goOffline(){
  	  var $icon = $("#store");
  	  offline = true;
  	  $icon.attr("src", "img/saved.png");
  
  }
    

  function controls(){
	  var $next = $("#next"),
	  	  $prev = $("#prev"),
	  	  $main = $("#main"),
	  	  $sidebar = $("#sidebar"),
	  	  $open = $("#open"),
	  	  $icon = $open.find("img"),
	  	  $network = $("#network"),
	  	  $window = $(window),
	  	  sidebarWidth = 40;


	  $window.on("resize", function(){
		  $main.width($window.width()-sidebarWidth);
	  });

	  $next.on("click", function(){
	  	Book.nextPage();
	  });

	  $prev.on("click", function(){
	  	Book.prevPage();
	  });

	  var lock = false;
	   	$(document).keydown(function(e){
	  	 	if(lock) return;

	   		if (e.keyCode == 37) { 
	  	 	   $prev.trigger("click");

	  	 	   lock = true;
	  	 	   setTimeout(function(){
	  		 	   lock = false;
	  	 	   }, 100);
	   		   return false;
	   		}
	   		if (e.keyCode == 39) { 
	   		   $next.trigger("click");
	   		   lock = true;
	   		   setTimeout(function(){
	   		   	lock = false;
	   		   }, 100);

	   		   return false;
	   		}
	   	});

	   	$open.on("click", function(){
		   if($sidebar.hasClass("open")){
			   $sidebar.removeClass("open");
			   $main.removeClass("closed");
			   $icon.attr("src", "img/menu-icon.png");
		   }else{
			   $sidebar.addClass("open");
			   $main.addClass("closed");
			   $icon.attr("src", "img/close.png");
		   }
	   	});
	   	
	   	$network.on("click", function(){
		   offline = !offline;
	   	   Book.fromStorage(offline);
	   	});


  }

  return  init;

})(jQuery);