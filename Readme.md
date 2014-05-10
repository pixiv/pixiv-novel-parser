# pixiv-novel-parser

  pixiv novel parser (reference impl).

## Installation

  Install with [component(1)](http://component.io):

    $ component install pixiv/pixiv-novel-parser

  With [npm](https://www.npmjs.org):

    $ npm install pixiv-novel-parser --save

  With [bower](http://bower.io):

    $ bower install pixiv-novel-parser --save

## API

### JavaScript API

```
// On node.js.
var Parser = require('pixiv-novel-parser');

// Or on Web browser.
// <script src="pixiv-novel-parser.min.js"></script>
var Parser = PixivNovelParser.Parser;
```

```javascript
console.log(Parser.parse('[chapter:見出し]本文')); // -> Get AST.
```

```javascript
var parser = new Parser();
parser.parse('[chapter:見出し]本文');

console.log(parser.tree);     // -> Get AST.
console.log(parser.toJSON()); // -> Output as JSON.
```

## AST (Abstract Syntax Tree)

  tagは決して入れ子になりませんので、ASTをtokenの配列として表します。

  See [test/test.js](test/test.js). It's written in [JSON Schema](http://json-schema.org).

## Contribute

### Install dependencies

  We use npm and component. (We favor component more then bower.)

```
$ npm insatll
$ component install
$ bower install
```

### Build

    $ gulp build

### Testing

  On node.js. [Gulp](http://gulpjs.com) is required.

    $ npm test

  On Web browser. Display [test/test.html](test/test.html).

### Coding rules

  Coding rules are written in `.editorconfig` and `.jshintrc`.

## License

[CC0 1.0 Universal (CC0 1.0)](https://creativecommons.org/publicdomain/zero/1.0/deed.ja)

The person who associated a work with this deed has dedicated the work to the public domain by waiving all of his or her rights to the work worldwide under copyright law, including all related and neighboring rights, to the extent allowed by law.

あなたはこの作品を複製し、改変し、頒布し、上演・実演することができます。営利目的であってもそのようにすることができます。これらは許諾を求める必要はありません。以下のその他の情報をご参照下さい。
