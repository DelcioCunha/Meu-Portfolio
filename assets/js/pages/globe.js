/* =========================================================================
   globe.js — globo 3D em pontos (Three.js / WebGL)
   Continentes reais (Natural Earth 110m), Angola destacada, Luanda com pulso,
   arcos de "pacotes" a sair de Luanda. Arrastar para rodar, inércia, parallax.
   Script clássico (sem módulos) para funcionar também ao abrir o ficheiro diretamente.
   ========================================================================= */
(() => {
if (typeof window.THREE === 'undefined') { document.documentElement.classList.add('globe-fallback'); return; }
const THREE = window.THREE;

const DC = window.DC || { reduce: false, ready: f => f() };
const wrap = document.querySelector('.globe-wrap');
const canvas = document.getElementById('globe');
const pin = document.getElementById('globePin');

function fail() { document.documentElement.classList.add('globe-fallback'); if (canvas) canvas.remove(); }

(function init() {
  if (!canvas || !window.WORLD_DOTS) return fail();
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return fail(); }

  const DPR = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.6 : 2);
  renderer.setPixelRatio(DPR);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 4.6);

  const root = new THREE.Group();       // inclinação (parallax)
  const globe = new THREE.Group();      // rotação (arrastar)
  root.add(globe); scene.add(root);
  root.rotation.x = 0.28;

  const R = 1;
  const toVec = (lon, lat, r = R) => {
    const la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
    return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
  };

  /* --- esfera interior (oculta pontos de trás) --- */
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 64, 64), new THREE.MeshBasicMaterial({ color: 0x0b121b, transparent: true, opacity: 0.92 })));

  /* --- pontos dos continentes --- */
  const dots = window.WORLD_DOTS;
  const pos = new Float32Array(dots.length * 3), col = new Float32Array(dots.length * 3), size = new Float32Array(dots.length), seed = new Float32Array(dots.length);
  const cBlue = new THREE.Color(0x7cc4ff), cAmber = new THREE.Color(0xf4b64a);
  dots.forEach(([lon, lat, ao], i) => {
    const v = toVec(lon, lat, R * 1.001);
    pos.set([v.x, v.y, v.z], i * 3);
    const c = ao ? cAmber : cBlue;
    col.set([c.r, c.g, c.b], i * 3);
    size[i] = ao ? 1.6 : 1;
    seed[i] = Math.random();
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const dotMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uSize: { value: 2.6 * DPR }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector3(9, 9, 9) } },
    vertexShader: `
      attribute vec3 color; attribute float aSize; attribute float aSeed;
      uniform float uSize; uniform float uTime; uniform vec3 uMouse;
      varying vec3 vColor; varying float vFace; varying float vTw; varying float vHot;
      void main(){
        vec4 wp = modelMatrix * vec4(position,1.0);
        vec3 n = normalize(wp.xyz);
        vFace = dot(n, normalize(cameraPosition - wp.xyz));
        vColor = color;
        vTw = 0.75 + 0.25 * sin(uTime * 1.6 + aSeed * 40.0);
        float dm = distance(wp.xyz, uMouse);
        vHot = smoothstep(0.35, 0.0, dm);
        vec4 mv = viewMatrix * wp;
        gl_PointSize = uSize * aSize * (1.0 + vHot * 1.4) * (4.6 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vFace; varying float vTw; varying float vHot;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        if (dot(c,c) > 0.25) discard;
        float a = smoothstep(-0.15, 0.55, vFace) * vTw;
        vec3 col = mix(vColor, vec3(1.0,0.78,0.38), vHot);
        gl_FragColor = vec4(col, a * 0.95);
      }`
  });
  globe.add(new THREE.Points(g, dotMat));

  /* --- atmosfera (fresnel) --- */
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 64, 64), new THREE.ShaderMaterial({
    transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition-wp.xyz); gl_Position = projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 3.4); gl_FragColor = vec4(0.27,0.66,0.97, f*0.32); }`
  }));
  root.add(atm);

  /* --- anéis orbitais --- */
  const ringMat = new THREE.LineBasicMaterial({ color: 0x2a3a4f, transparent: true, opacity: .7 });
  [1.32, 1.5].forEach((r, i) => {
    const pts = []; for (let k = 0; k <= 128; k++) { const a = k / 128 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
    const l = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), ringMat);
    l.rotation.x = i ? 1.2 : 1.45; l.rotation.z = i ? -.4 : .3;
    root.add(l);
    const sat = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 8), new THREE.MeshBasicMaterial({ color: i ? 0x45a8f7 : 0xf4b64a }));
    sat.userData = { r, speed: i ? .25 : -.18, ring: l };
    l.add(sat); l.userData.sat = sat;
  });

  /* --- Luanda --- */
  const LUANDA = toVec(13.23, -8.84, R * 1.004);
  const marker = new THREE.Group();
  marker.position.copy(LUANDA); marker.lookAt(LUANDA.clone().multiplyScalar(2));
  const core = new THREE.Mesh(new THREE.CircleGeometry(.018, 24), new THREE.MeshBasicMaterial({ color: 0xf4b64a }));
  marker.add(core);
  const pulses = [0, 1, 2].map(i => {
    const m = new THREE.Mesh(new THREE.RingGeometry(.02, .026, 40), new THREE.MeshBasicMaterial({ color: 0xf4b64a, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    m.userData.off = i / 3; marker.add(m); return m;
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.002, .002, .22, 6), new THREE.MeshBasicMaterial({ color: 0xf4b64a, transparent: true, opacity: .8 }));
  beam.rotation.x = Math.PI / 2; beam.position.z = .11; marker.add(beam);
  globe.add(marker);

  /* --- arcos de pacotes a partir de Luanda --- */
  const land = dots.filter(d => !d[2]);
  const arcs = [];
  const arcMat = () => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uHead: { value: 0 }, uColor: { value: new THREE.Color(Math.random() < .3 ? 0xf4b64a : 0x45a8f7) } },
    vertexShader: `attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform float uHead; uniform vec3 uColor; varying float vT; void main(){ float tail = 0.35; float d = uHead - vT; if (d < 0.0 || d > tail) discard; float a = 1.0 - d / tail; gl_FragColor = vec4(uColor, a*a); }`
  });
  function spawnArc() {
    const t = land[Math.floor(Math.random() * land.length)];
    const end = toVec(t[0], t[1], R * 1.003);
    const dist = LUANDA.distanceTo(end);
    if (dist < .35) return;
    const mid = LUANDA.clone().add(end).multiplyScalar(.5).normalize().multiplyScalar(R + dist * .38);
    const curve = new THREE.QuadraticBezierCurve3(LUANDA.clone(), mid, end);
    const N = 80, p = curve.getPoints(N);
    const geo = new THREE.BufferGeometry().setFromPoints(p);
    geo.setAttribute('aT', new THREE.BufferAttribute(new Float32Array(p.map((_, i) => i / N)), 1));
    const line = new THREE.Line(geo, arcMat());
    line.userData = { head: 0, speed: .45 + Math.random() * .35, end };
    globe.add(line); arcs.push(line);
  }

  /* --- interação --- */
  let rotY = -13.23 * Math.PI / 180 - 0.35, velY = 0, dragging = false, lastX = 0;
  let tiltX = 0, tiltY = 0, targetTX = 0, targetTY = 0;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(9, 9), hitSphere = new THREE.Sphere(new THREE.Vector3(), R);
  const mouseWorld = new THREE.Vector3(9, 9, 9);
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; velY = 0; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointerup', e => { dragging = false; try { canvas.releasePointerCapture(e.pointerId); } catch (_) {} });
  canvas.addEventListener('pointercancel', () => dragging = false);
  window.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    targetTY = (e.clientX / innerWidth - .5) * .25;
    targetTX = (e.clientY / innerHeight - .5) * .18;
    if (dragging) { const dx = e.clientX - lastX; lastX = e.clientX; velY = dx * .005; rotY += velY; }
  }, { passive: true });
  canvas.addEventListener('pointerleave', () => { ndc.set(9, 9); });

  /* --- tamanho e visibilidade --- */
  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(wrap); resize();
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 }).observe(wrap);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) clock.getDelta(); });

  /* --- etiqueta HTML de Luanda --- */
  const tmp = new THREE.Vector3();
  function placePin() {
    if (!pin) return;
    marker.getWorldPosition(tmp);
    const facing = tmp.clone().normalize().dot(camera.position.clone().sub(tmp).normalize());
    tmp.project(camera);
    const x = (tmp.x * .5 + .5) * wrap.clientWidth, y = (-tmp.y * .5 + .5) * wrap.clientHeight;
    pin.style.transform = `translate(${x + 14}px, ${y - 46}px)`;
    pin.style.opacity = facing > .25 && intro >= 1 ? 1 : 0;
  }

  /* --- ciclo --- */
  const clock = new THREE.Clock();
  let t = 0, nextArc = 0, intro = DC.reduce ? 1 : 0;
  root.scale.setScalar(DC.reduce ? 1 : .6);
  function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const dt = Math.min(clock.getDelta(), .05);
    t += dt;
    if (intro < 1) { intro = Math.min(1, intro + dt / 1.6); const e = 1 - Math.pow(1 - intro, 4); root.scale.setScalar(.6 + .4 * e); canvas.style.opacity = e; }

    if (!dragging) { velY *= .95; rotY += velY + (DC.reduce ? 0 : dt * .035); }
    globe.rotation.y = rotY;
    tiltX += (targetTX - tiltX) * .05; tiltY += (targetTY - tiltY) * .05;
    root.rotation.x = .28 + tiltX; root.rotation.z = tiltY * .3;

    // ponto quente sob o rato
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectSphere(hitSphere, mouseWorld)) dotMat.uniforms.uMouse.value.copy(mouseWorld);
    else dotMat.uniforms.uMouse.value.set(9, 9, 9);
    dotMat.uniforms.uTime.value = t;

    pulses.forEach(p => { const k = ((t * .6 + p.userData.off) % 1); p.scale.setScalar(1 + k * 4); p.material.opacity = (1 - k) * .9; });
    root.children.forEach(c => { if (c.userData.sat) { const s = c.userData.sat; const a = t * s.userData.speed; s.position.set(Math.cos(a) * s.userData.r, 0, Math.sin(a) * s.userData.r); } });

    if (!DC.reduce && t > nextArc && arcs.length < 9) { spawnArc(); nextArc = t + .35 + Math.random() * .6; }
    for (let i = arcs.length - 1; i >= 0; i--) {
      const a = arcs[i]; a.userData.head += dt * a.userData.speed; a.material.uniforms.uHead.value = a.userData.head;
      if (a.userData.head > 1.4) { globe.remove(a); a.geometry.dispose(); a.material.dispose(); arcs.splice(i, 1); }
    }
    renderer.render(scene, camera);
    placePin();
  }
  canvas.style.opacity = DC.reduce ? 1 : 0;
  DC.ready(() => frame());
})();
})();
