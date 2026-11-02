/* Competências — grafo de forças em canvas, rack 6U e terminal interativo */
(() => {
  const { $, $$, reduce, wait, CONTACT } = window.DC;

  const CATS = {
    ia: { name: 'Inteligência Artificial', short: 'IA', color: '#B48CFF', desc: 'Agentes de IA e LLMs por API (Anthropic), GPT-5 e Claude Code no desenvolvimento diário, MCP, reconhecimento de voz e automação de tarefas.' },
    dev: { name: 'Desenvolvimento Web e Mobile', short: 'Desenvolvimento', color: '#7CC4FF', desc: 'Web apps, websites pequenos, médios e grandes, aplicações mobile e programação full stack, do back-end ao front-end.' },
    dados: { name: 'Bases de Dados e Dados', short: 'Dados', color: '#43D68C', desc: 'Modelação em PostgreSQL e MySQL, análise de dados, APIs, web scraping e dashboards.' },
    ferr: { name: 'Ferramentas de Trabalho', short: 'Ferramentas', color: '#F06A5F', desc: 'Editores, IDEs e o pacote Office usados todos os dias, mais o GitHub para versionamento.' },
    infra: { name: 'Sistemas, Redes e Infraestruturas', short: 'Infraestrutura', color: '#45A8F7', desc: 'Virtualização, Windows e Linux, firewall, DNS e monitorização, aplicados no estágio curricular no ITEL.' },
    conteudo: { name: 'Conteúdo e Redes Sociais', short: 'Conteúdo', color: '#8B9BB0', desc: 'Gestão e criação de conteúdo para redes sociais, identidade visual e gestão de projetos digitais.' }
  };
  const SKILLS = [
    ['GPT-5', 'ia'], ['Claude Code', 'ia'], ['Agentes de IA', 'ia'], ['LLMs', 'ia'], ['API da Anthropic', 'ia'], ['MCP', 'ia'], ['Reconhecimento de voz', 'ia'], ['Automação de tarefas', 'ia'],
    ['Python', 'dev'], ['Cloudflare Workers', 'dev'], ['Capacitor', 'dev'], ['Vite', 'dev'], ['Leaflet', 'dev'], ['Django', 'dev'], ['PHP', 'dev'], ['JavaScript', 'dev'], ['React.js', 'dev'], ['Angular', 'dev'], ['HTML5', 'dev'], ['CSS3', 'dev'], ['Design responsivo', 'dev'], ['SEO técnico', 'dev'], ['Aplicações mobile', 'dev'], ['Web apps', 'dev'], ['Programação full stack', 'dev'],
    ['PostgreSQL', 'dados'], ['MySQL', 'dados'], ['Análise de dados', 'dados'], ['APIs REST', 'dados'], ['Postman', 'dados'], ['Web scraping', 'dados'], ['BeautifulSoup', 'dados'], ['Power BI', 'dados'], ['Power Query', 'dados'], ['D1 (SQLite)', 'dados'], ['JSON', 'dados'],
    ['Visual Studio Code', 'ferr'], ['PyCharm', 'ferr'], ['Pacote Office', 'ferr'], ['GitHub', 'ferr'], ['GitHub Actions', 'ferr'],
    ['VMware ESXi', 'infra'], ['Windows', 'infra'], ['Linux', 'infra'], ['Suporte técnico', 'infra'], ['pfSense', 'infra'], ['Firewall', 'infra'], ['DNS', 'infra'], ['Troubleshooting de rede', 'infra'], ['Zabbix', 'infra'], ['Nagios', 'infra'],
    ['Gestão de redes sociais', 'conteudo'], ['Criação de conteúdo', 'conteudo'], ['Identidade visual', 'conteudo'], ['Gestão de projetos digitais', 'conteudo']
  ];
  const CTX = {
    'Sistema': { sub: 'RPG para Android com servidor e painel · 2025–2026', uses: ['JavaScript', 'HTML5', 'CSS3', 'Aplicações mobile', 'Web apps', 'APIs REST', 'Programação full stack', 'Design responsivo', 'GitHub', 'Claude Code', 'Python', 'Cloudflare Workers', 'D1 (SQLite)', 'Capacitor', 'GitHub Actions', 'JSON'] },
    'ANGA': { sub: 'Website da Aliança Nacional de Guildas Angolanas · 2025–2026', uses: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Design responsivo', 'Web apps', 'GitHub', 'Gestão de projetos digitais', 'Gestão de redes sociais', 'Vite', 'JSON', 'GitHub Actions'] },
    'Balcão Analítico': { sub: 'Análise de negócio com agentes de IA', uses: ['Agentes de IA', 'JavaScript', 'HTML5', 'CSS3', 'Web apps', 'Análise de dados', 'Automação de tarefas', 'GitHub', 'LLMs', 'API da Anthropic', 'Cloudflare Workers', 'JSON'] },
    'Hortomar': { sub: 'Web scraping e integração de dados do mar de Angola', uses: ['Python', 'Web scraping', 'APIs REST', 'Análise de dados', 'Power BI', 'PyCharm', 'Automação de tarefas', 'BeautifulSoup', 'Power Query'] },
    'ADANA': { sub: 'Assistente virtual por voz · 2021', uses: ['Python', 'PyCharm', 'APIs REST', 'Automação de tarefas', 'Reconhecimento de voz'] },
    'URBANDA': { sub: 'Sistema de Gestão de Denúncias Urbanas · 2024–2025', uses: ['Python', 'Django', 'PostgreSQL', 'APIs REST', 'Postman', 'HTML5', 'CSS3', 'JavaScript', 'Programação full stack', 'Leaflet'] },
    'GEPGEO': { sub: 'Website institucional · 10 páginas', uses: ['HTML5', 'CSS3', 'JavaScript', 'Design responsivo', 'SEO técnico'] },
    'C3-Geo': { sub: 'Website institucional · 6 páginas', uses: ['HTML5', 'CSS3', 'JavaScript', 'Design responsivo'] },
    'Kudjima': { sub: 'Loja online · 4 páginas · 18 produtos', uses: ['HTML5', 'CSS3', 'JavaScript', 'Design responsivo', 'Web apps'] },
    'Estágio ITEL': { sub: 'Estágio curricular em Infraestrutura de TI · 2024–2025', uses: ['VMware ESXi', 'Windows', 'Linux', 'Suporte técnico', 'pfSense', 'Firewall', 'DNS', 'Troubleshooting de rede', 'Zabbix', 'Nagios'] },
    'Freelance': { sub: 'Gestor de Redes Sociais · 2022–2026', uses: ['Gestão de redes sociais', 'Criação de conteúdo', 'Identidade visual', 'Análise de dados', 'Gestão de projetos digitais'] }
  };
  const usedIn = name => Object.keys(CTX).filter(k => CTX[k].uses.includes(name));

  /* ======================= GRAFO ======================= */
  const wrap = $('#graphWrap'), cv = $('#graph'), infoEl = $('#graphInfo');
  if (wrap && cv) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, DPR = 1;
    const nodes = [], edges = [], byName = {};
    const add = (n) => { n.x = (Math.random() - .5) * 300; n.y = (Math.random() - .5) * 300; n.vx = 0; n.vy = 0; nodes.push(n); byName[n.id] = n; return n; };
    Object.entries(CATS).forEach(([k, c]) => add({ id: 'cat:' + k, label: c.short, type: 'hub', cat: k, r: 15 }));
    SKILLS.forEach(([s, c]) => { add({ id: s, label: s, type: 'skill', cat: c, r: 6.5 }); edges.push({ a: s, b: 'cat:' + c, k: 'hub' }); });
    Object.entries(CTX).forEach(([k, c]) => { add({ id: 'ctx:' + k, label: k, type: 'ctx', r: 14 }); c.uses.forEach(u => edges.push({ a: u, b: 'ctx:' + k, k: 'ctx' })); });
    edges.forEach(e => { e.A = byName[e.a]; e.B = byName[e.b]; });
    const nb = {}; nodes.forEach(n => nb[n.id] = new Set([n.id]));
    edges.forEach(e => { nb[e.a].add(e.b); nb[e.b].add(e.a); });

    let filter = 'all', hover = null, drag = null, sel = null, alpha = 1;
    const pt = { x: 0, y: 0 };
    function resize() {
      const r = wrap.getBoundingClientRect(); DPR = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); alpha = Math.max(alpha, .5);
    }
    new ResizeObserver(resize).observe(wrap); resize();

    function step() {
      const scale = Math.min(W, H) / 560;
      // repulsão
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + .01;
        const f = (a.type === 'skill' && b.type === 'skill' ? 2000 : 5200) * scale / d2;
        const d = Math.sqrt(d2); dx /= d; dy /= d;
        a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
      }
      // molas
      edges.forEach(e => {
        const len = (e.k === 'hub' ? 78 : 170) * scale, k = e.k === 'hub' ? .05 : .012;
        const dx = e.B.x - e.A.x, dy = e.B.y - e.A.y, d = Math.hypot(dx, dy) || 1, f = (d - len) * k;
        e.A.vx += dx / d * f; e.A.vy += dy / d * f; e.B.vx -= dx / d * f; e.B.vy -= dy / d * f;
      });
      nodes.forEach(n => {
        n.vx -= n.x * .0022; n.vy -= n.y * .0042;
        if (n === drag) { n.x = pt.x; n.y = pt.y; n.vx = n.vy = 0; return; }
        n.vx *= .82; n.vy *= .82;
        n.x += n.vx * alpha; n.y += n.vy * alpha;
        const mx = W / 2 - 70, my = H / 2 - 56;
        n.x = Math.max(-mx, Math.min(mx, n.x)); n.y = Math.max(-my, Math.min(my, n.y));
      });
      alpha = Math.max(reduce ? 0 : .06, alpha * .985);
    }
    // pré-arrefecimento para abrir já organizado
    for (let i = 0; i < 260; i++) step();
    alpha = reduce ? 0 : .4;

    const visible = n => filter === 'all' || n.type === 'ctx' || n.cat === filter;
    function hexPath(x, y, r) { ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k - Math.PI / 2; const px = x + r * Math.cos(a), py = y + r * Math.sin(a); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2, H / 2);
      const focus = hover || sel;
      const lit = focus ? nb[focus.id] : null;
      edges.forEach(e => {
        const vis = visible(e.A) && visible(e.B);
        const on = lit ? lit.has(e.a) && lit.has(e.b) : false;
        let a = vis ? (e.k === 'ctx' ? .16 : .22) : .03;
        if (lit) a = on ? .9 : .04;
        ctx.strokeStyle = e.k === 'ctx' ? `rgba(244,182,74,${a})` : hexA(CATS[e.A.cat || e.B.cat].color, a);
        ctx.lineWidth = on ? 1.6 : 1;
        ctx.setLineDash(e.k === 'ctx' ? [4, 5] : []);
        ctx.lineDashOffset = e.k === 'ctx' ? -t / 40 : 0;
        ctx.beginPath(); ctx.moveTo(e.A.x, e.A.y); ctx.lineTo(e.B.x, e.B.y); ctx.stroke();
      });
      ctx.setLineDash([]);
      nodes.forEach(n => {
        const vis = visible(n);
        let a = vis ? 1 : .15; if (lit) a = lit.has(n.id) ? 1 : .15;
        ctx.globalAlpha = a;
        const big = n === focus;
        if (n.type === 'ctx') {
          hexPath(n.x, n.y, n.r + (big ? 3 : 0)); ctx.fillStyle = '#F4B64A'; ctx.fill();
        } else if (n.type === 'hub') {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + (big ? 3 : 0), 0, 7); ctx.fillStyle = '#0A0F16'; ctx.fill();
          ctx.lineWidth = 2.5; ctx.strokeStyle = CATS[n.cat].color; ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + (big ? 2.5 : 0), 0, 7); ctx.fillStyle = CATS[n.cat].color; ctx.fill();
          if (big) { ctx.lineWidth = 2; ctx.strokeStyle = '#E7EEF6'; ctx.stroke(); }
        }
        // rótulos
        const showLbl = n.type !== 'skill' || (lit && lit.has(n.id)) || W > 700;
        if (showLbl) {
          ctx.font = n.type === 'skill' ? '500 11px "JetBrains Mono", monospace' : '700 12.5px "Instrument Sans", sans-serif';
          ctx.fillStyle = n.type === 'ctx' ? '#F4B64A' : (n.type === 'hub' ? '#E7EEF6' : '#C7D3E1');
          ctx.textAlign = 'center';
          ctx.fillText(n.label, n.x, n.y + n.r + (n.type === 'skill' ? 14 : 17));
        }
      });
      ctx.globalAlpha = 1; ctx.restore();
    }
    function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
    let running = true;
    new IntersectionObserver(([e]) => { running = e.isIntersecting; }).observe(wrap);
    function loop(t) { if (running && !document.hidden) { step(); draw(t); } requestAnimationFrame(loop); }
    requestAnimationFrame(loop);

    const local = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left - W / 2, y: e.clientY - r.top - H / 2 }; };
    const pick = p => { let best = null, bd = 1e9; nodes.forEach(n => { if (!visible(n)) return; const d = Math.hypot(n.x - p.x, n.y - p.y); if (d < Math.max(16, n.r + 8) && d < bd) { bd = d; best = n; } }); return best; };
    function showInfo(n) {
      if (!n) return;
      let html = '';
      if (n.type === 'skill') {
        const u = usedIn(n.id);
        html = `<span class="gi-tag" style="color:${CATS[n.cat].color}">${CATS[n.cat].name}</span><h3 class="h3">${n.label}</h3>` +
          (u.length ? `<p>Usado em:</p><div class="uses">${u.map(x => `<span class="chip"><span class="dot" style="background:#F4B64A"></span>${x}</span>`).join('')}</div>` : `<p>Competência listada no currículo, na área de ${CATS[n.cat].short.toLowerCase()}.</p>`);
      } else if (n.type === 'hub') {
        const list = SKILLS.filter(s => s[1] === n.cat).map(s => s[0]);
        html = `<span class="gi-tag">área</span><h3 class="h3">${CATS[n.cat].name}</h3><p>${CATS[n.cat].desc}</p><div class="uses">${list.map(x => `<span class="chip">${x}</span>`).join('')}</div>`;
      } else {
        const c = CTX[n.label];
        html = `<span class="gi-tag" style="color:#F4B64A;background:var(--amber-soft)">onde foi usado</span><h3 class="h3">${n.label}</h3><p>${c.sub}</p><div class="uses">${c.uses.map(x => `<span class="chip">${x}</span>`).join('')}</div>`;
      }
      infoEl.innerHTML = html; infoEl.classList.remove('swap'); void infoEl.offsetWidth; infoEl.classList.add('swap');
    }
    cv.addEventListener('pointermove', e => {
      const p = local(e); pt.x = p.x; pt.y = p.y;
      if (drag) { alpha = Math.max(alpha, .3); return; }
      const n = pick(p);
      if (n !== hover) { hover = n; if (n) showInfo(n); cv.style.cursor = n ? 'grab' : 'default'; }
    });
    cv.addEventListener('pointerleave', () => { if (!drag) hover = null; if (sel) showInfo(sel); });
    const coarse = matchMedia('(pointer:coarse)').matches;
    cv.addEventListener('pointerdown', e => { const p = local(e); const n = pick(p); if (n && coarse) { sel = n; hover = null; showInfo(n); return; } if (n) { drag = n; sel = n; pt.x = p.x; pt.y = p.y; cv.setPointerCapture(e.pointerId); showInfo(n); } else { sel = null; } });
    const up = () => { drag = null; alpha = Math.max(alpha, .2); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    $$('#filters .flt').forEach(b => b.addEventListener('click', () => {
      filter = b.dataset.cat; sel = null; hover = null;
      $$('#filters .flt').forEach(x => x.setAttribute('aria-pressed', x === b));
      if (filter !== 'all') showInfo(byName['cat:' + filter]);
      alpha = Math.max(alpha, .3);
    }));

    // alternativa acessível em lista
    const gl = $('#graphList');
    if (gl) gl.innerHTML = Object.entries(CATS).map(([k, c]) => `<div><h4>${c.name}</h4><ul>${SKILLS.filter(s => s[1] === k).map(([s]) => { const u = usedIn(s); return `<li>${s}${u.length ? ` <span>· ${u.join(', ')}</span>` : ''}</li>`; }).join('')}</ul></div>`).join('');
  }

  /* ======================= RACK ======================= */
  const rack = $('#rack'), rackCount = $('#rackCount');
  if (rack) {
    Object.entries(CATS).forEach(([k, c], i) => {
      const items = SKILLS.filter(s => s[1] === k).map(s => s[0]);
      const row = document.createElement('div');
      row.className = 'unit-row' + (i === 0 ? ' open' : '');
      row.innerHTML = `<button class="unit-btn" type="button" aria-expanded="${i === 0}" aria-controls="ub${i}"><span class="u">U${String(i + 1).padStart(2, '0')}</span><span class="t">${c.name}</span><span class="leds">${'<i></i>'.repeat(Math.min(items.length, 6))}</span><svg class="arr" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3l5 5-5 5"/></svg></button><div class="unit-body" id="ub${i}"><div><div class="chips">${items.map(s => `<span class="chip">${s}</span>`).join('')}</div><p>${c.desc}</p></div></div>`;
      rack.appendChild(row);
    });
    const upd = () => rackCount.textContent = `${$$('.unit-row.open', rack).length}/6 ativas`;
    rack.addEventListener('click', e => { const b = e.target.closest('.unit-btn'); if (!b) return; const o = b.parentElement.classList.toggle('open'); b.setAttribute('aria-expanded', o); upd(); });
    upd();
  }

  /* ======================= TERMINAL ======================= */
  const out = $('#termOut'), form = $('#termForm'), inp = $('#termInput'), term = $('#term');
  if (!out) return;
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const ROUTES = { inicio: 'index.html', sobre: 'sobre.html', experiencia: 'experiencia.html', competencias: 'competencias.html', projetos: 'projetos.html', contacto: 'contacto.html' };
  const hist = []; let hi = 0;
  const print = h => { const p = document.createElement('pre'); p.innerHTML = h; out.appendChild(p); out.scrollTop = out.scrollHeight; };
  const catKey = q => Object.keys(CATS).find(k => norm(k).startsWith(q) || norm(CATS[k].short).startsWith(q) || norm(CATS[k].name).includes(q));
  const CMDS = {
    help: { d: 'lista de comandos', f: () => `<span class="s">Comandos disponíveis</span>\n` + Object.entries(CMDS).filter(([, v]) => v.d).map(([k, v]) => `  <span class="a">${k.padEnd(13)}</span>${v.d}`).join('\n') + `\n\n<span class="m">Dica: ↑ ↓ histórico · Tab completa · Ctrl+L limpa</span>` },
    whoami: { d: 'quem sou', f: () => `Délcio Cunha\nTécnico de TI &amp; Desenvolvedor Full Stack\n<span class="m">Luanda, Angola · IA, dados, web, mobile e sistemas</span>` },
    skills: { d: 'stack por área (ex.: skills redes)', f: (a) => {
      const k = a && catKey(norm(a));
      const list = k ? [[k, CATS[k]]] : Object.entries(CATS);
      if (a && !k) return `<span class="r">área desconhecida:</span> ${esc(a)} <span class="m">· opções: ${Object.values(CATS).map(c => norm(c.short)).join(', ')}</span>`;
      return list.map(([kk, c]) => `<span class="s">[${c.name}]</span>\n  ${SKILLS.filter(s => s[1] === kk).map(s => s[0]).join(' · ')}`).join('\n');
    } },
    experiencia: { d: 'percurso profissional', f: () => `<span class="a">2021–2026</span>  Desenvolvedor · dados e IA (projetos próprios e freelance)\n            Sistema · ANGA · Hortomar · ADANA · URBANDA · websites\n<span class="a">2024–2025</span>  Estágio curricular em Infraestrutura de TI · ITEL\n            ESXi · Windows/Linux · pfSense · DNS · Zabbix · Nagios\n<span class="a">2022–2026</span>  Gestor de Redes Sociais (Freelancer)\n            PIXELVERSE · KUDJIMA · ZANIRA` },
    projetos: { d: 'trabalho entregue', f: () => `<span class="g">●</span> Sistema              RPG Android · Cloudflare Workers + D1 · painel admin (novo)\n<span class="g">●</span> ANGA                 React + Vite · comunidade Free Fire · 13 páginas\n<span class="g">●</span> Hortomar             web scraping + APIs · dados do mar de Angola\n<span class="g">●</span> Balcão Analítico     análise de negócio · 3 agentes de IA + estratega\n<span class="g">●</span> ADANA                assistente virtual por voz · Python · 2021\n<span class="g">●</span> GEPGEO Consultoria   website 10 páginas · PT/EN · PWA · mapa 3D\n<span class="g">●</span> C3-Geo               website 6 páginas · SVG · WhatsApp Business\n<span class="g">●</span> URBANDA              Django + PostgreSQL · APIs REST · painel admin\n<span class="g">●</span> Kudjima              loja online · 18 produtos · pedidos por WhatsApp\n\n<a href="https://delciocunha.github.io/SystemWebsite2/" target="_blank" rel="noopener">delciocunha.github.io/SystemWebsite2</a>\n<a href="https://delciocunha.github.io/ANGA/" target="_blank" rel="noopener">delciocunha.github.io/ANGA</a>\n<a href="https://delciocunha.github.io/GEPgeo/" target="_blank" rel="noopener">delciocunha.github.io/GEPgeo</a>\n<a href="https://delciocunha.github.io/C3geo/" target="_blank" rel="noopener">delciocunha.github.io/C3geo</a>\n<a href="https://nataniela-melo.github.io/Kudjima/" target="_blank" rel="noopener">nataniela-melo.github.io/Kudjima</a>\n<span class="m">→ escreva "abrir projetos" para ver os estudos de caso</span>` },
    formacao: { d: 'percurso académico', f: () => `<span class="a">2019–2025</span>  Ensino Médio · ITEL, Luanda\n<span class="a">2015–2018</span>  Ensino Secundário (I Ciclo) · Escola n.º 1107 do Bairro Azul` },
    idiomas: { d: 'línguas', f: () => `Português  <span class="g">█████</span>  nativo\nInglês     <span class="s">███</span>░░  intermédio\nEspanhol   <span class="s">███</span>░░  intermédio` },
    contacto: { d: 'como falar comigo', f: () => `email     ${CONTACT.email}\ntelefone  ${CONTACT.phoneLabel}\nmorada    Av. Marien Ngouabi, Maianga — Luanda\n<span class="m">→ "abrir contacto" para escrever uma mensagem</span>` },
    neofetch: { d: 'resumo do sistema', f: () => `<span class="s">    ⬢⬢      </span><span class="a">delcio</span>@<span class="a">portfolio</span>\n<span class="s">  ⬢⬢⬢⬢⬢    </span>----------------\n<span class="s"> ⬢⬢ DC ⬢⬢   </span><span class="s">Função:</span> Técnico de TI · Full Stack\n<span class="s">  ⬢⬢⬢⬢⬢    </span><span class="s">IA:</span> GPT-5, Claude Code\n<span class="s">    ⬢⬢      </span><span class="s">Desenvolvimento:</span> Python, Django, JavaScript, React.js, Angular, PHP\n            <span class="s">Dados:</span> PostgreSQL, MySQL, web scraping, Power BI\n            <span class="s">Ferramentas:</span> VS Code, PyCharm, Office\n            <span class="s">Infra:</span> VMware ESXi, Windows, Linux, pfSense\n            <span class="s">Idiomas:</span> PT, EN, ES\n            <span class="s">Hora local:</span> ${window.DC.luandaTime({ second: '2-digit' })} (Luanda)` },
    ping: { d: 'testar a ligação', f: async () => { for (let i = 0; i < 4; i++) { await wait(320); print(`64 bytes de delcio.cunha: icmp_seq=${i + 1} ttl=64 tempo=${(8 + Math.random() * 6).toFixed(1)} ms`); } return `<span class="g">--- 4 pacotes transmitidos, 4 recebidos, 0% perdidos ---</span>`; } },
    traceroute: { d: 'rota até Luanda', f: async () => { const hops = ['gateway.local', 'pfsense.lab', 'switch-core', 'esxi-01', 'delcio.cunha (Luanda)']; for (let i = 0; i < hops.length; i++) { await wait(260); print(` ${i + 1}  ${hops[i].padEnd(24)} ${(2 + i * 3 + Math.random() * 2).toFixed(1)} ms`); } return '<span class="g">destino alcançado.</span>'; } },
    top: { d: 'serviços em execução', f: () => `<span class="s">  PID  SERVIÇO               ESTADO     CPU</span>\n  101  hortomar-scraper      <span class="g">a correr</span>   ${(2 + Math.random() * 5).toFixed(1)}%\n  102  adana-assistente      <span class="g">a correr</span>   ${(1 + Math.random() * 4).toFixed(1)}%\n  204  django (urbanda)      <span class="g">a correr</span>   ${(2 + Math.random() * 4).toFixed(1)}%\n  205  postgresql            <span class="g">a correr</span>   ${(1 + Math.random() * 3).toFixed(1)}%\n  310  vmware-esxi           <span class="g">a correr</span>   ${(4 + Math.random() * 6).toFixed(1)}%\n  311  pfsense-firewall      <span class="g">a correr</span>   ${(1 + Math.random() * 3).toFixed(1)}%\n  312  zabbix-agent          <span class="g">a correr</span>   ${(1 + Math.random() * 2).toFixed(1)}%` },
    systemctl: { d: 'estado de um serviço (ex.: systemctl status zabbix)', f: (a) => { const s = (a || '').replace(/^status\s*/, '').trim() || 'portfolio'; return `<span class="g">●</span> ${esc(s)}.service\n   Loaded: loaded (/etc/systemd/system/${esc(s)}.service)\n   Active: <span class="g">active (running)</span>\n   Status: "${esc(s)} operacional · gerido por Délcio Cunha"`; } },
    abrir: { d: 'ir para outra página (ex.: abrir projetos)', f: async (a) => { const r = ROUTES[norm(a || '').replace(/[\/.]/g, '')]; if (!r) return `<span class="r">página desconhecida.</span> <span class="m">opções: ${Object.keys(ROUTES).join(', ')}</span>`; print(`<span class="m">a abrir /${esc(norm(a))}…</span>`); await wait(300); window.DC.go(r); return ''; } },
    cv: { d: 'descarregar o currículo em PDF', f: () => { const l = document.createElement('a'); l.href = CONTACT.cv; l.download = 'CV-Delcio-Cunha.pdf'; document.body.appendChild(l); l.click(); l.remove(); return '<span class="g">a descarregar CV-Delcio-Cunha.pdf…</span>'; } },
    ls: { d: 'listar', f: () => `<span class="s">sobre/</span>  <span class="s">experiencia/</span>  <span class="s">projetos/</span>  <span class="s">contacto/</span>  cv.pdf  stack.conf` },
    cat: { d: '', f: (a) => /stack/.test(a || '') ? CMDS.skills.f() : /cv/.test(a || '') ? CMDS.cv.f() : `cat: ${esc(a || '')}: ficheiro não encontrado` },
    date: { d: 'data e hora em Luanda', f: () => new Intl.DateTimeFormat('pt-PT', { timeZone: 'Africa/Luanda', dateStyle: 'full', timeStyle: 'medium' }).format(new Date()) + ' (WAT)' },
    history: { d: 'comandos usados', f: () => hist.map((h, i) => `  ${String(i + 1).padStart(3)}  ${esc(h)}`).join('\n') || '<span class="m">vazio</span>' },
    echo: { d: '', f: (a) => esc(a || '') },
    sudo: { d: '', f: () => `<span class="a">delcio não está no ficheiro sudoers. Este incidente será reportado ao Zabbix.</span>` },
    clear: { d: 'limpar o ecrã', f: () => { out.innerHTML = ''; return null; } }
  };
  async function run(raw) {
    const c = raw.trim();
    print(`<span class="p">delcio@<b>portfolio</b>:~$</span> <span class="c">${esc(c)}</span>`);
    if (!c) return;
    hist.push(c); hi = hist.length;
    const [k, ...rest] = c.split(/\s+/); const key = norm(k) === 'cd' ? 'abrir' : norm(k);
    const cmd = CMDS[key];
    if (!cmd) { print(`<span class="r">comando não encontrado:</span> ${esc(k)} <span class="m">· escreva help</span>`); return; }
    const r = await cmd.f(rest.join(' '));
    if (r) print(r);
  }
  form.addEventListener('submit', e => { e.preventDefault(); const v = inp.value; inp.value = ''; run(v); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { if (hi > 0) { hi--; inp.value = hist[hi]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { if (hi < hist.length - 1) { hi++; inp.value = hist[hi]; } else { hi = hist.length; inp.value = ''; } e.preventDefault(); }
    else if (e.key === 'Tab' && inp.value) { const m = Object.keys(CMDS).filter(x => x.startsWith(norm(inp.value))); if (m.length === 1) inp.value = m[0] + ' '; else if (m.length > 1) print(`<span class="m">${m.join('  ')}</span>`); e.preventDefault(); }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });
  term.addEventListener('click', e => { if (!e.target.closest('button,a') && !getSelection().toString()) inp.focus({ preventScroll: true }); });
  ['whoami', 'skills', 'neofetch', 'top', 'ping', 'traceroute', 'abrir projetos'].forEach(c => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.addEventListener('click', () => run(c)); $('#quick').appendChild(b);
  });
  const mx = $('#termMax');
  mx.addEventListener('click', () => { const m = term.classList.toggle('max'); mx.textContent = m ? '⤡' : '⤢'; mx.setAttribute('aria-label', m ? 'Reduzir terminal' : 'Expandir terminal'); if (window.DC.lenis) m ? window.DC.lenis.stop() : window.DC.lenis.start(); inp.focus({ preventScroll: true }); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && term.classList.contains('max')) mx.click(); });

  print(`<span class="m">Último login: ${new Date().toLocaleDateString('pt-PT')} a partir de Luanda</span>`);
  print(CMDS.whoami.f());
  print(`<span class="m">Escreva </span><span class="a">help</span><span class="m"> para ver os comandos.</span>`);
})();
