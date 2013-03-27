FP.storage = function(){

	
	var _supported = {},
		_storageType,
		_store;
	
	
	function storageMethod(storageType){
		console.log("storageMethod", storageType)		
		
		//-- Pick store type	
		if( !storageType || typeof(FP.store[storageType]) == "undefined"){
			_storageType = "none";	
		}else{
			_storageType = storageType;
		}
		
		//-- Create a new store of that type
		_store = new FP.store[_storageType];
		
		//-- Handle load errors
		_store.failed = _error;
		
	}
	
	function determineStorageMethod(override) {
		var methods = ["filesystem", "indexeddb", "websqldatabase", "ram"],
			method = 'none';
		
		checkSupport();
		
		if(override && (override == "none" || _supported[override])){
			method = override;
		}else{
			for ( var i = -1, len = methods.length; ++i < len; ){
				if ( _supported[methods[i]] ) {
					method = methods[i];
					break;
				}
			}
		}	
		
		storageMethod(method);
	}
	
	function get(path, callback) {
		return _store.get(path, callback);
	}
	
	function preload(path, callback) {
		return _store.preload(path, callback);
	}
	
	function batch(group, callback) {
		return _store.batch(group, callback);
	}
	
	function getURL(path) {
		return _store.getURL(path);
	}
	
	function save(path, file, callback) {
		return _store.save(path, file, callback);
	}
	
	
	function _error(err){
		console.log("error", err);	
	}
	
	function getStorageType(){
		return _storageType;	
	}
	
	function checkSupport() {
		var support = "filesystem indexeddb websqldatabase ram".split(' '),
			toTest = "RequestFileSystem IndexedDB openDatabase URL".split(' ');
		
		for ( var t = -1, len = support.length; ++t < len; ){
			
			var test = support[t],
				method = toTest[t];
				
			_supported[test] = testSupport(method);
			
		}

	}
	
	function testSupport(method) {
			prefixes = ['webkit', 'moz', 'o', 'ms'];
			
			for ( var i = -1, len = prefixes.length; ++i < len; ){
				if ( window[prefixes[i] + method] ) return true;
			}
			return method in window;	
		
	}

	return {
		"get" : get,
		"preload" : preload,
		"batch" : batch,
		"storageMethod": storageMethod,
		"getURL": getURL,
		"save" : save,
		"getStorageType" : getStorageType,
		"determineStorageMethod": determineStorageMethod
	}
	
}();