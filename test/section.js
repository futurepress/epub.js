var assert = require("assert");
var ePub = require('../src/epub');

describe("section", function() {
        it("finds a single result in a section", function() {
                var book = ePub("./fixtures/moby-dick/", {width: 400, height: 400});
                return book.ready.then(function() {
                        var section = book.section("chapter_001.xhtml");
                        return section.load().then(function() {
                                var results = section.find("pythagorean maxim");
                                assert.equal(results.length, 1);
                                assert.equal(results[0].cfi, "epubcfi(/6/14[xchapter_001]!/4/2/24/2[c001p0011],/1:227,/1:244)"); 
                                assert.equal(results[0].excerpt, "...r more prevalent than winds from astern (that is, if you never violate the Pythagorean maxim), so for the most part the Commodore on the quarter-deck ...");
                        });
                });
        });

        it("finds multiple results in a section", function() {
                var book = ePub("./fixtures/moby-dick/", {width: 400, height: 400});
                return book.ready.then(function() {
                        var section = book.section("chapter_001.xhtml");
                        return section.load().then(function() {
                                var results = section.find("yet");
                                assert.equal(results.length, 4);
                                assert.equal(results[0].cfi, "epubcfi(/6/14[xchapter_001]!/4/2/10/2[c001p0004],/1:461,/1:464)");
                                assert.equal(results[0].excerpt, "...e from lanes and alleys, streets and avenues—north, east, south, and west. Yet here they all unite. Tell me, does the magnetic virtue of the needles o...");
                                assert.equal(results[1].cfi, "epubcfi(/6/14[xchapter_001]!/4/2/14/2[c001p0006],/1:639,/1:642)");
                                assert.equal(results[1].excerpt, "...his pine-tree shakes down its sighs like leaves upon this shepherd’s head, yet all were vain, unless the shepherd’s eye were fixed upon the magic stre...");
                                assert.equal(results[2].cfi, "epubcfi(/6/14[xchapter_001]!/4/2/16/2[c001p0007],/1:1019,/1:1022)");
                                assert.equal(results[2].excerpt, "...s considerable glory in that, a cook being a sort of officer on ship-board—yet, somehow, I never fancied broiling fowls;—though once broiled, judiciou...");
                                assert.equal(results[3].cfi, "epubcfi(/6/14[xchapter_001]!/4/2/28/2[c001p0015],/1:314,/1:317)");
                                assert.equal(results[3].excerpt, "...dies, and jolly parts in farces—though I cannot tell why this was exactly; yet, now that I recall all the circumstances, I think I can see a little in...");
                        });
                });

        });
});
