import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

import { useGlobalContext } from "../context/GlobalContext";

function LocalStorageHook() {
    const { localStorageDbName } = useGlobalContext();
    const [localStorageDb, setLocalStorageDb] = useState({});
    
    useEffect(() => {
        async function loadStorageData() {
            let initalDbData = await Preferences.get({ key: localStorageDbName });
            
            if (initalDbData.value)
                setLocalStorageDb(JSON.parse(initalDbData.value));
        }
        
        loadStorageData();
        
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);

    useEffect(() => {
        if (localStorageDb && Object.keys(localStorageDb).length > 0)
            Preferences.set({ key: localStorageDbName, value: JSON.stringify(localStorageDb) });
    }, [localStorageDbName, localStorageDb]);

    return {
        localStorageDb,
        setLocalStorageDb
    };
}

export default LocalStorageHook;