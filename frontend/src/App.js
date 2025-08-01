import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { PopupProvider } from './popups/PopupProvider/PopupProvider';
import { GlobalProvider, useGlobalContext } from './context/GlobalContext';
import { AuthProvider } from './context/AuthContext';

import LoginPage from './components/LoginPage/LoginPage';
import HomePage from './components/HomePage/HomePage';
import NewList from './components/NewList/NewList';
import ListDetails from './components/ListDetails/ListDetails';

import './shared.css';

function App() {

  return (
    <BrowserRouter>
      <PopupProvider>
        <GlobalProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </GlobalProvider> 
      </PopupProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { ROUTES } = useGlobalContext();
  
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.NEW_LIST} element={<NewList />} />
      <Route path={`${ROUTES.LIST_DETAILS}/:listName`} element={<ListDetails />}/>
      <Route path={ROUTES.LOGIN_PAGE} element={<LoginPage />}/>
    </Routes>
  );
}

export default App;