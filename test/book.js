import Book from "../src/book/book";
import assert from "assert";

describe('Book', function() {

	before(function(){

	});

	it('should open an opf file', function() {
		let book = new Book("/fixtures/alice/OPS/package.opf");

		return book.opened.then(function(){
			assert.equal( book.isOpen, true, "book is opened" );

			assert.equal( book.url.toString(), "http://localhost:9876/fixtures/alice/OPS/package.opf", "book url is passed to new Book" );
		});
	});

	describe('#toObject', function() {

		it('should export an opf file to a manifest object', function() {
			let book = new Book("/fixtures/alice/OPS/package.opf");

			return book.ready.then(function(){
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

		it('should export an opf file to a manifest json', function() {
			let book = new Book("/fixtures/alice/OPS/package.opf");

			return book.ready.then(function(){
				let json = book.toJSON();
				// console.log(json);
				assert.equal( json, `{"metadata":{"title":"Alice's Adventures in Wonderland","creator":"Lewis Carroll","description":"","pubdate":"","publisher":"","identifier":"edu.nyu.itp.future-of-publishing.alice-in-wonderland","language":"en-US","rights":"Public domain in the USA.","modified_date":"2012-01-18T12:47:00Z","layout":"","orientation":"","flow":"","viewport":"","direction":null,"@type":"http://schema.org/Book"},"spine":[{"idref":"cover","linear":false,"href":"cover.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/cover.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/cover.xhtml"},{"idref":"toc","linear":false,"href":"toc.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/toc.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/toc.xhtml"},{"idref":"titlepage","linear":true,"href":"titlepage.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/titlepage.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/titlepage.xhtml"},{"idref":"chapter_001","linear":true,"href":"chapter_001.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/chapter_001.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_001.xhtml"},{"idref":"chapter_002","linear":true,"href":"chapter_002.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/chapter_002.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_002.xhtml"},{"idref":"chapter_003","linear":true,"href":"chapter_003.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/chapter_003.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_003.xhtml"},{"idref":"chapter_004","linear":true,"href":"chapter_004.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/chapter_004.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_004.xhtml"},{"idref":"chapter_005","linear":true,"href":"chapter_005.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/chapter_005.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_005.xhtml"},{"idref":"chapter_006","linear":true,"href":"chapter_006.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/chapter_006.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_006.xhtml"},{"idref":"chapter_007","linear":true,"href":"chapter_007.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/chapter_007.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_007.xhtml"},{"idref":"chapter_008","linear":true,"href":"chapter_008.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/chapter_008.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_008.xhtml"},{"idref":"chapter_009","linear":true,"href":"chapter_009.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/chapter_009.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_009.xhtml"},{"idref":"chapter_010","linear":true,"href":"chapter_010.xhtml","url":"http://localhost:9876/fixtures/alice/OPS/chapter_010.xhtml","type":"application/xhtml+xml","canonical":"http://localhost:9876/fixtures/alice/OPS/chapter_010.xhtml"}],"resources":[{"href":"toc.xhtml","type":"application/xhtml+xml","properties":["nav"],"rel":"contents"},{"href":"cover.xhtml","type":"application/xhtml+xml","properties":[]},{"href":"css/stylesheet.css","type":"text/css","properties":[]},{"href":"images/cover_th.jpg","type":"image/jpeg","properties":["cover-image"],"rel":"cover"},{"href":"images/i001_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i002_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i003_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i004_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i005_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i006_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i007_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i008_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i009_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i010_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i011_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i012_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i013_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i014_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i015_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i016_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i017_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i018_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i019_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i020_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/i022_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/ii021_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/plate01_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/plate02_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/plate03_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/plate04_th.jpg","type":"image/jpeg","properties":[]},{"href":"images/title.jpg","type":"image/jpeg","properties":[]},{"href":"titlepage.xhtml","type":"application/xhtml+xml","properties":[]},{"href":"chapter_001.xhtml","type":"application/xhtml+xml","properties":[]},{"href":"chapter_002.xhtml","type":"application/xhtml+xml","properties":[]},{"href":"chapter_003.xhtml","type":"application/xhtml+xml","properties":[]},{"href":"chapter_004.xhtml","type":"application/xhtml+xml","properties":[]},{"href":"chapter_005.xhtml","type":"application/xhtml+xml","properties":[]},{"href":"chapter_006.xhtml","type":"application/xhtml+xml","properties":[]},{"href":"chapter_007.xhtml","type":"application/xhtml+xml","properties":[]},{"href":"chapter_008.xhtml","type":"application/xhtml+xml","properties":[]},{"href":"chapter_009.xhtml","type":"application/xhtml+xml","properties":[]},{"href":"chapter_010.xhtml","type":"application/xhtml+xml","properties":[]}],"toc":[{"href":"titlepage.xhtml","title":"Title Page"},{"href":"chapter_001.xhtml","title":"Down The Rabbit-Hole"},{"href":"chapter_002.xhtml","title":"The Pool Of Tears"},{"href":"chapter_003.xhtml","title":"A Caucus-Race And A Long Tale"},{"href":"chapter_004.xhtml","title":"The Rabbit Sends In A Little Bill"},{"href":"chapter_005.xhtml","title":"Advice From A Caterpillar"},{"href":"chapter_006.xhtml","title":"Pig And Pepper"},{"href":"chapter_007.xhtml","title":"A Mad Tea-Party"},{"href":"chapter_008.xhtml","title":"The Queen's Croquet Ground"},{"href":"chapter_009.xhtml","title":"Who Stole The Tarts?"},{"href":"chapter_010.xhtml","title":"Alice's Evidence"}],"landmarks":[],"@context":"http://readium.org/webpub/default.jsonld","links":[{"rel":"self","href":"/fixtures/alice/OPS/manifest.json","type":"application/webpub+json"}]}` );
			});
		});

	});


});

