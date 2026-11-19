import { createIcons, icons } from 'lucide';
import { state, save, statusesFor, uid, esc, ic, TYPES } from './store.js';
import { t } from './i18n.js';
import { EPH } from './eph.js';

const $ = (s) => document.querySelector(s);

let lastFocus = null;
let ctx = {
  today: () => '',
  renderMain: () => {},
  renderChrome: () => {},
  net: {},
};

export function initModals(deps) {
  ctx = { ...ctx, ...deps };
}

export function isModalOpen() {
  const m = $('#modal');
  return Boolean(m && !m.hidden);
}

export function isModalLocked() {
  return $('#modal')?.dataset.locked === 'true';
}

export function modal(html, locked = false) {
  lastFocus = document.activeElement;
  const m = $('#modal');
  m.innerHTML = `
    <div class="scrim"${locked ? '' : ' data-close'}>
      <div class="sheet" role="dialog" aria-modal="true">${html}</div>
    </div>
  `;
  m.hidden = false;
  m.dataset.locked = String(locked);
  createIcons({ icons });
  m.querySelector('input,select,button')?.focus();
}

export function closeModal() {
  const m = $('#modal');
  m.hidden = true;
  m.innerHTML = '';
  lastFocus?.focus?.();
}

export function openItem(init = {}) {
  const d = {
    id: null,
    date: ctx.today(),
    title: '',
    type: 'free',
    status: 'todo',
    star: false,
    owner: false,
    oc: false,
    refs: [],
    caption: '',
    img: '',
    ...init,
  };

  const fromDay = !!d.fromDay && !d.id;
  const L = state.lang === 'en' ? 3 : 2;
  const [, dm, dd] = d.date.split('-').map(Number);
  const dayEph = fromDay ? EPH.filter((e) => e[0] === dm && e[1] === dd).map((e) => e[L]).join(' / ') : '';

  if (dayEph) {
    d.title = d.title || dayEph;
    d.type = 'eph';
  }

  const refs = [...d.refs, '', '', ''].slice(0, 3);
  let star = d.star;
  let img = d.img;

  modal(`
    <form id="f" class="space-y-3">
      <h2 class="text-xl font-extrabold">${d.id ? t('edit') : t('newItem')}</h2>
      <div class="flex gap-2 items-end">
        <label class="flex-1 min-w-0">
          <span class="lbl">${t('title')}</span>
          <input id="f-title" class="field" required maxlength="80" value="${esc(d.title)}">
        </label>
        <button type="button" id="f-star" class="btn shrink-0" aria-pressed="false"></button>
      </div>
      <div id="f-warn" class="warn" role="alert" hidden></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label class="min-w-0">
          <span class="lbl">${t('date')}</span>
          <input id="f-date" type="date" class="field" required value="${d.date}">
        </label>
        <label class="min-w-0">
          <span class="lbl">${t('type')}</span>
          <select id="f-type" class="field">
            ${Object.keys(TYPES).map((k) => `<option value="${k}"${k === d.type ? ' selected' : ''}>${t('type_' + k)}</option>`).join('')}
          </select>
        </label>
      </div>
      <label class="flex items-center gap-2 font-semibold">
        <input type="checkbox" id="f-ephbox" class="w-5 h-5"${dayEph ? ' checked' : ''}${fromDay && !dayEph ? ' disabled' : ''}> ${t('ephCheck')}
      </label>
      <select id="f-ephsel" class="field" hidden aria-label="${t('ephPick')}"></select>
      <div id="f-ownwrap">
        <label class="flex items-center gap-2 font-semibold">
          <input type="checkbox" id="f-owner" class="w-5 h-5"${d.owner ? ' checked' : ''}> ${t('owner')}
        </label>
      </div>
      <label>
        <span class="lbl">${t('status')}</span>
        <select id="f-status" class="field"></select>
      </label>
      <label class="flex items-center gap-2 font-semibold">
        <input type="checkbox" id="f-oc" class="w-5 h-5"${d.oc ? ' checked' : ''}> ${t('oc')}
      </label>
      <fieldset>
        <legend class="lbl">${t('refs')}</legend>
        ${refs.map((r) => `<input type="url" class="field f-ref mb-1" placeholder="https://" value="${esc(r)}">`).join('')}
        <label class="lbl mt-1">
          ${t('upload')}
          <input id="f-file" type="file" accept="image/*" class="field">
        </label>
        <img id="f-prev" alt="" class="max-h-32 rounded-lg mt-1" ${img ? `src="${img}"` : 'hidden'}>
      </fieldset>
      <label>
        <span class="lbl">${t('caption')}</span>
        <textarea id="f-cap" rows="3" class="field">${esc(d.caption)}</textarea>
      </label>
      <div class="flex gap-2 items-center justify-between flex-wrap pt-1">
        <div>
          ${d.id ? `<button type="button" class="btn" id="f-del">${ic('trash-2')}${t('del')}</button>` : ''}
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn" data-close-btn>${t('cancel')}</button>
          <button type="submit" class="btn btn-p">${ic('check')}${t('save')}</button>
        </div>
      </div>
    </form>
  `);

  const f = $('#f');
  const q = (s) => f.querySelector(s);

  const syncStatus = () => {
    const ty = q('#f-type').value;
    const cur = q('#f-status').value || d.status;
    q('#f-status').innerHTML = statusesFor(ty, q('#f-owner').checked)
      .map((s) => `<option value="${s}"${s === cur ? ' selected' : ''}>${t('st_' + s)}</option>`)
      .join('');
    q('#f-ownwrap').hidden = ty !== 'collab';
  };

  const fillEph = () => {
    const mo = +q('#f-date').value.split('-')[1] || 1;
    q('#f-ephsel').innerHTML =
      `<option value="">${t('ephPick')}</option>` +
      EPH.map((e, i) => (e[0] === mo ? `<option value="${i}">${e[1]}/${e[0]} - ${esc(e[state.lang === 'en' ? 3 : 2])}</option>` : '')).join('');
  };

  const paintStar = () => {
    const b = q('#f-star');
    b.setAttribute('aria-pressed', String(star));
    b.innerHTML = ic('star', 'fill-current'.repeat(+star)) + t('star');
    createIcons({ icons });
  };

  syncStatus();
  paintStar();

  q('#f-type').onchange = q('#f-owner').onchange = syncStatus;
  q('#f-date').onchange = fillEph;

  q('#f-ephbox').onchange = (e) => {
    if (fromDay) {
      if (e.target.checked) {
        q('#f-title').value = dayEph;
        q('#f-type').value = 'eph';
        syncStatus();
      } else if (q('#f-title').value === dayEph) {
        q('#f-title').value = '';
      }
      return;
    }
    q('#f-ephsel').hidden = !e.target.checked;
    fillEph();
  };

  q('#f-ephsel').onchange = (e) => {
    const x = EPH[e.target.value];
    if (!x) return;
    const y = q('#f-date').value.split('-')[0] || new Date().getFullYear();
    q('#f-date').value = `${y}-${String(x[0]).padStart(2, '0')}-${String(x[1]).padStart(2, '0')}`;
    q('#f-title').value = x[state.lang === 'en' ? 3 : 2];
  };

  q('#f-star').onclick = () => {
    if (!star) {
      const others = state.items.filter((i) => i.star && i.id !== d.id);
      if (others.length >= 5) {
        const w = q('#f-warn');
        w.hidden = false;
        w.innerHTML =
          `<p class="font-bold">${t('starLimit')}</p>` +
          others.map((o) => `<button type="button" class="btn" data-unstar="${o.id}">${ic('star-off')}${esc(o.title)}</button>`).join('');
        createIcons({ icons });
        return;
      }
    }
    star = !star;
    q('#f-warn').hidden = true;
    paintStar();
  };

  q('#f-warn').onclick = (e) => {
    const b = e.target.closest('[data-unstar]');
    if (!b) return;
    const target = state.items.find((i) => i.id === b.dataset.unstar);
    if (!target) return;
    target.star = false;
    save();
    star = true;
    q('#f-warn').hidden = true;
    paintStar();
    ctx.renderMain();
  };

  q('[data-close-btn]').onclick = closeModal;

  q('#f-del')?.addEventListener('click', () => {
    confirmDel(d.id);
  });

  q('#f-file').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const s = Math.min(1, 600 / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * s);
        c.height = Math.round(im.height * s);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        img = c.toDataURL('image/jpeg', 0.6);
        q('#f-prev').src = img;
        q('#f-prev').hidden = false;
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  };

  f.onsubmit = (e) => {
    e.preventDefault();
    const ty = q('#f-type').value;
    const it = {
      id: d.id || uid(),
      date: q('#f-date').value,
      title: q('#f-title').value.trim(),
      type: ty,
      status: q('#f-status').value,
      star,
      owner: ty === 'collab' && q('#f-owner').checked,
      oc: q('#f-oc').checked,
      refs: [...f.querySelectorAll('.f-ref')].map((i) => i.value.trim()).filter(Boolean),
      caption: q('#f-cap').value,
      img,
    };
    const i = state.items.findIndex((x) => x.id === it.id);
    if (i < 0) state.items.push(it);
    else state.items[i] = it;

    const [y, m] = it.date.split('-');
    state.view = { y: +y, m: +m - 1 };
    save();
    closeModal();
    ctx.renderMain();
  };
}

