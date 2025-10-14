<?php
include 'src/ConnectPlayerController.php';
include 'src/GetPlayersController.php';
include 'src/ConstructionController.php';
include './Config.php';
use src\ConnectPlayerData;
use src\ConnectPlayerController;
use src\ConstructionData;
use src\GetPlayersController;
use src\ConstructionController;

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Origin, Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Expose-Headers: set-cookie");

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );

$password = null;
foreach (getallheaders() as $name => $value) {
    if ($name == "Authorization") {
        $auth_array = explode(" ", $value);
        $un_pw = explode(":", base64_decode($auth_array[1]));
        $un = $un_pw[0];
        $password = $un_pw[1];
    }
}

$requestMethod = $_SERVER["REQUEST_METHOD"];

// everything else results in a 404 Not Found
if (isset($uri[2]) && $uri[2] == 'connect_player') {
    $rawData = json_decode(file_get_contents('php://input'));
    $connectPlayerData = new ConnectPlayerData();
    
    if (isset($rawData->{'peerId'})) {
        $connectPlayerData->peerId = $rawData->{'peerId'};
    }
    if (isset($rawData->{'displayName'})) {
        $connectPlayerData->displayName = $rawData->{'displayName'};
    }
    if (isset($rawData->{'style'})) {
        $connectPlayerData->style = $rawData->{'style'};
    }
    if (is_numeric($rawData->{'posX'})) {
        $connectPlayerData->posX = $rawData->{'posX'};
    }
    if (is_numeric($rawData->{'posY'})) {
        $connectPlayerData->posY = $rawData->{'posY'};
    }
    if (is_numeric($rawData->{'posZ'})) {
        $connectPlayerData->posZ = $rawData->{'posZ'};
    }
    if (isset($rawData->{'token'})) {
        $connectPlayerData->token = $rawData->{'token'};
    }

    $controller = new ConnectPlayerController($requestMethod, $connectPlayerData, $password);
    $controller->processRequest();
}
else if (isset($uri[2]) && $uri[2] == 'get_construction') {
    $constructionData = new ConstructionData();
    
    if (is_numeric($uri[3])) {
        $constructionData->i = $uri[3];
    }
    if (is_numeric($uri[4])) {
        $constructionData->j = $uri[4];
    }

    $controller = new ConstructionController($requestMethod, $constructionData, $password);
    $controller->processRequest();
}
else if (isset($uri[2]) && $uri[2] == 'set_construction') {
    $rawData = json_decode(file_get_contents('php://input'));
    $constructionData = new ConstructionData();
    
    if (is_numeric($rawData->{'i'})) {
        $constructionData->i = $rawData->{'i'};
    }
    if (is_numeric($rawData->{'j'})) {
        $constructionData->j = $rawData->{'j'};
    }
    if (isset($rawData->{'content'})) {
        $constructionData->content = $rawData->{'content'};
    }

    $controller = new ConstructionController($requestMethod, $constructionData, $password);
    $controller->processRequest();
}
else if (isset($uri[2]) && $uri[2] == 'get_players') {
    $connectPlayerData = new ConnectPlayerData();
    
    $controller = new GetPlayersController($requestMethod, $connectPlayerData, $password);
    $controller->processRequest();
}
else {
    header("HTTP/1.1 404 Not Found");
}


