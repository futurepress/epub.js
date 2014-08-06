var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');


// Lint JS
gulp.task('lint', function() {
  return gulp.src('lib/*/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concat & Minify JS
gulp.task('minify', function(){
  return gulp.src(['lib/*.js', 'bower_components/rsvp/rsvp.js', 'lib/epubjs/*.js'])
    .pipe(concat('epub.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('epub.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// Watch Our Files
gulp.task('watch', function() {
  gulp.watch('lib/*/*.js', ['lint', 'minify']);
});

// Default
gulp.task('default', ['lint', 'minify']);

// gulp.task('default', function() {
//   // place code for your default task here
// });