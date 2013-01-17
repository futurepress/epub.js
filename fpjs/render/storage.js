FP.storage = function(){

	this._URL = window.URL;
	
	function storageMethod(storageType){
		console.log("storageMethod", storageType)
		//-- Pick store type	
		if(!storageType || typeof(FP.storage[storageType]) == "undefined"){
			this.storageType = "none";	
		}else{
			this.storageType = storageType;
		}
		
		//-- Create a new store of that type
		this._store = new FP.storage[this.storageType];
		
		//-- Handle load errors
		this._store.failed = _error;
		
	}
	
	function get(path, callback) {
		return this._store.get(path, callback);
	}
	
	function preload(path, callback) {
		return this._store.preload(path, callback);
	}
	
	function batch(group, callback) {
		return this._store.batch(group, callback);
	}
	
	function replace(path, content, callback) {
		//return this._store.batch(group, callback);
	}
	
	function _error(err){
		console.log("error", err);	
	}

	return {
		"get" : get,
		"preload" : preload,
		"batch" : batch,
		"storageMethod": storageMethod
	}
	
}();

/*
FP.storage.ram = function() {
	var _store = {},
		_blobs = {},
		_queue = new FP.Queue("loader_ram.js", 3);

		
	//-- TODO: this should be prototypes?
	
	//-- Used for preloading
	function preload(path) {
		var fromCache = check(path);
		
		if(!fromCache){
			request(path);
		}
	}
	
	function batch(group, callback){
		_queue.addGroup(group)
	}

	//-- Fetches url
	function get(path, callback) {
		var fromCache = check(path),
			url;

		if(fromCache){
			url = getURL(path, fromCache);
			if(typeof(callback) != "undefined"){
				callback(url);
			}
		}else{
			request(path, function(file){
				url = getURL(path, file);
				if(typeof(callback) != "undefined"){
					callback(url);
				}
			});
		}

	}

	function check(path) {
		var file = _store[file];

		if(typeof(file) != "undefined"){
			return file;
		}

		return false;
	}

	function request(path, callback) {
		var xhr = new FP.core.loadFile(path);
		
		xhr.succeeded = function(file) {
			//console.log("file", file)
			cache(path, file);
			if(typeof(callback) != "undefined"){
				callback(file);
			}
		}

		xhr.failed = _error;
		
		xhr.start();
	}

	function cache(path, file) {
		if(_store[path]) return;

		_store[path] = file;

	}

	function getURL(path, file){
		var url;
		
		if(typeof(_blobs[path]) != "undefined"){
			return _blobs[path];
		}
		
		url = this._URL.createObjectURL(file);

		//-- need to revokeObjectURL previous urls, but only when cleaning cache
		// this.createdURLs.forEach(function(url){
		// 	this._URL.revokeObjectURL(url);
		// });

		_blobs[path] = url;
		
		return url;
	}

	// this.succeeded = function(){
	// 	console.log("loaded");	
	// }
	// 
	// this.failed = function(){
	// 	console.log("loaded");	
	// }
	
	function _error(err){
		if(typeof(this.failed) == "undefined"){
			console.log("Error: ", err);
		}else{
			this.failed(err);
		}
	}
	
	return {
		"get" : get,
		"preload" : preload
	}	
}
*/

FP.storage.none = function() {
	var _store = {};

	//-- Used for preloading
	function preload(path) {
		var fromCache = check(path);
		
		if(!fromCache){
			request(path);
		}
	}

	//-- Fetches url
	function get(path, callback) {
		var fromCache = check(path),
			url;

		if(fromCache){
			callback(path); 
		}else{
			request(path, function(file){
				callback(path); 
			});
		}

	}

	function check(path) {
		var file = _store[path];

		if(typeof(file) != "undefined"){
			return file;
		}

		return false;
	}

	function request(path, callback) {
		var xhr = new FP.core.loadFile(path);

		xhr.succeeded = function(file) {
			cache(path, file);
			if(typeof(callback) != "undefined"){
				callback(file);
			}
		}

		xhr.failed = _error;

		xhr.start();
	}

	function cache(path, file) {
		if(_store[path]) return;

		_store[path] = file;

	}


	function _error(err){
		if(typeof(this.failed) == "undefined"){
			console.log("Error: ", err);
		}else{
			this.failed(err);
		}
	}

	return {
		"get" : get,
		"preload" : preload
	}	
}

