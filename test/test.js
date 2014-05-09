(function (global) {
/* global describe, it */
'use strict';
var _inNode = 'process' in global;
var assert, JSV, Parser;
if (_inNode) {
  assert = require('assert');
  JSV = require('JSV').JSV;
  Parser = require('../src');
} else {
  assert = global.assert;
  JSV = global.JSV;
  Parser = global.PixivNovelParser.Parser;
}

function validateJSON(json, schema) {
  if (!_inNode) { return true; }
  var env = JSV.createEnvironment('json-schema-draft-03'),
      report = env.validate(json, schema),
      errors = report.errors;

  if (errors.length > 0) {
    console.error(errors);
    return false;
  }
  return true;
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
      assert.deepEqual(parser.tree, expectedAST);
      assert.ok(validateJSON(parser.tree[0], schema));
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
      assert.deepEqual(parser.tree, expectedAST);
      assert.ok(validateJSON(parser.tree[1], schema));
    });
  });

  describe('chapter', function () {
    it('見出しをちゃんと表示できる', function () {
      var parser = new Parser(),
          novel = '前文[chapter:見出し]本文',
          expectedAST = [
            { type: 'text', val: '前文' },
            { type: 'tag', name: 'chapter', title: '見出し' },
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
      assert.deepEqual(parser.tree, expectedAST);
      assert.ok(validateJSON(parser.tree[1], schema));
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
      assert.deepEqual(parser.tree, expectedAST);
      assert.ok(validateJSON(parser.tree[0], schema));
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
      assert.deepEqual(parser.tree, expectedAST);
      assert.ok(validateJSON(parser.tree[0], schema));
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
      assert.deepEqual(parser.tree, expectedAST);
      assert.ok(validateJSON(parser.tree[0], schema));
    });
  });

  describe('jumpuri', function () {
    it('正常なURLをちゃんとlinkにできる', function () {
      var parser = new Parser(),
          novel = '[[jumpuri:[pixiv] > http://www.pixiv.net/]]',
          expectedAST = [
            { type: 'tag', name: 'jumpuri', title: '[pixiv]', uri: 'http://www.pixiv.net/' }
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
      assert.deepEqual(parser.tree, expectedAST);
      assert.ok(validateJSON(parser.tree[0], schema));
    });
  });
});

}((this || 0).self || global));
