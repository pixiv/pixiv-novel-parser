'use strict';
var fs = require('fs');
var del = require('del'),
    concat = require('gulp-concat'),
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    mocha = require('gulp-mocha'),
    // overrideAction = require('pegjs-override-action'),
    PEG = require('pegjs'),
    runSequence = require('run-sequence'),
    uglifyjs = require('gulp-uglify');

function packageJs(code) {
  /* jshint maxlen: 1000 */
  return '(function (global) { var parser = ' + code + ';\nmodule.exports = parser;\n}((this || 0).self || global));';
}

gulp.task('clean', function (cb) {
  del(['build/**/**', 'src/**/*.peg.js'], cb);
});

gulp.task('concat', ['pegjs'], function () {
  return gulp.src(['src/parser.peg.js', 'src/parser-extended.peg.js', 'src/parser.js', 'src/index.js']).
    pipe(concat('pixiv-novel-parser.js')).
    pipe(gulp.dest('build'));
});

gulp.task('jshint', function () {
  return gulp.src(['*.js', 'src/**/*.js', '!src/**/*.peg.js']).
    pipe(jshint()).
    pipe(jshint.reporter(jshintStylish));
});

gulp.task('mocha', function () {
  return gulp.src(['test/**/*.js']).
    pipe(mocha({ reporter: 'spec' }));
});

gulp.task('pegjs-basic', function (done) {
  var regex = /^\s*\/\/\s*{{{\s*!Extended[\s\S]*?^\s*\/\/\s*}}}\s*!Extended.*$/igm;

  fs.readFile('src/parser.pegjs', { encoding: 'utf8' }, function (err, data) {
    var code = '';

    if (err) { return done(err); }
    data = data.replace(regex, '');
    code = PEG.buildParser(data)._source;
    code = packageJs(code);
    fs.writeFile('src/parser.peg.js', code, function (err) {
      done(err);
    });
  });
});

gulp.task('pegjs-extended', function (done) {
  return fs.readFile('src/parser.pegjs', { encoding: 'utf8' }, function (err, data) {
    var code = '';

    if (err) { return done(err); }
    code = PEG.buildParser(data)._source;
    code = packageJs(code);
    fs.writeFile('src/parser-extended.peg.js', code, function (err) {
      done(err);
    });
  });
});

gulp.task('pegjs', ['pegjs-basic', 'pegjs-extended']);

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

gulp.task('copy', function () {
  return gulp.src('build/*').pipe(gulp.dest('dist'));
});

gulp.task('build', ['pegjs', 'concat', 'uglifyjs']);
gulp.task('test', ['jshint', 'mocha']);
gulp.task('dist', function () {
  return runSequence('clean', 'build', 'test', 'copy');
});
gulp.task('default', function () {
  return runSequence('clean', 'build', 'test');
});
