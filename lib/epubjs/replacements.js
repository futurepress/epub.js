EPUBJS.replace = {};
EPUBJS.replace.links = function(view, renderer) {
  var task = new RSVP.defer();
  var links = view.document.querySelectorAll("a[href]");
  var replaceLinks = function(link){
    var href = link.getAttribute("href");
    var uri = new EPUBJS.core.uri(href);


    if(uri.protocol){

      link.setAttribute("target", "_blank");

    }else{
      
      // relative = EPUBJS.core.resolveUrl(directory, href);
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

  task.resolve();
  return task.promise;
};