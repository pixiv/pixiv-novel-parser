'use strict';
var fs = require('fs');
var concat = require('gulp-concat'),
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    mocha = require('gulp-mocha'),
    overrideAction = require('pegjs-override-action'),
    PEG = require('pegjs'),
    uglifyjs = require('gulp-uglifyjs');

function packageJs(code, output) {
  /* jshint maxlen: 1000 */
  return '(function (global) { var _inNode = \'process\' in global, parser = ' + code + ';\nif (_inNode) { module.exports = parser; } else { global.PixivNovelParser = global.PixivNovelParser || {}; global.PixivNovelParser.' + output + ' = parser; }\n}((this || 0).self || global));';
}

gulp.task('jshint', function () {
  return gulp.src(['*.js', 'src/**/*.js', '!src/**/*.peg.js']).
    pipe(jshint()).
    pipe(jshint.reporter(jshintStylish));
});

gulp.task('mocha-basic', function () {
  return gulp.src(['test/test.js', 'test/test_tadsan.js']).
    pipe(mocha({ reporter: 'nyan' }));
});

gulp.task('mocha-extended', function () {
  return gulp.src(['test/**/*.js']).
    pipe(mocha({ reporter: 'nyan' }));
});

gulp.task('pegjs-basic', function (done) {
  fs.readFile('src/parser.pegjs', { encoding: 'utf8' }, function (err, data) {
    var code = '';

    if (err) { return done(err); }
    code = PEG.buildParser(data , {
      output: 'source',
      plugins: [overrideAction],
      overrideActionPlugin: {
        rules: {
          tag: [
            void 0, void 0, void 0, void 0, void 0,
            'return __$__;', 'return __$__;', 'return __$__;'
          ]
        }
      }
    });
    code = packageJs(code, 'basicParser');
    fs.writeFile('src/parser.peg.js', code, function (err) {
      done(err);
    });
  });
});

gulp.task('pegjs-extended', function (done) {
  fs.readFile('src/parser.pegjs', { encoding: 'utf8' }, function (err, data) {
    var code = '';

    if (err) { return done(err); }
    code = PEG.buildParser(data , { output: 'source' });
    code = packageJs(code, 'extendedParser');
    fs.writeFile('src/parser-extended.peg.js', code, function (err) {
      done(err);
    });
  });
});

gulp.task('concat-basic', ['pegjs-basic'], function () {
  return gulp.src(['src/parser.peg.js', 'src/parser.js', 'src/index.js']).
    pipe(concat('pixiv-novel-parser.js')).
    pipe(gulp.dest('build'));
});

gulp.task('concat-extended', ['pegjs-extended'], function () {
  return gulp.src(['src/parser-extended.peg.js', 'src/parser.js', 'src/index.js']).
    pipe(concat('pixiv-novel-parser-extended.js')).
    pipe(gulp.dest('build'));
});

gulp.task('uglifyjs-basic', ['concat-basic'], function () {
  return gulp.src(['build/pixiv-novel-parser.js']).
    pipe(concat('pixiv-novel-parser.min.js')).
    pipe(uglifyjs({
      outSourceMap: true,
      output: {},
      compress: { unsafe: true }
    })).
    pipe(gulp.dest('build'));
});

gulp.task('uglifyjs-extended', ['concat-extended'], function () {
  return gulp.src(['build/pixiv-novel-parser-extended.js']).
    pipe(concat('pixiv-novel-parser-extended.min.js')).
    pipe(uglifyjs({
      outSourceMap: true,
      output: {},
      compress: { unsafe: true }
    })).
    pipe(gulp.dest('build'));
});

gulp.task('build-basic', ['pegjs-basic', 'concat-basic', 'uglifyjs-basic']);
gulp.task('build-extended', ['pegjs-extended', 'concat-extended', 'uglifyjs-extended']);
gulp.task('build', ['build-basic', 'build-extended']);
gulp.task('test', ['jshint', 'mocha-basic', 'mocha-extended']);
