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

// Lint JS
gulp.task('lint', function() {
  return gulp.src('lib/*/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concat & Minify JS
gulp.task('minify', function(){
  return gulp.src(['lib/*.js', 'bower_components/rsvp/rsvp.js', 
      'lib/epubjs/core.js',
      'lib/epubjs/queue.js',
      'lib/epubjs/hooks.js',
      'lib/epubjs/parser.js',
      'lib/epubjs/epubcfi.js',
      'lib/epubjs/navigation.js',
      'lib/epubjs/section.js',
      'lib/epubjs/spine.js',
      'lib/epubjs/replacements.js',
      'lib/epubjs/book.js',
      'lib/epubjs/view.js',
      'lib/epubjs/layout.js',
      'lib/epubjs/infinite.js',
      'lib/epubjs/rendition.js',
      'lib/epubjs/continuous.js',
      'lib/epubjs/paginate.js'
    ])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(concat('epub.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('epub.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// Watch Our Files
gulp.task('watch', function() {
  gulp.watch('lib/*/*.js', ['minify']);
});

gulp.task('serve', ["watch"], function() {
  server();
});

// Default
gulp.task('default', ['lint', 'minify']);

// gulp.task('default', function() {
//   // place code for your default task here
// });