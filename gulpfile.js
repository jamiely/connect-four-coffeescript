var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');
var coffee = require('gulp-coffee');
var merge = require('merge-stream');
var process = require('process');

gulp.task('jasmine-phantom', function() {
  var js = gulp.src([
    'js/underscore.js',
    'js/jquery-1.7.2.min.js'
  ]);

  var coffeeTask = gulp.src([
    //'js/Three.js',
    //'js/csg.js',
    //'js/ThreeCSG.js',
    'src/coffee/Board.coffee',
    'src/coffee/Move.coffee',
    'src/coffee/Game.coffee',
    'src/coffee/UI.coffee',
    'tests/jasmine/specs/*.coffee'
    //'js/app.min.js',
    //'test/srcjs/MoveSpec.js'
    //'test/src/**/*Spec.js'
  ])
    .pipe(coffee({bare: true}));

  merge(js, coffeeTask)
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless())
    .on('error', process.exit.bind(process, 1));
});
