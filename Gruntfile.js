module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
		banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %> */'
		},
		concat_sourcemap : {
		'build/epub_no_underscore.js': ['<banner>', 'libs/rsvp/rsvp.js', 'src/*.js'],
		'build/epub.js': ['<banner>', 'libs/underscore/underscore-min.js', 'libs/rsvp/rsvp.js', 'src/*.js'],
		'build/reader.js': ['<banner>', 'reader_src/reader.js', 'reader_src/controllers/*.js'],
		'build/hooks.js': ['<banner>', 'hooks/default/*.js'],
		},
		uglify: {
			my_target: {
				options: {
						preserveComments: 'some',
						sourceMap: true
				},
				files: {
					'build/epub.min.js': ['build/epub.js'],
					'build/reader.min.js': ['build/reader.js'],
					'build/hooks.min.js': ['build/hooks.js'],
					'build/libs/zip.min.js': ['libs/jszip/jszip.min.js', 'libs/jszip/mime-types.js'],
				}
			}
		},
		copy: {
			main: {
				files: [
					{src: 'build/epub.js', dest: 'reader/js/epub.min.js'},
					{src: 'build/hooks.min.js', dest: 'reader/js/hooks.min.js'},
					{src: 'build/reader.min.js', dest: 'reader/js/reader.min.js'},
					{src: 'build/epub.min.map', dest: 'reader/js/epub.js.map'},
					{src: 'build/hooks.min.map', dest: 'reader/js/hooks.js.map'},
					{src: 'build/reader.js.map', dest: 'reader/js/hooks.js.map'},
					{src: 'build/libs/zip.min.js', dest: 'reader/js/libs/zip.min.js'},
					// {src: 'build/libs/zip.min.js', dest: 'reader/js/libs/zip.min.map'},
					{src: 'libs/jquery/jquery-2.1.0.min.js', dest:'reader/js/libs/jquery-2.1.0.min.js'},
				  {src: 'libs/screenfull.min.js', dest: 'reader/js/libs/screenfull.min.js'},
					{src: 'reader_src/plugins/search.js', dest: 'reader/js/plugins/search.js'},
					{src: 'reader_src/plugins/hypothesis.js', dest: 'reader/js/plugins/hypothesis.js'},
					{src: 'hooks/extensions/highlight.js', dest: 'reader/js/hooks/extensions/highlight.js'}
		
				]
			},
		},
		jshint: {
			all: ['src/**/*.js'],//, 'reader/**/*.js']
			options : {
				// Environments
				"browser": true,
				"devel": true,
				"worker": true,
				
				// Enforcing
				//"maxlen": 80,
				//"quotmark": "single",
				"trailing": true,
				"strict": false,
				
				// Relaxing
				"boss": true,
				"funcscope": true,
				"globalstrict": true,
				"loopfunc": true,
				"maxerr": 1000,
				"nonstandard": true,
				"sub": true,
				"validthis": true,
				
				"globals": { 
					"_": false,
					"define" : false,
					"module" : false
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-concat-sourcemap');
	grunt.loadNpmTasks('grunt-contrib-copy');
	
	// Default task(s).
	grunt.registerTask('default', ['jshint', 'concat_sourcemap', 'uglify', 'copy']);
};

