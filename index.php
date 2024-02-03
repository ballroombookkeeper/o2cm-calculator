<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_exploded = explode('/', $uri);

if ((isset($uri_exploded[1]) && $uri_exploded[1] == 'api')) {
    echo "Welcome to the API";
}
else {
    include "./pages/home.php";    
}
