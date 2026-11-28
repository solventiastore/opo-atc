/* Opo ATC — app de estudio para la oposición a controlador aéreo (fases I, II y III). Vanilla JS, sin dependencias. */
(function () {
'use strict';
const D = window.DATA, R = window.RES || { res: {}, qpage: {}, mem: [], docFails: [] };
const ME = window.ME || { features: [] }, OPO = window.OPO || {};
const has = f => (ME.features || []).includes(f);
const DAY = 864e5, L = 'abcdefghijklmn';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const now = () => Date.now();
const ymd = (t = now()) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const addDays = (ds, n) => { const d = new Date(ds + 'T12:00:00'); d.setDate(d.getDate() + n); return ymd(d.getTime()); };
const diffDays = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / DAY);
const fmtDate = (ds, o = { day: 'numeric', month: 'short' }) => new Date(ds + 'T12:00:00').toLocaleDateString('es-ES', o);
const uid = () => Math.random().toString(36).slice(2, 10) + now().toString(36);
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const safe = (fn, name) => { try { return fn(); } catch (e) { console.error('[' + name + ']', e); } };

/* ---------- Iconos (trazos estilo Lucide) ---------- */
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  brain: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/>',
  marker: '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
  shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  x: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  exam: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>', chevL: '<path d="m15 18-6-6 6-6"/>',
  alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z"/><path d="M12 9v4M12 17h.01"/>',
  play: '<path d="m6 3 14 9-14 9z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.2.4 1.6 1.6 2.7 2.5 2.7z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  receipt: '<path d="M5 2h14v20l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
  flag: '<path d="M4 22V4"/><path d="M4 4h13l-2 4 2 4H4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  cards: '<rect x="2" y="6" width="14" height="16" rx="2"/><path d="M6 2h12a2 2 0 0 1 2 2v14"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
};
const icon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

/* ---------- Temas ---------- */
const TOPICS = [
  { id: 'meteo', n: 3, name: 'Meteorología', short: 'Meteo', w: 3, c: '#22d3ee' },
  { id: 'nav', n: 5, name: 'Navegación', short: 'Navegación', w: 3, c: '#3b82f6' },
  { id: 'ffhh', n: 8, name: 'Factores Humanos', short: 'FFHH', w: 3, c: '#a78bfa' },
  { id: 'carto', n: 4, name: 'Cartografía', short: 'Cartografía', w: 2, c: '#34d399' },
  { id: 'fpl', n: 6, name: 'Plan de vuelo', short: 'Plan de vuelo', w: 2, c: '#fbbf24' },
  { id: 'inst', n: 1, name: 'Instituciones y legislación', short: 'Instituciones', w: 0.5, c: '#f472b6' },
  { id: 'oaci', n: 2, name: 'Códigos OACI/IATA', short: 'Códigos', w: 0.5, c: '#fb923c' },
  { id: 'aero', n: 9, name: 'Aerodinámica y mecánica de vuelo', short: 'Aerodinámica', w: 0.5, c: '#60a5fa' },
  { id: 'entorno', n: 7, name: 'Entorno profesional', short: 'Entorno', w: 0, c: '#94a3b8' },
];
const TOP = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const tname = t => t === 'psico' ? 'Psicotécnicos' : t === 'eng' ? 'Inglés' : (TOP[t]?.name || t);
const ENG_SUBS = { exam: 'Exámenes oficiales ENAIRE (2017-2026)', practice: 'English Practice 1 y 2', grammar: 'Grammar C2 (examenglish)', vocab: 'Vocabulary C2 (examenglish)', words: 'Palabras C2 (definiciones)' };

/* ---------- Banco de preguntas ---------- */
const Q = {};
D.q.forEach(x => { x.kind = 'cuest'; Q[x.id] = x; });
D.ex.forEach(x => { x.kind = 'exam'; Q[x.id] = x; });
(D.en || []).forEach(x => { x.kind = 'eng'; Q[x.id] = x; });
const PSYB = (R.psyBanks || []); const PSYS = (R.psySheets || []);
PSYB.forEach(b => b.items.forEach(x => { Q[x.id] = { id: x.id, t: 'psico', kind: 'psy', bank: b.id, n: x.n, img: x.img, q: x.q || '', o: x.o, a: x.a, r: x.x || '', src: b.name + ' · nº ' + x.n }; }));
(D.words || []).forEach((w, i) => { Q['en-words-' + i] = { id: 'en-words-' + i, t: 'eng', sub: 'words', kind: 'eng', word: w, src: 'Exam English · CPE Vocabulary 2' }; });
// Opciones barajadas: cada vez que sale una pregunta, la buena cambia de letra.
// No se barajan las preguntas cuyas opciones citan otras letras («A y B son correctas»), las de imagen ni las que explican con letras.
// «Ninguna/Todas (de) las anteriores», «Todas son correctas»… se quedan en su sitio.
const LETTER_REF = /(\b[a-e]\s*\)|\b[a-e]\s+y\s+[a-e]\b|\b(opci[oó]n|respuesta)(es)?\s+[a-e]\b|\blas dos (primeras|últimas)\b|\bambas\b)/i;
const ANCHOR = /anteriores|^\s*(todas|ninguna)\b|son correctas|son incorrectas|ninguna es|todas son/i;
let LASTA = {}; try { LASTA = JSON.parse(localStorage.getItem('opo_lasta') || '{}'); } catch (e) {}
function shuffleQ(q) {
  if (!q || !Array.isArray(q.o) || q.o.length < 3 || q.kind === 'psy' || q.noShuffle) return q;
  if (q.o.some(o => LETTER_REF.test(String(o))) || /\b(la|opci[oó]n|respuesta)\s+[a-eA-E]\b/.test((q.x || '') + ' ' + (q.r || ''))) return q;
  const free = q.o.map((o, i) => i).filter(i => !ANCHOR.test(String(q.o[i]))); if (free.length < 2) return q;
  let perm, newA, tries = 0;
  do {
    const sh = shuffle(free); perm = q.o.map((o, i) => i); free.forEach((slot, k) => { perm[slot] = sh[k]; });
    newA = perm.indexOf(q.a); tries++;
  } while (tries < 12 && (newA === LASTA[q.id] || (tries < 6 && perm.every((v, i) => v === i))));
  LASTA[q.id] = newA; try { localStorage.setItem('opo_lasta', JSON.stringify(LASTA)); } catch (e) {}
  return Object.assign({}, q, { o: perm.map(i => q.o[i]), a: newA });
}
function materialize(q) {
  if (q.sub !== 'words' || q.o) return q;
  const same = (D.words || []).filter(w => w.p === q.word.p && w.w !== q.word.w);
  const dis = shuffle(same.length >= 3 ? same : (D.words || []).filter(w => w.w !== q.word.w)).slice(0, 3).map(w => w.d);
  const o = shuffle([q.word.d, ...dis]);
  return Object.assign({}, q, { q: `${q.word.w} (${q.word.p})`, o, a: o.indexOf(q.word.d), r: `«${q.word.w}» (${q.word.p}) = ${q.word.d}` });
}
// Exámenes oficiales de inglés y prácticas (agrupados por examen)
const ENG_EXAMS = (() => { const m = {}; (D.en || []).filter(x => x.ex).forEach(x => { (m[x.ex] = m[x.ex] || { id: x.ex, label: x.src, qs: [], sub: x.sub }).qs.push(x.id); }); return Object.values(m); })();
const EXAMS = (() => { const m = {}; D.ex.forEach(x => { (m[x.ex] = m[x.ex] || { id: x.ex, label: x.src.replace('Examen ', ''), qs: [] }).qs.push(x.id); }); return Object.values(m); })();
const pagesOf = t => R.res[t]?.pages || [];
const qForPages = (t, a, b) => D.q.filter(x => x.t === t && R.qpage[x.id] >= a && R.qpage[x.id] <= b).map(x => x.id);

/* ---------- Sesión, estado y persistencia ---------- */
const SESS_KEY = 'opo_session';
let SESS = null; try { SESS = JSON.parse(localStorage.getItem(SESS_KEY) || 'null'); } catch (e) {}
const stateKey = () => 'opo_state_' + SESS?.user;
const defaultSettings = () => ({
  u: 0, weights: Object.fromEntries(TOPICS.map(t => [t.id, t.w])), pool: 'both',
  penalty: 0.33, simMinutes: 50, examDate: '', planStart: '', planLen: 31,
  pages: { meteo: 20, ffhh: 20, carto: 14, nav: 18, aero: 8, fpl: 12, inst: 19, entorno: 3 }
});
const defaultState = () => ({ v: 2, q: {}, study: [], log: [], sims: [], ov: {}, pd: {}, rd: {}, ps: {}, psy: {}, hl: {}, pace: { r: [], q: [] }, settings: defaultSettings() });
let S = defaultState();
function loadState() {
  let s = null; try { s = JSON.parse(localStorage.getItem(stateKey()) || 'null'); } catch (e) {}
  S = Object.assign(defaultState(), s || {});
  S.settings = Object.assign(defaultSettings(), S.settings || {});
  ['pd', 'rd', 'ov', 'q', 'ps', 'psy', 'hl'].forEach(k => S[k] = S[k] || {});
  // migración desde la versión anterior (un solo dispositivo)
  if (!S.migrated) {
    for (const k of ['enaire_v1', 'opo_state_local']) {
      if (k === stateKey()) continue;
      try { const old = JSON.parse(localStorage.getItem(k) || 'null'); if (old) { mergeState(S, old); } } catch (e) {}
    }
    S.migrated = 1;
  }
}
let saveT;
function save(touchSettings) {
  if (touchSettings) S.settings.u = now();
  localStorage.setItem(stateKey(), JSON.stringify(S));
  clearTimeout(saveT); saveT = setTimeout(() => { saveT = null; sync(); }, 10000);
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600); }

function mergeState(a, b) {
  if (!b) return a;
  a.ps = a.ps || {}; a.psy = a.psy || {};
  a.hl = a.hl || {};
  for (const k of ['q', 'ov', 'pd', 'rd', 'ps', 'psy', 'hl']) for (const [id, r] of Object.entries(b[k] || {})) if (!a[k][id] || (r.u || 0) > (a[k][id].u || 0)) a[k][id] = r;
  for (const k of ['study', 'log', 'sims']) {
    const m = new Map((a[k] || []).map(x => [x.id, x]));
    for (const x of (b[k] || [])) { const y = m.get(x.id); if (!y) m.set(x.id, x); else if ((x.u || 0) > (y.u || 0)) m.set(x.id, x); else if (k === 'study' && x.ids) { y.ids = [...new Set([...y.ids, ...x.ids])]; } }
    a[k] = [...m.values()];
  }
  if (b.plan && (!a.plan || (b.plan.u || 0) > (a.plan.u || 0))) a.plan = b.plan;
  if (b.pace && (!a.pace || (b.pace.u || 0) > (a.pace.u || 0))) a.pace = b.pace;
  if (b.cyc && (!a.cyc || (b.cyc.u || 0) > (a.cyc.u || 0))) a.cyc = b.cyc;
  if ((b.settings?.u || 0) > (a.settings.u || 0)) a.settings = Object.assign(defaultSettings(), b.settings);
  return a;
}

/* ---------- API ---------- */
async function api(path, opts = {}) {
  const r = await fetch('/api/' + path, {
    method: opts.method || 'GET',
    headers: Object.assign({ 'content-type': 'application/json' }, SESS?.token ? { authorization: 'Bearer ' + SESS.token } : {}),
    body: opts.body == null ? undefined : (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body))
  });
  let data = null; try { data = await r.json(); } catch (e) {}
  if (!r.ok) { const e = new Error(data?.error || ('Error ' + r.status)); e.status = r.status; throw e; }
  return data;
}
let syncing = false;
async function sync(manual) {
  const dot = $('#syncDot');
  if (!SESS) { if (dot) dot.className = 'dot'; return; }
  if (syncing) return; syncing = true; if (dot) dot.className = 'dot busy';
  try {
    const remote = await api('sync');
    mergeState(S, remote);
    localStorage.setItem(stateKey(), JSON.stringify(S));
    await api('sync', { method: 'PUT', body: JSON.stringify(S) });
    if (dot) { dot.className = 'dot ok'; dot.title = 'Sincronizado ' + new Date().toLocaleTimeString(); }
    if (manual) { toast('Sincronizado'); render(); }
  } catch (e) {
    if (dot) { dot.className = 'dot err'; dot.title = 'Sin conexión: se guardará cuando vuelva'; }
    if (e.status === 401) { toast('Tu sesión ha caducado. Vuelve a entrar.'); logout(true); }
    else if (manual) toast('No se pudo sincronizar: ' + e.message);
  } finally { syncing = false; }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && saveT && SESS) { clearTimeout(saveT); saveT = null; sync(); }
  if (document.visibilityState === 'visible' && SESS) sync().then(() => { if (!busy()) render(); });
});
function logout() { if (OPO.logout) return OPO.logout(); localStorage.removeItem(SESS_KEY); location.reload(); }

