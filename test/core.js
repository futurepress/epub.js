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

});
