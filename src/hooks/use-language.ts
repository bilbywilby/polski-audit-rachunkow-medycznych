import { useState, useEffect, useCallback } from 'react';
export type Language = 'pl' | 'en';
export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'pl';
  });
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);
  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'pl' ? 'en' : 'pl'));
  }, []);
  const t = useCallback((key: string, context?: any) => {
    // Simple translation helper for UI strings
    const translations: Record<Language, Record<string, string>> = {
      pl: {
        'nav.dashboard': 'Panel',
        'nav.audit': 'Audyt Studio',
        'nav.history': 'Historia',
        'nav.glossary': 'Glosariusz',
        'nav.resources': 'Zasoby NFZ',
        'nav.letters': 'Szablony',
        'privacy.active': 'Tryb Prywatności Aktywny',
        'privacy.tooltip': 'Przetwarzanie odbywa się lokalnie w przeglądarce. Żadne dane nie opuszczają Twojego urządzenia.',
        'footer.rodo': 'BillGuard PA przetwarza dane zgodnie z zasadą "Privacy by Design". Nie przechowujemy Twoich faktur na naszych serwerach. Wszystkie operacje (analiza PDF, redakcja PESEL) zachodzą wył��cznie w pamięci Twojej przeglądarki.',
        'home.title': 'Polski Audyt Rachunków Medycznych',
        'home.subtitle': 'Nie płać rachunku, dopóki go nie sprawdzisz.',
        'home.savings': 'Potencjał Oszczędności',
        'home.flagged': 'Wykryte Nieprawidłowości',
        'home.total': 'Zeskanowano Ogółem'
      },
      en: {
        'nav.dashboard': 'Dashboard',
        'nav.audit': 'Audit Studio',
        'nav.history': 'History',
        'nav.glossary': 'Glossary',
        'nav.resources': 'Resources',
        'nav.letters': 'Letter Generator',
        'privacy.active': 'Privacy Mode Active',
        'privacy.tooltip': 'Processing occurs locally in your browser. No data leaves your device.',
        'footer.rodo': 'BillGuard PA processes data following "Privacy by Design" principles. We do not store your bills on our servers. All operations occur in your browser memory.',
        'home.title': 'Medical Bill Audit',
        'home.subtitle': "Don't pay a bill until you audit it.",
        'home.savings': 'Savings Potential',
        'home.flagged': 'Flagged Value',
        'home.total': 'Total Scanned'
      }
    };
    return translations[language][key] || key;
  }, [language]);
  return { language, setLanguage, toggleLanguage, t };
}