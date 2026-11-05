const KEY='cronart:v1', now=new Date();
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{}
export const state={profile:null,items:[],lang:(navigator.language||'es').startsWith('en')?'en':'es',
  theme:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',...saved,
  view:{y:now.getFullYear(),m:now.getMonth()},mode:'calendar',filter:{type:'',status:'',q:''}};
export const save=()=>{const{profile,items,lang,theme}=state;try{localStorage.setItem(KEY,JSON.stringify({profile,items,lang,theme}))}catch{alert('Storage full / Almacenamiento lleno')}};
export const TYPES={eph:{icon:'paperclip'},free:{icon:'pencil'},commission:{icon:'briefcase'},collab:{icon:'handshake'}};
export const ORDER=['todo','sketch','wip','done','waiting','delivered','published'];
export const statusesFor=(type,owner)=>{const b=['todo','sketch','wip','done'];
  if(type==='commission')return[...b,'delivered','published'];
  if(type==='collab')return[...b,'delivered',...(owner?['waiting']:[])];
  return[...b,'published']};
export const visibleItems=()=>state.items.filter(i=>(!state.filter.type||i.type===state.filter.type)&&(!state.filter.status||i.status===state.filter.status)&&(!state.filter.q.trim()||(i.title+' '+i.caption).toLowerCase().includes(state.filter.q.trim().toLowerCase()))).sort((a,b)=>a.date.localeCompare(b.date));
export const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const ic=(n,c='w-4 h-4')=>`<i data-lucide="${n}" class="${c}" aria-hidden="true"></i>`;
export const fmt=d=>new Date(d+'T00:00').toLocaleDateString(state.lang,{day:'numeric',month:'short'});
