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
class ConstructionsData {
    public $constructions = [];

    public function toJSON() {
        return json_encode(get_object_vars($this));
    }
}

class ConstructionController {

    private $requestFunction;
    private $requestMethod;
    private $constructionData;
    private $password;

    public function __construct($requestFunction, $requestMethod, $constructionData, $password)
    {
        $this->requestFunction = $requestFunction;
        $this->requestMethod = $requestMethod;
        $this->constructionData = $constructionData;
        $this->password = $password;
    }

    public function processRequest()
    {
        switch ($this->requestMethod) {
            case 'GET':
                if ($this->requestFunction == "get_construction") {
                    $response = $this->getConstruction($this->constructionData, $this->password);
                }
                else if ($this->requestFunction == "get_available_constructions") {
                    $response = $this->getAvailableConstructions($this->password);
                }
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

    private function getAvailableConstructions($password)
    {
        global $servername;
        global $username;
        global $nopassword;
        global $database;
        
        $sql = "SELECT i, j FROM dodo_constructions WHERE (last_edit < DATE_SUB(NOW(), INTERVAL 60 MINUTE)) ORDER BY radial_dist_sqr ASC LIMIT 10";
        $conn = mysqli_connect($servername, $username, $nopassword, $database);

        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        if (!$conn) {
            $response['body'] = "Can't connect to DB.";
        }
        else {
            $result = $conn->query($sql);
            $datas = new ConstructionsData();
            $i = 0;
            while ($row = $result->fetch_assoc()) {
                $constructionData = new ConstructionData();
                $constructionData->i = intval($row["i"]);
                $constructionData->j = intval($row["j"]);
                $datas->constructions[$i] = $constructionData;
                $i++;
            }

            $response['status_code_header'] = 'HTTP/1.1 200 OK';
            $response['body'] = $datas->toJSON();
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