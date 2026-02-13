import * as pdfjs from 'pdfjs-dist';
import {
  CODE_PATTERNS,
  REDACTION_PATTERNS,
  PA_RULES,
  FAIR_BENCHMARKS,
  PLAN_KEYWORDS,
  PA_REVIEW_TAXONOMY,
  MAX_PAGE_COUNT,
  RuleContext,
  MEDICARE_PROXY_RATIO,
  ACT_102_REFERENCES,
  PA_DOI_DISCLAIMER,
  BENCHMARK_DISCLAIMER
} from '@/data/constants';
import { AuditRecord, OverchargeItem, ReviewPoint } from './db';
import { v4 as uuidv4 } from 'uuid';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
export async function generateDocumentFingerprint(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text.substring(0, 10000));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  if (pdf.numPages > MAX_PAGE_COUNT) {
    throw new Error(`File too large: ${pdf.numPages} pages exceeds ${MAX_PAGE_COUNT} page limit.`);
  }
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += (content.items as any[]).map((item) => item.str).join(' ') + '\n';
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
export async function analyzeBillText(rawInput: string, fileName: string): Promise<AuditRecord> {
  // REDACTION FIRST: Immediately secure the data
  const { redacted, count: redactedCount } = redactSensitiveData(rawInput);
  const fingerprint = await generateDocumentFingerprint(rawInput);
  const upText = rawInput.toUpperCase();
  let planType: 'COMMERCIAL' | 'MEDICAID' | 'MEDICARE' | 'UNKNOWN' = 'UNKNOWN';
  if (PLAN_KEYWORDS.MEDICAID.some(k => upText.includes(k.toUpperCase()))) planType = 'MEDICAID';
  else if (PLAN_KEYWORDS.MEDICARE.some(k => upText.includes(k.toUpperCase()))) planType = 'MEDICARE';
  else if (PLAN_KEYWORDS.COMMERCIAL.some(k => upText.includes(k.toUpperCase()))) planType = 'COMMERCIAL';
  const cpt = Array.from(new Set(rawInput.match(CODE_PATTERNS.cpt) || []));
  const amountRegex = /\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
  let match;
  const amounts: number[] = [];
  while ((match = amountRegex.exec(rawInput)) !== null) {
    const val = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(val) && val < 1000000 && val > 0.01) amounts.push(val);
  }
  const totalAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  const overcharges: OverchargeItem[] = [];
  cpt.forEach(code => {
    const fairVal = FAIR_BENCHMARKS[code];
    if (fairVal) {
      const medicareProxy = fairVal * MEDICARE_PROXY_RATIO;
      if (totalAmount > medicareProxy) {
        overcharges.push({
          code,
          description: `Educational Review Point (Above Medicare Proxy)`,
          billedAmount: totalAmount,
          benchmarkAmount: fairVal,
          medicareProxyAmount: medicareProxy,
          percentOver: Math.round(((totalAmount - medicareProxy) / medicareProxy) * 100),
          legalCitation: ACT_102_REFERENCES.SECTION_5.title
        });
      }
    }
  });
  const ruleCtx: RuleContext = { rawText: rawInput, overcharges, cpt, planType };
  const reviewPoints = PA_RULES.filter(r => r.check(ruleCtx)).map(f => ({
    type: f.id,
    severity: f.severity,
    description: f.description,
    taxonomy: {
      rule_id: f.id,
      statute_ref: PA_REVIEW_TAXONOMY[f.id] || 'PA Act 102 Quality Standards',
      requires_review: f.severity === 'high',
      evidence_hash: 'purged',
      evidence_snippet: '[PII PURGED FOR PRIVACY]'
    }
  }));
  const dates = rawInput.match(CODE_PATTERNS.date) || [];
  const account = rawInput.match(CODE_PATTERNS.account);
  const zip = rawInput.match(CODE_PATTERNS.zip);
  return {
    id: uuidv4(),
    date: new Date().toISOString(),
    fileName,
    rawText: null, // ABSOLUTE MEMORY PURGE: Never return raw text
    redactedText: redacted,
    totalAmount,
    detectedCpt: cpt,
    detectedIcd: Array.from(new Set(rawInput.match(CODE_PATTERNS.icd10) || [])),
    planType,
    zipCode: zip ? zip[0] : undefined,
    fingerprint,
    fapEligible: planType === 'MEDICAID',
    legalAuditSummary: `Education Review Summary: ${redactedCount} items redacted. ${reviewPoints.length} review points identified.`,
    extractedData: {
      providerName: 'Redacted Facility',
      dateOfService: dates[dates.length - 1] || '',
      billDate: dates[0] || '',
      accountNumber: account ? account[1] : 'REDACTED'
    },
    overcharges,
    reviewPoints: reviewPoints as ReviewPoint[],
    status: reviewPoints.length > 0 ? 'flagged' : 'clean'
  };
}
export function exportLegalAuditPackage(audit: AuditRecord) {
  return JSON.stringify({
    metadata: {
      review_id: audit.id,
      timestamp: new Date().toISOString(),
      regulatory_notice: PA_DOI_DISCLAIMER,
      benchmark_notice: BENCHMARK_DISCLAIMER,
      pii_policy: "ABSOLUTE ZERO STORAGE - PURGED"
    },
    review_points: audit.reviewPoints,
    redacted_content: audit.redactedText,
    disclaimer: "This document is for educational purposes only."
  }, null, 2);
}