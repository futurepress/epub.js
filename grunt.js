module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
	  pkg: '<json:package.json>',
	  meta: {
		banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
		  '<%= grunt.template.today("yyyy-mm-dd") %> */'
	  },
	  min: {
		dist: {
		  src: ['<banner>', 'fpjs/render/*.js'],
		  dest: 'dist/built.min.js'
		}
	  }
	});
	
	// Default task(s).
	grunt.registerTask('default', ['min']);
	
};

