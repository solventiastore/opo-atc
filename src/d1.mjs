// Almacén clave-valor sobre Cloudflare D1 (SQLite). Misma interfaz que Netlify Blobs: get / set / setJSON / delete / list.
// La tabla se crea sola la primera vez.
let ready = null;
export function d1Store(db) {
  if (!db) throw new Error("Falta la base de datos: en Cloudflare, añade un enlace D1 llamado DB (Settings → Bindings).");
  const init = () => ready || (ready = db.prepare("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)").run().catch((e) => { ready = null; throw e; }));
  return {
    async get(k, o = {}) { await init(); const r = await db.prepare("SELECT v FROM kv WHERE k = ?").bind(k).first(); if (!r) return null; return o.type === "json" ? JSON.parse(r.v) : r.v; },
    async set(k, v) { await init(); await db.prepare("INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(k, String(v)).run(); },
    async setJSON(k, v) { return this.set(k, JSON.stringify(v)); },
    async delete(k) { await init(); await db.prepare("DELETE FROM kv WHERE k = ?").bind(k).run(); },
    async list({ prefix = "" } = {}) { await init(); const r = await db.prepare("SELECT k FROM kv WHERE k >= ? AND k < ?").bind(prefix, prefix + "￿").all(); return { blobs: (r.results || []).map((x) => ({ key: x.k })) }; },
  };
}
