'use strict';

/* global self */

var root = {};

if (typeof self === 'object' && self.self === self) {
	root = self;
} else if (typeof global === 'object' && global.global === global) {
	root = global;
} else {
	root = this;
}

root.PixivNovelParser = require('./');
