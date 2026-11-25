// Cloudflare Workers: /api/* va al servidor; el resto son los archivos de public/ (los sirve Cloudflare directamente).
import { handle } from "./api.mjs";
import { d1Store } from "./d1.mjs";
import data from "../content/data.json";
import res from "../content/res.json";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await handle(request, { env, store: d1Store(env.DB), content: () => ({ data, res }) });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message || "Error del servidor" }), { status: 500, headers: { "content-type": "application/json" } });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
