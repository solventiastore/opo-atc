/* Opo ATC · ENAIRE — app de estudio. Vanilla JS, sin dependencias. */
(function () {
'use strict';
const D = window.DATA, R = window.RES || { res: {}, sched: { days: [], len: 31 }, qpage: {}, mem: [], docFails: [] };
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
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
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
D.en.forEach(x => { x.kind = 'eng'; Q[x.id] = x; });
D.words.forEach((w, i) => { Q['en-words-' + i] = { id: 'en-words-' + i, t: 'eng', sub: 'words', kind: 'eng', word: w, src: 'Exam English · CPE Vocabulary 2' }; });
function materialize(q) {
  if (q.sub !== 'words' || q.o) return q;
  const same = D.words.filter(w => w.p === q.word.p && w.w !== q.word.w);
  const dis = shuffle(same.length >= 3 ? same : D.words.filter(w => w.w !== q.word.w)).slice(0, 3).map(w => w.d);
  const o = shuffle([q.word.d, ...dis]);
  return Object.assign({}, q, { q: `${q.word.w} (${q.word.p})`, o, a: o.indexOf(q.word.d), r: `«${q.word.w}» (${q.word.p}) = ${q.word.d}` });
}
// Exámenes oficiales de inglés y prácticas (agrupados por examen)
const ENG_EXAMS = (() => { const m = {}; D.en.filter(x => x.ex).forEach(x => { (m[x.ex] = m[x.ex] || { id: x.ex, label: x.src, qs: [], sub: x.sub }).qs.push(x.id); }); return Object.values(m); })();
const EXAMS = (() => { const m = {}; D.ex.forEach(x => { (m[x.ex] = m[x.ex] || { id: x.ex, label: x.src.replace('Examen ', ''), qs: [] }).qs.push(x.id); }); return Object.values(m); })();
const pagesOf = t => R.res[t]?.pages || [];
const qForPages = (t, a, b) => D.q.filter(x => x.t === t && R.qpage[x.id] >= a && R.qpage[x.id] <= b).map(x => x.id);

/* ---------- Sesión, estado y persistencia ---------- */
const SESS_KEY = 'opo_session';
let SESS = null; try { SESS = JSON.parse(localStorage.getItem(SESS_KEY) || 'null'); } catch (e) {}
const stateKey = () => 'opo_state_' + (SESS?.local ? 'local' : SESS?.user);
const defaultSettings = () => ({
  u: 0, weights: Object.fromEntries(TOPICS.map(t => [t.id, t.w])), onlyHl: true, pool: 'both',
  penalty: 0.33, simMinutes: 50, examDate: '', planStart: '', planLen: 31,
  pages: { meteo: 20, ffhh: 20, carto: 14, nav: 18, aero: 8, fpl: 12, inst: 19, entorno: 3 }
});
const defaultState = () => ({ v: 2, q: {}, study: [], log: [], sims: [], ov: {}, pd: {}, rd: {}, ps: {}, settings: defaultSettings() });
let S = defaultState();
function loadState() {
  let s = null; try { s = JSON.parse(localStorage.getItem(stateKey()) || 'null'); } catch (e) {}
  S = Object.assign(defaultState(), s || {});
  S.settings = Object.assign(defaultSettings(), S.settings || {});
  ['pd', 'rd', 'ov', 'q', 'ps'].forEach(k => S[k] = S[k] || {});
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
  clearTimeout(saveT); saveT = setTimeout(sync, 2000);
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600); }

function mergeState(a, b) {
  if (!b) return a;
  a.ps = a.ps || {};
  for (const k of ['q', 'ov', 'pd', 'rd', 'ps']) for (const [id, r] of Object.entries(b[k] || {})) if (!a[k][id] || (r.u || 0) > (a[k][id].u || 0)) a[k][id] = r;
  for (const k of ['study', 'log', 'sims']) {
    const m = new Map((a[k] || []).map(x => [x.id, x]));
    for (const x of (b[k] || [])) { const y = m.get(x.id); if (!y) m.set(x.id, x); else if ((x.u || 0) > (y.u || 0)) m.set(x.id, x); else if (k === 'study' && x.ids) { y.ids = [...new Set([...y.ids, ...x.ids])]; } }
    a[k] = [...m.values()];
  }
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
  if (!SESS || SESS.local) { if (dot) dot.className = 'dot'; return; }
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
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && SESS) sync().then(() => { if (!busy()) render(); }); });
function logout(silent) {
  if (SESS && !SESS.local && !silent) api('logout', { method: 'POST' }).catch(() => {});
  SESS = null; localStorage.removeItem(SESS_KEY); boot();
}

/* ---------- Lógica de estudio ---------- */
const rec = id => S.q[id] || { n: 0, ok: 0, ko: 0 };
function inScope(q) {
  const o = S.ov[q.id]; if (o) return o.v === 'in';
  if (q.kind !== 'cuest') return true;
  return (q.hl ?? 1) >= 0.25;
}
function poolFor(topics, opts = {}) {
  const pool = opts.pool || S.settings.pool;
  return Object.values(Q).filter(q => q.kind !== 'eng' && topics.includes(q.t) && !q.dup && !q.res &&
    (pool === 'both' || (pool === 'cuest' ? q.kind === 'cuest' : q.kind === 'exam')) && (!S.settings.onlyHl || inScope(q)));
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
  const qs = D.q.filter(q => q.t === t); const sc = qs.filter(inScope);
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
  const ids = qForPages(t, a, b).filter(id => !S.settings.onlyHl || inScope(Q[id]));
  const n = addStudy(ymd(), t, ids, label || `resumen págs. ${a}–${b}`);
  S.log.push({ id: uid(), d: ymd(), topic: t, pf: a, pt: b, note: 'Leído en la app', u: now() });
  save(); return ids;
}

/* ---------- Plan adaptativo (a partir de tu Excel de seguimiento) ----------
   El Excel se convierte en una lista ordenada de «bloques» (cada día del Excel con tareas = 1 bloque).
   Cada día, al abrir la app, se fija qué bloques tocan hoy. Lo pendiente se reparte solo entre los días
   que quedan hasta el examen: si te atrasas, se comprime; si adelantas, se estira. */
const P = {
  groups: R.sched.days.filter(d => d.items.length).map((d, gi) => ({ gi, items: d.items.map((it, i) => Object.assign({ key: `${d.d}:${i}`, gi }, it)) })),
  finalNote: R.sched.days.filter(d => d.note).map(d => d.note).join('\n'),
  len: () => Math.max(7, +S.settings.planLen || R.sched.len || 31),
  firstDay() { const ds = Object.keys(S.ps || {}).sort(); return S.settings.planStart || ds[0] || ymd(); },
  // último día de estudio: la víspera del examen (o inicio + duración si no hay fecha)
  end() { return S.settings.examDate ? addDays(S.settings.examDate, -1) : addDays(P.firstDay(), P.len() - 1); },
  done: key => !!S.pd[key]?.v,
  doneOn: key => S.pd[key]?.v ? (S.pd[key].d || null) : null,
  setDone(key, v) { S.pd[key] = { v: v ? 1 : 0, u: now(), d: v ? ymd() : null }; save(); },
  pendingG: g => g.items.some(it => !P.done(it.key)),
  // reparte una lista de bloques entre los días [from, to]
  spread(list, from, to) {
    const N = Math.max(1, diffDays(from, to) + 1), n = list.length, out = {};
    list.forEach((g, i) => { const d = addDays(from, Math.floor(i * N / n)); (out[d] = out[d] || []).push(g.gi); });
    return out;
  },
  // fija los bloques de hoy la primera vez que se abre la app en el día
  today() {
    const t = ymd(); S.ps = S.ps || {};
    if (!S.ps[t]) {
      const pend = P.groups.filter(P.pendingG);
      const first = P.spread(pend, t, P.end() < t ? t : P.end())[t] || [];
      S.ps[t] = { g: first, u: now() }; save();
    }
    return S.ps[t].g;
  },
  // planificación completa: {fecha: [bloques]} desde hoy hasta el último día
  schedule() {
    const t = ymd(), todayG = P.today(), end = P.end() < t ? t : P.end();
    const rest = P.groups.filter(g => P.pendingG(g) && !todayG.includes(g.gi));
    const fut = end > t ? P.spread(rest, addDays(t, 1), end) : (rest.length ? { [t]: rest.map(g => g.gi) } : {});
    const sch = { [t]: [...todayG, ...(end > t ? [] : (fut[t] || []))] };
    for (const [d, gs] of Object.entries(fut)) if (d !== t) sch[d] = gs;
    return sch;
  },
  adelantar() { // trae a hoy el siguiente bloque pendiente
    const sch = P.schedule(), t = ymd(); const next = Object.keys(sch).filter(d => d > t).sort()[0];
    if (!next) return 0; S.ps[t].g = [...S.ps[t].g, ...sch[next]]; S.ps[t].u = now(); save(); return sch[next].length;
  },
  itemsOf: gis => gis.flatMap(gi => P.groups[gi].items),
  stats() {
    const all = P.groups.flatMap(g => g.items); const done = all.filter(it => P.done(it.key)).length;
    const t = ymd(); const daysLeft = Math.max(1, diffDays(t, P.end()) + 1);
    return { total: all.length, done, left: all.length - done, daysLeft, perDay: (all.length - done) / daysLeft, blocksLeft: P.groups.filter(P.pendingG).length };
  },
};
const itemLabel = it => it.k === 'res' ? `págs. ${it.a}${it.b !== it.a ? '–' + it.b : ''}` : it.k === 'q' ? `preg. ${it.a}–${it.b}` : (it.n || '30 min');

