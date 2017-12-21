import Book from "../../src/book/book";
import assert from "assert";

describe("Book", function() {
	let manifest = [
		{
			"href": "http://localhost:9876/testkey-1513720249210/OPS/toc.xhtml",
			"type": "application/xhtml+xml",
			"properties": [
				"nav"
			],
			"id": "toc",
			"source": "toc.xhtml"
		},
		{
			"href": "http://localhost:9876/testkey-1513720249210/OPS/cover.xhtml",
			"type": "application/xhtml+xml",
			"properties": [],
			"id": "cover",
			"source": "cover.xhtml"
		},
		{
			"href": "http://localhost:9876/testkey-1513720249210/OPS/css/stylesheet.css",
			"type": "text/css",
			"properties": [],
			"id": "style",
			"source": "css/stylesheet.css"
		},
		{
			"href": "http://localhost:9876/testkey-1513720249210/OPS/images/cover_th.jpg",
			"type": "image/jpeg",
			"properties": [
				"cover-image"
			],
			"id": "cover-image",
			"source": "images/cover_th.jpg"
		},
		{
			"href": "http://localhost:9876/testkey-1513720249210/OPS/chapter_001.xhtml",
			"type": "application/xhtml+xml",
			"properties": [],
			"id": "chapter_001",
			"source": "chapter_001.xhtml"
		}
	];

	let spine = [
	  {
	    "idref": "chapter_001",
	    "linear": "yes",
	    "properties": [],
	    "index": 3,
	    "cfiBase": "/6/8[chapter_001]",
			"href": "http://localhost:9876/testkey-1513720249210/OPS/chapter_001.xhtml",
	    "source": "chapter_001.xhtml",
	    "type": "application/xhtml+xml"
	  },
	  {
	    "idref": "chapter_002",
	    "linear": "yes",
	    "properties": [],
	    "index": 4,
	    "cfiBase": "/6/10[chapter_002]",
			"href": "http://localhost:9876/testkey-1513720249210/OPS/chapter_002.xhtml",
	    "source": "chapter_002.xhtml",
	    "type": "application/xhtml+xml"
	  }
	]

	before(function(){

	});

	describe('#metadata', function() {
		let metadata = {
			"title": "Moby-Dick",
			"author": "Herman Melville",
			"identifier": "urn:isbn:978031600000X",
			"language": "en",
			"modified": "2015-09-29T17:00:00Z"
		};

		it('should set metadata from a object', function() {
			let book = new Book();

			book.metadata = metadata;

			assert.deepEqual( book.metadata, metadata );
		});

		it('should get metadata from model', function() {

			let book = new Book({
				metadata
			});

			assert.equal( book.metadata.title, "Moby-Dick" );
		});

	});

	describe('#resources', function() {

		it('should set resources from an array', function() {

			let book = new Book();

			book.resources = manifest;

			assert.deepEqual( book.resources, manifest );
		});

		it('should get resources from model', function() {

			let book = new Book({
				resources: manifest
			});

			assert.deepEqual( book.resources, manifest );
		});

	});

	describe('#spine', function() {

		it('should set spine from an array', function() {

			let book = new Book();

			book.spine = spine;

			assert.equal( book.spine.length, 2 );
		});

		it('should get resources from model', function() {

			let book = new Book({
				spine: spine
			});

			assert.equal( book.spine.length, 2 );
		});

	});

	describe('#cover', function() {

		it('should set cover from a url', function() {
			let url = "http://example.com/book/OPS/images/cover.jpg";

			let book = new Book();

			book.cover = url;

			assert.equal( book.cover, url );
		});

		it('should get the cover from model', function() {

			let book = new Book({
				resources: manifest
			});


			assert.equal( book.cover, "http://localhost:9876/testkey-1513720249210/OPS/images/cover_th.jpg" );
		});

	});

	describe('#section', function() {

		it('should get a section from the spine by source', function() {
			let book = new Book({
				spine: spine
			});
			let section = book.section("chapter_001.xhtml");
			assert.equal( section.index , 0 );
		});

		it('should get a section from the spine by id', function() {
			let book = new Book({
				spine: spine
			});
			let section = book.section("chapter_001");
			assert.equal( section.index , 0 );
		});

		it('should get a section from the spine by href', function() {
			let book = new Book({
				spine: spine
			});
			let section = book.section("http://localhost:9876/testkey-1513720249210/OPS/chapter_001.xhtml");
			assert.equal( section.index , 0 );
		});

	});

	it('should open a manifest file', function() {
		return fetch("/fixtures/manifest.json").then((response) => {
			return response.json();
		}).then((manifest) => {
			let book = new Book(manifest);

			assert.equal( book.metadata.title, "Moby-Dick" );
			assert.equal( book.resources.length, 5 );
			assert.equal( book.spine.length, 2 );
		});
	});

	describe('#toObject', function() {

		it('should export to a manifest object', function() {
			return fetch("/fixtures/manifest.json").then((response) => {
				return response.json();
			}).then((manifest) => {
				let book = new Book(manifest);
				let object = book.toObject();

				assert.equal( object.metadata.title, "Moby-Dick" );
				assert.equal( object.resources.length, 5 );
				assert.equal( object.spine.length, 2 );
			});
		});

		xit('should export an opf file to a manifest object', function() {
			return fetch("/fixtures/alice.json").then((response) => {
				return response.json();
			}).then((manifest) => {
				let book = new Book(manifest);
				let object = book.toObject();

				assert.equal( object.metadata.title, "Alice's Adventures in Wonderland" );
				assert.equal( object.toc.length, 11);
				assert.equal( object.resources.length, 42 );
				assert.equal( object.spine.length, 13 );
				assert.equal( object.landmarks.length, 0 );
			});
		});

	});

	describe('#toJSON', function() {

		xit('should export an opf file to a manifest json', function() {
			let book = new Book("/fixtures/alice/OPS/package.opf");

			return book.ready.then(function(){
				let json = book.toJSON();
				// console.log(json);
				assert.equal( json, `{"metadata":{"title":"Alice's Adventures in Wonderland","creator":"Lewis Carroll","description":"","pubdate":"","publisher":"","identifier":"edu.nyu.itp.future-of-publishing.alice-in-wonderland","language":"en-US","rights":"Public domain in the USA.","modified_date":"2012-01-18T12:47:00Z","layout":"","orientation":"","flow":"","viewport":"","direction":null,"@type":"http://schema.org/Book"},"spine":[{"idref":"cover","linear":false,"href":"http://localhost:9876/fixtures/alice/OPS/cover.xhtml","source":"cover.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/cover.xhtml"},{"idref":"toc","linear":false,"href":"http://localhost:9876/fixtures/alice/OPS/toc.xhtml","source":"toc.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/toc.xhtml"},{"idref":"titlepage","linear":true,"href":"http://localhost:9876/fixtures/alice/OPS/titlepage.xhtml","source":"titlepage.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/titlepage.xhtml"},{"idref":"chapter_001","linear":true,"href":"http://localhost:9876/fixtures/alice/OPS/chapter_001.xhtml","source":"chapter_001.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_001.xhtml"},{"idref":"chapter_002","linear":true,"href":"http://localhost:9876/fixtures/alice/OPS/chapter_002.xhtml","source":"chapter_002.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_002.xhtml"},{"idref":"chapter_003","linear":true,"href":"http://localhost:9876/fixtures/alice/OPS/chapter_003.xhtml","source":"chapter_003.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_003.xhtml"},{"idref":"chapter_004","linear":true,"href":"http://localhost:9876/fixtures/alice/OPS/chapter_004.xhtml","source":"chapter_004.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_004.xhtml"},{"idref":"chapter_005","linear":true,"href":"http://localhost:9876/fixtures/alice/OPS/chapter_005.xhtml","source":"chapter_005.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_005.xhtml"},{"idref":"chapter_006","linear":true,"href":"http://localhost:9876/fixtures/alice/OPS/chapter_006.xhtml","source":"chapter_006.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_006.xhtml"},{"idref":"chapter_007","linear":true,"href":"http://localhost:9876/fixtures/alice/OPS/chapter_007.xhtml","source":"chapter_007.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_007.xhtml"},{"idref":"chapter_008","linear":true,"href":"http://localhost:9876/fixtures/alice/OPS/chapter_008.xhtml","source":"chapter_008.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_008.xhtml"},{"idref":"chapter_009","linear":true,"href":"http://localhost:9876/fixtures/alice/OPS/chapter_009.xhtml","source":"chapter_009.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_009.xhtml"},{"idref":"chapter_010","linear":true,"href":"http://localhost:9876/fixtures/alice/OPS/chapter_010.xhtml","source":"chapter_010.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_010.xhtml"}],"resources":[{"href":"http://localhost:9876/fixtures/alice/OPS/toc.xhtml","type":"application/xhtml+xml","properties":["nav"],"source":"http://localhost:9876/fixtures/alice/OPS/toc.xhtml","rel":"contents"},{"href":"http://localhost:9876/fixtures/alice/OPS/cover.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/cover.xhtml"},{"href":"http://localhost:9876/fixtures/alice/OPS/css/stylesheet.css","type":"text/css","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/css/stylesheet.css"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/cover_th.jpg","type":"image/jpeg","properties":["cover-image"],"source":"http://localhost:9876/fixtures/alice/OPS/images/cover_th.jpg","rel":"cover"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i001_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i001_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i002_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i002_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i003_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i003_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i004_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i004_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i005_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i005_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i006_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i006_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i007_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i007_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i008_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i008_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i009_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i009_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i010_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i010_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i011_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i011_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i012_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i012_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i013_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i013_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i014_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i014_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i015_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i015_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i016_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i016_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i017_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i017_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i018_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i018_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i019_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i019_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i020_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i020_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/i022_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/i022_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/ii021_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/ii021_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/plate01_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/plate01_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/plate02_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/plate02_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/plate03_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/plate03_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/plate04_th.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/plate04_th.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/images/title.jpg","type":"image/jpeg","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/images/title.jpg"},{"href":"http://localhost:9876/fixtures/alice/OPS/titlepage.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/titlepage.xhtml"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_001.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/chapter_001.xhtml"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_002.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/chapter_002.xhtml"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_003.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/chapter_003.xhtml"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_004.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/chapter_004.xhtml"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_005.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/chapter_005.xhtml"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_006.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/chapter_006.xhtml"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_007.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/chapter_007.xhtml"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_008.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/chapter_008.xhtml"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_009.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/chapter_009.xhtml"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_010.xhtml","type":"application/xhtml+xml","properties":[],"source":"http://localhost:9876/fixtures/alice/OPS/chapter_010.xhtml"}],"toc":[{"href":"http://localhost:9876/fixtures/alice/OPS/titlepage.xhtml","title":"Title Page"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_001.xhtml","title":"Down The Rabbit-Hole"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_002.xhtml","title":"The Pool Of Tears"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_003.xhtml","title":"A Caucus-Race And A Long Tale"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_004.xhtml","title":"The Rabbit Sends In A Little Bill"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_005.xhtml","title":"Advice From A Caterpillar"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_006.xhtml","title":"Pig And Pepper"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_007.xhtml","title":"A Mad Tea-Party"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_008.xhtml","title":"The Queen's Croquet Ground"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_009.xhtml","title":"Who Stole The Tarts?"},{"href":"http://localhost:9876/fixtures/alice/OPS/chapter_010.xhtml","title":"Alice's Evidence"}],"landmarks":[],"pageList":[],"@context":"http://readium.org/webpub/default.jsonld","links":[{"rel":"self","href":"/fixtures/alice/OPS/manifest.json","type":"application/webpub+json"}]}` );
			});
		});

	});


});
