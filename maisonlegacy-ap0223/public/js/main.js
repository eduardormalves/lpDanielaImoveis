/* =========================================================
   LANDING 02 · NOIR · interações (GSAP + ScrollTrigger)
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => window.innerWidth > 860;

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('is-loading');

  /* ---------- Quebra títulos em linhas (para o efeito de máscara) ---------- */
  const splitLines = (el) => {
    const html = el.innerHTML.trim();
    const parts = html.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p) => `<span class="lr-line"><span>${p.trim()}</span></span>`).join('');
    return $$('.lr-line > span', el);
  };
  $$('.lines-reveal').forEach(splitLines);

  /* ---------- Preloader ---------- */
  const loader = $('#loader');
  const count = $('#loaderCount');
  const bar = $('#loaderBar');
  const heroImg = $('#heroImg');

  const introHero = () => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    loader.classList.add('is-done');

    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } });
    tl.to(heroImg, { opacity: 1, scale: 1, duration: 2.4, ease: 'power2.out' }, 0)
      .to('.hero__eyebrow', { opacity: 1, duration: 1 }, 0.4)
      .to('.hero__title .line > span', { y: 0, duration: 1.4, stagger: 0.12 }, 0.5)
      .to('.hero__meta', { opacity: 1, duration: 1 }, 1.1);
  };

  if (reduced) {
    count.textContent = '100';
    bar.style.width = '100%';
    introHero();
  } else {
    // O preloader só cobre o carregamento real da foto do hero (teto de 1,2 s
    // para não segurar a página em conexão lenta); o contador é rápido.
    const heroReady = new Promise((resolve) => {
      if (heroImg.complete) return resolve();
      heroImg.addEventListener('load', resolve, { once: true });
      heroImg.addEventListener('error', resolve, { once: true });
      setTimeout(resolve, 1200);
    });
    const obj = { v: 0 };
    gsap.to(obj, {
      v: 100, duration: 0.6, ease: 'power2.out',
      onUpdate: () => { count.textContent = Math.round(obj.v); bar.style.width = `${obj.v}%`; },
      onComplete: () => heroReady.then(introHero),
    });
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

  /* ---------- Nav mobile: burger + fundo ao rolar ---------- */
  const nav = $('#nav');
  const menu = $('#menu');
  const burger = $('#burger');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('.menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (isDesktop()) setMenu(false); });
  const navScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
  navScroll();
  window.addEventListener('scroll', navScroll, { passive: true });

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

  /* ---------- Tour por ambientes ---------- */
  const tourItems = $$('.tour__item');
  const tourImgs = $$('.tour__stage img');
  const tourLabel = $('#tourLabel');
  let tourIdx = 0;
  let tourTimer;

  const setTour = (i) => {
    tourIdx = i;
    tourItems.forEach((it, k) => it.classList.toggle('is-active', k === i));
    tourImgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    tourLabel.textContent = $('h3', tourItems[i]).textContent;
    // reinicia a barra de progresso
    const barEl = $('.tour__bar i', tourItems[i]);
    barEl.style.animation = 'none';
    void barEl.offsetWidth;
    barEl.style.animation = '';
  };
  const startTour = () => {
    clearInterval(tourTimer);
    tourTimer = setInterval(() => setTour((tourIdx + 1) % tourItems.length), 5000);
  };
  tourItems.forEach((it) => {
    const go = () => { setTour(Number(it.dataset.index)); startTour(); };
    it.addEventListener('click', go);
    it.addEventListener('mouseenter', () => { if (isDesktop()) go(); });
  });
  ScrollTrigger.create({
    trigger: '.tour', start: 'top 60%', end: 'bottom 40%',
    onEnter: startTour, onEnterBack: startTour,
    onLeave: () => clearInterval(tourTimer), onLeaveBack: () => clearInterval(tourTimer),
  });

  /* ---------- Accordion ---------- */
  $$('.acc__item').forEach((item) => {
    $('.acc__head', item).addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      $$('.acc__item').forEach((i) => i.classList.remove('is-open'));
      if (!open) item.classList.add('is-open');
    });
  });

  /* ---------- Sticky bar ---------- */
  // Fica à mostra desde o começo (o CSS a solta junto com body.is-ready) e só
  // recolhe na seção da consultora, que já tem o próprio botão de WhatsApp.
  // end: 'max' mantém o estado até o fim da página, para ela não reaparecer
  // por cima do rodapé.
  const sticky = $('#stickybar');
  // end inalcançável de propósito: com 'max' o trigger desativa no último pixel
  // da página e a barra reaparecia por cima do rodapé
  const finalST = ScrollTrigger.create({
    trigger: '.final', start: 'top 70%', end: '+=99999',
    onToggle: (self) => sticky.classList.toggle('is-hidden', self.isActive === true),
  });
  // estado inicial pela geometria: na criação do trigger isActive ainda é
  // undefined, e toggle(classe, undefined) inverteria em vez de definir.
  // Também cobre quem abre a página já rolada (âncora, refresh no meio).
  const syncSticky = () => sticky.classList.toggle('is-hidden', window.scrollY >= finalST.start);
  syncSticky();

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

  window.addEventListener('load', () => { ScrollTrigger.refresh(); syncSticky(); });
})();
