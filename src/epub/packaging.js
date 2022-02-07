import { qs, qsa, qsp, indexOfElementNode } from "../utils/core.js";

/**
 * Open Packaging Format Parser
 * @class
 * @param {document} packageDocument OPF XML
 */
class Packaging {
	constructor(packageDocument) {
		this.manifest = {};
		this.navPath = "";
		this.ncxPath = "";
		this.coverPath = "";
		this.spineNodeIndex = 0;
		this.spine = [];
		this.metadata = {};

		if (packageDocument) {
			this.parse(packageDocument);
		}
	}

	/**
	 * Parse OPF XML
	 * @param  {document} packageDocument OPF XML
	 * @return {object} parsed package parts
	 */
	parse(packageDocument){
		if(!packageDocument) {
			throw new Error("Package File Not Found");
		}

		const metadataNode = qs(packageDocument, "metadata");
		if(!metadataNode) {
			throw new Error("No Metadata Found");
		}

		const manifestNode = qs(packageDocument, "manifest");
		if(!manifestNode) {
			throw new Error("No Manifest Found");
		}

		const spineNode = qs(packageDocument, "spine");
		if(!spineNode) {
			throw new Error("No Spine Found");
		}

		this.manifest = this.parseManifest(manifestNode);
		this.navPath = this.findNavPath(manifestNode);
		this.ncxPath = this.findNcxPath(manifestNode, spineNode);
		this.coverPath = this.findCoverPath(packageDocument);

		this.spineNodeIndex = indexOfElementNode(spineNode);
		this.manifestNodeIndex = indexOfElementNode(manifestNode);

		this.spine = this.parseSpine(spineNode, this.manifest);

		this.uniqueIdentifier = this.findUniqueIdentifier(packageDocument);
		this.metadata = this.parseMetadata(metadataNode);

		this.metadata.direction = spineNode.getAttribute("page-progression-direction");

		return {
			"metadata" : this.metadata,
			"spine"    : this.spine,
			"manifest" : this.manifest,
			"navPath"  : this.navPath,
			"ncxPath"  : this.ncxPath,
			"coverPath": this.coverPath,
			"spineNodeIndex" : this.spineNodeIndex,
			"manifestNodeIndex" : this.manifestNodeIndex,
		};
	}

	/**
	 * Parse Metadata
	 * @private
	 * @param  {node} xml
	 * @return {object} metadata
	 */
	parseMetadata(xml){
		const metadata = {};

		metadata.title = this.getElementText(xml, "title");
		metadata.creator = this.getElementText(xml, "creator");
		metadata.description = this.getElementText(xml, "description");

		metadata.pubdate = this.getElementText(xml, "date");

		metadata.publisher = this.getElementText(xml, "publisher");

		metadata.identifier = this.getElementText(xml, "identifier");
		metadata.language = this.getElementText(xml, "language");
		metadata.rights = this.getElementText(xml, "rights");

		metadata.modified_date = this.getPropertyText(xml, "dcterms:modified");

		metadata.layout = this.getPropertyText(xml, "rendition:layout");
		metadata.orientation = this.getPropertyText(xml, "rendition:orientation");
		metadata.flow = this.getPropertyText(xml, "rendition:flow");
		metadata.viewport = this.getPropertyText(xml, "rendition:viewport");
		metadata.media_active_class = this.getPropertyText(xml, "media:active-class");
		metadata.spread = this.getPropertyText(xml, "rendition:spread");
		// metadata.page_prog_dir = packageXml.querySelector("spine").getAttribute("page-progression-direction");

		return metadata;
	}

	/**
	 * Parse Manifest
	 * @private
	 * @param  {node} manifestXml
	 * @return {object} manifest
	 */
	parseManifest(manifestXml) {
		var manifest = {};

		//-- Turn items into an array
		// var selected = manifestXml.querySelectorAll("item");
		var selected = qsa(manifestXml, "item");
		var items = Array.prototype.slice.call(selected);

		//-- Create an object with the id as key
		items.forEach(function (item) {
			var id = item.getAttribute("id"),
				href = item.getAttribute("href") || "",
				type = item.getAttribute("media-type") || "",
				overlay = item.getAttribute("media-overlay") || "",
				properties = item.getAttribute("properties") || "";

			manifest[id] = {
				"href": href,
				// "url" : href,
				"type": type,
				"overlay": overlay,
				"properties": properties.length ? properties.split(" ") : []
			};

		});

		return manifest;

	}

