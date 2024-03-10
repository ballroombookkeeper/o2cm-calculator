<?php

require_once "./server/simple_html_dom.php";
require_once "./server/scraper/o2cm_common.php";

class Event {
    public $name = "";

    public $compId = "";

    public $heatId = "";

    public $dances = [];

    public $numRounds = 1;

    public $numCouples = 1;

    public $finalSize = 1;
}

function getO2cmEventUri(string $compId, string $heatId): string {
    // TODO: Not all events are from scoresheet3
    $url = "https://results.o2cm.com/scoresheet3.asp";
    $url .= "?event=" . $compId;
    $url .= "&heatid=" . $heatId;
    return $url;
}


function getO2cmEvent(string $compId, string $heatId) {
    $url = getO2cmEventUri($compId, $heatId);
    $urlHTML = file_get_contents($url);
    if ($urlHTML === false) {
        return false;
    }
    return str_get_html($urlHTML);
}


function getO2cmEventFirstRound(string $compId, string $heatId, int $numRounds) {
    $url = getO2cmEventUri($compId, $heatId);
    $ch = curl_init();
    $event_query = parse_url($url, PHP_URL_QUERY);
    $fields_string = $event_query . "&selCount=" . ($numRounds - 1);
    $clean_url = "https://" . parse_url($url, PHP_URL_HOST) . parse_url($url, PHP_URL_PATH);
    curl_setopt($ch, CURLOPT_URL, $clean_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
    $result = curl_exec($ch);
    curl_close($ch);
    $urlHTML = str_get_html($result);
    if ($urlHTML === false) {
        return false;
    }
    return str_get_html($urlHTML);
}


function getEventInfo(string $compId, string $heatId): ?Event {
    $eventPage = getO2cmEvent($compId, $heatId);
    if ($eventPage === false) {
        // TODO: Need better return type
        echo "No results - there was an error fetching data from o2cm.";
        return null;
    }

    if (is_o2cm_500($eventPage)) {
        // TODO: Better error handling
        return null;
    }

    $numRounds = 1;
    $select = $eventPage->find("select[id=selCount]");
    if (sizeof($select) > 0) {
        $numRounds = sizeof($select[0]->find("option"));
    }

    $eventName = $eventPage->find("td[class=h4]")[0]->innertext;
    $eventName = trim(substr($eventName, 0, strpos($eventName, "&nbsp")));

    $dances = array();
    $danceHeaders = $eventPage->find("td[class=h3]");
    if (sizeof($danceHeaders) == 1) {
        $dance = $danceHeaders[0]->innertext;
        array_push($dances, $dance);
    }
    foreach (array_slice($danceHeaders, 0, sizeof($danceHeaders)-1) as $danceHeader) {
        $dance = $danceHeader->innertext;
        array_push($dances, $dance);
    }

    $finalSize = 1;
    $pageTables = $eventPage->find("table[class=t1n]");
    if (sizeof($pageTables) == 0) {
        $finalSize = null;
    }
    else {
        $resultsTable = $pageTables[0];
        $finalSize = sizeof($resultsTable->find("tr")) - 2;
    }

    $totalNumCouples = 1;
    if ($numRounds > 1) {
        $eventPage = getO2cmEventFirstRound($compId, $heatId, $numRounds);
        if ($eventPage === false) {
            // TODO: Need better return type
            echo "No results - there was an error fetching data from o2cm.";
            $totalNumCouples = null;
        }

        if (is_o2cm_500($eventPage)) {
            // TODO: Better error handling
            $totalNumCouples = null;
        }

        $pageTables = $eventPage->find("table[class=t1n]");
        if (sizeof($pageTables) == 0) {
            $totalNumCouples = null;
        }
        else {
            $resultsTable = $pageTables[0];
            $totalNumCouples = sizeof($resultsTable->find("tr")) - 2;
        }
    }
    else {
        $totalNumCouples = $finalSize;
    }

    $event = new Event();
    $event->compId = $compId;
    $event->heatId = $heatId;
    $event->name = $eventName;
    $event->dances = $dances;
    $event->numRounds = $numRounds;
    $event->numCouples = $totalNumCouples;
    $event->finalSize = $finalSize;
    return $event;
}