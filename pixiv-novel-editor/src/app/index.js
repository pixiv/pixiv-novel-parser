/**
 * @license GPLv3 ne_Sachirou <utakata.c4se@gmail.com>
 */
'use strict';
var fs = require('fs'),
    path = require('path'),
    url = require('url');
var Promise = require('bluebird');

/**
 * @param {Object} dest
 * @param {Object} src
 * @return {Object}
 */
function mixin(dest, src, doseOverride) {
  var key, keys,
      i = 0,
      iz = 0;

  if (!src) { return dest; }
  try {
    keys = Object.keys(src);
  } catch (err) {
    return dest;
  }
  for (i = 0, iz = keys.length; key = keys[i], i < iz; ++i) {
    if (!doseOverride || !dest[key]) {
      dest[key] = src[key];
    }
  }
  return dest;
}

/**
 * @constructor
 * @param {Object.<string,Object>} options
 */
function App(options) {
  if (options === void 0) { options = {}; }
  this._controllers = [];
}

/**
 * @param {http.ClientRequest} request
 * @param {http.ServerResponse} response
 * @return {Promise.<App>}
 */
App.prototype.transact = function (request, response) {
  var _this = this,
      params = this.params(request);

  console.log([new Date().toISOString(), request.method, params.pathname]);
  try {
    return this.route(request).call(this, request, response).catch(function (err) {
        var code;

        console.log(err);
        if (err + 0 === err) {
          code = err;
        } else {
          code = 500;
        }
        _this.error(code, err, response);
    });
  } catch (err) {
    console.log(err);
    this.error(500, err, response);
  }
};

/**
 * @param {http.ClientRequest} request
 * @return {Object.<string,Object>}
 */
App.prototype.params = function (request) {
  var params = {},
      urlParts = url.parse(request.url, true),
      query = urlParts.query,
      pathname = urlParts.pathname,
      filename = path.join(process.cwd(), pathname);

  params = mixin(params, {
    pathname: pathname,
    filename: filename
  });
  if (query) { params = mixin(params, query); }
  return params;
};

/**
 * @param {http.ClientRequest|string}
 * @param {?function(http.ClientRequest, http.ServerResponse):Promise.<App>}
 * @param {?Object.<string,Object>}
 * @return {function(http.ClientRequest, http.ServerResponse):Promise.<App>|App}
 */
App.prototype.route = function (/* request */ /* path, callback, options */) {
  /**
   * @param {http.ClientRequest} request
   * @return {function(http.ClientRequest, http.ServerResponse):Promise.<App>}
   */
  function routeToController(request) {
    var controller,
        params = this.params(request);

    controller = this._controllers.filter(function (controller) {
      return controller[0] === params.pathname &&
        controller[2].method.indexOf(request.method) >= 0;
    })[0];
    if (controller) {
      return controller[1];
    }
    return this.sendFile.bind(this, params.filename);
  }

  /**
   * @param {string} path
   * @param {function(http.ClientRequest, http.ServerResponse):Promise.<App>} callback
   * @param {Object.<string,Object>} options
   * @return {App}
   */
  function registerRoute(path, callback, options) {
    options = {
      method: options.method.map(function (method) { return method.toUpperCase(); })
    };
    this._controllers.push([path, callback, options]);
    return this;
  }

  if (arguments.length === 1) {
    return routeToController.apply(this, arguments);
  }
  return registerRoute.apply(this, arguments);
};

/**
 * @params {string} path
 * @param {function(http.ClientRequest, http.ServerResponse):Promise.<App>} callback
 * @return {App}
 */
App.prototype.get = function (path, callback) {
  this.route(path, callback, { method: ['get'] });
};

/**
 * @param {?number} code
 * @param {?Error} err
 * @param {http.ServerResponse} response
 * @return {App}
 */
App.prototype.error = function (code, err, response) {
  switch (code) {
    case 404:
      err = '404 Not Found';
      break;
    default:
      code = 500;
  }
  response.writeHead(code, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify({ error: err.toString() }));
  response.end();
  return this;
};

/**
 * @param {string} filename
 * @param {http.ServerResponse} response
 * @return {Promise.<App>}
 */
App.prototype.sendFile = function (filename, request, response) {
  var contentType = '',
      _this = this;

  function detectContentType(filename) {
    var match = filename.match(/\.([^\.]+)$/);

    if (!match) { return 'text/plain'; }
    switch (match[1].toLowerCase()) {
      case 'html':
        return 'text/html';
      case 'js':
        return 'application/javascript';
      case 'css':
        return 'text/css';
      case 'jpg': case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
    }
    return 'text/plain';
  }

  contentType = detectContentType(filename);
  return new Promise(function (resolve, reject) {
    fs.exists(filename, function (isExists) {
      if (! isExists) { return reject(404); }
      fs.stat(filename, function (err, stat) {
        if (err) { return reject(err); }
        if (stat.isDirectory()) {
          return _this.
            sendFile(path.join(filename, 'index.html'), request, response).
            then(resolve);
        }
        response.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filename).
          pipe(response);
        resolve(_this);
      });
    });
  });
};

module.exports = App;