	/**
	 * Parse Spine
	 * @private
	 * @param  {node} spineXml
	 * @param  {Packaging.manifest} manifest
	 * @return {object} spine
	 */
	parseSpine(spineXml, manifest){
		const spine = [];

		const selected = qsa(spineXml, "itemref");
		const items = Array.prototype.slice.call(selected);

		// var epubcfi = new EpubCFI();

		//-- Add to array to maintain ordering and cross reference with manifest
		items.forEach(function(item, index){
			const idref = item.getAttribute("idref");
			const props = item.getAttribute("properties") || "";
			const propArray = props.length ? props.split(" ") : [];

			const itemref = {
				"idref" : idref,
				"linear" : item.getAttribute("linear") || "yes",
				"properties" : propArray,
				"index" : index
			};
			spine.push(itemref);
		});

		return spine;
	}

	/**
	 * Find Unique Identifier
	 * @private
	 * @param  {node} packageXml
	 * @return {string} Unique Identifier text
	 */
	findUniqueIdentifier(packageXml){
		const uniqueIdentifierId = packageXml.documentElement.getAttribute("unique-identifier");
		if (!uniqueIdentifierId) {
			return "";
		}
		const identifier = packageXml.getElementById(uniqueIdentifierId);
		if (!identifier) {
			return "";
		}

		if (identifier.localName === "identifier" && identifier.namespaceURI === "http://purl.org/dc/elements/1.1/") {
			return identifier.childNodes.length > 0 ? identifier.childNodes[0].nodeValue.trim() : "";
		}

		return "";
	}

	/**
	 * Find TOC NAV
	 * @private
	 * @param {element} manifestNode
	 * @return {string}
	 */
	findNavPath(manifestNode){
		// Find item with property "nav"
		// Should catch nav regardless of order
		const node = qsp(manifestNode, "item", {"properties":"nav"});
		return node ? node.getAttribute("href") : false;
	}

	/**
	 * Find TOC NCX
	 * media-type="application/x-dtbncx+xml" href="toc.ncx"
	 * @private
	 * @param {element} manifestNode
	 * @param {element} spineNode
	 * @return {string}
	 */
	findNcxPath(manifestNode, spineNode){
		let node = qsp(manifestNode, "item", {"media-type":"application/x-dtbncx+xml"});

		// If we can't find the toc by media-type then try to look for id of the item in the spine attributes as
		// according to http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm#Section2.4.1.2,
		// "The item that describes the NCX must be referenced by the spine toc attribute."
		if (!node) {
			const tocId = spineNode.getAttribute("toc");
			if(tocId) {
				node = manifestNode.querySelector(`#${tocId}`);
			}
		}

		return node ? node.getAttribute("href") : false;
	}

	/**
	 * Find the Cover Path
	 * <item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />
	 * Fallback for Epub 2.0
	 * @private
	 * @param  {node} packageXml
	 * @return {string} href
	 */
	findCoverPath(packageXml){
		// Try parsing cover with epub 3.
		const node = qsp(packageXml, "item", {"properties":"cover-image"});
		if (node) {
			return node.getAttribute("href");
		}
		
		// Fallback to epub 2.
		const metaCover = qsp(packageXml, "meta", {"name":"cover"});

		if (metaCover) {
			const coverId = metaCover.getAttribute("content");
			const cover = packageXml.getElementById(coverId);
			return cover ? cover.getAttribute("href") : "";
		} else {
			return false;
		}
	}

	/**
	 * Get text of a namespaced element
	 * @private
	 * @param  {node} xml
	 * @param  {string} tag
	 * @return {string} text
	 */
	getElementText(xml, tag){
		const found = xml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", tag);

		if(!found || found.length === 0) return "";

		const el = found[0];

		if(el.childNodes.length){
			return el.childNodes[0].nodeValue;
		}

		return "";
	}

	/**
	 * Get text by property
	 * @private
	 * @param  {node} xml
	 * @param  {string} property
	 * @return {string} text
	 */
	getPropertyText(xml, property){
		const el = qsp(xml, "meta", {"property":property});

		if(el && el.childNodes.length){
			return el.childNodes[0].nodeValue;
		}

		return "";
	}

	destroy() {
		this.manifest = undefined;
		this.navPath = undefined;
		this.ncxPath = undefined;
		this.coverPath = undefined;
		this.spineNodeIndex = undefined;
		this.spine = undefined;
		this.metadata = undefined;
	}
}

export default Packaging;
