import EpubCFI from "../utils/epubcfi.js";
import Hook from "../utils/hook.js";
import Section from "./section.js";
import { replaceBase, replaceCanonical, replaceMeta } from "../utils/replacements.js";

/**
 * A collection of Section Items
 */
class Sections {
	constructor(items) {
		this.sectionByHref = {};
		this.sectionById = {};

		this.readingOrder = [];
		this.unorderedSections = [];

		this.hooks = {};
		this.hooks.serialize = new Hook();
		this.hooks.content = new Hook();

		// Register replacements
		this.hooks.content.register(replaceBase);
		this.hooks.content.register(replaceCanonical);
		this.hooks.content.register(replaceMeta);

		this.epubcfi = new EpubCFI();
	}

	/**
	 * Get an item from the section
	 * @param  {string|number} [target]
	 * @return {Section} section
	 * @example section.get();
	 * @example section.get(1);
	 * @example section.get("chap1.html");
	 * @example section.get("id1234");
	 */
	get(target) {
		let index;
		let type;

		if (typeof target === "undefined") {
			return this.readingOrder.length && this.readingOrder[0]
		} else if(this.epubcfi.isCfiString(target)) {
			let cfi = new EpubCFI(target);
			index = cfi.spinePos;
		} else if(typeof target === "number" || isNaN(target) === false){
			index = target;
		} else if(typeof target === "string" && target.indexOf("#") === 0) {
			index = this.sectionById[target.substring(1)];
		} else if(typeof target === "string") {
			// Remove fragments
			target = target.split("#")[0];

			if (this.sectionById[target] !== undefined) {
				index, type = this.sectionById[target];
			} else if (this.sectionById[target] !== undefined) {
				index, type = this.sectionByHref[target];
			} else {
				index, type = this.sectionByHref[encodeURI(target)];
			}
		}

		if (index != undefined && type && type === "unordered") {
			return this.unorderedSections[index];
		}

		if (index != undefined) {
			return this.readingOrder[index];
		}
	}

	/**
	 * Append a Section to the Spine
	 * @private
	 * @param  {Section} section
	 */
	append(section) {
		const type = "ordered";
		const index = this.readingOrder.length;
		section.index = index;

		this.readingOrder.push(section);

		// Encode and Decode href lookups
		// see pr for details: https://github.com/futurepress/epub.js/pull/358
		this.sectionByHref[decodeURI(section.href)] = { type, index };
		this.sectionByHref[encodeURI(section.href)] = { type, index };
		this.sectionByHref[section.href] = { type, index };

		this.sectionById[section.idref] = { type, index };

		return index;
	}

	/**
	 * Prepend a Section to the Spine
	 * @private
	 * @param  {Section} section
	 */
	prepend(section) {
		const type = "ordered";
		const index = 0;
		// var index = this.sectionItems.unshift(section);
		this.sectionByHref[section.href] = { type, index };
		this.sectionById[section.idref] = { type, index };

		// Re-index
		this.readingOrder.forEach(function(item, newIndex){
			item.index = newIndex;
		});

		return 0;
	}

	// insert(section, index) {
	//
	// };

	unordered(section) {
		const type = "unordered";
		const index = this.unordered.length;

		this.unorderedSections.push(section);

		// Encode and Decode href lookups
		// see pr for details: https://github.com/futurepress/epub.js/pull/358
		this.sectionByHref[decodeURI(section.href)] = { type, index };
		this.sectionByHref[encodeURI(section.href)] = { type, index };
		this.sectionByHref[section.href] = { type, index };

		this.sectionById[section.idref] = { type, index };

		return index;
	}

	/**
	 * Remove a Section from the Spine
	 * @private
	 * @param  {Section} section
	 */
	remove(section) {
		let orderedIndex = this.readingOrder.indexOf(section);
		if (orderedIndex > -1) {
			delete this.sectionByHref[section.href];
			delete this.sectionById[section.idref];

			return this.readingOrder.splice(orderedIndex, 1);
		}

		let unorderedIndex = this.unordered.indexOf(section);
		if (unorderedIndex > -1) {
			delete this.sectionByHref[section.href];
			delete this.sectionById[section.idref];

			return this.unorderedSections.splice(unorderedIndex, 1);
		}
	}

	/**
	 * Loop over the Sections in the Spine
	 * @return {method} forEach
	 */
	each() {
		return this.readingOrder.forEach.apply(this.readingOrder, arguments);
	}

	/**
	 * Find the first Section in the Spine
	 * @return {Section} first section
	 */
	first() {
		return this.get(0);
	}

	/**
	 * Find the last Section in the Spine
	 * @return {Section} last section
	 */
	last() {
		let index = this.readingOrder.length-1;
		return this.get(index);
	}

	/**
	 * Export an Array of all ordered Sections
	 * @return {array}
	 */
	toOrderedArray() {
		return this.readingOrder.map(function(item, index){
			return item.toObject();
		});
	}

	/**
	 * Export an Array of all unordered Sections
	 * @return {array}
	 */
	toUnorderedArray() {
		return this.unorderedSections.map(function (item, index) {
			return item.toObject();
		});
	}

	toJSON() {
		return JSON.stringify({
			readingOrder: this.toOrderedArray(),
			unordered: this.toUnorderedArray()
		});
	}

	destroy() {
		this.each((section) => section.destroy());

		this.readingOrder = undefined;
		this.unorderedSections = undefined;
		this.sectionByHref = undefined;
		this.sectionById = undefined;

		this.hooks.serialize.clear();
		this.hooks.content.clear();
		this.hooks = undefined;

		this.epubcfi = undefined;

		this.length = undefined;
	}
}

export default Sections;
