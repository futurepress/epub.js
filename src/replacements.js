var URI = require('urijs');
var core = require('./core');

function base(doc, section){
  var base;
  var head;

  if(!doc){
    return;
  }

  head = doc.querySelector("head");
  base = head.querySelector("base");

  if(!base) {
    base = doc.createElement("base");
  }

  base.setAttribute("href", section.url);
  head.insertBefore(base, head.firstChild);

}

function links(view, renderer) {

  var links = view.document.querySelectorAll("a[href]");
  var replaceLinks = function(link){
    var href = link.getAttribute("href");
    var linkUri = URI(href);
    var absolute = linkUri.absoluteTo(view.section.url);
    var relative = absolute.relativeTo(this.book.baseUrl).toString();

    if(linkUri.protocol()){

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

      if(linkUri.fragment()) {
        // do nothing with fragment yet
      } else {
        link.onclick = function(){
          renderer.display(relative);
          return false;
        };
      }

    }
  };

  for (var i = 0; i < links.length; i++) {
    replaceLinks(links[i]);
  }


};

function substitute(content, urls, replacements) {
  urls.forEach(function(url, i){
    if (url && replacements[i]) {
      content = content.replace(new RegExp(url, 'g'), replacements[i]);
    }
  });
  return content;
}
module.exports = {
  'base': base,
  'links': links,
  'substitute': substitute
};
