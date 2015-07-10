(function (global) {
/* global describe, it */
'use strict';
var _inNode = 'process' in global;

var expect, _, Parser;
if (_inNode) {
  expect = require('expect.js');
  _ = require('lodash');
  Parser = require('../src').Parser;
} else {
  expect = global.expect;
  _ = global._;
  Parser = global.PixivNovelParser.Parser;
}

describe('Parser', function () {
  describe('test tadsan\'s novel.', function () {
    it('Correct in テストの冒険', function () {
      var novel = [
'1ぺーじ',
'[jump:4]',
'[newpage]',
'2ぺーじ',
'[jump:3]',
'[newpage]',
'3ぺーじ',
'[jump:^1]',
'[newpage]',
'4ぺーじ',
'[jump:^1]',
'[jump:02]'
          ].join('\n'),
          parser = new Parser();

      parser.parse(novel);
      expect(_.isEqual(parser.tree, [
        { type: 'text', val: '1ぺーじ\n' },
        { type: 'tag', name: 'jump', pageNumber: 4 },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '2ぺーじ\n' },
        { type: 'tag', name: 'jump', pageNumber: 3 },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '3ぺーじ\n[jump:^1]' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '4ぺーじ\n[jump:^1]\n' },
        { type: 'tag', name: 'jump', pageNumber: 2 }
      ])).to.be.ok();
    });

    it('Correct in 見出しの冒険', function () {
      /* jshint maxlen: 1000 */
      var novel = [
'章タイトルの中に [\u200cnewpage]',
'1 [\u200cchapter:[n\u200cewpage]]',
'[newpage]',
'1 [chapter:[newpage]]',
'[newpage]',
'2 [\u200cchapter\u200c:ふつうの章タイトル]',
'[newpage]',
'2 [chapter:ふつうの章タイトル]',
'[newpage]',
'章タイトルの中に小説内リンク',
'3 [\u200cchapter:[\u200cjump:1]]',
'[newpage]',
'3 [chapter:[jump:1]]',
'[newpage]',
'4 [\u200cchapter:[\u200c[jumpuri:章タイトルの中に小説外リンク4 > http://pixiv.me]\u200c]]',
'[newpage]',
'4 [chapter:[[jumpuri:章タイトルの中に小説外リンク4 > http://pixiv.me]]]',
'[newpage]',
'5 [\u200c[jump\u200curi:[chap\u200cter:小説外リンクの中に章タイトル] > http://pixiv.me]\u200c]',
'[newpage]',
'5 [[jumpuri:[chapter:小説外リンクの中に章タイトル] > http://pixiv.me]]',
'[newpage]',
'6\u200c [\u200ccha\u200cpter\u200c:[\u200c[jumpuri\u200c:[\u200c\u200c[j\u200cumpur\u200ci:[\u200cchapter\u200c:章タイトルの中に小説外リンクの中に小説タイトルの中に章タイトル] > http://pixiv.me]\u200c] > http://pixiv.me]\u200c\u200c]]',
'[newpage]',
'6 [chapter:[[jumpuri:[\u200c[jumpuri:[\u200c\u200cc\u200ch\u200ca\u200cpter\u200c\u200c:章タイトルの中に小説外リンクの中に小説タイトルの中に章タイトル] > http://pixiv.me]] > http://pixiv.me]]]',
'[newpage]',
'7 [chapter:をはり]',
'[newpage]  '
          ].join('\n'),
          parser = new Parser();

      var expected = [
        { type: 'text', val: '章タイトルの中に [ newpage]\n1 [ chapter:[n ewpage]]' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '1 ' },
        { type: 'tag', name: 'chapter', title: [
          {
            type: 'text',
            val: '[newpage'
          }
        ] },
        { type: 'text', val: ']' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '2 [ chapter :ふつうの章タイトル]' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '2 ' },
        { type: 'tag', name: 'chapter', title: [
          {
            type: 'text',
            val: 'ふつうの章タイトル'
          }
        ] },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '章タイトルの中に小説内リンク\n3 [ chapter:[ jump:1]]' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '3 ' },
        { type: 'tag', name: 'chapter', title: [
          {
            type: 'text',
            val: '[jump:1'
          }
        ] },
        { type: 'text', val: ']' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '4 [ chapter:[ [jumpuri:章タイトルの中に小説外リンク4 > http://pixiv.me] ]]' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '4 ' },
        { type: 'tag', name: 'chapter', title: [
          {
            type: 'text',
            val: '[[jumpuri:章タイトルの中に小説外リンク4 > http://pixiv.me'
          }
        ] },
        { type: 'text', val: ']]' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '5 [ [jump uri:[chap ter:小説外リンクの中に章タイトル] > http://pixiv.me] ]' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '5 ' },
        { type: 'tag', name: 'jumpuri', title: [
          {
            type: 'text',
            val: '[chapter:小説外リンクの中に章タイトル]'
          }
        ], uri: 'http://pixiv.me' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '6  [ cha pter :[ [jumpuri :[  [j umpur i:[ chapter :章タイトルの中に小説外リンクの中に小説タイトルの中に章タイトル] > http://pixiv.me] ] > http://pixiv.me]  ]]' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '6 ' },
        { type: 'tag', name: 'chapter', title: [
          {
            type: 'text',
            val: '[[jumpuri:[ [jumpuri:[  c h a pter  :章タイトルの中に小説外リンクの中に小説タイトルの中に章タイトル'
          }
        ] },
        { type: 'text', val: ' > http://pixiv.me]] > http://pixiv.me]]]' },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '7 ' },
        { type: 'tag', name: 'chapter', title: [
          {
            type: 'text',
            val: 'をはり'
          }
        ] },
        { type: 'tag', name: 'newpage' },
        { type: 'text', val: '  ' }
      ];

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expected)).to.be.ok();
    });
  });
});

}((this || 0).self || global));
