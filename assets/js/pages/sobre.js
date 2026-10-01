/* Sobre — manifesto iluminado pelo scroll, ficha a escrever-se, percurso à escala, medidores e favo */
(() => {
  const { $, $$, reduce, wait } = window.DC;
  const hasST = !!(window.gsap && window.ScrollTrigger);

  /* ---------- manifesto: palavras acendem com o scroll ---------- */
  const man = $('#manifesto');
  const HOT = ['VMware', 'ESXi,', 'pfSense', 'Zabbix', 'Nagios.', 'Django', 'PostgreSQL', 'JavaScript.', 'estáveis,', 'seguros', 'automatizados.'];
  if (man) {
    const words = man.textContent.trim().split(/\s+/);
    man.innerHTML = words.map(w => `<span class="w${HOT.includes(w) ? ' hot' : ''}">${w}</span>`).join(' ');
    const ws = $$('.w', man);
    if (hasST && !reduce) {
      ScrollTrigger.create({
        trigger: man, start: 'top 75%', end: 'bottom 35%', scrub: true,
        onUpdate: self => { const n = Math.round(self.progress * ws.length); ws.forEach((w, i) => w.style.opacity = i < n ? 1 : .14); }
      });
    } else ws.forEach(w => w.style.opacity = 1);
  }

  /* ---------- ficha técnica a escrever-se ---------- */
  const spec = $('#spec');
  if (spec && !reduce && 'IntersectionObserver' in window) {
    const lines = spec.innerHTML.split('\n');
    spec.innerHTML = lines.join('\n'); // estado final visível até entrar no ecrã
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      spec.innerHTML = '';
      for (const l of lines) { spec.innerHTML += l + '\n'; await wait(l.includes('$') ? 380 : 110); }
      spec.innerHTML = spec.innerHTML.replace(/\n$/, '');
    }, { threshold: .5 });
    io.observe(spec);
  }

  /* ---------- princípios ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .4 });
    $$('.pr').forEach(p => io.observe(p));
  }

  /* ---------- percurso à escala ---------- */
  const Y0 = 2015, Y1 = 2027;
  const NOW = (() => { const d = new Date(); return d.getFullYear() + d.getMonth() / 12; })();
  const lanes = [
    { name: 'Formação', items: [
      { a: 2015, b: 2019, cls: 'edu', short: 'Ensino Secundário', label: 'Ensino Secundário (I Ciclo)', yrs: '2015 – 2018', txt: 'Escola n.º 1107 do Bairro Azul, Luanda.' },
      { a: 2019, b: 2026, cls: 'edu', label: 'Ensino Médio · ITEL', yrs: '2019 – 2025', txt: 'Instituto de Telecomunicações (ITEL), Luanda. Base técnica em telecomunicações e informática.' }
    ]},
    { name: 'Trabalho', items: [
      { a: 2022, b: 2027, cls: 'work', label: 'Gestor de Redes Sociais · Freelancer', yrs: '2022 – 2026', txt: 'PIXELVERSE, KUDJIMA e ZANIRA: planeamento de conteúdos, gestão de comunidade, estratégia de engajamento e identidade visual no Facebook.' },
    ]},
    { name: 'Estágio', items: [
      { a: 2024, b: 2026, cls: 'work', short: 'Estágio ITEL', label: 'Técnico de Infraestrutura de TI', yrs: '2024 – 2025', txt: 'Estágio profissional no ITEL: VMware ESXi, Windows e Linux, pfSense e DNS, monitorização com Zabbix e Nagios, resolução de incidentes.' }
    ]},
    { name: 'Projetos', items: [
      { a: 2024, b: 2026, cls: 'proj', label: 'URBANDA', yrs: '2024 – 2025', txt: 'Sistema de Gestão de Denúncias Urbanas em Django e PostgreSQL, com autenticação, painel administrativo e APIs testadas no Postman.' }
    ]}
  ];
  const axis = $('#gAxis'), lanesEl = $('#gLanes'), detail = $('#gDetail');
  if (axis && lanesEl) {
    const pct = y => ((y - Y0) / (Y1 - Y0)) * 100;
    let ax = '';
    for (let y = Y0; y <= Y1 - 1; y++) ax += `<span style="left:${pct(y + .5)}%">${y}</span><i style="left:${pct(y)}%"></i>`;
    ax += `<i style="left:${pct(Y1)}%"></i>`;
    axis.innerHTML = ax;
    let grid = '<div class="g-grid" aria-hidden="true">';
    for (let y = Y0; y <= Y1; y++) grid += `<i style="left:${pct(y)}%"></i>`;
    grid += `<i class="now" style="left:${pct(NOW)}%"></i></div>`;
    lanesEl.innerHTML = grid + lanes.map(l => `<div class="g-lane"><span>${l.name}</span><div class="g-track">${l.items.map((it, i) =>
      `<button type="button" class="g-bar ${it.cls}" style="left:${pct(it.a)}%;width:${pct(it.b) - pct(it.a)}%" aria-pressed="false" data-yrs="${it.yrs}" data-label="${it.label}" data-txt="${it.txt}">${it.short || it.label}</button>`).join('')}</div></div>`).join('');
    // a grelha só cobre a zona das pistas
    const g = $('.g-grid', lanesEl); g.style.left = '120px';
    const show = (b) => {
      $$('.g-bar', lanesEl).forEach(x => x.setAttribute('aria-pressed', x === b));
      detail.innerHTML = `<span class="g-yrs">${b.dataset.yrs}</span><b>${b.dataset.label}</b><p>${b.dataset.txt}</p>`;
    };
    $$('.g-bar', lanesEl).forEach(b => { b.addEventListener('pointerenter', () => show(b)); b.addEventListener('focus', () => show(b)); b.addEventListener('click', () => show(b)); });
    show($$('.g-bar', lanesEl)[3]);
    if (hasST && !reduce) {
      gsap.from($$('.g-bar', lanesEl), { scaleX: 0, duration: 1.2, stagger: .12, ease: 'power3.inOut', scrollTrigger: { trigger: '#gantt', start: 'top 80%' } });
    }
  }

  /* ---------- medidores de idiomas ---------- */
  const gauges = $$('.gauge');
  const fill = g => { const v = $('.g-val', g); v.style.strokeDashoffset = 314.16 * (1 - (+g.dataset.level) / 100); };
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fill(e.target); io.unobserve(e.target); } }), { threshold: .5 });
    gauges.forEach(g => io.observe(g));
  } else gauges.forEach(fill);

  /* ---------- favo que reage ao cursor ---------- */
  const honey = $('#honey');
  if (honey && window.DC.fine && !reduce) {
    const cells = $$('li', honey);
    const sec = honey.closest('section');
    sec.addEventListener('pointermove', e => {
      cells.forEach(c => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        c.style.setProperty('--s', (1 + .1 * Math.max(0, 1 - d / 240)).toFixed(3));
        c.classList.toggle('hot', d < r.width * .45);
      });
    });
    sec.addEventListener('pointerleave', () => cells.forEach(c => { c.style.setProperty('--s', 1); c.classList.remove('hot'); }));
  }
})();
