// /demo/moby-dick/OPS/chapter_006.xhtml
// epubcfi(/6/24[xchapter_006]!4/2/14/1:0)

module('EPUB CFI');

asyncTest("Renderer Updates to new CFI", 1, function() {
	var book = ePub('/demo/moby-dick/', { width: 400, height: 600 });

	var render = book.renderTo("qunit-fixture");

	var result = function(){
		var displayed = book.gotoCfi("epubcfi(/6/24[xchapter_006]!4/2/14/1:0)");
			displayed.then(function(){
				equal( book.getCurrentLocationCfi(), "epubcfi(/6/24[xchapter_006]!4/2/14/1:0)", "Location is correct" );
				start();
		});
	};

	render.then(result);
});

// asyncTest("Find Element from cfi", 1, function() {
// 	var book = ePub('/demo/moby-dick/', { width: 400, height: 600 });
// 
// 	var render = book.renderTo("qunit-fixture");
// 
// 	var result = function(){
// 		var d = book.gotoCfi("epubcfi(/6/24[xchapter_006]!4/2/14/1:0)");
// 		console.log(d, book.getCurrentLocationCfi())
// 		// equal( pg.page, 755, "Page has been parsed" );
// 		start();
// 	};
// 
// 	render.then(result);
// });