/* ---------- Shell / navegación ---------- */
const NAV = [
  { g: 'Estudiar', items: [['', 'home', 'Inicio'], ['hoy', 'sun', 'Hoy toca'], ['resumenes', 'book', 'Resúmenes'], ['memorizar', 'brain', 'Memorizar'], ['temario', 'marker', 'Temario subrayado'], ['cambios', 'alert', 'Cambios 2026']] },
  { g: 'Practicar', items: [['aleatorio', 'shuffle', 'Preguntas a boleo'], ['cuestionarios', 'layers', 'Cuestionarios'], ['repaso', 'repeat', 'Repaso 1·3·7'], ['falladas', 'x', 'Falladas'], ['examenes', 'exam', 'Exámenes y simulacros'], ['ingles', 'globe', 'Inglés']] },
  { g: 'Seguimiento', items: [['plan', 'grid', 'Mi plan'], ['planning', 'cal', 'Planning'], ['stats', 'chart', 'Estadísticas'], ['ajustes', 'gear', 'Ajustes']] },
];
const TITLES = Object.fromEntries(NAV.flatMap(g => g.items.map(([r, , t]) => [r, t]))); TITLES.practicar = 'Practicar'; TITLES.mas = 'Más';
const THEME_KEY = 'opo_theme';
const theme = () => localStorage.getItem(THEME_KEY) || 'light';
function applyTheme(inApp) {
  const light = inApp && theme() === 'light';
  document.body.classList.toggle('light', light);
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = light ? '#ffffff' : '#05080f';
}
const initials = n => (n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

function shell() {
  applyTheme(true);
  const nm = SESS.name || SESS.user || 'Invitado';
  $('#root').innerHTML = `<div class="shell">
    <aside class="side">
      <div class="logo"><span class="mark">${icon('plane')}</span><span>Opo ATC<div class="tiny" style="letter-spacing:.08em">Controlador ENAIRE</div></span></div>
      <nav>${NAV.map(g => `<div class="tiny grp">${g.g}</div>` + g.items.map(([r, ic, t]) => `<a href="#/${r}" data-r="${r}">${icon(ic)}<span>${t}</span><span class="cnt" data-cnt="${r}"></span></a>`).join('')).join('')}</nav>
      <div class="me"><div class="avatar">${esc(initials(nm))}</div><div style="flex:1;min-width:0"><div style="font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nm)}</div><div class="small muted">${SESS.local ? 'Solo este dispositivo' : '@' + esc(SESS.user)}</div></div><span id="syncDot" class="dot" title="Sincronización"></span></div>
    </aside>
    <div>
      <header class="topbar"><div class="logo"><span class="mark">${icon('plane')}</span></div><div class="ttl" id="ttl"></div><span id="syncDot2" class="dot"></span><a class="avatar" href="#/ajustes" title="Cuenta">${esc(initials(nm))}</a></header>
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
  // el punto de sincronización del móvil refleja el del escritorio
  const d1 = $('#syncDot'), d2 = $('#syncDot2');
  new MutationObserver(() => { d2.className = d1.className; d2.title = d1.title; }).observe(d1, { attributes: true });
}
function updateChrome(r) {
  $$('.side nav a').forEach(a => a.classList.toggle('on', a.dataset.r === r));
  const tabMap = { '': '', hoy: 'hoy', plan: 'hoy', falladas: 'falladas', aleatorio: 'practicar', cuestionarios: 'practicar', repaso: 'practicar', examenes: 'practicar', ingles: 'practicar', practicar: 'practicar' };
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
const busy = () => (QZ && !QZ.finished) || (EXZ && !EXZ.done);
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
  QZ.cur = materialize(Q[id]); QZ.chosen = null; QZ.count++;
  QZ.seen.push(id); if (QZ.seen.length > 40) QZ.seen.shift();
  renderQuiz();
}
function answer(idx) {
  if (QZ.chosen != null) return;
  const q = QZ.cur; QZ.chosen = idx; const ok = idx === q.a;
  ok ? QZ.ok++ : QZ.ko++;
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
  if (q.kind === 'cuest' && !inScope(q)) b.push('<span class="pill ko">Posiblemente no subrayado</span>');
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
      <div class="qtext">${esc(q.q)}</div>
      ${q.o.map((o, i) => `<button class="opt ${done ? (i === q.a ? 'ok' : i === z.chosen ? 'ko' : '') : ''}" data-i="${i}" ${done ? 'disabled' : ''}><span class="l">${L[i].toUpperCase()}</span><span>${esc(o)}</span></button>`).join('')}
      ${done ? `<div class="fb ${ok ? 'ok' : 'ko'}">${icon(ok ? 'check' : 'x')}<div>${ok ? 'Correcto' : 'Incorrecto · la buena es la ' + L[q.a].toUpperCase() + ': ' + esc(q.o[q.a])}</div></div>${q.r ? `<div class="rule ${ok ? '' : 'open'}"><div class="rh">${icon('book')} ${ok ? 'La regla' : 'Para no volver a fallarla'}</div><div>${esc(q.r)}</div>${q.kn ? `<div class="small muted" style="margin-top:6px">Nota de la clave: ${esc(q.kn)}</div>` : ''}</div>` : ''}${q.x ? `<div class="warnbox">${icon('alert')}<div>${esc(q.x)}</div></div>` : ''}
        ${q.kind === 'cuest' ? `<div class="row small" style="margin-top:8px">${pg && pagesOf(q.t).length ? `<a href="#/resumenes/${q.t}/${pg}">${icon('book', 'chev')} Ver en tu resumen (p. ${pg})</a>` : ''}${q.pg ? `<a href="#/temario/${TOP[q.t].n}/${q.pg[0]}">${icon('marker', 'chev')} Subrayado p. ${q.pg[0]}</a>` : ''}<span class="spacer"></span><a href="#" data-ov="${(ov === 'out' || (!ov && !inScope(q))) ? 'in' : 'out'}" class="muted">${(ov === 'out' || (!ov && !inScope(q))) ? 'Marcar «sí entra»' : 'Marcar «no entra»'}</a></div>` : ''}` : ''}
    </div>
    <div class="qactions"><button class="btn block" id="nextBtn" ${done ? '' : 'disabled'}>Siguiente ${icon('chevR')}</button><button class="btn ghost" id="endBtn">Terminar</button></div>
    <div class="kbd">Teclado: 1-9 o A-D para responder · Enter para seguir</div>`);
  $$('.opt').forEach(b => b.onclick = () => answer(+b.dataset.i));
  $('#nextBtn').onclick = nextQuestion; $('#endBtn').onclick = finishQuiz;
  const o = $('[data-ov]'); if (o) o.onclick = e => { e.preventDefault(); S.ov[q.id] = { v: o.dataset.ov, u: now() }; save(); toast(o.dataset.ov === 'out' ? 'Marcada «no entra»: no saldrá con el filtro de subrayado' : 'Marcada «sí entra»'); renderQuiz(); };
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
  const st = streak(); const items = P.itemsOf(P.today()).concat(P.groups.flatMap(g => g.items).filter(it => P.doneOn(it.key) === ymd() && !P.today().includes(it.gi))); const pst = P.stats();
  const doneN = items.filter(i => P.done(i.key)).length;
  const h = new Date().getHours(); const hi = h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
  const prio = TOPICS.filter(t => t.id !== 'entorno');
  app(`${head(fmtDate(ymd(), { weekday: 'long', day: 'numeric', month: 'long' }), `${hi}, ${esc((SESS.name || '').split(' ')[0] || 'piloto')}`, 'Tu torre de control para la oposición a controlador de ENAIRE.')}
  <div class="grid g4" style="margin-top:16px">
    <a class="kpi" href="#/planning"><div class="ic c-cyan">${icon('target')}</div><div class="tiny">Examen</div><div class="v">${days != null ? (days >= 0 ? days : '—') : '—'}</div><div class="s">${S.settings.examDate ? 'días · ' + fmtDate(S.settings.examDate) : 'Pon la fecha en Planning'}</div></a>
    <a class="kpi" href="#/repaso"><div class="ic c-violet">${icon('repeat')}</div><div class="tiny">Repasos hoy</div><div class="v">${dr.length}</div><div class="s">1 · 3 · 7 días</div></a>
    <a class="kpi" href="#/falladas"><div class="ic c-ko">${icon('x')}</div><div class="tiny">Falladas</div><div class="v">${pf.length}</div><div class="s">pendientes de dominar</div></a>
    <a class="kpi" href="#/stats"><div class="ic c-amber">${icon('flame')}</div><div class="tiny">Racha</div><div class="v">${st}</div><div class="s">${todayN} preguntas hoy</div></a>
  </div>
  <a class="card hl" href="#/hoy" style="display:flex;gap:16px;align-items:center;color:inherit">
    ${ring(pct(doneN, items.length || 1), 70, 8, items.length ? `${doneN}/${items.length}` : '—')}
    <div style="flex:1"><div class="eyebrow" style="margin:0">Hoy toca · plan al ${pct(pst.done, pst.total)}% · quedan ${pst.left} tareas</div>
    <div style="font-weight:650;margin-top:4px">${items.length ? items.filter(i => i.k !== 'psico').slice(0, 4).map(i => `${TOP[i.t]?.short || tname(i.t)} ${i.k === 'res' ? 'págs. ' + i.a + '–' + i.b : 'preg. ' + i.a + '–' + i.b}`).join(' · ') : 'Día de repaso: falladas y repasos 1·3·7'}</div></div>${icon('chevR', 'chev')}</a>
  <div class="row" style="margin:14px 0 6px"><a class="btn" href="#/aleatorio">${icon('shuffle')} A boleo</a><a class="btn sec" href="#/cuestionarios">${icon('layers')} Cuestionarios</a><a class="btn sec" href="#/examenes">${icon('exam')} Simulacro</a></div>
  ${R.cambios ? `<a class="card flat row" href="#/cambios" style="color:inherit"><div class="ico" style="width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:var(--glass2)">${icon('alert')}</div><div style="flex:1"><b>Temario 2026 publicado</b><div class="small muted">Casi todo son erratas; cambian sobre todo las fichas de aeronaves (tema 2) y la flecha del ala (tema 9).</div></div>${icon('chevR', 'chev')}</a>` : ''}
  <h2>Tu progreso por tema</h2>
  <div class="topics">${prio.map(t => { const s = topicStats(t.id); return `<a class="topic" href="#/cuestionarios/${t.id}" style="--tc:${t.c}33"><div class="n">TEMA ${t.n}</div><div class="nm">${t.name}${t.w >= 3 ? '<span class="pill cyan">prioritario</span>' : ''}</div>
    <div class="bar"><i style="width:${pct(s.seen, s.scope)}%;background:${t.c}"></i></div><div class="row small muted"><span>${pct(s.seen, s.scope)}% hecho</span><span class="spacer"></span><span>${pct(s.ok, s.seen)}% acierto</span></div></a>`; }).join('')}</div>
  ${SESS.local ? `<div class="warnbox">${icon('alert')}<div>Estás usando la app sin cuenta: el progreso solo se guarda en este dispositivo. <a href="#/ajustes">Crea una cuenta</a> para tenerlo en el móvil y en el PC.</div></div>` : ''}`);
};

