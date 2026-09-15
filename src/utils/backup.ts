import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { DB_NAME } from "@/db/schema";
import { resetDb } from "@/db/client";

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function respaldar(): Promise<{ ok: boolean; message: string }> {
  const src = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
  const info = await FileSystem.getInfoAsync(src);
  if (!info.exists) return { ok: false, message: "BD NO ENCONTRADA" };
  const dest = `${FileSystem.cacheDirectory}powergym_${stamp()}.db`;
  await FileSystem.copyAsync({ from: src, to: dest });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dest, { mimeType: "application/octet-stream" });
    return { ok: true, message: "" };
  }
  return { ok: true, message: `RESPALDO EN ${dest}` };
}

export async function restaurar(): Promise<{ ok: boolean; message: string }> {
  const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
  if (res.canceled) return { ok: false, message: "" };
  const srcUri = res.assets[0].uri;
  const dbDir = `${FileSystem.documentDirectory}SQLite/`;
  const dbPath = `${dbDir}${DB_NAME}`;
  const dirInfo = await FileSystem.getInfoAsync(dbDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
  }
  await resetDb();
  await FileSystem.copyAsync({ from: srcUri, to: dbPath });
  return { ok: true, message: "BD RESTAURADA. REINICIA LA APP PARA APLICAR CAMBIOS." };
}
