import { openDB, IDBPDatabase } from 'idb';
export interface AuditRecord {
  id: string;
  date: string;
  fileName: string;
  rawText: string;
  totalAmount: number;
  detectedCpt: string[];
  detectedIcd: string[];
  detectedHcpcs?: string[];
  detectedRevenue?: string[];
  detectedNpi?: string[];
  flags: {
    type: 'upcoding' | 'unbundling' | 'balance-billing' | 'clerical' | 'facility-fee';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  status: 'completed' | 'flagged' | 'clean';
}
const DB_NAME = 'billguard-pa-db';
const STORE_NAME = 'audits';
let dbPromise: Promise<IDBPDatabase> | null = null;
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
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
  const audits = await db.getAll(STORE_NAME);
  return audits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
export async function getAuditById(id: string): Promise<AuditRecord | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}
export async function deleteAudit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}