import EventEmitter from "../utils/eventemitter.js";
import Publication from "../publication/publication.js";
import Container from "./container.js";
import Packaging from "./packaging.js";
import Navigation from "./navigation.js";
import PageList from "./pagelist.js";
import Spine from "./spine.js";
import { extension } from "../utils/url.js";
import EpubCFI from "../utils/epubcfi.js";

const CONTAINER_PATH = "META-INF/container.xml";
const IBOOKS_DISPLAY_OPTIONS_PATH = "META-INF/com.apple.ibooks.display-options.xml";
const INPUT_TYPE = {
	EPUB: "epub",
	OPF: "opf",
	DIRECTORY: "directory"
};

class Epub extends Publication {
	constructor(url, options) {
		super();

		if (url) {
			this.opened = this.open(url);
		}
	}

	/**
	 * Determine the type of they input passed to open
	 * @private
	 * @param  {string} input
	 * @return {string}  directory | epub | opf
	 */
	determineType(input) {
		const ext = extension(input);

		if (!ext) {
			return INPUT_TYPE.DIRECTORY;
		}

		if (ext === "epub") {
			return INPUT_TYPE.EPUB;
		}

		if (ext === "opf") {
			return INPUT_TYPE.OPF;
		}
	}

	/**
	 * Open the epub container
	 * @private
	 * @param  {string} url
	 * @return {string} packagePath
	 */
	async loadContainer(url) {
		const xml = await this.load(url);
			
		this.container = new Container(xml);
		return this.container.packagePath;
	}

	/**
	 * Open the Open Packaging Format Xml
	 * @private
	 * @param  {string} url
	 * @return {Promise}
	 */
	async loadPackaging(url) {
		const xml = await this.load(url);

		this.packaging = new Packaging(xml);
		return this.packaging;
	}

	/**
	 * Load Navigation and PageList from package
	 * @private
	 * @param {document} opf XML Document
	 */
	async loadNavigation(opf) {
		let navPath = opf.navPath || opf.ncxPath;

		if (!navPath) {
			return {
				toc: undefined,
				landmarks: undefined,
				pageList: undefined,
				locations: undefined
			}
		}

		const xml = await this.load(navPath, "xml");

		const navigation = new Navigation(xml, this.resolve(navPath));
		const pagelist = new PageList(xml);
		return {
			toc: navigation.toc,
			landmarks: navigation.landmarks,
			pageList: pagelist.pages,
			locations: pagelist.locations
		}
	}

	async loadDisplayOptions(packaging) {
		let displayOptionsXml;
		if (packaging.metadata.layout === "") {
			displayOptionsXml = await this.load(IBOOKS_DISPLAY_OPTIONS_PATH).catch((err) => {
				return undefined;
			});
		}

		return displayOptionsXml;
	}

	loadSections(packaging) {
		let spine = new Spine(packaging);
		return {
			readingOrder: spine.readingOrder,
			unordered: spine.resources
		}
	}

	loadResources(packaging) {
		let resources = [];
		for (const r in packaging.manifest) {
			const resource = packaging.manifest[r];
			if (resource.type !== "application/xhtml+xml" &&
				resource.type !== "text/html") {
				resource.url = resource.href;
				resources.push(resource);
			}
		}
		return resources;
	}

	loadMetadata(packaging) {
		return packaging.metadata;
	}

	/**
	 * Unpack the contents of the Epub
	 * @private
	 * @param {document} packageXml XML Document
	 */
	async unpack(packaging) {
		this.package = packaging;

		this.metadata = this.loadMetadata(packaging);

		const resources = this.loadResources(packaging);
		const { readingOrder, unordered } = this.loadSections(packaging);
		
		this.spine = readingOrder;
		this.resources = [...unordered, ...resources];

		const { toc, landmarks, pageList, locations } = await this.loadNavigation(packaging);
		this.navigation = toc;
		this.landmarks = landmarks;
		this.pagelist = pageList;
		this.locations = locations;

		this.displayOptions = await this.loadDisplayOptions(packaging);


		return this;
	}

	async open(url, what) {
		const type = what || this.determineType(url);
		let packaging;

		this.url = url;

		if (type === INPUT_TYPE.EPUB) {
			throw new Error("Epub must be unarchived");
		}

		if (type === INPUT_TYPE.DIRECTORY) {
			const container = await this.loadContainer(CONTAINER_PATH);
			packaging = await this.loadPackaging(container.packagePath);
		} else {
			packaging = await this.loadPackaging(url);
		}

		return this.unpack(packaging);
	}

	get spine() {
		return this.sections;
	}

	set spine(items) {
		return this.sections = items;
	}

	get toc() {
		return this.navigation;
	}

	set toc(items) {
		return this.navigation = items;
	}

	toJSON() {
		return super.toJSON();
	}

	/**
	 * Destroy the Epub and all associated objects
	 */
	destroy() {

	}
}

EventEmitter(Epub.prototype);

export default Epub;