export function confirmDel(id, onDone = null) {
  modal(`
    <h2 class="text-xl font-extrabold mb-1">${t('delTitle')}</h2>
    <p class="muted mb-4">${t('delTxt')}</p>
    <div class="flex gap-2 justify-end">
      <button type="button" class="btn" data-close-btn>${t('cancel')}</button>
      <button type="button" class="btn btn-p" id="ok">${ic('trash-2')}${t('del')}</button>
    </div>
  `);

  $('[data-close-btn]').onclick = () => {
    if (onDone) onDone();
    else closeModal();
  };

  $('#ok').onclick = () => {
    state.items = state.items.filter((i) => i.id !== id);
    save();
    ctx.renderMain();
    if (onDone) onDone();
    else closeModal();
  };
}

export function openList() {
  const renderListModal = (query = '') => {
    const qText = query.trim().toLowerCase();
    const list = [...state.items]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((item) => !qText || `${item.title} ${item.caption || ''} ${item.type} ${item.status}`.toLowerCase().includes(qText));

    modal(`
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-xl font-extrabold">${t('list')} (${state.items.length})</h2>
          <button type="button" class="btn" data-close-btn aria-label="${t('cancel')}">${ic('x')}</button>
        </div>

        <div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
          <input id="lst-q" type="search" class="field flex-1" placeholder="${esc(t('search'))}" value="${esc(query)}">
          <div class="flex gap-2 shrink-0">
            <button type="button" class="btn" id="lst-sel-all">${ic('check-square')}<span id="lst-sel-lbl">${t('selectAll')}</span></button>
            <button type="button" class="btn btn-p" id="lst-del-batch" disabled>${ic('trash-2')}${t('deleteBatch')} (<span id="lst-count">0</span>)</button>
          </div>
        </div>

        <div id="lst-confirm" class="warn" role="alert" hidden></div>

        <div class="space-y-2 max-h-[55dvh] overflow-y-auto pr-1">
          ${
            list.length
              ? list
                  .map(
                    (item) => `
                      <div class="flex items-center gap-2.5 p-2.5 rounded-2xl border border-[var(--ln)] bg-[color-mix(in_srgb,var(--sf)_65%,transparent)]">
                        <input type="checkbox" class="lst-check w-4 h-4" value="${item.id}" aria-label="${esc(item.title)}">
                        ${
                          item.img
                            ? `<img src="${item.img}" alt="" class="w-11 h-11 rounded-xl object-cover shrink-0 border border-[var(--ln)]">`
                            : `<div class="w-11 h-11 rounded-xl grid place-items-center shrink-0 border border-[var(--ln)] bg-[color-mix(in_srgb,var(--sol)_75%,transparent)]">${ic(TYPES[item.type]?.icon || 'pencil')}</div>`
                        }
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center gap-1.5">
                            ${item.star ? ic('star', 'w-3.5 h-3.5 fill-current shrink-0') : ''}
                            <p class="font-bold truncate">${esc(item.title)}</p>
                          </div>
                          <p class="text-xs muted truncate">
                            ${esc(item.date)} · ${esc(t('type_' + item.type))} · ${esc(t('st_' + item.status))}
                          </p>
                        </div>
                        <button type="button" class="btn shrink-0" data-lst-edit="${item.id}" aria-label="${t('edit')}">${ic('pencil')}</button>
                      </div>
                    `
                  )
                  .join('')
              : `<p class="muted text-sm py-6 text-center">${t('empty')}</p>`
          }
        </div>
      </div>
    `);

    const dlg = $('#modal');
    const checks = () => [...dlg.querySelectorAll('.lst-check')];
    const selectedIds = () => checks().filter((c) => c.checked).map((c) => c.value);

    const syncBatchBar = () => {
      const ids = selectedIds();
      const btnDel = dlg.querySelector('#lst-del-batch');
      const cnt = dlg.querySelector('#lst-count');
      const selLbl = dlg.querySelector('#lst-sel-lbl');
      if (cnt) cnt.textContent = String(ids.length);
      if (btnDel) btnDel.disabled = ids.length === 0;
      if (selLbl) {
        const allChecked = checks().length > 0 && ids.length === checks().length;
        selLbl.textContent = allChecked ? t('deselectAll') : t('selectAll');
      }
    };

    dlg.querySelector('[data-close-btn]')?.addEventListener('click', closeModal);

    const searchInput = dlg.querySelector('#lst-q');
    searchInput?.addEventListener('input', (e) => {
      const val = e.target.value;
      renderListModal(val);
      const nextInput = $('#modal #lst-q');
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(val.length, val.length);
      }
    });

    dlg.querySelector('#lst-sel-all')?.addEventListener('click', () => {
      const all = checks();
      const shouldCheck = all.some((c) => !c.checked);
      all.forEach((c) => {
        c.checked = shouldCheck;
      });
      syncBatchBar();
    });

    checks().forEach((c) => c.addEventListener('change', syncBatchBar));

    dlg.querySelectorAll('[data-lst-edit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = state.items.find((x) => x.id === btn.dataset.lstEdit);
        if (item) openItem(item);
      });
    });

    dlg.querySelector('#lst-del-batch')?.addEventListener('click', () => {
      const ids = selectedIds();
      if (!ids.length) return;
      const box = dlg.querySelector('#lst-confirm');
      if (!box) return;
      box.hidden = false;
      box.innerHTML = `
        <p class="font-bold">${t('delTitle')} (${ids.length})</p>
        <p class="text-xs muted">${t('delTxt')}</p>
        <div class="flex gap-2 justify-end mt-1">
          <button type="button" class="btn" id="lst-cancel-batch">${t('cancel')}</button>
          <button type="button" class="btn btn-p" id="lst-ok-batch">${ic('trash-2')}${t('del')}</button>
        </div>
      `;
      createIcons({ icons });

      box.querySelector('#lst-cancel-batch')?.addEventListener('click', () => {
        box.hidden = true;
        box.innerHTML = '';
      });

      box.querySelector('#lst-ok-batch')?.addEventListener('click', () => {
        const removeSet = new Set(ids);
        state.items = state.items.filter((i) => !removeSet.has(i.id));
        save();
        ctx.renderMain();
        renderListModal(searchInput?.value || '');
      });
    });
  };

  renderListModal('');
}

