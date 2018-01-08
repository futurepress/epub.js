var assert = require('assert');
// var sinon = require('sinon');


describe('ePub', function() {
	var ePub = require('../src/epub');
	var server;
	before(function(){
		/*
		// var packageContents = fs.readFileSync(__dirname + '/../books/moby-dick/OPS/package.opf', 'utf8');
		// var tocContents = fs.readFileSync(__dirname + '/../books/moby-dick/OPS/toc.xhtml', 'utf8');
		var packageContents = require('raw-loader!./fixtures/moby-dick/OPS/package.opf');
		var tocContents = require('raw-loader!./fixtures/moby-dick/OPS/toc.xhtml');

		server = sinon.fakeServer.create();
		server.autoRespond = true;

		server.respondWith("moby-dick/OPS/package.opf", [200, {
			"Content-Type": "text/xml"
		}, packageContents]);

		server.respondWith("moby-dick/OPS/toc.xhtml", [200, {
			"Content-Type": "application/xhtml+xml"
		}, tocContents]);
		*/

	});
	after(function(){
		// server.restore();
	});

	it('should open a epub and report the book on ready', function() {
		return ePub("/fixtures/alice/OPS/package.opf").then(function(book){
			assert.equal( book.metadata.title, "Alice's Adventures in Wonderland" );
			assert.equal( book.toc.length, 11);
			assert.equal( book.resources.length, 29 );
			assert.equal( book.spine.length, 13 );
			assert.equal( book.spine.length + book.resources.length, 42);
			assert.equal( book.landmarks.length, 0 );
		});
	});

	it('should open a archived epub', function() {
		assert(typeof (JSZip) !== "undefined", "JSZip is present" );

		return ePub("/fixtures/alice.epub").then(function(book){
			assert.equal( book.metadata.title, "Alice's Adventures in Wonderland" );
			assert( book.source.indexOf("alice.epub") > -1, "Archive source is present" );
		});
	});

});
