import {
	uuid,
	documentHeight,
	isElement,
	isNumber,
	isFloat
} from "../src/utils/core";

var assert = require('assert');
describe('Core', function() {


	before(function(){

	});


	describe('Url', function () {

		var Url = require('../src/utils/url');

		it("Url()", function() {
			var url = new Url("http://example.com/fred/chasen/derf.html");

			assert.equal( url.href, "http://example.com/fred/chasen/derf.html" );
			assert.equal( url.directory, "/fred/chasen/" );
			assert.equal( url.extension, "html" );
			assert.equal( url.filename, "derf.html" );
			assert.equal( url.origin, "http://example.com" );
			assert.equal( url.protocol, "http:" );
			assert.equal( url.search, "" );
		});

		describe('#resolve()', function () {
			it("should join subfolders", function() {
				var a = "http://example.com/fred/chasen/";
				var b = "ops/derf.html";

				var resolved = new Url(a).resolve(b);
				assert.equal( resolved, "http://example.com/fred/chasen/ops/derf.html" );
			});

			it("should resolve up a level", function() {
				var a = "http://example.com/fred/chasen/index.html";
				var b = "../derf.html";

				var resolved = new Url(a).resolve(b);
				assert.equal( resolved, "http://example.com/fred/derf.html" );
			});

			it("should resolve absolute", function() {
				var a = "http://example.com/fred/chasen/index.html";
				var b = "/derf.html";

				var resolved = new Url(a).resolve(b);
				assert.equal( resolved, "http://example.com/derf.html" );
			});

			it("should resolve with search strings", function() {
				var a = "http://example.com/fred/chasen/index.html?debug=true";
				var b = "/derf.html";

				var resolved = new Url(a).resolve(b);
				assert.equal( resolved, "http://example.com/derf.html" );
			});

			// Doesn't work with path.parse
			xit("should handle directory with a dot", function() {
				var a = "http://example.com/fred/chasen/index.epub/";

				var url = new Url(a);
				assert.equal( url.directory, "/fred/chasen/index.epub/" );
				assert.equal( url.extension, "" );
			});

			it("should handle file urls", function() {
				var url = new Url("file:///var/mobile/Containers/Data/Application/F47E4434-9B98-4654-93F1-702336B08EE6/Documents/books/moby-dick/derf.html");

				assert.equal( url.href, "file:///var/mobile/Containers/Data/Application/F47E4434-9B98-4654-93F1-702336B08EE6/Documents/books/moby-dick/derf.html" );
				assert.equal( url.directory, "/var/mobile/Containers/Data/Application/F47E4434-9B98-4654-93F1-702336B08EE6/Documents/books/moby-dick/" );
				assert.equal( url.extension, "html" );
				assert.equal( url.filename, "derf.html" );
				assert.equal( url.origin, "file://" ); // origin should be blank
				assert.equal( url.protocol, "file:" );
				assert.equal( url.search, "" );
			});

			it("should resolve with file urls", function() {
				var a = "file:///var/mobile/Containers/Data/Application/books/";
				var b = "derf.html";

				var resolved = new Url(a).resolve(b);
				assert.equal( resolved, "file:///var/mobile/Containers/Data/Application/books/derf.html" );
			});

		});
	});

	describe('Path', function () {

		var Path = require('../src/utils/path');

		it("Path()", function() {
			var path = new Path("/fred/chasen/derf.html");

			assert.equal( path.path, "/fred/chasen/derf.html" );
			assert.equal( path.directory, "/fred/chasen/" );
			assert.equal( path.extension, "html" );
			assert.equal( path.filename, "derf.html" );
		});

		it("Strip out url", function() {
			var path = new Path("http://example.com/fred/chasen/derf.html");

			assert.equal( path.path, "/fred/chasen/derf.html" );
			assert.equal( path.directory, "/fred/chasen/" );
			assert.equal( path.extension, "html" );
			assert.equal( path.filename, "derf.html" );
		});

		describe('#parse()', function () {
			it("should parse a path", function() {
				var path = Path.prototype.parse("/fred/chasen/derf.html");

				assert.equal( path.dir, "/fred/chasen" );
				assert.equal( path.base, "derf.html" );
				assert.equal( path.ext, ".html" );
			});

			it("should parse a relative path", function() {
				var path = Path.prototype.parse("fred/chasen/derf.html");

				assert.equal( path.dir, "fred/chasen" );
				assert.equal( path.base, "derf.html" );
				assert.equal( path.ext, ".html" );
			});
		});

		describe('#isDirectory()', function () {
			it("should recognize a directory", function() {
				var directory = Path.prototype.isDirectory("/fred/chasen/");
				var notDirectory = Path.prototype.isDirectory("/fred/chasen/derf.html");

				assert(directory, "/fred/chasen/ is a directory" );
				assert(!notDirectory, "/fred/chasen/derf.html is not directory" );
			});
		});

		describe('#resolve()', function () {

			it("should resolve a path", function() {
				var a = "/fred/chasen/index.html";
				var b = "derf.html";

				var resolved = new Path(a).resolve(b);
				assert.equal(resolved, "/fred/chasen/derf.html" );
			});

			it("should resolve a relative path", function() {
				var a = "fred/chasen/index.html";
				var b = "derf.html";

				var resolved = new Path(a).resolve(b);
				assert.equal(resolved, "/fred/chasen/derf.html" );
			});

			it("should resolve a level up", function() {
				var a = "/fred/chasen/index.html";
				var b = "../derf.html";

				var resolved = new Path(a).resolve(b);
				assert.equal(resolved, "/fred/derf.html" );
			});

		});

		describe('#relative()', function () {

			it("should find a relative path at the same level", function() {
				var a = "/fred/chasen/index.html";
				var b = "/fred/chasen/derf.html";

				var relative = new Path(a).relative(b);
				assert.equal(relative, "derf.html" );
			});

			it("should find a relative path down a level", function() {
				var a = "/fred/chasen/index.html";
				var b = "/fred/chasen/ops/derf.html";

				var relative = new Path(a).relative(b);
				assert.equal(relative, "ops/derf.html" );
			});

			it("should resolve a level up", function() {
				var a = "/fred/chasen/index.html";
				var b = "/fred/derf.html";

				var relative = new Path(a).relative(b);
				assert.equal(relative, "../derf.html" );
			});

		});


	});

	describe("Uuid", function () {

		it("should return a valid uuid", function() {
			let id = uuid();
			let pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
			assert.equal( pattern.test(id), true );
		});

		it("should return a differnt uuid each time it is called", function() {
			let idA = uuid();
			let idB = uuid();

			assert.notEqual( idA, idB );
		});

	});

	describe("documentHeight", function functionName() {

		it("should get the document height", function () {
			let height = documentHeight();

			assert.equal( height, document.documentElement.clientHeight );

		})
	});

	describe("isElement", function functionName() {

		it("should return true for an element", function () {
			let el = document.createElement("a");
			assert.equal( isElement(el), true );
		});

		it("should return false for a textNode", function () {
			let el = document.createElement("a");
			el.textContent = "text";

			assert.equal( isElement(el.childNodes[0]), false);
		});

	});

	describe("isNumber", function () {

		it("should return true for number", function () {
			assert.equal( isNumber(1), true );
			assert.equal( isNumber(1.0), true );
			assert.equal( isNumber(1/2), true );
		});

		it("should return false for string", function () {
			assert.equal( isNumber('Hello'), false);
		});

		it("should return true for string representing numbers", function () {
			assert.equal( isNumber('1'), true);
			assert.equal( isNumber('1.0'), true);
		});

		it("should return false for NaN", function () {
			assert.equal( isNumber(NaN), false);
			assert.equal( isNumber(1/0), false);
			assert.equal( isNumber(undefined), false);
		});

	});

	describe("isFloat", function () {

		it("should return true for floats", function () {
			assert.equal( isFloat(1.5), true );
			assert.equal( isFloat(1/2), true );
		});

		// Have not yet found a way to handle this
		xit("should return true for floats that are integers", function () {
			assert.equal( isFloat(1.0), true );
			assert.equal( isFloat('1.0'), true);
		});

		it("should return false for string", function () {
			assert.equal( isFloat('Hello'), false);
		});

		it("should return true for string representing numbers", function () {
			assert.equal( isFloat('1.2'), true);
		});

		it("should return false for integers", function () {
			assert.equal( isFloat(1), false);
			assert.equal( isFloat('1'), false);
		});

	});

});
