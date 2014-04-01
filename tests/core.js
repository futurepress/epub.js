module('Create');

test("Using ePub(/path/to/epub/)", 1, function() {
	var Book = ePub("../reader/moby-dick/");
	equal( Book.settings.bookPath, "../reader/moby-dick/", "bookPath is passed to new EPUBJS.Book" );
});

test("Using ePub({ bookPath: '/path/to/epub/' })", 1, function() {
	var Book = ePub({ bookPath : "../reader/moby-dick/" });
	equal( Book.settings.bookPath, "../reader/moby-dick/", "bookPath is passed to new EPUBJS.Book" );
});

test("Using EPUBJS.Book({ bookPath: '/path/to/epub/' })", 1, function() {
	var Book = new EPUBJS.Book({ bookPath : "../reader/moby-dick/" });
	equal( Book.settings.bookPath, "../reader/moby-dick/", "bookPath is passed to new EPUBJS.Book" );
});

module('Open');

// Test fails when Check for Globals is run???
asyncTest("Get book URL from bookPath", 1, function() {

	var Book = ePub();
	var opended = Book.open('/reader/moby-dick/');
	
	opended.then(function(){
		equal( Book.bookUrl, location.href.replace("tests/", '') + "reader/moby-dick/", "bookUrl is correctly resolved" );
		start();
	});


});

asyncTest("Get book URL from ../bookPath", 1, function() {

	var Book = ePub();
	var opended = Book.open('../reader/moby-dick/');
	opended.then(function(){
		equal( Book.bookUrl, "/reader/moby-dick/", "bookUrl with ../ is correctly resolved" );
		start();
	});

});

// asyncTest("Get book URL from same folder", 1, function() {
// 
// 	var Book = ePub();
// 	var opended = Book.open('/');
// 	opended.then(function(){
// 		equal( Book.bookUrl, location.href, "bookUrl with '' is correctly resolved" );
// 		start();
// 	});
// 
// });

asyncTest("Get book URL from Compressed Epub", 2, function() {

	var Book = ePub();
	var opended = Book.open('/reader/moby-dick.epub');
	opended.then(function(){
		equal( Book.contained, true, "Book is contained");
		equal( Book.bookUrl, "", "bookUrl from compressed epub should be empty string" );
		start();
	});

});


module('Contents');

asyncTest("Get Contents from Uncompressed Epub", 5, function() {

	var Book = ePub('../reader/moby-dick/');

	Book.getMetadata().then(function(meta){

		equal( meta.bookTitle, "Moby-Dick", "bookTitle should be set");
		equal( meta.creator, "Herman Melville", "creator should be set");

	});

	Book.getToc().then(function(toc){
		equal( toc.length, 141, "All TOC items have loaded");
	});

	Book.ready.all.then(function(){
		ok( true, "Book is all ready" );

		equal( Book.cover, Book.settings.contentsPath + "images/9780316000000.jpg", "Cover url is set");
		start();
	});


});

asyncTest("Get Contents from Compressed Epub", 5, function() {

	var Book = ePub('../reader/moby-dick.epub');

	Book.getMetadata().then(function(meta){

		equal( meta.bookTitle, "Moby-Dick", "bookTitle should be set");
		equal( meta.creator, "Herman Melville", "creator should be set");

	});

	Book.getToc().then(function(toc){
		equal( toc.length, 141, "All TOC items have loaded");
	});

	Book.ready.all.then(function(){
		ok( true, "Book is all ready" );
		equal( Book.cover, Book.settings.contentsPath + "images/9780316000000.jpg", "Cover url is set");

		start();
	});


});

asyncTest("Get Contents from Restored Epub", 6, function() {

	var BookFirstLoad = ePub('../reader/moby-dick/', { restore: true, reload: true });
	
	equal( BookFirstLoad.settings.restore, true, "Book settings are being restored");

	BookFirstLoad.ready.all.then(function(){
		
		BookFirstLoad.destroy();

		var Book = ePub('../reader/moby-dick/', { restore: true });

		// equal( Book.settings.contentsPath, "/reader/moby-dick/OPS/", "contentsPath was restored");

		Book.getMetadata().then(function(meta){

			equal( meta.bookTitle, "Moby-Dick", "bookTitle should be set");
			equal( meta.creator, "Herman Melville", "creator should be set");

		});

		Book.getToc().then(function(toc){
			equal( toc.length, 141, "All TOC items have loaded");
		});

		Book.ready.all.then(function(){
			ok( true, "Book is all ready" );
			equal( Book.cover, Book.settings.contentsPath + "images/9780316000000.jpg", "Cover url is set");

			start();
		});

	});

});
