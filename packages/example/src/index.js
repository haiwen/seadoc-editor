import React from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import './setting.js';
import i18n from './_i18n';
import App from './App.js';


const root = createRoot(document.getElementById('root'));

root.render(
  <I18nextProvider i18n={ i18n }>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </I18nextProvider>
);
