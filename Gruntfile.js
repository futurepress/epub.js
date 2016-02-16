module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
		banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %> */'
		},
		concat_sourcemap : {
			build: {
				options: {
					'sourceRoot': '../'
				},
      	files: {
					'build/epub.js': ['<banner>', 'node_modules/rsvp/dist/rsvp.js', 'src/*.js',  'libs/mime-types/mime-types.js'],
					'build/reader.js': ['<banner>', 'reader_src/reader.js', 'reader_src/controllers/*.js'],
					'build/hooks.js': ['<banner>', 'hooks/default/*.js']
				}
			}
		},
		uglify: {
			build: {
				options: {
						preserveComments: 'some',
						sourceMap: false
				},
				files: {
					'build/epub.min.js': ['<banner>', 'node_modules/rsvp/dist/rsvp.js', 'src/*.js',  'libs/mime-types/mime-types.js'],
					'build/reader.min.js': ['<banner>', 'reader_src/reader.js', 'reader_src/controllers/*.js'],
					'build/hooks.min.js': ['<banner>', 'hooks/default/*.js']
				}
			},
			reader: {
				options: {
						preserveComments: 'some',
						sourceMap: false
				},
				files: {
					'reader/js/epub.min.js': ['<banner>', 'node_modules/rsvp/dist/rsvp.js', 'src/*.js',  'libs/mime-types/mime-types.js'],
					'reader/js/reader.min.js': ['<banner>', 'reader_src/reader.js', 'reader_src/controllers/*.js'],
					'reader/js/hooks.min.js': ['<banner>', 'hooks/default/*.js']
				}
			}
		},
		copy: {
			main: {
				files: [
					{src: 'node_modules/localforage/dist/localforage.min.js', dest: 'build/libs/localforage.min.js'},
					{src: 'libs/jszip/jszip.min.js', dest: 'build/libs/zip.min.js'},
					{src: 'build/libs/zip.min.js', dest: 'reader/js/libs/zip.min.js'},
					{src: 'node_modules/jquery/dist/jquery.min.js', dest:'reader/js/libs/jquery.min.js'},
				  {src: 'node_modules/screenfull/dist/screenfull.js', dest: 'reader/js/libs/screenfull.js'},
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
		},
		watch: {
			scripts: {
				files: ['src/**/*.js', 'reader_src/**/*.js'],
				tasks: ['concat_sourcemap', 'uglify'],
				options: {
					interrupt: true,
				}
			},
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-concat-sourcemap');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'concat_sourcemap', 'uglify', 'copy']);
};
