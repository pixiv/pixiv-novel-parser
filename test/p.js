'use strict';
// pegjs src\parser.pegjs src\parser.peg.js && node test\p.js
var Parser = require('../src');
var p;

p = new Parser();
p.parse([
'1ぺーじ',
'[jump:4]',
'[newpage]',
'2ぺーじ',
'[jump:3]',
'[newpage]',
'3ぺーじ',
'[jump:^1]',
'[newpage]',
'4ぺーじ',
'[jump:^1]',
'[jump:02]'
].join(''));
console.log(p.tree);
console.log(p.toHTML());

p = new Parser();
p.parse([
'章タイトルの中に [‌newpage]',
'1 [‌chapter:[n‌ewpage]]',
'[newpage]',
'1 [chapter:[newpage]]',
'[newpage]',
'2 [‌chapter‌:ふつうの章タイトル]',
'[newpage]',
'2 [chapter:ふつうの章タイトル]',
'[newpage]',
'章タイトルの中に小説内リンク',
'3 [‌chapter:[‌jump:1]]',
'[newpage]',
'3 [chapter:[jump:1]]',
'[newpage]',
'4 [‌chapter:[‌[jumpuri:章タイトルの中に小説外リンク4 &gt; http://pixiv.me]‌]]',
'[newpage]',
'4 [chapter:[[jumpuri:章タイトルの中に小説外リンク4 &gt; http://pixiv.me]]]',
'[newpage]',
'5 [‌[jump‌uri:[chap‌ter:小説外リンクの中に章タイトル] &gt; http://pixiv.me]‌]',
'[newpage]',
'5 [[jumpuri:[chapter:小説外リンクの中に章タイトル] &gt; http://pixiv.me]]',
'[newpage]',
'6‌ [‌cha‌pter‌:[‌[jumpuri‌:[‌‌[j‌umpur‌i:[‌chapter‌:章タイトルの中に小説外リンクの中に小説タイトルの中に章タイトル] &gt; http://pixiv.me]‌] &gt; http://pixiv.me]‌‌]]',
'[newpage]',
'6 [chapter:[[jumpuri:[‌[jumpuri:[‌‌c‌h‌a‌pter‌‌:章タイトルの中に小説外リンクの中に小説タイトルの中に章タイトル] &gt; http://pixiv.me]] &gt; http://pixiv.me]]]',
'[newpage]',
'7 [chapter:をはり]',
'[newpage]  '
].join('\n'));
console.log(p.tree);
console.log(p.toHTML());
