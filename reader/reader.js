EPUBJS.reader = {};
EPUBJS.reader.plugins = {}; //-- Attach extra view as plugins (like search?)

(function(root) {

	var previousReader = root.ePubReader || {};

	var ePubReader = root.ePubReader = function(path, options) {
		return new EPUBJS.Reader(path, options);
	};

	_.extend(ePubReader, {
		noConflict : function() {
			root.ePubReader = previousReader;
			return this;
		}
	});

	//exports to multiple environments
	if (typeof define === 'function' && define.amd)
	//AMD
	define(function(){ return Reader; });
	else if (typeof module != "undefined" && module.exports)
	//Node
	module.exports = ePubReader;

})(window);

EPUBJS.Reader = function(path, options) {
	var reader = this;
	var settings = _.defaults(options || {}, {
		restore: true
	});
	var book = this.book = ePub(path, settings);

	this.settings = settings;
	this.offline = false;
	this.sidebarOpen = false;

	book.renderTo("viewer");
	
	reader.SettingsView = EPUBJS.reader.SettingsView.call(reader, book);
	reader.ControlsView = EPUBJS.reader.ControlsView.call(reader, book);
	reader.SidebarView = EPUBJS.reader.SidebarView.call(reader, book);
	
	book.ready.all.then(function() {
		reader.ReaderView = EPUBJS.reader.ReaderView.call(reader, book);
		
		// Call Plugins
		for(var plugin in EPUBJS.reader.plugins) {
			if(EPUBJS.reader.plugins.hasOwnProperty(plugin)) {
				reader[plugin] = EPUBJS.reader.plugins[plugin].call(reader, book);
			}
		}
		
	});

	book.getMetadata().then(function(meta) {
		reader.MetaView = EPUBJS.reader.MetaView.call(reader, meta);
	});

	book.getToc().then(function(toc) {
		reader.TocView = EPUBJS.reader.TocView.call(reader, toc);
	});

	return this;
};

EPUBJS.reader.MetaView = function(meta) {
	var title = meta.bookTitle,
			author = meta.creator;

	var $title = $("#book-title"),
			$author = $("#chapter-title"),
			$dash = $("#title-seperator");

		document.title = title+" – "+author;

		$title.html(title);
		$author.html(author);
		$dash.show();
};

EPUBJS.reader.ReaderView = function(book) {
	var $main = $("#main"),
			$divider = $("#divider"),
			$loader = $("#loader"),
			$next = $("#next"),
			$prev = $("#prev");
	
	var slideIn = function() {
		$main.removeClass("closed");
	};
	
	var slideOut = function() {
		$main.addClass("closed");
	};
	
	var showLoader = function() {
		$loader.show();
	};
	
	var hideLoader = function() {
		$loader.hide();
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
			book.prevPage();
			$prev.addClass("active");

			keylock = true;
			setTimeout(function(){
				keylock = false;
				$prev.removeClass("active");
			}, 100);

			 e.preventDefault();
		}
		if(e.keyCode == 39) { 
			book.nextPage();
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
		book.nextPage();
		e.preventDefault();
	});
	
	$prev.on("click", function(e){
		book.prevPage();
		e.preventDefault();
	});
	
	//-- Hide the spinning loader
	hideLoader();
	
	//-- If the book is using spreads, show the divider
	if(!book.single) {
		showDivider();
	}
	
	return {
		"slideOut" : slideOut,
		"slideIn"  : slideIn,
		"showLoader" : showLoader,
		"hideLoader" : hideLoader,
		"showDivider" : showDivider,
		"hideDivider" : hideDivider
	};
};

EPUBJS.reader.SidebarView = function(book) {
	var reader = this;

	var $sidebar = $("#sidebar"),
			$panels = $("#panels");
	
	var activePanel = "TocView";
	
	var changePanelTo = function(viewName) {
		if(activePanel == viewName || typeof reader[viewName] === 'undefined' ) return;
		reader[activePanel].hide();
		reader[viewName].show();
		activePanel = viewName;

		$panels.find('.active').removeClass("active");
		$panels.find("#show-" + viewName ).addClass("active");
	};
	
	var show = function() {
		reader.sidebarOpen = true;
		reader.ReaderView.slideOut();
		$sidebar.addClass("open");
	}
	
	var hide = function() {
		reader.sidebarOpen = false;
		reader.ReaderView.slideIn();
		$sidebar.removeClass("open");
	}
	
	$panels.find(".show_view").on("click", function(event) {
		var view = $(this).data("view");
		
		changePanelTo(view);
		event.preventDefault();
	});
	
	return {
		'show' : show,
		'hide' : hide,
		'activePanel' : activePanel,
		'changePanelTo' : changePanelTo
	};
};

