export const GLOSSARY_TERMS = [
  {
    term: "Upcoding",
    definition: "A fraudulent practice where a provider assigns a higher-level billing code than the service actually performed to get more money."
  },
  {
    term: "Unbundling",
    definition: "Billing multiple services separately that should be billed under a single comprehensive code."
  },
  {
    term: "CPT Code",
    definition: "Current Procedural Terminology. A set of codes used to describe medical, surgical, and diagnostic services."
  },
  {
    term: "ICD-10 Code",
    definition: "International Classification of Diseases, 10th Revision. Codes used to classify and code all diagnoses."
  },
  {
    term: "Balance Billing",
    definition: "When a provider bills you for the difference between their charge and what your insurance paid. Often restricted under PA law."
  },
  {
    term: "No Surprises Act",
    definition: "A federal law (with PA specific protections) that protects patients from unexpected medical bills for out-of-network emergency services."
  }
];
export const PA_RESOURCES = [
  {
    name: "PA Insurance Department",
    description: "The primary state agency for filing complaints about medical billing and insurance coverage.",
    url: "https://www.insurance.pa.gov/pages/default.aspx"
  },
  {
    name: "PA Attorney General",
    description: "Office that handles consumer protection issues including healthcare fraud and deceptive billing.",
    url: "https://www.attorneygeneral.gov/"
  },
  {
    name: "Pennsylvania Health Law Project (PHLP)",
    description: "Non-profit providing free legal services to PA residents with low incomes who are having trouble with healthcare access.",
    url: "https://www.phlp.org/"
  },
  {
    name: "HealthCare.gov - PA Rights",
    description: "Federal resources specifically detailing consumer protections in Pennsylvania.",
    url: "https://www.healthcare.gov/blog/pennsylvania-no-surprises-act/"
  }
];
export const CODE_PATTERNS = {
  cpt: /\b\d{5}\b/g,
  icd10: /\b[A-Z][0-9][0-9A-Z](\.[0-9A-Z]{1,4})?\b/g,
  currency: /\$\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/g
};
export const LETTER_TEMPLATES = [
  {
    id: "general-dispute",
    name: "General Billing Dispute",
    description: "Standard template for disputing incorrect charges or clerical errors."
  },
  {
    id: "surprise-bill",
    name: "No Surprises Act Violation",
    description: "Specifically for out-of-network emergency care or non-consented provider charges."
  },
  {
    id: "financial-assistance",
    name: "Charity Care Request",
    description: "Application for hospital financial assistance based on income (HCAP)."
  }
];