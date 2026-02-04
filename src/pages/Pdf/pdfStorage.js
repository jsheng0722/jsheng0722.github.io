const DB_NAME = 'pdf-files-db';
const STORE_NAME = 'files';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * 获取所有已保存的 PDF 记录（含 blob）
 */
export function getAll() {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result || []);
      tx.oncomplete = () => db.close();
    });
  });
}

/**
 * 保存一个 PDF：{ id, name, blob, createdAt }
 */
export function add(entry) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(entry);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
      tx.oncomplete = () => db.close();
    });
  });
}

/**
 * 按 id 获取一条记录
 */
export function getById(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result || null);
      tx.oncomplete = () => db.close();
    });
  });
}

/**
 * 更新一条记录（用于编辑后保存）
 */
export function update(id, patch) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);
      getReq.onerror = () => reject(getReq.error);
      getReq.onsuccess = () => {
        const existing = getReq.result;
        if (!existing) {
          reject(new Error('记录不存在'));
          return;
        }
        const updated = { ...existing, ...patch };
        const putReq = store.put(updated);
        putReq.onerror = () => reject(putReq.error);
        putReq.onsuccess = () => resolve();
      };
      tx.oncomplete = () => db.close();
    });
  });
}

/**
 * 按 id 删除
 */
export function remove(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
      tx.oncomplete = () => db.close();
    });
  });
}
