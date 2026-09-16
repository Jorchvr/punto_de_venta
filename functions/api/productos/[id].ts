import { ensureSchema } from "../_schema";

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

export const onRequestPut: PagesFunction<Env, "id"> = async (ctx) => {
  await ensureSchema(ctx.env.DB);
  const id = Number(ctx.params.id);
  const body = await ctx.request.json<{
    Nombre: string;
    Precio: number;
    Stock: number;
    Costo: number;
    CodigoBarras: string;
    EsServicio: number;
  }>();
  await ctx.env.DB.prepare(
    "UPDATE Productos SET Nombre=?, Precio=?, Stock=?, Costo=?, CodigoBarras=?, EsServicio=? WHERE Id=?"
  )
    .bind(body.Nombre, body.Precio, body.Stock, body.Costo, body.CodigoBarras, body.EsServicio, id)
    .run();
  return json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env, "id"> = async (ctx) => {
  await ensureSchema(ctx.env.DB);
  const id = Number(ctx.params.id);
  await ctx.env.DB.prepare("DELETE FROM Productos WHERE Id=?").bind(id).run();
  return json({ ok: true });
};
