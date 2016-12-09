import { qs } from "./core";
import Url from "./url";

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

export function replaceLinks(view, renderer) {

	var links = view.document.querySelectorAll("a[href]");
	var replaceLink = function(link){
		var href = link.getAttribute("href");

		if(href.indexOf("mailto:") === 0){
			return;
		}

		var linkUrl = Url(href);
		var relative = this.book.resolve(href, false);

		if(linkUrl && linkUrl.protocol){

			link.setAttribute("target", "_blank");

		}else{
			/*
			if(baseDirectory) {
				// We must ensure that the file:// protocol is preserved for
				// local file links, as in certain contexts (such as under
				// Titanium), file links without the file:// protocol will not
				// work
				if (baseUri.protocol === "file") {
					relative = core.resolveUrl(baseUri.base, href);
				} else {
					relative = core.resolveUrl(baseDirectory, href);
				}
			} else {
				relative = href;
			}
			*/

			if(linkUrl.fragment) {
				// do nothing with fragment yet
			} else {
				link.onclick = function(){
					renderer.display(relative);
					return false;
				};
			}

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
