<?php

function route_api_request() {
    $uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
    $uri = explode( "/", $uri );

    if (isset($uri[2]) && $uri[2] == "o2cm") {
        if (isset($uri[3]) && $uri[3] == "results") {
            require "./server/api/ResultsController.php";
            $controller = new ResultsController();
            $controller->listByCompetitor();
            return;
        }
    }

    header("HTTP/1.1 404 Not Found");
    exit();
}

route_api_request();