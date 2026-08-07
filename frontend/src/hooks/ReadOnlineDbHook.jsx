import { useState, useCallback } from "react";

import { useGlobalContext } from "../context/GlobalContext";
import { useAuth } from "../context/AuthContext";

import parseApiResponse from "../utils/parseApiResponse";


function ReadOnlineDBHook(dataType) {
    const { backendApiEndpoint, requestTypes } = useGlobalContext();
    const { userID, authToken } = useAuth();
    const [onlineDbData, setOnlineDbData] = useState([]);

    const getListsByUserID = useCallback(() => {
        let dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'getListsByUserID',
            userID: userID
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
            console.error('fetch error (get lists by user id):');
            console.error(error);
            throw error;
        });
    }, [requestTypes, userID, backendApiEndpoint, authToken]);


    const getListItemsByListID = useCallback((listID) => {
        let dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'getListItemsByListID',
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
            console.error('fetch error (get list items by list id):');
            console.error(error);
            throw error;
        });
    }, [requestTypes, backendApiEndpoint, authToken]);

    const getListDetails = useCallback((listID) => {
        let dataToSend = {
            requestType: requestTypes.dbCall,
            action: 'getListDetails',
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
        .then( data => data.result.list_details )
        .catch( error => {
            console.error('fetch error (get list details):');
            console.error(error);
            throw error;
        });
    }, [requestTypes, backendApiEndpoint, authToken]);

    return {
        onlineDbData,
        setOnlineDbData,
        getListsByUserID,
        getListItemsByListID,
        getListDetails
    };
}

export default ReadOnlineDBHook;