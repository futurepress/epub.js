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

asyncTest("Find CFI from href", 1, function() {
	var book = ePub('/demo/moby-dick/', { width: 400, height: 600 });

	var render = book.renderTo("qunit-fixture");

	var result = function(){
		var epubcfi = new EPUBJS.EpubCFI();
		var generated = epubcfi.generateCfiFromHref("epigraph_001.xhtml#extracts", book);
		generated.then(function(cfi){
			equal( cfi, "epubcfi(/6/12[xepigraph_001]!4/2/8[extracts]/1:0)", "CFI generated" );
			start();
		});
	};

	render.then(result);
});