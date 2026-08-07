<?php
    require_once __DIR__ . '/dbConnector.php';

    function getUserID($username) {
        $response = [];
        $pdo = getDbConnection();
        
        $query =   'SELECT user_id
                    FROM users
                    WHERE username = ?';

        $stmt = $pdo->prepare($query);
        $stmt->execute([$username]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($result) {
            $response['successful'] = true;
            $response['user_id'] = $result['user_id'];
        }
        else {
            $response['successful'] = false;
        }

        return $response;
    }

    function getListsByUserID($userID) {
        $pdo = getDbConnection();

        $query =   'SELECT list_id, list_name
                    FROM shopping_lists
                    WHERE user_id = ?';

        $stmt = $pdo->prepare($query);
        $stmt->execute([$userID]);

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($result) 
            return $result;
        else
            return null;
    }

    function getListDetails($user_id, $listID) {
        $response = [];
        $pdo = getDbConnection();

        $query =   'SELECT list_name, last_modified, list_version, list_signature
                    FROM shopping_lists
                    WHERE list_id = ? AND user_id = ?';
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$listID, $user_id]);
        $response['list_details'] = $stmt->fetch(PDO::FETCH_ASSOC);

        return $response;
    }

    function getListItemsByListID($user_id, $listID) {
        $response = [];
        $pdo = getDbConnection();

        $query =   'SELECT *
                    FROM shopping_list_items AS items
                    INNER JOIN shopping_lists AS lists
                        ON lists.list_id = items.list_id
                    WHERE items.list_id = ? AND lists.user_id = ?
                    ORDER BY items.item_pos_in_list';
                    
        $stmt = $pdo->prepare($query);
        $stmt->execute([$listID, $user_id]);
        $query_result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($query_result) {
            $response['successful'] = true;
        }
        else {
            $response['successful'] = false;
        }
                
        $response['items'] = $query_result;
        return $response;
    }

?>