/* ---------- Lógica de estudio ---------- */
const rec = id => S.q[id] || { n: 0, ok: 0, ko: 0 };
const inScope = () => true;
function poolFor(topics, opts = {}) {
  const pool = opts.pool || S.settings.pool;
  return Object.values(Q).filter(q => q.kind !== 'eng' && topics.includes(q.t) && !q.dup && !q.res &&
    (pool === 'both' || (pool === 'cuest' ? q.kind === 'cuest' : q.kind === 'exam')));
}
function record(id, ok) {
  const r = Object.assign({ n: 0, ok: 0, ko: 0 }, S.q[id]); const first = !r.n;
  r.n++; r.t = now(); r.last = ok ? 1 : 0; r.u = now();
  if (ok) { r.ok++; if (r.pend) { r.po = (r.po || 0) + 1; if (r.po >= 2) { r.pend = false; r.po = 0; } else r.due = now() + 3 * DAY; } }
  else { r.ko++; r.pend = true; r.po = 0; r.due = now() + DAY; }
  S.q[id] = r; save(); return first;
}
function addStudy(dateStr, topic, ids, label) {
  if (!ids.length) return 0;
  const id = 'st-' + dateStr + '-' + topic;
  let e = S.study.find(x => x.id === id);
  if (!e) { e = { id, d: dateStr, topic, ids: [], done: {}, label: '' }; S.study.push(e); }
  const before = e.ids.length; e.ids = [...new Set([...e.ids, ...ids])]; e.u = now();
  if (label && !e.label.includes(label)) e.label = (e.label ? e.label + ' · ' : '') + label;
  save(); return e.ids.length - before;
}
function dueReviews() {
  const t = ymd(); const out = [];
  for (const e of S.study) for (const k of [1, 3, 7]) { if (e.done?.[k]) continue; const due = addDays(e.d, k); if (due <= t) out.push({ e, k, due }); break; }
  return out.sort((a, b) => a.due.localeCompare(b.due));
}
const pendingFails = () => Object.entries(S.q).filter(([id, r]) => r.pend && Q[id]).map(([id]) => id);
function topicStats(t) {
  const qs = D.q.filter(q => q.t === t); const sc = qs;
  const seen = sc.filter(q => rec(q.id).n); const okq = seen.filter(q => rec(q.id).last === 1);
  return { total: qs.length, scope: sc.length, seen: seen.length, ok: okq.length };
}
function streak() {
  const days = new Set(Object.values(S.q).filter(r => r.t).map(r => ymd(r.t)));
  let n = 0, d = ymd(); if (!days.has(d)) d = addDays(d, -1);
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
function markRead(t, a, b, label) {
  for (let p = a; p <= b; p++) S.rd[t + ':' + p] = { v: 1, u: now() };
  const ids = qForPages(t, a, b);
  const n = addStudy(ymd(), t, ids, label || `resumen págs. ${a}–${b}`);
  S.log.push({ id: uid(), d: ymd(), topic: t, pf: a, pt: b, note: 'Leído en la app', u: now() });
  save(); return ids;
}

/* ---------- Plan personalizado ----------
   Se genera a partir de tus respuestas (fecha del examen, tiempo, días libres, prioridades) y del contenido:
   resúmenes por bloques de páginas y, tras cada bloque, las preguntas del cuestionario de esas páginas.
   Cada día se fija lo que toca al abrir la app; lo pendiente se recoloca solo en los días que quedan. */
// Ritmo: la referencia es la plantilla (cada fila ≈ 1 h: ~8 páginas con sus preguntas).
// Se ajusta con lo que tarda cada usuario de verdad al estudiar páginas y al responder preguntas.
const NOM_PAGE = 6, NOM_Q = 0.5;
const Pace = {
  fr() { const r = (S.pace?.r || []).slice(-15); const m = r.reduce((a, x) => a + x.m, 0), e = r.reduce((a, x) => a + x.p * NOM_PAGE, 0); return Math.min(4, Math.max(0.4, (m + 60) / (e + 60))); },
  fq() { const r = (S.pace?.q || []).slice(-200); const t = r.reduce((a, x) => a + x, 0) / 60; return Math.min(4, Math.max(0.4, (t + 10 * NOM_Q) / (r.length * NOM_Q + 10 * NOM_Q))); },
  page: () => Math.round(NOM_PAGE * Pace.fr()),
  measured: () => (S.pace?.r || []).length >= 2,
  label: () => Pace.measured() ? `a tu ritmo: ${Pace.page()} min por página` : 'ritmo de referencia: ~8 páginas con sus preguntas por hora',
  addRead(pages, mins) { if (!(mins >= 1 && mins <= pages * 120)) return; S.pace = S.pace || { r: [], q: [] }; S.pace.r = (S.pace.r || []).concat([{ p: pages, m: Math.round(mins) }]).slice(-30); S.pace.u = now(); P._sig = ''; },
  addQ(sec) { if (!(sec >= 2 && sec <= 300)) return; S.pace = S.pace || { r: [], q: [] }; S.pace.q = (S.pace.q || []).concat([Math.round(sec)]).slice(-300); S.pace.u = now(); },
};
// Plantilla de referencia: cada fila es 1 hora de temario (resumen [tema, desde, hasta]).
const PLAN_TEMPLATE = [
  [['meteo', 1, 2], ['ffhh', 1, 2], ['carto', 1, 1], ['nav', 1, 2]],
  [['meteo', 3, 4], ['ffhh', 3, 4], ['carto', 3, 4], ['nav', 3, 3]],
  [['meteo', 5, 6], ['ffhh', 5, 7], ['carto', 5, 5], ['nav', 4, 4]],
  [['meteo', 7, 8], ['ffhh', 8, 10], ['carto', 6, 6], ['nav', 5, 5]],
  [['meteo', 9, 9], ['ffhh', 11, 12], ['carto', 7, 7], ['nav', 6, 7], ['aero', 1, 4], ['fpl', 1, 2]],
  [['meteo', 10, 10], ['ffhh', 13, 13], ['carto', 8, 8], ['nav', 8, 8], ['aero', 5, 5], ['fpl', 3, 4]],
  [['meteo', 11, 12], ['ffhh', 14, 14], ['carto', 9, 9], ['nav', 9, 9], ['aero', 6, 6]],
  [['meteo', 13, 13], ['ffhh', 15, 15], ['carto', 10, 10], ['nav', 10, 12], ['aero', 7, 8]],
  [['meteo', 14, 14], ['ffhh', 16, 18], ['carto', 11, 14], ['nav', 13, 16]],
  [['meteo', 15, 20], ['ffhh', 19, 20]],
];
// Repaso de temas anteriores: lo que ya pasó 1·3·7 vuelve en orden, empezando por lo primero que estudiaste
const Ciclo = {
  pool() { const seen = new Set(); return S.study.filter(e => e.done?.[1] && e.done?.[3] && e.done?.[7]).sort((a, b) => a.d.localeCompare(b.d) || a.id.localeCompare(b.id)).flatMap(e => e.ids).filter(id => Q[id] && !seen.has(id) && seen.add(id)); },
  next(n = 20) { const pl = Ciclo.pool(); if (!pl.length) return []; const i = (S.cyc?.i || 0) % pl.length; const out = pl.slice(i, i + n); return out.concat(pl.slice(0, Math.max(0, Math.min(i, n - out.length)))); },
  advance(n) { S.cyc = { i: (S.cyc?.i || 0) + n, u: now() }; save(); },
};
let READ = null;
const readActive = () => READ ? READ.acc + (document.visibilityState === 'visible' ? now() - READ.from : 0) : 0;
document.addEventListener('visibilitychange', () => { if (!READ) return; if (document.visibilityState === 'hidden') { READ.acc += now() - READ.from; } else READ.from = now(); });
const WD = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const dow = ds => new Date(ds + 'T12:00:00').getDay();
const defaultCfg = () => ({ examDate: S.settings.examDate || '', weeks: 10, start: ymd(), minWeek: 60, minWeekend: 60, off: [0], restEvery: 0,
  finalDays: 7, spare: 'repaso', entorno: false, eng: 20, psico: 20 });
const P = {
  cfg: () => Object.assign(defaultCfg(), S.plan?.cfg || {}),
  examDate() { const c = P.cfg(); return c.examDate || addDays(c.start, c.weeks * 7); },
  lastStudy() { return addDays(P.examDate(), -1 - (+P.cfg().finalDays || 0)); },
  end() { return addDays(P.examDate(), -1); },
  isOff(ds) {
    const c = P.cfg(); const w = dow(ds);
    if ((c.off || []).includes(w)) return true;
    if (+c.restEvery > 0) { const wk = Math.floor(diffDays(c.start, ds) / 7); if (wk % +c.restEvery === +c.restEvery - 1) { const extra = [6, 5, 4, 3, 2, 1, 0].find(d => !(c.off || []).includes(d)); if (w === extra) return true; } }
    return false;
  },
  isFinal: ds => ds > P.lastStudy() && ds <= P.end(),
  cap(ds) { const c = P.cfg(); return Math.max(15, (dow(ds) === 0 || dow(ds) === 6) ? +c.minWeekend : +c.minWeek); },
  _tasks: null, _sig: '',
  tasks() {
    const c = P.cfg(); const FR = Pace.fr(), FQ = Pace.fq();
    const sig = JSON.stringify([c.entorno, S.plan?.u || 0, Math.round(FR * 20), Math.round(FQ * 20)]);
    if (P._tasks && P._sig === sig) return P._tasks;
    // 1) Filas base: plantilla de 1 h por fila (segunda vuelta del plan de referencia)
    const rows = PLAN_TEMPLATE.map(r => r.map(([t, a, b]) => ({ t, a, b })).filter(x => pagesOf(x.t).some(p => p.p >= x.a && p.p <= x.b)));
    const covered = {}; rows.flat().forEach(x => { for (let p = x.a; p <= x.b; p++) (covered[x.t] = covered[x.t] || new Set()).add(p); });
    // 2) Páginas que la plantilla no cubre: mismas filas de ~8 páginas, 2-3 por tema y fila
    const extraTopics = ['nav', 'fpl', 'meteo', 'ffhh', 'carto', 'aero', 'inst', 'oaci'].concat(c.entorno ? ['entorno'] : []);
    const streams = extraTopics.map(t => { const ps = pagesOf(t).map(p => p.p).filter(p => !covered[t]?.has(p)); const ch = []; for (let i = 0; i < ps.length; i += 3) ch.push({ t, a: ps[i], b: ps[Math.min(i + 3, ps.length) - 1] }); return ch; }).filter(s => s.length);
    while (streams.some(s => s.length)) { const row = []; let pg = 0; for (const s of streams) { if (!s.length || pg >= 8) continue; const x = s.shift(); row.push(x); pg += x.b - x.a + 1; } if (row.length) rows.push(row); }
    // 3) Tareas de cada fila: resumen + preguntas de esas páginas; la fila vale 60 min
    const used = new Set(); const list = [];
    rows.forEach((row, ri) => {
      const items = [];
      row.forEach(x => items.push({ key: `res:${x.t}:${x.a}-${x.b}`, k: 'res', t: x.t, a: x.a, b: x.b, w: (x.b - x.a + 1), row: ri }));
      row.forEach(x => { const ids = qForPages(x.t, x.a, x.b).filter(id => !used.has(id)); ids.forEach(id => used.add(id));
        for (let j = 0; j < ids.length; j += 25) { const part = ids.slice(j, j + 25); items.push({ key: `qp:${x.t}:${x.a}-${x.b}:${j}`, k: 'qp', t: x.t, a: x.a, b: x.b, ids: part, w: part.length * 0.12, row: ri }); } });
      const W = items.reduce((s, i) => s + i.w, 0) || 1;
      items.forEach(i => { i.mins = Math.max(3, Math.round(60 * i.w / W * (i.k === 'res' ? FR : FQ))); list.push(i); });
    });
    // 4) Preguntas sin página asociada: filas de ~45 preguntas (1 h)
    const rest = D.q.filter(x => !used.has(x.id) && (c.entorno || x.t !== 'entorno')).sort((x, y) => (TOP[x.t]?.n || 0) - (TOP[y.t]?.n || 0) || x.n - y.n);
    const byT = {}; rest.forEach(x => (byT[x.t] = byT[x.t] || []).push(x));
    for (const arr of Object.values(byT)) for (let j = 0; j < arr.length; j += 25) { const part = arr.slice(j, j + 25);
      list.push({ key: `q:${part[0].t}:${part[0].n}-${part[part.length - 1].n}`, k: 'q', t: part[0].t, a: part[0].n, b: part[part.length - 1].n, ids: part.map(x => x.id), mins: Math.max(5, Math.round(part.length * 60 / 45 * FQ)) }); }
    P._tasks = list; P._sig = sig; P.byKey = Object.fromEntries(list.map(t => [t.key, t]));
    return list;
  },
  get(key) { P.tasks(); return P.byKey[key] || P.recurring(key) || P.review(key); },
  // Repasos 1·3·7 como tareas de Hoy toca
  review(key) {
    const m = /^r137:(.+):([137])$/.exec(key || ''); if (!m) return null;
    const e = S.study.find(x => x.id === m[1]); if (!e) return null; const rk = +m[2];
    return { key, k: 'r137', t: e.topic, rk, e, ids: e.ids, due: addDays(e.d, rk), mins: Math.max(3, Math.ceil(e.ids.length * NOM_Q * Pace.fq()) + 2) };
  },
  reviewsFor(ds) {
    if (ds !== ymd()) return [];
    const keys = dueReviews().map(x => `r137:${x.e.id}:${x.k}`);
    S.study.forEach(e => [1, 3, 7].forEach(k => { if (e.done?.[k] && ymd(e.done[k]) === ds) keys.push(`r137:${e.id}:${k}`); }));
    return [...new Set(keys)];
  },
  done(key) {
    if (/^r137:/.test(key)) { const r = P.review(key); return !!(r && r.e.done?.[r.rk]); }
    if (S.pd[key]?.v) return true;
    const t = P.get(key); if (!t) return false;
    if (t.k === 'res') { for (let p = t.a; p <= t.b; p++) if (!S.rd[t.t + ':' + p]?.v) return false; return true; }
    if (t.ids) return t.ids.every(id => rec(id).n > 0);
    return false;
  },
  doneOn(key) {
    if (S.pd[key]?.v) return S.pd[key].d || null;
    if (!P.done(key)) return null; const t = P.get(key); let m = 0;
    if (t.k === 'res') for (let p = t.a; p <= t.b; p++) m = Math.max(m, S.rd[t.t + ':' + p]?.u || 0);
    else if (t.ids) t.ids.forEach(id => m = Math.max(m, rec(id).t || 0));
    return m ? ymd(m) : null;
  },
  setDone(key, v) { S.pd[key] = { v: v ? 1 : 0, u: now(), d: v ? ymd() : null }; save(); },
  studyDays(from, to) { const out = []; for (let d = from; d <= to; d = addDays(d, 1)) if (!P.isOff(d)) out.push(d); return out; },
  spread(list, from) {
    const days = P.studyDays(from, P.lastStudy()); const out = {}; if (!list.length) return out;
    if (!days.length) { out[from] = list.map(t => t.key); return out; }
    const total = list.reduce((a, t) => a + t.mins, 0);
    const capSum = days.reduce((a, d) => a + P.cap(d), 0); const factor = P.cfg().spare === 'repartir' ? Math.max(0.05, total / capSum) : Math.max(1, total / capSum);
    let i = 0;
    for (let di = 0; di < days.length && i < list.length; di++) {
      const d = days[di]; const target = di === days.length - 1 ? Infinity : P.cap(d) * factor; let sum = 0; out[d] = [];
      while (i < list.length && (sum === 0 || sum + list[i].mins <= target * 1.1)) { out[d].push(list[i].key); sum += list[i].mins; i++; }
    }
    return out;
  },
  today() {
    const t = ymd(); S.ps = S.ps || {};
    if (!S.ps[t] || !Array.isArray(S.ps[t].k)) {
      const late = P.overdue(); const pend = P.tasks().filter(x => !P.done(x.key) && !late.includes(x.key));
      S.ps[t] = { k: P.isOff(t) || P.isFinal(t) ? [] : (P.spread(pend, t)[t] || []), u: now() }; if (!P._preview) save();
    }
    return S.ps[t].k.filter(k => P.get(k));
  },
  // lo que tocaba en días anteriores y sigue sin hacer
  overdue() {
    const t = ymd(), start = P.cfg().start || t; const out = [];
    Object.keys(S.ps || {}).filter(d => d < t && d >= start).sort().forEach(d => (S.ps[d].k || []).forEach(k => { if (P.byKey?.[k] || P.get(k)) if (!P.done(k) && !out.includes(k)) out.push(k); }));
    const today = S.ps?.[t]?.k || []; return out.filter(k => !today.includes(k) && !/^d:/.test(k));
  },
  schedule() {
    const t = ymd(); const todayK = P.today();
    const late = P.overdue(); const rest = P.tasks().filter(x => !P.done(x.key) && !todayK.includes(x.key) && !late.includes(x.key));
    const sch = P.spread(rest, addDays(t, 1)); sch[t] = todayK; return sch;
  },
  // Recalcular desde hoy: el día 0 pasa a ser hoy (lo hecho sigue hecho; lo atrasado deja de contar como acumulado)
  restartToday() {
    const t = ymd(); S.plan = S.plan || {}; S.plan.cfg = Object.assign(P.cfg(), { start: t }); S.plan.u = now();
    if (S.ps) delete S.ps[t]; P._sig = ''; save(true);
  },
  adelantar() {
    const sch = P.schedule(), t = ymd(); const next = Object.keys(sch).filter(d => d > t && sch[d].length).sort()[0];
    if (!next) return 0; S.ps[t].k = [...S.ps[t].k, ...sch[next]]; S.ps[t].u = now(); save(); return sch[next].length;
  },
  // tareas diarias que no van en el temario (inglés, psicotécnicos, repaso final)
  recurring(key) {
    const m = /^d:(\d{4}-\d{2}-\d{2}):(\w+)$/.exec(key || ''); if (!m) return null; const c = P.cfg();
    const mins = { eng: 20, psico: 20, sim: 70, fall: 40, ciclo: 15 }[m[2]]; if (mins == null) return null;
    return { key, d: m[1], k: m[2], t: m[2], mins };
  },
  dailyFor(ds) {
    if (P.isOff(ds) || ds > P.end()) return []; const c = P.cfg(); const out = [];
    if (P.isFinal(ds)) { out.push(`d:${ds}:sim`, `d:${ds}:fall`); }
    if (has('ingles')) out.push(`d:${ds}:eng`);
    if (has('psico')) out.push(`d:${ds}:psico`);
    out.push(...P.reviewsFor(ds));
    if (ds >= ymd() && Ciclo.pool().length) out.push(`d:${ds}:ciclo`);
    return out;
  },
  itemsFor(ds) {
    const t = ymd(); let keys;
    if (ds < t) keys = S.ps[ds]?.k || S.ps[ds]?.g || [];
    else keys = P.schedule()[ds] || [];
    keys = keys.filter(k => P.get(k));
    if (ds <= t) P.tasks().forEach(x => { if (!keys.includes(x.key) && P.doneOn(x.key) === ds) keys.push(x.key); });
    const late = ds === t ? P.overdue().filter(k => !keys.includes(k)) : [];
    return [...late.map(k => Object.assign({}, P.get(k), { late: true })), ...keys.map(k => P.get(k)), ...P.dailyFor(ds).map(k => P.get(k))];
  },
  stats() {
    const all = P.tasks(); const done = all.filter(x => P.done(x.key)); const pend = all.filter(x => !P.done(x.key));
    const t = ymd(); const days = P.studyDays(t, P.lastStudy()); const mins = pend.reduce((a, x) => a + x.mins, 0); const cap = days.reduce((a, d) => a + P.cap(d), 0);
    const finish = (() => { const sch = P.schedule(); return Object.keys(sch).filter(d => sch[d].length).sort().pop() || t; })();
    const spare = mins <= cap ? P.studyDays(addDays(finish, 1), P.lastStudy()).length : 0;
    return { total: all.length, done: done.length, left: pend.length, daysLeft: days.length, hoursLeft: Math.round(mins / 60), capHours: Math.round(cap / 60), ok: mins <= cap, finish, spare };
  },
};
const itemLabel = it => it.k === 'res' ? `págs. ${it.a}${it.b !== it.a ? '–' + it.b : ''}` : it.k === 'qp' ? `${it.ids.length} preg. (p. ${it.a}${it.b !== it.a ? '–' + it.b : ''})` : it.k === 'q' ? `nº ${it.a}–${it.b}` : ({ eng: 'Inglés', psico: 'Psicotécnicos', sim: 'Simulacro', fall: 'Falladas', ciclo: 'Repaso de temas anteriores' }[it.k] || '');

/* ---------- Shell / navegación ---------- */
const NAV = [
  { g: 'Estudiar', items: [['', 'home', 'Inicio'], ['hoy', 'sun', 'Hoy toca'], ['resumenes', 'book', 'Estudiar'], ['memorizar', 'brain', 'Memorizar'], ['ingles', 'globe', 'Inglés'], ['psicotecnicos', 'brain', 'Psicotécnicos']] },
  { g: 'Practicar', items: [['aleatorio', 'shuffle', 'Preguntas a boleo'], ['cuestionarios', 'layers', 'Cuestionarios'], ['repaso', 'repeat', 'Repaso 1·3·7'], ['falladas', 'x', 'Falladas'], ['examenes', 'exam', 'Exámenes y simulacros'], ['temario', 'marker', 'Temario oficial']] },
];
const TITLES = Object.fromEntries(NAV.flatMap(g => g.items.map(([r, , t]) => [r, t]))); Object.assign(TITLES, { perfil: 'Mi perfil', suscripcion: 'Plan y pagos', resumenes: 'Estudiar', practicar: 'Practicar', mas: 'Más', plan: 'Mi plan', planning: 'Planning', stats: 'Estadísticas', ajustes: 'Ajustes', cuenta: 'Ajustes', codigos: 'Códigos de invitación', bienvenida: 'Tu plan', psicotecnicos: 'Psicotécnicos' });
const THEME_KEY = 'opo_theme';
const theme = () => localStorage.getItem(THEME_KEY) || 'light';
function applyTheme(inApp) {
  const light = inApp && theme() === 'light';
  document.body.classList.toggle('light', light);
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = light ? '#ffffff' : '#00162F';
}
const initials = n => (n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

function shell() {
  applyTheme(true);
  const nm = SESS.name || SESS.user || 'Invitado';
  $('#root').innerHTML = `<div class="shell">
    <aside class="side">
      <div class="logo"><span class="mark">${icon('plane')}</span><span>Opo ATC<div class="tiny" style="letter-spacing:.08em">Controlador aéreo</div></span></div>
      <nav>${NAV.map(g => `<div class="tiny grp">${g.g}</div>` + g.items.map(([r, ic, t]) => `<a href="#/${r}" data-r="${r}">${icon(ic)}<span>${t}</span><span class="cnt" data-cnt="${r}"></span></a>`).join('')).join('')}</nav>
      <div class="me pmenu-wrap" id="pmSide" role="button" tabindex="0" aria-haspopup="menu"><div class="avatar">${esc(initials(nm))}</div><div style="flex:1;min-width:0"><div style="font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nm)}</div><div class="small muted">${esc(({ teoria: 'Plan Teoría', ingles: 'Plan Teoría + Inglés', completo: 'Plan Completo' })[ME.plan?.id] || (ME.admin ? 'Administrador' : ME.comp ? 'Acceso gratuito' : SESS.user))}</div></div><span id="syncDot" class="dot" title="Sincronización"></span></div>
    </aside>
    <div>
      <header class="topbar"><div class="logo"><span class="mark">${icon('plane')}</span></div><div class="ttl" id="ttl"></div><span id="syncDot2" class="dot"></span><div class="pmenu-wrap"><button class="avatar btnlike" id="pmBtn" title="Tu perfil" aria-haspopup="menu">${esc(initials(nm))}</button></div></header>
      <main id="app"></main>
    </div>
  </div>
  <nav class="tabbar">
    <a href="#/" data-t="">${icon('home')}Inicio</a>
    <a href="#/hoy" data-t="hoy">${icon('sun')}Hoy</a>
    <a href="#/practicar" data-t="practicar">${icon('target')}Practicar</a>
    <a href="#/falladas" data-t="falladas">${icon('x')}Falladas<span class="badge hidden" id="failBadge"></span></a>
    <a href="#/mas" data-t="mas">${icon('grid')}Más</a>
  </nav>`;
  $('#pmBtn').onclick = e => { e.stopPropagation(); profileMenu($('#pmBtn').parentNode); };
  $('#pmSide').onclick = e => { if (e.target.closest('.pmenu')) return; e.stopPropagation(); profileMenu($('#pmSide')); };
  // el punto de sincronización del móvil refleja el del escritorio
  const d1 = $('#syncDot'), d2 = $('#syncDot2');
  new MutationObserver(() => { d2.className = d1.className; d2.title = d1.title; }).observe(d1, { attributes: true });
}
function profileMenu(anchor) {
  const old = $('.pmenu'); if (old) { old.remove(); return; }
  const nm = [ME.name, ME.surname].filter(Boolean).join(' ') || SESS.name || SESS.user;
  const m = document.createElement('div'); m.className = 'pmenu'; m.setAttribute('role', 'menu');
  m.innerHTML = `<div class="who"><div class="avatar">${esc(initials(nm))}</div><div><b>${esc(nm)}</b><span>${esc(ME.email || SESS.user || '')}</span></div></div>
    <a href="#/perfil">${icon('user')} Mi perfil</a><a href="#/suscripcion">${icon('card')} Plan y pagos</a>
    <div class="sep"></div><a href="#/plan">${icon('grid')} Mi plan de estudio</a><a href="#/bienvenida?edit=1">${icon('target')} Cambiar mi plan</a><a href="#/planning">${icon('cal')} Planning</a><a href="#/stats">${icon('chart')} Estadísticas</a>
    <div class="sep"></div><a href="#/ajustes">${icon('gear')} Ajustes y cuenta</a>${ME.admin ? `<a href="#/codigos">${icon('star')} Códigos de invitación</a>` : ''}
    <button data-pm="theme">${icon(theme() === 'light' ? 'eye' : 'sun')} ${theme() === 'light' ? 'Tema oscuro' : 'Tema claro'}</button><button data-pm="sync">${icon('refresh')} Sincronizar ahora</button>
    <div class="sep"></div><button data-pm="out" class="danger">${icon('logout')} Cerrar sesión</button>`;
  anchor.appendChild(m);
  window.addEventListener('hashchange', () => m.remove(), { once: true });
  m.onclick = e => { e.stopPropagation(); const b = e.target.closest('[data-pm]'); if (e.target.closest('a')) m.remove(); if (!b) return; m.remove();
    if (b.dataset.pm === 'theme') { localStorage.setItem(THEME_KEY, theme() === 'light' ? 'dark' : 'light'); applyTheme(true); render(); }
    if (b.dataset.pm === 'sync') sync(true);
    if (b.dataset.pm === 'out' && confirm('¿Cerrar sesión en este dispositivo?')) logout(); };
  setTimeout(() => document.addEventListener('click', function close(ev) { if (!m.contains(ev.target)) { m.remove(); document.removeEventListener('click', close); } }), 0);
}
function updateChrome(r) {
  $$('.side nav a').forEach(a => a.classList.toggle('on', a.dataset.r === r));
  const tabMap = { '': '', hoy: 'hoy', plan: 'hoy', falladas: 'falladas', aleatorio: 'practicar', cuestionarios: 'practicar', repaso: 'practicar', examenes: 'practicar', temario: 'practicar', practicar: 'practicar' };
  const tr = r in tabMap ? tabMap[r] : 'mas';
  $$('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.t === tr));
  $('#ttl').textContent = TITLES[r] ?? '';
  const pf = pendingFails().length, dr = dueReviews().length;
  const fb = $('#failBadge'); fb.textContent = pf > 99 ? '99+' : pf; fb.classList.toggle('hidden', !pf);
  const c = { falladas: pf || '', repaso: dr || '' };
  $$('[data-cnt]').forEach(el => { el.textContent = c[el.dataset.cnt] ?? ''; el.style.display = c[el.dataset.cnt] ? '' : 'none'; });
}

/* ---------- Router ---------- */
const routes = {};
let QZ = null, EXZ = null, timerH;
const busy = () => (QZ && !QZ.finished) || (EXZ && !EXZ.done) || (typeof PSH !== 'undefined' && PSH && !PSH.done && location.hash.includes('/hoja/')) || (typeof PZ !== 'undefined' && PZ && !PZ.done && location.hash.startsWith('#/psicotecnicos/'));
function parseHash() {
  const h = location.hash.replace(/^#\/?/, ''); const [path, qs] = h.split('?');
  const parts = path.split('/').map(decodeURIComponent); const q = Object.fromEntries(new URLSearchParams(qs || ''));
  return { r: parts[0] || '', args: parts.slice(1), q };
}
function render() {
  if (!SESS) return;
  const { r, args, q } = parseHash();
  QZ = null; EXZ = null; clearInterval(timerH);
  updateChrome(r);
  const main = $('#app'); main.style.animation = 'none'; void main.offsetWidth; main.style.animation = '';
  safe(() => (routes[r] || routes[''])(args, q), 'route ' + r);
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);
document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a && a.getAttribute('href') === location.hash && SESS) { e.preventDefault(); render(); } });
const app = html => { $('#app').innerHTML = html; };
const head = (eyebrow, title, sub, extra = '') => `<div class="head"><div style="flex:1;min-width:240px">${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${extra}</div>`;
const ring = (p, size = 64, stroke = 7, label = p + '%', color = 'url(#g1)') => {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><defs><linearGradient id="g1" x1="0" x2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="rgba(148,163,184,.15)" stroke-width="${stroke}" fill="none"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}" stroke-width="${stroke}" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, p / 100))}"/></svg><div class="lbl" style="font-size:${size / 4.6}px">${label}</div></div>`;
};

/* ---------- Motor de test (práctica) ---------- */
function startQuiz(opts) {
  QZ = Object.assign({ i: 0, ok: 0, ko: 0, requeue: [], seen: [], count: 0, finished: false }, opts);
  if (QZ.list) QZ.list = QZ.list.slice();
  if (QZ.list && !QZ.list.length) { toast('No hay preguntas para practicar aquí'); QZ = null; return; }
  nextQuestion();
}
function nextQuestion() {
  const rq = QZ.requeue.findIndex(x => QZ.count - x.at >= 6);
  let id;
  if (rq >= 0) { id = QZ.requeue.splice(rq, 1)[0].id; QZ.isRe = true; }
  else if (QZ.list) {
    if (QZ.i >= QZ.list.length) { if (QZ.requeue.length) { id = QZ.requeue.shift().id; QZ.isRe = true; } else return finishQuiz(); }
    else { id = QZ.list[QZ.i++]; QZ.isRe = false; }
  } else { id = QZ.next(QZ); QZ.isRe = false; if (!id) return finishQuiz(); }
  QZ.cur = shuffleQ(materialize(Q[id])); QZ.chosen = null; QZ.count++; QZ.shown = now();
  QZ.seen.push(id); if (QZ.seen.length > 40) QZ.seen.shift();
  renderQuiz();
}
function answer(idx) {
  if (QZ.chosen != null) return;
  const q = QZ.cur; QZ.chosen = idx; const ok = idx === q.a;
  ok ? QZ.ok++ : QZ.ko++;
  if (QZ.shown && q.kind !== 'eng' && document.visibilityState === 'visible') Pace.addQ((now() - QZ.shown) / 1000);
  const first = record(q.id, ok);
  if (!ok && !QZ.isRe) QZ.requeue.push({ id: q.id, at: QZ.count });
  if (!ok && navigator.vibrate) navigator.vibrate(60);
  if (QZ.studyTopic && first && q.kind === 'cuest') addStudy(ymd(), q.t, [q.id]);
  renderQuiz(true);
}
function finishQuiz() {
  QZ.finished = true; const z = QZ; if (z.onFinish) z.onFinish(z);
  const p = pct(z.ok, z.ok + z.ko);
  app(`<div class="card hl" style="text-align:center;padding:30px 20px">
    <div class="eyebrow">${esc(z.title)}</div>
    <div style="display:flex;justify-content:center;margin:14px 0">${ring(p, 120, 11)}</div>
    <h1 style="margin-bottom:6px">${p >= 80 ? '¡Muy bien!' : p >= 50 ? 'Vas bien' : 'A seguir dándole'}</h1>
    <p class="muted">${z.ok} aciertos · ${z.ko} fallos${z.ko ? ' · las falladas volverán a salir mañana y están en «Falladas»' : ''}</p>
    <div class="row" style="justify-content:center;margin-top:14px"><a class="btn" href="${z.back || '#/'}">Continuar</a>${z.ko ? '<a class="btn sec" href="#/falladas">Ver falladas</a>' : ''}</div></div>`);
}
function qMeta(q) {
  const r = rec(q.id); const b = [];
  if (q.kind === 'cuest') b.push(`<span class="pill" style="color:${TOP[q.t]?.c}">${esc(TOP[q.t]?.short || q.t)} · nº ${esc(q.n)}</span>`);
  else if (q.kind === 'exam') b.push(`<span class="pill cyan">${icon('exam')} ${esc(q.src)} · nº ${q.n}</span><span class="pill">${esc(TOP[q.t]?.short || q.t)}</span>`);
  else b.push(`<span class="pill violet">${esc(q.src)}</span>`);
  if (q.rep) b.push(`<span class="pill amber">${icon('star')} Repetida en ${esc(q.rep.join(', '))}</span>`);
  if (r.n) b.push(`<span class="pill">${r.ok}✓ ${r.ko}✗</span>`);
  return b.join('');
}
function renderQuiz(anim) {
  const z = QZ, q = z.cur, done = z.chosen != null; const ok = done && z.chosen === q.a;
  const total = z.list ? z.list.length : 0; const pos = z.list ? Math.min(z.i, total) : z.count;
  const pg = R.qpage[q.id]; const ov = S.ov[q.id]?.v;
  app(`<div class="qtop"><a class="btn ghost sm" href="${z.back || '#/'}">${icon('chevL')}</a>
      ${z.list ? `<div class="bar"><i style="width:${pct(pos, total)}%"></i></div><span class="mono small muted">${pos}/${total}</span>` : `<span class="small muted" style="flex:1">${esc(z.title)} · #${z.count}</span>`}
      <span class="pill ok">✓ ${z.ok}</span><span class="pill ko">✗ ${z.ko}</span></div>
    <div class="card ${done && !ok && anim ? 'shake' : ''}">
      <div class="qmeta">${z.isRe ? `<span class="pill amber">${icon('repeat')} Repetición</span>` : ''}${qMeta(q)}</div>
      ${q.q ? `<div class="qtext">${esc(q.q)}</div>` : ''}${q.img ? `<img class="qimg" src="${q.img}" alt="Pregunta ${esc(q.n || '')}" loading="eager">` : ''}
      ${q.o.map((o, i) => `<button class="opt ${done ? (i === q.a ? 'ok' : i === z.chosen ? 'ko' : '') : ''}" data-i="${i}" ${done ? 'disabled' : ''}><span class="l">${L[i].toUpperCase()}</span><span>${o.length === 1 ? '' : esc(o)}</span></button>`).join('')}
      ${done ? `<div class="fb ${ok ? 'ok' : 'ko'}">${icon(ok ? 'check' : 'x')}<div>${ok ? 'Correcto' : 'Incorrecto · la buena es la ' + L[q.a].toUpperCase() + (q.o[q.a].length === 1 ? '' : ': ' + esc(q.o[q.a]))}</div></div>${q.r ? `<div class="rule ${ok ? '' : 'open'}"><div class="rh">${icon('book')} ${ok ? 'La regla' : 'Para no volver a fallarla'}</div><div>${esc(q.r)}</div>${q.kn ? `<div class="small muted" style="margin-top:6px">Nota de la clave: ${esc(q.kn)}</div>` : ''}</div>` : ''}${q.x ? `<div class="warnbox">${icon('alert')}<div>${esc(q.x)}</div></div>` : ''}
        ${q.kind === 'cuest' ? `<div class="row small" style="margin-top:8px">${pg && pagesOf(q.t).length ? `<a href="#/resumenes/${q.t}/${pg}">${icon('book', 'chev')} Ver en el resumen (p. ${pg})</a>` : ''}${q.pg ? `<a href="#/temario/${TOP[q.t].n}/${q.pg[0]}">${icon('marker', 'chev')} Temario p. ${q.pg[0]}</a>` : ''}</div>` : ''}` : ''}
    </div>
    <div class="qactions"><button class="btn block" id="nextBtn" ${done ? '' : 'disabled'}>Siguiente ${icon('chevR')}</button><button class="btn ghost flagbtn ${S.q[q.id]?.pend ? 'on' : ''}" id="flagBtn" title="Marcar como fallada: te la volveré a preguntar">${icon('flag')}<span>${S.q[q.id]?.pend ? 'En falladas' : 'Marcar como fallada'}</span></button><button class="btn ghost" id="endBtn">Terminar</button></div>
    <div class="kbd">Teclado: 1-9 o A-D para responder · Enter para seguir</div>`);
  $$('.opt').forEach(b => b.onclick = () => answer(+b.dataset.i));
  $('#nextBtn').onclick = nextQuestion; $('#endBtn').onclick = finishQuiz;
  $('#flagBtn').onclick = () => {
    const r = Object.assign({ n: 0, ok: 0, ko: 0 }, S.q[q.id]);
    if (r.pend) { r.pend = false; r.po = 0; toast('Quitada de falladas'); }
    else { r.pend = true; r.po = 0; r.due = now() + DAY; if (!QZ.requeue.some(x => x.id === q.id)) QZ.requeue.push({ id: q.id, at: QZ.count }); toast('Marcada como fallada: te la vuelvo a preguntar'); }
    r.u = now(); S.q[q.id] = r; save(); renderQuiz();
  };
  if (!anim) window.scrollTo(0, 0);
  else { const f = $('.fb'); if (f && f.getBoundingClientRect().bottom > innerHeight - 140) window.scrollBy({ top: f.getBoundingClientRect().bottom - innerHeight + 160, behavior: 'smooth' }); }
}
document.addEventListener('keydown', e => {
  if (!QZ || QZ.finished || !QZ.cur || (EXZ && !EXZ.done)) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
  const k = e.key.toLowerCase();
  if (QZ.chosen == null) { const i = /^[1-9]$/.test(k) ? +k - 1 : (k.length === 1 ? L.indexOf(k) : -1); if (i >= 0 && i < QZ.cur.o.length) answer(i); }
  else if (k === 'enter' || k === ' ') { e.preventDefault(); nextQuestion(); }
});
function weightedNext(topics, opts = {}) {
  const pool = opts.poolFn ? opts.poolFn() : poolFor(topics);
  const byT = {}; pool.forEach(q => (byT[q.t] = byT[q.t] || []).push(q));
  return z => {
    const seen = new Set(z.seen.slice(-25));
    const dueF = pool.filter(q => { const r = S.q[q.id]; return r?.pend && (r.due || 0) <= now() && !seen.has(q.id); });
    if (dueF.length && Math.random() < 0.3) return dueF[Math.floor(Math.random() * dueF.length)].id;
    const ts = Object.keys(byT).filter(t => (S.settings.weights[t] ?? 1) > 0); if (!ts.length) return null;
    const tw = ts.map(t => S.settings.weights[t] ?? 1); let r = Math.random() * tw.reduce((a, b) => a + b, 0), t = ts[0];
    for (let i = 0; i < ts.length; i++) { r -= tw[i]; if (r <= 0) { t = ts[i]; break; } }
    const cand = byT[t].filter(q => !seen.has(q.id)); const arr = cand.length ? cand : byT[t];
    const ws = arr.map(q => { const rr = S.q[q.id]; return (1 / (1 + (rr?.n || 0))) * (rr?.pend ? 2 : 1) * (q.rep ? 1.5 : 1); });
    let s = Math.random() * ws.reduce((a, b) => a + b, 0);
    for (let i = 0; i < arr.length; i++) { s -= ws[i]; if (s <= 0) return arr[i].id; }
    return arr[arr.length - 1].id;
  };
}

/* ---------- Inicio ---------- */
routes[''] = () => {
  const dr = dueReviews(), pf = pendingFails();
  const days = S.settings.examDate ? Math.ceil((new Date(S.settings.examDate + 'T09:00:00') - now()) / DAY) : null;
  const todayN = Object.values(S.q).filter(r => r.t && ymd(r.t) === ymd()).length;
  const st = streak(); const items = P.itemsFor(ymd()); const pst = P.stats();
  const doneN = items.filter(i => P.done(i.key)).length;
  const h = new Date().getHours(); const hi = h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
  const prio = TOPICS.filter(t => t.id !== 'entorno');
  app(`${head(fmtDate(ymd(), { weekday: 'long', day: 'numeric', month: 'long' }), `${hi}, ${esc((SESS.name || '').split(' ')[0] || 'piloto')}`, 'Tu torre de control para la oposición a controlador de ENAIRE.')}
  <div class="card planhome"><div class="row" style="margin-bottom:2px"><div style="flex:1;min-width:200px"><div class="tiny">Tu plan de estudio</div></div>
    <a class="btn sm" href="#/plan">${icon('grid')} Ver mi plan</a><button class="btn ghost sm" id="restart" title="El día 0 pasa a ser hoy">${icon('refresh')} Recalcular desde hoy</button><a class="btn ghost sm" href="#/bienvenida?edit=1">${icon('gear')} Cambiar</a></div>
    ${examCountdown()}${planSummary(P.stats(), P.cfg())}</div>
  <div class="grid g4" style="margin-top:16px">
    <a class="kpi" href="#/stats"><div class="ic c-cyan">${icon('target')}</div><div class="tiny">Preguntas</div><div class="v">${Object.values(S.q).filter(r => r.n).length}</div><div class="s">respondidas en total</div></a>
    <a class="kpi" href="#/repaso"><div class="ic c-violet">${icon('repeat')}</div><div class="tiny">Repasos hoy</div><div class="v">${dr.length}</div><div class="s">1 · 3 · 7 días</div></a>
    <a class="kpi" href="#/falladas"><div class="ic c-ko">${icon('x')}</div><div class="tiny">Falladas</div><div class="v">${pf.length}</div><div class="s">pendientes de dominar</div></a>
    <a class="kpi" href="#/stats"><div class="ic c-amber">${icon('flame')}</div><div class="tiny">Racha</div><div class="v">${st}</div><div class="s">${todayN} preguntas hoy</div></a>
  </div>
  <a class="card hl" href="#/hoy" style="display:flex;gap:16px;align-items:center;color:inherit">
    ${ring(pct(doneN, items.length || 1), 70, 8, items.length ? `${doneN}/${items.length}` : '—')}
    <div style="flex:1"><div class="eyebrow" style="margin:0">Hoy toca · plan al ${pct(pst.done, pst.total)}% · quedan ${pst.left} tareas</div>
    <div style="font-weight:650;margin-top:4px">${items.length ? items.slice(0, 4).map(i => TOP[i.t] ? `${TOP[i.t].short} ${itemLabel(i)}` : itemLabel(i)).join(' · ') : 'Día libre o de repaso: falladas y repasos 1·3·7'}</div></div>${icon('chevR', 'chev')}</a>
  <div class="row" style="margin:14px 0 6px"><a class="btn" href="#/aleatorio">${icon('shuffle')} A boleo</a><a class="btn sec" href="#/cuestionarios">${icon('layers')} Cuestionarios</a><a class="btn sec" href="#/examenes">${icon('exam')} Simulacro</a></div>
  <div class="upd">${icon('check')} Temario y tests actualizados al temario 2026</div>
  <h2>Tu progreso por tema</h2>
  <div class="topics">${prio.map(t => { const s = topicStats(t.id); return `<a class="topic" href="#/cuestionarios/${t.id}" style="--tc:${t.c}33"><div class="n">TEMA ${t.n}</div><div class="nm">${t.name}${t.w >= 3 ? '<span class="pill cyan">prioritario</span>' : ''}</div>
    <div class="bar"><i style="width:${pct(s.seen, s.scope)}%;background:${t.c}"></i></div><div class="row small muted"><span>${pct(s.seen, s.scope)}% hecho</span><span class="spacer"></span><span>${pct(s.ok, s.seen)}% acierto</span></div></a>`; }).join('')}</div>
`);
  bindExamDate();
  const rs = $('#restart'); if (rs) rs.onclick = () => { P.restartToday(); toast('Plan recalculado: hoy es tu día 0'); render(); };
};

/* ---------- Hoy toca ---------- */
const tbadge = tp => { const x = TOP[tp]; const ic = { psico: 'brain', eng: 'globe', sim: 'exam', fall: 'x', ciclo: 'repeat' }[tp]; return `<span class="tbadge" style="--tc:${x?.c || '#009FDA'}" title="${esc(tname(tp))}">${x ? 'T' + x.n : icon(ic || 'star')}</span>`; };
function taskCard(it, day) {
  const d = P.done(it.key), on = P.doneOn(it.key); const isPast = day < ymd();
  let title, desc, actions = '';
  if (it.k === 'res') {
    const nq = qForPages(it.t, it.a, it.b).length;
    title = `${tname(it.t)} · resumen ${it.b !== it.a ? `págs. ${it.a}–${it.b}` : `pág. ${it.a}`}`;
    desc = `${Math.round(it.mins)} min aprox.${nq ? ` · luego ${nq} preguntas de estas páginas` : ''}`;
    actions = `<a class="btn sm" href="#/resumenes/${it.t}/${it.a}?to=${it.b}&task=${encodeURIComponent(it.key)}">${icon('book')} Leer</a>`;
  } else if (it.k === 'qp' || it.k === 'q') {
    title = it.k === 'qp' ? `${tname(it.t)} · preguntas de ${it.b !== it.a ? `las págs. ${it.a}–${it.b}` : `la pág. ${it.a}`}` : `${tname(it.t)} · cuestionario nº ${it.a}–${it.b}`;
    desc = `${it.ids.length} preguntas · ${it.mins} min aprox. · entran en tu repaso 1·3·7`;
    actions = `<button class="btn sm" data-q="${it.key}">${icon('play')} Hacer</button>`;
  } else if (it.k === 'eng') { title = 'Inglés'; desc = `${it.mins} min · preguntas tipo examen con la regla explicada`; actions = `<a class="btn sm" href="#/ingles">${icon('globe')} Practicar</a>`; }
  else if (it.k === 'psico') { title = 'Psicotécnicos'; desc = `${it.mins} min · series, cálculo, atención y memoria`; actions = `<a class="btn sm" href="#/psicotecnicos">${icon('brain')} Practicar</a>`; }
  else if (it.k === 'sim') { title = 'Simulacro de examen'; desc = '50 preguntas · 50 min · −0,33 por fallo'; actions = `<a class="btn sm" href="#/examenes">${icon('exam')} Hacer simulacro</a>`; }
  else if (it.k === 'r137') { title = `Repaso día ${it.rk} · ${tname(it.t)}`; desc = `${it.ids.length} preguntas de lo que estudiaste el ${fmtDate(it.e.d, { day: 'numeric', month: 'long' })}${it.e.label ? ' (' + esc(it.e.label) + ')' : ''}`; actions = `<button class="btn sm" data-q="${it.key}">${icon('repeat')} Hacer repaso</button>`; if (!P.done(it.key) && it.due < ymd()) desc += ' · <b>atrasado</b>'; }
  else if (it.k === 'ciclo') { title = 'Repaso de temas anteriores'; desc = '20 preguntas de lo que ya pasó el repaso 1·3·7, en orden desde lo primero que estudiaste'; actions = `<button class="btn sm" data-q="${it.key}">${icon('repeat')} Hacer repaso</button>`; }
  else if (it.k === 'fall') { title = 'Falladas y repasos pendientes'; desc = `${pendingFails().length} falladas · ${dueReviews().length} repasos 1·3·7`; actions = `<a class="btn sm" href="#/falladas">${icon('x')} Repasar</a>`; }
  const badge = d ? (on && on !== day ? `<span class="pill ok">hecho el ${fmtDate(on)}</span>` : '') : (isPast && !it.d ? '<span class="pill amber">recolocado</span>' : '');
  return `<div class="task ${d ? 'done' : ''}"><button class="tick" data-tick="${it.key}" aria-label="Hecho">${icon('check')}</button>${tbadge(it.t)}
    <div class="body"><div class="tt">${title} ${badge}</div><div class="small muted" style="margin:3px 0 8px">${desc}</div><div class="row">${actions}</div></div></div>`;
}
function bindTasks(items, back) {
  $$('[data-tick]').forEach(b => b.onclick = () => {
    const key = b.dataset.tick, it = items.find(i => i.key === key), nv = !P.done(key);
    if (it.k === 'r137') { it.e.done = Object.assign({}, it.e.done, { [it.rk]: nv ? now() : 0 }); if (!nv) delete it.e.done[it.rk]; it.e.u = now(); save(); return render(); }
    P.setDone(key, nv);
    if (nv && it.k === 'res') { const ids = markRead(it.t, it.a, it.b); if (ids.length) toast(`${ids.length} preguntas de estas páginas al repaso 1·3·7`); }
    if (!nv && it.k === 'res') { for (let p = it.a; p <= it.b; p++) S.rd[it.t + ':' + p] = { v: 0, u: now() }; save(); }
    render();
  });
  $$('[data-q]').forEach(b => b.onclick = () => {
    const it = items.find(i => i.key === b.dataset.q);
    if (it.k === 'r137') return startQuiz({ title: `Repaso día ${it.rk} · ${tname(it.t)}`, list: shuffle(it.ids), back, onFinish: z => { if (z.i >= z.list.length) { it.e.done = Object.assign({}, it.e.done, { [it.rk]: now() }); it.e.u = now(); save(); } } });
    if (it.k === 'ciclo') { const ids = Ciclo.next(); if (!ids.length) return toast('Aún no hay temas que hayan pasado el repaso 1·3·7'); return startQuiz({ title: 'Repaso de temas anteriores', list: ids, back, onFinish: z => { Ciclo.advance(Math.min(z.i, ids.length)); if (z.i >= ids.length) P.setDone(it.key, true); } }); }
    startQuiz({ title: `${tname(it.t)} · ${itemLabel(it)}`, list: it.ids, studyTopic: it.t, back, onFinish: z => { if (z.i >= z.list.length) P.setDone(it.key, true); } });
  });
}
const taskMins = items => items.reduce((a, i) => a + (i.mins || 0), 0);
// Hoy toca: tareas agrupadas por tipo
const TASK_GROUPS = [
  { id: 'res', title: 'Estudiar', sub: 'Páginas del resumen', ic: 'book', cls: 'g-res', ks: ['res'] },
  { id: 'q', title: 'Tests de cuestionario', sub: 'Preguntas de lo que estudias', ic: 'layers', cls: 'g-q', ks: ['qp', 'q'] },
  { id: 'rep', title: 'Repasos', sub: 'Repaso 1·3·7 y lo que ya estudiaste', ic: 'repeat', cls: 'g-rep', ks: ['r137', 'ciclo', 'fall', 'sim'] },
  { id: 'eng', title: 'Inglés', sub: 'Tipo examen, con la regla explicada', ic: 'globe', cls: 'g-eng', ks: ['eng'] },
  { id: 'psico', title: 'Psicotécnicos', sub: 'Series, cálculo, atención y memoria', ic: 'brain', cls: 'g-psico', ks: ['psico'] },
];
function taskGroups(items, day) {
  return TASK_GROUPS.map(g => {
    const its = items.filter(i => g.ks.includes(i.k)); if (!its.length) return '';
    const dn = its.filter(i => P.done(i.key)).length, mins = taskMins(its.filter(i => !P.done(i.key)));
    return `<section class="tgroup ${g.cls}"><header class="tgh"><span class="tgi">${icon(g.ic)}</span><div><b>${g.title}</b><span>${g.sub}</span></div>
      <em>${dn === its.length ? `${icon('check')} Hecho` : `${dn}/${its.length}${mins ? ` · ${mins >= 60 ? (Math.round(mins / 6) / 10).toString().replace('.', ',') + ' h' : Math.round(mins) + ' min'}` : ''}`}</em></header>
      ${its.map(it => taskCard(it, day)).join('')}</section>`;
  }).join('');
}
routes['hoy'] = (args, q) => {
  const t = ymd(); const day = q.f || t; const isToday = day === t, isPast = day < t;
  const items = P.itemsFor(day); const off = P.isOff(day), fin = P.isFinal(day);
  const doneN = items.filter(i => P.done(i.key)).length; const mins = taskMins(items.filter(i => !P.done(i.key)));
  const sch = P.schedule(); const nextDay = Object.keys(sch).filter(d => d > t && sch[d].length).sort()[0]; const nextN = nextDay ? sch[nextDay].length : 0;
  const st = P.stats(); const back = '#/hoy' + (q.f ? '?f=' + q.f : '');
  const nav = `<div class="daynav"><button data-f="${addDays(day, -1)}" aria-label="Día anterior">${icon('chevL')}</button>${!isToday ? `<button data-f="${t}" style="width:auto;padding:0 12px;font-weight:600;font-size:13px">Hoy</button>` : ''}<button data-f="${addDays(day, 1)}" aria-label="Día siguiente">${icon('chevR')}</button></div>`;
  app(`${head(fmtDate(day, { weekday: 'long', day: 'numeric', month: 'long' }) + (isToday ? ' · hoy' : ''), isToday ? 'Hoy toca' : isPast ? 'Lo que tocaba' : 'Lo que toca', isToday ? 'Tu plan se recalcula solo: lo que no hagas pasa a los días siguientes y lo que adelantes te libera días.' : isPast ? 'Lo que no hiciste ese día ya está recolocado en los siguientes.' : 'Puedes adelantar estas tareas: márcalas al hacerlas y el plan se recalcula.', nav)}
  <div class="card flat row" style="gap:16px">${ring(pct(doneN, items.length || 1), 64, 7, items.length ? doneN + '/' + items.length : '—')}<div style="flex:1"><div style="font-weight:650">${off ? 'Día libre: descansa 😌' : day >= P.examDate() ? 'Día del examen ✈ ¡Mucha suerte!' : items.length ? `${items.length} tareas${mins ? ` · ~${mins >= 60 ? (Math.round(mins / 6) / 10).toString().replace('.', ',') + ' h' : Math.round(mins) + ' min'} pendientes` : ' · ¡todo hecho!'}` : 'Sin temario nuevo: repasos y falladas'}${fin && !off ? ' · <span class="pill cyan">repaso final</span>' : ''}</div>
    <div class="small muted">Quedan ${st.left} tareas de temario · examen el ${fmtDate(P.examDate(), { day: 'numeric', month: 'long' })}</div></div><a class="btn ghost sm" href="#/plan">${icon('grid')} Mi plan</a></div>
  ${items.some(i => i.late) ? `<h2 class="sub">${icon('alert')} Acumulado para ponerte al día <span class="pill amber">${items.filter(i => i.late && !P.done(i.key)).length}</span></h2><div class="row" style="margin:-6px 0 8px"><p class="small muted" style="margin:0;flex:1;min-width:220px">Lo que tocaba en días anteriores y aún no has hecho. Hazlo primero y vuelves a ir al día, o empieza de nuevo desde hoy.</p><button class="btn ghost sm" id="restart">${icon('refresh')} Recalcular desde hoy</button></div>${items.filter(i => i.late).map(it => taskCard(it, day)).join('')}<h2 class="sub">${icon('sun')} Lo de hoy</h2>` : ''}
  ${taskGroups(items.filter(i => !i.late), day) || (off ? '' : `<div class="card empty">${icon('repeat')}<div>No hay temario este día. Aprovecha para repasos 1·3·7 y falladas.</div></div>`)}
  ${isToday && nextN && !off ? `<div class="card ${doneN === items.length ? 'hl' : 'flat'} row"><div style="flex:1"><b>${doneN === items.length && items.length ? '¡Día completado! ' : ''}¿Te animas con lo siguiente?</b><div class="small muted">${nextN} tareas del ${fmtDate(nextDay)}. Si las haces hoy, el resto del plan se recoloca.</div></div><button class="btn ${doneN === items.length ? '' : 'sec'}" id="adel">${icon('chevR')} Adelantar</button></div>` : ''}
  <div class="row" style="margin-top:14px"><a class="btn ghost sm" href="#/repaso">${icon('repeat')} Repasos 1·3·7 (${dueReviews().length})</a><a class="btn ghost sm" href="#/bienvenida?edit=1">${icon('gear')} Cambiar mi plan</a></div>`);
  $$('[data-f]').forEach(b => b.onclick = () => { location.hash = '#/hoy?f=' + b.dataset.f; });
  const ad = $('#adel'); if (ad) ad.onclick = () => { const n = P.adelantar(); toast(n ? 'Añadido a hoy. El plan se ha recolocado.' : 'No hay más tareas'); render(); };
  bindTasks(items, back);
  const rs = $('#restart'); if (rs) rs.onclick = () => { P.restartToday(); toast('Plan recalculado: hoy es tu día 0'); render(); };
};

/* ---------- Mi plan ---------- */
const PLAN_COLS = [['res', 'meteo', 'Meteo'], ['res', 'ffhh', 'FFHH'], ['res', 'carto', 'Carto'], ['res', 'nav', 'Nav'], ['res', 'aero', 'Aero'], ['res', 'fpl', 'Plan vuelo'], ['res', 'inst', 'Instit.'], ['res', 'oaci', 'Códigos'],
  ['q', 'meteo', 'Meteo'], ['q', 'ffhh', 'FFHH'], ['q', 'carto', 'Carto'], ['q', 'nav', 'Nav'], ['q', 'aero', 'Aero'], ['q', 'fpl', 'Plan vuelo'], ['q', 'inst', 'Instit.'], ['q', 'oaci', 'Códigos'], ['x', 'x', 'Diario']];
function examCountdown() {
  const c = P.cfg(), ex = P.examDate(); const d = Math.max(0, Math.ceil((new Date(ex + 'T09:00:00') - now()) / DAY));
  const w = Math.floor(d / 7), r = d % 7;
  return `<div class="countdown"><div class="cd-num"><b>${d}</b><span>${d === 1 ? 'día' : 'días'}</span></div>
    <div class="cd-txt"><div class="tiny">Cuenta atrás para el examen</div><div class="cd-date">${fmtDate(ex, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
    <div class="small muted">${d ? `${w ? `${w} semana${w === 1 ? '' : 's'}` : ''}${w && r ? ' y ' : ''}${r ? `${r} día${r === 1 ? '' : 's'}` : ''}` : '¡Es hoy! Mucha suerte ✈'}${c.known == 0 && !c.examDate ? ' · fecha estimada: aún no la has fijado' : ''}</div></div>
    <label class="cd-edit"><span>${icon('cal')} Cambiar fecha</span><input type="date" id="exdate" value="${ex}" min="${addDays(ymd(), 1)}"></label></div>`;
}
function bindExamDate() {
  const el = $('#exdate'); if (!el) return;
  const apply = () => { const v = el.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || v <= ymd() || v === P.examDate()) return;
    S.plan = S.plan || {}; S.plan.cfg = Object.assign(P.cfg(), { examDate: v, known: 1 }); S.plan.u = now(); S.settings.examDate = v;
    const t = ymd(); Object.keys(S.ps || {}).forEach(d => { if (d > t) delete S.ps[d]; }); P._sig = ''; save(true);
    toast('Fecha del examen cambiada: plan recalculado'); render(); };
  el.onchange = apply; el.onblur = apply; el.onkeydown = e => { if (e.key === 'Enter') apply(); };
}
function planSummary(st, c) {
  return `  <div class="grid g4" style="margin-top:14px">
    <div class="kpi"><div class="tiny">Hecho</div><div class="v">${pct(st.done, st.total)}%</div><div class="s">${st.done} de ${st.total} tareas</div></div>
    <div class="kpi"><div class="tiny">Te queda</div><div class="v">${st.hoursLeft} h</div><div class="s">${Pace.label()}</div></div>
    <div class="kpi"><div class="tiny">Días de estudio</div><div class="v">${st.daysLeft}</div><div class="s">hasta el repaso final</div></div>
    <div class="kpi"><div class="tiny">Ritmo</div><div class="v ${st.ok ? 'c-ok' : 'c-ko'}">${st.ok ? 'Vas bien' : 'Vas justo'}</div><div class="s">${st.ok ? `terminas el temario el ${fmtDate(st.finish)}` : `necesitas ${st.hoursLeft} h y tienes ${st.capHours} h`}</div></div></div>
  ${st.ok && st.spare ? `<p class="okmsg">${icon('check')}<span>Te sobran <b>${st.spare} días</b> antes del repaso final: ${c.spare === 'repartir' ? 'puedes ir más desahogado o' : 'los dedicamos a repasar (repaso de temas anteriores, falladas y simulacros). Si prefieres'} <a href="#/bienvenida?edit=1">${c.spare === 'repartir' ? 'terminar antes' : 'repartir el temario en más días'}</a>.</span></p>` : ''}
  ${st.ok ? '' : `<div class="warnbox">${icon('alert')}<div>Con el tiempo que indicaste no da para todo el temario antes del repaso final. El plan reparte lo que queda igualmente, pero los días saldrán más cargados. <a href="#/bienvenida?edit=1">Ajusta tu plan</a> (más tiempo diario o menos días libres).</div></div>`}`;
}
/* Agenda del plan: vistas Semana / Día / Todo, navegación y filtro por tema */
const PV = (() => { try { return JSON.parse(localStorage.getItem('opo_planview') || '{}'); } catch (e) { return {}; } })();
function planDays(ctx) {
  const { t, end, itemsFor } = ctx; const box = $('#pday'); if (!box) return;
  const v = PV.v || 'semana', tf = PV.t || 'all';
  const anchor = PV.a && PV.a >= ctx.from && PV.a <= end ? PV.a : t;
  const monday = d => addDays(d, -((dow(d) + 6) % 7));
  const DAILY = ['eng', 'psico', 'ciclo', 'sim', 'fall', 'r137'];
  const topicsIn = TOPICS.filter(x => ctx.dates.some(d => itemsFor(d).some(i => i.t === x.id)));
  const keep = i => tf === 'all' || (tf === 'diario' ? DAILY.includes(i.k) : i.t === tf && !DAILY.includes(i.k));
  const label = i => i.k === 'res' ? (i.b !== i.a ? `págs. ${i.a}–${i.b}` : `pág. ${i.a}`) : i.k === 'qp' ? `${i.ids.length} preg.` : i.k === 'q' ? `preg. ${i.a}–${i.b}` : i.k === 'r137' ? `Repaso día ${i.rk}` : ({ eng: 'Inglés', psico: 'Psicotécnicos', ciclo: 'Repaso anterior', sim: 'Simulacro', fall: 'Falladas' }[i.k] || '');
  const state = (i, d) => P.done(i.key) ? 'done' : d < t ? 'miss' : d === t ? 'today' : 'fut';
  const ic = { eng: 'globe', psico: 'brain', ciclo: 'repeat', sim: 'exam', fall: 'x' };
  const chip = (i, d) => `<span class="ptask ${state(i, d)}" style="--tc:${TOP[i.t]?.c || '#64748b'}" title="${esc(tname(i.t) + ' · ' + label(i))}"><i>${TOP[i.t] ? 'T' + TOP[i.t].n : icon(ic[i.k] || 'star')}</i><span>${esc(label(i))}</span>${P.done(i.key) ? icon('check') : ''}</span>`;
  const dayCard = d => {
    const all = itemsFor(d), its = all.filter(keep), off = P.isOff(d), ex = d === end, dn = all.filter(i => P.done(i.key)).length;
    const body = ex ? '<div class="pnote exam">✈ Día del examen</div>' : off ? '<div class="pnote">Día libre</div>'
      : its.length ? (P.isFinal(d) ? '<div class="pnote fin">Repaso final</div>' : '') + its.map(i => chip(i, d)).join('') : `<div class="pnote">${all.length ? '—' : 'Sin tareas'}</div>`;
    return `<div class="pday${d === t ? ' is-today' : ''}${off ? ' is-off' : ''}${ex ? ' is-exam' : ''}${d < t ? ' is-past' : ''}">
      <a class="pdh" href="#/hoy?f=${d}" title="Abrir en Hoy toca"><b>${fmtDate(d, { weekday: 'short' })}</b><span>${new Date(d + 'T12:00:00').getDate()} ${fmtDate(d, { month: 'short' })}</span>${all.length && !ex && !off ? `<em class="${dn === all.length ? 'ok' : ''}">${dn}/${all.length}</em>` : ''}</a>
      <div class="pdb">${body}</div></div>`;
  };
  let title, body;
  if (v === 'semana') {
    const m = monday(anchor); const days = Array.from({ length: 7 }, (_, k) => addDays(m, k));
    title = `${fmtDate(days[0], { day: 'numeric', month: 'short' })} – ${fmtDate(days[6], { day: 'numeric', month: 'short', year: 'numeric' })}`;
    body = `<div class="pweek">${days.map(d => d < ctx.from || d > end ? `<div class="pday is-out"><div class="pdh"><b>${fmtDate(d, { weekday: 'short' })}</b><span>${new Date(d + 'T12:00:00').getDate()} ${fmtDate(d, { month: 'short' })}</span></div><div class="pdb"><div class="pnote">—</div></div></div>` : dayCard(d)).join('')}</div>`;
  } else if (v === 'dia') {
    title = fmtDate(anchor, { weekday: 'long', day: 'numeric', month: 'long' });
    body = `<div class="pone">${dayCard(anchor)}<a class="btn sm" href="#/hoy?f=${anchor}">${icon('sun')} Abrir en Hoy toca</a></div>`;
  } else {
    title = 'Todo el plan, de hoy al examen';
    const ds = ctx.dates.filter(d => d >= t || itemsFor(d).some(i => !P.done(i.key) && keep(i))).filter(d => d === end || itemsFor(d).some(keep) || (tf === 'all' && P.isOff(d)));
    body = `<div class="plist">${ds.map(dayCard).join('')}</div>`;
  }
  const navs = v === 'lista' ? '' : `<button class="btn ghost sm" data-step="-1" aria-label="Anterior">${icon('chevL')}</button><button class="btn ghost sm" data-step="0">Hoy</button><button class="btn ghost sm" data-step="1" aria-label="Siguiente">${icon('chevR')}</button>`;
  box.innerHTML = `<div class="card pagenda">
    <div class="pbar"><div class="seg">${[['semana', 'Semana'], ['dia', 'Día'], ['lista', 'Todo']].map(([k, l]) => `<button data-pv="${k}" class="${v === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="pnav">${navs}<b>${title}</b></div></div>
    <div class="chips pfilt"><button class="chip ${tf === 'all' ? 'on' : ''}" data-tf="all">Todos los temas</button>${topicsIn.map(x => `<button class="chip ${tf === x.id ? 'on' : ''}" data-tf="${x.id}">T${x.n} ${x.short}</button>`).join('')}<button class="chip ${tf === 'diario' ? 'on' : ''}" data-tf="diario">Inglés, psicos y repasos</button></div>
    ${body}
    <div class="plegend"><span><i class="lgd done"></i>hecho</span><span><i class="lgd today"></i>hoy</span><span><i class="lgd fut"></i>pendiente</span><span><i class="lgd miss"></i>no hecho (ya recolocado)</span><span class="muted">Toca un día para abrirlo en Hoy toca</span></div></div>`;
  const keepPV = () => localStorage.setItem('opo_planview', JSON.stringify(PV));
  $$('[data-pv]', box).forEach(b => b.onclick = () => { PV.v = b.dataset.pv; keepPV(); planDays(ctx); });
  $$('[data-tf]', box).forEach(b => b.onclick = () => { PV.t = b.dataset.tf; keepPV(); planDays(ctx); });
  $$('[data-step]', box).forEach(b => b.onclick = () => { const st = +b.dataset.step; PV.a = st === 0 ? t : addDays(anchor, st * (v === 'semana' ? 7 : 1)); if (PV.a < ctx.from) PV.a = ctx.from; if (PV.a > end) PV.a = end; keepPV(); planDays(ctx); });
}
routes['plan'] = () => {
  const t = ymd(); const st = P.stats(); const c = P.cfg();
  const from = c.start && c.start < t ? c.start : t; const end = P.examDate();
  const dates = []; for (let d = from; d <= end; d = addDays(d, 1)) dates.push(d);
  const cls = (it, d) => P.done(it.key) ? 'c-done' : d < t ? 'c-miss' : d === t ? 'c-today' : 'c-fut';
  const cache = {}; const itemsFor = d => cache[d] || (cache[d] = d === end ? [] : P.itemsFor(d));
  const strip = dates.map(d => { const its = itemsFor(d); const dn = its.filter(i => P.done(i.key)).length; const pc = its.length ? dn / its.length : 0;
    const c2 = d === end ? 'exam' : P.isOff(d) ? 'off' : !its.length ? 'none' : d < t ? (pc === 1 ? 'full' : pc > 0 ? 'part' : 'miss') : d === t ? 'today' : P.isFinal(d) ? 'final' : 'fut';
    return `<button class="hs ${c2}" data-day="${d}" title="${fmtDate(d)}: ${dn}/${its.length}"><span>${new Date(d + 'T12:00:00').getDate()}</span></button>`; }).join('');
  const rows = dates.map(d => { if (d === end) return ''; const its = itemsFor(d); if (!its.length && d < t) return '';
    if (P.isOff(d)) return `<tr class="orow"><th>${fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })}</th><td colspan="${PLAN_COLS.length}">Día libre</td></tr>`;
    const cells = PLAN_COLS.map(([k, tp]) => { const cc = its.filter(i => k === 'x' ? ['eng', 'psico', 'sim', 'fall', 'ciclo'].includes(i.k) : k === 'q' ? (i.k === 'q' || i.k === 'qp') && i.t === tp : i.k === k && i.t === tp); return `<td>${cc.map(i => `<span class="pc ${cls(i, d)}">${esc(k === 'q' ? (i.k === 'qp' ? i.ids.length + ' preg.' : 'nº ' + i.a + '–' + i.b) : k === 'x' ? itemLabel(i).replace('Repaso de temas anteriores', 'Repaso') : 'págs. ' + i.a + (i.b !== i.a ? '–' + i.b : ''))}</span>`).join('')}</td>`; }).join('');
    return `<tr class="${d === t ? 'trow' : ''}"><th><a href="#/hoy?f=${d}">${fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })}</a></th>${cells}</tr>`; }).join('');
  app(`${head('Seguimiento', 'Mi plan', 'Tu plan día a día: qué páginas estudiar y qué preguntas hacer cada día. Lo que no haces se recoloca y lo que adelantas te libera días.', `<div class="row"><button class="btn sec" id="restart">${icon('refresh')} Recalcular desde hoy</button><a class="btn" href="#/bienvenida?edit=1">${icon('gear')} Cambiar mi plan</a></div>`)}
  <div class="card">${examCountdown()}</div>
  ${planSummary(st, c)}
  <div class="bar ok" style="height:10px;margin:14px 0"><i style="width:${pct(st.done, st.total)}%"></i></div>
  <h2>Día a día</h2>
  <div id="pday"></div>
  <h2>Calendario</h2>
  <div class="card"><div class="hstrip">${strip}</div>
    <div class="legend" style="justify-content:flex-start;gap:14px;flex-wrap:wrap;margin-top:10px"><span><i class="lg full"></i>hecho</span><span><i class="lg part"></i>a medias</span><span><i class="lg miss"></i>no hecho (recolocado)</span><span><i class="lg today"></i>hoy</span><span><i class="lg fut"></i>pendiente</span><span><i class="lg final"></i>repaso final</span><span><i class="lg off"></i>libre</span><span><i class="lg exam"></i>examen</span></div></div>`);
  bindExamDate();
  const ctx = { t, end, from, dates, itemsFor }; planDays(ctx);
  $$('[data-day]').forEach(b => b.onclick = () => { PV.v = 'dia'; PV.a = b.dataset.day; localStorage.setItem('opo_planview', JSON.stringify(PV)); planDays(ctx); $('#pday').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  const rs = $('#restart'); if (rs) rs.onclick = () => { P.restartToday(); toast('Plan recalculado: hoy es tu día 0'); render(); };
};

/* ---------- Bienvenida y configuración del plan ---------- */
let WZ = null;
routes['bienvenida'] = (args, q) => {
  const edit = !!q.edit && S.plan?.cfg;
  if (!WZ || WZ.edit !== !!edit) WZ = { step: edit ? 1 : 0, edit: !!edit, c: P.cfg() };
  const c = WZ.c; const N = 6;
  const chip = (name, val, label, multi) => `<button class="chip ${multi ? ((c[name] || []).includes(val) ? 'on' : '') : (String(c[name]) === String(val) ? 'on' : '')}" data-n="${name}" data-v="${val}" data-m="${multi ? 1 : 0}">${label}</button>`;
  const hm = m => m >= 60 ? (m % 60 ? `${Math.floor(m / 60)} h ${m % 60}` : `${m / 60} h`) : m ? `${m} min` : 'Libre';
  const preview = () => {
    S.plan = S.plan || {}; const old = S.plan.cfg, oldPs = S.ps; S.ps = {}; P._preview = true;
    S.plan.cfg = Object.assign({}, c, { examDate: c.known == 0 ? '' : c.examDate, start: WZ.edit ? (old?.start || ymd()) : ymd() }); P._sig = '';
    const st = P.stats(); st.exam = P.examDate();
    S.plan.cfg = old; S.ps = oldPs; P._preview = false; P._sig = '';
    return st;
  };
  const steps = [
    () => `<div class="eyebrow">Bienvenido a Opo ATC</div><h1>Así vas a preparar la oposición</h1><p class="muted">Te hacemos 5 preguntas rápidas y creamos tu plan día a día. Puedes cambiarlo cuando quieras.</p>
      <div class="how">${[['cal', 'Un plan que se recalcula solo', 'Cada día ves qué toca: páginas del resumen y, después, las preguntas de esas páginas. Si un día no llegas, lo pendiente se recoloca; si adelantas, te libera días.'],
        ['repeat', 'Repaso 1 · 3 · 7', 'Lo que estudias hoy se te vuelve a preguntar mañana, a los 3 días y a los 7, para que se quede.'],
        ['x', 'Las falladas vuelven', 'Cada pregunta que fallas vuelve a salir hasta que la aciertes dos veces seguidas.'],
        ['exam', 'Exámenes reales', 'Exámenes oficiales de ENAIRE y simulacros con el formato real: 50 preguntas y −0,33 por fallo.'],
        ['globe', 'Inglés y psicotécnicos', 'Según tu plan, cada día una dosis de inglés (con la regla explicada) y de psicotécnicos.'],
        ['refresh', 'Móvil y PC', 'Todo se guarda en tu cuenta y se sincroniza entre dispositivos.']].map(([i, t, d]) => `<div class="howi"><div class="ico">${icon(i)}</div><div><b>${t}</b><p>${d}</p></div></div>`).join('')}</div>`,
    () => `<div class="eyebrow">1 de 5 · Fecha</div><h1>¿Cuándo es tu examen?</h1><p class="muted">La prueba de conocimientos de la Fase I.</p>
      <div class="chips">${chip('known', 1, 'Sé la fecha')}${chip('known', 0, 'Aún no la sé')}</div>
      ${c.known == 0 ? `<label>¿Cuántas semanas quieres prepararte?</label><div class="chips">${[4, 6, 8, 10, 12, 16, 20, 26].map(w => chip('weeks', w, w + ' semanas')).join('')}</div>` : `<label>Fecha del examen</label><input type="date" id="wexd" value="${esc(c.examDate)}" min="${ymd()}">`}`,
    () => `<div class="eyebrow">2 de 5 · Tiempo</div><h1>¿Cuánto tiempo tienes para el temario?</h1><p class="muted">Como referencia, en 1 hora se estudian unas 8 páginas de resumen con sus preguntas. Después medimos lo que tardas tú y el plan se ajusta solo.</p>
      ${has('ingles') || has('psico') ? `<div class="upd" style="margin-top:4px">${icon('check')} ${[has('ingles') ? 'Inglés 20 min' : '', has('psico') ? 'psicotécnicos 20 min' : ''].filter(Boolean).join(' + ')} al día van aparte</div>` : ''}
      <label>De lunes a viernes</label><div class="chips">${[30, 45, 60, 90, 120, 180, 240].map(m => chip('minWeek', m, hm(m))).join('')}</div>
      <label>Sábados y domingos</label><div class="chips">${[0, 30, 45, 60, 90, 120, 180, 240].map(m => chip('minWeekend', m, hm(m))).join('')}</div>`,
    () => `<div class="eyebrow">3 de 5 · Descanso</div><h1>Tus días libres</h1><p class="muted">Esos días no te pondremos temario.</p>
      <label>Días libres cada semana</label><div class="chips">${[1, 2, 3, 4, 5, 6, 0].map(d => chip('off', d, ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d], true)).join('')}</div>
      <label>Además, un día extra de descanso…</label><div class="chips">${chip('restEvery', 0, 'Nunca')}${chip('restEvery', 2, 'Cada 2 semanas')}${chip('restEvery', 3, 'Cada 3 semanas')}${chip('restEvery', 4, 'Cada 4 semanas')}</div>
      <label>Días de repaso final antes del examen (simulacros y falladas)</label><div class="chips">${[0, 3, 5, 7, 10, 14].map(d => chip('finalDays', d, d ? d + ' días' : 'Ninguno')).join('')}</div>`,
    () => `<div class="eyebrow">4 de 5 · Si te sobra tiempo</div><h1>¿Qué hacemos con los días que sobren?</h1><p class="muted">Si con tu tiempo terminas el temario antes del examen, elige cómo usarlo.</p>
      <div class="chips">${chip('spare', 'repaso', 'Terminar antes y dedicar lo que sobre a repasar')}${chip('spare', 'repartir', 'Repartirlo: menos temario cada día')}</div>
      <label class="chk" style="margin-top:16px"><span class="switch"><input type="checkbox" id="went" ${c.entorno ? 'checked' : ''}><i></i></span> Incluir el tema 7 (Entorno profesional)</label>`,
    () => { const st = preview(); return `<div class="eyebrow">5 de 5 · Tu plan</div><h1>Tu plan está listo</h1>
      <p class="small muted">Calculado con el ${Pace.label()}.</p><div class="sumbox"><div><b>${st.hoursLeft} h</b><span>de temario</span></div><div><b>${st.daysLeft}</b><span>días de estudio</span></div><div><b>${st.ok ? fmtDate(st.finish, { day: 'numeric', month: 'short' }) : '—'}</b><span>terminas el temario</span></div><div><b>${fmtDate(st.exam)}</b><span>examen</span></div></div>
      ${st.ok ? `<p class="okmsg">${icon('check')}<span>Te da tiempo de sobra: terminas el temario el <b>${fmtDate(st.finish, { day: 'numeric', month: 'long' })}</b>${st.spare ? ` y <b>te sobran ${st.spare} días</b> que usaremos para ${c.spare === 'repartir' ? 'ir más desahogado' : 'repasar'}` : ''}, además de los días de repaso final.</span></p>` : `<div class="warnbox">${icon('alert')}<div>Con este tiempo no llegas a todo: necesitas unas ${st.hoursLeft} h de temario y tienes ${st.capHours} h. Sube el tiempo diario o crea el plan igualmente (los días irán más cargados).</div></div>`}`; },
  ];
  if (c.known == null) c.known = c.examDate ? 1 : 0;
  app(`<div class="wizard"><div class="wbar"><i style="width:${pct(WZ.step, N - 1)}%"></i></div><div class="card wcard">${steps[WZ.step]()}
    <div class="row wnav">${WZ.step > (WZ.edit ? 1 : 0) ? `<button class="btn ghost" id="wb">${icon('chevL')} Atrás</button>` : WZ.edit ? `<a class="btn ghost" href="#/plan">Cancelar</a>` : ''}<span class="spacer"></span>
    ${WZ.step < N - 1 ? `<button class="btn" id="wn">${WZ.step === 0 ? 'Empezar' : 'Siguiente'} ${icon('chevR')}</button>` : `<button class="btn" id="wsave">${icon('check')} ${WZ.edit ? 'Guardar y recalcular desde hoy' : 'Crear mi plan'}</button>`}</div><div class="err" id="werr"></div></div></div>`);
  $$('.chip[data-n]').forEach(b => b.onclick = () => { const n = b.dataset.n, v = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v;
    if (b.dataset.m === '1') { const arr = new Set(c[n] || []); arr.has(v) ? arr.delete(v) : arr.add(v); c[n] = [...arr]; } else c[n] = v; render(); });
  const ex = $('#wexd'); if (ex) ex.onchange = ex.onblur = () => { if (/^\d{4}-\d{2}-\d{2}$/.test(ex.value)) c.examDate = ex.value; };
  const we = $('#went'); if (we) we.onchange = () => { c.entorno = we.checked; };
  const back = $('#wb'); if (back) back.onclick = () => { WZ.step--; render(); };
  const nx = $('#wn'); if (nx) nx.onclick = () => {
    if (WZ.step === 1) { if (ex && /^\d{4}-\d{2}-\d{2}$/.test(ex.value)) c.examDate = ex.value; if (c.known == 1 && !(c.examDate > ymd())) { $('#werr').textContent = 'Elige una fecha futura o marca «Aún no la sé»'; return; } if (c.known == 0) c.examDate = ''; }
    if (WZ.step === 3 && (c.off || []).length >= 7) { $('#werr').textContent = 'Deja al menos un día de estudio'; return; }
    WZ.step++; render(); };
  const sv = $('#wsave'); if (sv) sv.onclick = () => {
    c.start = ymd(); if (c.known == 0) c.examDate = '';
    S.plan = { cfg: c, u: now() }; S.settings.examDate = c.examDate || addDays(c.start, c.weeks * 7);
    const t = ymd(); if (S.ps) delete S.ps[t];
    P._sig = ''; save(true); WZ = null; toast(edit ? 'Plan recalculado desde hoy' : '¡Tu plan está listo!'); location.hash = '#/hoy';
  };
};

/* ---------- Resúmenes ---------- */
/* ---------- Subrayados y notas en los resúmenes ---------- */
const HL_COLORS = [['y', 'Amarillo'], ['g', 'Verde'], ['b', 'Azul'], ['p', 'Rosa']];
const Hl = {
  live: () => Object.entries(S.hl || {}).filter(([, h]) => !h.del),
  texts(root) { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const out = []; let n; while ((n = w.nextNode())) out.push(n); return out; },
  offset(root, node, off) { const pre = document.createRange(); pre.setStart(root, 0); pre.setEnd(node, off); return pre.toString().length; },
  wrap(root, start, end, id, c, note) {
    let pos = 0;
    for (const tn of Hl.texts(root)) {
      const len = tn.nodeValue.length, a = Math.max(start, pos), b = Math.min(end, pos + len);
      if (a < b) {
        let mid = tn; if (a > pos) mid = tn.splitText(a - pos); if (b < pos + len) mid.splitText(b - a);
        const m = document.createElement('mark'); m.className = 'uh c-' + c + (note ? ' has-note' : ''); m.dataset.h = id; mid.parentNode.insertBefore(m, mid); m.appendChild(mid);
      }
      pos += len; if (pos >= end) break;
    }
  },
  paint(root) {
    const key = root.dataset.hp; root.querySelectorAll('mark.uh').forEach(m => { const p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize(); });
    Hl.live().filter(([, h]) => h.k === key).sort((x, y) => x[1].s - y[1].s).forEach(([id, h]) => Hl.wrap(root, h.s, h.e, id, h.c, h.n));
    const aside = $(`.notes[data-np="${key}"]`); if (!aside) return;
    const notes = Hl.live().filter(([, h]) => h.k === key && h.n);
    const wrap = aside.parentNode; const wr = wrap.getBoundingClientRect();
    aside.innerHTML = notes.map(([id, h]) => { const mk = root.querySelector(`mark.uh[data-h="${id}"]`); if (!mk) return ''; const top = mk.getBoundingClientRect().top - wr.top;
      return `<button class="nicon c-${h.c}" data-nid="${id}" style="top:${Math.round(top)}px" aria-label="Ver nota">${icon('marker')}<span class="nbub"><span class="nq">${esc(h.q.length > 60 ? h.q.slice(0, 60) + '…' : h.q)}</span><span class="nt">${esc(h.n).replace(/\n/g, '<br>')}</span><span class="nh">Toca para editar</span></span></button>`; }).join('');
    wrap.classList.toggle('has-notes', !!notes.length);
  },
  save(id, h) { S.hl[id] = Object.assign({}, S.hl[id], h, { u: now() }); save(); },
  menu: null,
  close() { if (Hl.menu) { Hl.menu.remove(); Hl.menu = null; } },
  open(x, y, html, bind) {
    Hl.close(); const m = document.createElement('div'); m.className = 'hlmenu'; m.innerHTML = html; document.body.appendChild(m);
    const r = m.getBoundingClientRect(); m.style.left = Math.max(8, Math.min(innerWidth - r.width - 8, x - r.width / 2)) + 'px'; m.style.top = Math.max(8, y - r.height - 10) + 'px';
    Hl.menu = m; Hl.menuY = scrollY; m.addEventListener('mousedown', e => { if (!e.target.closest('textarea')) e.preventDefault(); }); bind(m);
  },
  noteBox(id) {
    const h = S.hl[id]; const mk = $(`mark.uh[data-h="${id}"]`); if (!mk) return; const r = mk.getBoundingClientRect();
    Hl.open(r.left + r.width / 2, r.top, `<div class="hlnote"><div class="tiny">Nota sobre «${esc(h.q.length > 40 ? h.q.slice(0, 40) + '…' : h.q)}»</div><textarea rows="3" placeholder="Escribe tu nota…">${esc(h.n || '')}</textarea><div class="row" style="margin-top:6px"><button class="btn sm" data-a="ok">Guardar</button>${h.n ? '<button class="btn ghost sm" data-a="del">Borrar nota</button>' : ''}<span class="spacer"></span><button class="btn ghost sm" data-a="x">Cancelar</button></div></div>`, m => {
      const ta = m.querySelector('textarea'); ta.focus();
      m.querySelector('[data-a="ok"]').onclick = () => { Hl.save(id, { n: ta.value.trim() }); Hl.close(); Hl.repaint(); };
      const d = m.querySelector('[data-a="del"]'); if (d) d.onclick = () => { Hl.save(id, { n: '' }); Hl.close(); Hl.repaint(); };
      m.querySelector('[data-a="x"]').onclick = () => Hl.close();
    });
  },
  colors: (cur) => HL_COLORS.map(([c, l]) => `<button class="sw c-${c}${cur === c ? ' on' : ''}" data-c="${c}" title="${l}" aria-label="Subrayar en ${l.toLowerCase()}"></button>`).join(''),
  repaint() { $$('.hlable').forEach(Hl.paint); },
  mount() {
    Hl.repaint(); $$('.hlable img').forEach(im => { if (!im.complete) im.addEventListener('load', () => Hl.repaint(), { once: true }); });
    const onSel = () => {
      const sel = getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return;
      const rg = sel.getRangeAt(0); const root = (rg.commonAncestorContainer.nodeType === 1 ? rg.commonAncestorContainer : rg.commonAncestorContainer.parentNode).closest('.hlable'); if (!root) return;
      let s0 = Hl.offset(root, rg.startContainer, rg.startOffset), e0 = Hl.offset(root, rg.endContainer, rg.endOffset);
      const full = root.textContent, W = /[\p{L}\p{N}]/u;  // se amplía a palabras completas
      while (s0 > 0 && W.test(full[s0 - 1] || '') && W.test(full[s0] || '')) s0--;
      while (e0 < full.length && W.test(full[e0] || '') && W.test(full[e0 - 1] || '')) e0++;
      while (s0 < e0 && /\s/.test(full[s0])) s0++; while (e0 > s0 && /\s/.test(full[e0 - 1])) e0--;
      const txt = full.slice(s0, e0).trim();
      if (e0 - s0 < 2 || !txt) return; const r = rg.getBoundingClientRect();
      Hl.open(r.left + r.width / 2, r.top, `<div class="hlbar">${Hl.colors()}<span class="sep"></span><button class="ib" data-a="note" title="Subrayar y añadir nota">${icon('marker')}<span>Nota</span></button></div>`, m => {
        const add = c => { const id = 'h' + now().toString(36) + Math.random().toString(36).slice(2, 6); Hl.save(id, { k: root.dataset.hp, s: s0, e: e0, c, q: txt.replace(/\s+/g, ' ') }); getSelection().removeAllRanges(); Hl.close(); Hl.paint(root); return id; };
        m.querySelectorAll('[data-c]').forEach(b => b.onclick = () => add(b.dataset.c));
        m.querySelector('[data-a="note"]').onclick = () => { const id = add('y'); Hl.noteBox(id); };
      });
    };
    const app_ = $('#app');
    app_.onmouseup = () => setTimeout(onSel, 10);
    app_.onmouseover = e => { const nt = e.target.closest('.nicon'); $$('mark.uh.flash2').forEach(m => m.classList.remove('flash2')); if (nt) $$(`mark.uh[data-h="${nt.dataset.nid}"]`).forEach(m => m.classList.add('flash2')); };
    app_.ontouchend = () => setTimeout(onSel, 250);
    app_.onclick = e => {
      const nt = e.target.closest('.nicon'); if (nt) { const id = nt.dataset.nid; if (matchMedia('(hover: none)').matches && !nt.classList.contains('open')) { $$('.nicon.open').forEach(x => x.classList.remove('open')); nt.classList.add('open'); return; } const mk = $(`mark.uh[data-h="${id}"]`); if (mk) { mk.classList.add('flash'); setTimeout(() => mk.classList.remove('flash'), 1200); } Hl.noteBox(id); return; }
      $$('.nicon.open').forEach(x => x.classList.remove('open'));
      const mk = e.target.closest('mark.uh'); if (!mk || !getSelection().isCollapsed) return;
      const id = mk.dataset.h, h = S.hl[id]; const r = mk.getBoundingClientRect();
      Hl.open(r.left + r.width / 2, r.top, `<div class="hlbar">${Hl.colors(h.c)}<span class="sep"></span><button class="ib" data-a="note">${icon('marker')}<span>${h.n ? 'Editar nota' : 'Nota'}</span></button><button class="ib" data-a="del" title="Quitar subrayado">${icon('x')}</button></div>`, m => {
        m.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { Hl.save(id, { c: b.dataset.c }); Hl.close(); Hl.repaint(); });
        m.querySelector('[data-a="note"]').onclick = () => Hl.noteBox(id);
        m.querySelector('[data-a="del"]').onclick = () => { Hl.save(id, { del: 1 }); Hl.close(); Hl.repaint(); };
      });
    };
    if (!Hl._doc) { Hl._doc = true; let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if ($('.hlable')) Hl.repaint(); }, 150); }); document.addEventListener('mousedown', e => { if (Hl.menu && !Hl.menu.contains(e.target)) Hl.close(); }); window.addEventListener('hashchange', () => Hl.close()); window.addEventListener('scroll', () => { if (Hl.menu && !Hl.menu.querySelector('textarea') && Math.abs(scrollY - (Hl.menuY || 0)) > 120) Hl.close(); }, { passive: true }); }
  },
};
routes['resumenes'] = (args, q) => {
  const [t, p] = args;
  if (!t) {
    const list = TOPICS.map(x => x.id).filter(id => pagesOf(id).length);
    app(`${head('Estudiar', 'Estudiar', 'Resúmenes de cada tema, verificados y revisados por expertos en la oposición y actualizados al temario 2026: todo lo que necesitas para el examen, sin descargar nada. Al marcar páginas como estudiadas, sus preguntas entran en el repaso a 1, 3 y 7 días.')}
    <div class="topics" style="margin-top:14px">${list.map(id => { const x = TOP[id], v = R.res[id]; const n = v.pages.length; const rd = v.pages.filter(pg => S.rd[id + ':' + pg.p]?.v).length;
      return `<a class="topic" href="#/resumenes/${id}" style="--tc:${x.c}33"><div class="n">TEMA ${x.n} · ${n} ${v.bysec ? 'secciones' : 'páginas'}</div><div class="nm">${x.name}</div><div class="small muted">${esc(v.src)}</div><div class="bar"><i style="width:${pct(rd, n)}%;background:${x.c}"></i></div><div class="small muted">${rd}/${n} estudiadas</div></a>`; }).join('')}</div>`);
    return;
  }
  const v = R.res[t]; if (!v) return app('<div class="card empty">Resumen no disponible</div>');
  const x = TOP[t];
  if (!p) {
    app(`${head('Tema ' + x.n, esc(x.name), esc(v.src))}<div class="card">${v.pages.map(pg => { const rd = S.rd[t + ':' + pg.p]?.v; const title = (pg.h.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/) || [])[1] || ''; return `<a class="li" href="#/resumenes/${t}/${pg.p}" style="display:flex;gap:12px;align-items:center;padding:12px 4px;border-bottom:1px solid var(--line);color:inherit"><span class="mono" style="width:44px;color:${x.c}">${v.bysec ? '§' : 'p.'}${pg.p}</span><span style="flex:1">${title.replace(/<[^>]+>/g, '') || '<span class="muted">Página ' + pg.p + '</span>'}</span>${rd ? `<span class="pill ok">${icon('check')} estudiada</span>` : ''}${icon('chevR', 'chev')}</a>`; }).join('')}</div>`);
    return;
  }
  const a = +p, b = Math.max(a, +(q.to || p)); const pages = v.pages.filter(pg => pg.p >= a && pg.p <= b);
  const last = v.pages[v.pages.length - 1].p; const nq = qForPages(t, a, b);
  const allRead = pages.every(pg => S.rd[t + ':' + pg.p]?.v);
  if (!allRead && (!READ || READ.key !== t + a + '-' + b)) READ = { key: t + a + '-' + b, from: now(), acc: 0 };
  app(`<div class="qtop"><a class="btn ghost sm" href="${q.task ? '#/hoy' : '#/resumenes/' + t}">${icon('chevL')}</a><span class="small muted" style="flex:1">${esc(x.name)} · ${v.bysec ? 'sección' : 'pág.'} ${a}${b !== a ? '–' + b : ''} de ${last}</span>${v.exact ? '' : '<span class="pill">aprox.</span>'}</div>
  ${pages.map(pg => `<div class="card"><div class="pagehead"><span class="pill" style="color:${x.c}">${v.bysec ? 'Sección' : 'Página'} ${pg.p}</span>${S.rd[t + ':' + pg.p]?.v ? `<span class="pill ok">${icon('check')} estudiada</span>` : ''}<span class="spacer"></span></div>
    <div class="rdwrap"><div class="prose hlable" data-hp="${t}:${pg.p}">${pg.h}</div><aside class="notes" data-np="${t}:${pg.p}"></aside></div></div>`).join('')}
  <div class="card flat row">${nq.length ? `<span class="small muted">${nq.length} preguntas del cuestionario salen de ${b !== a ? 'estas páginas' : 'esta página'}</span>` : ''}<span class="spacer"></span>
    ${nq.length ? `<button class="btn sec sm" id="prac" title="Marca estas páginas como estudiadas y practica sus preguntas">${icon('play')} Estudiado: practicar sus preguntas</button>` : ''}<button class="btn sm" id="markRead" ${allRead && !q.task ? 'disabled' : ''}>${icon('check')} ${allRead ? 'Estudiado' : 'Marcar como estudiado'}</button></div>
  <div class="row" style="justify-content:space-between;margin-top:8px">${a > 1 ? `<a class="btn ghost" href="#/resumenes/${t}/${a - 1}">${icon('chevL')} Anterior</a>` : '<span></span>'}${b < last ? `<a class="btn ghost" href="#/resumenes/${t}/${b + 1}">Siguiente ${icon('chevR')}</a>` : ''}</div>`);
  const studied = () => { if (READ && READ.key === t + a + '-' + b) { Pace.addRead(b - a + 1, readActive() / 60000); READ = null; } const ids = allRead ? [] : markRead(t, a, b); if (q.task) P.setDone(q.task, true); return ids; };
  const pr = $('#prac'); if (pr) pr.onclick = () => { studied(); startQuiz({ title: `${x.short} · ${b !== a ? `págs. ${a}–${b}` : `pág. ${a}`}`, list: nq, studyTopic: t, back: q.task ? '#/hoy' : location.hash }); };
  $('#markRead').onclick = () => { const ids = studied(); toast(ids.length ? `Hecho · ${ids.length} preguntas al repaso 1·3·7` : 'Marcado como estudiado'); if (q.task) location.hash = '#/hoy'; else render(); };
  Hl.mount();
};

/* ---------- Memorizar ---------- */
routes['memorizar'] = (args, q) => {
  const i = args[0] != null ? +args[0] : null; const mode = q.m || 'leer';
  const fails = (R.docFails || []).filter(id => Q[id]);
  if (i == null) {
    const byT = {}; fails.forEach(id => { const t = Q[id].t; (byT[t] = byT[t] || []).push(id); });
    app(`${head('Estudiar', 'Memorizar', 'Los datos clave que tienes que saber de memoria para el examen. Usa el modo huecos para ponerte a prueba.')}
    ${ME.admin && fails.length ? `<div class="card hl"><div class="row"><div class="list" style="flex:1"><div class="li" style="border:0;padding:0"><div class="ico c-ko">${icon('x')}</div><div><div class="t">Preguntas falladas guardadas</div><div class="d">${fails.length} preguntas · solo visible para el administrador</div></div></div></div><button class="btn" id="allF">${icon('play')} Practicar</button></div>
    <div class="chips" style="margin-top:12px">${Object.entries(byT).map(([t, l]) => `<button class="chip" data-ft="${t}">${esc(TOP[t]?.short)} · ${l.length}</button>`).join('')}</div></div>` : ''}
    <h2>Datos para memorizar</h2>
    <div class="topics">${R.mem.map((m, k) => { const x = TOP[m.t] || {}; const n = (m.h.match(/<strong>/g) || []).length; return `<a class="topic" href="#/memorizar/${k}" style="--tc:${x.c || '#22d3ee'}33"><div class="n">${x.n ? 'TEMA ' + x.n : ''}</div><div class="nm">${esc(x.name || m.title)}</div><div class="small muted">${n} datos clave</div><div class="row" style="margin-top:10px"><span class="pill">${icon('book')} Leer</span><span class="pill cyan">${icon('eye')} Huecos</span><span class="pill violet">${icon('cards')} Tarjetas</span></div></a>`; }).join('')}</div>`);
    const af = $('#allF'); if (af) af.onclick = () => startQuiz({ title: 'Falladas guardadas', list: shuffle(fails), back: '#/memorizar' });
    $$('[data-ft]').forEach(b => b.onclick = () => startQuiz({ title: 'Falladas · ' + TOP[b.dataset.ft].short, list: shuffle(byT[b.dataset.ft]), back: '#/memorizar' }));
    return;
  }
  const m = R.mem[i]; if (!m) return render();
  const x = TOP[m.t] || {};
  const tabs = `<div class="seg">${[['leer', 'Leer'], ['huecos', 'Huecos'], ['tarjetas', 'Tarjetas']].map(([k, l]) => `<button class="${mode === k ? 'on' : ''}" data-m="${k}">${l}</button>`).join('')}</div>`;
  if (mode === 'tarjetas') {
    const tmp = document.createElement('div'); tmp.innerHTML = m.h;
    // Tarjetas: cada frase con datos en negrita, con su título de sección como contexto.
    // Las líneas que son todo negrita (p. ej. «Aire seco:») son títulos, no tarjetas.
    const cards = []; let ctx = '';
    $$('h1, h2, h3, h4, p, li', tmp).forEach(el => {
      if (/^H\d$/.test(el.tagName)) { ctx = el.textContent.trim(); return; }
      if (el.querySelector('p, li') || !el.querySelector('strong')) return;
      const txt = el.textContent.trim(); if (!txt) return;
      const plain = Array.from(el.childNodes).filter(n => !(n.nodeType === 1 && n.tagName === 'STRONG')).map(n => n.textContent).join('');
      if (plain.replace(/[\s:.,;()\-–]/g, '').length < 3) { ctx = txt.replace(/:\s*$/, ''); return; }
      cards.push({ ctx, html: el.innerHTML });
    });
    let ci = +(q.c || 0) % Math.max(1, cards.length);
    app(`<div class="qtop"><a class="btn ghost sm" href="#/memorizar">${icon('chevL')}</a><span class="small muted" style="flex:1">${esc(x.name || m.title)}</span>${tabs}</div>
      <div class="bar"><i style="width:${pct(ci + 1, cards.length)}%"></i></div><div class="small muted mono">${ci + 1}/${cards.length}</div>
      <div class="card hl">${cards[ci]?.ctx ? `<div class="fctx">${esc(cards[ci].ctx)}</div>` : ''}<div class="flash prose cloze" id="fc"><div>${cards[ci]?.html || 'Sin tarjetas'}</div></div></div>
      <div class="qactions"><button class="btn sec" id="rev">${icon('eye')} Mostrar</button><button class="btn block" id="nx">Siguiente ${icon('chevR')}</button></div>
      <div class="kbd">Toca cada hueco para destaparlo.</div>`);
    $$('#fc strong').forEach(s => s.onclick = () => s.classList.add('rev'));
    $('#rev').onclick = () => $$('#fc strong').forEach(s => s.classList.add('rev'));
    $('#nx').onclick = () => { location.hash = `#/memorizar/${i}?m=tarjetas&c=${ci + 1}`; };
  } else {
    app(`<div class="qtop"><a class="btn ghost sm" href="#/memorizar">${icon('chevL')}</a><span class="small muted" style="flex:1">${esc(x.name || m.title)}</span>${tabs}</div>
      ${mode === 'huecos' ? `<div class="row" style="margin:6px 0"><span class="small muted">Toca un hueco para verlo.</span><span class="spacer"></span><button class="btn ghost sm" id="revAll">Destapar todo</button><button class="btn ghost sm" id="hideAll">Tapar todo</button></div>` : ''}
      <div class="card"><div class="prose ${mode === 'huecos' ? 'cloze' : ''}" id="mem">${m.h}</div></div>`);
    if (mode === 'huecos') {
      $$('#mem strong').forEach(s => s.onclick = () => s.classList.toggle('rev'));
      $('#revAll').onclick = () => $$('#mem strong').forEach(s => s.classList.add('rev'));
      $('#hideAll').onclick = () => $$('#mem strong').forEach(s => s.classList.remove('rev'));
    }
  }
  $$('[data-m]').forEach(b => b.onclick = () => { location.hash = `#/memorizar/${i}?m=${b.dataset.m}`; });
};

/* ---------- Temario oficial (lo esencial) ---------- */
routes['temario'] = (args, q) => {
  // Buscador de referencias en el temario oficial (no se muestra el temario por páginas)
  const base = ch => ch.normalize('NFD')[0].toLowerCase();
  const fold = t => Array.from(t, base).join('');
  const topics = Object.keys(D.tem).sort((a, b) => a - b);
  const idx = []; topics.forEach(n => D.tem[n].pages.forEach(([pg, txt]) => txt.split(/\s+·\s+/).forEach(f => { f = f.trim(); if (f.length > 2) idx.push({ n, pg, f, k: fold(f) }); })));
  const tname2 = n => { const t = TOPICS.find(x => String(x.n) === String(n)); return t ? t.name : D.tem[n].name; };
  const mark = (f, words) => { const k = fold(f); const hits = []; words.forEach(w => { let i = k.indexOf(w); while (i >= 0) { hits.push([i, i + w.length]); i = k.indexOf(w, i + w.length); } });
    hits.sort((x, y) => x[0] - y[0]); let out = '', last = 0; const chars = Array.from(f);
    hits.forEach(([i, j]) => { if (i < last) return; out += esc(chars.slice(last, i).join('')) + '<mark>' + esc(chars.slice(i, j).join('')) + '</mark>'; last = j; });
    return out + esc(chars.slice(last).join('')); };
  const sel = q.t || '';
  app(`${head('Practicar', 'Temario oficial', 'Busca cualquier término y te decimos en qué tema y página del temario oficial aparece. Útil para comprobar de dónde sale una pregunta o encontrar una referencia.')}
  <div class="card temsearch"><div class="search big">${icon('search')}<input id="f" placeholder="Busca un término: tropopausa, VOR, RVSM, Eurocontrol…" value="${esc(q.q || '')}" autocomplete="off" enterkeyhint="search"></div>
    <div class="chips" style="margin-top:12px"><button class="chip ${!sel ? 'on' : ''}" data-tt="">Todos los temas</button>${topics.map(n => { const t = TOPICS.find(x => String(x.n) === n); return `<button class="chip ${sel === n ? 'on' : ''}" data-tt="${n}">T${n} ${t ? t.short : ''}</button>`; }).join('')}</div></div>
  <div id="res"></div>`);
  const draw = () => {
    const raw = $('#f').value.trim(); const words = fold(raw).split(/\s+/).filter(w => w.length >= 2);
    const box = $('#res');
    if (args[1] && !raw) { // referencia directa desde una pregunta: tema y página concretos
      const list = idx.filter(x => x.n === String(args[0]) && String(x.pg) === String(args[1]));
      box.innerHTML = list.length ? `<div class="tiny" style="margin:6px 2px 10px">Referencia del temario oficial</div><article class="tref"><div class="trefh"><b>${esc(tname2(args[0]))}</b><span class="pill">pág. ${esc(args[1])}</span></div><ul>${list.map(x => `<li>${esc(x.f)}</li>`).join('')}</ul></article>` : '<div class="card empty">No hay texto para esa página.</div>';
      return;
    }
    if (!words.length) { box.innerHTML = `<div class="card empty">${icon('search')}<div>Escribe al menos 2 letras para buscar.</div><div class="chips" style="justify-content:center;margin-top:12px">${['tropopausa', 'VOR', 'RVSM', 'Eurocontrol', 'QNH', 'estela'].map(w => `<button class="chip" data-ex="${w}">${w}</button>`).join('')}</div></div>`;
      $$('[data-ex]').forEach(c => c.onclick = () => { $('#f').value = c.dataset.ex; draw(); }); return; }
    const hits = idx.filter(x => (!sel || x.n === sel) && words.every(w => x.k.includes(w)));
    const groups = new Map(); hits.forEach(x => { const g = x.n + ':' + x.pg; if (!groups.has(g)) groups.set(g, { n: x.n, pg: x.pg, fs: [] }); groups.get(g).fs.push(x.f); });
    const gs = [...groups.values()].sort((a, b) => a.n - b.n || a.pg - b.pg); const shown = gs.slice(0, 60);
    box.innerHTML = gs.length ? `<div class="tiny" style="margin:6px 2px 10px">${hits.length} coincidencia${hits.length === 1 ? '' : 's'} en ${gs.length} página${gs.length === 1 ? '' : 's'}${gs.length > shown.length ? ' · se muestran las 60 primeras' : ''}</div>
      ${shown.map(g => `<article class="tref"><div class="trefh"><b>${esc(tname2(g.n))}</b><span class="pill">pág. ${esc(g.pg)}</span></div><ul>${g.fs.slice(0, 6).map(f => `<li>${mark(f, words)}</li>`).join('')}</ul></article>`).join('')}`
      : `<div class="card empty">${icon('search')}<div>No aparece «${esc(raw)}»${sel ? ' en este tema' : ''} en el temario oficial.</div></div>`;
  };
  let t0; $('#f').oninput = () => { clearTimeout(t0); t0 = setTimeout(() => { history.replaceState(null, '', `#/temario?q=${encodeURIComponent($('#f').value.trim())}${sel ? '&t=' + sel : ''}`); args = []; draw(); }, 180); };
  $$('[data-tt]').forEach(c => c.onclick = () => { location.hash = `#/temario?q=${encodeURIComponent($('#f').value.trim())}${c.dataset.tt ? '&t=' + c.dataset.tt : ''}`; });
  draw(); if (!args[1]) $('#f').focus();
};



/* ---------- Hubs móviles ---------- */
const hub = (title, items) => app(`${head('', title)}<div class="card list">${items.map(([r, ic, t, d]) => `<a href="#/${r}"><div class="ico">${icon(ic)}</div><div style="flex:1"><div class="t">${t}</div><div class="d">${d}</div></div>${icon('chevR', 'chev')}</a>`).join('')}</div>`);
routes['practicar'] = () => hub('Practicar', [
  ['aleatorio', 'shuffle', 'Preguntas a boleo', 'Infinitas, priorizando lo importante y lo que fallas'],
  ['cuestionarios', 'layers', 'Cuestionarios por tema', 'En orden y por bloques, con % completado'],
  ['repaso', 'repeat', 'Repaso 1 · 3 · 7 días', `${dueReviews().length} pendientes hoy`],
  ['examenes', 'exam', 'Exámenes y simulacros', '10 exámenes oficiales + simulacros de 50'],
  ['temario', 'marker', 'Temario oficial', 'Buscador de referencias del temario'],
]);
routes['mas'] = () => {
  hub('Más', [
    ['resumenes', 'book', 'Estudiar', 'Resúmenes verificados de cada tema'],
    ['memorizar', 'brain', 'Memorizar', 'Datos clave en modo huecos y tarjetas'],
    ['ingles', 'globe', 'Inglés', 'Grammar y vocabulary + exámenes tipo examen'],
    ['psicotecnicos', 'brain', 'Psicotécnicos', 'Series, cálculo, atención y memoria'],
    ['temario', 'marker', 'Temario oficial', 'Buscador de referencias del temario'],
  ]);
};

/* ---------- A boleo ---------- */
routes['aleatorio'] = () => {
  const sel = new Set(JSON.parse(localStorage.getItem('rnd_sel') || 'null') || TOPICS.filter(t => t.id !== 'entorno').map(t => t.id));
  const draw = () => {
    const n = poolFor([...sel]).length;
    app(`${head('Practicar', 'Preguntas a boleo', 'Infinitas. Sale más lo prioritario (pesos en Ajustes), lo que menos has visto y lo que fallaste. Las falladas vuelven unas preguntas después y otra vez mañana.')}
    <div class="card"><div class="tiny">Temas</div><div class="chips" style="margin-top:10px">${TOPICS.map(t => `<button class="chip ${sel.has(t.id) ? 'on' : ''}" data-t="${t.id}">T${t.n} ${t.short}</button>`).join('')}</div>
    <div class="row" style="margin-top:10px"><button class="btn ghost sm" id="selPri">Solo prioritarios</button><button class="btn ghost sm" id="selAll">Todos</button></div>
    <label>Fuente</label><select id="pool"><option value="both">Cuestionarios + exámenes oficiales</option><option value="cuest">Solo cuestionarios</option><option value="exam">Solo exámenes oficiales</option></select>
    <div class="row" style="margin-top:18px"><span class="muted small"><b class="mono" style="color:var(--ink)">${n}</b> preguntas disponibles</span><span class="spacer"></span><button class="btn" id="go" ${n ? '' : 'disabled'}>${icon('play')} Empezar</button></div></div>`);
    $('#pool').value = S.settings.pool;
    const persist = () => localStorage.setItem('rnd_sel', JSON.stringify([...sel]));
    $$('.chip').forEach(c => c.onclick = () => { sel.has(c.dataset.t) ? sel.delete(c.dataset.t) : sel.add(c.dataset.t); persist(); draw(); });
    $('#selPri').onclick = () => { sel.clear(); ['meteo', 'nav', 'ffhh', 'carto', 'fpl'].forEach(t => sel.add(t)); persist(); draw(); };
    $('#selAll').onclick = () => { TOPICS.forEach(t => sel.add(t.id)); persist(); draw(); };
    $('#pool').onchange = e => { S.settings.pool = e.target.value; save(true); draw(); };
    $('#go').onclick = () => startQuiz({ title: 'A boleo', next: weightedNext([...sel]), back: '#/aleatorio' });
  };
  draw();
};

/* ---------- Cuestionarios ---------- */
const BLOCK = 20;
routes['cuestionarios'] = (args) => {
  const t = args[0];
  if (!t) {
    app(`${head('Practicar', 'Cuestionarios por tema', `Cada cuestionario en orden, por bloques de ${BLOCK}. Lo que hagas hoy vuelve a 1, 3 y 7 días.`)}
    <div class="topics" style="margin-top:14px">${TOPICS.filter(x => D.q.some(q => q.t === x.id)).map(x => { const s = topicStats(x.id); return `<a class="topic" href="#/cuestionarios/${x.id}" style="--tc:${x.c}33"><div class="row" style="align-items:center">${ring(pct(s.seen, s.scope), 54, 6)}<div style="flex:1"><div class="n">TEMA ${x.n}</div><div class="nm" style="margin:0">${x.name}</div><div class="small muted">${s.seen}/${s.scope} hechas · ${pct(s.ok, s.seen)}% acierto</div></div></div></a>`; }).join('')}</div>`);
    return;
  }
  const tp = TOP[t]; const all = D.q.filter(q => q.t === t); const qs = all;
  const blocks = []; for (let i = 0; i < qs.length; i += BLOCK) blocks.push(qs.slice(i, i + BLOCK));
  const s = topicStats(t); const nextB = blocks.findIndex(b => b.some(q => !rec(q.id).n));
  app(`${head('Tema ' + tp.n, tp.name, '')}
  <div class="card hl row" style="gap:18px">${ring(pct(s.seen, s.scope), 92, 9)}<div style="flex:1;min-width:200px"><div style="font-weight:700;font-size:17px">${pct(s.seen, s.scope)}% completado</div><div class="small muted">${s.seen}/${s.scope} preguntas · ${pct(s.ok, s.seen)}% acertadas la última vez</div></div>
    <div class="stack">${nextB >= 0 ? `<button class="btn" data-b="${nextB}">${icon('play')} Continuar · bloque ${nextB + 1}</button>` : '<span class="pill ok">Cuestionario completo</span>'}<button class="btn sec" id="failsT">Falladas del tema</button></div></div>
  <h2>Bloques</h2><div class="grid g4">${blocks.map((b, i) => { const seen = b.filter(q => rec(q.id).n).length, ok = b.filter(q => rec(q.id).last === 1).length; return `<button class="kpi" data-b="${i}" style="text-align:left;cursor:pointer;${seen === b.length ? 'border-color:rgba(52,211,153,.4)' : ''}"><div class="tiny">Bloque ${i + 1}</div><div style="font-weight:700;margin:4px 0">nº ${b[0].n}–${b[b.length - 1].n}</div><div class="bar ${seen === b.length ? 'ok' : ''}"><i style="width:${pct(seen, b.length)}%"></i></div><div class="s">${seen}/${b.length} · ${pct(ok, seen)}% ✓</div></button>`; }).join('')}</div>`);
  $$('[data-b]').forEach(b => b.onclick = () => startQuiz({ title: `${tp.short} · bloque ${+b.dataset.b + 1}`, list: blocks[+b.dataset.b].map(q => q.id), studyTopic: t, back: '#/cuestionarios/' + t }));
  $('#failsT').onclick = () => { const ids = pendingFails().filter(id => Q[id].t === t); if (!ids.length) return toast('No tienes falladas pendientes en este tema'); startQuiz({ title: 'Falladas · ' + tp.short, list: shuffle(ids), back: '#/cuestionarios/' + t }); };
};

/* ---------- Repaso 1·3·7 ---------- */
routes['repaso'] = () => {
  const dr = dueReviews(); const up = [];
  for (const e of S.study) for (const k of [1, 3, 7]) { if (e.done?.[k]) continue; const d = addDays(e.d, k); if (d > ymd()) up.push({ e, k, d }); break; }
  up.sort((a, b) => a.d.localeCompare(b.d));
  app(`${head('Practicar', 'Repaso 1 · 3 · 7 días', 'Lo que estudias un día (bloques de cuestionario nuevos, páginas de resumen o lo que apuntes en Planning) se te vuelve a preguntar al día siguiente, a los 3 días y a los 7.')}
  <h2>Para hoy · ${dr.length}</h2>
  ${dr.length ? dr.map((x, i) => `<div class="task">${tbadge(x.e.topic)}<div class="body"><div class="row"><span class="tt">${esc(tname(x.e.topic))}</span><span class="pill violet">día ${x.k}</span>${x.due < ymd() ? '<span class="pill ko">atrasado</span>' : ''}</div><div class="small muted">Estudiado el ${fmtDate(x.e.d)} · ${x.e.ids.length} preguntas${x.e.label ? ' · ' + esc(x.e.label) : ''}</div></div><button class="btn sm" data-r="${i}">${icon('play')} Repasar</button></div>`).join('') : `<div class="card empty">${icon('check')}<div>Nada pendiente hoy</div></div>`}
  <h2>Próximos</h2>
  ${up.length ? `<div class="card tblwrap"><table class="tbl"><tr><th>Fecha</th><th>Tema</th><th>Repaso</th><th>Preguntas</th></tr>${up.slice(0, 30).map(x => `<tr><td>${fmtDate(x.d)}</td><td>${esc(tname(x.e.topic))}</td><td>día ${x.k}</td><td class="mono">${x.e.ids.length}</td></tr>`).join('')}</table></div>` : '<p class="muted">Aún no hay nada programado.</p>'}`);
  $$('[data-r]').forEach(b => b.onclick = () => { const x = dr[+b.dataset.r]; startQuiz({ title: `Repaso día ${x.k} · ${tname(x.e.topic)}`, list: shuffle(x.e.ids), back: '#/repaso', onFinish: z => { if (z.i >= z.list.length) { x.e.done = Object.assign({}, x.e.done, { [x.k]: now() }); x.e.u = now(); save(); } } }); });
};

/* ---------- Falladas ---------- */
routes['falladas'] = () => {
  const ids = Object.entries(S.q).filter(([id, r]) => r.ko && Q[id]).map(([id]) => id); const pend = new Set(pendingFails());
  const groups = {}; ids.forEach(id => { const q = Q[id]; const g = q.kind === 'eng' ? 'eng' : q.t; (groups[g] = groups[g] || []).push(id); });
  app(`${head('Practicar', 'Falladas', 'Todo lo que has fallado en cualquier sección. Sigue pendiente hasta que lo aciertes 2 veces seguidas, y vuelve solo a las demás secciones al día siguiente.')}
  <div class="card hl row"><div><div class="v mono" style="font-size:30px;font-weight:800">${pend.size}</div><div class="small muted">pendientes · ${ids.length} falladas alguna vez</div></div><span class="spacer"></span><button class="btn" id="allP" ${pend.size ? '' : 'disabled'}>${icon('play')} Practicar pendientes</button></div>
  ${Object.entries(groups).map(([g, l]) => { const p = l.filter(i => pend.has(i)); return `<div class="card"><div class="row"><span style="width:10px;height:10px;border-radius:50%;background:${TOP[g]?.c || '#a78bfa'}"></span><b>${esc(tname(g))}</b><span class="spacer"></span><span class="small muted mono">${p.length}/${l.length}</span><button class="btn sec sm" data-g="${g}" ${p.length ? '' : 'disabled'}>Practicar</button><button class="btn ghost sm" data-s="${g}">Ver</button></div><div id="list-${g}"></div></div>`; }).join('') || `<div class="card empty">${icon('check')}<div>Todavía no has fallado nada.</div></div>`}
  <div class="card flat row"><span class="small muted">¿Quieres repasar tu lista de falladas del documento?</span><span class="spacer"></span><a class="btn ghost sm" href="#/memorizar">Ir a Memorizar</a></div>`);
  const ab = $('#allP'); if (ab) ab.onclick = () => startQuiz({ title: 'Falladas pendientes', list: shuffle([...pend]), back: '#/falladas' });
  $$('[data-g]').forEach(b => b.onclick = () => startQuiz({ title: 'Falladas · ' + tname(b.dataset.g), list: shuffle(groups[b.dataset.g].filter(i => pend.has(i))), back: '#/falladas' }));
  $$('[data-s]').forEach(b => b.onclick = () => {
    const el = $('#list-' + b.dataset.s);
    el.innerHTML = el.innerHTML ? '' : groups[b.dataset.s].sort((a, c) => S.q[c].ko - S.q[a].ko).map(id => { const q = materialize(Q[id]), r = S.q[id]; return `<div style="border-top:1px solid var(--line);padding:10px 0"><div class="small muted">${r.ko}✗ ${r.ok}✓ ${pend.has(id) ? '· <b class="c-ko">pendiente</b>' : ''}</div><div>${esc(q.q)}</div><div class="small c-ok">✓ ${L[q.a].toUpperCase()}) ${esc(q.o[q.a])}</div></div>`; }).join('');
  });
};

/* ---------- Exámenes y simulacros ---------- */
function realShares() {
  const r = D.ex.filter(x => ['2023a', '312', '2024'].includes(x.ex) && !x.res); const c = {};
  r.forEach(x => c[x.t] = (c[x.t] || 0) + 1); return Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v / r.length]));
}
function buildSim(mode, n = 50) {
  const shares = mode === 'real' ? realShares() : (() => { const w = S.settings.weights; const s = Object.values(w).reduce((a, b) => a + b, 0) || 1; return Object.fromEntries(Object.entries(w).map(([k, v]) => [k, v / s])); })();
  const ts = Object.keys(shares).filter(t => shares[t] > 0); const quota = Object.fromEntries(ts.map(t => [t, Math.round(shares[t] * n)]));
  let tot = Object.values(quota).reduce((a, b) => a + b, 0);
  while (tot > n) { const t = ts.slice().sort((a, b) => quota[b] - quota[a])[0]; quota[t]--; tot--; }
  while (tot < n) { const t = ts.slice().sort((a, b) => shares[b] - shares[a])[0]; quota[t]++; tot++; }
  const out = [];
  for (const t of ts) { const pool = shuffle(poolFor([t], { pool: 'both' })).sort((a, b) => rec(a.id).n - rec(b.id).n); pool.slice(0, quota[t]).forEach(q => out.push(q.id)); }
  return shuffle(out);
}
routes['examenes'] = () => {
  const sims = S.sims.slice().sort((a, b) => b.ts - a.ts); const st = S.settings;
  app(`${head('Practicar', 'Exámenes y simulacros', `Formato real de la Fase I: 50 preguntas, 4 opciones, −${st.penalty} por fallo, en blanco no resta. Se aprueba con 25 puntos.`)}
  <div class="card hl"><div class="row"><div style="flex:1;min-width:220px"><h3>Simulacro nuevo</h3><div class="small muted">50 preguntas · ${st.simMinutes} min · cuestionarios + exámenes oficiales</div></div>
    <button class="btn" id="simReal">${icon('play')} Proporción real 2023-25</button><button class="btn sec" id="simW">Mis prioridades</button></div></div>
  <h2>Exámenes oficiales</h2>
  <p class="small muted">Respuesta correcta tomada de la marca verde de cada PDF. Las de reserva solo salen en el modo práctica.</p>
  ${EXAMS.map(e => { const last = sims.find(s => s.kind === e.id); return `<div class="task"><div class="body"><div class="tt">${esc(e.label)}</div><div class="small muted">${e.qs.filter(id => !Q[id].res).length} preguntas${last ? ` · último: <b class="${last.net >= 25 ? 'c-ok' : 'c-ko'}">${(last.net ?? 0).toFixed(1)} pts</b> (${fmtDate(ymd(last.ts))})` : ''}</div></div><button class="btn sm" data-e="${e.id}">Examen</button><button class="btn ghost sm" data-p="${e.id}">Práctica</button></div>`; }).join('')}
  <h2>Historial</h2>
  ${sims.length ? `<div class="card tblwrap"><table class="tbl"><tr><th>Fecha</th><th>Tipo</th><th>Puntos</th><th>✓/✗/—</th></tr>${sims.slice(0, 40).map(s => `<tr><td>${fmtDate(ymd(s.ts))}</td><td>${esc(s.label)}</td><td class="mono ${s.pass ? 'c-ok' : 'c-ko'}"><b>${(s.net ?? s.score ?? 0).toFixed(1)}</b>/${s.max || 50}</td><td class="mono">${s.ok}/${s.ko}/${s.blank}</td></tr>`).join('')}</table></div>` : '<p class="muted">Aún no has hecho ninguno.</p>'}`);
  $('#simReal').onclick = () => startExam({ ids: buildSim('real'), label: 'Simulacro (proporción real)', kind: 'sim-real' });
  $('#simW').onclick = () => startExam({ ids: buildSim('weights'), label: 'Simulacro (mis prioridades)', kind: 'sim-w' });
  $$('[data-e]').forEach(b => b.onclick = () => { const e = EXAMS.find(x => x.id === b.dataset.e); startExam({ ids: e.qs.filter(id => !Q[id].res), label: e.label, kind: e.id }); });
  $$('[data-p]').forEach(b => b.onclick = () => { const e = EXAMS.find(x => x.id === b.dataset.p); startQuiz({ title: 'Práctica · ' + e.label, list: e.qs, back: '#/examenes' }); });
};
const mmss = ms => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function startExam({ ids, label, kind, minutes, penalty, pass, back }) {
  EXZ = { ids, label, kind, ans: {}, i: 0, start: now(), end: now() + (minutes || S.settings.simMinutes) * 60e3, done: false, penalty: penalty ?? S.settings.penalty, pass: pass ?? ids.length / 2, back: back || '#/examenes' };
  clearInterval(timerH); timerH = setInterval(() => { const el = $('#timer'); if (!EXZ || EXZ.done) return clearInterval(timerH); const left = EXZ.end - now(); if (left <= 0) { submitExam(); return; } if (el) { el.textContent = mmss(left); el.classList.toggle('low', left < 5 * 60e3); } }, 1000);
  renderExam();
}
function renderExam() {
  const z = EXZ; z.cache = z.cache || {}; const q = z.cache[z.ids[z.i]] || shuffleQ(materialize(Q[z.ids[z.i]])); z.cache[q.id] = q;
  const nAns = Object.keys(z.ans).length;
  app(`<div class="qtop"><span class="small muted" style="flex:1">${esc(z.label)} · <span class="mono">${z.i + 1}/${z.ids.length}</span></span><span class="timer" id="timer">${mmss(z.end - now())}</span></div>
  <div class="bar"><i style="width:${pct(nAns, z.ids.length)}%"></i></div>
  <div class="card">${q.q ? `<div class="qtext">${esc(q.q)}</div>` : ''}${q.img ? `<img class="qimg" src="${q.img}" alt="">` : ''}
  ${q.o.map((o, i) => `<button class="opt ${z.ans[q.id] === i ? 'sel' : ''}" data-i="${i}"><span class="l">${L[i].toUpperCase()}</span><span>${esc(o)}</span></button>`).join('')}
  <div class="row" style="margin-top:6px"><button class="btn ghost sm" id="prev" ${z.i ? '' : 'disabled'}>${icon('chevL')}</button><button class="btn ghost sm" id="clr">Dejar en blanco</button><span class="spacer"></span><button class="btn ghost sm" id="nxt" ${z.i < z.ids.length - 1 ? '' : 'disabled'}>${icon('chevR')}</button></div></div>
  <div class="navgrid">${z.ids.map((id, i) => `<button class="${z.ans[id] != null ? 'ans' : ''} ${i === z.i ? 'cur' : ''}" data-g="${i}">${i + 1}</button>`).join('')}</div>
  <div class="row"><span class="small muted">${nAns}/${z.ids.length} respondidas · penalización −${z.penalty}</span><span class="spacer"></span><button class="btn danger" id="sub">Entregar</button></div>`);
  $$('.opt').forEach(b => b.onclick = () => { z.ans[q.id] = +b.dataset.i; if (z.i < z.ids.length - 1) z.i++; renderExam(); });
  $('#prev').onclick = () => { z.i--; renderExam(); }; $('#nxt').onclick = () => { z.i++; renderExam(); };
  $('#clr').onclick = () => { delete z.ans[q.id]; renderExam(); };
  $$('[data-g]').forEach(b => b.onclick = () => { z.i = +b.dataset.g; renderExam(); });
  $('#sub').onclick = () => { const bl = z.ids.length - Object.keys(z.ans).length; if (confirm(bl ? `Tienes ${bl} en blanco. ¿Entregar?` : '¿Entregar el examen?')) submitExam(); };
}
function submitExam() {
  const z = EXZ; if (!z || z.done) return; z.done = true; clearInterval(timerH);
  let ok = 0, ko = 0, blank = 0; const byT = {};
  z.ids.forEach(id => { const q = z.cache?.[id] || Q[id], a = z.ans[id]; const k = q.kind === 'eng' ? 'eng' : q.t; const t = byT[k] = byT[k] || { ok: 0, ko: 0, b: 0 };
    if (a == null) { blank++; t.b++; } else if (a === q.a) { ok++; t.ok++; record(id, true); } else { ko++; t.ko++; record(id, false); } });
  const net = ok - ko * z.penalty; const pass = net >= z.pass;
  S.sims.push({ id: uid(), ts: now(), kind: z.kind, label: z.label, ok, ko, blank, net, max: z.ids.length, pass, score: net / z.ids.length * 10, dur: now() - z.start, u: now() }); save();
  app(`<div class="card hl" style="text-align:center;padding:28px 18px"><div class="eyebrow">${esc(z.label)}</div>
    <div class="mono ${pass ? 'c-ok' : 'c-ko'}" style="font-size:52px;font-weight:800;letter-spacing:-.04em;margin:8px 0">${net.toFixed(2)}<span class="muted" style="font-size:22px"> / ${z.ids.length}</span></div>
    <span class="pill ${pass ? 'ok' : 'ko'}" style="font-size:14px;padding:6px 14px">${pass ? 'APTO' : 'NO APTO'} · mínimo ${z.pass}</span>
    <p class="muted">✓ ${ok} · ✗ ${ko} (−${(ko * z.penalty).toFixed(2)}) · en blanco ${blank} · ${mmss(now() - z.start)}</p>
    <div class="tblwrap"><table class="tbl" style="max-width:520px;margin:0 auto"><tr><th>Tema</th><th>✓</th><th>✗</th><th>—</th></tr>${Object.entries(byT).map(([t, v]) => `<tr><td style="text-align:left">${esc(tname(t))}</td><td class="mono">${v.ok}</td><td class="mono">${v.ko}</td><td class="mono">${v.b}</td></tr>`).join('')}</table></div>
    <div class="row" style="justify-content:center;margin-top:16px"><button class="btn" id="rev">${icon('eye')} Revisar respuestas</button><a class="btn ghost" href="${z.back}">Volver</a></div></div><div id="review"></div>`);
  $('#rev').onclick = () => { $('#review').innerHTML = z.ids.map((id, i) => { const q = z.cache?.[id] || Q[id], a = z.ans[id]; return `<div class="card"><div class="small muted">${i + 1} · ${esc(q.src || '')}</div><div class="qtext" style="font-size:16px">${esc(q.q)}</div>${q.o.map((o, k) => `<div class="opt ${k === q.a ? 'ok' : k === a ? 'ko' : ''}" style="cursor:default"><span class="l">${L[k].toUpperCase()}</span><span>${esc(o)}</span></div>`).join('')}${a == null ? '<div class="small muted">En blanco</div>' : ''}${q.r ? `<div class="rule ${a === q.a ? '' : 'open'}"><div class="rh">${icon('book')} Regla</div><div>${esc(q.r)}</div></div>` : ''}${q.x ? `<div class="warnbox">${icon('alert')}<div>${esc(q.x)}</div></div>` : ''}</div>`; }).join(''); };
}

