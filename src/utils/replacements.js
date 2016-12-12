import { qs } from "./core";

export function replaceBase(doc, section){
	var base;
	var head;

	if(!doc){
		return;
	}

	// head = doc.querySelector("head");
	// base = head.querySelector("base");
	head = qs(doc, "head");
	base = qs(head, "base");

	if(!base) {
		base = doc.createElement("base");
		head.insertBefore(base, head.firstChild);
	}

	base.setAttribute("href", section.url);
}

export function replaceCanonical(doc, section){
	var head;
	var link;
	var url = section.url; // window.location.origin +  window.location.pathname + "?loc=" + encodeURIComponent(section.url);

	if(!doc){
		return;
	}

	head = qs(doc, "head");
	link = qs(head, "link[rel='canonical']");

	if (link) {
		link.setAttribute("href", url);
	} else {
		link = doc.createElement("link");
		link.setAttribute("rel", "canonical");
		link.setAttribute("href", url);
		head.appendChild(link);
	}
}
// TODO: move me to Contents
export function replaceLinks(contents, fn) {

	var links = contents.querySelectorAll("a[href]");

	var replaceLink = function(link){
		var href = link.getAttribute("href");

		if(href.indexOf("mailto:") === 0){
			return;
		}

		var absolute = (href.indexOf("://") > -1);


		if(absolute){

			link.setAttribute("target", "_blank");

		}else{
			link.onclick = function(){
				// renderer.display(relative);
				fn(href);
				return false;
			};
		}
	}.bind(this);

	for (var i = 0; i < links.length; i++) {
		replaceLink(links[i]);
	}


}

export function substitute(content, urls, replacements) {
	urls.forEach(function(url, i){
		if (url && replacements[i]) {
			content = content.replace(new RegExp(url, "g"), replacements[i]);
		}
	});
	return content;
}
