'use strict';
var fs = require('fs');
var concat = require('gulp-concat'),
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    mocha = require('gulp-mocha'),
    PEG = require('pegjs'),
    uglifyjs = require('gulp-uglifyjs');

gulp.task('jshint', function () {
  return gulp.src(['*.js', 'src/**/*.js', '!src/**/*.peg.js']).
    pipe(jshint()).
    pipe(jshint.reporter(jshintStylish));
});

gulp.task('mocha', ['pegjs'], function () {
  return gulp.src(['test/**/*.js']).
    pipe(mocha({ reporter: 'nyan' }));
});

gulp.task('pegjs', function (done) {
  fs.readFile('src/parser.pegjs', { encoding: 'utf8' }, function (err, data) {
    /* jshint maxlen: 1000 */
    var code = '';

    if (err) { return done(err); }
    code = PEG.buildParser(data , { output: 'source' });
    code = '(function (global) { var _inNode = \'process\' in global, parser = ' + code + ';\nif (_inNode) { module.exports = parser; } else { global.PixivNovelParser = global.PixivNovelParser || {}; global.PixivNovelParser.parser = parser; }\n}((this || 0).self || global));';
    fs.writeFile('src/parser.peg.js', code, function (err) {
      done(err);
    });
  });
});

gulp.task('concat', ['pegjs'], function () {
  return gulp.src(['src/parser.peg.js', 'src/parser.js', 'src/index.js']).
    pipe(concat('pixiv-novel-parser.js')).
    pipe(gulp.dest('build'));
});

gulp.task('uglifyjs', ['concat'], function () {
  return gulp.src(['build/pixiv-novel-parser.js']).
    pipe(concat('pixiv-novel-parser.min.js')).
    pipe(uglifyjs({
      outSourceMap: true,
      output: {},
      compress: { unsafe: true }
    })).
    pipe(gulp.dest('build'));
});

gulp.task('build', ['pegjs', 'concat', 'uglifyjs']);
gulp.task('test', ['jshint', 'mocha']);
