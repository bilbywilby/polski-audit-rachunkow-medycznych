import * as pdfjs from 'pdfjs-dist';
import { CODE_PATTERNS, REDACTION_PATTERNS, PA_RULES } from '@/data/constants';
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
function redactSensitiveData(text: string): string {
  let redacted = text;
  Object.values(REDACTION_PATTERNS).forEach(pattern => {
    redacted = redacted.replace(pattern, '[REDACTED]');
  });
  return redacted;
}
export async function analyzeBillText(text: string, fileName: string): Promise<AuditRecord> {
  const redactedText = redactSensitiveData(text);
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
  const flags: AuditRecord['flags'] = PA_RULES
    .filter(rule => rule.check(text))
    .map(rule => ({
      type: rule.id,
      severity: rule.severity,
      description: rule.description
    }));
  return {
    id: uuidv4(),
    date: new Date().toISOString(),
    fileName,
    rawText: text,
    redactedText,
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