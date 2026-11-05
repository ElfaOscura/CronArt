const V='cronart-v2',A=['./','index.html','manifest.webmanifest','css/styles.css','js/app.js','js/views.js','js/store.js','js/i18n.js','js/data/eph.js','icons/icon.svg','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
e.respondWith(caches.match(e.request).then(r=>{const n=fetch(e.request).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp))}return res}).catch(()=>r);return r||n}))});
