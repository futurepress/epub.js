if (typeof EPUBJS === 'undefined') {
	(typeof window !== 'undefined' ? window : this).EPUBJS = {};
}

EPUBJS.VERSION = "0.3.0";

var Book = require('./book');
var RSVP = require("rsvp");

function ePub(_url) {
	return new Book(_url);
};

if (typeof window !== 'undefined') {
	window.ePub = ePub;
	window.RSVP = window.RSVP || RSVP;
}

module.exports = ePub;
/*
(function(root) {
	"use strict";

	module.exports = ePub;

	// CommonJS
	if (typeof exports === "object") {
		// root.RSVP = require("rsvp");
		module.exports = ePub;
	// RequireJS
	} else if (typeof define === "function" && define.amd) {
		define(ePub);
	// Global
	} else {
		root.ePub = ePub;
	}

})(this);
*/
