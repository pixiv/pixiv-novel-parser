'use strict';
var parser = require('./parser.peg.js');

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
 * [chapter:[^\]]*]
 * [pixivimage:\d*(-\d*)?]
 * [jump:\d*]
 * [[jumpuri:\S*\s>\sURL]]
 */
function Parser() {
  this.tree = [];
}

/**
 * @param {string} novel
 * @return {Object.<string,Object>[]}
 */
Parser.parse = function (novel) {
  return parser.parse(novel).reduce(function (tree, token) {
    var last = tree[tree.length - 1];

    if (token.type === 'text' && last && last.type === 'text') {
      last.val += token.val;
    } else {
      tree.push(token);
    }
    return tree;
  }, []);
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

module.exports = Parser;
