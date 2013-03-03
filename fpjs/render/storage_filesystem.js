FP.store = FP.store || {};

FP.store.filesystem = function() {
	var _urls = {},
		_queue = new FP.Queue("fpjs/render/workers/loader_filesystem.js", 6),
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
		var xhr = new FP.core.loadFile(path);

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
