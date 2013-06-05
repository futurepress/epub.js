/*! fileStorage - v0.1.0 - 2013-06-04 */var fileStorage = fileStorage || {};

fileStorage.core = fileStorage.core || {};

//-- https://github.com/ebidel/filer.js/blob/master/src/filer.js#L128
fileStorage.core.dataURLToBlob = function(dataURL) {
	var BASE64_MARKER = ';base64,';
	if (dataURL.indexOf(BASE64_MARKER) == -1) {
	  var parts = dataURL.split(',');
	  var contentType = parts[0].split(':')[1];
	  var raw = parts[1];

	  return new Blob([raw], {type: contentType});
	}

	var parts = dataURL.split(BASE64_MARKER);
	var contentType = parts[0].split(':')[1];
	var raw = window.atob(parts[1]);
	var rawLength = raw.length;

	var uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
	  uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], {type: contentType});
 }
 
 fileStorage.core.loadFile = function(url, callback, responseType){
 	var xhr = new XMLHttpRequest();
 
 	this.succeeded = function(response){
 		if(callback){
 			callback(response);
 		}
 	}
 
 	this.failed = function(err){
 		console.log("Error:", err);
 	}
 
 	this.start = function(){
 		var that = this;
 
 		xhr.open('GET', url, true);
 		xhr.responseType = 'blob';
 
 		xhr.onload = function(e) {
 			if (this.status == 200) {		 			 
 				that.succeeded(this.response);
 			}
 		};
 
 		xhr.onerror = function(e) {
 			that.failed(this.status); //-- TODO: better error message
 		};
 
 		xhr.send();
 	}
 
 	return {
 		"start": this.start,
 		"succeeded" : this.succeeded,
 		"failed" : this.failed
 	}
 }
fileStorage.Queue = function(worker, concurrency){
	this._q = [];
	this._tasks = {};
	this.idCount = 0;
	this.concurrency = 0;

	this.workers = [];
	this.available = [];
	
	if(typeof(worker) === "string") {
		this.workerStr = worker;
		this.addWorkers(concurrency || 1);
	}
	
	if(typeof(worker) === "function") {
		this.workerFunction = worker;
		this.addFakeWorkers(concurrency || 1);
	}
	
}

fileStorage.Queue.prototype.addWorkers = function(concurrency){
	var min = this.concurrency,
		max = min + concurrency;
		
	//-- Stop running jobs or something?
	
	for(var i=min; i < concurrency; i++){
		var worker = new Worker(this.workerStr);
		this.workers.push(worker); //-- Add new work
		this.available.push(i);	//-- Make available to start tasks
	}
	
	this.concurrency = concurrency;

}

fileStorage.Queue.prototype.addFakeWorkers = function(concurrency){
	var min = this.concurrency,
		max = min + concurrency;

	//-- Stop running jobs or something?

	for(var i=min; i < concurrency; i++){
		var worker = new fileStorage.FakeWorker(this.workerFunction);
		this.workers.push(worker); //-- Add new work
		this.available.push(i);	//-- Make available to start tasks
	}
	
	this.concurrency = concurrency;
}

fileStorage.Queue.prototype.add = function(msg, callback, priority){
	var ID = this.idCount;
	//-- Add to task object : maybe check for dups
	this._tasks[ID] = {
		"msg": msg,
		"callback": callback || function(){}
	}
	
	//-- Add id to queue
	if(!priority){
		this._q.push(ID);
	}else{
		this._q.unshift(ID);
		if(!this.running) this.run();
	}
	
	//-- Increment ID for next task
	this.idCount++;
	
	
	
	return ID;
}

fileStorage.Queue.prototype.addGroup = function(group, callback){
	var that = this,
		counter = group.length,
		after = function(){
			counter--;
			if(counter <= 0) callback();
		};
		
	group.forEach(function(msg){
		that.add(msg, after);
	});

	if(!this.running) this.run();
	
	return after;
}

fileStorage.Queue.prototype.run = function(id){
	if(this.running) return;
	this.running = true;

	while(this.available.length) {
	  var next = this.next();
	  if(!next) break; //-- no tasks left or error
	}
	
}

fileStorage.Queue.prototype.find = function(msg){
	
}

