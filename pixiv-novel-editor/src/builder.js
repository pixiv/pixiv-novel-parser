(function (global) {
/* jshint maxstatements: 1000 */
'use strict';
var _inNode = 'process' in global;
var Parser;
if (_inNode) {
  Parser = require('pixiv-novel-parser').Parser;
} else {
  Parser = global.PixivNovelParser.Parser;
}

/**
 * Escape HTML.
 * @param {string} string
 * @return {string}
 */
function h(str) {
  return str.toString().
    replace(/&/g, '&amp;').
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;').
    replace(/"/g, '&quot;').
    replace(/'/g, '&apos;');
}

/**
 * Escape HTML strictly, for attributes.
 * @param {string} string
 * @return {string}
 */
function hs(str) { return h(str).replace(/[\r\n]/g, ' '); }

/**
 * @constructor
 */
function Builder() {
  this.chapters = [];
  this.pages = [];
}

/**
 * @param {Object.<string,string>[]}
 * @return {Builder}
 */
Builder.prototype.build = function (ast) {
  ast = ast.reduce(function (ast, token) {
    if (token.type === 'text') {
      ast.currentPage.push(token);
      return ast;
    }
    switch (token.name) {
      case 'newpage':
        ast.pages.push(ast.currentPage);
        ast.currentPage = [];
        break;
      case 'chapter':
        token.chapterNumber = ast.chapters.length + 1;
        ast.chapters.push({ title: token.title, pageNumber: ast.pages.length + 1 });
        ast.currentPage.push(token);
        break;
      default:
        ast.currentPage.push(token);
    }
    return ast;
  }, { chapters: [], pages: [], currentPage: [] });
  ast.pages.push(ast.currentPage);
  this.chapters = ast.chapters;
  this.pages = ast.pages;
  return this;
};

/**
 * @return {string}
 */
Builder.prototype.toHTML = function () {
  var content = '',
      index = '';

  function tokenToHTML(token, pageNumber) {
    /* jshint maxlen: 1000 */
    if (token.type === 'text') { return h(token.val).replace(/\n/g, '<br/>'); }
    switch (token.name) {
      case 'chapter':
        return '<h1><a name="page' + pageNumber + '-chapter' + hs(token.chapterNumber) + '"></a>' + h(token.title) + '</h1>';
      case 'pixivimage':
        return '<script src="http://source.pixiv.net/source/embed.js" data-id="' + hs(token.illustID) + '_f4d95fc6ba9052e1278a56e5c497ef3e" data-size="medium" data-border="on" charset="utf-8"></script>' +
          '<noscript><a href="http://p.tl/i/' + hs(token.illustID) + '">' + h(token.illustID) + '</a></noscript>';
      case 'jump':
        return '<a href="#page' + hs(token.pageNumber) + '">' + h(token.pageNumber) + 'ページヘ</a>';
      case 'jumpuri':
        return '<a href="' + hs(token.uri) + '">' + h(token.title) + '</a>';
      default:
        return '';
    }
  }

  function pageToHTML(ast, i) {
    var page = '';

    page = ast.reduce(function (html, token) {
      return html + tokenToHTML(token, i + 1);
    }, '');
    return '<a name="page' + (i + 1) + '"></a>' + page;
  }

  content = this.pages.map(pageToHTML).join('<hr/>');
  index = '<ol class="novel-index">' +
    this.chapters.reduce(function (html, chapter, i) {
      /* jshint maxlen: 1000 */
      return html + '<li><a href="#page' + hs(chapter.pageNumber) + '-chapter' + (i + 1) + '">' + h(chapter.title) + '</a></li>';
    }, '') +
    '</ol>';
  return index + content;
};

if (_inNode) {
  module.exports = { Builder: Builder };
} else {
  global.PixivNovelParser = global.PixivNovelParser || {};
  global.PixivNovelParser.Builder = Builder;
}
}((this || 0).self || global));
