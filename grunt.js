module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
	  pkg: '<json:package.json>',
	  meta: {
		banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
		  '<%= grunt.template.today("yyyy-mm-dd") %> */'
	  },
	  min: {
		'dist/render.min.js': ['<banner>', 'fpjs/render/*.js'],
		//'dist/workers/loader_filesystem.js': ['<banner>', 'fpjs/render/workers/loader_filesystem.js'],
		'dist/reader.min.js': ['<banner>', 'fpjs/reader/*.js'],
		'dist/hooks/hooks.min.js': ['<banner>', 'fpjs/hooks/*.js'],
		'dist/libs/zip.js': ['fpjs/libs/zip.js'],
		'dist/libs/deflate.js': ['fpjs/libs/deflate.js'],
		'dist/libs/inflate.js': ['fpjs/libs/inflate.js'],
		'dist/libs/mime-types.js': ['fpjs/libs/mime-types.js'],
		'dist/libs/fileStorage.min.js': ['fpjs/libs/fileStorage.min.js'],
		'dist/libs/loader_filesystem.js': ['fpjs/libs/loader_filesystem.js']
	  }
	});
	
	
	
	// Default task(s).
	grunt.registerTask('default', ['min']);
	
};

