// import assert from "assert";
import Locations from '../../src/epub/locations';
import * as core from '../../src/utils/core';
// import fs from 'fs';
import chai from 'chai';
const assert = chai.assert;

describe('Locations', function() {

	describe('#parse', function() {
		// var chapter = require('raw-loader!../fixtures/locations.xhtml');
		// var chapter = fs.readFileSync(__dirname + '/fixtures/locations.xhtml', 'utf8');
		var chapter = window.__html__["test/fixtures/locations.xhtml"];

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
