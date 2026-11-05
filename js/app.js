import {state,save,statusesFor,uid,esc,ic,TYPES,ORDER} from './store.js';
import {t,applyI18n} from './i18n.js';
import {EPH} from './data/eph.js';
import {renderCalendar,renderKanban,pendingHTML,featuredHTML} from './views.js';
const $=s=>document.querySelector(s);
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const GITHUB='https://github.com/ElfaOscura/CronArt'; // <- pon aquí tu repositorio
const NET={x:['X / Twitter',u=>`https://x.com/${u}`,'twitter'],ig:['Instagram',u=>`https://instagram.com/${u}`,'instagram'],fb:['Facebook',u=>`https://facebook.com/${u}`,'facebook'],tt:['TikTok',u=>`https://tiktok.com/@${u}`,'music-2'],pin:['Pinterest',u=>`https://pinterest.com/${u}`,'pin']};
let deferred=null,lastFocus=null;

/* ---------- render ---------- */
function renderMain(){
  $('#view').innerHTML=state.mode==='calendar'?`<div class="layout"><div class="flex flex-col min-h-0 min-w-0">${renderCalendar()}</div><aside class="side" aria-live="polite">${pendingHTML()}</aside></div>`:renderKanban();
  $('#featured').innerHTML=featuredHTML();
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===state.mode));
  lucide.createIcons();
}
function renderChrome(){
  const r=document.documentElement;r.dataset.theme=state.theme;r.lang=state.lang;
  applyI18n();$('#fl-q').value=state.filter.q;$('#fl-q').placeholder=t('search');
  $('#fl-type').innerHTML=`<option value="">${t('all')}</option>`+Object.keys(TYPES).map(k=>`<option value="${k}">${t('type_'+k)}</option>`).join('');
  $('#fl-status').innerHTML=`<option value="">${t('all')}</option>`+ORDER.map(s=>`<option value="${s}">${t('st_'+s)}</option>`).join('');
  $('#fl-type').value=state.filter.type;$('#fl-status').value=state.filter.status;
  const soc=state.profile?.social||{},links=Object.entries(NET).filter(([k])=>soc[k]).map(([k,[n,url,icn]])=>`<a class="btn" href="${esc(url(encodeURIComponent(soc[k])))}" target="_blank" rel="noopener">${ic(icn)}${n}</a>`).join('');
  $('#socials').innerHTML=links.replace(/<a class="btn"([^>]*)>(<i[^>]*><\/i>)([^<]*)<\/a>/g,(m,a,i,n)=>`<a class="btn soc"${a} aria-label="${n}" title="${n}">${i}</a>`);
  $('#menu').innerHTML=`<button class="btn" data-m="profile">${ic('user-round')}${t('profile')}</button>
    <button class="btn" data-m="theme">${ic(state.theme==='dark'?'sun':'moon')}${t('theme')}</button>
    <div class="seg" role="group" aria-label="${t('lang')}"><button class="btn" data-lang="es" aria-pressed="${state.lang==='es'}">Español</button><button class="btn" data-lang="en" aria-pressed="${state.lang==='en'}">English</button></div>
    <button class="btn" data-m="export">${ic('download')}${t('export')}</button>
    <button class="btn" data-m="import">${ic('upload')}${t('import')}</button>
    ${deferred?`<button class="btn" data-m="install">${ic('smartphone')}${t('install')}</button>`:''}
    <a class="btn" href="https://ko-fi.com/naidi_art" target="_blank" rel="noopener">${ic('coffee')}Ko-fi</a>
    <a class="btn" href="${GITHUB}" target="_blank" rel="noopener">${ic('github')}GitHub</a>`;
  renderMain();
}

/* ---------- modal ---------- */
function modal(html,locked=false){
  lastFocus=document.activeElement;const m=$('#modal');
  m.innerHTML=`<div class="scrim"${locked?'':' data-close'}><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`;
  m.hidden=false;m.dataset.locked=locked;lucide.createIcons();m.querySelector('input,select,button')?.focus();
}
function closeModal(){const m=$('#modal');m.hidden=true;m.innerHTML='';lastFocus?.focus?.()}

