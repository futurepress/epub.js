module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
	  pkg: '<json:package.json>',
	  meta: {
		banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
		  '<%= grunt.template.today("yyyy-mm-dd") %> */'
	  },
	  min: {
		'dist/render.min.js': ['<banner>', 'epubjs/render/*.js'],
		//'dist/workers/loader_filesystem.js': ['<banner>', 'epubjs/render/workers/loader_filesystem.js'],
		'dist/reader.min.js': ['<banner>', 'epubjs/reader/*.js'],
		'dist/hooks/hooks.min.js': ['<banner>', 'epubjs/hooks/*.js'],
		'dist/libs/zip.js': ['epubjs/libs/zip.js'],
		'dist/libs/deflate.js': ['epubjs/libs/deflate.js'],
		'dist/libs/inflate.js': ['epubjs/libs/inflate.js'],
		'dist/libs/mime-types.js': ['epubjs/libs/mime-types.js'],
		'dist/libs/fileStorage.min.js': ['epubjs/libs/fileStorage.min.js'],
		'dist/libs/loader_filesystem.js': ['epubjs/libs/loader_filesystem.js']
	  }
	});
	
	
	
	// Default task(s).
	grunt.registerTask('default', ['min']);
	
};

