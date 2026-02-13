export type Language = 'en' | 'pl';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_PAGE_COUNT = 50;
export const MEDICARE_PROXY_RATIO = 0.72;
export const PA_DOH_HOTLINE = "1-800-254-5164";
export const PA_DOI_HOTLINE = "1-877-881-6388";
export const PA_DOI_PORTAL_URL = "https://www.insurance.pa.gov/nosurprises";
export const TRANSPARENCY_TOOL_DISCLAIMER = `
This Billing Transparency Tool is provided strictly for educational purposes. 
1. This tool does not provide legal, financial, or medical advice.
2. The analysis is based on illustrative benchmarks (Medicare Proxy Data) and does not guarantee that your insurer or provider is in violation of the law.
3. Privacy Guarantee: This tool operates entirely within your browser. No Personal Health Information (PHI) or Personally Identifiable Information (PII) is transmitted to any server. 
4. Memory Purge: All raw text is purged from memory immediately after analysis. Only redacted summaries are stored in your local history.
5. Statutory Reference: All reviews are conducted against the standards of PA Act 102 and the Federal No Surprises Act.
`;
export const PA_DOI_DISCLAIMER = "This educational assistant does not constitute legal advice. For formal disputes, contact the PA Department of Insurance at 1-877-881-6388.";
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
export const GLOSSARY_TERMS: Record<Language, { term: string; definition: string }[]> = {
  en: [
    { term: "Adjustment", definition: "The difference between the provider's charge and the allowed amount, usually written off by the provider." },
    { term: "Allowed Amount", definition: "The maximum amount a plan will pay for a covered health care service." },
    { term: "Balance Billing", definition: "When a provider bills you for the difference between their charge and the allowed amount. Often prohibited by the No Surprises Act." },
    { term: "CPT Code", definition: "Current Procedural Terminology. A 5-digit code used to describe medical, surgical, and diagnostic services." },
    { term: "Act 102 (PA)", definition: "Pennsylvania law requiring hospitals to provide an itemized bill within 30 days of a request." },
    { term: "FAP", definition: "Financial Assistance Policy. Hospital programs providing free or discounted care based on income." }
  ],
  pl: [
    { term: "Korekta (Adjustment)", definition: "Różnica między opłatą dostawcy a kwotą dopuszczalną, zazwyczaj umarzana przez dostawcę." },
    { term: "Kwota Dopuszczalna", definition: "Maksymalna kwota, jaką plan zapłaci za objętą usługę opieki zdrowotnej." },
    { term: "Ustawa 102 (PA)", definition: "Prawo Pensylwanii wymagające od szpitali dostarczenia szczegółowego rachunku w ciągu 30 dni od żądania." }
  ]
};
export const PA_RESOURCES: Record<Language, { name: string; description: string; url: string }[]> = {
  en: [
    { name: "PA Insurance Department", description: "State agency overseeing insurance and enforcing the No Surprises Act in Pennsylvania.", url: "https://www.insurance.pa.gov/" },
    { name: "PA Health Law Project", description: "Provides free legal services to Pennsylvanians having trouble accessing healthcare.", url: "https://www.phlp.org/" }
  ],
  pl: [
    { name: "Departament Ubezpieczeń PA", description: "Agencja stanowa nadzorująca ubezpieczenia.", url: "https://www.insurance.pa.gov/" }
  ]
};
export const PA_REVIEW_TAXONOMY: Record<string, string> = {
  'balance-billing': 'No Surprises Act - 42 U.S.C. § 300gg-111',
  'act-102-triad': 'PA Act 102 § 3 (Right to Itemized Bill / Emergency Protections)',
  'act-102-billing-error': 'PA Act 102 § 5 (Accuracy Standards)',
  'act-102-itemization-fail': 'PA Act 102 § 3 (Itemized Statement Requirement)',
  'upcoding-detected': 'PA Act 102 Quality Standards',
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
      const hasOON = text.includes('OUT-OF-NETWORK') || text.includes('NON-PARTICIPATING') || text.includes('OON');
      return hasEmergency && hasOON;
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
      body: "To: Billing Department\nRe: Request for Itemized Bill (PA Act 102)\n\nI am writing to request a detailed, itemized statement for services rendered on {SERVICE_DATE} (Account: {ACCOUNT_NUMBER}). Pursuant to Pennsylvania Act 102 § 3, I am entitled to receive a complete itemized bill containing all CPT/HCPCS codes and individual pricing for each line item. Please provide this documentation immediately."
    }
  ],
  pl: [
    {
      id: "pl-itemized-request",
      name: "Wniosek o Rachunek Szczegółowy (Act 102)",
      description: "Poproś o szczegółowe zestawienie opłat zgodnie z prawem stanowym PA.",
      body: "Do: Dział Rozliczeń\nDotyczy: Wniosek o rachunek szczegółowy (PA Act 102)\n\nZwracam się z prośbą o dostarczenie szczegółowego zestawienia usług wykonanych w dniu {SERVICE_DATE} (Konto: {ACCOUNT_NUMBER})."
    }
  ]
};
export const CODE_PATTERNS = {
  cpt: /\b\d{5}(?:-[A-Z0-9]{2})?\b/g,
  hcpcs: /\b[A-Z]\d{4}\b/g,
  revenue: /\b\d{3,4}\b/g,
  icd10: /\b[A-TV-Z]\d{2}[A-Z0-9](\.\d[A-Z0-9]{0,4})?\b/g,
  policy: /\b(?:ID|Member|Policy|Group)\s*(?:#|No\.?)?\s*([A-Z0-9-]{6,15})\b/i,
  account: /\b(?:Account|Bill|Invoice|Patient)\s*(?:#|No\.?)?\s*([A-Z0-9-]{5,20})\b/i,
  date: /\b(0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d\b/g,
  zip: /\b\d{5}(?:-\d{4})?\b/g
};
export const INSURANCE_PATTERNS = {
  actuarial_value: /\b(?:AV|Actuarial Value)\s*(?::|is)?\s*(\d{2}(?:\.\d+)?%)\b/gi,
  mlr: /\b(?:MLR|Medical Loss Ratio)\s*(?::|is)?\s*(\d{2,3}(?:\.\d+)?%)\b/gi,
  rate_hike: /\b(?:Requested Rate Change|Impact)\s*(?::|is)?\s*([-+]?\d{1,2}(?:\.\d+)?%)\b/gi
};
export const REDACTION_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  phone: /\b(?:\+?1[-. ]?)?\(?([2-9][0-8][0-9])\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  dob: /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/g
};
export const PLAN_KEYWORDS = {
  MEDICAID: ['ACCESS', 'Medical Assistance', 'Medicaid', 'PA Health Options'],
  MEDICARE: ['Medicare', 'Part A', 'Part B', 'Medicare Advantage'],
  COMMERCIAL: ['Blue Cross', 'Highmark', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Keystone', 'UPMC Health Plan']
};