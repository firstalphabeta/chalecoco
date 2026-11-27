// ===== CONFIG =====
const WHATSAPP = '233531014722';            // 0531014722 in international format
const API = '';                              // paste your Apps Script Web App URL here (see README). Empty = uses products.json
// ==================
const $ = (s, r = document) => r.querySelector(s), stage = $('#stage');
const wa = (t) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t)}`;
document.querySelectorAll('[data-wa]').forEach(a => a.href = wa("Hi ChaleCoco! I'd like to place an order."));

// Products (from Google Sheet via Apps Script, or local file)
async function loadProducts() {
  try { const r = await fetch(API ? `${API}?action=list` : 'products.json'); const j = await r.json(); return (j.products || j).filter(p => p.active !== false && p.active !== 'FALSE'); }
  catch (e) { try { return (await (await fetch('products.json')).json()); } catch (_) { return []; } }
}
loadProducts().then(ps => {
  $('#list').innerHTML = ps.map(p => `<div class="row"><div><b>${esc(p.name)}</b><small>${esc(p.desc || '')}</small></div>
   <div class="act">${p.price ? `<em>GH₵ ${esc(p.price)}</em>` : ''}<a target="_blank" rel="noopener" href="${wa(`Hi ChaleCoco! I'd like to order: ${p.name}`)}">Order &rarr;</a></div></div>`).join('');
});
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// Stepped scenes: one gesture = one scene
const N = 5, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; let s = 0, lock = 0, acc = 0, last = 0, lastDelta = 0, introActive = true;
const dots = $('#dots'); for (let i = 0; i < N; i++) { const b = document.createElement('button'); b.setAttribute('aria-label', 'Scene ' + (i + 1)); b.onclick = () => go(i); dots.appendChild(b); }
const nav = $('nav'), menuToggle = $('.menu-toggle');
function closeMenu() { nav.removeAttribute('data-open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Open navigation menu'); }
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  nav.dataset.open = String(open);
});
function go(n) { if (introActive) return; n = Math.max(0, Math.min(N - 1, n)); if (n === s) return; s = n; stage.dataset.s = n;
  [...dots.children].forEach((b, i) => b.classList.toggle('on', i === n)); lock = performance.now() + (reduce ? 0 : 1000); }
function step(d) { if (performance.now() < lock) return; go(s + d); }
let introTimer = setTimeout(beginIntro, 3500);
Promise.all([document.fonts.ready, $('.coco img').decode()]).then(beginIntro).catch(e => { console.warn('Starting the intro without all assets ready.', e); beginIntro(); });
function beginIntro() {
  const root = document.documentElement;
  if (!root.classList.contains('intro')) return;
  clearTimeout(introTimer);
  root.classList.add('intro-run');
  root.classList.remove('intro');
  setTimeout(() => { root.classList.remove('intro-run'); introActive = false; }, reduce ? 20 : 1700);
}
function canScrollWithin(el, delta) {
  if (!el || el.scrollHeight <= el.clientHeight + 1) return false;
  return delta > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 1;
}
addEventListener('wheel', e => { const now = performance.now(), panel = e.target.closest('.p2, .cta');
  if (canScrollWithin(panel, e.deltaY)) { acc = 0; last = now; lastDelta = e.deltaY; return; }
  e.preventDefault();
  if (now - last > 160 || Math.abs(e.deltaY) > 1.6 * Math.abs(lastDelta) + 4) acc = 0;
  last = now; lastDelta = e.deltaY;
  if (now < lock || introActive) { acc = 0; return; }
  acc += e.deltaY; if (Math.abs(acc) > 24) { step(Math.sign(acc)); acc = 0; } }, { passive: false });
let ty = null, touchPanel = null;
addEventListener('touchstart', e => { ty = e.touches[0].clientY; touchPanel = e.target.closest('.p2, .cta'); }, { passive: true });
addEventListener('touchmove', e => { if (ty == null) return; const dy = ty - e.touches[0].clientY;
  if (Math.abs(dy) <= 40) return;
  if (canScrollWithin(touchPanel, dy)) { ty = e.touches[0].clientY; return; }
  e.preventDefault();
  if (!introActive && performance.now() >= lock) step(Math.sign(dy));
  ty = null; }, { passive: false });
addEventListener('touchend', () => { ty = null; touchPanel = null; }, { passive: true });
addEventListener('keydown', e => { const k = e.key;
  if (k === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') { closeMenu(); menuToggle.focus(); return; }
  if (['ArrowDown', 'PageDown', ' '].includes(k)) { e.preventDefault(); step(1); } else if (['ArrowUp', 'PageUp'].includes(k)) { e.preventDefault(); step(-1); }
  else if (k === 'Home') go(0); else if (k === 'End') go(N - 1); });
document.addEventListener('pointerdown', e => { if (menuToggle.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target)) closeMenu(); });
addEventListener('resize', () => { if (innerWidth > 720 && innerWidth / innerHeight >= .9) closeMenu(); });
document.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault(); go(+a.dataset.go);
  if (a.closest('nav')) { const wasOpen = menuToggle.getAttribute('aria-expanded') === 'true'; closeMenu(); if (wasOpen) menuToggle.focus(); }
}));
document.querySelectorAll('[data-social-placeholder]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
