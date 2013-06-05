/*! fileStorage - v0.1.0 - 2013-06-04 */var fileStorage = fileStorage || {};

var _requestFileSystem  = self.requestFileSystem || self.webkitRequestFileSystem;

const DBSIZE = 5*1024*1024;
const DBTYPE = TEMPORARY;



self.onmessage = function(event){ 
	var path = event.data; 
	
	
	self.request(path, function(file){
		self.save(path, file, function(){
			self.postMessage(path);
		});
	});

};

self.openFs = function(callback){
	
	if(self._fs){
		if(callback) callback(self._fs);
		return;
	}
	
	_requestFileSystem(DBTYPE,  DBSIZE, function(fs){
		self._fs = fs;
		if(callback) callback(fs);
	}, self.failure);

}

self.request = function(path, callback) {
	var xhr = new self.loadFile(path);

	xhr.succeeded = function(file) {
		if(callback) callback(file);
	}

	xhr.failed = function(err){
		self.postMessage("failed: " +err.toString());
	};

	xhr.start();
}

self.save = function(path, file, callback) {
	self.openFs(function(fs){
		var base = path.split('/').slice(0,-1);
		self.createDir(fs.root, base);
				
		fs.root.getFile(path, {create: true}, 
		function(fileEntry) {
			
			fileEntry.createWriter(function(fileWriter) {
			
			  fileWriter.onwriteend = function(e) {
				callback(e);
			  };
			
			  fileWriter.onerror = function(e){
				self.postMessage("write error:" + self.errorHandler(err) + " path="+path);
			  };
						
			  fileWriter.write(file);
			 
			 });
			  
		}, self.failure );
	});
}

self.createDir = function(rootDirEntry, folders) {
	// Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
	if (folders[0] == '.' || folders[0] == '') {
		folders = folders.slice(1);
	}
	
	rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
		// Recursively add the new subfolder (if we still have another to create).
		if (folders.length) {
	  		createDir(dirEntry, folders.slice(1));
		}
	}, self.failure);
};

self.failure = function(err){
	self.postMessage("failed: " + self.errorHandler(err));
}

self.errorHandler = function(e) {
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
	default:
	  return 'Unknown Error';
	  break;
 }
}

self.loadFile = function(url, callback){
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
  
self.openFs();


