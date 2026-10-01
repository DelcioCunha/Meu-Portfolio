/* 404 — traceroute que não chega ao destino */
(() => {
  const { $, wait, reduce } = window.DC;
  const pre = $('#trace'); if (!pre) return;
  const path = location.pathname.split('/').pop() || '/';
  const hops = [
    ['gateway.local', '1.2'], ['pfsense.itel-lab', '3.4'], ['switch-core', '4.1'], ['web-01', '6.8']
  ];
  window.DC.ready(async () => {
    const add = h => { pre.innerHTML += h + '\n'; };
    add(`<span class="m">$</span> traceroute ${path.replace(/</g, '&lt;')}`);
    for (let i = 0; i < hops.length; i++) { await wait(reduce ? 0 : 380); add(` ${i + 1}  ${hops[i][0].padEnd(20)} ${hops[i][1]} ms`); }
    for (let i = hops.length; i < hops.length + 3; i++) { await wait(reduce ? 0 : 520); add(` ${i + 1}  * * *`); }
    await wait(reduce ? 0 : 300);
    add(`<span class="r">destino inalcançável: ${path.replace(/</g, '&lt;')} não existe</span>`);
    add(`<span class="g">sugestão:</span> abrir index.html`);
  });
})();
