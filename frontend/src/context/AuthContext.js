import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Preferences } from '@capacitor/preferences';

import { useGlobalContext } from "./GlobalContext";
import { usePopup } from "../popups/PopupContext";

import parseApiResponse from "../utils/parseApiResponse"

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const { localStorageUserID, backendApiEndpoint, localStorageAuthToken, requestTypes, ROUTES } = useGlobalContext();
    const { setTextOnlyPopup } = usePopup();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState();
    const [username, setUsername] = useState();
    const [userID, setUserID] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const navigate = useNavigate();


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
        .then(parseApiResponse)
        .then(data => data.result)
        .catch(error => {
            console.error('fetch error (register user)');
            console.error(error);
            return {
                successful: false,
                message: error?.message || 'Errore durante la registrazione'
            };
        });
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
        .then(parseApiResponse)
        .then( data => {
            const jsonResponse = data.result;
            if (jsonResponse.successful === 1) {
                logInUser(username, jsonResponse.user_id, jsonResponse.auth_token);
            }
            else
                setIsUserLoggedIn(false);

            return data.result;
        })
        .catch( error => {
            console.error('fetch error (login user)');
            console.error(error);
            setIsUserLoggedIn(false);
            return {
                successful: 0,
                message: error?.message || 'Errore durante il login'
            };
        });
    }, [requestTypes, backendApiEndpoint]);

    const checkTokenValidity = useCallback( async (userID, loginToken) => {
        let dataToSend = {
            requestType: requestTypes.authentication,
            action: 'checkTokenValidity',
            userID: userID,
            userToken: loginToken
        };

        return fetch(backendApiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${dataToSend.userToken}`,
                'Content-Type': 'application/json'},
            body: JSON.stringify(dataToSend)
        })
        .then(parseApiResponse)
        .then( data => {
            if(data.result.successful === true) {
                setUsername(data.result.username);
                setIsUserLoggedIn(true);
            }
            else {
                setIsUserLoggedIn(false);
            }
        })
        .catch(error => {
            setIsUserLoggedIn(false);
            setTextOnlyPopup({ isErrorMessage: true, message: error?.message || 'Impossibile verificare la sessione' });
        });
    }, [requestTypes, backendApiEndpoint, setTextOnlyPopup]);

    const logInUser =  (username, userid, authToken) => {
        setUsername(username);
        setUserID(userid);
        setAuthToken(authToken);
        setIsUserLoggedIn(true);
    }

    const logOutUser = async () => {
        await Promise.all([
            Preferences.remove({ key: localStorageUserID }),
            Preferences.remove({ key: localStorageAuthToken })
        ]);

        setUsername(null);
        setUserID(null);
        setAuthToken(null);
        setIsUserLoggedIn(false);

        navigate(ROUTES.HOME);
    }


    useEffect(() => {
        //To load userID and authToken from localStorage when app loads
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
        /* infinityfree forces the cookie "__test", but sometimes it doesn't generate cause of a bug with a service worker
        /* if the bug occurs, every service worker is removed and the page is refreshed to force the generation of the cookie
        /* this should not trigger if offline (localhost)
        */
       if ( !(window.location.host.includes('localhost')) && (!document.cookie.includes('__test=')) && ('serviceWorker' in navigator) ) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                Promise.all(registrations.map(registration => registration.unregister()))
                .then(() => window.location.reload());
            });
           }
    }, []);

    useEffect(() => {
        //To save userID and authToken on localStorage when they change in the app
        if (userID)
            Preferences.set({ key: localStorageUserID, value: userID });
        if (authToken)
            Preferences.set({ key: localStorageAuthToken, value: authToken });
    }, [userID, authToken, localStorageUserID, localStorageAuthToken]);

    useEffect( () => {
        //To check if user is loging in from url
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
        <AuthContext.Provider value={{ isUserLoggedIn, setIsUserLoggedIn, userID, setUserID, authToken, username, registerUser, attemptLoginUser, logOutUser}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}