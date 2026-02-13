import { useState, useEffect, useCallback } from 'react';
export type Language = 'en' | 'pl';
export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);
  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'en' ? 'pl' : 'en'));
  }, []);
  const t = useCallback((key: string) => {
    const translations: Record<Language, Record<string, string>> = {
      en: {
        'nav.dashboard': 'Dashboard',
        'nav.audit': 'Audit Studio',
        'nav.history': 'History',
        'nav.glossary': 'Glossary',
        'nav.resources': 'PA Resources',
        'nav.letters': 'Letters',
        'privacy.active': 'Local Privacy Active',
        'privacy.tooltip': 'HIPAA-compliant local processing. Data never leaves your device.',
        'footer.rodo': 'BillGuard PA follows HIPAA-friendly privacy principles. All PDF analysis and data extraction occurs entirely within your browser memory.',
        'home.title': 'Pennsylvania Medical Bill Audit',
        'home.subtitle': "Audit your bills against the No Surprises Act.",
        'home.savings': 'Potential Savings',
        'home.flagged': 'Flagged Amount',
        'home.total': 'Total Audited'
      },
      pl: {
        'nav.dashboard': 'Panel',
        'nav.audit': 'Audyt Studio',
        'nav.history': 'Historia',
        'nav.glossary': 'Glosariusz',
        'nav.resources': 'Zasoby',
        'nav.letters': 'Pisma',
        'privacy.active': 'Prywatność aktywna',
        'privacy.tooltip': 'Dane nie opuszczają urządzenia.',
        'footer.rodo': 'Przetwarzanie lokalne zgodnie z zasadami prywatności.',
        'home.title': 'Audyt Rachunków Medycznych (PA)',
        'home.subtitle': "Sprawdź rachunki pod kątem No Surprises Act.",
        'home.savings': 'Potencjał oszczędności',
        'home.flagged': 'Kwota oflagowana',
        'home.total': 'Suma audytów'
      }
    };
    return translations[language][key] || key;
  }, [language]);
  return { language, setLanguage, toggleLanguage, t };
}