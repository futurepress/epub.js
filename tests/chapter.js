module('Chapter');
asyncTest("Create a Chapter", 2, function() {
	var book = ePub('/reader/moby-dick/', { width: 400, height: 600 });
	
	book.ready.all.then(function(){
		var chapter = book.chapter("chapter_001.xhtml");
		equal(chapter.spinePos, 6, "Chapter Pos is correct" );
		equal(chapter.href, "chapter_001.xhtml", "Chapter href is correct" );
		start();
	});
	
});

asyncTest("Load a Chapter", 2, function() {
	var book = ePub('/reader/moby-dick/', { width: 400, height: 600 });

	book.ready.all.then(function(){
		var chapter = book.chapter("chapter_001.xhtml");
		// var loaded = chapter.load();
		start();
		equal(chapter.href, "chapter_001.xhtml", "Chapter href is correct" );
		stop();
		
		chapter.loaded.then(function(){
			equal(chapter.document.firstChild.nodeName, "html", "Document HTML is loaded" );
			start();
		});
		
		
	});

});

asyncTest("Find a single query in a Chapter", 3, function() {
	var book = ePub('/reader/moby-dick/', { width: 400, height: 600 });

	book.ready.all.then(function(){
		var chapter = book.chapter("chapter_001.xhtml");
		// var loaded = chapter.load();
		start();
		equal(chapter.href, "chapter_001.xhtml", "Chapter href is correct" );
		stop();

		chapter.loaded.then(function(){
			var results = chapter.find("pythagorean maxim");
			
			equal(results.length, 1, "Results are returned" );
			equal(results[0], "epubcfi(/6/14[xchapter_001]!4/2/24/2[c001p0011]/1:227,4/2/24/2[c001p0011]/1:244)", "CFI is generated");

			start();
		});


	});

});

asyncTest("Find a query with several results in a Chapter", 3, function() {
	var book = ePub('/reader/moby-dick/', { width: 400, height: 600 });

	book.ready.all.then(function(){
		var chapter = book.chapter("chapter_001.xhtml");
		// var loaded = chapter.load();
		start();
		equal(chapter.href, "chapter_001.xhtml", "Chapter href is correct");
		stop();

		chapter.loaded.then(function(){
			var results = chapter.find("yet");

			equal(results.length, 4, "Results are returned" );
			equal(results[3], "epubcfi(/6/14[xchapter_001]!4/2/28/2[c001p0015]/1:314,4/2/28/2[c001p0015]/1:317)", "CFI is generated");

			start();
		});


	});

});