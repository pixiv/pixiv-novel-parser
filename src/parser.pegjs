{
  function string(chars) {
    if (!chars) { return ''; }
    if (Object.prototype.toString.call(chars) === '[object String]') {
      return chars;
    }
    chars = chars.reduce(function (str, chr) {
      if (Object.prototype.toString.call(chr) === '[object Array]') {
        chr = string(chr);
      }
      return str + (chr || '').toString();
    }, '');
    return chars.replace(/\r?\n/g, '\n').
      replace(/[\s\u200c]/g, function (c) {
        if (c === '\n' || c === '\u3000') { return c; }
        return ' ';
      });
  }

  function tagNewpage() {
    return { type: 'tag', name: 'newpage' };
  }

  function tagChapter(title) {
    return { type: 'tag', name: 'chapter', title: title };
  }

  function tagPixivimage(illustID, pageNumber) {
    return {
      type: 'tag',
      name: 'pixivimage',
      illustID: illustID,
      pageNumber: pageNumber
    };
  }

  function tagJump(pageNumber) {
    return {
      type: 'tag',
      name: 'jump',
      pageNumber: pageNumber
    };
  }

  function tagJumpuri(title, uri) {
    return {
      type: 'tag',
      name: 'jumpuri',
      title: title,
      uri: string(uri)
    };
  }
}

start = novel

novel = (tags / text)*

text = chars:[^[]+ { return { type: 'text', val: string(chars) }; }

tags = tagNewpage / tagChapter / tagPixivimage / tagJump / tagJumpuri / tagNone

tagNewpage = '[newpage]' CRLF? { return tagNewpage(); }

tagChapter = '[chapter:' title:chapterTitle ']' { return tagChapter(title); }

tagPixivimage =
  '[pixivimage:' illustID:numeric pageNumber:('-' integer)? ']' {
    return tagPixivimage(illustID, pageNumber && pageNumber[1]);
  }

tagJump = '[jump:' pageNumber:integer ']' { return tagJump(pageNumber); }

tagJumpuri =
  '[[jumpuri:' jumpuriTitle:jumpuriTitle '>' WSP* uri:URI WSP* ']]' {
    return tagJumpuri(jumpuriTitle, uri);
  }

tagNone = '[' { return { type: 'text', val: '[' } }

chapterTitle = title:[^\]]* { return string(title).trim(); }

jumpuriTitle = title:[^>]* { return string(title).trim(); }

numeric = digits:DIGIT+ { return string(digits); }

integer = digits:DIGIT+ { return parseInt(string(digits), 10); }

URI = uri:('http' 's'? '://' uri_chrs*) { return string(uri); }

uri_chrs = ALPHA / DIGIT / ('%' HEXDIG+) / [-._~!$&'()*+,;=:/@.?#]

// {{{ https://github.com/for-GET/core-pegjs/blob/master/src/ietf/rfc5234-core-abnf.pegjs
/*
 * Augmented BNF for Syntax Specifications: ABNF
 *
 * http://tools.ietf.org/html/rfc5234
 */

/* http://tools.ietf.org/html/rfc5234#appendix-B Core ABNF of ABNF */
ALPHA
  = [\x41-\x5A]
  / [\x61-\x7A]

BIT
  = "0"
  / "1"

CHAR
  = [\x01-\x7F]

CR
  = "\x0D"

CRLF
  = CR LF

CTL
  = [\x00-\x1F]
  / "\x7F"

DIGIT
  = [\x30-\x39]

DQUOTE
  = [\x22]

HEXDIG
  = DIGIT
  / "A"
  / "B"
  / "C"
  / "D"
  / "E"
  / "F"

HTAB
  = "\x09"

LF
  = "\x0A"

LWSP
  = $(WSP / CRLF WSP)*

OCTET
  = [\x00-\xFF]

SP
  = "\x20"

VCHAR
  = [\x21-\x7E]

WSP
  = SP
  / HTAB
// }}}

// vim:set ft=javascript fdm=marker:
