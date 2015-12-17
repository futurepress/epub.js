// var test = require('tape');
var assert = require('assert');

// describe("Create new ePub(/path/to/epub/)", function(t) {
//
//   var book = ePub("../books/moby-dick/");
//
//   book.opened.then(function(){
//     assert.equal( book.url, "../books/moby-dick/OPS/", "book url is passed to new EPUBJS.Book" );
//   });
//
// });


describe('ePub', function() {
  var ePub = require('../src/epub');

  describe('#ePub()', function() {
    xit('should save without error', function(done) {
      var book = ePub("../books/moby-dick/");

      book.opened.then(function(){
        assert.equal( book.url, "../books/moby-dick/OPS/", "book url is passed to new EPUBJS.Book" );
        done();
      });
    });
  });
});
