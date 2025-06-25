import { createContext, useContext } from "react";

import './PopupContext.css';

export const PopupContext = createContext();

export function usePopup() {
    return useContext(PopupContext);
}