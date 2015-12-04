var Zip;

function Unarchive() {
  try {
    if (typeof JSZip !== 'undefined') {
      this.zip = new JSZip();
    } else {
      Zip = require('jszip');
      this.zip = new Zip();
    }
    console.log('jszip loaded');
  } catch (e) {
    console.log('jszip not loaded');
  }
}

module.exports = Unarchive;
