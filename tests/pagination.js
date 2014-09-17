module('Pagination');

asyncTest("PageList of CFI's is loaded from Nav Element", 4, function() {
	var book = ePub('../books/georgia-cfi-20120521/', { width: 400, height: 600 });

	var render = book.renderTo("qunit-fixture");

	var result = function(){
		var pg;
		equal( book.pageList.length, 7, "All items in the page list have been parsed." );
		pg = book.pageList[3];
		equal( pg.cfi, "epubcfi(/6/4[ct]!/4/2[d10e42]/26[d10e271]/4[d10e276]/3:1054)", "Cfi string is correct." );
		equal( pg.packageUrl, "package.opf", "Package Url is present" );
		equal( pg.page, 755, "Page has been parsed" );
		start();
	};

	render.then(result);
});

asyncTest("PageList of HREFs is loaded from Nav Element", 3, function() {
	var book = ePub('../books/georgia-pls-ssml-20120322/', { width: 400, height: 600 });

	var render = book.renderTo("qunit-fixture");

	var result = function(){
		var pg;
		equal( book.pageList.length, 7, "All items in the page list have been parsed." );
		pg = book.pageList[3];
		equal( pg.cfi, "epubcfi(/6/4[doc1]!4/2[d10e42]/26[d10e271]/4[d10e276]/4[page755]/1:0)", "Cfi string is correct." );
		// equal( pg.packageUrl, "package.opf", "Package Url is present" );
		equal( pg.page, 755, "Page has been parsed" );
		start();
	};

	render.then(result);
});

var mockPageList = [{"cfi":"epubcfi(/6/4[ct]!/4/2[d10e42]/12[d10e85]/6[d10e93]/1:1552[Bryan,%20and])","packageUrl":"package.opf","page":"752"},{"cfi":"epubcfi(/6/4[ct]!/4/2[d10e42]/18[d10e150]/4[d10e155]/1:35)","packageUrl":"package.opf","page":"753"},{"cfi":"epubcfi(/6/4[ct]!/4/2[d10e42]/24[d10e209]/4[d10e214]/3:2180[for,%20taxation])","packageUrl":"package.opf","page":"754"},{"cfi":"epubcfi(/6/4[ct]!/4/2[d10e42]/26[d10e271]/4[d10e276]/3:1054)","packageUrl":"package.opf","page":"755"},{"cfi":"epubcfi(/6/4[ct]!/4/2[d10e42]/30[d10e304]/14[d10e345]/1:505)","packageUrl":"package.opf","page":"756"},{"cfi":"epubcfi(/6/4[ct]!/4/2[d10e42]/30[d10e304]/22[d10e386]/1:2032)","packageUrl":"package.opf","page":"757"},{"cfi":"epubcfi(/6/4[ct]!/4/2[d10e42]/30[d10e304]/34/2[d10e432]/1:0)","packageUrl":"package.opf","page":"758"}];

test("Pagelist is processed by pagination.process", 3, function() {
	var pagination = new EPUBJS.Pagination();
	pagination.process(mockPageList);
	equal( pagination.firstPage, 752, "First page is present" );
	equal( pagination.lastPage, 758,  "Last page is present" );
	equal( pagination.totalPages, 6,  "Total pages calculated" );
});

test("Get Page number from a cfi present in the pageList", 1, function() {
	var pagination = new EPUBJS.Pagination(mockPageList);
	var pg = pagination.pageFromCfi("epubcfi(/6/4[ct]!/4/2[d10e42]/26[d10e271]/4[d10e276]/3:1054)");
	equal( pg, "755", "Page is found" );
});

test("Get Page number from a cfi NOT present in the pageList, returning the closest Page", 1, function() {
	var pagination = new EPUBJS.Pagination(mockPageList);
	var pg = pagination.pageFromCfi("epubcfi(/6/4[ct]!/4/2[d10e42]/26[d10e271]/8/7:0)");
	var prevIndex = pagination.pages.indexOf("755");
	equal( pg, "755", "Closest Page is found" );
	// equal( pagination.locations.indexOf("epubcfi(/6/4[ct]!/4/2[d10e42]/26[d10e271]/8/7:0)"), 4, "Pagination.locations is updated" );
	// equal( pagination.pages[prevIndex+1], "755", "Pagination.pages is updated" );
});

test("Get Page number from a cfi NOT present in the pageList, returning the LAST Page", 1, function() {
	var pagination = new EPUBJS.Pagination(mockPageList);
	var pg = pagination.pageFromCfi("epubcfi(/6/4[ct]!/4/2[d10e42]/38/8/7:0)");
	var prevIndex = pagination.pages.indexOf("758");
	equal( pg, "758", "Closest Page is found" );
	// equal( pagination.locations.indexOf("epubcfi(/6/4[ct]!/4/2[d10e42]/38/8/7:0)"), 7, "Pagination.locations is updated" );
	// equal( pagination.pages[prevIndex+1], "758", "Pagination.pages is updated" );
});

