// OpoATC · API: cuentas (email + Google), confirmación de email, suscripciones (Stripe),
// acceso al contenido según el plan contratado y sincronización del progreso.
// Datos en un almacén clave-valor (Netlify Blobs o Cloudflare D1, según dónde se publique).
//
// Variables de entorno (en Cloudflare: Settings → Variables and Secrets):
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET          → cobros con tarjeta
//   RESEND_API_KEY, EMAIL_FROM                        → email de confirmación
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET            → «Continuar con Google»
//   ADMIN_USERS (opcional)                            → emails/usuarios administradores, separados por comas
//   SITE_URL (opcional)                               → URL pública (si no, se usa la de la petición)
//   TEST_MODE=1 (SOLO PRUEBAS)                         → simula pagos, emails y Google
// Núcleo común: lo usan el adaptador de Netlify (netlify/functions/api.mjs) y el de Cloudflare (functions/api/[[path]].js).
// Solo usa APIs web estándar (fetch, Request/Response, Web Crypto), así funciona en los dos.
let E = {}, TEST = false, INVITE_ONLY = true, PAYMENTS = false, STORE = null, CONTENT_SRC = null;
// De momento: solo se crean cuentas con un código de invitación de un solo uso (OPEN_SIGNUP=1 para abrir el registro)
// Los pagos están apagados hasta que PAYMENTS=1 (y Stripe configurado)
async function captchaOk(token, ip) {
  if (!E.RECAPTCHA_SECRET) return true;
  if (!token) return false;
  try {
    const r = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: E.RECAPTCHA_SECRET, response: String(token), ...(ip ? { remoteip: ip } : {}) }).toString() });
    const d = await r.json(); return !!d.success;
  } catch (e) { return false; }
}
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const redirect = (url) => new Response(null, { status: 302, headers: { location: url, "cache-control": "no-store" } });
const store = () => STORE;
const norm = (u) => String(u || "").trim().toLowerCase();
// Contraseñas: PBKDF2-SHA256 con Web Crypto. Cloudflare admite como máximo 100.000 iteraciones;
// las cuentas antiguas de Netlify usaban 210.000 (se guarda el número en cada usuario: u.it).
let ITER = 100000; const OLD_ITER = 210000;
const enc = (x) => new TextEncoder().encode(x);
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
async function hash(pass, salt, it = ITER) {
  const key = await crypto.subtle.importKey("raw", enc(pass), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc(salt), iterations: it }, key, 256));
}
const safeEq = (a, b) => { a = String(a); b = String(b); if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };
const b64urlJson = (part) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=")), (c) => c.charCodeAt(0))));
const SESSION_DAYS = 180;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rnd = (n = 32) => hex(crypto.getRandomValues(new Uint8Array(n)));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ---------- Planes ----------
export const PLANS = {
  teoria:   { name: "Fase I · Teoría",                         cents: 800,  features: ["teoria"] },
  ingles:   { name: "Fase I · Teoría + Inglés",                cents: 1500, features: ["teoria", "ingles"] },
  completo: { name: "Fase I · Teoría + Inglés + Psicotécnicos", cents: 1900, features: ["teoria", "ingles", "psico"] },
  fase2:    { name: "Fase II · Todo incluido",                 cents: 2090, features: ["fase2"], later: true },
  fase3:    { name: "Fase III · Todo incluido",                cents: 2090, features: ["fase3"], later: true },
};
const ALL = ["teoria", "ingles", "psico", "fase2", "fase3"];
const ACTIVE = new Set(["active", "trialing", "past_due"]);

