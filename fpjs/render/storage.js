FP.storage = function(){

	this._URL = window.URL;
	
	function storageMethod(storageType){
		console.log("storageMethod", storageType)
		//-- Pick store type	
		if(!storageType || typeof(FP.store[storageType]) == "undefined"){
			this.storageType = "none";	
		}else{
			this.storageType = storageType;
		}
		
		//-- Create a new store of that type
		this._store = new FP.store[this.storageType];
		
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
	
	function getURL(path) {
		return this._store.getURL(path);
	}
	
	function save(path, file, callback) {
		return this._store.save(path, file, callback);
	}
	
	
	function _error(err){
		console.log("error", err);	
	}
	
	function getStorageType(){
		return this.storageType;	
	}

	return {
		"get" : get,
		"preload" : preload,
		"batch" : batch,
		"storageMethod": storageMethod,
		"getURL": getURL,
		"save" : save,
		"getStorageType" : getStorageType
	}
	
}();