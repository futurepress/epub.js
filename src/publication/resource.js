import request from "../utils/request.js";
import { lookup } from "../utils/mime.js";

/**
 * 
 */
class Resource {
	constructor(item = {}, loader) {
		if (item && !item.url) {
			throw new Error("Resource url is required.");
		}
		if (item.rel && !Array.isArray(item.rel)) {
			item.rel = [item.rel];
		}
		this.data = {
			url: item.url,
			index: item.index,
			id: item.id,
			canonical: item.canonical,
			type: item.type,
			encoding: item.encoding || lookup(item.url),
			properites: item.properites || [],
			rel: item.rel || [],
			name: item.name,
			cfiPos: item.cfiPos,
			cfiBase: item.cfiBase
		}
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

	get canonical() {
		return this.data.canonical;
	}

	set canonical(canonical) {
		this.data.canonical = canonical;
	}

	get type() {
		return this.data.type;
	}

	set type(type) {
		this.data.type = type;
	}

	get encoding() {
		return this.data.encoding;
	}

	set encoding(encoding) {
		this.data.id = encoding;
	}

	get properites() {
		return this.data.properites;
	}

	set properites(properites) {
		this.data.properites = properites;
	}

	get rel() {
		return this.data.rel;
	}

	set rel(rel) {
		this.data.rel = rel;
	}

	get name() {
		return this.data.name;
	}

	set name(name) {
		this.data.name = name;
	}

	get cfiPos() {
		return this.data.cfiPos;
	}

	set cfiPos(pos) {
		this.data.cfiPos = pos;
	}

	get cfiBase() {
		return this.data.cfiBase;
	}

	set cfiBase(base) {
		this.data.cfiBase = base;
	}

	/**
	 * Load the resource from its url
	 */
	async load() {
		return request(this.url, this.type)
	}


	toJSON() {
		return this.data;
	}

	destroy() {

	}
}

export default Resource;