FP.namespace("utils").createTempFile = (function(){
  var requestFileSystem = webkitRequestFileSystem || mozRequestFileSystem || requestFileSystem;
  
  function createTempFile(callback) {    
      var tmpFilename = "tmp.dat";
      requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(filesystem) {
        function create() {
          filesystem.root.getFile(tmpFilename, {
            create : true
          }, function(zipFile) {
            callback(zipFile);
          });
        }
      
        filesystem.root.getFile(tmpFilename, null, function(entry) {
          entry.remove(create, create);
        }, create);
      });
  }

  return createTempFile

})();