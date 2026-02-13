import { v4 as uuidv4 } from 'uuid';
import { 
  INSURANCE_PATTERNS, 
  PLAN_KEYWORDS, 
  PA_VIOLATION_TAXONOMY, 
  REDACTION_PATTERNS 
} from '@/data/constants';
import { InsuranceFilingRecord, AuditFlag } from './db';
import * as pdfjs from 'pdfjs-dist';
// Re-using the worker config from audit-engine
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
export async function extractTextFromFiling(file: File): Promise<string> {
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
  // Detect Carrier
  let carrier = 'Unknown Carrier';
  for (const [key, keywords] of Object.entries(PLAN_KEYWORDS)) {
    if (keywords.some(k => upText.includes(k.toUpperCase()))) {
      carrier = key.charAt(0) + key.slice(1).toLowerCase();
      // Try to find specific company name if possible
      const specificMatch = keywords.find(k => upText.includes(k.toUpperCase()));
      if (specificMatch) carrier = specificMatch;
      break;
    }
  }
  // Extract Rate Hike
  const hikeMatch = text.match(INSURANCE_PATTERNS.rate_hike);
  const rateHike = hikeMatch ? hikeMatch[0].replace(/[^\d.-]/g, '') + '%' : 'TBD';
  const rateHikeVal = hikeMatch ? parseFloat(hikeMatch[0].replace(/[^\d.-]/g, '')) : 0;
  // Extract MLR
  const mlrMatch = text.match(INSURANCE_PATTERNS.mlr);
  const mlrPercent = mlrMatch ? mlrMatch[0].replace(/[^\d.-]/g, '') + '%' : 'TBD';
  const mlrVal = mlrMatch ? parseFloat(mlrMatch[0].replace(/[^\d.-]/g, '')) : 85;
  // Extract AV
  const avMatch = text.match(INSURANCE_PATTERNS.actuarial_value);
  const avLevel = avMatch ? avMatch[0].replace(/[^\d.-]/g, '') + '%' : 'TBD';
  // Extract County Pricing (Simulated via Regex Heuristics for Table-like structures)
  const countyPricing: Record<string, number> = {};
  const commonCounties = ['Allegheny', 'Philadelphia', 'Montgomery', 'Bucks', 'Delaware', 'Lancaster', 'Chester'];
  commonCounties.forEach(county => {
    const regex = new RegExp(`${county}\\s+\\$?(\\d{2,4}(?:\\.\\d{2})?)`, 'i');
    const match = text.match(regex);
    if (match) {
      countyPricing[county] = parseFloat(match[1]);
    }
  });
  // Flagging Logic
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