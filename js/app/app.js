FP.namespace('app').init = (function($){
  
  
  function init(){
    var fileInput = document.getElementById("file-input");
    var bookFiles = [],
        bookImages = [],
        bookCSS = [];
    
    //-- Tell zip where it is located
    zip.workerScriptsPath = "/js/libs/";
    
    //-- Listen for the Input Change
    fileInput.addEventListener('change', function(){
      //-- Grab first file
      var file = fileInput.files[0];
      
      //-- Get all Entries in Zip file
      FP.core.loadZip.getEntries(file, function(entries) {
        //-- Split Entries into xhtml, images, css
        entries.forEach(function(entry) {
          
          if(entry.filename.search(".xhtml") != -1){
            bookFiles.push(entry);
          }
          
          if(entry.filename.search(".jpg") != -1 || entry.filename.search(".png") != -1){
            bookImages.push(entry);
          }
          
          if(entry.filename.search(".css") != -1){
            bookCSS.push(entry);
          }
          
        });
        
        bookFiles.forEach(function(file) {
          //Blob or File
          FP.core.loadZip.getEntryFile(file, "Blob", function(blobURL, revokeBlobURL) {
            console.log(file.filename, blobURL)
          });
        });
        //console.log(bookFiles, bookImages, bookCSS)
      });
      
    });
  }
  
  return init;
  
})(jQuery);