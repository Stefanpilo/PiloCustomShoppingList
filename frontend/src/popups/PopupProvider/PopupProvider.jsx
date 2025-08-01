import { useState } from "react";
import { PopupContext } from "../PopupContext";

import ConfirmPopup from "../ConfirmPopup/ConfirmPopup";
import TextOnlyPopup from "../TextOnlyPopup/TextOnlyPopup";

import './PopupProvider.css';

export function PopupProvider({ children }) {
    const [textOnlyPopup, setTextOnlyPopup] = useState({ message: '' });
    const [confirmPopup, setConfirmPopup] = useState({ message: '' });
    const confirmPopupResponse = (message, options = {}) => {
        return new Promise((resolve) => {
            setConfirmPopup({
                message,
                acceptText: options.acceptText || 'Sì',
                rejectText: options.rejectText || 'No',
                resolve
            });
        });
    };
    return (
        <PopupContext.Provider value={{ textOnlyPopup, setTextOnlyPopup, confirmPopup, setConfirmPopup, confirmPopupResponse }} >
            {children}
            <TextOnlyPopup />
            <ConfirmPopup />
        </PopupContext.Provider>
    );
}