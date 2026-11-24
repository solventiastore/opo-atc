// API de la app: cuentas de usuario + sincronización del progreso.
// Datos en Netlify Blobs (sin base de datos externa).
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const store = () => getStore({ name: "opo-atc", consistency: "strong" });
const norm = (u) => String(u || "").trim().toLowerCase();
const ITER = 210000;
const hash = (pass, salt) => crypto.pbkdf2Sync(pass, salt, ITER, 32, "sha256").toString("hex");
const SESSION_DAYS = 180;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function auth(req, s) {
  const h = req.headers.get("authorization") || "";
  const tok = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!/^[a-f0-9]{64}$/.test(tok)) return null;
  const sess = await s.get("s:" + tok, { type: "json" });
  if (!sess || sess.exp < Date.now()) return null;
  return { ...sess, tok };
}
async function userKeys(s) { const { blobs } = await s.list({ prefix: "u:" }); return blobs.map((b) => b.key); }
// Administradores: los indicados en ADMIN_USERS (Netlify) o, si no, la primera cuenta creada.
async function isAdmin(s, user) {
  const env = String(process.env.ADMIN_USERS || "").split(",").map(norm).filter(Boolean);
  if (env.length) return env.includes(user);
  let admins = await s.get("meta:admins", { type: "json" });
  if (!admins) {
    let first = null;
    for (const k of await userKeys(s)) { const u = await s.get(k, { type: "json" }); if (u && (!first || u.created < first.created)) first = u; }
    admins = first ? [first.user] : [];
    if (first) await s.setJSON("meta:admins", admins);
  }
  return admins.includes(user);
}
async function newSession(s, user) {
  const tok = crypto.randomBytes(32).toString("hex");
  await s.setJSON("s:" + tok, { user, exp: Date.now() + SESSION_DAYS * 864e5 });
  return tok;
}

export default async (req) => {
  const s = store();
  const path = new URL(req.url).pathname.replace(/^\/api\/?/, "");
  const body = req.method === "POST" ? await req.json().catch(() => ({})) : null;

  if (path === "register" && req.method === "POST") {
    const user = norm(body.user), pass = String(body.pass || ""), name = String(body.name || "").slice(0, 40).trim();
    const code = String(body.invite || "").trim().toUpperCase();
    if (!/^[a-z0-9._-]{3,30}$/.test(user)) return json({ error: "Usuario: 3-30 caracteres (letras, números, . _ -)" }, 400);
    if (pass.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres" }, 400);
    if (await s.get("u:" + user)) return json({ error: "Ese usuario ya existe" }, 409);
    // Clave de invitación obligatoria y de un solo uso.
    // Excepción: la primera cuenta de la web no necesita clave y será la administradora.
    const firstUser = (await userKeys(s)).length === 0;
    let inv = null;
    if (!firstUser) {
      inv = code ? await s.get("inv:" + code, { type: "json" }) : null;
      if (!inv || inv.usedBy || inv.revoked) { await sleep(500); return json({ error: inv?.usedBy ? "Esa clave de invitación ya se ha usado" : "Clave de invitación no válida" }, 403); }
    }
    const salt = crypto.randomBytes(16).toString("hex");
    await s.setJSON("u:" + user, { user, name: name || user, salt, hash: hash(pass, salt), created: Date.now() });
    if (inv) { inv.usedBy = user; inv.usedAt = Date.now(); await s.setJSON("inv:" + code, inv); }
    if (firstUser) await s.setJSON("meta:admins", [user]);
    return json({ token: await newSession(s, user), user, name: name || user });
  }

  if (path === "login" && req.method === "POST") {
    const user = norm(body.user);
    const u = await s.get("u:" + user, { type: "json" });
    const ok = u && crypto.timingSafeEqual(Buffer.from(hash(String(body.pass || ""), u.salt), "hex"), Buffer.from(u.hash, "hex"));
    if (!ok) { await sleep(500); return json({ error: "Usuario o contraseña incorrectos" }, 401); }
    return json({ token: await newSession(s, user), user, name: u.name });
  }

  const me = await auth(req, s);
  if (!me) return json({ error: "Sesión caducada: vuelve a entrar" }, 401);

  if (path === "logout" && req.method === "POST") { await s.delete("s:" + me.tok); return json({ ok: true }); }

  if (path === "me") { const u = await s.get("u:" + me.user, { type: "json" }); return json({ user: me.user, name: u?.name || me.user, admin: await isAdmin(s, me.user) }); }

  // --- Invitaciones (solo administradores) ---
  if (path.startsWith("invites")) {
    if (!(await isAdmin(s, me.user))) return json({ error: "Solo la cuenta administradora puede gestionar invitaciones" }, 403);
    if (path === "invites" && req.method === "GET") {
      const { blobs } = await s.list({ prefix: "inv:" });
      const list = [];
      for (const b of blobs) { const v = await s.get(b.key, { type: "json" }); if (v) list.push({ code: b.key.slice(4), ...v }); }
      list.sort((a, b) => b.created - a.created);
      return json({ invites: list });
    }
    if (path === "invites/create" && req.method === "POST") {
      const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const part = () => Array.from(crypto.randomBytes(4), (x) => A[x % A.length]).join("");
      const code = `ATC-${part()}-${part()}`;
      const inv = { created: Date.now(), by: me.user, note: String(body.note || "").slice(0, 60) };
      await s.setJSON("inv:" + code, inv);
      return json({ code, ...inv });
    }
    if (path === "invites/revoke" && req.method === "POST") {
      const code = String(body.code || "").toUpperCase(); const inv = await s.get("inv:" + code, { type: "json" });
      if (!inv) return json({ error: "No existe" }, 404);
      if (!inv.usedBy) { inv.revoked = Date.now(); await s.setJSON("inv:" + code, inv); }
      return json({ ok: true });
    }
  }

  if (path === "password" && req.method === "POST") {
    const u = await s.get("u:" + me.user, { type: "json" });
    if (!u || hash(String(body.old || ""), u.salt) !== u.hash) return json({ error: "La contraseña actual no es correcta" }, 401);
    if (String(body.pass || "").length < 8) return json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, 400);
    u.salt = crypto.randomBytes(16).toString("hex"); u.hash = hash(String(body.pass), u.salt);
    await s.setJSON("u:" + me.user, u);
    return json({ ok: true });
  }

  if (path === "sync") {
    if (req.method === "GET") { const v = await s.get("d:" + me.user); return new Response(v || "null", { headers: { "content-type": "application/json", "cache-control": "no-store" } }); }
    if (req.method === "PUT") {
      const txt = await req.text();
      if (txt.length > 8_000_000) return json({ error: "Demasiado grande" }, 413);
      try { JSON.parse(txt); } catch { return json({ error: "JSON no válido" }, 400); }
      await s.set("d:" + me.user, txt);
      return json({ ok: true });
    }
  }
  return json({ error: "No encontrado" }, 404);
};

export const config = { path: "/api/*" };
