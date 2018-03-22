// import assert from "assert";
// import Epub from "../../src/epub/epub";
import Packaging from "../../src/epub/packaging";
import chai from 'chai';
const assert = chai.assert;

describe('Packaging', function() {
	let opf;

	before(function () {
		let loaded = fetch("/fixtures/alice/OPS/package.opf")
			.then((response) => {
				if (response.ok) {
					return response.text();
				}
			})
			.then((markup) => {
				opf = new DOMParser().parseFromString(markup, "application/xml");
				return opf
			});

		return loaded;
	});


	describe('#parse', function() {
		it("should parse opf xml", function () {
			let pack = new Packaging();
			let parsed = pack.parse(opf);
			assert.equal(typeof(parsed), "object");
		})

		it("should fail if not an opf xml", function () {
			let pack = new Packaging();
			assert.throws(() => pack.parse(document), Error);
		})
	});

	describe('#parseMetadata', function() {

		it("should parse opf metadata xml", function () {
			let pack = new Packaging();
			let metadataNode = opf.querySelector("metadata");
			let parsed = pack.parseMetadata(metadataNode);

			assert.deepEqual(parsed, {
				"title": "Alice's Adventures in Wonderland",
				"creator": "Lewis Carroll",
				"description": "",
				"pubdate": "",
				"publisher": "",
				"identifier": "edu.nyu.itp.future-of-publishing.alice-in-wonderland",
				"language": "en-US",
				"rights": "Public domain in the USA.",
				"modified_date": "2012-01-18T12:47:00Z",
				"layout": "",
				"orientation": "",
				"flow": "",
				"viewport": ""
			});

		})

	});

	describe('#parseManifest', function() {

		it("should parse opf manifest xml", function () {
			let pack = new Packaging();
			let manifestNode = opf.querySelector("manifest");
			let parsed = pack.parseManifest(manifestNode);
			assert.deepEqual(parsed,  {
				"toc": {
					"href": "toc.xhtml",
					"type": "application/xhtml+xml",
					"properties": [
						"nav"
					]
				},
				"cover": {
					"href": "cover.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				},
				"style": {
					"href": "css/stylesheet.css",
					"type": "text/css",
					"properties": []
				},
				"cover-image": {
					"href": "images/cover_th.jpg",
					"type": "image/jpeg",
					"properties": [
						"cover-image"
					]
				},
				"i001_th": {
					"href": "images/i001_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i002_th": {
					"href": "images/i002_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i003_th": {
					"href": "images/i003_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i004_th": {
					"href": "images/i004_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i005_th": {
					"href": "images/i005_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i006_th": {
					"href": "images/i006_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i007_th": {
					"href": "images/i007_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i008_th": {
					"href": "images/i008_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i009_th": {
					"href": "images/i009_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i010_th": {
					"href": "images/i010_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i011_th": {
					"href": "images/i011_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i012_th": {
					"href": "images/i012_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i013_th": {
					"href": "images/i013_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i014_th": {
					"href": "images/i014_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i015_th": {
					"href": "images/i015_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i016_th": {
					"href": "images/i016_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i017_th": {
					"href": "images/i017_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i018_th": {
					"href": "images/i018_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i019_th": {
					"href": "images/i019_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i020_th": {
					"href": "images/i020_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"i022_th": {
					"href": "images/i022_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"ii021_th": {
					"href": "images/ii021_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"plate01_th": {
					"href": "images/plate01_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"plate02_th": {
					"href": "images/plate02_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"plate03_th": {
					"href": "images/plate03_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"plate04_th": {
					"href": "images/plate04_th.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"title-img": {
					"href": "images/title.jpg",
					"type": "image/jpeg",
					"properties": []
				},
				"titlepage": {
					"href": "titlepage.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				},
				"chapter_001": {
					"href": "chapter_001.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				},
				"chapter_002": {
					"href": "chapter_002.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				},
				"chapter_003": {
					"href": "chapter_003.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				},
				"chapter_004": {
					"href": "chapter_004.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				},
				"chapter_005": {
					"href": "chapter_005.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				},
				"chapter_006": {
					"href": "chapter_006.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				},
				"chapter_007": {
					"href": "chapter_007.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				},
				"chapter_008": {
					"href": "chapter_008.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				},
				"chapter_009": {
					"href": "chapter_009.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				},
				"chapter_010": {
					"href": "chapter_010.xhtml",
					"type": "application/xhtml+xml",
					"properties": []
				}
			});

		});

	});

	describe('#parseSpine', function() {

		it("should parse opf spine xml", function () {
			let pack = new Packaging();
			let spineNode = opf.querySelector("spine");
			let parsed = pack.parseSpine(spineNode);
			assert.deepEqual(parsed, [
				{
					"idref": "cover",
					"linear": "no",
					"properties": [],
					"index": 0
				},
				{
					"idref": "toc",
					"linear": "no",
					"properties": [],
					"index": 1
				},
				{
					"idref": "titlepage",
					"linear": "yes",
					"properties": [],
					"index": 2
				},
				{
					"idref": "chapter_001",
					"linear": "yes",
					"properties": [],
					"index": 3
				},
				{
					"idref": "chapter_002",
					"linear": "yes",
					"properties": [],
					"index": 4
				},
				{
					"idref": "chapter_003",
					"linear": "yes",
					"properties": [],
					"index": 5
				},
				{
					"idref": "chapter_004",
					"linear": "yes",
					"properties": [],
					"index": 6
				},
				{
					"idref": "chapter_005",
					"linear": "yes",
					"properties": [],
					"index": 7
				},
				{
					"idref": "chapter_006",
					"linear": "yes",
					"properties": [],
					"index": 8
				},
				{
					"idref": "chapter_007",
					"linear": "yes",
					"properties": [],
					"index": 9
				},
				{
					"idref": "chapter_008",
					"linear": "yes",
					"properties": [],
					"index": 10
				},
				{
					"idref": "chapter_009",
					"linear": "yes",
					"properties": [],
					"index": 11
				},
				{
					"idref": "chapter_010",
					"linear": "yes",
					"properties": [],
					"index": 12
				}
			]);
		})

	});

});
