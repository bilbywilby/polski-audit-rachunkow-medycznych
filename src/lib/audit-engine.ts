import * as pdfjs from 'pdfjs-dist';
import { CODE_PATTERNS } from '@/data/constants';
import { AuditRecord } from './db';
import { v4 as uuidv4 } from 'uuid';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
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
  const hcpcsMatches = text.match(CODE_PATTERNS.hcpcs) || [];
  const revenueMatches = text.match(CODE_PATTERNS.revenue) || [];
  const npiMatches = text.match(CODE_PATTERNS.npi) || [];
  const amountsMatches = text.match(CODE_PATTERNS.amounts) || [];
  const uniqueCpt = Array.from(new Set(cptMatches));
  const uniqueIcd = Array.from(new Set(icdMatches));
  const uniqueHcpcs = Array.from(new Set(hcpcsMatches));
  const uniqueRevenue = Array.from(new Set(revenueMatches));
  const uniqueNpi = Array.from(new Set(npiMatches));
  const amounts = amountsMatches.map(m => parseFloat(m.replace(/[$,\s]/g, ''))).filter(n => !isNaN(n));
  const totalAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  const flags: AuditRecord['flags'] = [];
  // 1. Balance Billing / No Surprises Act
  const balanceBillingKeywords = ['out-of-network', 'non-participating', 'balance due', 'patient responsibility', 'not covered'];
  if (balanceBillingKeywords.some(kw => text.toLowerCase().includes(kw)) && totalAmount > 400) {
    flags.push({
      type: 'balance-billing',
      severity: 'high',
      description: 'Potential No Surprises Act violation. Out-of-network keywords found with a significant balance.'
    });
  }
  // 2. Upcoding Check
  const highRiskCpt = ['99215', '99205', '99285', '99291', '99214'];
  const foundHighRisk = uniqueCpt.filter(code => highRiskCpt.includes(code));
  if (foundHighRisk.length > 0) {
    flags.push({
      type: 'upcoding',
      severity: 'medium',
      description: `High-intensity codes found: ${foundHighRisk.join(', ')}. Ensure medical complexity justifies this coding level.`
    });
  }
  // 3. Facility Fee / Revenue Code Analysis
  const erRevenueCodes = ['0450', '450', '0762', '762']; // ER and Observation
  const foundErRevenue = uniqueRevenue.filter(code => erRevenueCodes.includes(code));
  if (foundErRevenue.length > 0 && totalAmount > 1000) {
    flags.push({
      type: 'facility-fee',
      severity: 'low',
      description: `Emergency/Observation revenue codes detected (${foundErRevenue.join(', ')}). High bills often include separate "Facility Fees" which may be negotiable.`
    });
  }
  // 4. Clerical Check
  if (uniqueCpt.length > 0 && uniqueIcd.length === 0) {
    flags.push({
      type: 'clerical',
      severity: 'low',
      description: 'Procedure codes detected without matching Diagnosis codes. This often triggers claim denials.'
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
    detectedHcpcs: uniqueHcpcs,
    detectedRevenue: uniqueRevenue,
    detectedNpi: uniqueNpi,
    flags,
    status: flags.length > 0 ? 'flagged' : 'clean'
  };
}