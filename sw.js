/* Service worker — o portfólio funciona offline depois da primeira visita */
const CACHE = 'dc-portfolio-v2';
const ASSETS = [
 "./404.html",
 "./assets/css/base.css",
 "./assets/css/competencias.css",
 "./assets/css/contacto.css",
 "./assets/css/erro.css",
 "./assets/css/experiencia.css",
 "./assets/css/fonts.css",
 "./assets/css/home.css",
 "./assets/css/projetos.css",
 "./assets/css/sobre.css",
 "./assets/docs/CV-Delcio-Cunha.pdf",
 "./assets/img/delcio.jpg",
 "./assets/img/favicon.svg",
 "./assets/img/icon-180.png",
 "./assets/img/icon-192.png",
 "./assets/img/icon-512.png",
 "./assets/img/og.jpg",
 "./assets/js/core.js",
 "./assets/js/pages/competencias.js",
 "./assets/js/pages/contacto.js",
 "./assets/js/pages/erro.js",
 "./assets/js/pages/experiencia.js",
 "./assets/js/pages/globe.js",
 "./assets/js/pages/home.js",
 "./assets/js/pages/projetos.js",
 "./assets/js/pages/sobre.js",
 "./assets/js/world-dots.js",
 "./assets/vendor/Draggable.min.js",
 "./assets/vendor/ScrollTrigger.min.js",
 "./assets/vendor/SplitText.min.js",
 "./assets/vendor/gsap.min.js",
 "./assets/vendor/lenis.css",
 "./assets/vendor/lenis.min.js",
 "./assets/vendor/qrcode.js",
 "./assets/vendor/three.min.js",
 "./competencias.html",
 "./contacto.html",
 "./experiencia.html",
 "./index.html",
 "./manifest.webmanifest",
 "./projetos.html",
 "./robots.txt",
 "./sobre.html"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // páginas: rede primeiro (conteúdo atual), cache como reserva
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./404.html'))));
    return;
  }
  // ficheiros estáticos: cache primeiro
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })));
});
