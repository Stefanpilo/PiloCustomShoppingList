<?php
    header('Content-Type: application/json');
    $requestParams = json_decode(file_get_contents('php://input'), true);
    
    if (isset($requestParams['requestType'])) {
        $response = array();
        
        if ($requestParams['requestType'] === 'dbOperation') {
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
                        $response['result'] = getListsByUserID($requestParams['userID']);
                    break;

                    case 'getListDetails':
                        $response['result'] = getListDetails($requestParams['listID']);
                    break;

                    case 'getListItemsByListID':
                        $response['result'] = getListItemsByListID($requestParams['listID']);
                    break;

                    case 'insertNewListWithItems':
                        $user_id = $requestParams['userID'];
                        $list_name = $requestParams['listName'];
                        $list_items = $requestParams['listItems'];
                        $response['result'] = insertNewListWithItems($user_id, $list_name, $list_items);
                    break;

                    /*case 'updateListName':
                        $user_id = $requestParams['userID'];
                        $list_id = $requestParams['listID'];
                        $list_name = $requestParams['listName'];
                        $response['result'] = updateListName($user_id, $list_id, $list_name);
                    break;

                    case 'updateListItems':
                        $response['result'] = applyListItemsChanges($requestParams['listID'], $requestParams['listVersion'], $requestParams['data-insert'], $requestParams['data-update'], $requestParams['data-delete']);
                    break;*/
                    case 'saveListChanges':
                        $response['result'] = saveListChanges($requestParams['listID'], $requestParams['listName'], $requestParams['listVersion'], $requestParams['data-insert'], $requestParams['data-update'], $requestParams['data-delete']);
                    break;

                    case 'deleteList':
                        $response['result'] = deleteList($requestParams['listID']);
                    break;

                    default:
                        $response['result'] = 'error in switch dbOperation';
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
                    $response['result'] = checkTokenValidity($requestParams['userID']);
                }
                else if ($requestParams['action'] === 'registerUser') {
                    $response['result'] = registerUser($requestParams['username'], $requestParams['password']);
                }
            }
        }

        echo json_encode($response);
    }
?>