function openItem(init={}){
  const d={id:null,date:today(),title:'',type:'free',status:'todo',star:false,owner:false,oc:false,refs:[],caption:'',img:'',...init};
  const fromDay=!!d.fromDay&&!d.id,L=state.lang==='en'?3:2,[,dm,dd]=d.date.split('-').map(Number);
  const dayEph=fromDay?EPH.filter(e=>e[0]===dm&&e[1]===dd).map(e=>e[L]).join(' / '):'';
  if(dayEph){d.title=d.title||dayEph;d.type='eph'}
  const refs=[...d.refs,'','',''].slice(0,3);let star=d.star,img=d.img;
  modal(`<form id="f" class="space-y-3"><h2 class="text-xl font-extrabold">${d.id?t('edit'):t('newItem')}</h2>
  <div class="flex gap-2 items-end"><label class="flex-1"><span class="lbl">${t('title')}</span><input id="f-title" class="field" required maxlength="80" value="${esc(d.title)}"></label>
    <button type="button" id="f-star" class="btn" aria-pressed="false"></button></div>
  <div id="f-warn" class="warn" role="alert" hidden></div>
  <div class="grid grid-cols-2 gap-2"><label><span class="lbl">${t('date')}</span><input id="f-date" type="date" class="field" required value="${d.date}"></label>
    <label><span class="lbl">${t('type')}</span><select id="f-type" class="field">${Object.keys(TYPES).map(k=>`<option value="${k}"${k===d.type?' selected':''}>${t('type_'+k)}</option>`).join('')}</select></label></div>
  <label class="flex items-center gap-2 font-semibold"><input type="checkbox" id="f-ephbox" class="w-5 h-5"${dayEph?' checked':''}${fromDay&&!dayEph?' disabled':''}> ${t('ephCheck')}</label>
  <select id="f-ephsel" class="field" hidden aria-label="${t('ephPick')}"></select>
  <div id="f-ownwrap"><label class="flex items-center gap-2 font-semibold"><input type="checkbox" id="f-owner" class="w-5 h-5"${d.owner?' checked':''}> ${t('owner')}</label></div>
  <label><span class="lbl">${t('status')}</span><select id="f-status" class="field"></select></label>
  <label class="flex items-center gap-2 font-semibold"><input type="checkbox" id="f-oc" class="w-5 h-5"${d.oc?' checked':''}> ${t('oc')}</label>
  <fieldset><legend class="lbl">${t('refs')}</legend>${refs.map(r=>`<input type="url" class="field f-ref mb-1" placeholder="https://" value="${esc(r)}">`).join('')}
    <label class="lbl mt-1">${t('upload')}<input id="f-file" type="file" accept="image/*" class="field"></label><img id="f-prev" alt="" class="max-h-32 rounded-lg mt-1" ${img?`src="${img}"`:'hidden'}></fieldset>
  <label><span class="lbl">${t('caption')}</span><textarea id="f-cap" rows="3" class="field">${esc(d.caption)}</textarea></label>
  <div class="flex gap-2 justify-end"><button type="button" class="btn" data-close-btn>${t('cancel')}</button><button class="btn btn-p">${ic('check')}${t('save')}</button></div></form>`);
  const f=$('#f'),q=s=>f.querySelector(s);
  const syncStatus=()=>{const ty=q('#f-type').value,cur=q('#f-status').value||d.status;
    q('#f-status').innerHTML=statusesFor(ty,q('#f-owner').checked).map(s=>`<option value="${s}"${s===cur?' selected':''}>${t('st_'+s)}</option>`).join('');q('#f-ownwrap').hidden=ty!=='collab'};
  const fillEph=()=>{const mo=+q('#f-date').value.split('-')[1]||1;
    q('#f-ephsel').innerHTML=`<option value="">${t('ephPick')}</option>`+EPH.map((e,i)=>e[0]===mo?`<option value="${i}">${e[1]}/${e[0]} - ${esc(e[state.lang==='en'?3:2])}</option>`:'').join('')};
  const paintStar=()=>{const b=q('#f-star');b.setAttribute('aria-pressed',star);b.innerHTML=ic('star','fill-current'.repeat(+star))+t('star');lucide.createIcons()};
  syncStatus();paintStar();
  q('#f-type').onchange=q('#f-owner').onchange=syncStatus;
  q('#f-date').onchange=fillEph;
  q('#f-ephbox').onchange=e=>{
    if(fromDay){if(e.target.checked){q('#f-title').value=dayEph;q('#f-type').value='eph';syncStatus()}else if(q('#f-title').value===dayEph)q('#f-title').value='';return}
    q('#f-ephsel').hidden=!e.target.checked;fillEph()};
  q('#f-ephsel').onchange=e=>{const x=EPH[e.target.value];if(!x)return;const y=q('#f-date').value.split('-')[0]||new Date().getFullYear();
    q('#f-date').value=`${y}-${String(x[0]).padStart(2,'0')}-${String(x[1]).padStart(2,'0')}`;q('#f-title').value=x[state.lang==='en'?3:2]};
  q('#f-star').onclick=()=>{
    if(!star){const others=state.items.filter(i=>i.star&&i.id!==d.id);
      if(others.length>=5){const w=q('#f-warn');w.hidden=false;
        w.innerHTML=`<p class="font-bold">${t('starLimit')}</p>`+others.map(o=>`<button type="button" class="btn" data-unstar="${o.id}">${ic('star-off')}${esc(o.title)}</button>`).join('');lucide.createIcons();return}}
    star=!star;q('#f-warn').hidden=true;paintStar()};
  q('#f-warn').onclick=e=>{const b=e.target.closest('[data-unstar]');if(!b)return;
    state.items.find(i=>i.id===b.dataset.unstar).star=false;save();star=true;q('#f-warn').hidden=true;paintStar();renderMain()};
  q('[data-close-btn]').onclick=closeModal;
  q('#f-file').onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();
    r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);img=c.toDataURL('image/jpeg',.7);q('#f-prev').src=img;q('#f-prev').hidden=false};im.src=r.result};r.readAsDataURL(file)};
  f.onsubmit=e=>{e.preventDefault();const ty=q('#f-type').value;
    const it={id:d.id||uid(),date:q('#f-date').value,title:q('#f-title').value.trim(),type:ty,status:q('#f-status').value,star,owner:ty==='collab'&&q('#f-owner').checked,oc:q('#f-oc').checked,
      refs:[...f.querySelectorAll('.f-ref')].map(i=>i.value.trim()).filter(Boolean),caption:q('#f-cap').value,img};
    const i=state.items.findIndex(x=>x.id===it.id);i<0?state.items.push(it):state.items[i]=it;
    const [y,m]=it.date.split('-');state.view={y:+y,m:+m-1};save();closeModal();renderMain()};
}
function confirmDel(id){
  modal(`<h2 class="text-xl font-extrabold mb-1">${t('delTitle')}</h2><p class="muted mb-4">${t('delTxt')}</p>
  <div class="flex gap-2 justify-end"><button class="btn" data-close-btn>${t('cancel')}</button><button class="btn btn-p" id="ok">${ic('trash-2')}${t('del')}</button></div>`);
  $('[data-close-btn]').onclick=closeModal;
  $('#ok').onclick=()=>{state.items=state.items.filter(i=>i.id!==id);save();closeModal();renderMain()};
}
function openProfile(first=false){
  const p=state.profile||{name:'',social:{}};
  modal(`<form id="pf" class="space-y-3"><h2 class="text-xl font-extrabold">${first?t('welcome'):t('profile')}</h2>${first?`<p class="muted">${t('onboard')}</p>`:''}
  <label><span class="lbl">${t('artist')}</span><input name="name" class="field" required value="${esc(p.name)}"></label>
  ${Object.entries(NET).map(([k,[n]])=>`<label class="block"><span class="lbl">${n}</span><input name="${k}" class="field" placeholder="@user" value="${esc(p.social[k]||'')}"></label>`).join('')}
  <div class="flex gap-2 justify-end">${first?'':`<button type="button" class="btn" data-close-btn>${t('cancel')}</button>`}<button class="btn btn-p">${ic('check')}${first?t('start'):t('save')}</button></div></form>`,first);
  $('[data-close-btn]')?.addEventListener('click',closeModal);
  $('#pf').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),social={};
    Object.keys(NET).forEach(k=>{const v=(fd.get(k)||'').trim().replace(/^@/,'');if(v)social[k]=v});
    state.profile={name:fd.get('name').trim(),social};save();closeModal();renderChrome()};
}

