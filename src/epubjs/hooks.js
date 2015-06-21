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
  var hooks = this.hooks;
  var length = hooks.length;
  var current = 0;
  var executing;
  var defer = new RSVP.defer();
  var args = arguments;
  var next = function(){
    current += 1;
    if(current < length) {
      return hooks[current].apply(this.context, args);
    }
  }.bind(this);
  if(length) {

    executing = this.hooks[current].apply(this.context, args);
    
    if(executing && typeof executing["then"] === "function") {
      // Task is a function that returns a promise
      executing.then(next);
    } else {
      // Task resolves immediately
      next();
    }
    
    
    
  } else {
    executing = defer.promise;
    defer.resolve();
  }

  return executing;
};