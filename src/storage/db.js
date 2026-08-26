/**
 * Thin IndexedDB wrapper. One object store, keyed by save name — no
 * ORM, no wrapper library, because the access pattern here is just
 * "put/get/list/delete a JSON-shaped record" and IndexedDB's native
 * API covers that in a few lines.
 */
const DB_NAME = 'factoryforge'
const DB_VERSION = 1
const STORE = 'saves'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'name' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore(mode, work) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const store = tx.objectStore(STORE)
    const result = work(store)
    tx.oncomplete = () => resolve(result?.result)
    tx.onerror = () => reject(tx.error)
  })
}

export function putSaveRecord(record) {
  return withStore('readwrite', (store) => store.put(record))
}

export function getSaveRecord(name) {
  return withStore('readonly', (store) => store.get(name))
}

export function listSaveRecords() {
  return withStore('readonly', (store) => store.getAll())
}

export function deleteSaveRecord(name) {
  return withStore('readwrite', (store) => store.delete(name))
}
