import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import { DB_NAME, runMigrations } from "./schema";

const IDB_NAME = "blackmamba_db_storage";
const IDB_STORE = "kv";
const IDB_KEY = "blackmamba.db";

let SQL: SqlJsStatic | null = null;
let dbInstance: WebDb | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

type SqlValue = string | number | null;
type SqlParams = ReadonlyArray<SqlValue> | undefined;

interface RunResult {
  lastInsertRowId: number;
  changes: number;
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readSnapshot(): Promise<Uint8Array | null> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
    req.onsuccess = () => {
      const v = req.result as Uint8Array | undefined;
      resolve(v ?? null);
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => idb.close();
  });
}

async function writeSnapshot(bytes: Uint8Array): Promise<void> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(bytes, IDB_KEY);
    tx.oncomplete = () => {
      idb.close();
      resolve();
    };
    tx.onerror = () => {
      idb.close();
      reject(tx.error);
    };
  });
}

async function deleteSnapshot(): Promise<void> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(IDB_KEY);
    tx.oncomplete = () => {
      idb.close();
      resolve();
    };
    tx.onerror = () => {
      idb.close();
      reject(tx.error);
    };
  });
}

function bindParams(params: SqlParams): SqlValue[] {
  if (!params) return [];
  return params.map((p) => (p === undefined ? null : p));
}

class WebDb {
  private db: Database;
  private inTransaction = false;

  constructor(db: Database) {
    this.db = db;
  }

  async execAsync(sql: string): Promise<void> {
    this.db.exec(sql);
    this.scheduleSave();
  }

  async getFirstAsync<T = unknown>(
    sql: string,
    params?: SqlParams
  ): Promise<T | null> {
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(bindParams(params));
      if (stmt.step()) {
        return stmt.getAsObject() as T;
      }
      return null;
    } finally {
      stmt.free();
    }
  }

  async getAllAsync<T = unknown>(
    sql: string,
    params?: SqlParams
  ): Promise<T[]> {
    const stmt = this.db.prepare(sql);
    const rows: T[] = [];
    try {
      stmt.bind(bindParams(params));
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as T);
      }
      return rows;
    } finally {
      stmt.free();
    }
  }

  async runAsync(sql: string, params?: SqlParams): Promise<RunResult> {
    this.db.run(sql, bindParams(params));
    const changes = this.db.getRowsModified();
    let lastInsertRowId = 0;
    const res = this.db.exec("SELECT last_insert_rowid() as id");
    if (res.length > 0 && res[0].values.length > 0) {
      lastInsertRowId = Number(res[0].values[0][0]);
    }
    this.scheduleSave();
    return { lastInsertRowId, changes };
  }

  async withTransactionAsync(cb: () => Promise<void>): Promise<void> {
    if (this.inTransaction) {
      await cb();
      return;
    }
    this.inTransaction = true;
    this.db.run("BEGIN");
    try {
      await cb();
      this.db.run("COMMIT");
      this.scheduleSave();
    } catch (e) {
      try {
        this.db.run("ROLLBACK");
      } catch {}
      throw e;
    } finally {
      this.inTransaction = false;
    }
  }

  async closeAsync(): Promise<void> {
    await this.flushSave();
    this.db.close();
  }

  export(): Uint8Array {
    return this.db.export();
  }

  private scheduleSave(): void {
    if (this.inTransaction) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      writeSnapshot(this.db.export()).catch((e) =>
        console.warn("[sqljs] persist failed:", e)
      );
    }, 150);
  }

  private async flushSave(): Promise<void> {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    await writeSnapshot(this.db.export());
  }
}

async function ensureSql(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  SQL = await initSqlJs({
    locateFile: (file: string) => `/${file}`,
  });
  return SQL;
}

export async function getDb(): Promise<WebDb> {
  if (dbInstance) return dbInstance;
  const sql = await ensureSql();
  const snapshot = await readSnapshot();
  const rawDb = snapshot ? new sql.Database(snapshot) : new sql.Database();
  dbInstance = new WebDb(rawDb);
  await runMigrations(dbInstance as any);
  return dbInstance;
}

export async function resetDb(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

export async function exportDbBytes(): Promise<Uint8Array> {
  const db = await getDb();
  return db.export();
}

export async function importDbBytes(bytes: Uint8Array): Promise<void> {
  await resetDb();
  await writeSnapshot(bytes);
}

export async function wipeDb(): Promise<void> {
  await resetDb();
  await deleteSnapshot();
}

export { DB_NAME };
