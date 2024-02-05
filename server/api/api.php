<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );

if (isset($uri[2]) && $uri[2] == 'results') {
    require "./server/api/ResultsController.php";
    $controller = new ResultsController();
    $controller->listByCompetitor();
}
else {
    header("HTTP/1.1 404 Not Found");
    exit();
}