fileStorage.Queue.prototype.next = function(){
	var that = this,
		curr = this._q.shift(),
		task, 
		workerID, 
		worker;

	if(typeof(curr) === "undefined"){
		//-- Nothing left on queue
		this.running = false;
		return false; 
	}
	
	task = this._tasks[curr];
	workerID = this.available.pop();
	worker = this.workers[workerID];
	
	//-- give worker new task
	worker.postMessage(task.msg);
	
	//-- listen for worker response
	worker.onmessage = function(e){
		var data = e.data;
		//console.log("data", data)
		task.callback(data);
		delete that._tasks[curr]; //-- Remove task
		
		that.available.push(workerID);
		that.next();
	}
	
	return worker;
}

fileStorage.Queue.prototype.empty = function(){
	this._q = [];
	this._tasks = {};
	//-- TODO: close workers
}

//-- A super simplistic fake worker, is passed a function instead of a script

fileStorage.FakeWorker = function(func){
	this.func = func;
}

fileStorage.FakeWorker.prototype.postMessage = function(msg){
	setTimeout(function(){
		this.func(msg, this.onmessage);
	}.bind(this), 1);
}

fileStorage.FakeWorker.prototype.onmessage = function(e){

}

fileStorage.FakeWorker.prototype.close = function(e){

}

fileStorage.storage = function(override){

	this._supported = {},
	this._storageType = false;
	this._store = false;
	
	this.determineStorageMethod(override);

	return this;
}


fileStorage.storage.prototype.storageMethod = function(storageType) {
	console.log("storageMethod", storageType)		

	//-- Pick store type	
	if( !storageType || typeof(fileStorage.store[storageType]) == "undefined"){
		this._storageType = "none";	
	}else{
		this._storageType = storageType;
	}

	//-- Create a new store of that type
	this._store = new fileStorage.store[this._storageType];

	//-- Handle load errors
	this._store.failed = this._error;

}

fileStorage.storage.prototype.determineStorageMethod = function(override) {
	var methods = ["filesystem", "indexeddb", "websql", "ram"],
		method = 'none';

	this.checkSupport();

	if(override && (override == "none" || this._supported[override])){
		method = override;
	}else{
		for ( var i = -1, len = methods.length; ++i < len; ){
			if ( this._supported[methods[i]] ) {
				method = methods[i];
				break;
			}
		}
	}	
	
	this.storageMethod(method);
}

fileStorage.storage.prototype.get = function(path, callback) {
	return this._store.get(path, callback);
}

fileStorage.storage.prototype.batch = function(group, callback) {
	return this._store.batch(group, callback);
}

fileStorage.storage.prototype.getURL = function(path) {
	return this._store.getURL(path);
}

fileStorage.storage.prototype.save = function(path, file, callback) {
	return this._store.save(path, file, callback);
}

fileStorage.storage.prototype._error = function(err) {
	console.log("error", err);	
}

fileStorage.storage.prototype.getStorageType = function(){
	return this._storageType;	
}

fileStorage.storage.prototype.checkSupport = function() {
	var support = "filesystem indexeddb websql ram".split(' '),
		toTest = "RequestFileSystem IndexedDB openDatabase URL".split(' ');

	for ( var t = -1, len = support.length; ++t < len; ){

		var test = support[t],
			method = toTest[t];

		this._supported[test] = this.testSupport(method);

	}

}

fileStorage.storage.prototype.testSupport = function(method) {
		prefixes = ['webkit', 'moz', 'o', 'ms'];

		for ( var i = -1, len = prefixes.length; ++i < len; ){
			if ( window[prefixes[i] + method] ) return true;
		}
		return method in window;	

}
fileStorage.store = fileStorage.store || {};

