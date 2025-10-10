<?php
namespace src;

class ConnectPlayerData {
    public $peerId;
    public $displayName;
    public $style;
    public $posX;
    public $posY;
    public $posZ;
    public $token;

    public function toJSON() {
        return json_encode(get_object_vars($this));
    }
}

class ConnectPlayerResponse {
    public $gameId;
    public $token;

    public function toJSON() {
        return json_encode(get_object_vars($this));
    }
}

class ConnectPlayerController {

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
            case 'POST':
                $response = $this->connectPlayer($this->connectPlayerData, $this->password);
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

    private function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }

    private function connectPlayer($connectPlayerData, $password)
    {
        global $servername;
        global $username;
        global $nopassword;
        global $database;

        if (true) {
            $conn = mysqli_connect($servername, $username, $nopassword, $database);
            $connectPlayerData->peerId = $conn->real_escape_string($connectPlayerData->peerId);
            $connectPlayerData->displayName = $conn->real_escape_string($connectPlayerData->displayName);
            $connectPlayerData->style = $conn->real_escape_string($connectPlayerData->style);
    
            if (!$conn) {
                $response['status_code_header'] = 'HTTP/1.1 404 Not Found';
                $response['body'] = "Can't connect to DB.";
            }
            else {
                //$response['body'] = "INSERT INTO machines (title, author, content, creation) VALUES (" . $connectPlayerData->title . ", " . $connectPlayerData->author . ", " . $connectPlayerData->content . ", NOW())";
                $creation = "NOW()";
                if (isset($connectPlayerData->creation)) {
                    $creation = "FROM_UNIXTIME( $connectPlayerData->creation )";
                }
                //$sql = "SELECT COUNT(*) FROM machines WHERE content=\"$connectPlayerData->content\"";
                //$result = $conn->query($sql);
                //$row = $result->fetch_row();
                //$duplicateCount = $row[0];

                $token = $this->generateToken(32);
                $sql = "INSERT INTO dodo_players (token, display_name, peer_id, style, pos_x, pos_y, pos_z, creation_date) VALUES ('$token', '$connectPlayerData->displayName', '$connectPlayerData->peerId', '$connectPlayerData->style', $connectPlayerData->posX, $connectPlayerData->posY, $connectPlayerData->posZ, $creation)";

                if ($conn->query($sql) === TRUE) {
                    $response['status_code_header'] = 'HTTP/1.1 200 OK';
                    $connectResponse = new ConnectPlayerResponse();
                    $connectResponse->gameId = mysqli_insert_id($conn);
                    $connectResponse->token = $token;
                    $response['body'] = $connectResponse->toJSON();
                } 
                else {
                    $response['status_code_header'] = 'HTTP/1.1 404 Not Found';
                    $response['body'] =  "Error: " . $sql . "<br>" . $conn->error;
                }

            }
    
            $conn->close();
        }
        else {
            
        }

        return $response;
    }

    private function notFoundResponse()
    {
        $response['status_code_header'] = 'HTTP/1.1 404 Not Found';
        $response['body'] = "notFoundResponse";
        return $response;
    }
}