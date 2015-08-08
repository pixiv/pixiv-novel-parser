(function () {
 /* jshint maxstatements: 1000 */
'use strict';
var basicParser;
basicParser = require('./parser.peg.js');

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
 *   { syntax: 'basic' | 'extended' }
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

module.exports = { Parser: Parser };
}());
