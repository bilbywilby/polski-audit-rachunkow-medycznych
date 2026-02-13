import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import {
  INSURANCE_PATTERNS,
  PLAN_KEYWORDS,
  PA_VIOLATION_TAXONOMY,
  REDACTION_PATTERNS
} from '@/data/constants';
import { InsuranceFilingRecord, AuditFlag } from './db';
import * as pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
export async function extractTextFromFiling(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'xlsx') {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    let fullText = '';
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      fullText += `Sheet: ${sheetName}\n` + json.map((row: any) => row.join(' ')).join('\n') + '\n';
    });
    return fullText;
  }
  // Default to PDF
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += (content.items as any[]).map((item) => item.str).join(' ') + '\n';
  }
  return fullText;
}
function redactFilingText(text: string): string {
  let redacted = text;
  Object.values(REDACTION_PATTERNS).forEach(pattern => {
    redacted = redacted.replace(pattern, '[REDACTED]');
  });
  return redacted;
}
export async function analyzeInsuranceFiling(text: string, fileName: string): Promise<InsuranceFilingRecord> {
  const upText = text.toUpperCase();
  // Detect Carrier with improved robustness
  let carrier = 'Unknown Carrier';
  for (const [key, keywords] of Object.entries(PLAN_KEYWORDS)) {
    const found = keywords.find(k => {
      const regex = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(text);
    });
    if (found) {
      carrier = found;
      break;
    }
  }
  const hikeMatch = text.match(INSURANCE_PATTERNS.rate_hike);
  const rateHike = hikeMatch ? hikeMatch[0].replace(/[^\d.-]/g, '') + '%' : 'TBD';
  const rateHikeVal = hikeMatch ? parseFloat(hikeMatch[0].replace(/[^\d.-]/g, '')) : 0;
  const mlrMatch = text.match(INSURANCE_PATTERNS.mlr);
  const mlrPercent = mlrMatch ? mlrMatch[0].replace(/[^\d.-]/g, '') + '%' : 'TBD';
  const mlrVal = mlrMatch ? parseFloat(mlrMatch[0].replace(/[^\d.-]/g, '')) : 85;
  const avMatch = text.match(INSURANCE_PATTERNS.actuarial_value);
  const avLevel = avMatch ? avMatch[0].replace(/[^\d.-]/g, '') + '%' : 'TBD';
  const countyPricing: Record<string, number> = {};
  const commonCounties = ['Allegheny', 'Philadelphia', 'Montgomery', 'Bucks', 'Delaware', 'Lancaster', 'Chester'];
  commonCounties.forEach(county => {
    const regex = new RegExp(`${county}\\s+\\$?(\\d{2,4}(?:\\.\\d{2})?)`, 'i');
    const match = text.match(regex);
    if (match) {
      countyPricing[county] = parseFloat(match[1]);
    }
  });
  const flags: AuditFlag[] = [];
  if (rateHikeVal > 15) {
    flags.push({
      type: 'excessive-rate-hike',
      severity: 'high',
      description: `Requested rate hike of ${rateHike} exceeds the 15% transparency threshold set by PA PID.`,
      taxonomy: {
        rule_id: 'excessive-rate-hike',
        statute_ref: PA_VIOLATION_TAXONOMY['excessive-rate-hike'],
        requires_review: true,
        evidence_hash: '',
        evidence_snippet: `Detected hike: ${rateHike}`
      }
    });
  }
  if (mlrVal < 80) {
    flags.push({
      type: 'mlr-non-compliance',
      severity: 'medium',
      description: `Medical Loss Ratio (${mlrPercent}) appears to be below the ACA 80/20 requirement for commercial plans.`,
      taxonomy: {
        rule_id: 'mlr-non-compliance',
        statute_ref: PA_VIOLATION_TAXONOMY['mlr-non-compliance'],
        requires_review: false,
        evidence_hash: '',
        evidence_snippet: `Detected MLR: ${mlrPercent}`
      }
    });
  }
  return {
    id: uuidv4(),
    date: new Date().toISOString(),
    fileName,
    fileType: fileName.toLowerCase().endsWith('.xlsx') ? 'XLSX' : 'PDF',
    status: flags.some(f => f.severity === 'high') ? 'flagged' : 'indexed',
    flags,
    extractedData: {
      companyName: carrier,
      planYear: (text.match(/\b202[456]\b/) || ['2025'])[0],
      avgRateHike: rateHike,
      avLevel: avLevel,
      mlrPercent: mlrPercent,
      countyPricing: Object.keys(countyPricing).length > 0 ? countyPricing : undefined,
      rawSummary: redactFilingText(text.substring(0, 1000))
    }
  };
}