FP.storage.ram = function() {
	var _store = {},
		_blobs = {},
		_queue = new FP.Queue(loader, 6); 
		//-- max of 6 concurrent requests: http://www.browserscope.org/?category=network

	
	function loader(msg, callback){
		var e = {"data":null},
			fromCache = check(msg);
		
		if(fromCache){
			e.data = fromCache;
			callback(e);
		}else{
			request(msg, function(file){
				e.data = file;
				callback(e);
			});
		}
	}
	
	function preload(path) {
		var fromCache = check(path);

		if(!fromCache){
			_queue.add(path);
		}
	}

	function batch(group, callback){
		_queue.addGroup(group, callback);
	}

	//-- Fetches url
	function get(path, callback) {
		var fromCache = check(path),
			url;

		if(fromCache){
			url = getURL(path, fromCache);
			if(typeof(callback) != "undefined"){
				callback(url);
			}
		}else{
			_queue.add(path, function(file){
				url = getURL(path, file);
				if(typeof(callback) != "undefined"){
					callback(url);
				}
			}, true);
		}

	}

	function check(path) {
		var file = _store[path];

		if(typeof(file) != "undefined"){
			return file;
		}

		return false;
	}

	function request(path, callback) {
		var xhr = new FP.core.loadFile(path);

		xhr.succeeded = function(file) {
			//console.log("file", file)
			cache(path, file);
			if(typeof(callback) != "undefined"){
				callback(file);
			}
		}

		xhr.failed = _error;

		xhr.start();
	}

	function cache(path, file) {
		if(_store[path]) return;

		_store[path] = file;
	}

	function getURL(path, file){
		var url;

		if(typeof(_blobs[path]) != "undefined"){
			return _blobs[path];
		}

		url = this._URL.createObjectURL(file);

		//-- need to revokeObjectURL previous urls, but only when cleaning cache
		// this.createdURLs.forEach(function(url){
		// 	this._URL.revokeObjectURL(url);
		// });

		_blobs[path] = url;

		return url;
	}

	// this.succeeded = function(){
	// 	console.log("loaded");	
	// }
	// 
	// this.failed = function(){
	// 	console.log("loaded");	
	// }

	function _error(err){
		if(typeof(this.failed) == "undefined"){
			console.log("Error: ", err);
		}else{
			this.failed(err);
		}
	}

	return {
		"get" : get,
		"preload" : preload,
		"batch" : batch
	}	
}

FP.storage.indexedDB = function() {
	var _store = {},
		_blobs = {},
		_queue = new FP.Queue(loader, 6),
		_indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
		_db;
				
	const DBNAME = "fpjs_db";

	//-- max of 6 concurrent requests: http://www.browserscope.org/?category=network
	function loader(msg, postMessage){
		var e = {"data":null},
			path = msg;
		
		request(msg, function(file){
				save(path, file);
				postMessage(e);
		});
		
	}

	function opendb(callback){
		var request;
		
		if(_db){
			callback(_db);
			return;
		}
		
		request = indexedDB.open(DBNAME);
		
		
		request.onsuccess = function(event) {
		  _db = request.result;
		  
		  _db.onerror = function(event) {
		    console.log("Database error: " + event.target.errorCode);
		  };
		  
		  
		  if(callback) callback(_db);
		  
		};
		
		
		request.onerror = function(event) {
		  // Handle errors.
		};
		
		
		request.onupgradeneeded = function(event) {		
		  var db = event.target.result,
		  	  objectStore = db.createObjectStore("files", { keyPath: "path" }); //keyPath: "id", autoIncrement: true 

		  //objectStore.createIndex("path", "path", { unique: true });
		  
		  //objectStore.createIndex("file", "file", { unique: false });
		
		};
		
		

	}

	function preload(path) {
		// var fromCache = check(path);
		// 
		// if(!fromCache){
		// 	_queue.add(path);
		// }
	}

	function batch(group, callback){
		_queue.addGroup(group, callback);
	}

	//-- Fetches url
	function get(path, callback) {
		
		check(path, function(fromCache){
			
			var url;
			
			if(fromCache){
				url = getURL(path, fromCache);
				if(typeof(callback) != "undefined"){
					callback(url);
				}
			}else{
				_queue.add(path, function(file){
					url = getURL(path, file);
					if(typeof(callback) != "undefined"){
						callback(url);
					}
				}, true);
			}
			
		});
		

	}

	function check(path, callback) {
		var request,
			objectStore;

		opendb(function(db){
			objectStore = db.transaction(["files"]).objectStore("files");
			request = objectStore.get(path);
			
			request.onerror = function(event) {
			  callback(false);
			};
			
			request.onsuccess = function(event) {
			  callback(request.result.file);
			};
		});

	}
	
	//-- should be in worker
	
	function request(path, callback) {
		var xhr = new FP.core.loadFile(path);

		xhr.succeeded = function(file) {
			if(typeof(callback) != "undefined"){
				callback(file);
			}
		}

		xhr.failed = _error;

		xhr.start();
	}

	function save(path, file) {
		var	entry = {"path" : path, "file": file},
			request;

		var transaction = _db.transaction(["files"], "readwrite");
		var store = transaction.objectStore("files");	
		request = store.put(entry);

		request.onerror = function(event) {
		  console.log("failed: " + event.target.errorCode);
		};
	
		request.onsuccess = function(event) {
		  //-- Do nothing for now
		  console.log("saved", path);
		};
	}
	
	//-- end worker
	
	function getURL(path, file){
		var url;

		if(typeof(_blobs[path]) != "undefined"){
			return _blobs[path];
		}

		url = this._URL.createObjectURL(file);

		//-- need to revokeObjectURL previous urls, but only when cleaning cache
		// this.createdURLs.forEach(function(url){
		// 	this._URL.revokeObjectURL(url);
		// });

		_blobs[path] = url;

		return url;
	}

	function _error(err){
		if(typeof(this.failed) == "undefined"){
			console.log("Error: ", err);
		}else{
			this.failed(err);
		}
	}
	
	

	return {
		"get" : get,
		"preload" : preload,
		"batch" : batch
	}	
}



