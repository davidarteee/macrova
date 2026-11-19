import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ca from './ca.json';
import en from './en.json';

export const SUPPORTED_LANGUAGES = ['ca', 'en'] as const; // 'es' can be added by dropping in es.json
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const deviceLang = getLocales()[0]?.languageCode ?? 'ca';
const initial: Language = (SUPPORTED_LANGUAGES as readonly string[]).includes(deviceLang) ? (deviceLang as Language) : 'ca';

i18n.use(initReactI18next).init({
  resources: { ca: { translation: ca }, en: { translation: en } },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
