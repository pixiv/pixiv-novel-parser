(function (global) {
'use strict';
var _inNode = 'process' in global;
var JSV;
if (_inNode) {
  JSV = require('JSV').JSV;
} else {
  JSV = global.JSV;
}

function validateJSON(json, schema) {
  if (!_inNode) { return true; }
  var env = JSV.createEnvironment('json-schema-draft-03'),
      report = env.validate(json, schema),
      errors = report.errors;

  if (errors.length > 0) {
    console.error(errors);
    return false;
  }
  return true;
}

if (_inNode) {
  module.exports = {
    validateJSON: validateJSON
  };
} else {
  global.TestHelper = {
    validateJSON: validateJSON
  };
}
}((this || 0).self || global));
