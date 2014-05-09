(function (global) {
/* global describe, it */
'use strict';
var _inNode = 'process' in global;
var assert, Parser;
if (_inNode) {
  assert = require('assert');
  Parser = require('../src');
} else {
  assert = global.assert;
  Parser = global.PixivNovelParser.Parser;
}

describe('Parser', function () {
  describe('newpage', function () {
    it('ちゃんとページを分割できる', function () {
      var novel = [
'1ページ目[newpage]2ページ目'
          ].join('\n'),
          parser = new Parser();

      parser.parse(novel);
      assert.deepEqual(parser.tree, [
{ type: 'text', val: '1ページ目' },
{ type: 'tag', name: 'newpage' },
{ type: 'text', val: '2ページ目' }
      ]);
      assert.deepEqual(parser.toHTML(), [
'1ページ目',
'2ページ目'
      ]);
    });
  });

  describe('chapter', function () {
    it('見出しをちゃんと表示できる', function () {
      var novel = [
'前文[chapter:見出し]本文'
          ].join('\n'),
          parser = new Parser();

      parser.parse(novel);
      assert.deepEqual(parser.tree, [
{ type: 'text', val: '前文' },
{ type: 'tag', name: 'chapter', title: '見出し' },
{ type: 'text', val: '本文' }
      ]);
      assert.deepEqual(parser.toHTML(), [
'前文<p class="chapter">見出し</p>本文'
      ]);
    });
  });

  describe('pixivimage', function () {
    it('画像形式のpixivimageをちゃんと認識できる', function () {
      var novel = [
'[pixivimage:000001]'
          ].join('\n'),
          parser = new Parser();

      parser.parse(novel);
      assert.deepEqual(parser.tree, [
{ type: 'tag', name: 'pixivimage', illustID: '000001', pageNumber: null }
      ]);
    });

    it('漫画形式のpixivimageをちゃんと認識できる', function () {
      var novel = [
'[pixivimage:000001-02]'
          ].join('\n'),
          parser = new Parser();

      parser.parse(novel);
      assert.deepEqual(parser.tree, [
{ type: 'tag', name: 'pixivimage', illustID: '000001', pageNumber: 2 }
      ]);
    });
  });

  describe('jump', function () {
    it('ページジャンプをちゃんとlinkにできる', function () {
      var novel = [
'[jump:01]'
          ].join('\n'),
          parser = new Parser();

      parser.parse(novel);
      assert.deepEqual(parser.tree, [
{ type: 'tag', name: 'jump', pageNumber: 1 }
      ]);
    });
  });

  describe('jumpuri', function () {
    it('正常なURLをちゃんとlinkにできる', function () {
      var novel = [
'[[jumpuri:[pixiv] > http://www.pixiv.net/]]'
          ].join('\n'),
          parser = new Parser();

      parser.parse(novel);
      assert.deepEqual(parser.tree, [
{ type: 'tag', name: 'jumpuri', title: '[pixiv]', uri: 'http://www.pixiv.net/' }
      ]);
      assert.deepEqual(parser.toHTML(), [
'<a href="http://www.pixiv.net/">[pixiv]</a>'
      ]);
    });
  });
});

}((this || 0).self || global));
