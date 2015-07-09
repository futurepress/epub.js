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

var files = [
  'node_modules/rsvp/dist/rsvp.js',
  'src/epub.js',
  'src/core.js',
  'src/queue.js',
  'src/hooks.js',
  'src/parser.js',
  'src/epubcfi.js',
  'src/navigation.js',
  'src/section.js',
  'src/spine.js',
  'src/replacements.js',
  'src/book.js',
  'src/view.js',
  'src/views.js',
  'src/layout.js',
  'src/rendition.js',
  'src/continuous.js',
  'src/paginate.js',
  'src/map.js',
  'src/locations.js'
];

// Lint JS
gulp.task('lint', function() {
  return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concat & Minify JS
gulp.task('minify', function(){
  return gulp.src(files)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(concat('epub.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('epub.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// Watch Our Files
gulp.task('watch', function() {
  gulp.watch('src/*.js', ['minify']);
});

gulp.task('serve', ["watch"], function() {
  server();
});

// Default
gulp.task('default', ['lint', 'minify']);

// gulp.task('default', function() {
//   // place code for your default task here
// });
