(function() {

  function start() {
    var params = URLSearchParams && new URLSearchParams(document.location.search.substring(1));
    var url = params && params.get("url") && decodeURIComponent(params.get("url"));
    var defaultUrl = window.location.protocol + "//s3.amazonaws.com/epubjs.org/books/moby-dick-hypothesis-demo.epub";
    // Load the opf
    var book = ePub(url || defaultUrl, {
      canonical: function(path) {
        var url =  window.location.href.replace(/loc=([^&]*)/, "loc="+path);
        return url;
      }
    });
    var rendition = book.renderTo("viewer", {
      ignoreClass: "annotator-hl",
      width: "100%",
      height: "100%"
    });

    // var hash = window.location.hash.slice(2);
    var loc = window.location.href.indexOf("?loc=");
    if (loc > -1) {
      var href =  window.location.href.slice(loc + 5);
      var hash = decodeURIComponent(href);
    }

    rendition.display(hash || undefined);


    var next = document.getElementById("next");
    next.addEventListener("click", function(e){
      rendition.next();
      e.preventDefault();
    }, false);

    var prev = document.getElementById("prev");
    prev.addEventListener("click", function(e){
      rendition.prev();
      e.preventDefault();
    }, false);

    var nav = document.getElementById("navigation");
    var opener = document.getElementById("opener");
    opener.addEventListener("click", function(e){
      nav.classList.add("open");
    }, false);

    var closer = document.getElementById("closer");
    closer.addEventListener("click", function(e){
      nav.classList.remove("open");
    }, false);

    // Hidden
    var hiddenTitle = document.getElementById("hiddenTitle");

    rendition.on("rendered", function(section){
      var current = book.navigation && book.navigation.get(section.href);

      if (current) {
        document.title = current.label;
      }

      // TODO: this is needed to trigger the hypothesis client
      // to inject into the iframe
      requestAnimationFrame(function () {
        hiddenTitle.textContent = section.href;
      })

      var old = document.querySelectorAll('.active');
      Array.prototype.slice.call(old, 0).forEach(function (link) {
        link.classList.remove("active");
      })

      var active = document.querySelector('a[href="'+section.href+'"]');
      if (active) {
        active.classList.add("active");
      }

      let urlParam = params && params.get("url");
      let url = '';
      if (urlParam) {
        url = "url=" + urlParam + "&";
      }
      // Add CFI fragment to the history
      history.pushState({}, '', "?" + url + "loc=" + encodeURIComponent(section.href));
      // window.location.hash = "#/"+section.href
    });

    var keyListener = function(e){

      // Left Key
      if ((e.keyCode || e.which) == 37) {
        rendition.prev();
      }

      // Right Key
      if ((e.keyCode || e.which) == 39) {
        rendition.next();
      }

    };

    rendition.on("keyup", keyListener);
    document.addEventListener("keyup", keyListener, false);

    book.loaded.navigation.then(function(toc){
      var $nav = document.getElementById("toc"),
          docfrag = document.createDocumentFragment();

      var processTocItem = function(chapter, parent) {
        var item = document.createElement("li");
        var link = document.createElement("a");
        link.id = "chap-" + chapter.id;
        link.textContent = chapter.label;
        link.href = chapter.href;
        item.appendChild(link);
        parent.appendChild(item);

        if (chapter.subitems.length) {
          var ul = document.createElement("ul");
          item.appendChild(ul);
          chapter.subitems.forEach(function(subchapter) {
            processTocItem(subchapter, ul);
          });
        }

        link.onclick = function(){
          var url = link.getAttribute("href");
          console.log(url)
          rendition.display(url);
          return false;
        };

      }

      toc.forEach(function(chapter) {
        processTocItem(chapter, docfrag);
      });

      $nav.appendChild(docfrag);


    });

    book.loaded.metadata.then(function(meta){
      var $title = document.getElementById("title");
      var $author = document.getElementById("author");
      var $cover = document.getElementById("cover");
      var $nav = document.getElementById('navigation');

      $title.textContent = meta.title;
      $author.textContent = meta.creator;
      if (book.archive) {
        book.archive.createUrl(book.cover)
          .then(function (url) {
            $cover.src = url;
          })
      } else {
        $cover.src = book.cover;
      }

      // if ($nav.offsetHeight + 60 < window.innerHeight) {
      //   $nav.classList.add("fixed");
      // }

    });

    var tm;
    function checkForAnnotator(cb, w) {
     if (!w) {
       w = window;
     }
     tm = setTimeout(function () {
        if (w && w.annotator) {
          clearTimeout(tm);
          cb();
        } else {
          checkForAnnotator(cb, w);
        }
      }, 100);
    }

    book.rendition.hooks.content.register(function(contents, view) {
        checkForAnnotator(function () {

          var annotator = contents.window.annotator;

          contents.window.addEventListener('scrolltorange', function (e) {
            var range = e.detail;
            var cfi = new ePub.CFI(range, contents.cfiBase).toString();
            if (cfi) {
              book.rendition.display(cfi);
            }
            e.preventDefault();
          });


          annotator.on("highlightClick", function (annotation) {
            console.log(annotation);
            window.annotator.show();
          })

          annotator.on("beforeAnnotationCreated", function (annotation) {
            console.log(annotation);
            window.annotator.show();
          })

        }, contents.window);

    });
  }

  document.addEventListener('DOMContentLoaded', start, false);
})();
