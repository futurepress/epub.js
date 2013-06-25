EPUBJS.Parser = function(baseUrl){
	this.baseUrl = baseUrl || '';
}

EPUBJS.Parser.prototype.container = function(containerXml){

		//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
		var rootfile = containerXml.querySelector("rootfile"),
			fullpath = rootfile.getAttribute('full-path'),
			folder = EPUBJS.core.folder(fullpath);

		//-- Now that we have the path we can parse the contents
		return {
			'packagePath' : fullpath,
			'basePath' : folder
		};

		// localStorage.setItem("basePath", that.basePath);
		// localStorage.setItem("contentsPath", that.contentsPath);

}

EPUBJS.Parser.prototype.package = function(packageXml, baseUrl){
	var parse = this;
	
	if(baseUrl) this.baseUrl = baseUrl;
	
	var metadataNode = packageXml.querySelector("metadata"),
		manifestNode = packageXml.querySelector("manifest"),
		spineNode = packageXml.querySelector("spine");
	
	var manifest = parse.manifest(manifestNode),
		tocPath = parse.findTocPath(manifestNode),
		coverPath = parse.findCoverPath(manifestNode);
	
	var spineNodeIndex = Array.prototype.indexOf.call(spineNode.parentNode.childNodes, spineNode);
	
	var spine = parse.spine(spineNode, manifest);
	
	var spineIndexByURL = {};
	spine.forEach(function(item){
		spineIndexByURL[item.href] = item.index;
	});

	return {
		'metadata' : parse.metadata(metadataNode),
		'spine'    : spine,
		'manifest' : manifest,
		'tocPath'  : tocPath,
		'coverPath': coverPath,
		'spineNodeIndex' : spineNodeIndex,
		'spineIndexByURL' : spineIndexByURL
	};
}

//-- Find TOC NCX: media-type="application/x-dtbncx+xml" href="toc.ncx"
EPUBJS.Parser.prototype.findTocPath = function(manifestNode){
	var node = manifestNode.querySelector("item[media-type='application/x-dtbncx+xml']");
	return node.getAttribute('href');
}

//-- Find Cover: <item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />
EPUBJS.Parser.prototype.findCoverPath = function(manifestNode){
	var node = manifestNode.querySelector("item[properties='cover-image']");
	return node.getAttribute('href');
}

// EPUBJS.Parser.prototype.findCover = function(manifest){
// 	var leng = manifest.length,
// 		i = 0
// 		tocPath = false;
// 
// 	while(found == false & i < leng) {
// 	  if(manifest[i].type == "application/x-dtbncx+xml"){
// 	   tocPath = manifest[i].href;
// 	   found = true;   
// 	  }
// 	  i++;
// 	}
// 
// 	return tocPath;
// }




EPUBJS.Parser.prototype.metadata = function(metadataXml){
	var metadata = {};

	var title = metadataXml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/","title")[0]
		creator = metadataXml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/","creator")[0];

	metadata["bookTitle"] = title ? title.childNodes[0].nodeValue : "";
	metadata["creator"] = creator ? creator.childNodes[0].nodeValue : "";

	//-- TODO: add more meta data items, such as ISBN

	// localStorage.setItem("metadata", JSON.stringify(this.metadata));
	
	return metadata;
}

EPUBJS.Parser.prototype.manifest = function(manifestXml){
	var baseUrl = this.baseUrl,
		manifest = {};
	
	//-- Turn items into an array
	var selected = manifestXml.querySelectorAll("item"),
		items = Array.prototype.slice.call(selected);
		
	//-- Create an object with the id as key
	items.forEach(function(item){
		var id = item.getAttribute('id'),
			href = item.getAttribute('href') || '',
			type = item.getAttribute('media-type') || '';
		
		manifest[id] = {
			'href' : baseUrl + href, //-- Absolute URL for loading with a web worker
			'type' : type
		};
	
	});
	
	return manifest;

	// localStorage.setItem("assets", JSON.stringify(this.assets));
}

EPUBJS.Parser.prototype.spine = function(spineXml, manifest){
	var spine = [];
	
	var selected = spineXml.getElementsByTagName("itemref"),
		items = Array.prototype.slice.call(selected);
	
	//-- Add to array to mantain ordering and cross reference with manifest
	items.forEach(function(item, index){
		var Id = item.getAttribute('idref');
		
		var vert = {
			'id' : Id,
			'linear' : item.getAttribute('linear') || '',
			'properties' : item.getAttribute('properties') || '',
			'href' : manifest[Id].href,
			'index' : index
		}
		
	
		spine.push(vert);
	});
	// localStorage.setItem("spine", JSON.stringify(this.spine));
	// localStorage.setItem("spineIndexByURL", JSON.stringify(this.spineIndexByURL));

	return spine;
}

EPUBJS.Parser.prototype.toc = function(tocXml){
	var toc = [];

	var navMap = tocXml.querySelector("navMap");
		//cover = contents.querySelector("meta[name='cover']"),
		//coverID;

	//-- Add cover
	/*
	if(cover){
		coverID = cover.getAttribute("content");
		that.toc.push({
					"id": coverID, 
					"href": that.assets[coverID], 
					"label": coverID 

		});
	}
	*/
	
	function getTOC(nodes, parent, list){
		var list = list || [];

		items = Array.prototype.slice.call(nodes);

		items.forEach(function(item){
			var id = item.getAttribute('id'),
				content = item.querySelector("content"),
				src = content.getAttribute('src'),
				split = src.split("#"),
				navLabel = item.querySelector("navLabel"),
				text = navLabel.textContent ? navLabel.textContent : "",
				subitems =  item.querySelectorAll("navPoint");
				// subs = false,
				// childof = (item.parentNode == parent);				
			
			//if(!childof) return; //-- Only get direct children, should xpath for this eventually?
			
			
			// if(item.hasChildNodes()){
			// 	subs = getTOC(subitems, item)
			// }

			
			list.push({
						"id": id, 
						"href": src, 
						"label": text,
						"subitems" : subitems.length ? getTOC(item.querySelectorAll("navPoint"), item, list) : false
			});

		});

		return list;
	}


	return getTOC(navMap.querySelectorAll("navPoint"), navMap);


	// localStorage.setItem("toc", JSON.stringify(that.toc));

	// that.tell("book:tocReady");
	/*
	<navPoint class="chapter" id="xtitlepage" playOrder="1">
	  <navLabel><text>Moby-Dick</text></navLabel>
	  <content src="titlepage.xhtml"/>
	</navPoint>
	*/



}

