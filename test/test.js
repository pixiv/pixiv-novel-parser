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

describe('Parser specifications.', function () {
  /* jshint quotmark: false */
  describe('テキスト', function () {
    it('ただのテキストはちゃんとただのテキストになる', function () {
      var parser = new Parser(),
          novel = 'テキスト\nテキスト',
          expectedAST = [{ type: 'text', val: 'テキスト\nテキスト' }],
          schema = {
            "$schema": "http://json-schema.org/draft-02/hyper-schema#",
            "id": "http://json-schema.org/draft-02/schema#",
            "type": "object",
            "properties": {
              "type": {
                "enum": ["text"]
              },
              "val": {
                "type": "string"
              }
            },
            "required": ["type", "val"]
          };

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
    });

    it('改行コードを正規化する', function () {
      var parser = new Parser(),
          novel = '\n\n改行\n改行\r\n改行\n\r\n改行\r\n\n改行\r\n\r\n改行\n',
          expectedAST = [
            { type: 'text', val: '\n\n改行\n改行\n改行\n\n改行\n\n改行\n\n改行\n' },
          ];

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
    });
  });

  describe('newpage', function () {
    it('ちゃんとページを分割できる', function () {
      var parser = new Parser(),
          novel = '1ページ目[newpage]2ページ目',
          expectedAST = [
            { type: 'text', val: '1ページ目' },
            { type: 'tag', name: 'newpage' },
            { type: 'text', val: '2ページ目' }
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
                "enum": ["newpage"]
              }
            },
            "required": ["type", "name"]
          };

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      expect(helper.validateJSON(parser.tree[1], schema)).to.be.ok();
    });

    it('前後の改行を取り除く', function () {
      var parser = new Parser(),
          novel = '国境の長いトンネルを抜けると、\n[newpage]\n雪国であった。',
          expectedAST = [
            { type: 'text', val: '国境の長いトンネルを抜けると、' },
            { type: 'tag', name: 'newpage' },
            { type: 'text', val: '雪国であった。' }
          ];

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
    });

    it('2個以上の改行を取り除かない', function () {
      var parser = new Parser(),
          novel = '注意\nこの小説にはグロテスクな表現が含まれています。\n\n[newpage]\n\n\n嘘です。',
          expectedAST = [
            { type: 'text', val: '注意\nこの小説にはグロテスクな表現が含まれています。\n' },
            { type: 'tag', name: 'newpage' },
            { type: 'text', val: '\n\n嘘です。' }
          ];

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
    });
  });

  describe('ルビ', function () {
    it('ルビをちゃんと認識できる', function () {
      var parser = new Parser({ syntax: 'basic' }),
          novel = '[[rb: 換言 > かんげん ]]すれば[[rb:畢竟>ひっきょう]]ももんが',
          expectedAST = [
            { type: 'tag', name: 'rb', rubyBase: '換言', rubyText: 'かんげん' },
            { type: 'text', val: 'すれば' },
            { type: 'tag', name: 'rb', rubyBase: '畢竟', rubyText: 'ひっきょう' },
            { type: 'text', val: 'ももんが' }
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
                "enum": ["rb"]
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
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
      expect(helper.validateJSON(parser.tree[2], schema)).to.be.ok();
    });

    it('ルビ内ではタグは使えない', function () {
      var parser = new Parser({ syntax: 'basic' }),
          novel = '[[rb: [chapter:換言] > かんげん ]]すれば[[rb:[jumpuri:畢竟>https://kotobank.jp/word/%E7%95%A2%E7%AB%9F]>ひっきょう]]ももんが',
          expectedAST = [
            { type: 'tag', name: 'rb', rubyBase: '[chapter:換言]', rubyText: 'かんげん' },
            { type: 'text', val: 'すれば' },
            { type: 'tag', name: 'rb', rubyBase: '[jumpuri:畢竟', rubyText: 'https://kotobank.jp/word/%E7%95%A2%E7%AB%9F]>ひっきょう' },
            { type: 'text', val: 'ももんが' }
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
                "enum": ["rb"]
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
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
      expect(helper.validateJSON(parser.tree[2], schema)).to.be.ok();
    });
  });

  describe('chapter', function () {
    it('見出しをちゃんと表示できる', function () {
      var parser = new Parser(),
          novel = '前文[chapter:見出し]本文',
          expectedAST = [
            { type: 'text', val: '前文' },
            { type: 'tag', name: 'chapter', title: [
              {
                type: 'text',
                val: '見出し'
              }
            ] },
            { type: 'text', val: '本文' }
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
                "enum": ["chapter"]
              },
              "title": {
                "type": "string"
              }
            },
            "required": ["type", "name", "title"]
          };

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      //expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
    });

    it('前後の改行を取り除く', function () {
      var parser = new Parser(),
          novel = '初投稿です。\n[chapter:まえがき]\n読まないでください。',
          expectedAST = [
            { type: 'text', val: '初投稿です。' },
            { type: 'tag', name: 'chapter', title: [
              {
                type: 'text',
                val: 'まえがき'
              }
            ] },
            { type: 'text', val: '読まないでください。' }
          ];

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
    });

    it('2個以上の改行を取り除かない', function () {
      var parser = new Parser(),
          novel = '吾輩は猫である。\n\n[chapter:名前は]\n\n\nまだない。',
          expectedAST = [
            { type: 'text', val: '吾輩は猫である。\n' },
            { type: 'tag', name: 'chapter', title: [
              {
                type: 'text',
                val: '名前は'
              }
            ] },
            { type: 'text', val: '\n\nまだない。' }
          ];

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
    });


    it('見出し内でルビが使用できる', function () {
      var parser = new Parser(),
          novel = '[chapter:ルビが[[rb: 使用 > しよう]]できる[[rb:見出>みだ]]し]\nルビが使用できます。',
          expectedAST = [
            { type: 'tag', name: 'chapter', title: [
              {
                type: 'text',
                val: 'ルビが'
              },
              {
                type: 'tag',
                name: 'rb',
                rubyBase: '使用',
                rubyText: 'しよう'
              },
              {
                type: 'text',
                val: 'できる'
              },
              {
                type: 'tag',
                name: 'rb',
                rubyBase: '見出',
                rubyText: 'みだ'
              },
              {
                type: 'text',
                val: 'し'
              }
            ] },
            { type: 'text', val: 'ルビが使用できます。' }
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
                "enum": ["chapter"]
              },
              "title": {
                "type": "string"
              }
            },
            "required": ["type", "name", "title"]
          };

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      //expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
    });
  });

  describe('pixivimage', function () {
    it('画像形式のpixivimageをちゃんと認識できる', function () {
      var parser = new Parser(),
          novel = '[pixivimage:000001]',
          expectedAST = [
            { type: 'tag', name: 'pixivimage', illustID: '000001', pageNumber: null }
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
                "enum": ["pixivimage"]
              },
              "illustID": {
                "type": "string",
                "pattern": "\\d+"
              },
              "pageNumber": {
                "type": ["integer", "null"],
                "minumum": 1
              }
            },
            "required": ["type", "name", "illustID", "pageNumber"]
          };

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
    });

    it('漫画形式のpixivimageをちゃんと認識できる', function () {
      var parser = new Parser(),
          novel = '[pixivimage:000001-02]',
          expectedAST = [
            { type: 'tag', name: 'pixivimage', illustID: '000001', pageNumber: 2 }
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
                "enum": ["pixivimage"]
              },
              "illustID": {
                "type": "string",
                "pattern": "\\d+"
              },
              "pageNumber": {
                "type": ["integer", "null"],
                "minumum": 1
              }
            },
            "required": ["type", "name", "illustID", "pageNumber"]
          };

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
    });
  });

  describe('jump', function () {
    it('ページジャンプをちゃんとlinkにできる', function () {
      var parser = new Parser(),
          novel = '[jump:01]',
          expectedAST = [
            { type: 'tag', name: 'jump', pageNumber: 1 }
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
                "enum": ["jump"]
              },
              "pageNumber": {
                "type": ["integer"],
                "minumum": 1
              }
            },
            "required": ["type", "name", "pageNumber"]
          };

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
    });
  });

  describe('jumpuri', function () {
    it('正常なURLをちゃんとlinkにできる', function () {
      var parser = new Parser(),
          novel = '[[jumpuri:[pixiv] > http://www.pixiv.net/]]',
          expectedAST = [
            { type: 'tag', name: 'jumpuri', title: [
              {
                type: 'text',
                val: '[pixiv]'
              }
            ], uri: 'http://www.pixiv.net/' }
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
                "enum": ["jumpuri"]
              },
              "title": {
                "type": "string"
              },
              "uri": {
                "type": "string",
                "format": "uri"
              }
            },
            "required": ["type", "name", "title", "uri"]
          };

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      //expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
    });

    it('パーセントエンコーディングに対応', function () {
      var parser = new Parser(),
          novel = '[[jumpuri:ティロ・フィナーレ > http://dic.pixiv.net/a/%E3%83%9E%E3%83%9F%E3%82%8B]]',
          expectedAST = [
            { type: 'tag', name: 'jumpuri', title: [
              {
                type: 'text',
                val: 'ティロ・フィナーレ'
              }
            ], uri: 'http://dic.pixiv.net/a/%E3%83%9E%E3%83%9F%E3%82%8B' }
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
                "enum": ["jumpuri"]
              },
              "title": {
                "type": "string"
              },
              "uri": {
                "type": "string",
                "format": "uri"
              }
            },
            "required": ["type", "name", "title", "uri"]
          };

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      //expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
    });

    it('外部リンク内でルビが使用できる', function () {
      var parser = new Parser(),
          novel = '[[jumpuri:とある[[rb: 魔術 > まじゅつ]]の[[rb:禁書目録>インデックス]] > http://www.project-index.net/]]',
          expectedAST = [
            { type: 'tag', name: 'jumpuri', title: [
              {
                type: 'text',
                val: 'とある'
              },
              {
                type: 'tag',
                name: 'rb',
                rubyBase: '魔術',
                rubyText: 'まじゅつ'
              },
              {
                type: 'text',
                val: 'の'
              },
              {
                type: 'tag',
                name: 'rb',
                rubyBase: '禁書目録',
                rubyText: 'インデックス'
              },
              {
                type: 'text',
                val: ''
              }
            ], uri: 'http://www.project-index.net/' }
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
                "enum": ["jumpuri"]
              },
              "title": {
                "type": "string"
              },
              "uri": {
                "type": "string",
                "format": "uri"
              }
            },
            "required": ["type", "name", "title", "uri"]
          };

      parser.parse(novel);
      expect(_.isEqual(parser.tree, expectedAST)).to.be.ok();
      //expect(helper.validateJSON(parser.tree[0], schema)).to.be.ok();
    });
  });
});

}((this || 0).self || global));
