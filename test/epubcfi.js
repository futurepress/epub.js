var assert = require('assert');


describe('EpubCFI', function() {
  var EpubCFI = require('../src/epubcfi.js');

  describe('EpubCFI()', function() {

		it('parse a cfi on init', function() {
      var cfi = EpubCFI("epubcfi(/6/2[cover]!/6)");

      assert.equal( cfi.spinePos, 0, "spinePos is parsed as the first item" );
    });

		it('parse a cfi and ignore the base if present', function() {
      var cfi = EpubCFI("epubcfi(/6/2[cover]!/6)", "/6/6[end]");

      assert.equal( cfi.spinePos, 0, "base is ignored and spinePos is parsed as the first item" );
    });

		it('parse a cfi with a charecter offset', function() {
      var cfi = EpubCFI("epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/2/1:3)");

      assert.equal( cfi.path.terminal.offset, 3, "Path has a terminal offset of 3" );
    });

		it('parse a cfi with a range', function() {
      var cfi = EpubCFI("epubcfi(/6/4[chap01ref]!/4[body01]/10[para05],/2/1:1,/3:4)");

			assert.equal( cfi.range, true, "Range is true" );
			assert.equal( cfi.start.steps.length, 2, "Start steps are present" );
      assert.equal( cfi.end.steps.length, 1, "End steps are present" );
			assert.equal( cfi.start.terminal.offset, 1, "Start has a terminal offset of 1" );
			assert.equal( cfi.end.terminal.offset, 4, "End has a terminal offset of 4" );

    });

  });

	describe('#toString()', function() {
    it('parse a cfi and write it back', function() {

      assert.equal(EpubCFI("epubcfi(/6/2[cover]!/6)").toString(), "epubcfi(/6/2[cover]!/6)", "output cfi string is same as input" );
			assert.equal(EpubCFI("epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/2/1:3)").toString(), "epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/2/1:3)", "output cfi string is same as input" );
			assert.equal(EpubCFI("epubcfi(/6/4[chap01ref]!/4[body01]/10[para05],/2/1:1,/3:4)").toString(), "epubcfi(/6/4[chap01ref]!/4[body01]/10[para05],/2/1:1,/3:4)", "output cfi string is same as input" );

    });
  });

});
