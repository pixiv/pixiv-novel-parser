# pixiv-novel-parser

  pixiv novel parser (reference impl).

## Installation

  Install with [component(1)](http://component.io):

    $ component install pixiv/pixiv-novel-parser

  With [npm](https://www.npmjs.org):

    $ npm install pixiv-novel-parser --save

  With [bower](http://bower.io):

    $ bower install pixiv-novel-parser --save

## Compatibility

pixiv-novel-parser will move every where!

- Opera 21
- Firefox 29
- IE 11
- node.js 0.10.28
- PECL V8js 0.1.3

## API

### JavaScript API

```
// On node.js.
var Parser = require('pixiv-novel-parser').Parser;

// Or on Web browser.
// <script src="pixiv-novel-parser.min.js"></script>
var Parser = PixivNovelParser.Parser;
```

```javascript
console.log(
  Parser.parse(
    '[chapter:見出し]本文[emoji:love2]',
    { syntax: 'extended' }));            // -> Get AST.
```

```javascript
var parser = new Parser();
parser.parse('[chapter:見出し]本文[emoji:love2]', { syntax: 'extended' });

console.log(parser.tree);     // -> Get AST.
console.log(parser.toJSON()); // -> Output as JSON.
```

## AST (Abstract Syntax Tree)

  tagは決して入れ子になりませんので、ASTをtokenの配列として表します。

  See [test/test.js](test/test.js). It's written in [JSON Schema](http://json-schema.org).

## Contribute

See [CONTRIBUTING](CONTRIBUTING.md)

## Copyright

[Mozilla Public License, version 2.0](https://www.mozilla.org/MPL/2.0/)

> Copyright 2015 pixiv Inc., All Right Reserved.
>
> This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at [http://mozilla.org/MPL/2.0/](http://mozilla.org/MPL/2.0/).

### pixiv-novel-editor

`pixiv-novel-editor/src/app/index.js` is licensed under GPLv3.

> ```
> /**
>  * @license GPLv3 ne_Sachirou <utakata.c4se@gmail.com>
>  */
> ```
