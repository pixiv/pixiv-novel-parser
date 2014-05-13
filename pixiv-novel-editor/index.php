<?php
$filename = __DIR__ . preg_replace('#(\?.*)$#', '', $_SERVER['REQUEST_URI']);
if (php_sapi_name() === 'cli-server' && is_file($filename)) { return false; }

require 'vendor/autoload.php';

$v8 = new V8Js;

if ($_SERVER['REQUEST_URI'] === '/') {
    header('Content-Type: text/html');
    echo file_get_contents('public/index.html');
    return;
}

if ($_SERVER['PHP_SELF'] === '/api/0.0/build_novel') {
    $novel = isset($_GET['novel']) ? $_GET['novel'] : '';
    $novel = preg_replace("/'/", "\\'", $novel);
    $novel = preg_replace('/\n/', '\\n', $novel);
    $js = <<< JS
var parser = new PixivNovelParser.Parser({ syntax: 'extended' }),
    builder = new PixivNovelParser.Builder();

builder.build(parser.parse('{$novel}').tree).toHTML();
JS;
    $js = "var global = this;\n" .
        file_get_contents('public/bower_components/pixiv-novel-parser/build/pixiv-novel-parser.min.js') . "\n" .
        file_get_contents('src/builder.js') . "\n" .
        $js;
    try {
        $response = $v8->executeString($js);
    } catch (V8JsException $e) {
        http_response_code(502);
        header('Content-Type: application/json');
        echo json_encode([ 'error' => $e->getMessage() ]);
        return;
    }
    header('Content-Type: text/html');
    echo $response;
    return;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode([ 'error' => 'Not Found' ]);
