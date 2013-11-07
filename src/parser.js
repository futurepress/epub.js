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
}

EPUBJS.Parser.prototype.package = function(packageXml, baseUrl){
	var parse = this;

	if(baseUrl) this.baseUrl = baseUrl;
	
	var metadataNode = packageXml.querySelector("metadata"),
		manifestNode = packageXml.querySelector("manifest"),
		spineNode = packageXml.querySelector("spine");

	var manifest = parse.manifest(manifestNode),
		navPath = parse.findNavPath(manifestNode),
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
		'navPath'  : navPath,
		'tocPath'  : tocPath,
		'coverPath': coverPath,
		'spineNodeIndex' : spineNodeIndex,
		'spineIndexByURL' : spineIndexByURL
	};
}

//-- Find TOC NAV: media-type="application/xhtml+xml" href="toc.ncx"
EPUBJS.Parser.prototype.findNavPath = function(manifestNode){
  var node = manifestNode.querySelector("item[properties^='nav']");
  return node ? node.getAttribute('href') : false;
}

//-- Find TOC NCX: media-type="application/x-dtbncx+xml" href="toc.ncx"
EPUBJS.Parser.prototype.findTocPath = function(manifestNode){
	var node = manifestNode.querySelector("item[media-type='application/x-dtbncx+xml']");
	return node ? node.getAttribute('href') : false;
}

//-- Find Cover: <item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />
EPUBJS.Parser.prototype.findCoverPath = function(manifestNode){
	var node = manifestNode.querySelector("item[properties='cover-image']");
	return node ? node.getAttribute('href') : false;
}


//-- Expanded to match Readium web components
EPUBJS.Parser.prototype.metadata = function(xml){
	var metadata = {},
		p = this;
	
	
	metadata.bookTitle = p.getElementText(xml, 'title');
	metadata.creator = p.getElementText(xml, 'creator'); 
	metadata.description = p.getElementText(xml, 'description');
	
	metadata.pubdate = p.getElementText(xml, 'date');
	
	metadata.publisher = p.getElementText(xml, 'publisher');
	
	metadata.identifier = p.getElementText(xml, "identifier");
	metadata.language = p.getElementText(xml, "language"); 
	metadata.rights = p.getElementText(xml, "rights"); 
	
	
	metadata.modified_date = p.querySelectorText(xml, "meta[property='dcterms:modified']");
	metadata.layout = p.querySelectorText(xml, "meta[property='rendition:orientation']");
	metadata.orientation = p.querySelectorText(xml, "meta[property='rendition:orientation']");
	metadata.spread = p.querySelectorText(xml, "meta[property='rendition:spread']");
	// metadata.page_prog_dir = packageXml.querySelector("spine").getAttribute("page-progression-direction");
	
	return metadata;
}

EPUBJS.Parser.prototype.getElementText = function(xml, tag){
	var found = xml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", tag),
		el;

	if(!found || found.length == 0) return '';
	
	el = found[0]; 

	if(el.childNodes.length){
		return el.childNodes[0].nodeValue;
	}

	return '';
	
}

EPUBJS.Parser.prototype.querySelectorText = function(xml, q){
	var el = xml.querySelector(q);

	if(el && el.childNodes.length){
		return el.childNodes[0].nodeValue;
	}

	return '';
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
			type = item.getAttribute('media-type') || '',
			properties = item.getAttribute('properties') || '';
		
		manifest[id] = {
			'href' : baseUrl + href, //-- Absolute URL for loading with a web worker
			'type' : type,
      'properties' : properties
		};
	
	});
	
	return manifest;

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
			'properties' : manifest[Id].properties || '',
			'href' : manifest[Id].href,
			'index' : index
		}
		
		spine.push(vert);
	});
	
	return spine;
}

EPUBJS.Parser.prototype.nav = function(navHtml){

  var navEl = navHtml.querySelector('nav[*|type="toc"]'),
    idCounter = 0;

  // Implements `> ol > li`
  function findListItems(parent){
    var items = [];
    Array.prototype.slice.call(parent.childNodes).forEach(function(node){
      if('ol' == node.tagName){
        Array.prototype.slice.call(node.childNodes).forEach(function(item){
          if('li' == item.tagName){
            items.push(item);
          }
        })
      }
    })
    return items;
  }

  // Implements `> a, > span`
  function findAnchorOrSpan(parent){
    var item = null;
    Array.prototype.slice.call(parent.childNodes).forEach(function(node){
      if('a' == node.tagName || 'span' == node.tagName){
        item = node;
      }
    })
    return item;
  }

  function getTOC(parent){
    var list = [],
      items = [],
      nodes = findListItems(parent),
      items = Array.prototype.slice.call(nodes),
      length = items.length,
      node;


    if(length == 0) return false;

    items.forEach(function(item){
      var id = item.getAttribute('id') || 'epubjs-autogen-toc-id-' + (idCounter++),
        content = findAnchorOrSpan(item),
        href = content.getAttribute('href') || '',
        text = content.textContent || "",
        subitems = getTOC(item);
      item.setAttribute('id', id); // Ensure all elements have an id
      list.unshift({
            "id": id,
            "href": href,
            "label": text,
            "subitems" : subitems,
            "parent" : parent ? parent.getAttribute('id') : null
      });

    });

    return list;
  }

  return getTOC(navEl);

}

EPUBJS.Parser.prototype.toc = function(tocXml){
	
	var navMap = tocXml.querySelector("navMap");

	function getTOC(parent){
		var list = [],
			items = [],
			nodes = parent.childNodes,
			nodesArray = Array.prototype.slice.call(nodes),
			length = nodesArray.length,
			iter = length,
			node;
		

		if(length == 0) return false;

		while(iter--){
			node = nodesArray[iter];
		  	if(node.nodeName === "navPoint") {
		  		items.push(node);
		  	}
		}
		
		items.forEach(function(item){
			var id = item.getAttribute('id'),
				content = item.querySelector("content"),
				src = content.getAttribute('src'),
				split = src.split("#"),
				navLabel = item.querySelector("navLabel"),
				text = navLabel.textContent ? navLabel.textContent : "",
				subitems = getTOC(item);
			list.unshift({
						"id": id, 
						"href": src, 
						"label": text,
						"subitems" : subitems,
						"parent" : parent ? parent.getAttribute('id') : null
			});

		});

		return list;
	}
	
	return getTOC(navMap);


}

