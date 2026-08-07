import { useCallback } from "react";

import { useGlobalContext } from "../context/GlobalContext";
import { useAuth } from "../context/AuthContext";

import parseApiResponse from "../utils/parseApiResponse"

function SaveOnlineDbHook() {
    const { requestTypes, backendApiEndpoint } = useGlobalContext();
    const { userID, authToken } = useAuth();

    const insertNewListWithItems = useCallback( async (dataToSave) => {
        const dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'insertNewListWithItems',
            userID: userID,
            listName: dataToSave.listName,
            listItems: dataToSave.listItems,
            listSignature: dataToSave.listSignature
        }
        

        return fetch(backendApiEndpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        })
        .then(parseApiResponse)
        .then ( data => data.result )
        .catch (error => {
            console.error('fetch error (insert new list with items):');
            console.error(error);
            throw error;
        })
    }, [requestTypes, userID, backendApiEndpoint, authToken]);

    const saveListChanges = useCallback( async (listID, changes) => {
        const dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'saveListChanges',
            userID: userID,
            listID: listID,
            listName: changes.listName,
            listVersion: changes.listVersion,
            listSignature: changes.listSignature,
            'data-insert': changes.added ?? [],
            'data-update': changes.modified ?? [],
            'data-delete': changes.removed ?? []
        };


        return fetch(backendApiEndpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        })
        .then(parseApiResponse)
        .then( data => data.result )
        .catch( error => {
            console.error('fetch error (update list items):');
            console.error(error);
            throw error;
        });
    }, [requestTypes, userID, backendApiEndpoint, authToken]);

    const deleteList = useCallback( async (listID) => {
        const dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'deleteList',
            userID: userID,
            listID: listID
        };

        return fetch(backendApiEndpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        })
        .then(parseApiResponse)
        .then( data => data.result )
        .catch( error => {
            console.error('delete list error):');
            console.error(error);
            throw error;
        });
    }, [requestTypes, userID, backendApiEndpoint, authToken]);

    return {
        insertNewListWithItems,
        saveListChanges,
        deleteList
    };
}

export default SaveOnlineDbHook;