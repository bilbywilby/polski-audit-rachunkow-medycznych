export type Language = 'en' | 'pl';
export const GLOSSARY_TERMS = {
  en: [
    { term: "Adjustment", definition: "The difference between the provider's charge and the allowed amount, usually written off by the provider." },
    { term: "Allowed Amount", definition: "The maximum amount a plan will pay for a covered health care service." },
    { term: "Assignment of Benefits", definition: "An agreement where the patient requests the insurance company to pay the provider directly." },
    { term: "Balance Billing", definition: "When a provider bills you for the difference between their charge and the allowed amount. Often prohibited by the No Surprises Act." },
    { term: "Bundling", definition: "Grouping several related procedures into one single code for billing purposes." },
    { term: "Co-insurance", definition: "Your share of the costs of a covered health care service, calculated as a percent of the allowed amount." },
    { term: "Co-payment", definition: "A fixed amount you pay for a covered health care service, usually when you receive the service." },
    { term: "CPT Code", definition: "Current Procedural Terminology. A 5-digit code used to describe medical, surgical, and diagnostic services." },
    { term: "Deductible", definition: "The amount you owe for health care services before your health insurance or plan begins to pay." },
    { term: "Denied Claim", definition: "A claim for payment that an insurance company refuses to pay." },
    { term: "Durable Medical Equipment (DME)", definition: "Equipment and supplies ordered by a health care provider for everyday or extended use." },
    { term: "Encounter Form", definition: "Also known as a superbill. A document used by providers to record services rendered for billing." },
    { term: "Explanation of Benefits (EOB)", definition: "A statement from your insurer explaining what was covered and what you owe." },
    { term: "HCPCS Code", definition: "Healthcare Common Procedure Coding System. Used primarily for billing supplies and services not in CPT." },
    { term: "ICD-10 Code", definition: "International Classification of Diseases, 10th Revision. Diagnostic codes used to track every condition." },
    { term: "Itemized Bill", definition: "A detailed statement showing every specific service, supply, and medication billed." },
    { term: "Medical Necessity", definition: "Health care services or supplies needed to prevent, diagnose, or treat an illness or injury." },
    { term: "Modifier", definition: "A two-digit code added to a CPT code to provide extra information about the service." },
    { term: "Network Provider", definition: "A provider who has a contract with your health insurer to provide services at discounted rates." },
    { term: "Out-of-Pocket Maximum", definition: "The most you have to pay for covered services in a plan year." },
    { term: "Pre-authorization", definition: "A decision by your health insurer that a service or drug is medically necessary." },
    { term: "Professional Component", definition: "The part of a service that is provided by the physician, distinct from the equipment or facility." },
    { term: "Revenue Code", definition: "A four-digit code used on hospital bills to tell the insurer which department the service was in." },
    { term: "Superbill", definition: "An itemized list of services used by providers to submit for reimbursement." },
    { term: "Telemedicine", definition: "Health care services provided using telecommunications technology." },
    { term: "Unbundling", definition: "The illegal practice of billing multiple codes for a procedure that should be billed under one code." },
    { term: "Upcoding", definition: "Assigning a higher-level code than the service actually performed to increase payment." },
    { term: "UCR (Usual, Customary, Reasonable)", definition: "The amount paid for a medical service in a geographic area based on what providers usually charge." },
    { term: "No Surprises Act", definition: "Federal law protecting patients from unexpected medical bills for emergency services." },
    { term: "Act 102 (PA)", definition: "Pennsylvania law requiring hospitals to provide an itemized bill within 30 days of a request." }
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
export const PID_RESOURCES = [
  { name: "PA Insurance Dept (PID) Filings", url: "https://www.insurance.pa.gov/Companies/ProductServices/Pages/Health-Insurance-Rate-Filings.aspx", type: "regulatory" },
  { name: "Pennie Public Portal", url: "https://pennie.com/", type: "exchange" },
  { name: "SERFF Public Access", url: "https://filingaccess.serff.com/sfa/home/pa", type: "data" }
];
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
export const PA_VIOLATION_TAXONOMY: Record<string, string> = {
  'balance-billing': 'No Surprises Act - 42 U.S.C. § 300gg-111',
  'act-102-triad': 'PA Act 102 § 3 (Right to Itemized Bill / Emergency Protections)',
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
export const FAIR_RATE_BENCHMARKS: Record<string, Record<string, number>> = {
  "Allegheny": { "Bronze": 380, "Silver": 495, "Gold": 590 },
  "Philadelphia": { "Bronze": 420, "Silver": 540, "Gold": 650 },
  "Montgomery": { "Bronze": 410, "Silver": 525, "Gold": 630 },
  "Default": { "Bronze": 400, "Silver": 510, "Gold": 610 }
};
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
  },
  {
    id: 'unbundling-detected',
    name: 'Potential Unbundling',
    description: 'Multiple related codes detected that should likely be billed as a single bundled procedure.',
    severity: 'medium' as const,
    check: (ctx: { cpt: string[] }) => {
      const hasOfficeVisit = ctx.cpt.some(c => c.startsWith('9921'));
      const hasMinorLab = ctx.cpt.some(c => c === '80053' || c === '85025');
      return hasOfficeVisit && hasMinorLab;
    }
  }
];
export const LETTER_TEMPLATES = {
  en: [
    {
      id: "us-itemized-request",
      name: "Act 102 Itemized Bill Request",
      description: "Request a detailed breakdown of all charges as required by PA state law.",
      body: "To: Billing Department\nRe: Request for Itemized Bill (PA Act 102)\n\nI am writing to request a detailed, itemized statement for services rendered on {SERVICE_DATE} (Account: {ACCOUNT_NUMBER}). Per PA Act 102, I am entitled to an itemized bill containing CPT/HCPCS codes and individual pricing for each line item. Please provide this within 30 days."
    },
    {
      id: "nsa-violation",
      name: "No Surprises Act Violation Dispute",
      description: "Dispute out-of-network charges for emergency services.",
      body: "To: Billing Department\nRe: Dispute of Out-of-Network Charges (No Surprises Act)\n\nI am formally disputing the bill for services on {SERVICE_DATE} at {PROVIDER_NAME}. As these were emergency services, federal law (42 U.S.C. § 300gg-111) prohibits balance billing. My responsibility should be limited to in-network cost-sharing amounts."
    },
    {
      id: "balance-billing-protest",
      name: "Balance Billing Protest",
      description: "General protest against being billed for the difference between provider charges and allowed amounts.",
      body: "To: {PROVIDER_NAME}\nRe: Balance Billing Protest\n\nI am writing to protest the balance billing of ${TOTAL_AMOUNT} on my account {ACCOUNT_NUMBER}. I believe these charges exceed the allowed amount under my plan and may violate Pennsylvania consumer protection laws regarding fair market pricing."
    },
    {
      id: "fmr-negotiation",
      name: "Fair Market Rate Negotiation",
      description: "Offer to pay based on local 80th percentile benchmarks.",
      body: "To: Billing Department\n\nI have audited my bill dated {BILL_DATE} and found that the charges exceed the 80th percentile for fair market rates in my ZIP code. I am prepared to settle this account for ${TOTAL_AMOUNT} (Fair Market Rate) to resolve this matter immediately."
    },
    {
      id: "financial-hardship",
      name: "Hardship/Financial Assistance",
      description: "Request a reduction based on financial need or charity care policies.",
      body: "To: Patient Financial Services\n\nI am writing to request financial assistance or a hardship discount for my bill totaling ${TOTAL_AMOUNT}. I am a resident of Pennsylvania and would like to apply for any charity care or payment plan programs your facility offers under state guidelines."
    },
    {
      id: "error-correction",
      name: "Error Correction Request",
      description: "Request correction of specific coding errors like unbundling or upcoding.",
      body: "To: Coding and Billing Department\n\nUpon review of my itemized bill, I have identified potential coding errors (Unbundling/Upcoding). Specifically, the CPT codes used do not accurately reflect the level of service documented. I request a formal coding review of account {ACCOUNT_NUMBER}."
    }
  ],
  pl: []
};