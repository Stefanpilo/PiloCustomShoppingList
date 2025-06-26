<?php
    file_put_contents('debug.txt', 'Script eseguito');
    header('Content-Type: application/json');
    $requestParams = json_decode(file_get_contents('php://input'), true);
    
    if (isset($requestParams['requestType'])) {
        $response = array();
        
        if ($requestParams['requestType'] === 'dbOperation') {
            require_once('dbOperations/dbQueryManager.php');

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

                    case 'getListLastModifiedDate':
                        $response['result'] = getListLastModifiedDate($requestParams['listID']);
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

                    case 'updateListName':
                        $user_id = $requestParams['userID'];
                        $list_id = $requestParams['listID'];
                        $list_name = $requestParams['listName'];
                        $response['result'] = updateListName($user_id, $list_id, $list_name);
                    break;

                    case 'updateListItems':
                        $response['result-insert'] = [];
                        $response['result-update'] = [];
                        $response['result-delete'] = [];
                        $list_id = $requestParams['listID'];
                        foreach($requestParams['data-insert'] as $item) {
                            $response['result-insert'][] = insertNewListItem($list_id, $item);
                        }
                        foreach($requestParams['data-update'] as $item) {
                            $response['result-update'][] = updateListItem($list_id, $item);
                        }
                        foreach($requestParams['data-delete'] as $item) {
                            $response['result-delete'][] = deleteListItem($list_id, $item);
                        }
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