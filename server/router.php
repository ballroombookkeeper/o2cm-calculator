<?php

function get_mime_content_type(string $uri): string {
    $ext = pathinfo($uri, PATHINFO_EXTENSION);

    $mime_types_map = array(
        "css" => "text/css",
        "js" => "text/javascript",
        "png" => "image/png",
        "jpg" => "image/jpeg",
        "jpeg" => "image/jpeg",
        "json" => "application/json",
        "map" => "application/json",
        "ico" => "image/x-icon",
        "txt" => "text/plain",
        "text" => "text/plain",
        "html" => "text/html",
        "htm" => "text/html",
        "shtml" => "text/html",
    );

    if (array_key_exists($ext, $mime_types_map)) {
        $mime = $mime_types_map[$ext];
    }

    if ($mime != false) {
        return $mime;
    }

    $mime = mime_content_type($uri);
    if ($mime != false) {
        return $mime;
    }

    return "";
}

function main(): bool {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $uri_split = explode('/', $uri);
    $path_info = pathinfo($uri);

    if ((isset($uri_split[1]) && $uri_split[1] == 'api')) {
        require "./server/api/api.php";
    }
    else if (strlen($uri) > 1) {
        $path_to_include = "./client/build" . $uri;
        $mime = get_mime_content_type($uri);
        if (strlen($mime) > 0) {
            header("Content-type: " . $mime);
        }
        readfile($path_to_include);
    }
    else {
        require "./client/build/index.html";
    }
    return true;
}

return main();