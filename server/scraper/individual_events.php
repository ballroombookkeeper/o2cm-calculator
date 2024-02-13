<?php

require_once "./server/simple_html_dom.php";

class Competition {
    public $name = "";
    public $id = "";
    public $date = "";
    public $events = array();
}


class CompetitionResult {
    public $placement;

    public $eventName;

    public $eventUrl;
}


function getPersonO2cmUrl(string $firstName, string $lastName): string {
    $url = "http://results.o2cm.com/individual.asp";
    $fnameFormName = "szFirst";
    $lnameFormName = "szLast";
    $url .= "?" . $lnameFormName . "=" . $lastName;
    $url .= "&" . $fnameFormName . "=" . $firstName;
    return $url;
}

function getPersonO2CMResults(string $firstName, string $lastName ) {
    $url = getPersonO2cmUrl($firstName, $lastName);
    $urlHTML = file_get_contents($url);
    if ($urlHTML === false) {
        return false;
    }
    return str_get_html($urlHTML);
}


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


/**
 * Returns
 * [
 *   {
 *      "name": "competition name",
 *      "date": "MM-DD-YY",
 *      "id": "abcYY",
 *      "events": [
 *        {
 *          "placement": 0,
 *          "name": "Amateur Age Level Event",
 *          "eventUrl": "http://..."
 *        },
 *        ...
 *      ]
 *   },
 *   ...
 * ]
 */
function get_events(string $firstName, string $lastName): array {
    // Fetch individual's historical results
    $personPage = getPersonO2CMResults($firstName, $lastName);
    if ($personPage === false) {
        // TODO: Need better return type
        echo "No results - there was an error fetching data from o2cm.";
        return array();
    }

    if (is_o2cm_500($personPage)) {
        // TODO: Better error handling
        return array();
    }

    $lastCompetition = new Competition();
    $competitionList = array();
    $compCount = 0;
    foreach($personPage->find("td[class=t1n]") as $resultRow) {
        $competitionHeaders = $resultRow->find("b");

        // Parsed row is a competition header
        if (sizeof($competitionHeaders) > 0) {
            $text = strtolower($competitionHeaders[0]->innertext);
            if (strpos($text, "no results") !== false) {
                // TODO: ERROR?
                return array();
            }
            else {
                if ($compCount > 0) {
                    if (sizeof($lastCompetition->events) > 0) {
                        array_push($competitionList, $lastCompetition);
                    }
                    $lastCompetition = new Competition();
                }
                $pattern = "/(\d\d\-\d\d\-\d\d) \- (.*)/";
                preg_match($pattern, $text, $matches, PREG_OFFSET_CAPTURE);
                $compName = $matches[2][0];
                $compDate = $matches[1][0];
                $lastCompetition->name = $compName;
                $lastCompetition->date = $compDate;
                $compCount += 1;
            }
        }
        // Parsed row is an event
        else if (sizeof($resultRow->find("a")) > 0) {
            $aTag = $resultRow->find("a")[0];
            $eventUrl = $aTag->href;
            $text = $aTag->innertext;

            // Skip "Combine" events
            $pattern = "/(\d+)\) (\-\- Combine \-\- )?(.+)/";
            preg_match($pattern, $text, $matches, PREG_OFFSET_CAPTURE);
            if (strpos($matches[2][0], "-- Combine --") !== false) {
              continue;
            }
            $placement = (int)$matches[1][0];

            $competitionResult = new CompetitionResult();
            $competitionResult->placement = $placement;

            // TODO: Remove placement from name
            $competitionResult->name = $text;
            $competitionResult->eventUrl = $eventUrl;
            array_push($lastCompetition->events, $competitionResult);
        }
    }
    if ($compCount > 0) {
        if (sizeof($lastCompetition->events) > 0) {
            array_push($competitionList, $lastCompetition);
        }
        $lastCompetition = new Competition();
    }

    // TODO: go through competitions and assign id based on first event's ID

    return $competitionList;
}