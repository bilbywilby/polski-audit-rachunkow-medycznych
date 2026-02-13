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
  { term: "Deductible", definition: "The amount you pay for covered health care services before your insurance plan starts to pay." },
  { term: "Coinsurance", definition: "The percentage of costs of a covered health care service you pay after you've paid your deductible." },
  { term: "Copayment", definition: "A fixed amount you pay for a covered health care service after you've paid your deductible." },
  { term: "Out-of-Pocket Limit", definition: "The most you could pay during a coverage period for your share of the cost of covered services." },
  { term: "In-Network", definition: "Providers or facilities that have a contract with your health insurance plan to provide services at a discount." },
  { term: "Out-of-Network", definition: "Providers or facilities that don't have a contract with your health insurance plan." },
  { term: "No Surprises Act", definition: "Federal law protecting patients from unexpected medical bills for out-of-network emergency services." },
  { term: "PA Act 32", definition: "Pennsylvania law requiring hospitals to have financial assistance policies for low-income patients." },
  { term: "Charity Care", definition: "Free or reduced-cost medical care provided to people who meet certain financial criteria." },
  { term: "HCAP", definition: "Hospital Care Assistance Program. Pennsylvania's terminology for financial assistance for hospital bills." },
  { term: "Medical Necessity", definition: "Healthcare services that a physician, exercising prudent clinical judgment, would provide to a patient for purpose of evaluating/treating illness." },
  { term: "Itemized Bill", definition: "A detailed list of every single service and supply used during a hospital visit with corresponding codes." },
  { term: "Clerical Error", definition: "Minor mistakes like typos or incorrect dates that can lead to claim denials or billing confusion." }
];
export const PA_RESOURCES = [
  { name: "PA Insurance Department", description: "State agency for filing complaints about medical billing and insurance coverage issues.", url: "https://www.insurance.pa.gov/pages/default.aspx" },
  { name: "PA Attorney General", description: "Consumer protection office handling healthcare fraud and deceptive billing practices in Pennsylvania.", url: "https://www.attorneygeneral.gov/" },
  { name: "PA Health Law Project", description: "Non-profit legal aid providing free services for low-income PA residents with healthcare access issues.", url: "https://www.phlp.org/" },
  { name: "PA Health Access Network", description: "Advocates for healthcare quality and affordability for all Pennsylvanians.", url: "https://pahealthaccess.org/" },
  { name: "Community Legal Services of Philadelphia", description: "Provides free civil legal assistance to low-income Philadelphians, including medical debt.", url: "https://clsphila.org/" },
  { name: "North Penn Legal Services", description: "Legal aid for northeastern PA residents dealing with consumer and healthcare debt.", url: "https://www.northpennlegal.org/" },
  { name: "MidPenn Legal Services", description: "Free legal services for central PA residents on civil matters including hospital billing.", url: "https://www.midpenn.org/" },
  { name: "PA Patient Safety Authority", description: "Independent state agency focused on improving the quality of healthcare in Pennsylvania.", url: "https://patientsafety.pa.gov/" }
];
export const CODE_PATTERNS = {
  cpt: /\b\d{5}\b/g,
  icd10: /\b[A-Z]\d{2}[A-Z0-9](\.\d[A-Z0-9]{0,3})?\b/g,
  hcpcs: /\b[A-Z]\d{4}[A-Z]?\b/g,
  revenue: /\b0?\d{3,4}\b/g,
  npi: /\b\d{10}\b/g,
  amounts: /(\$[\d,]+\.?\d{0,2})/g,
  currency: /\$\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/g
};
export const LETTER_TEMPLATES = [
  { id: "general-dispute", name: "General Billing Dispute", description: "Standard template for disputing incorrect charges or clerical errors." },
  { id: "surprise-bill", name: "No Surprises Act Violation", description: "Specifically for out-of-network emergency care or non-consented provider charges." },
  { id: "financial-assistance", name: "Charity Care Request", description: "Application for hospital financial assistance based on income (HCAP)." }
];