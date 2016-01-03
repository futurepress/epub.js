var RSVP = require('rsvp');
var URI = require('urijs');
var core = require('./core');
var EpubCFI = require('./epubcfi');
var Hook = require('./hook');
var replacements = require('./replacements');

function Section(item, hooks){
    this.idref = item.idref;
    this.linear = item.linear;
    this.properties = item.properties;
    this.index = item.index;
    this.href = item.href;
    this.url = item.url;
    this.next = item.next;
    this.prev = item.prev;

    this.cfiBase = item.cfiBase;

    this.hooks = {};
    this.hooks.serialize = new Hook(this);
    this.hooks.content = new Hook(this);

    // Register replacements
    this.hooks.content.register(replacements.base);
};


Section.prototype.load = function(_request){
  var request = _request || this.request || require('./request');
  var loading = new RSVP.defer();
  var loaded = loading.promise;

  if(this.contents) {
    loading.resolve(this.contents);
  } else {
    request(this.url)
      .then(function(xml){
        var base;
        var directory = URI(this.url).directory();

        this.document = xml;
        this.contents = xml.documentElement;

        return this.hooks.content.trigger(this.document, this);
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

Section.prototype.base = function(_document){
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

Section.prototype.beforeSectionLoad = function(){
  // Stub for a hook - replace me for now
};

Section.prototype.render = function(_request){
  var rendering = new RSVP.defer();
  var rendered = rendering.promise;
  this.output; // TODO: better way to return this from hooks?

  this.load(_request).
    then(function(contents){
      var serializer = new XMLSerializer();
      this.output = serializer.serializeToString(contents);
      return this.output;
    }.bind(this)).
    then(function(){
      return this.hooks.serialize.trigger(this.output, this);
    }.bind(this)).
    then(function(){
      rendering.resolve(this.output);
    }.bind(this))
    .catch(function(error){
      rendering.reject(error);
    });

  return rendered;
};

Section.prototype.find = function(_query){

};

/**
* Reconciles the current chapters layout properies with
* the global layout properities.
* Takes: global layout settings object, chapter properties string
* Returns: Object with layout properties
*/
Section.prototype.reconcileLayoutSettings = function(global){
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

Section.prototype.cfiFromRange = function(_range) {
  return new EpubCFI(_range, this.cfiBase).toString();
};

Section.prototype.cfiFromElement = function(el) {
  return new EpubCFI(el, this.cfiBase).toString();
};

module.exports = Section;
