interface Env {
  DB: D1Database;
  API_KEY: string;
}

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  "Access-Control-Max-Age": "86400",
};

export const onRequest: PagesFunction<Env> = async (ctx) => {
  if (ctx.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const provided = ctx.request.headers.get("X-API-Key") ?? "";
  const expected = ctx.env.API_KEY ?? "";
  if (!expected) {
    return json({ error: "server: API_KEY no configurada" }, 500);
  }
  if (provided !== expected) {
    return json({ error: "unauthorized" }, 401);
  }

  const res = await ctx.next();
  const merged = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS)) merged.set(k, v);
  return new Response(res.body, { status: res.status, headers: merged });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