EPUBJS.reader.ControlsView = function(book) {
	var reader = this;

	var $store = $("#store"),
			$fullscreen = $("#fullscreen"),
			$fullscreenicon = $("#fullscreenicon"),
			$cancelfullscreenicon = $("#cancelfullscreenicon"),
			$slider = $("#slider"),
			$main = $("#main"),
			$sidebar = $("#sidebar"),
			$settings = $("#settings"),
			$bookmark = $("#bookmark");

	var goOnline = function() {
		reader.offline = false;
		// $store.attr("src", $icon.data("save"));
	};

	var goOffline = function() {
		reader.offline = true;
		// $store.attr("src", $icon.data("saved"));
	};

	book.on("book:online", goOnline);
	book.on("book:offline", goOffline);

	$slider.on("click", function () {
		if(reader.sidebarOpen) {
			reader.SidebarView.hide();
			$slider.addClass("icon-menu");
			$slider.removeClass("icon-right");
		} else {
			reader.SidebarView.show();
			$slider.addClass("icon-right");
			$slider.removeClass("icon-menu");
		}
	});
	
	$fullscreen.on("click", function() {
		screenfull.toggle($('#container')[0]);
		$fullscreenicon.toggle();
		$cancelfullscreenicon.toggle();
	});
	
	$settings.on("click", function() {
		reader.SettingsView.show();
	});

	$bookmark.on("click", function() {
		$bookmark.addClass("icon-bookmark");
		$bookmark.removeClass("icon-bookmark-empty");
		console.log(reader.book.getCurrentLocationCfi());
	});

	book.on('renderer:pageChanged', function(cfi){
		//-- TODO: Check if bookmarked
		$bookmark
			.removeClass("icon-bookmark")
			.addClass("icon-bookmark-empty"); 
	});

	return {
		
	};
};

EPUBJS.reader.TocView = function(toc) {
	var book = this.book;
	
	var $list = $("#tocView"),
			docfrag = document.createDocumentFragment();
	
	var currentChapter = false;
	
	var generateTocItems = function(toc, level) {
		var container = document.createElement("ul");
		
		if(!level) level = 1;

		toc.forEach(function(chapter) {
			var listitem = document.createElement("li"),
					link = document.createElement("a");
					toggle = document.createElement("a");
			var subitems;
			
			listitem.id = "toc-"+chapter.id;

			link.textContent = chapter.label;
			link.href = chapter.href;
			link.classList.add('toc_link');

			listitem.appendChild(link);

			if(chapter.subitems) {
				level++;
				subitems = generateTocItems(chapter.subitems, level);
				toggle.classList.add('toc_toggle');
				
				listitem.insertBefore(toggle, link);
				listitem.appendChild(subitems);
			}
			
			
			container.appendChild(listitem);
			
		});
		
		return container;
	};
	
	var onShow = function() {
		$list.show();
	};
	
	var onHide = function() {
		$list.hide();
	};
	
	var chapterChange = function(e) {
		var id = e.id,
				$item = $list.find("#toc-"+id),
				$current = $list.find(".currentChapter"),
				$open = $list.find('.openChapter');

		if($item.length){
			
			if($item != $current && $item.has(currentChapter).length > 0) {
				$current.removeClass("currentChapter");
			}
			
			$item.addClass("currentChapter");
			
			// $open.removeClass("openChapter");
			$item.parents('li').addClass("openChapter");
		}	  
	};
	
	book.on('renderer:chapterDisplayed', chapterChange);

	var tocitems = generateTocItems(toc);
	
	docfrag.appendChild(tocitems);
	
	$list.append(docfrag);
	$list.find(".toc_link").on("click", function(event){
			var url = this.getAttribute('href');

			//-- Provide the Book with the url to show
			//   The Url must be found in the books manifest
			book.goto(url);
			
			$list.find(".currentChapter")
					.addClass("openChapter")
					.removeClass("currentChapter");
					
			$(this).parent('li').addClass("currentChapter");
			
			event.preventDefault();
	});

	$list.find(".toc_toggle").on("click", function(event){
			var $el = $(this).parent('li'),
					open = $el.hasClass("openChapter");
			
			if(open){
				$el.removeClass("openChapter");
			} else {
				$el.addClass("openChapter");
			}
			event.preventDefault();
	});
	
	return {
		"show" : onShow,
		"hide" : onHide
	};
};

EPUBJS.reader.SettingsView = function() {
	var book = this.book;

	var $settings = $("#settingsPanel");

	var onShow = function() {
		$settings.show();
	};

	var onHide = function() {
		$settings.hide();
	};

	return {
		"show" : onShow,
		"hide" : onHide
	};
};