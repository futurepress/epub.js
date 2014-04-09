// /reader/moby-dick/OPS/chapter_006.xhtml
// epubcfi(/6/24[xchapter_006]!4/2/14/1:0)

module('EPUB CFI');

asyncTest("Renderer Updates to new CFI", 1, function() {
	var book = ePub('/reader/moby-dick/', { width: 400, height: 600 });

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
	var book = ePub('/reader/moby-dick/', { width: 400, height: 600 });

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

test("Parse CFIs", null, function() {
	var epubcfi = new EPUBJS.EpubCFI();
	var cfiOne = epubcfi.parse("epubcfi(/6/2[cover]!/6)");

	equal(cfiOne.steps.length, 1, "One step");
	equal(cfiOne.steps[0].type, "element", "Step type is element");
	equal(cfiOne.steps[0].index, 2, "Step index is two");
});

test("Compare CFI's", null, function() {
	var epubcfi = new EPUBJS.EpubCFI();
	// equal(epubcfi.compare("epubcfi(/6/2[cover]!/4)", "epubcfi(/6/2[cover]!/4)"), 0, "equal");
	
	// Spines
	equal(epubcfi.compare("epubcfi(/6/4[cover]!/4)", "epubcfi(/6/2[cover]!/4)"), 1, "First spine is greater");
	equal(epubcfi.compare("epubcfi(/6/4[cover]!/4)", "epubcfi(/6/6[cover]!/4)"), -1, "Second spine is greater");
	
	// First is deeper
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/8/2)", "epubcfi(/6/2[cover]!/6)"), 1, "First Element is greater");
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/4/2)", "epubcfi(/6/2[cover]!/6)"), -1, "Second Element is greater");
	
	// Second is deeper
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/8/2)", "epubcfi(/6/2[cover]!/6/4/2/2)"), 1, "First Element is greater");
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/4/4)", "epubcfi(/6/2[cover]!/6/4/2/2)"), -1, "Second Element is greater");
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/4/6)", "epubcfi(/6/2[cover]!/4/6/8/1:0)"), -1, "Second");

	// Same Depth
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/6/8)", "epubcfi(/6/2[cover]!/6/2)"), 1, "First Element is greater");
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/4/20)", "epubcfi(/6/2[cover]!/6/10)"), -1, "Second Element is greater");
	
	// Text nodes
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/4/5)", "epubcfi(/6/2[cover]!/4/3)"), 1, "First TextNode is greater");
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/4/7)", "epubcfi(/6/2[cover]!/4/13)"), -1, "Second TextNode is greater");

	// Char offset
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/4/5:1)", "epubcfi(/6/2[cover]!/4/5:0)"), 1, "First Char Offset is greater");
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/4/5:2)", "epubcfi(/6/2[cover]!/4/5:30)"), -1, "Second Char Offset is greater");
	
	// Normal example
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/4/8/5:1)", "epubcfi(/6/2[cover]!/4/6/15:2)"), 1, "First Element is greater");
	equal(epubcfi.compare("epubcfi(/6/2[cover]!/4/8/1:0)", "epubcfi(/6/2[cover]!/4/8/1:0)"), 0, "All Equal");

});

test("Generate XPath from Steps", null, function() {
	var epubcfi = new EPUBJS.EpubCFI();
	var cfi = epubcfi.parse("epubcfi(/6/12[xepigraph_001]!4/2/8[extracts]/1:0)");
	var xpath = epubcfi.generateXpathFromSteps(cfi.steps);

	equal(xpath, "./*/*[2]/*[1]/*[position()=4 and @id='extracts']/text()[1]", "Correct Xpath Generated");

});


asyncTest("Generate Range from CFI", 1, function() {
	var book = ePub('/reader/moby-dick/', { width: 400, height: 600 });

	var render = book.renderTo("qunit-fixture");

	var result = function(){
		var displayed = book.gotoHref("epigraph_001.xhtml");
		displayed.then(function(){
				var epubcfi = new EPUBJS.EpubCFI();
				var range = epubcfi.generateRangeFromCfi("epubcfi(/6/12[xepigraph_001]!4/2/8[extracts]/1:0)", book.renderer.doc);
				equal( range.startContainer.data, "Extracts.", "Anchor is correct" );
				start();
		});
	};

	render.then(result);
});