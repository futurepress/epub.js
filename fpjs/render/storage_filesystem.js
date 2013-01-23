FP.storage = FP.storage || {}

FP.storage.filesystem = function() {
	var _urls = {},
		_queue = new FP.Queue("fpjs/render/loader_filesystem.js", 6),
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
				//console.log("c")
				url = getURL(path, fromCache);
				if(typeof(callback) != "undefined"){
					callback(url);
				}
			}else{
				_queue.add(path, function(url){
					console.log("url", url)
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
