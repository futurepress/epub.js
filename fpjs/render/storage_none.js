FP.store = FP.store || {};

FP.store.none = function() {
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
				url = getURL(path, file);
				if(typeof(callback) != "undefined"){
					callback(url);
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