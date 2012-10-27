FP.namespace('core').load = (function(){
    
  /*
  PDFJS.getPdf(
      {
        url: "http://google.com",
        progress: function getPDFProgress(evt) {
          handler.send('DocProgress', {
            loaded: evt.loaded,
            total: evt.lengthComputable ? evt.total : void(0)
          });
        },
        error: function getPDFError(e) {
         console.log('DocError', 'Unexpected server response of ' +
                       e.target.status + '.');
        },
        headers: source.httpHeaders
      },
      function(data) {
        
      });
  });
  */
  
  function load(arg, callback){
    var params = arg;
    if (typeof arg === 'string'){
      params = { url: arg };
    }
    
    var xhr = new XMLHttpRequest();
    
    xhr.open('GET', params.url);
      
      var headers = params.headers;
      if (headers) {
        for (var property in headers) {
          if (typeof headers[property] === 'undefined')
            continue;
      
          xhr.setRequestHeader(property, params.headers[property]);
        }
      }
      
      xhr.mozResponseType = xhr.responseType = 'arraybuffer';
      
      var protocol = params.url.substring(0, params.url.indexOf(':') + 1);
      xhr.expected = (protocol === 'http:' || protocol === 'https:') ? 200 : 0;
      
      if ('progress' in params)
        xhr.onprogress = params.progress || undefined;
      
      var calledErrorBack = false;
      
      if ('error' in params) {
        xhr.onerror = function errorBack() {
          if (!calledErrorBack) {
            calledErrorBack = true;
            params.error();
          }
        }
      }
      
      xhr.onreadystatechange = function getPdfOnreadystatechange(e) {
        if (xhr.readyState === 4) {
          if (xhr.status === xhr.expected) {
            var data = (xhr.mozResponseArrayBuffer || xhr.mozResponse ||
                        xhr.responseArrayBuffer || xhr.response);
            callback(data);
          } else if (params.error && !calledErrorBack) {
            calledErrorBack = true;
            params.error(e);
          }
        }
      };
      xhr.send(null);  
  }
  
  return load;

})();

FP.namespace("core").loadZip = (function(){
    var URL = webkitURL || mozURL || URL;

    function getEntries(file, onend) {
      //console.log("file", file)
      // FP.utils.createTempFile(function(temp){
      //   console.log("temp", temp)
      // });
      zip.createReader(new zip.BlobReader(file), function(zipReader) {
        zipReader.getEntries(onend);
      }, function(error){ console.log("Error:", error) });
    }
    
    function getEntryFile(entry, creationMethod, onend, onprogress) {
      var writer, zipFileEntry;
      
      function getData() {
        entry.getData(writer, function(blob) {
          var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
          onend(blobURL, function() {
            if (creationMethod == "Blob")
              URL.revokeObjectURL(blobURL);
          });
        }, onprogress);
      }
      
      if (creationMethod == "Blob") {
        writer = new zip.BlobWriter();
        getData();
      } else {
        FP.utils.createTempFile(function(fileEntry) {
          zipFileEntry = fileEntry;
          writer = new zip.FileWriter(zipFileEntry);
          getData();
        });
      }
    }
    
    
    
    return {
      "getEntries" : getEntries,
      "getEntryFile" : getEntryFile
    }
    
})();