fileStorage.store.filesystem = function() {
	var _urls = {},
		_queue = new fileStorage.Queue((fileStorage.filePath || '') + "loader_filesystem.js", 6),
		_requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem,
		_fs;

	const DBSIZE = 5*1024*1024;
	const DBTYPE = TEMPORARY;



	function openFs(callback){

		if(_fs){
			callback(_fs);
			return;
		}

		_requestFileSystem(DBTYPE,  DBSIZE, function(fs){
			_fs = fs;
			callback(fs);
		}, _error);

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

		if(typeof(_urls[path]) != "undefined"){
			return _urls[path];
		}

		check(path, function(fromCache){

			var url;
			//-- should only be checking urls? but blank on reload?
			if(fromCache){
				url = getURL(path, fromCache);
				if(typeof(callback) != "undefined"){
					callback(url);
				}
			}else{
				_queue.add(path, function(url){
					check(url, function(file){
						url = getURL(path, file);
						if(typeof(callback) != "undefined"){
							callback(url);
						}
					});
				}, true);
			}

		});


	}

	function check(path, callback) {
		var request,
			objectStore;

		openFs(function(fs){
			fs.root.getFile(path, {}, 
			function(fileEntry) {
				callback(fileEntry);
			}, 
			function(){
				callback(false);
			});
		});

	}

	//-- should be in worker

	function request(path, callback) {
		var xhr = new fileStorage.core.loadFile(path);

		xhr.succeeded = function(file) {
			if(typeof(callback) != "undefined"){
				callback(file);
			}
		}

		xhr.failed = _error;

		xhr.start();
	}

	function save(path, file, callback) {
		openFs(function(fs){
			var base = path.split('/').slice(0,-1);
			createDir(fs.root, base);

			fs.root.getFile(path, {create: true}, 
			function(fileEntry) {
				
				fileEntry.createWriter(function(fileWriter) {
				
				  fileWriter.onwriteend = function(e) {
					if(callback) callback(e);
				  };
				
				  fileWriter.onerror = function(e){
					_error(err);
				  };
							
				  fileWriter.write(file);
				 
				 });
				  
			}, _error );
		});
	}
	
	function createDir(rootDirEntry, folders) {
		// Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
		if (folders[0] == '.' || folders[0] == '') {
			folders = folders.slice(1);
		}
	
		rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
			// Recursively add the new subfolder (if we still have another to create).
			if (folders.length) {
		  		createDir(dirEntry, folders.slice(1));
			}
		}, _error);
	}
	
	//-- end worker

	function getURL(path, fileEntry){
		var url;

		if(typeof(_urls[path]) != "undefined"){
			return _urls[path];
		}

		url = fileEntry.toURL();

		_urls[path] = url;

		return url;
	}

	function _error(err){
		if(typeof(this.failed) == "undefined"){
			console.log("Error: ", errorHandler(err));
		}else{
			this.failed(err);
		}
	}
	
	function errorHandler(e) {
	  switch (e.code) {
		case FileError.QUOTA_EXCEEDED_ERR:
		  return 'QUOTA_EXCEEDED_ERR';
		  break;
		case FileError.NOT_FOUND_ERR:
		  return 'NOT_FOUND_ERR';
		  break;
		case FileError.SECURITY_ERR:
		  return 'SECURITY_ERR';
		  break;
		case FileError.INVALID_MODIFICATION_ERR:
		  return 'INVALID_MODIFICATION_ERR';
		  break;
		case FileError.INVALID_STATE_ERR:
		  return 'INVALID_STATE_ERR';
		  break;
		case FileError.TYPE_MISMATCH_ERR:
		  return 'TYPE_MISMATCH_ERR';
		  break;
		default:
		  return 'Unknown Error:' + e.code ;
		  break;
	 }
	}


	return {
		"get" : get,
		"preload" : preload,
		"batch" : batch,
		"getURL" : getURL,
		"save" : save
	}	
}

fileStorage.store = fileStorage.store || {};

fileStorage.store.indexeddb = function() {
	var _store = {},
		_blobs = {},
		_queue = new fileStorage.Queue(loader, 6),
		_indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
		_db,
		_URL = window.URL;

	const DBNAME = "fileStorage_db";

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
		if(typeof(_blobs[path]) != "undefined"){
			callback(_blobs[path]);
			return; 
		}

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
			  console.log("error:", event);
			  callback(false);
			};

			request.onsuccess = function(event) {
			  var file = request.result.file;
			  
			  if(!file) {
				  console.log("File not found", path);
			  }else{
				  callback(file);
			  }
			};
		});

	}

	//-- should be in worker

	function request(path, callback) {
		var xhr = new fileStorage.core.loadFile(path);

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

		opendb(function(db){
			var transaction = db.transaction(["files"], "readwrite");
			var store = transaction.objectStore("files");	
			request = store.put(entry);

			request.onerror = function(event) {
			  console.log("failed: " + event.target.errorCode);
			};

			request.onsuccess = function(event) {
			  //-- Do nothing for now
			  //console.log("saved", path);
			};
		});
	}

	//-- end worker

	function getURL(path, file){
		var url;

		if(typeof(_blobs[path]) != "undefined"){
			callback(_blobs[path]);
			return; 
		}

		url = _URL.createObjectURL(file);

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
		"batch" : batch,
		"getURL" : getURL,
		"save" : save
	}	
}

fileStorage.store = fileStorage.store || {};

