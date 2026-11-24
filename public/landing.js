/* OpoATC · landing: menú fijo, revelado al hacer scroll, contadores e inclinación del hero. Sin dependencias. */
(function () {
  'use strict';
  var safe = function (fn, name) { try { fn(); } catch (e) { if (window.console) console.warn('[landing] ' + name, e); } };
  document.documentElement.classList.add('js');

  function initNav() {
    var nav = document.getElementById('nav'); if (!nav) return;
    var on = function () { nav.classList.toggle('solid', window.scrollY > 40); };
    on(); window.addEventListener('scroll', on, { passive: true });
  }

  function initReveal() {
    var els = [].slice.call(document.querySelectorAll('.reveal'));
    var show = function (el) { el.classList.add('in'); };
    if (!('IntersectionObserver' in window)) { els.forEach(show); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
    // red de seguridad: nada queda oculto
    setTimeout(function () { els.forEach(show); }, 6000);
  }

  function initCounters() {
    var nums = [].slice.call(document.querySelectorAll('[data-count]'));
    if (!nums.length || !('IntersectionObserver' in window)) return;
    var run = function (el) {
      var end = +el.getAttribute('data-count'), pre = el.getAttribute('data-prefix') || '', t0 = null;
      var step = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1400); el.textContent = pre + Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }); }, { threshold: 0.05 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function initTilt() {
    var el = document.querySelector('.tilt'); if (!el || !window.matchMedia('(min-width: 1000px) and (hover: hover)').matches) return;
    var hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(1400px) rotateY(' + (-9 + x * 8) + 'deg) rotateX(' + (3 - y * 6) + 'deg)';
    });
    hero.addEventListener('mouseleave', function () { el.style.transform = ''; });
  }

  function boot() { safe(initNav, 'nav'); safe(initReveal, 'reveal'); safe(initCounters, 'counters'); safe(initTilt, 'tilt'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
