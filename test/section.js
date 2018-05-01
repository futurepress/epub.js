var assert = require("assert");
var ePub = require('../src/epub');

describe("section", function() {
        it("finds a single result in a section", function() {
                var book = ePub("./fixtures/alice/", {width: 400, height: 400});
                return book.ready.then(function() {
                        var section = book.section("chapter_001.xhtml");
                        return section.load().then(function() {
                                var results = section.find("they were filled with cupboards and book-shelves");
                                assert.equal(results.length, 1);
                                assert.equal(results[0].cfi, "epubcfi(/6/8[chapter_001]!/4/2/16,/1:275,/1:323)");
                                assert.equal(results[0].excerpt, "... see anything; then she looked at the sides of the well and\n\t\tnoticed that they were filled with cupboards and book-shelves; here and there she saw\n\t\t...");
                        });
                });
        });

        it("finds multiple results in a section", function() {
                var book = ePub("./fixtures/alice/", {width: 400, height: 400});
                return book.ready.then(function() {
                        var section = book.section("chapter_001.xhtml");
                        return section.load().then(function() {
                                var results = section.find("white rabbit");
                                assert.equal(results.length, 2);
                                assert.equal(results[0].cfi, "epubcfi(/6/8[chapter_001]!/4/2/8,/1:240,/1:252)");
                                assert.equal(results[0].excerpt, "...e worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her....");
                                assert.equal(results[1].cfi, "epubcfi(/6/8[chapter_001]!/4/2/20,/1:148,/1:160)");
                                assert.equal(results[1].excerpt, "...ut it was\n\t\tall dark overhead; before her was another long passage and the White Rabbit was still\n\t\tin sight, hurrying down it. There was not a moment...");
                       });
                });

        });
});
