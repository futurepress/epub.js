// import assert from "assert";
import Epub from "../../src/epub/epub";

import chai from 'chai';
const assert = chai.assert;

describe('Epub', function() {

	it('should open a epub', function() {
		var book = new Epub("/fixtures/alice/OPS/package.opf");

		return book.opened.then(function(){
			assert.equal( book.isOpen, true, "book is opened" );

			assert.equal( book.url.toString(), "http://localhost:9876/fixtures/alice/OPS/package.opf", "book url is passed to new Book" );
		});
	});

	it('should open a archived epub', function() {
		var book = new Epub("/fixtures/alice.epub");

		assert(typeof (JSZip) !== "undefined", "JSZip is present" );

		return book.opened.then(function(){
			assert.equal( book.isOpen, true, "book is opened" );
			assert( book.archive, "book is unarchived" );
		});
	});

	describe('#open', function() {

		it("should open a epub opf", function() {
			let epub = new Epub();
			let opened = epub.open("/fixtures/alice/OPS/package.opf");
			return opened.then(function(){
				assert.equal( epub.isOpen, true, "book is opened" );
				assert.equal( epub.archive, undefined, "book is not archived" );
				assert.equal( epub.url.toString(), "http://localhost:9876/fixtures/alice/OPS/package.opf", "book url is passed to new Book" );
			});
		});

		it("should open an archived epub", function() {
			let epub = new Epub();
			let opened = epub.open("/fixtures/alice.epub");
			return opened.then(function(){
				assert.equal( epub.isOpen, true, "book is opened" );
				assert( epub.archive, "book is archived" );
			});
		});

	});

	describe('#load', function() {

	});

	describe('#determineType', function() {

		it("should recognize a binary array", function() {
			let buffer = new ArrayBuffer(100);
			let type = new Epub().determineType(buffer);
			assert.equal( type, "binary");
		});

		it("should always return base64 if encoding is set to base64", function() {
			let buffer = new ArrayBuffer(100);
			let type = new Epub({
				encoding: "base64"
			}).determineType(buffer);
			assert.equal( type, "base64");

			let type_string = new Epub({
				encoding: "base64"
			}).determineType("abcdefg");
			assert.equal( type_string, "base64");
		});

		it("should recognize a directory", function() {
			let type = new Epub().determineType("https://example.com/book/");
			assert.equal( type, "directory");
		});

		it("should recognize an epub", function() {
			let type = new Epub().determineType("test.epub");
			assert.equal( type, "epub");
		});

		it("should recognize an opf", function() {
			let type = new Epub().determineType("https://example.com/book/test.opf");
			assert.equal( type, "opf");
		});
	});

	describe('#openEpub', function() {

	});

	describe('#openContainer', function() {

	});

	describe('#openPackaging', function() {
		it("should load and parse an opf", function() {
			let epub = new Epub();
			return epub.openPackaging("/fixtures/alice/OPS/package.opf").then((packaging) => {
				assert.equal( packaging.spineNodeIndex, 2);
			});
		});
	});

	describe('#unpack', function() {

		it("should unpack an opf", function() {
			let epub = new Epub();
			return epub.openPackaging("/fixtures/alice/OPS/package.opf").then((packaging) => {
				return epub.unpack(packaging).then((book) => {

					assert.equal( book.metadata.title, "Alice\'s Adventures in Wonderland");
					assert.equal( book.spine.length, 13);
					assert.equal( book.resources.length, 29);
					assert.equal( book.toc.length, 11);

				})
			});
		});
	});

	describe('#loadNavigation', function() {

		it("should load the nav file", function() {
			let epub = new Epub();
			return epub.openPackaging("/fixtures/alice/OPS/package.opf").then((packaging) => {
				return epub.loadNavigation(packaging).then((nav) => {

					assert.equal( nav.url, "/fixtures/alice/OPS/toc.xhtml");
					assert.equal( nav.toc.length, 11);
					assert.equal( nav.landmarks.length, 0);

				})
			});
		});
	});


	describe('#resolve', function() {

	});
});
