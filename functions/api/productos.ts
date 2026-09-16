import { ensureSchema } from "./_schema";

interface Env {
  DB: D1Database;
}

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  await ensureSchema(ctx.env.DB);
  const search = new URL(ctx.request.url).searchParams.get("search") ?? "";
  if (search.trim()) {
    const q = `%${search.trim().toUpperCase()}%`;
    const { results } = await ctx.env.DB.prepare(
      "SELECT * FROM Productos WHERE UPPER(Nombre) LIKE ? OR CodigoBarras LIKE ? ORDER BY Nombre ASC"
    )
      .bind(q, `%${search.trim()}%`)
      .all();
    return json(results);
  }
  const { results } = await ctx.env.DB.prepare(
    "SELECT * FROM Productos ORDER BY Nombre ASC"
  ).all();
  return json(results);
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  await ensureSchema(ctx.env.DB);
  const body = await ctx.request.json<{
    Nombre: string;
    Precio: number;
    Stock: number;
    Costo: number;
    CodigoBarras: string;
    EsServicio: number;
  }>();
  const res = await ctx.env.DB.prepare(
    "INSERT INTO Productos (Nombre, Precio, Stock, Costo, CodigoBarras, EsServicio) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(body.Nombre, body.Precio, body.Stock, body.Costo, body.CodigoBarras, body.EsServicio)
    .run();
  return json({ id: res.meta.last_row_id });
};
