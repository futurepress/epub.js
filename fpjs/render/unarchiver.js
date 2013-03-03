FP.Unarchiver = function(url, callback){
	this.libPath = (this.fpjsPath || "fpjs/" ) + "/libs/";
	this.zipUrl = url;
	this.callback = callback;
	this.loadLib(function(){
		this.getZip(this.zipUrl);
	}.bind(this));
}

FP.Unarchiver.prototype.loadLib = function(callback){
	if(typeof(zip) != "undefined") callback();
	//-- load script
	FP.core.loadScript(this.libPath+"zip.js", function(){
		//-- Tell zip where it is located
		zip.workerScriptsPath = this.libPath;
		callback();
	}.bind(this));
}

FP.Unarchiver.prototype.getZip = function(zipUrl){ 
	var xhr = new FP.core.loadFile(zipUrl);
	
	xhr.succeeded = function(file) {
		this.getEntries(file, this.toStorage.bind(this));
	}.bind(this);
	
	xhr.failed = this.failed;
	
	xhr.start();
	
}

FP.Unarchiver.prototype.getEntries = function(file, callback){
	zip.createReader(new zip.BlobReader(file), function(zipReader) {
		zipReader.getEntries(callback);
	}, this.failed);
}

FP.Unarchiver.prototype.failed = function(error){ 
	console.log("Error:", error);
}

FP.Unarchiver.prototype.afterSaved = function(error){ 
	this.callback();
}

FP.Unarchiver.prototype.toStorage = function(entries){
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

FP.Unarchiver.prototype.saveEntryFileToStorage = function(entry, callback){
	var that = this;
	entry.getData(new zip.BlobWriter(), function(blob) {
		FP.storage.save(entry.filename, blob, callback);
	});
}