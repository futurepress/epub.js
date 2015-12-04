if (typeof EPUBJS === 'undefined') {
	(typeof window !== 'undefined' ? window : global).EPUBJS = {};
}

EPUBJS.VERSION = "0.3.0";

var Book = require('./book');

function ePub(_url) {
	return new Book(_url);
};

module.exports = ePub;
