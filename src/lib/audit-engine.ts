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
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(' ') + '\n';
  }
  return fullText;
}
export async function analyzeBillText(text: string, fileName: string): Promise<AuditRecord> {
  const cptMatches = text.match(CODE_PATTERNS.cpt) || [];
  const icdMatches = text.match(CODE_PATTERNS.icd10) || [];
  const currencyMatches = text.match(CODE_PATTERNS.currency) || [];
  // Deduplicate codes
  const uniqueCpt = Array.from(new Set(cptMatches));
  const uniqueIcd = Array.from(new Set(icdMatches));
  // Heuristic for Total Amount (usually the largest currency value)
  const amounts = currencyMatches.map(m => parseFloat(m.replace(/[$,\s]/g, ''))).filter(n => !isNaN(n));
  const totalAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  const flags: AuditRecord['flags'] = [];
  // Heuristic: Balance Billing Check
  const balanceBillingKeywords = ['out-of-network', 'non-participating', 'balance due', 'patient responsibility'];
  const hasKeywords = balanceBillingKeywords.some(kw => text.toLowerCase().includes(kw));
  if (hasKeywords && totalAmount > 500) {
    flags.push({
      type: 'balance-billing',
      severity: 'high',
      description: 'Potential No Surprises Act violation. High patient responsibility detected for what may be out-of-network services.'
    });
  }
  // Heuristic: Upcoding Check (Mock Logic)
  const highRiskCpt = ['99215', '99205', '99285']; // Level 5 office/ER visits
  const foundHighRisk = uniqueCpt.filter(code => highRiskCpt.includes(code));
  if (foundHighRisk.length > 0) {
    flags.push({
      type: 'upcoding',
      severity: 'medium',
      description: `High-intensity codes detected (${foundHighRisk.join(', ')}). Ensure the complexity of care matches these billable levels.`
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