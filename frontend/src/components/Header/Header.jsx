import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";


import { useGlobalContext } from "../../context/GlobalContext";
import { useAuth } from "../../context/AuthContext";

import userIcon from "../../images/user-icon.svg"

import './Header.css'


function Header({ navBar }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { ROUTES, setCurrentListID } = useGlobalContext();
    const { isUserLoggedIn, username } = useAuth();


    useEffect(() => {
        if (!location.pathname.startsWith(ROUTES.LIST_DETAILS))
            setCurrentListID(null);
    }, [location.pathname, ROUTES, setCurrentListID]);

    return (
        <div id="header_wrapper">
            <div id="nav-bar">
                {navBar.backBtn && (
                    window.history.length > 1 ? (
                        <button className="link_button default_button" onClick={() => navigate(-1)}>
                            Indietro
                        </button>
                    )
                    : (
                        <button className="link_button default_button" onClick={() => navigate(ROUTES.HOME)}>
                            Home
                        </button>
                    )
                )}
                {navBar.homeBtn && (
                    <Link to={ROUTES.HOME} className="link_button default_button">
                        Home
                    </Link>
                )}
                {navBar.newListBtn && (
                    <Link to={ROUTES.NEW_LIST} className="link_button default_button">
                        Nuova lista
                    </Link>
                )}                    
                {navBar.importBtn && (
                    <Link className="link_button default_button">
                        Importa
                    </Link>
                )}
                {!isUserLoggedIn ? (
                    (location.pathname === ROUTES.LOGIN_PAGE && location.state?.operationType === 'login') ? (
                        <Link id="signup_button" className="link_button default_button" to={ROUTES.SIGNUP_PAGE} state={{ operationType: 'signup' }}>REGISTRATI</Link>
                    )
                    : (
                        <Link id="login_button" className="link_button default_button" to={ROUTES.LOGIN_PAGE} state={{ operationType: 'login' }}>ACCEDI</Link>
                    )
                ) : null}
                {isUserLoggedIn && (
                    <div id="userIcon_wrapper">
                        <img id="user-icon" src={userIcon} alt="user-icon" />
                        <p id="username">{username}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;