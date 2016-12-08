/**
 * Hooks allow for injecting functions that must all complete in order before finishing
 * They will execute in parallel but all must finish before continuing
 * Functions may return a promise if they are asycn.
 * @param {any} context scope of this
 * @example this.content = new EPUBJS.Hook(this);
 */
class Hook {
	constructor(context){
		this.context = context || this;
		this.hooks = [];
	}

	/**
	 * Adds a function to be run before a hook completes
	 * @example this.content.register(function(){...});
	 */
	register(){
		for(var i = 0; i < arguments.length; ++i) {
			if (typeof arguments[i]  === "function") {
				this.hooks.push(arguments[i]);
			} else {
				// unpack array
				for(var j = 0; j < arguments[i].length; ++j) {
					this.hooks.push(arguments[i][j]);
				}
			}
		}
	}

	/**
	 * Triggers a hook to run all functions
	 * @example this.content.trigger(args).then(function(){...});
	 */
	trigger(){
		var args = arguments;
		var context = this.context;
		var promises = [];

		this.hooks.forEach(function(task) {
			var executing = task.apply(context, args);

			if(executing && typeof executing["then"] === "function") {
				// Task is a function that returns a promise
				promises.push(executing);
			}
			// Otherwise Task resolves immediately, continue
		});


		return Promise.all(promises);
	}

	// Adds a function to be run before a hook completes
	list(){
		return this.hooks;
	}

	clear(){
		return this.hooks = [];
	}
}
export default Hook;
