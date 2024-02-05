<?php

require_once "./server/api/BaseController.php";

class ResultsController extends BaseController {
    public function listByCompetitor() {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();

        if (strtoupper($requestMethod) == 'GET') {
            if (
                isset($arrQueryStringParams['fname'])
                && $arrQueryStringParams['fname']
                && isset($arrQueryStringParams['lname'])
                && $arrQueryStringParams['lname'])
            {
                $fname = $arrQueryStringParams['fname'];
                $lname = $arrQueryStringParams['lname'];
                require_once "./server/scraper/individual_events.php";
                $results = get_events($fname, $lname);
                $responseData = json_encode($results);
            }
            else {
                $strErrorDesc = 'fname and lname required';
                $strErrorHeader = 'HTTP/1.1 400 Bad Request';
            }
        }
        else {
            $strErrorDesc = 'Method Not Allowed';
            $strErrorHeader = 'HTTP/1.1 405 Method Not Allowed';
        }

        // send output
        if (!$strErrorDesc) {
            $this->sendOutput(
                $responseData,
                array('Content-Type: application/json', 'HTTP/1.1 200 OK')
            );
        } else {
            $this->sendOutput(json_encode(array('error' => $strErrorDesc)),
                array('Content-Type: application/json', $strErrorHeader)
            );
        }
    }
}