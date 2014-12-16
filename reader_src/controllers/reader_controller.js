EPUBJS.reader.ReaderController = function(book) {
	var $main = $("#main"),
			$divider = $("#divider"),
			$loader = $("#loader"),
			$next = $("#next"),
			$prev = $("#prev");
	var reader = this;
	var book = this.book;
	var slideIn = function() {
		var currentPosition = book.getCurrentLocationCfi();
		if (reader.settings.sidebarReflow){
			$main.removeClass('single');
			$main.one("transitionend", function(){
				book.gotoCfi(currentPosition);
			});
		} else {
			$main.removeClass("closed");
		}
	};

	var slideOut = function() {
		var currentPosition = book.getCurrentLocationCfi();
		if (reader.settings.sidebarReflow){
			$main.addClass('single');
			$main.one("transitionend", function(){
				book.gotoCfi(currentPosition);
			});
		} else {
			$main.addClass("closed");
		}
	};

	var showLoader = function() {
		$loader.show();
		hideDivider();
	};

	var hideLoader = function() {
		$loader.hide();
		
		//-- If the book is using spreads, show the divider
		// if(book.settings.spreads) {
		// 	showDivider();
		// }
	};

	var showDivider = function() {
		$divider.addClass("show");
	};

	var hideDivider = function() {
		$divider.removeClass("show");
	};

	var keylock = false;

	var arrowKeys = function(e) {		
		if(e.keyCode == 37) { 
			
			if(book.metadata.direction === "rtl") {
				book.nextPage();
			} else {
				book.prevPage();
			}

			$prev.addClass("active");

			keylock = true;
			setTimeout(function(){
				keylock = false;
				$prev.removeClass("active");
			}, 100);

			 e.preventDefault();
		}
		if(e.keyCode == 39) {

			if(book.metadata.direction === "rtl") {
				book.prevPage();
			} else {
				book.nextPage();
			}
			
			$next.addClass("active");

			keylock = true;
			setTimeout(function(){
				keylock = false;
				$next.removeClass("active");
			}, 100);

			 e.preventDefault();
		}
	}

	document.addEventListener('keydown', arrowKeys, false);

	$next.on("click", function(e){
		
		if(book.metadata.direction === "rtl") {
			book.prevPage();
		} else {
			book.nextPage();
		}

		e.preventDefault();
	});

	$prev.on("click", function(e){
		
		if(book.metadata.direction === "rtl") {
			book.nextPage();
		} else {
			book.prevPage();
		}

		e.preventDefault();
	});
	
	book.on("renderer:spreads", function(bool){
		if(bool) {
			showDivider();
		} else {
			hideDivider();
		}
	});

	// book.on("book:atStart", function(){
	// 	$prev.addClass("disabled");
	// });
	// 
	// book.on("book:atEnd", function(){
	// 	$next.addClass("disabled");	
	// });

	return {
		"slideOut" : slideOut,
		"slideIn"  : slideIn,
		"showLoader" : showLoader,
		"hideLoader" : hideLoader,
		"showDivider" : showDivider,
		"hideDivider" : hideDivider,
		"arrowKeys" : arrowKeys
	};
};