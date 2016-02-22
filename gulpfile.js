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

var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');

var size = require('gulp-size');
var URI = require('urijs');
var mochify = require('mochify');
// https://github.com/mishoo/UglifyJS2/pull/265
// uglify.AST_Node.warn_function = function() {};

// Lint JS
gulp.task('lint', function() {
  return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// set up the browserify instance on a task basis
gulp.task('bundle', function () {
  return bundle('epub.js');
});

// Minify JS
gulp.task('minify', ['bundle'], function(){
  var uglifyOptions = {
      mangle: true,
      preserveComments : "license"
  };
  return gulp.src('dist/epub.js')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(rename('epub.min.js'))
    // .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify(uglifyOptions))
    // .pipe(sourcemaps.write('./'))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest('dist'));
});

// Watch Our Files
gulp.task('watch', function(cb) {
  bundle('epub.js', cb);
});

gulp.task('serve', function() {
  server();
  bundle('epub.js', cb);
});

gulp.task('serve:no-watch', function() {
  server();
  bundle('epub.js', cb);
});

gulp.task('test', function(cb) {
  mochify('./test/*.js', {
    reporter: 'spec',
    transform: 'brfs',
    "web-security": false,
    "webSecurityEnabled": false,
    // "localUrlAccess": true,
    watch: true,
    wd: false,
    debug: false
  })
  .bundle();
});


gulp.task('test:once', function(cb) {
  mochify('./test/*.js', {
    reporter: 'spec',
    transform: 'brfs',
    "web-security": false,
    "webSecurityEnabled": false,
    // "localUrlAccess": true,
    watch: false,
    wd: false,
    debug: false
  })
  .bundle();
});

// Default
gulp.task('default', ['lint', 'bundle']);


function bundle(file, watch) {
  var opt = {
    entries: ['src/'+file],
    standalone: 'ePub',
    debug : true
  };

  var b = browserify(opt);

  // Expose epub module for require
  b.require('./src/'+file, {expose: 'epub'});

  // Keep JSZip library seperate,
  // must be loaded to use Unarchive or `require` will throw an error
  b.external('jszip');

  // Ignore optional URI libraries
  var urijsPath = URI(require.resolve('urijs'));
  ['./punycode.js', './IPv6.js'].forEach(function(lib) {
    var libPath = URI(lib).absoluteTo(urijsPath).toString();
    b.ignore(libPath);
  });

  // watchify() if watch requested, otherwise run browserify() once
  var bundler = watch ? watchify(b) : b;

  function rebundle() {
    var stream = bundler.bundle();
    return stream
      .on('error', gutil.log)
      .pipe(source(file))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
      .pipe(size({ showFiles: true }))
      .pipe(gulp.dest('./dist/'));
  }

  // listen for an update and run rebundle
  bundler.on('update', function() {
    rebundle();
    gutil.log('Rebundle...');
  });

  // run it once the first time buildScript is called
  return rebundle();
}
