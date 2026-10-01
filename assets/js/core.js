/* =========================================================================
   core.js — comportamento partilhado por todas as páginas
   Smooth scroll (Lenis), cursor, navegação, transições entre páginas,
   preloader, paleta de comandos (Ctrl/⌘+K), revelações GSAP, PWA.
   ========================================================================= */
(() => {
  'use strict';
  const d = document, html = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $ = (s, r = d) => r.querySelector(s);
  const $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const hasGsap = typeof window.gsap !== 'undefined';
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  const PAGES = [
    { href: 'index.html', key: 'inicio', name: 'Início', hint: 'apresentação' },
    { href: 'sobre.html', key: 'sobre', name: 'Sobre mim', hint: 'perfil e percurso' },
    { href: 'experiencia.html', key: 'experiencia', name: 'Experiência', hint: 'estágio e freelance' },
    { href: 'competencias.html', key: 'competencias', name: 'Competências', hint: 'stack e terminal' },
    { href: 'projetos.html', key: 'projetos', name: 'Projetos', hint: 'estudos de caso' },
    { href: 'contacto.html', key: 'contacto', name: 'Contacto', hint: 'falar comigo' }
  ];
  const CONTACT = { email: 'delciobentocunha007@gmail.com', phone: '+244947976103', phoneLabel: '+244 947 976 103', wa: 'https://wa.me/244947976103', cv: 'assets/docs/CV-Delcio-Cunha.pdf' };

  /* ---------- API pública ---------- */
  const readyQ = [];
  let isReady = false;
  const DC = window.DC = {
    reduce, fine, $, $$, wait, PAGES, CONTACT, lenis: null,
    ready(fn) { isReady ? fn() : readyQ.push(fn); },
    toast, copy, go: navigate
  };
  const fireReady = () => { if (isReady) return; isReady = true; html.classList.remove('is-booting', 'is-entering'); readyQ.splice(0).forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); };

  if (hasGsap) {
    const plugins = [window.ScrollTrigger, window.SplitText, window.Draggable].filter(Boolean);
    gsap.registerPlugin(...plugins);
    gsap.defaults({ ease: 'power3.out', duration: .9 });
  }

  /* ---------- smooth scroll ---------- */
  if (!reduce && typeof window.Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: .1, smoothWheel: true, wheelMultiplier: 1 });
    DC.lenis = lenis;
    if (hasGsap) {
      lenis.on('scroll', () => window.ScrollTrigger && ScrollTrigger.update());
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = (y) => DC.lenis ? DC.lenis.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: typeof y === 'number' ? y : 0, behavior: reduce ? 'auto' : 'smooth' });
  DC.scrollTo = scrollTo;

  /* ---------- navegação ---------- */
  const nav = $('.nav');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle('scrolled', y > 16);
      const menuOpen = $('.mobile-menu.open');
      if (!menuOpen) nav.classList.toggle('hide', y > 420 && y > lastY + 4);
      if (y < lastY - 4) nav.classList.remove('hide');
    }
    lastY = y;
    const prog = $('.progress');
    if (prog && !CSS.supports('animation-timeline: scroll()')) {
      const h = d.documentElement.scrollHeight - innerHeight;
      prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // pílula deslizante no menu
  const links = $('.nav-links'), pill = $('.nav-pill');
  if (links && pill) {
    const current = $('a[aria-current="page"]', links);
    const place = (a) => {
      if (!a) { pill.style.opacity = 0; return; }
      const r = a.getBoundingClientRect(), p = links.getBoundingClientRect();
      pill.style.width = r.width + 'px';
      pill.style.transform = `translateX(${r.left - p.left}px)`;
      pill.style.opacity = 1;
    };
    requestAnimationFrame(() => { pill.style.transition = 'none'; place(current); requestAnimationFrame(() => pill.style.transition = ''); });
    $$('a', links).forEach(a => a.addEventListener('pointerenter', () => place(a)));
    links.addEventListener('pointerleave', () => place(current));
    addEventListener('resize', () => place(current));
    d.fonts && d.fonts.ready.then(() => place(current));
  }

  // menu móvel
  const menuBtn = $('.menu-btn'), mm = $('.mobile-menu');
  const setMenu = (open) => {
    if (!mm) return;
    mm.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    $('.lbl', menuBtn).textContent = open ? 'fechar' : 'menu';
    mm.inert = !open;
    if (DC.lenis) open ? DC.lenis.stop() : DC.lenis.start();
    d.body.style.overflow = open ? 'hidden' : '';
  };
  if (mm) mm.inert = true;
  menuBtn && menuBtn.addEventListener('click', () => setMenu(!mm.classList.contains('open')));

  /* ---------- relógio de Luanda ---------- */
  const clocks = $$('[data-clock]');
  const fmt = (o) => { try { return new Intl.DateTimeFormat('pt-PT', Object.assign({ timeZone: 'Africa/Luanda', hour: '2-digit', minute: '2-digit', hour12: false }, o)).format(new Date()); } catch (e) { return ''; } };
  const tick = () => clocks.forEach(c => c.textContent = fmt(c.dataset.clock === 'sec' ? { second: '2-digit' } : {}));
  if (clocks.length) { tick(); setInterval(tick, 1000); }
  DC.luandaTime = fmt;

  /* ---------- cursor ---------- */
  const dot = $('.cursor'), ring = $('.cursor-ring');
  if (fine && dot && ring) {
    html.classList.add('has-cursor');
    const lbl = $('span', ring);
    let mx = -200, my = -200, rx = -200, ry = -200;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate3d(${mx}px,${my}px,0)`; }, { passive: true });
    const loop = () => { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = `translate3d(${rx}px,${ry}px,0)`; requestAnimationFrame(loop); };
    loop();
    d.addEventListener('pointerover', e => {
      const lab = e.target.closest('[data-cursor]');
      const hov = e.target.closest('a,button,input,textarea,select,label,[role="button"],[data-hover]');
      ring.classList.toggle('is-label', !!lab);
      if (lab) lbl.textContent = lab.dataset.cursor;
      ring.classList.toggle('is-hover', !!hov && !lab);
    });
    addEventListener('pointerdown', () => ring.classList.add('is-down'));
    addEventListener('pointerup', () => ring.classList.remove('is-down'));
    d.addEventListener('pointerleave', () => { mx = my = -200; });
  }

  /* ---------- botões magnéticos e brilho dos cartões ---------- */
  const bindMagnet = (root = d) => {
    if (!fine || reduce) return;
    $$('[data-magnet]', root).forEach(b => {
      if (b.__mag) return; b.__mag = true;
      const k = parseFloat(b.dataset.magnet) || .3;
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * k) + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * k) + 'px');
      });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
  };
  const bindGlow = (root = d) => $$('.glow', root).forEach(c => {
    if (c.__glow) return; c.__glow = true;
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--px', (e.clientX - r.left) + 'px'); c.style.setProperty('--py', (e.clientY - r.top) + 'px'); });
  });
  const bindTilt = (root = d) => {
    if (!fine || reduce) return;
    $$('[data-tilt]', root).forEach(c => {
      if (c.__tilt) return; c.__tilt = true;
      const max = parseFloat(c.dataset.tilt) || 6;
      c.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)';
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(1100px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(0)`;
      });
      c.addEventListener('pointerleave', () => c.style.transform = '');
    });
  };
  DC.bind = (root) => { bindMagnet(root); bindGlow(root); bindTilt(root); };
  DC.bind();

  if (!fine) $$('.cmdk-btn .lbl').forEach(l => l.textContent = 'procurar');

  /* ---------- toast + copiar ---------- */
  let toastT;
  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = d.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); d.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function copy(text, label) {
    const ok = () => toast(`Copiado: ${label || text}`);
    const fallback = () => {
      const ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
      d.body.appendChild(ta); ta.select();
      let done = false; try { done = d.execCommand('copy'); } catch (e) {}
      ta.remove(); done ? ok() : toast('Não foi possível copiar. Selecione o texto e use Ctrl+C.');
    };
    try { navigator.clipboard.writeText(text).then(ok, fallback); } catch (e) { fallback(); }
  }
  d.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]');
    if (b) { e.preventDefault(); copy(b.dataset.copy, b.dataset.copyLabel); }
  });

  /* ---------- transições entre páginas ---------- */
  const curtain = $('.curtain');
  const isInternal = (a) => {
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.noTransition !== undefined) return false;
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    try { const u = new URL(a.href, location.href); return u.origin === location.origin && u.pathname !== location.pathname && /(\.html|\/)$/.test(u.pathname); } catch (e) { return false; }
  };
  const nameFor = (href) => { const f = (href.split('/').pop() || 'index.html').split('#')[0] || 'index.html'; const p = PAGES.find(x => x.href === f); return p ? p.name : 'A carregar'; };
  let leaving = false;
  function navigate(href) {
    if (leaving) return; leaving = true;
    if (mm && mm.classList.contains('open')) setMenu(false);
    store.set('dc-transit', '1'); store.set('dc-label', nameFor(href));
    if (!curtain || !hasGsap || reduce) { location.href = href; return; }
    $('.lbl b', curtain).textContent = nameFor(href);
    curtain.style.visibility = 'visible';
    const p1 = $('.p1', curtain), p2 = $('.p2', curtain), lb = $('.lbl', curtain);
    gsap.timeline({ onComplete: () => { location.href = href; } })
      .set([p1, p2], { clipPath: 'polygon(0 100%,100% 100%,100% 100%,0 100%)' })
      .to(p2, { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', duration: .45, ease: 'power3.inOut' })
      .to(p1, { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', duration: .45, ease: 'power3.inOut' }, .1)
      .to(lb, { opacity: 1, y: 0, duration: .25 }, .35);
  }
  d.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!isInternal(a)) {
      // âncoras na mesma página com smooth scroll
      if (a && (a.getAttribute('href') || '').startsWith('#') && a.getAttribute('href').length > 1) {
        const t = $(a.getAttribute('href'));
        if (t) { e.preventDefault(); DC.lenis ? DC.lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
      }
      return;
    }
    e.preventDefault();
    navigate(a.getAttribute('href'));
  });
  addEventListener('pageshow', e => {
    if (e.persisted) { leaving = false; if (curtain) { curtain.style.visibility = 'hidden'; } html.classList.remove('is-entering'); }
  });

  const enterCurtain = () => new Promise(res => {
    if (!html.classList.contains('is-entering') || !curtain) return res();
    store.del('dc-transit');
    const p1 = $('.p1', curtain), lb = $('.lbl', curtain);
    $('.lbl b', curtain).textContent = store.get('dc-label') || '';
    if (!hasGsap || reduce) { html.classList.remove('is-entering'); return res(); }
    gsap.set(lb, { opacity: 1 });
    gsap.timeline({ onComplete: () => { curtain.style.visibility = 'hidden'; gsap.set(p1, { clearProps: 'clipPath' }); html.classList.remove('is-entering'); res(); } })
      .to(lb, { opacity: 0, y: -10, duration: .25 }, .05)
      .to(p1, { clipPath: 'polygon(0 0,100% 0,100% 0,0 0)', duration: .6, ease: 'power3.inOut' }, .1);
    setTimeout(res, 380); // a página começa a animar enquanto a cortina sobe
  });

  /* ---------- preloader (uma vez por sessão) ---------- */
  const boot = () => new Promise(async res => {
    const el = $('.boot');
    if (!html.classList.contains('is-booting') || !el) return res();
    store.set('dc-booted', '1');
    const pre = $('pre', el), bar = $('.bar', el);
    let skip = false;
    const end = () => { if (skip) return; skip = true; removeEventListener('keydown', end); el.removeEventListener('click', end);
      if (hasGsap && !reduce) gsap.to(el, { yPercent: -100, duration: .7, ease: 'power3.inOut', onComplete: () => { el.remove(); } }); else el.remove();
      res(); };
    addEventListener('keydown', end); el.addEventListener('click', end);
    const lines = [
      '<span class="s">dc-portfolio</span> v3 · Luanda, Angola',
      '[<span class="ok"> OK </span>] A montar /perfil',
      '[<span class="ok"> OK </span>] A iniciar VMware ESXi',
      '[<span class="ok"> OK </span>] Firewall pfSense ativo',
      '[<span class="ok"> OK </span>] Zabbix e Nagios a monitorizar',
      '[<span class="ok"> OK </span>] Django + PostgreSQL ligados',
      '[<span class="ok"> OK </span>] Interface pronta — bem-vindo.'
    ];
    if (hasGsap) gsap.to(bar, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' });
    for (const l of lines) { if (skip) return; pre.innerHTML += l + '\n'; await wait(reduce ? 0 : 170); }
    await wait(250); end();
  });

  /* ---------- revelações ---------- */
  function initReveals() {
    if (!hasGsap || reduce || !window.ScrollTrigger) return;
    $$('[data-reveal]').forEach(el => {
      const kind = el.dataset.reveal;
      if (kind === 'stagger') {
        gsap.fromTo(el.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .08, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 88%' } });
      } else if (kind === 'fade') {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1.1, clearProps: 'opacity', scrollTrigger: { trigger: el, start: 'top 90%' } });
      } else if (kind === 'scale') {
        gsap.fromTo(el, { scale: .94, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 88%' } });
      } else {
        gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 88%' } });
      }
    });
    if (window.SplitText) {
      $$('[data-split]').forEach(el => {
        const st = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
        gsap.from(st.lines, { yPercent: 105, duration: 1.1, stagger: .08, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      });
    }
    $$('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count), o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) }) });
    });
  }
  // título da página: entrada por linhas
  function introHero() {
    if (!hasGsap || reduce) return;
    const t = $('.page-hero .display');
    if (t && window.SplitText) {
      const st = SplitText.create(t, { type: 'lines,words', mask: 'lines' });
      gsap.from(st.words, { yPercent: 110, duration: 1.1, stagger: .04, ease: 'power4.out' });
    }
    const rest = $$('.page-hero [data-intro]');
    if (rest.length) gsap.from(rest, { y: 24, opacity: 0, duration: .9, stagger: .08, delay: .25 });
    const idx = $('.page-index');
    if (idx) gsap.from(idx, { opacity: 0, x: 40, duration: 1.4, delay: .2 });
  }

  /* ---------- paleta de comandos ---------- */
  const cmdk = $('.cmdk');
  if (cmdk) {
    const input = $('input', cmdk), list = $('.cmdk-list', cmdk);
    const items = [
      ...PAGES.map((p, i) => ({ group: 'Páginas', icon: String(i + 1), label: p.name, hint: p.hint, run: () => navigate(p.href) })),
      { group: 'Ações', icon: '@', label: 'Copiar email', hint: CONTACT.email, run: () => copy(CONTACT.email) },
      { group: 'Ações', icon: '☏', label: 'Copiar telefone', hint: CONTACT.phoneLabel, run: () => copy(CONTACT.phone, CONTACT.phoneLabel) },
      { group: 'Ações', icon: 'W', label: 'Abrir WhatsApp', hint: 'nova janela', run: () => window.open(CONTACT.wa, '_blank', 'noopener') },
      { group: 'Ações', icon: 'CV', label: 'Descarregar CV (PDF)', hint: 'PDF', run: () => { const a = d.createElement('a'); a.href = CONTACT.cv; a.download = 'CV-Delcio-Cunha.pdf'; d.body.appendChild(a); a.click(); a.remove(); } },
      { group: 'Ações', icon: '↑', label: 'Voltar ao topo', hint: '', run: () => scrollTo(0) }
    ];
    let filtered = items, sel = 0, lastFocus = null;
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const render = () => {
      const q = norm(input.value.trim());
      filtered = q ? items.filter(i => norm(i.label + ' ' + i.hint + ' ' + i.group).includes(q)) : items;
      sel = Math.min(sel, Math.max(0, filtered.length - 1));
      if (!filtered.length) { list.innerHTML = `<li class="cmdk-empty">Nada encontrado para “${input.value.replace(/</g, '&lt;')}”.</li>`; return; }
      let g = '', out = '';
      filtered.forEach((it, i) => {
        if (it.group !== g) { g = it.group; out += `<li class="cmdk-group" role="presentation">${g}</li>`; }
        out += `<li class="cmdk-item" role="option" id="ck${i}" data-i="${i}" aria-selected="${i === sel}"><span class="ic">${it.icon}</span>${it.label}<small>${it.hint}</small></li>`;
      });
      list.innerHTML = out;
      input.setAttribute('aria-activedescendant', 'ck' + sel);
      const s = $('[aria-selected="true"]', list); s && s.scrollIntoView({ block: 'nearest' });
    };
    const open = () => { lastFocus = d.activeElement; cmdk.classList.add('open'); input.value = ''; sel = 0; render(); input.focus(); DC.lenis && DC.lenis.stop(); };
    const close = () => { cmdk.classList.remove('open'); DC.lenis && DC.lenis.start(); lastFocus && lastFocus.focus && lastFocus.focus(); };
    DC.openPalette = open;
    input.addEventListener('input', () => { sel = 0; render(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { sel = (sel + 1) % Math.max(1, filtered.length); render(); e.preventDefault(); }
      if (e.key === 'ArrowUp') { sel = (sel - 1 + filtered.length) % Math.max(1, filtered.length); render(); e.preventDefault(); }
      if (e.key === 'Enter' && filtered[sel]) { const it = filtered[sel]; close(); it.run(); }
    });
    list.addEventListener('click', e => { const li = e.target.closest('.cmdk-item'); if (!li) return; const it = filtered[+li.dataset.i]; close(); it.run(); });
    list.addEventListener('pointermove', e => { const li = e.target.closest('.cmdk-item'); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; render(); } });
    cmdk.addEventListener('click', e => { if (e.target === cmdk) close(); });
    $$('[data-cmdk]').forEach(b => b.addEventListener('click', open));
    addEventListener('keydown', e => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(d.activeElement && d.activeElement.tagName);
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); cmdk.classList.contains('open') ? close() : open(); }
      else if (e.key === '/' && !typing && !cmdk.classList.contains('open')) { e.preventDefault(); open(); }
      else if (e.key === 'Escape') { if (cmdk.classList.contains('open')) close(); else if (mm && mm.classList.contains('open')) setMenu(false); }
    });
  }

  /* ---------- PWA ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname) || ('serviceWorker' in navigator && location.hostname === 'localhost' && location.search.includes('sw'))) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  /* ---------- olá, programador ---------- */
  try {
    console.log('%c DC %c Olá! Está a ver o código-fonte? Fale comigo: ' + CONTACT.email,
      'background:#45A8F7;color:#0A0F16;font-weight:800;padding:4px 6px;border-radius:4px', 'color:#8B9BB0');
  } catch (e) {}

  /* ---------- arranque ---------- */
  (async () => {
    if (d.fonts && d.fonts.ready) { try { await Promise.race([d.fonts.ready, wait(800)]); } catch (e) {} }
    await boot();
    await enterCurtain();
    fireReady();
    introHero();
    initReveals();
    if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 300);
  })();
})();
