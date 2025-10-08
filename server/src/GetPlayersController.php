<?php
namespace src;

class PlayerData {
    public $peerId;
    public $displayName;
    public $style;
    public $gameId;
    public $posX;
    public $posY;
    public $posZ;

    public function toJSON() {
        return json_encode(get_object_vars($this));
    }
}
class PlayersData {
    public $players = [];
    public $count = 0;

    public function toJSON() {
        return json_encode(get_object_vars($this));
    }
}

class GetPlayersController {

    private $requestMethod;
    private $connectPlayerData;
    private $password;

    public function __construct($requestMethod, $connectPlayerData, $password)
    {
        $this->requestMethod = $requestMethod;
        $this->connectPlayerData = $connectPlayerData;
        $this->password = $password;
    }

    public function processRequest()
    {
        switch ($this->requestMethod) {
            case 'GET':
                $response = $this->getPlayers($this->connectPlayerData, $this->password);
                break;
            case 'OPTIONS':
                $response['status_code_header'] = 'HTTP/1.1 200 OK';
                $response['body'] = "";
                break;
            default:
                $response = $this->notFoundResponse();
                break;
        }

        header($response['status_code_header']);
        if ($response['body']) {
            echo $response['body'];
        }
    }

    private function getPlayers($connectPlayerData, $password)
    {
        global $servername;
        global $username;
        global $nopassword;
        global $database;
        
        if (!is_string($password)) {
            $password = $nopassword;
            $sql = "SELECT * FROM dodo_players WHERE creation_date > DATE_SUB(NOW(), INTERVAL 5 MINUTE)";
        }
        else {
            $sql = "SELECT * FROM dodo_players WHERE creation_date > DATE_SUB(NOW(), INTERVAL 5 MINUTE)";
        }

        $conn = mysqli_connect($servername, $username, $password, $database);

        $result = $conn->query($sql);
        $datas = new PlayersData();
        $i = 0;
        while ($row = $result->fetch_assoc()) {
            $playerData = new PlayerData();
            $playerData->peerId = $row["peer_id"];
            $playerData->displayName = $row["display_name"];
            $playerData->style = $row["style"];
            $playerData->gameId = intval($row["game_id"]);
            $playerData->posX = intval($row["pos_x"]);
            $playerData->posY = intval($row["pos_y"]);
            $playerData->posZ = intval($row["pos_z"]);
            $datas->players[$i] = $playerData;
            $i++;
        }

        $sql = "SELECT COUNT(*) FROM dodo_players WHERE creation_date > DATE_SUB(NOW(), INTERVAL 5 MINUTE)";
        $result = $conn->query($sql);
        $datas->count = intval($result->fetch_row()[0]);

        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        $response['body'] = $datas->toJSON();

        $conn->close();

        return $response;
    }

    private function notFoundResponse()
    {
        $response['status_code_header'] = 'HTTP/1.1 404 Not Found';
        $response['body'] = "notFoundResponse";
        return $response;
    }
}