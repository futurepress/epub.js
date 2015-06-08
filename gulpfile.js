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
  return gulp.src('src/*/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concat & Minify JS
gulp.task('minify', function(){
  return gulp.src(['src/*.js', 'bower_components/rsvp/rsvp.js', 
      'src/epubjs/core.js',
      'src/epubjs/queue.js',
      'src/epubjs/hooks.js',
      'src/epubjs/parser.js',
      'src/epubjs/epubcfi.js',
      'src/epubjs/navigation.js',
      'src/epubjs/section.js',
      'src/epubjs/spine.js',
      'src/epubjs/replacements.js',
      'src/epubjs/book.js',
      'src/epubjs/view.js',
      'src/epubjs/layout.js',
      'src/epubjs/rendition.js',
      'src/epubjs/continuous.js',
      'src/epubjs/paginate.js',
      'src/epubjs/map.js'
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
  gulp.watch('src/*/*.js', ['minify']);
});

gulp.task('serve', ["watch"], function() {
  server();
});

// Default
gulp.task('default', ['lint', 'minify']);

// gulp.task('default', function() {
//   // place code for your default task here
// });