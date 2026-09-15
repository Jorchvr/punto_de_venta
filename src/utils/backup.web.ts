import { exportDbBytes, importDbBytes } from "@/db/client";

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function respaldar(): Promise<{ ok: boolean; message: string }> {
  const bytes = await exportDbBytes();
  const blob = new Blob([new Uint8Array(bytes)], {
    type: "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `blackmamba_${stamp()}.db`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return { ok: true, message: "RESPALDO DESCARGADO" };
}

export async function restaurar(): Promise<{ ok: boolean; message: string }> {
  const bytes = await pickFileBytes();
  if (!bytes) return { ok: false, message: "" };
  await importDbBytes(bytes);
  return { ok: true, message: "BD RESTAURADA. RECARGA LA PAGINA PARA APLICAR CAMBIOS." };
}

function pickFileBytes(): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".db,application/octet-stream";
    input.style.display = "none";
    document.body.appendChild(input);

    let settled = false;
    const cleanup = () => {
      input.remove();
      window.removeEventListener("focus", onFocus);
    };

    const onFocus = () => {
      setTimeout(() => {
        if (!settled && !input.files?.length) {
          settled = true;
          cleanup();
          resolve(null);
        }
      }, 500);
    };
    window.addEventListener("focus", onFocus, { once: true });

    input.onchange = async () => {
      if (settled) return;
      settled = true;
      const file = input.files?.[0];
      cleanup();
      if (!file) {
        resolve(null);
        return;
      }
      const buf = await file.arrayBuffer();
      resolve(new Uint8Array(buf));
    };

    input.click();
  });
}
