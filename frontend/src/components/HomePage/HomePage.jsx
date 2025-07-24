import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useGlobalContext } from '../../context/GlobalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import LocalStorageHook from '../../hooks/LocalStorageHook.jsx';
import ReadOnlineDbHook from '../../hooks/ReadOnlineDbHook.jsx';

import Header from '../Header/Header.jsx'

import './HomePage.css'

function HomePage() {
    const { ROUTES, setCurrentListID } = useGlobalContext();
    const { isUserLoggedIn } = useAuth();
    const { localStorageDb } = LocalStorageHook();
    const { getListsByUserID } = ReadOnlineDbHook();
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
                                    <Link to={`${ROUTES.LIST_DETAILS}/${listName}`} className="list-link">
                                        {listName}
                                    </Link>
                                    <button>Esporta</button>
                                    <button>Elimina</button>
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
                                        <button className={element.list_id}>Elimina</button>
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