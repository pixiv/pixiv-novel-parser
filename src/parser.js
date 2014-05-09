(function (global) {
 /* global PixivNovelParser */
 /* jshint maxstatements: 1000 */
'use strict';
var _inNode = 'process' in global;
var parser;
if (_inNode) {
  parser = require('./parser.peg.js');
} else {
  parser = PixivNovelParser.parser;
}

function h(str) {
  return str.toString().
    replace('&', '&amp;').
    replace('<', '&lt;').
    replace('>', '&gt;').
    replace('"', '&quot;').
    replace('\'', '&apos;');
}

function hs(str) { return h(str).replace(/[\r\n]/g, ' '); }

function a(href, textContent) {
  return '<a href="' + hs(href) + '">' + h(textContent) + '</a>';
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
    return parser.parse(novel).reduce(function (tree, token) {
      var last = tree[tree.length - 1];

      if (token.type === 'text' && last && last.type === 'text') {
        last.val += token.val;
      } else {
        tree.push(token);
      }
      return tree;
    }, []);
  } catch (err) {
    if (_inNode) {
      process.stderr.write(err.stack + '\n');
    } else {
      console.error(err);
    }
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
 * @return {string[]}
 */
Parser.prototype.toHTML = function () {
  var token, page = '',
      i = 0,
      iz = this.tree.length,
      html = [];

  function pixivimageHTML(token) {
    return '<a href="' + hs(token.illustId + '/' + token.pageNumber) +  '"></a>';
  }

  for (; token = this.tree[i], i < iz; ++i) {
    if (token.type === 'text') {
      page += h(token.val).trim().replace(/\r?\n/g, '<br/>');
      continue;
    }
    switch (token.name) {
      case 'newpage':
        html.push(page);
        page = '';
        break;
      case 'chapter':
        page += '<p class="chapter">' + h(token.title) + '</p>'; break;
      case 'pixivimage':
        page += pixivimageHTML(token); break;
      case 'jump':
        page += a('#' + token.pageNumber, token.pageNumber + 'ページへ'); break;
      case 'jumpuri':
        page += a(token.uri, token.title); break;
    }
  }
  html.push(page);
  return html;
};

/**
 * @return {string}
 */
Parser.prototype.toJSON = function () {
  return JSON.stringify(this.tree);
};

if (_inNode) {
  module.exports = Parser;
} else {
  global.PixivNovelParser = global.PixivNovalPerser || {};
  global.PixivNovelParser.Parser = Parser;
}
}((this || 0).self || global));
