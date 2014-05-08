(function (global) {
/* jshint maxstatements: 1000 */
'use strict';
var _inNode = 'process' in global;

if (_inNode) {
  module.exports = require('./parser');
} else {
  global.PixivNovelParser = global.PixivNovelParser || {};
}
}((this || 0).self || global));
