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
		'build/reader.js': ['<banner>', 'reader/reader.js', 'reader/controllers/*.js'],
		'build/hooks.js': ['<banner>', 'hooks/default/*.js']
		// 'demo/js/libs/fileStorage.min.js': 'libs/fileStorage/fileStorage.min.js',
		// 'demo/js/libs/loader_filesystem.min.js': 'libs/fileStorage/workers/loader_filesystem.min.js',
		// 'demo/js/libs/inflate.js': 'libs/zip/inflate.js',
		},
		uglify: {
			my_target: {
				options: {
						preserveComments: 'some',
						sourceMap: true
				},
				files: {
					// 'demo/js/epub.min.js': ['build/epub.js'],
					'build/epub.min.js': ['build/epub.js'],
					'build/reader.min.js': ['build/reader.js'],
					// 'demo/js/hooks.min.js': ['build/hooks.js'],
					'build/hooks.min.js': ['build/hooks.js'],
					// 'demo/js/libs/zip.min.js': ['libs/zip/zip.js', 'libs/zip/zip-fs.js', 'libs/zip/zip-ext.js', 'libs/zip/mime-types.js'],
					// 'demo/js/libs/inflate.min.js': ['libs/zip/inflate.js'],
					'build/libs/zip.min.js': ['libs/zip/zip.js', 'libs/zip/zip-fs.js', 'libs/zip/zip-ext.js', 'libs/zip/mime-types.js'],
					'build/libs/inflate.js': ['libs/zip/inflate.js']
					// 'build/libs/screenfull.min.js': ['libs/screenfull.min.js']
				}
			}
		},
		copy: {
			main: {
				files: [
					{src: 'build/epub.js', dest: 'demo/js/epub.min.js'},
					{src: 'build/hooks.min.js', dest: 'demo/js/hooks.min.js'},
					{src: 'build/reader.min.js', dest: 'demo/js/reader.min.js'},
					{src: 'build/epub.min.map', dest: 'demo/js/epub.js.map'},
					{src: 'build/hooks.min.map', dest: 'demo/js/hooks.js.map'},
					{src: 'build/reader.js.map', dest: 'demo/js/hooks.js.map'},
					{src: 'build/zip/*', dest: 'demo/js/libs/', filter: 'isFile'},
					{src: 'libs/jquery/jquery-2.1.0.min.js', dest:'demo/js/libs/jquery-2.1.0.min.js'},
				  {src: 'libs/screenfull.min.js', dest: 'demo/js/libs/screenfull.min.js'},
					{src: 'reader/plugins/search.js', dest: 'demo/js/plugins/search.js'},
					{src: 'reader/plugins/hypothesis.js', dest: 'demo/js/plugins/hypothesis.js'},
					{src: 'hooks/extensions/highlight.js', dest: 'demo/js/hooks/extensions/highlight.js'}
		
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