/* ---------- eventos ---------- */
const pops=()=>[['#menu','#btn-menu'],['#filters','#btn-filter']];
const closePops=except=>pops().forEach(([p,b])=>{if(p!==except){$(p).hidden=true;$(b).setAttribute('aria-expanded','false')}});
const togglePop=(p,b)=>{closePops(p);const h=$(p).hidden;$(p).hidden=!h;$(b).setAttribute('aria-expanded',String(h));if(h&&p==='#filters')$('#fl-q').focus()};
document.addEventListener('click',e=>{
  const g=s=>e.target.closest(s);
  if(g('[data-close]')&&e.target.classList.contains('scrim'))return closeModal();
  if(g('#btn-menu'))return togglePop('#menu','#btn-menu');
  if(g('#btn-filter'))return togglePop('#filters','#btn-filter');
  if(!g('.pop'))closePops();
  let el;
  if(g('#btn-add'))return openItem({date:today()});
  if(el=g('[data-mode]')){state.mode=el.dataset.mode;return renderMain()}
  if(el=g('[data-nav]')){const n=+el.dataset.nav,now=new Date();
    state.view=n?(()=>{const d=new Date(state.view.y,state.view.m+n,1);return{y:d.getFullYear(),m:d.getMonth()}})():{y:now.getFullYear(),m:now.getMonth()};return renderMain()}
  if(el=g('[data-act]')){const id=el.dataset.id;return el.dataset.act==='del'?confirmDel(id):openItem(state.items.find(i=>i.id===id))}
  if(el=g('[data-id]'))return openItem(state.items.find(i=>i.id===el.dataset.id));
  if(el=g('[data-day]'))return openItem({date:el.dataset.day,fromDay:true});
  if(el=g('[data-lang]')){state.lang=el.dataset.lang;save();return renderChrome()}
  if(el=g('[data-m]')){const a=el.dataset.m;
    if(a==='profile'){closePops();openProfile()}
    if(a==='theme'){state.theme=state.theme==='dark'?'light':'dark';save();renderChrome()}
    if(a==='export'){const b=new Blob([JSON.stringify({profile:state.profile,items:state.items},null,2)],{type:'application/json'}),u=URL.createObjectURL(b),l=document.createElement('a');l.href=u;l.download=`cronart-${today()}.json`;l.click();URL.revokeObjectURL(u)}
    if(a==='import')$('#import').click();
    if(a==='install'&&deferred){deferred.prompt();deferred=null;renderChrome()}}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if($('#modal').dataset.locked!=='true'&&!$('#modal').hidden)closeModal();closePops()}
  if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('[data-day]')){e.preventDefault();e.target.click()}});
document.addEventListener('input',e=>{if(e.target.id==='fl-q'){state.filter.q=e.target.value;renderMain()}});
document.addEventListener('change',e=>{
  if(e.target.id==='fl-type'||e.target.id==='fl-status'){state.filter={...state.filter,type:$('#fl-type').value,status:$('#fl-status').value};renderMain()}
  if(e.target.dataset.status){const i=state.items.find(x=>x.id===e.target.dataset.status);i.status=e.target.value;save();renderMain()}
  if(e.target.id==='import'){const file=e.target.files[0];if(!file)return;
    file.text().then(x=>{const j=JSON.parse(x);if(!Array.isArray(j.items))throw 0;state.items=j.items;state.profile=j.profile||state.profile;save();renderChrome()}).catch(()=>alert(t('badFile')));e.target.value=''}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;renderChrome()});
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});

renderChrome();
if(!state.profile)openProfile(true);
