'use strict';
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish');

gulp.task('jshint', function () {
  gulp.src(['*.js', 'src/**/*.js']).
    pipe(jshint()).
    pipe(jshint.reporter(jshintStylish));
});

gulp.task('test', ['jshint']);
