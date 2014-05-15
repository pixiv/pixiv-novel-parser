(function (global) {
/* global describe, it */
'use strict';
var _inNode = 'process' in global;
var assert, JSV, Parser, helper;
if (_inNode) {
  assert = require('assert');
  JSV = require('JSV').JSV;
  helper = require('./test_helper');
  Parser = require('../src').Parser;
} else {
  assert = global.assert;
  JSV = global.JSV;
  helper = global.TestHelper;
  Parser = global.PixivNovelParser.Parser;
}

describe('Parser specifications with extened syntax.', function () {
  /* jshint quotmark: false */
  describe('ルビ', function () {
    it('ルビをちゃんと認識できる', function () {
      var parser = new Parser({ syntax: 'extended' }),
          novel = '[ruby: 換言 > かんげん ]すれば[ruby:畢竟>ひっきょう]ももんが',
          expectedAST = [
            { type: 'tag', name: 'ruby', rubyBase: '換言', rubyText: 'かんげん' },
            { type: 'text', val: 'すれば' },
            { type: 'tag', name: 'ruby', rubyBase: '畢竟', rubyText: 'ひっきょう' },
            { type: 'text', val: 'ももんが' },
          ],
          schema = {
            "$schema": "http://json-schema.org/draft-02/hyper-schema#",
            "id": "http://json-schema.org/draft-02/schema#",
            "type": "object",
            "properties": {
              "type": {
                "enum": ["tag"]
              },
              "name": {
                "enum": ["ruby"]
              },
              "rubyBase": {
                "type": "string"
              },
              "rubyText": {
                "type": "string"
              }
            },
            "required": ["type", "name", "rubyBase", "rubyText"]
          };

      parser.parse(novel);
      assert.deepEqual(parser.tree, expectedAST);
      assert.ok(helper.validateJSON(parser.tree[0], schema));
      assert.ok(helper.validateJSON(parser.tree[2], schema));
    });
  });

  describe('絵文字', function () {
    it('絵文字はちゃんと絵文字', function () {
      var parser = new Parser({ syntax: 'extended' }),
          novel = '[emoji:love2]',
          expectedAST = [
            { type: 'tag', name: 'emoji', emojiName: 'love2' }
          ],
          schema = {
            "$schema": "http://json-schema.org/draft-02/hyper-schema#",
            "id": "http://json-schema.org/draft-02/schema#",
            "type": "object",
            "properties": {
              "type": {
                "enum": ["tag"]
              },
              "name": {
                "enum": ["emoji"]
              },
              "emojiName": {
                "type": "string"
              }
            },
            "required": ["type", "name", "emojiName"]
          };

      parser.parse(novel);
      assert.deepEqual(parser.tree, expectedAST);
      assert.ok(helper.validateJSON(parser.tree[0], schema));
    });
  });

  describe('強調', function () {
    it('したければちゃんと強調される', function () {
      var parser = new Parser({ syntax: 'extended' }),
          novel = '[strong:ももんが]',
          expectedAST = [
            { type: 'tag', name: 'strong', val: 'ももんが' }
          ],
          schema = {
            "$schema": "http://json-schema.org/draft-02/hyper-schema#",
            "id": "http://json-schema.org/draft-02/schema#",
            "type": "object",
            "properties": {
              "type": {
                "enum": ["tag"]
              },
              "name": {
                "enum": ["strong"]
              },
              "val": {
                "type": "string"
              }
            },
            "required": ["type", "name", "val"]
          };

      parser.parse(novel);
      assert.deepEqual(parser.tree, expectedAST);
      assert.ok(helper.validateJSON(parser.tree[0], schema));
    });
  });

  it('syntax: basicを指定するとちゃんと拡張文法を認識しない', function () {
    var parser = new Parser(),
        novel = '[strong:革新的なももんが][chapter:基礎的な章]',
        expectedAST = [
          { type: 'text', val: '[strong:革新的なももんが]' },
          { type: 'tag', name: 'chapter', title: '基礎的な章' }
        ];

      parser.parse(novel);
      assert.deepEqual(parser.tree, expectedAST);
  });
});

}((this || 0).self || global));
