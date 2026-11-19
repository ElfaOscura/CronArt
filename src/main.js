import './styles.css';
import { createIcons, icons } from 'lucide';
import { state, save, statusesFor, esc, ic, TYPES, ORDER } from './store.js';
import { t, applyI18n } from './i18n.js';
import { renderCalendar, renderKanban, pendingHTML, featuredHTML } from './views.js';
import { initModals, isModalOpen, isModalLocked, closeModal, openItem, confirmDel, openProfile, openList } from './modals.js';
const $ = (s) => document.querySelector(s);

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const GITHUB = 'https://github.com/ElfaOscura/CronArt'; // <- pon aquí tu repositorio

const NET = {
  x: ['X / Twitter', (u) => `https://x.com/${u}`, 'twitter'],
  ig: ['Instagram', (u) => `https://instagram.com/${u}`, 'camera'],
  fb: ['Facebook', (u) => `https://facebook.com/${u}`, 'facebook'],
  tt: ['TikTok', (u) => `https://tiktok.com/@${u}`, 'music-2'],
  pin: ['Pinterest', (u) => `https://pinterest.com/${u}`, 'pin'],
};

let deferred = null;
let draggedId = null;

/* ---------- render ---------- */
function renderMain() {
  $('#view').innerHTML =
    state.mode === 'calendar'
      ? `<div class="layout"><div class="flex flex-col min-h-0 min-w-0">${renderCalendar()}</div><aside class="side" aria-live="polite">${pendingHTML()}</aside></div>`
      : renderKanban();

  $('#featured').innerHTML = featuredHTML();

  document.querySelectorAll('[data-mode]').forEach((b) => {
    b.setAttribute('aria-pressed', b.dataset.mode === state.mode);
  });

  createIcons({ icons });
}

function renderChrome() {
  const r = document.documentElement;
  r.dataset.theme = state.theme;
  r.lang = state.lang;

  applyI18n();
  $('#fl-q').value = state.filter.q;
  $('#fl-q').placeholder = t('search');

  $('#fl-type').innerHTML =
    `<option value="">${t('all')}</option>` +
    Object.keys(TYPES).map((k) => `<option value="${k}">${t('type_' + k)}</option>`).join('');

  $('#fl-status').innerHTML =
    `<option value="">${t('all')}</option>` +
    ORDER.map((s) => `<option value="${s}">${t('st_' + s)}</option>`).join('');

  $('#fl-type').value = state.filter.type;
  $('#fl-status').value = state.filter.status;

  const soc = state.profile?.social || {};
  const links = Object.entries(NET)
    .filter(([k]) => soc[k])
    .map(([k, [n, url, icn]]) => `<a class="btn" href="${esc(url(encodeURIComponent(soc[k])))}" target="_blank" rel="noopener">${ic(icn)}${n}</a>`)
    .join('');

  $('#socials').innerHTML = links.replace(
    /<a class="btn"([^>]*)>(<i[^>]*><\/i>)([^<]*)<\/a>/g,
    (m, a, i, n) => `<a class="btn soc"${a} aria-label="${n}" title="${n}">${i}</a>`
  );

  $('#menu').innerHTML = `
    <button class="btn" data-m="profile">${ic('user-round')}${t('profile')}</button>
    <button class="btn" data-m="theme">${ic(state.theme === 'dark' ? 'sun' : 'moon')}${t('theme')}</button>
    <div class="seg" role="group" aria-label="${t('lang')}">
      <button class="btn" data-lang="es" aria-pressed="${state.lang === 'es'}">Español</button>
      <button class="btn" data-lang="en" aria-pressed="${state.lang === 'en'}">English</button>
    </div>
    <button class="btn" data-m="export">${ic('download')}${t('export')}</button>
    <button class="btn" data-m="import">${ic('upload')}${t('import')}</button>
    ${deferred ? `<button class="btn" data-m="install">${ic('smartphone')}${t('install')}</button>` : ''}
    <a class="btn" href="https://ko-fi.com/naidi_art" target="_blank" rel="noopener">${ic('coffee')}Ko-fi</a>
    <a class="btn" href="${GITHUB}" target="_blank" rel="noopener">${ic('git-branch')}GitHub</a>
  `;

  renderMain();
}

initModals({ today, renderMain, renderChrome, net: NET });

/* ---------- eventos ---------- */
const pops = () => [['#menu', '#btn-menu'], ['#filters', '#btn-filter']];

const closePops = (except) =>
  pops().forEach(([p, b]) => {
    if (p !== except) {
      $(p).hidden = true;
      $(b).setAttribute('aria-expanded', 'false');
    }
  });

const togglePop = (p, b) => {
  closePops(p);
  const h = $(p).hidden;
  $(p).hidden = !h;
  $(b).setAttribute('aria-expanded', String(h));
  if (h && p === '#filters') $('#fl-q').focus();
};

