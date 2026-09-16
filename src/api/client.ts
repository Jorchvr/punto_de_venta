import { useCloud } from "@/stores/cloud.store";

function baseUrl(): string {
  if (typeof window !== "undefined" && window.location) {
    return window.location.origin;
  }
  return "";
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const { apiKey, setStatus } = useCloud.getState();
  const url = `${baseUrl()}/api${path}`;
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      setStatus("error", `${res.status} ${text.slice(0, 120)}`);
      throw new Error(`API ${res.status}: ${text.slice(0, 120)}`);
    }
    setStatus("ok");
    return (await res.json()) as T;
  } catch (e: any) {
    setStatus("error", String(e?.message ?? e));
    throw e;
  }
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};

export async function healthCheck(): Promise<boolean> {
  try {
    const r = await api.get<{ ok: boolean }>("/health");
    return !!r.ok;
  } catch {
    return false;
  }
}
