import {
	qs,
	qsa,
	querySelectorByType,
	filterChildren,
	getParentByTagName,
	uuid
} from "../utils/core";

/**
 * Navigation wrapper
 * @param {[object]} manifest
 */
class Navigation {
	constructor(manifest) {
		this.toc = [];
		this.tocByHref = {};
		this.tocById = {};

		this.landmarks = [];
		this.landmarksByType = {};


		if (manifest) {
			this.unpack(manifest);
		}
	}

	/**
	 * Get an item from the navigation
	 * @param  {string} target
	 * @return {object} navItems
	 */
	get(target) {
		var index;

		if(!target) {
			return this.toc;
		}

		if(target.indexOf("#") === 0) {
			index = this.tocById[target.substring(1)];
		} else if(target in this.tocByHref){
			index = this.tocByHref[target];
		}

		return this.toc[index];
	}

	/**
	 * Get a landmark by type
	 * List of types: https://idpf.github.io/epub-vocabs/structure/
	 * @param  {string} type
	 * @return {object} landmarkItems
	 */
	landmark(type) {
		let index;

		index = this.landmarksByType[type];

		return this.landmarks[index];
	}

	/**
	 * Unpack manifest object
	 */
	unpack(manifest) {
		if (manifest.toc) {
			this.unpackToc(manifest.toc);
		}

		if (manifest.landmarks) {
			this.unpackLandmarks(manifest.landmarks);
		}
	}

	unpackToc(toc) {
		this.toc = toc;
		toc.forEach((item, index) => {
			this.tocByHref[item.href] = index;
			if (item.source) {
				this.tocByHref[item.href] = index;
			}
			if (item.id) {
				this.tocId[item.id] = index;
			}
		});
	}

	unpackLandmarks(landmarks) {
		this.landmarks = landmarks;
		landmarks.forEach((item, index) => {
			this.landmarksByType[item.type] = index;
		});
	}

	destroy() {
		this.toc = undefined;
		this.tocByHref = undefined;
		this.tocById = undefined;

		this.landmarks = undefined;
		this.landmarksByType = undefined;
	}
}

export default Navigation;
