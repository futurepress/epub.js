EPUBJS.Hook = function(context){
  this.context = context || this;
  this.hooks = [];
};

//-- Hooks allow for injecting async functions that must all complete in order before finishing 
//   Functions must return a promise.

// this.beforeDisplay = new EPUBJS.Hook();
// this.beforeDisplay.register(function(){});
// this.beforeDisplay.trigger(args).then(function(){});

// Adds a function to be run before a hook completes
EPUBJS.Hook.prototype.register = function(func){
  this.hooks.push(func);
};

// Triggers a hook to run all functions
EPUBJS.Hook.prototype.trigger = function(){
  var args = arguments;
  var context = this.context;
  var promises = []
    
  this.hooks.forEach(function(task, i) {
    var executing = task.apply(context, args);
    
    if(executing && typeof executing["then"] === "function") {
      // Task is a function that returns a promise
      promises.push(executing);
    }
    // Otherwise Task resolves immediately, continue
  });
    

  return RSVP.all(promises);
};