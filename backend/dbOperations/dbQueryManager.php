<?php
    require_once('dbConnector.php');

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

    function getListLastModifiedDate($listID) {
        $response = [];
        $pdo = getDbConnection();

        $query =   'SELECT last_modified
                    FROM shopping_lists
                    WHERE list_id = ?';
        $stmt = $pdo->prepare($query);
        $stmt->execute([$listID]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $response['successful'] = true;
            $response['last_modified'] = $row['last_modified'];
        }
        else
            $response['successful'] = false;

        return $response;
    }
    
    function getListItemsByListID($listID) {
        $response = [];
        $pdo = getDbConnection();

        $query =   'SELECT *
                    FROM shopping_list_items
                    WHERE list_id = ?';
        $stmt = $pdo->prepare($query);
        $stmt->execute([$listID]);
        $response['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $query =   'SELECT list_name, last_modified
                    FROM shopping_lists
                    WHERE list_id = ?';
        $stmt = $pdo->prepare($query);
        $stmt->execute([$listID]);
        $query_result = $stmt->fetch(PDO::FETCH_ASSOC);
        $response['list_name_obj'] = $query_result['list_name'];

        $response['last_modified'] = $query_result['last_modified'];

        return $response;
    }

    function insertNewListWithItems($user_id, $list_name, $list_items) {
        $response = [];
        $pdo = getDbConnection();

        $query =   'INSERT INTO shopping_lists (user_id, list_name)
                    VALUES (?, ?)';
        $stmt = $pdo->prepare($query);
        $stmt->execute([$user_id, $list_name]);

        $list_id = $pdo->lastInsertID();
        $response['list_id'] = $list_id;

        //inserire gli elementi
        foreach($list_items as $item) {
            insertNewListItem($list_id, $item);
        }

        $query =   'SELECT last_modified
                    FROM shopping_lists
                    WHERE list_id = ?';
        $stmt = $pdo->prepare($query);
        $stmt->execute([$list_id]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $response['last_modified'] = $result['last_modified'];

        return $response;
    }

    function insertNewListItem($list_id, $item) {
        $response = [];
        $pdo = getDbConnection();

        $query =   'INSERT INTO shopping_list_items (list_id, item_name, item_quantity, item_checked, item_posInList)
                    VALUES (?, ?, ?, ?, ?)';
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            $list_id,
            $item['item_name'],
            $item['item_quantity'],
            $item['item_checked'],
            $item['item_posInList']
        ]);

        $response['successful'] = $stmt->rowCount() > 0;

        if ($stmt->rowCount() > 0) {
            if (!updateListLastModified($list_id))
            $response['info'] = 'errore nell\'aggiornamento data ultima modifica lista';
        }

        return $response;
    }

    function updateListName($user_id, $list_id, $list_name) {
        $response = [];
        $pdo = getDbConnection();

        $query =   'UPDATE shopping_lists
                    SET list_name = ?
                    WHERE user_id = ? AND list_id = ?';
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            $list_name,
            $user_id,
            $list_id
        ]);

        $response['successful'] = $stmt->rowCount() > 0;
    
        return $response;
    }

    function updateListLastModified($list_id) {
        $pdo = getDbConnection();
        
        $query =   'UPDATE shopping_lists
                    SET last_modified = NOW()
                    WHERE list_id = ?';
        $stmt = $pdo->prepare($query);
        $stmt->execute([$list_id]);

        return $stmt->rowCount() > 0;
    }

    function updateListItem($list_id, $item) {
        $pdo = getDbConnection();

        $query =   'UPDATE shopping_list_items
                    SET item_name = ?, item_quantity = ?, item_checked = ?, item_posInList = ?
                    WHERE item_id = ? AND list_id = ?';
                    
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            $item['item_name'],
            $item['item_quantity'],
            $item['item_checked'],
            $item['item_posInList'],
            $item['item_id'],
            $list_id
        ]);

        updateListLastModified($list_id);

        return $stmt->rowCount() > 0;
    }

    function deleteListItem($list_id, $item) {
        $pdo = getDbConnection();

        $query =   'DELETE FROM shopping_list_items
                    WHERE item_id = ? AND list_id = ?';
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            $item['item_id'],
            $list_id
        ]);

        updateListLastModified($list_id);
        
        return $stmt->rowCount() > 0;
    }
?>