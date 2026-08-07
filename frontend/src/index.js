import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const PWA_CLEANUP_VERSION = '1';
const PWA_CLEANUP_KEY = 'pwaCleanupVersion';

async function cleanupOldPwaData() {
    if (
        localStorage.getItem(PWA_CLEANUP_KEY) ===
        PWA_CLEANUP_VERSION
    ) {
        return;
    }

    try {
        if ('serviceWorker' in navigator) {
            const registrations =
                await navigator.serviceWorker.getRegistrations();

            await Promise.all(
                registrations.map(registration =>
                    registration.unregister()
                )
            );
        }

        if ('caches' in window) {
            const cacheNames = await caches.keys();

            await Promise.all(
                cacheNames.map(cacheName =>
                    caches.delete(cacheName)
                )
            );
        }

        localStorage.setItem(
            PWA_CLEANUP_KEY,
            PWA_CLEANUP_VERSION
        );

        window.location.reload();
    }
    catch (error) {
        console.error('Errore durante la pulizia PWA:', error);
    }
}

cleanupOldPwaData();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA


// disabled for infinityfree
//serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