// ---------- Utilidades de usuario ----------
async function auth(req, s) {
  const h = req.headers.get("authorization") || "";
  const tok = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!/^[a-f0-9]{64}$/.test(tok)) return null;
  const sess = await s.get("s:" + tok, { type: "json" });
  if (!sess || sess.exp < Date.now()) return null;
  return { ...sess, tok };
}
async function userKeys(s) { const { blobs } = await s.list({ prefix: "u:" }); return blobs.map((b) => b.key); }
async function isAdmin(s, user) {
  // Administradores: los de ADMIN_USERS; si no se define, la primera cuenta creada (y la cuenta antigua «pablusm99»).
  const env = String(E.ADMIN_USERS || "").split(",").map(norm).filter(Boolean);
  if (env.includes(user) || user === "pablusm99") return true;
  if (E.ADMIN_USERS) return false;
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
  const tok = rnd();
  await s.setJSON("s:" + tok, { user, exp: Date.now() + SESSION_DAYS * 864e5 });
  return tok;
}
const getUser = (s, id) => s.get("u:" + id, { type: "json" });
const putUser = (s, u) => s.setJSON("u:" + u.user, u);
// Qué puede usar cada cuenta
async function features(s, u) {
  if (!u) return [];
  if (await isAdmin(s, u.user)) return ALL;
  if (!u.v) return ALL;                       // cuentas creadas antes del lanzamiento de pago
  if (u.comp) return PLANS[u.comp]?.features || ALL;  // acceso gratuito con código
  if (u.plan && ACTIVE.has(u.plan.status)) return PLANS[u.plan.id]?.features || [];
  return [];
}
const profileDone = (u) => !u.v || !!(u.name && u.surname && u.birth && u.source);
const publicUser = async (s, u) => ({
  user: u.user, email: u.email || null, name: u.name, surname: u.surname || "", verified: !u.v || !!u.verified,
  profileDone: profileDone(u), admin: await isAdmin(s, u.user), plan: u.plan || null, comp: u.comp || null,
  features: await features(s, u), google: !!u.google, hasPass: !!u.hash,
  birth: u.birth || "", source: u.source || "", marketing: !!u.marketing, created: u.created || null,
  config: { test: TEST, payments: PAYMENTS, invite: INVITE_ONLY, google: !!E.GOOGLE_CLIENT_ID || TEST },
});
const siteUrl = (req) => (E.SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
function ageOk(birth) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth || "")) return false;
  const b = new Date(birth + "T12:00:00"); const now = new Date();
  const age = (now - b) / (365.25 * 864e5);
  return age >= 14 && age <= 100;
}
function validateProfile(b, emailKnown) {
  const name = String(b.name || "").trim().slice(0, 60), surname = String(b.surname || "").trim().slice(0, 80);
  const email = norm(emailKnown || b.email), email2 = norm(b.email2);
  const source = String(b.source || "").trim().slice(0, 60), birth = String(b.birth || "");
  if (name.length < 2) return { error: "Escribe tu nombre" };
  if (surname.length < 2) return { error: "Escribe tus apellidos" };
  if (!EMAIL_RE.test(email)) return { error: "El email no es válido" };
  if (email !== email2) return { error: "Los dos emails no coinciden" };
  if (!ageOk(birth)) return { error: "Revisa la fecha de nacimiento (debes tener al menos 14 años)" };
  if (!source) return { error: "Dinos cómo nos has encontrado" };
  return { name, surname, email, birth, source };
}

// ---------- Email (Resend) ----------
async function sendMail(to, subject, html) {
  if (!E.RESEND_API_KEY) { console.log("[email simulado]", to, subject); return false; }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { authorization: "Bearer " + E.RESEND_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ from: E.EMAIL_FROM || "OpoATC <onboarding@resend.dev>", to: [to], subject, html }),
  });
  if (!r.ok) console.log("Resend error", r.status, await r.text());
  return r.ok;
}
async function sendVerification(s, req, u) {
  const t = rnd(24);
  await s.setJSON("ev:" + t, { user: u.user, exp: Date.now() + 3 * 864e5 });
  const link = `${siteUrl(req)}/api/verify?t=${t}`;
  const html = `<div style="font-family:'Titillium Web',Arial,sans-serif;max-width:520px;margin:auto;color:#1E2732">
    <div style="background:#00224C;padding:22px 26px;border-radius:12px 12px 0 0"><span style="color:#fff;font-size:22px;font-weight:700">Opo<span style="color:#009FDA">ATC</span></span></div>
    <div style="border:1px solid #E4E7EB;border-top:0;padding:26px;border-radius:0 0 12px 12px">
    <h2 style="margin:0 0 10px;color:#00224C">Confirma tu email, ${u.name}</h2>
    <p>Pulsa el botón para confirmar tu cuenta de OpoATC y empezar a preparar la Fase I.</p>
    <p style="margin:24px 0"><a href="${link}" style="background:#009FDA;color:#fff;text-decoration:none;padding:13px 22px;border-radius:8px;font-weight:700">Confirmar mi email</a></p>
    <p style="font-size:13px;color:#3A4C61">Si no has creado una cuenta, ignora este mensaje. El enlace caduca en 3 días.</p></div></div>`;
  const sent = await sendMail(u.email, "Confirma tu email · OpoATC", html);
  return { sent, link };
}

