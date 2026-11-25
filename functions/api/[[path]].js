// Cloudflare Pages Functions: todas las rutas /api/* van al núcleo común.
// El contenido de pago va dentro de la función (no se publica como archivo).
import { handle } from "../../src/api.mjs";
import { d1Store } from "../../src/d1.mjs";
import data from "../../content/data.json";
import res from "../../content/res.json";

export async function onRequest(ctx) {
  try {
    return await handle(ctx.request, { env: ctx.env, store: d1Store(ctx.env.DB), content: () => ({ data, res }) });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Error del servidor" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
