<?php
namespace src;

class ConstructionData {
    public $id;
    public $i;
    public $j;
    public $content;
    public $token;

    public function toJSON() {
        return json_encode(get_object_vars($this));
    }
}

class ConstructionController {

    private $requestMethod;
    private $constructionData;
    private $password;

    public function __construct($requestMethod, $constructionData, $password)
    {
        $this->requestMethod = $requestMethod;
        $this->constructionData = $constructionData;
        $this->password = $password;
    }

    public function processRequest()
    {
        switch ($this->requestMethod) {
            case 'GET':
                $response = $this->getConstruction($this->constructionData, $this->password);
                break;
            case 'POST':
                $response = $this->setConstruction($this->constructionData, $this->password);
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

    private function getConstruction($constructionData, $password)
    {
        global $servername;
        global $username;
        global $nopassword;
        global $database;
        
        if (!is_string($password)) {
            $password = $nopassword;
            $sql = "SELECT * FROM dodo_constructions WHERE i=$constructionData->i AND j=$constructionData->j";
        }
        else {
            $sql = "SELECT * FROM dodo_constructions WHERE i=$constructionData->i AND j=$constructionData->j";
        }

        $conn = mysqli_connect($servername, $username, $password, $database);

        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        if (!$conn) {
            $response['body'] = "Can't connect to DB.";
        }
        else {
            $result = $conn->query($sql);
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();

                $constructionData = new ConstructionData();
                $constructionData->id = intval($row["id"]);
                $constructionData->i = intval($row["i"]);
                $constructionData->j = intval($row["j"]);
                $constructionData->content = $row["content"];
                $response['body'] = $constructionData->toJSON();
            }
            else {
                $response['body'] = "";
            }
        }

        $conn->close();

        return $response;
    }
    private function setConstruction($constructionData, $password)
    {
        global $servername;
        global $username;
        global $nopassword;
        global $database;

        if (true) {
            if (!is_string($password)) {
                $conn = mysqli_connect($servername, $username, $nopassword, $database);
                $constructionData->content = $conn->real_escape_string($constructionData->content);
                $constructionData->token = $conn->real_escape_string($constructionData->token);
                $getIdSql = "SELECT id FROM dodo_constructions WHERE i=$constructionData->i AND j=$constructionData->j";
                $result = $conn->query($getIdSql);
                if ($result->num_rows > 0) {
                    $constructionData->id = intval($result->fetch_row()[0]);
                    $sql = "UPDATE dodo_constructions SET content='$constructionData->content', last_edit=NOW() WHERE id=$constructionData->id AND token='$constructionData->token'";

                    if ($conn->query($sql) === TRUE) {
                        $response['status_code_header'] = 'HTTP/1.1 200 OK';
                        $response['body'] = $constructionData->id;
                    } 
                    else {
                        $response['status_code_header'] = 'HTTP/1.1 404 Not Found';
                        $response['body'] =  "Error: " . $sql . "<br>" . $conn->error;
                    }
                }
                else {
                    $response['status_code_header'] = 'HTTP/1.1 404 Not Found';
                    $response['body'] =  "No Construction exist at i=$constructionData->i AND j=$constructionData->j";
                }
            }
            else {
                $conn = mysqli_connect($servername, $username, $password, $database);
                $getIdSql = "SELECT id FROM dodo_constructions WHERE i=$constructionData->i AND j=$constructionData->j";
                $result = $conn->query($getIdSql);
                if ($result->num_rows > 0) {
                    $constructionData->id = intval($result->fetch_row()[0]);
                    $sql = "UPDATE dodo_constructions SET content='$constructionData->content', last_edit=NOW() WHERE id=$constructionData->id";

                    if ($conn->query($sql) === TRUE) {
                        $response['status_code_header'] = 'HTTP/1.1 200 OK';
                        $response['body'] = $constructionData->id;
                    } 
                    else {
                        $response['status_code_header'] = 'HTTP/1.1 404 Not Found';
                        $response['body'] =  "Error: " . $sql . "<br>" . $conn->error;
                    }
                }
                else {
                    $conn = mysqli_connect($servername, $username, $password, $database);
                    $token = $this->generateToken(32);
                    $sql = "INSERT INTO dodo_constructions (i, j, content, token) VALUES ($constructionData->i, $constructionData->j, '$constructionData->content', '$token')";

                    if ($conn->query($sql) === TRUE) {
                        $response['status_code_header'] = 'HTTP/1.1 200 OK';
                        $response['body'] = mysqli_insert_id($conn);
                    } 
                    else {
                        $response['status_code_header'] = 'HTTP/1.1 404 Not Found';
                        $response['body'] =  "Error: " . $sql . "<br>" . $conn->error;
                    }
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