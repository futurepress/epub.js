EPUBJS.Queue = function(_context){
  this._q = [];
  this.context = _context;
  this.tick = EPUBJS.core.requestAnimationFrame;
  this.running = false;
};

// Add an item to the queue
EPUBJS.Queue.prototype.enqueue = function(task, args, context) {
  var deferred, promise;
  var queued;
  
  // Handle single args without context
  if(args && !args.length) {
    args = [args];
  }
  
  if(typeof task === "function"){
    
    deferred = new RSVP.defer();
    promise = deferred.promise;
    
    queued = {
      "task" : task,
      "args"     : args,
      "context"  : context,
      "deferred" : deferred,
      "promise" : promise
    };
    
  } else {
    // Task is a promise
    queued = {
      "promise" : task
    };
    
  }
  
  this._q.push(queued);

  
  return queued.promise;
};

// Run one item
EPUBJS.Queue.prototype.dequeue = function(){
  var inwait, task;

  if(this._q.length) {
    inwait = this._q.shift();
    task = inwait.task;

    if(task){
      // Task is a function that returns a promise
      return task.apply(inwait.context || this.context, inwait.args).then(function(){
        inwait.deferred.resolve.apply(inwait.context || this.context, arguments);
      }.bind(this));
      
    } else {
      // Task is a promise
      return inwait.promise;
    }

  } else {
    return null;
  }
};

// Run All Immediately
EPUBJS.Queue.prototype.flush = function(){
  while(this._q.length) {
    this.dequeue();
  }
};

// Run all sequentially, at convince
EPUBJS.Queue.prototype.run = function(){
  if(!this.running && this._q.length) {
    this.running = true;
    this.dequeue().then(function(){
      this.running = false;
    }.bind(this));
  }
  
  this.tick.call(window, this.run.bind(this));
};

// Clear all items in wait
EPUBJS.Queue.prototype.clear = function(){
  this._q = [];
};

EPUBJS.Queue.prototype.length = function(){
  return this._q.length;
};

// Create a new tast from a callback
EPUBJS.Task = function(task, args, context){

  return function(){
    var toApply = arguments || [];
    
    return new RSVP.Promise(function(resolve, reject) {
      var callback = function(value){
        resolve(value);
      };
      // Add the callback to the arguments list
      toApply.push(callback);

      // Apply all arguments to the functions
      task.apply(this, toApply);
    
  }.bind(this));

  };

};