document.addEventListener('click', (e) => {
  const g = (s) => e.target.closest(s);
  if (g('[data-close]') && e.target.classList.contains('scrim')) return closeModal();
  if (g('#btn-menu')) return togglePop('#menu', '#btn-menu');
  if (g('#btn-list') || g('[data-open-list]')) return openList();
  if (g('#btn-filter')) return togglePop('#filters', '#btn-filter');
  if (!g('.pop')) closePops();

  let el;
  if (g('#btn-add')) return openItem({ date: today() });
  if ((el = g('[data-mode]'))) {
    state.mode = el.dataset.mode;
    return renderMain();
  }
  if ((el = g('[data-nav]'))) {
    const n = +el.dataset.nav;
    const now = new Date();
    state.view = n
      ? (() => {
          const d = new Date(state.view.y, state.view.m + n, 1);
          return { y: d.getFullYear(), m: d.getMonth() };
        })()
      : { y: now.getFullYear(), m: now.getMonth() };
    return renderMain();
  }
  if ((el = g('[data-act]'))) {
    const id = el.dataset.id;
    return el.dataset.act === 'del' ? confirmDel(id) : openItem(state.items.find((i) => i.id === id));
  }
  if ((el = g('[data-id]'))) return openItem(state.items.find((i) => i.id === el.dataset.id));
  if ((el = g('[data-day]'))) return openItem({ date: el.dataset.day, fromDay: true });
  if ((el = g('[data-lang]'))) {
    state.lang = el.dataset.lang;
    save();
    return renderChrome();
  }
  if ((el = g('[data-m]'))) {
    const a = el.dataset.m;
    if (a === 'profile') {
      closePops();
      openProfile();
    }
    if (a === 'theme') {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      save();
      renderChrome();
    }
    if (a === 'export') {
      const b = new Blob([JSON.stringify({ profile: state.profile, items: state.items }, null, 2)], { type: 'application/json' });
      const u = URL.createObjectURL(b);
      const l = document.createElement('a');
      l.href = u;
      l.download = `cronart-${today()}.json`;
      l.click();
      URL.revokeObjectURL(u);
    }
    if (a === 'import') $('#import').click();
    if (a === 'install' && deferred) {
      deferred.prompt();
      deferred = null;
      renderChrome();
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!isModalLocked() && isModalOpen()) closeModal();
    closePops();
  }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('[data-day]')) {
    e.preventDefault();
    e.target.click();
  }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'fl-q') {
    state.filter.q = e.target.value;
    renderMain();
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'fl-type' || e.target.id === 'fl-status') {
    state.filter = { ...state.filter, type: $('#fl-type').value, status: $('#fl-status').value };
    renderMain();
  }
  if (e.target.dataset.status) {
    const i = state.items.find((x) => x.id === e.target.dataset.status);
    if (!i) return;
    i.status = e.target.value;
    save();
    renderMain();
  }
  if (e.target.id === 'import') {
    const file = e.target.files[0];
    if (!file) return;
    file
      .text()
      .then((x) => {
        const j = JSON.parse(x);
        if (!Array.isArray(j.items)) throw 0;
        state.items = j.items;
        state.profile = j.profile || state.profile;
        save();
        renderChrome();
      })
      .catch(() => alert(t('badFile')));
    e.target.value = '';
  }
});

/* ---------- drag & drop kanban ---------- */
document.addEventListener('dragstart', (e) => {
  const card = e.target.closest('[data-drag-id]');
  if (!card || e.target.closest('select, button, input, textarea, a')) {
    e.preventDefault();
    return;
  }
  draggedId = card.dataset.dragId;
  card.classList.add('is-dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedId);
});

document.addEventListener('dragover', (e) => {
  const col = e.target.closest('[data-drop-status]');
  if (!col || !draggedId) return;

  const item = state.items.find((x) => x.id === draggedId);
  const targetStatus = col.dataset.dropStatus;
  if (!item || !targetStatus) return;

  const allowed = statusesFor(item.type, item.owner).includes(targetStatus);
  if (allowed) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.col.drop-over').forEach((c) => {
      if (c !== col) c.classList.remove('drop-over');
    });
    col.classList.add('drop-over');
  } else {
    col.classList.remove('drop-over');
  }
});

document.addEventListener('dragleave', (e) => {
  const col = e.target.closest('[data-drop-status]');
  if (col && !col.contains(e.relatedTarget)) {
    col.classList.remove('drop-over');
  }
});

document.addEventListener('drop', (e) => {
  const col = e.target.closest('[data-drop-status]');
  if (!col) return;
  e.preventDefault();
  col.classList.remove('drop-over');

  const id = draggedId || e.dataTransfer.getData('text/plain');
  const targetStatus = col.dataset.dropStatus;
  const item = state.items.find((x) => x.id === id);

  if (item && targetStatus && statusesFor(item.type, item.owner).includes(targetStatus)) {
    if (item.status !== targetStatus) {
      item.status = targetStatus;
      save();
      renderMain();
    }
  }
  draggedId = null;
});

document.addEventListener('dragend', () => {
  draggedId = null;
  document.querySelectorAll('.is-dragging').forEach((el) => el.classList.remove('is-dragging'));
  document.querySelectorAll('.drop-over').forEach((el) => el.classList.remove('drop-over'));
});

/* ---------- pwa ---------- */
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e;
  renderChrome();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

renderChrome();
if (!state.profile) openProfile(true);