export function openProfile(first = false) {
  const p = state.profile || { name: '', social: {} };
  modal(`
    <form id="pf" class="space-y-3">
      <h2 class="text-xl font-extrabold">${first ? t('welcome') : t('profile')}</h2>
      ${first ? `<p class="muted">${t('onboard')}</p>` : ''}
      <label>
        <span class="lbl">${t('artist')}</span>
        <input name="name" class="field" required value="${esc(p.name)}">
      </label>
      ${Object.entries(ctx.net)
        .map(([k, [n]]) => `<label class="block"><span class="lbl">${n}</span><input name="${k}" class="field" placeholder="@user" value="${esc(p.social[k] || '')}"></label>`)
        .join('')}
      <div class="flex gap-2 justify-end">
        ${first ? '' : `<button type="button" class="btn" data-close-btn>${t('cancel')}</button>`}
        <button class="btn btn-p">${ic('check')}${first ? t('start') : t('save')}</button>
      </div>
    </form>
  `, first);

  $('[data-close-btn]')?.addEventListener('click', closeModal);

  $('#pf').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const social = {};
    Object.keys(ctx.net).forEach((k) => {
      const v = (fd.get(k) || '').trim().replace(/^@/, '');
      if (v) social[k] = v;
    });
    state.profile = { name: fd.get('name').trim(), social };
    save();
    closeModal();
    ctx.renderChrome();
  };
}