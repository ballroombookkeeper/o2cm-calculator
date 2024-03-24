<?php

require_once "./server/simple_html_dom.php";
require_once "./server/scraper/o2cm_common.php";

class Competition {
    public $name = "";
    public $id = "";
    public $date = "";
    public $events = array();
}


class CompetitionResult {
    public $placement;

    public $name;

    public $eventUrl;
}


function getPersonO2cmUrl(string $firstName, string $lastName): string {
    $url = "http://results.o2cm.com/individual.asp";
    $url .= "?szLast=" . str_replace("'", "`", str_replace(" ", "+", $lastName));
    $url .= "&szFirst=" . str_replace("'", "`", str_replace(" ", "+", $firstName));
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
            $text = $competitionHeaders[0]->innertext;
            $lowerText = strtolower($text);
            if (strpos($lowerText, "no results") !== false) {
                // TODO: ERROR?
                return array();
            }
            else {
                if ($compCount > 0) {
                    if (sizeof($lastCompetition->events) > 0) {
                        // TODO: Use real query parsing, not regex
                        $pattern = "/event=([a-zA-Z]+\d+)/";
                        preg_match($pattern, $lastCompetition->events[0]->eventUrl, $matches, PREG_OFFSET_CAPTURE);
                        $lastCompetition->id = $matches[1][0];
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
            $competitionResult->name = $matches[3][0];
            $competitionResult->eventUrl = $eventUrl;
            array_push($lastCompetition->events, $competitionResult);
        }
    }
    if ($compCount > 0) {
        if (sizeof($lastCompetition->events) > 0) {
            // TODO: Use real query parsing, not regex
            $pattern = "/event=([a-zA-Z]+\d+)/";
            preg_match($pattern, $lastCompetition->events[0]->eventUrl, $matches, PREG_OFFSET_CAPTURE);
            $lastCompetition->id = $matches[1][0];
            array_push($competitionList, $lastCompetition);
        }
        $lastCompetition = new Competition();
    }

    return $competitionList;
}