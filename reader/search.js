EPUBJSR.search = {};

// Search Server -- https://github.com/futurepress/epubjs-search
EPUBJSR.search.SERVER = "http://localhost:5000";

EPUBJSR.search.request = function(q, callback) {
  var fetch = $.ajax({
    dataType: "json",
    url: EPUBJSR.search.SERVER + "/search?q=" + encodeURIComponent(q) 
  });

  fetch.fail(function(err) {
    console.error(err);
  });

  fetch.done(function(results) {
    callback(results);
  });
};

EPUBJSR.search.View = function() {

  var $searchBox = $("#searchBox"),
      $searchResults = $("#searchResults"),
      $tocView = $("#toc"),
      $searchView = $("#searchView"),
      iframeDoc;
  
  
  $searchBox.on("search", function(e) {
    var q = $searchBox.val();

    e.preventDefault();
    //-- SearchBox is empty or cleared
    if(q == '') {
      $searchResults.empty();
      $searchView.removeClass("shown");
      $tocView.removeClass("hidden");
      $(iframeDoc).find('body').unhighlight();
      iframeDoc = false;
      return;
    }

    if(!$searchView.hasClass("shown")) {
      $searchView.addClass("shown");
      $tocView.addClass("hidden");
    }
    
    $searchResults.empty();
    $searchResults.append("<li><p>Searching...</p></li>");
    
    
    
    EPUBJSR.search.request(q, function(data) {
      var results = data.results;
      
      $searchResults.empty();
      
      if(iframeDoc) { 
        $(iframeDoc).find('body').unhighlight();
      }
      
      if(results.length == 0) {
        $searchResults.append("<li><p>No Results Found</p></li>");
        return;
      }
      
      iframeDoc = $("#area iframe")[0].contentDocument;
      $(iframeDoc).find('body').highlight(q, { element: 'span' });
      
      results.forEach(function(result) {
        var $li = $("<li></li>");
        var $item = $("<a href='"+result.href+"' data-cfi='"+result.cfi+"'><span>"+result.title+"</span><p>"+result.highlight+"</p></a>");

        $item.on("click", function(e) {
          var $this = $(this),
              cfi = $this.data("cfi");
              
          Book.gotoCfi(cfi);
          
          Book.on("renderer:chapterDisplayed", function() {
            iframeDoc = $("#area iframe")[0].contentDocument;
            $(iframeDoc).find('body').highlight(q, { element: 'span' });
          })
          
          e.preventDefault();
          
        });
        $li.append($item);
        $searchResults.append($li);
      });

    });

  });

};
