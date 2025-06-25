import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PopupContext } from './popups/PopupContext';

import { GlobalProvider, useGlobalContext } from './context/GlobalContext';
import { AuthProvider } from './context/AuthContext';
import TextOnlyPopup from './popups/TextOnlyPopup';
import ConfirmPopup from './popups/ConfirmPopup';
import LoginPage from './components/LoginPage/LoginPage';
import HomePage from './components/HomePage/HomePage';
import NewList from './components/NewList/NewList';
import ListDetails from './components/ListDetails/ListDetails';

import './shared.css';

function App() {

  return (
    <GlobalProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GlobalProvider>
  );
}

function AppContent() {
  const { ROUTES } = useGlobalContext();
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
      <BrowserRouter>
        <TextOnlyPopup />
        <ConfirmPopup />
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.NEW_LIST} element={<NewList />} />
          <Route path={`${ROUTES.LIST_DETAILS}/:listName`} element={<ListDetails />}/>
          <Route path={ROUTES.LOGIN_PAGE} element={<LoginPage />}/>
        </Routes>
      </BrowserRouter>
    </PopupContext.Provider>
  );
}

export default App;
