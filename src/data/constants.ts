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
    { term: "Explanation of Benefits (EOB)", definition: "A statement from your insurer explaining what was covered and what you owe." },
    { term: "Deductible", definition: "The amount you pay for health care services before your health insurance begins to pay." },
    { term: "Co-insurance", definition: "Your share of the costs of a covered health care service, calculated as a percent." },
    { term: "Co-payment", definition: "A fixed amount you pay for a covered health care service." },
    { term: "Out-of-Pocket Maximum", definition: "The most you have to pay for covered services in a plan year." },
    { term: "Upcoding", definition: "The practice of assigning a higher-level billing code than the service actually provided." },
    { term: "Unbundling", definition: "Billing for each step of a procedure separately rather than using a single comprehensive code." },
    { term: "In-Network", definition: "Providers or facilities that have a contract with your health insurance plan." },
    { term: "Revenue Code", definition: "A 4-digit code identifying the specific department or location where a service was provided." },
    { term: "Chargemaster", definition: "A comprehensive list of every service and item provided by a hospital and its 'sticker price'." },
    { term: "Advance Beneficiary Notice (ABN)", definition: "A notice given to Medicare beneficiaries when a service may not be covered." },
    { term: "Prior Authorization", definition: "Approval from a health plan that may be required before you get a service." },
    { term: "Summary of Benefits and Coverage (SBC)", definition: "A document that outlines what the plan covers and costs." }
  ],
  pl: []
};
export const PA_RESOURCES = {
  en: [
    { name: "PA Insurance Department", description: "The state agency responsible for overseeing insurance and enforcing the No Surprises Act in Pennsylvania.", url: "https://www.insurance.pa.gov/" },
    { name: "PA Health Law Project", description: "Provides free legal services to Pennsylvanians having trouble accessing healthcare or insurance.", url: "https://www.phlp.org/" },
    { name: "CMS No Surprises Help Desk", description: "Federal help desk for questions and complaints about the No Surprises Act.", url: "https://www.cms.gov/nosurprises/consumers" },
    { name: "PA Attorney General", description: "Protects consumers from unfair business practices, including predatory medical billing.", url: "https://www.attorneygeneral.gov/" }
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
  npi: /\b\d{10}\b/g
};
export const REDACTION_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  phone: /\b(?:\+?1[-. ]?)?\(?([2-9][0-8][0-9])\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  dob: /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/g
};
export const PA_COST_BENCHMARKS = [
  { code: "99213", description: "Office Visit (Level 3)", avgCost: 115 },
  { code: "99214", description: "Office Visit (Level 4)", avgCost: 165 },
  { code: "99283", description: "Emergency Dept Visit (Level 3)", avgCost: 280 },
  { code: "99284", description: "Emergency Dept Visit (Level 4)", avgCost: 450 },
  { code: "80053", description: "Comprehensive Metabolic Panel", avgCost: 45 },
  { code: "85025", description: "Complete Blood Count", avgCost: 35 }
];
export const PA_RULES = [
  {
    id: 'balance-billing',
    name: 'Potential Balance Billing',
    description: 'Billed amount appears significantly higher than average allowed amounts, suggesting a potential out-of-network charge violation.',
    severity: 'high' as const,
    check: (ctx: { rawText: string; codes: string[]; overcharges: any[] }) => ctx.overcharges.length > 0
  },
  {
    id: 'act-102-violation',
    name: 'Act 102 Rights',
    description: 'Under Pennsylvania Act 102, you have the right to a detailed itemized bill from hospitals.',
    severity: 'medium' as const,
    check: () => true // Always relevant for PA bills
  }
];
export const LETTER_TEMPLATES = {
  en: [
    {
      id: "us-itemized-request",
      name: "Act 102 Itemized Bill Request",
      description: "Request a detailed breakdown of all charges as required by PA state law.",
      body: "To: Billing Department\nRe: Request for Itemized Bill (PA Act 102)\n\nI am writing to request a detailed, itemized statement for services rendered on {SERVICE_DATE} (Account: {ACCOUNT_NUMBER}). Per PA Act 102, I am entitled to an itemized bill containing CPT/HCPCS codes and individual pricing for each line item."
    },
    {
      id: "us-surprise-dispute",
      name: "No Surprises Act Dispute",
      description: "Challenge an out-of-network charge for emergency services.",
      body: "I am disputing the charges on this bill as they appear to violate the federal No Surprises Act. I received emergency services at {PROVIDER_NAME} on {SERVICE_DATE}. Under the Act, patients are protected from balance billing for emergency care."
    },
    {
      id: "us-charity-care",
      name: "Financial Aid / Charity Care",
      description: "Apply for hospital financial assistance based on income.",
      body: "I am writing to request a financial assistance application for my bill dated {SERVICE_DATE}. I would like to be screened for Charity Care or a sliding scale discount based on my current financial situation."
    }
  ],
  pl: []
};