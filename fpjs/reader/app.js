FP.app = {};

FP.app.init = (function($){
  
  var Book;
  
  function init(){
	FP.core.crossBrowserColumnCss();
	 
	Book = new FP.Book("area", "/moby-dick/");
	//Book = new FP.Book("area", "/the-hound-of-the-baskervilles/");
	
	//-- Wait for Dom ready to handle jquery
	$(function() {
		controls();
		//-- Replace with event
		setTimeout(function(){
			meta();
			toc();
		}, 500);
		setTimeout(function(){
			toc();
		}, 1000);
	});
	

  }
  
  function meta(){
	  var title = Book.getTitle();
		  author = Book.getCreator(),
		  $title = $("#book-title"),
		  $author = $("#chapter-title");
		  
	  document.title = title+"–"+author;
	  $title.html(title);
	  $author.html(author);
	  
  }
  
  function toc(){
  	  var contents = Book.getTOC();
  		  $toc = $("#toc");
  	
  	  contents.forEach(function(item){
	  	  $toc.append("<li><a href='"+item.href+"'>"+item.label+"</a></li>");
  	  });
  
    }
  
  function controls(){
	  var $next = $("#next"),
	  	  $prev = $("#prev"),
	  	  $main = $("#main"),
	  	  $sidebar = $("#sidebar"),
	  	  $open = $("#open");
	  
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
			   $open.attr("src", "/img/menu-icon.png");
		   }else{
			   $sidebar.addClass("open");
			   $main.addClass("closed");
			   $open.attr("src", "/img/close.png");
		   }
	   	});
	   	
	   	
  }
  
  return init;
  
})(jQuery);