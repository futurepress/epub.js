FP.namespace('app').init = (function($){
  
  
  function init(){
    var fileInput = document.getElementById("file-input");
    var area = document.getElementById("area");
    var bookFiles = [],
        bookImages = [],
        bookCSS = [];
    
    var pages = {},
        images = {},
        ordered = [];
    
    //-- Tell zip where it is located
    zip.workerScriptsPath = "/js/libs/";
    
    //-- Listen for the Input Change
    fileInput.addEventListener('change', function(){
      //-- Grab first file
      var file = fileInput.files[0];
      
      //-- Get all Entries in Zip file
      FP.core.loadZip.getEntries(file, function(entries) {
        //TODO: parse the rootfile to find files
        var total = 0,
            loaded = 0;
            
        //-- Split Entries into xhtml, images, css
        entries.forEach(function(entry) {
          
          if(entry.filename.search(".xhtml") != -1){
            //console.log("entry", entry);
            bookFiles.push(entry);
            total++;
          }
          
          if(entry.filename.search(".jpg") != -1 || entry.filename.search(".png") != -1){
            bookImages.push(entry);
          }
          
          if(entry.filename.search(".css") != -1){
            bookCSS.push(entry);
          }
          
        });
        
        bookImages.forEach(function(file) {
          var name = file.filename.replace("OPS/", '');
          //Blob or File
          FP.core.loadZip.getEntryFile(file, "Blob", function(blobURL, revokeBlobURL) {
            
            images[name] = blobURL;
            console.log("images[name]", images[name])
            //var img = document.createElement('img');
            //img.src = blobURL;
            //area.appendChild(img);
            
                          
          }, function(current, total) {
              //-- Progress Meter
          });
        
        });
        
        bookFiles.forEach(function(file) {
          var reg = /\/(.*).xhtml/,
              name = reg.exec(file.filename)[1];
              
          //TEMP ORDER FIX
          if(name === "cover") name = "1_"+name;
          if(name === "TOC") name = "2_"+name;
          
          //Blob or File
          FP.core.loadZip.getEntryFile(file, "Blob", function(blobURL, revokeBlobURL) {
            //console.log(file, blobURL)
            
            // $.ajax({
            //   url: blobURL,
            //   success: function(data) {
            //     pages.push(data);
            //   }
            // });
            
            $.ajax({
              url: blobURL,
              dataType: "html",
              cache: true,
              success: function(data) {
                //var section = $("<section>");
                //$('#area').append(section);
                pages[name] = data;
                ordered.push(name);
                loaded++;
                if(loaded == total){
                  allReady();
                }
              },
              error: function(e){
                console.log("error:", e)
              }
              
            });
            //var section = $("<section>");
            //section.load(blobURL);
            //$('#area').append(section);
            


            // var iframe = document.createElement('iframe');
            // iframe.src = window.webkitURL.createObjectURL(blobURL);
            // iframe.type = "content";
            // area.appendChild(iframe);
            
            // FP.core.load(blobURL, function(data){
            //   //console.log("data", data);
            //   var iframe = document.createElement('iframe');
            //   iframe.src = blobURL;
            //   iframe.type = "content";
            //   area.appendChild(iframe);
            // });
            
            // var reader = new FileReader();
            // reader.onloadend = function() {
            //   if (this.result) {
            //     console.log(this.result)
            //   } 
            //   else if ( errorCallback ) {
            //     console.log("ERROR")
            //   }
            // };
            // reader.readAsText(file);
                          
          }, function(current, total) {
              //-- Progress Meter
          });
        
        });
        
        
        
        function allReady(){
          FP.book.page.start($("#area"), pages, ordered, images);
          
          $("#modal").fadeOut();
          
          $("#next").fadeIn();
          $("#prev").fadeIn();
          
          $("#next").on("click", function(){
            FP.book.page.next();
          });
          
          $("#prev").on("click", function(){
            FP.book.page.prev();
          });
          
          $(document).keydown(function(e) {
            if(e.keyCode == 37) { // left
              FP.book.page.prev();
            }
            else if(e.keyCode == 39) { // right
              FP.book.page.next();
            }
          });
          
        }
        //console.log(bookFiles, bookImages, bookCSS)
      });
      
    });
  }
  
  return init;
  
})(jQuery);