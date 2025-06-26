import { createContext, useState, useContext, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {

    const ROUTES = {
        HOME: '/',
        NEW_LIST: '/new-list',
        LIST_DETAILS: '/list-details',
        LOGIN_PAGE: '/login'
    };
    
    const rootDirectory = 'https://pilotest.ct.ws';
    const backendApiEndpoint = rootDirectory + '/backend/requestHandler.php';
    const localStorageDbName = 'piloCustomShoppingList';
    const localStorageUserID = localStorageDbName + 'UserID';
    const localStorageTempListID = localStorageDbName + 'TempListID';
    const localStorageAuthToken = localStorageDbName + 'Token';

    const [currentListID, setCurrentListID] = useState(null);
    const requestTypes = {
        dbCall: 'dbOperation',
        authentication: 'authentication'
    };


    const contextValue = {
        ROUTES,
        backendApiEndpoint,
        localStorageDbName,
        localStorageUserID,
        localStorageTempListID,
        localStorageAuthToken,
        currentListID,
        setCurrentListID,
        requestTypes
    };

    useEffect(() => {
        async function loadStorageData() {
            const currentListIDData = await Preferences.get({ key: localStorageTempListID });

            if (currentListIDData.value)
                setCurrentListID(currentListIDData.value);
        }

        loadStorageData();
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);

    useEffect(() => {
        if (currentListID && localStorageTempListID)
            Preferences.set({ key: localStorageTempListID, value: currentListID });

        if (currentListID === null)
            Preferences.remove({ key: localStorageTempListID });
    }, [currentListID, localStorageTempListID])


    return (
        <GlobalContext.Provider value={ contextValue }>
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobalContext() {
    return useContext(GlobalContext);
}