<?php

require_once "./server/api/BaseController.php";

class EventsController extends BaseController {
    public function eventInfoByHeatId() {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();

        if (strtoupper($requestMethod) == 'GET') {
            if (
                isset($arrQueryStringParams['compId'])
                && $arrQueryStringParams['compId']
                && isset($arrQueryStringParams['heatId'])
                && $arrQueryStringParams['heatId'])
            {
                $compId = $arrQueryStringParams['compId'];
                $heatId = $arrQueryStringParams['heatId'];
                require_once "./server/scraper/o2cm_event.php";
                $results = getEventInfo($compId, $heatId);
                $responseData = json_encode($results);
            }
            else {
                $strErrorDesc = 'compId and heatId required';
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