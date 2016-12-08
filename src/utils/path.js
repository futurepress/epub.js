import path from "path-webpack";

class Path {
	constructor(pathString) {
		var protocol;
		var parsed;

		protocol = pathString.indexOf("://");
		if (protocol > -1) {
			pathString = new URL(pathString).pathname;
		}

		parsed = this.parse(pathString);

		this.path = pathString;

		if (this.isDirectory(pathString)) {
			this.directory = pathString;
		} else {
			this.directory = parsed.dir + "/";
		}

		this.filename = parsed.base;
		this.extension = parsed.ext.slice(1);

	}

	parse (what) {
		return path.parse(what);
	}

	isAbsolute (what) {
		return path.isAbsolute(what || this.path);
	}

	isDirectory (what) {
		return (what.charAt(what.length-1) === "/");
	}

	resolve (what) {
		return path.resolve(this.directory, what);
	}

	relative (what) {
		return path.relative(this.directory, what);
	}

	splitPath(filename) {
		return this.splitPathRe.exec(filename).slice(1);
	}

	toString () {
		return this.path;
	}
}

export default Path;
