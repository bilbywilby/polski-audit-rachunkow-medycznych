import * as pdfjs from 'pdfjs-dist';
import {
  CODE_PATTERNS,
  REDACTION_PATTERNS,
  PA_RULES,
  FAIR_BENCHMARKS,
  PLAN_KEYWORDS,
  PA_VIOLATION_TAXONOMY,
  MAX_PAGE_COUNT,
  RuleContext,
  MEDICARE_PROXY_RATIO,
  ACT_102_REFERENCES
} from '@/data/constants';
import { AuditRecord, OverchargeItem, AuditFlag } from './db';
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
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('PDF Extraction Timeout (30s)')), 30000)
  );
  const extractionPromise = (async () => {
    const pdf = await loadingTask.promise;
    if (pdf.numPages > MAX_PAGE_COUNT) {
      throw new Error(`File too large: ${pdf.numPages} pages exceeds ${MAX_PAGE_COUNT} page limit.`);
    }
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
  })();
  return Promise.race([extractionPromise, timeoutPromise]);
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
  const { redacted } = redactSensitiveData(text);
  const planType = detectPlanType(text);
  const zipMatches = text.match(CODE_PATTERNS.zip);
  const zipCode = zipMatches ? zipMatches[0] : undefined;
  const fingerprint = await generateDocumentFingerprint(text);
  const cpt = Array.from(new Set(text.match(CODE_PATTERNS.cpt) || []));
  const hcpcs = Array.from(new Set(text.match(CODE_PATTERNS.hcpcs) || []));
  const revenue = Array.from(new Set(text.match(CODE_PATTERNS.revenue) || []));
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
  let isSevereTotal = false;
  cpt.forEach(code => {
    const fairVal = FAIR_BENCHMARKS[code];
    if (fairVal) {
      const medicareProxy = fairVal * MEDICARE_PROXY_RATIO;
      const threshold = medicareProxy * 1.5;
      if (totalAmount > medicareProxy) {
        const isSevere = totalAmount > threshold;
        if (isSevere) isSevereTotal = true;
        overcharges.push({
          code,
          description: isSevere ? `Severe Statutory Overcharge (PA Quality Standard)` : `Potential overcharge (Above Medicare Proxy)`,
          billedAmount: totalAmount,
          benchmarkAmount: fairVal,
          medicareProxyAmount: medicareProxy,
          percentOver: Math.round(((totalAmount - medicareProxy) / medicareProxy) * 100),
          legalCitation: isSevere ? ACT_102_REFERENCES.SECTION_5.title : undefined,
          statutoryReference: isSevere ? ACT_102_REFERENCES.SECTION_5.description : undefined
        });
      }
    }
  });
  const ruleCtx: RuleContext = { rawText: text, overcharges, cpt, planType };
  const rawFlags = PA_RULES.filter(r => r.check(ruleCtx));
  const flags = await Promise.all(rawFlags.map(async f => {
    const snippet = text.substring(0, 200).replace(/\n/g, ' ');
    const hash = await computeEvidenceHash(snippet);
    return {
      type: f.id,
      severity: f.severity,
      description: f.description,
      isSevere: f.severity === 'high' || isSevereTotal,
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
  const headerLines = text.split('\n').slice(0, 15).map(l => l.trim()).filter(l => l.length > 5);
  const providerKeywords = ['HOSPITAL', 'CLINIC', 'CENTER', 'HEALTH', 'MEDICAL'];
  const providerName = headerLines.find(l => providerKeywords.some(kw => l.toUpperCase().includes(kw))) || headerLines[0] || 'Unknown Facility';
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
    fingerprint,
    fapEligible: isSevereTotal || planType === 'MEDICAID',
    legalAuditSummary: isSevereTotal ? "High-risk audit detected severe overcharge violations under PA Act 102." : "Standard audit completed.",
    extractedData: {
      providerName,
      dateOfService: dates[dates.length - 1] || dates[0] || '',
      billDate: dates[0] || '',
      accountNumber: account ? account[1] : '',
      policyId: policy ? policy[1] : ''
    },
    overcharges,
    flags,
    status: flags.length > 0 ? 'flagged' : 'clean'
  };
}
export function exportLegalAuditPackage(audit: AuditRecord) {
  return JSON.stringify({
    metadata: {
      audit_id: audit.id,
      fingerprint: audit.fingerprint,
      timestamp: new Date().toISOString(),
      statutory_basis: "PA Act 102 & No Surprises Act"
    },
    summary: audit.legalAuditSummary,
    flags: audit.flags.map(f => ({
      code: f.taxonomy?.rule_id,
      statute: f.taxonomy?.statute_ref,
      severity: f.severity,
      snippet: f.taxonomy?.evidence_snippet
    })),
    remediation: {
      pa_doh_hotline: "1-800-254-5164",
      fap_eligible: audit.fapEligible,
      itemization_required: true
    },
    disclaimer: "This document is an automated audit report and does not constitute legal counsel."
  }, null, 2);
}