<?php

function is_o2cm_500($parsedPage): bool {
    // Can replicate with a bad request like https://results.o2cm.com/scoresheet3.asp?heatid=40422018
    /*
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"/>
    <title>500 - Internal server error.</title>
    <style type="text/css">
    </style>
    </head>
    <body>
    <div id="header"><h1>Server Error</h1></div>
    <div id="content">
    <div class="content-container"><fieldset>
    <h2>500 - Internal server error.</h2>
    <h3>There is a problem with the resource you are looking for, and it cannot be displayed.</h3>
    </fieldset></div>
    </div>
    </body>
    </html>
     */

    $headers = $parsedPage->find("div[id=header]");
    if (sizeof($headers) <= 0) {
        return false;
    }

    $header = $headers[0];
    if ($header && $header->innertext === "Server Error") {
        return true;
    }

    return false;
}