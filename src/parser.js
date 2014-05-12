(function (global) {
 /* global PixivNovelParser */
 /* jshint maxstatements: 1000 */
'use strict';
var _inNode = 'process' in global;
var parser;
if (_inNode) {
  parser = require('./parser-extended.peg.js');
} else {
  parser = PixivNovelParser.parser;
}

/**
 * [newpage]
 * [chapter:.*]
 * [pixivimage:\d*(-\d*)?]
 * [jump:\d*]
 * [[jumpuri:.* > URL]]
 *
 * [ruby: rb > rt]
 * [emoji:.*]
 * [strong:.*]
 */
function Parser() {
  this.tree = [];
}

/**
 * @param {string} novel
 * @return {Object.<string,Object>[]}
 */
Parser.parse = function (novel) {
  try {
    novel = novel.replace(/\r?\n/g, '\n').
      replace(/[\s\u200c]/g, function (c) {
        if (c === '\n' || c === '\u3000') { return c; }
        return ' ';
      });
    return parser.parse(novel);
  } catch (err) {
    console.error(err);
    return [{ type: 'text', val: novel }];
  }
};

/**
 * @param {string} novel
 * @return {Parser}
 */
Parser.prototype.parse = function (novel) {
  this.tree = Parser.parse(novel);
  return this;
};

/**
 * @return {string}
 */
Parser.prototype.toJSON = function () {
  return JSON.stringify(this.tree);
};

if (_inNode) {
  module.exports = { Parser: Parser };
} else {
  global.PixivNovelParser = global.PixivNovalPerser || {};
  global.PixivNovelParser.Parser = Parser;
}
}((this || 0).self || global));
