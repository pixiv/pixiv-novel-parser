'use strict';
var http = require('http'),
    fs = require('fs');
var less = require('less'),
    Promise = require('bluebird');
var App = require('./src/app'),
    Builder = require('./src/builder').Builder,
    Parser = require('pixiv-novel-parser').Parser;
var app = new App(),
    builder = new Builder(),
    parser = new Parser();

/**
 * @param {string} filename
 * @return {Promise.<string>}
 */
function renderLess(filename) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filename, { encoding: 'utf8' }, function (err, data) {
      if (err) { return reject(err); }
      try {
        less.render(data, function (err, css) {
          if (err) { return reject(err); }
          fs.writeFile(filename.replace(/\.less$/, '.css'), css, function (err) {
            if (err) { console.error(err); }
            resolve(css);
          });
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

app.get('/', function (request, response) {
  return this.sendFile('public/index.html', request, response);
});

app.get('/public/index.css', function (request, response) {
  var _this = this,
      params = this.params(request);

  return renderLess(params.filename.replace(/\.css$/, '.less'))
    .then(function (css) {
      response.writeHead(200, { 'Content-Type': 'text/css' });
      response.write(css);
      response.end();
      return _this;
    });
});

app.get('/api/0.0/build_novel', function (request, response) {
  var _this = this,
      params = this.params(request);

  params.novel = params.novel || '';
  return new Promise(function (resolve, reject) {
    var html;
    try {
      html = builder.build(parser.parse(params.novel).tree).toHTML();
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.write(html);
      response.end();
      resolve(_this);
    } catch (err) {
      reject(err);
    }
  });
});

http.createServer(app.transact.bind(app)).listen(3000);
console.log('Listening port 3000.');
