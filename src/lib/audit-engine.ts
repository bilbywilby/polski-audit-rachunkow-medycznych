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
function extractSmartData(text: string) {
  const dateMatches = text.match(CODE_PATTERNS.date) || [];
  const policyMatch = text.match(CODE_PATTERNS.policy);
  const accountMatch = text.match(CODE_PATTERNS.account);
  // Heuristic: The earliest date is often the service date, latest is bill date
  const sortedDates = [...new Set(dateMatches)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  // Provider Extraction: Look for hospital keywords in first 20 lines
  let providerName = '';
  const providerKeywords = ['Hospital', 'Clinic', 'Medical Center', 'Health', 'Specialists', 'Physicians', 'Surgery Center'];
  const lines = text.split('\n');
  for (const line of lines.slice(0, 20)) {
    if (providerKeywords.some(kw => line.toLowerCase().includes(kw.toLowerCase()))) {
      providerName = line.trim();
      break;
    }
  }
  return {
    providerName: providerName || 'Not Detected',
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
  // Extract Codes
  const cptMatches = Array.from(new Set(text.match(CODE_PATTERNS.cpt) || []));
  const icdMatches = Array.from(new Set(text.match(CODE_PATTERNS.icd10) || []));
  const hcpcsMatches = Array.from(new Set(text.match(CODE_PATTERNS.hcpcs) || []));
  const revenueMatches = Array.from(new Set(text.match(CODE_PATTERNS.revenue) || []));
  const npiMatches = Array.from(new Set(text.match(CODE_PATTERNS.npi) || []));
  const amountsMatches = text.match(CODE_PATTERNS.amounts) || [];
  const amounts = amountsMatches.map(m => parseFloat(m.replace(/[$,\s]/g, ''))).filter(n => !isNaN(n));
  const totalAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  // Benchmark Calculation
  const overcharges: OverchargeItem[] = [];
  cptMatches.forEach(code => {
    const benchmark = PA_COST_BENCHMARKS.find(b => b.code === code);
    if (benchmark) {
      // Logic: If this is a primary code and total bill is significantly higher than benchmark
      if (totalAmount > benchmark.avgCost * 1.15) {
        overcharges.push({
          code,
          description: benchmark.description,
          billedAmount: totalAmount, // For demo, we assume the high bill is driven by this code
          benchmarkAmount: benchmark.avgCost,
          percentOver: Math.round(((totalAmount - benchmark.avgCost) / benchmark.avgCost) * 100)
        });
      }
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
    detectedHcpcs: hcpcsMatches,
    detectedRevenue: revenueMatches,
    detectedNpi: npiMatches,
    extractedData: {
      providerName: smartData.providerName,
      dateOfService: smartData.serviceDate,
      billDate: smartData.billDate,
      policyId: smartData.policyId,
      accountNumber: smartData.accountNumber,
      allDates: smartData.allDates
    },
    overcharges,
    flags,
    status: flags.length > 0 ? 'flagged' : (overcharges.length > 0 ? 'flagged' : 'clean')
  };
}