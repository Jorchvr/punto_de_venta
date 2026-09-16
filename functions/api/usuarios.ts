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
  const { results } = await ctx.env.DB.prepare(
    "SELECT * FROM Usuarios ORDER BY Nombre ASC"
  ).all();
  return json(results);
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  await ensureSchema(ctx.env.DB);
  const body = await ctx.request.json<{ Nombre: string; Pin: string | null; Rol: string }>();
  const res = await ctx.env.DB.prepare(
    "INSERT INTO Usuarios (Nombre, Pin, Rol) VALUES (?, ?, ?)"
  )
    .bind(body.Nombre, body.Pin, body.Rol)
    .run();
  return json({ id: res.meta.last_row_id });
};
