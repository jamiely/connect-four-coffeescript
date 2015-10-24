var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');
var coffee = require('gulp-coffee');
var merge = require('merge-stream');
var process = require('process');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build', function() {
  gulp.src('src/coffee/*.coffee')
    .pipe(concat('app.coffee'))
    .pipe(sourcemaps.init())
    .pipe(coffee({bare: true}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('js/build/'));
});

gulp.task('jasmine-phantom', function() {
  var js = gulp.src([
    'bower_components/underscore/underscore-min.js',
    'bower_components/jquery/dist/jquery.min.js'
  ]);

  var coffeeTask = gulp.src([
    '!src/coffee/UIThree.coffee',
    'src/coffee/*.coffee',
    'tests/jasmine/specs/*.coffee'
  ]).pipe(coffee({bare: true}));

  merge(js, coffeeTask)
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless())
    .on('error', process.exit.bind(process, 1));
});
