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
    redacted = redacted.replace(pattern, '[REDACTED]');
  });
  return redacted;
}
export async function analyzeBillText(text: string, fileName: string): Promise<AuditRecord> {
  const redactedText = redactSensitiveData(text);
  // Extract Codes
  const cptMatches = text.match(CODE_PATTERNS.cpt) || [];
  const icdMatches = text.match(CODE_PATTERNS.icd10) || [];
  const hcpcsMatches = text.match(CODE_PATTERNS.hcpcs) || [];
  const revenueMatches = text.match(CODE_PATTERNS.revenue) || [];
  const npiMatches = text.match(CODE_PATTERNS.npi) || [];
  const amountsMatches = text.match(CODE_PATTERNS.amounts) || [];
  // Extract Metadata
  const dateMatches = text.match(CODE_PATTERNS.date) || [];
  const policyMatch = text.match(CODE_PATTERNS.policy);
  // Basic provider name extraction (heuristic)
  let providerName = '';
  const providerKeywords = ['Hospital', 'Clinic', 'Medical Center', 'Health', 'Specialists'];
  const lines = text.split('\n');
  for (const line of lines.slice(0, 15)) {
    if (providerKeywords.some(kw => line.includes(kw))) {
      providerName = line.trim();
      break;
    }
  }
  const uniqueCpt = Array.from(new Set(cptMatches));
  const uniqueIcd = Array.from(new Set(icdMatches));
  const uniqueHcpcs = Array.from(new Set(hcpcsMatches));
  const uniqueRevenue = Array.from(new Set(revenueMatches));
  const uniqueNpi = Array.from(new Set(npiMatches));
  const amounts = amountsMatches.map(m => parseFloat(m.replace(/[$,\s]/g, ''))).filter(n => !isNaN(n));
  const totalAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  // Benchmark Calculation
  const overcharges: OverchargeItem[] = [];
  uniqueCpt.forEach(code => {
    const benchmark = PA_COST_BENCHMARKS.find(b => b.code === code);
    if (benchmark) {
      // Very simple inference: if total bill is high and this code is present, 
      // check if it's statistically likely to be an overcharge.
      // In a real app, we'd extract the specific line item cost.
      // For this demo, we assume the highest amount match might be this code if only 1 code exists.
      if (uniqueCpt.length === 1 && totalAmount > benchmark.avgCost * 1.25) {
        overcharges.push({
          code,
          description: benchmark.description,
          billedAmount: totalAmount,
          benchmarkAmount: benchmark.avgCost,
          percentOver: Math.round(((totalAmount - benchmark.avgCost) / benchmark.avgCost) * 100)
        });
      }
    }
  });
  const ruleCtx = { rawText: text, codes: cptMatches, overcharges };
  const flags: AuditRecord['flags'] = PA_RULES
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
    detectedCpt: uniqueCpt,
    detectedIcd: uniqueIcd,
    detectedHcpcs: uniqueHcpcs,
    detectedRevenue: uniqueRevenue,
    detectedNpi: uniqueNpi,
    extractedData: {
      providerName,
      dateOfService: dateMatches[0] || '',
      policyId: policyMatch ? policyMatch[2] : '',
      allDates: Array.from(new Set(dateMatches))
    },
    overcharges,
    flags,
    status: flags.length > 0 ? 'flagged' : 'clean'
  };
}