// ---------- Stripe (API REST, sin SDK) ----------
function form(obj, prefix = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") form(v, key, out); else out.append(key, String(v));
  }
  return out;
}
async function stripe(method, p, params) {
  const r = await fetch("https://api.stripe.com/v1/" + p, {
    method, headers: { authorization: "Bearer " + E.STRIPE_SECRET_KEY, "content-type": "application/x-www-form-urlencoded" },
    body: method === "GET" ? undefined : form(params || {}).toString(),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || "Error de Stripe");
  return d;
}
async function applySubscription(s, userId, planId, sub, customer) {
  const u = await getUser(s, userId); if (!u) return;
  u.plan = { id: planId || u.plan?.id, status: sub?.status || "active", cust: customer || u.plan?.cust, sub: sub?.id || u.plan?.sub,
    end: sub?.current_period_end || null, cancelAt: sub?.cancel_at_period_end ? sub.current_period_end : null, u: Date.now() };
  await putUser(s, u);
  if (customer) await s.setJSON("cus:" + customer, { user: userId });
}
async function verifyStripeSig(raw, header, secret) {
  const parts = Object.fromEntries(String(header || "").split(",").map((x) => x.split("=")));
  if (!parts.t || !parts.v1) return false;
  const key = await crypto.subtle.importKey("raw", enc(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, enc(`${parts.t}.${raw}`)));
  return safeEq(expected, parts.v1) && Math.abs(Date.now() / 1000 - +parts.t) < 600;
}

// ---------- Contenido (solo para cuentas con plan) ----------
let CONTENT = null;
function loadContent() { return CONTENT || (CONTENT = CONTENT_SRC()); }
const BODY_CACHE = new Map();

// ---------- Handler ----------
export async function handle(req, ctx) {
  E = ctx.env || {}; STORE = ctx.store; CONTENT_SRC = ctx.content;
  TEST = E.TEST_MODE === "1";
  ITER = Math.min(100000, Math.max(20000, +E.PBKDF2_ITER || 100000));
  INVITE_ONLY = E.OPEN_SIGNUP !== "1";
  PAYMENTS = E.PAYMENTS === "1" && (!!E.STRIPE_SECRET_KEY || TEST);
  const s = store();
  const url = new URL(req.url);
  const p = url.pathname.replace(/^\/api\/?/, "");
  const raw = req.method === "POST" || req.method === "PUT" ? await req.text() : "";
  let body = {}; if (req.method === "POST") { try { body = JSON.parse(raw || "{}"); } catch { body = {}; } }

  // --- Webhook de Stripe ---
  if (p === "config" && req.method === "GET") {
    return json({ captcha: E.RECAPTCHA_SITE_KEY || null, invite: INVITE_ONLY, payments: PAYMENTS, google: !!E.GOOGLE_CLIENT_ID || TEST, test: TEST });
  }
  if (p === "billing/webhook" && req.method === "POST") {
    if (!E.STRIPE_WEBHOOK_SECRET || !(await verifyStripeSig(raw, req.headers.get("stripe-signature"), E.STRIPE_WEBHOOK_SECRET))) return json({ error: "firma" }, 400);
    const ev = JSON.parse(raw); const o = ev.data?.object || {};
    if (ev.type === "checkout.session.completed" && o.mode === "subscription") {
      const sub = o.subscription ? await stripe("GET", "subscriptions/" + o.subscription) : null;
      await applySubscription(s, o.client_reference_id, o.metadata?.plan, sub, o.customer);
    }
    if (ev.type.startsWith("customer.subscription.")) {
      const map = await s.get("cus:" + o.customer, { type: "json" });
      const userId = o.metadata?.user || map?.user;
      if (userId) await applySubscription(s, userId, o.metadata?.plan, o, o.customer);
    }
    return json({ received: true });
  }

  // --- Registro con email ---
  if (p === "register" && req.method === "POST") {
    const v = validateProfile(body); if (v.error) return json(v, 400);
    const pass = String(body.pass || "");
    if (pass.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres" }, 400);
    if (!body.terms) return json({ error: "Debes aceptar los términos y la política de privacidad" }, 400);
    if (!(await captchaOk(body.captcha, (req.headers.get("cf-connecting-ip") || req.headers.get("x-nf-client-connection-ip"))))) return json({ error: "Marca la casilla «No soy un robot»" }, 400);
    if (await getUser(s, v.email)) return json({ error: "Ya hay una cuenta con ese email. Entra con tu contraseña." }, 409);
    const firstUser = (await userKeys(s)).length === 0;
    let comp = null; const code = String(body.invite || "").trim().toUpperCase();
    if (INVITE_ONLY && !code && !firstUser) return json({ error: "Necesitas un código de acceso para crear la cuenta" }, 403);
    if (code) {
      const inv = await s.get("inv:" + code, { type: "json" });
      if (!inv || inv.usedBy || inv.revoked) { await sleep(400); return json({ error: inv?.usedBy ? "Ese código ya se ha usado" : "Código de acceso no válido" }, 403); }
      inv.usedBy = v.email; inv.usedAt = Date.now(); await s.setJSON("inv:" + code, inv); comp = inv.plan || "completo";
    }
    const salt = rnd(16);
    const u = { user: v.email, email: v.email, name: v.name, surname: v.surname, birth: v.birth, source: v.source,
      salt, hash: await hash(pass, salt), it: ITER, created: Date.now(), verified: false, v: 2, comp, wantPlan: PLANS[body.plan] ? body.plan : null,
      marketing: !!body.marketing };
    await putUser(s, u);
    if (firstUser) await s.setJSON("meta:admins", [u.user]);
    const ver = await sendVerification(s, req, u);
    return json({ token: await newSession(s, u.user), ...(await publicUser(s, u)), ...(TEST || !E.RESEND_API_KEY ? { devLink: ver.link } : {}) });
  }

  // --- Confirmación de email ---
  if (p === "verify" && req.method === "GET") {
    const t = url.searchParams.get("t") || ""; const ev = /^[a-f0-9]{48}$/.test(t) ? await s.get("ev:" + t, { type: "json" }) : null;
    if (!ev || ev.exp < Date.now()) return redirect("/app.html#/verificado?error=1");
    const u = await getUser(s, ev.user); if (u) { u.verified = true; await putUser(s, u); }
    await s.delete("ev:" + t);
    return redirect("/app.html#/verificado");
  }

  // --- Login (email o usuario antiguo) ---
  if (p === "login" && req.method === "POST") {
    const id = norm(body.user || body.email);
    const u = await getUser(s, id);
    const ok = u && u.hash && safeEq(await hash(String(body.pass || ""), u.salt, u.it || OLD_ITER), u.hash);
    if (!ok) { await sleep(500); return json({ error: u && !u.hash ? "Esta cuenta se creó con Google: usa «Continuar con Google»" : "Email o contraseña incorrectos" }, 401); }
    return json({ token: await newSession(s, u.user), ...(await publicUser(s, u)) });
  }

  // --- Google ---
  if (p === "auth/google" && req.method === "GET") {
    const state = rnd(16); await s.setJSON("st:" + state, { plan: url.searchParams.get("plan") || null, exp: Date.now() + 15 * 60e3 });
    if (!E.GOOGLE_CLIENT_ID) {
      if (TEST) return redirect(`/api/auth/google/callback?state=${state}&code=TEST`);
      return redirect("/app.html#/entrar?error=google");
    }
    const q = new URLSearchParams({ client_id: E.GOOGLE_CLIENT_ID, redirect_uri: siteUrl(req) + "/api/auth/google/callback", response_type: "code",
      scope: "openid email profile", state, prompt: "select_account" });
    return redirect("https://accounts.google.com/o/oauth2/v2/auth?" + q);
  }
  if (p === "auth/google/callback" && req.method === "GET") {
    const state = url.searchParams.get("state") || ""; const st = /^[a-f0-9]{32}$/.test(state) ? await s.get("st:" + state, { type: "json" }) : null;
    if (!st || st.exp < Date.now()) return redirect("/app.html#/entrar?error=google");
    await s.delete("st:" + state);
    let prof;
    if (!E.GOOGLE_CLIENT_ID && TEST) prof = { sub: "test-google", email: "google.prueba@example.com", email_verified: true, given_name: "Prueba", family_name: "" };
    else {
      const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ code: url.searchParams.get("code") || "", client_id: E.GOOGLE_CLIENT_ID, client_secret: E.GOOGLE_CLIENT_SECRET || "",
          redirect_uri: siteUrl(req) + "/api/auth/google/callback", grant_type: "authorization_code" }) });
      const tk = await r.json(); if (!r.ok || !tk.id_token) return redirect("/app.html#/entrar?error=google");
      prof = b64urlJson(tk.id_token.split(".")[1]);
    }
    const email = norm(prof.email); if (!email || prof.email_verified === false) return redirect("/app.html#/entrar?error=google");
    let u = await getUser(s, email);
    if (!u) {
      const firstUser = (await userKeys(s)).length === 0;
      // Solo por invitación: con Google no se pueden crear cuentas nuevas (hay que registrarse con un código)
      if (INVITE_ONLY && !firstUser) return redirect("/app.html#/registro?error=codigo");
      u = { user: email, email, name: prof.given_name || "", surname: prof.family_name || "", google: prof.sub, created: Date.now(), verified: true, v: 2, wantPlan: PLANS[st.plan] ? st.plan : null };
      await putUser(s, u); if (firstUser) await s.setJSON("meta:admins", [u.user]);
    } else if (!u.google) { u.google = prof.sub; u.verified = true; await putUser(s, u); }
    return redirect("/app.html#/oauth?t=" + (await newSession(s, u.user)));
  }

  // ===== A partir de aquí, sesión obligatoria =====
  const me = await auth(req, s);
  if (!me) return json({ error: "Sesión caducada: vuelve a entrar" }, 401);
  const u = await getUser(s, me.user);
  if (!u) return json({ error: "Sesión caducada: vuelve a entrar" }, 401);

  if (p === "logout" && req.method === "POST") { await s.delete("s:" + me.tok); return json({ ok: true }); }
  if (p === "me") return json(await publicUser(s, u));

  if (p === "verify/resend" && req.method === "POST") {
    if (u.verified) return json({ ok: true, verified: true });
    const ver = await sendVerification(s, req, u);
    return json({ ok: true, ...(TEST || !E.RESEND_API_KEY ? { devLink: ver.link } : {}) });
  }

  if (p === "profile" && req.method === "POST") {
    const v = validateProfile(body, u.email || u.user); if (v.error) return json(v, 400);
    if (!body.terms && u.v) return json({ error: "Debes aceptar los términos y la política de privacidad" }, 400);
    Object.assign(u, { name: v.name, surname: v.surname, birth: v.birth, source: v.source, marketing: !!body.marketing });
    await putUser(s, u);
    return json(await publicUser(s, u));
  }

  // --- Mi perfil: datos personales ---
  if (p === "account/update" && req.method === "POST") {
    const name = String(body.name || "").trim().slice(0, 60), surname = String(body.surname || "").trim().slice(0, 80), birth = String(body.birth || "");
    if (name.length < 2) return json({ error: "Escribe tu nombre" }, 400);
    if (surname.length < 2) return json({ error: "Escribe tus apellidos" }, 400);
    if (birth && !ageOk(birth)) return json({ error: "Revisa la fecha de nacimiento (debes tener al menos 14 años)" }, 400);
    Object.assign(u, { name, surname, birth: birth || u.birth, marketing: !!body.marketing });
    await putUser(s, u);
    return json(await publicUser(s, u));
  }
  // --- Mi perfil: cambiar el email (la cuenta se mueve al email nuevo y hay que confirmarlo) ---
  if (p === "account/email" && req.method === "POST") {
    const ne = norm(body.email);
    if (!EMAIL_RE.test(ne)) return json({ error: "El email no es válido" }, 400);
    if (ne !== norm(body.email2)) return json({ error: "Los dos emails no coinciden" }, 400);
    if (ne === u.user) return json({ error: "Ese ya es tu email" }, 400);
    if (u.hash && !safeEq(await hash(String(body.pass || ""), u.salt, u.it || OLD_ITER), u.hash)) { await sleep(400); return json({ error: "La contraseña no es correcta" }, 401); }
    if (await getUser(s, ne)) return json({ error: "Ya hay una cuenta con ese email" }, 409);
    const old = u.user; const data = await s.get("d:" + old);
    Object.assign(u, { user: ne, email: ne, verified: false, v: u.v || 2 });
    await putUser(s, u);
    if (data) await s.set("d:" + ne, data);
    await s.setJSON("s:" + me.tok, { ...me, tok: undefined, user: ne });
    const admins = await s.get("meta:admins", { type: "json" });
    if (admins && admins.includes(old)) await s.setJSON("meta:admins", admins.map((x) => (x === old ? ne : x)));
    if (u.plan?.cust) await s.setJSON("cus:" + u.plan.cust, { user: ne });
    await s.delete("d:" + old); await s.delete("u:" + old);
    const ver = await sendVerification(s, req, u);
    return json({ ...(await publicUser(s, u)), ...(TEST || !E.RESEND_API_KEY ? { devLink: ver.link } : {}) });
  }

  // --- Pagos ---
  if (p === "billing/checkout" && req.method === "POST") {
    const plan = PLANS[body.plan]; if (!plan || plan.later) return json({ error: "Plan no disponible" }, 400);
    if (!PAYMENTS) return json({ error: "Los pagos todavía no están activados. De momento el acceso es con código." }, 503);
    if (u.v && !u.verified) return json({ error: "Confirma primero tu email" }, 403);
    if (!profileDone(u)) return json({ error: "Completa primero tus datos" }, 403);
    if (u.plan && ACTIVE.has(u.plan.status) && u.plan.sub && body.plan !== u.plan.id) {
      // cambio de plan con suscripción activa: se cambia el precio de la misma suscripción (prorrateado)
      if (!E.STRIPE_SECRET_KEY) {
        if (!TEST) return json({ error: "Los pagos todavía no están activados." }, 503);
        await applySubscription(s, u.user, body.plan, { id: u.plan.sub, status: "active", current_period_end: u.plan.end }, u.plan.cust);
        return json({ url: "/app.html#/cuenta?mejorado=1" });
      }
      const cur = await stripe("GET", "subscriptions/" + u.plan.sub);
      let prod = await s.get("meta:prod:" + body.plan, { type: "json" });
      if (!prod?.id) { prod = await stripe("POST", "products", { name: "OpoATC · " + plan.name }); await s.setJSON("meta:prod:" + body.plan, { id: prod.id }); }
      const sub = await stripe("POST", "subscriptions/" + cur.id, {
        items: { 0: { id: cur.items.data[0].id, price_data: { currency: "eur", product: prod.id, unit_amount: plan.cents, recurring: { interval: "month" } } } },
        proration_behavior: "create_prorations", cancel_at_period_end: "false", metadata: { plan: body.plan, user: u.user },
      });
      await applySubscription(s, u.user, body.plan, sub, cur.customer);
      return json({ url: "/app.html#/cuenta?mejorado=1" });
    }
    if (u.plan && ACTIVE.has(u.plan.status) && E.STRIPE_SECRET_KEY && u.plan.cust) {
      const portal = await stripe("POST", "billing_portal/sessions", { customer: u.plan.cust, return_url: siteUrl(req) + "/app.html#/cuenta" });
      return json({ url: portal.url, portal: true });
    }
    if (!E.STRIPE_SECRET_KEY) {
      if (!TEST) return json({ error: "Los pagos todavía no están activados. Inténtalo más tarde." }, 503);
      await applySubscription(s, u.user, body.plan, { id: "sub_test_" + rnd(6), status: "active", current_period_end: Math.round(Date.now() / 1000) + 30 * 86400 }, "cus_test_" + rnd(6));
      return json({ url: "/app.html#/pago-ok?test=1" });
    }
    const base = siteUrl(req);
    const sess = await stripe("POST", "checkout/sessions", {
      mode: "subscription", client_reference_id: u.user, locale: "es", allow_promotion_codes: "true",
      ...(u.plan?.cust ? { customer: u.plan.cust } : { customer_email: u.email || undefined }),
      line_items: { 0: { quantity: 1, price_data: { currency: "eur", unit_amount: plan.cents, recurring: { interval: "month" }, product_data: { name: "OpoATC · " + plan.name } } } },
      metadata: { plan: body.plan, user: u.user }, subscription_data: { metadata: { plan: body.plan, user: u.user } },
      success_url: base + "/app.html#/pago-ok?session_id={CHECKOUT_SESSION_ID}", cancel_url: base + "/app.html#/planes?cancelado=1",
    });
    return json({ url: sess.url });
  }
  if (p === "billing/confirm" && req.method === "POST") {
    if (!E.STRIPE_SECRET_KEY) return json(await publicUser(s, u));
    const id = String(body.session_id || ""); if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json({ error: "Sesión de pago no válida" }, 400);
    const cs = await stripe("GET", `checkout/sessions/${id}?expand[]=subscription`);
    if (cs.client_reference_id !== u.user) return json({ error: "Este pago no es de tu cuenta" }, 403);
    if (cs.status === "complete" && cs.subscription) await applySubscription(s, u.user, cs.metadata?.plan, cs.subscription, cs.customer);
    return json(await publicUser(s, await getUser(s, u.user)));
  }
  if (p === "billing/invoices" && req.method === "GET") {
    if (!u.plan?.cust || !E.STRIPE_SECRET_KEY) return json({ invoices: [] });
    const r = await stripe("GET", `invoices?customer=${encodeURIComponent(u.plan.cust)}&limit=24`);
    return json({ invoices: (r.data || []).map((i) => ({ id: i.id, number: i.number, date: i.created, total: i.total, currency: i.currency, status: i.status, url: i.hosted_invoice_url, pdf: i.invoice_pdf })) });
  }
  if (p === "billing/portal" && req.method === "POST") {
    if (!u.plan?.cust || !E.STRIPE_SECRET_KEY) return json({ error: TEST ? "En modo pruebas no hay portal de pagos" : "No tienes ninguna suscripción" }, 400);
    const portal = await stripe("POST", "billing_portal/sessions", { customer: u.plan.cust, return_url: siteUrl(req) + "/app.html#/suscripcion" });
    return json({ url: portal.url });
  }
  if (p === "billing/cancel-test" && req.method === "POST" && TEST) { if (u.plan) { u.plan.status = "canceled"; await putUser(s, u); } return json(await publicUser(s, u)); }

  // --- Contenido según el plan ---
  if (p === "content" && req.method === "GET") {
    const f = await features(s, u);
    if (!f.includes("teoria")) return json({ error: "Necesitas un plan activo" }, 402);
    const c = loadContent();
    const eng = f.includes("ingles"), adm = await isAdmin(s, u.user); const ck = f.join(",") + "|" + adm;
    if (BODY_CACHE.has(ck)) return new Response(BODY_CACHE.get(ck), { headers: { "content-type": "application/json", "cache-control": "private, no-store" } });
    const data = { ...c.data, en: eng ? c.data.en : [], words: eng ? c.data.words : [] };
    // las falladas guardadas son personales del administrador: no se envían a nadie más
    const res = adm ? c.res : { ...c.res, docFails: [] };
    const body = JSON.stringify({ data, res, features: f }); BODY_CACHE.set(ck, body);
    return new Response(body, { headers: { "content-type": "application/json", "cache-control": "private, no-store" } });
  }

  // --- Códigos de acceso gratuito (solo administradores) ---
  if (p.startsWith("invites")) {
    if (!(await isAdmin(s, u.user))) return json({ error: "Solo la cuenta administradora puede gestionar códigos" }, 403);
    if (p === "invites" && req.method === "GET") {
      const { blobs } = await s.list({ prefix: "inv:" }); const list = [];
      for (const b of blobs) { const v = await s.get(b.key, { type: "json" }); if (v) list.push({ code: b.key.slice(4), ...v }); }
      list.sort((a, b) => b.created - a.created);
      return json({ invites: list });
    }
    if (p === "invites/create" && req.method === "POST") {
      const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const part = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), (x) => A[x % A.length]).join("");
      const code = `ATC-${part()}-${part()}`;
      const inv = { created: Date.now(), by: u.user, plan: PLANS[body.plan] ? body.plan : "completo" };
      await s.setJSON("inv:" + code, inv);
      return json({ code, ...inv });
    }
    if (p === "invites/revoke" && req.method === "POST") {
      const code = String(body.code || "").toUpperCase(); const inv = await s.get("inv:" + code, { type: "json" });
      if (!inv) return json({ error: "No existe" }, 404);
      if (!inv.usedBy) { inv.revoked = Date.now(); await s.setJSON("inv:" + code, inv); }
      return json({ ok: true });
    }
  }
  if (p === "redeem" && req.method === "POST") {
    const code = String(body.code || "").trim().toUpperCase(); const inv = await s.get("inv:" + code, { type: "json" });
    if (!inv || inv.usedBy || inv.revoked) { await sleep(400); return json({ error: inv?.usedBy ? "Ese código ya se ha usado" : "Código no válido" }, 403); }
    inv.usedBy = u.user; inv.usedAt = Date.now(); await s.setJSON("inv:" + code, inv);
    u.comp = inv.plan || "completo"; await putUser(s, u);
    return json(await publicUser(s, u));
  }

  if (p === "password" && req.method === "POST") {
    if (!u.hash || !safeEq(await hash(String(body.old || ""), u.salt, u.it || OLD_ITER), u.hash)) return json({ error: "La contraseña actual no es correcta" }, 401);
    if (String(body.pass || "").length < 8) return json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, 400);
    u.salt = rnd(16); u.hash = await hash(String(body.pass), u.salt); u.it = ITER; await putUser(s, u);
    return json({ ok: true });
  }
  if (p === "account/delete" && req.method === "POST") {
    if (u.plan && ACTIVE.has(u.plan.status) && E.STRIPE_SECRET_KEY && u.plan.sub) { try { await stripe("DELETE", "subscriptions/" + u.plan.sub); } catch (e) {} }
    await s.delete("d:" + u.user); await s.delete("u:" + u.user); await s.delete("s:" + me.tok);
    return json({ ok: true });
  }

  if (p === "sync") {
    if (req.method === "GET") { const v = await s.get("d:" + u.user); return new Response(v || "null", { headers: { "content-type": "application/json", "cache-control": "no-store" } }); }
    if (req.method === "PUT") {
      if (raw.length > 8_000_000) return json({ error: "Demasiado grande" }, 413);
      try { JSON.parse(raw); } catch { return json({ error: "JSON no válido" }, 400); }
      await s.set("d:" + u.user, raw);
      return json({ ok: true });
    }
  }
  return json({ error: "No encontrado" }, 404);
}
