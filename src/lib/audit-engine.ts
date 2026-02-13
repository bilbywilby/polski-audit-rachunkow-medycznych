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
    const strings = sortedItems.map((item: any) => item.str);
    fullText += strings.join(' ') + '\n';
  }
  return fullText;
}
function redactSensitiveData(text: string): string {
  let redacted = text;
  Object.values(REDACTION_PATTERNS).forEach(pattern => {
    redacted = redacted.replace(pattern, '[ZAMASKOWANO]');
  });
  return redacted;
}
function extractSmartData(text: string) {
  const dateMatches = text.match(CODE_PATTERNS.date) || [];
  const dateAltMatches = text.match(CODE_PATTERNS.dateAlt) || [];
  const allDateMatches = [...dateMatches, ...dateAltMatches];
  const policyMatch = text.match(CODE_PATTERNS.policy);
  const accountMatch = text.match(CODE_PATTERNS.account);
  const sortedDates = [...new Set(allDateMatches)].sort((a, b) => new Date(a.split('.').reverse().join('-')).getTime() - new Date(b.split('.').reverse().join('-')).getTime());
  let providerName = '';
  const providerKeywords = ['Szpital', 'Przychodnia', 'Centrum Medyczne', 'Klinika', 'Hospital', 'Clinic', 'Specialists'];
  const lines = text.split('\n');
  for (const line of lines.slice(0, 25)) {
    if (providerKeywords.some(kw => line.toLowerCase().includes(kw.toLowerCase()))) {
      providerName = line.trim();
      break;
    }
  }
  return {
    providerName: providerName || 'Nie wykryto',
    serviceDate: sortedDates[0] || '',
    billDate: sortedDates[sortedDates.length - 1] || '',
    policyId: policyMatch ? policyMatch[1] : '',
    accountNumber: accountMatch ? accountMatch[1] : '',
    allDates: sortedDates
  };
}
export async function analyzeBillText(text: string, fileName: string): Promise<AuditRecord> {
  const redactedText = redactSensitiveData(text);
  const smartData = extractSmartData(text);
  const cptMatches = Array.from(new Set(text.match(CODE_PATTERNS.cpt) || []));
  const icdMatches = Array.from(new Set(text.match(CODE_PATTERNS.icd10) || []));
  const peselMatches = Array.from(new Set(text.match(CODE_PATTERNS.pesel) || []));
  const amountsMatches = text.match(CODE_PATTERNS.amounts) || [];
  const amounts = amountsMatches.map(m => parseFloat(m.replace(/[PLNzł$,\s]/g, '').replace(',', '.'))).filter(n => !isNaN(n));
  const totalAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  const overcharges: OverchargeItem[] = [];
  cptMatches.forEach(code => {
    const benchmark = PA_COST_BENCHMARKS.find(b => b.code === code);
    if (benchmark && totalAmount > benchmark.avgCost * 1.2) {
      overcharges.push({
        code,
        description: benchmark.description,
        billedAmount: totalAmount,
        benchmarkAmount: benchmark.avgCost,
        percentOver: Math.round(((totalAmount - benchmark.avgCost) / benchmark.avgCost) * 100)
      });
    }
  });
  const ruleCtx = { rawText: text, codes: cptMatches, overcharges };
  const flags = PA_RULES
    .filter(rule => rule.check(ruleCtx))
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
    detectedCpt: cptMatches,
    detectedIcd: icdMatches,
    detectedNpi: peselMatches, // Repurposing NPI field for PESEL detection matches in this locale
    extractedData: {
      providerName: smartData.providerName,
      dateOfService: smartData.serviceDate,
      billDate: smartData.billDate,
      accountNumber: smartData.accountNumber,
      policyId: smartData.policyId,
      allDates: smartData.allDates
    },
    overcharges,
    flags,
    status: flags.length > 0 ? 'flagged' : (overcharges.length > 0 ? 'flagged' : 'clean')
  };
}