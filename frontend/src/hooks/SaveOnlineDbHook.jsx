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

    const saveListChanges = useCallback( async (changes) => {
        const dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'saveListChanges',
            userID: userID,
            listID: currentListID,
            listName: changes.listName,
            listVersion: changes.listVersion,
            'data-insert': changes.added ?? [],
            'data-update': changes.modified ?? [],
            'data-delete': changes.removed ?? []
        };


        return fetch(backendApiEndpoint, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(dataToSend)
        })
        .then( response => response.ok ? response.json().catch(error => {throw new Error('json parse error: ' + error)} ) : Promise.reject('response is not ok') )
        .then( data => data.result )
        .catch( error => { console.error('fetch error (update list items):'); console.error(error); } );
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
        saveListChanges,
        deleteList
    };
}

export default SaveOnlineDbHook;