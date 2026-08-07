import { Link, useLocation } from "react-router-dom";


import { useGlobalContext } from "../../context/GlobalContext";
import { useAuth } from "../../context/AuthContext";
import { usePopup } from "../../popups/PopupContext";

import userIcon from "../../images/user-icon.svg"

import './Header.css'


function Header({ navBar }) {
    const location = useLocation();
    const { ROUTES } = useGlobalContext();
    const { isUserLoggedIn, username, logOutUser } = useAuth();
    const { createConfirmPopup } = usePopup();

    const handleLogOut = async () => {
        let confirmPopupResponse = await createConfirmPopup('Vuoi effettuare il log out?');
        if (confirmPopupResponse)
            logOutUser();
    }

    return (
        <div id="header_wrapper">
            <div id="nav-bar">
                {navBar.backBtn && /*(
                    window.history.length > 1 ? (
                        <button className="link_button default_button" onClick={() => navigate(-1)}>
                            Indietro
                        </button>
                    )
                    : */(
                        <Link to={ROUTES.HOME} className="link_button default_button">
                            Home
                        </Link>
                    
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
                {!isUserLoggedIn ? (
                    (location.pathname === ROUTES.LOGIN_PAGE && location.state?.operationType === 'login') ? (
                        <Link id="signup_button" className="link_button default_button" to={ROUTES.LOGIN_PAGE} state={{ operationType: 'signup' }}>REGISTRATI</Link>
                    )
                    : (
                        <Link id="login_button" className="link_button default_button" to={ROUTES.LOGIN_PAGE} state={{ operationType: 'login' }}>ACCEDI</Link>
                    )
                ) : null}
                {isUserLoggedIn && (
                    <div id="userIcon_wrapper" className="button" onClick={handleLogOut}>
                        <img id="user-icon" src={userIcon} alt="user-icon" />
                        <p id="username">{username}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;