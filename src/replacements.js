var core = require('./core');

function links(view, renderer) {

  var links = view.document.querySelectorAll("a[href]");
  var replaceLinks = function(link){
    var href = link.getAttribute("href");
    var uri = new core.uri(href);


    if(uri.protocol){

      link.setAttribute("target", "_blank");

    }else{

      // relative = core.resolveUrl(directory, href);
      // if(uri.fragment && !base) {
      //   link.onclick = function(){
      //     renderer.fragment(href);
      //     return false;
      //   };
      // } else {

      //}

      if(href.indexOf("#") === 0) {
        // do nothing with fragment yet
      } else {
        link.onclick = function(){
          renderer.display(href);
          return false;
        };
      }

    }
  };

  for (var i = 0; i < links.length; i++) {
    replaceLinks(links[i]);
  }


};

module.exports = {
  'links': links
};
