{
  function string(chars) {
    if (!chars) { return ''; }
    if (Object.prototype.toString.call(chars) === '[object String]') {
      return chars;
    }
    return chars.reduce(function (str, chr) {
      if (Object.prototype.toString.call(chr) === '[object Array]') {
        chr = string(chr);
      }
      return str + (chr || '').toString();
    }, '');
  }

  function tagNewpage() {
    return { type: 'tag', name: 'newpage' };
  }

  function tagChapter(title) {
    return { type: 'tag', name: 'chapter', title: title };
  }

  function tagPixivimage(illustId, pageNumber) {
    return {
      type: 'tag',
      name: 'pixivimage',
      illustId: illustId,
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
  '[pixivimage:' illustId:illustId ('-' pageNumber:pageNumber)? ']' {
    return tagPixivimage(illustId, pageNumber);
  }

tagJump = '[jump:' pageNumber:pageNumber ']' { return tagJump(pageNumber); }

tagJumpuri =
  '[[jumpuri:' jumpuriTitle:jumpuriTitle '>' WSP* uri:URI WSP* ']]' { return tagJumpuri(jumpuriTitle, uri); }

tagNone = '[' { return { type: 'text', val: '[' } }

chapterTitle = title:[^\]]* { return string(title).trim(); }

illustId = numeric

pageNumber = integer

jumpuriTitle = title:[^>]* { return string(title).trim(); }

numeric = digits:DIGIT+ { return string(digits); }

integer = digits:DIGIT+ { return parseInt(string(digits), 10); }

// {{{ https://github.com/for-GET/core-pegjs/blob/80baf4a0ee0f5f332dfaeea1353daec857f9aee3/src/ietf/rfc5234-core-abnf.pegjs
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

// {{{ URI https://github.com/for-GET/core-pegjs/blob/master/src/ietf/rfc3986-uri.pegjs
/*
 * Uniform Resource Identifier (URI): Generic Syntax
 *
 * http://tools.ietf.org/html/rfc3986
 *
 * <host> element has been renamed to <hostname> as a dirty workaround for
 * element being re-defined with another meaning in HTTPbis
 *
 * @append ietf/rfc5234-core-abnf.pegjs
 */

/* http://tools.ietf.org/html/rfc3986#section-2.1 Percent-Encoding */
pct_encoded
  = $("%" HEXDIG HEXDIG)


/* http://tools.ietf.org/html/rfc3986#section-2.2 Reserved Characters */
reserved
  = gen_delims
  / sub_delims

gen_delims
  = ":"
  / "/"
  / "?"
  / "#"
  / "["
  / "]"
  / "@"

sub_delims
  = "!"
  / "$"
  / "&"
  / "'"
  / "("
  / ")"
  / "*"
  / "+"
  / ","
  / ";"
  / "="


/* http://tools.ietf.org/html/rfc3986#section-2.3 Unreserved Characters */
unreserved
  = ALPHA
  / DIGIT
  / "-"
  / "."
  / "_"
  / "~"


/* http://tools.ietf.org/html/rfc3986#section-3 Syntax Components */
URI
  = scheme ":" hier_part ("?" query)? ("#" fragment)?

hier_part
  = "//" authority path_abempty
  / path_absolute
  / path_rootless
  / path_empty


/* http://tools.ietf.org/html/rfc3986#section-3.1 Scheme */
scheme
  = $(ALPHA (ALPHA / DIGIT / "+" / "-" / ".")*)


/* http://tools.ietf.org/html/rfc3986#section-3.2 Authority */
// CHANGE host to hostname
authority
  = (userinfo "@")? hostname (":" port)?


/* http://tools.ietf.org/html/rfc3986#section-3.2.1 User Information */
userinfo
  = $(unreserved / pct_encoded / sub_delims / ":")*


/* http://tools.ietf.org/html/rfc3986#section-3.2.2 Host */
// CHANGE host to hostname
// CHANGE Add forward check for reg_name
hostname
  = IP_literal !reg_name_item_
  / IPv4address !reg_name_item_
  / reg_name

IP_literal
  = "[" (IPv6address / IPvFuture) "]"

IPvFuture
  = "v" $(HEXDIG+) "." $( unreserved
                        /*
                        // CHANGE Ignore due to https://github.com/for-GET/core-pegjs/issues/8
                        / sub_delims
                        */
                        / ":"
                        )+

IPv6address
  = $(                                                            h16_ h16_ h16_ h16_ h16_ h16_ ls32
     /                                                       "::"      h16_ h16_ h16_ h16_ h16_ ls32
     / (                                               h16)? "::"           h16_ h16_ h16_ h16_ ls32
     / (                               h16_?           h16)? "::"                h16_ h16_ h16_ ls32
     / (                         (h16_ h16_?)?         h16)? "::"                     h16_ h16_ ls32
     / (                   (h16_ (h16_ h16_?)?)?       h16)? "::"                          h16_ ls32
     / (             (h16_ (h16_ (h16_ h16_?)?)?)?     h16)? "::"                               ls32
     / (       (h16_ (h16_ (h16_ (h16_ h16_?)?)?)?)?   h16)? "::"                               h16
     / ( (h16_ (h16_ (h16_ (h16_ (h16_ h16_?)?)?)?)?)? h16)? "::"
     )

ls32
  // least_significant 32 bits of address
  = h16 ":" h16
  / IPv4address

h16_
  = h16 ":"

h16
  // 16 bits of address represented in hexadecimal
  = $(HEXDIG (HEXDIG (HEXDIG HEXDIG?)?)?)

IPv4address
  = $(dec_octet "." dec_octet "." dec_octet "." dec_octet)

// CHANGE order in reverse for greedy matching
dec_octet
  = $( "25" [\x30-\x35]      // 250-255
     / "2" [\x30-\x34] DIGIT // 200-249
     / "1" DIGIT DIGIT       // 100-199
     / [\x31-\x39] DIGIT     // 10-99
     / DIGIT                 // 0-9
     )

reg_name
  = $reg_name_item_*
reg_name_item_
  = unreserved
  / pct_encoded
  /*
  // CHANGE Ignore due to https://github.com/for-GET/core-pegjs/issues/8
  / sub_delims
  */


/* http://tools.ietf.org/html/rfc3986#section-3.2.3 Port */
port
  = $(DIGIT*)


/* http://tools.ietf.org/html/rfc3986#section-3.3 Path */
path
  = path_abempty  // begins with "/" or is empty
  / path_absolute // begins with "/" but not "//"
  / path_noscheme // begins with a non_colon segment
  / path_rootless // begins with a segment
  / path_empty    // zero characters

path_abempty
  = $("/" segment)*

path_absolute
  = $("/" (segment_nz ("/" segment)*)?)

path_noscheme
  = $(segment_nz_nc ("/" segment)*)

path_rootless
  = $(segment_nz ("/" segment)*)

path_empty
  = ""

segment
  = $(pchar*)

segment_nz
  = $(pchar+)

segment_nz_nc
  // non_zero_length segment without any colon ":"
  = $(unreserved / pct_encoded / sub_delims / "@")+

pchar
  = unreserved
  / pct_encoded
  / sub_delims
  / ":"
  / "@"


/* http://tools.ietf.org/html/rfc3986#section-3.4 Query */
query
  = $(pchar / "/" / "?")*


/* http://tools.ietf.org/html/rfc3986#section-3.5 Fragment */
fragment
  = $(pchar / "/" / "?")*


/* http://tools.ietf.org/html/rfc3986#section-4.1 URI Reference */
URI_reference
  = URI
  / relative_ref


/* http://tools.ietf.org/html/rfc3986#section-4.2 Relative Reference */
relative_ref
  = relative_part ("?" query)? ("#" fragment)?

relative_part
  = "//" authority path_abempty
  / path_absolute
  / path_noscheme
  / path_empty


/* http://tools.ietf.org/html/rfc3986#section-4.3 Absolute URI */
absolute_URI
  = scheme ":" hier_part ("?" query)?
// }}}
// vim:set ft=javascript fdm=marker:
