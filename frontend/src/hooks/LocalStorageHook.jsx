import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

import { useGlobalContext } from "../context/GlobalContext";

export default function LocalStorageHook() {
    const { localStorageDbName } = useGlobalContext();
    const [localStorageDb, setLocalStorageDb] = useState({});
    const [isStorageLoaded, setIsStorageLoaded] = useState(false);
    
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const initialDbData = await Preferences.get({ key: localStorageDbName });

                if (!cancelled)
                    setLocalStorageDb(initialDbData.value ? JSON.parse(initialDbData.value) : {});
            }          
            catch (error) {
                console.error('Errore caricamento liste lcoali: ', error);

                if (!cancelled)
                    setLocalStorageDb({});
            }  
            finally {
                if (!cancelled)
                    setIsStorageLoaded(true);
            }
        })();

        return () => { cancelled = true; };
        
    }, [localStorageDbName]);

    useEffect(() => {
        if (!isStorageLoaded)
            return;

        (async () =>{
            try {
                if (Object.keys(localStorageDb).length > 0) {
                    await Preferences.set({ key: localStorageDbName, value: JSON.stringify(localStorageDb) });
                }
                else
                    await Preferences.remove({ key: localStorageDbName });
            }
            catch (error) {
                console.error('Errore salvataggio liste locali: ', error);
            }
        })();
    }, [isStorageLoaded, localStorageDbName, localStorageDb]);

    return {
        localStorageDb,
        setLocalStorageDb
    };
}