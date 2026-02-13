import * as pdfjs from 'pdfjs-dist';
import { CODE_PATTERNS, REDACTION_PATTERNS, PA_RULES, PA_COST_BENCHMARKS } from '@/data/constants';
import { AuditRecord, OverchargeItem } from './db';
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
    fullText += sortedItems.map((item: any) => item.str).join(' ') + '\n';
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
function extractSmartData(text: string) {
  const dates = text.match(CODE_PATTERNS.date) || [];
  const policy = text.match(CODE_PATTERNS.policy);
  const account = text.match(CODE_PATTERNS.account);
  let providerName = '';
  const keywords = ['Hospital', 'Clinic', 'Medical Center', 'Health', 'Specialists', 'Physicians'];
  const lines = text.split('\n');
  for (const line of lines.slice(0, 15)) {
    if (keywords.some(kw => line.includes(kw))) {
      providerName = line.trim();
      break;
    }
  }
  return {
    providerName: providerName || 'Unknown Provider',
    serviceDate: dates[0] || '',
    billDate: dates[dates.length - 1] || '',
    policyId: policy ? policy[1] : '',
    accountNumber: account ? account[1] : ''
  };
}
export async function analyzeBillText(text: string, fileName: string): Promise<AuditRecord> {
  const redactedText = redactSensitiveData(text);
  const smart = extractSmartData(text);
  const cpt = Array.from(new Set(text.match(CODE_PATTERNS.cpt) || []));
  const hcpcs = Array.from(new Set(text.match(CODE_PATTERNS.hcpcs) || []));
  const icd = Array.from(new Set(text.match(CODE_PATTERNS.icd10) || []));
  const rev = Array.from(new Set(text.match(CODE_PATTERNS.revenue) || []));
  const npi = Array.from(new Set(text.match(CODE_PATTERNS.npi) || []));
  const amountMatches = text.match(CODE_PATTERNS.amounts) || [];
  const amounts = amountMatches.map(m => parseFloat(m.replace(/[$,\s]/g, ''))).filter(n => !isNaN(n));
  const totalAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  const overcharges: OverchargeItem[] = [];
  cpt.forEach(code => {
    const benchmark = PA_COST_BENCHMARKS.find(b => b.code === code);
    if (benchmark && totalAmount > benchmark.avgCost * 1.5) {
      overcharges.push({
        code,
        description: benchmark.description,
        billedAmount: totalAmount,
        benchmarkAmount: benchmark.avgCost,
        percentOver: Math.round(((totalAmount - benchmark.avgCost) / benchmark.avgCost) * 100)
      });
    }
  });
  const flags = PA_RULES
    .filter(r => r.check({ rawText: text, codes: cpt, overcharges }))
    .map(r => ({ type: r.id, severity: r.severity, description: r.description }));
  return {
    id: uuidv4(),
    date: new Date().toISOString(),
    fileName,
    rawText: text,
    redactedText,
    totalAmount,
    detectedCpt: cpt,
    detectedIcd: icd,
    detectedHcpcs: hcpcs,
    detectedRevenue: rev,
    detectedNpi: npi,
    extractedData: smart,
    overcharges,
    flags,
    status: flags.length > 0 ? 'flagged' : 'clean'
  };
}