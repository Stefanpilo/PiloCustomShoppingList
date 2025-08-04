import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { usePopup } from '../../popups/PopupContext.jsx'
import { useGlobalContext } from '../../context/GlobalContext.js';
import { useAuth } from '../../context/AuthContext.js';

import LocalStorageHook from '../../hooks/LocalStorageHook.jsx';
import ReadOnlineDbHook from '../../hooks/ReadOnlineDbHook.jsx';
import SaveOnlineDbHook from '../../hooks/SaveOnlineDbHook.jsx';

import Header from '../Header/Header.jsx'

import './HomePage.css'

function HomePage() {
    const { createConfirmPopup } = usePopup();
    const { ROUTES, setCurrentListID } = useGlobalContext();
    const { isUserLoggedIn } = useAuth();
    const { localStorageDb, setLocalStorageDb } = LocalStorageHook();
    const { getListsByUserID } = ReadOnlineDbHook();
    const { deleteList } = SaveOnlineDbHook();
    const [homePageLoaded, setHomePageLoaded] = useState(false);
    const [onlineDbData, setOnlineDbData] = useState([]);

    useEffect( () => {
        if (isUserLoggedIn === false || isUserLoggedIn === true)
            setHomePageLoaded(true);

        if (isUserLoggedIn) {
            (async () => {
                setOnlineDbData( await getListsByUserID() );
            })();
        }
    }, [isUserLoggedIn, getListsByUserID]);

    async function handleDeleteList(index, list_id) {
        if (isUserLoggedIn) {
            const listToRemove = onlineDbData[index];
            const confirmPopupResponse = await createConfirmPopup('Sei sicuro di voler eliminare la lista ' + listToRemove.list_name + '?');
            if (confirmPopupResponse) {
                const deleteListResponse = await deleteList(listToRemove.list_id);
                if (deleteListResponse?.result)
                    setOnlineDbData((prev) => prev.filter((_, idx) => idx !== index));
                else {
                    console.log(deleteListResponse);
                }
            }
        }
        else {
            const listToRemove = Object.keys(localStorageDb)[index];
            const confirmPopupResponse = await createConfirmPopup('Sei sicuro di voler eliminare la lista ' + listToRemove + '?');
            if (confirmPopupResponse) {
                const { [listToRemove]: _, ...newLocalStorageDb } = localStorageDb;
                setLocalStorageDb(newLocalStorageDb);
            }
        }
    }

    return (
        <>
            <Header navBar={{newListBtn: true, importBtn: true}}/>
            <div id="home-page_root">
                <h1 id="home-page-title" className="page-h1">
                    Elenco liste
                </h1>
                <div id="lists_container">
                    {
                    !homePageLoaded ? (
                        <div>Carimento liste...</div>
                    )
                    : (!isUserLoggedIn) ? (
                        Object.keys(localStorageDb).length > 0 ? (
                            Object.keys(localStorageDb).map( (listName, index) => (
                                <div className="single-list_wrapper" key={index}>
                                    <Link to={`${ROUTES.LIST_DETAILS}/${encodeURIComponent(listName)}`} className="list-link">
                                        {listName}
                                    </Link>
                                    <button>Esporta</button>
                                    <button onClick={() => handleDeleteList(index)}>Elimina</button>
                                </div>
                            ))
                        )
                        : (
                            <div>Nessuna lista in locale è stata trovata </div>
                        )
                    ) : (
                        onlineDbData ? (
                            Object.values(onlineDbData).length > 0 ? (
                                Object.values(onlineDbData).map( (element, index) => (
                                    <div className='single-list_wrapper' key={index}>
                                        <Link to={`${ROUTES.LIST_DETAILS}/${encodeURIComponent(element.list_name)}`} className='list-link' onClick={() => { setCurrentListID(element.list_id); }}>
                                            {element.list_name}
                                        </Link>
                                        <button>Esporta</button>
                                        <button onClick={() => handleDeleteList(index, element.list_id)}>Elimina</button>
                                    </div>
                                ))
                            )
                            : (
                                <div>Nessuna lista online è stata trovata</div>
                            )
                        )
                        : (
                            <div>Nessuna lista online è stata trovata</div>
                        )
                    )

                    }
                </div>
            </div>
        </>
    )
}

export default HomePage;