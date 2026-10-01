/* Experiência — laboratório de rede interativo, simulação de incidente, linha do tempo e ciclo freelance */
(() => {
  const { $, $$, reduce, wait } = window.DC;
  const svgNS = 'http://www.w3.org/2000/svg';

  const INFO = {
    internet: { tag: 'WAN', title: 'Ligação externa', text: 'Todo o tráfego que entra e sai do laboratório passa primeiro pela firewall.', list: [] },
    pfsense: { tag: 'pfSense', title: 'Firewall e segurança', text: 'Implementei a firewall pfSense e configurei serviços de rede, controlando a segurança e o tráfego.', list: ['Regras de entrada e saída', 'Controlo de tráfego entre redes'] },
    dns: { tag: 'DNS', title: 'Serviços de rede', text: 'Configurei o DNS para que os postos e servidores resolvessem nomes de forma fiável.', list: [] },
    switch: { tag: 'rede', title: 'Diagnóstico de rede', text: 'Diagnostiquei e resolvi incidentes de rede para manter os sistemas disponíveis.', list: ['Troubleshooting de rede', 'Verificação de ligações e portas'] },
    esxi: { tag: 'VMware ESXi', title: 'Virtualização', text: 'Configurei e geri ambientes virtualizados com VMware ESXi, com máquinas Windows e Linux no mesmo servidor.', list: ['Criação e gestão de VMs', 'Instalação de Windows e Linux'] },
    monitor: { tag: 'Zabbix · Nagios', title: 'Monitorização contínua', text: 'Monitorizei servidores e serviços de forma contínua com Zabbix e Nagios, para detetar falhas cedo.', list: ['Alertas de disponibilidade', 'Acompanhamento de desempenho'] },
    users: { tag: 'suporte', title: 'Suporte técnico', text: 'Instalei e dei suporte a sistemas operativos e resolvi incidentes de hardware, software e rede dos utilizadores.', list: [] }
  };
  const LINKS = { internet: ['l-inet'], pfsense: ['l-inet', 'l-dns', 'l-core'], dns: ['l-dns'], switch: ['l-core', 'l-esxi', 'l-mon', 'l-users'], esxi: ['l-esxi', 'l-watch1'], monitor: ['l-mon', 'l-watch1', 'l-watch2'], users: ['l-users', 'l-watch2'] };

  const topo = $('#topo'); if (!topo) return;
  const info = $('#nodeInfo'), logEl = $('#consoleLog');

  /* ---------- seleção de nós ---------- */
  function select(id) {
    $$('.node', topo).forEach(n => n.classList.toggle('sel', n.dataset.id === id));
    $$('.links path', topo).forEach(p => p.classList.toggle('on', (LINKS[id] || []).includes(p.id)));
    const d = INFO[id];
    info.innerHTML = `<span class="ni-tag">${d.tag}</span><h3 class="h3">${d.title}</h3><p>${d.text}</p>${d.list.length ? '<ul>' + d.list.map(x => `<li>${x}</li>`).join('') + '</ul>' : ''}`;
    info.classList.remove('swap'); void info.offsetWidth; info.classList.add('swap');
  }
  $$('.node', topo).forEach(n => {
    n.addEventListener('click', () => select(n.dataset.id));
    n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.dataset.id); } });
  });
  select('pfsense');

  /* ---------- consola ---------- */
  const now = () => (window.DC.luandaTime ? window.DC.luandaTime({ second: '2-digit' }) : new Date().toLocaleTimeString('pt-PT'));
  function log(level, msg) {
    const li = document.createElement('li');
    const lab = { info: 'INFO', ok: ' OK ', warn: 'AVISO', err: 'ERRO' }[level];
    li.innerHTML = `<time>${now()}</time><span class="lv ${level}">${lab}</span><span>${msg}</span>`;
    logEl.appendChild(li);
    while (logEl.children.length > 40) logEl.firstChild.remove();
    logEl.scrollTop = logEl.scrollHeight;
  }
  log('info', 'ligado a itel-lab (simulação)');
  log('ok', '7 equipamentos monitorizados');

  /* ---------- pacotes a circular ---------- */
  const pk = $('#packets');
  const paths = ['l-inet', 'l-dns', 'l-core', 'l-esxi', 'l-mon', 'l-users'].map(id => $('#' + id));
  const lens = paths.map(p => p.getTotalLength());
  let traffic = !reduce, packets = [], last = performance.now(), spawnT = 0;
  function spawn() {
    const i = Math.floor(Math.random() * paths.length);
    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('r', 3.2);
    const col = Math.random() < .25 ? '#F4B64A' : (Math.random() < .5 ? '#43D68C' : '#7CC4FF');
    c.setAttribute('fill', col); c.style.color = col;
    pk.appendChild(c);
    packets.push({ c, i, t: 0, dir: Math.random() < .5 ? 1 : -1, sp: 70 + Math.random() * 60 });
  }
  function loop(ts) {
    const dt = Math.min(.05, (ts - last) / 1000); last = ts;
    if (traffic && !document.hidden) {
      spawnT -= dt; if (spawnT <= 0 && packets.length < 18) { spawn(); spawnT = .18 + Math.random() * .25; }
    }
    for (let k = packets.length - 1; k >= 0; k--) {
      const p = packets[k]; p.t += dt * p.sp;
      const L = lens[p.i];
      if (p.t >= L) { p.c.remove(); packets.splice(k, 1); continue; }
      const pt = paths[p.i].getPointAtLength(p.dir > 0 ? p.t : L - p.t);
      p.c.setAttribute('cx', pt.x); p.c.setAttribute('cy', pt.y);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  const bT = $('#btnTraffic');
  bT.addEventListener('click', () => {
    traffic = !traffic; bT.setAttribute('aria-pressed', traffic); bT.textContent = 'Tráfego: ' + (traffic ? 'ligado' : 'desligado');
    log('info', traffic ? 'captura de tráfego retomada' : 'captura de tráfego em pausa');
  });

  /* ---------- gráfico da monitorização ---------- */
  const spark = $('#spark');
  const vals = Array.from({ length: 24 }, () => 20 + Math.random() * 18);
  let degraded = false;
  function drawSpark() {
    vals.shift(); vals.push(degraded ? 70 + Math.random() * 25 : 18 + Math.random() * 20);
    spark.setAttribute('points', vals.map((v, i) => `${-72 + i * (144 / 23)},${32 - v * .55}`).join(' '));
    spark.classList.toggle('bad', degraded);
  }
  drawSpark(); setInterval(() => { if (!document.hidden) drawSpark(); }, 650);

  /* ---------- simulação de incidente ---------- */
  const SCEN = [
    { node: 'esxi', vm: 'linux', host: 'vm-linux', alert: 'VM Linux sem resposta ao ping', crit: 'serviço web em estado CRITICAL', diag: 'consola do ESXi: serviço parado dentro da VM', fix: 'serviço reiniciado na VM Linux' },
    { node: 'esxi', vm: 'win', host: 'vm-windows', alert: 'disco da VM Windows acima de 95%', crit: 'espaço em disco em estado CRITICAL', diag: 'ficheiros temporários a ocupar o disco', fix: 'espaço libertado e alerta limpo' },
    { node: 'dns', host: 'dns', alert: 'falhas na resolução de nomes', crit: 'verificação DNS em estado CRITICAL', diag: 'registo em falta na configuração DNS', fix: 'registo corrigido no pfSense' },
    { node: 'users', host: 'posto-07', alert: 'posto de trabalho sem acesso à rede', crit: 'host inacessível', diag: 'porta do switch com erros', fix: 'porta reconfigurada, posto ligado' },
    { node: 'switch', host: 'switch-core', alert: 'perda de pacotes no switch', crit: 'latência acima do limite', diag: 'cabo com erros numa porta de uplink', fix: 'cabo substituído, tráfego normal' }
  ];
  const bI = $('#btnIncident'), led = $('#labLed'), state = $('#labState');
  let lastScen = -1;
  bI.addEventListener('click', async () => {
    bI.disabled = true;
    let k; do { k = Math.floor(Math.random() * SCEN.length); } while (k === lastScen); lastScen = k;
    const s = SCEN[k];
    const node = $(`.node[data-id="${s.node}"]`, topo);
    const vm = s.vm ? $(`.vm[data-vm="${s.vm}"]`, topo) : null;
    const tgt = vm || node;
    log('info', `[sim] incidente gerado em ${s.host}`);
    await wait(500);
    tgt.classList.add('bad'); if (vm) node.classList.add('bad');
    degraded = true; led.classList.add('bad'); state.textContent = '1 alerta ativo · ' + s.host;
    log('warn', `Zabbix: ${s.alert}`);
    await wait(1200);
    log('err', `Nagios: ${s.host} · ${s.crit}`);
    select(s.node);
    await wait(1400);
    tgt.classList.remove('bad'); node.classList.remove('bad'); tgt.classList.add('fixing'); if (vm) node.classList.add('fixing');
    led.classList.remove('bad'); led.classList.add('amber'); state.textContent = 'em diagnóstico · ' + s.host;
    log('info', `diagnóstico: ${s.diag}`);
    await wait(1600);
    tgt.classList.remove('fixing'); node.classList.remove('fixing');
    degraded = false; led.classList.remove('amber'); state.textContent = 'Todos os serviços operacionais';
    log('ok', `resolvido: ${s.fix}`);
    bI.disabled = false;
  });

  /* ---------- linha do tempo ---------- */
  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.fromTo('#tlFill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    $$('[data-type]').forEach(list => {
      gsap.from(list.children, { x: -16, opacity: 0, duration: .6, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: list, start: 'top 85%' } });
    });
  }

  /* ---------- ciclo freelance ---------- */
  const steps = $$('#cycleSteps li'), dot = $('#cyDot'), prog = $('#cyProg');
  const C = 2 * Math.PI * 104;
  let ci = 0, paused = false;
  function setCycle(i) {
    ci = i;
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    const a = (i / steps.length) * Math.PI * 2 - Math.PI / 2;
    const x = 150 + Math.cos(a) * 104, y = 150 + Math.sin(a) * 104;
    if (window.gsap && !reduce) gsap.to(dot, { attr: { cx: x, cy: y }, duration: .8, ease: 'power3.inOut' });
    else { dot.setAttribute('cx', x); dot.setAttribute('cy', y); }
    prog.style.transition = reduce ? 'none' : 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)';
    prog.style.strokeDashoffset = C * (1 - (i + .0001) / steps.length);
  }
  steps.forEach((s, k) => { s.addEventListener('pointerenter', () => { paused = true; setCycle(k); }); s.addEventListener('pointerleave', () => paused = false); });
  setCycle(0);
  if (!reduce) setInterval(() => { if (!paused && !document.hidden) setCycle((ci + 1) % steps.length); }, 2400);
})();
