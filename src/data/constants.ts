export type Language = 'en' | 'pl';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_PAGE_COUNT = 50;
export const MEDICARE_PROXY_RATIO = 0.72;
export const PA_DOH_HOTLINE = "1-800-254-5164";
export const PA_DOI_HOTLINE = "1-877-881-6388";
export const PA_DOI_PORTAL_URL = "https://www.insurance.pa.gov/nosurprises";
export const PA_DOI_DISCLAIMER = "This tool is for educational purposes only and does not constitute legal or financial advice. For formal disputes, contact your insurer or the PA Department of Insurance (DOI) at 1-877-881-6388.";
export const BENCHMARK_DISCLAIMER = "Benchmarks are illustrative estimates based on Medicare proxy data (0.72 ratio) and may not reflect actual insurer-allowed amounts.";
export interface RuleContext {
  rawText: string;
  overcharges: any[];
  cpt: string[];
  planType: string;
}
export const ACT_102_REFERENCES = {
  SECTION_3: {
    title: "PA Act 102 § 3: Right to Itemized Statement",
    description: "Hospitals must provide an itemized bill within 30 days of request, including specific CPT/HCPCS codes and individual pricing.",
    remedy: "Request a formal itemized statement before payment."
  },
  SECTION_5: {
    title: "PA Act 102 § 5: Billing Accuracy Standards",
    description: "Bills must accurately reflect the services rendered. Overcharging or billing for services not provided violates state quality standards.",
    remedy: "Review line items against medical records for upcoding."
  },
  SECTION_7: {
    title: "PA Act 102 § 7: Emergency Care Protections",
    description: "Limits liability for patients receiving emergency care, preventing predatory out-of-network 'surprise' charges.",
    remedy: "Dispute via the No Surprises Act federal portal and PA DOI."
  }
};
export const PA_FACILITY_OBLIGATIONS = [
  "Provide an itemized bill within 30 days of written request.",
  "Screen patients for Financial Assistance Policy (FAP) eligibility before aggressive collection.",
  "Limit charges for emergency services to in-network cost-sharing levels.",
  "Disclose all facility fees prior to non-emergency treatment."
];
export const GLOSSARY_TERMS: Record<Language, { term: string; definition: string }[]> = {
  en: [
    { term: "Adjustment", definition: "The difference between the provider's charge and the allowed amount, usually written off by the provider." },
    { term: "Allowed Amount", definition: "The maximum amount a plan will pay for a covered health care service." },
    { term: "Balance Billing", definition: "When a provider bills you for the difference between their charge and the allowed amount. Often prohibited by the No Surprises Act." },
    { term: "CPT Code", definition: "Current Procedural Terminology. A 5-digit code used to describe medical, surgical, and diagnostic services." },
    { term: "Explanation of Benefits (EOB)", definition: "A statement from your insurer explaining what was covered and what you owe." },
    { term: "No Surprises Act", definition: "Federal law protecting patients from unexpected medical bills for emergency services." },
    { term: "Act 102 (PA)", definition: "Pennsylvania law requiring hospitals to provide an itemized bill within 30 days of a request." },
    { term: "FAP", definition: "Financial Assistance Policy. Hospital programs providing free or discounted care based on income." }
  ],
  pl: [
    { term: "Korekta (Adjustment)", definition: "Różnica między opłatą dostawcy a kwotą dopuszczalną, zazwyczaj umarzana przez dostawcę." },
    { term: "Kwota Dopuszczalna", definition: "Maksymalna kwota, jaką plan zapłaci za objętą usługę opieki zdrowotnej." },
    { term: "Balance Billing", definition: "Gdy dostawca wystawia rachunek na różnicę między jego opłatą a kwotą dopuszczalną. Często zabronione przez No Surprises Act." },
    { term: "Kod CPT", definition: "Current Procedural Terminology. 5-cyfrowy kod używany do opisu usług medycznych i diagnostycznych." },
    { term: "Wyjaśnienie Świadczeń (EOB)", definition: "Oświadczenie od ubezpieczyciela wyjaśniające, co zostało objęte ubezpieczeniem i ile jesteś winien." },
    { term: "No Surprises Act", definition: "Federalna ustawa chroniąca pacjentów przed nieoczekiwanymi rachunkami medycznymi za usługi ratunkowe." },
    { term: "Ustawa 102 (PA)", definition: "Prawo Pensylwanii wymagające od szpitali dostarczenia szczegółowego rachunku w ciągu 30 dni od żądania." }
  ]
};
export const PA_RESOURCES: Record<Language, { name: string; description: string; url: string }[]> = {
  en: [
    { name: "PA Insurance Department", description: "State agency overseeing insurance and enforcing the No Surprises Act in Pennsylvania.", url: "https://www.insurance.pa.gov/" },
    { name: "PA Health Law Project", description: "Provides free legal services to Pennsylvanians having trouble accessing healthcare.", url: "https://www.phlp.org/" },
    { name: "PA Attorney General", description: "Protects consumers from unfair business practices, including predatory billing.", url: "https://www.attorneygeneral.gov/" }
  ],
  pl: [
    { name: "Departament Ubezpieczeń PA", description: "Agencja stanowa nadzorująca ubezpieczenia i egzekwująca ustawę No Surprises Act w Pensylwanii.", url: "https://www.insurance.pa.gov/" },
    { name: "PA Health Law Project", description: "Zapewnia bezpłatne usługi prawne mieszkańcom Pensylwanii mającym problemy z dostępem do opieki zdrowotnej.", url: "https://www.phlp.org/" },
    { name: "Prokurator Generalny PA", description: "Chroni konsumentów przed nieuczciwymi praktykami biznesowymi, w tym drapieżnym fakturowaniem.", url: "https://www.attorneygeneral.gov/" }
  ]
};
export const PA_REVIEW_TAXONOMY: Record<string, string> = {
  'balance-billing': 'No Surprises Act - 42 U.S.C. § 300gg-111',
  'act-102-triad': 'PA Act 102 § 3 (Right to Itemized Bill / Emergency Protections)',
  'act-102-billing-error': 'PA Act 102 § 5 (Accuracy Standards)',
  'act-102-itemization-fail': 'PA Act 102 § 3 (Itemized Statement Requirement)',
  'act-102-emergency-protect': 'PA Act 102 § 7 (Emergency Care Limitations)',
  'fair-market-overcharge': 'Pennsylvania Unfair Trade Practices and Consumer Protection Law (UTPCPL)',
  'upcoding-detected': 'PA Act 102 Quality Standards',
  'unbundling-detected': 'PA Act 102 Quality Standards / CCI Edits',
  'excessive-rate-hike': 'PA PID Review Standard - Title 40 P.S. § 710.1',
  'mlr-non-compliance': 'ACA MLR Standard - 45 CFR Part 158'
};
export const FAIR_BENCHMARKS: Record<string, number> = {
  "99213": 135,
  "99214": 185,
  "99283": 320,
  "99284": 490,
  "80053": 55,
  "85025": 45
};
export const PA_RULES = [
  {
    id: 'balance-billing',
    name: 'Potential Balance Billing',
    description: 'Charge exceeds Fair Market Rate significantly, suggesting out-of-network balance billing.',
    severity: 'high' as const,
    check: (ctx: RuleContext) => ctx.overcharges.length > 0
  },
  {
    id: 'act-102-triad',
    name: 'Act 102 Triad Review Point',
    description: 'Bill contains Emergency services at a Facility with indications of non-participating status.',
    severity: 'high' as const,
    check: (ctx: RuleContext) => {
      const text = ctx.rawText.toUpperCase();
      const hasEmergency = text.includes('EMERGENCY') || text.includes('ER ') || text.includes('9928');
      const hasFacility = text.includes('HOSPITAL') || text.includes('CENTER') || text.includes('FACILITY');
      const hasOON = text.includes('OUT-OF-NETWORK') || text.includes('NON-PARTICIPATING') || text.includes('OON');
      return hasEmergency && hasFacility && hasOON;
    }
  },
  {
    id: 'act-102-itemization-fail',
    name: 'Incomplete Itemization',
    description: 'Bill appears to be a summary statement lacking mandatory line-item CPT/HCPCS detail required by PA Act 102.',
    severity: 'medium' as const,
    check: (ctx: RuleContext) => ctx.cpt.length === 0 && ctx.rawText.length > 500
  }
];
export const LETTER_TEMPLATES: Record<Language, { id: string; name: string; description: string; body: string }[]> = {
  en: [
    {
      id: "us-itemized-request",
      name: "Act 102 Itemized Bill Request",
      description: "Request a detailed breakdown of all charges as required by PA state law.",
      body: "To: Billing Department\nRe: Request for Itemized Bill (PA Act 102)\n\nI am writing to request a detailed, itemized statement for services rendered on {SERVICE_DATE} (Account: {ACCOUNT_NUMBER}). Pursuant to Pennsylvania Act 102 § 3, I am entitled to receive a complete itemized bill containing all CPT/HCPCS codes and individual pricing for each line item. Failure to provide this within 30 days constitutes a violation of my statutory rights in the Commonwealth. Please provide this documentation immediately."
    },
    {
      id: "nsa-violation",
      name: "No Surprises Act Dispute",
      description: "Dispute out-of-network charges for emergency services.",
      body: "To: Billing Department\nRe: Dispute of Out-of-Network Charges (No Surprises Act)\n\nI am formally disputing the bill for services on {SERVICE_DATE} at {PROVIDER_NAME}. As these were emergency services, federal law (42 U.S.C. § 300gg-111) and Pennsylvania Act 102 prohibit balance billing. My responsibility is limited to in-network cost-sharing amounts. I request a re-adjudication of this claim based on these protections."
    }
  ],
  pl: [
    {
      id: "pl-itemized-request",
      name: "Wniosek o Rachunek Szczegółowy (Act 102)",
      description: "Poproś o szczegółowe zestawienie opłat zgodnie z prawem stanowym PA.",
      body: "Do: Dział Rozliczeń\nDotyczy: Wniosek o rachunek szczegółowy (PA Act 102)\n\nZwracam się z prośbą o dostarczenie szczegółowego, wyszczególnionego zestawienia usług wykonanych w dniu {SERVICE_DATE} (Konto: {ACCOUNT_NUMBER}). Zgodnie z ustawą PA Act 102 § 3, mam prawo do otrzymania rachunku zawierającego kody CPT/HCPCS oraz indywidualne ceny za każdą pozycję. Proszę o dostarczenie go w ciągu 30 dni."
    }
  ]
};
export const CODE_PATTERNS = {
  cpt: /\b\d{5}(?:-[A-Z0-9]{2})?\b/g,
  hcpcs: /\b[A-Z]\d{4}\b/g,
  revenue: /\b\d{3,4}\b/g,
  icd10: /\b[A-TV-Z]\d{2}[A-Z0-9](\.\d[A-Z0-9]{0,4})?\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  amounts: /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?\b/g,
  policy: /\b(?:ID|Member|Policy|Group)\s*(?:#|No\.?)?\s*([A-Z0-9-]{6,15})\b/i,
  account: /\b(?:Account|Bill|Invoice|Patient)\s*(?:#|No\.?)?\s*([A-Z0-9-]{5,20})\b/i,
  date: /\b(0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d\b/g,
  npi: /\b\d{10}\b/g,
  zip: /\b\d{5}(?:-\d{4})?\b/g
};
export const INSURANCE_PATTERNS = {
  premium: /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?\s?\/\s?(?:mo|month|mbr)/gi,
  actuarial_value: /\b(?:AV|Actuarial Value)\s*(?::|is)?\s*(\d{2}(?:\.\d+)?%)\b/gi,
  mlr: /\b(?:MLR|Medical Loss Ratio)\s*(?::|is)?\s*(\d{2,3}(?:\.\d+)?%)\b/gi,
  county_code: /\b(?:FIPS|County Code)\s*(?::|#)?\s*(\d{5})\b/gi,
  rate_hike: /\b(?:Requested Rate Change|Impact)\s*(?::|is)?\s*([-+]?\d{1,2}(?:\.\d+)?%)\b/gi
};
export const REDACTION_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  phone: /\b(?:\+?1[-. ]?)?\(?([2-9][0-8][0-9])\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  dob: /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/g
};
export const PLAN_KEYWORDS = {
  MEDICAID: ['ACCESS', 'Medical Assistance', 'Medicaid', 'PA Health Options', 'Department of Human Services'],
  MEDICARE: ['Medicare', 'Part A', 'Part B', 'Medicare Advantage', 'CMS'],
  COMMERCIAL: ['Blue Cross', 'Highmark', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Keystone', 'UPMC Health Plan', 'Geisinger']
};