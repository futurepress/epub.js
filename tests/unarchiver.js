module('EPUBJS.Unarchiver');

// test("zip.workerScriptsPath is set correctly", 1, function() {
// 	var Book = ePub("/reader/moby-dick.epub");
// 	equal( zip.workerScriptsPath, EPUBJS.filePath, "zip workerScriptsPath is set from EPUBJS.filePath");
// });
/*
asyncTest("openZip method returns a zip file object", 3, function(){

	var unarchiver = new EPUBJS.Unarchiver(),
		zipPromise = unarchiver.openZip('/reader/moby-dick.epub');

	zipPromise.then(function(zipFile){
		// root directory
		equal( zipFile.root.directory, true, "zipFile root is a directory");
		equal( zipFile.root.children.length, 4, "moby-dick.epub root has children lenth of 4");
		// entries
		equal( zipFile.entries.length, 167, "moby-dick.epub zipFile has 167 entries");
		start();
	});
});

asyncTest("getXml method returns valid xml", 1, function(){

	var unarchiver = new EPUBJS.Unarchiver(),
		zipPromise = unarchiver.openZip("/reader/moby-dick.epub");

	zipPromise.then(function(zipFile){

		var xmlFilePromise = unarchiver.getXml('META-INF/container.xml');
		xmlFilePromise.then(function(xmlFile){
			var rootNode = xmlFile.querySelector("rootfile");
			equal(rootNode.getAttribute('full-path'), "OPS/package.opf", "getXml returns a rootfile from moby-dick's container.xml that is valid xml");
			start();
		});
	});
});

*/

// TODO Tests for:
//
// Methods
//   EPUBJS.Unarchiver.getUrl
//   EPUBJS.Unarchiver.getText
//   Maybe EPUBJS.Unarchiver.revokeUrl ?
//   EPUBJS.Unarchiver.toStorage
//   EPUBJS.Unarchiver.afterSaved
//
// Other related tests?

