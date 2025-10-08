<?php
namespace src;

class ConnectPlayerData {
    public $peerId;
    public $displayName;
    public $posX;
    public $posY;
    public $posZ;
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
    
            $response['status_code_header'] = 'HTTP/1.1 200 OK';
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

                $sql = "INSERT INTO dodo_players (display_name, peer_id, pos_x, pos_y, pos_z, creation_date) VALUES ('$connectPlayerData->displayName', '$connectPlayerData->peerId', $connectPlayerData->posX, $connectPlayerData->posY, $connectPlayerData->posZ, $creation)";

                if ($conn->query($sql) === TRUE) {
                    $response['body'] = mysqli_insert_id($conn);
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