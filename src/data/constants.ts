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
  amounts: /\$\d+(,\d{3})*(\.\d{2})?/g,
  policy: /\b(Group|Policy|ID|Member)\s*(?:#|No\.?)?\s*([A-Z0-9-]{6,15})\b/i,
  date: /\b(0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d\b/g
};
export const REDACTION_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  phone: /\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
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
  },
  {
    id: 'clerical',
    name: 'Clerical/Coding Linkage',
    description: 'Procedures found without corresponding ICD-10 diagnostic codes. This mismatch can be used to dispute bill validity.',
    severity: 'low' as const,
    check: (ctx: RuleContext) => {
      const hasCpt = ctx.codes.some(c => /^\d{5}$/.test(c));
      const hasIcd = ctx.rawText.match(/\b[A-TV-Z]\d{2}[A-Z0-9]\b/);
      return hasCpt && !hasIcd;
    }
  },
  {
    id: 'duplicate-billing',
    name: 'Duplicate Billing',
    description: 'The same procedure code appears multiple times. This may be a clerical error causing double-charging.',
    severity: 'medium' as const,
    check: (ctx: RuleContext) => new Set(ctx.codes).size !== ctx.codes.length
  },
  {
    id: 'missing-policy',
    name: 'Missing Insurance Context',
    description: 'No insurance policy or group ID was found on this statement. Hospitals may be billing at higher self-pay rates.',
    severity: 'low' as const,
    check: (ctx: RuleContext) => !/Policy|Group|ID|Member/i.test(ctx.rawText)
  }
];
export const LETTER_TEMPLATES = [
  {
    id: "general-dispute",
    name: "General Billing Dispute",
    description: "Standard template for disputing incorrect charges or clerical errors.",
    body: "I am writing to formally dispute charges for services on [DATE_OF_SERVICE]. My audit indicates specific coding levels do not reflect the complexity of the visit. I request an itemized bill with CPT and ICD-10 codes for total amount $[TOTAL_AMOUNT]. [OVERCHARGES_SUMMARY]"
  },
  {
    id: "surprise-bill",
    name: "No Surprises Act Violation",
    description: "For out-of-network emergency care or non-consented provider charges.",
    body: "This bill for $[TOTAL_AMOUNT] appears to violate the No Surprises Act. As I received emergency care on [DATE_LIST], I am only responsible for my in-network cost-sharing amount. Please adjust the balance accordingly."
  },
  {
    id: "financial-assistance",
    name: "Charity Care Request",
    description: "Application for hospital financial assistance based on income (HCAP).",
    body: "I am requesting an application for Financial Assistance (Charity Care) as per PA Act 32. My bill for $[TOTAL_AMOUNT] represents a significant hardship. Please send the necessary forms to [PATIENT_NAME]."
  },
  {
    id: "coding-audit",
    name: "Coding Audit Request",
    description: "Request for a formal coding review when upcoding or unbundling is suspected.",
    body: "My audit of bill #[ACCOUNT_NUMBER] detected potential coding errors involving codes [CPT_CODES]. These services occurred on [DATE_LIST]. I request a formal review of these charges against NCCI edits."
  },
  {
    id: "payment-plan",
    name: "Payment Plan Proposal",
    description: "A formal request to break down a large bill into manageable monthly payments.",
    body: "Regarding my bill for $[TOTAL_AMOUNT], I am requesting a formal payment plan. I can commit to monthly payments of $[MONTHLY_PAYMENT] starting [START_DATE]. Please confirm if this is acceptable."
  },
  {
    id: "itemized-request",
    name: "Itemized Bill Demand",
    description: "Legal demand for a full breakdown of every service provided.",
    body: "I formally request a complete itemized bill for services rendered by [PROVIDER_NAME] on [DATE_OF_SERVICE]. The bill must include Revenue Codes, CPT/HCPCS codes, and NPI identifiers for all billing providers."
  }
];