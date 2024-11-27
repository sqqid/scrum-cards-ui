import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Page from './components/page';
import { ClientProvider } from "./components/contexts/client-context";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ClientProvider>
      <Page />
    </ClientProvider>
  </React.StrictMode>
);
