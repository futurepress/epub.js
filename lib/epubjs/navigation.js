EPUBJS.Navigation = function(_package, _request){
  var navigation = this;
  var parse = new EPUBJS.Parser();
  var request = _request || EPUBJS.core.request;

  this.package = _package;
  this.toc = [];
  this.tocByHref = {};
  this.tocById = {};

  if(_package.navPath) {
    this.navUrl = _package.baseUrl + _package.navPath;
    this.nav = {};

    this.nav.load = function(_request){
      var loading = new RSVP.defer();
      var loaded = loading.promise;
      
      request(navigation.navUrl, 'xml').then(function(xml){
        navigation.toc = parse.nav(xml);
        navigation.loaded(navigation.toc);
        loading.resolve(navigation.toc);
      });

      return loaded;
    };

  }
  
  if(_package.ncxPath) {
    this.ncxUrl = _package.baseUrl + _package.ncxPath;
    this.ncx = {};
  
    this.ncx.load = function(_request){
      var loading = new RSVP.defer();
      var loaded = loading.promise;

      request(navigation.ncxUrl, 'xml').then(function(xml){
        navigation.toc = parse.ncx(xml);
        navigation.loaded(navigation.toc);
        loading.resolve(navigation.toc);
      });

      return loaded;
    };
    
  }
};

// Load the navigation
EPUBJS.Navigation.prototype.load = function(_request) {
  var request = _request || EPUBJS.core.request;
  var loading;

  if(this.nav) {
    loading = this.nav.load();
  } else if(this.ncx) {
    loading = this.ncx.load();
  }

  return loading;
  
};

EPUBJS.Navigation.prototype.loaded = function(toc) {
  var item;

  for (var i = 0; i < toc.length; i++) {
    var item = toc[i];
    this.tocByHref[item.href] = i;
    this.tocById[item.id] = i;
  };

};

// Get an item from the navigation
EPUBJS.Navigation.prototype.get = function(target) {
  var index;

  if(!target) {
    return this.toc;
  }

  if(target.indexOf("#") === 0) {
    index = this.tocById[target.substring(1)];
  } else if(target in this.tocByHref){
    index = this.tocByHref[target];
  }

  return this.toc[index];
};