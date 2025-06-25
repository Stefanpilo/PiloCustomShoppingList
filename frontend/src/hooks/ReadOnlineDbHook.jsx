import { useState, useCallback } from "react";

import { useGlobalContext } from "../context/GlobalContext";
import { useAuth } from "../context/AuthContext";


function ReadOnlineDBHook(dataType) {
    const { backendApiEndpoint, currentListID, requestTypes } = useGlobalContext();
    const { userID } = useAuth();
    const [onlineDbData, setOnlineDbData] = useState([]);

    const getListsByUserID = useCallback(() => {
        let dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'getListsByUserID',
            userID: userID
        };

        return fetch(backendApiEndpoint, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(dataToSend)
        })
        .then( response => response.ok ? response.json() : '' )
        .then( data => data.result )
        .catch( error => { console.error('fetch error (get lists by user id):'); console.error(error); } );
    }, [requestTypes, userID, backendApiEndpoint]);


    const getListItemsByListID = useCallback(() => {
        let dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'getListItemsByListID',
            listID: currentListID
        };

        return fetch(backendApiEndpoint, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(dataToSend)
        })
        .then( response => response.ok ? response.json() : '' )
        .then( data => data.result )
        .catch( error => { console.error('fetch error (get list items by list id):'); console.error(error); } );
    }, [requestTypes, currentListID, backendApiEndpoint]);


    const getListLastModifiedDate = useCallback(() => {
        let dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'getListLastModifiedDate',
            listID: currentListID
        };

        return fetch(backendApiEndpoint, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(dataToSend)
        })
        .then( response => response.ok ? response.json() : '' )
        .then( data => data.result.last_modified )
        .catch( error => { console.error('fetch error (get list last modified date):'); console.error(error); } );
    }, [requestTypes, currentListID, backendApiEndpoint]);

    return {
        onlineDbData,
        setOnlineDbData,
        getListsByUserID,
        getListItemsByListID,
        getListLastModifiedDate
    };
}

export default ReadOnlineDBHook;