/* ---------- Hoy toca (plan adaptativo) ---------- */
function taskCard(it, day) {
  const d = P.done(it.key), on = P.doneOn(it.key); const t = TOP[it.t]; const isPast = day < ymd();
  let title, desc, actions = '';
  if (it.k === 'res') {
    const has = pagesOf(it.t).length; const nq = qForPages(it.t, it.a, it.b).length;
    title = `${tname(it.t)} · resumen págs. ${it.a}${it.b !== it.a ? '–' + it.b : ''}`;
    desc = has ? `${(it.b - it.a + 1) * (R.sched.minPerPage || 30)} min aprox.${nq ? ` · ${nq} preguntas de estas páginas irán al repaso 1·3·7` : ''}${R.res[it.t].exact ? '' : ' · páginas aproximadas'}` : 'Aún no tengo tu resumen de este tema.';
    if (has) actions = `<a class="btn sm" href="#/resumenes/${it.t}/${it.a}?to=${it.b}&task=${encodeURIComponent(it.key)}">${icon('book')} Leer</a>`;
  } else if (it.k === 'q') {
    const n = D.q.filter(x => x.t === it.t && x.n >= it.a && x.n <= it.b).length;
    title = `${tname(it.t)} · cuestionario preguntas ${it.a}–${it.b}`; desc = `${n} preguntas${it.n ? ' · ' + esc(it.n) : ''} · entran en tu repaso 1·3·7`;
    actions = `<button class="btn sm" data-q="${it.key}">${icon('play')} Hacer</button>`;
  } else { title = 'Psicotécnicos'; desc = esc(it.n || '30 min'); }
  const badge = d ? (on && on !== day ? `<span class="pill ok">hecho el ${fmtDate(on)}</span>` : '') : (isPast ? '<span class="pill amber">pendiente → se ha recolocado</span>' : '');
  return `<div class="task ${d ? 'done' : ''}" style="border-left:3px solid ${t?.c || '#94a3b8'}"><button class="tick" data-tick="${it.key}" aria-label="Hecho">${icon('check')}</button>
    <div class="body"><div class="tt">${title} ${badge}</div><div class="small muted" style="margin:3px 0 8px">${desc}</div><div class="row">${actions}</div></div></div>`;
}
function bindTasks(items, back) {
  $$('[data-tick]').forEach(b => b.onclick = () => {
    const key = b.dataset.tick, it = items.find(i => i.key === key), nv = !P.done(key);
    P.setDone(key, nv);
    if (nv && it.k === 'res' && pagesOf(it.t).length) { const ids = markRead(it.t, it.a, it.b); if (ids.length) toast(`${ids.length} preguntas de estas páginas al repaso 1·3·7`); }
    render();
  });
  $$('[data-q]').forEach(b => b.onclick = () => {
    const it = items.find(i => i.key === b.dataset.q);
    const ids = D.q.filter(x => x.t === it.t && x.n >= it.a && x.n <= it.b).map(x => x.id);
    startQuiz({ title: `${tname(it.t)} ${it.a}–${it.b}`, list: ids, studyTopic: it.t, back, onFinish: z => { if (z.i >= z.list.length) P.setDone(it.key, true); } });
  });
}
const taskMins = items => items.reduce((a, i) => a + (i.k === 'res' ? (i.b - i.a + 1) * (R.sched.minPerPage || 30) : i.k === 'q' ? Math.ceil((i.b - i.a + 1) * 0.6) : 30), 0);
routes['hoy'] = (args, q) => {
  const t = ymd(); const day = q.f || t; const sch = P.schedule(); const isToday = day === t, isPast = day < t;
  const gis = isPast ? (S.ps[day]?.g || []) : (sch[day] || []);
  let items = P.itemsOf(gis);
  if (isPast || isToday) { const extra = P.groups.flatMap(g => g.items).filter(it => P.doneOn(it.key) === day && !gis.includes(it.gi)); items = items.concat(extra); }
  const doneN = items.filter(i => P.done(i.key)).length; const mins = taskMins(items.filter(i => !P.done(i.key)));
  const days = Object.keys(sch).sort(); const nextDay = days.find(d => d > t); const nextN = nextDay ? P.itemsOf(sch[nextDay]).length : 0;
  const st = P.stats(); const back = '#/hoy' + (q.f ? '?f=' + q.f : '');
  const nav = `<div class="daynav"><button data-f="${addDays(day, -1)}" aria-label="Día anterior">${icon('chevL')}</button>${!isToday ? `<button data-f="${t}" style="width:auto;padding:0 12px;font-weight:600;font-size:13px">Hoy</button>` : ''}<button data-f="${addDays(day, 1)}" aria-label="Día siguiente">${icon('chevR')}</button></div>`;
  app(`${head(fmtDate(day, { weekday: 'long', day: 'numeric', month: 'long' }) + (isToday ? ' · hoy' : ''), isToday ? 'Hoy toca' : isPast ? 'Lo que tocaba' : 'Lo que toca', isToday ? 'El plan sale de tu Excel y se recalcula solo: lo que no hagas pasa a los días siguientes, y lo que adelantes libera días.' : isPast ? 'Lo que no hiciste ese día ya está recolocado en los días siguientes.' : 'Puedes adelantar estas tareas: márcalas al hacerlas y el plan se recalcula.', nav)}
  <div class="card flat row" style="gap:16px">${ring(pct(doneN, items.length || 1), 64, 7, items.length ? doneN + '/' + items.length : '—')}<div style="flex:1"><div style="font-weight:650">${items.length ? `${items.length} tareas${mins ? ` · ~${Math.round(mins / 60 * 10) / 10} h pendientes` : ' · ¡todo hecho!'}` : 'Día libre o de repaso'}</div>
    <div class="small muted">Quedan ${st.left} tareas en ${st.daysLeft} días${S.settings.examDate ? ` · examen el ${fmtDate(S.settings.examDate)}` : ' · pon la fecha del examen en Planning'}</div></div><a class="btn ghost sm" href="#/plan">${icon('grid')} Mi plan</a></div>
  ${items.map(it => taskCard(it, day)).join('') || `<div class="card empty">${icon('repeat')}<div>${isPast ? 'Ese día no había tareas.' : 'No hay temario nuevo este día. Aprovecha para repasos y falladas.'}</div></div>`}
  ${day === P.end() && P.finalNote ? `<div class="warnbox">${icon('alert')}<div><b>Repaso final (de tu Excel):</b><div style="white-space:pre-wrap">${esc(P.finalNote)}</div></div></div>` : ''}
  ${isToday && nextN ? `<div class="card ${doneN === items.length ? 'hl' : 'flat'} row"><div style="flex:1"><b>${doneN === items.length && items.length ? '¡Día completado! ' : ''}¿Te animas con lo de mañana?</b><div class="small muted">${nextN} tareas del ${fmtDate(nextDay)}. Si las haces hoy, el resto del plan se recoloca.</div></div><button class="btn ${doneN === items.length ? '' : 'sec'}" id="adel">${icon('chevR')} Adelantar</button></div>` : ''}
  <div class="row" style="margin-top:14px"><a class="btn ghost sm" href="#/repaso">${icon('repeat')} Repasos 1·3·7 (${dueReviews().length})</a><a class="btn ghost sm" href="#/planning">${icon('cal')} Fecha del examen</a></div>`);
  $$('[data-f]').forEach(b => b.onclick = () => { location.hash = '#/hoy?f=' + b.dataset.f; });
  const ad = $('#adel'); if (ad) ad.onclick = () => { const n = P.adelantar(); toast(n ? 'Añadido a hoy. El plan se ha recolocado.' : 'No hay más tareas'); render(); };
  bindTasks(items, back);
};

