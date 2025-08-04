import { useCallback } from "react";

import { useGlobalContext } from "../context/GlobalContext";
import { useAuth } from "../context/AuthContext";

function SaveOnlineDbHook() {
    const { currentListID, requestTypes, backendApiEndpoint } = useGlobalContext();
    const { userID } = useAuth();

    const insertNewListWithItems = useCallback( async (dataToSave) => {
        const dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'insertNewListWithItems',
            userID: userID,
            listName: dataToSave.listName,
            listItems: dataToSave.listItems
        }
        
        try {
            const response = await fetch(backendApiEndpoint, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            const data = await (response.ok ? response.json().catch(error => { throw new Error('json parse error: ' + error); }) : Promise.reject('response is not ok'));
            return data.result;
        } catch (error_1) {
            console.error('fetch error (insert new list with items):'); console.error(error_1);
        }
    }, [requestTypes, userID, backendApiEndpoint]);

    const updateListName = useCallback( async (dataToSave) => {
        const dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'updateListName',
            userID: userID,
            listID: currentListID,
            listName: dataToSave
        };

        return fetch(backendApiEndpoint, {
            method: 'POST',
            headers: { 'Content-type': 'application/json'},
            body: JSON.stringify(dataToSend)
        })
        .then( response => response.ok ? response.json().catch(error => {throw new Error('json parse error: ' + error)} ) : Promise.reject('response is not ok') )
        .then( data => data)
        .catch( error => { console.error('fetch error (update list name):'); console.error(error); } );
    }, [requestTypes, userID, currentListID, backendApiEndpoint]);

    const updateListItems = useCallback( async (updates) => {
        let shouldCallDb = false;
        const dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'updateListItems',
            userID: userID,
            listID: currentListID
        };

        dataToSend['data-insert'] = [];
        dataToSend['data-update'] = [];
        dataToSend['data-delete'] = [];

        if (updates.added && updates.added.length > 0) {
            //Per le insert
            shouldCallDb = true;
            dataToSend['data-insert'] = updates.added;
        }

        if (updates.modified && updates.modified.length > 0) {
            //Per le update
            shouldCallDb = true;
            dataToSend['data-update'] = updates.modified;

        }

        if (updates.removed && updates.removed.length > 0) {
            //Per le delete
            shouldCallDb = true;
            dataToSend['data-delete'] = updates.removed;
        }

        if (shouldCallDb) {
            return fetch(backendApiEndpoint, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(dataToSend)
            })
            .then( response => response.ok ? response.json().catch(error => {throw new Error('json parse error: ' + error)} ) : Promise.reject('response is not ok') )
            .then( data => data )
            .catch( error => { console.error('fetch error (update list items):'); console.error(error); } );
        }
        else {
            return false;
        }
    }, [requestTypes, userID, currentListID, backendApiEndpoint]);

    const deleteList = useCallback( async (listID) => {
        const dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'deleteList',
            userID: userID,
            listID: listID
        };

        return fetch(backendApiEndpoint, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(dataToSend)
        })
        .then( response => response.ok ? response.json().catch(error => {throw new Error('json parse error: ' + error)}) : Promise.reject('response is not ok') )
        .then( data => data.result )
        .catch( error => error );
    }, [requestTypes, userID, backendApiEndpoint]);

    return {
        insertNewListWithItems,
        updateListName,
        updateListItems,
        deleteList
    };
}

export default SaveOnlineDbHook;