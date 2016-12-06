import core from './utils/core';
import EpubCFI from './epubcfi';
import Hook from './hook';
import Section from './section';
import {replaceBase, replaceCanonical} from './replacements';

/**
 * A collection of Spine Items
 */
class Spine {
	constructor() {
		this.spineItems = [];
		this.spineByHref = {};
		this.spineById = {};

		this.hooks = {};
		this.hooks.serialize = new Hook();
		this.hooks.content = new Hook();

		// Register replacements
		this.hooks.content.register(replaceBase);
		this.hooks.content.register(replaceCanonical);

		this.epubcfi = new EpubCFI();

		this.loaded = false;
	};

	/**
	 * Unpack items from a opf into spine items
	 * @param  {Package} _package
	 * @param  {method} resolver URL resolver
	 */
	unpack(_package, resolver) {

		this.items = _package.spine;
		this.manifest = _package.manifest;
		this.spineNodeIndex = _package.spineNodeIndex;
		this.baseUrl = _package.baseUrl || _package.basePath || '';
		this.length = this.items.length;

		this.items.forEach(function(item, index){
			var href, url;
			var manifestItem = this.manifest[item.idref];
			var spineItem;

			item.cfiBase = this.epubcfi.generateChapterComponent(this.spineNodeIndex, item.index, item.idref);

			if(manifestItem) {
				item.href = manifestItem.href;
				item.url = resolver(item.href, true);

				if(manifestItem.properties.length){
					item.properties.push.apply(item.properties, manifestItem.properties);
				}
			}

			item.prev = function(){ return this.get(index-1); }.bind(this);
			item.next = function(){ return this.get(index+1); }.bind(this);

			spineItem = new Section(item, this.hooks);

			this.append(spineItem);


		}.bind(this));

		this.loaded = true;
	};

	/**
	 * Get an item from the spine
	 * @param  {[string|int]} target
	 * @return {Section} section
	 * @example spine.get();
	 * @example spine.get(1);
	 * @example spine.get("chap1.html");
	 * @example spine.get("#id1234");
	 */
	get(target) {
		var index = 0;

		if(this.epubcfi.isCfiString(target)) {
			cfi = new EpubCFI(target);
			index = cfi.spinePos;
		} else if(target && (typeof target === "number" || isNaN(target) === false)){
			index = target;
		} else if(target && target.indexOf("#") === 0) {
			index = this.spineById[target.substring(1)];
		} else if(target) {
			// Remove fragments
			target = target.split("#")[0];
			index = this.spineByHref[target];
		}

		return this.spineItems[index] || null;
	};

	/**
	 * Append a Section to the Spine
	 * @private
	 * @param  {Section} section
	 */
	append(section) {
		var index = this.spineItems.length;
		section.index = index;

		this.spineItems.push(section);

		this.spineByHref[section.href] = index;
		this.spineById[section.idref] = index;

		return index;
	};

	/**
	 * Prepend a Section to the Spine
	 * @private
	 * @param  {Section} section
	 */
	prepend(section) {
		var index = this.spineItems.unshift(section);
		this.spineByHref[section.href] = 0;
		this.spineById[section.idref] = 0;

		// Re-index
		this.spineItems.forEach(function(item, index){
			item.index = index;
		});

		return 0;
	};

	// insert(section, index) {
	//
	// };

	/**
	 * Remove a Section from the Spine
	 * @private
	 * @param  {Section} section
	 */
	remove(section) {
		var index = this.spineItems.indexOf(section);

		if(index > -1) {
			delete this.spineByHref[section.href];
			delete this.spineById[section.idref];

			return this.spineItems.splice(index, 1);
		}
	};

	/**
	 * Loop over the Sections in the Spine
	 * @return {method} forEach
	 */
	each() {
		return this.spineItems.forEach.apply(this.spineItems, arguments);
	};
}

export default Spine;
