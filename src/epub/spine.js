import EpubCFI from "../utils/epubcfi.js";

/**
 * A collection of Spine Items
 */
class Spine {
	constructor(packaging) {
		this.items = undefined;
		this.manifest = undefined;
		this.spineNodeIndex = undefined;
		this.baseUrl = undefined;
		this.length = 0;
		this.readingOrder = [];
		this.resources = [];

		this.epubcfi = new EpubCFI();

		if (packaging) {
			this.unpack(packaging);
		}
	}

	/**
	 * Unpack items from a opf into spine items
	 * @param  {Packaging} packaging
	 */
	unpack(packaging) {
		this.items = packaging.spine;
		this.manifest = packaging.manifest;
		this.spineNodeIndex = packaging.spineNodeIndex;
		this.baseUrl = packaging.baseUrl || packaging.basePath || "";
		this.length = this.items.length;

		this.items.forEach( (item, index) => {
			let manifestItem = this.manifest[item.idref];

			item.id = item.idref;
			item.cfiBase = this.epubcfi.generateChapterComponent(this.spineNodeIndex, item.index, item.idref);
			item.cfiPos = index;

			if(manifestItem) {
				item.url = manifestItem.href;

				if(manifestItem.properties.length){
					item.properties.push.apply(item.properties, manifestItem.properties);
				}
			}

			if (item.linear === "yes") {
				this.readingOrder.push(item);
			} else {
				this.resources.push(item);
			}
		});
	}


	destroy() {
		this.items = undefined;
		this.manifest = undefined;
		this.spineNodeIndex = undefined;
		this.baseUrl = undefined;
		this.length = undefined;
		this.epubcfi = undefined;
		this.readingOrder = undefined;
	}
}

export default Spine;
