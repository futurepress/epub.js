var path = require('path');
var core = require('./core');
var EpubCFI = require('./epubcfi');


function Container(containerDocument) {
	if (containerDocument) {
		this.parse(containerDocument);
	}
};

Container.prototype.parse = function(containerDocument){
		//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
		var rootfile, fullpath, folder, encoding;

		if(!containerDocument) {
			console.error("Container File Not Found");
			return;
		}

		rootfile = core.qs(containerDocument, "rootfile");

		if(!rootfile) {
			console.error("No RootFile Found");
			return;
		}

		this.packagePath = rootfile.getAttribute('full-path');
		this.directory = path.dirname(this.packagePath);
		this.encoding = containerDocument.xmlEncoding;
};

module.exports = Container;
