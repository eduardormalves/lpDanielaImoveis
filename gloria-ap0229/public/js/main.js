/* =========================================================
   LANDING AP0229 · GLORIA RESIDENCE · interações (GSAP + ScrollTrigger)
   Versão enxuta: sem preloader, sem menu e sem vídeo. A página abre
   direto no hero, que já traz o botão de WhatsApp.
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Quebra títulos em linhas (para o efeito de máscara) ---------- */
  $$('.lines-reveal').forEach((el) => {
    const parts = el.innerHTML.trim().split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p) => `<span class="lr-line"><span>${p.trim()}</span></span>`).join('');
  });

  /* ---------- Entrada do hero ---------- */
  // Sem preloader: o texto entra na hora e a foto aparece assim que carrega
  // (quem chega pelo WhatsApp costuma estar no 4G, então nada segura a página).
  const heroImg = $('#heroImg');
  document.body.classList.add('is-ready');
  if (reduced) {
    gsap.set(heroImg, { opacity: 1, scale: 1 });
    gsap.set('.hero__title .line > span', { y: 0 });
    gsap.set('.hero__eyebrow, .hero__lead, .hero__meta, .hero__actions', { opacity: 1 });
  } else {
    const showImg = () => gsap.to(heroImg, { opacity: 1, scale: 1, duration: 2.2, ease: 'power2.out' });
    if (heroImg.complete && heroImg.naturalWidth) showImg();
    else {
      heroImg.addEventListener('load', showImg, { once: true });
      heroImg.addEventListener('error', showImg, { once: true });
    }
    gsap.timeline({ delay: 0.1, defaults: { ease: 'expo.out' } })
      .to('.hero__eyebrow', { opacity: 1, duration: 1 }, 0)
      .to('.hero__title .line > span', { y: 0, duration: 1.3, stagger: 0.12 }, 0.1)
      .to('.hero__lead', { opacity: 1, duration: 1 }, 0.5)
      .to('.hero__meta', { opacity: 1, duration: 1 }, 0.65)
      .to('.hero__actions', { opacity: 1, duration: 1 }, 0.8);
  }

  /* ---------- Cursor ---------- */
  const cursor = $('#cursor');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    window.addEventListener('mousemove', (e) => { pos.x = e.clientX; pos.y = e.clientY; });
    gsap.ticker.add(() => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%,-50%)`;
    });
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-hover]');
      cursor.classList.toggle('is-hover', !!t && t.dataset.hover !== 'view');
      cursor.classList.toggle('is-view', !!t && t.dataset.hover === 'view');
    });
  }

  /* ---------- Nav: fundo ao rolar ---------- */
  const nav = $('#nav');

  /* ---------- Parallax do hero ao rolar ---------- */
  if (!reduced) {
    gsap.to('.hero__content', {
      y: 120, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to(heroImg, {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ---------- Reveal genérico ---------- */
  $$('[data-reveal]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => el.classList.add('is-in') });
  });
  $$('.lines-reveal').forEach((el) => {
    gsap.to($$('.lr-line > span', el), {
      y: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  /* ---------- Galeria: loop infinito arrastável ---------- */
  // O trilho tem as fotos duplicadas; `x` é o deslocamento e volta a zero ao passar
  // da metade, o que torna o loop invisível. Anda sozinho a BASE px/s; arrastar
  // soma uma velocidade extra (com inércia) que decai de volta ao ritmo base.
  const viewport = $('.hgal__viewport');
  const track = $('#hgalTrack');
  const BASE = reduced ? 0 : 70;
  let half = 0, x = 0, vel = 0, dragging = false, moved = false;
  let lastX = 0, lastT = 0, startX = 0, downFig = null;

  const measure = () => { half = track.scrollWidth / 2; };
  measure();
  window.addEventListener('load', measure);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); ScrollTrigger.refresh(); }, 200); });

  gsap.ticker.add((t, dtMs) => {
    const dt = Math.min(dtMs, 50) / 1000;
    if (!dragging) {
      x += (BASE + vel) * dt;
      vel *= Math.exp(-2.2 * dt); // inércia: some em ~1,5 s
      if (Math.abs(vel) < 1) vel = 0;
    }
    if (half) x = ((x % half) + half) % half;
    track.style.transform = `translate3d(${-x}px,0,0)`;
  });

  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true; moved = false; vel = 0;
    startX = lastX = e.clientX; lastT = e.timeStamp;
    downFig = e.target.closest('.hgal__item');
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dt = Math.max(e.timeStamp - lastT, 1) / 1000;
    if (Math.abs(e.clientX - startX) > 6) moved = true;
    x -= dx;
    vel = gsap.utils.clamp(-3500, 3500, (-dx / dt) * 0.6 + vel * 0.4); // suaviza a velocidade do ponteiro
    lastX = e.clientX; lastT = e.timeStamp;
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    // soltou sem arrastar = clique na foto
    if (!moved && downFig && e.type === 'pointerup') openLb(Number(downFig.dataset.index));
    downFig = null;
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  /* ---------- Lightbox da galeria ---------- */
  const photos = $$('.hgal__item:not([aria-hidden])').map((f) => ({
    src: $('img', f).src, alt: $('img', f).alt, titulo: $('figcaption', f).lastChild.textContent.trim(),
  }));
  const lb = $('#lb');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  const lbIdx = $('#lbIdx');
  let lbCur = 0;

  const showLb = (i) => {
    lbCur = (i + photos.length) % photos.length;
    const p = photos[lbCur];
    lbImg.src = p.src; lbImg.alt = p.alt;
    lbCap.textContent = p.titulo;
    lbIdx.textContent = `${String(lbCur + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  };
  const openLb = (i) => {
    showLb(i);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  };
  const closeLb = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => showLb(lbCur - 1));
  $('#lbNext').addEventListener('click', () => showLb(lbCur + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); }); // clique no fundo fecha
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showLb(lbCur - 1);
    if (e.key === 'ArrowRight') showLb(lbCur + 1);
  });
  // swipe horizontal na foto ampliada
  let swX = null;
  const lbFig = $('#lbFig');
  lbFig.addEventListener('pointerdown', (e) => { swX = e.clientX; });
  lbFig.addEventListener('pointerup', (e) => {
    if (swX === null) return;
    const dx = e.clientX - swX; swX = null;
    if (dx > 50) showLb(lbCur - 1);
    else if (dx < -50) showLb(lbCur + 1);
  });

  /* ---------- Nav + barra fixa ---------- */
  // A barra só entra quando o hero (com o próprio botão) sai da tela, e recolhe na seção
  // da consultora, que tem o próprio botão. Tudo pela geometria a cada rolagem,
  // o que também cobre quem abre a página já rolada (âncora, refresh no meio).
  const sticky = $('#stickybar');
  const hero = $('.hero');
  const final = $('.final');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    // pelo hero inteiro, não pelo botão: o parallax desloca o conteúdo para baixo
    const pastHero = hero.getBoundingClientRect().bottom < 80;
    const atFinal = final.getBoundingClientRect().top < innerHeight * 0.7;
    sticky.classList.toggle('is-shown', pastHero && !atFinal);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- Contador animado nas specs ---------- */
  $$('.spec b').forEach((el) => {
    const n = Number(el.textContent);
    if (Number.isNaN(n)) return;
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) }),
    });
  });

  window.addEventListener('load', () => { ScrollTrigger.refresh(); onScroll(); });
})();
