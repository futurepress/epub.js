module('Render');

asyncTest("renderTo element on page", 1, function() {
	var Book = ePub('../reader/moby-dick/');

	var render = Book.renderTo("qunit-fixture");

	var result = function(){
		equal( $( "iframe", "#qunit-fixture" ).length, 1, "iframe added successfully" );
		start();
	};

	render.then(result).catch(result);
	
});

asyncTest("Fit to given width and height", 3, function() {
	var Book = ePub('../reader/moby-dick/', { width: 400, height: 600 });

	var render = Book.renderTo("qunit-fixture");

	var result = function(){

		var $iframe = $( "iframe", "#qunit-fixture" ),
			$body;
		
		equal( $iframe.length, 1, "iframe added successfully" );

		equal( $iframe.width(), 400, "iframe had correct width" );
		equal( $iframe.height(), 600, "iframe has correct height" );

		start();

	};

	render.then(result);

	
});

asyncTest("Go to chapter 1 and advance to next page", 4, function() {
	var Book = ePub('../reader/moby-dick/', { width: 400, height: 600 });

	var render = Book.renderTo("qunit-fixture");

	var result = function(){

		var $iframe = $( "iframe", "#qunit-fixture" ),
			$body;
		
		equal( $iframe.length, 1, "iframe added successfully" );

		start();

		$body = $iframe.contents().find("body");
		equal( $body.scrollLeft(), 0, "on page 1");

		stop();

		Book.goto("chapter_001.xhtml").then(function(){
			
			start();
			$body = $iframe.contents().find("body");

			Book.nextPage();
			equal( $body.scrollLeft(), 450, "on page 2");

			Book.nextPage();
			equal( $body.scrollLeft(), 900, "on page 3");
		});
		

	};

	render.then(result);

	
});

asyncTest("Go to chapter 10 at restore start", 2, function() {
	var Book = ePub('../reader/moby-dick/', { width: 400, 
																				 height: 600,
																				 restore: true,
																				 goto: "chapter_010.xhtml" });

	var render = Book.renderTo("qunit-fixture");

	var result = function(){

		var $iframe = $( "iframe", "#qunit-fixture" ),
			$body;

		equal( $iframe.length, 1, "iframe added successfully" );

		

		start();
		equal( Book.currentChapter.id, "xchapter_010", "on chapter 10");

	};

	render.then(result);


});

asyncTest("Go to chapter 20 from queue", 2, function() {
	var Book = ePub('../reader/moby-dick/', { width: 400, 
																				 height: 600 });
	
	Book.goto("chapter_020.xhtml");
	
	var render = Book.renderTo("qunit-fixture");

	var result = function(){

		var $iframe = $( "iframe", "#qunit-fixture" ),
			$body;

		equal( $iframe.length, 1, "iframe added successfully" );

		start();
		equal( Book.currentChapter.id, "xchapter_020", "on chapter 20");

	};

	render.then(result);

});

asyncTest("Display end of chapter 20 and go to prev page", 3, function() {

	var Book = ePub('../reader/moby-dick/', { width: 400, height: 600 });

	var render = Book.renderTo("qunit-fixture");

	var result = function(){

		var $iframe = $( "iframe", "#qunit-fixture" ),
			$body;

		equal( $iframe.length, 1, "iframe added successfully" );


		Book.displayChapter(20, true).then(function(){
			
			start();

			$body = $iframe.contents().find("body");
			Book.prevPage();

			equal( $body.scrollLeft(), 1350, "on last page");


			Book.prevPage();
			equal( $body.scrollLeft(), 900, "on second to last page ");
			
			
		});
		

	};

	render.then(result);

	
});

asyncTest("Add styles to book", 4, function() {
	
	var Book = ePub('../reader/moby-dick/', { width: 400, height: 600 });
	
	var render = Book.renderTo("qunit-fixture");
	
	var result = function(){
	
		var $iframe = $( "iframe", "#qunit-fixture" ),
				$body;

		equal( Book.renderer.render.bodyEl.style.background, '', "background not set");
		
		Book.setStyle("background", "purple");
		equal( Book.renderer.render.bodyEl.style.background, "purple", "background is purple");
		
		equal( Book.renderer.render.bodyEl.style.fontSize, '', "fontSize not set");
		
		Book.setStyle("fontSize", "100px");
		equal( Book.renderer.render.bodyEl.style.fontSize, "100px", "fontSize is purple");
			
		start();
		
	
	};
	
	render.then(result);
	
});

