var FPR = FPR || {};

FPR.app = {};

FPR.app.init = (function($){
  "use strict";
  var Book,
  	  offline = false,
  	  sidebarWidth = 40,
  	  windowWidth;

  function init(bookURL){
	var search = window.location.search.match(/book=(.*)/),
		bookURL = bookURL || (search ? search[1] : "moby-dick");

	//-- Setup the browser prefixes 
	FP.core.crossBrowserColumnCss();

	//-- Set up our sidebar
	windowWidth = $(window).width();
	if(windowWidth > 550){
		$("#main").width(windowWidth-sidebarWidth);
	}else{
		$("#main").width(windowWidth);
	}
	
	
	//-- Create a new book object, 
	//	 this will create an iframe in the el with the ID provided
	Book = new FP.Book("area");

	//-- Add listeners to handle book events
	//-- Full list of event are at start of book.js
	Book.listen("book:metadataReady", meta);
	Book.listen("book:tocReady", toc);
	Book.listen("book:bookReady", bookReady);
	Book.listen("book:chapterReady", chapterChange);
	Book.listen("book:online", goOnline);
	Book.listen("book:offline", goOffline);
	
	//Book.registerHook("beforeChapterDisplay", FP.Hooks.transculsions.insert);
	
	//-- Start loading / parsing of the book.
	//	 This must be done AFTER adding listeners or hooks
	Book.start(bookURL);
	
	//-- Wait for Dom ready to handle jquery
	$(function() {
		controls();
	});


  }

  function meta(){
	  var title = Book.getTitle(),
		  author = Book.getCreator(),
		  $title = $("#book-title"),
		  $author = $("#chapter-title"),
		  $dash = $("#title-seperator");

	  document.title = title+" – "+author;
	  $title.html(title);
	  $author.html(author);
	  $dash.show();

  }

  function toc(){
	  var contents = Book.getTOC(),
		  $toc = $("#toc"),
		  $links,
		  $items;

  	  $toc.empty();
  	  
  	  //-- Recursively generate TOC levels
  	  $items = generateTocItems(contents);

	  $toc.append($items);
	  
	  $links = $(".toc_link");
	  
	  $links.on("click", function(e){
	  	var $this = $(this),
	  		url = $this.data("url");
	  	
	  	$(".openChapter").removeClass("openChapter");
	  	$this.parent().addClass("openChapter");	
	  	
	  	//-- Provide the Book with the url to show
	  	//	 The Url must be found in the books manifest
	  	
	  	if(!Book.useHash){
		  	Book.show(url);
		  	e.preventDefault();
	  	}

	  });

  }
  
  function generateTocItems(contents){
	  var $container = $("<ul>");
	  	  
	  	  
	  contents.forEach(function(item){
		  	var $subitems,
		  		$wrapper = $("<li id='toc-"+item.id+"'>"),
				$item = $("<a class='toc_link' href='#/"+item.href+"' data-url='"+item.href+"'>"+item.label+"</a>");

			$wrapper.append($item);
			
			if(item.subitems && item.subitems.length){
				$subitems = generateTocItems(item.subitems);
				$wrapper.append($subitems);
			}
			
			$container.append($wrapper);
	  });
	  return $container;
  }
	
   function bookReady(){
	  var $divider = $("#divider"),
		  $loader = $("#loader");
	  
	  $loader.hide();
	  $divider.addClass("show");

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
  
  function chapterChange(e) {
	  var id = e.msg,
	  	  $item = $("#toc-"+id),
	  	  $current = $(".currentChapter");
	  	  
	  if($item.length){
		  $current.removeClass("currentChapter");
		  $item.addClass("currentChapter");
	  }	  
	  
  }

  function controls(){
	  var $next = $("#next"),
	  	  $prev = $("#prev"),
	  	  $main = $("#main"),
	  	  $book = $("#area"),
	  	  $sidebar = $("#sidebar"),
	  	  $open = $("#open"),
	  	  $icon = $open.find("img"),
	  	  $network = $("#network"),
	  	  $window = $(window);


	  $window.on("resize", function(){
		  windowWidth = $(window).width();
		  if(windowWidth > 550){
		  	$main.width(windowWidth-sidebarWidth);
		  }else{
		  	$main.width(windowWidth);
		  }
	  });

	  $next.on("click", function(){
	  	Book.nextPage();
	  });

	  $prev.on("click", function(){
	  	Book.prevPage();
	  });
	  
	  //-- TODO: This doesn't seem to work
	  $window.bind("touchy-swipe", function(event, phase, $target, data){
		  
		  if(data.direction = "left"){
			  Book.nextPage();
		  }
		  
		  if(data.direction = "right"){
		  	  Book.prevPage();
		  }
	   	
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
		
		function showSidebar(){
			//$book.css("pointer-events", "none"); //-- Avoid capture by ifrmae
			$sidebar.addClass("open");
			$main.addClass("closed");
			$icon.attr("src", "img/close.png");
		}
		
		function hideSidebar(){
			$book.css("pointer-events", "visible");
			$sidebar.removeClass("open");
			$main.removeClass("closed");
			$icon.attr("src", "img/menu-icon.png");
		}
		
	   	$open.on("click", function(){
		   if($sidebar.hasClass("open")){
			   hideSidebar();
		   }else{
			   showSidebar();
			   
			   // $open.clickOutside(function(){
			   //   hideSidebar();
			   // });
		   }
	   	});
	   		
	   	   	
	   	$network.on("click", function(){
		   offline = !offline;
	   	   Book.fromStorage(offline);
	   	});


  }

  return  init;

})(jQuery);