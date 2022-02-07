import { qs } from "../utils/core.js";
import { directory } from "../utils/url.js";

/**
 * Handles Parsing and Accessing an Epub Container
 * @class
 * @param {document} [containerDocument] xml document
 */
class Container {
	constructor(containerDocument) {
		this.packagePath = "";
		this.directory = "";
		this.encoding = "";

		if (containerDocument) {
			this.parse(containerDocument);
		}
	}

	/**
	 * Parse the Container XML
	 * @param  {document} containerDocument
	 */
	parse(containerDocument){
		//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
		var rootfile;

		if(!containerDocument) {
			throw new Error("Container File Not Found");
		}

		rootfile = qs(containerDocument, "rootfile");

		if(!rootfile) {
			throw new Error("No RootFile Found");
		}

		this.packagePath = rootfile.getAttribute("full-path");
		this.directory = directory(this.packagePath);
		this.encoding = containerDocument.xmlEncoding;
	}

	destroy() {
		this.packagePath = undefined;
		this.directory = undefined;
		this.encoding = undefined;
	}
}

export default Container;
