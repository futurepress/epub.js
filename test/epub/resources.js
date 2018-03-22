// import assert from "assert";
import Packaging from "../../src/epub/packaging";
import Resources from "../../src/epub/resources";

import Url from "../../src/utils/url";
import request from "../../src/utils/request";
import Archive from "../../src/epub/archive";

import chai from 'chai';
const assert = chai.assert;

describe('Resources', function() {
	let opf, packaging;

	before(function () {
		let loaded = fetch("/fixtures/alice/OPS/package.opf")
			.then((response) => {
				if (response.ok) {
					return response.text();
				}
			})
			.then((markup) => {
				opf = new DOMParser().parseFromString(markup, "application/xml");
				packaging = new Packaging(opf);
				return opf
			});

		return loaded;
	});

	describe("#split", function () {

		it("should split the resources up by type", function () {
			let resources = new Resources();
			let split = resources.split(packaging.manifest);
			assert.equal(split.html.length, 13);
			assert.equal(split.assets.length, 28);
			assert.equal(split.css.length, 1);
		});

	});

	describe("#replacements", function () {

		it("should replace the resources with blob urls", function () {
			let resources = new Resources(packaging.manifest, {
				url: "/fixtures/alice/OPS/package.opf",
				load: request
			});

			let replacements = resources.replacements();

			return replacements.then((urls) => {
				assert.equal(urls.length, 42);
			})
		});

	});

	describe("#replacementCss", function () {

		it("should create a replacement css file url from a resource", function () {
			let resources = new Resources(packaging.manifest, {
				url: "/fixtures/alice/OPS/package.opf",
				load: request
			});

			let replacement = resources.replacementCss("style");

			return replacement.then((url) => {
				assert.equal(url.indexOf("blob:") === 0, true);

				return request(url, "text").then((text) => {
					assert.equal(text.indexOf('background: url("blob:') > -1, true);
				})
			})
		});

	});

	describe("#cache", function () {

		it("should cache the resources if caches is supported", function () {
			let resources = new Resources(packaging.manifest, {
				url: "/fixtures/alice/OPS/package.opf",
				load: request
			});
			let key = "testkey-" + Date.now();
			let cached = resources.cache(key);

			return cached.then((urls) => {
				caches && caches.delete(key);
				assert.equal(urls.length, 42);
			})
		});

	});

	describe("#resolve", function () {

		it("should resolve path from a package", function () {
			let resources = new Resources(packaging.manifest, {
				url: "http://example.com/book/OPS/packaging.opf"
			});

 			let resolved = resources.resolve("chapter_001.xhtml");

			assert.equal(resolved, "http://example.com/book/OPS/chapter_001.xhtml");
		});

		it("should resolve path with slashes", function () {
			let resources = new Resources(packaging.manifest, {
				url: "http://example.com/book/OPS/packaging.opf"
			});

 			let resolved = resources.resolve("../HTML/chapter_001.xhtml");

			assert.equal(resolved, "http://example.com/book/HTML/chapter_001.xhtml");
		});

		it("should get the resource from the cache", function () {
			let resources = new Resources(packaging.manifest, {
				url: "/fixtures/alice/OPS/package.opf",
				load: request
			});
			let key = "testkey-" + Date.now();
			let cached = resources.cache(key);

			return cached.then((urls) => {
				caches && caches.delete(key);
				assert.equal(resources.resolve("chapter_001.xhtml").indexOf("testkey-") > -1, true);
			})
		});

		it("should resolve path from epub cache", function () {
			let archive;

			return fetch("/fixtures/alice.epub").then((response) => {
				return response.blob();
			}).then((blob) => {
				archive = new Archive();
				return archive.open(blob);
			}).then(() => {
				let resources = new Resources(packaging.manifest, {
					url: new Url("/OPS/packaging.opf", "http://example.com/book.epub"),
					load: archive.request.bind(archive)
				});

				let key = "testkey-" + Date.now();
				let cached = resources.cache(key);

				return cached.then((urls) => {
					caches && caches.delete(key);
					assert.equal(resources.resolve("chapter_001.xhtml").indexOf("testkey-") > -1, true);
				});
			})


		});

	});


	describe("#substitute", function () {

		it("should replace the text with provided resources", function () {
			let resources = new Resources(packaging.manifest, {
				url: "/fixtures/alice/OPS/package.opf",
				load: request
			});

			let text = "Chapter 1 is <a href='/OPS/chap1.html'>here</a>, Chapter 2 is <a href='/OPS/chap2.html'>here</a>";
			let replacements = {
				"/OPS/chap1.html": "blob://chap1.html",
				"/OPS/chap2.html": "blob://chap2.html"
			}
			let replaced = resources.substitute(text, replacements);

			assert.equal(replaced, "Chapter 1 is <a href='blob://chap1.html'>here</a>, Chapter 2 is <a href='blob://chap2.html'>here</a>");
		});
	});

	describe("#get", function () {

		it("should get a resource by ID", function () {
			let resources = new Resources(packaging.manifest, {
				url: "/fixtures/alice/OPS/package.opf",
				load: request
			});

			let r = resources.get("i001_th");

			assert.equal(r.href, "images/i001_th.jpg");
		});

		it("should get a resource by href", function () {
			let resources = new Resources(packaging.manifest, {
				url: "/fixtures/alice/OPS/package.opf",
				load: request
			});

			let r = resources.get("images/i001_th.jpg");

			assert.equal(r.id, "i001_th");
		});

	});

	describe("#injectBase", function () {

		it("should inject a base tag with an absolute url into text", function () {
			let resources = new Resources();
			let doc = "<html><head><meta charset=\"utf-8\"/></head><body>Hello<body/></html>";
			let text = resources.injectBase(doc, "https://example.com");

			assert.equal(text, "<html><head><base href=\"https://example.com\" /><meta charset=\"utf-8\"/></head><body>Hello<body/></html>");
		});

		it("should inject a base tag and add origin", function () {
			let resources = new Resources();
			let doc = "<html><head><meta charset=\"utf-8\"/></head><body>Hello<body/></html>";
			let text = resources.injectBase(doc, "/test/path");

			assert.equal(text.indexOf("http://localhost") > -1, true);
		});

	});

	describe("#injectScript", function () {

		it("should inject a script tag into text", function () {
			let resources = new Resources();
			let doc = `<html><head><meta charset="utf-8"/></head><body>Hello<body/></html>`;
			let text = resources.injectScript(doc, "https://example.com/script.js");
			assert.equal(text, `<html><head><meta charset="utf-8"/><script src="https://example.com/script.js" type="text/javascript"></script></head><body>Hello<body/></html>`);
		});

	});

	describe("#injectStyle", function () {

		it("should inject a stylesheet link into text", function () {
			let resources = new Resources();
			let doc = "<html><head><meta charset=\"utf-8\"/></head><body>Hello<body/></html>";
			let text = resources.injectStylesheet(doc, "https://example.com/styles.css");

			assert.equal(text, "<html><head><meta charset=\"utf-8\"/><link href=\"https://example.com/styles.css\" rel=\"stylesheet\" /></head><body>Hello<body/></html>");
		});

	});

	describe("#toArray", function () {

		it("should create an array", function () {
			let resources = new Resources(packaging.manifest, {
				url: "/fixtures/alice/OPS/package.opf",
				load: request
			});
			let arr = resources.toArray();

			assert.equal(arr.length, 42);
		});

	});

});
