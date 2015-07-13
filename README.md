# pixiv-novel-parser

[pixiv novel](http://www.pixiv.net/novel/) parser powered by [PEG.js](http://pegjs.org/).

## Getting Started

### node.js

Once you installed [node.js](https://nodejs.org/), install with:

    $ npm install pixiv-novel-parser --save

And require it from your project:

```javascript
var Parser = require('pixiv-novel-parser').Parser;
Parser.parse('[chapter: pixiv[[rb:小説 > しょうせつ]]]');
```

### Web Browser

  Download the [ZIP Package][zip], or use [bower](http://bower.io):

    $ bower install pixiv-novel-parser --save

[zip]: https://github.com/pixiv/pixiv-novel-parser/archive/master.zip

And include it from HTML:

```html
<script src="dist/pixiv-novel-parser.min.js"></script>
<script>
  var Parser = PixivNovelParser.Parser;
  Parser.parse('[chapter:pixiv[[rb:小説>しょうせつ]]]');
</script>
```

## Compatibility

- IE 7+
- Firefox 29+
- Google Chrome 42+
- Opera 21+
- node.js 0.10+
- io.js 3
- PECL V8js 0.1.3

## API

### JavaScript API

Currently pixiv-novel-parser exports object with only one legal property `Parser`. This is JavaScript Class that can be used statically or dynamically.

#### Static Method

##### Parser.parse(text[, options])

Parse text into AST (Abstract Syntax Tree).

* **text**: (`String`) the text to parse
* **options**:
  - **syntax**: (`'basic'` or `'extended'`) Syntax used to parse text. `basic` is the only supported syntax and current compatible version with REAL pixiv novel environment.
* **Return**: [AST Object](#ast)

```javascript
console.log(Parser.parse('[chapter:見出し]本文[newpage]'));
```

Result:

```
[ { type: 'tag', name: 'chapter', title: [ [Object] ] },
  { type: 'text', val: '本文' },
  { type: 'tag', name: 'newpage' } ]
```

#### Dynamic Method / Property

##### parser.parse(text[, options])

Parse text into AST (Abstract Syntax Tree) and store the result.

* **text**: (`String`) the text to parse
* **options**:
  - **syntax**: (`'basic'` or `'extended'`) Syntax used to parse text. `basic` is the only supported syntax and current compatible version with REAL pixiv novel environment.
* **Return**: [AST Object](#ast)

```javascript
var parser = new Parser();
parser.parse('[chapter:見出し]本文[newpage]');
console.log(parser.tree);
```

##### parser.tree

Parsed AST Object

##### parser.toJSON()

Serialize parsed AST into JSON.

* **Return**: JSON string that represents AST

## AST

No docs here but approximately it's just an array of tokens. See [test/test.js](test/test.js).

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
