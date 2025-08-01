import { createContext, useContext } from "react";

export const PopupContext = createContext();

export function usePopup() {
    return useContext(PopupContext);
}