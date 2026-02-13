export type Language = 'pl' | 'en';
export const GLOSSARY_TERMS = {
  pl: [
    { term: "PESEL redakcja", definition: "Proces usuwania lub maskowania 11-cyfrowego numeru identyfikacyjnego w celu ochrony prywatności." },
    { term: "NFZ Refundacja", definition: "Pokrycie części lub ca��ości kosztów leków, wyrobów medycznych i świadczeń ze środków publicznych." },
    { term: "Ubezpieczenie zdrowotne", definition: "Obowiązkowa składka uprawniająca do bezpłatnej opieki medycznej w ramach publicznego systemu (NFZ)." },
    { term: "IKP (Internetowe Konto Pacjenta)", definition: "Bezpłatna aplikacja Ministerstwa Zdrowia z historią leczenia, e-receptami i skierowaniami." },
    { term: "Współpłacenie", definition: "Sytuacja, w której pacjent pokrywa częś�� kosztów świadczenia mimo posiadania ubezpieczenia." },
    { term: "Kod ICD-10", definition: "Międzynarodowa klasyfikacja chorób używana do celów statystycznych i rozliczeniowych." },
    { term: "Kod CPT/ICD-9 PL", definition: "Kody procedur medycznych używane do opisu wykonanych badań i zabiegów." },
    { term: "RODO", definition: "Ogólne rozporządzenie o ochronie danych osobowych obowiązujące w UE, chroniące dane medyczne." },
    { term: "Rzecznik Praw Pacjenta", definition: "Organ nadzorujący przestrzeganie praw pacjenta w podmiotach leczniczych." },
    { term: "Karta DILO", definition: "Karta diagnostyki i leczenia onkologicznego, uprawniająca do szybkiej ścieżki onkologicznej." },
    { term: "Sanatorium", definition: "Zakład lecznictwa uzdrowiskowego wykorzystujący naturalne zasoby w procesie rehabilitacji." },
    { term: "SOR (Szpitalny Oddział Ratunkowy)", definition: "Miejsce udzielania pomocy w stanach nagłego zagrożenia życia lub zdrowia." },
    { term: "Skierowanie", definition: "Dokument wystawiony przez lekarza uprawniający do badań lub wizyt u specjalisty." },
    { term: "Dokumentacja medyczna", definition: "Zbiór danych o stanie zdrowia pacjenta, do której pacjent ma ustawowe prawo wglądu." },
    { term: "Upcoding (Zawyżanie)", definition: "Nielegalna praktyka polegająca na wpisywaniu droższych kodów procedur niż faktycznie wykonane." }
  ],
  en: [
    { term: "Allowed Amount", definition: "The maximum amount a plan will pay for a covered health care service." },
    { term: "Balance Billing", definition: "When a provider bills you for the difference between their charge and the allowed amount." },
    { term: "CPT Code", definition: "Current Procedural Terminology. A 5-digit code used to describe medical services." },
    { term: "ICD-10 Code", definition: "International Classification of Diseases diagnostic codes." },
    { term: "No Surprises Act", definition: "Federal law protecting patients from unexpected medical bills." },
    { term: "PESEL Redaction", definition: "The process of masking the Polish identification number for privacy." },
    { term: "NFZ", definition: "National Health Fund - the public payer in Poland." }
  ]
};
export const PA_RESOURCES = {
  pl: [
    { name: "NFZ (Narodowy Fundusz Zdrowia)", description: "Publiczny płatnik finansujący świadczenia opieki zdrowotnej.", url: "https://www.nfz.gov.pl/" },
    { name: "pacjent.gov.pl", description: "Oficjalny portal Ministerstwa Zdrowia i NFZ dla pacjentów.", url: "https://pacjent.gov.pl/" },
    { name: "Rzecznik Praw Pacjenta", description: "Organ dbający o ochron�� praw pacjentów w Polsce.", url: "https://www.gov.pl/web/rpp" },
    { name: "Biuro Rzecznika Finansowego", description: "Pomoc w sporach z ubezpieczycielami (ubezpieczenia dobrowolne).", url: "https://rf.gov.pl/" }
  ],
  en: [
    { name: "PA Insurance Department", description: "State agency for filing complaints about medical billing.", url: "https://www.insurance.pa.gov/" },
    { name: "PA Health Law Project", description: "Legal aid providing free services for healthcare access issues.", url: "https://www.phlp.org/" }
  ]
};
export const CODE_PATTERNS = {
  cpt: /\b\d{5}(?:-[A-Z0-9]{2})?\b/g,
  icd10: /\b[A-TV-Z]\d{2}[A-Z0-9](\.\d[A-Z0-9]{0,4})?\b/g,
  pesel: /\b\d{11}\b/g,
  amounts: /(?:PLN|zł|\$)\s?\d+(?:[.,]\d{3})*(?:[.,]\d{2})?\b/g,
  policy: /\b(?:ID|Nr|Polisa|Member)\s*(?:#|No\.?)?\s*([A-Z0-9-]{6,15})\b/i,
  account: /\b(?:Konto|Faktura|Account|Bill|Invoice)\s*(?:#|No\.?)?\s*([A-Z0-9-]{5,20})\b/i,
  date: /\b(0?[1-9]|[12][0-9]|3[01])[- /.](0?[1-9]|1[012])[- /.](19|20)\d\d\b/g,
  dateAlt: /\b(0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d\b/g
};
export const REDACTION_PATTERNS = {
  pesel: /\b\d{11}\b/g,
  phone: /\b(?:\+?48)?\s?\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  dob: /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/g
};
export const PA_COST_BENCHMARKS = [
  { code: "KONS-01", description: "Konsultacja specjalistyczna (NFZ)", avgCost: 180 },
  { code: "MORF-01", description: "Morfologia krwi pełna", avgCost: 25 },
  { code: "EKG-01", description: "EKG spoczynkowe", avgCost: 50 },
  { code: "USG-01", description: "USG jamy brzusznej", avgCost: 150 },
  { code: "99213", description: "Office Visit (Standard)", avgCost: 110 }
];
export const PA_RULES = [
  {
    id: 'pesel-leak',
    name: 'Wykryto PESEL',
    description: 'Dokument zawiera niezaszyfrowany numer PESEL. Zalecana natychmiastowa redakcja.',
    severity: 'high' as const,
    check: (ctx: { rawText: string; codes: string[]; overcharges: any[] }) => {
      // Use match() instead of test() to avoid stateful /g regex bugs
      const matches = ctx.rawText.match(CODE_PATTERNS.pesel);
      return !!(matches && matches.length > 0);
    }
  },
  {
    id: 'nfz-overcharge',
    name: 'Ryzyko nadpłaty',
    description: 'Kwota świadczenia przekracza średnie stawki NFZ dla tej procedury.',
    severity: 'medium' as const,
    check: (ctx: { rawText: string; codes: string[]; overcharges: any[] }) => ctx.overcharges.length > 0
  }
];
export const LETTER_TEMPLATES = {
  pl: [
    {
      id: "pl-invoice-request",
      name: "Żądanie faktury szczegółowej",
      description: "Formalne pismo o wydanie szczegółowego zestawienia kosztów leczenia.",
      body: "Miejscowość: {CITY}, Data: {CURRENT_DATE}\n\nZwracam się z uprzejmą prośbą o wydanie szczegółowej faktury (rachunku) za usługi medyczne wykonane w dniu {SERVICE_DATE} przez {PROVIDER_NAME} dla pacjenta {PATIENT_NAME} (Nr konta: {ACCOUNT_NUMBER}). Dokument powinien zawierać kody procedur medycznych oraz jednostkowe ceny świadczeń."
    },
    {
      id: "pl-nfz-dispute",
      name: "Spór dot. refundacji NFZ",
      description: "Odwołanie od odmowy sfinansowania świadczenia przez fundusz.",
      body: "Dotyczy: Odmowa finansowania świadczenia z dnia {SERVICE_DATE}.\n\nNiniejszym składam odwołanie od decyzji o odmowie refundacji kosztów leczenia w kwocie {TOTAL_AMOUNT}. Moim zdaniem procedura {CODE_LIST} powinna zostać zakwalifikowana jako świadczenie gwarantowane."
    },
    {
      id: "pl-financial-aid",
      name: "Wniosek o pomoc finansową",
      description: "Prośba o umorzenie części kosztów ze względu na trudną sytuację.",
      body: "W związku z trudną sytuacją materialną, zwracam się z prośbą o rozważenie możliwości obniżenia opłaty za leczenie w dniu {SERVICE_DATE}. Kwota do zapłaty wynosi {TOTAL_AMOUNT}. Proszę o potraktowanie wniosku jako prośby o pomoc socjalną."
    },
    {
      id: "pl-coding-dispute",
      name: "Odwołanie od wyceny",
      description: "Zakwestionowanie błędnie naliczonych kodów procedur medycznych.",
      body: "Kwestionuję poprawność naliczenia opłat za procedury {CODE_LIST}. Z moich informacji wynika, że stawki te odbiegają od standardowych cenników regionalnych: {BENCHMARK_COMPARISON}."
    },
    {
      id: "pl-installments",
      name: "Propozycja spłaty w ratach",
      description: "Wniosek o rozłożenie płatności na dogodne raty miesięczne.",
      body: "Proponuję rozłożenie płatności za fakturę {ACCOUNT_NUMBER} na {RATY} miesięcznych rat po {KWOTA} PLN każda. Proszę o potwierdzenie akceptacji harmonogramu."
    },
    {
      id: "pl-documentation",
      name: "Wniosek o dokumentację",
      description: "Wniosek o wydanie kopii pełnej dokumentacji medycznej.",
      body: "Na podstawie ustawy o prawach pacjenta, wnoszę o wydanie kopii dokumentacji medycznej z leczenia w okresie od {START_DATE} do {END_DATE}. Dokumentację odbiorę osobiście."
    }
  ],
  en: []
};