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

	Book = new FP.Book("area");

	Book.listen("book:metadataReady", meta);
	Book.listen("book:tocReady", toc);
	Book.listen("book:chapterReady", chapterChange);
	Book.listen("book:online", goOnline);
	Book.listen("book:offline", goOffline);
	
	
	Book.start(bookURL + "/");
	
	//-- Wait for Dom ready to handle jquery
	$(function() {
		controls();
	});


  }

  function meta(){
	  var title = Book.getTitle(),
		  author = Book.getCreator(),
		  $title = $("#book-title"),
		  $author = $("#chapter-title");

	  document.title = title+" – "+author;
	  $title.html(title);
	  $author.html(author);

  }

  function toc(){
	  var contents = Book.getTOC(),
		  $toc = $("#toc"),
		  $items;

  	  $toc.empty();
  	  $items = generateTocItems(contents);

	  $toc.append($items);
	  

  }
  
  function generateTocItems(contents){
	  var $container = $("<ul>");
	  	  
	  	  
	  contents.forEach(function(item){
		  	var $subitems,
		  		$wrapper = $("<li id='toc-"+item.id+"'>"),
				$item = $("<a href='#"+item.href+"' data-url='"+item.href+"'>"+item.label+"</a>");
						
			$item.on("click", function(e){
				var $this = $(this),
					url = $this.data("url");
					//spinepos = $this.data("spinepos"),
					//section = $this.data("section") || false;
				
				$(".openChapter").removeClass("openChapter");
				$this.parent().addClass("openChapter");	
				
				Book.show(url);
				
				e.preventDefault();
			});
			
			$wrapper.append($item);
			
			if(item.subitems && item.subitems.length){
				$subitems = generateTocItems(item.subitems);
				$wrapper.append($subitems);
			}
			
			$container.append($wrapper);
	  });
	  return $container;
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

	  $next.on("click swipeleft", function(){
	  	Book.nextPage();
	  });

	  $prev.on("click swiperight", function(){
	  	Book.prevPage();
	  });
	  
	  
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
			$book.css("pointer-events", "none"); //-- Avoid capture by ifrmae
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
			   
			   $open.clickOutside(function(){
			     hideSidebar();
			   });
		   }
	   	});
	   	
	   	
	   	   	
	   	$network.on("click", function(){
		   offline = !offline;
	   	   Book.fromStorage(offline);
	   	});


  }

  return  init;

})(jQuery);