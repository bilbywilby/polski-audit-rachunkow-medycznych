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
        'nav.audit': 'Education Assistant',
        'nav.history': 'Review History',
        'nav.glossary': 'Billing Glossary',
        'nav.resources': 'PA State Resources',
        'nav.letters': 'Dispute Letters',
        'nav.insurancerates': 'Insurance Rates',
        'privacy.active': 'SECURE LOCAL REVIEW',
        'privacy.tooltip': 'Patient education processing. All data remains on your local machine.',
        'footer.privacy': 'BillGuard PA provides secure, local-first patient education for medical bills. No data is transmitted to our servers. Raw sensitive text is purged after analysis.',
        'home.title': 'PA Medical Education Assistant',
        'home.subtitle': "Review your bills against PA Act 102 benchmarks.",
        'home.savings': 'Potential Review Recovery',
        'home.flagged': 'Review Points',
        'home.total': 'Total Reviewed',
        'insurance.title': 'Insurance Rate Monitor',
        'insurance.subtitle': 'Educational tracking of PA carrier rate filings.',
        'status.ingesting': 'Processing Document...',
        'status.analyzing_rates': 'Analyzing Benchmarks...',
        'status.indexing': 'Updating History...',
        'audit.start': 'Start Education Review',
        'history.empty': 'No sessions found.',
        'letters.generate': 'Generate Dispute Letter',
        'common.back': 'Back',
        'common.delete': 'Delete'
      },
      pl: {
        'nav.dashboard': 'Panel sterowania',
        'nav.audit': 'Asystent edukacyjny',
        'nav.history': 'Historia przeglądów',
        'nav.glossary': 'Słowniczek',
        'nav.resources': 'Zasoby PA',
        'nav.letters': 'Pisma odwoławcze',
        'nav.insurancerates': 'Stawki Ubezpieczeń',
        'privacy.active': 'PRZEGLĄD LOKALNY',
        'privacy.tooltip': 'Wszystkie dane są przetwarzane lokalnie na Twoim urządzeniu w celach edukacyjnych.',
        'footer.privacy': 'BillGuard PA zapewnia bezpieczną, lokalną edukację pacjentów. Żadne dane nie są przesyłane na serwer.',
        'home.title': 'Asystent Edukacji Medycznej PA',
        'home.subtitle': "Sprawdź rachunki zgodnie z prawem Pensylwanii.",
        'home.savings': 'Potencjalny odzysk',
        'home.flagged': 'Punkty do przeglądu',
        'home.total': 'Suma przeglądów',
        'insurance.title': 'Monitor Stawek Ubezpieczeniowych',
        'insurance.subtitle': 'Śledzenie zgłoszeń stawek ubezpieczeniowych w PA.',
        'status.ingesting': 'Pobieranie dokumentu...',
        'status.analyzing_rates': 'Analiza wska��ników...',
        'status.indexing': 'Indeksowanie historii...',
        'audit.start': 'Rozpocznij przegląd',
        'history.empty': 'Brak historii.',
        'letters.generate': 'Generuj pismo',
        'common.back': 'Wstecz',
        'common.delete': 'Usuń'
      }
    };
    return translations[language][key] || key;
  }, [language]);
  return { language, setLanguage, toggleLanguage, t };
}