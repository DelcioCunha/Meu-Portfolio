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
  $$('.pi').forEach(a => a.addEventListener('click', e => {
    const p = $(a.getAttribute('href')); if (!p) return;
    e.preventDefault(); e.stopPropagation();
    if (hgST && hgDist > 0) {
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

  /* ---------- estudos de caso ---------- */
  let opener = null;
  $$('[data-case]').forEach(b => b.addEventListener('click', () => {
    const d = $('#case-' + b.dataset.case); if (!d) return;
    opener = b;
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    window.DC.lenis && window.DC.lenis.stop();
    document.body.style.overflow = 'hidden';
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
    d.addEventListener('close', () => { window.DC.lenis && window.DC.lenis.start(); document.body.style.overflow = ''; opener && opener.focus(); });
  });
  // abrir diretamente por endereço: projetos.html#urbanda
  const h = location.hash.replace('#', '');
  if (['gepgeo', 'c3', 'urbanda'].includes(h)) window.DC.ready(() => setTimeout(() => { const b = $(`[data-case="${h}"]`); b && b.click(); }, 600));
})();
