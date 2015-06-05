if (typeof EPUBJS === 'undefined') {
	(typeof window !== 'undefined' ? window : this).EPUBJS = {};
}

EPUBJS.VERSION = "0.3.0";
EPUBJS.Render = {};

(function(root) {
	"use strict";
	var ePub = function(_url) {
		return new EPUBJS.Book(_url);
	};

	ePub.Render = {
		register: function(name, renderer) {
			ePub.Render[name] = renderer;
		}
	}

	// CommonJS
	if (typeof exports === "object") {
		root.RSVP = require("rsvp");
		module.exports = ePub;
	// RequireJS
	} else if (typeof define === "function" && define.amd) {
		define(ePub);
	// Global
	} else {
		root.ePub = ePub;
	}
	
})(this);

