/**
 * IndexedDB helper for accounting (front-end only).
 * Store: entries { id, type, amount, category, date, note, createdAt }
 */

const DB_NAME = 'AccountingDB';
const STORE_NAME = 'entries';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * @param {Object} entry - { type: 'income'|'expense', amount: number, category: string, date: string (YYYY-MM-DD), note?: string }
 */
export function addEntry(entry) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        ...entry,
        amount: Number(entry.amount) || 0,
        date: entry.date || new Date().toISOString().slice(0, 10),
        note: entry.note || '',
        createdAt: Date.now(),
      };
      const req = store.add(record);
      req.onsuccess = () => resolve({ ...record, id: req.result });
      req.onerror = () => reject(req.error);
    });
  });
}

export function getAllEntries() {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  });
}

export function getEntriesByMonth(yearMonth) {
  return getAllEntries().then((list) => {
    return list.filter((e) => e.date && e.date.startsWith(yearMonth)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  });
}

export function getEntriesByYear(year) {
  return getAllEntries().then((list) => {
    return list.filter((e) => e.date && e.date.startsWith(String(year))).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  });
}

export function getEntriesByDate(dateStr) {
  return getAllEntries().then((list) => {
    return list.filter((e) => e.date === dateStr).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  });
}

export function deleteEntry(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

export function updateEntry(id, updates) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const existing = getReq.result;
        if (!existing) {
          reject(new Error('Entry not found'));
          return;
        }
        const next = { ...existing, ...updates, id: existing.id };
        const putReq = store.put(next);
        putReq.onsuccess = () => resolve(next);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  });
}
