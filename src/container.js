import path from 'path-webpack';
import {qs} from './utils/core';
import EpubCFI from './epubcfi';

/**
 * Handles Parsing and Accessing an Epub Container
 * @class
 * @param {[document]} containerDocument xml document
 */
class Container {
	constructor(containerDocument) {
		if (containerDocument) {
			this.parse(containerDocument);
		}
	};

	/**
	 * Parse the Container XML
	 * @param  {document} containerDocument
	 */
	parse(containerDocument){
			//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
			var rootfile, fullpath, folder, encoding;

			if(!containerDocument) {
				console.error("Container File Not Found");
				return;
			}

			rootfile = qs(containerDocument, "rootfile");

			if(!rootfile) {
				console.error("No RootFile Found");
				return;
			}

			this.packagePath = rootfile.getAttribute('full-path');
			this.directory = path.dirname(this.packagePath);
			this.encoding = containerDocument.xmlEncoding;
	};
}

export default Container;
