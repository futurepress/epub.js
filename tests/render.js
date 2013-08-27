module('Render');

asyncTest("renderTo element on page", 1, function() {
	var Book = ePub('../demo/moby-dick/');

	var render = Book.renderTo("qunit-fixture");

	var result = function(){
		equal( $( "iframe", "#qunit-fixture" ).length, 1, "iframe added successfully" );
		start();
	};

	render.then(result, result);
	
});

asyncTest("Fit to given width and height", 3, function() {
	var Book = ePub('../demo/moby-dick/', { width: 400, height: 600 });

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
	var Book = ePub('../demo/moby-dick/', { width: 400, height: 600 });

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
	var Book = ePub('../demo/moby-dick/', { width: 400, 
																				 height: 600,
																				 restore: true,
																				 goto: "chapter_010.xhtml" });

	var render = Book.renderTo("qunit-fixture");

	var result = function(){

		var $iframe = $( "iframe", "#qunit-fixture" ),
			$body;

		equal( $iframe.length, 1, "iframe added successfully" );

		

		start();
		equal( Book.render.currentChapter.id, "xchapter_010", "on chapter 10");

	};

	render.then(result);


});

asyncTest("Go to chapter 20 from queue", 2, function() {
	var Book = ePub('../demo/moby-dick/', { width: 400, 
																				 height: 600 });
	
	Book.goto("chapter_020.xhtml");
	
	var render = Book.renderTo("qunit-fixture");

	var result = function(){

		var $iframe = $( "iframe", "#qunit-fixture" ),
			$body;

		equal( $iframe.length, 1, "iframe added successfully" );



		start();
		equal( Book.render.currentChapter.id, "xchapter_020", "on chapter 20");

	};

	render.then(result);

});

asyncTest("Display end of chapter 20 and go to prev page", 3, function() {

	var Book = ePub('../demo/moby-dick/', { width: 400, height: 600 });

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

// asyncTest("Add styles to book", 3, function() {
// });
