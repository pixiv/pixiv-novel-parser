var fs = require('fs'),
    http = require('http');

function getHTML(callback) {
  var request,
      url = 'http://www.pinterest.com/nesachirou/momonga/';

  request = http.get(url, function (response) {
    var body = '';

    response.setEncoding('utf8');
    response.on('data', function (chunk) { body += chunk; });
    response.on('end', function () { callback(body); });
  });
  request.on('error', function (err) {
    console.error(err);
  });
  request.setTimeout(6000, function () {
    console.error(new Error('Request timeout.'));
    request.abort();
  });
  request.end();
}

getHTML(function (response) {
  var image,
      images = {},
      regex = /http:\/\/media-cache-\w+?\.pinimg\.com\/[-_\w\/]+?\.jpg/g;

  while ((image = regex.exec(response)) !== null) {
    if (images[image[0]]) { continue; }
    images[image[0]] = true;
  }
  fs.writeFile('momonga.json',
    JSON.stringify({ images: Object.keys(images) }),
    function (err) {
      if (err) { return console.error(err); }
      console.log('OK.');
    });
});
