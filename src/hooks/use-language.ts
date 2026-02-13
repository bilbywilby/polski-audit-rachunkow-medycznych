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
        'nav.insurancerates': 'Insurance Rates',
        'privacy.active': 'SECURE LOCAL AUDIT',
        'privacy.tooltip': 'HIPAA-compliant processing. All data remains on your local machine.',
        'footer.privacy': 'BillGuard PA provides secure, local-first medical bill analysis. No data is transmitted to our servers. All processing happens in your browser.',
        'home.title': 'Pennsylvania Medical Bill Audit',
        'home.subtitle': "Audit your bills against PA Act 102 and the No Surprises Act.",
        'home.savings': 'Estimated Savings',
        'home.flagged': 'Total Flagged',
        'home.total': 'Total Scanned',
        'insurance.title': 'Insurance Rate Pipeline',
        'insurance.subtitle': 'Analyze SERFF filings, actuarial memos, and rate hike requests.',
        'insurance.upload': 'Upload Filing (PDF/XLSX)',
        'insurance.dashboard': 'Rate Hike Dashboard',
        'insurance.stats': 'Filing Statistics',
        'status.ingesting': 'Ingesting Document...',
        'status.analyzing_rates': 'Analyzing Actuarial Data...',
        'status.indexing': 'Updating Search Index...',
        'audit.start': 'Start New Audit',
        'history.empty': 'No audits found.',
        'letters.generate': 'Generate Dispute Letter',
        'common.back': 'Back',
        'common.delete': 'Delete'
      },
      pl: {
        'nav.dashboard': 'Panel sterowania',
        'nav.audit': 'Studio audytu',
        'nav.history': 'Historia',
        'nav.glossary': 'Słowniczek',
        'nav.resources': 'Zasoby PA',
        'nav.letters': 'Pisma odwoławcze',
        'nav.insurancerates': 'Stawki Ubezpieczeń',
        'privacy.active': 'PRYWATNOŚĆ LOKALNA',
        'privacy.tooltip': 'Wszystkie dane są przetwarzane lokalnie na Twoim urządzeniu.',
        'footer.privacy': 'BillGuard PA zapewnia bezpieczną, lokalną analizę rachunków. Żadne dane nie są przesyłane na serwer.',
        'home.title': 'Audyt Rachunków Medycznych',
        'home.subtitle': "Sprawdź rachunki zgodnie z prawem Pensylwanii.",
        'home.savings': 'Potencjalne oszczędności',
        'home.flagged': 'Kwota oflagowana',
        'home.total': 'Suma audytów',
        'insurance.title': 'Rurociąg Stawek Ubezpieczeniowych',
        'insurance.subtitle': 'Analizuj zgłoszenia SERFF i wnioski o podwyżki.',
        'insurance.upload': 'Prześlij dokument (PDF/XLSX)',
        'status.ingesting': 'Pobieranie dokumentu...',
        'status.analyzing_rates': 'Analiza danych...',
        'status.indexing': 'Indeksowanie...',
        'audit.start': 'Rozpocznij audyt',
        'history.empty': 'Brak audytów.',
        'letters.generate': 'Generuj pismo',
        'common.back': 'Wstecz',
        'common.delete': 'Usuń'
      }
    };
    return translations[language][key] || key;
  }, [language]);
  return { language, setLanguage, toggleLanguage, t };
}