test("Get Page number from a cfi NOT present in the pageList, returning the FIRST Page", 1, function() {
	var pagination = new EPUBJS.Pagination(mockPageList);
	var pg = pagination.pageFromCfi("epubcfi(/6/4[ct]!/4/2[d10e42]/4/8/7:0)");
	// var prevIndex = pagination.pages.indexOf("752");
	equal( pg, "752", "Closest Page is found" );
	// equal( pagination.locations.indexOf("epubcfi(/6/4[ct]!/4/2[d10e42]/4/8/7:0)"), 0, "Pagination.locations is updated" );
	// equal( pagination.pages[prevIndex+1], "752", "Pagination.pages is updated" );
});

test("Get Percentage from a page", 1, function() {
	var pagination = new EPUBJS.Pagination(mockPageList);
	var pg = pagination.percentageFromPage(755);
	equal( pg, .5, "Correct presentage reported" );
});

test("Get Percentage from a cfi present in the pageList", 1, function() {
	var pagination = new EPUBJS.Pagination(mockPageList);
	var pg = pagination.percentageFromCfi("epubcfi(/6/4[ct]!/4/2[d10e42]/26[d10e271]/4[d10e276]/3:1054)");
	equal( pg, .5, "Page is found, and correct presentage reported" );
});

test("Get Percentage from a cfi NOT present in the pageList", 1, function() {
	var pagination = new EPUBJS.Pagination(mockPageList);
	var pg = pagination.percentageFromCfi("epubcfi(/6/4[ct]!/4/2[d10e42]/20/12/1:0)");
	equal( pg, 0.167, "Page is found, and correct presentage reported" );
});

asyncTest("Generate PageList", 4, function() {
	var book = ePub('../books/moby-dick/', { width: 400, height: 600 });

	var render = book.renderTo("qunit-fixture");
	
	book.generatePagination();

	book.ready.all.then(function() {
		equal($("#qunit-fixture iframe").length, 2, "Hidden Element Added");
		equal($("#qunit-fixture iframe:nth-child(2)").width(), 400, "Iframe has given Width");
		equal($("#qunit-fixture iframe:nth-child(2)").height(), 600, "Iframe has give Height");
		start();
		stop();
	});
	
	book.pageListReady.then(function(pageList){
		equal(pageList.length, 897, "PageList has been generated");
		// fixture seems to be removed by the time this is run
		// equal($("#qunit-fixture frame").length, 1, "Hidden Element Removed"); 
		start();
	});
});


asyncTest("Load a pageList", 2, function() {
	var book = ePub('../books/moby-dick/', { width: 1076, height: 588 });

	var render = book.renderTo("qunit-fixture");
	
	EPUBJS.core.request("../examples/page_list.json").then(function(storedPageList){
		pageList = storedPageList;
		book.loadPagination(pageList);
	});

	book.pageListReady.then(function(pageList){
		equal(pageList.length, 394, "PageList has been generated");
		equal(book.pagination.lastPage, 394, "All pages present")
		start();
	});
});


asyncTest("gotoPage after generating page list", 2, function() {
	var book = ePub('../reader/moby-dick/', { width: 1076, height: 588 });

	var render = book.renderTo("qunit-fixture");
	
	book.generatePagination();

	book.pageListReady.then(function(pageList){
		// console.log(JSON.stringify(pageList));
		var changed = book.gotoPage(38);
		changed.then(function(){
			equal(book.getCurrentLocationCfi(), "epubcfi(/6/14[xchapter_001]!4/2/16/2[c001p0007]/1:1058)", "Page changed"); 
			start();
		});
		
		start();
		equal(pageList.length, 908, "PageList has been generated");
		stop();
	});
});

test("insert items into page list", null, function() {
	var pg = new EPUBJS.Pagination();
	equal(pg.locations.length, 0, "No locations");
	equal(EPUBJS.core.insert("epubcfi(/6/2[cover]!/4/6)", pg.locations, pg.epubcfi.compare), 0, "inserted first");
	equal(EPUBJS.core.insert("epubcfi(/6/2[cover]!/4/4/8/1:0)", pg.locations, pg.epubcfi.compare), 0, "inserted before first");
	equal(EPUBJS.core.insert("epubcfi(/6/2[cover]!/4/4/12/1:0)", pg.locations, pg.epubcfi.compare), 1, "inserted inbetween");
	equal(EPUBJS.core.insert("epubcfi(/6/2[cover]!/4/6/8/1:0)", pg.locations, pg.epubcfi.compare), 3, "inserted last");
	equal(EPUBJS.core.indexOfSorted("epubcfi(/6/2[cover]!/4/6)", pg.locations, pg.epubcfi.compare), 2, "already in list");
	equal(EPUBJS.core.indexOfSorted("epubcfi(/6/2[cover]!/4/60)", pg.locations, pg.epubcfi.compare), -1, "not in list");
	// equal(pg.locations.length, 2, "New locations");
});