import Book from '../src/book';
import assert from 'assert';

describe('Book', function() {

	describe('Unarchived', function() {
		var book = new Book("/fixtures/alice/OPS/package.opf");
		it('should open a epub', async function() {
			await book.opened
			assert.equal(book.isOpen, true, "book is opened");
			assert.equal( book.url.toString(), "http://localhost:9876/fixtures/alice/OPS/package.opf", "book url is passed to new Book" );
		});
		it('should have a local coverUrl', async function() {
			assert.equal( await book.coverUrl(), "http://localhost:9876/fixtures/alice/OPS/images/cover_th.jpg", "cover url is available" );
		});
	});

	describe('Archived epub', function() {
		var book = new Book("/fixtures/alice.epub");

		it('should open a archived epub', async function() {
			await book.opened
			assert.equal(book.isOpen, true, "book is opened");
			assert(book.archive, "book is unarchived");
		});
		it('should have a blob coverUrl', async function() {
			let coverUrl = await book.coverUrl()
			assert( /^blob:http:\/\/localhost:9876\/[^\/]+$/.test(coverUrl), "cover url is available and a blob: url" );
		});
	});

	describe('Archived epub in array buffer without options', function() {
		let book;

		before(async function() {
			const response = await fetch("/fixtures/alice.epub");
			const buffer = await response.arrayBuffer()
			book = new Book(buffer)
		})

		it('should open a archived epub', async function() {
			await book.opened
			assert.equal(book.isOpen, true, "book is opened");
			assert(book.archive, "book is unarchived");
		});

		it('should have a blob coverUrl', async function() {
			let coverUrl = await book.coverUrl()
			assert( /^blob:http:\/\/localhost:9876\/[^\/]+$/.test(coverUrl), "cover url is available and a blob: url" );
		});
	});

	describe('Archived epub without cover', function() {
		var book = new Book("/fixtures/alice_without_cover.epub");

		it('should open a archived epub', async function() {
			await book.opened
			assert.equal(book.isOpen, true, "book is opened");
			assert(book.archive, "book is unarchived");
		});
		it('should have a empty coverUrl', async function() {
			let coverUrl = await book.coverUrl()
			assert.equal(coverUrl, null, "cover url should be null" );
		});
	});
});