/* ---------- Mi plan (vista tipo Excel) ---------- */
const PLAN_COLS = [['res', 'meteo', 'Meteo'], ['res', 'ffhh', 'FFHH'], ['res', 'carto', 'Carto'], ['res', 'nav', 'Nav'], ['res', 'aero', 'Aero'], ['res', 'fpl', 'Plan vuelo'], ['res', 'inst', 'Instit.'], ['psico', 'psico', 'Psicos'],
  ['q', 'inst', 'Instit.'], ['q', 'oaci', 'Códigos'], ['q', 'meteo', 'Meteo'], ['q', 'carto', 'Carto'], ['q', 'nav', 'Nav'], ['q', 'fpl', 'Plan vuelo'], ['q', 'ffhh', 'FFHH'], ['q', 'aero', 'Aero']];
routes['plan'] = () => {
  const t = ymd(); const sch = P.schedule(); const st = P.stats();
  const from = [P.firstDay(), ...Object.keys(S.ps || {})].sort()[0]; const end = P.end() < t ? t : P.end();
  const dates = []; for (let d = from; d <= end; d = addDays(d, 1)) dates.push(d);
  const itemsFor = d => {
    const gis = d < t ? (S.ps[d]?.g || []) : (sch[d] || []); let its = P.itemsOf(gis);
    if (d <= t) its = its.concat(P.groups.flatMap(g => g.items).filter(it => P.doneOn(it.key) === d && !gis.includes(it.gi)));
    return its;
  };
  const cls = (it, d) => P.done(it.key) ? 'c-done' : d < t ? 'c-miss' : d === t ? 'c-today' : 'c-fut';
  const strip = dates.map(d => { const its = itemsFor(d); const dn = its.filter(i => P.done(i.key)).length; const pc = its.length ? dn / its.length : 0;
    const c = !its.length ? 'none' : d < t ? (pc === 1 ? 'full' : pc > 0 ? 'part' : 'miss') : d === t ? 'today' : 'fut';
    return `<a class="hs ${c}" href="#/hoy?f=${d}" title="${fmtDate(d)}: ${dn}/${its.length}"><span>${new Date(d + 'T12:00:00').getDate()}</span></a>`; }).join('');
  const rows = dates.map(d => { const its = itemsFor(d); if (!its.length && d < t) return '';
    const cells = PLAN_COLS.map(([k, tp]) => { const c = its.filter(i => i.k === k && i.t === tp); return `<td>${c.map(i => `<span class="pc ${cls(i, d)}">${esc(itemLabel(i))}</span>`).join('')}</td>`; }).join('');
    return `<tr class="${d === t ? 'trow' : ''}"><th><a href="#/hoy?f=${d}">${fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })}</a></th>${cells}</tr>`; }).join('');
  app(`${head('Seguimiento', 'Mi plan', 'Tu Excel de seguimiento convertido en plan vivo. Lo que no haces se recoloca en los días siguientes y lo que adelantas libera días. Toca un día para ver sus tareas.')}
  <div class="grid g4" style="margin-top:14px">
    <div class="kpi"><div class="tiny">Hecho</div><div class="v">${pct(st.done, st.total)}%</div><div class="s">${st.done} de ${st.total} tareas</div></div>
    <div class="kpi"><div class="tiny">Quedan</div><div class="v">${st.left}</div><div class="s">tareas (${st.blocksLeft} días del Excel)</div></div>
    <div class="kpi"><div class="tiny">Días hasta el final</div><div class="v">${st.daysLeft}</div><div class="s">${S.settings.examDate ? 'examen el ' + fmtDate(S.settings.examDate) : 'sin fecha de examen'}</div></div>
    <div class="kpi"><div class="tiny">Ritmo necesario</div><div class="v">${st.perDay.toFixed(1)}</div><div class="s">tareas al día ${st.blocksLeft > st.daysLeft ? '<b class="c-ko">· vas justo</b>' : '<b class="c-ok">· vas bien</b>'}</div></div></div>
  <div class="bar ok" style="height:10px;margin:14px 0"><i style="width:${pct(st.done, st.total)}%"></i></div>
  <h2>Calendario</h2>
  <div class="card"><div class="hstrip">${strip}</div>
    <div class="legend" style="justify-content:flex-start;gap:14px;flex-wrap:wrap;margin-top:10px"><span><i class="lg full"></i>hecho</span><span><i class="lg part"></i>a medias</span><span><i class="lg miss"></i>no hecho (recolocado)</span><span><i class="lg today"></i>hoy</span><span><i class="lg fut"></i>pendiente</span></div></div>
  <h2>Día a día (como tu Excel)</h2>
  <div class="card ptable-wrap"><table class="ptable"><thead><tr><th rowspan="2">Día</th><th colspan="7" class="grp">Resúmenes (páginas)</th><th rowspan="2">Psicos</th><th colspan="8" class="grp">Cuestionarios (preguntas)</th></tr>
    <tr>${PLAN_COLS.filter(c => c[0] !== 'psico').map(c => `<th>${c[2]}</th>`).join('')}</tr></thead>
    <tbody>${rows}${S.settings.examDate ? `<tr class="erow"><th>${fmtDate(S.settings.examDate, { weekday: 'short', day: 'numeric', month: 'short' })}</th><td colspan="16">EXAMEN ✈</td></tr>` : ''}</tbody></table></div>
  <div class="small muted" style="margin-top:8px"><span class="pc c-done">verde</span> hecho · <span class="pc c-today">azul</span> hoy · <span class="pc c-fut">gris</span> pendiente · <span class="pc c-miss">ámbar</span> no hecho ese día (ya recolocado)</div>`);
};

