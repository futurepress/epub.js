var assert = require('assert');
var sinon = require('sinon');
var fs = require('fs');


describe('ePub', function() {
  var ePub = require('../src/epub');
  var server;
  before(function(){
    var packageContents = fs.readFileSync(__dirname + '/../books/moby-dick/OPS/package.opf', 'utf8');
    var tocContents = fs.readFileSync(__dirname + '/../books/moby-dick/OPS/toc.xhtml', 'utf8');

    server = sinon.fakeServer.create();
    server.autoRespond = true;

    server.respondWith("moby-dick/OPS/package.opf", [200, {
      "Content-Type": "text/xml"
    }, packageContents]);

    server.respondWith("moby-dick/OPS/toc.xhtml", [200, {
      "Content-Type": "application/xhtml+xml"
    }, tocContents]);


  });
  after(function(){
    server.restore();
  });

  it('should open a epub', function(done) {
    var book = ePub("moby-dick/OPS/package.opf");

    book.opened.then(function(){
      assert.equal( book.isOpen, true, "book is opened" );
      assert.equal( book.url, "moby-dick/OPS/package.opf", "book url is passed to new Book" );
      done();
    });
  });
});
