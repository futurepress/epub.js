import Publication from "../publication/publication.js";
import { createUrl, resolve } from "../utils/url.js";

/**
 * A representation of a Manifest with methods for the loading and manipulation
 * of its contents.
 * @class
 * @param {json} [manifest]
 * @returns {Manifest}
 * @example new Manifest(manifest)
 */
class Manifest extends Publication {
	constructor(url, options) {
		super();

		if (url) {
			this.opened = this.open(url);
		}
	}

	async unpack(json) {
		for (const [key, value] of Object.entries(json)) {
			switch (key) {
				case "readingOrder":
					this.readingOrder = value;
					break;
				case "resources":
					this.resources = value;
					break;
				default:
					this.setMetadata(key, value);
					break;
			}
		}

		const contentsUrl = this.contentsUrl;
		if (contentsUrl) {
			this.contents = await this.loadNavigation(contentsUrl, "toc");
		}

		const landmarksUrl = this.landmarksUrl;
		if (landmarksUrl) {
			this.landmarks = await this.loadNavigation(landmarksUrl, "landmarks");
		}

		const pagelistUrl = this.pagelistUrl;
		if (pagelistUrl) {
			this.pagelist = await this.loadNavigation(pagelistUrl, "pagelist");
		}

	}

	async open(url) {
		this.url = url;

		const manifest = await this.load(url, "json");

		return this.unpack(manifest);
	}

	async loadNavigation(contentsUrl, role="toc") {
		const html = await this.load(contentsUrl, "html");
		let items = [];
		let url = createUrl(contentsUrl);

		const title = html.querySelector("h1, h2, h3, h4, h5, h6");
		const toc = html.querySelector(`*[role='doc-${role}']`);		
		if (toc) {
			const links = toc.querySelectorAll("ol > li > a, ul > li > a");			
			for (const link of links) {
				items.push(this.contentsEntry(link, url));
			}
		}
		return items;
	}

	contentsEntry(link, contentsUrl) {
		const href = link.getAttribute("href")
		const url = resolve(contentsUrl, href);

		let item = {
			url: url,
			name: link.textContent
		}

		const children = link.querySelectorAll("ol > li > a, ul > li > a");
		
		if (children.length) {
			item.children = [];
			for (const child of children) {
				item.children.push(this.contentsEntry(child, contentsUrl));
			}
		}

		return item;
	}

	setMetadata(key, value) {
		if (key === "readingProgression") {
			this.metadata.set("direction", value);
		}
		if (key === "url") {
			this.url = value;
		}
		this.metadata.set(key, value);
	}


	/**
	 * Get or set the cover url
	 * @param {string} [url]
	 * @return {string} coverUrl
	 */
	get coverUrl() {
		let coverResource = this.resources.find((resource) => {
			return resource.rel.includes("cover");
		});
		return coverResource && coverResource.url;
	}

	set coverUrl(url) {
		let coverResource = this.resources.find((resource) => {
			return resource.includes("cover");
		});

		if (coverResource) {
			coverResource.url = url;
		} else {
			coverResource = new Resource({
				rel: ["cover"],
				url: url
			});
			this.resources.push(coverResource);
		}
		return coverResource && coverResource.url;
	}

	/**
	* Get or set the table of contents url
	* @param {string} [url]
	* @return {string} contents
	*/
	get contentsUrl() {
		let contentsUrl = this.resources.find((resource) => {
			return resource.rel.includes("contents");
		});
		return contentsUrl && contentsUrl.url;
	}

	set contentsUrl(url) {
		let contentsUrl = this.resources.find((resource) => {
			return resource.rel.includes("contents");
		});

		if (contentsUrl) {
			contentsUrl.url = url;
		} else {
			contentsUrl = {
				rel: ["contents"],
				url: url
			};
			this.resources.push(contentsUrl);
		}
		return contentsUrl && contentsUrl.url;
	}


	/**
	* Get or set the landmarksUrl url
	* @param {string} [url]
	* @return {string} landmarksUrl
	*/
	get landmarksUrl() {
		let landmarksUrl = this.resources.find((resource) => {
			return resource.rel.includes("landmarks");
		});
		return landmarksUrl && landmarksUrl.url;
	}

	set landmarksUrl(url) {
		let landmarksUrl = this.resources.find((resource) => {
			return resource.rel.includes("landmarks");
		});

		if (landmarksUrl) {
			landmarksUrl.url = url;
		} else {
			landmarksUrl = {
				rel: ["landmarks"],
				url: url
			};
			this.resources.push(landmarksUrl);
		}
		return landmarksUrl && landmarksUrl.url;
	}


	/**
	* Get or set the pagelist url
	* @param {string} [url]
	* @return {string} pagelistUrl
	*/
	get pagelistUrl() {
		let pagelistUrl = this.resources.find((resource) => {
			return resource.rel.includes("pagelist");
		});
		return pagelistUrl && pagelistUrl.url;
	}

	set pagelistUrl(url) {
		let pagelistUrl = this.resources.find((resource) => {
			return resource.rel.includes("pagelist");
		});

		if (pagelistUrl) {
			pagelistUrl.url = url;
		} else {
			pagelistUrl = {
				rel: ["pagelist"],
				url: url
			};
			this.resources.push(pagelistUrl);
		}
		return pagelistUrl && pagelistUrl.url;
	}

	get readingOrder() {
		return this.sections;
	}

	set readingOrder(items) {
		return this.sections = items;
	}

	get contents() {
		return this.navigation;
	}

	set contents(items) {
		return this.navigation = items;
	}

}

export default Manifest;
