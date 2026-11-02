/* Service worker — o portfólio funciona offline depois da primeira visita */
const CACHE = 'dc-portfolio-v18';
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
 "./assets/img/projetos/adana-agenda.jpg",
 "./assets/img/projetos/adana-aviso.jpg",
 "./assets/img/projetos/adana-logo.jpg",
 "./assets/img/projetos/adana-ola.jpg",
 "./assets/img/projetos/adana-pastas.jpg",
 "./assets/img/projetos/adana-site.jpg",
 "./assets/img/projetos/adana-wikipedia.jpg",
 "./assets/img/projetos/anga-guildas.jpg",
 "./assets/img/projetos/anga-home.jpg",
 "./assets/img/projetos/anga-liga.jpg",
 "./assets/img/projetos/anga-mercado.jpg",
 "./assets/img/projetos/anga-noticias.jpg",
 "./assets/img/projetos/anga-trofeus.jpg",
 "./assets/img/projetos/hortomar-codigo.jpg",
 "./assets/img/projetos/sistema-ativacao.jpg",
 "./assets/img/projetos/sistema-chefes.jpg",
 "./assets/img/projetos/sistema-jogo.jpg",
 "./assets/img/projetos/sistema-painel.jpg",
 "./assets/img/projetos/sistema-parceiros.jpg",
 "./assets/img/projetos/sistema-site.jpg",
 "./assets/img/projetos/hortomar-consola.jpg",
 "./assets/img/projetos/hortomar-csv.jpg",
 "./assets/img/projetos/hortomar-fonte.jpg",
 "./assets/img/projetos/hortomar-powerquery.jpg",
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
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // páginas: rede primeiro (conteúdo atual), cache como reserva
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./404.html'))));
    return;
  }
  // ficheiros estáticos: cache primeiro
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })));
});
