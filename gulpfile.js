'use strict';
var fs = require('fs');
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    mocha = require('gulp-mocha'),
    PEG = require('pegjs');

gulp.task('jshint', function () {
  gulp.src(['*.js', 'src/**/*.js', '!src/**/*.peg.js']).
    pipe(jshint()).
    pipe(jshint.reporter(jshintStylish));
});

gulp.task('mocha', function () {
  gulp.src(['test/**/*.js']).
    pipe(mocha({ reporter: 'nyan' }));
});

gulp.task('pegjs', function (done) {
  fs.readFile('src/parser.pegjs', { encoding: 'utf8' }, function (err, data) {
    var code = '';

    if (err) { return done(err); }
    code = PEG.buildParser(data , { output: 'source' });
    code = 'module.exports = ' + code + ';\n';
    fs.writeFile('src/parser.peg.js', code, function (err) {
      done(err);
    });
  });
});

gulp.task('build', ['pegjs']);
gulp.task('test', ['build', 'jshint', 'mocha']);
