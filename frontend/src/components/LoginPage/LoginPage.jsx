import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { usePopup } from '../../popups/PopupContext.jsx';
import { useGlobalContext } from '../../context/GlobalContext.js';
import { useAuth } from '../../context/AuthContext.js';

import Header from '../Header/Header.jsx';

import './LoginPage.css';

function LoginPage() {
    const { attemptLoginUser, registerUser } = useAuth();
    const { setTextOnlyPopup } = usePopup();
    const { ROUTES } = useGlobalContext();

    const [showPassword, setShowPassword] = useState(false);
    const [attemptingLogin, setAttemptingLogin] = useState(false);

    const location = useLocation();
    const operationType = location.state?.operationType;

    async function handleFormSubmit(e) {
        e.preventDefault();
        setAttemptingLogin(true);

        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        if (operationType === 'login') {
            const response = await attemptLoginUser(username, password);
            
            if (response?.successful)
                setTextOnlyPopup({ message: response.message, destinationLink: ROUTES.HOME });
            else
                setTextOnlyPopup({ isErrorMessage: true, message: response.message });
        }
        else {
            const registerResponse = await registerUser(username, password);
            if (registerResponse.successful) {
                const loginResponse = await attemptLoginUser(username, password);
                if (loginResponse?.successful)
                    setTextOnlyPopup({ message: loginResponse.message, destinationLink: ROUTES.HOME });
                else
                    setTextOnlyPopup({ isErrorMessage: true, message: loginResponse.message });
            }
            else
                setTextOnlyPopup({ isErrorMessage: true, message: registerResponse.message });
        }

        setAttemptingLogin(false);
    }

    return (
        <>
            <Header navBar={{homeBtn: true}}/>
            <div id="loadingPage_root">
                <h1 className="page-h1">
                    {operationType === 'login' ? 'ACCESSO' : 'REGISTRAZIONE'}
                </h1>
                <form id="login_form" onSubmit={handleFormSubmit}>
                    <input className="username_input" type="text" name="username" placeholder="username" required></input>
                    <div id="password_input_wrapper">
                        <input className="password_input" type={ showPassword ? "text" : "password" } name="password" placeholder="password" required></input>
                        <button id="togglePasswordVisibility_button" type="button" onClick={() => setShowPassword((prev) => !prev)}>
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                    <button className="submit_button default_button" type="submit" disabled={attemptingLogin}>
                        {attemptingLogin ? 'CARICAMENTO' : operationType === 'login' ? 'LOGIN' : 'REGISTRATI'}
                    </button>
                </form>
            </div>
        </>
    );
}

export default LoginPage;