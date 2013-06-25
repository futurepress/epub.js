module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
	  pkg: '<json:package.json>',
	  meta: {
		banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
		  '<%= grunt.template.today("yyyy-mm-dd") %> */'
	  },
	  concat : {
		'build/epub.js': ['<banner>', 'src/*.js'],
		'build/reader.js': ['<banner>', 'reader/*.js'],
		'build/hooks.js': ['<banner>', 'hooks/default/*.js'],
		'demo/js/libs/fileStorage.min.js': 'libs/fileStorage/fileStorage.min.js',
		'demo/js/libs/loader_filesystem.min.js': 'libs/fileStorage/workers/loader_filesystem.min.js',
		'demo/js/libs/jquery-1.9.0.min.js': 'libs/jquery/jquery-1.9.0.min.js'
	  },
	  min: {
		'demo/js/epub.min.js': ['libs/underscore/underscore-min.js', 'libs/rsvp/rsvp.min.js', 'build/epub.js'],
		'demo/js/reader.min.js': 'build/reader.js',
		'demo/js/hooks.min.js': 'build/hooks.js',
		'demo/js/libs/zip.min.js': ['libs/zip/*.js']
	  }
	});
	
	
	
	// Default task(s).
	grunt.registerTask('default', ['concat', 'min']);
	
};

