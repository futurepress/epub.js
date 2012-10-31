FP.namespace('book').page = (function($){
  var _bookPages, 
      _ordered,
      _$el,
      _currentPage = 0,
      _images;
  
  function start($el, pages, order){
    _$el = $el;
    _bookPages = pages;
    _ordered = order;
    
    _ordered.sort(function(a, b) {
        var textA = a.toUpperCase();
        var textB = b.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    
    loadIn(0)
  }
  
  function loadIn(pageNum){
    var page;
    
    _currentPage = pageNum;
    page = _bookPages[_ordered[_currentPage]];
    
    _$el.html(page);
    
    if(_images){
      scanImages();
    }
    
    
  }
  
  function next(){
    if(_currentPage <= _ordered.length){
      loadIn(_currentPage+1);
    }
  }
  
  function prev(){
    if(_currentPage > 0){
      loadIn(_currentPage-1);
    }
  }
  
  function setImages(images){
    _images = images;
    //scanImages();
  }
  
  function scanImages(){
    _$el.find("img").each(function(){
      var $this = $(this),
          src = $this.attr("src");
      
      $this.attr("src", _images[src]);
      
    })
  }
  
  return {
    "start" : start,
    "loadIn" : loadIn,
    "prev" : prev,
    "next" : next,
    "setImages": setImages
  };
})(jQuery);