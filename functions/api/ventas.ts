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

interface CartLine {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  esServicio: number;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  await ensureSchema(ctx.env.DB);
  const url = new URL(ctx.request.url);
  const desde = url.searchParams.get("desde");
  const hasta = url.searchParams.get("hasta");
  if (desde && hasta) {
    const { results } = await ctx.env.DB.prepare(
      "SELECT * FROM Ventas WHERE Fecha >= ? AND Fecha <= ? ORDER BY Fecha DESC"
    )
      .bind(desde, hasta)
      .all();
    return json(results);
  }
  const { results } = await ctx.env.DB.prepare(
    "SELECT * FROM Ventas ORDER BY Fecha DESC LIMIT 500"
  ).all();
  return json(results);
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  await ensureSchema(ctx.env.DB);
  const body = await ctx.request.json<{
    lines: CartLine[];
    metodo: string;
    usuario: string;
    fecha: string;
  }>();
  if (!body.lines?.length) return json({ error: "Carrito vacio" }, 400);

  const statements: D1PreparedStatement[] = [];
  const inserted: Array<{ concepto: string; total: number; productoId: number }> = [];

  for (const line of body.lines) {
    const total = line.precio * line.cantidad;
    const concepto = `${line.cantidad}x ${line.nombre}`;
    if (line.esServicio === 0) {
      statements.push(
        ctx.env.DB.prepare("UPDATE Productos SET Stock = Stock - ? WHERE Id = ?").bind(
          line.cantidad,
          line.productoId
        )
      );
    }
    statements.push(
      ctx.env.DB.prepare(
        `INSERT INTO Ventas (Fecha, Concepto, Total, MetodoPago, Usuario, Categoria, ProductoId)
         VALUES (?, ?, ?, ?, ?, 'PuntoDeVenta', ?)`
      ).bind(body.fecha, concepto, total, body.metodo, body.usuario, line.productoId)
    );
    inserted.push({ concepto, total, productoId: line.productoId });
  }

  await ctx.env.DB.batch(statements);
  return json({ ok: true, count: inserted.length });
};
