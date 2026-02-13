import * as pdfjs from 'pdfjs-dist';
import { CODE_PATTERNS } from '@/data/constants';
import { AuditRecord } from './db';
import { v4 as uuidv4 } from 'uuid';
// Set worker source for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Sort items by vertical position (descending) then horizontal (ascending)
    // to handle multi-column layouts better
    const items = content.items as any[];
    const sortedItems = items.sort((a, b) => {
      if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
        return a.transform[4] - b.transform[4];
      }
      return b.transform[5] - a.transform[5];
    });
    const strings = sortedItems.map((item: any) => item.str);
    fullText += strings.join(' ') + '\n';
  }
  return fullText;
}
export async function analyzeBillText(text: string, fileName: string): Promise<AuditRecord> {
  const cptMatches = text.match(CODE_PATTERNS.cpt) || [];
  const icdMatches = text.match(CODE_PATTERNS.icd10) || [];
  const currencyMatches = text.match(CODE_PATTERNS.currency) || [];
  const uniqueCpt = Array.from(new Set(cptMatches));
  const uniqueIcd = Array.from(new Set(icdMatches));
  const amounts = currencyMatches.map(m => parseFloat(m.replace(/[$,\s]/g, ''))).filter(n => !isNaN(n));
  const totalAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  const flags: AuditRecord['flags'] = [];
  // 1. Balance Billing / No Surprises Act (PA Specific)
  const balanceBillingKeywords = ['out-of-network', 'non-participating', 'balance due', 'patient responsibility', 'not covered'];
  const hasKeywords = balanceBillingKeywords.some(kw => text.toLowerCase().includes(kw));
  if (hasKeywords && totalAmount > 400) {
    flags.push({
      type: 'balance-billing',
      severity: 'high',
      description: 'Potential No Surprises Act violation. High patient responsibility detected for services that may be protected under PA law.'
    });
  }
  // 2. Upcoding Check (Expanded)
  // High intensity codes that are often used to overbill
  const highRiskCpt = ['99215', '99205', '99285', '99291', '99214'];
  const foundHighRisk = uniqueCpt.filter(code => highRiskCpt.includes(code));
  if (foundHighRisk.length > 0) {
    flags.push({
      type: 'upcoding',
      severity: 'medium',
      description: `High-intensity codes detected (${foundHighRisk.join(', ')}). These require high-complexity medical decision making. Verify your records match this level of care.`
    });
  }
  // 3. Unbundling Check
  // Common bundles: Comprehensive Metabolic Panel (80053) includes components often billed separately
  const metabolicPanelComponents = ['82310', '82374', '82435', '82947', '84132', '84295'];
  const foundComponents = uniqueCpt.filter(code => metabolicPanelComponents.includes(code));
  if (foundComponents.length >= 3) {
    flags.push({
      type: 'unbundling',
      severity: 'medium',
      description: 'Potential Unbundling: Multiple components of a standard metabolic panel detected. These should likely be billed under a single comprehensive code (e.g., 80053).'
    });
  }
  // 4. Clerical / Formatting Errors
  if (uniqueCpt.length > 0 && uniqueIcd.length === 0) {
    flags.push({
      type: 'clerical',
      severity: 'low',
      description: 'Procedure codes found without corresponding Diagnosis codes. This can cause insurance claim denials.'
    });
  }
  return {
    id: uuidv4(),
    date: new Date().toISOString(),
    fileName,
    rawText: text,
    totalAmount,
    detectedCpt: uniqueCpt,
    detectedIcd: uniqueIcd,
    flags,
    status: flags.length > 0 ? 'flagged' : 'clean'
  };
}