fileStorage.store.none = function() {
	var _store = {},
		_blobs = {},
		_queue = new fileStorage.Queue(loader, 6); 
		//-- max of 6 concurrent requests: http://www.browserscope.org/?category=network


	function loader(msg, callback){
		var e = {"data":null},
			fromCache = check(msg);

		if(fromCache){
			e.data = fromCache;
			callback(e);
		}else{
			request(msg, function(url){
				e.data = url;
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
			if(typeof(callback) != "undefined"){
				callback(fromCache);
			}
		}else{
			_queue.add(path, function(file){
				//url = getURL(path, file);
				if(typeof(callback) != "undefined"){
					callback(path);
				}
			}, true);
		}

	}

	function check(path) {
		var url = _store[path];

		if(typeof(url) != "undefined"){
			return url;
		}

		return false;
	}

	function request(path, callback) {
		var xhr = new fileStorage.core.loadFile(path);

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

		_store[path] = path;
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
fileStorage.store = fileStorage.store || {};

fileStorage.store.ram = function() {
	var _store = {},
		_blobs = {},
		_queue = new fileStorage.Queue(loader, 6),
		_URL = window.URL || window.webkitURL; 
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
		var xhr = new fileStorage.core.loadFile(path);

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

		url = _URL.createObjectURL(file);

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
fileStorage.store = fileStorage.store || {};

fileStorage.store.websql = function() {
	var _blobs = {},
		_queue = new fileStorage.Queue(loader, 6),
		_db,
		_URL = window.URL || window.webkitURL;

	const DBNAME = "fileStoragejs_db";
	const DBVERSION = "1";
	const DBDESC = "cache for files";
	const DBSIZE =  5 * 1024 * 1024;
	const TABLENAME = "files";
	
	function loader(msg, postMessage){
		var e = {"data":null},
			path = msg;
		
		request(msg, function(file){
				save(path, file);
				postMessage(e);
		});

	}

	function opendb(callback){

		if(_db){
			callback(_db);
			return;
		}
		
		_db = openDatabase(DBNAME, DBVERSION, DBDESC, DBSIZE);
		
		if(!_db){
			console.error("Database error");
			return;
		}
		
		_db.transaction(function (tx) {
		  tx.executeSql('CREATE TABLE IF NOT EXISTS '+ TABLENAME +' (path TEXT PRIMARY KEY ASC UNIQUE, file BLOB, type TEXT)');
		  if(callback) callback(_db);
		});

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

		if(typeof(_blobs[path]) != "undefined"){
			callback(_blobs[path]);
			return; 
		}

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
		var	request = {};
		console.log("path", path)

		request.onError = function(event, err) {
		  console.log("get Error", err);

		  callback(false);
		};
		
		request.onSuccess = function(transaction, result) {
			var row;
			
			if(result.rows.length){
				row = result.rows.item(0);
				callback(row.file);
			}
			
		};
		
		opendb(function(db){
			
			db.transaction(function(tx){
				tx.executeSql("SELECT * FROM "+TABLENAME+" WHERE path='"+path+"' LIMIT 1",
					[],
					request.onSuccess,
					request.onError);
			});

		});

	}

	function request(path, callback) {
		var xhr = new fileStorage.core.loadFile(path, false, "arraybuffer");

		xhr.succeeded = function(file) {
			if(typeof(callback) != "undefined"){
				//console.log(file)
				callback(file);
			}
		}

		xhr.failed = _error;

		xhr.start();
	}

	function save(path, file) {
		var	request = {},
			reader = new FileReader(),
			fileString;
		 
		if(!(file instanceof Blob)) {
			console.log("Not blob")
		}
		
		reader.onload = function(event){
			fileString = event.target.result;

			opendb(function(db){
				db.transaction(function(tx){
					tx.executeSql("REPLACE INTO "+TABLENAME+" (path, file, type) VALUES (?,?,?)",
						[path, fileString, file.type],
						request.onSuccess,
						request.onError);
				});
							
			});
		}
		
		reader.onerror = function(err) {
			console.log("err", err)
		}
		
		reader.readAsDataURL(file);
		
		request.onError = function(event, err) {
		  console.log("failed: ", err);
		};
		
		request.onSuccess = function(event) {
		  //-- Do nothing for now
		  console.log("saved", path);
		};


		
		
	}

	function getURL(path, file){
		var url, blob;

		if(typeof(_blobs[path]) != "undefined"){
			callback(_blobs[path]);
			return; 
		}
		
		blob = fileStorage.core.dataURLToBlob(file); //go from data url to blob
		url = _URL.createObjectURL(blob);

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
		"batch" : batch,
		"getURL" : getURL,
		"save" : save
	}	
}
