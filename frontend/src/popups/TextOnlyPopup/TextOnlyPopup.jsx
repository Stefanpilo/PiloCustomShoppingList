import { useNavigate } from 'react-router-dom';

import { usePopup } from '../PopupContext';

import './TextOnlyPopup.css'

function TextOnlyPopup() {
    const { textOnlyPopup, setTextOnlyPopup } = usePopup();
    const navigate = useNavigate();

    function handleClosePopup(shouldRefreshPage = false, destinationLink = false) {
        setTextOnlyPopup({message: ''});

        if (shouldRefreshPage)
            window.location.reload(true);

        if (destinationLink)
            navigate(destinationLink);
    }

    return (
        textOnlyPopup.message && (
            <div id="popup_wrapper">
                {textOnlyPopup.isErrorMessage && (
                    <h1>
                        ERRORE
                    </h1>
                )}
                <p id="popup-message">{textOnlyPopup.message}</p>
                <button onClick={() => handleClosePopup(textOnlyPopup.shouldRefreshPage, textOnlyPopup.destinationLink)}>OK</button>
            </div>
        )
    );
}

export default TextOnlyPopup;