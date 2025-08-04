<?php
    require_once('dbConnector.php');

    require_once($_SERVER['DOCUMENT_ROOT'] . '/backend/libs/Firebase_JWT/JWT.php');
    require_once($_SERVER['DOCUMENT_ROOT'] . '/backend/libs/Firebase_JWT/Key.php');
    use Firebase\JWT\JWT;
    use Firebase\JWT\Key;

    $secret_key = 'pasta-e-fasuli';

    function loginUser($username, $password = '') {
        $response = [];
        global $secret_key;
        $password_required = true;
        $token_exp = 0;
        //$token_exp = time() + (60*60*24);

        $pdo = getDbConnection();
        
        $query = 'SELECT * FROM users WHERE username = ?';
        $stmt = $pdo->prepare($query);
        $stmt -> execute([$username]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $payload = [
                'id' => $result['user_id'],
                'username' => $result['username'],
            ];

            if ($username === 'friends') {
                $password_required = false;
            }
            else if ($token_exp > 0) {
                $payload['exp'] = $token_exp;
            }

            if ( !$password_required || ($password && password_verify($password, $result['password'])) ) {
                //se le credenziali sono corrette, genera il token
                $token = JWT::encode($payload, $secret_key, 'HS256');
                $response['auth_token'] = $token;
                $response['user_id'] = $result['user_id'];
                $response['message'] = 'autenticato con successo';
                $response['successful'] = 1;
            }
            else {
                $response['message'] = 'password errata';
                $response['successful'] = 0;
            }
        }
        else {
            $response['message'] = ('utente con username ' . $username . ' non trovato');
            $response['successful'] = 0;
        }

        return $response;
    }

    function checkTokenValidity($user_id) {
        $response = [];
        global $secret_key;
        
        require_once($_SERVER['DOCUMENT_ROOT'] . '/backend/functions.php');
        $token = getAuthHeader();
        
        if (!$token) {
            $response['message'] = 'header autorizzazione mancante';
            $response['successful'] = 0;
            return $response;
        }

        try {
            $decoded = JWT::decode($token, new Key($secret_key, 'HS256'));
            $response['message'] = 'token corretto';
            $response['successful'] = 1;

            $pdo = getDbConnection();
            
            $query = "SELECT user_id, username FROM users WHERE user_id = ?";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$user_id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $response['user_id'] = $result['user_id'];
            $response['username'] = $result['username'];

            return $response;
        }
        catch(Exception $e) {
            $response['message'] = 'token non valido';
            $response['successful'] = 0;
            return $response;
        }
    }

    function registerUser($username, $password) {
        $response = [];
        $pdo = getDbConnection();

        $hash_password = password_hash($password, PASSWORD_DEFAULT);

        try {
            $query = 'INSERT INTO users (username, password) VALUES (?, ?)';
            $stmt = $pdo->prepare($query);
            $result = $stmt->execute([
                $username,
                $hash_password
            ]);
            if ($result)
                $response['successful'] = 1;
        }
        catch (PDOException $e) {
            $response['successful'] = 0;
            if ($e->getCode() === '23000')
                $response['message'] = 'Esiste già un utente con username ' . $username;
            else
                $response['message'] = 'Errore database generico';
        }
        
        return $response;
    }
?>