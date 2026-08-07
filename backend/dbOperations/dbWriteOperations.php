<?php
    require_once __DIR__ . '/dbConnector.php';

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
            insertNewListItem($pdo, $list_id, $item);
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

    function saveListChanges($user_id, $list_id, $list_name, $list_version, $itemsToInsert, $itemsToUpdate, $itemsToDelete) {
        $pdo = getDbConnection();

        $response = [
            'successful' => false,
            'conflict' => false,
            'result-insert' => [],
            'result-update' => [],
            'result-delete' => []
        ];

        try {
            $pdo->beginTransaction();

            $query =   'UPDATE shopping_lists
                        SET list_name = ?,
                            list_version = list_version + 1
                        WHERE list_id = ? AND user_id = ? AND list_version = ?';

            $stmt = $pdo->prepare($query);
            $stmt->execute([$list_name, $list_id, $user_id, $list_version]);

            if ($stmt->rowCount() !== 1) {
                $pdo->rollBack();
                $response['conflict'] = true;

                return $response;
            }
            
            foreach($itemsToInsert as $item) {
                $response['result-insert'][] = insertNewListItem($pdo, $list_id, $item);
            }
                foreach($itemsToUpdate as $item) {
                $response['result-update'][] = updateListItem($pdo, $list_id, $item);
            }
                foreach($itemsToDelete as $item) {
                $response['result-delete'][] = deleteListItem($pdo, $list_id, $item);
            }

            $pdo->commit();

            $response['successful'] = true;
            $response['list_version'] = $list_version + 1;
        }
        catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollback();
            }
            error_log('Errore salvataggio lista: ' . $error->getMessage());
        }

        return $response;
    }

    function applyListItemsChanges($list_id, $list_version, $itemsToInsert, $itemsToUpdate, $itemsToDelete) {
        $pdo = getDbConnection();

        $response = [
            'result-insert' => [],
            'result-update' => [],
            'result-delete' => []
        ];

        foreach($itemsToInsert as $item) {
            $response['result-insert'][] = insertNewListItem($pdo, $list_id, $item);
        }
        foreach($itemsToUpdate as $item) {
            $response['result-update'][] = updateListItem($pdo, $list_id, $item);
        }
        foreach($itemsToDelete as $item) {
            $response['result-delete'][] = deleteListItem($pdo, $list_id, $item);
        }

        updateListVersion($pdo, $list_id, $list_version);

        return $response;
    }

    function insertNewListItem($pdo, $list_id, $item) {
        $query =   'INSERT INTO shopping_list_items (list_id, item_name, item_quantity, item_checked, item_pos_in_list)
                    VALUES (?, ?, ?, ?, ?)';
                    
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            $list_id,
            $item['item_name'],
            $item['item_quantity'],
            $item['item_checked'],
            $item['item_pos_in_list']
        ]);

        //$response['successful'] = $stmt->rowCount() > 0;

        return $stmt->rowCount() > 0;
    }



    function updateListItem($pdo, $list_id, $item) {
        $query =   'UPDATE shopping_list_items
                    SET item_name = ?, item_quantity = ?, item_checked = ?, item_pos_in_list = ?
                    WHERE item_id = ? AND list_id = ?';
                    
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            $item['item_name'],
            $item['item_quantity'],
            $item['item_checked'],
            $item['item_pos_in_list'],
            $item['item_id'],
            $list_id
        ]);

        return $stmt->rowCount() > 0;
    }
    
    function deleteListItem($pdo, $list_id, $item) {
        $query =   'DELETE FROM shopping_list_items
                    WHERE item_id = ? AND list_id = ?';
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            $item['item_id'],
            $list_id
        ]);
        
        return $stmt->rowCount() > 0;
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

    function updateListVersion($pdo, $list_id, $list_version) {
        $response = [];

        $query =   'UPDATE shopping_lists
                    SET list_version = list_version + 1
                    WHERE list_id = ?
                    AND list_version = ?';
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$list_id, $list_version]);
        $query_result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($query_result) {
            $response['successful'] = true;
            $response['list_version'] = $query_result;
        }
        else {
            $response['successful'] = false;
        }

        return $response;
    }

    
    function deleteList($user_id, $list_id) {
        $response = [];
        $pdo = getDbConnection();

        $query = '  DELETE FROM shopping_lists
                    WHERE list_id = ? AND user_id = ?';
                    
        $stmt = $pdo->prepare($query);
        $stmt->execute([$list_id, $user_id]);

        if ($stmt->rowCount() > 0) {
            $response['successful'] = true;
            $response['message'] = 'Lista eliminata con successo.';
        }
        else {
            $response['successful'] = false;
            $response['message'] = 'Lista non eliminata.';
        }

        return $response;
    }
?>