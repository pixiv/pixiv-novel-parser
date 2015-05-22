{
  function serialize(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
      if (typeof array[i] === 'object') {
        ret = ret.concat(serialize(array[i]));
      } else {
        ret.push(array[i]);
      }
    }
    return ret;
  }

  function trim(string) {
    return string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  }

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

  function tagRuby(rubyBase, rubyText) {
    return {
      type: 'tag',
      name: 'rb',
      rubyBase: rubyBase,
      rubyText: rubyText
    };
  }

// {{{!Extended

  function tagEmoji(emojiName) {
    return {
      type: 'tag',
      name: 'emoji',
      emojiName: emojiName
    };
  }

  function tagStrong(chars) {
    return {
      type: 'tag',
      name: 'strong',
      val: chars
    };
  }
// }}}!Extended
}

start = novel

novel = (tag / text)*

text = chars:(([^\[]+ / (&(!tag) '['))+) {
  var ret = '';
  for (var i = 0; i < chars.length; i++) {
    ret += chars[i].join('');
  }
  return text(ret);
}

inlineText = chars:(([^\[\]]+ / (&(!inlineTag) '['))+) {
  return text(trim(serialize(chars).join('')));
}

inlineToken = inlineTag / inlineText
inlineTokens = inlineToken+

inlineInlineText = chars:(([^\[>]+ &(!']]') / (&(!inlineTag) '['))+) {
  return text(trim(serialize(chars).join('')));
}

inlineInlineToken = inlineTag / inlineInlineText
inlineInlineTokens = inlineInlineToken+

inlineTag = tagRuby

tag = tagNewpage / tagChapter / tagPixivimage / tagJump / tagJumpuri / tagRuby
// {{{!Extended
  / tagEmoji / tagStrong
// }}}!Extended

tagNewpage = '[newpage]' (CR / LF)? { return tagNewpage(); }

tagChapter =
  '[chapter:' title:inlineTokens ']' (CR / LF)? { return tagChapter(title); }

tagPixivimage =
  '[pixivimage:' illustID:numeric pageNumber:('-' integer)? ']' {
    return tagPixivimage(illustID, pageNumber && pageNumber[1]);
  }

tagJump = '[jump:' pageNumber:integer ']' { return tagJump(pageNumber); }

tagJumpuri =
  '[[jumpuri:' jumpuriTitle:inlineInlineTokens '>' WSP* uri:URI WSP* ']]' {
    return tagJumpuri(jumpuriTitle, uri);
  }

chapterTitle = title:[^\]]* { return trim(title.join('')); }

jumpuriTitle = title:[^>]* { return trim(title.join('')); }

numeric = digits:DIGIT+ { return digits.join(''); }

integer = digits:DIGIT+ { return parseInt(digits.join(''), 10); }

URI = scheme:('http' 's'? '://') chars:uri_chrs* { return scheme.join('') + chars.join(''); }

uri_chrs = ALPHA / DIGIT / ('%' HEXDIG+) / [-._~!$&'()*+,;=:/@.?#]

tagRuby =
  '[[rb:' rubyBase:[^>]* '>' rubyText:([^\]]+ / ']' &(!']'))* ']]' {
    return tagRuby(trim(rubyBase.join('')), trim(serialize(rubyText).join('')));
  }

// {{{!Extended
tagEmoji = '[emoji:' emojiName:emojiName ']' { return tagEmoji(emojiName); }

tagStrong = '[strong:' chars:[^\]]* ']' { return tagStrong(trim(chars.join(''))); }

emojiName = name:(ALPHA / DIGIT /  '-')+ { return trim(name.join('')); }
// }}}!Extended

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
  = (WSP / CRLF WSP)*

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
