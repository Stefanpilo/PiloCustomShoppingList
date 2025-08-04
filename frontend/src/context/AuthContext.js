import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { Preferences } from '@capacitor/preferences';

import { useGlobalContext } from "./GlobalContext";
import { usePopup } from "../popups/PopupContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const { localStorageUserID, backendApiEndpoint, localStorageAuthToken, requestTypes } = useGlobalContext();
    const { setTextOnlyPopup } = usePopup();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState();
    const [username, setUsername] = useState();
    const [userID, setUserID] = useState(null);
    const [authToken, setAuthToken] = useState(null);

    useEffect(() => {
        async function loadStorageData() {
            const userIDData = await Preferences.get({ key: localStorageUserID });
            const authTokenData = await Preferences.get({ key: localStorageAuthToken });

            if (userIDData.value)
                setUserID(userIDData.value);
            if (authTokenData.value)
                setAuthToken(authTokenData.value);

        }

        loadStorageData();
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);

    useEffect(() => {
        if (userID)
            Preferences.set({ key: localStorageUserID, value: userID });
        if (authToken)
            Preferences.set({ key: localStorageAuthToken, value: authToken });
    }, [userID, authToken, localStorageUserID, localStorageAuthToken]);

    const registerUser = useCallback( async (username, password) => {
        let dataToSend = {
            requestType: requestTypes.authentication,
            action: 'registerUser',
            username: username,
            password: password
        };

        return fetch(backendApiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        })
        .then(response => response.ok ? response.json().catch(error => {throw new Error('json parse error ' + error)} ) : Promise.reject('response not ok'))
        .then(data => data.result)
        .catch(error => {console.error('fetch error (register user)'); console.error(error); return error;})
    }, [requestTypes, backendApiEndpoint]);

    const attemptLoginUser = useCallback( async (username, password) => {
        let dataToSend = {
            requestType: requestTypes.authentication,
            action: 'loginUser',
            username: username,
            password: password
        };

        return fetch(backendApiEndpoint, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        })
        .then(response => response.ok ? response.json().catch(error => {throw new Error('json parse error ' + error)} ) : Promise.reject('response not ok') )
        .then(data => {
            const jsonResponse = data.result;
            if (jsonResponse.successful === 1) {
                setAuthToken(jsonResponse.auth_token);
                setUserID(jsonResponse.user_id);
                setUsername(username);
                setIsUserLoggedIn(true);
            }
            else
                setIsUserLoggedIn(false);

            return data.result;
        })
        .catch(error => error );
    }, [requestTypes, backendApiEndpoint]);

    const checkTokenValidity = useCallback( async (userID, loginToken) => {
        let dataToSend = {
            requestType: requestTypes.authentication,
            action: 'checkTokenValidity',
            userID: userID,
            userToken: loginToken
        };

        fetch(backendApiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${dataToSend.userToken}`,
                'Content-Type': 'application/json'},
            body: JSON.stringify(dataToSend)
        })
        .then(response => response.ok ? response.json().catch(error => {throw new Error('json parse error: ' + error)} ) : Promise.reject('response is not ok'))
        .then(data => {
            if(data.result.successful === 1) {
                setUsername(data.result.username);
                setIsUserLoggedIn(true);
            }
        })
        .catch(error => setTextOnlyPopup({ isErrorMessage: true, message: error?.message }));
    }, [requestTypes, backendApiEndpoint, setTextOnlyPopup]);

    useEffect( () => {
        const urlParams = new URLSearchParams(window.location.search);
        const loginParams = {
            username: urlParams.get('username'),
            password: urlParams.get('password') || null
        }

        if (loginParams && loginParams.username) {
            attemptLoginUser(loginParams.username , loginParams.password);
        }
        else if (userID && authToken)
            checkTokenValidity(userID, authToken);
        else
            setIsUserLoggedIn(false);
        
        
    }, [userID, authToken, attemptLoginUser, checkTokenValidity]);


    return (
        <AuthContext.Provider value={{ isUserLoggedIn, setIsUserLoggedIn, userID, setUserID, username, registerUser, attemptLoginUser}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}