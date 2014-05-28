EPUBJS.hooks = {};
EPUBJS.Hooks = (function(){
	function hooks(){}
	
	//-- Get pre-registered hooks
	hooks.prototype.getHooks = function(){
		var plugs;
		this.hooks = {};
		Array.prototype.slice.call(arguments).forEach(function(arg){
			this.hooks[arg] = [];
		}, this);

		for (var plugType in this.hooks) {
			plugs = _.values(EPUBJS.hooks[plugType]);
	
			plugs.forEach(function(hook){
				this.registerHook(plugType, hook);
			}, this);
		}
	};
	
	//-- Hooks allow for injecting async functions that must all complete before continuing 
	//   Functions must have a callback as their first argument.
	hooks.prototype.registerHook = function(type, toAdd, toFront){
	
		if(typeof(this.hooks[type]) != "undefined"){
	
			if(typeof(toAdd) === "function"){
				if(toFront) {
					this.hooks[type].unshift(toAdd);
				}else{
					this.hooks[type].push(toAdd);
				}
			}else if(Array.isArray(toAdd)){
				toAdd.forEach(function(hook){
					if(toFront) {
						this.hooks[type].unshift(hook);
					}else{
						this.hooks[type].push(hook);
					}
				}, this);
			}
		}else{
			//-- Allows for undefined hooks, but maybe this should error?
			this.hooks[type] = [func];
		}
	};
	
	hooks.prototype.triggerHooks = function(type, callback, passed){
		var hooks, count;
	
		if(typeof(this.hooks[type]) == "undefined") return false;
	
		hooks = this.hooks[type];
	
		count = hooks.length;
		if(count === 0 && callback) {
			callback();
		}

		function countdown(){
			count--;
			if(count <= 0 && callback) callback();
		}
	
		hooks.forEach(function(hook){
			hook(countdown, passed);
		});
	};
	
	return {
		register: function(name) {
			if(EPUBJS.hooks[name] === undefined) { EPUBJS.hooks[name] = {}; }
			if(typeof EPUBJS.hooks[name] !== 'object') { throw "Already registered: "+name; }
			return EPUBJS.hooks[name];
		},
		mixin: function(object) {
			for (var prop in hooks.prototype) {
				object[prop] = hooks.prototype[prop];
			}
		}
	};
})();

