export type Language = 'en' | 'pl';
export const GLOSSARY_TERMS = {
  en: [
    { term: "Allowed Amount", definition: "The maximum amount a plan will pay for a covered health care service." },
    { term: "Balance Billing", definition: "When a provider bills you for the difference between their charge and the allowed amount. Often prohibited by the No Surprises Act." },
    { term: "CPT Code", definition: "Current Procedural Terminology. A 5-digit code used to describe medical, surgical, and diagnostic services." },
    { term: "HCPCS Code", definition: "Healthcare Common Procedure Coding System. Used primarily for billing supplies, injectables, and services not in CPT." },
    { term: "ICD-10 Code", definition: "International Classification of Diseases, 10th Revision. Diagnostic codes used to track every condition." },
    { term: "No Surprises Act", definition: "Federal law protecting patients from unexpected medical bills for out-of-network emergency services." },
    { term: "Act 102 (PA)", definition: "Pennsylvania law requiring hospitals to provide an itemized bill within 30 days of a request." },
    { term: "Explanation of Benefits (EOB)", definition: "A statement from your insurer explaining what was covered and what you owe." }
  ],
  pl: []
};
export const PA_RESOURCES = {
  en: [
    { name: "PA Insurance Department", description: "State agency overseeing insurance and enforcing the No Surprises Act in Pennsylvania.", url: "https://www.insurance.pa.gov/" },
    { name: "PA Health Law Project", description: "Provides free legal services to Pennsylvanians having trouble accessing healthcare.", url: "https://www.phlp.org/" },
    { name: "PA Attorney General", description: "Protects consumers from unfair business practices, including predatory billing.", url: "https://www.attorneygeneral.gov/" }
  ],
  pl: []
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
export const PA_VIOLATION_TAXONOMY: Record<string, string> = {
  'balance-billing': 'No Surprises Act - 42 U.S.C. § 300gg-111',
  'act-102-triad': 'PA Act 102 § 3 (Right to Itemized Bill / Emergency Protections)',
  'fair-market-overcharge': 'Pennsylvania Unfair Trade Practices and Consumer Protection Law (UTPCPL)',
  'upcoding-detected': 'PA Act 102 Quality Standards'
};
export const FAIR_BENCHMARKS: Record<string, number> = {
  "99213": 135,
  "99214": 185,
  "99283": 320,
  "99284": 490,
  "80053": 55,
  "85025": 45
};
export const PA_COST_BENCHMARKS = [
  { code: "99213", description: "Office Visit (Level 3)", avgCost: 115 },
  { code: "99214", description: "Office Visit (Level 4)", avgCost: 165 },
  { code: "99283", description: "Emergency Dept Visit (Level 3)", avgCost: 280 },
  { code: "99284", description: "Emergency Dept Visit (Level 4)", avgCost: 450 }
];
export const PA_RULES = [
  {
    id: 'balance-billing',
    name: 'Potential Balance Billing',
    description: 'Charge exceeds Fair Market Rate significantly, suggesting out-of-network balance billing.',
    severity: 'high' as const,
    check: (ctx: { overcharges: any[] }) => ctx.overcharges.length > 0
  },
  {
    id: 'act-102-triad',
    name: 'Act 102 Triad Violation',
    description: 'Bill contains Emergency services at a Facility with indications of non-participating status.',
    severity: 'high' as const,
    check: (ctx: { rawText: string }) => {
      const text = ctx.rawText.toUpperCase();
      const hasEmergency = text.includes('EMERGENCY') || text.includes('ER ') || text.includes('9928');
      const hasFacility = text.includes('HOSPITAL') || text.includes('CENTER') || text.includes('FACILITY');
      const hasOON = text.includes('OUT-OF-NETWORK') || text.includes('NON-PARTICIPATING') || text.includes('OON');
      return hasEmergency && hasFacility && hasOON;
    }
  }
];
export const LETTER_TEMPLATES = {
  en: [
    {
      id: "us-itemized-request",
      name: "Act 102 Itemized Bill Request",
      description: "Request a detailed breakdown of all charges as required by PA state law.",
      body: "To: Billing Department\nRe: Request for Itemized Bill (PA Act 102)\n\nI am writing to request a detailed, itemized statement for services rendered on {SERVICE_DATE} (Account: {ACCOUNT_NUMBER}). Per PA Act 102, I am entitled to an itemized bill containing CPT/HCPCS codes and individual pricing for each line item."
    }
  ],
  pl: []
};