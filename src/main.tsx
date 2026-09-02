import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { NFCDashboard } from './components/public/NFCDashboard.tsx';
import './index.css';

const isNFC = window.location.pathname.startsWith('/cert/') || window.location.search.includes('cert=');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isNFC ? <NFCDashboard /> : <App />}
  </StrictMode>,
);
