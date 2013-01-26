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
	//Book = new FP.Book("area", "/the-hound-of-the-baskervilles/");

	Book.listen("book:metadataReady", meta);
	Book.listen("book:tocReady", toc);
	Book.listen("book:chapterReady", chapterChange);
	Book.listen("book:online", goOnline);
	Book.listen("book:offline", goOffline);
	
	//Book.setFootnotes(["glossterm", "footnote"]);//["glossterm", "footnote"]);
	
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
	  
			//   contents.forEach(function(item){
			// 	  $wrapper = $("<li id='toc-"+item.id+"'>");
			// 
			// 	  $item = $("<a href='#"+item.href+"' data-spinepos='"+item.spinePos+"'>"+item.label+"</a>");
			// 	  
			// 
			// 	  $item.on("click", function(e){
			//  	  $this = $(this);
			//  	  Book.displayChapter($this.data("spinepos"));
			//  	  e.preventDefault();
			// 	  });
			// 
			// 	  $wrapper.append($item);
			// 	  
			// 	  if(item.subitems && item.subitems.length){
			// $subitems = $("<ul>");
			// item.subitems.forEach(function(subitem){
			//   //console.log("subitem", subitem)
			//   $subitem = $("<li id='toc-"+subitem.id+"'><a href='#"+subitem.href+"' data-spinepos='"+subitem.spinePos+"'>"+subitem.label+"</a></li>");
			//   $subitems.append($subitem);
			// });
			// 	  	$wrapper.append($subitems);
			// 	   }
			// 	    	  
			// 	  $toc.append($wrapper);
			//   });


  }
  
  function generateTocItems(contents){
	  var $container = $("<ul>");
	  	  
	  	  
	  contents.forEach(function(item){
		  	var $subitems,
		  		$wrapper = $("<li id='toc-"+item.id+"'>"),
				$item = $("<a href='"+item.href+"'>"+item.label+"</a>");
			
			$item.data("spinepos", item.spinePos);
			
			if(item.section) {
				$item.data("section", item.section);
			}
			
			$item.on("click", function(e){
				var $this = $(this),
					url = $this.attr("href");
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