/* ---------- Resúmenes ---------- */
routes['resumenes'] = (args, q) => {
  const [t, p] = args;
  if (!t) {
    const list = TOPICS.map(x => x.id).filter(id => pagesOf(id).length);
    const missing = TOPICS.filter(x => !pagesOf(x.id).length && x.id !== 'oaci');
    app(`${head('Estudiar', 'Resúmenes', 'Tus apuntes, dentro de la app y sin descargar nada. Al marcar páginas como estudiadas, sus preguntas del cuestionario entran en el repaso a 1, 3 y 7 días.')}
    <div class="topics" style="margin-top:14px">${list.map(id => { const x = TOP[id], v = R.res[id]; const n = v.pages.length; const rd = v.pages.filter(pg => S.rd[id + ':' + pg.p]?.v).length;
      return `<a class="topic" href="#/resumenes/${id}" style="--tc:${x.c}33"><div class="n">TEMA ${x.n} · ${n} ${v.bysec ? 'secciones' : 'páginas'}</div><div class="nm">${x.name}</div><div class="small muted">${esc(v.src)}</div><div class="bar"><i style="width:${pct(rd, n)}%;background:${x.c}"></i></div><div class="small muted">${rd}/${n} estudiadas</div></a>`; }).join('')}</div>
    ${missing.length ? `<div class="warnbox">${icon('alert')}<div>Me faltan tus resúmenes de: ${missing.map(x => x.name).join(', ')}.</div></div>` : ''}`);
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
  app(`<div class="qtop"><a class="btn ghost sm" href="${q.task ? '#/hoy' : '#/resumenes/' + t}">${icon('chevL')}</a><span class="small muted" style="flex:1">${esc(x.name)} · ${v.bysec ? 'sección' : 'pág.'} ${a}${b !== a ? '–' + b : ''} de ${last}</span>${v.exact ? '' : '<span class="pill">aprox.</span>'}</div>
  ${pages.map(pg => `<div class="card"><div class="pagehead"><span class="pill" style="color:${x.c}">${v.bysec ? 'Sección' : 'Página'} ${pg.p}</span>${S.rd[t + ':' + pg.p]?.v ? `<span class="pill ok">${icon('check')} estudiada</span>` : ''}<span class="spacer"></span>${pg.img ? `<button class="btn ghost sm" data-img="${pg.p}">${icon('image')} Foto original</button>` : ''}</div>
    ${pg.img ? `<img class="photo hidden" id="img${pg.p}" loading="lazy" src="${pg.img}" alt="Foto de la página ${pg.p}">` : ''}
    <div class="prose">${pg.h}</div></div>`).join('')}
  <div class="card flat row">${nq.length ? `<span class="small muted">${nq.length} preguntas del cuestionario salen de ${b !== a ? 'estas páginas' : 'esta página'}</span>` : ''}<span class="spacer"></span>
    ${nq.length ? `<button class="btn sec sm" id="prac">${icon('play')} Practicarlas</button>` : ''}<button class="btn sm" id="markRead" ${allRead && !q.task ? 'disabled' : ''}>${icon('check')} ${allRead ? 'Estudiado' : 'Marcar como estudiado'}</button></div>
  <div class="row" style="justify-content:space-between;margin-top:8px">${a > 1 ? `<a class="btn ghost" href="#/resumenes/${t}/${a - 1}">${icon('chevL')} Anterior</a>` : '<span></span>'}${b < last ? `<a class="btn ghost" href="#/resumenes/${t}/${b + 1}">Siguiente ${icon('chevR')}</a>` : ''}</div>`);
  $$('[data-img]').forEach(bt => bt.onclick = () => $('#img' + bt.dataset.img).classList.toggle('hidden'));
  const pr = $('#prac'); if (pr) pr.onclick = () => startQuiz({ title: `${x.short} · págs. ${a}–${b}`, list: nq, studyTopic: t, back: location.hash });
  $('#markRead').onclick = () => { const ids = markRead(t, a, b); if (q.task) P.setDone(q.task, true); toast(ids.length ? `Hecho · ${ids.length} preguntas al repaso 1·3·7` : 'Marcado como estudiado'); if (q.task) location.hash = '#/hoy'; else render(); };
};

/* ---------- Memorizar ---------- */
routes['memorizar'] = (args, q) => {
  const i = args[0] != null ? +args[0] : null; const mode = q.m || 'leer';
  const fails = (R.docFails || []).filter(id => Q[id]);
  if (i == null) {
    const byT = {}; fails.forEach(id => { const t = Q[id].t; (byT[t] = byT[t] || []).push(id); });
    app(`${head('Estudiar', 'Memorizar', 'Los datos concretos que te hiciste para aprender de memoria y tus preguntas falladas. Usa el modo huecos para ponerte a prueba.')}
    <div class="card hl"><div class="row"><div class="list" style="flex:1"><div class="li" style="border:0;padding:0"><div class="ico c-ko">${icon('x')}</div><div><div class="t">Tus preguntas falladas</div><div class="d">${fails.length} preguntas de tu documento, con la respuesta oficial del cuestionario</div></div></div></div><button class="btn" id="allF">${icon('play')} Practicar</button></div>
    <div class="chips" style="margin-top:12px">${Object.entries(byT).map(([t, l]) => `<button class="chip" data-ft="${t}">${esc(TOP[t]?.short)} · ${l.length}</button>`).join('')}</div></div>
    <h2>Datos para memorizar</h2>
    <div class="topics">${R.mem.map((m, k) => { const x = TOP[m.t] || {}; const n = (m.h.match(/<strong>/g) || []).length; return `<a class="topic" href="#/memorizar/${k}" style="--tc:${x.c || '#22d3ee'}33"><div class="n">${x.n ? 'TEMA ' + x.n : ''}</div><div class="nm">${esc(x.name || m.title)}</div><div class="small muted">${n} datos clave</div><div class="row" style="margin-top:10px"><span class="pill">${icon('book')} Leer</span><span class="pill cyan">${icon('eye')} Huecos</span><span class="pill violet">${icon('cards')} Tarjetas</span></div></a>`; }).join('')}</div>`);
    $('#allF').onclick = () => startQuiz({ title: 'Tus falladas', list: shuffle(fails), back: '#/memorizar' });
    $$('[data-ft]').forEach(b => b.onclick = () => startQuiz({ title: 'Falladas · ' + TOP[b.dataset.ft].short, list: shuffle(byT[b.dataset.ft]), back: '#/memorizar' }));
    return;
  }
  const m = R.mem[i]; if (!m) return render();
  const x = TOP[m.t] || {};
  const tabs = `<div class="seg">${[['leer', 'Leer'], ['huecos', 'Huecos'], ['tarjetas', 'Tarjetas']].map(([k, l]) => `<button class="${mode === k ? 'on' : ''}" data-m="${k}">${l}</button>`).join('')}</div>`;
  if (mode === 'tarjetas') {
    const tmp = document.createElement('div'); tmp.innerHTML = m.h;
    const cards = $$('li, p', tmp).filter(el => el.querySelector('strong') && !el.querySelector('li')).map(el => el.innerHTML);
    let ci = +(q.c || 0) % Math.max(1, cards.length);
    app(`<div class="qtop"><a class="btn ghost sm" href="#/memorizar">${icon('chevL')}</a><span class="small muted" style="flex:1">${esc(x.name || m.title)}</span>${tabs}</div>
      <div class="bar"><i style="width:${pct(ci + 1, cards.length)}%"></i></div><div class="small muted mono">${ci + 1}/${cards.length}</div>
      <div class="card hl"><div class="flash prose cloze" id="fc">${cards[ci] || 'Sin tarjetas'}</div></div>
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

/* ---------- Temario subrayado ---------- */
routes['temario'] = (args) => {
  const keys = Object.keys(D.tem).sort((a, b) => a - b); const n = args[0] || keys[0]; const page = args[1]; const T = D.tem[n];
  app(`${head('Estudiar', 'Temario subrayado', 'Solo lo subrayado en amarillo de cada tema oficial, página a página. Es lo que entra.')}
  <div class="chips" style="margin:14px 0">${keys.map(k => { const t = TOPICS.find(x => String(x.n) === k); return `<a class="chip ${k === n ? 'on' : ''}" href="#/temario/${k}">T${k} ${t ? t.short : ''}</a>`; }).join('')}</div>
  <div class="card flat"><h3>${esc(T.name)}</h3><input id="f" placeholder="Buscar en lo subrayado…" style="margin-top:10px"></div><div id="pages"></div>`);
  const draw = f => {
    const re = f ? new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') : null;
    $('#pages').innerHTML = T.pages.filter(([, t]) => !re || re.test(t)).map(([p, t]) => `<div class="hlblock" id="p${p}"><div class="p">PÁGINA ${p}</div>${re ? esc(t).replace(new RegExp(esc(f).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<mark>${m}</mark>`) : esc(t)}</div>`).join('') || '<div class="empty">Sin resultados</div>';
  };
  draw(''); $('#f').oninput = e => draw(e.target.value.trim());
  if (page) setTimeout(() => { const el = document.getElementById('p' + page) || $$('.hlblock').find(x => +x.id.slice(1) >= +page); if (el) { el.scrollIntoView({ block: 'start' }); el.style.borderLeftColor = 'var(--cyan)'; } }, 60);
};

/* ---------- Cambios del temario 2026 ---------- */
routes['cambios'] = () => app(`${head('Estudiar', 'Cambios en el temario 2026', 'Publicados el 23 de noviembre de 2026. Ya están marcados con 🆕 en tus resúmenes y en las preguntas afectadas.')}
  <div class="card"><div class="prose">${R.cambios || ''}</div></div>`);

/* ---------- Hubs móviles ---------- */
const hub = (title, items) => app(`${head('', title)}<div class="card list">${items.map(([r, ic, t, d]) => `<a href="#/${r}"><div class="ico">${icon(ic)}</div><div style="flex:1"><div class="t">${t}</div><div class="d">${d}</div></div>${icon('chevR', 'chev')}</a>`).join('')}</div>`);
routes['practicar'] = () => hub('Practicar', [
  ['aleatorio', 'shuffle', 'Preguntas a boleo', 'Infinitas, priorizando lo importante y lo que fallas'],
  ['cuestionarios', 'layers', 'Cuestionarios por tema', 'En orden y por bloques, con % completado'],
  ['repaso', 'repeat', 'Repaso 1 · 3 · 7 días', `${dueReviews().length} pendientes hoy`],
  ['examenes', 'exam', 'Exámenes y simulacros', '11 exámenes oficiales + simulacros de 50'],
  ['ingles', 'globe', 'Inglés', 'Grammar y vocabulary nivel C2 + simulacro C1'],
]);
routes['mas'] = () => {
  hub('Más', [
    ['resumenes', 'book', 'Resúmenes', 'Tus apuntes dentro de la app'],
    ['memorizar', 'brain', 'Memorizar', 'Datos clave en modo huecos y tarjetas'],
    ['temario', 'marker', 'Temario subrayado', 'Lo que entra, por página'],
    ['plan', 'grid', 'Mi plan', 'Calendario de tu plan: hecho y pendiente'],
    ['cambios', 'alert', 'Cambios temario 2026', 'Lo que cambia en los temas nuevos'],
    ['planning', 'cal', 'Planning', 'Fecha de examen y lo estudiado'],
    ['stats', 'chart', 'Estadísticas', 'Tu progreso y qué cae en el examen'],
    ['ajustes', 'gear', 'Ajustes y cuenta', 'Prioridades, examen y sesión'],
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
    <label class="chk" style="margin-top:14px"><span class="switch"><input type="checkbox" id="onlyHl" ${S.settings.onlyHl ? 'checked' : ''}><i></i></span> Solo lo subrayado en amarillo</label>
    <div class="row" style="margin-top:18px"><span class="muted small"><b class="mono" style="color:var(--ink)">${n}</b> preguntas disponibles</span><span class="spacer"></span><button class="btn" id="go" ${n ? '' : 'disabled'}>${icon('play')} Empezar</button></div></div>`);
    $('#pool').value = S.settings.pool;
    const persist = () => localStorage.setItem('rnd_sel', JSON.stringify([...sel]));
    $$('.chip').forEach(c => c.onclick = () => { sel.has(c.dataset.t) ? sel.delete(c.dataset.t) : sel.add(c.dataset.t); persist(); draw(); });
    $('#selPri').onclick = () => { sel.clear(); ['meteo', 'nav', 'ffhh', 'carto', 'fpl'].forEach(t => sel.add(t)); persist(); draw(); };
    $('#selAll').onclick = () => { TOPICS.forEach(t => sel.add(t.id)); persist(); draw(); };
    $('#pool').onchange = e => { S.settings.pool = e.target.value; save(true); draw(); };
    $('#onlyHl').onchange = e => { S.settings.onlyHl = e.target.checked; save(true); draw(); };
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
  const tp = TOP[t]; const all = D.q.filter(q => q.t === t); const qs = all.filter(q => !S.settings.onlyHl || inScope(Q[q.id]));
  const blocks = []; for (let i = 0; i < qs.length; i += BLOCK) blocks.push(qs.slice(i, i + BLOCK));
  const s = topicStats(t); const nextB = blocks.findIndex(b => b.some(q => !rec(q.id).n));
  app(`${head('Tema ' + tp.n, tp.name, '')}
  <div class="card hl row" style="gap:18px">${ring(pct(s.seen, s.scope), 92, 9)}<div style="flex:1;min-width:200px"><div style="font-weight:700;font-size:17px">${pct(s.seen, s.scope)}% completado</div><div class="small muted">${s.seen}/${s.scope} preguntas · ${pct(s.ok, s.seen)}% acertadas la última vez</div>
    <label class="chk" style="margin-top:10px"><span class="switch"><input type="checkbox" id="onlyHl" ${S.settings.onlyHl ? 'checked' : ''}><i></i></span> Solo subrayado (${all.filter(q => inScope(Q[q.id])).length} de ${all.length})</label></div>
    <div class="stack">${nextB >= 0 ? `<button class="btn" data-b="${nextB}">${icon('play')} Continuar · bloque ${nextB + 1}</button>` : '<span class="pill ok">Cuestionario completo</span>'}<button class="btn sec" id="failsT">Falladas del tema</button></div></div>
  <h2>Bloques</h2><div class="grid g4">${blocks.map((b, i) => { const seen = b.filter(q => rec(q.id).n).length, ok = b.filter(q => rec(q.id).last === 1).length; return `<button class="kpi" data-b="${i}" style="text-align:left;cursor:pointer;${seen === b.length ? 'border-color:rgba(52,211,153,.4)' : ''}"><div class="tiny">Bloque ${i + 1}</div><div style="font-weight:700;margin:4px 0">nº ${b[0].n}–${b[b.length - 1].n}</div><div class="bar ${seen === b.length ? 'ok' : ''}"><i style="width:${pct(seen, b.length)}%"></i></div><div class="s">${seen}/${b.length} · ${pct(ok, seen)}% ✓</div></button>`; }).join('')}</div>`);
  $('#onlyHl').onchange = e => { S.settings.onlyHl = e.target.checked; save(true); render(); };
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
  ${dr.length ? dr.map((x, i) => `<div class="task" style="border-left:3px solid ${TOP[x.e.topic]?.c}"><div class="body"><div class="row"><span class="tt">${esc(tname(x.e.topic))}</span><span class="pill violet">día ${x.k}</span>${x.due < ymd() ? '<span class="pill ko">atrasado</span>' : ''}</div><div class="small muted">Estudiado el ${fmtDate(x.e.d)} · ${x.e.ids.length} preguntas${x.e.label ? ' · ' + esc(x.e.label) : ''}</div></div><button class="btn sm" data-r="${i}">${icon('play')} Repasar</button></div>`).join('') : `<div class="card empty">${icon('check')}<div>Nada pendiente hoy</div></div>`}
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
  const z = EXZ, q = materialize(Q[z.ids[z.i]]); z.cache = z.cache || {}; z.cache[q.id] = q;
  const nAns = Object.keys(z.ans).length;
  app(`<div class="qtop"><span class="small muted" style="flex:1">${esc(z.label)} · <span class="mono">${z.i + 1}/${z.ids.length}</span></span><span class="timer" id="timer">${mmss(z.end - now())}</span></div>
  <div class="bar"><i style="width:${pct(nAns, z.ids.length)}%"></i></div>
  <div class="card"><div class="qtext">${esc(q.q)}</div>
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

/* ---------- Inglés ---------- */
routes['ingles'] = () => {
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
    ${st.examDate ? '' : `<div><label>Sin fecha: duración del plan (días)</label><input type="number" id="plen" min="7" max="200" value="${P.len()}"></div>`}</div>
    <div class="row" style="margin-top:12px"><a class="btn sec sm" href="#/plan">${icon('grid')} Ver mi plan</a><span class="small muted">El temario termina la víspera del examen. Lo que no hagas un día se recoloca solo.</span></div></div>
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
  exd.oninput = exd.onchange = () => { exdDirty = true; const v = exd.value; if (/^\d{4}-\d{2}-\d{2}$/.test(v) && +v.slice(0, 4) >= 2025) { st.examDate = v; save(true); $('#cdown').textContent = Math.max(1, Math.ceil((new Date(v + 'T09:00:00') - now()) / DAY)) + ' días'; } };
  exd.onblur = () => { if (exdDirty) render(); };
  exd.onkeydown = e => { if (e.key === 'Enter') exd.blur(); };
  const pl = $('#plen'); if (pl) pl.onchange = e => { st.planLen = Math.max(7, Math.min(200, +e.target.value || 31)); save(true); render(); };
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

/* ---------- Ajustes ---------- */
routes['ajustes'] = () => {
  const st = S.settings;
  app(`${head('Cuenta', 'Ajustes', '')}
  <div class="card"><div class="row"><div class="avatar" style="width:46px;height:46px;font-size:17px">${esc(initials(SESS.name || SESS.user))}</div><div style="flex:1"><div style="font-weight:700">${esc(SESS.name || 'Invitado')}</div><div class="small muted">${SESS.local ? 'Sin cuenta · solo este dispositivo' : '@' + esc(SESS.user) + ' · sincronizado entre dispositivos'}</div></div>
  ${SESS.local ? `<button class="btn" id="toAcc">Crear cuenta / entrar</button>` : `<button class="btn ghost sm" id="syncNow">${icon('refresh')} Sincronizar</button><button class="btn ghost sm" id="out">${icon('logout')} Salir</button>`}</div>
  ${SESS.local ? '' : `<details style="margin-top:12px"><summary class="small muted" style="cursor:pointer">Cambiar contraseña</summary><div class="grid" style="margin-top:6px"><div><label>Actual</label><input type="password" id="op"></div><div><label>Nueva</label><input type="password" id="np"></div></div><button class="btn sm" id="chp" style="margin-top:10px">Cambiar</button></details>`}</div>
  <div id="invCard"></div>
  <div class="card row"><div style="flex:1"><h3>Apariencia</h3><div class="small muted">Se guarda en este dispositivo</div></div><div class="seg"><button data-th="light" class="${theme() === 'light' ? 'on' : ''}">Claro</button><button data-th="dark" class="${theme() === 'dark' ? 'on' : ''}">Oscuro</button></div></div>
  <div class="card"><h3>Prioridad de cada tema</h3><p class="small muted">Cuánto sale cada tema en «A boleo» y en el simulacro «con mis prioridades». 0 = no sale.</p>
  ${TOPICS.map(t => `<div class="row" style="flex-wrap:nowrap;margin:6px 0"><span style="min-width:120px" class="small">${t.short}</span><input type="range" min="0" max="5" step="0.5" value="${st.weights[t.id] ?? 0}" data-w="${t.id}" style="flex:1"><b class="mono" id="wv-${t.id}" style="width:30px;text-align:right">${st.weights[t.id] ?? 0}</b></div>`).join('')}
  <div class="row" style="margin-top:10px"><button class="btn ghost sm" id="wReal">Proporción real 2023-25</button><button class="btn ghost sm" id="wDef">Mis prioridades (Meteo/Nav/FFHH)</button></div></div>
  <div class="card"><h3>Examen</h3><div class="grid"><div><label>Penalización por fallo</label><select id="pen"><option value="0">Sin penalización</option><option value="0.25">−0,25</option><option value="0.33">−0,33 (oficial)</option><option value="0.5">−0,5</option></select></div><div><label>Minutos del simulacro</label><input type="number" id="mins" value="${st.simMinutes}"></div></div>
  <label class="chk" style="margin-top:16px"><span class="switch"><input type="checkbox" id="onlyHl" ${st.onlyHl ? 'checked' : ''}><i></i></span> Solo preguntas de lo subrayado en amarillo</label></div>
  <div class="card"><h3>Copia de seguridad</h3><div class="row" style="margin-top:8px"><button class="btn ghost sm" id="exp">Exportar progreso</button><label class="btn ghost sm" style="margin:0">Importar<input type="file" id="imp" accept=".json" hidden></label><span class="spacer"></span><button class="btn danger sm" id="rst">Borrar progreso</button></div></div>`);
  if (!SESS.local) api('me').then(me => { if (me?.admin) loadInvites(); }).catch(() => {});
  $$('[data-th]').forEach(b => b.onclick = () => { localStorage.setItem(THEME_KEY, b.dataset.th); applyTheme(true); render(); });
  $('#pen').value = String([0, 0.25, 0.33, 0.5].reduce((a, b) => Math.abs(b - st.penalty) < Math.abs(a - st.penalty) ? b : a));
  const ta = $('#toAcc'); if (ta) ta.onclick = () => { SESS = null; localStorage.removeItem(SESS_KEY); boot('register'); };
  const sn = $('#syncNow'); if (sn) sn.onclick = () => sync(true);
  const o = $('#out'); if (o) o.onclick = () => { if (confirm('¿Cerrar sesión en este dispositivo?')) logout(); };
  const cp = $('#chp'); if (cp) cp.onclick = async () => { try { await api('password', { method: 'POST', body: { old: $('#op').value, pass: $('#np').value } }); toast('Contraseña cambiada'); render(); } catch (e) { toast(e.message); } };
  $$('[data-w]').forEach(r => r.oninput = () => { st.weights[r.dataset.w] = +r.value; $('#wv-' + r.dataset.w).textContent = r.value; save(true); });
  $('#wReal').onclick = () => { const s = realShares(); TOPICS.forEach(t => st.weights[t.id] = Math.round((s[t.id] || 0) * 20) / 2); save(true); render(); };
  $('#wDef').onclick = () => { TOPICS.forEach(t => st.weights[t.id] = t.w); save(true); render(); };
  $('#pen').onchange = e => { st.penalty = +e.target.value; save(true); };
  $('#mins').onchange = e => { st.simMinutes = Math.max(5, +e.target.value || 50); save(true); };
  $('#onlyHl').onchange = e => { st.onlyHl = e.target.checked; save(true); };
  $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })); a.download = 'opo-atc-progreso-' + ymd() + '.json'; a.click(); };
  $('#imp').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { mergeState(S, JSON.parse(await f.text())); save(); toast('Importado'); render(); } catch (er) { toast('Archivo no válido'); } };
  $('#rst').onclick = () => { if (confirm('¿Borrar todo tu progreso? No se puede deshacer.') && confirm('¿Seguro del todo?')) { S = defaultState(); S.migrated = 1; S.settings.u = now(); localStorage.setItem(stateKey(), JSON.stringify(S)); api('sync', { method: 'PUT', body: JSON.stringify(S) }).catch(() => {}); render(); } };
};

async function loadInvites() {
  const box = $('#invCard'); if (!box) return;
  let list = []; try { list = (await api('invites')).invites; } catch (e) { return; }
  const st = i => i.usedBy ? `<span class="pill ok">usada por @${esc(i.usedBy)}</span>` : i.revoked ? '<span class="pill ko">anulada</span>' : '<span class="pill cyan">libre</span>';
  box.innerHTML = `<div class="card"><div class="row"><div style="flex:1"><h3>Claves de invitación</h3><div class="small muted">Eres la cuenta administradora. Cada clave sirve para crear una sola cuenta.</div></div><button class="btn sm" id="invNew">${icon('user')} Crear clave</button></div>
    ${list.length ? `<div class="tblwrap" style="margin-top:10px"><table class="tbl"><tr><th>Clave</th><th>Estado</th><th></th></tr>${list.map(i => `<tr><td class="mono">${esc(i.code)}</td><td>${st(i)}</td><td style="text-align:right">${!i.usedBy && !i.revoked ? `<button class="btn ghost sm" data-copy="${esc(i.code)}">Copiar</button><button class="btn ghost sm" data-rev="${esc(i.code)}">Anular</button>` : ''}</td></tr>`).join('')}</table></div>` : '<p class="small muted">Aún no has creado ninguna.</p>'}</div>`;
  $('#invNew').onclick = async () => { try { const r = await api('invites/create', { method: 'POST', body: {} }); try { await navigator.clipboard.writeText(r.code); toast('Clave creada y copiada: ' + r.code); } catch (e) { toast('Clave creada: ' + r.code); } loadInvites(); } catch (e) { toast(e.message); } };
  $$('[data-copy]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.copy); toast('Copiada'); } catch (e) { toast(b.dataset.copy); } });
  $$('[data-rev]').forEach(b => b.onclick = async () => { if (!confirm('¿Anular esta clave?')) return; await api('invites/revoke', { method: 'POST', body: { code: b.dataset.rev } }).catch(() => {}); loadInvites(); });
}

/* ---------- Acceso ---------- */
function authView(mode = 'login') {
  applyTheme(false);
  $('#root').innerHTML = `<div class="auth">
    <section class="hero">
      <div class="logo"><span class="mark">${icon('plane')}</span><span>Opo ATC</span></div>
      <h1>Tu torre de control<br>para la <em>oposición ENAIRE</em>.</h1>
      <p>Cuestionarios, exámenes oficiales, tus resúmenes y un plan diario que se reprograma solo. En el móvil y en el PC.</p>
      <div class="feats">
        <div>${icon('check')} 759 preguntas de cuestionario y 563 de exámenes oficiales</div>
        <div>${icon('check')} Repaso automático a 1, 3 y 7 días</div>
        <div>${icon('check')} Simulacros con el formato real: 50 preguntas, −0,33</div>
      </div>
      <div class="radar"><div class="scope"></div><div class="sweep"></div>
        <span class="blip" data-l="IBE3201 FL340" style="left:62%;top:28%"></span><span class="blip" data-l="VLG12K FL280" style="left:30%;top:60%;animation-delay:1.6s"></span><span class="blip" data-l="RYR8AB FL360" style="left:70%;top:68%;animation-delay:3s"></span></div>
    </section>
    <section class="panel"><form id="af" class="card" autocomplete="on">
      <div class="seg" style="width:100%;margin-bottom:6px"><button type="button" data-mode="login" class="${mode === 'login' ? 'on' : ''}" style="flex:1">Entrar</button><button type="button" data-mode="register" class="${mode === 'register' ? 'on' : ''}" style="flex:1">Crear cuenta</button></div>
      ${mode === 'register' ? `<label>Tu nombre</label><input id="an" autocomplete="name" placeholder="Cómo te llamamos">` : ''}
      <label>Usuario</label><input id="au" autocomplete="username" autocapitalize="none" placeholder="tu_usuario" required>
      <label>Contraseña</label><input id="ap" type="password" autocomplete="${mode === 'register' ? 'new-password' : 'current-password'}" placeholder="${mode === 'register' ? 'mínimo 8 caracteres' : ''}" required>
      ${mode === 'register' ? `<label>Clave de invitación</label><input id="ai" autocapitalize="characters" placeholder="ATC-XXXX-XXXX"><div class="small muted" style="margin-top:6px">Cada clave sirve para crear una sola cuenta. Pídesela a quien administra la app.</div>` : ''}
      <button class="btn block" style="margin-top:18px" id="ab">${mode === 'register' ? 'Crear cuenta' : 'Entrar'}</button>
      <div class="err" id="ae"></div>
      <div style="text-align:center;margin-top:6px"><a href="#" id="local" class="small muted">Probar sin cuenta (solo este dispositivo)</a></div>
    </form></section></div>`;
  $$('[data-mode]').forEach(b => b.onclick = () => authView(b.dataset.mode));
  $('#local').onclick = e => { e.preventDefault(); SESS = { local: true, name: 'Invitado' }; localStorage.setItem(SESS_KEY, JSON.stringify(SESS)); boot(); };
  $('#af').onsubmit = async e => {
    e.preventDefault(); const btn = $('#ab'); btn.disabled = true; $('#ae').textContent = '';
    try {
      const body = { user: $('#au').value, pass: $('#ap').value }; if (mode === 'register') { body.name = $('#an').value; body.invite = $('#ai').value; }
      const r = await api(mode, { method: 'POST', body });
      SESS = { token: r.token, user: r.user, name: r.name }; localStorage.setItem(SESS_KEY, JSON.stringify(SESS)); boot();
    } catch (er) { $('#ae').textContent = er.status ? er.message : 'No hay conexión con el servidor. ¿Está desplegada la app en Netlify?'; btn.disabled = false; }
  };
}

/* ---------- Arranque ---------- */
function boot(mode) {
  QZ = null; EXZ = null; clearInterval(timerH);
  if (!SESS) return authView(mode);
  loadState(); shell(); render(); sync();
}
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
boot();
})();
