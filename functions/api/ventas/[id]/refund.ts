import { ensureSchema } from "../../_schema";

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

export const onRequestPost: PagesFunction<Env, "id"> = async (ctx) => {
  await ensureSchema(ctx.env.DB);
  const id = Number(ctx.params.id);
  const v = await ctx.env.DB.prepare("SELECT * FROM Ventas WHERE Id=?")
    .bind(id)
    .first<{ Refundada: number; Concepto: string; ProductoId: number | null }>();
  if (!v) return json({ error: "not found" }, 404);
  if (v.Refundada === 1) return json({ ok: true, alreadyRefunded: true });

  const statements: D1PreparedStatement[] = [];
  if (v.ProductoId != null) {
    const cantMatch = /^(\d+)x/.exec(v.Concepto);
    const cant = cantMatch ? parseInt(cantMatch[1], 10) : 0;
    if (cant > 0) {
      statements.push(
        ctx.env.DB.prepare("UPDATE Productos SET Stock = Stock + ? WHERE Id = ?").bind(
          cant,
          v.ProductoId
        )
      );
    }
  }
  statements.push(ctx.env.DB.prepare("UPDATE Ventas SET Refundada=1 WHERE Id=?").bind(id));
  await ctx.env.DB.batch(statements);
  return json({ ok: true });
};
