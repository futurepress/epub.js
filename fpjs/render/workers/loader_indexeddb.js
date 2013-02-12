importScripts('core.js');

const DBNAME = "fpjs_db";
var indexedDB = self.indexedDB || self.mozIndexedDB || self.webkitIndexedDB || self.msIndexedDB;

var _q = [];

self.onmessage = function(event){ 
	var path = event.data; 
	
	if(self._objectStore){
		self.request(path, function(file){
			self.save(path, file);
			self.postMessage("succeeded");
		});
	}
	

};

self.opendb = function(callback){
	
	var request = indexedDB.open(DBNAME);
	
	request.onsuccess = function(event) {
	  self._db = request.result;
	  
	  _db.onerror = function(event) {
		self.postMessage("failed: " + event.target.errorCode);
	  };
	  
	  self._transaction = _db.transaction(["files"], "readwrite");//.objectStore("files");

	  self._objectStore = self._transaction.objectStore("files");
	  
	  if(callback) callback(_db);
	  
	};
	
	
	request.onerror = function(event) {
	  self.postMessage("failed: " + event.target.errorCode);
	};
	

}

self.request = function(path, callback) {
	var xhr = new FP.core.loadFile(path);

	xhr.succeeded = function(file) {
		if(callback) callback(file);
	}

	xhr.failed = function(err){
		self.postMessage("failed: " +err);
	};

	xhr.start();
}

self.save = function(path, file) {
	var	entry = {"path" : path, "file": file},
		request;
	self.postMessage("failed: before");
	var transaction = _db.transaction(["files"], "readwrite");
	var store = transaction.objectStore("files");	
	request = store.put(entry);
	self.postMessage("failed: after");
	request.onerror = function(event) {
	  self.postMessage("failed: " + event.target.errorCode);
	};
	
	request.onsuccess = function(event) {
	  //-- Do nothing for now
	};
}

self.opendb();
/*
self.opendb(function(db){
	var transaction = db.transaction(["files"], "readwrite")//.objectStore("files");
	
	transaction.oncomplete = function(event) {
	  self.postMessage("All done!");
	};
	
	transaction.onerror = function(event) {
	  self.postMessage("Error in Transaction")
	};
	
	_objectStore = transaction.objectStore("files");
});
*/
