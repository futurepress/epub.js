import { isNumber } from "../utils/core.js";

/**
 * A collection of Resources
 */
class ResourceList extends Map {
	constructor(items) {
		super(items)
		this.order = Array.from(this.entries());
		this.ids = new Map();
	}

	// unordered
	add(resource) {
		const { url } = resource;

		this.set(url, resource);

		if (resource.id) {
			this.ids.set(resource.id, url);
		}

		return this.size;
	}

	// ordered
	append(resource) {
		const { url } = resource;
		const index = this.size;
		resource.index = index;

		this.order.push(url);
		this.set(url, resource);

		if (resource.id) {
			this.ids.set(resource.id, url);
		}

		return index;
	}

	prepend(resource) {
		const { url } = resource;
		const index = 0;

		resource.index = index;
		
		this.order.unshift(url);

		if (resource.id) {
			this.ids.set(resource.id, url);
		}
		
		const tempMap = new Map(this);

		this.clear()

		this.set(url, resource);

		// Re-index
		let newIndex = 1;
		tempMap.forEach((value, key) => {
			value.index = newIndex;
			this.set(key, value);
			newIndex++;
		});

		return index;
	}

	insert(resource, index) {
		const { url } = resource;
		resource.index = index;

		if (resource.id) {
			this.ids.set(resource.id, url);
		}

		if (index > -1) {
			this.order.splice(index, 1);
			const tempMap = new Map(this);
			this.clear()

			let newIndex = 0;
			tempMap.forEach((value, key) => {
				if (index === newIndex) {
					this.set(url, resource);
					newIndex++;
				}
				if (index < newIndex) {
					value.index = newIndex;
					this.set(key, value);
				}
				newIndex++;
			});
		}
	}

	delete(resource) {
		const { url } = resource;
		super.delete(resource);

		if (resource.id) {
			this.ids.delete(resource.id);
		}

		const index = this.order.indexOf(url);
		if (index > -1) {
			this.order.splice(index, 1);

			let newIndex = 0;
			this.forEach((value, key) => {
				value.index = newIndex;
				newIndex++;
			});
		}
	}

	get(what) {
		if (isNumber(what)) {
			const url = (what > -1) && (what < this.order.length) && this.order[what];
			if (url) {
				return this.get(url);
			}
		}
		return super.get(what);
	}

	id(what) {
		let index = this.ids.get(what);
		if (index) {
			return this.get(index);
		}
	}

	first() {
		const url = this.order.length && this.order[0];
		if (url) {
			return this.get(url);
		}
	}

	last() {
		const url = this.order.length && this.order[this.order.length - 1];
		if (url) {
			return this.get(url);
		}
	}

	find(fn) {
		let result;

		if (!fn) {
			return;
		}

		for (const [key, resource] of this) {
			let result = fn(resource);
			if (result) {
				return resource;
			}
		}
	}

	map(fn) {
		let results = [];

		if (!fn) {
			return;
		}

		for (const [key, resource] of this) {
			let result = fn(resource);
			if (result) {
				results.push(result);
			}
		}

		return results;
	}

	get length() {
		return this.size;
	}

	toArray() {
		return Array.from(this.values());
	}

	toJSON() {
		return JSON.stringify(this.toArray());
	}
}

export default ResourceList;
