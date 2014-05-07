{
  function string(chars) {
    return chars.join('');
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
      uri: uri
    };
  }
}

start = novel

novel = (tags / text)*

text = chars:[^[]+ { return { type: 'text', val: string(chars) }; }

tags = tagNewpage / tagChapter / tagPixivimage / tagJump / tagJumpuri / tagNone

tagNewpage = '[newpage]' newline? { return tagNewpage(); }

tagChapter = '[chapter:' title:chapterTitle ']' { return tagChapter(title); }

tagPixivimage =
  '[pixivimage:' illustId:illustId ('-' pageNumber:pageNumber)? ']' {
    return tagPixivimage(illustId, pageNumber);
  }

tagJump = '[jump:' pageNumber:pageNumber ']' { return tagJump(pageNumber); }

tagJumpuri =
  '[[jumpuri:' jumpuriTitle:jumpuriTitle '>' uri:uri ']]' { return tagJumpuri(); }

tagNone = '[' { return { type: 'text', val: '[' } }

chapterTitle = title:[^\]]* { return string(title); }

illustId = numeric

pageNumber = integer

jumpuriTitle = title:[^>]* { return string(title); }

// RFC3986 Uniform Resource Identifier (URI): Generic Syntax
// RFC2616 Hypertext Transfer Protocol -- HTTP/1.1
uri = uri:([-A-Za-z0-9._~!$&'()*+,;=%:/@.?#]+) { return string(uri); }
/*
uri =
  uri:(uriScheme ':' uriHierPart ('?' uriQuery)? ('#' uriFragment)?) {
    return string(uri);
  }
uriScheme = scheme:('http' 's'? ':') { return string(scheme); }
uriHierPart =
  hierPart:('//' uriAuthority uriPathAbempty) { return string(hierPart); }
uriQuery = query:((uriPchar / '/' / '?')+) { return string(query); }
uriFragment = fragment:((uriPchar / '/' / '?')+) { return string(fragment); }
uriAuthority =
  authority:((uriUserinfo '@')? uriHost (':' uriPort)?) {
    return string(authority);
  }
uriPathAbempty = .
uriUserinfo =
  userinfo:((uriUnreserved / uriPctEncoded / uriSubDelims / ':')+) {
    return string(userinfo);
  }
uriHost = uriIPLiteral / uriIPv4address / uriRegName
uriPort = numeric
uriIPLiteral =
  IPLiteral:('[' ( uriIPv6address / uriIPvFuture  ) ']') {
    return string(IPLiteral);
  }
uriIPv4address =
  IPv4address(uriDecOctet '.' uriDecOctet '.' uriDecOctet '.' uriDecOctet) {
    return string(IPv4address);
  }
uriIPv6address =                            6( h16 ":" ) ls32
               /                       "::" 5( h16 ":" ) ls32
               / [               h16 ] "::" 4( h16 ":" ) ls32
               / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
               / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
               / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
               / [ *4( h16 ":" ) h16 ] "::"              ls32
               / [ *5( h16 ":" ) h16 ] "::"              h16
               / [ *6( h16 ":" ) h16 ] "::"
uriIPvFuture = 'v' 1*HEXDIG '.' 1*( unreserved / sub-delims / ':' )
uriRegName =
  regName:((uriUnreserved / uriPctEncoded / uriSubDelims)+) {
    return string(regName);
  }
uriPchar = uriUnreserved / uriPctEncoded / uriSubDelims / ':' / '@'
uriUnreserved = [-A-Za-z0-9._~]
uriPctEncoded = pctEncoded:('%' [0-9]+) { return string(pctEncoded); }
uriSubDelims = [!$&'()*+,;=]
*/

newline = '\r'? '\n'

numeric = digits:[0-9]+ { return string(digits); }

integer = digits:[0-9]+ { return parseInt(string(digits), 10); }
// vim: ft=javasctipt:
