export const GLOSSARY_TERMS = [
  { term: "Allowed Amount", definition: "The maximum amount a plan will pay for a covered health care service." },
  { term: "Balance Billing", definition: "When a provider bills you for the difference between their charge and the allowed amount. Often restricted under PA law." },
  { term: "Charge Master", definition: "A comprehensive list of every service, supply, and procedure a hospital provides, along with its specific price." },
  { term: "CPT Code", definition: "Current Procedural Terminology. A 5-digit code used to describe medical, surgical, and diagnostic services." },
  { term: "HCPCS Code", definition: "Healthcare Common Procedure Coding System. Used primarily for billing supplies, equipment, and services not in CPT." },
  { term: "ICD-10 Code", definition: "International Classification of Diseases, 10th Revision. Diagnostic codes used to classify every disease and symptom." },
  { term: "Revenue Code", definition: "4-digit codes that identify the specific department or cost center in a hospital where a service was provided." },
  { term: "Facility Fee", definition: "A charge for the use of a hospital or clinic building, separate from the professional fee of the doctor." },
  { term: "NPI Number", definition: "National Provider Identifier. A unique 10-digit identification number for covered health care providers." },
  { term: "EOB", definition: "Explanation of Benefits. A statement sent by a health insurance company to covered individuals explaining what medical treatments were paid for." },
  { term: "Upcoding", definition: "Assigning a higher-level billing code than the service actually performed to increase reimbursement." },
  { term: "Unbundling", definition: "Billing multiple services separately that should be billed under a single comprehensive code." },
  { term: "No Surprises Act", definition: "Federal law protecting patients from unexpected medical bills for out-of-network emergency services." },
  { term: "PA Act 32", definition: "Pennsylvania law requiring hospitals to have financial assistance policies for low-income patients." }
];
export const PA_RESOURCES = [
  { name: "PA Insurance Department", description: "State agency for filing complaints about medical billing and insurance coverage issues.", url: "https://www.insurance.pa.gov/pages/default.aspx" },
  { name: "PA Attorney General", description: "Consumer protection office handling healthcare fraud and deceptive billing practices in Pennsylvania.", url: "https://www.attorneygeneral.gov/" },
  { name: "PA Health Law Project", description: "Non-profit legal aid providing free services for low-income PA residents with healthcare access issues.", url: "https://www.phlp.org/" },
  { name: "PA Health Access Network", description: "Advocates for healthcare quality and affordability for all Pennsylvanians.", url: "https://pahealthaccess.org/" }
];
export const CODE_PATTERNS = {
  cpt: /\b\d{5}(?:-[A-Z0-9]{2})?\b/g,
  icd10: /\b[A-TV-Z]\d{2}[A-Z0-9](\.\d[A-Z0-9]{0,4})?\b/g,
  hcpcs: /\b[A-Z]\d{4}[A-Z]?\b/g,
  revenue: /\b(0\d{3}|[1-9]\d{3})\b/g,
  npi: /\b[1-9]\d{9}\b/g,
  amounts: /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?\b/g,
  policy: /\b(?:Group|Policy|ID|Member)\s*(?:#|No\.?)?\s*([A-Z0-9-]{6,15})\b/i,
  account: /\b(?:Account|Invoice|Bill|Statement)\s*(?:#|No\.?)?\s*([A-Z0-9-]{5,20})\b/i,
  date: /\b(0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d\b/g
};
export const REDACTION_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  phone: /\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  dob: /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/g
};
export const PA_COST_BENCHMARKS = [
  { code: "99213", description: "Office Visit (Est. Patient, Low Complexity)", avgCost: 110 },
  { code: "99214", description: "Office Visit (Est. Patient, Moderate Complexity)", avgCost: 165 },
  { code: "99215", description: "Office Visit (Est. Patient, High Complexity)", avgCost: 240 },
  { code: "99283", description: "ER Visit (Moderate Complexity)", avgCost: 350 },
  { code: "99284", description: "ER Visit (High Complexity)", avgCost: 580 },
  { code: "99285", description: "ER Visit (Highest Complexity/Life Threat)", avgCost: 890 },
  { code: "80053", description: "Comprehensive Metabolic Panel", avgCost: 45 },
  { code: "85025", description: "CBC with Differential", avgCost: 32 },
  { code: "71045", description: "Chest X-Ray (1 View)", avgCost: 95 },
  { code: "71046", description: "Chest X-Ray (2 Views)", avgCost: 125 },
  { code: "93000", description: "EKG (Routine)", avgCost: 65 },
  { code: "36415", description: "Routine Blood Draw", avgCost: 15 },
  { code: "45378", description: "Colonoscopy (Diagnostic)", avgCost: 1200 },
  { code: "70450", description: "CT Scan Head (No Contrast)", avgCost: 450 },
  { code: "74177", description: "CT Scan Abdomen/Pelvis (Contrast)", avgCost: 850 },
  { code: "77067", description: "Screening Mammography", avgCost: 185 },
  { code: "99203", description: "New Patient Office Visit (Moderate)", avgCost: 180 }
];
export interface RuleContext {
  rawText: string;
  codes: string[];
  overcharges: any[];
}
export const PA_RULES = [
  {
    id: 'balance-billing',
    name: 'Balance Billing Check',
    description: 'Potential No Surprises Act violation. Out-of-network rates detected without clear patient consent documentation.',
    severity: 'high' as const,
    check: (ctx: RuleContext) => /out-of-network|non-participating|balance due|patient responsibility/i.test(ctx.rawText)
  },
  {
    id: 'upcoding',
    name: 'Upcoding Risk',
    description: 'High-intensity Level 5 codes found (99215/99205). These are often used to overcharge for routine visits.',
    severity: 'medium' as const,
    check: (ctx: RuleContext) => /\b(99215|99205|99285)\b/.test(ctx.rawText)
  },
  {
    id: 'facility-fee',
    name: 'ER Facility Fee',
    description: 'Revenue code 0450 detected. Pennsylvania patients are often billed separate "Room Fees" which may be negotiable.',
    severity: 'low' as const,
    check: (ctx: RuleContext) => /\b0450\b/.test(ctx.rawText)
  },
  {
    id: 'unbundling',
    name: 'Unbundling Pattern',
    description: 'A high volume of procedural codes suggests a single surgery may have been broken into multiple charges.',
    severity: 'high' as const,
    check: (ctx: RuleContext) => ctx.codes.length > 8
  }
];
export const LETTER_TEMPLATES = [
  {
    id: "itemized-request",
    name: "Itemized Bill Demand",
    description: "Legal demand for a full breakdown of every service provided to ensure transparency.",
    body: "I am writing to formally request a complete itemized bill for services rendered by {PROVIDER_NAME} on {SERVICE_DATE}. Pursuant to my rights as a patient, this bill must include all Revenue Codes, CPT/HCPCS codes, and NPI identifiers for all billing providers associated with Account #{ACCOUNT_NUMBER}. I require this documentation to verify the accuracy of the charges totaling {TOTAL_AMOUNT}."
  },
  {
    id: "surprise-dispute",
    name: "General Surprise Dispute",
    description: "Dispute unexpected charges or billing inaccuracies based on Pennsylvania benchmarks.",
    body: "I am formally disputing the bill from {PROVIDER_NAME} for services on {SERVICE_DATE}. My internal audit indicates that the charges listed ({TOTAL_AMOUNT}) are inconsistent with regional cost expectations for the following codes: {CODE_LIST}. Specifically: {BENCHMARK_COMPARISON}. I request a review of these charges and an adjustment based on {POLICY_INFO}."
  },
  {
    id: "financial-aid",
    name: "Financial Assistance Request",
    description: "Application for charity care or financial aid under PA Act 32 protections.",
    body: "Regarding Account #{ACCOUNT_NUMBER} for {TOTAL_AMOUNT}, I am requesting an application for Financial Assistance (Charity Care) as per PA Act 32. Due to financial hardship, I request a review of my eligibility for HCAP or other hospital assistance programs for services provided on {SERVICE_DATE} by {PROVIDER_NAME}."
  },
  {
    id: "coding-audit",
    name: "Formal Coding Audit",
    description: "Technical request for a review of specific CPT codes to check for upcoding or unbundling.",
    body: "I am requesting a formal coding audit of my bill from {PROVIDER_NAME} dated {SERVICE_DATE}. My audit detected potential coding anomalies involving CPT codes {CODE_LIST}. Specifically, I am concerned about potential upcoding for Account #{ACCOUNT_NUMBER}. Please provide a written explanation of how these codes were selected based on the clinical documentation."
  },
  {
    id: "payment-negotiation",
    name: "Payment Plan Negotiation",
    description: "Proposal for a structured payment plan based on a manageable monthly amount.",
    body: "Regarding my balance of {TOTAL_AMOUNT} with {PROVIDER_NAME}, I would like to propose a formal payment plan. Given my current financial situation, I can commit to monthly payments toward Account #{ACCOUNT_NUMBER} for the services on {SERVICE_DATE}. Please confirm if you will accept this negotiation based on my {POLICY_INFO}."
  },
  {
    id: "no-surprises-act",
    name: "No Surprises Act Protection",
    description: "Federal protection dispute for out-of-network emergency or non-consented services.",
    body: "This bill for {TOTAL_AMOUNT} appears to violate the No Surprises Act. On {SERVICE_DATE}, I received emergency care at {PROVIDER_NAME}. Under federal law, I am only responsible for my in-network cost-sharing amount. Please adjust Account #{ACCOUNT_NUMBER} to reflect {POLICY_INFO} and cease any collection efforts for the balance billing portion."
  }
];