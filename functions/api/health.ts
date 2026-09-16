interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  try {
    const r = await ctx.env.DB.prepare("SELECT 1 as ok").first<{ ok: number }>();
    return new Response(JSON.stringify({ ok: r?.ok === 1 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
