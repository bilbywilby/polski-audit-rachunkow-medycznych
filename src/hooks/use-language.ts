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
        'nav.history': 'Audit History',
        'nav.glossary': 'Billing Glossary',
        'nav.resources': 'PA State Resources',
        'nav.letters': 'Dispute Letters',
        'privacy.active': 'SECURE LOCAL AUDIT',
        'privacy.tooltip': 'HIPAA-compliant processing. All data remains on your local machine.',
        'footer.privacy': 'BillGuard PA is designed with a privacy-first architecture. No medical bills or personal health information (PHI) are transmitted to any server. All text extraction and auditing happens directly in your browser.',
        'home.title': 'Pennsylvania Medical Bill Audit',
        'home.subtitle': "Audit your bills against PA Act 102 and the No Surprises Act.",
        'home.savings': 'Estimated Savings',
        'home.flagged': 'Total Flagged',
        'home.total': 'Total Scanned'
      },
      pl: {
        'nav.dashboard': 'Panel sterowania',
        'nav.audit': 'Studio audytu',
        'nav.history': 'Historia',
        'nav.glossary': 'Słowniczek',
        'nav.resources': 'Zasoby PA',
        'nav.letters': 'Pisma odwoławcze',
        'privacy.active': 'PRYWATNOŚĆ LOKALNA',
        'privacy.tooltip': 'Wszystkie dane są przetwarzane lokalnie na Twoim urządzeniu.',
        'footer.privacy': 'BillGuard PA została zaprojektowana z myślą o prywatności. Żadne rachunki medyczne ani informacje o zdrowiu nie są przesyłane na serwer.',
        'home.title': 'Audyt Rachunków Medycznych',
        'home.subtitle': "Sprawdź swoje rachunki zgodnie z prawem stanu Pensylwania.",
        'home.savings': 'Potencjalne oszczędności',
        'home.flagged': 'Kwota oflagowana',
        'home.total': 'Suma audytów'
      }
    };
    return translations[language][key] || key;
  }, [language]);
  return { language, setLanguage, toggleLanguage, t };
}