(function (global) {
 /* global PixivNovelParser */
 /* jshint maxstatements: 1000 */
'use strict';
var _inNode = 'process' in global;
var basicParser, extendedParser;
if (_inNode) {
  basicParser = require('./parser.peg.js');
  extendedParser = require('./parser-extended.peg.js');
} else {
  basicParser = PixivNovelParser.parser;
  extendedParser = PixivNovelParser.parser;
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
function Parser(options) {
  options = options || {};
  this.syntax = options.syntax || 'basic';
  this.tree = [];
}

/**
 * @param {string} novel
 * @param {Object,<string,Object>} options
 *   { syntex: 'basic' | 'extended' }
 * @return {Object.<string,Object>[]}
 */
Parser.parse = function (novel, options) {
  options = options || {};
  options.syntax = options.syntax || 'basic';
  try {
    novel = novel.replace(/\r?\n/g, '\n').
      replace(/[\s\u200c]/g, function (c) {
        if (c === '\n' || c === '\u3000') { return c; }
        return ' ';
      });
    switch (options.syntax) {
      case 'extended':
        return extendedParser.parse(novel);
      case 'basic':
        /* falls through */
      default:
        return basicParser.parse(novel);
    }
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
  this.tree = Parser.parse(novel, { syntax: this.syntax });
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
