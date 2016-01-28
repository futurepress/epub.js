var Book = require('./book');
var EpubCFI = require('./epubcfi');

function ePub(_url) {
	return new Book(_url);
};

ePub.VERSION = "0.3.0";

ePub.CFI = EpubCFI;

module.exports = ePub;
