/* Contacto — favo interativo, relógio de Luanda, compositor de mensagens, QR e vCard */
(() => {
  const { $, $$, reduce, fine, CONTACT, toast, copy } = window.DC;

  /* ---------- favo de hexágonos que reage ao rato ---------- */
  const cv = $('#hexbg');
  if (cv) {
    const ctx = cv.getContext('2d'), hero = cv.parentElement;
    let W = 0, H = 0, m = { x: -999, y: -999 }, cells = [], t0 = performance.now();
    const S = 28, HH = S * Math.sqrt(3);
    function resize() {
      const r = hero.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      cells = [];
      for (let y = 0, row = 0; y < H + HH; y += HH / 2, row++) for (let x = (row % 2 ? S * 1.5 : 0); x < W + S * 3; x += S * 3) cells.push({ x, y, e: 0, seed: Math.random() });
    }
    new ResizeObserver(resize).observe(hero); resize();
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); m = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    hero.addEventListener('pointerleave', () => m = { x: -999, y: -999 });
    let vis = true; new IntersectionObserver(([en]) => vis = en.isIntersecting).observe(hero);
    function draw(now) {
      requestAnimationFrame(draw);
      if (!vis || document.hidden) return;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      for (const c of cells) {
        const d = Math.hypot(c.x - m.x, c.y - m.y);
        const target = d < 190 ? 1 - d / 190 : 0;
        c.e += (target - c.e) * .12;
        const amb = reduce ? 0 : (Math.sin(t * .8 + c.seed * 12 + c.x * .01) + 1) * .5 * .05;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k; const px = c.x + S * .9 * Math.cos(a), py = c.y + S * .9 * Math.sin(a); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.closePath();
        ctx.strokeStyle = `rgba(124,196,255,${.07 + amb + c.e * .5})`; ctx.lineWidth = 1; ctx.stroke();
        if (c.e > .45) { ctx.fillStyle = c.e > .85 ? `rgba(244,182,74,${(c.e - .85) * 1.4})` : `rgba(69,168,247,${(c.e - .45) * .3})`; ctx.fill(); }
      }
    }
    requestAnimationFrame(draw);
  }

  /* ---------- hora e fuso ---------- */
  function tz() {
    const now = new Date();
    const wd = new Intl.DateTimeFormat('pt-PT', { timeZone: 'Africa/Luanda', weekday: 'long' }).format(now);
    const h = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Luanda', hour: '2-digit', hour12: false }).format(now);
    const weekend = /sábado|domingo/.test(wd);
    $('#dayKind').textContent = wd.charAt(0).toUpperCase() + wd.slice(1) + (weekend ? ' · fim de semana' : (h >= 8 && h < 18 ? ' · horário laboral' : ' · fora de horas'));
    // diferença horária (Luanda é UTC+1 todo o ano)
    const mine = -now.getTimezoneOffset() / 60, diff = 1 - mine;
    $('#tzDiff').textContent = diff === 0 ? 'mesma hora' : (diff > 0 ? `Luanda +${diff} h` : `Luanda −${Math.abs(diff)} h`);
  }
  tz(); setInterval(tz, 60000);

  /* ---------- compositor ---------- */
  const f = $('#cform'), nm = $('#fName'), org = $('#fOrg'), msg = $('#fMsg'), cnt = $('#count');
  const pvText = $('#pvText'), pvTime = $('#pvTime'), pvBody = $('#pvBody'), pvSubj = $('#pvSubj'), bubble = $('#bubble');
  const types = () => $$('#types input:checked').map(i => i.value);
  function compose() {
    const n = nm.value.trim(), o = org.value.trim(), m = msg.value.trim(), ty = types();
    let s = `Olá Délcio, ${n ? 'sou ' + n : 'tudo bem'}${o ? ' (' + o + ')' : ''}.`;
    if (ty.length) s += `\n\nTenho interesse em: ${ty.join(', ')}.`;
    s += `\n\n${m || '…'}`;
    s += `\n\n(Mensagem enviada a partir do seu portfólio)`;
    return s;
  }
  const subject = () => { const ty = types(); return (ty.length ? ty[0] : 'Contacto pelo portfólio') + (nm.value.trim() ? ' · ' + nm.value.trim() : ''); };
  let bumpT;
  function update() {
    const txt = compose();
    pvText.textContent = txt;
    pvTime.textContent = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    pvBody.textContent = txt; pvSubj.textContent = subject();
    cnt.textContent = `${msg.value.length} / 1200`;
    clearTimeout(bumpT); bumpT = setTimeout(() => { bubble.classList.remove('pulse'); void bubble.offsetWidth; bubble.classList.add('pulse'); }, 220);
  }
  [nm, org, msg].forEach(el => el.addEventListener('input', () => { el.removeAttribute('aria-invalid'); update(); }));
  nm.addEventListener('input', () => $('#eName').hidden = true);
  msg.addEventListener('input', () => $('#eMsg').hidden = true);
  $$('#types input').forEach(i => i.addEventListener('change', update));
  update();

  function valid() {
    let ok = true;
    if (!nm.value.trim()) { nm.setAttribute('aria-invalid', 'true'); $('#eName').hidden = false; ok = false; }
    if (msg.value.trim().length < 10) { msg.setAttribute('aria-invalid', 'true'); $('#eMsg').hidden = false; ok = false; }
    if (!ok) { (nm.value.trim() ? msg : nm).focus(); toast('Falta preencher um campo.'); }
    return ok;
  }
  let via = 'wa';
  $$('.send [data-via]').forEach(b => b.addEventListener('click', () => via = b.dataset.via));
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!valid()) return;
    const txt = compose();
    if (via === 'wa') {
      window.open(`${CONTACT.wa}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
      toast('A abrir o WhatsApp com a mensagem pronta.');
    } else {
      location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(txt)}`;
      toast('A abrir a sua aplicação de email.');
    }
  });
  $('#copyMsg').addEventListener('click', () => copy(compose(), 'mensagem'));

  // separadores da pré-visualização
  $$('.pv-tabs [data-pv]').forEach(b => b.addEventListener('click', () => {
    $$('.pv-tabs [data-pv]').forEach(x => x.setAttribute('aria-selected', x === b));
    $('#pvWa').hidden = b.dataset.pv !== 'wa'; $('#pvMail').hidden = b.dataset.pv !== 'mail';
  }));

  /* ---------- QR para o WhatsApp ---------- */
  const qrEl = $('#qr');
  if (qrEl && typeof window.qrcode === 'function') {
    const q = qrcode(0, 'M'); q.addData(CONTACT.wa); q.make();
    qrEl.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    const svg = $('svg', qrEl); if (svg) { svg.querySelectorAll('path,rect').forEach(p => { if (p.getAttribute('fill') === '#000000' || p.getAttribute('fill') === 'black') p.setAttribute('fill', '#0A0F16'); }); }
  }

  /* ---------- vCard ---------- */
  $('#vcard').addEventListener('click', () => {
    const v = ['BEGIN:VCARD', 'VERSION:3.0', 'N:Cunha;Délcio;;;', 'FN:Délcio Cunha', 'TITLE:Técnico de Infraestrutura de TI & Desenvolvedor Web',
      `TEL;TYPE=CELL:${CONTACT.phone}`, `EMAIL;TYPE=INTERNET:${CONTACT.email}`, 'ADR;TYPE=WORK:;;Av. Marien Ngouabi, Maianga;Luanda;;;Angola', 'END:VCARD'].join('\r\n');
    const url = URL.createObjectURL(new Blob([v], { type: 'text/vcard;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'Delcio-Cunha.vcf'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('Contacto guardado (Delcio-Cunha.vcf).');
  });
})();
