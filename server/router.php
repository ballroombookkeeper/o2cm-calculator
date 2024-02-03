<?php

function is_asset(string $uri): bool {
    return preg_match('/\.(?:png|jpg|jpeg|gif|css)$/', $uri);
}

function main(): bool {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $uri_split = explode('/', $uri);
    $path_info = pathinfo($uri);

    if ((isset($uri_split[1]) && $uri_split[1] == 'api')) {
        echo "Welcome to the API";
    }
    else if (strlen($uri) > 1) {
        $path_to_include = "./client/build" . $uri;
        header("Content-type: " . mime_content_type($uri));
        readfile($path_to_include);
    }
    else {
        include "./client/build/index.html";
    }
    return true;
}

return main();