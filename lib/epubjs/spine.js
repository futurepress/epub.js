EPUBJS.Spine = function(_package, _request){
  this.items = _package.spine;
  this.manifest = _package.manifest;
  this.spineNodeIndex = _package.spineNodeIndex;
  this.baseUrl = _package.baseUrl || '';
  this.request = _request;
  this.length = this.items.length;
  this.epubcfi = new EPUBJS.EpubCFI();
  this.spineItems = [];
  this.spineByHref = {};
  this.spineById = {};

  this.items.forEach(function(item, index){
    var cfiBase = this.epubcfi.generateChapterComponent(this.spineNodeIndex, item.index, item.idref);
    var href, url;
    var manifestItem = this.manifest[item.idref];
    var spineItem;

    if(manifestItem) {
      href = manifestItem.href;
      url = this.baseUrl + href;
    }

    spineItem = new EPUBJS.SpineItem(item, href, url, cfiBase);
    this.spineItems.push(spineItem);

    this.spineByHref[spineItem.href] = index;
    this.spineById[spineItem.idref] = index;


  }.bind(this));

};

// book.spine.get();
// book.spine.get(1);
// book.spine.get("chap1.html");
// book.spine.get("#id1234");
EPUBJS.Spine.prototype.get = function(target) {
  var index = 1;

  if(typeof target === "number" || isNaN(target) === false){
    index = target-1;
  } else if(target.indexOf("#") === 0) {
    index = this.spineById[target.substring(1)];
  } else {
    index = this.spineByHref[target];
  }

  return this.spineItems[index];
};


EPUBJS.SpineItem = function(item, href, url, cfiBase){
    this.idref = item.idref;
    this.linear = item.linear;
    this.properties = item.properties;
    this.index = item.index;
    this.href = href;
    this.url = url;
    this.cfiBase = cfiBase;
};


EPUBJS.SpineItem.prototype.load = function(_request){
  var request = _request || this.request || EPUBJS.core.request;
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  if(this.contents) {
    loading.resolve(this.contents);
  } else {  
    request(this.url, 'xml').then(function(xml){
      this.contents = xml.documentElement;
      loading.resolve(this.contents);
    }.bind(this));
  }
  
  return loaded;
};

EPUBJS.SpineItem.prototype.render = function(){
  return this.load().then(function(contents){
    var serializer = new XMLSerializer();
    return serializer.serializeToString(contents);
  });
};

EPUBJS.SpineItem.prototype.find = function(_query){

};