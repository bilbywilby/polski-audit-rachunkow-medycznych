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
function findEvidenceSnippet(text: string, keyword: string): string {
  const lines = text.split('\n');
  const foundLine = lines.find(l => l.toUpperCase().includes(keyword.toUpperCase()));
  return foundLine ? foundLine.trim().substring(0, 100) : "Evidence found in document context.";
}
export async function analyzeBillText(text: string, fileName: string): Promise<AuditRecord> {
  const { redacted, count } = redactSensitiveData(text);
  const planType = detectPlanType(text);
  const zipMatches = text.match(CODE_PATTERNS.zip);
  const zipCode = zipMatches ? zipMatches[0] : undefined;
  const cpt = Array.from(new Set(text.match(CODE_PATTERNS.cpt) || []));
  // Robust amount extraction: ignore ZIPs or years by checking context
  const amountMatches = text.match(CODE_PATTERNS.amounts) || [];
  const amounts = amountMatches
    .map(m => parseFloat(m.replace(/[$,\s]/g, '')))
    .filter(n => !isNaN(n) && n < 1000000); // Filter out obviously wrong high numbers
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
    const snippet = findEvidenceSnippet(redacted, f.id === 'act-102-triad' ? 'EMERGENCY' : (cpt[0] || 'TOTAL'));
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
        evidence_snippet: snippet
      }
    };
  }));
  const auditId = uuidv4();
  const retentionDate = new Date();
  retentionDate.setFullYear(retentionDate.getFullYear() + 7);
  await saveRedactionAudit({
    id: uuidv4(),
    auditId,
    timestamp: new Date().toISOString(),
    retentionUntil: retentionDate.toISOString(),
    regulatoryBasis: 'HIPAA/PA-ACT-102',
    redactionCount: count
  });
  const dates = text.match(CODE_PATTERNS.date) || [];
  const policy = text.match(CODE_PATTERNS.policy);
  const account = text.match(CODE_PATTERNS.account);
  // Specific bill date detection
  let billDate = dates[0] || '';
  const dateKeywords = ['DATE:', 'BILL DATE:', 'STATEMENT DATE:', 'ISSUED:'];
  for (const kw of dateKeywords) {
    const idx = text.toUpperCase().indexOf(kw);
    if (idx !== -1) {
      const sub = text.substring(idx, idx + 30);
      const subMatch = sub.match(CODE_PATTERNS.date);
      if (subMatch) {
        billDate = subMatch[0];
        break;
      }
    }
  }
  return {
    id: auditId,
    date: new Date().toISOString(),
    fileName,
    rawText: text,
    redactedText: redacted,
    totalAmount,
    detectedCpt: cpt,
    detectedIcd: Array.from(new Set(text.match(CODE_PATTERNS.icd10) || [])),
    planType,
    zipCode,
    extractedData: {
      providerName: text.split('\n').slice(0, 5).find(l => l.length > 5 && !l.includes('Page')) || 'Unknown Facility',
      dateOfService: dates[dates.length - 1] || dates[0] || '',
      billDate: billDate,
      accountNumber: account ? account[1] : '',
      policyId: policy ? policy[1] : ''
    },
    overcharges,
    flags,
    status: flags.length > 0 ? 'flagged' : 'clean'
  };
}