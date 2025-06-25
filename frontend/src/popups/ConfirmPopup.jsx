
import { usePopup } from './PopupContext';

import './ConfirmPopup.css';

function ConfirmPopup() {
    const { confirmPopup, setConfirmPopup } = usePopup();

    async function handleResponse(value) {
        confirmPopup.resolve(value);
        setConfirmPopup({message: ''});
    }

    return (
        confirmPopup.message && (
            <div id="popup_wrapper">
                <p id="popup-message">{confirmPopup.message}</p>
                <div id="choice_wrapper">
                    <button className="popup-choice default_button" onClick={() => handleResponse(true) }>
                        {confirmPopup.acceptText}
                    </button>
                    <button className="popup-choice default_button" onClick={() => handleResponse(false)}>
                        {confirmPopup.rejectText}
                    </button>
                </div>
            </div>
        )
    );
}

export default ConfirmPopup;