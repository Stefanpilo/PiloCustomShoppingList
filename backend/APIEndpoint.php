<?php
    ob_start();
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
    error_reporting(E_ALL);

    
    function sendJsonResponse($data, $statusCode = 200) {
        if (ob_get_level() > 0) {
            ob_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($statusCode);

        $response = json_encode(
            $data,
            JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
        );

        if ($response === false) {
            http_response_code(500);
            $response = json_encode([
                'result' => [
                    'successful' => false,
                    'message' => 'Errore nella risposta JSON'
                ]
            ]);
        }

        echo $response;
        exit;
    }

    try {
        $requestParams = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($requestParams)) {
            sendJsonResponse([
                'result' => [
                    'successful' => false,
                    'message' => 'JSON della richiesta non valido'
                ]
            ], 400);
        }

        if (!isset($requestParams['requestType']) || !isset($requestParams['action'])) {
            sendJsonResponse([
            'result' => [
                'successful' => false,
                'message' => 'Tipo di richiesta o azione non valida'
            ]], 400);
        }
    
        $response = array();
        
        if ($requestParams['requestType'] === 'dbOperation') {
            require_once __DIR__ .'/dbOperations/authenticationHandler.php';
            $authenticatedUserID = getAuthenticatedUserID();
            if ($authenticatedUserID === null) {
                sendJsonResponse([
                    'result' => [
                        'successful' => false,
                        'message' => 'Autenticazione fallita'
                    ]
                ], 401);
            }
            

            require_once __DIR__ . '/dbOperations/dbReadOperations.php';
            require_once __DIR__ . '/dbOperations/dbWriteOperations.php';

            if (isset($requestParams['action'])) {
                $action = $requestParams['action'];
                switch ($action) {
                    case 'getUserID':
                        $username = $requestParams['username'];
                        if (!empty($username))
                            $response['userID'] = getUserId($username);
                        else
                            $response['message'] = 'errore username';
                    break;

                    case 'getListsByUserID':
                        $response['result'] = getListsByUserID($authenticatedUserID);
                    break;

                    case 'getListDetails':
                        $response['result'] = getListDetails($authenticatedUserID, $requestParams['listID']);
                    break;

                    case 'getListItemsByListID':
                        $response['result'] = getListItemsByListID($authenticatedUserID, $requestParams['listID']);
                    break;

                    case 'insertNewListWithItems':
                        $response['result'] = insertNewListWithItems($authenticatedUserID, $requestParams['listName'], $requestParams['listSignature'] ?? null, $requestParams['listItems']);
                    break;

                    /*case 'updateListName':
                        $user_id = $authenticatedUserID;
                        $list_id = $requestParams['listID'];
                        $list_name = $requestParams['listName'];
                        $response['result'] = updateListName($user_id, $list_id, $list_name);
                    break;

                    case 'updateListItems':
                        $response['result'] = applyListItemsChanges($requestParams['listID'], $requestParams['listVersion'], $requestParams['data-insert'], $requestParams['data-update'], $requestParams['data-delete']);
                    break;*/
                    case 'saveListChanges':
                        $response['result'] = saveListChanges($authenticatedUserID, $requestParams['listID'], $requestParams['listName'], $requestParams['listVersion'], $requestParams['listSignature'] ?? null, $requestParams['data-insert'], $requestParams['data-update'], $requestParams['data-delete']);
                    break;

                    case 'deleteList':
                        $response['result'] = deleteList($authenticatedUserID, $requestParams['listID']);
                    break;

                    default:
                        sendJsonResponse([
                            'result' => [
                                'successful' => false,
                                'message' => 'Azione database non valida'
                            ]
                        ], 400);
                }
            }
        }
        else if ($requestParams['requestType'] === 'authentication') {
            require_once('dbOperations/authenticationHandler.php');

            if (isset($requestParams['action'])) {
                if ($requestParams['action'] === 'loginUser') {
                    $response['result'] = loginUser($requestParams['username'], $requestParams['password']);
                }
                else if ($requestParams['action'] === 'checkTokenValidity') {
                    $response['result'] = checkTokenValidity();
                }
                else if ($requestParams['action'] === 'registerUser') {
                    $response['result'] = registerUser($requestParams['username'], $requestParams['password']);
                }
            }
            else {
                sendJsonResponse([
                    'result' => [
                        'successful' => false,
                        'message' => 'Azione di autenticazione non valida'
                    ]
                ], 400);
            }
        }
        else {
            sendJsonResponse([
                'result' => [
                    'successful' => false,
                    'message' => 'Tipo di richiesta non valida'
                ]
            ], 400);
        }

        sendJsonResponse($response);
    }
    catch (Throwable $error) {
        error_log('Errore API: ' . $error->getMessage());
        sendJsonResponse([
            'result' => [
                'successful' => false,
                'message' => 'Errore interno del server'
            ]
        ], 500);
    }
?>
