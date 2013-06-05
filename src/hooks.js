EPUBJS.Hooks = (function(){

  "use strict";
  return {
	register: function(name) {
	  if(this[name] === undefined) { this[name] = {}; }
	  if(typeof this[name] !== 'object') { throw "Already registered: "+name; }
	  return this[name];
	}
  };
})();