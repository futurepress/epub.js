import ResourceList from "./resourcelist.js";

/**
 * 
 */
class Locator {
	constructor(item = {}) {
		this.data = {
			url: item.url,
			index: item.index,
			id: item.id,
			cfi: item.cfi,
			type: item.type,
			name: item.name,
			parent: undefined,
			children: new ResourceList()
		};
	}

	get url() {
		return this.data.url;
	}

	set url(url) {
		this.data.url = url;
	}

	get index() {
		return this.data.index;
	}

	set index(index) {
		this.data.index = index;
	}

	get id() {
		return this.data.id;
	}

	set id(id) {
		this.data.id = id;
	}

	get cfi() {
		return this.data.cfi;
	}

	set cfi(cfi) {
		this.data.cfi = cfi;
	}

	get type() {
		return this.data.type;
	}

	set type(type) {
		this.data.type = type;
	}

	get name() {
		return this.data.name;
	}

	set name(name) {
		return this.data.name;
	}

	get parent() {
		return this.data.parent;
	}

	set parent(item) {
		this.data.parent = item;
		return this.data.parent;
	}

	get children() {
		return this.data.children;
	}

	set children(items) {
		for (const childItem of items) {
			const child = new Locator(childItem);
			child.parent = this;
			this.children.append(child);
		}
		return this.data.children;
	}


	toJSON() {
		return this.data;
	}

	destroy() {

	}
}

export default Locator;