/* Projetos — galeria horizontal fixada, maquetes interativas e estudos de caso */
(() => {
  const { $, $$, reduce, fine } = window.DC;
  const html = document.documentElement;

  /* ---------- galeria horizontal ---------- */
  let hgST = null, hgDist = 0;
  const track = $('#hgTrack'), pin = $('.hg-pin'), bar = $('#hgBar');
  function setupHG() {
    if (!window.gsap || !window.ScrollTrigger || reduce) { html.classList.add('no-hg'); return; }
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1000px) and (min-height: 620px)', () => {
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tw = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: pin, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: self => { if (bar) bar.style.transform = `scaleX(${self.progress})`; },
          onRefresh: self => { hgST = self; hgDist = dist(); }
        }
      });
      hgST = tw.scrollTrigger; hgDist = dist();
      // ligeiro parallax dentro de cada maquete
      $$('.panel .mock', track).forEach(m => gsap.fromTo(m, { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: m.closest('.panel'), containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } }));
      return () => { hgST = null; };
    });
  }
  window.DC.ready(setupHG);

  // índice no topo: salta para o painel certo também no modo horizontal
  $$('.pi, .pi-jump').forEach(a => a.addEventListener('click', e => {
    const p = $(a.getAttribute('href')); if (!p) return;
    e.preventDefault(); e.stopPropagation();
    if (hgST && hgDist > 0 && track.contains(p)) {
      const padL = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const k = Math.min(1, Math.max(0, (p.offsetLeft - padL) / hgDist));
      const y = hgST.start + k * (hgST.end - hgST.start);
      window.DC.lenis ? window.DC.lenis.scrollTo(y, { duration: 1.4 }) : window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.DC.lenis ? window.DC.lenis.scrollTo(p, { offset: -90 }) : p.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }
  }, true));

  /* ---------- GEPGEO: troca de idioma ---------- */
  const T = {
    pt: { h: 'Precisão que dá forma aos projectos de Angola.', s: 'Topografia · Cartografia · Engenharia · Formação', b: 'Pedir orçamento', c1: 'Portfólio', c2: 'Cursos' },
    en: { h: "Precision that shapes Angola's projects.", s: 'Surveying · Mapping · Engineering · Training', b: 'Request a quote', c1: 'Portfolio', c2: 'Courses' }
  };
  const setLang = l => {
    $$('.lang-sw button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
    const h = $('#mgH'); h.style.opacity = 0;
    setTimeout(() => { h.textContent = T[l].h; $('#mgS').textContent = T[l].s; $('#mgB').textContent = T[l].b; $('#mgC1').textContent = T[l].c1; $('#mgC2').textContent = T[l].c2; h.style.opacity = 1; }, 180);
  };
  let lang = 'pt', userSet = false;
  $$('.lang-sw button').forEach(b => b.addEventListener('click', () => { userSet = true; lang = b.dataset.lang; setLang(lang); }));
  if (!reduce) setInterval(() => { if (!userSet && !document.hidden) { lang = lang === 'pt' ? 'en' : 'pt'; setLang(lang); } }, 3600);
  // mapa 3D reage ao rato
  const plane = $('#mgPlane'), geoMock = plane && plane.closest('.mock-body');
  if (plane && fine && !reduce) {
    geoMock.addEventListener('pointermove', e => { const r = geoMock.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; plane.style.transform = `rotateX(${55 - y * 18}deg) rotateZ(${-20 + x * 36}deg)`; });
    geoMock.addEventListener('pointerleave', () => plane.style.transform = '');
  }

  /* ---------- C3-Geo: drone segue o cursor ---------- */
  const map = $('#c3Map'), drone = $('#drone'), coord = $('#c3Coord');
  if (map && drone) {
    let tx = 0, ty = 0, x = 0, y = 0, inside = false, t = 0;
    const rect = () => map.getBoundingClientRect();
    const place = () => { const r = rect(); tx = r.width * .62 - 60; ty = r.height * .42 - 50; };
    place();
    map.addEventListener('pointermove', e => { const r = rect(); inside = true; tx = e.clientX - r.left - 60; ty = e.clientY - r.top - 70; });
    map.addEventListener('pointerleave', () => { inside = false; place(); });
    const loop = () => {
      t += .016;
      const r = rect();
      const ax = inside ? tx : tx + Math.cos(t * .7) * r.width * .18;
      const ay = inside ? ty : ty + Math.sin(t * 1.1) * 26;
      x += (ax - x) * (reduce ? 1 : .07); y += (ay - y) * (reduce ? 1 : .07);
      const tilt = Math.max(-14, Math.min(14, (ax - x) * .12));
      drone.style.transform = `translate(${x}px,${y}px) rotate(${tilt}deg)`;
      if (coord && r.width) { const lat = -4.4 - ((y + 50) / r.height) * 13.6, lon = 11.7 + ((x + 60) / r.width) * 12.3; coord.textContent = `lat ${lat.toFixed(2).replace('-', '−')} · lon ${lon.toFixed(2)}`; }
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- URBANDA: painel com filtros ---------- */
  const ROWS = [
    { id: 1042, tipo: 'Iluminação pública', bairro: 'Maianga', st: 'analise' },
    { id: 1041, tipo: 'Recolha de lixo', bairro: 'Bairro Azul', st: 'resolvida' },
    { id: 1040, tipo: 'Buraco na via', bairro: 'Ingombota', st: 'nova' },
    { id: 1039, tipo: 'Fuga de água', bairro: 'Rangel', st: 'analise' },
    { id: 1038, tipo: 'Sinalização danificada', bairro: 'Alvalade', st: 'resolvida' },
    { id: 1037, tipo: 'Passeio obstruído', bairro: 'Maianga', st: 'nova' },
    { id: 1036, tipo: 'Recolha de lixo', bairro: 'Samba', st: 'resolvida' }
  ];
  const LBL = { nova: 'nova', analise: 'em análise', resolvida: 'resolvida' };
  const tbl = $('#muTable'), kp = $('#muKpis'), api = $('#muApi');
  function renderUrb(f) {
    const rows = f === 'todas' ? ROWS : ROWS.filter(r => r.st === f);
    tbl.innerHTML = `<div class="mu-row"><span>#</span><span>denúncia</span><span>bairro</span><span>estado</span></div>` +
      rows.map((r, i) => `<div class="mu-row" style="animation-delay:${i * 50}ms"><span>${r.id}</span><span>${r.tipo}</span><span>${r.bairro}</span><span class="st ${r.st}">${LBL[r.st]}</span></div>`).join('');
    const c = s => ROWS.filter(r => r.st === s).length;
    kp.innerHTML = `<div>novas<b>${c('nova')}</b></div><div>em análise<b>${c('analise')}</b></div><div>resolvidas<b>${c('resolvida')}</b></div>`;
    api.innerHTML = `<b>GET</b> /api/denuncias/${f === 'todas' ? '' : '?estado=' + f} <span>→ 200 OK · ${rows.length} resultados</span>`;
  }
  if (tbl) {
    renderUrb('todas');
    $$('.mu-filters button').forEach(b => b.addEventListener('click', () => { $$('.mu-filters button').forEach(x => x.classList.toggle('on', x === b)); renderUrb(b.dataset.f); }));
  }


  /* ---------- KUDJIMA: loja com filtros e carrinho ---------- */
  const KJI = {
    shrimp: '<path d="M18 30c0-11 9-18 20-18 9 0 15 6 15 13 0 6-5 10-11 10H30" stroke="#E2553A" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M30 35l-6 7M36 35l-4 8M42 34l-2 8" stroke="#E2553A" stroke-width="2" stroke-linecap="round"/><path d="M50 18c4-6 9-9 12-9M52 22c5-3 9-3 11-2" stroke="#E2553A" stroke-width="1.4" stroke-linecap="round"/><circle cx="46" cy="20" r="1.6" fill="#0B2440"/>',
    lobster: '<path d="M14 27c0-5 5-8 12-8h14c4 0 7 3 7 8s-3 8-7 8H26c-7 0-12-3-12-8Z" fill="#8A3B1E"/><path d="M14 27H6l-3-4M14 27l-8 4-2 5" stroke="#8A3B1E" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M46 22l6-5M46 32l6 5" stroke="#8A3B1E" stroke-width="2.4" stroke-linecap="round"/><path d="M52 17c3-3 8-3 9 0-2 2-6 3-9 0ZM52 37c3 3 8 3 9 0-2-2-6-3-9 0Z" fill="#A84A26"/><path d="M47 24c6-6 12-14 15-20M47 30c6 6 12 14 15 20" stroke="#8A3B1E" stroke-width="1" stroke-linecap="round" fill="none"/><path d="M24 20v15M30 20v15M36 20v15" stroke="#6B2C15" stroke-width="1"/><circle cx="44" cy="25" r="1.4" fill="#F4F8FB"/>',
    fish: '<path d="M10 26c8-11 26-13 38 0-12 13-30 11-38 0Z" fill="#6E7F5A"/><path d="M48 26l12-9v18Z" fill="#5A6B48"/><circle cx="20" cy="24" r="2" fill="#0B2440"/><path d="M28 18c3 5 3 11 0 16" stroke="#F4F8FB" stroke-width="1.2" fill="none" opacity=".6"/>',
    octo: '<ellipse cx="34" cy="18" rx="13" ry="11" fill="#B4626B"/><path d="M24 26c-4 6-10 8-14 7M29 28c-2 7-6 11-11 12M34 29c0 7-2 11-5 14M39 28c2 7 6 11 11 12M44 26c4 6 10 8 14 7" stroke="#B4626B" stroke-width="3.2" stroke-linecap="round" fill="none"/>',
    squid: '<path d="M12 26c10-8 26-9 36-4l10-4v16l-10-4c-10 5-26 4-36-4Z" fill="#C9A3B7"/><path d="M12 26c-3-2-6-2-8 0M12 27c-3 2-6 3-8 2" stroke="#C9A3B7" stroke-width="1.6" stroke-linecap="round"/><circle cx="20" cy="25" r="1.6" fill="#0B2440"/>'
  };
  const KJ = [
    { n: 'Lagosta', c: 'mar', tag: 'MARISCO', i: 'lobster', p: 18950, sz: [], note: 'Tamanho único' },
    { n: 'Gamba', c: 'mar', tag: 'MARISCO', i: 'shrimp', p: 17900, sz: ['N01'] },
    { n: 'Camarão', c: 'mar', tag: 'MARISCO', i: 'shrimp', p: 16500, sz: ['N02', 'N03', 'N04', 'N05'] },
    { n: 'Garopa', c: 'pei', tag: 'PEIXE', i: 'fish', sz: [], note: '4 tamanhos' },
    { n: 'Choco', c: 'mol', tag: 'MOLUSCO', i: 'squid', sz: ['GG', 'G', 'M', 'P'] },
    { n: 'Polvo', c: 'mol', tag: 'MOLUSCO', i: 'octo', sz: ['G', 'P'] },
    { n: 'Lulas', c: 'mol', tag: 'MOLUSCO', i: 'squid', sz: [], note: 'Tamanho único' }
  ];
  const KJN = { todos: 18, mar: 3, pei: 12, mol: 3 };
  const kjGrid = $('#kjGrid');
  if (kjGrid) {
    const kz = v => v.toLocaleString('pt-PT').replace(/\s| /g, '.') + ' Kz';
    const cart = [];
    const card = (x, k) => `<div class="kj-card" style="animation-delay:${k * 60}ms"><div class="kj-img"><small>${x.tag}</small><svg viewBox="0 0 68 52" aria-hidden="true">${KJI[x.i]}</svg></div><div class="kj-body"><b>${x.n}</b><div class="kj-sizes">${x.sz.length ? x.sz.map(z => `<i>${z}</i>`).join('') : `<em>${x.note}</em>`}</div><div class="kj-buy">${x.p ? `<span>${kz(x.p)}</span>` : '<span class="q">preço na loja</span>'}<button type="button" data-add="${x.n}">Adicionar</button></div></div></div>`;
    const renderKJ = f => {
      let list;
      if (f === 'todos') list = [KJ[0], KJ[2], KJ[3]];
      else list = KJ.filter(x => x.c === f).slice(0, 3);
      let html = list.map(card).join('');
      if (f === 'pei') html += `<div class="kj-more" style="animation-delay:60ms">+11 peixes<br>na loja</div>`;
      kjGrid.innerHTML = html;
      $('#kjTotal').textContent = `${KJN[f]} produtos`;
    };
    renderKJ('todos');
    $$('.kj-filters button').forEach(b => b.addEventListener('click', () => { $$('.kj-filters button').forEach(x => x.classList.toggle('on', x === b)); renderKJ(b.dataset.k); }));
    kjGrid.addEventListener('click', e => {
      const b = e.target.closest('[data-add]'); if (!b) return;
      cart.push(b.dataset.add);
      const cnt = $('#kjCount'), c = cnt.parentElement;
      cnt.textContent = cart.length; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
      const tally = {}; cart.forEach(n => tally[n] = (tally[n] || 0) + 1);
      const resumo = Object.entries(tally).map(([n, q]) => `${q}× ${n}`).join(', ');
      $('#kjWa').classList.add('on');
      $('#kjWaTxt').textContent = `Enviar pedido pelo WhatsApp: ${resumo}`;
      b.textContent = '✓'; setTimeout(() => { b.textContent = 'Adicionar'; }, 900);
    });
  }


  /* ---------- ANGA: contadores e separadores ---------- */
  const agPane = $('#agPane');
  if (agPane) {
    const PANES = {
      liga: () => `<h4>Liga Aliança · Temporada 1</h4><div class="ag-dots" aria-label="Rodada 20 de 25">${Array.from({ length: 25 }, (_, i) => `<i class="${i < 19 ? 'on' : i === 19 ? 'on now' : ''}"></i>`).join('')}</div><div class="ag-row"><span>rodada <b>20</b> de 25</span><span><b>24</b> guildas na tabela</span></div>`,
      mercado: () => `<h4>Mercado da Aliança</h4><p>Diamantes, passes e mais, com vendedores verificados e selos de cliente.</p><div class="ag-badges"><span>Diamantes</span><span>Passes</span><span class="v">✓ vendedor verificado</span><span>selo de cliente</span></div>`,
      historia: () => `<h4>Da ONGA à Aliança Nacional</h4><div class="ag-row"><span>fundação</span><b>22 mar 2025</b></div><div class="ag-row"><span>Liga Aliança</span><b>5 jan 2026</b></div><div class="ag-row"><span>selos de cliente</span><b>ago 2026</b></div>`
    };
    const showAg = k => { agPane.innerHTML = PANES[k](); agPane.style.animation = 'none'; void agPane.offsetWidth; agPane.style.animation = ''; };
    showAg('liga');
    $$('.ag-tabs button').forEach(b => b.addEventListener('click', () => { $$('.ag-tabs button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); }); showAg(b.dataset.ag); }));
    const nums = $$('.ag-stats b');
    const run = () => nums.forEach(n => {
      const to = +n.dataset.to, fmt = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      if (reduce) { n.textContent = fmt(to); return; }
      const t0 = performance.now(), dur = 1400;
      const step = t => { const k = Math.min(1, (t - t0) / dur); n.textContent = fmt(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { run(); io.disconnect(); } }, { threshold: .3 });
      io.observe(agPane.closest('.mock'));
    } else run();
  }

  /* ---------- estudos de caso ---------- */
  let opener = null;
  $$('[data-case]').forEach(b => b.addEventListener('click', () => {
    const d = $('#case-' + b.dataset.case); if (!d) return;
    opener = b;
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    window.DC.lenis && window.DC.lenis.stop();
    document.body.style.overflow = 'hidden';
    html.classList.add('modal-open');
    const inner = $('.case-in', d); inner.scrollTop = 0;
    if (window.gsap && !reduce) gsap.fromTo($$('.case-sec,.case-meta', d), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .07, delay: .1, clearProps: 'transform,opacity' });
    $$('.live-stage', d).forEach(loadLive);
  }));

  /* ---------- pré-visualização ao vivo dos sites ---------- */
  function fitLive(stage) {
    const fr = $('.live-frame', stage), ifr = $('iframe', stage);
    const w = +stage.dataset.w || 1280, sw = stage.clientWidth;
    const k = Math.min(1, sw / w);
    const h = stage.clientHeight;
    fr.style.width = w + 'px'; fr.style.height = (h / k) + 'px';
    fr.style.transform = `translateX(-50%) scale(${k})`;
    ifr.style.width = '100%'; ifr.style.height = '100%';
  }
  function loadLive(stage) {
    const ifr = $('iframe', stage);
    if (!ifr.getAttribute('src')) {
      ifr.addEventListener('load', () => stage.classList.add('ready'), { once: true });
      ifr.src = stage.dataset.url;
    }
    requestAnimationFrame(() => fitLive(stage));
  }
  $$('.live-stage').forEach(stage => {
    new ResizeObserver(() => fitLive(stage)).observe(stage);
    const sec = stage.closest('.case-sec');
    $$('.live-dev button', sec).forEach(b => b.addEventListener('click', () => {
      $$('.live-dev button', sec).forEach(x => x.classList.toggle('on', x === b));
      stage.dataset.w = b.dataset.w; stage.classList.toggle('narrow', +b.dataset.w < 800); fitLive(stage);
    }));
    // em ecrãs pequenos começa no tamanho de telemóvel
    if (window.innerWidth < 700) { const m = $('.live-dev button[data-w="390"]', sec); m && m.click(); }
  });
  $$('dialog.case').forEach(d => {
    const close = () => d.close ? d.close() : d.removeAttribute('open');
    $$('[data-close]', d).forEach(x => x.addEventListener('click', close));
    d.addEventListener('click', e => { if (e.target === d) close(); });
    d.addEventListener('close', () => { window.DC.lenis && window.DC.lenis.start(); document.body.style.overflow = ''; html.classList.remove('modal-open'); opener && opener.focus(); });
  });
  // abrir diretamente por endereço: projetos.html#urbanda
  const h = location.hash.replace('#', '');
  if (h === 'redes') window.DC.ready(() => setTimeout(() => { const t = $('#redes'); if (!t) return; window.DC.lenis ? window.DC.lenis.scrollTo(t, { offset: -80, immediate: true }) : t.scrollIntoView(); }, 700));
  if (['gepgeo', 'c3', 'urbanda', 'kudjima', 'anga'].includes(h)) window.DC.ready(() => setTimeout(() => { const b = $(`[data-case="${h}"]`); b && b.click(); }, 600));
})();
