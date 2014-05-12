{
  function text(chars) {
    return { type: 'text', val: chars };
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
      pageNumber: pageNumber || null
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
      uri: uri
    };
  }
}

start = novel

novel = (tag / text)*

text = chars:$(([^[]+ / (&(!tag) '['))+) { return text(chars); }

tag = tagNewpage / tagChapter / tagPixivimage / tagJump / tagJumpuri

tagNewpage = '[newpage]' (CR / LF)? { return tagNewpage(); }

tagChapter =
  '[chapter:' title:chapterTitle ']' (CR / LF)? { return tagChapter(title); }

tagPixivimage =
  '[pixivimage:' illustID:numeric pageNumber:('-' integer)? ']' {
    return tagPixivimage(illustID, pageNumber && pageNumber[1]);
  }

tagJump = '[jump:' pageNumber:integer ']' { return tagJump(pageNumber); }

tagJumpuri =
  '[[jumpuri:' jumpuriTitle:jumpuriTitle '>' WSP* uri:URI WSP* ']]' {
    return tagJumpuri(jumpuriTitle, uri);
  }

chapterTitle = title:$([^\]]*) { return title.trim(); }

jumpuriTitle = title:$([^>]*) { return title.trim(); }

numeric = $(DIGIT+)

integer = digits:$(DIGIT+) { return parseInt(digits, 10); }

URI = uri:$(('http' 's'?)? '://' uri_chrs*) { return uri; }

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
