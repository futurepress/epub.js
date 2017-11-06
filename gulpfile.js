var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var onError = function (err) {
	gutil.log(gutil.colors.green(err));
};
var server = require("./tools/serve.js");

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');

var size = require('gulp-size');

var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./webpack.config");

var Server = require('karma').Server;

// modify some webpack config options
var watchConfig = Object.create(webpackConfig);
watchConfig.devtool = "sourcemap";
watchConfig.watch = true;

// create a single instance of the compiler to allow caching
var watchCompiler = webpack(watchConfig);

var buildDocs = require('gulp-documentation');

// Lint JS
gulp.task('lint', function() {
	return gulp.src('src/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('bundle', function (cb) {
	webpack(webpackConfig, function(err, stats) {
		if(err) {
			throw new gutil.PluginError("webpack", err);
		}

		gutil.log("[webpack-bundle]", stats.toString({
			colors: true,
			chunks: true
		}));

		cb();

	});
});

// Minify JS
gulp.task('minify', ['bundle'], function(){
	var uglifyOptions = {
			mangle: true,
			preserveComments : "license"
	};
	return gulp.src(['dist/epub.js', 'dist/polyfills.js'])
		.pipe(plumber({ errorHandler: onError }))
		.pipe(rename({suffix: '.min'}))
		// .pipe(sourcemaps.init({loadMaps: true}))
		.pipe(uglify(uglifyOptions))
		// .pipe(sourcemaps.write('./'))
		.pipe(size({ showFiles: true }))
		.pipe(gulp.dest('dist'));
});

// Watch Our Files
gulp.task('watch', function(cb) {

	watchCompiler.watch({}, function(err, stats) {
		if(err) {
			throw new gutil.PluginError("webpack", err);
		}

		gutil.log("[webpack-watch]", stats.toString({
			colors: true,
			chunks: false
		}));

	});

});

gulp.task('test', function(done) {
	new Server({
		configFile: __dirname + '/karma.conf.js',
		singleRun: false
	}, done).start();
});

gulp.task('test:once', function(done) {
	new Server({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done).start();
});

gulp.task("serve", function(callback) {
	server();
	/*
	var serverConfig = Object.create(webpackConfig);

	serverConfig.devtool = "eval";
	serverConfig.debug = true;
	serverConfig.watch = true;

	// Start a webpack-dev-server
	new WebpackDevServer(webpack(serverConfig), {
		stats: {
			colors: true,
			chunks: false
		}
	}).listen(8080, "localhost", function(err) {
		if(err) throw new gutil.PluginError("webpack-dev-server", err);
		gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/examples/index.html");
	});
	*/

});

gulp.task('docs:md', function () {
	return gulp.src('./src/epub.js')
		.pipe(buildDocs('md'))
		.pipe(gulp.dest('documentation/md'));
});

gulp.task('docs:html', function () {
	return gulp.src('./src/epub.js')
		.pipe(buildDocs('html'))
		.pipe(gulp.dest('documentation/html'));
});

gulp.task('docs:watch', function () {
	return gulp.watch('./src/**/*.js', ['docs:html']);
});

gulp.task('docs', ['docs:html', 'docs:md']);

// Default
gulp.task('default', ['lint', 'bundle']);

function bundle(done) {
	if (!done) {
		webpackConfig.watch = true;
	} else {
		webpackConfig.watch = false;
	}

	webpack(webpackConfig, function(err, stats) {
		if(err) throw new gutil.PluginError("webpack", err);
		gutil.log("[webpack]", stats.toString({
			colors: true,
			chunks: false
		}));

		done && done();

	});
}
