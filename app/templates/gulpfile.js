"use strict";

/************************
 * SETUP
 ************************/

var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sassdoc = require('sassdoc');
<% if (includeRollup) { -%>
var rollup = require('rollup-stream');
var babel = require('rollup-plugin-babel');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
<% } else if (includeBabel) { -%>
var babel = reqiure('gulp-babel');
<% } -%>

/************************
 * CONFIGURATION
 ************************/

var autoReload = true;

var paths = {
  bowerDir: './bower_components'
};

var includePaths = [
  // add paths to any sass @imports that you will use from bower_components here
  // paths.bowerDir + '/path/to/scss'
  paths.bowerDir + '/foundation/scss'
];

var stylesSrc = [
  // add bower_components CSS here
  './sass/style.scss'
];

var sassdocSrc = [
  './sass/base/*.scss',
  './sass/layout/*.scss',
  './sass/components/*.scss'
];

var scriptsSrc = [
  // add bower_component scripts here
  './js/src/*.js'
];

/************************
 * TASKS
 ************************/

gulp.task('styles', function() {
  gulp.src(stylesSrc)
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: includePaths
    }))

    // Catch any SCSS errors and prevent them from crashing gulp
    .on('error', function (error) {
      console.error(error);
      this.emit('end');
    })
    .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
    .pipe(sourcemaps.write())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./css/src/'))
    .pipe(livereload())
    .pipe(cleanCss({
      compatibility: 'ie8'
    }))
    .pipe(gulp.dest('./css/dist/'))
    .pipe(livereload());
});

gulp.task('sassdoc', function () {
  return gulp.src(sassdocSrc)
    .pipe(sassdoc());
});
gulp.task('scripts', function() {
<% if (includeRollup) { %>
  return rollup({
    entry: './js/src/theme.js',
    sourceMap: true,
    plugins: [
      babel({
        exclude: 'node_modules/**',
        presets: ['es2015-rollup']
      })
    ]
  })
  .pipe(source('bundle.js', './js/src'))
  .pipe(buffer())<% } else { -%>
  return gulp.src('./js/src/*.js')
    .pipe(sourcemaps.init())<% if (includeBabel) { -%>
    .pipe(babel({
      presets: ['es2015']
  }))<% } } -%>
  .pipe(gulp.dest('./js/dist'))
  .pipe(livereload())
  .pipe(uglify())
  .pipe(rename({
    extname: '.min.js'
  }))
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./js/dist'))
  .pipe(livereload());
});

gulp.task('watch', function() {
  if (autoReload) {
    livereload.listen();
  }
  gulp.watch('./sass/**/*.scss', ['styles']);
  gulp.watch('./js/src/*.js', ['js']);
});

gulp.task('default', ['styles', 'scripts']);
