EPUBJS.Section = function(item){
    this.idref = item.idref;
    this.linear = item.linear;
    this.properties = item.properties;
    this.index = item.index;
    this.href = item.href;
    this.url = item.url;
    this.cfiBase = item.cfiBase;
    this.next = item.next;
    this.prev = item.prev;
    
    this.hooks = {};
    this.hooks.replacements = new EPUBJS.Hook(this);

    // Register replacements
    this.hooks.replacements.register(this.replacements);
};


EPUBJS.Section.prototype.load = function(_request){
  var request = _request || this.request || EPUBJS.core.request;
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  if(this.contents) {
    loading.resolve(this.contents);
  } else {
    request(this.url, 'xml')
      .then(function(xml){
        var base;
        var directory = EPUBJS.core.folder(this.url);

        this.document = xml;
        this.contents = xml.documentElement;

        return this.hooks.replacements.trigger(this.document);
      }.bind(this))
      .then(function(){
        loading.resolve(this.contents);
      }.bind(this))
      .catch(function(error){
        loading.reject(error);
      });
  }
  
  return loaded;
};

EPUBJS.Section.prototype.replacements = function(_document){
    var task = new RSVP.defer();
    var base = _document.createElement("base"); // TODO: check if exists
    var head;
    base.setAttribute("href", this.url);

    if(_document) {
      head = _document.querySelector("head");
    }
    if(head) {
      head.insertBefore(base, head.firstChild);
      task.resolve();
    } else {
      task.reject(new Error("No head to insert into"));
    }
    

    return task.promise;
};

EPUBJS.Section.prototype.beforeSectionLoad = function(){
  // Stub for a hook - replace me for now
};

EPUBJS.Section.prototype.render = function(_request){
  var rendering = new RSVP.defer();
  var rendered = rendering.promise;
  
  this.load(_request).then(function(contents){
    var serializer = new XMLSerializer();
    var output = serializer.serializeToString(contents);
    rendering.resolve(output);
  })
  .catch(function(error){
    rendering.reject(error);
  });

  return rendered;
};

EPUBJS.Section.prototype.find = function(_query){

};

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* Takes: global layout settings object, chapter properties string
* Returns: Object with layout properties
*/
EPUBJS.Section.prototype.reconcileLayoutSettings = function(global){
  //-- Get the global defaults
  var settings = {
    layout : global.layout,
    spread : global.spread,
    orientation : global.orientation
  };

  //-- Get the chapter's display type
  this.properties.forEach(function(prop){
    var rendition = prop.replace("rendition:", '');
    var split = rendition.indexOf("-");
    var property, value;

    if(split != -1){
      property = rendition.slice(0, split);
      value = rendition.slice(split+1);

      settings[property] = value;
    }
  });
 return settings;
};