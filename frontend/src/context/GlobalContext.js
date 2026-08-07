import { createContext, useContext } from "react";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {

    const ROUTES = {
        HOME: '/',
        NEW_LIST: '/new-list',
        LIST_DETAILS: '/list-details',
        LOGIN_PAGE: '/login'
    };
    
    const rootDirectory = 'https://pilo-custom-shopping-list.infinityfree.me';
    const backendApiEndpoint = rootDirectory + '/backend/APIEndpoint.php';
    const localStorageDbName = 'piloCustomShoppingList';
    const localStorageUserID = localStorageDbName + 'UserID';
    const localStorageAuthToken = localStorageDbName + 'Token';

    const requestTypes = {
        dbCall: 'dbOperation',
        authentication: 'authentication'
    };


    const contextValue = {
        ROUTES,
        backendApiEndpoint,
        localStorageDbName,
        localStorageUserID,
        localStorageAuthToken,
        requestTypes
    };

    return (
        <GlobalContext.Provider value={ contextValue }>
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobalContext() {
    return useContext(GlobalContext);
}