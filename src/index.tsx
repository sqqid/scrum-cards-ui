import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Page from './components/Page';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <Page/>
    </React.StrictMode>
);
