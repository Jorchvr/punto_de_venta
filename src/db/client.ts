import * as SQLite from "expo-sqlite";
import { DB_NAME, runMigrations } from "./schema";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(dbInstance);
  return dbInstance;
}

export async function resetDb(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

export async function exportDbBytes(): Promise<Uint8Array> {
  throw new Error("exportDbBytes solo esta disponible en web");
}

export async function importDbBytes(_bytes: Uint8Array): Promise<void> {
  throw new Error("importDbBytes solo esta disponible en web");
}
