// Manage annotations for a book?

/*
let a = rendition.annotations.highlight(cfiRange, data)

a.on("added", () => console.log("added"))
a.on("removed", () => console.log("removed"))
a.on("clicked", () => console.log("clicked"))

a.update(data)
a.remove();
a.text();

rendition.annotations.show()
rendition.annotations.hide()

rendition.annotations.highlights.show()
rendition.annotations.highlights.hide()
*/

import EventEmitter from "event-emitter";
import EpubCFI from "./epubcfi";

/**
	* Handles managing adding & removing Annotations
	* @class
	*/
class Annotations {

	constructor (rendition) {
		this.rendition = rendition;
		this.highlights = [];
		this.underlines = [];
		this.marks = [];
		this._annotations = {};
		this._annotationsBySectionIndex = {};

		this.rendition.hooks.content.register(this.inject.bind(this));
		this.rendition.hooks.unloaded.register(this.clear.bind(this));
	}

	add (type, cfiRange, data, cb) {
		let hash = encodeURI(cfiRange);
		let cfi = new EpubCFI(cfiRange);
		let sectionIndex = cfi.spinePos;
		let annotation = new Annotation({
			type,
			cfiRange,
			data,
			sectionIndex,
			cb
		});

		this._annotations[hash] = annotation;

		if (sectionIndex in this._annotationsBySectionIndex) {
			this._annotationsBySectionIndex[sectionIndex].push(hash);
		} else {
			this._annotationsBySectionIndex[sectionIndex] = [hash];
		}

		let contents = this.rendition.getContents();
		contents.forEach( (content) => {
			if (annotation.sectionIndex === content.sectionIndex) {
				annotation.attach(content);
			}
		});

		return annotation;
	}

	remove (cfiRange, type) {
		let hash = encodeURI(cfiRange);

		if (hash in this._annotations) {
			let annotation = this._annotations[hash];

			let contents = this.rendition.getContents();
			contents.forEach( (content) => {
				if (annotation.sectionIndex === content.sectionIndex) {
					annotation.detach(content);
				}
			});

			delete this._annotations[hash];
		}
	}

	highlight (cfiRange, data, cb) {
		this.add("highlight", cfiRange, data, cb);
	}

	underline (cfiRange, data, cb) {
		this.add("underline", cfiRange, data, cb);
	}

	mark (cfiRange, data, cb) {
		this.add("mark", cfiRange, data, cb);
	}

	each () {
		return this._annotations.forEach.apply(this._annotations, arguments);
	}

	inject (contents) {
		let sectionIndex = contents.index;
		if (sectionIndex in this._annotationsBySectionIndex) {
			let annotations = this._annotationsBySectionIndex[sectionIndex];
			annotations.forEach((hash) => {
				let annotation = this._annotations[hash];
				annotation.attach(contents);
			});
		}
	}

	clear (contents) {
		let sectionIndex = contents.index;
		if (sectionIndex in this._annotationsBySectionIndex) {
			let annotations = this._annotationsBySectionIndex[sectionIndex];
			annotations.forEach((hash) => {
				let annotation = this._annotations[hash];
				annotation.detach(contents);
			});
		}
	}

	show () {

	}

	hide () {

	}

}

class Annotation {

	constructor ({
		type,
		cfiRange,
		data,
		sectionIndex
	}) {
		this.type = type;
		this.cfiRange = cfiRange;
		this.data = data;
		this.sectionIndex = sectionIndex;
		this.mark = undefined;
	}

	update (data) {
		this.data = data;
	}

	attach (contents) {
		let {cfiRange, data, type, mark, cb} = this;
		let result;
		/*
		if (mark) {
			return; // already added
		}
		*/
		if (type === "highlight") {
			result = contents.highlight(cfiRange, data, cb);
		} else if (type === "underline") {
			result = contents.underline(cfiRange, data, cb);
		} else if (type === "mark") {
			result = contents.mark(cfiRange, data, cb);
		}

		this.mark = result;

		return result;
	}

	detach (contents) {
		let {cfiRange, type} = this;
		let result;

		if (contents) {
			if (type === "highlight") {
				result = contents.unhighlight(cfiRange);
			} else if (type === "underline") {
				result = contents.ununderline(cfiRange);
			} else if (type === "mark") {
				result = contents.unmark(cfiRange);
			}
		}

		this.mark = undefined;

		return result;
	}

	text () {
		// TODO: needs implementation in contents
	}

}

EventEmitter(Annotation.prototype);


export default Annotations
