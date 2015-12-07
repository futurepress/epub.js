var core = require('./core');
var Parser = require('./parser');
var RSVP = require('rsvp');
var URI = require('urijs');

function Navigation(_package, _request){
  var navigation = this;
  var parse = new Parser();
  var request = _request || require('./request');

  this.package = _package;
  this.toc = [];
  this.tocByHref = {};
  this.tocById = {};

  if(_package.navPath) {
    this.navUrl = URI(_package.navPath).absoluteTo(_package.baseUrl).toString();
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
    this.ncxUrl = URI(_package.ncxPath).absoluteTo(_package.baseUrl).toString();
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
Navigation.prototype.load = function(_request) {
  var request = _request || require('./request');
  var loading, loaded;

  if(this.nav) {
    loading = this.nav.load();
  } else if(this.ncx) {
    loading = this.ncx.load();
  } else {
    loaded = new RSVP.defer();
    loaded.resolve([]);
    loading = loaded.promise;
  }

  return loading;

};

Navigation.prototype.loaded = function(toc) {
  var item;

  for (var i = 0; i < toc.length; i++) {
    item = toc[i];
    this.tocByHref[item.href] = i;
    this.tocById[item.id] = i;
  }

};

// Get an item from the navigation
Navigation.prototype.get = function(target) {
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

module.exports = Navigation;
