/* Início — entrada do hero, nome letra a letra e frase rotativa */
(() => {
  const { $, $$, reduce, wait } = window.DC;

  // nome em letras individuais (para hover e entrada)
  $$('.hero-name .hn').forEach(el => {
    const t = el.textContent; el.textContent = '';
    [...t].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true'); el.appendChild(s); });
  });

  const phrases = [
    'Configuro <b>ambientes virtualizados</b> com VMware ESXi.',
    'Protejo redes com <b>firewall pfSense</b> e DNS.',
    'Monitorizo servidores com <b>Zabbix e Nagios</b>.',
    'Construo back-ends em <b>Django e PostgreSQL</b>.',
    'Desenho <b>websites rápidos</b>, bilingues e otimizados para SEO.'
  ];
  const rot = $('#rot');
  async function rotate() {
    if (reduce || !rot) return;
    const strip = h => h.replace(/<[^>]+>/g, '');
    let i = 0;
    await wait(3200);
    for (;;) {
      if (document.hidden) { await wait(500); continue; }
      let s = strip(phrases[i]);
      for (let k = s.length; k >= 0; k--) { rot.textContent = s.slice(0, k); await wait(12); }
      i = (i + 1) % phrases.length; s = strip(phrases[i]);
      for (let k = 0; k <= s.length; k++) { rot.textContent = s.slice(0, k); await wait(28); }
      rot.innerHTML = phrases[i];
      await wait(2800);
    }
  }

  window.DC.ready(() => {
    if (window.gsap && !reduce) {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo('.hero-name .ch', { yPercent: 110, rotate: 8, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.1, stagger: .035, clearProps: 'transform,opacity' })
        .fromTo('[data-h]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .08, clearProps: 'transform,opacity' }, .2)
        .from('.scroll-cue', { opacity: 0, duration: .8 }, .8);
      // parallax suave do hero ao rolar
      if (window.ScrollTrigger) {
        gsap.to('.hero-copy', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.globe-wrap', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      }
    }
    rotate();
  });
})();
