import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';

// Add ta.json / hi.json here when translations are ready; the Language sheet already lists them.
export const supportedLanguages = ['en'] as const;

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
