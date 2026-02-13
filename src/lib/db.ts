import { openDB, IDBPDatabase } from 'idb';
export interface OverchargeItem {
  code: string;
  description: string;
  billedAmount: number;
  benchmarkAmount: number;
  percentOver: number;
}
export interface AuditFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  taxonomy?: {
    rule_id: string;
    statute_ref: string;
    requires_review: boolean;
    evidence_hash: string;
    evidence_snippet: string;
  };
}
export interface AuditRecord {
  id: string;
  date: string;
  fileName: string;
  rawText: string;
  redactedText: string;
  totalAmount: number;
  detectedCpt: string[];
  detectedIcd: string[];
  detectedHcpcs?: string[];
  detectedRevenue?: string[];
  detectedNpi?: string[];
  planType: 'COMMERCIAL' | 'MEDICAID' | 'MEDICARE' | 'UNKNOWN';
  zipCode?: string;
  fingerprint?: string;
  extractedData: {
    providerName?: string;
    dateOfService?: string;
    billDate?: string;
    accountNumber?: string;
    policyId?: string;
    allDates?: string[];
  };
  overcharges: OverchargeItem[];
  flags: AuditFlag[];
  status: 'completed' | 'flagged' | 'clean';
}
export interface InsuranceFilingRecord {
  id: string;
  date: string;
  fileName: string;
  fileType: 'PDF' | 'XLSX';
  status: 'ingesting' | 'analyzing_rates' | 'indexed' | 'flagged';
  flags: AuditFlag[];
  extractedData: {
    companyName?: string;
    planYear?: string;
    avgRateHike?: string;
    avLevel?: string;
    mlrPercent?: string;
    countyPricing?: Record<string, number>;
    rawSummary?: string;
  };
}
export interface RedactionAuditRecord {
  id: string;
  auditId: string;
  timestamp: string;
  retentionUntil: string;
  regulatoryBasis: string;
  redactionCount: number;
}
const DB_NAME = 'billguard-pa-db';
const STORE_NAME = 'audits';
const FILINGS_STORE = 'insurance_filings';
const REDACTION_STORE = 'redaction_audits';
const DB_VERSION = 7;
let dbPromise: Promise<IDBPDatabase> | null = null;
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(FILINGS_STORE)) {
          const filingStore = db.createObjectStore(FILINGS_STORE, { keyPath: 'id' });
          filingStore.createIndex('companyName', 'extractedData.companyName');
        }
        if (!db.objectStoreNames.contains(REDACTION_STORE)) {
          const redactionStore = db.createObjectStore(REDACTION_STORE, { keyPath: 'id' });
          redactionStore.createIndex('auditId', 'auditId');
        }
      },
    });
  }
  return dbPromise;
}
export async function saveAudit(audit: AuditRecord): Promise<string> {
  const db = await getDB();
  await db.put(STORE_NAME, audit);
  return audit.id;
}
export async function getAllAudits(): Promise<AuditRecord[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}
export async function getAuditById(id: string): Promise<AuditRecord | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}
export async function findAuditByFingerprint(hash: string): Promise<AuditRecord | undefined> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.find(a => a.fingerprint === hash);
}
export async function deleteAudit(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([STORE_NAME, REDACTION_STORE], 'readwrite');
  await tx.objectStore(STORE_NAME).delete(id);
  const redactionIndex = tx.objectStore(REDACTION_STORE).index('auditId');
  let cursor = await redactionIndex.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}
export async function saveFiling(filing: InsuranceFilingRecord): Promise<string> {
  const db = await getDB();
  await db.put(FILINGS_STORE, filing);
  return filing.id;
}
export async function getAllFilings(): Promise<InsuranceFilingRecord[]> {
  const db = await getDB();
  return db.getAll(FILINGS_STORE);
}
export async function getFilingById(id: string): Promise<InsuranceFilingRecord | undefined> {
  const db = await getDB();
  return db.get(FILINGS_STORE, id);
}
export async function deleteFiling(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(FILINGS_STORE, id);
}
export async function saveRedactionAudit(record: RedactionAuditRecord): Promise<void> {
  const db = await getDB();
  await db.put(REDACTION_STORE, record);
}
export async function clearAllHistory(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([STORE_NAME, FILINGS_STORE, REDACTION_STORE], 'readwrite');
  await tx.objectStore(STORE_NAME).clear();
  await tx.objectStore(FILINGS_STORE).clear();
  await tx.objectStore(REDACTION_STORE).clear();
  await tx.done;
}