(function (global) {
/* global describe, it */
'use strict';
var _inNode = 'process' in global;
var expect, _, JSV, helper, Parser;
if (_inNode) {
  expect = require('expect.js');
  _ = require('lodash');
  JSV = require('JSV').JSV;
  helper = require('./test_helper');
  Parser = require('../src').Parser;
} else {
  expect = global.expect;
  _ = global._;
  JSV = global.JSV;
  helper = global.TestHelper;
  Parser = global.PixivNovelParser.Parser;
}

describe('Parser specifications with extened syntax.', function () {
  /* jshint quotmark: false */
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
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
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
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
    });
  });

  it('syntax: basicを指定するとちゃんと拡張文法を認識しない', function () {
    var parser = new Parser(),
        novel = '[strong:革新的なももんが][chapter:基礎的な章]',
        expectedAST = [
          { type: 'text', val: '[strong:革新的なももんが]' },
          { type: 'tag', name: 'chapter', title: [
            {
              type: 'text',
              val: '基礎的な章'
            }
          ] }
        ];

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
  });
});

}((this || 0).self || global));
