/* OpoATC · puerta de entrada: acceso, registro, confirmación de email, datos personales, plan y pago.
   Cuando la cuenta tiene un plan activo, descarga el contenido (solo para cuentas con plan) y arranca app.js. */
(function () {
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SESS_KEY = 'opo_session', ME_KEY = 'opo_me';
const VERSION = '20261124h';
let SESS = null; try { SESS = JSON.parse(localStorage.getItem(SESS_KEY) || 'null'); } catch (e) {}
if (SESS && SESS.local) { SESS = null; localStorage.removeItem(SESS_KEY); }

const PLANS = [
  { id: 'teoria', name: 'Teoría', price: '8', cents: '', tag: '', feats: ['Los 9 temas: resúmenes y temario oficial', '759 preguntas de cuestionario + exámenes oficiales', 'Plan diario personalizado y adaptativo', 'Repaso 1·3·7, falladas y simulacros −0,33'] },
  { id: 'ingles', name: 'Teoría + Inglés', price: '15', tag: '', feats: ['Todo lo de Teoría', '+950 preguntas de inglés con la regla explicada', 'Exámenes de inglés de ENAIRE 2017–2026', 'Simulacro de inglés C1 (20 preguntas)'] },
  { id: 'completo', name: 'Teoría + Inglés + Psicotécnicos', price: '19', tag: 'Recomendado', feats: ['Todo lo de Teoría + Inglés', 'Psicotécnicos: series, cálculo, atención y memoria', 'Ejercicios infinitos y cronometrados', 'La preparación completa de la Fase I'] },
];
const LATER = [{ id: 'fase2', name: 'Fase II', price: '20,90', feats: ['Preparación FEAST y PDEA'] }, { id: 'fase3', name: 'Fase III', price: '20,90', feats: ['Inglés oral y evaluación conductual'] }];
const SOURCES = ['Google', 'Instagram', 'TikTok', 'YouTube', 'Un amigo o compañero', 'Academia', 'Foro / Reddit / Telegram', 'Otro'];

const IC = {
  check: '<path d="M20 6 9 17l-5-5"/>', mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>', lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
};
const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
const G = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const LOGO = (light) => `<a class="brand" href="./"><img src="assets/logo-mark.svg" alt="" width="34" height="34"><span class="wm ${light ? 'wm-light' : ''}">Opo<b>ATC</b></span></a>`;

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3200); }
async function api(path, opts = {}) {
  const r = await fetch('/api/' + path, { method: opts.method || 'GET', headers: Object.assign({ 'content-type': 'application/json' }, SESS?.token ? { authorization: 'Bearer ' + SESS.token } : {}), body: opts.body == null ? undefined : JSON.stringify(opts.body) });
  let d = null; try { d = await r.json(); } catch (e) {}
  if (!r.ok) { const e = new Error(d?.error || ('Error ' + r.status)); e.status = r.status; throw e; }
  return d;
}
function setSession(token, me) {
  SESS = { token, user: me.user, name: me.name };
  localStorage.setItem(SESS_KEY, JSON.stringify(SESS)); localStorage.setItem(ME_KEY, JSON.stringify(me));
}
function logout() {
  if (SESS?.token) api('logout', { method: 'POST' }).catch(() => {});
  SESS = null; localStorage.removeItem(SESS_KEY); localStorage.removeItem(ME_KEY);
  location.hash = '#/entrar'; location.reload();
}
const hashInfo = () => { const h = location.hash.replace(/^#\/?/, ''); const [path, qs] = h.split('?'); return { r: path.split('/')[0] || '', q: Object.fromEntries(new URLSearchParams(qs || '')) }; };

/* ---------- Pantallas ---------- */
function frame(inner, side = true) {
  document.body.classList.remove('light'); document.body.classList.add('gate');
  $('#root').innerHTML = `<div class="gatewrap">
    <section class="gate-side ${side ? '' : 'hide-m'}">
      ${LOGO(true)}
      <div class="gate-copy"><div class="eyebrow-line">Oposición Controlador de Tránsito Aéreo · Fase I</div>
      <h1>Tu plan para aprobar la <em>Fase I</em> de ENAIRE.</h1>
      <ul class="gate-list"><li>${icon('check')} Plan diario personalizado que se recalcula solo</li><li>${icon('check')} Exámenes oficiales y simulacros con −0,33</li><li>${icon('check')} Inglés con la regla explicada y psicotécnicos</li><li>${icon('check')} Cancela cuando quieras</li></ul></div>
      <div class="radar" aria-hidden="true"><div class="scope"></div><div class="sweep"></div><span class="blip" data-l="IBE3201 FL340" style="left:62%;top:28%"></span><span class="blip" data-l="VLG12K FL280" style="left:30%;top:60%;animation-delay:1.6s"></span><span class="blip" data-l="RYR8AB FL360" style="left:70%;top:68%;animation-delay:3s"></span></div>
      <p class="legal-mini">OpoATC no tiene relación con ENAIRE. Preparación exclusiva para la Fase I.</p>
    </section>
    <section class="gate-main"><div class="gate-card">${inner}</div></section></div>`;
}
const steps = (n) => `<ol class="steps">${['Cuenta', 'Email', 'Plan', 'Pago'].map((s, i) => `<li class="${i < n ? 'done' : i === n ? 'on' : ''}"><span>${i < n ? icon('check') : i + 1}</span>${s}</li>`).join('')}</ol>`;

function viewLogin(err) {
  frame(`${steps(0)}<h2>Entra en tu cuenta</h2><p class="muted">¿Primera vez? <a href="#/registro">Crea tu cuenta</a></p>
    <a class="btn-google" href="/api/auth/google">${G} Continuar con Google</a>
    <div class="or"><span>o con tu email</span></div>
    <form id="f" novalidate><label>Email</label><input id="em" type="email" autocomplete="username" required>
    <label>Contraseña</label><input id="pw" type="password" autocomplete="current-password" required>
    <button class="btn block" style="margin-top:18px">Entrar</button><div class="err" id="er">${esc(err || '')}</div></form>`);
  $('#f').onsubmit = async e => { e.preventDefault(); const b = $('#f button'); b.disabled = true; $('#er').textContent = '';
    try { const r = await api('login', { method: 'POST', body: { user: $('#em').value, pass: $('#pw').value } }); setSession(r.token, r); route(); }
    catch (er) { $('#er').textContent = er.status ? er.message : 'Sin conexión con el servidor'; b.disabled = false; } };
}

function viewRegister(q) {
  const plan = PLANS.find(p => p.id === q.plan);
  frame(`${steps(0)}<h2>Crea tu cuenta</h2><p class="muted">¿Ya tienes cuenta? <a href="#/entrar">Entra</a></p>
    ${plan ? `<div class="chosen">Plan elegido: <b>${esc(plan.name)}</b> · ${plan.price} €/mes <a href="#/registro">cambiar</a></div>` : ''}
    <a class="btn-google" href="/api/auth/google${plan ? '?plan=' + plan.id : ''}">${G} Continuar con Google</a>
    <p class="tiny-note">Con Google te pediremos igualmente tus datos en el siguiente paso.</p>
    <div class="or"><span>o con tu email</span></div>
    <form id="f" novalidate autocomplete="on">
      <div class="g2"><div><label>Nombre</label><input id="nm" autocomplete="given-name" required></div><div><label>Apellidos</label><input id="sn" autocomplete="family-name" required></div></div>
      <label>Email</label><input id="em" type="email" autocomplete="email" required>
      <label>Repite el email</label><input id="em2" type="email" autocomplete="off" required onpaste="return false">
      <div class="g2"><div><label>Fecha de nacimiento</label><input id="bd" type="date" max="${new Date().toISOString().slice(0, 10)}" required></div>
      <div><label>¿Cómo nos has encontrado?</label><select id="src" required><option value="">Elige una opción</option>${SOURCES.map(s => `<option>${s}</option>`).join('')}</select></div></div>
      <label>Contraseña</label><input id="pw" type="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required>
      <details class="code"><summary>¿Tienes un código de acceso?</summary><input id="inv" placeholder="ATC-XXXX-XXXX" autocapitalize="characters"></details>
      <label class="chk"><input type="checkbox" id="tc"> Acepto los <a href="legal.html#terminos" target="_blank">términos</a> y la <a href="legal.html#privacidad" target="_blank">política de privacidad</a></label>
      <label class="chk"><input type="checkbox" id="mk"> Quiero recibir novedades de la oposición (opcional)</label>
      <button class="btn block" style="margin-top:16px">Crear cuenta ${icon('arrow')}</button><div class="err" id="er"></div></form>`);
  $('#f').onsubmit = async e => { e.preventDefault(); const b = $('#f button'); $('#er').textContent = '';
    const v = { name: $('#nm').value, surname: $('#sn').value, email: $('#em').value, email2: $('#em2').value, birth: $('#bd').value, source: $('#src').value, pass: $('#pw').value, invite: $('#inv').value, terms: $('#tc').checked, marketing: $('#mk').checked, plan: q.plan };
    if (v.email.trim().toLowerCase() !== v.email2.trim().toLowerCase()) { $('#er').textContent = 'Los dos emails no coinciden'; return; }
    if (!v.terms) { $('#er').textContent = 'Debes aceptar los términos y la política de privacidad'; return; }
    b.disabled = true;
    try { const r = await api('register', { method: 'POST', body: v }); setSession(r.token, r); if (r.devLink) sessionStorage.setItem('devLink', r.devLink); if (q.plan) sessionStorage.setItem('wantPlan', q.plan); route(); }
    catch (er) { $('#er').textContent = er.status ? er.message : 'Sin conexión con el servidor'; b.disabled = false; } };
}

function viewVerify(me) {
  const dev = sessionStorage.getItem('devLink');
  frame(`${steps(1)}<div class="bigicon">${icon('mail')}</div><h2>Confirma tu email</h2>
    <p>Te hemos enviado un enlace a <b>${esc(me.email)}</b>. Ábrelo para confirmar tu cuenta y continuar.</p>
    <p class="muted small">¿No lo ves? Revisa la carpeta de spam o promociones.</p>
    ${dev ? `<div class="warn">Modo pruebas (el envío de emails aún no está configurado): <a href="${esc(dev)}">confirmar ahora</a></div>` : ''}
    <button class="btn block" id="ok">Ya lo he confirmado</button><button class="btn ghost block" id="rs" style="margin-top:8px">Reenviar el email</button>
    <p class="small" style="margin-top:14px"><a href="#" id="out">Usar otra cuenta</a></p><div class="err" id="er"></div>`);
  $('#ok').onclick = () => route();
  $('#rs').onclick = async () => { try { const r = await api('verify/resend', { method: 'POST' }); if (r.devLink) sessionStorage.setItem('devLink', r.devLink); if (r.verified) return route(); toast('Email reenviado'); } catch (e) { $('#er').textContent = e.message; } };
  $('#out').onclick = e => { e.preventDefault(); logout(); };
}

function viewProfile(me) {
  frame(`${steps(1)}<h2>Completa tus datos</h2><p class="muted">Los necesitamos para crear tu cuenta.</p>
    <form id="f" novalidate>
      <div class="g2"><div><label>Nombre</label><input id="nm" value="${esc(me.name)}" required></div><div><label>Apellidos</label><input id="sn" value="${esc(me.surname)}" required></div></div>
      <label>Email</label><input value="${esc(me.email || me.user)}" disabled>
      <label>Confirma tu email</label><input id="em2" type="email" autocomplete="off" required>
      <div class="g2"><div><label>Fecha de nacimiento</label><input id="bd" type="date" max="${new Date().toISOString().slice(0, 10)}" required></div>
      <div><label>¿Cómo nos has encontrado?</label><select id="src" required><option value="">Elige una opción</option>${SOURCES.map(s => `<option>${s}</option>`).join('')}</select></div></div>
      <label class="chk"><input type="checkbox" id="tc"> Acepto los <a href="legal.html#terminos" target="_blank">términos</a> y la <a href="legal.html#privacidad" target="_blank">política de privacidad</a></label>
      <label class="chk"><input type="checkbox" id="mk"> Quiero recibir novedades de la oposición (opcional)</label>
      <button class="btn block" style="margin-top:16px">Continuar ${icon('arrow')}</button><div class="err" id="er"></div></form>`);
  $('#f').onsubmit = async e => { e.preventDefault(); $('#er').textContent = '';
    if (!$('#tc').checked) { $('#er').textContent = 'Debes aceptar los términos y la política de privacidad'; return; }
    try { const r = await api('profile', { method: 'POST', body: { name: $('#nm').value, surname: $('#sn').value, email2: $('#em2').value, birth: $('#bd').value, source: $('#src').value, terms: true, marketing: $('#mk').checked } }); localStorage.setItem(ME_KEY, JSON.stringify(r)); route(); }
    catch (er) { $('#er').textContent = er.message; } };
}

function planCards(current, want) {
  return `<div class="plans">${PLANS.map(p => `<div class="plan ${p.tag ? 'feat' : ''} ${want === p.id ? 'want' : ''}">${p.tag ? `<span class="ribbon">${p.tag}</span>` : ''}
    <div class="pn">${esc(p.name)}</div><div class="pp"><b>${p.price}</b> €/mes</div><ul>${p.feats.map(f => `<li>${icon('check')} ${esc(f)}</li>`).join('')}</ul>
    <button class="btn block ${p.tag ? '' : 'sec'}" data-plan="${p.id}" ${current === p.id ? 'disabled' : ''}>${current === p.id ? 'Tu plan actual' : `Elegir ${icon('arrow')}`}</button></div>`).join('')}</div>
    <div class="later">${LATER.map(p => `<div class="plan later-c"><div class="pn">${p.name} · todo incluido</div><div class="pp"><b>${p.price}</b> €/mes</div><p class="small muted">${p.feats[0]}. Se activa cuando superes la Fase I: <b>paga solo por la fase que estás preparando</b>.</p></div>`).join('')}</div>`;
}
function viewPlans(me, q) {
  const want = q.plan || sessionStorage.getItem('wantPlan') || me.wantPlan;
  frame(`${steps(2)}<h2>Elige tu plan</h2><p class="muted">Exclusivo para preparar la <b>Fase I</b>. Pago seguro con tarjeta a través de Stripe. <b>Cancela cuando quieras.</b> IVA incluido.</p>
    ${q.cancelado ? '<div class="warn">Has cancelado el pago. Puedes elegir un plan cuando quieras.</div>' : ''}
    ${planCards(me.plan && ['active', 'trialing', 'past_due'].includes(me.plan.status) ? me.plan.id : null, want)}
    <details class="code"><summary>¿Tienes un código de acceso?</summary><div class="row"><input id="code" placeholder="ATC-XXXX-XXXX"><button class="btn sec" id="rd">Canjear</button></div></details>
    <p class="small" style="margin-top:12px"><a href="#" id="out">Salir</a></p><div class="err" id="er"></div>`, false);
  $$('[data-plan]').forEach(b => b.onclick = async () => { b.disabled = true; $('#er').textContent = '';
    try { const r = await api('billing/checkout', { method: 'POST', body: { plan: b.dataset.plan } }); location.href = r.url; if (r.url.startsWith('/app.html')) setTimeout(() => location.reload(), 50); }
    catch (e) { $('#er').textContent = e.message; b.disabled = false; } });
  $('#rd').onclick = async () => { try { const r = await api('redeem', { method: 'POST', body: { code: $('#code').value } }); localStorage.setItem(ME_KEY, JSON.stringify(r)); toast('Código canjeado'); route(); } catch (e) { $('#er').textContent = e.message; } };
  $('#out').onclick = e => { e.preventDefault(); logout(); };
}
function viewMsg(title, text, btn = 'Continuar') {
  frame(`<div class="bigicon">${icon('check')}</div><h2>${title}</h2><p>${text}</p><button class="btn block" id="go">${btn}</button>`);
  $('#go').onclick = () => { location.hash = '#/'; route(); };
}

/* ---------- Carga del contenido y arranque de la app ---------- */
async function startApp(me) {
  document.body.classList.remove('gate');
  $('#root').innerHTML = '<div class="loading"><img src="assets/logo-mark.svg" width="56" height="56" alt=""><div>Preparando tu plan…</div></div>';
  const cacheKey = '/__content__/' + encodeURIComponent(me.user) + '/' + me.features.join('-');
  let payload = null;
  try {
    const r = await fetch('/api/content', { headers: { authorization: 'Bearer ' + SESS.token } });
    if (r.status === 401) return logout();
    if (r.status === 402) { localStorage.removeItem(ME_KEY); return route(); }
    if (!r.ok) throw new Error('content ' + r.status);
    payload = await r.json();
    try { const c = await caches.open('opo-content'); await c.put(cacheKey, new Response(JSON.stringify(payload))); } catch (e) {}
  } catch (e) {
    try { const c = await caches.open('opo-content'); const hit = await c.match(cacheKey); if (hit) payload = await hit.json(); } catch (e2) {}
  }
  if (!payload) { $('#root').innerHTML = '<div class="loading"><div>No hay conexión y no tienes el contenido guardado en este dispositivo. Vuelve a intentarlo con internet.</div><button class="btn" onclick="location.reload()">Reintentar</button></div>'; return; }
  window.DATA = payload.data; window.RES = payload.res; window.ME = Object.assign({}, me, { features: payload.features || me.features });
  window.OPO = { api, logout, toast, planCards, PLANS, LATER,
    checkout: async plan => { const r = await api('billing/checkout', { method: 'POST', body: { plan } }); location.href = r.url; if (r.url.startsWith('/app.html')) setTimeout(() => location.reload(), 50); },
    portal: async () => { const r = await api('billing/portal', { method: 'POST' }); location.href = r.url; } };
  const s = document.createElement('script'); s.src = 'app.js?v=' + VERSION; document.body.appendChild(s);
}

async function route() {
  const { r, q } = hashInfo();
  if (r === 'oauth' && q.t) { SESS = { token: q.t }; localStorage.setItem(SESS_KEY, JSON.stringify(SESS)); history.replaceState(null, '', 'app.html#/'); }
  if (!SESS?.token) {
    if (r === 'registro') return viewRegister(q);
    if (r === 'verificado') return viewMsg(q.error ? 'Enlace caducado' : 'Email confirmado', q.error ? 'El enlace ya no es válido. Entra y pide uno nuevo.' : 'Tu email está confirmado. Entra para elegir tu plan.', 'Entrar');
    return viewLogin(q.error === 'google' ? 'No se pudo entrar con Google. Inténtalo de nuevo o usa tu email.' : '');
  }
  let me = null;
  try { me = await api('me'); localStorage.setItem(ME_KEY, JSON.stringify(me)); SESS.user = me.user; SESS.name = me.name; localStorage.setItem(SESS_KEY, JSON.stringify(SESS)); }
  catch (e) {
    if (e.status === 401) { SESS = null; localStorage.removeItem(SESS_KEY); return viewLogin('Tu sesión ha caducado. Vuelve a entrar.'); }
    try { me = JSON.parse(localStorage.getItem(ME_KEY) || 'null'); } catch (e2) {}
    if (!me) return viewLogin('Sin conexión con el servidor.');
  }
  if (!me.verified) return viewVerify(me);
  if (!me.profileDone) return viewProfile(me);
  if (r === 'pago-ok' && q.session_id) { try { me = await api('billing/confirm', { method: 'POST', body: { session_id: q.session_id } }); } catch (e) {} }
  if (!me.features.includes('teoria')) {
    if (r === 'pago-ok') { await new Promise(x => setTimeout(x, 1500)); try { me = await api('me'); } catch (e) {} if (!me.features.includes('teoria')) return viewPlans(me, {}); }
    else return viewPlans(me, q);
  }
  sessionStorage.removeItem('wantPlan'); sessionStorage.removeItem('devLink');
  if (r === 'pago-ok' || r === 'verificado' || r === 'registro' || r === 'entrar' || r === 'planes') history.replaceState(null, '', 'app.html#/' + (r === 'pago-ok' ? 'bienvenida' : ''));
  startApp(me);
}
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
route();
})();
