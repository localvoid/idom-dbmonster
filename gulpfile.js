'use strict';

var gulp = require('gulp');
var gulp_if = require('gulp-if');
var del = require('del');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var deploy = require('gulp-gh-pages');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var NODE_ENV = process.env.NODE_ENV || 'development';
var BROWSERSYNC_PORT = parseInt(process.env.BROWSERSYNC_PORT) || 3000;
var RELEASE = (NODE_ENV === 'production');
var DEST = './build';

gulp.task('clean', del.bind(null, [DEST]));

gulp.task('script', function() {
  var bundler = browserify({
    entries: ['./web/js/main.js'],
    debug: !RELEASE
  });

  return bundler
    .bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(gulp_if(RELEASE, uglify()))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(DEST))
    .pipe(reload({stream: true}));
});

gulp.task('html', function() {
  gulp.src('./web/index.html')
    .pipe(gulp.dest(DEST))
    .pipe(reload({stream: true}));
});

gulp.task('assets', function() {
  gulp.src(['./web/styles.css'])
    .pipe(gulp.dest(DEST))
    .pipe(reload({stream: true}));
});

gulp.task('serve', ['default'], function() {
  browserSync({
    open: false,
    port: BROWSERSYNC_PORT,
    notify: false,
    server: 'build'
  });

  gulp.watch('./web/**/*.js', ['script']);
  gulp.watch('./web/index.html', ['html']);
  gulp.watch('./web/style.css', ['assets']);
});

gulp.task('deploy', ['default'], function () {
  return gulp.src(DEST + '/**/*')
    .pipe(deploy());
});

gulp.task('default', ['script', 'html', 'assets']);
