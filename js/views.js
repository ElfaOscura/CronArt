import {state,TYPES,ORDER,statusesFor,visibleItems,esc,ic,fmt} from './store.js';
import {t} from './i18n.js';
import {EPH} from './data/eph.js';
const pad=n=>String(n).padStart(2,'0');
const postit=i=>`<button class="postit pi-${i.type}" data-id="${i.id}" title="${esc(i.title)}">${ic(TYPES[i.type].icon)}${i.star?ic('star','fill-current'):''}<span class="hidden sm:inline truncate">${esc(i.title)}</span></button>`;

export function renderCalendar(){
  const {y,m}=state.view,off=(new Date(y,m,1).getDay()+6)%7,dim=new Date(y,m+1,0).getDate(),n=Math.ceil((off+dim)/7)*7,now=new Date();
  const items=visibleItems(),L=state.lang==='en'?3:2;let cells='';
  for(let i=0;i<n;i++){const d=i-off+1;
    if(d<1||d>dim){cells+='<div class="cell off"></div>';continue}
    const key=`${y}-${pad(m+1)}-${pad(d)}`,its=items.filter(x=>x.date===key),eph=EPH.filter(e=>e[0]===m+1&&e[1]===d).map(e=>e[L]).join(', ');
    const today=now.getFullYear()===y&&now.getMonth()===m&&now.getDate()===d;
    cells+=`<div class="cell c${i%7}${today?' today':''}" data-day="${key}" role="button" tabindex="0" aria-label="${d}${eph?' - '+esc(eph):''}">
      <div class="flex items-center"><span class="dn">${d}</span>${eph?`<i class="edot sm:hidden" title="${esc(eph)}"></i>`:''}</div>
      ${eph?`<span class="eph hidden sm:block truncate">${esc(eph)}</span>`:''}
      <div class="pis">${its.slice(0,4).map(postit).join('')}${its.length>4?`<span class="more">+${its.length-4}</span>`:''}</div></div>`}
  const title=new Date(y,m,1).toLocaleDateString(state.lang,{month:'long',year:'numeric'});
  return `<div class="flex items-center gap-2 mb-2"><button class="btn" data-nav="-1" aria-label="${t('prev')}">${ic('chevron-left')}</button>
    <h2 class="flex-1 text-center text-xl font-extrabold capitalize">${title}</h2>
    <button class="btn" data-nav="0">${t('todayB')}</button><button class="btn" data-nav="1" aria-label="${t('next')}">${ic('chevron-right')}</button></div>
    <div class="cal" style="flex:none;grid-auto-rows:auto;margin-bottom:3px">${t('wd').map((w,i)=>`<div class="wd c${i}">${w}</div>`).join('')}</div>
    <div class="cal">${cells}</div>`;
}

export function renderKanban(){
  const items=visibleItems(),tot=items.length||1;
  const cols=ORDER.filter(s=>s!=='waiting'||state.items.some(i=>i.type==='collab'&&i.owner));
  const stats=cols.map(s=>{const c=items.filter(i=>i.status===s).length,p=Math.round(c/tot*100);
    return `<div class="stat r-${s}"><div class="donut"><svg viewBox="0 0 36 36" width="56" height="56"><circle class="track" cx="18" cy="18" r="15.9" fill="none" stroke-width="3.6"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke-width="3.6" stroke-linecap="round" pathLength="100" stroke-dasharray="${p} 100"/></svg><b>${p}%</b></div><span>${c}</span><span>${t('st_'+s)}</span></div>`}).join('');
  const card=i=>`<article class="card k-${i.type}"><div class="flex items-start gap-2">${ic(TYPES[i.type].icon,'w-4 h-4 mt-1 shrink-0')}<h3 class="font-bold flex-1 break-words">${esc(i.title)}</h3>${i.star?ic('star','w-4 h-4 fill-current'):''}</div>
    <p class="text-xs muted my-1"><span class="chip">${fmt(i.date)}</span>${i.type==='collab'&&i.owner?`<span class="chip">${t('owner').replace('¿','').replace('?','')}</span>`:''}${i.oc?'<span class="chip">OC</span>':''}</p>
    <div class="flex gap-1 items-center"><select class="field text-xs" data-status="${i.id}" aria-label="${t('status')}">${statusesFor(i.type,i.owner).map(s=>`<option value="${s}"${s===i.status?' selected':''}>${t('st_'+s)}</option>`).join('')}</select>
    <button class="btn" style="min-height:36px;padding:4px 8px" data-act="edit" data-id="${i.id}" aria-label="${t('edit')}">${ic('pencil')}</button>
    <button class="btn" style="min-height:36px;padding:4px 8px" data-act="del" data-id="${i.id}" aria-label="${t('del')}">${ic('trash-2')}</button></div></article>`;
  return `<div class="stats">${stats}</div><div class="board">${cols.map(s=>{const L=items.filter(i=>i.status===s);
    return `<section class="col"><h2>${t('st_'+s)} <span class="muted">${L.length}</span></h2>${L.map(card).join('')||`<p class="muted text-sm">${t('empty')}</p>`}</section>`}).join('')}</div>`;
}

export function pendingHTML(){
  const L=state.items.filter(i=>(i.type==='commission'||i.type==='collab')&&!['delivered','published'].includes(i.status)).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,8);
  return `<span class="font-bold shrink-0 flex items-center gap-1">${ic('flag')}${t('pending')}</span>`+(L.length?L.map(i=>`<button class="postit pi-${i.type} shrink-0" data-id="${i.id}">${ic(TYPES[i.type].icon)}<span>${esc(i.title)}</span><span class="opacity-80">${fmt(i.date)}</span></button>`).join(''):`<span class="muted text-sm">${t('noPending')}</span>`);
}

export function featuredHTML(){
  const L=state.items.filter(i=>i.star).sort((a,b)=>a.date.localeCompare(b.date));
  return `<span class="font-bold shrink-0 flex items-center gap-1">${ic('star','w-4 h-4 fill-current')}${t('featured')}</span>`+(L.length?L.map(i=>`<button class="postit pi-${i.type} shrink-0" data-id="${i.id}">${ic(TYPES[i.type].icon)}<span>${esc(i.title)}</span><span class="opacity-80">${fmt(i.date)}</span></button>`).join(''):`<span class="muted text-sm">${t('noFeatured')}</span>`);
}
