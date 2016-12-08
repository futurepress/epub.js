var assert = require('assert');

describe('Locations', function() {
	var Locations = require('../src/locations');
	var core = require('../src/utils/core');

	describe('#parse', function() {
		var Locations = require('../src/locations');
		var chapter = require('raw-loader!./fixtures/locations.xhtml');

		it('parse locations from a document', function() {
			var doc = core.parse(chapter, "application/xhtml+xml");
			var contents = doc.documentElement;
			var locations = new Locations();
			var result = locations.parse(contents, "/6/4[chap01ref]", 100);
			assert.equal(result.length, 15);

		});

		it('parse locations from xmldom', function() {
			var doc = core.parse(chapter, "application/xhtml+xml", true);
			var contents = doc.documentElement;

			var locations = new Locations();
			var result = locations.parse(contents, "/6/4[chap01ref]", 100);
			assert.equal(result.length, 15);

		});

	});

});