asyncTest("Switch Spreads to Single", 3, function() {
	
	var Book = ePub('../reader/moby-dick/', { width: 800, height: 600 });
	
	var render = Book.renderTo("qunit-fixture");
	
	var result = function(){
		equal( Book.renderer.spreads, true, "Use Spreads");
		Book.forceSingle(true);
		equal( Book.renderer.spreads, false, "Don't Use Spreads");
		equal( Book.renderer.contents.style[EPUBJS.core.prefixed('columnWidth')], "350px", "Don't Use Spreads");
		start();
	};
	
	render.then(result);
});

asyncTest("Go to chapter 4 and advance through chapter, checking position with width set", 11, function() {
	var Book = ePub('../reader/moby-dick/', { width: 1100.5, height: 612 });

	var render = Book.renderTo("qunit-fixture");

	var result = function(){

		var $iframe = $( "iframe", "#qunit-fixture" ),
			$body;
		
		equal( $iframe.length, 1, "iframe added successfully" );

		start();

		$body = $iframe.contents().find("body");
		equal( $body.scrollLeft(), 0, "on page 1");

		stop();

		Book.goto("chapter_003.xhtml").then(function(){
			
			start();
			
			equal(Book.renderer.layout.spreadWidth, 1240);
			
			$body = $iframe.contents().find("body");

			Book.nextPage();
			equal( $body.scrollLeft(), 1240, "on page 2");
			
			Book.nextPage();
			equal( $body.scrollLeft(), 2480, "on page 3");
			
			Book.nextPage();
			equal( $body.scrollLeft(), 3720, "on page 4");
			
			Book.nextPage();
			equal( $body.scrollLeft(), 4960, "on page 5");
			
			Book.nextPage();
			equal( $body.scrollLeft(), 6200, "on page 6");
			
			Book.nextPage();
			equal( $body.scrollLeft(), 7440, "on page 7");
			
			Book.nextPage();
			equal( $body.scrollLeft(), 8680, "on page 8");
			
			Book.nextPage();
			equal( $body.scrollLeft(), 9920, "on page 9");
		});
		

	};

	render.then(result);

	
});

asyncTest("Go to chapter 4 and advance through chapter, checking position with width from div", 11, function() {
	var Book = ePub('../reader/moby-dick/');
	var viewer = document.createElement("div");
	var $viewer;
	var render;
	var width = 1236;
	
	var result = function(){

		var $iframe = $( "iframe", "#viewer" ),
			$body;
		
		equal( $iframe.length, 1, "iframe added successfully" );

		start();

		$body = $iframe.contents().find("body");
		equal( $body.scrollLeft(), 0, "on page 1");

		stop();

		Book.goto("chapter_003.xhtml").then(function(){
			
			start();
			
			console.log(Book.renderer.render.width)
			equal(Book.renderer.layout.spreadWidth, width, "Spread width is correctly calculated");
			$body = $iframe.contents().find("body");

			Book.nextPage();
			equal( $body.scrollLeft(), width, "on page 2");
			
			Book.nextPage();
			equal( $body.scrollLeft(), width * 2, "on page 3");
			
			Book.nextPage();
			equal( $body.scrollLeft(), width * 3, "on page 4");
			
			Book.nextPage();
			equal( $body.scrollLeft(), width * 4, "on page 5");
			
			Book.nextPage();
			equal( $body.scrollLeft(), width * 5, "on page 6");
			
			Book.nextPage();
			equal( $body.scrollLeft(), width * 6, "on page 7");
			
			Book.nextPage();
			equal( $body.scrollLeft(), width * 7, "on page 8");
			
			Book.nextPage();
			equal( $body.scrollLeft(), width * 8, "on page 9");
			
		});
		

	};
	viewer.id = "viewer";
	$("#qunit-fixture").append(viewer);
	$viewer = $("#viewer");
	
	$viewer.width(1100.797);
	$viewer.height(612);
	
	render = Book.renderTo("viewer");
	render.then(result);
});