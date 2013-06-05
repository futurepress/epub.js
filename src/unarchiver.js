EPUBJS.Unarchiver = function(url, callback){
	this.libPath = EPUBJS.filePath  + "libs/";
	this.zipUrl = url;
	this.callback = callback;
	this.loadLib(function(){
		this.getZip(this.zipUrl);
	}.bind(this));
}

EPUBJS.Unarchiver.prototype.loadLib = function(callback){
	if(typeof(zip) != "undefined") callback();
	//-- load script
	EPUBJS.core.loadScript(this.libPath+"zip.js", function(){
		//-- Tell zip where it is located
		zip.workerScriptsPath = this.libPath;
		callback();
	}.bind(this));
}

EPUBJS.Unarchiver.prototype.getZip = function(zipUrl){ 
	var xhr = new EPUBJS.core.loadFile(zipUrl);
	
	xhr.succeeded = function(file) {
		this.getEntries(file, this.toStorage.bind(this));
	}.bind(this);
	
	xhr.failed = this.failed;
	
	xhr.start();
	
}

EPUBJS.Unarchiver.prototype.getEntries = function(file, callback){
	zip.createReader(new zip.BlobReader(file), function(zipReader) {
		zipReader.getEntries(callback);
	}, this.failed);
}

EPUBJS.Unarchiver.prototype.failed = function(error){ 
	console.log("Error:", error);
}

EPUBJS.Unarchiver.prototype.afterSaved = function(error){ 
	this.callback();
}

EPUBJS.Unarchiver.prototype.toStorage = function(entries){
	var timeout = 0,
		delay = 20,
		that = this,
		count = entries.length;

	function callback(){
		count--;
		if(count == 0) that.afterSaved();
	}
		
	entries.forEach(function(entry){
		
		setTimeout(function(entry){
			that.saveEntryFileToStorage(entry, callback);
		}, timeout, entry);
		
		timeout += delay;
	});
	
	console.log("time", timeout);
	
	//entries.forEach(this.saveEntryFileToStorage.bind(this));
}

EPUBJS.Unarchiver.prototype.saveEntryFileToStorage = function(entry, callback){
	var that = this;
	entry.getData(new zip.BlobWriter(), function(blob) {
		EPUBJS.storage.save(entry.filename, blob, callback);
	});
}