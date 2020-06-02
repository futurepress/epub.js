import assert from 'assert';
import Locations from '../src/locations';
import * as core from '../src/utils/core';

describe('Locations', function() {

	describe('#parse', function() {
		var chapter = require('./fixtures/locations.xhtml').default;

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