/* ---------- Psicotécnicos (ejercicios generados, infinitos) ---------- */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const AZ = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const azAt = i => AZ[((i % 27) + 27) % 27];
function opts4(correct, wrong) {
  const set = new Set([String(correct)]); let g = 0;
  while (set.size < 4 && g++ < 80) { const w = String(wrong()); if (w && w !== 'NaN') set.add(w); }
  const o = shuffle([...set]); return { o, a: o.indexOf(String(correct)) };
}
const near = (c, spread = 6) => () => c + pick([-1, 1]) * rnd(1, spread);
const CALLS = ['IBE', 'VLG', 'RYR', 'AEA', 'EZY', 'ANE', 'BAW', 'DLH', 'AFR', 'KLM', 'SWR', 'TAP', 'IBS', 'UAE'];
const callsign = () => pick(CALLS) + rnd(10, 9899);
const squawk = () => Array.from({ length: 4 }, () => rnd(0, 7)).join('');
const PSY = {
  num: { name: 'Series numéricas', ic: 'chart', d: 'Descubre la regla y elige el número que sigue', gen() {
    const k = rnd(0, 5); let s = [], why = '';
    if (k === 0) { const a = rnd(2, 60), d = pick([3, 4, 6, 7, 8, 9, 11, 12, 13, -3, -4, -7]); for (let i = 0; i < 6; i++) s.push(a + d * i); why = `Se ${d > 0 ? 'suma' : 'resta'} ${Math.abs(d)} cada vez.`; }
    else if (k === 1) { const a = rnd(1, 6), r = pick([2, 3]); for (let i = 0; i < 6; i++) s.push(a * r ** i); why = `Cada término se multiplica por ${r}.`; }
    else if (k === 2) { const a = rnd(1, 20), d0 = rnd(1, 5), inc = rnd(1, 3); let v = a; for (let i = 0; i < 6; i++) { s.push(v); v += d0 + inc * i; } why = `Las diferencias crecen de ${inc} en ${inc}: +${d0}, +${d0 + inc}, +${d0 + 2 * inc}…`; }
    else if (k === 3) { const a = rnd(1, 20), b = rnd(30, 70), d1 = rnd(2, 6), d2 = -rnd(2, 6); for (let i = 0; i < 7; i++) s.push(i % 2 ? b + d2 * ((i - 1) / 2) : a + d1 * (i / 2)); why = `Son dos series intercaladas: una suma ${d1} y la otra resta ${-d2}.`; }
    else if (k === 4) { const m = pick([2, 3]), c = pick([1, -1, 2, -2]); let v = rnd(1, 5); for (let i = 0; i < 5; i++) { s.push(v); v = v * m + c; } why = `Cada término es el anterior ×${m} ${c > 0 ? '+' : '−'} ${Math.abs(c)}.`; }
    else { const c = rnd(-3, 5), st = rnd(1, 4); for (let i = 0; i < 6; i++) s.push((st + i) ** 2 + c); why = `Son cuadrados consecutivos (${st}², ${st + 1}²…) ${c ? (c > 0 ? '+ ' : '− ') + Math.abs(c) : ''}.`; }
    const ans = s.pop(); const { o, a } = opts4(ans, near(ans, Math.max(3, Math.round(Math.abs(ans) * 0.15))));
    return { q: `${s.join(' · ')} · <b>?</b>`, o, a, why };
  } },
  let: { name: 'Series de letras', ic: 'layers', d: 'Alfabeto español de 27 letras (con Ñ)', gen() {
    const k = rnd(0, 2); let s = [], why = ''; const st = rnd(0, 26);
    if (k === 0) { const d = pick([2, 3, 4, 5, -2, -3]); for (let i = 0; i < 6; i++) s.push(azAt(st + d * i)); why = `Se ${d > 0 ? 'avanzan' : 'retroceden'} ${Math.abs(d)} letras cada vez.`; }
    else if (k === 1) { const d1 = rnd(1, 3), d2 = rnd(2, 4); let v = st; for (let i = 0; i < 6; i++) { s.push(azAt(v)); v += i % 2 ? d2 : d1; } why = `Se alterna avanzar ${d1} y ${d2} letras.`; }
    else { let v = st; for (let i = 0; i < 6; i++) { s.push(azAt(v)); v += i + 1; } why = 'Los saltos crecen: +1, +2, +3, +4…'; }
    const ans = s.pop(); const idx = AZ.indexOf(ans); const { o, a } = opts4(ans, () => azAt(idx + pick([-1, 1]) * rnd(1, 3)));
    return { q: `${s.join(' · ')} · <b>?</b>`, o, a, why };
  } },
  calc: { name: 'Cálculo rápido', ic: 'target', d: 'Porcentajes, velocidad, tiempo y distancia', gen() {
    const k = rnd(0, 5); let q, ans, why;
    if (k === 0) { const p = pick([5, 10, 15, 20, 25, 30, 40, 75]), b = rnd(2, 40) * 20; ans = p * b / 100; q = `¿Cuánto es el ${p} % de ${b}?`; why = `${b} × ${p} / 100 = ${ans}.`; }
    else if (k === 1) { const v = pick([240, 300, 360, 420, 480, 540, 600]), m = pick([5, 10, 15, 20, 30, 40, 45]); ans = v * m / 60; q = `Un avión vuela a ${v} kt. ¿Cuántas NM recorre en ${m} minutos?`; why = `${v} NM/h ÷ 60 = ${v / 60} NM/min × ${m} = ${ans} NM.`; }
    else if (k === 2) { const v = pick([240, 300, 360, 420, 480, 600]), d = (v / 60) * pick([4, 6, 8, 10, 12, 15]); ans = d / (v / 60); q = `A ${v} kt, ¿cuántos minutos tarda en recorrer ${d} NM?`; why = `${v} kt = ${v / 60} NM/min → ${d} ÷ ${v / 60} = ${ans} min.`; }
    else if (k === 3) { const fl = rnd(10, 40) * 10, r = pick([1000, 1500, 2000, 2500, 3000]), to = fl - pick([40, 60, 80, 100, 120]); ans = (fl - to) * 100 / r; if (!Number.isInteger(ans)) return PSY.calc.gen(); q = `Desciende de FL${fl} a FL${to} a ${r} ft/min. ¿Cuántos minutos tarda?`; why = `${(fl - to) * 100} ft ÷ ${r} ft/min = ${ans} min.`; }
    else if (k === 4) { const a = rnd(12, 99), b = rnd(3, 9); ans = a * b; q = `${a} × ${b} = ?`; why = `${a} × ${b} = ${ans}.`; }
    else { const h = rnd(6, 21), m = pick([5, 10, 15, 20, 35, 40, 50]), add = pick([25, 35, 45, 50, 55, 70, 85, 95]); const t = h * 60 + m + add; ans = `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; q = `Despega a las ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} y el vuelo dura ${add} min. ¿Hora de llegada?`; why = `${h}:${String(m).padStart(2, '0')} + ${add} min = ${ans}.`;
      const { o, a } = opts4(ans, () => { const w = t + pick([-1, 1]) * pick([5, 10, 15, 60]); return `${String(Math.floor(w / 60) % 24).padStart(2, '0')}:${String(w % 60).padStart(2, '0')}`; }); return { q, o, a, why }; }
    const { o, a } = opts4(ans, near(ans, Math.max(2, Math.round(Math.abs(ans) * 0.12)))); return { q, o, a, why };
  } },
  aten: { name: 'Atención y percepción', ic: 'search', d: 'Compara datos de vuelo y encuentra las diferencias', gen() {
    if (Math.random() < 0.6) {
      const rows = Array.from({ length: 4 }, () => [callsign(), squawk(), 'FL' + rnd(10, 41) * 10]);
      const nd = rnd(0, 3); const idx = shuffle([0, 1, 2, 3]).slice(0, nd);
      const alt = rows.map((r, i) => { if (!idx.includes(i)) return r.slice(); const c = r.slice(), f = rnd(0, 2), str = c[f].split(''); const p = rnd(f === 2 ? 2 : 3, str.length - 1); const ch = str[p]; let n; do { n = String(rnd(0, f === 1 ? 7 : 9)); } while (n === ch); str[p] = n; c[f] = str.join(''); return c; });
      const tb = rows.map((r, i) => `<tr><td class="mono">${r.join('  ')}</td><td class="mono">${alt[i].join('  ')}</td></tr>`).join('');
      return { q: `¿En cuántas filas NO coinciden las dos columnas?<table class="tbl psy-tb">${tb}</table>`, o: ['0', '1', '2', '3'], a: nd, why: nd ? `Difieren las filas ${idx.sort().map(i => i + 1).join(', ')}.` : 'Todas las filas coinciden.' };
    }
    const sym = pick(['7', 'K', 'Ñ', '3', 'X']); const pool = sym.match(/\d/) ? '0123456789' : 'KXÑNMHZ';
    const s = Array.from({ length: 36 }, () => Math.random() < 0.2 ? sym : pick(pool.replace(sym, '').split(''))).join('');
    const n = s.split(sym).length - 1; const { o, a } = opts4(n, near(n, 2));
    return { q: `¿Cuántas veces aparece «${sym}»?<div class="mono psy-str">${s.match(/.{1,12}/g).join('<br>')}</div>`, o, a, why: `Aparece ${n} veces.` };
  } },
  mem: { name: 'Memoria', ic: 'brain', d: 'Memoriza un tráfico 15 s y responde', memo: true, gen() {
    const fl = shuffle(Array.from({ length: 30 }, (_, i) => 'FL' + (100 + i * 10))).slice(0, 5);
    const rows = fl.map(f => ({ c: callsign(), sq: squawk(), f }));
    const t = pick(rows), k = rnd(0, 1);
    const q = k ? `¿Qué nivel tenía ${t.c}?` : `¿Qué squawk tenía ${t.c}?`;
    const ans = k ? t.f : t.sq; const others = rows.filter(r => r !== t).map(r => k ? r.f : r.sq);
    const o = shuffle([ans, ...shuffle(others).slice(0, 3)]);
    return { memo: `<table class="tbl psy-tb">${rows.map(r => `<tr><td class="mono"><b>${r.c}</b></td><td class="mono">${r.sq}</td><td class="mono">${r.f}</td></tr>`).join('')}</table>`, q, o, a: o.indexOf(ans), why: `${t.c}: squawk ${t.sq}, ${t.f}.` };
  } },
};
let PZ = null;
function psyStat(k) { return S.psy?.[k] || { n: 0, ok: 0 }; }
function psyRecord(k, ok) { S.psy = S.psy || {}; const r = Object.assign({ n: 0, ok: 0 }, S.psy[k]); r.n++; if (ok) r.ok++; r.u = now(); S.psy[k] = r; save(); }
routes['psicotecnicos'] = (args) => {
  if (args[0] !== 'hoja') PSH = null;
  if (!has('psico')) return locked('psico', 'Psicotécnicos', 'Los psicotécnicos están en el plan Teoría + Inglés + Psicotécnicos: series numéricas y de letras, cálculo, atención y memoria, infinitos y cronometrados.');
  if (args[0] === 'hoja') return psySheet(args[1]);
  if (args[0] && (PSY[args[0]] || args[0] === 'mix')) { PZ = { k: args[0], i: 0, n: args[0] === 'mix' ? 30 : 15, ok: 0, t0: now(), limit: args[0] === 'mix' ? 15 * 60 : 0 }; return psyNext(); }
  PZ = null;
  app(`${head('Estudiar', 'Psicotécnicos', 'Tests de psicotécnicos con su solución oficial, tests completos en hoja y ejercicios generados que no se acaban. Haz unos minutos cada día: la velocidad se entrena.')}
  <a class="card hl row" href="#/psicotecnicos/mix" style="color:inherit;gap:14px"><div class="ico" style="width:44px;height:44px;display:grid;place-items:center">${icon('clock')}</div><div style="flex:1"><b>Prueba cronometrada</b><div class="small muted">30 ejercicios variados · 15 minutos · como un examen</div></div>${icon('chevR', 'chev')}</a>
  ${PSYB.length ? `<h2>Tests de psicotécnicos</h2><p class="small muted" style="margin-top:-6px">Pregunta a pregunta, con la solución oficial. Las que falles vuelven en Falladas.</p>
  <div class="grid g2">${PSYB.map(b => { const ids = b.items.map(x => x.id); const seen = ids.filter(id => rec(id).n).length, ok = ids.filter(id => rec(id).last === 1).length;
    return `<div class="card flat psyb"><div class="row"><div style="flex:1;min-width:0"><b>${esc(b.name)}</b><div class="small muted">${ids.length} preguntas · ${seen ? `${pct(seen, ids.length)} % hecho · ${pct(ok, seen)} % acierto` : 'sin empezar'}</div></div></div>
      <div class="row" style="margin-top:10px"><button class="btn sm" data-pb="${b.id}" data-m="seq">${icon('play')} ${seen && seen < ids.length ? 'Continuar' : 'Empezar'}</button><button class="btn ghost sm" data-pb="${b.id}" data-m="rnd">${icon('shuffle')} Aleatorio</button></div></div>`; }).join('')}</div>` : ''}
  ${PSYS.length ? `<h2>Tests completos en hoja</h2><p class="small muted" style="margin-top:-6px">El test tal cual, con su hoja de respuestas y tiempo. Al terminar se corrige.</p>
  <div class="grid g2">${PSYS.map(t => { const r = S.psy?.['sheet:' + t.id]; const n = t.pages.reduce((a, p) => a + p.qs.length, 0);
    return `<a class="card flat" href="#/psicotecnicos/hoja/${t.id}" style="color:inherit"><div class="row"><div style="flex:1"><b>${esc(t.name)}</b><div class="small muted">${n} preguntas · ${t.mins} min${t.key ? '' : ' · sin solución oficial'}</div></div>${icon('chevR', 'chev')}</div>${r ? `<div class="small muted" style="margin-top:8px">Último: ${r.last} · mejor: ${r.best}</div>` : ''}</a>`; }).join('')}</div>` : ''}
  <h2>Ejercicios generados</h2>
  <div class="grid g2" style="margin-top:14px">${Object.entries(PSY).map(([k, p]) => { const s = psyStat(k); return `<a class="card flat" href="#/psicotecnicos/${k}" style="color:inherit"><div class="row"><div style="flex:1"><b>${p.name}</b><div class="small muted">${p.d}</div></div>${icon('chevR', 'chev')}</div><div class="small muted" style="margin-top:10px">${s.n ? `${s.n} hechos · ${pct(s.ok, s.n)} % acierto` : 'Sin empezar'}</div></a>`; }).join('')}</div>`);
  $$('[data-pb]').forEach(b => b.onclick = () => { const bk = PSYB.find(x => x.id === b.dataset.pb); let ids = bk.items.map(x => x.id);
    if (b.dataset.m === 'rnd') ids = shuffle(ids); else { const k = ids.findIndex(id => !rec(id).n); if (k > 0) ids = ids.slice(k).concat(ids.slice(0, k)); }
    startQuiz({ title: bk.name, list: ids, back: '#/psicotecnicos' }); });
};
// Test completo en hoja: páginas originales + hoja de respuestas, cronómetro y corrección
let PSH = null;
function psySheet(id) {
  const t = PSYS.find(x => x.id === id); if (!t) { location.hash = '#/psicotecnicos'; return; }
  if (!PSH || PSH.id !== id) PSH = { id, ans: {}, t0: now(), done: false };
  const z = PSH, L5 = 'ABCDE'.slice(0, t.opts), total = t.pages.reduce((a, p) => a + p.qs.length, 0);
  const pen = t.penalty ?? 1 / (t.opts - 1);
  const res = () => { let ok = 0, ko = 0; for (let n = 1; n <= total; n++) { const a = z.ans[n]; if (a == null || !t.key) continue; a === t.key[n - 1] ? ok++ : ko++; } return { ok, ko, blank: total - ok - ko, net: Math.round((ok - ko * pen) * 100) / 100 }; };
  const bubble = n => `<div class="sq"><b>${n}</b>${[...L5].map(l => { const sel = z.ans[n] === l, good = z.done && t.key && t.key[n - 1] === l; return `<button class="bub${sel ? ' sel' : ''}${z.done ? (good ? ' good' : sel ? ' bad' : '') : ''}" data-n="${n}" data-l="${l}" ${z.done ? 'disabled' : ''}>${l}</button>`; }).join('')}</div>`;
  const r = z.done ? res() : null;
  app(`<div class="qtop"><a class="btn ghost sm" href="#/psicotecnicos">${icon('chevL')}</a><span class="small muted" style="flex:1">${esc(t.name)} · ${Object.keys(z.ans).length}/${total} respondidas</span>${z.done ? '' : `<span class="timer" id="shT"></span>`}</div>
    ${z.done ? `<div class="card hl row" style="gap:18px">${t.key ? ring(pct(r.ok, total), 84, 8) : ''}<div><div style="font-weight:800;font-size:18px">${t.key ? `${r.ok} aciertos · ${r.ko} fallos · ${r.blank} en blanco` : 'Test terminado'}</div>
      <div class="small muted">${t.key ? `Nota neta: ${r.net} de ${total} (cada fallo resta ${String(Math.round(pen * 100) / 100).replace('.', ',')})` : 'Este test no trae solución oficial: compara tus respuestas con las imágenes.'} · ${Math.round((z.end - z.t0) / 60000)} min</div></div>
      <span class="spacer"></span><button class="btn sec sm" id="again">${icon('repeat')} Repetir</button></div>` : `<p class="small muted">Marca tus respuestas debajo de cada página. Cuando termines, pulsa «Corregir». Tiempo orientativo: ${t.mins} min.</p>`}
    ${t.support ? `<details class="card flat"><summary style="cursor:pointer;font-weight:700">Material de apoyo (desplegados)</summary>${t.support.map(im => `<img class="sheetimg" src="${im}" alt="" loading="lazy">`).join('')}</details>` : ''}
    ${t.pages.map(p => `<div class="card sheetpg"><img class="sheetimg" src="${p.img}" alt="" loading="lazy">${p.qs.length ? `<div class="sheetans">${p.qs.map(bubble).join('')}</div>` : ''}</div>`).join('')}
    ${z.done ? '' : `<div class="qactions"><button class="btn block" id="fin">${icon('check')} Corregir</button></div>`}`);
  $$('.bub').forEach(b => b.onclick = () => { const n = +b.dataset.n; z.ans[n] = z.ans[n] === b.dataset.l ? undefined : b.dataset.l; if (z.ans[n] === undefined) delete z.ans[n];
    $$(`.bub[data-n="${n}"]`).forEach(x => x.classList.toggle('sel', x.dataset.l === z.ans[n])); $('.qtop .muted').textContent = `${t.name} · ${Object.keys(z.ans).length}/${total} respondidas`; });
  const fin = $('#fin'); if (fin) fin.onclick = () => { if (Object.keys(z.ans).length < total && !confirm('Hay preguntas sin responder. ¿Corregir igualmente?')) return;
    z.done = true; z.end = now(); const rr = res(); S.psy = S.psy || {}; const k = 'sheet:' + id, old = S.psy[k];
    S.psy[k] = { last: t.key ? `${rr.net}/${total}` : 'hecho', best: t.key ? (old && parseFloat(old.best) > rr.net ? old.best : `${rr.net}/${total}`) : 'hecho', u: now() }; save(); window.scrollTo(0, 0); psySheet(id); };
  const ag = $('#again'); if (ag) ag.onclick = () => { PSH = null; psySheet(id); };
  if (!z.done) { const el = $('#shT'); const tick = () => { if (PSH !== z || z.done || !document.body.contains(el)) return; const s2 = Math.round((now() - z.t0) / 1000); el.textContent = `${Math.floor(s2 / 60)}:${String(s2 % 60).padStart(2, '0')}`; setTimeout(tick, 1000); }; tick(); }
}
function psyNext() {
  const z = PZ; if (!z) return;
  if (z.i >= z.n || (z.limit && (now() - z.t0) / 1000 > z.limit)) return psyEnd();
  const k = z.k === 'mix' ? pick(Object.keys(PSY)) : z.k; z.cur = Object.assign({ k }, PSY[k].gen()); z.chosen = null; z.i++;
  if (z.cur.memo) { z.memoUntil = now() + 15000; psyMemo(); } else psyDraw();
}
function psyMemo() {
  const z = PZ; if (!z || !z.cur.memo) return; const left = Math.ceil((z.memoUntil - now()) / 1000);
  if (left <= 0) return psyDraw();
  app(`${psyTop()}<div class="card"><div class="tiny">Memoriza · ${left} s</div>${z.cur.memo}<button class="btn ghost sm" id="memoGo" style="margin-top:10px">Ya lo tengo</button></div>`);
  $('#memoGo').onclick = () => { z.memoUntil = 0; psyDraw(); };
  clearTimeout(z.h); z.h = setTimeout(() => { if (PZ === z && z.memoUntil) psyMemo(); }, 1000);
}
function psyTop() {
  const z = PZ; const tl = z.limit ? Math.max(0, z.limit - Math.round((now() - z.t0) / 1000)) : null;
  return `<div class="qtop"><a class="btn ghost sm" href="#/psicotecnicos">${icon('chevL')}</a><div class="bar"><i style="width:${pct(z.i - 1, z.n)}%"></i></div><span class="mono small muted">${z.i}/${z.n}</span>${tl != null ? `<span class="pill" id="psyT">${Math.floor(tl / 60)}:${String(tl % 60).padStart(2, '0')}</span>` : ''}<span class="pill ok">✓ ${z.ok}</span></div>`;
}
function psyDraw() {
  const z = PZ, c = z.cur, done = z.chosen != null, ok = done && z.chosen === c.a; clearTimeout(z.h);
  app(`${psyTop()}<div class="card"><div class="qmeta"><span class="pill">${PSY[c.k].name}</span></div><div class="qtext">${c.q}</div>
    ${c.o.map((o, i) => `<button class="opt ${done ? (i === c.a ? 'ok' : i === z.chosen ? 'ko' : '') : ''}" data-i="${i}" ${done ? 'disabled' : ''}><span class="l">${L[i].toUpperCase()}</span><span>${esc(o)}</span></button>`).join('')}
    ${done ? `<div class="fb ${ok ? 'ok' : 'ko'}">${icon(ok ? 'check' : 'x')}<div>${ok ? 'Correcto' : 'Incorrecto'} · ${esc(c.why)}</div></div>` : ''}</div>
    <div class="qactions"><button class="btn block" id="nextBtn" ${done ? '' : 'disabled'}>Siguiente ${icon('chevR')}</button><button class="btn ghost" id="endBtn">Terminar</button></div>`);
  $$('.opt').forEach(b => b.onclick = () => { z.chosen = +b.dataset.i; const g = z.chosen === c.a; if (g) z.ok++; psyRecord(c.k, g); psyDraw(); });
  $('#nextBtn').onclick = psyNext; $('#endBtn').onclick = psyEnd;
  if (z.limit) z.h = setTimeout(function tick() { if (PZ !== z) return; const el = $('#psyT'); const tl = z.limit - Math.round((now() - z.t0) / 1000); if (tl <= 0) return psyEnd(); if (el) el.textContent = `${Math.floor(tl / 60)}:${String(tl % 60).padStart(2, '0')}`; z.h = setTimeout(tick, 1000); }, 1000);
}
function psyEnd() {
  const z = PZ; if (!z) return; clearTimeout(z.h); z.done = true; const n = z.i - (z.chosen == null ? 1 : 0);
  app(`${head('Psicotécnicos', 'Resultado', '')}<div class="card hl row" style="gap:18px">${ring(pct(z.ok, n || 1), 92, 9)}<div><div style="font-weight:700;font-size:17px">${z.ok} de ${n} correctas</div><div class="small muted">${Math.round((now() - z.t0) / 1000)} s · ${n ? Math.round((now() - z.t0) / 1000 / n) : 0} s por ejercicio</div></div></div>
  <div class="row"><a class="btn" href="#/psicotecnicos/${z.k}">${icon('repeat')} Otra tanda</a><a class="btn sec" href="#/psicotecnicos">Volver</a></div>`);
}

/* ---------- Inglés ---------- */
routes['ingles'] = () => {
  if (!has('ingles')) return locked('ingles', 'Inglés', 'El inglés está en los planes Teoría + Inglés y Completo: preguntas tipo examen de ENAIRE con la regla gramatical explicada después de cada respuesta.');
  const ids = s => Object.values(Q).filter(q => q.kind === 'eng' && q.sub === s).map(q => q.id);
  const st = s => { const l = ids(s); const seen = l.filter(i => rec(i).n); return { n: l.length, seen: seen.length, ok: seen.filter(i => rec(i).last === 1).length }; };
  const engNext = subs => z => {
    const pool = Object.values(Q).filter(q => q.kind === 'eng' && subs.includes(q.sub)); const seen = new Set(z.seen.slice(-30));
    const dueF = pool.filter(q => S.q[q.id]?.pend && (S.q[q.id].due || 0) <= now() && !seen.has(q.id));
    if (dueF.length && Math.random() < 0.3) return dueF[Math.floor(Math.random() * dueF.length)].id;
    const c = pool.filter(q => !seen.has(q.id)); const arr = c.length ? c : pool; const ws = arr.map(q => 1 / (1 + rec(q.id).n));
    let s = Math.random() * ws.reduce((a, b) => a + b, 0); for (let i = 0; i < arr.length; i++) { s -= ws[i]; if (s <= 0) return arr[i].id; } return arr[0].id;
  };
  const realPool = ENG_EXAMS.filter(e => e.sub === 'exam').flatMap(e => e.qs).filter(id => !Q[id].res);
  const sims = S.sims.filter(s => String(s.kind).startsWith('en-'));
  app(`${head('Practicar', 'Inglés', 'En la Fase I la prueba de inglés es un test de nivel C1 (20 preguntas en las convocatorias 2024 y 2025; se aprueba con 10). Al responder verás siempre la regla gramatical o el significado, para que no vuelvas a fallar ese tipo de pregunta.')}
  <div class="card hl row"><div style="flex:1;min-width:200px"><h3>Simulacro de inglés</h3><div class="small muted">20 preguntas de exámenes oficiales de ENAIRE · 25 min · aprobado con 10</div></div><button class="btn" id="engSim">${icon('play')} Empezar</button></div>
  ${Object.entries(ENG_SUBS).map(([s, n]) => { const x = st(s); return `<div class="task"><div class="body"><div class="tt">${n}</div><div class="small muted">${x.seen}/${x.n} vistas · ${pct(x.ok, x.seen)}% ✓</div><div class="bar"><i style="width:${pct(x.seen, x.n)}%"></i></div></div><button class="btn sm" data-r="${s}">A boleo</button>${s !== 'words' ? `<button class="btn ghost sm" data-l="${s}">En orden</button>` : ''}</div>`; }).join('')}
  <h2>Exámenes y prácticas, uno a uno</h2>
  ${ENG_EXAMS.map(e => { const n = e.qs.filter(id => !Q[id].res).length; const last = sims.filter(s => s.kind === 'en-' + e.id).sort((a, b) => b.ts - a.ts)[0]; return `<div class="task"><div class="body"><div class="tt">${esc(e.label)}</div><div class="small muted">${n} preguntas${last ? ` · último: <b class="${last.pass ? 'c-ok' : 'c-ko'}">${last.net}/${last.max}</b>` : ''}</div></div><button class="btn sm" data-ee="${e.id}">Examen</button><button class="btn ghost sm" data-ep="${e.id}">Práctica</button></div>`; }).join('')}
  <div class="warnbox">${icon('alert')}<div>El libro «Multiple choice english test C1» no trae soluciones, así que no lo he incluido: no quiero darte respuestas sin una clave oficial. Si tienes el solucionario, pásamelo y lo añado. El test de Scribd tampoco se pudo descargar.</div></div>`);
  $$('[data-r]').forEach(b => b.onclick = () => startQuiz({ title: ENG_SUBS[b.dataset.r], next: engNext([b.dataset.r]), back: '#/ingles' }));
  $$('[data-l]').forEach(b => b.onclick = () => startQuiz({ title: ENG_SUBS[b.dataset.l], list: ids(b.dataset.l), back: '#/ingles' }));
  $('#engSim').onclick = () => startExam({ ids: shuffle(realPool).slice(0, 20), label: 'Simulacro inglés', kind: 'en-sim', minutes: 25, penalty: 0, pass: 10, back: '#/ingles' });
  $$('[data-ee]').forEach(b => b.onclick = () => { const e = ENG_EXAMS.find(x => x.id === b.dataset.ee); const ids_ = e.qs.filter(id => !Q[id].res); startExam({ ids: ids_, label: e.label, kind: 'en-' + e.id, minutes: Math.round(ids_.length * 1.25), penalty: 0, pass: Math.ceil(ids_.length / 2), back: '#/ingles' }); });
  $$('[data-ep]').forEach(b => b.onclick = () => { const e = ENG_EXAMS.find(x => x.id === b.dataset.ep); startQuiz({ title: e.label, list: e.qs, back: '#/ingles' }); });
};

/* ---------- Planning ---------- */
routes['planning'] = () => {
  const st = S.settings; const days = st.examDate ? Math.max(1, Math.ceil((new Date(st.examDate + 'T09:00:00') - now()) / DAY)) : null;
  const rows = TOPICS.map(t => {
    const total = +st.pages[t.id] || 0; const pr = new Set();
    S.log.filter(l => l.topic === t.id && l.pf).forEach(l => { for (let p = +l.pf; p <= +(l.pt || l.pf); p++) pr.add(p); });
    Object.keys(S.rd).filter(k => k.startsWith(t.id + ':') && S.rd[k].v).forEach(k => pr.add(+k.split(':')[1]));
    const s = topicStats(t.id); return { t, total, done: Math.min(pr.size, total || pr.size), s, perDay: days && total ? Math.max(0, (total - pr.size) / days) : null };
  });
  const logs = S.log.slice().sort((a, b) => b.d.localeCompare(a.d));
  app(`${head('Seguimiento', 'Planning', 'Con la fecha del examen, tu plan reparte lo que te queda entre los días disponibles, y se recoloca solo cada día.')}
  <div class="card"><div class="grid">
    <div><label>Fecha del examen</label><input type="date" id="exd" value="${st.examDate || ''}"></div>
    <div><label>Cuenta atrás</label><div class="mono" id="cdown" style="font-size:26px;font-weight:800;padding-top:4px">${days ? days + ' días' : '—'}</div></div>
    </div>
    <div class="row" style="margin-top:12px"><a class="btn sec sm" href="#/plan">${icon('grid')} Ver mi plan</a><a class="btn ghost sm" href="#/bienvenida?edit=1">${icon('gear')} Cambiar mi plan</a><span class="small muted">Lo que no hagas un día se recoloca solo.</span></div></div>
  <h2>Avance del temario</h2>
  <div class="card tblwrap"><table class="tbl"><tr><th>Tema</th><th>Págs. resumen</th><th>Estudiadas</th><th>Ritmo</th><th>Cuestionario</th></tr>
  ${rows.map(r => `<tr><td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${r.t.c};margin-right:8px"></span>${r.t.short}</td><td><input type="number" min="0" style="width:72px;padding:6px 8px" data-pg="${r.t.id}" value="${r.total}"></td><td class="mono">${r.done}/${r.total || '?'}</td><td class="mono small">${r.perDay != null ? (r.perDay ? r.perDay.toFixed(1) + '/día' : '✓') : '—'}</td><td class="mono">${pct(r.s.seen, r.s.scope)}%</td></tr>`).join('')}</table></div>
  <h2>Apuntar lo estudiado</h2>
  <div class="card"><div class="grid">
    <div><label>Día</label><input type="date" id="ld" value="${ymd()}"></div>
    <div><label>Tema</label><select id="lt">${TOPICS.map(t => `<option value="${t.id}">T${t.n} ${t.short}</option>`).join('')}<option value="psico">Psicotécnicos</option><option value="eng">Inglés</option></select></div>
    <div><label>Resumen: páginas</label><div class="inline"><input type="number" id="pf" placeholder="desde"><input type="number" id="pt" placeholder="hasta"></div></div>
    <div><label>Cuestionario: preguntas</label><div class="inline"><input type="number" id="qf" placeholder="desde"><input type="number" id="qt" placeholder="hasta"></div></div></div>
    <label>Nota</label><input id="ln" placeholder="p. ej. 30 min de psicos">
    <p class="small muted">Las páginas y preguntas que apuntes entran en el repaso a 1, 3 y 7 días desde ese día.</p>
    <button class="btn" id="addLog">${icon('check')} Guardar</button></div>
  <h2>Historial</h2>
  ${logs.length ? `<div class="card tblwrap"><table class="tbl"><tr><th>Día</th><th>Tema</th><th>Págs</th><th>Preg.</th><th>Nota</th><th></th></tr>${logs.slice(0, 80).map(l => `<tr><td>${fmtDate(l.d)}</td><td>${esc(TOP[l.topic]?.short || tname(l.topic))}</td><td class="mono">${l.pf ? l.pf + '–' + (l.pt || l.pf) : ''}</td><td class="mono">${l.qf ? l.qf + '–' + l.qt : ''}</td><td class="small">${esc(l.note || '')}</td><td><a href="#" data-del="${l.id}" class="muted">✕</a></td></tr>`).join('')}</table></div>` : '<p class="muted">Nada apuntado todavía.</p>'}`);
  // Fecha: se guarda al terminar de escribirla (blur/Enter), no en cada tecla, para que no se repinte la página a mitad del año
  const exd = $('#exd'); let exdDirty = false;
  exd.oninput = exd.onchange = () => { exdDirty = true; const v = exd.value; if (/^\d{4}-\d{2}-\d{2}$/.test(v) && +v.slice(0, 4) >= 2025) { st.examDate = v; if (S.plan?.cfg) { S.plan.cfg.examDate = v; S.plan.cfg.known = 1; S.plan.u = now(); P._sig = ''; } save(true); $('#cdown').textContent = Math.max(1, Math.ceil((new Date(v + 'T09:00:00') - now()) / DAY)) + ' días'; } };
  exd.onblur = () => { if (exdDirty) render(); };
  exd.onkeydown = e => { if (e.key === 'Enter') exd.blur(); };
  $$('[data-pg]').forEach(i => i.onchange = () => { st.pages[i.dataset.pg] = +i.value; save(true); render(); });
  $('#addLog').onclick = () => {
    const l = { id: uid(), d: $('#ld').value || ymd(), topic: $('#lt').value, pf: +$('#pf').value || 0, pt: +$('#pt').value || +$('#pf').value || 0, qf: +$('#qf').value || 0, qt: +$('#qt').value || +$('#qf').value || 0, note: $('#ln').value, u: now() };
    if (l.pf > l.pt) [l.pf, l.pt] = [l.pt, l.pf];
    S.log.push(l); let n = 0;
    if (l.qf && TOP[l.topic]) n += addStudy(l.d, l.topic, D.q.filter(q => q.t === l.topic && q.n >= l.qf && q.n <= l.qt).map(q => q.id), `preguntas ${l.qf}–${l.qt}`);
    if (l.pf && TOP[l.topic] && pagesOf(l.topic).length) n += addStudy(l.d, l.topic, qForPages(l.topic, l.pf, l.pt), `resumen págs. ${l.pf}–${l.pt}`);
    save(); toast(n ? `Guardado · ${n} preguntas al repaso 1·3·7` : 'Guardado'); render();
  };
  $$('[data-del]').forEach(a => a.onclick = e => { e.preventDefault(); S.log = S.log.filter(x => x.id !== a.dataset.del); save(); render(); });
};

/* ---------- Estadísticas ---------- */
routes['stats'] = () => {
  const exYears = { '2017': ['106', '107', '108', '111', '112', '113', '114'], '2023': ['2023a', '312'], '2024-25': ['2024'] };
  const dist = Object.entries(exYears).map(([y, ids]) => { const qs = D.ex.filter(x => ids.includes(x.ex) && !x.res); const c = {}; qs.forEach(x => c[x.t] = (c[x.t] || 0) + 1); return { y, n: qs.length, c }; });
  const last21 = [...Array(21)].map((_, i) => ymd(now() - (20 - i) * DAY));
  const perDay = {}; Object.values(S.q).forEach(r => { if (r.t) { const d = ymd(r.t); perDay[d] = (perDay[d] || 0) + 1; } });
  const mx = Math.max(1, ...last21.map(d => perDay[d] || 0));
  const totalAns = Object.values(S.q).reduce((a, r) => a + r.n, 0); const totalOk = Object.values(S.q).reduce((a, r) => a + r.ok, 0);
  const sims = S.sims.filter(s => s.max === 50).sort((a, b) => a.ts - b.ts).slice(-12);
  app(`${head('Seguimiento', 'Estadísticas', '')}
  <div class="grid g4"><div class="kpi"><div class="tiny">Respuestas</div><div class="v">${totalAns}</div><div class="s">${pct(totalOk, totalAns)}% de acierto</div></div>
    <div class="kpi"><div class="tiny">Preguntas distintas</div><div class="v">${Object.keys(S.q).length}</div><div class="s">de ${D.q.length + D.ex.filter(x => !x.dup).length} del temario</div></div>
    <div class="kpi"><div class="tiny">Racha</div><div class="v">${streak()}</div><div class="s">días seguidos</div></div>
    <div class="kpi"><div class="tiny">Simulacros</div><div class="v">${S.sims.length}</div><div class="s">${sims.length ? 'último ' + (sims[sims.length - 1].net ?? 0).toFixed(1) + ' pts' : '—'}</div></div></div>
  <h2>Actividad · últimas 3 semanas</h2>
  <div class="card"><div class="chart">${last21.map(d => `<div title="${d}: ${perDay[d] || 0}" style="height:${(perDay[d] || 0) / mx * 100}%"></div>`).join('')}</div><div class="legend"><span>${fmtDate(last21[0])}</span><span>hoy</span></div></div>
  ${sims.length > 1 ? `<h2>Evolución en simulacros</h2><div class="card"><div class="chart">${sims.map(s => `<div title="${(s.net ?? 0).toFixed(1)} pts" style="height:${Math.max(2, (s.net ?? 0) / 50 * 100)}%;background:${(s.net ?? 0) >= 25 ? 'linear-gradient(#34d399,#10b981)' : 'linear-gradient(#fb7185,#e11d48)'}"></div>`).join('')}</div><div class="legend"><span>0</span><span>Aprobado: 25 pts</span><span>50</span></div></div>` : ''}
  <h2>Por tema</h2>
  <div class="card tblwrap"><table class="tbl"><tr><th>Tema</th><th>Hechas</th><th>% acierto</th><th>Pendientes</th></tr>
  ${TOPICS.map(t => { const qs = Object.values(Q).filter(q => q.kind !== 'eng' && q.t === t.id && !q.dup); const seen = qs.filter(q => rec(q.id).n); return `<tr><td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${t.c};margin-right:8px"></span>${t.short}</td><td class="mono">${seen.length}/${qs.length}</td><td class="mono">${pct(seen.filter(q => rec(q.id).last === 1).length, seen.length)}%</td><td class="mono">${qs.filter(q => S.q[q.id]?.pend).length}</td></tr>`; }).join('')}</table></div>
  <h2>¿Qué cae en el examen?</h2>
  <p class="small muted">% de preguntas de cada tema en los exámenes oficiales. El tema de cada pregunta lo asigné automáticamente comparándola con el temario: tómalo como aproximado.</p>
  <div class="card tblwrap"><table class="tbl"><tr><th>Tema</th>${dist.map(d => `<th>${d.y}</th>`).join('')}</tr>
  ${TOPICS.map(t => `<tr><td>${t.short}</td>${dist.map(d => { const v = pct(d.c[t.id] || 0, d.n); return `<td><div class="row" style="gap:8px;flex-wrap:nowrap"><div class="bar" style="width:70px;margin:0"><i style="width:${Math.min(100, v * 4)}%;background:${t.c}"></i></div><span class="mono small">${v}%</span></div></td>`; }).join('')}</tr>`).join('')}</table></div>`);
};

/* ---------- Ajustes y cuenta ---------- */
const PLAN_NAMES = { teoria: 'Fase I · Teoría', ingles: 'Fase I · Teoría + Inglés', completo: 'Fase I · Teoría + Inglés + Psicotécnicos' };
const planInfo = () => {
  const pl = ME.plan; const active = pl && ['active', 'trialing', 'past_due'].includes(pl.status);
  const dt = x => new Date(x * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  if (active) return { name: PLAN_NAMES[pl.id] || pl.id, active: true, sub: true, line: pl.status === 'past_due' ? 'Pago pendiente: revisa tu tarjeta' : pl.cancelAt ? `Cancelada: tienes acceso hasta el ${dt(pl.cancelAt)}` : pl.end ? `Se renueva el ${dt(pl.end)}` : 'Activo' };
  if (ME.admin) return { name: 'Administrador', active: true, line: 'Acceso completo a todo' };
  if (ME.comp) return { name: PLAN_NAMES[ME.comp] || 'Acceso completo', active: true, line: 'Gratis con código de invitación' };
  return { name: 'Acceso completo', active: true, line: 'Cuenta de los inicios de Opo ATC' };
};
function accountCard() {
  const nm = [ME.name, ME.surname].filter(Boolean).join(' ') || SESS.name || SESS.user; const pi = planInfo();
  return `<div class="card"><div class="row"><div class="avatar" style="width:46px;height:46px;font-size:17px">${esc(initials(nm))}</div><div style="flex:1;min-width:0"><div style="font-weight:700">${esc(nm)}</div><div class="small muted">${esc(ME.email || SESS.user)} · sincronizado entre dispositivos</div></div>
    <button class="btn ghost sm" id="syncNow">${icon('refresh')} Sincronizar</button><button class="btn ghost sm" id="out">${icon('logout')} Salir</button></div>
    <div class="acclinks"><a href="#/perfil">${icon('user')}<div><b>Mi perfil</b><span>Nombre, email, contraseña y datos personales</span></div>${icon('chevR', 'chev')}</a>
    <a href="#/suscripcion">${icon('card')}<div><b>Plan y pagos</b><span>${esc(pi.name)} · ${esc(pi.line)}</span></div>${icon('chevR', 'chev')}</a></div></div>`;
}
routes['cuenta'] = () => routes['ajustes']();
routes['ajustes'] = () => {
  const st = S.settings;
  app(`${head('Cuenta', 'Ajustes', '')}
  ${accountCard()}
  <div class="card row"><div style="flex:1"><h3>Apariencia</h3><div class="small muted">Se guarda en este dispositivo</div></div><div class="seg"><button data-th="light" class="${theme() === 'light' ? 'on' : ''}">Claro</button><button data-th="dark" class="${theme() === 'dark' ? 'on' : ''}">Oscuro</button></div></div>
  <div class="card"><h3>Prioridad de cada tema</h3><p class="small muted">Cuánto sale cada tema en «A boleo» y en el simulacro «con mis prioridades». 0 = no sale.</p>
  ${TOPICS.map(t => `<div class="row" style="flex-wrap:nowrap;margin:6px 0"><span style="min-width:120px" class="small">${t.short}</span><input type="range" min="0" max="5" step="0.5" value="${st.weights[t.id] ?? 0}" data-w="${t.id}" style="flex:1"><b class="mono" id="wv-${t.id}" style="width:30px;text-align:right">${st.weights[t.id] ?? 0}</b></div>`).join('')}
  <div class="row" style="margin-top:10px"><button class="btn ghost sm" id="wReal">Proporción real 2023-25</button><button class="btn ghost sm" id="wDef">Prioridad recomendada</button></div></div>
  <div class="card"><h3>Examen</h3><div class="grid"><div><label>Penalización por fallo</label><select id="pen"><option value="0">Sin penalización</option><option value="0.25">−0,25</option><option value="0.33">−0,33 (oficial)</option><option value="0.5">−0,5</option></select></div><div><label>Minutos del simulacro</label><input type="number" id="mins" value="${st.simMinutes}"></div></div></div>
  <div class="card"><h3>Tus datos</h3><div class="row" style="margin-top:8px"><button class="btn ghost sm" id="exp">Exportar progreso</button><label class="btn ghost sm" style="margin:0">Importar<input type="file" id="imp" accept=".json" hidden></label><span class="spacer"></span><button class="btn ghost sm" id="rst">Borrar progreso</button><button class="btn danger sm" id="del">Eliminar cuenta</button></div>
  <p class="small muted" style="margin-top:10px"><a href="legal.html#terminos" target="_blank">Términos</a> · <a href="legal.html#privacidad" target="_blank">Privacidad</a> · Opo ATC no tiene relación con ENAIRE.</p></div>`);
  $$('[data-th]').forEach(b => b.onclick = () => { localStorage.setItem(THEME_KEY, b.dataset.th); applyTheme(true); render(); });
  $('#pen').value = String([0, 0.25, 0.33, 0.5].reduce((a, b) => Math.abs(b - st.penalty) < Math.abs(a - st.penalty) ? b : a));
  $('#syncNow').onclick = () => sync(true);
  $('#out').onclick = () => { if (confirm('¿Cerrar sesión en este dispositivo?')) logout(); };
  const pt = $('#portal'); if (pt) pt.onclick = async () => { try { await OPO.portal(); } catch (e) { toast(e.message); } };
  const cp = $('#chp'); if (cp) cp.onclick = async () => { try { await api('password', { method: 'POST', body: { old: $('#op').value, pass: $('#np').value } }); toast('Contraseña cambiada'); render(); } catch (e) { toast(e.message); } };
  $$('[data-w]').forEach(r => r.oninput = () => { st.weights[r.dataset.w] = +r.value; $('#wv-' + r.dataset.w).textContent = r.value; save(true); });
  $('#wReal').onclick = () => { const s = realShares(); TOPICS.forEach(t => st.weights[t.id] = Math.round((s[t.id] || 0) * 20) / 2); save(true); render(); };
  $('#wDef').onclick = () => { TOPICS.forEach(t => st.weights[t.id] = t.w); save(true); render(); };
  $('#pen').onchange = e => { st.penalty = +e.target.value; save(true); };
  $('#mins').onchange = e => { st.simMinutes = Math.max(5, +e.target.value || 50); save(true); };
  $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })); a.download = 'opoatc-progreso-' + ymd() + '.json'; a.click(); };
  $('#imp').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { mergeState(S, JSON.parse(await f.text())); save(); toast('Importado'); render(); } catch (er) { toast('Archivo no válido'); } };
  $('#rst').onclick = () => { if (confirm('¿Borrar todo tu progreso? No se puede deshacer.') && confirm('¿Seguro del todo?')) { S = defaultState(); S.migrated = 1; S.settings.u = now(); localStorage.setItem(stateKey(), JSON.stringify(S)); api('sync', { method: 'PUT', body: JSON.stringify(S) }).catch(() => {}); render(); } };
  $('#del').onclick = async () => { if (!confirm('¿Eliminar tu cuenta y todo tu progreso? Si tienes una suscripción activa se cancelará. No se puede deshacer.')) return; if (prompt('Escribe ELIMINAR para confirmar') !== 'ELIMINAR') return; try { await api('account/delete', { method: 'POST' }); localStorage.removeItem(stateKey()); logout(); } catch (e) { toast(e.message); } };
};

routes['codigos'] = () => {
  if (!ME.admin) { location.hash = '#/'; return; }
  app(`${head('Cuenta', 'Códigos de invitación', 'Cada código sirve para crear una sola cuenta con acceso completo. Pásaselo a quien quieras invitar.')}<div id="invCard"><div class="card empty">Cargando…</div></div>`);
  loadInvites();
};
/* ---------- Mi perfil ---------- */
routes['perfil'] = () => {
  const nm = [ME.name, ME.surname].filter(Boolean).join(' ') || SESS.user;
  const since = ME.created ? new Date(ME.created).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : '';
  app(`${head('Cuenta', 'Mi perfil', 'Tus datos personales y de acceso.')}
  <div class="card row" style="gap:16px"><div class="avatar" style="width:58px;height:58px;font-size:21px">${esc(initials(nm))}</div><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:18px">${esc(nm)}</div><div class="small muted">${esc(ME.email || ME.user)}${since ? ' · en Opo ATC desde ' + since : ''}</div></div></div>
  <div class="card"><h3>Datos personales</h3>
    <div class="g2"><div><label>Nombre</label><input id="pnm" value="${esc(ME.name || '')}" autocomplete="given-name"></div><div><label>Apellidos</label><input id="psn" value="${esc(ME.surname || '')}" autocomplete="family-name"></div></div>
    <div class="g2"><div><label>Fecha de nacimiento</label><input id="pbd" type="date" value="${esc(ME.birth || '')}" max="${ymd()}"></div><div><label>Cómo nos conociste</label><input value="${esc(ME.source || '—')}" disabled></div></div>
    <label class="chk" style="margin-top:14px"><span class="switch"><input type="checkbox" id="pmk" ${ME.marketing ? 'checked' : ''}><i></i></span> Quiero recibir novedades de la oposición</label>
    <div class="row" style="margin-top:16px"><button class="btn" id="psave">${icon('check')} Guardar cambios</button><span class="small err" id="perr"></span></div></div>
  <div class="card"><h3>Email</h3><p class="small muted">Tu email actual es <b>${esc(ME.email || ME.user)}</b>. Si lo cambias, te enviaremos un enlace para confirmar el nuevo${ME.hasPass ? ' y te pediremos tu contraseña' : ''}.</p>
    <details><summary class="btn ghost sm" style="display:inline-flex">Cambiar email</summary>
    <div class="g2" style="margin-top:8px"><div><label>Email nuevo</label><input id="ne1" type="email" autocomplete="email"></div><div><label>Repite el email nuevo</label><input id="ne2" type="email" autocomplete="off" onpaste="return false"></div></div>
    ${ME.hasPass ? '<label>Tu contraseña</label><input id="nep" type="password" autocomplete="current-password">' : ''}
    <div class="row" style="margin-top:12px"><button class="btn sec" id="nesave">Cambiar email</button><span class="small err" id="neerr"></span></div></details></div>
  ${ME.hasPass ? `<div class="card"><h3>Contraseña</h3>
    <div class="g2"><div><label>Contraseña actual</label><input type="password" id="op" autocomplete="current-password"></div><div><label>Contraseña nueva</label><input type="password" id="np" autocomplete="new-password" placeholder="Mínimo 8 caracteres"></div></div>
    <label>Repite la contraseña nueva</label><input type="password" id="np2" autocomplete="new-password">
    <div class="row" style="margin-top:12px"><button class="btn sec" id="chp">Cambiar contraseña</button><span class="small err" id="cperr"></span></div></div>` : `<div class="card"><h3>Acceso</h3><p class="small muted">Entras con tu cuenta de Google.</p></div>`}
  <div class="card flat row"><div style="flex:1"><b>Eliminar cuenta</b><div class="small muted">Borra tu cuenta y todo tu progreso. Está en Ajustes → Tus datos.</div></div><a class="btn ghost sm" href="#/ajustes">Ir a Ajustes</a></div>`);
  $('#psave').onclick = async () => { $('#perr').textContent = '';
    try { const r = await api('account/update', { method: 'POST', body: { name: $('#pnm').value, surname: $('#psn').value, birth: $('#pbd').value, marketing: $('#pmk').checked } });
      Object.assign(ME, r); SESS.name = r.name; localStorage.setItem(SESS_KEY, JSON.stringify(SESS)); toast('Datos guardados'); shell(); render(); }
    catch (e) { $('#perr').textContent = e.message; } };
  $('#nesave').onclick = async () => { $('#neerr').textContent = '';
    try { const r = await api('account/email', { method: 'POST', body: { email: $('#ne1').value, email2: $('#ne2').value, pass: $('#nep')?.value || '' } });
      const oldKey = stateKey(); SESS.user = r.user; localStorage.setItem(SESS_KEY, JSON.stringify(SESS)); localStorage.setItem(stateKey(), localStorage.getItem(oldKey) || JSON.stringify(S)); localStorage.removeItem(oldKey);
      if (r.devLink) sessionStorage.setItem('devLink', r.devLink); toast('Email cambiado. Confírmalo con el enlace que te hemos enviado.'); setTimeout(() => location.reload(), 900); }
    catch (e) { $('#neerr').textContent = e.message; } };
  const cp = $('#chp'); if (cp) cp.onclick = async () => { $('#cperr').textContent = '';
    if ($('#np').value !== $('#np2').value) { $('#cperr').textContent = 'Las dos contraseñas nuevas no coinciden'; return; }
    try { await api('password', { method: 'POST', body: { old: $('#op').value, pass: $('#np').value } }); toast('Contraseña cambiada'); render(); } catch (e) { $('#cperr').textContent = e.message; } };
};

/* ---------- Plan y pagos ---------- */
routes['suscripcion'] = () => {
  const pi = planInfo(); const pay = !!ME.config?.payments; const cur = ME.plan && ['active', 'trialing', 'past_due'].includes(ME.plan.status) ? ME.plan.id : ME.comp;
  app(`${head('Cuenta', 'Plan y pagos', 'Tu plan, tus pagos y tus facturas.')}
  <div class="card hl"><div class="row" style="gap:14px"><div class="planic">${icon('star')}</div><div style="flex:1;min-width:0"><div class="tiny">Tu plan</div><div style="font-weight:800;font-size:19px;margin-top:2px">${esc(pi.name)}</div><div class="small muted">${esc(pi.line)}</div></div>
    <span class="pill ${ME.plan?.status === 'past_due' ? 'amber' : 'ok'}">${ME.plan?.status === 'past_due' ? 'Pago pendiente' : ME.plan?.cancelAt ? 'Cancelada' : 'Activo'}</span></div>
    ${pi.sub ? `<div class="row" style="margin-top:14px"><button class="btn sec sm" id="portal">${icon('card')} Método de pago, facturas y cancelar</button></div>` : ''}</div>
  ${!pay ? `<div class="warnbox">${icon('alert')}<div>Ahora mismo Opo ATC funciona solo por invitación y los pagos aún no están activos. ${ME.comp || ME.admin ? 'Tu acceso es gratuito: no se te va a cobrar nada.' : ''}</div></div>` : ''}
  <h2>${cur ? 'Cambiar de plan' : 'Planes'}</h2>
  <p class="small muted" style="margin-top:-6px">${pay ? 'Si subes de plan, solo pagas la diferencia proporcional en tu próxima factura. Cancela cuando quieras.' : 'Estos serán los planes cuando se activen los pagos.'}</p>
  <div id="plansBox">${OPO.planCards ? OPO.planCards(cur, null) : ''}</div>
  <h2>Facturas</h2><div id="invBox" class="card"><div class="empty">${pi.sub ? 'Cargando…' : 'Aún no tienes facturas.'}</div></div>`);
  if (!pay) $$('#plansBox [data-plan]').forEach(b => { b.disabled = true; b.textContent = b.textContent.includes('actual') ? 'Tu plan actual' : 'Próximamente'; });
  else $$('#plansBox [data-plan]').forEach(b => b.onclick = async () => { b.disabled = true; try { await OPO.checkout(b.dataset.plan); } catch (e) { toast(e.message); b.disabled = false; } });
  const pt = $('#portal'); if (pt) pt.onclick = async () => { try { await OPO.portal(); } catch (e) { toast(e.message); } };
  if (pi.sub) api('billing/invoices').then(r => {
    const box = $('#invBox'); if (!box) return; const l = r.invoices || [];
    const st = { paid: '<span class="pill ok">Pagada</span>', open: '<span class="pill amber">Pendiente</span>', void: '<span class="pill">Anulada</span>', uncollectible: '<span class="pill ko">Impagada</span>' };
    box.innerHTML = l.length ? `<div class="tblwrap"><table class="tbl"><tr><th>Fecha</th><th>Nº</th><th>Importe</th><th>Estado</th><th></th></tr>${l.map(i => `<tr><td>${new Date(i.date * 1000).toLocaleDateString('es-ES')}</td><td class="mono">${esc(i.number || '—')}</td><td class="mono">${(i.total / 100).toLocaleString('es-ES', { style: 'currency', currency: (i.currency || 'eur').toUpperCase() })}</td><td>${st[i.status] || esc(i.status)}</td><td style="text-align:right">${i.pdf ? `<a href="${esc(i.pdf)}" target="_blank" rel="noopener">${icon('receipt')} PDF</a>` : i.url ? `<a href="${esc(i.url)}" target="_blank" rel="noopener">Ver</a>` : ''}</td></tr>`).join('')}</table></div>` : '<div class="empty">Aún no tienes facturas.</div>';
  }).catch(() => { const box = $('#invBox'); if (box) box.innerHTML = '<div class="empty">No se han podido cargar las facturas.</div>'; });
};
/* ---------- Mejorar plan ---------- */
routes['mejorar'] = () => {
  location.hash = '#/suscripcion'; return;
  app(`${head('Cuenta', 'Mejora tu plan', 'Cambia de plan cuando quieras. Se ajusta automáticamente en tu próxima factura.')}${OPO.planCards ? OPO.planCards(ME.comp || ME.plan?.id, null) : ''}`);
  $$('[data-plan]').forEach(b => b.onclick = async () => { b.disabled = true; try { await OPO.checkout(b.dataset.plan); } catch (e) { toast(e.message); b.disabled = false; } });
};
const locked = (feature, title, text) => {
  const need = feature === 'ingles' ? 'ingles' : 'completo';
  app(`${head('Plan', title, '')}<div class="card hl lockcard"><div class="lockic">${icon('lock')}</div><h3>No está incluido en tu plan</h3><p class="muted">${text}</p>
    ${ME.config?.payments ? `<div class="row" style="justify-content:center"><button class="btn" id="upg">${icon('star')} Pasar a ${esc(PLAN_NAMES[need].replace('Fase I · ', ''))}</button></div>` : '<p class="small muted">Tu código de acceso no incluye esta sección.</p>'}</div>`);
  const ub = $('#upg'); if (ub) ub.onclick = async () => { try { await OPO.checkout(need); } catch (e) { toast(e.message); } };
};

async function loadInvites() {
  const box = $('#invCard'); if (!box) return;
  let list = []; try { list = (await api('invites')).invites; } catch (e) { return; }
  const st = i => i.usedBy ? `<span class="pill ok">usado por ${esc(i.usedBy)}</span>` : i.revoked ? '<span class="pill ko">anulado</span>' : '<span class="pill cyan">libre</span>';
  box.innerHTML = `<div class="card"><div class="row"><div style="flex:1"><h3>Códigos de acceso gratuito</h3><div class="small muted">Eres administrador. Cada código da acceso completo a una sola cuenta, sin pagar.</div></div><button class="btn sm" id="invNew">${icon('user')} Crear código</button></div>
    ${list.length ? `<div class="tblwrap" style="margin-top:10px"><table class="tbl"><tr><th>Código</th><th>Estado</th><th></th></tr>${list.map(i => `<tr><td class="mono">${esc(i.code)}</td><td>${st(i)}</td><td style="text-align:right">${!i.usedBy && !i.revoked ? `<button class="btn ghost sm" data-copy="${esc(i.code)}">Copiar</button><button class="btn ghost sm" data-rev="${esc(i.code)}">Anular</button>` : ''}</td></tr>`).join('')}</table></div>` : '<p class="small muted">Aún no has creado ninguno.</p>'}</div>`;
  $('#invNew').onclick = async () => { try { const r = await api('invites/create', { method: 'POST', body: {} }); try { await navigator.clipboard.writeText(r.code); toast('Código creado y copiado: ' + r.code); } catch (e) { toast('Código creado: ' + r.code); } loadInvites(); } catch (e) { toast(e.message); } };
  $$('[data-copy]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.copy); toast('Copiado'); } catch (e) { toast(b.dataset.copy); } });
  $$('[data-rev]').forEach(b => b.onclick = async () => { if (!confirm('¿Anular este código?')) return; await api('invites/revoke', { method: 'POST', body: { code: b.dataset.rev } }).catch(() => {}); loadInvites(); });
}

/* ---------- Arranque ---------- */
function boot() {
  QZ = null; EXZ = null; clearInterval(timerH);
  if (!SESS) { location.reload(); return; }
  loadState(); shell();
  if (S.plan?.cfg) { render(); sync(); return; }
  $('#app').innerHTML = '<div class="card empty">Cargando tu plan…</div>';
  Promise.race([sync(), new Promise(r => setTimeout(r, 6000))]).finally(() => {
    if (!S.plan?.cfg && !location.hash.startsWith('#/bienvenida')) location.hash = '#/bienvenida';
    else if (S.plan?.cfg && location.hash.startsWith('#/bienvenida') && !location.hash.includes('edit')) location.hash = '#/';
    render();
  });
}
boot();
})();
