import * as pdfjs from 'pdfjs-dist';
import { CODE_PATTERNS, REDACTION_PATTERNS, PA_RULES, FAIR_BENCHMARKS, PLAN_KEYWORDS, PA_VIOLATION_TAXONOMY } from '@/data/constants';
import { AuditRecord, OverchargeItem, saveRedactionAudit } from './db';
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
function redactSensitiveData(text: string): { redacted: string; count: number } {
  let redacted = text;
  let count = 0;
  Object.values(REDACTION_PATTERNS).forEach(pattern => {
    const matches = redacted.match(pattern);
    if (matches) count += matches.length;
    redacted = redacted.replace(pattern, '[REDACTED]');
  });
  return { redacted, count };
}
async function computeEvidenceHash(snippet: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(snippet);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
function detectPlanType(text: string): 'COMMERCIAL' | 'MEDICAID' | 'MEDICARE' | 'UNKNOWN' {
  const upText = text.toUpperCase();
  if (PLAN_KEYWORDS.MEDICAID.some(k => upText.includes(k.toUpperCase()))) return 'MEDICAID';
  if (PLAN_KEYWORDS.MEDICARE.some(k => upText.includes(k.toUpperCase()))) return 'MEDICARE';
  if (PLAN_KEYWORDS.COMMERCIAL.some(k => upText.includes(k.toUpperCase()))) return 'COMMERCIAL';
  return 'UNKNOWN';
}
export async function analyzeBillText(text: string, fileName: string): Promise<AuditRecord> {
  const { redacted, count } = redactSensitiveData(text);
  const planType = detectPlanType(text);
  const zipMatches = text.match(CODE_PATTERNS.zip);
  const zipCode = zipMatches ? zipMatches[0] : undefined;
  const cpt = Array.from(new Set(text.match(CODE_PATTERNS.cpt) || []));
  const hcpcs = Array.from(new Set(text.match(CODE_PATTERNS.hcpcs) || []));
  const revenue = Array.from(new Set(text.match(CODE_PATTERNS.revenue) || []));
  // Improved amount extraction: proximity-to-currency and range validation
  const amountRegex = /\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
  let match;
  const amounts: number[] = [];
  while ((match = amountRegex.exec(text)) !== null) {
    const val = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(val) && val < 1000000 && val > 0.01) {
      amounts.push(val);
    }
  }
  const totalAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  const overcharges: OverchargeItem[] = [];
  cpt.forEach(code => {
    const fairVal = FAIR_BENCHMARKS[code];
    if (fairVal && totalAmount > fairVal * 1.15) {
      overcharges.push({
        code,
        description: `Potential overcharge (Above 80th percentile PA benchmark)`,
        billedAmount: totalAmount,
        benchmarkAmount: fairVal,
        percentOver: Math.round(((totalAmount - fairVal) / fairVal) * 100)
      });
    }
  });
  const rawFlags = PA_RULES.filter(r => r.check({ rawText: text, overcharges, cpt }));
  const flags = await Promise.all(rawFlags.map(async f => {
    const snippet = text.substring(0, 200).replace(/\n/g, ' ');
    const hash = await computeEvidenceHash(snippet);
    return {
      type: f.id,
      severity: f.severity,
      description: f.description,
      taxonomy: {
        rule_id: f.id,
        statute_ref: PA_VIOLATION_TAXONOMY[f.id] || 'General PA Healthcare Rule',
        requires_review: f.severity === 'high',
        evidence_hash: hash,
        evidence_snippet: snippet.substring(0, 100)
      }
    };
  }));
  const auditId = uuidv4();
  const dates = text.match(CODE_PATTERNS.date) || [];
  const policy = text.match(CODE_PATTERNS.policy);
  const account = text.match(CODE_PATTERNS.account);
  // Enhanced Bill Date Heuristics
  let billDate = dates[0] || '';
  const dateKeywords = ['BILL DATE', 'STATEMENT DATE', 'INVOICE DATE', 'ISSUED'];
  for (const kw of dateKeywords) {
    const idx = text.toUpperCase().indexOf(kw);
    if (idx !== -1) {
      const sub = text.substring(idx, idx + 40);
      const subMatch = sub.match(CODE_PATTERNS.date);
      if (subMatch) {
        billDate = subMatch[0];
        break;
      }
    }
  }
  // Enhanced Provider Name Detection (Filtering junk headers)
  const headerLines = text.split('\n').slice(0, 10).map(l => l.trim()).filter(l => l.length > 4);
  const junkTerms = ['PAGE', 'CONFIDENTIAL', 'ACCOUNT', 'DATE', 'STATEMENT', 'PATIENT'];
  const providerName = headerLines.find(l => !junkTerms.some(jt => l.toUpperCase().includes(jt))) || 'Unknown Facility';
  return {
    id: auditId,
    date: new Date().toISOString(),
    fileName,
    rawText: text,
    redactedText: redacted,
    totalAmount,
    detectedCpt: cpt,
    detectedIcd: Array.from(new Set(text.match(CODE_PATTERNS.icd10) || [])),
    detectedHcpcs: hcpcs,
    detectedRevenue: revenue,
    planType,
    zipCode,
    extractedData: {
      providerName,
      dateOfService: dates[dates.length - 1] || dates[0] || '',
      billDate,
      accountNumber: account ? account[1] : '',
      policyId: policy ? policy[1] : ''
    },
    overcharges,
    flags,
    status: flags.length > 0 ? 'flagged' : 'clean'
  };
}