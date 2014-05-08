'use strict';
var assert = require('assert');
var Parser = require('../src');

describe('Parser', function () {
  describe('test tadsan\'s novel.', function () {
    it('Correct in テストの冒険', function () {
      var novel = [
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
          ].join('\n'),
          parser = new Parser();

      parser.parse(novel);
      assert.deepEqual(parser.toHTML(), [
'1ぺーじ<a href="#4">4ページへ</a>',
'2ぺーじ<a href="#3">3ページへ</a>',
'3ぺーじ<br/>[jump:^1]',
'4ぺーじ<br/>[jump:^1]<a href="#2">2ページへ</a>'
      ]);
    });

    it('Correct in 見出しの冒険', function () {
      var novel = [
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
          ].join('\n'),
          parser = new Parser();

      parser.parse(novel);
      assert.deepEqual(parser.toHTML(), [
'章タイトルの中に [‌newpage]<br/>1 [‌chapter:[n‌ewpage]]',
'1<p class="chapter">[newpage</p>]',
'2 [‌chapter‌:ふつうの章タイトル]',
'2<p class="chapter">ふつうの章タイトル</p>',
'章タイトルの中に小説内リンク<br/>3 [‌chapter:[‌jump:1]]',
'3<p class="chapter">[jump:1</p>]',
'4 [‌chapter:[‌[jumpuri:章タイトルの中に小説外リンク4 &amp;gt; http://pixiv.me]‌]]',
'4<p class="chapter">[[jumpuri:章タイトルの中に小説外リンク4 &amp;gt; http://pixiv.me</p>]]',
'5 [‌[jump‌uri:[chap‌ter:小説外リンクの中に章タイトル] &amp;gt; http://pixiv.me]‌]',
'5 [[jumpuri:<p class="chapter">小説外リンクの中に章タイトル</p>&amp;gt; http://pixiv.me]]',
'6‌ [‌cha‌pter‌:[‌[jumpuri‌:[‌‌[j‌umpur‌i:[‌chapter‌:章タイトルの中に小説外リンクの中に小説タイトルの中に章タイトル] &amp;gt; http://pixiv.me]‌] &gt; http://pixiv.me]‌‌]]',
'6<p class="chapter">[[jumpuri:[‌[jumpuri:[‌‌c‌h‌a‌pter‌‌:章タイトルの中に小説外リンクの中に小説タイトルの中に章タイトル</p>&amp;gt; http://pixiv.me]] &gt; http://pixiv.me]]]',
'7<p class="chapter">をはり</p>',
''
      ]);
    });
  });
});
